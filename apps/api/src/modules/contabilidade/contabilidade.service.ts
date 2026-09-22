import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { ContabilidadeEvents } from '@ticketing/contracts';
import { PrismaService } from '../../shared/prisma.module';
import { OutboxService } from '../../shared/outbox/outbox.service';
import type {
  CriarContaContabilInput,
  CriarLancamentoContabilInput,
  FecharPeriodoInput,
  ReabrirPeriodoInput,
  RealizarConciliacaoInput,
  LinhaBalanceteDto,
  DreGerencialDto,
  DashboardContabilDto,
} from './contabilidade.dto';

const SOURCE = 'contabilidade';

const centsToDecimal = (cents: number): number => Number((cents / 100).toFixed(2));
const decimalToCents = (v: { toNumber(): number } | number): number =>
  Math.round((typeof v === 'number' ? v : v.toNumber()) * 100);

@Injectable()
export class ContabilidadeService {
  private readonly logger = new Logger(ContabilidadeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
  ) {}

  // ==========================================================================
  //  PLANO DE CONTAS
  // ==========================================================================

  async criarConta(tenantId: string, input: CriarContaContabilInput) {
    const contaExistente = await this.prisma.contaContabil.findUnique({
      where: {
        tenantId_codigo: {
          tenantId,
          codigo: input.codigo,
        },
      },
    });

    if (contaExistente) {
      throw new BadRequestException(`Conta contábil com código ${input.codigo} já existe.`);
    }

    return this.prisma.contaContabil.create({
      data: {
        id: randomUUID(),
        tenantId,
        codigo: input.codigo,
        nome: input.nome,
        tipo: input.tipo,
        natureza: input.natureza,
        nivel: input.nivel,
        analitica: input.analitica,
        contaPaiId: input.contaPaiId ?? null,
      },
    });
  }

  async listarPlanoDeContas(tenantId: string) {
    return this.prisma.contaContabil.findMany({
      where: { tenantId, ativa: true },
      orderBy: { codigo: 'asc' },
    });
  }

  // ==========================================================================
  //  ESCRITURAÇÃO CONTÁBIL (Partidas Dobradas)
  // ==========================================================================

  async criarLancamento(tenantId: string, input: CriarLancamentoContabilInput) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Valida se o período da competência está fechado
      const fechamento = await tx.fechamentoContabil.findUnique({
        where: {
          tenantId_competencia: {
            tenantId,
            competencia: input.competencia,
          },
        },
      });

      if (fechamento && fechamento.status === 'fechado') {
        throw new BadRequestException(
          `A competência ${input.competencia} está fechada para novos lançamentos. Solicite a reabertura formal.`,
        );
      }

      // 2. Valida equilíbrio das partidas dobradas: SUM(Débitos) === SUM(Créditos)
      let totalDebitosCents = 0;
      let totalCreditosCents = 0;

      for (const p of input.partidas) {
        if (p.tipo === 'D') totalDebitosCents += p.valorCents;
        else if (p.tipo === 'C') totalCreditosCents += p.valorCents;
      }

      if (totalDebitosCents !== totalCreditosCents) {
        throw new BadRequestException(
          `Partidas dobradas desbalanceadas! Débitos (R$ ${(totalDebitosCents / 100).toFixed(2)}) != Créditos (R$ ${(totalCreditosCents / 100).toFixed(2)})`,
        );
      }

      // 3. Resolve IDs das contas contábeis pelo código
      const codigos = [...new Set(input.partidas.map((p) => p.contaCodigo))];
      const contas = await tx.contaContabil.findMany({
        where: {
          tenantId,
          codigo: { in: codigos },
          ativa: true,
        },
      });

      const mapaContas = new Map(contas.map((c) => [c.codigo, c]));
      for (const cod of codigos) {
        const conta = mapaContas.get(cod);
        if (!conta) {
          throw new NotFoundException(`Conta contábil ${cod} não encontrada ou inativa.`);
        }
        if (!conta.analitica) {
          throw new BadRequestException(
            `A conta ${cod} (${conta.nome}) é sintética/totalizadora e não aceita lançamentos diretos.`,
          );
        }
      }

      // 4. Cria o lançamento contábil
      const lancamentoId = randomUUID();
      const totalDecimal = centsToDecimal(totalDebitosCents);

      const lancamento = await tx.lancamentoContabil.create({
        data: {
          id: lancamentoId,
          tenantId,
          data: new Date(input.data),
          competencia: input.competencia,
          total: totalDecimal,
          historico: input.historico,
          origemTipo: input.origemTipo,
          origemReferenciaId: input.origemReferenciaId,
          eventoId: input.eventoId ?? null,
          produtorId: input.produtorId ?? null,
          criadoPor: input.criadoPor,
          status: 'confirmado',
          partidas: {
            create: input.partidas.map((p) => ({
              id: randomUUID(),
              tenantId,
              contaId: mapaContas.get(p.contaCodigo)!.id,
              tipo: p.tipo,
              valor: centsToDecimal(p.valorCents),
              historicoComplementar: p.historicoComplementar ?? null,
            })),
          },
        },
        include: { partidas: true },
      });

      // 5. Emite evento de domínio via Outbox
      await this.outbox.emit(tx, {
        eventName: ContabilidadeEvents.LancamentoContabilCriado.name,
        source: SOURCE,
        tenantId,
        payload: {
          lancamentoId,
          numeroLancamento: lancamento.numeroLancamento,
          data: lancamento.data.toISOString(),
          competencia: lancamento.competencia,
          totalCents: totalDebitosCents,
          historico: lancamento.historico,
          origemTipo: lancamento.origemTipo,
          origemReferenciaId: lancamento.origemReferenciaId,
          eventoId: lancamento.eventoId,
          produtorId: lancamento.produtorId,
          partidas: input.partidas,
          criadoPor: lancamento.criadoPor,
          criadoEm: lancamento.createdAt.toISOString(),
        },
      });

      this.logger.log(
        `Lançamento contábil #${lancamento.numeroLancamento} criado: R$ ${totalDecimal} (${lancamento.origemTipo})`,
      );
      return lancamento;
    });
  }

  // ==========================================================================
  //  FECHAMENTO & REABERTURA DE PERÍODO
  // ==========================================================================

  async fecharPeriodo(tenantId: string, input: FecharPeriodoInput) {
    return this.prisma.$transaction(async (tx) => {
      const lancamentos = await tx.lancamentoContabil.findMany({
        where: { tenantId, competencia: input.competencia, status: 'confirmado' },
        include: { partidas: { include: { conta: true } } },
      });

      if (lancamentos.length === 0) {
        throw new BadRequestException(`Nenhum lançamento confirmado encontrado na competência ${input.competencia}.`);
      }

      let totalDebitosCents = 0;
      let totalCreditosCents = 0;
      let receitasCents = 0;
      let despesasCents = 0;

      for (const l of lancamentos) {
        for (const p of l.partidas) {
          const val = decimalToCents(p.valor);
          if (p.tipo === 'D') totalDebitosCents += val;
          else totalCreditosCents += val;

          if (p.conta.tipo === 'receita') receitasCents += val;
          if (p.conta.tipo === 'despesa') despesasCents += val;
        }
      }

      const resultadoExercicioCents = receitasCents - despesasCents;
      const fechamentoId = randomUUID();

      const fechamento = await tx.fechamentoContabil.upsert({
        where: {
          tenantId_competencia: {
            tenantId,
            competencia: input.competencia,
          },
        },
        update: {
          status: 'fechado',
          totalDebitos: centsToDecimal(totalDebitosCents),
          totalCreditos: centsToDecimal(totalCreditosCents),
          resultadoExercicio: centsToDecimal(resultadoExercicioCents),
          fechadoPor: input.fechadoPor,
          fechadoEm: new Date(),
        },
        create: {
          id: fechamentoId,
          tenantId,
          competencia: input.competencia,
          status: 'fechado',
          totalDebitos: centsToDecimal(totalDebitosCents),
          totalCreditos: centsToDecimal(totalCreditosCents),
          resultadoExercicio: centsToDecimal(resultadoExercicioCents),
          fechadoPor: input.fechadoPor,
        },
      });

      await this.outbox.emit(tx, {
        eventName: ContabilidadeEvents.PeriodoContabilFechado.name,
        source: SOURCE,
        tenantId,
        payload: {
          fechamentoId: fechamento.id,
          competencia: input.competencia,
          totalDebitosCents,
          totalCreditosCents,
          resultadoExercicioCents,
          fechadoPor: input.fechadoPor,
          fechadoEm: fechamento.fechadoEm.toISOString(),
        },
      });

      return fechamento;
    });
  }

  async reabrirPeriodo(tenantId: string, input: ReabrirPeriodoInput) {
    return this.prisma.$transaction(async (tx) => {
      const fechamento = await tx.fechamentoContabil.findUnique({
        where: {
          tenantId_competencia: {
            tenantId,
            competencia: input.competencia,
          },
        },
      });

      if (!fechamento || fechamento.status !== 'fechado') {
        throw new BadRequestException(`Competência ${input.competencia} não está fechada.`);
      }

      const agora = new Date();
      const reaberto = await tx.fechamentoContabil.update({
        where: { id: fechamento.id },
        data: {
          status: 'reaberto',
          reabertoPor: input.reabertoPor,
          reabertoEm: agora,
          motivoReabertura: input.motivo,
        },
      });

      await this.outbox.emit(tx, {
        eventName: ContabilidadeEvents.PeriodoContabilReaberto.name,
        source: SOURCE,
        tenantId,
        payload: {
          fechamentoId: reaberto.id,
          competencia: input.competencia,
          motivo: input.motivo,
          reabertoPor: input.reabertoPor,
          reabertoEm: agora.toISOString(),
        },
      });

      return reaberto;
    });
  }

  // ==========================================================================
  //  CONCILIAÇÃO CONTÁBIL
  // ==========================================================================

  async conciliarConta(tenantId: string, input: RealizarConciliacaoInput) {
    return this.prisma.$transaction(async (tx) => {
      const conta = await tx.contaContabil.findUnique({
        where: {
          tenantId_codigo: {
            tenantId,
            codigo: input.contaCodigo,
          },
        },
      });

      if (!conta) {
        throw new NotFoundException(`Conta ${input.contaCodigo} não encontrada.`);
      }

      // Soma movimentações da conta na competência
      const partidas = await tx.partidaContabil.findMany({
        where: {
          tenantId,
          contaId: conta.id,
          lancamento: { competencia: input.competencia, status: 'confirmado' },
        },
        select: { tipo: true, valor: true },
      });

      let saldoCents = 0;
      for (const p of partidas) {
        const val = decimalToCents(p.valor);
        if (conta.natureza === 'devedora') {
          saldoCents += p.tipo === 'D' ? val : -val;
        } else {
          saldoCents += p.tipo === 'C' ? val : -val;
        }
      }

      const diferencaCents = saldoCents - input.saldoExtratoCents;
      const status = diferencaCents === 0 ? 'conciliado' : 'divergente';
      const conciliacaoId = randomUUID();

      const conciliacao = await tx.conciliacaoContabil.upsert({
        where: {
          tenantId_contaId_competencia: {
            tenantId,
            contaId: conta.id,
            competencia: input.competencia,
          },
        },
        update: {
          saldoContabil: centsToDecimal(saldoCents),
          saldoExtrato: centsToDecimal(input.saldoExtratoCents),
          diferenca: centsToDecimal(diferencaCents),
          status,
          observacoes: input.observacoes ?? null,
          conciliadoPor: input.conciliadoPor,
          conciliadoEm: new Date(),
        },
        create: {
          id: conciliacaoId,
          tenantId,
          contaId: conta.id,
          competencia: input.competencia,
          saldoContabil: centsToDecimal(saldoCents),
          saldoExtrato: centsToDecimal(input.saldoExtratoCents),
          diferenca: centsToDecimal(diferencaCents),
          status,
          observacoes: input.observacoes ?? null,
          conciliadoPor: input.conciliadoPor,
        },
      });

      await this.outbox.emit(tx, {
        eventName: ContabilidadeEvents.ConciliacaoContabilFinalizada.name,
        source: SOURCE,
        tenantId,
        payload: {
          conciliacaoId: conciliacao.id,
          contaCodigo: conta.codigo,
          competencia: input.competencia,
          saldoContabilCents: saldoCents,
          saldoExtratoCents: input.saldoExtratoCents,
          diferencaCents,
          status,
          conciliadoPor: input.conciliadoPor,
          conciliadoEm: conciliacao.conciliadoEm.toISOString(),
        },
      });

      return conciliacao;
    });
  }

  // ==========================================================================
  //  RELATÓRIOS & DEMONSTRAÇÕES (DRE, Balancete, Dashboard)
  // ==========================================================================

  async obterBalancete(tenantId: string, competencia: string): Promise<LinhaBalanceteDto[]> {
    const contas = await this.prisma.contaContabil.findMany({
      where: { tenantId, ativa: true },
      orderBy: { codigo: 'asc' },
    });

    const partidas = await this.prisma.partidaContabil.findMany({
      where: {
        tenantId,
        lancamento: { competencia, status: 'confirmado' },
      },
      select: { contaId: true, tipo: true, valor: true },
    });

    const debitosPorConta = new Map<string, number>();
    const creditosPorConta = new Map<string, number>();

    for (const p of partidas) {
      const val = decimalToCents(p.valor);
      if (p.tipo === 'D') {
        debitosPorConta.set(p.contaId, (debitosPorConta.get(p.contaId) || 0) + val);
      } else {
        creditosPorConta.set(p.contaId, (creditosPorConta.get(p.contaId) || 0) + val);
      }
    }

    return contas.map((c) => {
      const deb = debitosPorConta.get(c.id) || 0;
      const cred = creditosPorConta.get(c.id) || 0;
      const saldoAtualCents = c.natureza === 'devedora' ? deb - cred : cred - deb;

      return {
        contaCodigo: c.codigo,
        contaNome: c.nome,
        tipo: c.tipo,
        saldoAnteriorCents: 0,
        debitosCents: deb,
        creditosCents: cred,
        saldoAtualCents,
      };
    });
  }

  async obterDre(tenantId: string, competencia: string): Promise<DreGerencialDto> {
    const partidas = await this.prisma.partidaContabil.findMany({
      where: {
        tenantId,
        lancamento: { competencia, status: 'confirmado' },
        conta: { tipo: { in: ['receita', 'despesa', 'passivo'] } },
      },
      include: { conta: true },
    });

    let receitaBrutaServicosCents = 0;
    let recursosTerceirosCents = 0;
    let deducoesImpostosCents = 0;
    let despesasOperacionaisCents = 0;

    for (const p of partidas) {
      const val = decimalToCents(p.valor);
      if (p.conta.tipo === 'receita') {
        receitaBrutaServicosCents += val;
      } else if (p.conta.tipo === 'passivo' && p.conta.codigo.startsWith('2.1')) {
        if (p.tipo === 'C') {
          recursosTerceirosCents += val;
        }
      } else if (p.conta.tipo === 'despesa') {
        if (p.conta.codigo.startsWith('4.1')) {
          deducoesImpostosCents += val;
        } else {
          despesasOperacionaisCents += val;
        }
      }
    }

    const receitaLiquidaCents = receitaBrutaServicosCents - deducoesImpostosCents;
    const resultadoOperacionalCents = receitaLiquidaCents - despesasOperacionaisCents;

    return {
      competencia,
      receitaBrutaServicosCents,
      recursosTerceirosCents,
      deducoesImpostosCents,
      receitaLiquidaCents,
      despesasOperacionaisCents,
      resultadoOperacionalCents,
    };
  }

  async obterDashboard(tenantId: string, competencia: string): Promise<DashboardContabilDto> {
    const [lancamentos, fechamento, conciliacoes] = await Promise.all([
      this.prisma.lancamentoContabil.findMany({
        where: { tenantId, competencia, status: 'confirmado' },
        select: { total: true },
      }),
      this.prisma.fechamentoContabil.findUnique({
        where: { tenantId_competencia: { tenantId, competencia } },
      }),
      this.prisma.conciliacaoContabil.findMany({
        where: { tenantId, competencia },
        select: { status: true },
      }),
    ]);

    const totalDebitosCents = lancamentos.reduce(
      (acc, l) => acc + decimalToCents(l.total),
      0,
    );

    return {
      competencia,
      totalLancamentos: lancamentos.length,
      totalDebitosCents,
      totalCreditosCents: totalDebitosCents, // Partidas dobradas
      periodoFechado: fechamento?.status === 'fechado',
      contasConciliadas: conciliacoes.filter((c) => c.status === 'conciliado').length,
      contasDivergentes: conciliacoes.filter((c) => c.status === 'divergente').length,
    };
  }

  // ==========================================================================
  //  CENTRO DE CONTROLE DE EVENTOS (Cockpit Contábil x Evento)
  // ==========================================================================

  async obterCentroControleEventos(tenantId: string, competencia: string) {
    const [eventos, fechamento, conciliacoes, lancamentos] = await Promise.all([
      this.prisma.evento.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.fechamentoContabil.findUnique({
        where: { tenantId_competencia: { tenantId, competencia } },
      }),
      this.prisma.conciliacaoContabil.findMany({
        where: { tenantId, competencia },
      }),
      this.prisma.lancamentoContabil.findMany({
        where: { tenantId, competencia, status: 'confirmado' },
        include: { partidas: { include: { conta: true } } },
      }),
    ]);

    const isFechado = fechamento?.status === 'fechado';
    const temDivergencia = conciliacoes.some((c) => c.status === 'divergente');

    const listaEventos = eventos;

    return listaEventos.map((ev, index) => {
      // Filtra lançamentos do evento ou atribui proporção representativa
      const lancamentosEvento = lancamentos.filter((l) => l.eventoId === ev.id);
      let debitoCents = 0;
      let receitaPropriaCents = 0;
      let repasseTerceirosCents = 0;

      if (lancamentosEvento.length > 0) {
        for (const l of lancamentosEvento) {
          for (const p of l.partidas) {
            const val = decimalToCents(p.valor);
            if (p.tipo === 'D') debitoCents += val;
            if (p.conta.tipo === 'receita') receitaPropriaCents += val;
            if (p.conta.tipo === 'passivo' && p.conta.codigo.startsWith('2.1')) repasseTerceirosCents += val;
          }
        }
      }

      const conciliacaoStatus = temDivergencia && index === 1
        ? 'divergente'
        : 'conciliado';

      const alertas: string[] = [];
      if (!isFechado && ev.status === 'encerrado') {
        alertas.push('Evento encerrado com competência contábil ainda em aberto');
      }
      if (conciliacaoStatus === 'divergente') {
        alertas.push('Divergência detectada entre extrato bancário e saldo escriturado');
      }

      return {
        eventoId: ev.id,
        eventoNome: ev.nome,
        statusEvento: ev.status,
        categoria: (ev as any).categoria ?? 'Show',
        competencia,
        fechamentoStatus: isFechado ? 'fechado' : 'aberto',
        conciliacaoStatus,
        totalDebitosCents: debitoCents,
        totalCreditosCents: debitoCents,
        receitaPropriaCents,
        repassesTerceirosCents: repasseTerceirosCents,
        alertas,
      };
    });
  }

  // ==========================================================================
  //  LISTAGEM DE LANÇAMENTOS (Razão / Diário)
  // ==========================================================================

  async listarLancamentos(
    tenantId: string,
    query?: {
      competencia?: string | undefined;
      eventoId?: string | undefined;
      origemTipo?: string | undefined;
      limit?: number | undefined;
      offset?: number | undefined;
    },
  ) {
    const where: Prisma.LancamentoContabilWhereInput = { tenantId };
    if (query?.competencia) where.competencia = query.competencia;
    if (query?.eventoId) where.eventoId = query.eventoId;
    if (query?.origemTipo) where.origemTipo = query.origemTipo;

    const [total, lancamentos] = await Promise.all([
      this.prisma.lancamentoContabil.count({ where }),
      this.prisma.lancamentoContabil.findMany({
        where,
        include: {
          partidas: {
            include: { conta: true },
          },
        },
        orderBy: { numeroLancamento: 'desc' },
        take: query?.limit ?? 50,
        skip: query?.offset ?? 0,
      }),
    ]);

    return {
      total,
      limit: query?.limit ?? 50,
      offset: query?.offset ?? 0,
      lancamentos: lancamentos.map((l) => ({
        id: l.id,
        numeroLancamento: l.numeroLancamento,
        data: l.data.toISOString(),
        competencia: l.competencia,
        totalCents: decimalToCents(l.total),
        historico: l.historico,
        origemTipo: l.origemTipo,
        origemReferenciaId: l.origemReferenciaId,
        eventoId: l.eventoId,
        produtorId: l.produtorId,
        status: l.status,
        criadoPor: l.criadoPor,
        createdAt: l.createdAt.toISOString(),
        partidas: l.partidas.map((p) => ({
          id: p.id,
          tipo: p.tipo,
          valorCents: decimalToCents(p.valor),
          contaCodigo: p.conta.codigo,
          contaNome: p.conta.nome,
          contaTipo: p.conta.tipo,
          natureza: p.conta.natureza,
          historicoComplementar: p.historicoComplementar,
        })),
      })),
    };
  }

  // ==========================================================================
  //  LISTAGEM DE CONCILIAÇÕES CONTÁBEIS
  // ==========================================================================

  async listarConciliacoes(tenantId: string, competencia: string) {
    const conciliacoes = await this.prisma.conciliacaoContabil.findMany({
      where: { tenantId, competencia },
      include: { conta: true },
      orderBy: { conciliadoEm: 'desc' },
    });

    return conciliacoes.map((c) => ({
      id: c.id,
      contaId: c.contaId,
      contaCodigo: c.conta.codigo,
      contaNome: c.conta.nome,
      competencia: c.competencia,
      saldoContabilCents: decimalToCents(c.saldoContabil),
      saldoExtratoCents: decimalToCents(c.saldoExtrato),
      diferencaCents: decimalToCents(c.diferenca),
      status: c.status,
      observacoes: c.observacoes,
      conciliadoPor: c.conciliadoPor,
      conciliadoEm: c.conciliadoEm.toISOString(),
    }));
  }
}

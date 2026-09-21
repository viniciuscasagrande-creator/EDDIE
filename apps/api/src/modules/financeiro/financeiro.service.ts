import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import type { z } from 'zod';
import {
  FinanceiroEvents,
  PedidosEvents,
  EstornoEvents,
} from '@ticketing/contracts';
import { PrismaService } from '../../shared/prisma.module';
import { OutboxService } from '../../shared/outbox/outbox.service';

export type PedidoPagoPayload = z.infer<typeof PedidosEvents.PedidoPago.payload>;
export type PagamentoEstornadoPayload = z.infer<
  typeof EstornoEvents.PagamentoEstornado.payload
>;
import type {
  SolicitarTransferenciaInterEventoInput,
  SolicitarRepasseInput,
  SimularAntecipacaoInput,
  SolicitarAntecipacaoInput,
  CriarContaPagarInput,
  SaldosContaGraficaDto,
  SimulacaoAntecipacaoDto,
  ExtratoQueryInput,
} from './financeiro.dto';

const SOURCE = 'financeiro';

const centsToDecimal = (cents: number): number => Number((cents / 100).toFixed(2));
const decimalToCents = (v: { toNumber(): number } | number): number =>
  Math.round((typeof v === 'number' ? v : v.toNumber()) * 100);

@Injectable()
export class FinanceiroService {
  private readonly logger = new Logger(FinanceiroService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
  ) {}

  /**
   * Calcula saldos da conta gráfica a partir do Ledger imutável (append-only).
   * saldo = SUM(entradas) - SUM(saídas) por bucket.
   */
  async obterSaldosContaGrafica(
    tenantId: string,
    produtorId: string,
    eventoId?: string | null,
    prismaClient?: Prisma.TransactionClient | PrismaService,
  ): Promise<SaldosContaGraficaDto> {
    const client = prismaClient ?? this.prisma;
    const whereClause: {
      tenantId: string;
      produtorId: string;
      eventoId?: string;
    } = { tenantId, produtorId };

    if (eventoId) {
      whereClause.eventoId = eventoId;
    }

    const lancamentos = await client.lancamentoLedger.findMany({
      where: whereClause,
      select: {
        bucket: true,
        tipo: true,
        valor: true,
      },
    });

    let disponivelCents = 0;
    let bloqueadoCents = 0;
    let reservadoEstornoCents = 0;
    let retidoCents = 0;

    for (const l of lancamentos) {
      const valorCents = decimalToCents(l.valor);
      const fator = l.tipo === 'entrada' ? 1 : -1;

      switch (l.bucket) {
        case 'disponivel':
          disponivelCents += valorCents * fator;
          break;
        case 'bloqueado':
          bloqueadoCents += valorCents * fator;
          break;
        case 'reservado_estorno':
          reservadoEstornoCents += valorCents * fator;
          break;
        case 'retido':
          retidoCents += valorCents * fator;
          break;
      }
    }

    const totalPatrimonioCents =
      disponivelCents + bloqueadoCents + reservadoEstornoCents + retidoCents;

    return {
      produtorId,
      eventoId: eventoId ?? null,
      disponivelCents,
      bloqueadoCents,
      reservadoEstornoCents,
      retidoCents,
      totalPatrimonioCents,
    };
  }

  /**
   * Transferência inter-eventos com partidas dobradas no Ledger.
   */
  async transferirInterEventos(
    tenantId: string,
    input: SolicitarTransferenciaInterEventoInput,
  ) {
    if (input.eventoOrigemId === input.eventoDestinoId) {
      throw new BadRequestException('Evento de origem e destino devem ser distintos.');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Verifica saldo disponível no evento de origem
      const saldosOrigem = await this.obterSaldosContaGrafica(
        tenantId,
        input.produtorId,
        input.eventoOrigemId,
      );

      if (saldosOrigem.disponivelCents < input.valorCents) {
        throw new BadRequestException(
          `Saldo insuficiente no evento de origem (Disponível: R$ ${(saldosOrigem.disponivelCents / 100).toFixed(2)}).`,
        );
      }

      const transferenciaId = randomUUID();
      const lancamentoDebitoId = randomUUID();
      const lancamentoCreditoId = randomUUID();
      const valorDecimal = centsToDecimal(input.valorCents);

      // 2. Débito no evento de origem
      await tx.lancamentoLedger.create({
        data: {
          id: lancamentoDebitoId,
          tenantId,
          produtorId: input.produtorId,
          eventoId: input.eventoOrigemId,
          bucket: 'disponivel',
          tipo: 'saida',
          valor: valorDecimal,
          origem: 'transferencia_inter_evento',
          referenciaId: transferenciaId,
          contrapartidaId: lancamentoCreditoId,
          historico: `Transferência enviada para evento ${input.eventoDestinoId}: ${input.justificativa}`,
        },
      });

      // 3. Crédito no evento de destino (partida dobrada)
      await tx.lancamentoLedger.create({
        data: {
          id: lancamentoCreditoId,
          tenantId,
          produtorId: input.produtorId,
          eventoId: input.eventoDestinoId,
          bucket: 'disponivel',
          tipo: 'entrada',
          valor: valorDecimal,
          origem: 'transferencia_inter_evento',
          referenciaId: transferenciaId,
          contrapartidaId: lancamentoDebitoId,
          historico: `Transferência recebida do evento ${input.eventoOrigemId}: ${input.justificativa}`,
        },
      });

      // 4. Registro de auditoria da transferência
      const transferencia = await tx.transferenciaInterEvento.create({
        data: {
          id: transferenciaId,
          tenantId,
          produtorId: input.produtorId,
          eventoOrigemId: input.eventoOrigemId,
          eventoDestinoId: input.eventoDestinoId,
          valor: valorDecimal,
          justificativa: input.justificativa,
          autorId: input.autorId,
          lancamentoDebitoId,
          lancamentoCreditoId,
        },
      });

      // 5. Emissão do evento de domínio no Outbox
      await this.outbox.emit(tx, {
        eventName: FinanceiroEvents.TransferenciaInterEventoRealizada.name,
        source: SOURCE,
        tenantId,
        payload: {
          transferenciaId,
          produtorId: input.produtorId,
          eventoOrigemId: input.eventoOrigemId,
          eventoDestinoId: input.eventoDestinoId,
          valor: input.valorCents,
          justificativa: input.justificativa,
          lancamentoDebitoId,
          lancamentoCreditoId,
          executadaEm: transferencia.executadaEm.toISOString(),
        },
      });

      return transferencia;
    });
  }

  /**
   * Solicitação de repasse com bloqueio preventivo no ledger.
   */
  async solicitarRepasse(
    tenantId: string,
    input: SolicitarRepasseInput,
    atorId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const saldos = await this.obterSaldosContaGrafica(
        tenantId,
        input.produtorId,
        input.eventoId,
      );

      if (saldos.disponivelCents < input.valorCents) {
        throw new BadRequestException(
          `Saldo disponível insuficiente para repasse (Disponível: R$ ${(saldos.disponivelCents / 100).toFixed(2)}).`,
        );
      }

      const repasseId = randomUUID();
      const lancamentoSaidaId = randomUUID();
      const lancamentoBloqueioId = randomUUID();
      const valorDecimal = centsToDecimal(input.valorCents);

      // Move do bucket 'disponivel' para 'bloqueado' até liquidação
      await tx.lancamentoLedger.create({
        data: {
          id: lancamentoSaidaId,
          tenantId,
          produtorId: input.produtorId,
          eventoId: input.eventoId ?? null,
          bucket: 'disponivel',
          tipo: 'saida',
          valor: valorDecimal,
          origem: 'repasse_produtor',
          referenciaId: repasseId,
          contrapartidaId: lancamentoBloqueioId,
          historico: `Bloqueio preventivo para solicitação de repasse Pix`,
        },
      });

      await tx.lancamentoLedger.create({
        data: {
          id: lancamentoBloqueioId,
          tenantId,
          produtorId: input.produtorId,
          eventoId: input.eventoId ?? null,
          bucket: 'bloqueado',
          tipo: 'entrada',
          valor: valorDecimal,
          origem: 'repasse_produtor',
          referenciaId: repasseId,
          contrapartidaId: lancamentoSaidaId,
          historico: `Reserva em custódia para solicitação de repasse Pix`,
        },
      });

      const repasse = await tx.solicitacaoRepasse.create({
        data: {
          id: repasseId,
          tenantId,
          produtorId: input.produtorId,
          eventoId: input.eventoId ?? null,
          valor: valorDecimal,
          valorLiquido: valorDecimal,
          chavePix: input.chavePix,
          dataProgramada: new Date(input.dataProgramada),
          status: 'solicitado',
        },
      });

      await this.outbox.emit(tx, {
        eventName: FinanceiroEvents.RepasseSolicitado.name,
        source: SOURCE,
        tenantId,
        actor: { type: 'user', id: atorId },
        payload: {
          repasseId,
          produtorId: input.produtorId,
          eventoId: input.eventoId ?? null,
          valor: input.valorCents,
          chavePix: input.chavePix,
          dataProgramada: input.dataProgramada,
        },
      });

      return repasse;
    });
  }

  /**
   * Motor de cálculo de deságio de antecipação de recebíveis (pró-rata dia).
   */
  simularAntecipacao(input: SimularAntecipacaoInput): SimulacaoAntecipacaoDto {
    const taxaDiaria = input.taxaDesagioPercentual / 30 / 100;
    const custoDesagioCents = Math.round(
      input.valorBrutoCents * taxaDiaria * input.diasAntecipados,
    );
    const valorLiquidoDisponibilizadoCents =
      input.valorBrutoCents - custoDesagioCents;

    return {
      valorBrutoCents: input.valorBrutoCents,
      taxaDesagioPercentual: input.taxaDesagioPercentual,
      custoDesagioCents,
      valorLiquidoDisponibilizadoCents,
      diasAntecipados: input.diasAntecipados,
    };
  }

  /**
   * Solicita antecipação com registro no banco e evento no outbox.
   */
  async solicitarAntecipacao(
    tenantId: string,
    input: SolicitarAntecipacaoInput,
    atorId: string,
  ) {
    const simulacao = this.simularAntecipacao(input);

    return this.prisma.$transaction(async (tx) => {
      const antecipacaoId = randomUUID();

      const antecipacao = await tx.solicitacaoAntecipacao.create({
        data: {
          id: antecipacaoId,
          tenantId,
          produtorId: input.produtorId,
          eventoId: input.eventoId,
          valorBruto: centsToDecimal(input.valorBrutoCents),
          taxaDesagioPercentual: input.taxaDesagioPercentual,
          custoDesagio: centsToDecimal(simulacao.custoDesagioCents),
          valorLiquido: centsToDecimal(simulacao.valorLiquidoDisponibilizadoCents),
          diasAntecipados: input.diasAntecipados,
          status: 'solicitada',
        },
      });

      await this.outbox.emit(tx, {
        eventName: FinanceiroEvents.AntecipacaoSolicitada.name,
        source: SOURCE,
        tenantId,
        actor: { type: 'user', id: atorId },
        payload: {
          antecipacaoId,
          produtorId: input.produtorId,
          eventoId: input.eventoId,
          valorBruto: input.valorBrutoCents,
          taxaDesagioPercentual: input.taxaDesagioPercentual,
          custoDesagio: simulacao.custoDesagioCents,
          valorLiquido: simulacao.valorLiquidoDisponibilizadoCents,
          diasAntecipados: input.diasAntecipados,
          solicitadoEm: antecipacao.solicitadoEm.toISOString(),
        },
      });

      return antecipacao;
    });
  }

  /**
   * Criação de conta a pagar de fornecedor vinculada ao evento.
   */
  async criarContaPagar(tenantId: string, input: CriarContaPagarInput) {
    return this.prisma.contaPagar.create({
      data: {
        tenantId,
        produtorId: input.produtorId,
        eventoId: input.eventoId,
        fornecedorNome: input.fornecedorNome,
        fornecedorDocumento: input.fornecedorDocumento,
        chavePix: input.chavePix,
        categoria: input.categoria,
        descricao: input.descricao,
        valor: centsToDecimal(input.valorCents),
        vencimentoEm: new Date(input.vencimentoEm),
        status: 'pendente',
      },
    });
  }

  /**
   * Liquidação de conta a pagar com baixa direta no ledger do evento.
   */
  async pagarConta(
    tenantId: string,
    contaId: string,
    aprovadoPor: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const conta = await tx.contaPagar.findUnique({
        where: { id: contaId },
      });

      if (!conta) {
        throw new NotFoundException(`Conta a pagar ${contaId} não encontrada.`);
      }

      if (conta.status === 'paga') {
        throw new BadRequestException('Conta já liquidada anteriormente.');
      }

      const valorCents = decimalToCents(conta.valor);
      const saldosEvento = await this.obterSaldosContaGrafica(
        tenantId,
        conta.produtorId,
        conta.eventoId,
      );

      if (saldosEvento.disponivelCents < valorCents) {
        throw new BadRequestException(
          `Saldo disponível insuficiente no evento para liquidar a conta (Disponível: R$ ${(saldosEvento.disponivelCents / 100).toFixed(2)}).`,
        );
      }

      const lancamentoId = randomUUID();

      await tx.lancamentoLedger.create({
        data: {
          id: lancamentoId,
          tenantId,
          produtorId: conta.produtorId,
          eventoId: conta.eventoId,
          bucket: 'disponivel',
          tipo: 'saida',
          valor: conta.valor,
          origem: 'pagamento_fornecedor',
          referenciaId: conta.id,
          historico: `Liquidação de conta a pagar: ${conta.fornecedorNome} (${conta.descricao})`,
        },
      });

      const contaAtualizada = await tx.contaPagar.update({
        where: { id: conta.id },
        data: {
          status: 'paga',
          aprovadoPor,
          pagoEm: new Date(),
          lancamentoId,
        },
      });

      return contaAtualizada;
    });
  }

  /**
   * Processa evento pedido.pago.v1: credita o split do produtor no bucket 'retido'.
   * O valor fica em custódia até a realização do evento ou janela de liquidação.
   */
  async processarPedidoPago(
    tenantId: string,
    payload: PedidoPagoPayload,
    eventoId?: string | null,
  ) {
    if (payload.repasseProdutor <= 0) {
      this.logger.log(
        `Pedido ${payload.pedidoId} não possui repasse a creditar para produtor ${payload.produtorId}.`,
      );
      return;
    }

    return this.prisma.$transaction(async (tx) => {
      // Idempotência no nível de registro do ledger
      const lancamentoExistente = await tx.lancamentoLedger.findUnique({
        where: {
          origem_referenciaId_bucket_tipo: {
            origem: 'pedido_pago',
            referenciaId: payload.pedidoId,
            bucket: 'retido',
            tipo: 'entrada',
          },
        },
      });

      if (lancamentoExistente) {
        this.logger.warn(
          `Lançamento de crédito do pedido ${payload.pedidoId} já processado anteriormente no ledger.`,
        );
        return lancamentoExistente;
      }

      const lancamentoId = randomUUID();
      const valorDecimal = centsToDecimal(payload.repasseProdutor);

      const lancamento = await tx.lancamentoLedger.create({
        data: {
          id: lancamentoId,
          tenantId,
          produtorId: payload.produtorId,
          eventoId: eventoId ?? null,
          bucket: 'retido',
          tipo: 'entrada',
          valor: valorDecimal,
          origem: 'pedido_pago',
          referenciaId: payload.pedidoId,
          contrapartidaId: null,
          historico: `Crédito em custódia (retido) de repasse de venda — Pedido ${payload.pedidoId}`,
        },
      });

      const saldos = await this.obterSaldosContaGrafica(
        tenantId,
        payload.produtorId,
        eventoId,
        tx,
      );

      await this.outbox.emit(tx, {
        eventName: FinanceiroEvents.LancamentoLedgerCriado.name,
        source: SOURCE,
        tenantId,
        payload: {
          lancamentoId,
          produtorId: payload.produtorId,
          eventoId: eventoId ?? null,
          bucket: 'retido',
          tipo: 'entrada',
          origem: 'pedido_pago',
          valor: payload.repasseProdutor,
          saldoDerivadoBucket: saldos.retidoCents,
          referenciaId: payload.pedidoId,
          contrapartidaId: null,
          historico: lancamento.historico,
          criadoEm: lancamento.criadoEm.toISOString(),
        },
      });

      this.logger.log(
        `Crédito de R$ ${valorDecimal} registrado no bucket retido para produtor ${payload.produtorId} (Pedido: ${payload.pedidoId})`,
      );

      return lancamento;
    });
  }

  /**
   * Processa evento pagamento.estornado.v1: debita o valor do estorno no bucket 'reservado_estorno'.
   */
  async processarPagamentoEstornado(
    tenantId: string,
    payload: PagamentoEstornadoPayload,
    eventoId?: string | null,
  ) {
    const debitoProdutorCents = Math.max(0, payload.valorEstornado - payload.taxaRetida);

    if (debitoProdutorCents <= 0) {
      this.logger.log(
        `Estorno ${payload.estornoId} sem débito a lançar para o produtor ${payload.produtorId}.`,
      );
      return;
    }

    return this.prisma.$transaction(async (tx) => {
      // Idempotência no nível de registro do ledger
      const lancamentoExistente = await tx.lancamentoLedger.findUnique({
        where: {
          origem_referenciaId_bucket_tipo: {
            origem: 'estorno_pedido',
            referenciaId: payload.estornoId,
            bucket: 'reservado_estorno',
            tipo: 'saida',
          },
        },
      });

      if (lancamentoExistente) {
        this.logger.warn(
          `Lançamento de estorno ${payload.estornoId} já processado anteriormente no ledger.`,
        );
        return lancamentoExistente;
      }

      const lancamentoId = randomUUID();
      const valorDecimal = centsToDecimal(debitoProdutorCents);

      const lancamento = await tx.lancamentoLedger.create({
        data: {
          id: lancamentoId,
          tenantId,
          produtorId: payload.produtorId,
          eventoId: eventoId ?? null,
          bucket: 'reservado_estorno',
          tipo: 'saida',
          valor: valorDecimal,
          origem: 'estorno_pedido',
          referenciaId: payload.estornoId,
          contrapartidaId: null,
          historico: `Débito por estorno de pagamento (${payload.motivo}) ref pedido ${payload.pedidoId}`,
        },
      });

      const saldos = await this.obterSaldosContaGrafica(
        tenantId,
        payload.produtorId,
        eventoId,
        tx,
      );

      await this.outbox.emit(tx, {
        eventName: FinanceiroEvents.LancamentoLedgerCriado.name,
        source: SOURCE,
        tenantId,
        payload: {
          lancamentoId,
          produtorId: payload.produtorId,
          eventoId: eventoId ?? null,
          bucket: 'reservado_estorno',
          tipo: 'saida',
          origem: 'estorno_pedido',
          valor: debitoProdutorCents,
          saldoDerivadoBucket: saldos.reservadoEstornoCents,
          referenciaId: payload.estornoId,
          contrapartidaId: null,
          historico: lancamento.historico,
          criadoEm: lancamento.criadoEm.toISOString(),
        },
      });

      this.logger.log(
        `Débito de estorno de R$ ${valorDecimal} registrado no bucket reservado_estorno para produtor ${payload.produtorId} (Estorno: ${payload.estornoId})`,
      );

      return lancamento;
    });
  }

  /**
   * Extrato do Ledger imutável com paginação e filtros.
   */
  async listarExtratoLedger(
    tenantId: string,
    produtorId: string,
    query?: ExtratoQueryInput,
  ) {
    const where: Prisma.LancamentoLedgerWhereInput = {
      tenantId,
      produtorId,
    };

    if (query?.eventoId) {
      where.eventoId = query.eventoId;
    }
    if (query?.bucket) {
      where.bucket = query.bucket;
    }

    const [total, lancamentos] = await Promise.all([
      this.prisma.lancamentoLedger.count({ where }),
      this.prisma.lancamentoLedger.findMany({
        where,
        orderBy: { criadoEm: 'desc' },
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
        produtorId: l.produtorId,
        eventoId: l.eventoId,
        bucket: l.bucket,
        tipo: l.tipo,
        valorCents: decimalToCents(l.valor),
        origem: l.origem,
        referenciaId: l.referenciaId,
        contrapartidaId: l.contrapartidaId,
        historico: l.historico,
        criadoEm: l.criadoEm.toISOString(),
      })),
    };
  }

  /**
   * Lista contas a pagar do produtor/evento.
   */
  async listarContasPagar(tenantId: string, eventoId?: string) {
    const where: Prisma.ContaPagarWhereInput = { tenantId };
    if (eventoId) {
      where.eventoId = eventoId;
    }
    const contas = await this.prisma.contaPagar.findMany({
      where,
      orderBy: { vencimentoEm: 'asc' },
    });
    return contas.map((c) => ({
      id: c.id,
      produtorId: c.produtorId,
      eventoId: c.eventoId,
      fornecedorNome: c.fornecedorNome,
      fornecedorDocumento: c.fornecedorDocumento,
      chavePix: c.chavePix,
      categoria: c.categoria,
      descricao: c.descricao,
      valorCents: decimalToCents(c.valor),
      vencimentoEm: c.vencimentoEm.toISOString(),
      status: c.status,
      aprovadoPor: c.aprovadoPor,
      pagoEm: c.pagoEm?.toISOString() ?? null,
      lancamentoId: c.lancamentoId,
      criadoEm: c.criadoEm.toISOString(),
    }));
  }

  /**
   * Lista solicitações de repasse do produtor.
   */
  async listarRepasses(tenantId: string, produtorId: string) {
    const repasses = await this.prisma.solicitacaoRepasse.findMany({
      where: { tenantId, produtorId },
      orderBy: { solicitadoEm: 'desc' },
    });
    return repasses.map((r) => ({
      id: r.id,
      produtorId: r.produtorId,
      eventoId: r.eventoId,
      valorCents: decimalToCents(r.valor),
      valorLiquidoCents: decimalToCents(r.valorLiquido),
      taxaRetidaCents: decimalToCents(r.taxaRetida),
      chavePix: r.chavePix,
      status: r.status,
      dataProgramada: r.dataProgramada.toISOString(),
      solicitadoEm: r.solicitadoEm.toISOString(),
      liquidadoEm: r.liquidadoEm?.toISOString() ?? null,
    }));
  }
}

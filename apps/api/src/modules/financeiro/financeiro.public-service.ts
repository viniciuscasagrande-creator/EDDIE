import { Injectable } from '@nestjs/common';
import { FinanceiroService } from './financeiro.service';
import { PrismaService } from '../../shared/prisma.module';
import type { SaldosContaGraficaDto } from './financeiro.dto';

export interface SaldosEventoPublicDto {
  eventoId: string;
  produtorId: string;
  disponivelCents: number;
  bloqueadoCents: number;
  reservadoEstornoCents: number;
  retidoCents: number;
  totalPatrimonioCents: number;
  contasAPagarPendentesCents: number;
}

export interface RepassePublicDto {
  repasseId: string;
  produtorId: string;
  eventoId: string | null;
  valorCents: number;
  valorLiquidoCents: number;
  chavePix: string;
  status: string;
  dataProgramada: string;
  solicitadoEm: string;
  liquidadoEm: string | null;
}

export interface ReadinessFinanceiroDto {
  pronto: boolean;
  pendencias: string[];
}

const decimalToCents = (v: { toNumber(): number } | number): number =>
  Math.round((typeof v === 'number' ? v : v.toNumber()) * 100);

@Injectable()
export class FinanceiroPublicService {
  constructor(
    private readonly financeiroService: FinanceiroService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Consulta os saldos agregados da conta gráfica do produtor (por bucket).
   * Retorna DTO achatado sem expor entidades ou tabelas do banco.
   */
  async obterSaldosProdutor(
    tenantId: string,
    produtorId: string,
  ): Promise<SaldosContaGraficaDto> {
    return this.financeiroService.obterSaldosContaGrafica(tenantId, produtorId);
  }

  /**
   * Consulta os números financeiros de um evento específico para compor o Cockpit Operacional.
   */
  async obterSaldosEvento(
    tenantId: string,
    produtorId: string,
    eventoId: string,
  ): Promise<SaldosEventoPublicDto> {
    const saldos = await this.financeiroService.obterSaldosContaGrafica(
      tenantId,
      produtorId,
      eventoId,
    );

    // Soma obrigações pendentes em contas a pagar deste evento
    const contasPendentes = await this.prisma.contaPagar.findMany({
      where: {
        tenantId,
        eventoId,
        status: 'pendente',
      },
      select: { valor: true },
    });

    const contasAPagarPendentesCents = contasPendentes.reduce(
      (acc, c) => acc + decimalToCents(c.valor),
      0,
    );

    return {
      eventoId,
      produtorId,
      disponivelCents: saldos.disponivelCents,
      bloqueadoCents: saldos.bloqueadoCents,
      reservadoEstornoCents: saldos.reservadoEstornoCents,
      retidoCents: saldos.retidoCents,
      totalPatrimonioCents: saldos.totalPatrimonioCents,
      contasAPagarPendentesCents,
    };
  }

  /**
   * Valida se o produtor possui saldo disponível suficiente para uma operação.
   */
  async verificarElegibilidadeRepasse(
    tenantId: string,
    produtorId: string,
    valorCents: number,
  ): Promise<{ elegivel: boolean; motivo?: string; saldoDisponivelCents: number }> {
    const saldos = await this.financeiroService.obterSaldosContaGrafica(
      tenantId,
      produtorId,
    );

    if (saldos.disponivelCents < valorCents) {
      return {
        elegivel: false,
        motivo: `Saldo disponível insuficiente (Disponível: R$ ${(saldos.disponivelCents / 100).toFixed(2)})`,
        saldoDisponivelCents: saldos.disponivelCents,
      };
    }

    return {
      elegivel: true,
      saldoDisponivelCents: saldos.disponivelCents,
    };
  }

  /**
   * Consulta o status de um repasse específico.
   */
  async consultarStatusRepasse(
    tenantId: string,
    repasseId: string,
  ): Promise<RepassePublicDto | null> {
    const repasse = await this.prisma.solicitacaoRepasse.findUnique({
      where: { id: repasseId },
    });

    if (!repasse || repasse.tenantId !== tenantId) {
      return null;
    }

    return {
      repasseId: repasse.id,
      produtorId: repasse.produtorId,
      eventoId: repasse.eventoId,
      valorCents: decimalToCents(repasse.valor),
      valorLiquidoCents: decimalToCents(repasse.valorLiquido),
      chavePix: repasse.chavePix,
      status: repasse.status,
      dataProgramada: repasse.dataProgramada.toISOString(),
      solicitadoEm: repasse.solicitadoEm.toISOString(),
      liquidadoEm: repasse.liquidadoEm?.toISOString() ?? null,
    };
  }

  /**
   * Porta de validação usada pelo Checklist de Readiness / Go-Live do evento.
   */
  async verificarReadinessFinanceiro(
    tenantId: string,
    produtorId: string,
    eventoId: string,
  ): Promise<ReadinessFinanceiroDto> {
    const pendencias: string[] = [];

    // 1. Verifica se o produtor possui chave Pix / conta bancária cadastrada
    const repasseRecente = await this.prisma.solicitacaoRepasse.findFirst({
      where: { tenantId, produtorId },
      orderBy: { solicitadoEm: 'desc' },
      select: { chavePix: true },
    });

    if (!repasseRecente?.chavePix) {
      pendencias.push('Conta bancária / Chave Pix de repasse ainda não informada pelo produtor');
    }

    // 2. Verifica se há divergências abertas não resolvidas para este evento
    const divergenciasAbertas = await this.prisma.divergenciaConciliacao.count({
      where: {
        tenantId,
        produtorId,
        resolvida: false,
      },
    });

    if (divergenciasAbertas > 0) {
      pendencias.push(`Existem ${divergenciasAbertas} divergências de conciliação pendentes de resolução`);
    }

    return {
      pronto: pendencias.length === 0,
      pendencias,
    };
  }

  /**
   * Consulta pública de lançamentos do Ledger Financeiro para fins de conciliação contábil (EDDIE 11.21).
   * Segue estritamente a Regra 1 de isolamento de schemas.
   */
  async obterExtratoLedgerParaContabilidade(
    tenantId: string,
    produtorId?: string,
    query?: {
      eventoId?: string;
      limit?: number;
      offset?: number;
    },
  ) {
    if (produtorId) {
      return this.financeiroService.obterExtrato(tenantId, produtorId, query);
    }
    const where: any = { tenantId };
    if (query?.eventoId) where.eventoId = query.eventoId;
    const [total, itens] = await Promise.all([
      this.prisma.lancamentoLedger.count({ where }),
      this.prisma.lancamentoLedger.findMany({
        where,
        orderBy: { criadoEm: 'desc' },
        take: query?.limit ?? 100,
        skip: query?.offset ?? 0,
      }),
    ]);
    return {
      total,
      itens: itens.map((l) => ({
        id: l.id,
        origem: l.origem,
        referenciaId: l.referenciaId,
        bucket: l.bucket,
        tipo: l.tipo,
        valorCents: decimalToCents(l.valor),
        eventoId: l.eventoId,
        produtorId: l.produtorId,
        criadoEm: l.criadoEm.toISOString(),
      })),
    };
  }
}


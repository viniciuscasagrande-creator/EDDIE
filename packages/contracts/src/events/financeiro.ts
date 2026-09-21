import { z } from 'zod';
import { defineEvent } from '../shared/envelope.js';
import { Money } from '../shared/money.js';

export const BucketContaGrafica = z.enum([
  'disponivel',
  'bloqueado',
  'reservado_estorno',
  'retido',
]);

export const TipoOperacaoLedger = z.enum(['entrada', 'saida']);

export const OrigemOperacaoLedger = z.enum([
  'pedido_pago',
  'taxa_plataforma',
  'estorno_pedido',
  'reserva_chargeback',
  'desbloqueio_evento',
  'repasse_produtor',
  'antecipacao_recebivel',
  'transferencia_inter_evento',
  'pagamento_fornecedor',
  'ajuste_conciliacao',
]);

/**
 * Publicado a cada novo lançamento no Ledger (partidas dobradas append-only).
 */
export const LancamentoLedgerCriado = defineEvent(
  'financeiro.lancamento_ledger_criado.v1',
  z.object({
    lancamentoId: z.string().uuid(),
    produtorId: z.string().uuid(),
    eventoId: z.string().uuid().nullable(),
    bucket: BucketContaGrafica,
    tipo: TipoOperacaoLedger,
    origem: OrigemOperacaoLedger,
    valor: Money,
    saldoDerivadoBucket: Money,
    referenciaId: z.string(),
    contrapartidaId: z.string().uuid().nullable(),
    historico: z.string(),
    criadoEm: z.string().datetime(),
  }),
);

export const TransferenciaInterEventoRealizada = defineEvent(
  'financeiro.transferencia_inter_evento.v1',
  z.object({
    transferenciaId: z.string().uuid(),
    produtorId: z.string().uuid(),
    eventoOrigemId: z.string().uuid(),
    eventoDestinoId: z.string().uuid(),
    valor: Money,
    justificativa: z.string(),
    lancamentoDebitoId: z.string().uuid(),
    lancamentoCreditoId: z.string().uuid(),
    executadaEm: z.string().datetime(),
  }),
);

export const RepasseSolicitado = defineEvent(
  'financeiro.repasse_solicitado.v1',
  z.object({
    repasseId: z.string().uuid(),
    produtorId: z.string().uuid(),
    eventoId: z.string().uuid().nullable(),
    valor: Money,
    chavePix: z.string(),
    dataProgramada: z.string().datetime(),
  }),
);

export const RepasseLiquidado = defineEvent(
  'financeiro.repasse_liquidado.v1',
  z.object({
    repasseId: z.string().uuid(),
    produtorId: z.string().uuid(),
    valor: Money,
    taxaRetida: Money,
    comprovanteId: z.string(),
    liquidadoEm: z.string().datetime(),
  }),
);

export const AntecipacaoSolicitada = defineEvent(
  'financeiro.antecipacao_solicitada.v1',
  z.object({
    antecipacaoId: z.string().uuid(),
    produtorId: z.string().uuid(),
    eventoId: z.string().uuid(),
    valorBruto: Money,
    taxaDesagioPercentual: z.number().positive(),
    custoDesagio: Money,
    valorLiquido: Money,
    diasAntecipados: z.number().int().positive(),
    solicitadoEm: z.string().datetime(),
  }),
);

export const AntecipacaoLiquidada = defineEvent(
  'financeiro.antecipacao_liquidada.v1',
  z.object({
    antecipacaoId: z.string().uuid(),
    produtorId: z.string().uuid(),
    valorLiquidoPago: Money,
    comprovanteId: z.string(),
    liquidadoEm: z.string().datetime(),
  }),
);

export const DivergenciaDetectada = defineEvent(
  'financeiro.divergencia_detectada.v1',
  z.object({
    divergenciaId: z.string().uuid(),
    produtorId: z.string().uuid(),
    adquirente: z.string(),
    transacaoId: z.string(),
    tipo: z.string(),
    valorEsperado: Money,
    valorRecebido: Money,
    diferenca: Money,
    detectadaEm: z.string().datetime(),
  }),
);

import { z } from 'zod';
import { defineEvent } from '../envelope.js';

export const BancoCodigoSchema = z.enum([
  '001', // Banco do Brasil
  '033', // Santander
  '237', // Bradesco
  '260', // Nu Pagamentos / Nubank
  '341', // Itaú Unibanco
]);
export type BancoCodigo = z.infer<typeof BancoCodigoSchema>;

export const LayoutCnabSchema = z.enum(['CNAB_240', 'CNAB_400']);
export type LayoutCnab = z.infer<typeof LayoutCnabSchema>;

export const StatusRemessaCnabSchema = z.enum([
  'GERADA',
  'ENVIADA',
  'PROCESSADA_PARCIAL',
  'PROCESSADA_TOTAL',
  'REJEITADA',
]);
export type StatusRemessaCnab = z.infer<typeof StatusRemessaCnabSchema>;

export const StatusItemCnabSchema = z.enum([
  'PENDENTE',
  'LIQUIDADO',
  'REJEITADO',
  'AGENDADO',
]);
export type StatusItemCnab = z.infer<typeof StatusItemCnabSchema>;

export const TipoChavePixSchema = z.enum(['CPF', 'CNPJ', 'EMAIL', 'TELEFONE', 'ALEATORIA']);
export type TipoChavePix = z.infer<typeof TipoChavePixSchema>;

export const StatusPixPayoutSchema = z.enum([
  'PENDENTE',
  'PROCESSANDO',
  'LIQUIDADO',
  'FALHADO',
  'DEVOLVIDO',
  'SITUACAO_DESCONHECIDA',
]);
export type StatusPixPayout = z.infer<typeof StatusPixPayoutSchema>;

// ============================================================================
//  EDDIE 11.36 — Enums & Tipos Estruturados de Tesouraria
// ============================================================================

export const TipoOrdemPagamentoSchema = z.enum([
  'REPASSE',
  'ANTECIPACAO',
  'FORNECEDOR',
  'TRIBUTO',
  'REEMBOLSO',
  'TARIFA',
  'OUTRO',
]);
export type TipoOrdemPagamento = z.infer<typeof TipoOrdemPagamentoSchema>;

export const StatusOrdemPagamentoSchema = z.enum([
  'CRIADO',
  'VALIDADO',
  'APROVADO',
  'PROGRAMADO',
  'ENVIADO',
  'PROCESSANDO',
  'LIQUIDADO',
  'CONCILIADO',
  'REJEITADO',
  'CANCELADO',
  'EXPIRADO',
  'SITUACAO_DESCONHECIDA',
]);
export type StatusOrdemPagamento = z.infer<typeof StatusOrdemPagamentoSchema>;

export const MetodoOrdemPagamentoSchema = z.enum([
  'PIX',
  'TED',
  'CNAB_240',
  'CNAB_400',
]);
export type MetodoOrdemPagamento = z.infer<typeof MetodoOrdemPagamentoSchema>;

export const NivelConciliacaoSchema = z.enum([
  'NIVEL_1_OPERACIONAL',      // Pedido ↔ Pagamento / Operação ↔ Ordem
  'NIVEL_2_BANCO_LIQUIDACAO',  // Pagamento ↔ Liquidação Adquirente / Ordem ↔ Débito no Extrato
  'NIVEL_3_BANCO_LEDGER',      // Extrato Bancário ↔ Ledger
]);
export type NivelConciliacao = z.infer<typeof NivelConciliacaoSchema>;

export const StatusConciliacaoRegistroSchema = z.enum([
  'CONCILIADO_AUTOMATICO',
  'REQUER_ANALISE',
  'DIVERGENCIA',
  'IGNORADO',
]);
export type StatusConciliacaoRegistro = z.infer<typeof StatusConciliacaoRegistroSchema>;

export const CenarioProjecaoCaixaSchema = z.enum([
  'BASE',
  'CONSERVADOR',
  'ESTRESSE',
]);
export type CenarioProjecaoCaixa = z.infer<typeof CenarioProjecaoCaixaSchema>;

export const TipoTransferenciaSchema = z.enum([
  'BANCARIA_FISICA',
  'INTERNA_LEDGER',
]);
export type TipoTransferencia = z.infer<typeof TipoTransferenciaSchema>;

export const TipoFechamentoCaixaSchema = z.enum([
  'DIARIO',
  'MENSAL',
]);
export type TipoFechamentoCaixa = z.infer<typeof TipoFechamentoCaixaSchema>;

// ============================================================================
//  Legacy Event Schemas (EDDIE 11.25)
// ============================================================================

export const RemessaCnabGeradaEventSchema = z.object({
  eventId: z.string().uuid(),
  loteId: z.string().min(1),
  bancoCodigo: BancoCodigoSchema,
  layout: LayoutCnabSchema,
  totalItens: z.number().int().positive(),
  valorTotalCentavos: z.number().int().positive(),
  sequencialArquivo: z.number().int().positive(),
  sha256Hash: z.string().length(64),
  criadoPor: z.string().min(1),
  dataHora: z.string().datetime(),
});
export type RemessaCnabGeradaEvent = z.infer<typeof RemessaCnabGeradaEventSchema>;

export const RetornoCnabProcessadoEventSchema = z.object({
  eventId: z.string().uuid(),
  retornoId: z.string().min(1),
  loteRemessaId: z.string().min(1),
  bancoCodigo: BancoCodigoSchema,
  totalProcessados: z.number().int().nonnegative(),
  totalLiquidados: z.number().int().nonnegative(),
  totalRejeitados: z.number().int().nonnegative(),
  valorLiquidadoCentavos: z.number().int().nonnegative(),
  divergenciasDetectadas: z.number().int().nonnegative(),
  sha256Hash: z.string().length(64),
  dataHora: z.string().datetime(),
});
export type RetornoCnabProcessadoEvent = z.infer<typeof RetornoCnabProcessadoEventSchema>;

export const PixPayoutExecutadoEventSchema = z.object({
  eventId: z.string().uuid(),
  payoutId: z.string().min(1),
  produtorId: z.string().min(1),
  eventoId: z.string().min(1),
  valorCentavos: z.number().int().positive(),
  chavePix: z.string().min(1),
  tipoChave: TipoChavePixSchema,
  e2eId: z.string().min(10),
  idempotencyKey: z.string().min(1),
  status: StatusPixPayoutSchema,
  dataHora: z.string().datetime(),
});
export type PixPayoutExecutadoEvent = z.infer<typeof PixPayoutExecutadoEventSchema>;

export const ExtratoBancarioConciliadoEventSchema = z.object({
  eventId: z.string().uuid(),
  conciliacaoId: z.string().min(1),
  contaBancariaId: z.string().min(1),
  bancoCodigo: BancoCodigoSchema,
  dataExtrato: z.string(),
  totalLancamentos: z.number().int().nonnegative(),
  saldoInicialCentavos: z.number().int(),
  saldoFinalCentavos: z.number().int(),
  divergenciasCentavos: z.number().int(),
  conciliadoPor: z.string().min(1),
  dataHora: z.string().datetime(),
});
export type ExtratoBancarioConciliadoEvent = z.infer<typeof ExtratoBancarioConciliadoEventSchema>;

// ============================================================================
//  Novos Eventos de Domínio EDDIE 11.36 (Envelope Pattern)
// ============================================================================

export const OrdemPagamentoCriadaPayloadSchema = z.object({
  ordemId: z.string().uuid(),
  codigo: z.string(),
  tipo: TipoOrdemPagamentoSchema,
  beneficiarioNome: z.string(),
  beneficiarioCpfCnpj: z.string(),
  valorCentavos: z.number().int().positive(),
  metodo: MetodoOrdemPagamentoSchema,
  documentoId: z.string().optional(),
  operacaoOrigem: z.string().optional(),
  operacaoOrigemId: z.string().optional(),
  dataVencimento: z.string(),
  solicitadoPor: z.string(),
  idempotencyKey: z.string(),
  criadoEm: z.string().datetime(),
});
export type OrdemPagamentoCriadaPayload = z.infer<typeof OrdemPagamentoCriadaPayloadSchema>;

export const OrdemPagamentoLiquidadaPayloadSchema = z.object({
  ordemId: z.string().uuid(),
  codigo: z.string(),
  tipo: TipoOrdemPagamentoSchema,
  valorCentavos: z.number().int().positive(),
  metodo: MetodoOrdemPagamentoSchema,
  contaBancariaId: z.string().uuid(),
  bancoCodigo: BancoCodigoSchema,
  endToEndId: z.string().optional(),
  autenticacaoBancaria: z.string(),
  liquidadoEm: z.string().datetime(),
  executadoPor: z.string(),
});
export type OrdemPagamentoLiquidadaPayload = z.infer<typeof OrdemPagamentoLiquidadaPayloadSchema>;

export const PagamentoPixDesconhecidoPayloadSchema = z.object({
  ordemId: z.string().uuid(),
  codigo: z.string(),
  valorCentavos: z.number().int().positive(),
  chavePix: z.string(),
  endToEndId: z.string().optional(),
  motivo: z.string(),
  detectadoEm: z.string().datetime(),
  tentativasConsulta: z.number().int().nonnegative(),
});
export type PagamentoPixDesconhecidoPayload = z.infer<typeof PagamentoPixDesconhecidoPayloadSchema>;

export const ConciliacaoBancariaRealizadaPayloadSchema = z.object({
  conciliacaoId: z.string().uuid(),
  contaBancariaId: z.string().uuid(),
  nivel: NivelConciliacaoSchema,
  status: StatusConciliacaoRegistroSchema,
  totalItensConciliados: z.number().int().nonnegative(),
  totalDivergenciasCentavos: z.number().int(),
  conciliadoPor: z.string(),
  dataHora: z.string().datetime(),
});
export type ConciliacaoBancariaRealizadaPayload = z.infer<typeof ConciliacaoBancariaRealizadaPayloadSchema>;

export const DivergenciaMdrDetectadaPayloadSchema = z.object({
  recebivelId: z.string().uuid(),
  adquirente: z.string(),
  bandeira: z.string(),
  nsu: z.string(),
  mdrTaxaEsperadaPercent: z.number(),
  mdrTaxaCobradaPercent: z.number(),
  divergenciaCentavos: z.number().int(),
  valorBrutoCentavos: z.number().int(),
  detectadoEm: z.string().datetime(),
});
export type DivergenciaMdrDetectadaPayload = z.infer<typeof DivergenciaMdrDetectadaPayloadSchema>;

export const TransferenciaExecutadaPayloadSchema = z.object({
  transferenciaId: z.string().uuid(),
  codigo: z.string(),
  tipo: TipoTransferenciaSchema,
  origemId: z.string(),
  destinoId: z.string(),
  valorCentavos: z.number().int().positive(),
  executadoPor: z.string(),
  executadoEm: z.string().datetime(),
});
export type TransferenciaExecutadaPayload = z.infer<typeof TransferenciaExecutadaPayloadSchema>;

export const FechamentoTesourariaConcluidoPayloadSchema = z.object({
  fechamentoId: z.string().uuid(),
  codigo: z.string(),
  tipo: TipoFechamentoCaixaSchema,
  dataReferencia: z.string(),
  saldoBancarioTotalCentavos: z.number().int(),
  saldoConciliadoTotalCentavos: z.number().int(),
  pendenciasQtd: z.number().int().nonnegative(),
  pendenciasJustificadasQtd: z.number().int().nonnegative(),
  fechadoPor: z.string(),
  fechadoEm: z.string().datetime(),
});
export type FechamentoTesourariaConcluidoPayload = z.infer<typeof FechamentoTesourariaConcluidoPayloadSchema>;

// Event definitions
export const OrdemPagamentoCriadaV1 = defineEvent(
  'tesouraria.ordem_pagamento.criada.v1',
  OrdemPagamentoCriadaPayloadSchema,
);

export const OrdemPagamentoLiquidadaV1 = defineEvent(
  'tesouraria.ordem_pagamento.liquidada.v1',
  OrdemPagamentoLiquidadaPayloadSchema,
);

export const PagamentoPixDesconhecidoV1 = defineEvent(
  'tesouraria.pix.situacao_desconhecida.v1',
  PagamentoPixDesconhecidoPayloadSchema,
);

export const ConciliacaoBancariaRealizadaV1 = defineEvent(
  'tesouraria.conciliacao.realizada.v1',
  ConciliacaoBancariaRealizadaPayloadSchema,
);

export const DivergenciaMdrDetectadaV1 = defineEvent(
  'tesouraria.mdr.divergencia_detectada.v1',
  DivergenciaMdrDetectadaPayloadSchema,
);

export const TransferenciaExecutadaV1 = defineEvent(
  'tesouraria.transferencia.executada.v1',
  TransferenciaExecutadaPayloadSchema,
);

export const FechamentoTesourariaConcluidoV1 = defineEvent(
  'tesouraria.fechamento.concluido.v1',
  FechamentoTesourariaConcluidoPayloadSchema,
);

import { z } from 'zod';

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
]);
export type StatusPixPayout = z.infer<typeof StatusPixPayoutSchema>;

// Evento 1: Remessa CNAB Gerada
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

// Evento 2: Retorno CNAB Processado
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

// Evento 3: Payout PIX Instantâneo
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

// Evento 4: Extrato Bancário Sincronizado e Conciliado
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

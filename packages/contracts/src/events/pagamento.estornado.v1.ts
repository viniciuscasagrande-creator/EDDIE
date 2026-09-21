import { z } from 'zod';
import { DomainEventEnvelopeSchema } from '../envelope.js';

export const PagamentoEstornadoPayloadSchema = z.object({
  estornoId: z.string().uuid(),
  pedidoId: z.string().uuid(),
  transacaoOriginalId: z.string(),
  motivo: z.enum([
    'ARREPENDIMENTO_7_DIAS',
    'EVENTO_CANCELADO',
    'EVENTO_ADIADO',
    'CHARGEBACK_CONTESTACAO',
    'FALHA_OPERACIONAL',
    'ACORDO_SAC',
  ]),
  tipoEstorno: z.enum(['TOTAL', 'PARCIAL']),
  valorEstornadoCents: z.number().int().positive(),
  retemTaxaConveniencia: z.boolean(),
  ingressosCanceladosIds: z.array(z.string().uuid()),
  solicitadoPor: z.string(),
  evidenciasUrl: z.array(z.string().url()).optional(),
  observacoes: z.string().optional(),
});

export const PagamentoEstornadoV1Schema = DomainEventEnvelopeSchema(
  PagamentoEstornadoPayloadSchema,
).extend({
  eventType: z.literal('pagamento.estornado.v1'),
});

export type PagamentoEstornadoPayload = z.infer<typeof PagamentoEstornadoPayloadSchema>;
export type PagamentoEstornadoV1Event = z.infer<typeof PagamentoEstornadoV1Schema>;

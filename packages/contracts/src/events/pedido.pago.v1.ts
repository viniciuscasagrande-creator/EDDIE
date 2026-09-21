import { z } from 'zod';
import { DomainEventEnvelopeSchema } from '../envelope.js';

export const PedidoPagoItemSchema = z.object({
  ingressoId: z.string().uuid(),
  loteId: z.string().uuid(),
  sessaoId: z.string().uuid(),
  eventoId: z.string().uuid(),
  assento: z.string().nullable().optional(),
  precoCents: z.number().int().nonnegative(),
  taxaConvenienciaCents: z.number().int().nonnegative(),
});

export const PedidoPagoPayloadSchema = z.object({
  pedidoId: z.string().uuid(),
  compradorId: z.string().uuid(),
  compradorEmail: z.string().email(),
  compradorNome: z.string(),
  metodoPagamento: z.enum(['PIX', 'CREDIT_CARD', 'BOLETO']),
  transacaoId: z.string(),
  valorTotalCents: z.number().int().positive(),
  valorIngressosCents: z.number().int().positive(),
  valorTaxasCents: z.number().int().nonnegative(),
  splitProdutorCents: z.number().int().positive(),
  splitPlataformaCents: z.number().int().nonnegative(),
  itens: z.array(PedidoPagoItemSchema).min(1),
  metadata: z.record(z.unknown()).optional(),
});

export const PedidoPagoV1Schema = DomainEventEnvelopeSchema(PedidoPagoPayloadSchema).extend({
  eventType: z.literal('pedido.pago.v1'),
});

export type PedidoPagoItem = z.infer<typeof PedidoPagoItemSchema>;
export type PedidoPagoPayload = z.infer<typeof PedidoPagoPayloadSchema>;
export type PedidoPagoV1Event = z.infer<typeof PedidoPagoV1Schema>;

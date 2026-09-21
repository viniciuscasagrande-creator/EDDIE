import { z } from 'zod';
import { defineEvent } from '../envelope';

export const ItemReservaSchema = z.object({
  loteId: z.string().uuid(),
  assentoId: z.string().uuid().optional(),
  quantidade: z.number().int().positive(),
  precoUnitarioCents: z.number().int().nonnegative(),
  taxaConvenienciaCents: z.number().int().nonnegative(),
});

export const ReservaCriadaPayloadSchema = z.object({
  reservaId: z.string().uuid(),
  compradorId: z.string().uuid(),
  eventoId: z.string().uuid(),
  sessaoId: z.string().uuid(),
  itens: z.array(ItemReservaSchema).min(1),
  expiraEm: z.string().datetime(),
  ttlSegundos: z.number().int().positive(),
  criadoEm: z.string().datetime(),
});

export const ReservaExpiradaPayloadSchema = z.object({
  reservaId: z.string().uuid(),
  eventoId: z.string().uuid(),
  motivo: z.enum(['TTL_EXPIRADO', 'CANCELAMENTO_MANUAL', 'PAGAMENTO_EXPIRADO']),
  itensLiberados: z.array(
    z.object({
      loteId: z.string().uuid(),
      assentoId: z.string().uuid().optional(),
      quantidade: z.number().int().positive(),
    }),
  ),
  expiradoEm: z.string().datetime(),
});

export const CarrinhoFinalizadoPayloadSchema = z.object({
  carrinhoId: z.string().uuid(),
  reservaId: z.string().uuid(),
  compradorId: z.string().uuid(),
  eventoId: z.string().uuid(),
  subtotalCents: z.number().int().positive(),
  taxaConvenienciaCents: z.number().int().nonnegative(),
  descontoCents: z.number().int().nonnegative().default(0),
  totalCents: z.number().int().positive(),
  cupomCodigo: z.string().optional(),
  itens: z.array(ItemReservaSchema).min(1),
  finalizadoEm: z.string().datetime(),
});

export const ReservaCriadaV1 = defineEvent('reserva.criada.v1', ReservaCriadaPayloadSchema);
export const ReservaExpiradaV1 = defineEvent('reserva.expirada.v1', ReservaExpiradaPayloadSchema);
export const CarrinhoFinalizadoV1 = defineEvent('carrinho.finalizado.v1', CarrinhoFinalizadoPayloadSchema);

export type ItemReserva = z.infer<typeof ItemReservaSchema>;
export type ReservaCriadaPayload = z.infer<typeof ReservaCriadaPayloadSchema>;
export type ReservaExpiradaPayload = z.infer<typeof ReservaExpiradaPayloadSchema>;
export type CarrinhoFinalizadoPayload = z.infer<typeof CarrinhoFinalizadoPayloadSchema>;

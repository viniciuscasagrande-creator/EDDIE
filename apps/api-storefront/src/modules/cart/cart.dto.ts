import { z } from 'zod';

export const ItemReservaInputSchema = z.object({
  loteId: z.string().uuid(),
  assentoId: z.string().uuid().optional(),
  quantidade: z.number().int().positive().max(6, 'Limite máximo de 6 ingressos por compra'),
});

export const CriarReservaSchema = z.object({
  eventoId: z.string().uuid(),
  sessaoId: z.string().uuid(),
  compradorSessionId: z.string().min(10),
  itens: z.array(ItemReservaInputSchema).min(1),
});

export const AplicarCupomSchema = z.object({
  reservaId: z.string().uuid(),
  cupomCodigo: z.string().min(2).max(30),
});

export type CriarReservaInput = z.infer<typeof CriarReservaSchema>;
export type AplicarCupomInput = z.infer<typeof AplicarCupomSchema>;

export interface ItemReservaDto {
  loteId: string;
  loteNome: string;
  assentoId?: string;
  assentoDescricao?: string;
  quantidade: number;
  precoUnitarioCents: number;
  taxaUnitáriaCents: number;
  subtotalCents: number;
}

export interface ReservaCriadaDto {
  reservaId: string;
  expiraEm: string;
  ttlSegundos: number;
  subtotalCents: number;
  taxaConvenienciaCents: number;
  descontoCents: number;
  totalCents: number;
  itens: ItemReservaDto[];
}

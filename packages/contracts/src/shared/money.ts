import { z } from 'zod';

/**
 * Dinheiro trafega SEMPRE como inteiro em centavos + moeda.
 * Nunca use float. No banco, use Decimal(14,2).
 */
export const Money = z.object({
  amount: z.number().int(),           // centavos. Pode ser negativo (estorno/crédito).
  currency: z.literal('BRL').default('BRL'),
});
export type Money = z.infer<typeof Money>;

export const brl = (amount: number): Money => ({ amount, currency: 'BRL' });

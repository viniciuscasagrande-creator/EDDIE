import { z } from 'zod';

export const MotivoEstornoEnum = z.enum([
  'ARREPENDIMENTO_CDC_7_DIAS',
  'EVENTO_CANCELADO',
  'EVENTO_ADIADO',
  'CHARGEBACK',
  'ACORDO_SAC',
]);

export const SolicitarEstornoSchema = z.object({
  pedidoId: z.string().uuid(),
  compradorId: z.string().uuid(),
  eventoId: z.string().uuid(),
  motivo: MotivoEstornoEnum,
  tipo: z.enum(['TOTAL', 'PARCIAL']).default('TOTAL'),
  valorTotalCents: z.number().int().positive(),
  retemTaxaConveniencia: z.boolean().default(false),
  ingressosIds: z.array(z.string().uuid()).min(1),
  dataCompra: z.string().datetime(),
  dataInicioEvento: z.string().datetime(),
});

export const DecidirEstornoSchema = z.object({
  estornoId: z.string().uuid(),
  acao: z.enum(['APROVAR', 'NEGAR']),
  analisadoPor: z.string().min(2),
  justificativa: z.string().optional(),
});

export type SolicitarEstornoInput = z.infer<typeof SolicitarEstornoSchema>;
export type DecidirEstornoInput = z.infer<typeof DecidirEstornoSchema>;

export interface EstornoPublicDto {
  id: string;
  pedidoId: string;
  status: string;
  motivo: string;
  valorTotalCents: number;
  solicitadoEm: Date;
  concluidoEm?: Date | null;
}

import { z } from 'zod';
import { DomainEventEnvelopeSchema } from '../envelope';

export const SlaVioladoPayloadSchema = z.object({
  ticketId: z.string().uuid(),
  prioridade: z.enum(['P1_CRITICO', 'P2_ALTO', 'P3_MEDIO', 'P4_BAIXO']),
  tipoItil: z.enum(['INCIDENTE', 'REQUISICAO', 'PROBLEMA', 'MUDANCA']),
  tempoDecorridoMinutos: z.number().int().positive(),
  tempoLimiteMinutos: z.number().int().positive(),
  atendenteResponsavelId: z.string().nullable().optional(),
  clienteId: z.string().uuid(),
  escalonadoPara: z.string(),
  motivoGargalo: z.string().optional(),
});

export const SlaVioladoV1Schema = DomainEventEnvelopeSchema(SlaVioladoPayloadSchema).extend({
  eventType: z.literal('sla.violado.v1'),
});

export type SlaVioladoPayload = z.infer<typeof SlaVioladoPayloadSchema>;
export type SlaVioladoV1Event = z.infer<typeof SlaVioladoV1Schema>;

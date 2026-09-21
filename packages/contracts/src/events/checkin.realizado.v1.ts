import { z } from 'zod';
import { DomainEventEnvelopeSchema } from '../envelope';

export const CheckinRealizadoPayloadSchema = z.object({
  checkinId: z.string().uuid(),
  ingressoId: z.string().uuid(),
  eventoId: z.string().uuid(),
  sessaoId: z.string().uuid(),
  portaoAcesso: z.string(),
  operadorId: z.string().optional(),
  dispositivoCatracaId: z.string(),
  validadoOffline: z.boolean(),
  horarioLeitura: z.string().datetime(),
});

export const CheckinRealizadoV1Schema = DomainEventEnvelopeSchema(
  CheckinRealizadoPayloadSchema,
).extend({
  eventType: z.literal('checkin.realizado.v1'),
});

export type CheckinRealizadoPayload = z.infer<typeof CheckinRealizadoPayloadSchema>;
export type CheckinRealizadoV1Event = z.infer<typeof CheckinRealizadoV1Schema>;

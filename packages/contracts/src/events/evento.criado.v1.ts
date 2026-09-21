import { z } from 'zod';
import { DomainEventEnvelopeSchema } from '../envelope.js';

export const EventoCriadoPayloadSchema = z.object({
  eventoId: z.string().uuid(),
  produtorId: z.string().uuid(),
  titulo: z.string().min(1),
  slug: z.string().min(1),
  categoria: z.string(),
  localNome: z.string(),
  cidade: z.string(),
  estado: z.string().length(2),
  capacidadeTotal: z.number().int().positive(),
  dataInicioPrimeiraSessao: z.string().datetime(),
});

export const EventoCriadoV1Schema = DomainEventEnvelopeSchema(EventoCriadoPayloadSchema).extend({
  eventType: z.literal('evento.criado.v1'),
});

export type EventoCriadoPayload = z.infer<typeof EventoCriadoPayloadSchema>;
export type EventoCriadoV1Event = z.infer<typeof EventoCriadoV1Schema>;

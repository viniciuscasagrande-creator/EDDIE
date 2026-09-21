import { z } from 'zod';

/**
 * Envelope padrão de TODO evento de domínio.
 * Vale para qualquer módulo. Nunca publique um payload "cru" no bus.
 */
export const EventEnvelope = z.object({
  /** UUID v7. Usado pelos consumers para idempotência. */
  eventId: z.string().uuid(),
  /** Nome versionado. Ex.: 'pedido.pago.v1' */
  eventName: z.string().regex(/^[a-z]+(\.[a-z_]+)+\.v\d+$/),
  /** Módulo que publicou. Ex.: 'pagamentos' */
  source: z.string(),
  occurredAt: z.string().datetime(),
  /** Amarra a cadeia inteira (mesmo trace/pedido). */
  correlationId: z.string().uuid(),
  /** eventId do evento que causou este. Null se originado por ação humana/API. */
  causationId: z.string().uuid().nullable().default(null),
  /** Quem disparou: usuário, sistema ou integração. */
  actor: z.object({
    type: z.enum(['user', 'system', 'integration']),
    id: z.string().nullable().default(null),
  }),
  /** Multi-tenant: produtora/organização dona do dado. */
  tenantId: z.string().uuid(),
  payload: z.unknown(),
});
export type EventEnvelope<T = unknown> = Omit<
  z.infer<typeof EventEnvelope>,
  'payload'
> & { payload: T };

/** Helper para declarar um evento tipado. */
export function defineEvent<N extends string, S extends z.ZodTypeAny>(
  name: N,
  payload: S,
) {
  return {
    name,
    payload,
    routingKey: name,
    parse: (data: unknown) => payload.parse(data),
    envelope: EventEnvelope.extend({
      eventName: z.literal(name),
      payload,
    }),
  } as const;
}

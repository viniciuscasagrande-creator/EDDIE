import { z } from 'zod';

export const EventMetadataSchema = z.object({
  eventId: z.string().uuid(),
  eventType: z.string(),
  occurredAt: z.string().datetime(),
  producer: z.string(),
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),
  tenantId: z.string().uuid().optional(),
  traceId: z.string().optional(),
});

export type EventMetadata = z.infer<typeof EventMetadataSchema>;

export interface DomainEvent<TName extends string, TPayload> {
  name: TName;
  schema: z.ZodType<TPayload>;
  create(params: {
    payload: TPayload;
    producer: string;
    correlationId: string;
    causationId?: string;
    tenantId?: string;
    traceId?: string;
  }): EventEnvelope<TPayload> & { eventType: TName };
}

export type EventEnvelope<T> = EventMetadata & {
  payload: T;
};

/**
 * Função utilitária padronizada para definir eventos de domínio versionados com Zod.
 */
export function defineEvent<TName extends string, TSchema extends z.ZodTypeAny>(
  name: TName,
  payloadSchema: TSchema,
): DomainEvent<TName, z.infer<TSchema>> {
  const envelopeSchema = EventMetadataSchema.extend({
    eventType: z.literal(name),
    payload: payloadSchema,
  });

  return {
    name,
    schema: payloadSchema,
    create({ payload, producer, correlationId, causationId, tenantId, traceId }) {
      const event = {
        eventId: crypto.randomUUID(),
        eventType: name,
        occurredAt: new Date().toISOString(),
        producer,
        correlationId,
        causationId,
        tenantId,
        traceId,
        payload,
      };

      // Validação estrita em tempo de execução
      return envelopeSchema.parse(event) as EventEnvelope<z.infer<TSchema>> & {
        eventType: TName;
      };
    },
  };
}

export function DomainEventEnvelopeSchema<T extends z.ZodTypeAny>(payloadSchema: T) {
  return EventMetadataSchema.extend({
    payload: payloadSchema,
  });
}


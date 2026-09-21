import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.module';

export interface EmitOptions {
  eventName: string;
  source: string;
  tenantId: string;
  payload: unknown;
  correlationId?: string;
  causationId?: string | null;
  actor?: { type: 'user' | 'system' | 'integration'; id: string | null };
}

/**
 * Transactional Outbox.
 *
 * Uso correto — o evento é gravado na MESMA transação do dado:
 *
 *   await this.prisma.$transaction(async (tx) => {
 *     const evento = await tx.evento.update({ ... });
 *     await this.outbox.emit(tx, {
 *       eventName: EventosEvents.EventoPublicado.name,
 *       source: 'eventos',
 *       tenantId,
 *       payload: { ... },
 *     });
 *   });
 *
 * Se a transação der rollback, o evento some junto. Se commitar, o publisher
 * entrega — mais cedo ou mais tarde, mas entrega.
 */
@Injectable()
export class OutboxService {
  constructor(private readonly prisma: PrismaService) {}

  async emit(tx: Prisma.TransactionClient, opts: EmitOptions): Promise<string> {
    const id = randomUUID();
    await tx.outboxMessage.create({
      data: {
        id,
        eventName: opts.eventName,
        source: opts.source,
        tenantId: opts.tenantId,
        correlationId: opts.correlationId ?? randomUUID(),
        causationId: opts.causationId ?? null,
        actorType: opts.actor?.type ?? 'system',
        actorId: opts.actor?.id ?? null,
        payload: opts.payload as Prisma.InputJsonValue,
      },
    });
    return id;
  }

  /** Marca um evento como processado. Retorna false se já tinha sido. */
  async claim(eventId: string, consumer: string): Promise<boolean> {
    try {
      await this.prisma.processedEvent.create({ data: { eventId, consumer } });
      return true;
    } catch {
      return false; // unique violation = já processado
    }
  }
}

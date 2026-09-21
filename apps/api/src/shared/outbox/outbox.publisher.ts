import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { PrismaService } from '../prisma.module';
import { EventBus } from '../bus/event-bus.service';

const BATCH = 100;
const MAX_ATTEMPTS = 10;

/**
 * Único componente autorizado a publicar no bus.
 * Varre a outbox e entrega em ordem de ocorrência.
 */
@Injectable()
export class OutboxPublisher {
  private readonly logger = new Logger(OutboxPublisher.name);
  private running = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly bus: EventBus,
  ) {}

  @Interval(1000)
  async drain(): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      const pending = await this.prisma.outboxMessage.findMany({
        where: { publishedAt: null, attempts: { lt: MAX_ATTEMPTS } },
        orderBy: { occurredAt: 'asc' },
        take: BATCH,
      });

      for (const msg of pending) {
        try {
          await this.bus.publish({
            eventId: msg.id,
            eventName: msg.eventName,
            source: msg.source,
            occurredAt: msg.occurredAt.toISOString(),
            correlationId: msg.correlationId,
            causationId: msg.causationId,
            actor: { type: msg.actorType as 'user' | 'system' | 'integration', id: msg.actorId },
            tenantId: msg.tenantId,
            payload: msg.payload,
          });
          await this.prisma.outboxMessage.update({
            where: { id: msg.id },
            data: { publishedAt: new Date() },
          });
        } catch (err) {
          await this.prisma.outboxMessage.update({
            where: { id: msg.id },
            data: { attempts: { increment: 1 }, lastError: String(err) },
          });
          this.logger.warn(`Falha ao publicar ${msg.eventName} (${msg.id})`);
        }
      }
    } finally {
      this.running = false;
    }
  }
}

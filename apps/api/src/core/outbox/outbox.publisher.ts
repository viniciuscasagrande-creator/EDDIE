import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

export interface OutboxPollingClient {
  outboxEvent: {
    findMany(args: {
      where: { status: 'PENDENTE' };
      take: number;
      orderBy: { createdAt: 'asc' };
    }): Promise<Array<{
      id: string;
      eventType: string;
      payload: unknown;
      retries: number;
    }>>;
    update(args: {
      where: { id: string };
      data: {
        status: 'PENDENTE' | 'PUBLICADO' | 'FALHA';
        processedAt?: Date;
        retries?: { increment: number };
        errorMessage?: string;
      };
    }): Promise<unknown>;
  };
}

@Injectable()
export class OutboxPublisher implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxPublisher.name);
  private intervalRef: NodeJS.Timeout | null = null;
  private isProcessing = false;

  constructor(private readonly rabbitMQService: RabbitMQService) {}

  onModuleInit() {
    // Polling a cada 200ms para publicar eventos pendentes (at-least-once)
    this.intervalRef = setInterval(() => {
      this.publishPendingEvents().catch((err) =>
        this.logger.error('Error during outbox publication cycle', err),
      );
    }, 200);
  }

  async publishPendingEvents(prismaClient?: OutboxPollingClient) {
    if (this.isProcessing || !prismaClient) return;

    this.isProcessing = true;
    try {
      const pendingEvents = await prismaClient.outboxEvent.findMany({
        where: { status: 'PENDENTE' },
        take: 50,
        orderBy: { createdAt: 'asc' },
      });

      for (const event of pendingEvents) {
        try {
          const exchange = 'eddie.domain.events';
          const routingKey = event.eventType;

          const published = await this.rabbitMQService.publish(
            exchange,
            routingKey,
            event.payload,
          );

          if (published) {
            await prismaClient.outboxEvent.update({
              where: { id: event.id },
              data: {
                status: 'PUBLICADO',
                processedAt: new Date(),
              },
            });
            this.logger.debug(`[OutboxPublisher] Published ${event.eventType} (${event.id})`);
          }
        } catch (err: unknown) {
          const error = err as Error;
          this.logger.error(`Failed to publish event ${event.id}: ${error.message}`);
          await prismaClient.outboxEvent.update({
            where: { id: event.id },
            data: {
              status: event.retries >= 5 ? 'FALHA' : 'PENDENTE',
              retries: { increment: 1 },
              errorMessage: error.message,
            },
          });
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  onModuleDestroy() {
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
    }
  }
}

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

export type EventHandler<T = unknown> = (event: T) => Promise<void>;

@Injectable()
export class EventBusService implements OnModuleInit {
  private readonly logger = new Logger(EventBusService.name);
  private handlers = new Map<string, EventHandler[]>();

  constructor(private readonly rabbitMQ: RabbitMQService) {}

  onModuleInit() {
    this.logger.log('EventBus initialized with Dead Letter Queue (DLQ) support');
  }

  /**
   * Registra um handler consumidor para uma chave de roteamento / evento.
   */
  subscribe<T>(eventType: string, handler: EventHandler<T>) {
    const current = this.handlers.get(eventType) || [];
    current.push(handler as EventHandler);
    this.handlers.set(eventType, current);
    this.logger.log(`Subscribed handler to ${eventType}`);
  }

  /**
   * Despacha evento para os handlers registrados (in-process ou via broker)
   */
  async dispatch(eventType: string, event: unknown) {
    const registered = this.handlers.get(eventType) || [];
    for (const handler of registered) {
      try {
        await handler(event);
      } catch (err) {
        this.logger.error(`Handler failed for ${eventType}. Forwarding to DLQ...`, err);
        // Encaminha para Dead Letter Exchange
        await this.rabbitMQ.publish(
          'eddie.domain.dlx',
          `dlq.${eventType}`,
          {
            failedEvent: event,
            error: (err as Error).message,
            timestamp: new Date().toISOString(),
          },
        );
      }
    }
  }
}

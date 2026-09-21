import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import amqp, { type Channel, type ChannelModel } from 'amqplib';
import type { EventEnvelope } from '@ticketing/contracts';

export const EXCHANGE = 'domain.events';
export const DLX = 'domain.events.dlx';

/**
 * Transporte puro. NÃO chame publish() direto de um service de negócio —
 * use o OutboxService. Só o OutboxPublisher tem permissão de publicar aqui.
 */
@Injectable()
export class EventBus implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventBus.name);
  private connection!: ChannelModel;
  private channel!: Channel;

  async onModuleInit(): Promise<void> {
    const url = process.env.RABBITMQ_URL ?? 'amqp://localhost:5672';
    this.connection = await amqp.connect(url);
    this.channel = await this.connection.createChannel();

    await this.channel.assertExchange(EXCHANGE, 'topic', { durable: true });
    await this.channel.assertExchange(DLX, 'topic', { durable: true });
    this.logger.log(`Event bus conectado em ${EXCHANGE}`);
  }

  async publish(envelope: EventEnvelope): Promise<void> {
    const ok = this.channel.publish(
      EXCHANGE,
      envelope.eventName,
      Buffer.from(JSON.stringify(envelope)),
      {
        persistent: true,
        messageId: envelope.eventId,
        correlationId: envelope.correlationId,
        type: envelope.eventName,
        timestamp: Date.now(),
        headers: { 'x-tenant-id': envelope.tenantId, 'x-source': envelope.source },
      },
    );
    if (!ok) await new Promise((r) => this.channel.once('drain', r));
  }

  /**
   * Assina um ou mais eventos. Cria fila durável por consumidor + DLQ.
   * O handler DEVE ser idempotente (ver ProcessedEvent).
   */
  async subscribe(
    consumerName: string,
    eventNames: string[],
    handler: (envelope: EventEnvelope) => Promise<void>,
  ): Promise<void> {
    const queue = `${consumerName}.q`;
    const dlq = `${consumerName}.dlq`;

    await this.channel.assertQueue(dlq, { durable: true });
    await this.channel.bindQueue(dlq, DLX, `${consumerName}.#`);
    await this.channel.assertQueue(queue, {
      durable: true,
      deadLetterExchange: DLX,
      deadLetterRoutingKey: `${consumerName}.dead`,
    });
    for (const name of eventNames) await this.channel.bindQueue(queue, EXCHANGE, name);
    await this.channel.prefetch(10);

    await this.channel.consume(queue, (msg) => {
      if (!msg) return;
      void (async () => {
        try {
          await handler(JSON.parse(msg.content.toString()) as EventEnvelope);
          this.channel.ack(msg);
        } catch (err) {
          this.logger.error(`[${consumerName}] falhou: ${String(err)}`);
          // requeue=false -> vai para a DLQ, inspecionável no módulo Developer
          this.channel.nack(msg, false, false);
        }
      })();
    });

    this.logger.log(`[${consumerName}] assinando: ${eventNames.join(', ')}`);
  }

  async onModuleDestroy(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }
}

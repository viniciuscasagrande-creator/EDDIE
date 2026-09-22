import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: any = null;
  private channel: any = null;

  async onModuleInit() {
    const uri = process.env.RABBITMQ_URI || 'amqp://guest:guest@localhost:5672';
    try {
      this.connection = await amqp.connect(uri);
      this.channel = await this.connection.createChannel();
      this.logger.log('Connected to RabbitMQ message broker successfully');
    } catch (error) {
      this.logger.warn(`RabbitMQ connection skipped or deferred: ${(error as Error).message}`);
    }
  }

  async publish(exchange: string, routingKey: string, message: unknown): Promise<boolean> {
    if (!this.channel) {
      this.logger.warn(`RabbitMQ channel not ready. Dropped event: ${routingKey}`);
      return false;
    }

    await this.channel.assertExchange(exchange, 'topic', { durable: true });
    const buffer = Buffer.from(JSON.stringify(message));
    return this.channel.publish(exchange, routingKey, buffer, {
      persistent: true,
      contentType: 'application/json',
    });
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }
}

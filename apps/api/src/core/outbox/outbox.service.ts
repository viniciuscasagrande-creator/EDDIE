import { Injectable, Logger } from '@nestjs/common';
import { EventEnvelope } from '@ticketing/contracts';

export interface PrismaTransactionClient {
  outboxEvent: {
    create(args: {
      data: {
        id: string;
        eventType: string;
        payload: object;
        status: 'PENDENTE' | 'PUBLICADO' | 'FALHA';
      };
    }): Promise<unknown>;
  };
  processedEvent?: {
    create(args: {
      data: {
        eventId: string;
        consumerName: string;
      };
    }): Promise<unknown>;
  };
}

@Injectable()
export class OutboxService {
  private readonly logger = new Logger(OutboxService.name);

  /**
   * Grava o evento na tabela outbox do schema core na mesma transação atômica do banco.
   * Regra inviolável: nenhuma publicação direta no broker durante a transação.
   */
  async emit<T>(
    tx: PrismaTransactionClient,
    event: EventEnvelope<T>,
  ): Promise<void> {
    this.logger.debug(`[Outbox] Emitting event: ${event.eventName} (${event.eventId})`);
    
    await tx.outboxEvent.create({
      data: {
        id: event.eventId,
        eventType: event.eventName,
        payload: event as unknown as object,
        status: 'PENDENTE',
      },
    });
  }

  /**
   * Garante idempotência de processamento via deduplicação no banco.
   * Retorna true se o evento foi 'claimed' com sucesso para este consumer,
   * ou false se já foi processado anteriormente.
   */
  async claim(
    tx: PrismaTransactionClient,
    eventId: string,
    consumerName: string,
  ): Promise<boolean> {
    if (!tx.processedEvent) {
      return true;
    }

    try {
      await tx.processedEvent.create({
        data: {
          eventId,
          consumerName,
        },
      });
      return true;
    } catch (error: unknown) {
      // Violação de constraint unique (eventId + consumerName)
      const err = error as { code?: string };
      if (err.code === 'P2002') {
        this.logger.warn(
          `[Idempotency] Event ${eventId} was already processed by ${consumerName}. Skipping.`,
        );
        return false;
      }
      throw error;
    }
  }
}

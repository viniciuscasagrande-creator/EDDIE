import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventosEvents } from '@ticketing/contracts';
import { EventBus } from '../../shared/bus/event-bus.service';
import { OutboxService } from '../../shared/outbox/outbox.service';
import { ComercialService } from './comercial.service';
import { PrismaService } from '../../shared/prisma.module';

const CONSUMER = 'comercial';

/**
 * Consumidor de eventos assíncronos do módulo Comercial (CRM B2B).
 *
 * Responsabilidades:
 * - evento.publicado.v1: quando um evento é publicado, atualiza o status do produtor para 'ativo'
 *   e avança oportunidades abertas associadas para etapa 'ganho'.
 *
 * Garantias:
 * - Idempotência via outbox.claim (tabela platform.processed_events).
 */
@Injectable()
export class ComercialConsumer implements OnModuleInit {
  private readonly logger = new Logger(ComercialConsumer.name);

  constructor(
    private readonly bus: EventBus,
    private readonly outbox: OutboxService,
    private readonly comercialService: ComercialService,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.bus.subscribe(
      CONSUMER,
      [EventosEvents.EventoPublicado.name],
      async (envelope) => {
        if (!(await this.outbox.claim(envelope.eventId, CONSUMER))) {
          this.logger.debug(
            `Evento ${envelope.eventName} (${envelope.eventId}) já processado por ${CONSUMER}. Ignorando.`,
          );
          return;
        }

        if (envelope.eventName === EventosEvents.EventoPublicado.name) {
          const payload = EventosEvents.EventoPublicado.parse(envelope.payload);

          this.logger.log(
            `Evento publicado detectado pelo Comercial: ${payload.nome} (${payload.eventoId}) para Produtor ${payload.produtorId}`,
          );

          // Atualiza status do produtor B2B para ativo se estiver em prospeccao ou em_negociacao
          await this.prisma.produtorB2B.updateMany({
            where: {
              id: payload.produtorId,
              tenantId: envelope.tenantId,
              status: { in: ['prospeccao', 'em_negociacao'] },
            },
            data: { status: 'ativo' },
          });
        }
      },
    );

    this.logger.log(`ComercialConsumer inicializado ouvindo ${EventosEvents.EventoPublicado.name}`);
  }
}

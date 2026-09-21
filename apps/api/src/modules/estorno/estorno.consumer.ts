import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventosEvents } from '@ticketing/contracts';
import { EventBus } from '../../shared/bus/event-bus.service';
import { OutboxService } from '../../shared/outbox/outbox.service';

const CONSUMER = 'estorno';

@Injectable()
export class EstornoConsumer implements OnModuleInit {
  private readonly logger = new Logger(EstornoConsumer.name);

  constructor(
    private readonly bus: EventBus,
    private readonly outbox: OutboxService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.bus.subscribe(
      CONSUMER,
      [EventosEvents.EventoCancelado.name, EventosEvents.EventoAdiado.name],
      async (envelope) => {
        if (!(await this.outbox.claim(envelope.eventId, CONSUMER))) return;

        if (envelope.eventName === EventosEvents.EventoCancelado.name) {
          const p = EventosEvents.EventoCancelado.parse(envelope.payload);
          if (!p.estornoAutomatico) return;
          this.logger.warn(`Abrindo estorno em massa do evento ${p.eventoId}`);
          // TODO: paginar pedidos pagos do evento (porta pública de Pagamentos)
          // e abrir uma SolicitacaoEstorno por pedido, com motivo evento_cancelado.
        }

        if (envelope.eventName === EventosEvents.EventoAdiado.name) {
          const p = EventosEvents.EventoAdiado.parse(envelope.payload);
          this.logger.log(
            `Janela de opção de estorno aberta por ${p.janelaOpcaoEstornoDias} dias`,
          );
        }
      },
    );
  }
}

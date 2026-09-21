import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PedidosEvents, EstornoEvents } from '@ticketing/contracts';
import { EventBus } from '../../shared/bus/event-bus.service';
import { OutboxService } from '../../shared/outbox/outbox.service';
import { PrismaService } from '../../shared/prisma.module';

const CONSUMER = 'eventos';

/**
 * Mantém o espelho `Lote.vendidos` para o dashboard comercial.
 * Idempotente: cada eventId é processado uma única vez por consumidor.
 */
@Injectable()
export class EventosConsumer implements OnModuleInit {
  private readonly logger = new Logger(EventosConsumer.name);

  constructor(
    private readonly bus: EventBus,
    private readonly outbox: OutboxService,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.bus.subscribe(
      CONSUMER,
      [PedidosEvents.PedidoPago.name, EstornoEvents.PagamentoEstornado.name],
      async (envelope) => {
        if (!(await this.outbox.claim(envelope.eventId, CONSUMER))) return;

        if (envelope.eventName === PedidosEvents.PedidoPago.name) {
          const p = PedidosEvents.PedidoPago.parse(envelope.payload);
          const porLote = new Map<string, number>();
          for (const item of p.itens) {
            porLote.set(item.loteId, (porLote.get(item.loteId) ?? 0) + 1);
          }
          await this.prisma.$transaction(
            [...porLote].map(([loteId, qtd]) =>
              this.prisma.lote.update({
                where: { id: loteId },
                data: { vendidos: { increment: qtd } },
              }),
            ),
          );
        }

        if (envelope.eventName === EstornoEvents.PagamentoEstornado.name) {
          const p = EstornoEvents.PagamentoEstornado.parse(envelope.payload);
          if (p.devolverInventario) {
            this.logger.log(`Devolvendo ${p.itensIds.length} itens do pedido ${p.pedidoId}`);
            // TODO: resolver loteId por itemId via porta pública do Inventário
          }
        }
      },
    );
  }
}

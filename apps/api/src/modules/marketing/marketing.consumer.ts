import { Injectable, Logger, OnModuleInit, Optional } from '@nestjs/common';
import { PedidosEvents } from '@ticketing/contracts';
import { EventBus } from '../../shared/bus/event-bus.service';
import { OutboxService } from '../../shared/outbox/outbox.service';
import { MarketingService } from './marketing.service';
import { EventosPublicService } from '../eventos/eventos.public-service';

const CONSUMER = 'marketing';

/**
 * Consumidor de eventos assíncronos do módulo Marketing & Atribuição.
 *
 * Responsabilidades:
 * - pedido.pago.v1: atribui a conversão de venda a links UTM, campanhas e cupons promocionais.
 *
 * Garantias:
 * - Idempotência via outbox.claim (tabela platform.processed_events).
 * - Não faz query direta em tabelas de outros módulos.
 */
@Injectable()
export class MarketingConsumer implements OnModuleInit {
  private readonly logger = new Logger(MarketingConsumer.name);

  constructor(
    private readonly bus: EventBus,
    private readonly outbox: OutboxService,
    private readonly marketingService: MarketingService,
    @Optional() private readonly eventosPublic?: EventosPublicService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.bus.subscribe(
      CONSUMER,
      [PedidosEvents.PedidoPago.name],
      async (envelope) => {
        // 1. Verificação de idempotência via tabela platform.processed_events
        if (!(await this.outbox.claim(envelope.eventId, CONSUMER))) {
          this.logger.debug(
            `Evento ${envelope.eventName} (${envelope.eventId}) já processado por ${CONSUMER}. Ignorando.`,
          );
          return;
        }

        // 2. Pedido Pago -> Atribuição de conversão
        if (envelope.eventName === PedidosEvents.PedidoPago.name) {
          const payload = PedidosEvents.PedidoPago.parse(envelope.payload);

          let eventoId: string | null = null;
          const primeiroLoteId = payload.itens[0]?.loteId;

          if (this.eventosPublic && primeiroLoteId) {
            try {
              const lote = await this.eventosPublic.obterLoteParaVenda(
                envelope.tenantId,
                primeiroLoteId,
              );
              eventoId = lote?.eventoId ?? null;
            } catch (err) {
              this.logger.warn(
                `Não foi possível resolver eventoId do lote ${primeiroLoteId} via porta pública: ${err}`,
              );
            }
          }

          if (!eventoId) {
            this.logger.warn(
              `Pedido ${payload.pedidoId} recebido sem eventoId associado. Conversão de marketing ignorada.`,
            );
            return;
          }

          // Extrai metadados de rastreamento do envelope se fornecidos
          const metadata = (envelope as any).metadata ?? {};
          const utmSource = metadata.utmSource ?? null;
          const utmMedium = metadata.utmMedium ?? null;
          const utmCampaign = metadata.utmCampaign ?? null;
          const cupomCodigo = metadata.cupomCodigo ?? null;
          const campanhaId = metadata.campanhaId ?? null;

          this.logger.log(
            `Atribuindo conversão para Pedido ${payload.pedidoId} | Evento ${eventoId} | Total: R$ ${(payload.total / 100).toFixed(2)}`,
          );

          await this.marketingService.atribuirConversao(envelope.tenantId, {
            produtorId: payload.produtorId,
            eventoId,
            pedidoId: payload.pedidoId,
            valorTotalCents: payload.total,
            utmSource,
            utmMedium,
            utmCampaign,
            cupomCodigo,
            campanhaId,
          });
        }
      },
    );

    this.logger.log(
      `MarketingConsumer inicializado ouvindo ${PedidosEvents.PedidoPago.name}`,
    );
  }
}

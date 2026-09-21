import { Injectable, Logger, OnModuleInit, Optional } from '@nestjs/common';
import { PedidosEvents, EstornoEvents } from '@ticketing/contracts';
import { EventBus } from '../../shared/bus/event-bus.service';
import { OutboxService } from '../../shared/outbox/outbox.service';
import { FinanceiroService } from './financeiro.service';
import { EventosPublicService } from '../eventos/eventos.public-service';

const CONSUMER = 'financeiro';

/**
 * Consumidor de eventos assíncronos do módulo Financeiro.
 *
 * Responsabilidades:
 * - pedido.pago.v1: credita o repasse do produtor no bucket 'retido' da conta gráfica.
 * - pagamento.estornado.v1: debita o valor estornado no bucket 'reservado_estorno' da conta gráfica.
 *
 * Garantias:
 * - Idempotência dupla: via outbox.claim (tabela platform.processed_events)
 *   e via chave única do Ledger (origem_referenciaId_bucket_tipo).
 */
@Injectable()
export class FinanceiroConsumer implements OnModuleInit {
  private readonly logger = new Logger(FinanceiroConsumer.name);

  constructor(
    private readonly bus: EventBus,
    private readonly outbox: OutboxService,
    private readonly financeiroService: FinanceiroService,
    @Optional() private readonly eventosPublic?: EventosPublicService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.bus.subscribe(
      CONSUMER,
      [PedidosEvents.PedidoPago.name, EstornoEvents.PagamentoEstornado.name],
      async (envelope) => {
        // 1. Verificação de idempotência via tabela de eventos processados
        if (!(await this.outbox.claim(envelope.eventId, CONSUMER))) {
          this.logger.debug(
            `Evento ${envelope.eventName} (${envelope.eventId}) já foi processado pelo consumidor ${CONSUMER}. Ignorando.`,
          );
          return;
        }

        // 2. Pedido Pago -> Crédito no bucket 'retido'
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

          this.logger.log(
            `Processando crédito de pedido pago: Pedido ${payload.pedidoId} | Produtor ${payload.produtorId} | Repasse: R$ ${(payload.repasseProdutor / 100).toFixed(2)}`,
          );

          await this.financeiroService.processarPedidoPago(
            envelope.tenantId,
            payload,
            eventoId,
          );
        }

        // 3. Pagamento Estornado -> Débito no bucket 'reservado_estorno'
        if (envelope.eventName === EstornoEvents.PagamentoEstornado.name) {
          const payload = EstornoEvents.PagamentoEstornado.parse(envelope.payload);

          this.logger.log(
            `Processando débito de estorno: Estorno ${payload.estornoId} | Pedido ${payload.pedidoId} | Produtor ${payload.produtorId} | Valor: R$ ${(payload.valorEstornado / 100).toFixed(2)}`,
          );

          await this.financeiroService.processarPagamentoEstornado(
            envelope.tenantId,
            payload,
          );
        }
      },
    );

    this.logger.log(`FinanceiroConsumer inicializado ouvindo ${PedidosEvents.PedidoPago.name} e ${EstornoEvents.PagamentoEstornado.name}`);
  }
}

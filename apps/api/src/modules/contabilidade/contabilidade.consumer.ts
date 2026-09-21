import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PedidosEvents, FinanceiroEvents, EstornoEvents } from '@ticketing/contracts';
import { EventBus } from '../../shared/bus/event-bus.service';
import { OutboxService } from '../../shared/outbox/outbox.service';
import { ContabilidadeService } from './contabilidade.service';

const CONSUMER = 'contabilidade';

/**
 * Consumidor de eventos assíncronos do módulo Contabilidade.
 *
 * Responsabilidades:
 * - pedido.pago.v1: Escritura venda em partidas dobradas segregando receita própria de recursos do produtor.
 * - financeiro.repasse_liquidado.v1: Baixa a obrigação com o produtor no passivo contra a saída de caixa em bancos.
 * - estorno.pagamento_estornado.v1: Escritura o estorno compensatório.
 *
 * Garantias:
 * - Idempotência via outbox.claim (tabela platform.processed_events).
 */
@Injectable()
export class ContabilidadeConsumer implements OnModuleInit {
  private readonly logger = new Logger(ContabilidadeConsumer.name);

  constructor(
    private readonly bus: EventBus,
    private readonly outbox: OutboxService,
    private readonly contabilidadeService: ContabilidadeService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.bus.subscribe(
      CONSUMER,
      [
        PedidosEvents.PedidoPago.name,
        FinanceiroEvents.RepasseLiquidado.name,
        EstornoEvents.PagamentoEstornado.name,
      ],
      async (envelope) => {
        // 1. Verificação de idempotência via platform.processed_events
        if (!(await this.outbox.claim(envelope.eventId, CONSUMER))) {
          this.logger.debug(
            `Evento ${envelope.eventName} (${envelope.eventId}) já processado por ${CONSUMER}. Ignorando.`,
          );
          return;
        }

        const dataEvento = new Date().toISOString();
        const competencia = dataEvento.slice(0, 7); // "AAAA-MM"

        // 2. Pedido Pago -> Escrituração da venda
        if (envelope.eventName === PedidosEvents.PedidoPago.name) {
          const payload = PedidosEvents.PedidoPago.parse(envelope.payload);

          this.logger.log(
            `Contabilizando venda do pedido ${payload.pedidoId} (Total: R$ ${(payload.total / 100).toFixed(2)})`,
          );

          try {
            await this.contabilidadeService.criarLancamento(envelope.tenantId, {
              data: payload.pagoEm,
              competencia,
              historico: `Venda de ingressos - Pedido #${payload.pedidoId.slice(0, 8)}`,
              origemTipo: 'pedido_pago',
              origemReferenciaId: payload.pedidoId,
              produtorId: payload.produtorId,
              criadoPor: 'sistema_contabil_automatico',
              partidas: [
                // Débito: Adquirentes a Receber (Ativo)
                {
                  contaCodigo: '1.1.2.01',
                  tipo: 'D',
                  valorCents: payload.total,
                  historicoComplementar: `Adquirente ${payload.adquirente}`,
                },
                // Crédito: Recursos de Terceiros a Repassar (Passivo)
                {
                  contaCodigo: '2.1.2.01',
                  tipo: 'C',
                  valorCents: payload.repasseProdutor,
                  historicoComplementar: `Produtor ${payload.produtorId}`,
                },
                // Crédito: Receita Própria de Serviços / Taxas (Receita)
                {
                  contaCodigo: '3.1.1.01',
                  tipo: 'C',
                  valorCents: payload.receitaPlataforma,
                  historicoComplementar: 'Taxa de conveniência DiskIngressos',
                },
              ],
            });
          } catch (err) {
            this.logger.error(
              `Falha na escrituração contábil automática do pedido ${payload.pedidoId}: ${err}`,
            );
          }
        }

        // 3. Repasse Liquidado -> Baixa de obrigação com produtor
        if (envelope.eventName === FinanceiroEvents.RepasseLiquidado.name) {
          const payload = FinanceiroEvents.RepasseLiquidado.parse(envelope.payload);

          this.logger.log(
            `Contabilizando liquidação de repasse ${payload.repasseId} (Valor: R$ ${(payload.valorLiquidoCents / 100).toFixed(2)})`,
          );

          try {
            await this.contabilidadeService.criarLancamento(envelope.tenantId, {
              data: payload.liquidadoEm,
              competencia,
              historico: `Liquidação de repasse Pix ao produtor #${payload.produtorId.slice(0, 8)}`,
              origemTipo: 'repasse_produtor',
              origemReferenciaId: payload.repasseId,
              produtorId: payload.produtorId,
              eventoId: payload.eventoId,
              criadoPor: 'sistema_contabil_automatico',
              partidas: [
                // Débito: Baixa de Valores a Repassar a Produtores (Passivo)
                {
                  contaCodigo: '2.1.2.01',
                  tipo: 'D',
                  valorCents: payload.valorLiquidoCents,
                },
                // Crédito: Saída de Disponibilidades Bancárias (Ativo)
                {
                  contaCodigo: '1.1.1.01',
                  tipo: 'C',
                  valorCents: payload.valorLiquidoCents,
                },
              ],
            });
          } catch (err) {
            this.logger.error(
              `Falha na escrituração contábil da liquidação de repasse ${payload.repasseId}: ${err}`,
            );
          }
        }
      },
    );

    this.logger.log(`ContabilidadeConsumer inicializado ouvindo eventos de venda e repasse`);
  }
}

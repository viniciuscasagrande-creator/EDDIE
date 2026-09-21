import { z } from 'zod';
import { defineEvent } from '../shared/envelope.js';
import { Money } from '../shared/money.js';

/** Publicados por INVENTARIO/CHECKOUT e PAGAMENTOS. */

const ItemPedido = z.object({
  itemId: z.string().uuid(),
  loteId: z.string().uuid(),
  sessaoId: z.string().uuid(),
  setorId: z.string().uuid(),
  assento: z.string().nullable(),       // null = setor sem marcação (pista)
  tipo: z.enum(['inteira', 'meia', 'cortesia', 'social']),
  precoFace: Money,
  taxaConveniencia: Money,
  desconto: Money,
});

export const ReservaCriada = defineEvent(
  'inventario.reserva_criada.v1',
  z.object({
    reservaId: z.string().uuid(),
    clienteId: z.string().uuid().nullable(),
    itens: z.array(ItemPedido).min(1),
    expiraEm: z.string().datetime(),     // TTL no Redis (padrão: 10 min)
  }),
);

export const ReservaExpirada = defineEvent(
  'inventario.reserva_expirada.v1',
  z.object({
    reservaId: z.string().uuid(),
    clienteId: z.string().uuid().nullable(),
    itens: z.array(ItemPedido).min(1),
    valorPerdido: Money,                 // alimenta o Remarketing
  }),
);

export const PedidoCriado = defineEvent(
  'pedido.criado.v1',
  z.object({
    pedidoId: z.string().uuid(),
    reservaId: z.string().uuid(),
    clienteId: z.string().uuid(),
    itens: z.array(ItemPedido).min(1),
    subtotal: Money,
    taxas: Money,
    descontos: Money,
    total: Money,
    cupom: z.string().nullable(),
    atribuicao: z
      .object({
        utmSource: z.string().nullable(),
        utmMedium: z.string().nullable(),
        utmCampaign: z.string().nullable(),
        campanhaId: z.string().uuid().nullable(),
      })
      .nullable(),
  }),
);

/**
 * O evento mais importante do sistema.
 * Consumido por: financeiro, contabilidade, acesso, eventos, crm, marketing.
 */
export const PedidoPago = defineEvent(
  'pedido.pago.v1',
  z.object({
    pedidoId: z.string().uuid(),
    pagamentoId: z.string().uuid(),
    clienteId: z.string().uuid(),
    produtorId: z.string().uuid(),
    itens: z.array(ItemPedido).min(1),
    total: Money,
    /** Split: quanto vai para o produtor vs. quanto fica de taxa. */
    repasseProdutor: Money,
    receitaPlataforma: Money,
    metodo: z.enum(['pix', 'cartao_credito', 'cartao_debito', 'boleto']),
    bandeira: z.string().nullable(),
    parcelas: z.number().int().min(1).default(1),
    adquirente: z.string(),
    nsu: z.string().nullable(),
    pagoEm: z.string().datetime(),
    /** Previsão de liquidação — alimenta o fluxo de caixa do Financeiro. */
    liquidacaoPrevistaEm: z.string().datetime(),
  }),
);

export const PagamentoRecusado = defineEvent(
  'pagamento.recusado.v1',
  z.object({
    pedidoId: z.string().uuid(),
    clienteId: z.string().uuid(),
    motivoCodigo: z.string(),
    motivoDescricao: z.string(),
    metodo: z.string(),
    total: Money,
  }),
);

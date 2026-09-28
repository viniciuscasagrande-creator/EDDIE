import { z } from 'zod';
import { defineEvent } from '../envelope.js';

export const PedidoPagoItemSchema = z.object({
  ingressoId: z.string().uuid(),
  loteId: z.string().uuid(),
  sessaoId: z.string().uuid(),
  eventoId: z.string().uuid(),
  assento: z.string().nullable().optional(),
  precoCents: z.number().int().nonnegative(),
  taxaConvenienciaCents: z.number().int().nonnegative(),
});

export const PedidoPagoPayloadSchema = z.object({
  pedidoId: z.string().uuid(),
  compradorId: z.string().uuid(),
  compradorEmail: z.string().email(),
  compradorNome: z.string(),
  metodoPagamento: z.enum(['PIX', 'CREDIT_CARD', 'BOLETO']),
  transacaoId: z.string(),
  valorTotalCents: z.number().int().positive(),
  valorIngressosCents: z.number().int().positive(),
  valorTaxasCents: z.number().int().nonnegative(),
  splitProdutorCents: z.number().int().positive(),
  splitPlataformaCents: z.number().int().nonnegative(),
  itens: z.array(PedidoPagoItemSchema).min(1),
  pagoEm: z.string().datetime(),
});

export const PagamentoFalhouPayloadSchema = z.object({
  pedidoId: z.string().uuid(),
  compradorId: z.string().uuid(),
  motivo: z.string(),
  codigoErro: z.string().optional(),
  falhouEm: z.string().datetime(),
});

export const PagamentoConfirmadoPayloadSchema = z.object({
  paymentIntentId: z.string().uuid(),
  pedidoId: z.string().uuid(),
  tenantId: z.string().uuid(),
  eventoId: z.string().uuid(),
  produtorId: z.string().uuid(),
  metodo: z.enum(['PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'BOLETO']),
  adquirente: z.string(),
  transacaoId: z.string(),
  nsu: z.string().optional(),
  valorTotalCents: z.number().int().positive(),
  splitProdutorCents: z.number().int().positive(),
  splitPlataformaCents: z.number().int().nonnegative(),
  taxaMdrCents: z.number().int().nonnegative().optional(),
  confirmadoEm: z.string().datetime(),
});

export const PixGeradoPayloadSchema = z.object({
  paymentIntentId: z.string().uuid(),
  pedidoId: z.string().uuid(),
  txid: z.string(),
  chavePix: z.string(),
  qrCodeCopiaECola: z.string(),
  valorCents: z.number().int().positive(),
  expiraEm: z.string().datetime(),
});

export const ConciliacaoAdquirentePayloadSchema = z.object({
  loteId: z.string().uuid(),
  adquirente: z.string(),
  quantidadeTransacoes: z.number().int().nonnegative(),
  valorBrutoTotalCents: z.number().int().nonnegative(),
  valorTaxasMdrCents: z.number().int().nonnegative(),
  valorLiquidoTotalCents: z.number().int().nonnegative(),
  status: z.enum(['CONCILIADO', 'COM_DIVERGENCIA']),
  divergenciasEncontradas: z.number().int().nonnegative(),
});

export const PedidoPagoV1 = defineEvent('pedido.pago.v1', PedidoPagoPayloadSchema);
export const PagamentoFalhouV1 = defineEvent('pagamento.falhou.v1', PagamentoFalhouPayloadSchema);
export const PagamentoConfirmadoV1 = defineEvent('pagamento.confirmado.v1', PagamentoConfirmadoPayloadSchema);
export const PixGeradoV1 = defineEvent('pagamento.pix_gerado.v1', PixGeradoPayloadSchema);
export const ConciliacaoAdquirenteV1 = defineEvent('pagamento.conciliado.v1', ConciliacaoAdquirentePayloadSchema);

export type PedidoPagoPayload = z.infer<typeof PedidoPagoPayloadSchema>;
export type PagamentoFalhouPayload = z.infer<typeof PagamentoFalhouPayloadSchema>;
export type PagamentoConfirmadoPayload = z.infer<typeof PagamentoConfirmadoPayloadSchema>;
export type PixGeradoPayload = z.infer<typeof PixGeradoPayloadSchema>;
export type ConciliacaoAdquirentePayload = z.infer<typeof ConciliacaoAdquirentePayloadSchema>;

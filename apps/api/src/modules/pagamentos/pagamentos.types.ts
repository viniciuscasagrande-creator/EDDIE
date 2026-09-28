// ============================================================================
//  PAGAMENTOS — Tipos e DTOs (EDDIE 11.29.3 — Payments Core)
// ============================================================================

export type StatusIntencao =
  | 'CRIADA'
  | 'PROCESSANDO'
  | 'APROVADA'
  | 'RECUSADA'
  | 'CANCELADA'
  | 'ESTORNADA'
  | 'EXPIRADA';

export type MetodoPagamento =
  | 'PIX'
  | 'CARTAO_CREDITO'
  | 'CARTAO_DEBITO'
  | 'BOLETO';

export interface CreatePaymentIntentDto {
  tenantId: string;
  pedidoId: string;
  eventoId: string;
  produtorId: string;
  idempotencyKey: string;
  metodo?: MetodoPagamento;
  valorTotal: number;
  valorIngressos: number;
  taxaServico: number;
  splitProdutor: number;
  splitPlataforma: number;
  compradorNome: string;
  compradorDocumento: string;
  compradorEmail: string;
  compradorTelefone?: string;
  adquirente?: string;
  parcelas?: number;
  expiraEmMinutos?: number;
  metadata?: Record<string, unknown>;
}

export interface ProcessPixDto {
  chavePix?: string;
  psp?: string;
  expiraEmMinutos?: number;
}

export interface ProcessCardDto {
  adquirente: string;
  cartaoToken?: string;
  parcelas?: number;
  titularNome?: string;
  ultimosDigitos?: string;
  bandeira?: string;
  taxaMdrPercentual?: number;
  taxaMdrFixa?: number;
}

export interface ConfirmPaymentDto {
  adquirente: string;
  transacaoId: string;
  nsu?: string;
  codigoAutorizacao?: string;
  taxaMdrPercentual?: number;
  taxaMdrFixa?: number;
}

export interface RefusePaymentDto {
  motivo: string;
  codigoErro?: string;
  adquirente?: string;
}

export interface WebhookPaymentInputDto {
  adquirente: string;
  webhookEventId: string;
  tipoEvento: string;
  payload: Record<string, unknown>;
}

export interface ConciliarAdquirenteDto {
  tenantId: string;
  adquirente: string;
  dataReferencia: string | Date;
  arquivoExtrato?: string;
  quantidadeTransacoes: number;
  valorBrutoTotal: number;
  valorTaxasMdr: number;
  valorLiquidoTotal: number;
  divergenciasEncontradas?: number;
}

export interface PaymentIntentFilterDto {
  tenantId?: string;
  status?: StatusIntencao;
  metodo?: MetodoPagamento;
  adquirente?: string;
  eventoId?: string;
  termoBusca?: string;
  pagina?: number;
  limite?: number;
}

export interface PaymentMetricsDto {
  volumeTotalProcessado: number;
  volumeAprovado: number;
  volumePendente: number;
  volumeRecusado: number;
  taxaAprovacaoPercentual: number;
  totalTransacoes: number;
  transacoesAprovadas: number;
  transacoesRecusadas: number;
  transacoesPendentes: number;
  distribuicaoMetodos: {
    pix: number;
    cartaoCredito: number;
    cartaoDebito: number;
    boleto: number;
  };
  taxaMediaMdrPercentual: number;
}

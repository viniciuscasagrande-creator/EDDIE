export type InventoryState = "DISPONIVEL"|"RESERVADO"|"VENDIDO"|"BLOQUEADO"|"CORTESIA";
export type OrderState = "RASCUNHO"|"AGUARDANDO_PAGAMENTO"|"PAGO"|"PARCIALMENTE_ESTORNADO"|"ESTORNADO"|"CANCELADO"|"EXPIRADO";
export type PaymentState = "PENDENTE"|"AUTORIZADO"|"PAGO"|"FALHOU"|"CANCELADO"|"ESTORNADO"|"CHARGEBACK";
export type CheckinResult = "VALIDO"|"JA_UTILIZADO"|"CANCELADO"|"ESTORNADO"|"INVALIDO"|"FORA_DA_SESSAO";
export type SettlementState = "PENDENTE"|"LIQUIDADO"|"BLOQUEADO";
export type PayoutState = "PROGRAMADO"|"EM_PROCESSAMENTO"|"PAGO"|"FALHOU"|"CANCELADO";

export interface IdempotentCommand {
  idempotencyKey: string;
  correlationId: string;
  tenantId: string;
  produtorId: string;
}

export interface ReserveInventoryCommand extends IdempotentCommand {
  eventoId: string;
  sessaoId?: string;
  items: Array<{ loteId: string; setorId?: string; assentoId?: string; quantidade: number }>;
}

export interface PaymentProvider {
  createPix(input: unknown): Promise<unknown>;
  createCardPayment(input: unknown): Promise<unknown>;
  verifyWebhook(rawBody: Uint8Array, headers: Record<string,string|undefined>): Promise<unknown>;
}

export interface TicketIssuer {
  issueForPaidOrder(pedidoId: string, correlationId: string): Promise<{ ingressoIds: string[] }>;
}

export interface CheckinService {
  validateAndConsume(qrToken: string, eventoId: string, operadorId: string, dispositivoId?: string): Promise<{ result: CheckinResult; ingressoId?: string }>;
}

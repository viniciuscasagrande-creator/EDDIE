export type GateResult =
  | "VALIDO" | "JA_UTILIZADO" | "CANCELADO" | "ESTORNADO"
  | "INVALIDO" | "FORA_DA_SESSAO" | "FORA_DA_JANELA" | "BLOQUEADO_RISCO";

export type ReconciliationState =
  | "CONCILIADO" | "DIVERGENTE" | "NAO_LOCALIZADO" | "VALOR_DIVERGENTE"
  | "DUPLICADO" | "AGUARDANDO_LIQUIDACAO" | "REVISAO_MANUAL";

export type ChargebackState =
  | "ABERTO" | "EVIDENCIAS_PENDENTES" | "EM_DISPUTA" | "GANHO" | "PERDIDO" | "ENCERRADO";

export interface GateValidation {
  eventoId: string;
  sessaoId?: string;
  qrToken: string;
  operadorId: string;
  dispositivoId: string;
  correlationId: string;
}

export interface RiskSignal {
  code: string;
  severity: "INFO"|"BAIXA"|"MEDIA"|"ALTA"|"CRITICA";
  source: "CHECKIN"|"PAGAMENTO"|"DISPOSITIVO"|"CHARGEBACK";
  detail?: Record<string, unknown>;
}

export interface ReconciliationCandidate {
  paymentId?: string;
  orderId?: string;
  providerTransactionId?: string;
  bankReference?: string;
  amountMinor: bigint;
  occurredAt: string;
}

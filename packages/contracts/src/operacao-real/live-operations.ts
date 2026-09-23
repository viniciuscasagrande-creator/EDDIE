export type LiveConnectionState = "AO_VIVO"|"RECONECTANDO"|"DESATUALIZADO";
export type AlertSeverity = "INFO"|"ATENCAO"|"ALTA"|"CRITICA";
export type IncidentState = "ABERTO"|"EM_TRATAMENTO"|"MONITORANDO"|"RESOLVIDO";

export interface LiveEventEnvelope<T=unknown> {
  eventId: string;
  type: string;
  eventoId: string;
  sessaoId?: string;
  occurredAt: string;
  correlationId?: string;
  sequence?: number;
  payload: T;
}

export interface OperationsKpis {
  receitaConfirmadaMinor: bigint;
  pedidosPagos: number;
  ingressosEmitidos: number;
  capacidade: number;
  checkins: number;
  pessoasDentro: number;
  entradasPorMinuto: number;
  pagamentosPendentes: number;
  pagamentosFalhos: number;
  alertasCriticos: number;
}

export interface OperationalAlert {
  id: string;
  eventoId: string;
  sessaoId?: string;
  severity: AlertSeverity;
  category: string;
  title: string;
  createdAt: string;
  acknowledgedAt?: string;
}

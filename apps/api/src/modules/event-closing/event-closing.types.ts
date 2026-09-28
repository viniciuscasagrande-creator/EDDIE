// apps/api/src/modules/event-closing/event-closing.types.ts
// EDDIE 11.24 — Event Closing & Producer Settlement Types

export type EventClosingStatus =
  | 'AGUARDANDO_EVENTO'
  | 'EM_PREPARACAO'
  | 'EM_VALIDACAO'
  | 'COM_PENDENCIAS'
  | 'AGUARDANDO_APROVACAO'
  | 'PRONTO_PARA_LIQUIDAR'
  | 'EM_LIQUIDACAO'
  | 'LIQUIDADO'
  | 'PRONTO_PARA_FECHAR'
  | 'FECHADO'
  | 'REABERTO'
  // Compatibilidade legada
  | 'ABERTO'
  | 'ENCERRADO'
  | 'EM_FECHAMENTO'
  | 'REABERTO_VERSIONADO';

export type GateStatus = 'APROVADO' | 'BLOQUEANTE' | 'EM_ANALISE' | 'INFORMATIVO';

export interface GateValidationItem {
  gateNumber: number; // 1 a 11
  name: string;
  domain: string;
  status: GateStatus;
  isBlocking: boolean;
  summary: string;
  blockingReason?: string;
  responsible: string;
  timestamp: string;
  evidenceUrl?: string;
  details?: Record<string, unknown>;
}

export interface PendingItem {
  id: string;
  gateNumber: number;
  domain: string;
  title: string;
  severity: 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAIXA';
  isBlocking: boolean;
  detectedAt: string;
  description: string;
  resolutionDomain: string;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface OperationsDetail {
  inventory: {
    totalCapacity: number;
    soldCount: number;
    courtesyCount: number;
    cancelledCount: number;
    availableCount: number;
  };
  tickets: {
    issuedTicketsCount: number;
    validatedTicketsCount: number;
    unusedTicketsCount: number;
  };
  cutoffTimestamp: string;
  postCutoffMovementsCount: number;
}

export interface SettlementBreakdown {
  gmvCents: number;
  platformFeeFixedCents: number;
  platformFeePercentageCents: number;
  platformFeeTotalCents: number;
  platformFeeCents: number; // Compatibilidade com v1/admin
  paymentProcessingFeeCents: number;
  gatewayFeeCents: number; // Compatibilidade
  cdcRefundsCents: number;
  chargebacksCents: number;
  transfersCents: number;
  operatingCostsCents: number;
  priorPayoutsCents: number;
  securityHoldCents: number;
  netFinalPayoutCents: number;
  netEligiblePayoutCents: number; // Compatibilidade
  bankDestinationMasked: string;
}

export type SettlementStatus =
  | 'PREVIA'
  | 'VALIDACAO'
  | 'APROVACAO'
  | 'RESERVA'
  | 'EXECUCAO'
  | 'RETORNO'
  | 'CONCILIACAO'
  | 'LIQUIDADO';

export interface SettlementExecution {
  settlementId: string;
  status: SettlementStatus;
  requestedBy: string;
  approvedBy?: string;
  directorApprovalToken?: string;
  idempotencyKey: string;
  correlationId: string;
  bankTransactionReference?: string;
  payoutExecutedAt?: string;
  bankConfirmedAt?: string;
}

export interface ReopeningRecord {
  previousVersion: string;
  reopenedAt: string;
  reopenedBy: string;
  reason: string;
  protocol: string;
}

export interface EventClosingSnapshot {
  version: string; // "v1", "v2", ...
  eventId: string;
  eventName: string;
  tenantId: string;
  producerId: string;
  producerName: string;
  producerDocument: string;
  closedAt: string;
  closedBy: string;
  approvedBy: string;
  closingStatus: EventClosingStatus;
  settlement: SettlementBreakdown;
  gates: GateValidationItem[];
  integrityHashSha256: string;
  reopeningHistory?: ReopeningRecord[];
  sections?: Record<string, unknown>; // 20 seções canônicas
}

export interface EventClosingRecord {
  id: string;
  tenantId: string;
  eventId: string;
  eventName: string;
  producerId: string;
  status: EventClosingStatus;
  currentVersion: string;
  cutoffAt: string;
  createdAt: string;
  updatedAt: string;
  operations: OperationsDetail;
  settlement: SettlementBreakdown;
  gates: GateValidationItem[];
  pendencias: PendingItem[];
  settlementExecution?: SettlementExecution;
  dossier?: EventClosingSnapshot | null;
  reopeningHistory: ReopeningRecord[];
}

export interface EventClosingStatusResponse {
  eventId: string;
  closingId?: string;
  eventName: string;
  currentStatus: EventClosingStatus;
  currentVersion: string;
  isReadyToClose: boolean;
  blockingGatesCount: number;
  gates: GateValidationItem[];
  settlement: SettlementBreakdown;
  pendencias?: PendingItem[];
  dossierSnapshot?: EventClosingSnapshot | null;
}

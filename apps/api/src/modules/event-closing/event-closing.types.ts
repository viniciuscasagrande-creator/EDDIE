// apps/api/src/modules/event-closing/event-closing.types.ts
// EDDIE 11.24 — Event Closing & Producer Settlement Types

export type EventClosingStatus =
  | 'ABERTO'
  | 'ENCERRADO'
  | 'EM_FECHAMENTO'
  | 'FECHADO'
  | 'REABERTO_VERSIONADO';

export type GateStatus = 'APROVADO' | 'BLOQUEANTE' | 'EM_ANALISE' | 'INFORMATIVO';

export interface GateValidationItem {
  gateNumber: number;
  name: string;
  domain: string;
  status: GateStatus;
  isBlocking: boolean;
  summary: string;
  details?: Record<string, unknown>;
  blockingReason?: string;
}

export interface SettlementBreakdown {
  gmvCents: number;
  platformFeeCents: number;
  paymentProcessingFeeCents: number;
  cdcRefundsCents: number;
  chargebacksCents: number;
  priorPayoutsCents: number;
  securityHoldCents: number;
  netFinalPayoutCents: number;
}

export interface EventClosingSnapshot {
  version: string; // "v1", "v2"
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
  reopeningHistory?: Array<{
    previousVersion: string;
    reopenedAt: string;
    reopenedBy: string;
    reason: string;
    protocol: string;
  }>;
}

export interface EventClosingStatusResponse {
  eventId: string;
  eventName: string;
  currentStatus: EventClosingStatus;
  currentVersion: string;
  isReadyToClose: boolean;
  blockingGatesCount: number;
  gates: GateValidationItem[];
  settlement: SettlementBreakdown;
  dossierSnapshot?: EventClosingSnapshot | null;
}

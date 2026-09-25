/**
 * EDDIE 11.20 — Financial Operations Control Tower Types
 * Modelos e DTOs canônicos para filas operacionais, alçadas, fechamento,
 * conciliação enterprise, auditoria forense e liquidez.
 */

export type QueueType =
  | 'repasses'
  | 'transferencias'
  | 'pagamentos'
  | 'estornos'
  | 'chargebacks'
  | 'divergencias'
  | 'conciliacoes'
  | 'contas_vencidas'
  | 'aprovacoes'
  | 'retornos'
  | 'fechamentos';

export type QueuePriority = 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAIXA';

export type QueueItemStatus =
  | 'PENDENTE'
  | 'EM_ANALISE'
  | 'APROVADO'
  | 'PROCESSANDO'
  | 'CONCLUIDO'
  | 'REJEITADO'
  | 'BLOQUEADO';

export interface OperationQueueItemDto {
  id: string;
  queue: QueueType;
  priority: QueuePriority;
  tenantId: string;
  producerId: string;
  eventId: string;
  eventName?: string;
  title: string;
  description: string;
  amountCents: number;
  dueDate?: string;
  status: QueueItemStatus;
  assignee?: string;
  slaLimitAt: string;
  origin: string;
  correlationId: string;
  updatedAt: string;
  allowedActions: string[];
}

export type ApprovalTier = 'OPERADOR' | 'SUPERVISOR' | 'DIRETOR';

export type ApprovalType =
  | 'TAXA'
  | 'TRANSFERENCIA'
  | 'PAGAMENTO'
  | 'REPASSE'
  | 'LOTE'
  | 'ESTORNO_ADMIN'
  | 'ADVANCED'
  | 'AJUSTE';

export type ApprovalStatus = 'PENDENTE' | 'APROVADO' | 'REJEITADO' | 'CANCELADO';

export interface ApprovalRequestDto {
  id: string;
  tenantId: string;
  producerId: string;
  eventId: string;
  type: ApprovalType;
  title: string;
  description: string;
  amountCents: number;
  requiredTier: ApprovalTier;
  requesterId: string;
  requesterRole: string;
  status: ApprovalStatus;
  approverId?: string;
  approverRole?: string;
  approvedAt?: string;
  rejectionReason?: string;
  correlationId: string;
  createdAt: string;
}

export type ClosingState =
  | 'ABERTO'
  | 'EM_VALIDACAO'
  | 'COM_PENDENCIAS'
  | 'PRONTO_PARA_FECHAR'
  | 'FECHADO'
  | 'REABERTO_COM_AUTORIZACAO';

export interface EventDossierDto {
  dossierId: string;
  eventId: string;
  eventName: string;
  producerId: string;
  tenantId: string;
  closedAt: string;
  closedBy: string;
  gmvTotalCents: number;
  diskServiceFeesCents: number;
  gatewayFeesCents: number;
  payoutsSettledCents: number;
  refundsCents: number;
  chargebacksCents: number;
  supplierExpensesCents: number;
  netProducerResultCents: number;
  reconciliationStatus: string;
  unresolvedDivergencesCount: number;
  auditTrailHash: string;
  digitalSignature: string;
}

export interface EventClosingDto {
  eventId: string;
  producerId: string;
  tenantId: string;
  state: ClosingState;
  checklist: {
    ordersChecked: boolean;
    paymentsChecked: boolean;
    ledgerBalanced: boolean;
    gatewaysReconciled: boolean;
    refundsProcessed: boolean;
    chargebacksAccounted: boolean;
    transfersSettled: boolean;
    payoutsExecuted: boolean;
    bankConciliated: boolean;
    openDivergencesCount: number;
    criticalDivergencesCount: number;
  };
  blockedReason?: string;
  closedAt?: string;
  closedBy?: string;
  reopenedAt?: string;
  reopenedBy?: string;
  reopeningReason?: string;
  authorizationCode?: string;
  dossier?: EventDossierDto;
}

export interface DailyClosingDto {
  date: string;
  tenantId: string;
  state: ClosingState;
  totalGmvCents: number;
  totalPayoutsCents: number;
  totalFeesCents: number;
  pendingDivergencesCount: number;
  validatedBy?: string;
  closedAt?: string;
}

export interface MassPayoutItemDto {
  settlementId: string;
  eventId: string;
  eventName: string;
  producerId: string;
  amountCents: number;
  pixKey: string;
  bankAccountMasked?: string;
  status: 'ELEGIVEL' | 'RESERVADO' | 'INVALIDO' | 'JA_PAGO';
  validationNote?: string;
}

export interface MassPayoutPreviewDto {
  batchId: string;
  tenantId: string;
  producerId: string;
  totalAmountCents: number;
  eligibleCount: number;
  ineligibleCount: number;
  items: MassPayoutItemDto[];
  estimatedExecutionDate: string;
  validationPassed: boolean;
}

export interface MassPayoutResultDto {
  batchId: string;
  executedCount: number;
  failedCount: number;
  totalPaidCents: number;
  status: 'PROCESSADO' | 'FALHA_PARCIAL' | 'REJEITADO';
  executedAt: string;
  idempotencyKey: string;
  correlationId: string;
}

export interface EnterpriseMatchingCandidateDto {
  id: string;
  sourceA: {
    origin: 'GATEWAY' | 'PEDIDO' | 'LEDGER';
    referenceId: string;
    amountCents: number;
    date: string;
  };
  sourceB: {
    origin: 'BANCO' | 'PAGAMENTO' | 'SETTLEMENT';
    referenceId: string;
    amountCents: number;
    date: string;
  };
  confidenceScore: number;
  suggestedAction: 'CONCILIAR_AUTOMATICO' | 'REVISAO_MANUAL';
  reason: string;
}

export interface FinancialCaseDto {
  id: string;
  caseNumber: string;
  tenantId: string;
  producerId: string;
  eventId: string;
  title: string;
  category: 'DIVERGENCIA_BANCO' | 'CHARGEBACK' | 'REPASSE_FALHO' | 'TAXA_DISPUTADA' | 'ESTORNO_DESCONHECIDO';
  severity: 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';
  status: 'ABERTO' | 'INVESTIGANDO' | 'AGUARDANDO_BANCO' | 'RESOLVIDO' | 'IGNORADO';
  amountCents: number;
  assignedTo?: string;
  description: string;
  evidenceNotes: string[];
  evidenceUrls: string[];
  resolutionNote?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  correlationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialCalendarItemDto {
  id: string;
  date: string;
  type: 'REPASSE' | 'PAGAMENTO_FORNECEDOR' | 'RECEBIMENTO_PATROCINIO' | 'RETORNO_CNAB' | 'FECHAMENTO_EVENTO';
  title: string;
  amountCents: number;
  direction: 'IN' | 'OUT';
  status: 'PREVISTO' | 'CONFIRMADO' | 'ATRASADO';
  eventId?: string;
  producerId: string;
}

export interface LiquidityForecastBucketDto {
  daysHorizon: 7 | 15 | 30 | 60 | 90;
  periodLabel: string;
  projectedInflowCents: number;
  projectedOutflowCents: number;
  netProjectedCashCents: number;
  confidenceScore: number;
  isSimulation: true;
}

export interface SafeAutomationRuleDto {
  id: string;
  name: string;
  type: 'RESYNC_GATEWAY' | 'RETRY_IDEMPOTENT_WEBHOOK' | 'REPROCESS_CNAB_RETURN' | 'AUTO_OPEN_DIVERGENCE_CASE';
  description: string;
  active: boolean;
  triggersCount: number;
  lastExecutedAt?: string;
  isSafeReadOrRetryOnly: true;
}

export interface ForensicAuditQueryDto {
  correlationId?: string;
  idempotencyKey?: string;
  orderId?: string;
  settlementId?: string;
  transferId?: string;
  batchNumber?: string;
  eventId?: string;
  producerId?: string;
  actorId?: string;
}

export interface ForensicAuditRecordDto {
  id: string;
  timestamp: string;
  module: string;
  action: string;
  correlationId: string;
  idempotencyKey?: string;
  actorId: string;
  actorRole: string;
  tenantId: string;
  producerId?: string;
  eventId?: string;
  amountCents?: number;
  metadata: Record<string, unknown>;
}

export interface ControlTowerSummaryDto {
  queues: {
    totalPendingCount: number;
    criticalCount: number;
    breachedSlaCount: number;
    queuesCount: Record<QueueType, number>;
  };
  approvals: {
    pendingCount: number;
    totalAmountPendingCents: number;
    highestTierPending: ApprovalTier;
  };
  closings: {
    eventsReadyCount: number;
    eventsBlockedCount: number;
    dailyClosingStatus: ClosingState;
  };
  massPayouts: {
    eligibleBatchAvailable: boolean;
    eligibleTotalCents: number;
    eligibleItemsCount: number;
  };
  reconciliation: {
    overallMatchingPercent: number;
    unresolvedCasesCount: number;
    criticalCasesCount: number;
  };
  lastUpdated: string;
}

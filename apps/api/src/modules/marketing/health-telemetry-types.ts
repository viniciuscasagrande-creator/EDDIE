/**
 * EDDIE 11.16.18 — Tipos Canônicos de Status Real, Telemetria, Health Center e Diagnóstico
 */

export type HealthStatus =
  | 'OPERACIONAL'
  | 'ATENCAO'
  | 'DEGRADADO'
  | 'ERRO'
  | 'DESCONECTADO'
  | 'AGUARDANDO_DADOS'
  | 'MANUTENCAO'
  | 'DESCONHECIDO';

export type Severity = 'INFO' | 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';

export type EntityType =
  | 'ACCOUNT'
  | 'PROVIDER'
  | 'CAMPAIGN'
  | 'PIXEL'
  | 'CAPI'
  | 'GA4'
  | 'TIKTOK_EVENTS'
  | 'AUDIENCE'
  | 'JOURNEY'
  | 'AUTOMATION'
  | 'JOB'
  | 'WEBHOOK'
  | 'TRACKING_GATEWAY';

export type IncidentStatus =
  | 'ABERTO'
  | 'INVESTIGANDO'
  | 'MITIGADO'
  | 'RESOLVIDO'
  | 'IGNORADO_COM_JUSTIFICATIVA';

export type DiscrepancyType =
  | 'LOCAL_STALE'
  | 'PROVIDER_CHANGED'
  | 'PENDING_CONFIRMATION'
  | 'SYNC_FAILED'
  | 'UNKNOWN_REMOTE_STATE';

export type TimelineOperation =
  | 'CONEXAO'
  | 'TESTE'
  | 'PUBLICACAO'
  | 'ALTERACAO'
  | 'PAUSA'
  | 'RETOMADA'
  | 'SYNC'
  | 'WEBHOOK'
  | 'TRACKING'
  | 'ERRO'
  | 'RETRY'
  | 'DIAGNOSTICO'
  | 'AUTOCORRECAO'
  | 'INCIDENTE'
  | 'RESOLUCAO';

export interface HealthRecord {
  id: string;
  producerId: string;
  eventId?: string;
  entityType: EntityType;
  entityId: string;
  entityName: string;
  provider?: string;
  status: HealthStatus;
  checkedAt: string;
  lastSuccessAt?: string;
  lastErrorAt?: string;
  latencyMs?: number;
  errorCode?: string;
  summary?: string;
  correlationId: string;
  source: string;
  metadata?: Record<string, unknown>;
}

export interface DiagnosticFinding {
  id: string;
  producerId: string;
  eventId?: string;
  entityType: EntityType;
  entityId: string;
  entityName: string;
  severity: Severity;
  ruleCode: string;
  title: string;
  evidence: string[];
  probableCause: string;
  causeType: 'CONFIRMADA' | 'PROVAVEL';
  suggestedActions: string[];
  canAutoRepair: boolean;
  repairAction?: string;
  repairAudit?: {
    repairedAt: string;
    repairedBy: string;
    outcome: string;
    correlationId: string;
    previousState: string;
    newState: string;
  };
  detectedAt: string;
  resolvedAt?: string;
  correlationId: string;
}

export interface Incident {
  id: string;
  producerId: string;
  eventId?: string;
  provider?: string;
  entityType: EntityType;
  entityId: string;
  title: string;
  severity: Severity;
  status: IncidentStatus;
  startedAt: string;
  lastOccurredAt: string;
  observedImpact: string;
  evidence: string[];
  findingsCount: number;
  correlationIds: string[];
  resolutionNotes?: string;
  assignedTo?: string;
  resolvedAt?: string;
}

export interface ReconciliationDiscrepancy {
  id: string;
  producerId: string;
  eventId?: string;
  campaignId: string;
  campaignName: string;
  provider: string;
  eddieStatus: string;
  providerStatus: string;
  lastCommand: string;
  lastCommandAt: string;
  webhookStatus?: string;
  telemetryDeliveryStatus?: string;
  discrepancyType: DiscrepancyType;
  applicableTruthSource: 'EDDIE' | 'PROVIDER' | 'ARBITRATED';
  reconciled: boolean;
  reconciledAt?: string;
  reconciliationNotes?: string;
  correlationId: string;
}

export interface TimelineEvent {
  id: string;
  producerId: string;
  eventId?: string;
  campaignId?: string;
  provider?: string;
  operation: TimelineOperation;
  title: string;
  description: string;
  severity: Severity;
  timestamp: string;
  correlationId: string;
  metadata?: Record<string, unknown>;
}

export interface TelemetryMetrics {
  requestsTotal: number;
  successCount: number;
  errorCount: number;
  avgLatencyMs: number;
  rateLimitHits: number;
  retryBacklogCount: number;
  queueSize: number;
  webhookDeliveriesTotal: number;
  webhookErrors: number;
  eventsReceived: number;
  eventsDeduplicated: number;
  eventsDelivered: number;
  confirmedConversions: number;
  campaignsSyncedCount: number;
  audiencesSyncedCount: number;
  lastSyncElapsedSeconds: number;
  uptimePercentage: number;
}

export interface HealthSummary {
  overallStatus: HealthStatus;
  activeCampaignsCount: number;
  healthyIntegrationsCount: number;
  attentionIntegrationsCount: number;
  criticalErrorsCount: number;
  trackingEventsCount: number;
  conversionFailuresCount: number;
  failedJobsCount: number;
  webhookErrorsCount: number;
  openIncidentsCount: number;
  autoRepairsCount: number;
  lastGlobalCheckAt: string;
}

// apps/api/src/modules/operacao/command-center-types.ts
// EDDIE 11.18 — Event Intelligence & Command Center

export type CommandHealth = 'OPERACIONAL' | 'ATENCAO' | 'DEGRADADO' | 'CRITICO' | 'SEM_DADOS';

export type IncidentSeverity = 'INFO' | 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';
export type IncidentStatus = 'ABERTO' | 'INVESTIGANDO' | 'MITIGADO' | 'RESOLVIDO' | 'IGNORADO';

export interface ProducerEventOverview {
  id: string;
  producerId: string;
  name: string;
  slug: string;
  status: 'RASCUNHO' | 'PUBLICADO' | 'ENCERRADO' | 'CANCELADO';
  venue: string;
  startDate: string;
  endDate?: string;
  capacityTotal: number;
  ticketsSold: number;
  occupancyPercent: number;
  grossRevenueCents: number;
  netProducerCents: number;
  activeCampaignsCount: number;
  health: CommandHealth;
  criticalAlertsCount: number;
  lastUpdate: string;
}

export interface CommandCenterHeader {
  eventId: string;
  producerId: string;
  eventName: string;
  status: string;
  sessionName: string;
  sessionDate: string;
  capacityTotal: number;
  occupancyCurrent: number;
  occupancyPercent: number;
  ticketsSoldTotal: number;
  grossRevenueCents: number;
  revenueSource: 'LEDGER_CONTABIL' | 'FINANCEIRO_OFFICIAL';
  overallHealth: CommandHealth;
  lastUpdated: string;
}

export interface LiveSalesMetric {
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  failedOrders: number;
  ticketsSoldTotal: number;
  grossSalesCents: number;
  averageTicketCents: number;
  conversionRatePercent: number;
  salesBySector: Array<{ sectorId: string; sectorName: string; sold: number; capacity: number; percent: number }>;
  salesByLot: Array<{ lotId: string; lotName: string; sold: number; limit: number; status: 'ATIVO' | 'ESGOTADO' }>;
  salesByChannel: Array<{ channel: string; orders: number; revenueCents: number; sharePercent: number }>;
}

export interface LivePaymentMetric {
  totalProcessedCents: number;
  approvedCents: number;
  pendingCents: number;
  declinedCents: number;
  approvalRatePercent: number;
  pixApprovalRatePercent: number;
  cardApprovalRatePercent: number;
  methods: Array<{ method: 'PIX' | 'CREDITO' | 'DEBITO' | 'BOLETO'; ordersCount: number; totalCents: number; approvalRate: number }>;
  declinedReasons: Array<{ reason: string; count: number; actionRecommended: string }>;
}

export interface LiveGateMetric {
  totalEntries: number;
  entriesLast15Minutes: number;
  flowPacePerMinute: number;
  deniedEntries: number;
  peakHour: string;
  occupancyCurrent: number;
  occupancyCapacity: number;
  occupancyPercent: number;
  gates: Array<{ gateId: string; gateName: string; entries: number; devicesOnline: number; status: 'OPERACIONAL' | 'LENTO' | 'OFFLINE' }>;
  deniedAlerts: Array<{ id: string; ticketCode: string; reason: string; gate: string; timestamp: string; operator: string }>;
}

export interface LiveMarketingMetric {
  activeCampaigns: number;
  totalImpressions: number;
  totalClicks: number;
  attributedRevenueCents: number;
  blendedRoas: number;
  topChannels: Array<{ channel: string; costCents: number; revenueCents: number; roas: number }>;
  topUtmSources: Array<{ source: string; visits: number; conversions: number; revenueCents: number }>;
  trackingHealth: CommandHealth;
  sourceNote: string;
}

export interface LiveFinanceMetric {
  grossTicketSalesCents: number;
  diskServiceFeesCents: number;
  producerNetBalanceCents: number;
  gatewayProcessingFeesCents: number;
  refundsProcessedCents: number;
  chargebacksUnderDisputeCents: number;
  payoutScheduledCents: number;
  payoutStatus: 'AGENDADO' | 'EM_PROCESSAMENTO' | 'LIQUIDADO' | 'BLOQUEADO';
  reconciliationStatus: 'CONCILIADO_100' | 'DIVERGENCIA_DETECTADA' | 'EM_ANDAMENTO';
  reconciliationDivergenceCents: number;
  ledgerEntryCount: number;
}

export interface LiveSupportMetric {
  openTicketsCount: number;
  ticketsInSlaCount: number;
  slaBreachedCount: number;
  averageResponseMinutes: number;
  topTopics: Array<{ topic: string; count: number }>;
  criticalTickets: Array<{ id: string; protocol: string; subject: string; priority: string; openedAt: string }>;
}

export interface LiveRiskMetric {
  antifraudAlertsCount: number;
  duplicateQrAttemptsCount: number;
  chargebackRatePercent: number;
  suspiciousOrdersCount: number;
  riskScore: 'BAIXO' | 'MEDIO' | 'ALTO' | 'CRITICO';
  recentIncidents: Array<{ id: string; title: string; riskLevel: string; timestamp: string }>;
}

export interface LiveHealthMetric {
  apiLatencyMs: number;
  eventBusStatus: 'OPERACIONAL' | 'DEGRADADO' | 'OFFLINE';
  gatewayProvidersStatus: Array<{ provider: string; status: 'OPERACIONAL' | 'DEGRADADO' | 'OFFLINE'; latencyMs: number }>;
  marketingProvidersStatus: Array<{ provider: string; status: 'OPERACIONAL' | 'DEGRADADO' | 'DESCONECTADO' }>;
  queueBacklogs: Array<{ queue: string; pending: number; delayed: number; failed: number }>;
}

export interface LiveOperationalEvent {
  id: string;
  type: string;
  eventId: string;
  occurredAt: string;
  correlationId?: string;
  payload: Record<string, unknown>;
}

export interface CommandIncident {
  id: string;
  eventId: string;
  producerId: string;
  title: string;
  sourceModule: 'GATEWAY' | 'PORTARIA' | 'FINANCEIRO' | 'TRACKING' | 'SAC' | 'INVENTARIO' | 'SISTEMA';
  severity: IncidentSeverity;
  status: IncidentStatus;
  startedAt: string;
  observedImpact: string;
  relatedSymptoms: string[];
  evidenceTimeline: Array<{ time: string; note: string; source: string }>;
  assignedTo?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  correlationId: string;
}

export interface OperationalInsight {
  id: string;
  category: 'VENDAS' | 'PORTARIA' | 'FINANCEIRO' | 'MARKETING';
  title: string;
  observation: string;
  evidence: string;
  recommendation: string;
  confidenceScore: number;
  dataQuality: 'ALTA' | 'MEDIA' | 'PARCIAL';
}

export interface CommandCenterSnapshot {
  header: CommandCenterHeader;
  sales: LiveSalesMetric;
  payments: LivePaymentMetric;
  gate: LiveGateMetric;
  marketing: LiveMarketingMetric;
  finance: LiveFinanceMetric;
  support: LiveSupportMetric;
  risks: LiveRiskMetric;
  health: LiveHealthMetric;
  activeIncidents: CommandIncident[];
  insights: OperationalInsight[];
  generatedAt: string;
}

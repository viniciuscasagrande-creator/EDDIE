// apps/pdt/src/components/marketing/analytics-attribution-types.ts
// EDDIE 11.16.19 — Frontend Types for Analytics, Multi-touch Attribution, Insights and Reports

export type AttributionModel =
  | 'FIRST_TOUCH'
  | 'LAST_TOUCH'
  | 'LAST_NON_DIRECT'
  | 'LINEAR'
  | 'POSITION_BASED';

export type MetricUnit = 'NUMBER' | 'PERCENT' | 'CURRENCY' | 'RATIO';

export interface MarketingMetric {
  key: string;
  label: string;
  value: number | null;
  unit: MetricUnit;
  formattedValue: string;
  source: string;
  updatedAt: string;
  previousValue?: number | null;
  percentageChange?: number | null;
  unavailableReason?: string;
}

export interface AttributionTouchpoint {
  id: string;
  sessionId: string;
  occurredAt: string;
  source: string;
  medium: string;
  campaign: string;
  content?: string;
  term?: string;
  provider: 'META' | 'GOOGLE' | 'TIKTOK' | 'SPOTIFY' | 'ORGANIC' | 'DIRECT' | 'EMAIL' | 'WHATSAPP';
  channel: string;
  clickId?: string;
  landingPage?: string;
  costCents?: number;
}

export interface OrderAttributionResult {
  orderId: string;
  eventId: string;
  producerId: string;
  orderTotalCents: number;
  customerEmailMasked: string;
  purchasedAt: string;
  modelUsed: AttributionModel;
  touchpoints: AttributionTouchpoint[];
  credits: Array<{
    channel: string;
    provider: string;
    campaign: string;
    touchpointId: string;
    weight: number;
    attributedRevenueCents: number;
  }>;
}

export interface AttributionAuditLog {
  id: string;
  producerId: string;
  eventId: string;
  recalculatedAt: string;
  requestedBy: string;
  previousModel: AttributionModel;
  newModel: AttributionModel;
  ordersProcessed: number;
  totalAttributedRevenueCents: number;
  status: 'SUCESSO' | 'PARCIAL' | 'ERRO';
  reason?: string;
}

export interface FunnelStageMetric {
  stage: 'VIEW_EVENT' | 'ADD_TO_CART' | 'BEGIN_CHECKOUT' | 'PURCHASE';
  label: string;
  count: number;
  conversionRateFromPrevious: number;
  conversionRateFromTop: number;
  dropoffRate: number;
  averageTimeSeconds?: number;
  totalRevenueCents?: number;
  source: string;
  updatedAt: string;
}

export interface TimeSeriesDataPoint {
  date: string;
  investmentCents: number;
  impressions: number;
  clicks: number;
  views: number;
  carts: number;
  checkouts: number;
  purchases: number;
  attributedRevenueCents: number;
  roas: number;
  cpaCents: number;
}

export interface ChannelPerformanceMetric {
  channel: string;
  provider: string;
  investmentCents: number;
  impressions: number;
  clicks: number;
  ctr: number;
  visits: number;
  conversions: number;
  conversionRate: number;
  attributedRevenueCents: number;
  roas: number;
  cpaCents: number;
  source: string;
  lastSyncAt: string;
  healthStatus: 'OPERACIONAL' | 'ATENCAO' | 'DEGRADADO' | 'DESCONHECIDO';
}

export interface CampaignPerformanceMetric {
  campaignId: string;
  campaignName: string;
  eventId: string;
  status: string;
  channels: string[];
  investmentCents: number;
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  cpaCents: number;
  attributedRevenueCents: number;
  roas: number;
  source: string;
  lastSyncAt: string;
  isEligibleForComparison: boolean;
}

export interface CreativePerformanceMetric {
  creativeId: string;
  name: string;
  type: 'IMAGEM' | 'VIDEO' | 'CARROSSEL' | 'AUDIO';
  eventId: string;
  channel: string;
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  cpaCents: number;
  attributedRevenueCents: number;
  roas: number;
  source: string;
  updatedAt: string;
}

export interface AudiencePerformanceMetric {
  audienceId: string;
  name: string;
  type: string;
  size: number;
  syncedProviders: string[];
  conversions: number;
  cpaCents: number;
  attributedRevenueCents: number;
  roas: number;
  source: string;
  updatedAt: string;
}

export interface JourneyPerformanceMetric {
  journeyId: string;
  name: string;
  status: string;
  enrolled: number;
  inProgress: number;
  completed: number;
  converted: number;
  conversionRate: number;
  dispatchesCount: number;
  recoveredRevenueCents: number;
  source: string;
  updatedAt: string;
}

export interface RemarketingFunnelMetric {
  eligibleAbandonedCarts: number;
  triggeredRemarketing: number;
  reengagedUsers: number;
  returnedToCheckouts: number;
  recoveredPurchases: number;
  recoveryRate: number;
  recoveredRevenueCents: number;
  source: string;
  updatedAt: string;
}

export interface UtmPerformanceMetric {
  source: string;
  medium: string;
  campaign: string;
  clicks: number;
  visits: number;
  checkouts: number;
  purchases: number;
  conversionRate: number;
  revenueCents: number;
  bounceRate: number;
}

export interface MarketingInsight {
  id: string;
  title: string;
  scope: 'CAMPANHA' | 'CANAL' | 'FUNIL' | 'TRACKING' | 'ORCAMENTO' | 'GERAL';
  severity: 'ALTA' | 'MEDIA' | 'INFORMATIVA';
  period: { from: string; to: string };
  evidence: Array<{
    label: string;
    value: number | string;
    source: string;
    benchmark?: number | string;
  }>;
  interpretation: string;
  suggestedAction?: string;
  diagnosticActionLink?: string;
  dataQuality: 'BOA' | 'ATENCAO' | 'DEGRADADA' | 'INSUFICIENTE';
  generatedAt: string;
}

export interface DataQualityCheck {
  id: string;
  name: string;
  status: 'APROVADO' | 'ALERTA' | 'FALHA';
  description: string;
  metric: string;
  impact: string;
  lastCheckedAt: string;
}

export interface DataQualitySummary {
  overallStatus: 'BOA' | 'ATENCAO' | 'DEGRADADA' | 'INSUFICIENTE';
  overallScore: number;
  trackingCoveragePercent: number;
  browserServerDivergenceRate: number;
  syncDelayMinutes: number;
  unattributedPurchasesRate: number;
  invalidSchemaEventsCount: number;
  checks: DataQualityCheck[];
  lastEvaluatedAt: string;
}

export interface ExecutiveReport {
  reportId: string;
  title: string;
  eventId: string;
  eventName: string;
  producerId: string;
  generatedAt: string;
  timeRange: { from: string; to: string; label: string };
  attributionModel: AttributionModel;
  timezone: string;
  sources: string[];
  metrics: Record<string, MarketingMetric>;
  channelBreakdown: ChannelPerformanceMetric[];
  campaignRankings: CampaignPerformanceMetric[];
  funnelSummary: FunnelStageMetric[];
  dataQuality: DataQualitySummary;
  insights: MarketingInsight[];
}

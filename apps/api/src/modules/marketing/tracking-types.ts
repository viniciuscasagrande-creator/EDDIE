// apps/api/src/modules/marketing/tracking-types.ts
// EDDIE 11.16.17 — Tipos Canônicos de Tracking, Multi-Pixel, CAPI e Conversões

export type CanonicalEventName =
  | 'PAGE_VIEW'
  | 'VIEW_EVENT'
  | 'VIEW_ITEM'
  | 'SELECT_SESSION'
  | 'SELECT_SECTOR'
  | 'SELECT_LOT'
  | 'ADD_TO_CART'
  | 'REMOVE_FROM_CART'
  | 'BEGIN_CHECKOUT'
  | 'ADD_PAYMENT_INFO'
  | 'PURCHASE'
  | 'REFUND'
  | 'CANCEL_ORDER'
  | 'CHECK_IN';

export type TrackingProvider = 'META' | 'GOOGLE' | 'TIKTOK' | 'SPOTIFY';

export type TrackingHealthStatus =
  | 'SAUDAVEL'
  | 'ATENCAO'
  | 'ERRO'
  | 'SEM_DADOS'
  | 'DESCONECTADO';

export interface CanonicalTrackingEvent {
  canonicalEventId: string;
  name: CanonicalEventName;
  occurredAt: string;
  producerId: string;
  eventContextId: string;
  sessionId?: string;
  orderId?: string;
  currency?: string;
  value?: number;
  items?: Array<{
    id: string;
    name?: string;
    quantity: number;
    value?: number;
  }>;
  utm?: Record<string, string | undefined>;
  consent?: Record<string, boolean | undefined>;
  correlationId: string;
  source: 'BROWSER' | 'SERVER';
  eventId?: string; // ID compartilhado para deduplicação (browser + server)
  userData?: {
    emailHash?: string;
    phoneHash?: string;
    clientIp?: string;
    userAgent?: string;
  };
}

export interface TrackingConfiguration {
  id: string;
  producerId: string;
  eventId: string;
  name: string;
  provider: TrackingProvider;
  publicId: string; // Ex: Pixel ID (Meta/TikTok), Measurement ID (GA4)
  serverSecretMasked: string; // Token CAPI ou API Secret mascarado (ex: "EAA***8x")
  serverSecretRaw?: string; // Mantido exclusivamente server-side, nunca exportado para front
  status: 'ATIVO' | 'PAUSADO' | 'ERRO' | 'RASCUNHO';
  environment: 'PRODUCTION' | 'TEST';
  testEventCode?: string;
  enabledEvents: CanonicalEventName[];
  health: TrackingHealthStatus;
  lastEventAt?: string;
  lastSyncAt?: string;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrackingDeliveryLog {
  id: string;
  configurationId: string;
  canonicalEventId: string;
  eventName: CanonicalEventName;
  provider: TrackingProvider;
  source: 'BROWSER' | 'SERVER';
  status: 'ENTREGUE' | 'DEDUPLICADO' | 'ERRO' | 'REPROCESSANDO';
  externalId?: string;
  correlationId: string;
  responseCode?: number;
  responseMessage?: string;
  latencyMs: number;
  retries: number;
  timestamp: string;
}

export interface ConversionRecord {
  id: string;
  eventId: string;
  producerId: string;
  orderId: string;
  canonicalEventId: string;
  valueCents: number;
  currency: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  touchpoints: string[];
  serverConfirmed: boolean;
  deliveredProviders: TrackingProvider[];
  deduplicated: boolean;
  timestamp: string;
}

export interface TrackingDiagnostic {
  configurationId: string;
  provider: TrackingProvider;
  health: TrackingHealthStatus;
  credentialValid: boolean;
  lastEventReceived?: string;
  lastEventDispatched?: string;
  totalReceived: number;
  totalValid: number;
  totalDeduplicated: number;
  totalDispatched: number;
  totalErrors: number;
  divergenceBrowserServerRate: string;
  averageLatencyMs: number;
  recommendations: string[];
}

export interface ConversionFunnelItem {
  stage: CanonicalEventName;
  label: string;
  count: number;
  conversionRate: string;
  revenueCents?: number;
}

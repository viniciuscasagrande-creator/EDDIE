// apps/api/src/modules/dashboard/dashboard.types.ts
// EDDIE — Super Dashboard & Centro de Comando 360º

export type CommandHealth = 'OPERACIONAL' | 'ATENCAO' | 'DEGRADADO' | 'CRITICO';

export interface ActionableAlertItem {
  id: string;
  domain: 'ESTORNO' | 'EVENTO' | 'REPASSE' | 'REVENUE_ASSURANCE' | 'PORTARIA';
  type: string;
  title: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  actionType: 'APROVAR_ESTORNO' | 'APROVAR_LOTE' | 'LIBERAR_REPASSE' | 'VERIFICAR_PORTARIA';
  amountCents?: number;
  metadata?: Record<string, unknown>;
}

export interface DashboardSummaryResponse {
  timestamp: string;
  systemHealth: string;

  // Métricas principais compatíveis
  revenueToday: number;
  revenueTodayCents: number;
  ticketsSoldToday: number;
  checkinsToday: number;
  conversionRatePercent: number;
  activeUsers: number;

  // 1. Pulso de Vendas e Checkout
  salesPulse: {
    gmvTodayCents: number;
    ticketsSoldToday: number;
    averageTicketCents: number;
    pixPercent: number;
    creditCardPercent: number;
    gatewayAnomalyDetected: boolean;
  };

  // 2. Portaria e Lotação em Tempo Real
  gateOperations: {
    activeEventsCount: number;
    currentOccupancyPercent: number;
    checkinPacePerMinute: number;
    deniedAttemptsCount: number;
    gateStatus: 'OPERACIONAL' | 'FILA_CRITICA' | 'OFFLINE';
  };

  // 3. Fila de Ações Rápidas (Actionable UI)
  pendingActions: ActionableAlertItem[];

  // 4. Marketing e Aquisição
  marketingHealth: {
    blendedRoas: number;
    activeCampaignsCount: number;
    capiSuccessRatePercent: number;
    trackingHealth: CommandHealth;
  };

  // Gráfico de vendas ao vivo
  salesChartData: Array<{
    time: string;
    salesCents: number;
    ordersCount: number;
  }>;
}

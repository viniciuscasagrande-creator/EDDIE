// apps/api/src/modules/dashboard/dashboard.service.ts
// EDDIE — Super Dashboard & Centro de Comando 360º Service

import { Injectable, Logger } from '@nestjs/common';
import { DashboardSummaryResponse } from './dashboard.types';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  /**
   * Retorna resumo executivo 360º consolidado para o Centro de Comando.
   * V.0.1: Modelo mockado tipado de alta fidelidade para integração visual imediata.
   * Nas etapas seguintes, orquestrará chamadas concorrentes às portas públicas dos módulos.
   */
  async getConsolidatedMetrics(_tenantId?: string, _producerId?: string): Promise<DashboardSummaryResponse> {
    this.logger.log('Consolidando métricas 360º para Centro de Comando');

    return {
      timestamp: new Date().toISOString(),
      systemHealth: 'operational',

      revenueToday: 42500.8,
      revenueTodayCents: 4250080,
      ticketsSoldToday: 342,
      checkinsToday: 128,
      conversionRatePercent: 3.85,
      activeUsers: 840,

      // 1. Pulso de Vendas
      salesPulse: {
        gmvTodayCents: 4250080,
        ticketsSoldToday: 342,
        averageTicketCents: 12427,
        pixPercent: 62.4,
        creditCardPercent: 37.6,
        gatewayAnomalyDetected: false,
      },

      // 2. Portaria e Acesso
      gateOperations: {
        activeEventsCount: 2,
        currentOccupancyPercent: 68.4,
        checkinPacePerMinute: 42,
        deniedAttemptsCount: 3,
        gateStatus: 'OPERACIONAL',
      },

      // 3. Fila de Ações Rápidas (Actionable UI)
      pendingActions: [
        {
          id: 'act_1',
          domain: 'ESTORNO',
          type: 'REFUND_REQUEST',
          title: 'Estorno Pendente CDC — Pedido #8892',
          urgency: 'high',
          actionType: 'APROVAR_ESTORNO',
          amountCents: 35000,
          metadata: { orderId: 'ord-8892', motivo: 'Arrependimento em 7 dias (CDC)' },
        },
        {
          id: 'act_2',
          domain: 'EVENTO',
          type: 'EVENT_APPROVAL',
          title: 'Aprovar novo lote: Festival de Verão 2027',
          urgency: 'medium',
          actionType: 'APROVAR_LOTE',
          metadata: { eventoId: 'ev-verao-2027', lote: 'Lote VIP 2' },
        },
        {
          id: 'act_3',
          domain: 'REPASSE',
          type: 'PAYOUT_READY',
          title: 'Repasse Quitado pronto para liberação (R$ 45.000,00)',
          urgency: 'high',
          actionType: 'LIBERAR_REPASSE',
          amountCents: 4500000,
          metadata: { settlementId: 'SET-202609-01' },
        },
      ],

      // 4. Marketing e Aquisição
      marketingHealth: {
        blendedRoas: 4.82,
        activeCampaignsCount: 6,
        capiSuccessRatePercent: 99.4,
        trackingHealth: 'OPERACIONAL',
      },

      // Série para o gráfico de vendas ao vivo
      salesChartData: [
        { time: '08:00', salesCents: 120000, ordersCount: 12 },
        { time: '10:00', salesCents: 450000, ordersCount: 38 },
        { time: '12:00', salesCents: 980000, ordersCount: 79 },
        { time: '14:00', salesCents: 1450000, ordersCount: 114 },
        { time: '16:00', salesCents: 2350000, ordersCount: 186 },
        { time: '18:00', salesCents: 4250080, ordersCount: 342 },
      ],
    };
  }
}

import { describe, it, expect, beforeEach } from 'vitest';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

describe('DashboardModule (Centro de Comando 360º)', () => {
  let service: DashboardService;
  let controller: DashboardController;

  beforeEach(() => {
    service = new DashboardService();
    controller = new DashboardController(service);
  });

  it('deve retornar métricas consolidadas 360º com os 4 blocos vitais', async () => {
    const summary = await controller.getSummary('tenant-test-01', 'prod-test-01');

    expect(summary).toBeDefined();
    expect(summary.systemHealth).toBe('operational');
    expect(summary.revenueToday).toBe(42500.8);
    expect(summary.revenueTodayCents).toBe(4250080);
    expect(summary.ticketsSoldToday).toBe(342);
    expect(summary.checkinsToday).toBe(128);

    // Bloco 1: Vendas
    expect(summary.salesPulse.gmvTodayCents).toBe(4250080);
    expect(summary.salesPulse.pixPercent).toBeGreaterThan(0);
    expect(summary.salesPulse.gatewayAnomalyDetected).toBe(false);

    // Bloco 2: Portaria
    expect(summary.gateOperations.activeEventsCount).toBeGreaterThanOrEqual(1);
    expect(summary.gateOperations.gateStatus).toBe('OPERACIONAL');

    // Bloco 3: Inbox de Ações Rápidas (Actionable Alerts)
    expect(summary.pendingActions.length).toBeGreaterThan(0);
    expect(summary.pendingActions[0].actionType).toBe('APROVAR_ESTORNO');
    expect(summary.pendingActions[0].domain).toBe('ESTORNO');

    // Bloco 4: Marketing
    expect(summary.marketingHealth.blendedRoas).toBeGreaterThan(0);
    expect(summary.marketingHealth.capiSuccessRatePercent).toBeGreaterThanOrEqual(95);

    // Live sales chart data
    expect(summary.salesChartData.length).toBeGreaterThan(0);
  });

  it('deve executar ações rápidas com sucesso (Actionable UI)', async () => {
    // 1. Aprovar Estorno CDC
    const resEstorno = await controller.executeAction({
      alertId: 'act_1',
      actionType: 'APROVAR_ESTORNO',
    });
    expect(resEstorno.ok).toBe(true);
    expect(resEstorno.alertId).toBe('act_1');
    expect(resEstorno.message).toContain('aprovado');

    // 2. Liberar Repasse
    const resRepasse = await controller.executeAction({
      alertId: 'act_3',
      actionType: 'LIBERAR_REPASSE',
    });
    expect(resRepasse.ok).toBe(true);
    expect(resRepasse.message).toContain('autorizado');

    // 3. Aprovar Lote
    const resLote = await controller.executeAction({
      alertId: 'act_2',
      actionType: 'APROVAR_LOTE',
    });
    expect(resLote.ok).toBe(true);
  });
});


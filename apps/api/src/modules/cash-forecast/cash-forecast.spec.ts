// apps/api/src/modules/cash-forecast/cash-forecast.spec.ts
// EDDIE 11.26 — Cash Forecast, Liquidity & Working Capital OS Test Suite

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CashForecastService } from './cash-forecast.service';
import { CashForecastController } from './cash-forecast.controller';
import { PrismaService } from '../../shared/prisma.module';

describe('EDDIE 11.26 — Cash Forecast, Liquidity & Working Capital OS', () => {
  let service: CashForecastService;
  let controller: CashForecastController;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      contaPagar: {
        aggregate: vi.fn().mockResolvedValue({ _sum: { valor: 85000 } }),
      },
      solicitacaoRepasse: {
        aggregate: vi.fn().mockResolvedValue({ _sum: { valorLiquido: 309200 } }),
      },
    };

    service = new CashForecastService(mockPrisma as unknown as PrismaService);
    controller = new CashForecastController(service);
  });

  // 1. REGRA INVIOLÁVEL DE SEGREGAÇÃO DE SALDOS
  it('CF-01: deve segregar rigorosamente os 6 saldos sem confundir projeção com saldo sacável', async () => {
    const pos = await controller.getSegregatedPosition('tenant-01');

    expect(pos).toBeDefined();
    expect(pos.saldoBancarioRealCents).toBeGreaterThan(0);
    expect(pos.saldoLedgerCents).toBeGreaterThan(0);
    expect(pos.saldoDisponivelCents).toBeGreaterThan(0);
    expect(pos.valorReservadoCents).toBeGreaterThan(0);
    expect(pos.valorEmLiquidacaoCents).toBeGreaterThan(0);
    expect(pos.valorProjetadoCents).toBeGreaterThan(0);

    // Regra Inviolável: todos os conceitos são segregados e não equivalentes
    expect(pos.saldoBancarioRealCents).not.toBe(pos.saldoDisponivelCents);
    expect(pos.saldoLedgerCents).not.toBe(pos.saldoDisponivelCents);
    expect(pos.valorProjetadoCents).not.toBe(pos.saldoDisponivelCents);
    expect(pos.resumoSegregacao).toContain('SEGREGADO');
  });

  // 2. HORIZONTES TEMPORAIS (D+1, D+7, D+15, D+30, D+60, D+90)
  it('CF-02: deve projetar fluxo de caixa exatamente para os 6 horizontes regulamentares', async () => {
    const horizons = await controller.getHorizons('BASE', 'tenant-01');

    expect(horizons.length).toBe(6);
    expect(horizons.map((h) => h.horizon)).toEqual(['D1', 'D7', 'D15', 'D30', 'D60', 'D90']);

    for (const h of horizons) {
      expect(h.inflows.totalInflowsCents).toBeGreaterThan(0);
      expect(h.outflows.totalOutflowsCents).toBeGreaterThan(0);
      expect(h.startingAvailableBalanceCents).toBeDefined();
      expect(h.projectedEndingBalanceCents).toBeDefined();
      expect(h.minimumSafetyReserveCents).toBe(25000000); // R$ 250.000
    }
  });

  // 3. INFLOWS & OUTFLOWS BREAKDOWN
  it('CF-03: deve detalhar a composição analítica de entradas e saídas por horizonte', async () => {
    const horizons = await controller.getHorizons('BASE');
    const d30 = horizons.find((h) => h.horizon === 'D30')!;

    expect(d30).toBeDefined();
    // Entradas
    expect(d30.inflows.pixReceivablesCents).toBeGreaterThan(0);
    expect(d30.inflows.creditCardSettledCents).toBeGreaterThan(0);
    expect(d30.inflows.creditCardFutureD30Cents).toBeGreaterThan(0);
    expect(d30.inflows.sponsorshipsCents).toBeGreaterThan(0);
    // Saídas
    expect(d30.outflows.producerScheduledPayoutsCents).toBeGreaterThan(0);
    expect(d30.outflows.supplierPayablesCents).toBeGreaterThan(0);
    expect(d30.outflows.gatewayProcessingFeesCents).toBeGreaterThan(0);
    expect(d30.outflows.cdcRefundsProvisionCents).toBeGreaterThan(0);
  });

  // 4. CENÁRIOS DE ESTRESSE: BASE vs CONSERVADOR vs OTIMISTA
  it('CF-04: cenário conservador deve estressar vendas e estornos e reduzir saldo projetado', async () => {
    const base = await controller.getHorizons('BASE');
    const conservador = await controller.getHorizons('CONSERVADOR');

    const baseD30 = base.find((h) => h.horizon === 'D30')!;
    const consD30 = conservador.find((h) => h.horizon === 'D30')!;

    // No conservador, entradas são menores e provisão de CDC é maior
    expect(consD30.inflows.totalInflowsCents).toBeLessThan(baseD30.inflows.totalInflowsCents);
    expect(consD30.outflows.cdcRefundsProvisionCents).toBeGreaterThan(baseD30.outflows.cdcRefundsProvisionCents);
    expect(consD30.projectedEndingBalanceCents).toBeLessThan(baseD30.projectedEndingBalanceCents);
  });

  // 5. SIMULAÇÃO CUSTOMIZADA DE CENÁRIOS
  it('CF-05: deve simular cenários customizados com sliders de estresse de vendas e prazo', async () => {
    const customResult = await controller.simulateScenario({
      scenario: 'CUSTOMIZADO',
      customParams: {
        taxaCrescimentoVendasPercentual: -35,
        estresseEstornoPercentual: 50,
        variacaoPrazoRecebimentoDias: 7,
      },
    });

    expect(customResult.length).toBe(6);
    expect(customResult[0].scenario).toBe('CUSTOMIZADO');
  });

  // 6. GAPS DE LIQUIDEZ E ALERTAS AUTOMATIZADOS
  it('CF-06: deve identificar gaps de liquidez quando o saldo cai abaixo da reserva mínima', async () => {
    const gaps = await controller.getLiquidityGaps('CONSERVADOR');

    expect(Array.isArray(gaps)).toBe(true);
    for (const g of gaps) {
      expect(g.deficitCents).toBeGreaterThanOrEqual(0);
      expect(['VERDE', 'AMARELO', 'VERMELHO']).toContain(g.severity);
      expect(g.recommendedAction).toBeDefined();
      expect(g.rootCause).toBeDefined();
    }
  });

  // 7. CAPITAL DE GIRO & CICLO FINANCEIRO
  it('CF-07: deve calcular PMR, PMP, Ciclo Financeiro e Necessidade de Capital de Giro (NCG)', async () => {
    const wc = await controller.getWorkingCapital('tenant-01');

    expect(wc.prazoMedioRecebimentoDias).toBe(14);
    expect(wc.prazoMedioPagamentoDias).toBe(22);
    expect(wc.cicloFinanceiroDias).toBe(-8); // PMR - PMP = 14 - 22 = -8 dias
    expect(wc.capitalGiroNecessarioCents).toBeGreaterThan(0);
    expect(wc.capitalGiroDisponivelCents).toBeGreaterThan(0);
    expect(wc.folgaOuDeficitCents).toBeDefined();
    expect(wc.recomendacaoOperacional).toBeDefined();
  });

  // 8. CENTRAL DE PREMISSAS VERSIONADAS (v1.0 -> v1.1)
  it('CF-08: deve consultar e versionar premissas financeiras com auditoria', () => {
    const active = controller.getAssumptions();
    expect(active.version).toBe('v1.0');
    expect(active.selicAnualPercentual).toBe(10.75);
    expect(active.cdiAnualPercentual).toBe(10.65);

    const updated = controller.updateAssumptions({
      assumptions: { selicAnualPercentual: 11.25, cdiAnualPercentual: 11.15 },
      updatedBy: 'diretor-financeiro-auditor',
      notes: 'Atualização pós-reunião do COPOM',
    });

    expect(updated.version).toBe('v1.1');
    expect(updated.selicAnualPercentual).toBe(11.25);
    expect(updated.updatedBy).toBe('diretor-financeiro-auditor');
  });

  // 9. PREVISTO vs REALIZADO & BACKTESTING DE ACURÁCIA
  it('CF-09: deve confrontar previsão histórica com realizado e calcular MAPE e acurácia', () => {
    const report = controller.getBacktesting('tenant-01');

    expect(report.samplesCount).toBe(10);
    expect(report.mapePercent).toBeLessThan(5); // MAPE de mercado < 5%
    expect(report.accuracyScorePercent).toBeGreaterThan(95); // Acurácia > 95%
    expect(report.modelHealth).toBe('EXCELENTE');
    expect(report.calibrationNotes).toContain('Acurácia média global');
  });

  // 10. VISÃO 360º CONSOLIDADA
  it('CF-10: deve retornar a visão 360º de previsão de caixa integrando todos os blocos', async () => {
    const overview = await controller.getOverview('BASE', 'tenant-01');

    expect(overview.position).toBeDefined();
    expect(overview.horizons.length).toBe(6);
    expect(overview.gaps).toBeDefined();
    expect(overview.workingCapital).toBeDefined();
    expect(overview.assumptions).toBeDefined();
    expect(overview.backtesting).toBeDefined();
  });
});

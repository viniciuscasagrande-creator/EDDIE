// apps/api/src/modules/financial-planning/financial-planning.spec.ts
// EDDIE 11.28 — FP&A, Budgeting & Multi-Year Financial Planning Unit Tests

import { describe, it, expect, beforeEach } from 'vitest';
import { FinancialPlanningService } from './financial-planning.service';

describe('FinancialPlanningService (EDDIE 11.28)', () => {
  let service: FinancialPlanningService;

  beforeEach(() => {
    service = new FinancialPlanningService();
  });

  it('deve retornar a Visão Geral de FP&A com indicadores de orçamento, receita e EBITDA consolidados', async () => {
    const overview = await service.getOverview();

    expect(overview).toBeDefined();
    expect(overview.currentYear).toBe(2026);
    expect(overview.currentQuarter).toBe('Q3');
    expect(overview.totalAnnualBudgetCents).toBeGreaterThan(0);
    expect(overview.totalActualSpentCents).toBeGreaterThan(0);
    expect(overview.budgetConsumptionPercent).toBeGreaterThan(0);
    expect(overview.projectedAnnualRevenueCents).toBeGreaterThan(0);
    expect(overview.realizedRevenueCents).toBeGreaterThan(0);
    expect(overview.realizedEbitdaCents).toBeGreaterThan(0);
    expect(overview.ebitdaMarginPercent).toBeGreaterThan(30); // ~35.7%
    expect(['FAVORAVEL', 'NEUTRO', 'DESFAVORAVEL', 'CRITICO']).toContain(
      overview.globalVarianceStatus,
    );
  });

  it('deve listar todos os Centros de Custo e detalhar um Centro de Custo específico', async () => {
    const costCenters = await service.getCostCenters();
    expect(costCenters.length).toBe(5);

    const cc100 = await service.getCostCenter('CC-100');
    expect(cc100).toBeDefined();
    expect(cc100.code).toBe('CC-100');
    expect(cc100.category).toBe('OPERACOES_EVENTOS');
    expect(cc100.annualBudgetCents).toBe(420000000); // R$ 4.200.000,00
    expect(cc100.availableCents).toBeGreaterThan(0);
    expect(cc100.status).toBe('DENTRO_ORCAMENTO');
  });

  it('deve ajustar o teto orçamentário de um Centro de Custo e recalcular a utilização', async () => {
    const code = 'CC-300';
    const updated = await service.adjustCostCenterBudget(code, {
      newBudgetCents: 400000000, // R$ 4.000.000,00 (+ R$ 500k)
      reason: 'Ampliação do orçamento para campanhas de Black Friday',
      approvedBy: 'cfo-diretor-financeiro',
    });

    expect(updated.annualBudgetCents).toBe(400000000);
    // Consumo = (230M realizado + 30M comprometido) / 400M = 65%
    expect(updated.utilizationPercent).toBe(65.0);
    expect(updated.status).toBe('DENTRO_ORCAMENTO');
    expect(updated.availableCents).toBe(140000000); // 400M - 260M
  });

  it('deve rejeitar ajuste de orçamento com valor negativo ou zero', async () => {
    await expect(
      service.adjustCostCenterBudget('CC-100', {
        newBudgetCents: 0,
        reason: 'Teste inválido',
        approvedBy: 'auditor',
      }),
    ).rejects.toThrow('O novo orçamento deve ser maior que zero');
  });

  it('deve retornar análise de desvios orçamentários (Budget vs Actual / Variâncias)', async () => {
    const variances = await service.getVariances();
    expect(variances.length).toBeGreaterThanOrEqual(4);

    const cloudVar = variances.find((v) => v.id === 'var-001');
    expect(cloudVar).toBeDefined();
    expect(cloudVar?.costCenterCode).toBe('CC-200');
    expect(cloudVar?.status).toBe('DESFAVORAVEL');
    expect(cloudVar?.varianceCents).toBe(14000000); // + R$ 140.000,00
    expect(cloudVar?.variancePercent).toBeCloseTo(7.78, 1);

    const opsVar = variances.find((v) => v.id === 'var-002');
    expect(opsVar).toBeDefined();
    expect(opsVar?.status).toBe('FAVORAVEL');
    expect(opsVar?.varianceCents).toBe(-15000000); // Economia de R$ 150.000,00
  });

  it('deve calcular a margem de contribuição por categoria de evento com rentabilidade consistente', async () => {
    const margins = await service.getContributionMargins();
    expect(margins.length).toBe(4);

    const festivais = margins.find((m) => m.category === 'FESTIVAIS');
    expect(festivais).toBeDefined();
    expect(festivais?.grossMerchandiseValueCents).toBe(4500000000);
    expect(festivais?.grossRevenueCents).toBe(540000000);
    expect(festivais?.contributionMarginCents).toBe(420000000); // 5.4M - 1.2M
    expect(festivais?.marginPercent).toBeCloseTo(77.78, 1);

    const teatros = margins.find((m) => m.category === 'TEATROS_ESPETACULOS');
    expect(teatros?.marginPercent).toBe(80.0);
  });

  it('deve gerar o plano financeiro plurianual (2026 a 2028) com crescimento composto', async () => {
    const plan = await service.getMultiYearPlan();

    expect(plan).toBeDefined();
    expect(plan.baseYear).toBe(2026);
    expect(plan.points.length).toBe(3);

    const [y2026, y2027, y2028] = plan.points;
    expect(y2026!.year).toBe(2026);
    expect(y2027!.year).toBe(2027);
    expect(y2028!.year).toBe(2028);

    // Crescimento consistente de GMV e Receita
    expect(y2027!.projectedGrossRevenueCents).toBeGreaterThan(y2026!.projectedGrossRevenueCents);
    expect(y2028!.projectedGrossRevenueCents).toBeGreaterThan(y2027!.projectedGrossRevenueCents);
    expect(y2028!.ebitdaMarginPercent).toBeGreaterThan(y2026!.ebitdaMarginPercent); // Alavancagem operacional
  });

  it('deve suportar simulações de estresse no planejamento plurianual com parâmetros customizados', async () => {
    const plan = await service.getMultiYearPlan({
      customGrowthRatePercent: 15.0, // Crescimento mais conservador
      inflationStressPercent: 2.0,   // Inflação pressionando OPEX
    });

    expect(plan.cagrPercent).toBe(15.0);
    expect(plan.macroAssumptions.inflationIpcaPercent).toBe(6.25); // 4.25 + 2.0
    expect(plan.points.length).toBe(3);
  });
});

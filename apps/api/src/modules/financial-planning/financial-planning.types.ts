// apps/api/src/modules/financial-planning/financial-planning.types.ts
// EDDIE 11.28 — FP&A, Budgeting & Multi-Year Financial Planning Types

export type TipoDespesa = 'OPEX' | 'CAPEX';

export type StatusVariancia = 'FAVORAVEL' | 'NEUTRO' | 'DESFAVORAVEL' | 'CRITICO';

export type CategoriaCentroCusto =
  | 'OPERACOES_EVENTOS'
  | 'TECNOLOGIA_PLATAFORMA'
  | 'MARKETING_AQUISICAO'
  | 'COMERCIAL_B2B'
  | 'ADMINISTRATIVO_FINANCEIRO';

export interface CostCenterBudget {
  code: string;
  name: string;
  category: CategoriaCentroCusto;
  responsible: string;
  annualBudgetCents: number;
  actualSpentCents: number;
  committedCents: number;
  availableCents: number;
  utilizationPercent: number;
  status: 'DENTRO_ORCAMENTO' | 'ALERTA_AMARELO' | 'ESTOURO_BLOQUEADO';
}

export interface BudgetItemVariance {
  id: string;
  costCenterCode: string;
  costCenterName: string;
  rubric: string;
  type: TipoDespesa;
  budgetedCents: number;
  actualCents: number;
  forecastRevisedCents: number;
  varianceCents: number;
  variancePercent: number;
  status: StatusVariancia;
  explanation?: string;
}

export interface ContributionMarginCategory {
  category: string;
  grossMerchandiseValueCents: number; // GMV
  grossRevenueCents: number;          // Receita de conveniência/taxas da plataforma
  directCostsCents: number;           // Gateway, antifraude, suporte de campo, infraestrutura
  contributionMarginCents: number;    // grossRevenue - directCosts
  marginPercent: number;              // (contributionMargin / grossRevenue) * 100
  eventsCount: number;
  ticketsSoldCount: number;
}

export interface MultiYearProjectionPoint {
  year: number;
  projectedGmvCents: number;
  projectedGrossRevenueCents: number;
  projectedOpexCents: number;
  projectedCapexCents: number;
  projectedEbitdaCents: number;
  ebitdaMarginPercent: number;
  growthRatePercent: number;
}

export interface MultiYearPlanSummary {
  baseYear: number;
  cagrPercent: number;
  points: MultiYearProjectionPoint[];
  macroAssumptions: {
    inflationIpcaPercent: number;
    selicAvgPercent: number;
    marketExpansionRatePercent: number;
  };
}

export interface AdjustBudgetRequest {
  newBudgetCents: number;
  reason: string;
  approvedBy: string;
}

export interface SimulateMultiYearRequest {
  baseYear?: number;
  customGrowthRatePercent?: number;
  inflationStressPercent?: number;
}

export interface FinancialPlanningOverview {
  currentYear: number;
  currentQuarter: string;
  totalAnnualBudgetCents: number;
  totalActualSpentCents: number;
  totalCommittedCents: number;
  budgetConsumptionPercent: number;
  projectedAnnualRevenueCents: number;
  realizedRevenueCents: number;
  projectedEbitdaCents: number;
  realizedEbitdaCents: number;
  ebitdaMarginPercent: number;
  globalVarianceStatus: StatusVariancia;
  criticalVariancesCount: number;
}

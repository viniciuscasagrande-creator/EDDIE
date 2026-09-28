// apps/api/src/modules/financial-planning/financial-planning.service.ts
// EDDIE 11.28 — FP&A, Budgeting & Multi-Year Financial Planning Service

import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.module';
import {
  CostCenterBudget,
  BudgetItemVariance,
  ContributionMarginCategory,
  MultiYearPlanSummary,
  MultiYearProjectionPoint,
  FinancialPlanningOverview,
  AdjustBudgetRequest,
  SimulateMultiYearRequest,
  StatusVariancia,
} from './financial-planning.types';

@Injectable()
export class FinancialPlanningService {
  private readonly logger = new Logger(FinancialPlanningService.name);

  // Armazenamento em memória para centros de custo e rubricas orçamentárias
  private readonly costCenters: Map<string, CostCenterBudget> = new Map();
  private readonly variances: Map<string, BudgetItemVariance> = new Map();

  constructor(private readonly prisma: PrismaService = new PrismaService()) {
    this.seedInitialFpaState();
  }

  private seedInitialFpaState(): void {
    // Inicialização dos Centros de Custo (2026)
    const initialCostCenters: CostCenterBudget[] = [
      {
        code: 'CC-100',
        name: 'Operações & Logística de Portaria',
        category: 'OPERACOES_EVENTOS',
        responsible: 'gerente-operacoes-field',
        annualBudgetCents: 420000000, // R$ 4.200.000,00
        actualSpentCents: 285000000, // R$ 2.850.000,00
        committedCents: 45000000,    // R$ 450.000,00
        availableCents: 90000000,    // R$ 900.000,00
        utilizationPercent: 78.57,
        status: 'DENTRO_ORCAMENTO',
      },
      {
        code: 'CC-200',
        name: 'Tecnologia, Cloud & IA',
        category: 'TECNOLOGIA_PLATAFORMA',
        responsible: 'head-eng-plataforma',
        annualBudgetCents: 680000000, // R$ 6.800.000,00
        actualSpentCents: 590000000, // R$ 5.900.000,00
        committedCents: 60000000,    // R$ 600.000,00
        availableCents: 30000000,    // R$ 300.000,00
        utilizationPercent: 95.59,
        status: 'ALERTA_AMARELO',
      },
      {
        code: 'CC-300',
        name: 'Marketing & Performance CAPI',
        category: 'MARKETING_AQUISICAO',
        responsible: 'head-growth-marketing',
        annualBudgetCents: 350000000, // R$ 3.500.000,00
        actualSpentCents: 230000000, // R$ 2.300.000,00
        committedCents: 30000000,    // R$ 300.000,00
        availableCents: 90000000,    // R$ 900.000,00
        utilizationPercent: 74.29,
        status: 'DENTRO_ORCAMENTO',
      },
      {
        code: 'CC-400',
        name: 'Comercial B2B & Key Accounts',
        category: 'COMERCIAL_B2B',
        responsible: 'diretor-comercial-novos-negocios',
        annualBudgetCents: 240000000, // R$ 2.400.000,00
        actualSpentCents: 165000000, // R$ 1.650.000,00
        committedCents: 20000000,    // R$ 200.000,00
        availableCents: 55000000,    // R$ 550.000,00
        utilizationPercent: 77.08,
        status: 'DENTRO_ORCAMENTO',
      },
      {
        code: 'CC-500',
        name: 'Administrativo, FP&A, Riscos & Legal',
        category: 'ADMINISTRATIVO_FINANCEIRO',
        responsible: 'cfo-diretor-financeiro',
        annualBudgetCents: 210000000, // R$ 2.100.000,00
        actualSpentCents: 140000000, // R$ 1.400.000,00
        committedCents: 15000000,    // R$ 150.000,00
        availableCents: 55000000,    // R$ 550.000,00
        utilizationPercent: 73.81,
        status: 'DENTRO_ORCAMENTO',
      },
    ];

    for (const cc of initialCostCenters) {
      this.costCenters.set(cc.code, cc);
    }

    // Inicialização das Rubricas de Variância (Orçado vs Realizado)
    const initialVariances: BudgetItemVariance[] = [
      {
        id: 'var-001',
        costCenterCode: 'CC-200',
        costCenterName: 'Tecnologia, Cloud & IA',
        rubric: 'Infraestrutura Cloud (AWS & Google Cloud)',
        type: 'OPEX',
        budgetedCents: 180000000, // R$ 1.800.000,00
        actualCents: 194000000,   // R$ 1.940.000,00 (+7.7%)
        forecastRevisedCents: 195000000,
        varianceCents: 14000000,
        variancePercent: 7.78,
        status: 'DESFAVORAVEL',
        explanation: 'Expansão de clusters Kubernetes e banco vetorial pgvector para assistente IA.',
      },
      {
        id: 'var-002',
        costCenterCode: 'CC-100',
        costCenterName: 'Operações & Logística de Portaria',
        rubric: 'Manutenção e Locação de Catracas Online',
        type: 'OPEX',
        budgetedCents: 120000000, // R$ 1.200.000,00
        actualCents: 105000000,   // R$ 1.050.000,00 (-12.5%)
        forecastRevisedCents: 110000000,
        varianceCents: -15000000,
        variancePercent: -12.5,
        status: 'FAVORAVEL',
        explanation: 'Otimização logística de frete e renegociação de contrato mestre de locação.',
      },
      {
        id: 'var-003',
        costCenterCode: 'CC-300',
        costCenterName: 'Marketing & Performance CAPI',
        rubric: 'Mídia Paga & Ativação de Tráfego CAPI',
        type: 'OPEX',
        budgetedCents: 150000000, // R$ 1.500.000,00
        actualCents: 152000000,   // R$ 1.520.000,00 (+1.3%)
        forecastRevisedCents: 150000000,
        varianceCents: 2000000,
        variancePercent: 1.33,
        status: 'NEUTRO',
        explanation: 'Campanhas em linha com a meta de conversão ROAS 4.8x.',
      },
      {
        id: 'var-004',
        costCenterCode: 'CC-200',
        costCenterName: 'Tecnologia, Cloud & IA',
        rubric: 'Hardware & Coletores de Validação Offline',
        type: 'CAPEX',
        budgetedCents: 90000000,  // R$ 900.000,00
        actualCents: 85000000,    // R$ 850.000,00
        forecastRevisedCents: 88000000,
        varianceCents: -5000000,
        variancePercent: -5.56,
        status: 'FAVORAVEL',
        explanation: 'Aquisição em lote com desconto de escala em fabricantes homologados.',
      },
    ];

    for (const v of initialVariances) {
      this.variances.set(v.id, v);
    }
  }

  /**
   * Visão Geral Executiva 360º de FP&A, Orçamento e Indicadores de Desempenho.
   */
  async getOverview(): Promise<FinancialPlanningOverview> {
    const costCenters = Array.from(this.costCenters.values());
    const totalAnnualBudgetCents = costCenters.reduce((acc, cc) => acc + cc.annualBudgetCents, 0);
    const totalActualSpentCents = costCenters.reduce((acc, cc) => acc + cc.actualSpentCents, 0);
    const totalCommittedCents = costCenters.reduce((acc, cc) => acc + cc.committedCents, 0);

    const budgetConsumptionPercent =
      totalAnnualBudgetCents > 0
        ? Number((((totalActualSpentCents + totalCommittedCents) / totalAnnualBudgetCents) * 100).toFixed(2))
        : 0;

    // Receita de conveniência/taxas e EBITDA
    const projectedAnnualRevenueCents = 1246000000; // R$ 12.460.000,00
    const realizedRevenueCents = 918000000;         // R$ 9.180.000,00 (73.6% atingido)
    const projectedEbitdaCents = 416000000;          // R$ 4.160.000,00
    const realizedEbitdaCents = 328000000;           // R$ 3.280.000,00 (Margem 35.7%)

    const ebitdaMarginPercent =
      realizedRevenueCents > 0
        ? Number(((realizedEbitdaCents / realizedRevenueCents) * 100).toFixed(2))
        : 0;

    const criticalVariancesCount = Array.from(this.variances.values()).filter(
      (v) => v.status === 'CRITICO' || v.status === 'DESFAVORAVEL',
    ).length;

    let globalVarianceStatus: StatusVariancia = 'NEUTRO';
    if (criticalVariancesCount > 2 || budgetConsumptionPercent > 95) {
      globalVarianceStatus = 'CRITICO';
    } else if (criticalVariancesCount > 0 || budgetConsumptionPercent > 85) {
      globalVarianceStatus = 'DESFAVORAVEL';
    } else if (budgetConsumptionPercent < 80) {
      globalVarianceStatus = 'FAVORAVEL';
    }

    return {
      currentYear: 2026,
      currentQuarter: 'Q3',
      totalAnnualBudgetCents,
      totalActualSpentCents,
      totalCommittedCents,
      budgetConsumptionPercent,
      projectedAnnualRevenueCents,
      realizedRevenueCents,
      projectedEbitdaCents,
      realizedEbitdaCents,
      ebitdaMarginPercent,
      globalVarianceStatus,
      criticalVariancesCount,
    };
  }

  /**
   * Lista todos os Centros de Custo com consumo e teto orçamentário.
   */
  async getCostCenters(): Promise<CostCenterBudget[]> {
    return Array.from(this.costCenters.values());
  }

  /**
   * Detalhamento de um Centro de Custo específico.
   */
  async getCostCenter(code: string): Promise<CostCenterBudget> {
    const cc = this.costCenters.get(code);
    if (!cc) {
      throw new NotFoundException(`Centro de Custo ${code} não encontrado`);
    }
    return cc;
  }

  /**
   * Ajuste de teto orçamentário de um Centro de Custo (Revisão Orçamentária).
   */
  async adjustCostCenterBudget(
    code: string,
    req: AdjustBudgetRequest,
  ): Promise<CostCenterBudget> {
    const cc = this.costCenters.get(code);
    if (!cc) {
      throw new NotFoundException(`Centro de Custo ${code} não encontrado`);
    }

    if (req.newBudgetCents <= 0) {
      throw new BadRequestException('O novo orçamento deve ser maior que zero');
    }

    const previousBudget = cc.annualBudgetCents;
    cc.annualBudgetCents = req.newBudgetCents;
    cc.availableCents = Math.max(
      0,
      cc.annualBudgetCents - (cc.actualSpentCents + cc.committedCents),
    );
    cc.utilizationPercent = Number(
      (((cc.actualSpentCents + cc.committedCents) / cc.annualBudgetCents) * 100).toFixed(2),
    );

    if (cc.utilizationPercent >= 100) {
      cc.status = 'ESTOURO_BLOQUEADO';
    } else if (cc.utilizationPercent >= 85) {
      cc.status = 'ALERTA_AMARELO';
    } else {
      cc.status = 'DENTRO_ORCAMENTO';
    }

    this.logger.log(
      `Orçamento do Centro de Custo ${code} revisado de R$ ${(previousBudget / 100).toFixed(2)} para R$ ${(req.newBudgetCents / 100).toFixed(2)} por ${req.approvedBy} (${req.reason})`,
    );

    return cc;
  }

  /**
   * Análise de Desvios Orçamentários (Budget vs Actual / Variâncias).
   */
  async getVariances(): Promise<BudgetItemVariance[]> {
    return Array.from(this.variances.values());
  }

  /**
   * Margem de Contribuição por Categoria de Evento.
   */
  async getContributionMargins(): Promise<ContributionMarginCategory[]> {
    return [
      {
        category: 'FESTIVAIS',
        grossMerchandiseValueCents: 4500000000, // R$ 45.000.000,00
        grossRevenueCents: 540000000,          // R$ 5.400.000,00 (12% take-rate)
        directCostsCents: 120000000,           // R$ 1.200.000,00
        contributionMarginCents: 420000000,    // R$ 4.200.000,00
        marginPercent: 77.78,
        eventsCount: 4,
        ticketsSoldCount: 280000,
      },
      {
        category: 'SHOWS_NACIONAIS_INTERNACIONAIS',
        grossMerchandiseValueCents: 3200000000, // R$ 32.000.000,00
        grossRevenueCents: 416000000,          // R$ 4.160.000,00 (13% take-rate)
        directCostsCents: 98000000,            // R$ 980.000,00
        contributionMarginCents: 318000000,    // R$ 3.180.000,00
        marginPercent: 76.44,
        eventsCount: 12,
        ticketsSoldCount: 195000,
      },
      {
        category: 'TEATROS_ESPETACULOS',
        grossMerchandiseValueCents: 1200000000, // R$ 12.000.000,00
        grossRevenueCents: 180000000,          // R$ 1.800.000,00 (15% take-rate)
        directCostsCents: 36000000,            // R$ 360.000,00
        contributionMarginCents: 144000000,    // R$ 1.440.000,00
        marginPercent: 80.0,
        eventsCount: 28,
        ticketsSoldCount: 85000,
      },
      {
        category: 'ESPORTES_CORPORATIVO',
        grossMerchandiseValueCents: 850000000,  // R$ 8.500.000,00
        grossRevenueCents: 110000000,          // R$ 1.100.000,00 (12.9% take-rate)
        directCostsCents: 21000000,            // R$ 210.000,00
        contributionMarginCents: 89000000,     // R$ 890.000,00
        marginPercent: 80.91,
        eventsCount: 9,
        ticketsSoldCount: 42000,
      },
    ];
  }

  /**
   * Modelo de Planejamento Financeiro Plurianual (2026 a 2028).
   */
  async getMultiYearPlan(
    req?: SimulateMultiYearRequest,
  ): Promise<MultiYearPlanSummary> {
    const growthRate = req?.customGrowthRatePercent ?? 30.0; // 30% a.a. baseline
    const inflationModifier = (req?.inflationStressPercent ?? 0) / 100;

    const baseYear = req?.baseYear ?? 2026;
    const baseGmv = 9750000000;      // R$ 97.5M GMV 2026
    const baseRevenue = 1246000000;  // R$ 12.46M Receita 2026
    const baseOpex = 650000000;      // R$ 6.5M OPEX 2026
    const baseCapex = 180000000;     // R$ 1.8M CAPEX 2026

    const points: MultiYearProjectionPoint[] = [];

    for (let i = 0; i < 3; i++) {
      const year = baseYear + i;
      const compoundFactor = Math.pow(1 + (growthRate / 100), i);
      const costFactor = Math.pow(1 + 0.18 + inflationModifier, i); // Ganho de escala: custo cresce menos que a receita

      const projectedGmvCents = Math.round(baseGmv * compoundFactor);
      const projectedGrossRevenueCents = Math.round(baseRevenue * compoundFactor);
      const projectedOpexCents = Math.round(baseOpex * costFactor);
      const projectedCapexCents = Math.round(baseCapex * Math.pow(1.10, i));

      const projectedEbitdaCents = projectedGrossRevenueCents - (projectedOpexCents + projectedCapexCents);
      const ebitdaMarginPercent = Number(
        ((projectedEbitdaCents / projectedGrossRevenueCents) * 100).toFixed(2),
      );

      points.push({
        year,
        projectedGmvCents,
        projectedGrossRevenueCents,
        projectedOpexCents,
        projectedCapexCents,
        projectedEbitdaCents,
        ebitdaMarginPercent,
        growthRatePercent: i === 0 ? 0 : growthRate,
      });
    }

    return {
      baseYear,
      cagrPercent: growthRate,
      points,
      macroAssumptions: {
        inflationIpcaPercent: 4.25 + (req?.inflationStressPercent ?? 0),
        selicAvgPercent: 10.75,
        marketExpansionRatePercent: 18.5,
      },
    };
  }
}

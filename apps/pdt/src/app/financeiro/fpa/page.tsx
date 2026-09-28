'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  PieChart,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  RefreshCcw,
  Sliders,
  Building2,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Percent,
  Activity,
  FileSpreadsheet,
  ShieldCheck,
  Loader2,
  Info,
  ChevronRight,
  BarChart3,
  Briefcase,
} from 'lucide-react';
import { formatBRL, formatPercent } from '../../../lib/utils';

export type TipoDespesa = 'OPEX' | 'CAPEX';
export type StatusVariancia = 'FAVORAVEL' | 'NEUTRO' | 'DESFAVORAVEL' | 'CRITICO';

export interface CostCenterBudget {
  code: string;
  name: string;
  category: string;
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
  grossMerchandiseValueCents: number;
  grossRevenueCents: number;
  directCostsCents: number;
  contributionMarginCents: number;
  marginPercent: number;
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

export default function FinancialPlanningFPAPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'centers' | 'variances' | 'margins' | 'multiyear'>('centers');

  // Estado calibrado operacional
  const [overview, setOverview] = useState<FinancialPlanningOverview>({
    currentYear: 2026,
    currentQuarter: 'Q3',
    totalAnnualBudgetCents: 1900000000,
    totalActualSpentCents: 1410000000,
    totalCommittedCents: 170000000,
    budgetConsumptionPercent: 83.16,
    projectedAnnualRevenueCents: 1246000000,
    realizedRevenueCents: 918000000,
    projectedEbitdaCents: 416000000,
    realizedEbitdaCents: 328000000,
    ebitdaMarginPercent: 35.73,
    globalVarianceStatus: 'NEUTRO',
    criticalVariancesCount: 1,
  });

  const [costCenters, setCostCenters] = useState<CostCenterBudget[]>([
    {
      code: 'CC-100',
      name: 'Operações & Logística de Portaria',
      category: 'OPERACOES_EVENTOS',
      responsible: 'gerente-operacoes-field',
      annualBudgetCents: 420000000,
      actualSpentCents: 285000000,
      committedCents: 45000000,
      availableCents: 90000000,
      utilizationPercent: 78.57,
      status: 'DENTRO_ORCAMENTO',
    },
    {
      code: 'CC-200',
      name: 'Tecnologia, Cloud & IA',
      category: 'TECNOLOGIA_PLATAFORMA',
      responsible: 'head-eng-plataforma',
      annualBudgetCents: 680000000,
      actualSpentCents: 590000000,
      committedCents: 60000000,
      availableCents: 30000000,
      utilizationPercent: 95.59,
      status: 'ALERTA_AMARELO',
    },
    {
      code: 'CC-300',
      name: 'Marketing & Performance CAPI',
      category: 'MARKETING_AQUISICAO',
      responsible: 'head-growth-marketing',
      annualBudgetCents: 350000000,
      actualSpentCents: 230000000,
      committedCents: 30000000,
      availableCents: 90000000,
      utilizationPercent: 74.29,
      status: 'DENTRO_ORCAMENTO',
    },
    {
      code: 'CC-400',
      name: 'Comercial B2B & Key Accounts',
      category: 'COMERCIAL_B2B',
      responsible: 'diretor-comercial-novos-negocios',
      annualBudgetCents: 240000000,
      actualSpentCents: 165000000,
      committedCents: 20000000,
      availableCents: 55000000,
      utilizationPercent: 77.08,
      status: 'DENTRO_ORCAMENTO',
    },
    {
      code: 'CC-500',
      name: 'Administrativo, FP&A, Riscos & Legal',
      category: 'ADMINISTRATIVO_FINANCEIRO',
      responsible: 'cfo-diretor-financeiro',
      annualBudgetCents: 210000000,
      actualSpentCents: 140000000,
      committedCents: 15000000,
      availableCents: 55000000,
      utilizationPercent: 73.81,
      status: 'DENTRO_ORCAMENTO',
    },
  ]);

  const [variances, setVariances] = useState<BudgetItemVariance[]>([
    {
      id: 'var-001',
      costCenterCode: 'CC-200',
      costCenterName: 'Tecnologia, Cloud & IA',
      rubric: 'Infraestrutura Cloud (AWS & Google Cloud)',
      type: 'OPEX',
      budgetedCents: 180000000,
      actualCents: 194000000,
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
      budgetedCents: 120000000,
      actualCents: 105000000,
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
      budgetedCents: 150000000,
      actualCents: 152000000,
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
      budgetedCents: 90000000,
      actualCents: 85000000,
      forecastRevisedCents: 88000000,
      varianceCents: -5000000,
      variancePercent: -5.56,
      status: 'FAVORAVEL',
      explanation: 'Aquisição em lote com desconto de escala em fabricantes homologados.',
    },
  ]);

  const [margins, setMargins] = useState<ContributionMarginCategory[]>([
    {
      category: 'FESTIVAIS',
      grossMerchandiseValueCents: 4500000000,
      grossRevenueCents: 540000000,
      directCostsCents: 120000000,
      contributionMarginCents: 420000000,
      marginPercent: 77.78,
      eventsCount: 4,
      ticketsSoldCount: 280000,
    },
    {
      category: 'SHOWS_NACIONAIS_INTERNACIONAIS',
      grossMerchandiseValueCents: 3200000000,
      grossRevenueCents: 416000000,
      directCostsCents: 98000000,
      contributionMarginCents: 318000000,
      marginPercent: 76.44,
      eventsCount: 12,
      ticketsSoldCount: 195000,
    },
    {
      category: 'TEATROS_ESPETACULOS',
      grossMerchandiseValueCents: 1200000000,
      grossRevenueCents: 180000000,
      directCostsCents: 36000000,
      contributionMarginCents: 144000000,
      marginPercent: 80.0,
      eventsCount: 28,
      ticketsSoldCount: 85000,
    },
    {
      category: 'ESPORTES_CORPORATIVO',
      grossMerchandiseValueCents: 850000000,
      grossRevenueCents: 110000000,
      directCostsCents: 21000000,
      contributionMarginCents: 89000000,
      marginPercent: 80.91,
      eventsCount: 9,
      ticketsSoldCount: 42000,
    },
  ]);

  const [multiYear, setMultiYear] = useState<MultiYearPlanSummary>({
    baseYear: 2026,
    cagrPercent: 30.0,
    points: [
      {
        year: 2026,
        projectedGmvCents: 9750000000,
        projectedGrossRevenueCents: 1246000000,
        projectedOpexCents: 650000000,
        projectedCapexCents: 180000000,
        projectedEbitdaCents: 416000000,
        ebitdaMarginPercent: 33.39,
        growthRatePercent: 0,
      },
      {
        year: 2027,
        projectedGmvCents: 12675000000,
        projectedGrossRevenueCents: 1619800000,
        projectedOpexCents: 767000000,
        projectedCapexCents: 198000000,
        projectedEbitdaCents: 654800000,
        ebitdaMarginPercent: 40.42,
        growthRatePercent: 30,
      },
      {
        year: 2028,
        projectedGmvCents: 16477500000,
        projectedGrossRevenueCents: 2105740000,
        projectedOpexCents: 905060000,
        projectedCapexCents: 217800000,
        projectedEbitdaCents: 982880000,
        ebitdaMarginPercent: 46.68,
        growthRatePercent: 30,
      },
    ],
    macroAssumptions: {
      inflationIpcaPercent: 4.25,
      selicAvgPercent: 10.75,
      marketExpansionRatePercent: 18.5,
    },
  });

  const [simulating, setSimulating] = useState(false);
  const [customCagr, setCustomCagr] = useState(30);

  const carregarDados = useCallback(async () => {
    setLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);

    try {
      const [resOverview, resCenters, resVariances, resMargins] = await Promise.all([
        fetch('/api/financial-planning/overview', { signal: controller.signal }),
        fetch('/api/financial-planning/cost-centers', { signal: controller.signal }),
        fetch('/api/financial-planning/variances', { signal: controller.signal }),
        fetch('/api/financial-planning/margins', { signal: controller.signal }),
      ]);

      if (resOverview.ok) setOverview(await resOverview.json());
      if (resCenters.ok) setCostCenters(await resCenters.json());
      if (resVariances.ok) setVariances(await resVariances.json());
      if (resMargins.ok) setMargins(await resMargins.json());
    } catch {
      // Resiliente
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void carregarDados();
  }, [carregarDados]);

  const simularPlanoPlurianual = async (cagr: number) => {
    setSimulating(true);
    try {
      const res = await fetch('/api/financial-planning/multi-year/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customGrowthRatePercent: cagr }),
      });
      if (res.ok) {
        setMultiYear(await res.json());
      }
    } catch {
      // Local fallback recalculation
      const baseGmv = 9750000000;
      const baseRev = 1246000000;
      const baseOpex = 650000000;
      const baseCapex = 180000000;

      const points: MultiYearProjectionPoint[] = [0, 1, 2].map((i) => {
        const factor = Math.pow(1 + cagr / 100, i);
        const costFactor = Math.pow(1.18, i);
        const gmv = Math.round(baseGmv * factor);
        const rev = Math.round(baseRev * factor);
        const opex = Math.round(baseOpex * costFactor);
        const capex = Math.round(baseCapex * Math.pow(1.1, i));
        const ebitda = rev - (opex + capex);
        return {
          year: 2026 + i,
          projectedGmvCents: gmv,
          projectedGrossRevenueCents: rev,
          projectedOpexCents: opex,
          projectedCapexCents: capex,
          projectedEbitdaCents: ebitda,
          ebitdaMarginPercent: Number(((ebitda / rev) * 100).toFixed(2)),
          growthRatePercent: i === 0 ? 0 : cagr,
        };
      });

      setMultiYear((prev) => ({
        ...prev,
        cagrPercent: cagr,
        points,
      }));
    } finally {
      setSimulating(false);
    }
  };

  const getStatusBadge = (status: CostCenterBudget['status']) => {
    switch (status) {
      case 'DENTRO_ORCAMENTO':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">DENTRO DO ORÇAMENTO</span>;
      case 'ALERTA_AMARELO':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">ALERTA (&gt; 85%)</span>;
      case 'ESTOURO_BLOQUEADO':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">ESTOURO (&gt; 100%)</span>;
    }
  };

  const getVarianceBadge = (status: StatusVariancia) => {
    switch (status) {
      case 'FAVORAVEL':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">FAVORÁVEL</span>;
      case 'NEUTRO':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">NEUTRO</span>;
      case 'DESFAVORAVEL':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">DESFAVORÁVEL</span>;
      case 'CRITICO':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">CRÍTICO</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <PieChart className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Planejamento Financeiro, Orçamento & Projeção Plurianual (FP&A)
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Planejamento Financeiro
                </span>
              </h1>
              <p className="text-sm text-slate-400">
                Centros de Custo (OPEX/CAPEX), Análise Orçado × Realizado, Margem de Contribuição e Projeção 2026-2028
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => void carregarDados()}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 transition"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          <Link
            href="/financeiro/riscos"
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 transition"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            Risco Financeiro
          </Link>
          <Link
            href="/financeiro/liquidez"
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium shadow-sm transition"
          >
            <Layers className="w-4 h-4" />
            Previsão de Caixa
          </Link>
        </div>
      </div>

      {/* 4 Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Consumo Orçamentário Global */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Consumo Orçamentário ({overview.currentQuarter})</span>
            <DollarSign className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {formatBRL(overview.totalActualSpentCents + overview.totalCommittedCents)}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800">
            <span>Teto Anual: {formatBRL(overview.totalAnnualBudgetCents)}</span>
            <span className="font-bold text-amber-400">{overview.budgetConsumptionPercent}%</span>
          </div>
        </div>

        {/* Card 2: Receita de Conveniência/Taxas */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Receita Líquida Plataforma</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {formatBRL(overview.realizedRevenueCents)}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800">
            <span>Meta Anual: {formatBRL(overview.projectedAnnualRevenueCents)}</span>
            <span className="text-emerald-400 font-medium">73.6% atingido</span>
          </div>
        </div>

        {/* Card 3: EBITDA e Margem Operacional */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">EBITDA Realizado</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400 flex items-center gap-2">
            {formatBRL(overview.realizedEbitdaCents)}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800">
            <span>Margem EBITDA:</span>
            <span className="font-bold text-white">{overview.ebitdaMarginPercent}%</span>
          </div>
        </div>

        {/* Card 4: Status de Variância Global */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Status Orçado × Realizado</span>
            <FileSpreadsheet className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-sm font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {overview.globalVarianceStatus}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800">
            <span>Desvios Críticos:</span>
            <span className="font-bold text-amber-400">{overview.criticalVariancesCount} sob monitoramento</span>
          </div>
        </div>
      </div>

      {/* Navegação por Abas */}
      <div className="flex border-b border-slate-800 space-x-1">
        <button
          onClick={() => setActiveTab('centers')}
          className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition flex items-center gap-2 ${
            activeTab === 'centers'
              ? 'bg-slate-900 text-white border-t border-x border-slate-800'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Centros de Custo ({costCenters.length})
        </button>

        <button
          onClick={() => setActiveTab('variances')}
          className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition flex items-center gap-2 ${
            activeTab === 'variances'
              ? 'bg-slate-900 text-white border-t border-x border-slate-800'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Orçado × Realizado / Variâncias ({variances.length})
        </button>

        <button
          onClick={() => setActiveTab('margins')}
          className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition flex items-center gap-2 ${
            activeTab === 'margins'
              ? 'bg-slate-900 text-white border-t border-x border-slate-800'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Percent className="w-4 h-4" />
          Margem de Contribuição por Categoria
        </button>

        <button
          onClick={() => setActiveTab('multiyear')}
          className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition flex items-center gap-2 ${
            activeTab === 'multiyear'
              ? 'bg-slate-900 text-white border-t border-x border-slate-800'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Plano Plurianual (2026 – 2028)
        </button>
      </div>

      {/* Aba 1: Centros de Custo */}
      {activeTab === 'centers' && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Estrutura de Centros de Custo & Alocação Orçamentária</h2>
            <span className="text-xs text-slate-400">Tetos configurados para o exercício de 2026 com travas em 85% e 100%</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase font-medium border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Código / Centro de Custo</th>
                  <th className="py-3 px-4">Responsável</th>
                  <th className="py-3 px-4 text-right">Orçamento Anual</th>
                  <th className="py-3 px-4 text-right">Realizado</th>
                  <th className="py-3 px-4 text-right">Comprometido</th>
                  <th className="py-3 px-4 text-right">Saldo Disponível</th>
                  <th className="py-3 px-4 text-center">Consumo</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {costCenters.map((cc) => (
                  <tr key={cc.code} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white flex items-center gap-2">
                        <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-800 text-teal-400 border border-slate-700">
                          {cc.code}
                        </span>
                        {cc.name}
                      </div>
                      <div className="text-xs text-slate-500">{cc.category}</div>
                    </td>

                    <td className="py-3 px-4 text-slate-400 font-mono text-xs">{cc.responsible}</td>

                    <td className="py-3 px-4 text-right font-medium">{formatBRL(cc.annualBudgetCents)}</td>
                    <td className="py-3 px-4 text-right text-slate-300 font-medium">{formatBRL(cc.actualSpentCents)}</td>
                    <td className="py-3 px-4 text-right text-amber-400">{formatBRL(cc.committedCents)}</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-400">{formatBRL(cc.availableCents)}</td>

                    <td className="py-3 px-4 text-center">
                      <div className="w-24 mx-auto">
                        <div className="flex justify-between text-xs mb-1">
                          <span className={cc.utilizationPercent > 85 ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                            {cc.utilizationPercent}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full ${
                              cc.utilizationPercent >= 100
                                ? 'bg-rose-500'
                                : cc.utilizationPercent >= 85
                                ? 'bg-amber-500'
                                : 'bg-teal-500'
                            }`}
                            style={{ width: `${Math.min(100, cc.utilizationPercent)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(cc.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Aba 2: Análise de Desvios Orçamentários */}
      {activeTab === 'variances' && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Análise de Desvios Orçamentários (Budget vs Actual)</h2>
            <span className="text-xs text-slate-400">Classificação automática com base na tolerância prudencial de desvios</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase font-medium border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Rubrica Orçamentária</th>
                  <th className="py-3 px-4">Centro de Custo</th>
                  <th className="py-3 px-4 text-center">Tipo</th>
                  <th className="py-3 px-4 text-right">Orçado</th>
                  <th className="py-3 px-4 text-right">Realizado</th>
                  <th className="py-3 px-4 text-right">Forecast Revisado</th>
                  <th className="py-3 px-4 text-right">Variância (R$)</th>
                  <th className="py-3 px-4 text-center">Desvio (%)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {variances.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{v.rubric}</div>
                      {v.explanation && (
                        <div className="text-xs text-slate-400 italic mt-0.5">"{v.explanation}"</div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {v.costCenterCode}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        v.type === 'OPEX' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-purple-500/20 text-purple-300'
                      }`}>
                        {v.type}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-medium">{formatBRL(v.budgetedCents)}</td>
                    <td className="py-3 px-4 text-right font-medium text-white">{formatBRL(v.actualCents)}</td>
                    <td className="py-3 px-4 text-right text-slate-400">{formatBRL(v.forecastRevisedCents)}</td>

                    <td className={`py-3 px-4 text-right font-bold ${
                      v.varianceCents > 0 ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      {v.varianceCents > 0 ? `+${formatBRL(v.varianceCents)}` : formatBRL(v.varianceCents)}
                    </td>

                    <td className={`py-3 px-4 text-center font-bold font-mono text-xs ${
                      v.variancePercent > 5 ? 'text-rose-400' : v.variancePercent < 0 ? 'text-emerald-400' : 'text-slate-300'
                    }`}>
                      {v.variancePercent > 0 ? `+${v.variancePercent}%` : `${v.variancePercent}%`}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {getVarianceBadge(v.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Aba 3: Margem de Contribuição por Categoria */}
      {activeTab === 'margins' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {margins.map((m) => (
            <div key={m.category} className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-base">{m.category.replace(/_/g, ' ')}</h3>
                  <div className="text-xs text-slate-400">
                    {m.eventsCount} eventos realizados • {m.ticketsSoldCount.toLocaleString('pt-BR')} ingressos
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {m.marginPercent}% Margem
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400">GMV Transacionado:</span>
                  <div className="font-bold text-white mt-0.5">{formatBRL(m.grossMerchandiseValueCents)}</div>
                </div>
                <div>
                  <span className="text-slate-400">Receita Plataforma:</span>
                  <div className="font-bold text-teal-400 mt-0.5">{formatBRL(m.grossRevenueCents)}</div>
                </div>
                <div>
                  <span className="text-slate-400">Custos Diretos:</span>
                  <div className="font-bold text-rose-400 mt-0.5">{formatBRL(m.directCostsCents)}</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-300 font-medium">Margem de Contribuição Líquida:</span>
                <span className="text-sm font-extrabold text-emerald-400">{formatBRL(m.contributionMarginCents)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Aba 4: Plano Plurianual (2026 - 2028) */}
      {activeTab === 'multiyear' && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-teal-400" />
                Planejamento Financeiro Plurianual (2026 – 2028)
              </h2>
              <p className="text-xs text-slate-400">
                Modelo de escala de plataforma com alavancagem operacional e projeções de EBITDA.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">CAGR Projeção:</span>
              <div className="flex items-center gap-2">
                {[20, 30, 40].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => {
                      setCustomCagr(rate);
                      void simularPlanoPlurianual(rate);
                    }}
                    className={`px-3 py-1 text-xs font-semibold rounded border transition ${
                      customCagr === rate
                        ? 'bg-teal-600 text-white border-teal-500'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {rate}% a.a.
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase font-medium border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Exercício</th>
                  <th className="py-3 px-4 text-right">GMV Projetado</th>
                  <th className="py-3 px-4 text-right">Receita Plataforma</th>
                  <th className="py-3 px-4 text-right">OPEX Projetado</th>
                  <th className="py-3 px-4 text-right">CAPEX Projetado</th>
                  <th className="py-3 px-4 text-right">EBITDA Projetado</th>
                  <th className="py-3 px-4 text-center">Margem EBITDA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {multiYear.points.map((pt) => (
                  <tr key={pt.year} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-teal-400" />
                      Ano {pt.year}
                      {pt.year === 2026 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          BASE
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right font-medium">{formatBRL(pt.projectedGmvCents)}</td>
                    <td className="py-3 px-4 text-right font-bold text-teal-400">{formatBRL(pt.projectedGrossRevenueCents)}</td>
                    <td className="py-3 px-4 text-right text-slate-300">{formatBRL(pt.projectedOpexCents)}</td>
                    <td className="py-3 px-4 text-right text-purple-400">{formatBRL(pt.projectedCapexCents)}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-emerald-400">{formatBRL(pt.projectedEbitdaCents)}</td>

                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {pt.ebitdaMarginPercent}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
            <span className="font-semibold text-slate-200">Premissas Macroeconômicas em Vigor:</span>
            <p>
              Inflação IPCA Projetada: {multiYear.macroAssumptions.inflationIpcaPercent}% • Taxa Selic Média: {multiYear.macroAssumptions.selicAvgPercent}% • Expansão do Mercado de Eventos no Brasil: {multiYear.macroAssumptions.marketExpansionRatePercent}% a.a.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

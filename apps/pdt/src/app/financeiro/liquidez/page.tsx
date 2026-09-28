'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  RefreshCcw,
  Sliders,
  DollarSign,
  ShieldCheck,
  ChevronRight,
  Loader2,
  Info,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Activity,
  Percent,
} from 'lucide-react';
import { formatBRL, formatNumber } from '../../../lib/utils';
import { StatusFeedback } from '../../../components/ui/StatusFeedback';

export type ForecastHorizon = 'D1' | 'D7' | 'D15' | 'D30' | 'D60' | 'D90';
export type ForecastScenario = 'BASE' | 'CONSERVADOR' | 'OTIMISTA' | 'CUSTOMIZADO';

export interface SegregatedCashPosition {
  tenantId: string;
  asOfTimestamp: string;
  saldoBancarioRealCents: number;
  saldoLedgerCents: number;
  saldoDisponivelCents: number;
  valorReservadoCents: number;
  valorEmLiquidacaoCents: number;
  valorProjetadoCents: number;
  resumoSegregacao: string;
}

export interface HorizonCashflowPoint {
  horizon: ForecastHorizon;
  date: string;
  daysFromNow: number;
  inflows: {
    pixReceivablesCents: number;
    creditCardSettledCents: number;
    creditCardFutureD30Cents: number;
    sponsorshipsCents: number;
    totalInflowsCents: number;
  };
  outflows: {
    producerScheduledPayoutsCents: number;
    supplierPayablesCents: number;
    gatewayProcessingFeesCents: number;
    cdcRefundsProvisionCents: number;
    totalOutflowsCents: number;
  };
  netCashflowCents: number;
  startingAvailableBalanceCents: number;
  projectedEndingBalanceCents: number;
  minimumSafetyReserveCents: number;
  liquidityGapCents: number;
  hasDeficitRisk: boolean;
  statusAlerta: 'VERDE' | 'AMARELO' | 'VERMELHO';
  scenario: ForecastScenario;
}

export interface LiquidityGapAlert {
  id: string;
  horizon: ForecastHorizon;
  date: string;
  deficitCents: number;
  severity: 'VERDE' | 'AMARELO' | 'VERMELHO';
  rootCause: string;
  recommendedAction: string;
}

export interface WorkingCapitalMetrics {
  prazoMedioRecebimentoDias: number;
  prazoMedioPagamentoDias: number;
  cicloFinanceiroDias: number;
  capitalGiroNecessarioCents: number;
  capitalGiroDisponivelCents: number;
  folgaOuDeficitCents: number;
  alertaCapitalGiro: 'VERDE' | 'AMARELO' | 'VERMELHO';
  recomendacaoOperacional: string;
}

export interface BacktestingReport {
  periodStart: string;
  periodEnd: string;
  samplesCount: number;
  mapePercent: number;
  accuracyScorePercent: number;
  modelHealth: 'EXCELENTE' | 'ACEITAVEL' | 'DESCALIBRADO';
  calibrationNotes: string;
}

export interface VersionedAssumptions {
  version: string;
  selicAnualPercentual: number;
  cdiAnualPercentual: number;
  taxaDesagioAntecipacaoMensalPercentual: number;
  taxaEstornoEstimadaPercentual: number;
  updatedAt: string;
  updatedBy: string;
}

export default function CashForecastLiquidityPage() {
  const [loading, setLoading] = useState(true);
  const [scenario, setScenario] = useState<ForecastScenario>('BASE');
  const [position, setPosition] = useState<SegregatedCashPosition | null>({
    tenantId: '00000000-0000-0000-0000-000000000001',
    asOfTimestamp: new Date().toISOString(),
    saldoBancarioRealCents: 185420000,
    saldoLedgerCents: 212500000,
    saldoDisponivelCents: 142000000,
    valorReservadoCents: 12500000,
    valorEmLiquidacaoCents: 30920000,
    valorProjetadoCents: 84500000,
    resumoSegregacao: 'Segregação de 6 dimensões ativas.',
  });
  const [horizons, setHorizons] = useState<HorizonCashflowPoint[]>([]);
  const [gaps, setGaps] = useState<LiquidityGapAlert[]>([]);
  const [workingCapital, setWorkingCapital] = useState<WorkingCapitalMetrics | null>(null);
  const [backtesting, setBacktesting] = useState<BacktestingReport | null>(null);
  const [assumptions, setAssumptions] = useState<VersionedAssumptions | null>(null);

  // Sliders customizados
  const [showSimulator, setShowSimulator] = useState(false);
  const [customVendas, setCustomVendas] = useState(0);
  const [customEstorno, setCustomEstorno] = useState(0);
  const [customPrazo, setCustomPrazo] = useState(0);

  const carregarDados = useCallback(async () => {
    setLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);

    try {
      const res = await fetch(`/api/cash-forecast/overview?scenario=${scenario}`, {
        signal: controller.signal,
      });

      if (res.ok) {
        const data = await res.json();
        setPosition(data.position);
        setHorizons(data.horizons || []);
        setGaps(data.gaps || []);
        setWorkingCapital(data.workingCapital || null);
        setBacktesting(data.backtesting || null);
        setAssumptions(data.assumptions || null);
      }
    } catch {
      // Resiliente
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  }, [scenario]);

  useEffect(() => {
    void carregarDados();
  }, [carregarDados]);

  const aplicarSimulacaoCustomizada = async () => {
    setScenario('CUSTOMIZADO');
    setLoading(true);
    try {
      const res = await fetch('/api/cash-forecast/scenarios/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: 'CUSTOMIZADO',
          customParams: {
            taxaCrescimentoVendasPercentual: customVendas,
            estresseEstornoPercentual: customEstorno,
            variacaoPrazoRecebimentoDias: customPrazo,
          },
        }),
      });
      if (res.ok) {
        const points = await res.json();
        setHorizons(points);
      }
    } catch {
      // Resiliente
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* 1. HEADER & BREADCRUMBS */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/financeiro" className="hover:text-white transition">Financeiro</Link>
          <ChevronRight size={12} />
          <span className="text-emerald-400 font-medium">Cash Forecast, Liquidez & Working Capital (11.26)</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Centro de Liquidez & Previsão Financeira
              </h1>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                EDDIE 11.26
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Horizontes D+1 a D+90, segregação absoluta dos 6 saldos, cenários de estresse e backtesting estatístico.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Seletor de Cenário */}
            <div className="flex rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-xs font-medium">
              {(['BASE', 'CONSERVADOR', 'OTIMISTA'] as ForecastScenario[]).map((sc) => (
                <button
                  key={sc}
                  onClick={() => setScenario(sc)}
                  className={`px-3 py-1.5 rounded-md transition ${
                    scenario === sc
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {sc}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowSimulator(!showSimulator)}
              className={`text-xs px-3 py-2 rounded-lg border flex items-center gap-1.5 transition ${
                showSimulator
                  ? 'bg-purple-600 text-white border-purple-500'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <Sliders size={13} />
              <span>Simulador</span>
            </button>

            <button
              onClick={() => void carregarDados()}
              disabled={loading}
              className="text-xs text-slate-300 hover:text-white px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 flex items-center gap-1.5 transition"
            >
              <RefreshCcw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Atualizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. REGRA INVIOLÁVEL: OS 6 SALDOS SEGREGADOS */}
      {position && (
        <div className="bg-[#111827] rounded-2xl border border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Matriz Inviolável de Segregação dos 6 Saldos
                </h3>
                <p className="text-xs text-slate-400">
                  Regra Regulatória: Saldo bancário ≠ Ledger ≠ Disponível ≠ Reservado ≠ Em Liquidação ≠ Projetado
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              Atualizado: {new Date(position.asOfTimestamp).toLocaleTimeString('pt-BR')} UTC
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[11px]">1. Saldo Bancário Real</span>
              <span className="text-base font-bold text-white block">{formatBRL(position.saldoBancarioRealCents)}</span>
              <span className="text-[10px] text-slate-500 block">Extrato físico contas BB/Itaú</span>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[11px]">2. Saldo Ledger (11.19)</span>
              <span className="text-base font-bold text-sky-400 block">{formatBRL(position.saldoLedgerCents)}</span>
              <span className="text-[10px] text-slate-500 block">Patrimônio contábil apurado</span>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-emerald-500/30 space-y-1">
              <span className="text-emerald-400 block font-semibold text-[11px]">3. Saldo Disponível</span>
              <span className="text-lg font-black text-emerald-400 block">{formatBRL(position.saldoDisponivelCents)}</span>
              <span className="text-[10px] text-emerald-500 block">Único elegível para repasse</span>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[11px]">4. Valor Reservado</span>
              <span className="text-base font-bold text-amber-400 block">{formatBRL(position.valorReservadoCents)}</span>
              <span className="text-[10px] text-slate-500 block">Retenção CDC e Chargeback</span>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[11px]">5. Em Liquidação</span>
              <span className="text-base font-bold text-blue-400 block">{formatBRL(position.valorEmLiquidacaoCents)}</span>
              <span className="text-[10px] text-slate-500 block">Lotes CNAB/Pix em trânsito</span>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-purple-500/20 space-y-1">
              <span className="text-purple-400 block font-medium text-[11px]">6. Valor Projetado</span>
              <span className="text-base font-bold text-purple-300 block">{formatBRL(position.valorProjetadoCents)}</span>
              <span className="text-[10px] text-rose-400 font-semibold block">NÃO compõe saldo sacável</span>
            </div>
          </div>
        </div>
      )}

      {/* SIMULADOR CUSTOMIZADO RETRÁTIL */}
      {showSimulator && (
        <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
            <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
              <Sliders size={16} />
              <span>Simulador Paramétrico de Estresse (Cenário Customizado)</span>
            </div>
            <button
              onClick={() => void aplicarSimulacaoCustomizada()}
              disabled={loading}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition flex items-center gap-1"
            >
              {loading ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
              <span>Recalcular Cenário</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span>Variação de Vendas:</span>
                <span className="font-bold text-purple-400">{customVendas}%</span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                step="5"
                value={customVendas}
                onChange={(e) => setCustomVendas(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span>Estresse de Estorno CDC:</span>
                <span className="font-bold text-purple-400">+{customEstorno}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={customEstorno}
                onChange={(e) => setCustomEstorno(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span>Variação Prazo Adquirente:</span>
                <span className="font-bold text-purple-400">{customPrazo} dias</span>
              </div>
              <input
                type="range"
                min="-10"
                max="20"
                step="1"
                value={customPrazo}
                onChange={(e) => setCustomPrazo(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. OS 6 HORIZONTES TEMPORAIS (D+1 A D+90) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Projeção de Fluxo de Caixa por Horizonte Temporal
            </h3>
            <p className="text-xs text-slate-400">
              Projeções líquidas de D+1 a D+90 comparadas contra a Reserva Mínima de Segurança (R$ 250.000,00)
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-semibold border border-slate-700">
            Cenário: {scenario}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {horizons.map((h) => {
            const isDeficit = h.statusAlerta === 'VERMELHO';
            const isWarning = h.statusAlerta === 'AMARELO';

            return (
              <div
                key={h.horizon}
                className={`p-5 rounded-2xl border transition-all ${
                  isDeficit
                    ? 'bg-rose-950/20 border-rose-500/40'
                    : isWarning
                    ? 'bg-amber-950/20 border-amber-500/40'
                    : 'bg-[#111827] border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-slate-800 text-white font-black text-xs flex items-center justify-center border border-slate-700">
                      {h.horizon}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {h.daysFromNow === 1 ? 'Amanhã (D+1)' : `Em ${h.daysFromNow} dias`}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(h.date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    isDeficit
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                      : isWarning
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  }`}>
                    {h.statusAlerta}
                  </span>
                </div>

                {/* Métricas do Horizonte */}
                <div className="py-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <ArrowUpRight size={13} className="text-emerald-400" />
                      <span>Entradas Totais:</span>
                    </span>
                    <span className="font-semibold text-emerald-400">{formatBRL(h.inflows.totalInflowsCents)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <ArrowDownRight size={13} className="text-rose-400" />
                      <span>Saídas Totais:</span>
                    </span>
                    <span className="font-semibold text-rose-400">{formatBRL(h.outflows.totalOutflowsCents)}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                    <span className="text-slate-400">Fluxo Líquido:</span>
                    <span className={`font-bold ${h.netCashflowCents >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatBRL(h.netCashflowCents)}
                    </span>
                  </div>

                  <div className="pt-1 flex items-center justify-between font-bold">
                    <span className="text-slate-300">Saldo Final Projetado:</span>
                    <span className="text-white text-sm">{formatBRL(h.projectedEndingBalanceCents)}</span>
                  </div>
                </div>

                {h.hasDeficitRisk && (
                  <div className="pt-2 border-t border-slate-800/80 text-[11px] text-rose-400 flex items-center gap-1.5 font-semibold">
                    <AlertTriangle size={13} />
                    <span>Déficit de reserva: {formatBRL(h.liquidityGapCents)}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. CAPITAL DE GIRO & ALERTAS DE GAPS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Working Capital */}
        {workingCapital && (
          <div className="bg-[#111827] rounded-2xl border border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
              <Activity size={18} className="text-emerald-400" />
              <h3 className="text-base font-bold text-white tracking-tight">
                Capital de Giro & Ciclo Financeiro (NCG)
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[11px]">PMR (Recebimento)</span>
                <span className="text-sm font-bold text-white">{workingCapital.prazoMedioRecebimentoDias} dias</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[11px]">PMP (Pagamento)</span>
                <span className="text-sm font-bold text-white">{workingCapital.prazoMedioPagamentoDias} dias</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[11px]">Ciclo Financeiro</span>
                <span className="text-sm font-bold text-emerald-400">{workingCapital.cicloFinanceiroDias} dias</span>
              </div>
            </div>

            <div className="space-y-2 text-xs pt-1">
              <div className="flex justify-between text-slate-300">
                <span>Necessidade de Capital de Giro (NCG):</span>
                <span className="font-bold text-white">{formatBRL(workingCapital.capitalGiroNecessarioCents)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Capital de Giro Disponível:</span>
                <span className="font-bold text-emerald-400">{formatBRL(workingCapital.capitalGiroDisponivelCents)}</span>
              </div>
              <div className="flex justify-between font-bold pt-1 border-t border-slate-800 text-sm">
                <span className="text-slate-200">Folga de Liquidez:</span>
                <span className="text-emerald-400">{formatBRL(workingCapital.folgaOuDeficitCents)}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 leading-relaxed">
              💡 {workingCapital.recomendacaoOperacional}
            </p>
          </div>
        )}

        {/* Backtesting de Acurácia */}
        {backtesting && (
          <div className="bg-[#111827] rounded-2xl border border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Percent size={18} className="text-sky-400" />
                <h3 className="text-base font-bold text-white tracking-tight">
                  Previsto × Realizado & Backtesting
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                Saúde: {backtesting.modelHealth}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[11px]">Acurácia Preditiva Média</span>
                <span className="text-lg font-black text-sky-400">{backtesting.accuracyScorePercent}%</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[11px]">Erro Médio Absoluto (MAPE)</span>
                <span className="text-lg font-black text-white">{backtesting.mapePercent}%</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed pt-1">
              {backtesting.calibrationNotes}
            </p>

            {assumptions && (
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span>Premissas Ativas: <b>{assumptions.version}</b> (Selic: {assumptions.selicAnualPercentual}%)</span>
                <span>Auditado por: {assumptions.updatedBy}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

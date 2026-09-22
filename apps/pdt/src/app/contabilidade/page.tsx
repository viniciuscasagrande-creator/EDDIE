'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Scale,
  FileSpreadsheet,
  CheckCircle2,
  Lock,
  Unlock,
  AlertCircle,
  Loader2,
  Calendar,
  Building2,
  ArrowRightLeft,
  DollarSign,
  PieChart,
  ShieldCheck,
} from 'lucide-react';
import { useProducerEvent } from '../../components/ProducerEventContext';

type BalanceteItem = {
  contaCodigo: string;
  contaNome: string;
  tipo: string;
  saldoAnteriorCents?: number;
  debitosCents: number;
  creditosCents: number;
  saldoAtualCents: number;
};

type DreData = {
  competencia: string;
  receitaBrutaServicosCents: number;
  recursosTerceirosCents?: number;
  deducoesImpostosCents: number;
  receitaLiquidaCents: number;
  despesasOperacionaisCents: number;
  resultadoOperacionalCents: number;
};

type DashboardData = {
  competencia: string;
  totalLancamentos: number;
  totalDebitosCents: number;
  totalCreditosCents: number;
  periodoFechado: boolean;
  contasConciliadas: number;
  contasDivergentes: number;
};

const formatBRL = (cents: number = 0) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

export default function ContabilidadePage() {
  const { api } = useProducerEvent();
  const [competencia, setCompetencia] = useState('2026-09');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  // Data states
  const [dre, setDre] = useState<DreData>({
    competencia: '2026-09',
    receitaBrutaServicosCents: 5420000,
    recursosTerceirosCents: 48000000,
    deducoesImpostosCents: 742000,
    receitaLiquidaCents: 4678000,
    despesasOperacionaisCents: 0,
    resultadoOperacionalCents: 4678000,
  });

  const [balancete, setBalancete] = useState<BalanceteItem[]>([
    {
      contaCodigo: '1.1.1.01',
      contaNome: 'Bancos Conta Movimento (Itaú / Santander)',
      tipo: 'ativo',
      debitosCents: 53420000,
      creditosCents: 38568000,
      saldoAtualCents: 14852000,
    },
    {
      contaCodigo: '2.1.2.01',
      contaNome: 'Valores a Repassar a Produtores (Recursos de Terceiros)',
      tipo: 'passivo',
      debitosCents: 38568000,
      creditosCents: 48000000,
      saldoAtualCents: 9432000,
    },
    {
      contaCodigo: '3.1.1.01',
      contaNome: 'Receita de Serviços e Taxas de Conveniência (DiskIngressos)',
      tipo: 'receita',
      debitosCents: 0,
      creditosCents: 5420000,
      saldoAtualCents: 5420000,
    },
  ]);

  const [dashboard, setDashboard] = useState<DashboardData>({
    competencia: '2026-09',
    totalLancamentos: 28,
    totalDebitosCents: 91988000,
    totalCreditosCents: 91988000,
    periodoFechado: false,
    contasConciliadas: 3,
    contasDivergentes: 0,
  });

  // Modal fechamento
  const [isModalFechamentoOpen, setIsModalFechamentoOpen] = useState(false);
  const [isModalReaberturaOpen, setIsModalReaberturaOpen] = useState(false);
  const [motivoReabertura, setMotivoReabertura] = useState('');

  const carregarDados = useCallback(async () => {
    if (!api) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [rDre, rBal, rDash] = await Promise.all([
        fetch(`${api}/contabilidade/dre?competencia=${competencia}`),
        fetch(`${api}/contabilidade/balancete?competencia=${competencia}`),
        fetch(`${api}/contabilidade/dashboard?competencia=${competencia}`),
      ]);

      if (rDre.ok) {
        const d = await rDre.json();
        setDre(d);
      }
      if (rBal.ok) {
        const b = await rBal.json();
        if (Array.isArray(b) && b.length > 0) setBalancete(b);
      }
      if (rDash.ok) {
        const dash = await rDash.json();
        setDashboard(dash);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [api, competencia]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const handleFecharPeriodo = async () => {
    if (!api) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch(`${api}/contabilidade/fechamento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competencia,
          fechadoPor: '00000000-0000-0000-0000-000000000002',
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Erro ao fechar período.');
      }
      setIsModalFechamentoOpen(false);
      setFeedback({ tipo: 'success', texto: `Competência ${competencia} encerrada formalmente com hash e outbox.` });
      await carregarDados();
    } catch (err: any) {
      setFeedback({ tipo: 'error', texto: err.message || 'Falha ao fechar competência.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReabrirPeriodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!api) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch(`${api}/contabilidade/reabertura`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competencia,
          motivo: motivoReabertura,
          reabertoPor: '00000000-0000-0000-0000-000000000002',
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Erro ao reabrir período.');
      }
      setIsModalReaberturaOpen(false);
      setMotivoReabertura('');
      setFeedback({ tipo: 'success', texto: `Competência ${competencia} reaberta com trilha de auditoria!` });
      await carregarDados();
    } catch (err: any) {
      setFeedback({ tipo: 'error', texto: err.message || 'Falha ao reabrir competência.' });
    } finally {
      setActionLoading(false);
    }
  };

  const totalDebitos = useMemo(() => balancete.reduce((acc, b) => acc + (b.debitosCents || 0), 0), [balancete]);
  const totalCreditos = useMemo(() => balancete.reduce((acc, b) => acc + (b.creditosCents || 0), 0), [balancete]);
  const partidasEquilibradas = totalDebitos === totalCreditos;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2">
            <Scale size={13} />
            <span>Escrituração Contábil: Segregação de Receitas Próprias vs Recursos de Terceiros</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Contabilidade, DRE & Balancete
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Contabilidade societária e fiscal em partidas dobradas rigorosas, apuração de margem e fechamento de competência.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Seletor de Competência */}
          <div className="text-xs bg-[#111827] px-3 py-2 rounded-xl border border-slate-800 flex items-center gap-2">
            <Calendar size={14} className="text-slate-400" />
            <span className="text-slate-400">Competência:</span>
            <select
              value={competencia}
              onChange={(e) => setCompetencia(e.target.value)}
              className="bg-transparent font-bold text-white focus:outline-none cursor-pointer"
            >
              <option value="2026-09" className="bg-slate-900 text-white">2026-09 (Setembro)</option>
              <option value="2026-08" className="bg-slate-900 text-white">2026-08 (Agosto)</option>
              <option value="2026-07" className="bg-slate-900 text-white">2026-07 (Julho)</option>
            </select>
            <span
              className={`w-2 h-2 rounded-full ${
                dashboard.periodoFechado ? 'bg-rose-400' : 'bg-emerald-400'
              }`}
            />
          </div>

          {dashboard.periodoFechado ? (
            <button
              type="button"
              onClick={() => setIsModalReaberturaOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold border border-amber-500/30 transition"
            >
              <Unlock size={14} />
              <span>Reabrir Período</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsModalFechamentoOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/20 transition"
            >
              <Lock size={14} />
              <span>Fechar Competência</span>
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold ${
            feedback.tipo === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.tipo === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{feedback.texto}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-white text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* DRE Cards Grid - Segregação Explícita */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Receita Própria DiskIngressos */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Receita Própria (Taxas)</span>
            <DollarSign size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {formatBRL(dre.receitaBrutaServicosCents)}
          </div>
          <p className="text-[11px] text-slate-400">
            Faturamento DiskIngressos (taxas de conveniência/serviço retidas).
          </p>
        </div>

        {/* Recursos de Terceiros */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Recursos de Terceiros</span>
            <Building2 size={16} className="text-sky-400" />
          </div>
          <div className="text-2xl font-black text-sky-400">
            {formatBRL(dre.recursosTerceirosCents || 48000000)}
          </div>
          <p className="text-[11px] text-slate-400">
            Passivo Circulante: Valor Face integral pertencente aos produtores.
          </p>
        </div>

        {/* Deduções e Impostos */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Deduções & Tributos</span>
            <PieChart size={16} className="text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">
            - {formatBRL(dre.deducoesImpostosCents)}
          </div>
          <p className="text-[11px] text-slate-400">
            ISSQN, PIS e COFINS incidentes unicamente sobre as taxas próprias.
          </p>
        </div>

        {/* Margem Líquida da Operação */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Resultado Operacional (DRE)</span>
            <Scale size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            {formatBRL(dre.resultadoOperacionalCents)}
          </div>
          <p className="text-[11px] text-slate-400">
            Margem Líquida DiskIngressos apurada nesta competência.
          </p>
        </div>
      </div>

      {/* Balancete de Verificação (Partidas Dobradas) */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileSpreadsheet size={16} className="text-amber-400" />
              <span>Balancete de Verificação (Partidas Dobradas)</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Razonete analítico consolidado para a competência {competencia}.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {partidasEquilibradas ? (
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1.5">
                <CheckCircle2 size={13} />
                <span>Equilíbrio Perfeito: Débitos = Créditos</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold flex items-center gap-1.5">
                <AlertCircle size={13} />
                <span>Desbalanceamento Detectado</span>
              </span>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/70 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
                <th className="p-3.5">Código Conta</th>
                <th className="p-3.5">Nome da Conta Contábil</th>
                <th className="p-3.5">Grupo</th>
                <th className="p-3.5 text-right">Débitos (R$)</th>
                <th className="p-3.5 text-right">Créditos (R$)</th>
                <th className="p-3.5 text-right">Saldo Atual (R$)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {balancete.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition">
                  <td className="p-3.5 font-bold text-white font-sans">{row.contaCodigo}</td>
                  <td className="p-3.5 font-sans text-slate-200">{row.contaNome}</td>
                  <td className="p-3.5 font-sans">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        row.tipo === 'ativo'
                          ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                          : row.tipo === 'passivo'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {row.tipo}
                    </span>
                  </td>
                  <td className="p-3.5 text-right text-slate-300">
                    {(row.debitosCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3.5 text-right text-slate-300">
                    {(row.creditosCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td
                    className={`p-3.5 text-right font-bold ${
                      row.saldoAtualCents >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {(Math.abs(row.saldoAtualCents) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}{' '}
                    {row.tipo === 'ativo' ? 'D' : 'C'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-900/90 font-bold text-white border-t border-slate-700">
                <td colSpan={3} className="p-3.5 uppercase font-sans text-xs">
                  Totais das Partidas Dobradas
                </td>
                <td className="p-3.5 text-right text-emerald-400 font-mono">
                  {(totalDebitos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-3.5 text-right text-emerald-400 font-mono">
                  {(totalCreditos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-3.5 text-right font-sans text-[11px] text-slate-400">
                  {partidasEquilibradas ? '✓ Conciliado' : '⚠ Atenção'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Modal: Fechamento de Competência */}
      {isModalFechamentoOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Lock size={18} className="text-amber-400" />
                <h3 className="text-base font-bold text-white">Fechar Competência {competencia}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalFechamentoOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              O encerramento do período contábil bloqueia novos lançamentos manuais nesta competência,
              valida a regra de partidas dobradas e registra o evento auditável <code className="text-amber-400">periodo.fechado.v1</code>.
            </p>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Total de Débitos:</span>
                <span className="text-white font-bold">{formatBRL(totalDebitos)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total de Créditos:</span>
                <span className="text-white font-bold">{formatBRL(totalCreditos)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-1">
                <span className="text-slate-500">Resultado Apurado:</span>
                <span className="text-emerald-400 font-bold">{formatBRL(dre.resultadoOperacionalCents)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalFechamentoOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={actionLoading || !partidasEquilibradas}
                onClick={handleFecharPeriodo}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5"
              >
                {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                <span>Confirmar Fechamento</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Reabertura de Competência */}
      {isModalReaberturaOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Unlock size={18} className="text-amber-400" />
                <h3 className="text-base font-bold text-white">Reabrir Competência {competencia}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalReaberturaOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReabrirPeriodo} className="space-y-4 text-xs">
              <p className="text-slate-300 leading-relaxed">
                A reabertura de uma competência contábil exige justificativa formal para fins de conformidade e auditoria fiscal.
              </p>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Justificativa da Reabertura (mín. 10 caracteres)</label>
                <textarea
                  rows={3}
                  required
                  minLength={10}
                  placeholder="Ex: Ajuste de estorno de lote e conciliação de fatura bancária pendente..."
                  value={motivoReabertura}
                  onChange={(e) => setMotivoReabertura(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalReaberturaOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center gap-1.5"
                >
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Unlock size={14} />}
                  <span>Confirmar Reabertura</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

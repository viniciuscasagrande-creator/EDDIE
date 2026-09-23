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
  Plus,
  RefreshCcw,
  BookOpen,
  HelpCircle,
  TrendingUp,
  Landmark,
  Layers,
  Search,
} from 'lucide-react';
import { useProducerEvent } from '../../components/ProducerEventContext';
import OperationalPanel from '../../components/OperationalPanel';
import AccountingEnterprisePanel from '../../components/AccountingEnterprisePanel';
import AccountingDashboardCharts from '../../components/AccountingDashboardCharts';
import { ModuleNavigation } from '../../components/navigation/ModuleNavigation';
import { CompactOperationalAlert } from '../../components/navigation/CompactOperationalAlert';

type TabView = 'centro_eventos' | 'dre' | 'balancete' | 'lancamentos' | 'conciliacao' | 'plano_contas' | 'fechamento' | 'demonstrativos' | 'auditoria' | 'painel_enterprise' | 'patrimonio' | 'fiscal' | 'recontabilizacao';

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

type CentroControleItem = {
  eventoId: string;
  eventoNome: string;
  statusEvento: string;
  categoria: string;
  competencia: string;
  fechamentoStatus: string;
  conciliacaoStatus: string;
  totalDebitosCents: number;
  totalCreditosCents: number;
  receitaPropriaCents: number;
  repassesTerceirosCents: number;
  alertas: string[];
};

type LancamentoContabilItem = {
  id: string;
  numeroLancamento: number;
  data: string;
  competencia: string;
  totalCents: number;
  historico: string;
  origemTipo: string;
  eventoId?: string | null;
  status: string;
  criadoPor: string;
  partidas: {
    id: string;
    tipo: string;
    valorCents: number;
    contaCodigo: string;
    contaNome: string;
    contaTipo: string;
    natureza: string;
  }[];
};

type ConciliacaoContabilItem = {
  id: string;
  contaCodigo: string;
  contaNome: string;
  competencia: string;
  saldoContabilCents: number;
  saldoExtratoCents: number;
  diferencaCents: number;
  status: string;
  observacoes?: string | null;
  conciliadoPor: string;
  conciliadoEm: string;
};

const formatBRL = (cents: number = 0) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

export default function ContabilidadePage() {
  const { api } = useProducerEvent();
  const [tab, setTab] = useState<TabView>('centro_eventos');
  const [competencia, setCompetencia] = useState('2026-09');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  // Dados
  const [dre, setDre] = useState<DreData>({
    competencia: '2026-09',
    receitaBrutaServicosCents: 0,
    recursosTerceirosCents: 0,
    deducoesImpostosCents: 0,
    receitaLiquidaCents: 0,
    despesasOperacionaisCents: 0,
    resultadoOperacionalCents: 0,
  });

  const [balancete, setBalancete] = useState<BalanceteItem[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData>({
    competencia: '2026-09',
    totalLancamentos: 0,
    totalDebitosCents: 0,
    totalCreditosCents: 0,
    periodoFechado: false,
    contasConciliadas: 0,
    contasDivergentes: 0,
  });

  const [centroControle, setCentroControle] = useState<CentroControleItem[]>([]);
  const [lancamentos, setLancamentos] = useState<LancamentoContabilItem[]>([]);
  const [conciliacoes, setConciliacoes] = useState<ConciliacaoContabilItem[]>([]);

  // Modais
  const [isModalFechamentoOpen, setIsModalFechamentoOpen] = useState(false);
  const [isModalReaberturaOpen, setIsModalReaberturaOpen] = useState(false);
  const [motivoReabertura, setMotivoReabertura] = useState('');
  const [isModalNovoLancamento, setIsModalNovoLancamento] = useState(false);

  // Form novo lançamento
  const [novoHistorico, setNovoHistorico] = useState('');
  const [novaData, setNovaData] = useState(new Date().toISOString().slice(0, 10));
  const [contaDebito, setContaDebito] = useState('1.1.1.01');
  const [contaCredito, setContaCredito] = useState('3.1.1.01');
  const [valorLancamento, setValorLancamento] = useState('');

  const carregarDados = useCallback(async () => {
    if (!api) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);

    try {
      const results = await Promise.allSettled([
        fetch(`${api}/contabilidade/dre?competencia=${competencia}`, { signal: controller.signal }),
        fetch(`${api}/contabilidade/balancete?competencia=${competencia}`, { signal: controller.signal }),
        fetch(`${api}/contabilidade/dashboard?competencia=${competencia}`, { signal: controller.signal }),
        fetch(`${api}/contabilidade/centro-controle-eventos?competencia=${competencia}`, { signal: controller.signal }),
        fetch(`${api}/contabilidade/lancamentos?competencia=${competencia}`, { signal: controller.signal }),
        fetch(`${api}/contabilidade/conciliacoes?competencia=${competencia}`, { signal: controller.signal }),
      ]);

      const [rDre, rBal, rDash, rCc, rLanc, rConc] = results;

      if (rDre.status === 'fulfilled' && rDre.value.ok) setDre(await rDre.value.json());
      if (rBal.status === 'fulfilled' && rBal.value.ok) {
        const b = await rBal.value.json();
        if (Array.isArray(b)) setBalancete(b);
        else if (Array.isArray(b.contas)) setBalancete(b.contas);
      }
      if (rDash.status === 'fulfilled' && rDash.value.ok) setDashboard(await rDash.value.json());
      if (rCc.status === 'fulfilled' && rCc.value.ok) {
        const cc = await rCc.value.json();
        if (Array.isArray(cc)) setCentroControle(cc);
        else if (Array.isArray(cc.matriz)) setCentroControle(cc.matriz);
        else if (Array.isArray(cc.items)) setCentroControle(cc.items);
      }
      if (rLanc.status === 'fulfilled' && rLanc.value.ok) {
        const ld = await rLanc.value.json();
        setLancamentos(Array.isArray(ld) ? ld : ld.lancamentos || []);
      }
      if (rConc.status === 'fulfilled' && rConc.value.ok) {
        const cd = await rConc.value.json();
        if (Array.isArray(cd)) setConciliacoes(cd);
      }

      const anySuccess = results.some((r) => r.status === 'fulfilled' && r.value.ok);
      const any503 = results.some((r) => r.status === 'fulfilled' && r.value.status === 503);
      if (!anySuccess && any503) {
        setFeedback({
          tipo: 'error',
          texto: 'API de Produção Offline (503). O backend de Contabilidade não está conectado no momento.',
        });
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setFeedback({
          tipo: 'error',
          texto: 'Tempo limite ao consultar o módulo de contabilidade.',
        });
      }
    } finally {
      clearTimeout(timer);
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

  const handleCriarLancamento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!api) return;
    setActionLoading(true);
    const valorCents = Math.round(Number(valorLancamento.replace(',', '.')) * 100);

    try {
      const res = await fetch(`${api}/contabilidade/lancamentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: new Date(novaData).toISOString(),
          competencia,
          historico: novoHistorico,
          origemTipo: 'manual',
          origemReferenciaId: `MAN-${Date.now()}`,
          criadoPor: 'contador-geral',
          partidas: [
            { tipo: 'D', contaCodigo: contaDebito, valorCents },
            { tipo: 'C', contaCodigo: contaCredito, valorCents },
          ],
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Erro ao criar lançamento.');
      }

      setFeedback({ tipo: 'success', texto: 'Lançamento em partidas dobradas registrado com sucesso!' });
      setIsModalNovoLancamento(false);
      setNovoHistorico('');
      setValorLancamento('');
      await carregarDados();
    } catch (err: any) {
      setFeedback({ tipo: 'error', texto: err.message || 'Falha ao gravar lançamento.' });
    } finally {
      setActionLoading(false);
    }
  };

  const totalDebitos = useMemo(() => balancete.reduce((acc, b) => acc + (b.debitosCents || 0), 0), [balancete]);
  const totalCreditos = useMemo(() => balancete.reduce((acc, b) => acc + (b.creditosCents || 0), 0), [balancete]);
  const partidasEquilibradas = totalDebitos === totalCreditos;

  return (
    <div className="space-y-6 max-w-[1550px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2">
            <Scale size={13} />
            <span>Escrituração Contábil: Segregação Rigorosa de Receita Própria vs Recursos de Terceiros</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Contabilidade, Centro de Controle & DRE
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Partidas dobradas imutáveis, centro de controle por evento, conciliação e fechamento formal de competência.
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
            <span className={`w-2 h-2 rounded-full ${dashboard.periodoFechado ? 'bg-rose-400' : 'bg-emerald-400'}`} />
          </div>

          {dashboard.periodoFechado ? (
            <button
              onClick={() => setIsModalReaberturaOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold hover:bg-rose-500/20 transition"
            >
              <Lock size={14} />
              <span>Competência Fechada (Reabrir)</span>
            </button>
          ) : (
            <button
              onClick={() => setIsModalFechamentoOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition"
            >
              <Unlock size={14} />
              <span>Encerrar Competência</span>
            </button>
          )}

          <button
            onClick={() => setIsModalNovoLancamento(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition"
          >
            <Plus size={14} /> Novo Lançamento
          </button>

          <button
            onClick={() => void carregarDados()}
            className="p-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300"
            title="Atualizar"
          >
            <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Module Navigation (Sem scroll horizontal) */}
      <ModuleNavigation
        items={[
          { id: 'painel_enterprise', label: 'Painel Contábil', icon: <PieChart size={15} /> },
          { id: 'centro_eventos', label: 'Centro de Eventos', icon: <Building2 size={15} /> },
          { id: 'dre', label: 'DRE Gerencial', icon: <FileSpreadsheet size={15} /> },
          { id: 'balancete', label: 'Balancete', icon: <Scale size={15} /> },
          { id: 'lancamentos', label: 'Livro Diário', icon: <BookOpen size={15} /> },
          { id: 'conciliacao', label: 'Conciliação Contábil', icon: <Landmark size={15} /> },
          { id: 'plano_contas', label: 'Plano de Contas', icon: <Layers size={15} /> },
          { id: 'fechamento', label: 'Fechamento Mensal', icon: <Lock size={15} /> },
          { id: 'demonstrativos', label: 'Demonstrativos', icon: <FileSpreadsheet size={15} /> },
          { id: 'auditoria', label: 'Auditoria Contábil', icon: <ShieldCheck size={15} /> },
          { id: 'patrimonio', label: 'Balanço Patrimonial', icon: <Landmark size={15} /> },
          { id: 'recontabilizacao', label: 'Recontabilização', icon: <RefreshCcw size={15} /> },
          { id: 'fiscal', label: 'Fiscal & NFS-e', icon: <FileSpreadsheet size={15} /> },
        ]}
        activeItem={tab}
        onSelect={(id) => setTab(id as TabView)}
        ariaLabel="Navegação do módulo Contábil"
      />

      {/* Toast Feedback / Alerta Operacional Compacto */}
      {feedback && (
        feedback.texto.includes('503') || feedback.texto.includes('Offline') ? (
          <div className="flex items-center justify-between py-1 px-1">
            <CompactOperationalAlert
              status="offline"
              title="API Contábil Offline (503)"
              detail={feedback.texto}
              onOpen={() => alert(feedback.texto)}
            />
            <button onClick={() => setFeedback(null)} className="text-xs text-slate-500 hover:text-white">
              Dispensar
            </button>
          </div>
        ) : (
          <div
            className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-3 ${
              feedback.tipo === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.tipo === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{feedback.texto}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">
              ✕
            </button>
          </div>
        )
      )}

      {loading ? (
        <div className="h-72 grid place-items-center text-slate-400">
          <Loader2 className="animate-spin text-amber-400" size={32} />
        </div>
      ) : (
        <>
          {/* TAB: CENTRO DE CONTROLE DE EVENTOS */}
          {tab === 'painel_enterprise' && <div className="space-y-5"><AccountingDashboardCharts centro={centroControle} balancete={balancete} dashboard={dashboard} onNavigate={setTab} /><AccountingEnterprisePanel api={api} competencia={competencia} kind="painel" /></div>}
          {tab === 'patrimonio' && <AccountingEnterprisePanel api={api} competencia={competencia} kind="patrimonio" />}
          {tab === 'recontabilizacao' && <AccountingEnterprisePanel api={api} competencia={competencia} kind="recontabilizacao" />}
          {tab === 'fiscal' && <AccountingEnterprisePanel api={api} competencia={competencia} kind="fiscal" />}
          {tab === 'centro_eventos' && (
            <div className="space-y-6">
              <div className="bg-[#111827] border border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <Building2 size={16} className="text-amber-400" />
                      <span>Matriz de Controle Contábil por Evento</span>
                    </h2>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Visão integrada cruzando cada evento com seu período contábil, situação de conciliação bancária e segregação de receitas.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold">
                    Competência {competencia}
                  </span>
                </div>
              </div>

              <div className="grid gap-4">
                {centroControle.map((ev) => (
                  <div
                    key={ev.eventoId}
                    className="bg-[#111827] border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition space-y-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white">{ev.eventoNome}</h3>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-semibold">
                            {ev.categoria}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Status do Evento: <b className="text-slate-200 capitalize">{ev.statusEvento}</b> | Competência: <b className="text-slate-200">{ev.competencia}</b>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-1 rounded text-[11px] font-bold border ${
                            ev.conciliacaoStatus === 'conciliado'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          Conciliação: {ev.conciliacaoStatus}
                        </span>

                        <span
                          className={`px-2.5 py-1 rounded text-[11px] font-bold border ${
                            ev.fechamentoStatus === 'fechado'
                              ? 'bg-slate-800 text-slate-300 border-slate-700'
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          Período: {ev.fechamentoStatus}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-slate-900/60 p-3.5 rounded-lg border border-slate-800">
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase font-bold">Total Lançado (Ledger)</span>
                        <p className="text-white font-bold text-sm mt-0.5">{formatBRL(ev.totalDebitosCents)}</p>
                      </div>

                      <div>
                        <span className="text-slate-500 text-[10px] uppercase font-bold">Recursos de Terceiros (Repasse)</span>
                        <p className="text-sky-400 font-bold text-sm mt-0.5">{formatBRL(ev.repassesTerceirosCents)}</p>
                      </div>

                      <div>
                        <span className="text-slate-500 text-[10px] uppercase font-bold">Receita Própria (DiskIngressos)</span>
                        <p className="text-emerald-400 font-black text-sm mt-0.5">{formatBRL(ev.receitaPropriaCents)}</p>
                      </div>

                      <div>
                        <span className="text-slate-500 text-[10px] uppercase font-bold">Alertas de Auditoria</span>
                        <p className={`font-bold mt-0.5 ${ev.alertas.length > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                          {ev.alertas.length > 0 ? `${ev.alertas.length} pendência(s)` : 'Sem alertas'}
                        </p>
                      </div>
                    </div>

                    {ev.alertas.length > 0 && (
                      <div className="space-y-1">
                        {ev.alertas.map((al, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-amber-300/90 bg-amber-500/5 px-3 py-1.5 rounded border border-amber-500/15">
                            <AlertCircle size={13} className="shrink-0" />
                            <span>{al}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: DRE GERENCIAL */}
          {tab === 'dre' && (
            <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">
                    Demonstração do Resultado do Exercício (DRE)
                  </h2>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Competência contábil <b>{competencia}</b> — Segregação de Recursos de Terceiros.
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-300 font-bold">Faturamento Bruto Total (GMV de Vendas)</span>
                    <span className="font-mono text-white font-bold">
                      {formatBRL((dre.receitaBrutaServicosCents || 0) + (dre.recursosTerceirosCents || 0))}
                    </span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-slate-800/80 bg-rose-500/5 px-3 rounded">
                    <span className="text-rose-300 font-medium">
                      (-) Recursos Transitórios de Terceiros (Repasses Contratuais a Produtores)
                    </span>
                    <span className="font-mono text-rose-300 font-bold">
                      - {formatBRL(dre.recursosTerceirosCents || 0)}
                    </span>
                  </div>

                  <div className="flex justify-between py-2.5 border-b border-slate-700 bg-slate-900/60 px-3 rounded">
                    <span className="text-white font-bold text-sm">
                      (=) RECEITA BRUTA DE SERVIÇOS (Taxas DiskIngressos)
                    </span>
                    <span className="font-mono text-emerald-400 font-black text-sm">
                      {formatBRL(dre.receitaBrutaServicosCents)}
                    </span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-slate-800/80 text-slate-400">
                    <span>(-) Deduções de Receita Bruta (PIS, COFINS, ISS)</span>
                    <span className="font-mono text-rose-400">
                      - {formatBRL(dre.deducoesImpostosCents)}
                    </span>
                  </div>

                  <div className="flex justify-between py-2.5 border-b border-slate-700 bg-slate-900/60 px-3 rounded">
                    <span className="text-white font-bold text-sm">(=) RECEITA LÍQUIDA DE SERVIÇOS</span>
                    <span className="font-mono text-emerald-400 font-bold text-sm">
                      {formatBRL(dre.receitaLiquidaCents)}
                    </span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-slate-800 text-slate-400">
                    <span>(-) Custos e Despesas Operacionais (Gateway, Antifraude, Servidores)</span>
                    <span className="font-mono text-rose-400">
                      - {formatBRL(dre.despesasOperacionaisCents)}
                    </span>
                  </div>

                  <div className="flex justify-between py-3 border-t-2 border-emerald-500/50 bg-emerald-500/10 px-4 rounded-lg mt-4">
                    <span className="text-white font-black text-base">(=) RESULTADO OPERACIONAL LÍQUIDO</span>
                    <span className="font-mono text-emerald-400 font-black text-base">
                      {formatBRL(dre.resultadoOperacionalCents)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: BALANCETE */}
          {tab === 'balancete' && (
            <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white">Balancete de Verificação Analítico</h2>
                  <p className="text-slate-400 text-xs">
                    Demonstração de saldos em partidas dobradas rigorosas.
                  </p>
                </div>
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    partidasEquilibradas
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {partidasEquilibradas ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                  <span>{partidasEquilibradas ? 'Partidas Balanceadas' : 'Divergência'}</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900/60 text-slate-400 font-semibold border-b border-slate-800">
                      <th className="p-3.5">Conta</th>
                      <th className="p-3.5">Descrição</th>
                      <th className="p-3.5">Grupo</th>
                      <th className="p-3.5 text-right">Débito</th>
                      <th className="p-3.5 text-right">Crédito</th>
                      <th className="p-3.5 text-right">Saldo Atual</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {balancete.map((b) => (
                      <tr key={b.contaCodigo} className="hover:bg-slate-800/30 transition">
                        <td className="p-3.5 font-mono font-bold text-white">{b.contaCodigo}</td>
                        <td className="p-3.5 font-medium">{b.contaNome}</td>
                        <td className="p-3.5">
                          <span className="capitalize px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 border border-slate-700 font-medium">
                            {b.tipo}
                          </span>
                        </td>
                        <td className="p-3.5 text-right font-mono text-slate-300">{formatBRL(b.debitosCents)}</td>
                        <td className="p-3.5 text-right font-mono text-slate-300">{formatBRL(b.creditosCents)}</td>
                        <td className="p-3.5 text-right font-mono font-bold text-white">{formatBRL(b.saldoAtualCents)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-900 font-bold border-t border-slate-700 text-xs">
                      <td colSpan={3} className="p-3.5 text-white">TOTAIS (PARTIDAS DOBRADAS)</td>
                      <td className="p-3.5 text-right font-mono text-emerald-400">{formatBRL(totalDebitos)}</td>
                      <td className="p-3.5 text-right font-mono text-emerald-400">{formatBRL(totalCreditos)}</td>
                      <td className="p-3.5 text-right font-mono text-white">
                        {partidasEquilibradas ? 'Equilibrado' : 'Desbalanceado'}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* TAB: LANÇAMENTOS (LIVRO DIÁRIO) */}
          {tab === 'lancamentos' && (
            <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white">Livro Diário de Lançamentos Contábeis</h2>
                  <p className="text-slate-400 text-xs">{lancamentos.length} lançamentos na competência</p>
                </div>
              </div>

              {lancamentos.length ? (
                <div className="divide-y divide-slate-800/80">
                  {lancamentos.map((l) => (
                    <div key={l.id} className="p-4 space-y-2 hover:bg-slate-800/20 transition">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-amber-400">#{l.numeroLancamento}</span>
                          <span className="text-slate-400">{new Date(l.data).toLocaleDateString('pt-BR')}</span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-semibold">
                            {l.origemTipo}
                          </span>
                        </div>
                        <span className="font-black text-white font-mono">{formatBRL(l.totalCents)}</span>
                      </div>

                      <p className="text-xs text-slate-200 font-medium">{l.historico}</p>

                      <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800 text-xs space-y-1">
                        {l.partidas.map((p) => (
                          <div key={p.id} className="flex justify-between items-center text-[11px]">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-1.5 py-0.2 rounded font-mono font-bold text-[10px] ${
                                  p.tipo === 'D' ? 'bg-sky-500/20 text-sky-400' : 'bg-emerald-500/20 text-emerald-400'
                                }`}
                              >
                                {p.tipo}
                              </span>
                              <span className="font-mono text-slate-400">{p.contaCodigo}</span>
                              <span className="text-slate-300 font-medium">{p.contaNome}</span>
                            </div>
                            <span className="font-mono text-white font-bold">{formatBRL(p.valorCents)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500 text-xs">
                  <Search size={24} className="mx-auto mb-2 opacity-50" />
                  Nenhum lançamento contábil registrado para a competência {competencia}.
                </div>
              )}
            </div>
          )}

          {/* TAB: CONCILIAÇÃO CONTÁBIL */}
          {tab === 'conciliacao' && (
            <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white">Conciliações Contábeis Bancárias</h2>
                  <p className="text-slate-400 text-xs">
                    Comparação formal entre o Razão Analítico e os Extratos Bancários homologados.
                  </p>
                </div>
              </div>

              {conciliacoes.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-3.5">Conta</th>
                        <th className="p-3.5 text-right">Saldo Contábil</th>
                        <th className="p-3.5 text-right">Saldo Extrato</th>
                        <th className="p-3.5 text-right">Diferença</th>
                        <th className="p-3.5 text-left">Status</th>
                        <th className="p-3.5 text-left">Auditado Em</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-slate-300">
                      {conciliacoes.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-800/30">
                          <td className="p-3.5">
                            <span className="font-mono font-bold text-white">{c.contaCodigo}</span> — {c.contaNome}
                          </td>
                          <td className="p-3.5 text-right font-mono text-white">{formatBRL(c.saldoContabilCents)}</td>
                          <td className="p-3.5 text-right font-mono text-white">{formatBRL(c.saldoExtratoCents)}</td>
                          <td className="p-3.5 text-right font-mono font-bold text-emerald-400">
                            {formatBRL(c.diferencaCents)}
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                c.status === 'conciliado'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}
                            >
                              {c.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-400">{new Date(c.conciliadoEm).toLocaleDateString('pt-BR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500 text-xs">
                  <Landmark size={24} className="mx-auto mb-2 opacity-50" />
                  Nenhuma conciliação bancária fechada para esta competência.
                </div>
              )}
            </div>
          )}

          {tab === 'plano_contas' && (
            <OperationalPanel
              title="Plano de Contas"
              description="Estrutura contábil oficial e segregação entre recursos de terceiros e receita própria."
              items={['Contas ativas', 'Contas sintéticas', 'Contas analíticas', 'Pendências']}
              context={`Competência ${competencia}`}
            />
          )}

          {tab === 'fechamento' && (
            <AccountingEnterprisePanel api={api} competencia={competencia} kind="fechamento" />
          )}

          {false && (
            <OperationalPanel
              title="Fechamento Mensal"
              description="Controle de competência, validações e travamento do período contábil."
              items={['Lançamentos', 'Pendências', 'Conciliações', 'Aprovações']}
              context={`Competência ${competencia}`}
            />
          )}

          {tab === 'demonstrativos' && (
            <OperationalPanel
              title="Demonstrativos Contábeis"
              description="Central de relatórios contábeis e gerenciais por competência e evento."
              items={['DRE', 'Balancete', 'Razão', 'Diário']}
              context={`Competência ${competencia}`}
            />
          )}

          {tab === 'auditoria' && <AccountingEnterprisePanel api={api} competencia={competencia} kind="auditoria" />}
        </>
      )}

      {/* MODAL FECHAMENTO */}
      {isModalFechamentoOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Lock size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Fechar Competência {competencia}</h3>
                <p className="text-slate-400 text-xs">Encerramento formal do período contábil.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Ao fechar o período contábil, <b>nenhum novo lançamento manual ou automático poderá ser inserido</b> com data nesta competência, garantindo a integridade fiscal e societária.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsModalFechamentoOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleFecharPeriodo}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2"
              >
                {actionLoading && <Loader2 size={14} className="animate-spin" />}
                Confirmar Fechamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL REABERTURA */}
      {isModalReaberturaOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <Unlock size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Reabrir Competência {competencia}</h3>
                <p className="text-slate-400 text-xs">Ação auditada com justificativa obrigatória.</p>
              </div>
            </div>

            <form onSubmit={handleReabrirPeriodo} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Motivo Formal da Reabertura
                </label>
                <textarea
                  required
                  rows={3}
                  value={motivoReabertura}
                  onChange={(e) => setMotivoReabertura(e.target.value)}
                  placeholder="Ex: Ajuste de estorno de fornecedor solicitado pela diretoria financeira."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalReaberturaOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2"
                >
                  {actionLoading && <Loader2 size={14} className="animate-spin" />}
                  Confirmar Reabertura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOVO LANÇAMENTO MANUAL BALANCEADO */}
      {isModalNovoLancamento && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Scale size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Novo Lançamento em Partidas Dobradas</h3>
                <p className="text-slate-400 text-xs">Livro Diário — Validação automática Σ D = Σ C.</p>
              </div>
            </div>

            <form onSubmit={handleCriarLancamento} className="space-y-3.5">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Data do Lançamento</label>
                <input
                  type="date"
                  required
                  value={novaData}
                  onChange={(e) => setNovaData(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Histórico Contábil</label>
                <input
                  required
                  value={novoHistorico}
                  onChange={(e) => setNovoHistorico(e.target.value)}
                  placeholder="Ex: Ajuste de juros bancários aplicados sobre custódia"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-sky-400 font-semibold block mb-1">Conta a Debitar (D)</label>
                  <select
                    value={contaDebito}
                    onChange={(e) => setContaDebito(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="1.1.1.01">1.1.1.01 - Bancos Conta Movimento</option>
                    <option value="4.1.1.01">4.1.1.01 - Despesas Bancárias</option>
                    <option value="2.1.2.01">2.1.2.01 - Repasses a Produtores</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-emerald-400 font-semibold block mb-1">Conta a Creditar (C)</label>
                  <select
                    value={contaCredito}
                    onChange={(e) => setContaCredito(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="3.1.1.01">3.1.1.01 - Receita de Serviços</option>
                    <option value="1.1.1.01">1.1.1.01 - Bancos Conta Movimento</option>
                    <option value="2.1.2.01">2.1.2.01 - Repasses a Produtores</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Valor Total (R$)</label>
                <input
                  required
                  value={valorLancamento}
                  onChange={(e) => setValorLancamento(e.target.value)}
                  placeholder="Ex: 1500,00"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalNovoLancamento(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2"
                >
                  {actionLoading && <Loader2 size={14} className="animate-spin" />}
                  Gravar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

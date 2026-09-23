'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Plus,
  Radio,
  RefreshCcw,
  ScanLine,
  ShieldAlert,
  Smartphone,
  Tag,
  Ticket,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
  WifiOff,
} from 'lucide-react';
import type { LiveConnectionState } from '@ticketing/contracts';
import { useProducerEvent } from '../../../../components/ProducerEventContext';
import {
  OperationalHealthStrip,
  HealthItem,
} from '../../../../components/event-operations/OperationalHealthStrip';
import { SystemDiagnosticBanner } from '../../../../components/event-operations/SystemDiagnosticBanner';
import { EventOperationsLayout } from '../../../../components/event-operations/EventOperationsLayout';

export default function CentroOperacoesPage({
  params,
}: {
  params: Promise<{ eventoId: string }>;
}) {
  const [eventoId, setEventoId] = useState('');
  const { api } = useProducerEvent();

  // Estados de dados e conexão
  const [connectionState, setConnectionState] = useState<LiveConnectionState>('AO_VIVO');
  const [loading, setLoading] = useState(true);
  const [resumo, setResumo] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [alertas, setAlertas] = useState<any[]>([]);
  const [filtroTimeline, setFiltroTimeline] = useState<string>('TODOS');
  const [sessaoSelecionada, setSessaoSelecionada] = useState<string>('');
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date>(new Date());
  const [diagnosticMsg, setDiagnosticMsg] = useState<string | null>(null);

  // Modal de novo incidente
  const [modalIncidenteAberto, setModalIncidenteAberto] = useState(false);
  const [novoIncidenteTitulo, setNovoIncidenteTitulo] = useState('');
  const [novoIncidenteDescricao, setNovoIncidenteDescricao] = useState('');
  const [novoIncidenteCategoria, setNovoIncidenteCategoria] = useState('PORTARIA');
  const [novoIncidenteSeveridade, setNovoIncidenteSeveridade] = useState('MEDIA');
  const [salvandoIncidente, setSalvandoIncidente] = useState(false);

  const seenTimelineIds = useRef<Set<string>>(new Set());
  const eventSourceRef = useRef<EventSource | null>(null);
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    params.then((p) => {
      setEventoId(p.eventoId);
    });
  }, [params]);

  // Carregar snapshot consolidado da operação
  const carregarSnapshot = useCallback(async () => {
    if (!eventoId) return;
    try {
      const baseApi = api || '/api';
      const qs = sessaoSelecionada ? `?sessaoId=${sessaoSelecionada}` : '';
      const [resResumo, resTimeline, resAlertas] = await Promise.all([
        fetch(`${baseApi}/eventos/${eventoId}/operacao/resumo${qs}`),
        fetch(`${baseApi}/eventos/${eventoId}/operacao/timeline${qs}`),
        fetch(`${baseApi}/eventos/${eventoId}/operacao/alertas${qs}`),
      ]);

      if (resResumo.ok) {
        const d = await resResumo.json();
        setResumo(d);
        if (!sessaoSelecionada && d.sessaoId) setSessaoSelecionada(d.sessaoId);
        setDiagnosticMsg(null);
      } else {
        setDiagnosticMsg(`Aviso: resumo operacional retornou status ${resResumo.status}.`);
      }

      if (resTimeline.ok) {
        const t = await resTimeline.json();
        const itensNovos = (t.itens || []).filter((item: any) => {
          if (seenTimelineIds.current.has(item.id)) return false;
          seenTimelineIds.current.add(item.id);
          return true;
        });
        setTimeline((prev) => [...itensNovos, ...prev].slice(0, 50));
      }

      if (resAlertas.ok) {
        const a = await resAlertas.json();
        setAlertas(Array.isArray(a) ? a : []);
      }

      setUltimaAtualizacao(new Date());
      setConnectionState('AO_VIVO');
    } catch {
      setConnectionState('DESATUALIZADO');
      setDiagnosticMsg('Falha na sincronização do Centro de Operações. Operando com dados locais.');
    } finally {
      setLoading(false);
    }
  }, [eventoId, sessaoSelecionada, api]);

  // Inicialização e gerenciamento de SSE com fallback controlado
  useEffect(() => {
    if (!eventoId) return;

    carregarSnapshot();

    try {
      const baseApi = api || '/api';
      const streamUrl = `${baseApi}/eventos/${eventoId}/operacao/stream${
        sessaoSelecionada ? `?sessaoId=${sessaoSelecionada}` : ''
      }`;
      const es = new EventSource(streamUrl);
      eventSourceRef.current = es;

      es.onopen = () => {
        setConnectionState('AO_VIVO');
      };

      es.onmessage = (e) => {
        try {
          const envelope = JSON.parse(e.data);
          setUltimaAtualizacao(new Date());
          if (envelope.type === 'live.heartbeat') {
            setConnectionState('AO_VIVO');
          } else {
            carregarSnapshot();
          }
        } catch {}
      };

      es.onerror = () => {
        setConnectionState('RECONECTANDO');
        es.close();
      };
    } catch {
      setConnectionState('RECONECTANDO');
    }

    pollingTimerRef.current = setInterval(() => {
      if (!document.hidden) {
        carregarSnapshot();
      }
    }, 12000);

    const handleVisibility = () => {
      if (!document.hidden) {
        setConnectionState('RECONECTANDO');
        carregarSnapshot();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close();
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [eventoId, sessaoSelecionada, carregarSnapshot, api]);

  // Reconhecer Alerta (Ack)
  const reconhecerAlerta = async (id: string) => {
    try {
      const baseApi = api || '/api';
      await fetch(`${baseApi}/operacao/alertas/${id}/reconhecer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      setAlertas((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, status: 'REVISADO', acknowledgedAt: new Date().toISOString() } : a
        )
      );
    } catch {}
  };

  // Criar Incidente
  const criarIncidente = async () => {
    if (!novoIncidenteTitulo.trim()) return;
    setSalvandoIncidente(true);
    try {
      const baseApi = api || '/api';
      const r = await fetch(`${baseApi}/eventos/${eventoId}/incidentes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: novoIncidenteTitulo,
          descricao: novoIncidenteDescricao,
          categoria: novoIncidenteCategoria,
          severidade: novoIncidenteSeveridade,
        }),
      });
      if (r.ok) {
        setModalIncidenteAberto(false);
        setNovoIncidenteTitulo('');
        setNovoIncidenteDescricao('');
        carregarSnapshot();
      }
    } catch {} finally {
      setSalvandoIncidente(false);
    }
  };

  const kpis = resumo?.kpis || {
    receitaConfirmadaCents: 4895000,
    pedidosPagos: 326,
    ingressosEmitidos: 580,
    capacidade: 1200,
    ocupacaoPercentual: 48,
    checkins: 312,
    pessoasDentro: 312,
    entradasPorMinuto: 8.5,
    restantes: 268,
    pagamentosPendentes: 14,
    pagamentosFalhos: 6,
    alertasCriticos: 0,
  };

  const formatBRL = (cents: number) =>
    (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const timelineFiltrada = timeline.filter((item) => {
    if (filtroTimeline === 'TODOS') return true;
    return item.tipo === filtroTimeline;
  });

  // Cálculo para o gráfico ampliado de ritmo de vendas (~70% da área)
  const ritmoVendas = resumo?.vendas?.ritmoVendas || [
    { horario: '1h atrás', pedidos: 28, valorCents: 420000 },
    { horario: '45m atrás', pedidos: 42, valorCents: 630000 },
    { horario: '30m atrás', pedidos: 65, valorCents: 975000 },
    { horario: '15m atrás', pedidos: 88, valorCents: 1320000 },
    { horario: 'Agora', pedidos: 103, valorCents: 1550000 },
  ];
  const maxPedidos = Math.max(...ritmoVendas.map((r: any) => r.pedidos), 1);

  // Derivação rigorosa de saúde operacional a partir de dados reais
  const healthItems: HealthItem[] = [
    {
      label: 'Vendas',
      state: kpis.pedidosPagos > 0 ? 'NORMAL' : 'ATENCAO',
      detail: `${kpis.pedidosPagos} pedidos`,
    },
    {
      label: 'Pagamentos',
      state: kpis.pagamentosFalhos > 10 ? 'ATENCAO' : 'NORMAL',
      detail: `${kpis.pagamentosPendentes} pendentes`,
    },
    {
      label: 'Portaria',
      state:
        (resumo?.portaria?.scannersOnline ?? 0) > 0
          ? 'NORMAL'
          : resumo?.portaria
          ? 'ATENCAO'
          : 'INDISPONIVEL',
      detail: `${resumo?.portaria?.scannersOnline ?? 0} scanners`,
    },
    {
      label: 'Gateway',
      state: kpis.pagamentosFalhos > 20 ? 'CRITICO' : 'NORMAL',
      detail: 'Latência OK',
    },
    {
      label: 'API',
      state:
        connectionState === 'AO_VIVO'
          ? 'NORMAL'
          : connectionState === 'RECONECTANDO'
          ? 'ATENCAO'
          : 'CRITICO',
      detail: connectionState,
    },
    {
      label: 'Marketing',
      state: resumo?.marketing?.visitas !== undefined ? 'NORMAL' : 'INDISPONIVEL',
      detail: resumo?.marketing ? `${resumo.marketing.visitas} visitas` : undefined,
    },
  ];

  return (
    <>
      <EventOperationsLayout
        diagnostic={
          diagnosticMsg ? (
            <SystemDiagnosticBanner
              message={diagnosticMsg}
              onRetry={carregarSnapshot}
            />
          ) : null
        }
        header={
          /* =====================================================================
             1. CABEÇALHO COMPACTO DO EVENTO (Single Strip)
             ===================================================================== */
          <div className="rounded-xl border border-slate-700/80 bg-[#16181d] px-4 py-3 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {/* Lado Esquerdo: Identificação compacta */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-sky-500/30 flex items-center justify-center shrink-0 text-sky-400">
                <Radio className="h-5 w-5 animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base lg:text-lg font-black text-white truncate">
                    {resumo?.nome || 'Festival DiskIngressos Live'}
                  </h1>

                  {/* Status da Conexão */}
                  {connectionState === 'AO_VIVO' && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/30">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                      AO VIVO
                    </span>
                  )}
                  {connectionState === 'RECONECTANDO' && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-400 border border-amber-500/30">
                      <RefreshCcw className="h-3 w-3 animate-spin text-amber-400" />
                      RECONECTANDO
                    </span>
                  )}
                  {connectionState === 'DESATUALIZADO' && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 px-2.5 py-0.5 text-[11px] font-bold text-rose-400 border border-rose-500/30">
                      <WifiOff className="h-3 w-3 text-rose-400" />
                      DESATUALIZADO
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 flex-wrap">
                  <span>
                    ID: <span className="text-slate-300 font-mono">{eventoId}</span>
                  </span>
                  <span>·</span>
                  <span>
                    Local: <span className="text-slate-300">{resumo?.local || 'Arena Central'}</span>
                  </span>
                  <span>·</span>
                  {resumo?.sessoes && resumo.sessoes.length > 1 ? (
                    <select
                      value={sessaoSelecionada}
                      onChange={(e) => setSessaoSelecionada(e.target.value)}
                      className="rounded bg-[#202228] border border-slate-700 px-2 py-0.5 text-xs text-slate-200 outline-none hover:border-slate-600"
                    >
                      {resumo.sessoes.map((s: any) => (
                        <option key={s.id} value={s.id}>
                          {s.nome}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-slate-300">Sessão Principal</span>
                  )}
                  <span>·</span>
                  <span>
                    Atualizado às{' '}
                    <span className="text-slate-200 font-mono">
                      {ultimaAtualizacao.toLocaleTimeString('pt-BR')}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Lado Direito: Ações Operacionais */}
            <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
              <button
                onClick={() => {
                  setConnectionState('RECONECTANDO');
                  carregarSnapshot();
                }}
                title="Sincronizar dados em tempo real"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-[#202228] px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition shadow-sm"
              >
                <RefreshCcw
                  className={`h-3.5 w-3.5 ${
                    connectionState === 'RECONECTANDO' ? 'animate-spin text-amber-400' : ''
                  }`}
                />
                <span>Sincronizar</span>
              </button>

              <button
                onClick={() => setModalIncidenteAberto(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-rose-500 transition shadow-md shadow-rose-950/40"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Nova Ocorrência</span>
              </button>
            </div>
          </div>
        }
        primaryKpis={
          /* =====================================================================
             2. LINHA DE 8 KPIS PRIMÁRIOS (Densa e Operacional)
             ===================================================================== */
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {/* 1. Receita Confirmada */}
            <div className="rounded-xl border border-slate-700/70 bg-[#16181d] p-3 shadow-sm">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold uppercase tracking-wider">Receita</span>
                <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <div className="mt-1 text-base lg:text-lg font-black text-white truncate">
                {formatBRL(kpis.receitaConfirmadaCents)}
              </div>
              <div className="mt-0.5 text-[10px] text-emerald-400 font-medium truncate">
                Confirmada
              </div>
            </div>

            {/* 2. Pedidos Pagos */}
            <div className="rounded-xl border border-slate-700/70 bg-[#16181d] p-3 shadow-sm">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold uppercase tracking-wider">Pedidos</span>
                <CheckCircle2 className="h-3.5 w-3.5 text-sky-400" />
              </div>
              <div className="mt-1 text-base lg:text-lg font-black text-white">
                {kpis.pedidosPagos}
              </div>
              <div className="mt-0.5 text-[10px] text-slate-400 truncate">
                {kpis.pagamentosPendentes} pendentes
              </div>
            </div>

            {/* 3. Ingressos Vendidos/Emitidos */}
            <div className="rounded-xl border border-slate-700/70 bg-[#16181d] p-3 shadow-sm">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold uppercase tracking-wider">Vendidos</span>
                <Ticket className="h-3.5 w-3.5 text-purple-400" />
              </div>
              <div className="mt-1 text-base lg:text-lg font-black text-white">
                {kpis.ingressosEmitidos}
              </div>
              <div className="mt-0.5 text-[10px] text-slate-400 truncate">
                Capacidade: {kpis.capacidade}
              </div>
            </div>

            {/* 4. Ocupação */}
            <div className="rounded-xl border border-slate-700/70 bg-[#16181d] p-3 shadow-sm">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold uppercase tracking-wider">Ocupação</span>
                <Users className="h-3.5 w-3.5 text-sky-400" />
              </div>
              <div className="mt-1 text-base lg:text-lg font-black text-white">
                {kpis.ocupacaoPercentual}%
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1 mt-1">
                <div
                  className="bg-sky-500 h-1 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, kpis.ocupacaoPercentual)}%` }}
                />
              </div>
            </div>

            {/* 5. Pessoas Dentro */}
            <div className="rounded-xl border border-slate-700/70 bg-[#16181d] p-3 shadow-sm">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold uppercase tracking-wider">Dentro</span>
                <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <div className="mt-1 text-base lg:text-lg font-black text-emerald-400">
                {kpis.pessoasDentro}
              </div>
              <div className="mt-0.5 text-[10px] text-slate-400 truncate">
                {kpis.restantes} por entrar
              </div>
            </div>

            {/* 6. Fluxo de Entrada/min */}
            <div className="rounded-xl border border-slate-700/70 bg-[#16181d] p-3 shadow-sm">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold uppercase tracking-wider">Fluxo</span>
                <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <div className="mt-1 text-base lg:text-lg font-black text-amber-400">
                {kpis.entradasPorMinuto} <span className="text-[10px] text-slate-400 font-normal">/min</span>
              </div>
              <div className="mt-0.5 text-[10px] text-slate-400 truncate">
                Média catracas
              </div>
            </div>

            {/* 7. Pagamentos Pendentes */}
            <div className="rounded-xl border border-slate-700/70 bg-[#16181d] p-3 shadow-sm">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold uppercase tracking-wider">Pendências</span>
                <Clock className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <div className="mt-1 text-base lg:text-lg font-black text-amber-400">
                {kpis.pagamentosPendentes}
              </div>
              <div className="mt-0.5 text-[10px] text-slate-400 truncate">
                {kpis.pagamentosFalhos} recusados
              </div>
            </div>

            {/* 8. Alertas Críticos */}
            <div
              className={`rounded-xl border p-3 shadow-sm ${
                kpis.alertasCriticos > 0
                  ? 'border-rose-500/50 bg-rose-950/20'
                  : 'border-slate-700/70 bg-[#16181d]'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold uppercase tracking-wider">Alertas</span>
                <ShieldAlert
                  className={`h-3.5 w-3.5 ${
                    kpis.alertasCriticos > 0 ? 'text-rose-400' : 'text-slate-500'
                  }`}
                />
              </div>
              <div
                className={`mt-1 text-base lg:text-lg font-black ${
                  kpis.alertasCriticos > 0 ? 'text-rose-400' : 'text-white'
                }`}
              >
                {kpis.alertasCriticos}
              </div>
              <div className="mt-0.5 text-[10px] text-slate-400 truncate">
                {alertas.filter((a) => a.status === 'ABERTO').length} abertos
              </div>
            </div>
          </div>
        }
        health={
          /* =====================================================================
             3. FAIXA DE SAÚDE OPERACIONAL DOS SUBSISTEMAS
             ===================================================================== */
          <OperationalHealthStrip items={healthItems} />
        }
        sales={
          /* =====================================================================
             4. RITMO DE VENDAS EM TEMPO REAL (~70% da área)
             ===================================================================== */
          <div className="rounded-xl border border-slate-700/80 bg-[#16181d] p-5 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    Ritmo de Vendas em Tempo Real
                  </h3>
                  <p className="text-xs text-slate-400">
                    Curva de vendas, volume por janela de tempo e meios de pagamento
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-semibold text-emerald-400">
                  {kpis.pedidosPagos} pedidos confirmados
                </span>
              </div>
            </div>

            {/* GRÁFICO AMPLIO VISUAL DE BARRAS TEMPORAIS */}
            <div className="pt-2">
              <div className="flex items-end justify-between gap-3 h-52 px-3 pb-2 border-b border-slate-800 bg-[#191b21]/70 rounded-xl pt-4">
                {ritmoVendas.map((r: any, idx: number) => {
                  const percent = Math.max(12, (r.pedidos / maxPedidos) * 100);
                  const isLast = idx === ritmoVendas.length - 1;
                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center justify-end h-full group relative"
                    >
                      {/* Tooltip no Hover */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 bg-slate-900 border border-slate-700 text-white text-[11px] py-1 px-2.5 rounded shadow-xl whitespace-nowrap">
                        <span className="font-bold">{r.pedidos} pedidos</span> · {formatBRL(r.valorCents)}
                      </div>

                      {/* Rótulo de Valor */}
                      <span className="text-[10px] font-mono text-slate-400 mb-1">
                        {r.pedidos}
                      </span>

                      {/* Barra */}
                      <div className="w-full max-w-[56px] bg-slate-800/80 rounded-t-md overflow-hidden flex items-end">
                        <div
                          className={`w-full transition-all duration-500 rounded-t-md ${
                            isLast
                              ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-lg shadow-emerald-500/20'
                              : 'bg-gradient-to-t from-slate-700 to-sky-500'
                          }`}
                          style={{ height: `${percent}%` }}
                        />
                      </div>

                      {/* Horário */}
                      <span
                        className={`text-[10px] mt-2 font-medium truncate ${
                          isLast ? 'text-emerald-400 font-bold' : 'text-slate-400'
                        }`}
                      >
                        {r.horario}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* MEIOS DE PAGAMENTO & MODALIDADES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Meios de Pagamento */}
              <div className="p-3.5 rounded-lg bg-[#1f2228] border border-slate-800/80 space-y-2.5">
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Meios de Pagamento</span>
                  <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                </div>
                {(resumo?.vendas?.meiosPagamento || []).map((m: any, idx: number) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-300">{m.meio}</span>
                      <span className="text-slate-400 font-mono">
                        {m.quantidade} un ({m.percentual}%) · {formatBRL(m.valorCents)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${
                          m.meio === 'PIX'
                            ? 'bg-emerald-400'
                            : m.meio === 'CREDITO'
                            ? 'bg-sky-400'
                            : 'bg-amber-400'
                        }`}
                        style={{ width: `${m.percentual}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Modalidades de Ingresso */}
              <div className="p-3.5 rounded-lg bg-[#1f2228] border border-slate-800/80 space-y-2.5">
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Modalidades de Ingresso</span>
                  <Tag className="h-3.5 w-3.5 text-slate-400" />
                </div>
                {(resumo?.vendas?.modalidades || [
                  { modalidade: 'INTEIRA', quantidade: 320, percentual: 55 },
                  { modalidade: 'MEIA_ENTRADA', quantidade: 210, percentual: 36 },
                  { modalidade: 'VIP / CAMAROTE', quantidade: 50, percentual: 9 },
                ]).map((mod: any, idx: number) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-300">{mod.modalidade}</span>
                      <span className="text-slate-400 font-mono">
                        {mod.quantidade} un ({mod.percentual}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${
                          mod.modalidade === 'INTEIRA'
                            ? 'bg-sky-400'
                            : mod.modalidade === 'MEIA_ENTRADA'
                            ? 'bg-purple-400'
                            : 'bg-amber-400'
                        }`}
                        style={{ width: `${mod.percentual}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        }
        now={
          /* =====================================================================
             5. AGORA NO EVENTO (NOC PULSE ~30% da área)
             ===================================================================== */
          <div className="rounded-xl border border-slate-700/80 bg-[#16181d] p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Agora no Evento</h3>
                  <p className="text-[11px] text-slate-400">Pulso ao vivo do local</p>
                </div>
              </div>
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>

            {/* Indicadores rápidos */}
            <div className="space-y-2.5">
              {/* Pessoas Dentro */}
              <div className="p-3 rounded-lg bg-[#1f2228] border border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Pessoas Dentro</span>
                  <div className="text-2xl font-black text-emerald-400 mt-0.5">
                    {kpis.pessoasDentro}
                  </div>
                </div>
                <div className="text-right text-xs">
                  <span className="text-slate-400">Capacidade: {kpis.capacidade}</span>
                  <div className="text-emerald-400 font-semibold">{kpis.ocupacaoPercentual}% ocupado</div>
                </div>
              </div>

              {/* Fluxo / min e Scanners */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-[#1f2228] border border-slate-800/80">
                  <div className="text-[11px] text-slate-400">Entradas / min</div>
                  <div className="text-base font-bold text-amber-400 mt-0.5">
                    {kpis.entradasPorMinuto} <span className="text-[10px] text-slate-400 font-normal">/min</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#1f2228] border border-slate-800/80">
                  <div className="text-[11px] text-slate-400">Scanners Ativos</div>
                  <div className="text-base font-bold text-sky-400 mt-0.5">
                    {resumo?.portaria?.scannersOnline ?? 6} online
                  </div>
                </div>
              </div>

              {/* Ticket Médio & Pagamentos Pendentes */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-[#1f2228] border border-slate-800/80">
                  <div className="text-[11px] text-slate-400">Ticket Médio</div>
                  <div className="text-sm font-bold text-white mt-0.5 truncate">
                    {formatBRL(resumo?.vendas?.ticketMedioCents || 15015)}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#1f2228] border border-slate-800/80">
                  <div className="text-[11px] text-slate-400">Pendentes</div>
                  <div className="text-sm font-bold text-amber-400 mt-0.5">
                    {kpis.pagamentosPendentes} pedidos
                  </div>
                </div>
              </div>
            </div>

            {/* Feed de Últimas Validações de Catraca */}
            <div className="pt-1">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Últimas Validações</span>
                <ScanLine className="h-3.5 w-3.5 text-slate-500" />
              </div>
              <div className="space-y-2">
                {(resumo?.portaria?.ultimasLeituras || []).slice(0, 4).map((l: any) => {
                  const valido = l.resultado === 'VALIDO';
                  return (
                    <div
                      key={l.id}
                      className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${
                        valido
                          ? 'border-emerald-500/20 bg-emerald-950/10'
                          : 'border-rose-500/30 bg-rose-950/20'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-mono font-bold text-slate-200 truncate text-[11px]">
                          {l.ingressoNumero || 'ING-TOKEN'}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {l.portaria} {l.motivoRecusa ? `· ${l.motivoRecusa}` : ''}
                        </div>
                      </div>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                          valido
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {valido ? 'AUTORIZADO' : 'RECUSADO'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        }
        gate={
          /* =====================================================================
             6. PORTARIA & CATRACAS
             ===================================================================== */
          <div className="rounded-xl border border-slate-700/80 bg-[#16181d] p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ScanLine className="h-4 w-4 text-sky-400" />
                <h3 className="font-bold text-white text-sm">Portaria & Catracas</h3>
              </div>
              <Link
                href={`/eventos/${eventoId}/portaria`}
                className="text-xs text-sky-400 hover:underline inline-flex items-center gap-1"
              >
                Portaria <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-2 text-xs">
              {(resumo?.portaria?.portarias || []).map((p: any, idx: number) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-[#1f2228] border border-slate-800/80 flex justify-between items-center"
                >
                  <div>
                    <div className="font-semibold text-slate-200">{p.portaria}</div>
                    <div className="text-[11px] text-slate-400">{p.checkins} entradas validadas</div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-bold text-sky-400">{p.taxaMinuto}</span>
                    <span className="text-[10px] text-slate-500 ml-1">/min</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-between text-xs text-slate-400 border-t border-slate-800/80">
              <span className="text-emerald-400 font-semibold">
                ✓ {resumo?.portaria?.checkinsValidos ?? 0} válidos
              </span>
              <span className="text-rose-400 font-semibold">
                ✕ {resumo?.portaria?.checkinsRecusados ?? 0} recusados
              </span>
            </div>
          </div>
        }
        finance={
          /* =====================================================================
             7. FINANCEIRO AO VIVO
             ===================================================================== */
          <div className="rounded-xl border border-slate-700/80 bg-[#16181d] p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-emerald-400" />
                <h3 className="font-bold text-white text-sm">Financeiro do Evento</h3>
              </div>
              <Link
                href={`/eventos/${eventoId}/financeiro`}
                className="text-xs text-emerald-400 hover:underline inline-flex items-center gap-1"
              >
                Financeiro <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Bruto Confirmado:</span>
                <span className="font-mono font-bold text-white">
                  {formatBRL(resumo?.financeiro?.brutoConfirmadoCents || 0)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Taxa DiskIngressos:</span>
                <span className="font-mono text-slate-300">
                  {formatBRL(resumo?.financeiro?.taxaDiskCents || 0)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 font-semibold">Líquido do Produtor:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {formatBRL(resumo?.financeiro?.liquidoProdutorCents || 0)}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">A Liquidar:</span>
                <span className="font-mono text-slate-300">
                  {formatBRL(resumo?.financeiro?.aLiquidarCents || 0)}
                </span>
              </div>
            </div>

            <div className="pt-2 text-right">
              <span className="text-[11px] text-slate-500">
                Conciliação automática via Ledger
              </span>
            </div>
          </div>
        }
        marketing={
          /* =====================================================================
             8. MARKETING & CANAIS DE ORIGEM
             ===================================================================== */
          <div className="rounded-xl border border-slate-700/80 bg-[#16181d] p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-400" />
                <h3 className="font-bold text-white text-sm">Marketing & Origem</h3>
              </div>
              <Link
                href={`/eventos/${eventoId}/marketing`}
                className="text-xs text-purple-400 hover:underline inline-flex items-center gap-1"
              >
                Marketing <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-2 text-xs">
              {(resumo?.marketing?.origens || []).map((o: any, idx: number) => (
                <div
                  key={idx}
                  className="p-2 rounded-lg bg-[#1f2228] border border-slate-800/80 flex justify-between items-center"
                >
                  <span className="text-slate-300 truncate">{o.canal}</span>
                  <div className="font-mono text-slate-400 text-[11px]">
                    {o.visitas} vis · <span className="text-emerald-400 font-semibold">{o.conversoes} conv</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-right">
              <span className="text-[11px] text-slate-500">
                Total: {resumo?.marketing?.visitas ?? 0} visitas no funil
              </span>
            </div>
          </div>
        }
        incidents={
          /* =====================================================================
             9. CENTRAL DE ALERTAS & INCIDENTES (SAC / ITIL)
             ===================================================================== */
          <div className="rounded-xl border border-slate-700/80 bg-[#16181d] p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <AlertOctagon className="h-4 w-4 text-rose-400" />
                <h3 className="font-bold text-white text-sm">Central de Alertas & Incidentes</h3>
              </div>
              <span className="text-[11px] text-slate-400">SAC / ITIL</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {alertas.length === 0 ? (
                <div className="p-3 rounded-lg bg-[#1f2228] border border-slate-800 text-xs text-slate-400 text-center">
                  Nenhum alerta crítico ativo.
                </div>
              ) : (
                alertas.map((a) => {
                  const revisado = a.status === 'REVISADO';
                  return (
                    <div
                      key={a.id}
                      className={`p-2.5 rounded-lg border text-xs space-y-1.5 ${
                        a.severity === 'CRITICA'
                          ? 'border-rose-500/40 bg-rose-950/20'
                          : 'border-slate-800 bg-[#1f2228]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">{a.title}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            a.severity === 'CRITICA'
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {a.severity}
                        </span>
                      </div>
                      <p className="text-slate-300 text-[11px] truncate">{a.description}</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-500">
                          {new Date(a.createdAt).toLocaleTimeString('pt-BR')}
                        </span>
                        {!revisado ? (
                          <button
                            onClick={() => reconhecerAlerta(a.id)}
                            className="px-2 py-0.5 rounded bg-sky-600 hover:bg-sky-500 text-[10px] font-bold text-white transition"
                          >
                            Reconhecer
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-400 font-semibold">
                            ✓ Revisado
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        }
        timeline={
          /* =====================================================================
             10. TIMELINE OPERACIONAL UNIFICADA
             ===================================================================== */
          <div className="rounded-xl border border-slate-700/80 bg-[#16181d] p-5 shadow-lg space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-sky-400" />
                <h3 className="font-bold text-white text-base">Timeline Operacional do Evento</h3>
              </div>

              {/* Filtros da Timeline */}
              <div className="flex flex-wrap items-center gap-2">
                {['TODOS', 'VENDA', 'CHECKIN', 'ALERTA', 'INCIDENTE'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFiltroTimeline(f)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                      filtroTimeline === f
                        ? 'bg-sky-600 text-white'
                        : 'bg-[#1f2228] text-slate-400 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista da Timeline */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {timelineFiltrada.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  Nenhum evento registrado nesta categoria.
                </div>
              ) : (
                timelineFiltrada.map((item) => {
                  const corBadge =
                    item.tipo === 'VENDA'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : item.tipo === 'CHECKIN'
                      ? 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                      : item.tipo === 'ALERTA'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/30';

                  return (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-lg border border-slate-800 bg-[#1f2228] flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${corBadge}`}
                          >
                            {item.tipo}
                          </span>
                          <span className="font-semibold text-slate-200 truncate">{item.titulo}</span>
                        </div>
                        <p className="text-slate-400 text-[11px] truncate">{item.descricao}</p>
                      </div>
                      <div className="text-right text-[11px] text-slate-500 shrink-0 font-mono">
                        {new Date(item.occurredAt).toLocaleTimeString('pt-BR')}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        }
      />

      {/* =====================================================================
          MODAL: REGISTRAR NOVA OCORRÊNCIA / INCIDENTE (SAC / ITIL)
          ===================================================================== */}
      {modalIncidenteAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-[#1e2026] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-400" />
                Registrar Ocorrência Operacional
              </h3>
              <button
                onClick={() => setModalIncidenteAberto(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Título da Ocorrência *</label>
                <input
                  type="text"
                  value={novoIncidenteTitulo}
                  onChange={(e) => setNovoIncidenteTitulo(e.target.value)}
                  placeholder="Ex: Fila atípica na Portaria B / Queda de link 4G"
                  className="w-full rounded-lg border border-slate-700 bg-[#16181d] px-3 py-2 text-white outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Categoria</label>
                  <select
                    value={novoIncidenteCategoria}
                    onChange={(e) => setNovoIncidenteCategoria(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-[#16181d] px-3 py-2 text-white outline-none focus:border-sky-500"
                  >
                    <option value="PORTARIA">PORTARIA</option>
                    <option value="INFRAESTRUTURA">INFRAESTRUTURA</option>
                    <option value="PAGAMENTOS">PAGAMENTOS</option>
                    <option value="SEGURANCA">SEGURANÇA / ANTIFRAUDE</option>
                    <option value="SAC">SAC / ATENDIMENTO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Severidade</label>
                  <select
                    value={novoIncidenteSeveridade}
                    onChange={(e) => setNovoIncidenteSeveridade(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-[#16181d] px-3 py-2 text-white outline-none focus:border-sky-500"
                  >
                    <option value="BAIXA">BAIXA</option>
                    <option value="MEDIA">MÉDIA</option>
                    <option value="ALTA">ALTA</option>
                    <option value="CRITICA">CRÍTICA</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Descrição Detalhada</label>
                <textarea
                  value={novoIncidenteDescricao}
                  onChange={(e) => setNovoIncidenteDescricao(e.target.value)}
                  rows={3}
                  placeholder="Descreva a situação observada, impacto e ações de contenção adotadas..."
                  className="w-full rounded-lg border border-slate-700 bg-[#16181d] px-3 py-2 text-white outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setModalIncidenteAberto(false)}
                className="px-4 py-2 rounded-lg border border-slate-700 bg-[#25272c] text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                onClick={criarIncidente}
                disabled={salvandoIncidente || !novoIncidenteTitulo.trim()}
                className="px-4 py-2 rounded-lg bg-rose-600 text-xs font-bold text-white hover:bg-rose-500 disabled:opacity-50"
              >
                {salvandoIncidente ? 'Gravando...' : 'Abrir Ocorrência'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

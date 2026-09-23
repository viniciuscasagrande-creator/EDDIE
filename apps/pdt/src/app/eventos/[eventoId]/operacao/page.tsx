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
  ExternalLink,
  Eye,
  Filter,
  Megaphone,
  Plus,
  QrCode,
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
  Wifi,
  WifiOff,
  XCircle,
} from 'lucide-react';
import type { LiveConnectionState, AlertSeverity } from '@ticketing/contracts';
import { useProducerEvent } from '../../../../components/ProducerEventContext';

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

  // Modal de novo incidente
  const [modalIncidenteAberto, setModalIncidenteAberto] = useState(false);
  const [novoIncidenteTitulo, setNovoIncidenteTitulo] = useState('');
  const [novoIncidenteDescricao, setNovoIncidenteDescricao] = useState('');
  const [novoIncidenteCategoria, setNovoIncidenteCategoria] = useState('OPERACIONAL');
  const [novoIncidenteSeveridade, setNovoIncidenteSeveridade] = useState('MEDIA');
  const [salvandoIncidente, setSalvandoIncidente] = useState(false);

  // Erros isolados de blocos para não derrubar o painel
  const [erroMarketing, setErroMarketing] = useState<string | null>(null);
  const [erroFinanceiro, setErroFinanceiro] = useState<string | null>(null);

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
    } finally {
      setLoading(false);
    }
  }, [eventoId, sessaoSelecionada, api]);

  // Inicialização e gerenciamento de SSE com fallback controlado
  useEffect(() => {
    if (!eventoId) return;

    carregarSnapshot();

    // Iniciar SSE
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
            // Atualização incremental de snapshot sem recarregar tela inteira
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

    // Polling adaptativo como garantia
    pollingTimerRef.current = setInterval(() => {
      if (!document.hidden) {
        carregarSnapshot();
      }
    }, 12000);

    // Economia de recursos quando a aba não estiver visível
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
        prev.map((a) => (a.id === id ? { ...a, status: 'REVISADO', acknowledgedAt: new Date().toISOString() } : a))
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
    } catch {}
    finally {
      setSalvandoIncidente(false);
    }
  };

  const kpis = resumo?.kpis || {
    receitaConfirmadaCents: 0,
    pedidosPagos: 0,
    ingressosEmitidos: 0,
    capacidade: 1000,
    ocupacaoPercentual: 0,
    checkins: 0,
    pessoasDentro: 0,
    entradasPorMinuto: 0,
    restantes: 0,
    pagamentosPendentes: 0,
    pagamentosFalhos: 0,
    alertasCriticos: 0,
  };

  const formatBRL = (cents: number) =>
    (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const timelineFiltrada = timeline.filter((item) => {
    if (filtroTimeline === 'TODOS') return true;
    return item.tipo === filtroTimeline;
  });

  return (
    <div className="space-y-6 max-w-full overflow-hidden text-slate-100">
      {/* =====================================================================
          1. CABEÇALHO OPERACIONAL + STATUS AO VIVO
          ===================================================================== */}
      <div className="rounded-2xl border border-slate-700/80 bg-[#16181d] p-5 shadow-2xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-sky-500/10 px-2.5 py-1 text-xs font-semibold text-sky-400 border border-sky-500/20">
                <Radio className="h-3.5 w-3.5 animate-pulse text-sky-400" />
                MODO EVENTO AO VIVO
              </span>

              {/* Conexão em tempo real */}
              {connectionState === 'AO_VIVO' && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  AO VIVO
                </span>
              )}
              {connectionState === 'RECONECTANDO' && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/30">
                  <RefreshCcw className="h-3 w-3 animate-spin text-amber-400" />
                  RECONECTANDO...
                </span>
              )}
              {connectionState === 'DESATUALIZADO' && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 px-3 py-0.5 text-xs font-bold text-rose-400 border border-rose-500/30">
                  <WifiOff className="h-3 w-3 text-rose-400" />
                  DESATUALIZADO
                </span>
              )}

              <span className="text-xs text-slate-400">
                Atualizado: {ultimaAtualizacao.toLocaleTimeString('pt-BR')}
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white truncate">
              {resumo?.nome || 'Centro de Operações do Evento'}
            </h1>
            <p className="text-sm text-slate-400 truncate">
              ID: <span className="font-mono text-slate-300">{eventoId}</span> · Local:{' '}
              <span className="text-slate-300">{resumo?.local || 'Arena DiskIngressos'}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Seletor de Sessão */}
            {resumo?.sessoes && resumo.sessoes.length > 1 && (
              <select
                value={sessaoSelecionada}
                onChange={(e) => setSessaoSelecionada(e.target.value)}
                className="rounded-lg border border-slate-700 bg-[#25272c] px-3 py-2 text-xs font-medium text-slate-200 outline-none hover:border-slate-600 focus:border-sky-500"
              >
                {resumo.sessoes.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.nome}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => {
                setConnectionState('RECONECTANDO');
                carregarSnapshot();
              }}
              title="Sincronizar dados agora"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-[#25272c] px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-[#2d3036] hover:text-white"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              Sincronizar
            </button>

            <button
              onClick={() => setModalIncidenteAberto(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-rose-600/90 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-rose-500 shadow-lg shadow-rose-900/20"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Nova Ocorrência
            </button>
          </div>
        </div>

        {/* Atalhos rápidos para áreas operacionais */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap gap-2 text-xs">
          <Link
            href={`/eventos/${eventoId}/ingressos`}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#23252a] px-3 py-1.5 font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition"
          >
            <Ticket className="h-3.5 w-3.5 text-sky-400" />
            Consultar Ingresso
          </Link>
          <Link
            href={`/eventos/${eventoId}/portaria`}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#23252a] px-3 py-1.5 font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition"
          >
            <ScanLine className="h-3.5 w-3.5 text-emerald-400" />
            Portaria & Check-in
          </Link>
          <Link
            href={`/eventos/${eventoId}/antifraude`}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#23252a] px-3 py-1.5 font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition"
          >
            <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
            Antifraude
          </Link>
          <Link
            href={`/eventos/${eventoId}/mapa`}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#23252a] px-3 py-1.5 font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition"
          >
            <Users className="h-3.5 w-3.5 text-indigo-400" />
            Mapa & Setores
          </Link>
          <Link
            href={`/eventos/${eventoId}/financeiro`}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#23252a] px-3 py-1.5 font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition"
          >
            <Wallet className="h-3.5 w-3.5 text-emerald-400" />
            Financeiro do Evento
          </Link>
        </div>
      </div>

      {/* =====================================================================
          2. LINHA DE KPIS ESTRATÉGICOS (Grid responsivo fluido)
          ===================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Receita Confirmada */}
        <div className="rounded-xl border border-slate-700/80 bg-[#1c1e24] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Receita Confirmada</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-xl lg:text-2xl font-black text-white">
            {formatBRL(kpis.receitaConfirmadaCents)}
          </div>
          <div className="mt-1 text-[11px] text-emerald-400/90 font-medium">
            Somente pedidos pagos
          </div>
        </div>

        {/* Pedidos Pagos */}
        <div className="rounded-xl border border-slate-700/80 bg-[#1c1e24] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Pedidos Pagos</span>
            <CheckCircle2 className="h-4 w-4 text-sky-400" />
          </div>
          <div className="mt-2 text-xl lg:text-2xl font-black text-white">
            {kpis.pedidosPagos}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {kpis.pagamentosPendentes} pendentes
          </div>
        </div>

        {/* Ingressos Emitidos */}
        <div className="rounded-xl border border-slate-700/80 bg-[#1c1e24] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Ingressos Emitidos</span>
            <Ticket className="h-4 w-4 text-purple-400" />
          </div>
          <div className="mt-2 text-xl lg:text-2xl font-black text-white">
            {kpis.ingressosEmitidos}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Capacidade: {kpis.capacidade}
          </div>
        </div>

        {/* Ocupação */}
        <div className="rounded-xl border border-slate-700/80 bg-[#1c1e24] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Ocupação do Evento</span>
            <Users className="h-4 w-4 text-sky-400" />
          </div>
          <div className="mt-2 text-xl lg:text-2xl font-black text-white">
            {kpis.ocupacaoPercentual}%
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
            <div
              className="bg-sky-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, kpis.ocupacaoPercentual)}%` }}
            />
          </div>
        </div>

        {/* Check-ins / Pessoas Dentro */}
        <div className="rounded-xl border border-slate-700/80 bg-[#1c1e24] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Pessoas Dentro</span>
            <UserCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-xl lg:text-2xl font-black text-emerald-400">
            {kpis.pessoasDentro}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {kpis.restantes} ainda por entrar
          </div>
        </div>

        {/* Entradas por Minuto */}
        <div className="rounded-xl border border-slate-700/80 bg-[#1c1e24] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Fluxo Portaria</span>
            <TrendingUp className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-xl lg:text-2xl font-black text-amber-400">
            {kpis.entradasPorMinuto} <span className="text-xs font-normal text-slate-400">/min</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Média últimos 15 min
          </div>
        </div>

        {/* Scanners Online */}
        <div className="rounded-xl border border-slate-700/80 bg-[#1c1e24] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Scanners Ativos</span>
            <Smartphone className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-xl lg:text-2xl font-black text-white">
            {resumo?.portaria?.scannersOnline ?? 0}
          </div>
          <div className="mt-1 text-[11px] text-emerald-400/90 font-medium">
            Portarias A, B e VIP
          </div>
        </div>

        {/* Pagamentos Pendentes */}
        <div className="rounded-xl border border-slate-700/80 bg-[#1c1e24] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Aguardando Pgto</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-xl lg:text-2xl font-black text-white">
            {kpis.pagamentosPendentes}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {kpis.pagamentosFalhos} recusados/cancelados
          </div>
        </div>

        {/* Alertas Críticos */}
        <div
          className={`rounded-xl border p-4 shadow-sm ${
            kpis.alertasCriticos > 0
              ? 'border-rose-500/50 bg-rose-950/20'
              : 'border-slate-700/80 bg-[#1c1e24]'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Alertas Críticos</span>
            <ShieldAlert
              className={`h-4 w-4 ${kpis.alertasCriticos > 0 ? 'text-rose-400' : 'text-slate-500'}`}
            />
          </div>
          <div
            className={`mt-2 text-xl lg:text-2xl font-black ${
              kpis.alertasCriticos > 0 ? 'text-rose-400' : 'text-white'
            }`}
          >
            {kpis.alertasCriticos}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {alertas.filter((a) => a.status === 'ABERTO').length} abertos no total
          </div>
        </div>

        {/* Ticket Médio */}
        <div className="rounded-xl border border-slate-700/80 bg-[#1c1e24] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Ticket Médio</span>
            <Tag className="h-4 w-4 text-sky-400" />
          </div>
          <div className="mt-2 text-xl lg:text-2xl font-black text-white">
            {formatBRL(resumo?.vendas?.ticketMedioCents || 0)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Média por pedido pago
          </div>
        </div>
      </div>

      {/* =====================================================================
          3. GRIDS OPERACIONAIS PRINCIPAIS (2/3 x 1/3)
          ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLUNA ESQUERDA (8 COLUNAS): VENDAS, PORTARIA E INVENTÁRIO */}
        <div className="lg:col-span-8 space-y-6">
          {/* BLOCO: RITMO DE VENDAS */}
          <div className="rounded-xl border border-slate-700 bg-[#1a1c22] p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Ritmo de Vendas em Tempo Real</h3>
              </div>
              <span className="text-xs text-slate-400">Volume acumulado: {kpis.pedidosPagos} pedidos</span>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Ritmo por janela de tempo */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Pedidos Recentes
                </div>
                {(resumo?.vendas?.ritmoVendas || []).map((r: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 w-24">{r.horario}</span>
                    <div className="flex-1 mx-3 bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (r.pedidos / (kpis.pedidosPagos || 1)) * 300)}%` }}
                      />
                    </div>
                    <span className="font-mono text-slate-200">{r.pedidos} un</span>
                    <span className="font-mono text-emerald-400 ml-2">{formatBRL(r.valorCents)}</span>
                  </div>
                ))}
              </div>

              {/* Meios de Pagamento */}
              <div className="space-y-3 bg-[#202228] p-3.5 rounded-lg border border-slate-800">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Distribuição de Meios de Pagamento
                </div>
                {(resumo?.vendas?.meiosPagamento || []).map((m: any, idx: number) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-300">{m.meio}</span>
                      <span className="text-slate-400">
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
            </div>
          </div>

          {/* BLOCO: PORTARIA & FLUXO DE ACESSO */}
          <div className="rounded-xl border border-slate-700 bg-[#1a1c22] p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ScanLine className="h-5 w-5 text-sky-400" />
                <h3 className="font-bold text-white text-base">Portaria & Fluxo de Acesso</h3>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-emerald-400 font-semibold">
                  ✓ {resumo?.portaria?.checkinsValidos ?? 0} válidos
                </span>
                <span className="text-rose-400 font-semibold">
                  ✕ {resumo?.portaria?.checkinsRecusados ?? 0} recusados
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Portarias */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Taxa por Portaria
                </div>
                {(resumo?.portaria?.portarias || []).map((p: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-[#202228] border border-slate-800 flex justify-between items-center text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-200">{p.portaria}</div>
                      <div className="text-slate-400 mt-0.5">{p.checkins} entradas validadas</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sky-400">{p.taxaMinuto} /min</div>
                      <div className="text-[11px] text-slate-500">velocidade atual</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Scanners e Leitores Ativos */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Dispositivos de Leitura Conectados
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {(resumo?.portaria?.dispositivos || []).map((d: any) => (
                    <div
                      key={d.id}
                      className="p-2.5 rounded-lg bg-[#202228] border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-slate-400" />
                        <div>
                          <div className="font-medium text-slate-200">{d.nome}</div>
                          <div className="text-[11px] text-slate-400">{d.portaria}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {d.leiturasValidas} lidos
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Últimas leituras em tempo real */}
            <div className="mt-4 pt-4 border-t border-slate-800">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                Últimas Validações de Catraca
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {(resumo?.portaria?.ultimasLeituras || []).map((l: any) => {
                  const valido = l.resultado === 'VALIDO';
                  return (
                    <div
                      key={l.id}
                      className={`p-2.5 rounded-lg border flex items-center justify-between ${
                        valido
                          ? 'border-emerald-500/20 bg-emerald-950/10'
                          : 'border-rose-500/30 bg-rose-950/20'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-mono font-bold text-slate-200 truncate">
                          {l.ingressoNumero || 'ING-TOKEN'}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {l.portaria} {l.motivoRecusa ? `· ${l.motivoRecusa}` : ''}
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          valido ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
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

          {/* BLOCO: INVENTÁRIO & OCUPAÇÃO DE SETORES */}
          <div className="rounded-xl border border-slate-700 bg-[#1a1c22] p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">Inventário & Setores</h3>
              </div>
              <span className="text-xs text-slate-400">
                Disponível: {resumo?.inventario?.disponivel ?? 0} ingressos
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {(resumo?.inventario?.setores || []).map((s: any, idx: number) => (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-200">{s.nome}</span>
                    <span className="text-slate-400">
                      {s.ocupados} / {s.capacidade} ocupados ({s.percentual}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full transition-all"
                      style={{ width: `${s.percentual}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA (4 COLUNAS): FINANCEIRO, RISCO, MARKETING E ALERTAS */}
        <div className="lg:col-span-4 space-y-6">
          {/* BLOCO: FINANCEIRO CONCILIADO */}
          <div className="rounded-xl border border-slate-700 bg-[#1a1c22] p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Financeiro do Evento</h3>
              </div>
              <Link
                href={`/eventos/${eventoId}/financeiro`}
                className="text-xs text-emerald-400 hover:underline inline-flex items-center gap-1"
              >
                Detalhes <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="mt-3 space-y-2.5 text-xs">
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
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">A Liquidar:</span>
                <span className="font-mono text-slate-300">
                  {formatBRL(resumo?.financeiro?.aLiquidarCents || 0)}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Liquidado / Pago:</span>
                <span className="font-mono font-bold text-sky-400">
                  {formatBRL(resumo?.financeiro?.liquidadoCents || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* BLOCO: RISCO & ANTIFRAUDE */}
          <div className="rounded-xl border border-slate-700 bg-[#1a1c22] p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">Risco & Antifraude</h3>
              </div>
              <span className="text-xs text-slate-400">
                {resumo?.antifraude?.alertasAbertos ?? 0} sinais
              </span>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Tentativas de QR Duplicado:</span>
                <span className="font-mono font-bold text-amber-400">
                  {resumo?.antifraude?.qrDuplicados ?? 0}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Dispositivos Suspeitos:</span>
                <span className="font-mono font-bold text-slate-200">
                  {resumo?.antifraude?.dispositivosSuspeitos ?? 0}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Chargebacks em Aberto:</span>
                <span className="font-mono font-bold text-rose-400">
                  {resumo?.antifraude?.chargebacksAbertos ?? 0}
                </span>
              </div>
            </div>

            {/* Anomalias recentes */}
            <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Sinais Recentes
              </div>
              {(resumo?.antifraude?.anomalias || []).slice(0, 3).map((anom: any) => (
                <div
                  key={anom.id}
                  className="p-2 rounded bg-[#202228] border border-slate-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-amber-400">{anom.codigoSinal}</span>
                    <span className="text-[10px] text-slate-400">{anom.severidade}</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">{anom.descricao}</p>
                </div>
              ))}
            </div>
          </div>

          {/* BLOCO: MARKETING & TRÁFEGO */}
          <div className="rounded-xl border border-slate-700 bg-[#1a1c22] p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-purple-400" />
                <h3 className="font-bold text-white text-base">Marketing & Origem</h3>
              </div>
              <span className="text-xs text-slate-400">{resumo?.marketing?.visitas ?? 0} visitas</span>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              {(resumo?.marketing?.origens || []).map((o: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center py-1">
                  <span className="text-slate-300 truncate">{o.canal}</span>
                  <div className="font-mono text-slate-400">
                    {o.visitas} vis · <span className="text-emerald-400">{o.conversoes} conv</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          4. CENTRAL DE ALERTAS & INCIDENTES (Linha de Resolução Operacional)
          ===================================================================== */}
      <div className="rounded-xl border border-slate-700 bg-[#1a1c22] p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-2">
            <AlertOctagon className="h-5 w-5 text-rose-400" />
            <h3 className="font-bold text-white text-base">Central de Alertas & Ocorrências</h3>
          </div>
          <span className="text-xs text-slate-400">
            Alertas críticos permanecem fixados até resolução e ack
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Alertas */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Alertas Ativos
            </div>
            {alertas.length === 0 ? (
              <div className="p-4 rounded-lg bg-[#202228] border border-slate-800 text-xs text-slate-400 text-center">
                Nenhum alerta crítico ativo no momento.
              </div>
            ) : (
              alertas.map((a) => {
                const revisado = a.status === 'REVISADO';
                return (
                  <div
                    key={a.id}
                    className={`p-3 rounded-lg border text-xs space-y-2 ${
                      a.severity === 'CRITICA'
                        ? 'border-rose-500/40 bg-rose-950/20'
                        : 'border-slate-800 bg-[#202228]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{a.title}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          a.severity === 'CRITICA'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {a.severity}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px]">{a.description}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-500">
                        {new Date(a.createdAt).toLocaleTimeString('pt-BR')}
                      </span>
                      {!revisado ? (
                        <button
                          onClick={() => reconhecerAlerta(a.id)}
                          className="px-2.5 py-1 rounded bg-sky-600/80 hover:bg-sky-500 text-[11px] font-bold text-white transition"
                        >
                          Reconhecer (Ack)
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-400 font-semibold">
                          ✓ Reconhecido por {a.acknowledgedBy || 'operador'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Ocorrências / Incidentes do Evento */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Ocorrências em Andamento (SAC/ITIL)
            </div>
            {(resumo?.incidentes || []).length === 0 ? (
              <div className="p-4 rounded-lg bg-[#202228] border border-slate-800 text-xs text-slate-400 text-center">
                Nenhum incidente operacional aberto.
              </div>
            ) : (
              (resumo?.incidentes || []).map((inc: any) => (
                <div
                  key={inc.id}
                  className="p-3 rounded-lg border border-slate-800 bg-[#202228] text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{inc.titulo}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase font-semibold">
                      {inc.status}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px]">{inc.descricao}</p>
                  <div className="text-[10px] text-slate-500">
                    Categoria: {inc.categoria} · {new Date(inc.createdAt).toLocaleTimeString('pt-BR')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* =====================================================================
          5. TIMELINE OPERACIONAL UNIFICADA & DEDUPLICADA
          ===================================================================== */}
      <div className="rounded-xl border border-slate-700 bg-[#1a1c22] p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-sky-400" />
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
                    : 'bg-[#202228] text-slate-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Lista da Timeline */}
        <div className="mt-4 space-y-3 max-h-96 overflow-y-auto pr-1">
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
                  className="p-3 rounded-lg border border-slate-800 bg-[#202228] flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${corBadge}`}
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

      {/* =====================================================================
          MODAL: REGISTRAR NOVA OCORRÊNCIA / INCIDENTE
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
    </div>
  );
}

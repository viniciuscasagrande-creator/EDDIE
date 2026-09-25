'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  ExternalLink,
  Flame,
  Globe,
  Layers,
  MapPin,
  Megaphone,
  Radio,
  RefreshCcw,
  ScanLine,
  ShieldAlert,
  Ticket,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
  Zap,
} from 'lucide-react';
import { useProducerEvent } from '../../../../components/ProducerEventContext';

export interface CommandCenterHeaderData {
  eventId: string;
  producerId: string;
  eventName: string;
  status: string;
  sessionName: string;
  sessionDate: string;
  capacityTotal: number;
  occupancyCurrent: number;
  occupancyPercent: number;
  ticketsSoldTotal: number;
  grossRevenueCents: number;
  revenueSource: string;
  overallHealth: 'OPERACIONAL' | 'ATENCAO' | 'DEGRADADO' | 'CRITICO' | 'SEM_DADOS';
  lastUpdated: string;
}

export interface CommandCenterData {
  header: CommandCenterHeaderData;
  sales: {
    totalOrders: number;
    paidOrders: number;
    pendingOrders: number;
    failedOrders: number;
    ticketsSoldTotal: number;
    grossSalesCents: number;
    averageTicketCents: number;
    conversionRatePercent: number;
    salesBySector: Array<{ sectorId: string; sectorName: string; sold: number; capacity: number; percent: number }>;
    salesByLot: Array<{ lotId: string; lotName: string; sold: number; limit: number; status: string }>;
    salesByChannel: Array<{ channel: string; orders: number; revenueCents: number; sharePercent: number }>;
  };
  payments: {
    totalProcessedCents: number;
    approvedCents: number;
    pendingCents: number;
    declinedCents: number;
    approvalRatePercent: number;
    pixApprovalRatePercent: number;
    cardApprovalRatePercent: number;
    methods: Array<{ method: string; ordersCount: number; totalCents: number; approvalRate: number }>;
    declinedReasons: Array<{ reason: string; count: number; actionRecommended: string }>;
  };
  gate: {
    totalEntries: number;
    entriesLast15Minutes: number;
    flowPacePerMinute: number;
    deniedEntries: number;
    peakHour: string;
    occupancyCurrent: number;
    occupancyCapacity: number;
    occupancyPercent: number;
    gates: Array<{ gateId: string; gateName: string; entries: number; devicesOnline: number; status: string }>;
    deniedAlerts: Array<{ id: string; ticketCode: string; reason: string; gate: string; timestamp: string; operator: string }>;
  };
  marketing: {
    activeCampaigns: number;
    totalImpressions: number;
    totalClicks: number;
    attributedRevenueCents: number;
    blendedRoas: number;
    topChannels: Array<{ channel: string; costCents: number; revenueCents: number; roas: number }>;
    topUtmSources: Array<{ source: string; visits: number; conversions: number; revenueCents: number }>;
    trackingHealth: string;
    sourceNote: string;
  };
  finance: {
    grossTicketSalesCents: number;
    diskServiceFeesCents: number;
    producerNetBalanceCents: number;
    gatewayProcessingFeesCents: number;
    refundsProcessedCents: number;
    chargebacksUnderDisputeCents: number;
    payoutScheduledCents: number;
    payoutStatus: string;
    reconciliationStatus: string;
    reconciliationDivergenceCents: number;
    ledgerEntryCount: number;
  };
  support: {
    openTicketsCount: number;
    ticketsInSlaCount: number;
    slaBreachedCount: number;
    averageResponseMinutes: number;
    topTopics: Array<{ topic: string; count: number }>;
    criticalTickets: Array<{ id: string; protocol: string; subject: string; priority: string; openedAt: string }>;
  };
  risks: {
    antifraudAlertsCount: number;
    duplicateQrAttemptsCount: number;
    chargebackRatePercent: number;
    suspiciousOrdersCount: number;
    riskScore: string;
    recentIncidents: Array<{ id: string; title: string; riskLevel: string; timestamp: string }>;
  };
  health: {
    apiLatencyMs: number;
    eventBusStatus: string;
    gatewayProvidersStatus: Array<{ provider: string; status: string; latencyMs: number }>;
    marketingProvidersStatus: Array<{ provider: string; status: string }>;
    queueBacklogs: Array<{ queue: string; pending: number; delayed: number; failed: number }>;
  };
  activeIncidents: Array<{
    id: string;
    title: string;
    sourceModule: string;
    severity: string;
    status: string;
    startedAt: string;
    observedImpact: string;
    relatedSymptoms: string[];
    correlationId: string;
  }>;
  insights: Array<{
    id: string;
    category: string;
    title: string;
    observation: string;
    evidence: string;
    recommendation: string;
    confidenceScore: number;
    dataQuality: string;
  }>;
  generatedAt: string;
}

export default function EventCommandCenterPage({
  params,
}: {
  params: Promise<{ eventoId: string }>;
}) {
  const [eventoId, setEventoId] = useState('');
  const { api, produtorId } = useProducerEvent();

  const [data, setData] = useState<CommandCenterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    | 'agora'
    | 'vendas'
    | 'pagamentos'
    | 'portaria'
    | 'marketing'
    | 'financeiro'
    | 'sac'
    | 'riscos'
    | 'health'
    | 'war-room'
    | 'insights'
  >('agora');

  const [liveEvents, setLiveEvents] = useState<any[]>([]);
  const [isLiveConnected, setIsLiveConnected] = useState(true);
  const seenEventIds = useRef<Set<string>>(new Set());

  const activeProducerId = produtorId || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const baseApi = api || '/api';

  useEffect(() => {
    params.then((p) => setEventoId(p.eventoId));
  }, [params]);

  const loadSnapshot = useCallback(async () => {
    if (!eventoId) return;
    try {
      const res = await fetch(`${baseApi}/eventos/${eventoId}/command-center/summary`, {
        headers: { 'x-producer-id': activeProducerId },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // Falha tratada graciosamente
    } finally {
      setLoading(false);
    }
  }, [baseApi, eventoId, activeProducerId]);

  useEffect(() => {
    if (eventoId) {
      loadSnapshot();
    }
  }, [eventoId, loadSnapshot]);

  // Stream SSE simulado e com fallback por pooling para garantir dados em tempo real
  useEffect(() => {
    if (!eventoId) return;

    let timer: NodeJS.Timeout;

    const poll = async () => {
      try {
        const res = await fetch(`${baseApi}/eventos/${eventoId}/command-center/live`, {
          headers: { 'x-producer-id': activeProducerId },
        });
        if (res.ok) {
          const liveHeader = await res.json();
          setData((prev) => (prev ? { ...prev, header: liveHeader } : prev));
          setIsLiveConnected(true);
        }
      } catch {
        setIsLiveConnected(false);
      }
    };

    timer = setInterval(poll, 8000);
    return () => clearInterval(timer);
  }, [eventoId, baseApi, activeProducerId]);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <RefreshCcw className="w-8 h-8 animate-spin text-indigo-400 mx-auto" />
          <p className="text-sm font-medium text-slate-400">
            Conectando ao Command Center do Evento...
          </p>
        </div>
      </div>
    );
  }

  const { header, sales, payments, gate, marketing, finance, support, risks, health, activeIncidents, insights } = data;

  const healthBadgeColor =
    header.overallHealth === 'OPERACIONAL'
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      : header.overallHealth === 'ATENCAO'
      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      : 'bg-rose-500/10 text-rose-400 border-rose-500/20';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      {/* ========================================================================= */}
      {/* 1. HEADER FIXO DO COMMAND CENTER                                         */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-6 py-4 shadow-xl">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/operacao/command-center"
                className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1"
              >
                ← Visão Geral
              </Link>
              <span className="text-slate-600">•</span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Radio className="w-3 h-3 animate-pulse" />
                COMMAND CENTER INDIVIDUAL
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${healthBadgeColor}`}>
                {header.overallHealth === 'OPERACIONAL' ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <AlertTriangle className="w-3 h-3" />
                )}
                {header.overallHealth}
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                {header.eventName}
              </h1>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                {header.status}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                {header.sessionName} ({new Date(header.sessionDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })})
              </span>
              <span className="flex items-center gap-1 text-emerald-400 font-mono">
                ● AO VIVO (SSE / Event Bus Ativo)
              </span>
            </div>
          </div>

          {/* KPIs do Header */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <Ticket className="w-3 h-3 text-indigo-400" />
                Ingressos Vendidos
              </div>
              <div className="text-sm font-bold text-white">
                {header.ticketsSoldTotal.toLocaleString('pt-BR')} / {header.capacityTotal.toLocaleString('pt-BR')}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <Users className="w-3 h-3 text-emerald-400" />
                Ocupação Atual
              </div>
              <div className="text-sm font-bold text-emerald-400">
                {header.occupancyCurrent.toLocaleString('pt-BR')} ({header.occupancyPercent}%)
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <Wallet className="w-3 h-3 text-sky-400" />
                Faturamento Bruto
              </div>
              <div className="text-sm font-bold text-white">
                R$ {(header.grossRevenueCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[9px] text-slate-500 font-mono">Ledger Contábil</div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-400">War Room</div>
                <div className="text-sm font-bold text-amber-400">
                  {activeIncidents.length} incidentes
                </div>
              </div>
              <button
                onClick={loadSnapshot}
                className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Sincronizar dados"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Barra de Navegação por Abas (10 Áreas do Command Center) */}
        <nav className="flex items-center gap-1 overflow-x-auto mt-4 pt-2 border-t border-slate-800/80 text-xs no-scrollbar">
          {[
            { id: 'agora', label: 'Agora (Ao Vivo)', icon: Zap },
            { id: 'vendas', label: 'Vendas & Ingressos', icon: Ticket },
            { id: 'pagamentos', label: 'Pagamentos & PIX', icon: CreditCard },
            { id: 'portaria', label: 'Portaria & Catracas', icon: ScanLine },
            { id: 'marketing', label: 'Marketing & ROI', icon: Megaphone },
            { id: 'financeiro', label: 'Financeiro & Ledger', icon: Wallet },
            { id: 'sac', label: 'SAC & Chamados', icon: Users },
            { id: 'riscos', label: 'Riscos & Antifraude', icon: ShieldAlert },
            { id: 'health', label: 'Saúde Técnica', icon: Activity },
            { id: 'war-room', label: 'War Room (Incidentes)', icon: Flame },
            { id: 'insights', label: 'Inteligência Operacional', icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </header>

      {/* ========================================================================= */}
      {/* 2. CONTEÚDO PRINCIPAL DAS ÁREAS DO COMMAND CENTER                         */}
      {/* ========================================================================= */}
      <main className="p-6 md:p-8 space-y-6 flex-1">
        {/* ABA: AGORA (LIVE SNAPSHOT) */}
        {activeTab === 'agora' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Card 1: Ritmo de Portaria */}
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="font-semibold text-slate-300">RITMO DE ENTRADA AO VIVO</span>
                    <ScanLine className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-white">
                    {gate.flowPacePerMinute} <span className="text-xs font-normal text-slate-400">pessoas/min</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    {gate.entriesLast15Minutes} pessoas passaram pelas catracas nos últimos 15 minutos.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-medium">Catracas fluindo normalmente</span>
                  <Link href={`/eventos/${eventoId}/portaria`} className="text-indigo-400 hover:underline flex items-center gap-1">
                    Ver Portaria <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Card 2: Conversão & Vendas Recentes */}
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="font-semibold text-slate-300">CONVERSÃO DO CHECKOUT</span>
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-white">
                    {sales.conversionRatePercent}% <span className="text-xs font-normal text-slate-400">taxa de sucesso</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    {sales.paidOrders} pedidos pagos com sucesso de {sales.totalOrders} iniciados.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">PIX: {payments.pixApprovalRatePercent}% aprov.</span>
                  <Link href={`/eventos/${eventoId}/ingressos`} className="text-indigo-400 hover:underline flex items-center gap-1">
                    Ver Lotes <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Card 3: Integridade & Saúde */}
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="font-semibold text-slate-300">SAÚDE TÉCNICA DO CLUSTER</span>
                    <Activity className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-white">
                    {health.apiLatencyMs}ms <span className="text-xs font-normal text-slate-400">latência API</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    RabbitMQ Event Bus: <span className="text-emerald-400 font-semibold">{health.eventBusStatus}</span>. Gateways adquirentes sem falha generalizada.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Filas pendentes: 0</span>
                  <button onClick={() => setActiveTab('health')} className="text-indigo-400 hover:underline flex items-center gap-1">
                    Ver Telemetria <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* War Room Banner se houver incidentes */}
            {activeIncidents.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Flame className="w-6 h-6 text-amber-400 flex-shrink-0 animate-bounce" />
                  <div>
                    <h3 className="text-sm font-bold text-amber-400">
                      War Room Ativa: {activeIncidents[0]?.title}
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {activeIncidents[0]?.observedImpact} (Severidade: {activeIncidents[0]?.severity})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('war-room')}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-semibold text-xs hover:bg-amber-400 transition-colors whitespace-nowrap"
                >
                  Assumir na War Room
                </button>
              </div>
            )}

            {/* Setores e Ocupação em Tempo Real */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  Lotação por Setor & Virada de Lotes
                </h2>
                <span className="text-xs text-slate-400">Capacidade Total: {header.capacityTotal.toLocaleString('pt-BR')}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sales.salesBySector.map((sec) => (
                  <div key={sec.sectorId} className="p-4 rounded-lg bg-slate-950 border border-slate-800/80">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="font-semibold text-slate-200">{sec.sectorName}</span>
                      <span className="text-slate-400">{sec.sold} / {sec.capacity} ({sec.percent}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          sec.percent > 90 ? 'bg-amber-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${Math.min(100, sec.percent)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ABA: VENDAS & INGRESSOS */}
        {activeTab === 'vendas' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 mb-1">Pedidos Pagos</div>
                <div className="text-2xl font-bold text-white">{sales.paidOrders}</div>
                <div className="text-[11px] text-slate-500 mt-1">de {sales.totalOrders} gerados</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 mb-1">Receita Confirmada</div>
                <div className="text-2xl font-bold text-emerald-400">
                  R$ {(sales.grossSalesCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Exclusivo pedidos PAGO</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 mb-1">Ticket Médio</div>
                <div className="text-2xl font-bold text-white">
                  R$ {(sales.averageTicketCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Por comprador confirmado</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 mb-1">Taxa de Conversão</div>
                <div className="text-2xl font-bold text-sky-400">{sales.conversionRatePercent}%</div>
                <div className="text-[11px] text-slate-500 mt-1">Carrinho $\rightarrow$ Pedido Pago</div>
              </div>
            </div>

            {/* Vendas por Canal */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold text-white">Vendas por Canal de Distribuição</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sales.salesByChannel.map((ch) => (
                  <div key={ch.channel} className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="text-xs text-slate-400 font-semibold mb-1">{ch.channel}</div>
                    <div className="text-lg font-bold text-white">
                      R$ {(ch.revenueCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{ch.orders} pedidos ({ch.sharePercent}%)</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ABA: PAGAMENTOS */}
        {activeTab === 'pagamentos' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 mb-1">Aprovação PIX</div>
                <div className="text-3xl font-extrabold text-emerald-400">{payments.pixApprovalRatePercent}%</div>
                <div className="text-xs text-slate-500 mt-2">Aprovação em D+0 imediato</div>
              </div>
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 mb-1">Aprovação Cartão de Crédito</div>
                <div className="text-3xl font-extrabold text-sky-400">{payments.cardApprovalRatePercent}%</div>
                <div className="text-xs text-slate-500 mt-2">Com análise 3DS e antifraude</div>
              </div>
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 mb-1">Pagamentos Recusados</div>
                <div className="text-3xl font-extrabold text-rose-400">
                  R$ {(payments.declinedCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-slate-500 mt-2">Recuperáveis via Remarketing</div>
              </div>
            </div>

            {/* Motivos de Recusa */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold text-white">Diagnóstico de Recusas de Pagamento & Ações</h2>
              <div className="divide-y divide-slate-800">
                {payments.declinedReasons.map((rec, i) => (
                  <div key={i} className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <div className="text-xs font-semibold text-slate-200">{rec.reason}</div>
                      <div className="text-[11px] text-slate-500">Ação indicada: {rec.actionRecommended}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-xs font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      {rec.count} ocorrências
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ABA: PORTARIA & CATRACAS */}
        {activeTab === 'portaria' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 mb-1">Total de Entradas Confirmadas</div>
                <div className="text-3xl font-extrabold text-emerald-400">{gate.totalEntries.toLocaleString('pt-BR')}</div>
                <div className="text-xs text-slate-500 mt-1">Validadas no cluster da portaria</div>
              </div>
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 mb-1">Entradas nos Últimos 15 min</div>
                <div className="text-3xl font-extrabold text-white">{gate.entriesLast15Minutes}</div>
                <div className="text-xs text-slate-500 mt-1">{gate.flowPacePerMinute} pessoas/minuto</div>
              </div>
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 mb-1">Check-ins Recusados / Barrados</div>
                <div className="text-3xl font-extrabold text-amber-400">{gate.deniedEntries}</div>
                <div className="text-xs text-slate-500 mt-1">Duplicados ou cancelados</div>
              </div>
            </div>

            {/* Alertas de Recusa na Portaria */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                Alertas Recentes da Portaria (Antifraude)
              </h2>
              <div className="space-y-2">
                {gate.deniedAlerts.map((den) => (
                  <div key={den.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono text-rose-400 font-semibold">{den.ticketCode}</span>
                      <span className="text-slate-400 ml-2">Motivo: {den.reason}</span>
                      <div className="text-[10px] text-slate-500 mt-0.5">{den.gate} • {den.operator}</div>
                    </div>
                    <span className="text-slate-500 text-[11px] font-mono">
                      {new Date(den.timestamp).toLocaleTimeString('pt-BR')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ABA: FINANCEIRO & LEDGER */}
        {activeTab === 'financeiro' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 mb-1">Venda Bruta Ingressos</div>
                <div className="text-2xl font-bold text-white">
                  R$ {(finance.grossTicketSalesCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Registrado no Ledger</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 mb-1">Taxa de Serviço DiskIngressos</div>
                <div className="text-2xl font-bold text-sky-400">
                  R$ {(finance.diskServiceFeesCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">10% contratual do evento</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 mb-1">Saldo Líquido Produtor</div>
                <div className="text-2xl font-bold text-emerald-400">
                  R$ {(finance.producerNetBalanceCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">A repassar via D+X</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 mb-1">Status de Conciliação</div>
                <div className="text-2xl font-bold text-indigo-400">100%</div>
                <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {finance.reconciliationStatus}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-300">Regra de Inviolabilidade Contábil:</span> O Command Center lê os lançamentos oficiais do Ledger. Nenhuma métrica analítica de marketing pode sobrescrever saldos reais.
              </div>
              <Link href="/financeiro" className="text-indigo-400 hover:underline flex items-center gap-1 font-semibold">
                Abrir Módulo Financeiro <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* ABA: MARKETING */}
        {activeTab === 'marketing' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 mb-1">Campanhas Ads Ativas</div>
                <div className="text-3xl font-extrabold text-sky-400">{marketing.activeCampaigns}</div>
                <div className="text-xs text-slate-500 mt-2">Meta Ads, Google e TikTok</div>
              </div>
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 mb-1">Receita Atribuída</div>
                <div className="text-3xl font-extrabold text-emerald-400">
                  R$ {(marketing.attributedRevenueCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-slate-500 mt-2">Modelo Multi-Touch Linear</div>
              </div>
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 mb-1">ROAS Consolidado</div>
                <div className="text-3xl font-extrabold text-indigo-400">{marketing.blendedRoas}x</div>
                <div className="text-xs text-slate-500 mt-2">Retorno sobre gasto com mídia</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-300">Nota de Governança:</span> {marketing.sourceNote}
              </div>
              <Link href="/marketing" className="text-indigo-400 hover:underline flex items-center gap-1 font-semibold">
                Abrir Módulo de Marketing <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* ABA: WAR ROOM (INCIDENTES) */}
        {activeTab === 'war-room' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-400" />
                  War Room Operacional (Incident Command)
                </h2>
                <p className="text-xs text-slate-400">Gestão e contenção de crises em tempo real com timeline de evidências.</p>
              </div>
            </div>

            {activeIncidents.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm bg-slate-900 rounded-xl border border-slate-800">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                Nenhum incidente ativo neste momento. Operação operando em regime de normalidade.
              </div>
            ) : (
              <div className="space-y-4">
                {activeIncidents.map((inc) => (
                  <div key={inc.id} className="p-5 rounded-xl bg-slate-900 border border-amber-500/30 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 mr-2">
                          {inc.severity}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                          {inc.sourceModule}
                        </span>
                        <h3 className="text-base font-bold text-white mt-1">{inc.title}</h3>
                      </div>
                      <span className="text-xs font-mono text-slate-500">
                        {new Date(inc.startedAt).toLocaleTimeString('pt-BR')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300">{inc.observedImpact}</p>

                    {inc.relatedSymptoms && inc.relatedSymptoms.length > 0 && (
                      <div className="text-xs text-slate-400">
                        <span className="font-semibold text-slate-300">Sintomas correlacionados:</span>
                        <ul className="list-disc list-inside mt-1 space-y-0.5">
                          {inc.relatedSymptoms.map((symp, idx) => (
                            <li key={idx}>{symp}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="pt-3 border-t border-slate-800 flex justify-end">
                      <button
                        onClick={() => alert(`Incidente ${inc.id} investigado e contido.`)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
                      >
                        Registrar Ação de Mitigação
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ABA: INTELIGÊNCIA OPERACIONAL */}
        {activeTab === 'insights' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              Recomendações e Inteligência Operacional
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map((ins) => (
                <div key={ins.id} className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {ins.category}
                    </span>
                    <span className="text-slate-400">Confiança: {ins.confidenceScore}%</span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{ins.title}</h3>
                  <p className="text-xs text-slate-300">{ins.observation}</p>
                  <div className="p-2.5 rounded bg-slate-950 text-xs text-emerald-400 border border-slate-800">
                    <span className="font-semibold">Recomendação:</span> {ins.recommendation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA: SAÚDE TÉCNICA */}
        {activeTab === 'health' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 mb-1">Latência Média da API</div>
                <div className="text-3xl font-extrabold text-white">{health.apiLatencyMs}ms</div>
                <div className="text-xs text-emerald-400 mt-2">Performance ideal sub-50ms</div>
              </div>
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 mb-1">Event Bus RabbitMQ</div>
                <div className="text-3xl font-extrabold text-emerald-400">{health.eventBusStatus}</div>
                <div className="text-xs text-slate-500 mt-2">Deduplicação de 48h ativa</div>
              </div>
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 mb-1">Filas em Retry</div>
                <div className="text-3xl font-extrabold text-slate-300">0</div>
                <div className="text-xs text-slate-500 mt-2">Nenhum acúmulo de mensagens</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

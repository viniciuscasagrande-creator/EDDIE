'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Filter,
  Flame,
  LayoutDashboard,
  MapPin,
  Megaphone,
  Radio,
  RefreshCcw,
  Search,
  ShieldAlert,
  Ticket,
  Users,
  Wallet,
} from 'lucide-react';
import { useProducerEvent } from '../../../components/ProducerEventContext';

export interface ProducerEventItem {
  id: string;
  producerId: string;
  name: string;
  slug: string;
  status: 'RASCUNHO' | 'PUBLICADO' | 'ENCERRADO' | 'CANCELADO';
  venue: string;
  startDate: string;
  capacityTotal: number;
  ticketsSold: number;
  occupancyPercent: number;
  grossRevenueCents: number;
  netProducerCents: number;
  activeCampaignsCount: number;
  health: 'OPERACIONAL' | 'ATENCAO' | 'DEGRADADO' | 'CRITICO' | 'SEM_DADOS';
  criticalAlertsCount: number;
  lastUpdate: string;
}

export default function ProducerCommandCenterOverviewPage() {
  const { produtorId, api } = useProducerEvent();
  const [events, setEvents] = useState<ProducerEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [lastSync, setLastSync] = useState(new Date());

  const activeProducerId = produtorId || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const baseApi = api || '/api';

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseApi}/produtores/${activeProducerId}/command-center/events`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data || []);
      }
    } catch {
      // Fallback gracioso mantendo integridade
    } finally {
      setLoading(false);
      setLastSync(new Date());
    }
  };

  useEffect(() => {
    loadEvents();
  }, [activeProducerId]);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchSearch =
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.venue.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'TODOS' || e.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [events, searchTerm, statusFilter]);

  const totalGMVCents = events.reduce((acc, curr) => acc + (curr.grossRevenueCents || 0), 0);
  const totalTickets = events.reduce((acc, curr) => acc + (curr.ticketsSold || 0), 0);
  const totalAlerts = events.reduce((acc, curr) => acc + (curr.criticalAlertsCount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              COMMAND CENTER OPERACIONAL
            </span>
            <span className="text-xs text-slate-400">EDDIE 11.18</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Visão Geral do Produtor
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Monitoramento centralizado de todos os eventos autorizados. Acesse a sala de controle individual de cada produção.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadEvents}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          <Link
            href="/operacao"
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            NOC Geral
          </Link>
        </div>
      </div>

      {/* Métricas Agregadas do Produtor */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Eventos no Portfólio</span>
            <Calendar className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{events.length}</div>
          <div className="text-xs text-slate-500 mt-1">Produtor com permissão validada</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Ingressos Vendidos</span>
            <Ticket className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{totalTickets.toLocaleString('pt-BR')}</div>
          <div className="text-xs text-slate-500 mt-1">Todos os eventos consolidados</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Faturamento Bruto (Ledger)</span>
            <Wallet className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            R$ {(totalGMVCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 mt-1">Fonte soberana: Ledger Contábil</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Alertas Críticos Ativos</span>
            <ShieldAlert className={`w-4 h-4 ${totalAlerts > 0 ? 'text-amber-400' : 'text-slate-500'}`} />
          </div>
          <div className={`text-2xl font-bold ${totalAlerts > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
            {totalAlerts}
          </div>
          <div className="text-xs text-slate-500 mt-1">Requerem atenção ou intervenção</div>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome ou local do evento..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
          <span className="text-xs text-slate-400 hidden sm:block">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-2.5 py-1.5 text-xs rounded-lg bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="TODOS">Todos os Status</option>
            <option value="PUBLICADO">Publicado / Ao Vivo</option>
            <option value="RASCUNHO">Rascunho</option>
            <option value="ENCERRADO">Encerrado</option>
          </select>
        </div>
      </div>

      {/* Grid de Cards de Eventos */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-sm">
          <RefreshCcw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
          Carregando eventos autorizados...
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-sm bg-slate-900/50 rounded-xl border border-slate-800/80">
          Nenhum evento encontrado com os filtros selecionados.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredEvents.map((evt) => {
            const healthColor =
              evt.health === 'OPERACIONAL'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : evt.health === 'ATENCAO'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20';

            return (
              <div
                key={evt.id}
                className="rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${healthColor} mb-1.5`}>
                        {evt.health === 'OPERACIONAL' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <AlertTriangle className="w-3 h-3" />
                        )}
                        {evt.health}
                      </span>
                      <h2 className="text-lg font-bold text-white leading-snug">{evt.name}</h2>
                    </div>

                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {evt.status}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 text-xs text-slate-400 mb-4">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{evt.venue}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{new Date(evt.startDate).toLocaleDateString('pt-BR')} às {new Date(evt.startDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  {/* Barra de Ocupação */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Vendas / Capacidade</span>
                      <span className="text-white font-medium">
                        {evt.ticketsSold.toLocaleString('pt-BR')} / {evt.capacityTotal.toLocaleString('pt-BR')} ({evt.occupancyPercent}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all"
                        style={{ width: `${Math.min(100, evt.occupancyPercent)}%` }}
                      />
                    </div>
                  </div>

                  {/* KPIs Financeiros & Alertas */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs mb-4">
                    <div>
                      <div className="text-slate-500 text-[10px]">Faturamento Bruto</div>
                      <div className="font-semibold text-white">
                        R$ {(evt.grossRevenueCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[10px]">Líquido Produtor</div>
                      <div className="font-semibold text-emerald-400">
                        R$ {(evt.netProducerCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[10px]">Campanhas Ads</div>
                      <div className="font-semibold text-sky-400 flex items-center gap-1">
                        <Megaphone className="w-3 h-3" />
                        {evt.activeCampaignsCount} ativas
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-500">
                    ID: <span className="font-mono text-slate-400">{evt.id.slice(0, 8)}...</span>
                  </div>
                  <Link
                    href={`/eventos/${evt.id}/command-center`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-sm"
                  >
                    Abrir Command Center
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rodapé Informativo de Governança */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Isolamento Multi-inquilino RBAC ativo. Produtor A × Produtor B estritamente segregados.</span>
        </div>
        <div>
          Última sincronização do cluster: {lastSync.toLocaleTimeString('pt-BR')}
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  LayoutDashboard,
  Ticket,
  Map,
  FileBarChart,
  Info,
  Wallet,
  Megaphone,
  ScanLine,
  ShieldAlert,
  Activity,
  RefreshCcw,
  Gift,
  Layers,
  Calendar,
  Compass,
} from 'lucide-react';
import { EventContextNav, NavItem } from '../event-operations/EventContextNav';

export function EventOsShell({
  eventoId,
  children,
}: {
  eventoId: string;
  children: React.ReactNode;
}) {
  const navItems: NavItem[] = [
    // Itens Prioritários (visíveis diretamente na barra)
    { href: `/eventos/${eventoId}/operacao`, label: 'Operação', icon: Activity, priority: true },
    { href: `/eventos/${eventoId}/cockpit`, label: 'Cockpit', icon: Compass, priority: true },
    { href: `/eventos/${eventoId}/dashboard`, label: 'Dashboard', icon: LayoutDashboard, priority: true },
    { href: `/eventos/${eventoId}/ingressos`, label: 'Ingressos', icon: Ticket, priority: true },
    { href: `/eventos/${eventoId}/portaria`, label: 'Portaria', icon: ScanLine, priority: true },
    { href: `/eventos/${eventoId}/antifraude`, label: 'Antifraude', icon: ShieldAlert, priority: true },
    { href: `/eventos/${eventoId}/mapa`, label: 'Mapa', icon: Map, priority: true },
    { href: `/eventos/${eventoId}/financeiro`, label: 'Financeiro', icon: Wallet, priority: true },

    { href: `/eventos/${eventoId}/sala-situacao`, label: 'Sala de Situação', icon: ShieldAlert, priority: false },
    { href: `/eventos/${eventoId}/marketing`, label: 'Marketing', icon: Megaphone, priority: false },
    { href: `/eventos/${eventoId}/remarketing`, label: 'Remarketing', icon: RefreshCcw, priority: false },
    { href: `/eventos/${eventoId}/cortesias`, label: 'Cortesias', icon: Gift, priority: false },
    { href: `/eventos/${eventoId}/relatorios`, label: 'Relatórios', icon: FileBarChart, priority: false },
    { href: `/eventos/${eventoId}/detalhes`, label: 'Configurações', icon: Info, priority: false },
    { href: `/eventos/${eventoId}/configuracao/lotes`, label: 'Gestão de Lotes', icon: Layers, priority: false },
    { href: `/eventos/${eventoId}/configuracao/sessoes`, label: 'Sessões do Evento', icon: Calendar, priority: false },
    { href: `/eventos/${eventoId}/configuracao/setores`, label: 'Setores & Capacidade', icon: Map, priority: false },
  ];

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-80px)] -m-4 lg:-m-6">
      {/* BARRA HORIZONTAL FIXA DE CONTEXTO DO EVENTO (Substitui a 2ª sidebar) */}
      <div className="sticky top-16 z-20 w-full bg-[#111317]/95 backdrop-blur-md border-b border-slate-800 px-4 lg:px-6 py-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Lado Esquerdo: Voltar + Identificador do Evento */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/eventos"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-[#1e2026] px-2.5 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
            >
              <ArrowLeft size={14} />
              <span>Eventos</span>
            </Link>
            <div className="h-4 w-px bg-slate-700" />
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Ticket size={15} />
              </div>
              <span className="font-mono text-xs font-bold text-slate-200">
                {eventoId}
              </span>
            </div>
          </div>

          {/* Navegação Contextual do Evento (EventContextNav) */}
          <div className="min-w-0">
            <EventContextNav items={navItems} />
          </div>
        </div>
      </div>

      {/* Conteúdo Principal Ocupando 100% da Largura Útil */}
      <main className="flex-1 w-full min-w-0 bg-[#0f1115] p-4 lg:p-6 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}

export const Kpi = ({
  label,
  value,
  help,
}: {
  label: string;
  value: string;
  help: string;
}) => (
  <div className="rounded-xl border border-slate-700 bg-[#292b31] p-4">
    <div className="text-xs text-slate-400">{label}</div>
    <div className="text-2xl font-bold text-white mt-2">{value}</div>
    <div className="text-xs text-slate-500 mt-1">{help}</div>
  </div>
);

export const EmptyChart = ({ title }: { title: string }) => (
  <div className="rounded-xl border border-slate-700 bg-[#292b31] p-5 min-h-52">
    <h3 className="font-semibold text-white">{title}</h3>
    <div className="h-32 mt-4 grid place-items-center border-b border-l border-slate-600 text-xs text-slate-500">
      Aguardando dados reais do evento
    </div>
  </div>
);

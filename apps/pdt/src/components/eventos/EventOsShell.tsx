'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, Ticket } from 'lucide-react';
import { EventContextNav, type NavItem } from '../event-operations/EventContextNav';
import { EVENT_OS_NAV } from '../../lib/eventOsCatalog';

export function EventOsShell({
  eventoId,
  children,
}: {
  eventoId: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Mapeia itens da fonte única de verdade (EVENT_OS_NAV)
  const navItems: NavItem[] = EVENT_OS_NAV.map((item) => ({
    href: `/eventos/${eventoId}/${item.slug}`,
    label: item.shortLabel || item.label,
    icon: item.icon,
    priority: item.priority,
  }));

  // Detecta o item ativo para o breadcrumb
  const activeItem = EVENT_OS_NAV.find((item) => {
    const target = `/eventos/${eventoId}/${item.slug}`;
    return pathname === target || pathname.startsWith(target + '/');
  });

  return (
    <div className="flex flex-col w-full min-h-full -m-8">
      {/* BARRA HORIZONTAL FIXA DE CONTEXTO DO EVENTO (ÚNICA FONTE DE VERDADE) */}
      <header className="sticky top-0 z-20 w-full bg-[#0d1322]/95 backdrop-blur-md border-b border-slate-800 px-6 py-2.5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Lado Esquerdo: Breadcrumb Todos os Eventos → Evento → Área */}
          <nav aria-label="Breadcrumb do Evento" className="flex items-center gap-2 shrink-0 min-w-0">
            <Link
              href="/eventos"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-[#161a24] px-2.5 py-1 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
              title="Voltar para Todos os Eventos"
            >
              <ArrowLeft size={13} />
              <span className="hidden sm:inline">Todos os Eventos</span>
            </Link>
            <span className="text-slate-600 font-bold">/</span>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20">
              <Ticket size={13} className="text-sky-400 shrink-0" />
              <span className="font-mono text-xs font-bold text-sky-300 truncate max-w-[140px] md:max-w-[200px]">
                {eventoId}
              </span>
            </div>
            {activeItem && (
              <>
                <span className="text-slate-600 font-bold">/</span>
                <span className="text-xs font-semibold text-slate-200 hidden md:inline truncate">
                  {activeItem.label}
                </span>
              </>
            )}
          </nav>

          {/* Lado Direito: Navegação Contextual do Evento (EventContextNav) */}
          <div className="min-w-0">
            <EventContextNav items={navItems} />
          </div>
        </div>
      </header>

      {/* Conteúdo Principal Ocupando 100% da Largura Útil */}
      <main className="flex-1 w-full min-w-0 bg-[#0b0f19] p-6 lg:p-8 overflow-x-hidden">
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
  <div className="rounded-xl border border-slate-800 bg-[#131722] p-4 shadow-sm">
    <div className="text-xs text-slate-400 font-medium">{label}</div>
    <div className="text-2xl font-bold text-white mt-2">{value}</div>
    <div className="text-xs text-slate-500 mt-1">{help}</div>
  </div>
);

export const EmptyChart = ({ title }: { title: string }) => (
  <div className="rounded-xl border border-slate-800 bg-[#131722] p-5 min-h-52 shadow-sm">
    <h3 className="font-semibold text-white text-sm">{title}</h3>
    <div className="h-32 mt-4 grid place-items-center border-b border-l border-slate-700/60 text-xs text-slate-400">
      Aguardando dados reais do evento
    </div>
  </div>
);

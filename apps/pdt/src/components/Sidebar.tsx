'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useProducerEvent } from './ProducerEventContext';
import { EDDIE_BUILD } from '../lib/buildInfo';
import {
  LayoutDashboard,
  Wallet,
  Megaphone,
  Briefcase,
  Scale,
  Calendar,
  RotateCcw,
  Headphones,
  AlertTriangle,
  ShieldCheck,
  FileBarChart,
  Activity,
  Zap,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

const menuItems = [
  {
    label: 'Visão Geral',
    href: '/',
    icon: LayoutDashboard,
    badge: null,
  },
  {
    label: 'Central Operacional',
    href: '/operacao',
    icon: Activity,
    badge: 'Ao Vivo',
  },
  {
    label: 'Hardening & Segurança',
    href: '/operacao/hardening',
    icon: ShieldCheck,
    badge: 'v11.13',
  },
  {
    label: 'Ciclo E2E & Go-Live',
    href: '/operacao/e2e',
    icon: CheckCircle2,
    badge: 'Gate',
  },
  {
    label: 'Automações & Regras',
    href: '/automacoes',
    icon: Zap,
    badge: 'Motor',
  },
  {
    label: 'Todos os Eventos',
    href: '/eventos',
    icon: Calendar,
    badge: null,
  },
  {
    label: 'Financeiro',
    href: '/financeiro',
    icon: Wallet,
    badge: 'Ledger',
  },
  {
    label: 'Contabilidade',
    href: '/contabilidade',
    icon: Scale,
    badge: 'DRE',
  },
  {
    label: 'Estornos & CDC',
    href: '/estorno',
    icon: RotateCcw,
    badge: 'CDC',
  },
  {
    label: 'Comercial B2B',
    href: '/comercial',
    icon: Briefcase,
    badge: 'CRM',
  },
  {
    label: 'Marketing',
    href: '/marketing',
    icon: Megaphone,
    badge: null,
  },
  {
    label: 'Remarketing',
    href: '/remarketing',
    icon: RotateCcw,
    badge: null,
  },
  {
    label: 'Relatórios',
    href: '/relatorios',
    icon: FileBarChart,
    badge: null,
  },
  {
    label: 'Atendimento SAC',
    href: '/sac',
    icon: Headphones,
    badge: 'SLA',
  },
  {
    label: 'Suporte Operacional',
    href: '/suporte',
    icon: AlertTriangle,
    badge: null,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { eventoId } = useProducerEvent();
  const [collapsed, setCollapsed] = useState(false);

  // Carrega estado de recolhimento persistente
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pdt_sidebar_collapsed');
      if (saved !== null) {
        setCollapsed(saved === 'true');
      }
    } catch {}
  }, []);

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('pdt_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const eventMatch = pathname.match(/^\/eventos\/([^/]+)/);
  const activeEventId = eventMatch?.[1] || null;
  const currentEventId = activeEventId || eventoId || 'evento-operacao';

  return (
    <aside
      className={`bg-[#0d1322] border-r border-[#1e293b] flex flex-col shrink-0 min-h-screen transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 justify-between border-b border-[#1e293b]">
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center font-black text-black text-base shadow-lg shadow-green-500/20 shrink-0">
            Di
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-white text-sm leading-tight tracking-tight truncate">
                  DiskIngressos
                </h1>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30 shrink-0">
                  {EDDIE_BUILD.uiVersion}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block truncate">
                Painel do Produtor
              </span>
            </div>
          )}
        </Link>

        {/* Botão de Recolher Sidebar */}
        <button
          type="button"
          onClick={toggleCollapse}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title={collapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2.5 py-3 space-y-1 overflow-y-auto">
        {!collapsed && (
          <div className="px-2.5 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Módulos do Sistema
          </div>
        )}

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          return (
            <React.Fragment key={item.href}>
              <Link
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    size={17}
                    className={`shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!collapsed && item.badge && (
                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                    {item.badge}
                  </span>
                )}
              </Link>

              {/* Sub-itens da Operação Global */}
              {!collapsed && item.href === '/operacao' && isActive && (
                <div className="ml-7 mt-0.5 mb-1.5 space-y-0.5 border-l border-emerald-900/60 pl-2">
                  <Link
                    href="/operacao/alertas"
                    className={`block px-2 py-1 text-[11px] rounded transition ${
                      pathname === '/operacao/alertas' ? 'text-rose-400 font-bold bg-rose-950/30' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    • Alertas Operacionais
                  </Link>
                  <Link
                    href="/operacao/incidentes"
                    className={`block px-2 py-1 text-[11px] rounded transition ${
                      pathname === '/operacao/incidentes' ? 'text-amber-400 font-bold bg-amber-950/30' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    • Gestão de Incidentes
                  </Link>
                </div>
              )}

              {/* Modo Evento: Indicador limpo e conciso sem duplicar os 20 links da barra horizontal */}
              {!collapsed && item.href === '/eventos' && (isActive || activeEventId) && (
                <div className="ml-7 mt-1 mb-2 space-y-1 border-l border-sky-900/70 pl-2.5 text-xs">
                  {activeEventId && (
                    <Link href="/eventos" className="block text-[11px] text-sky-400 hover:text-white font-medium">
                      ← Todos os Eventos
                    </Link>
                  )}
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <Sparkles size={11} className="text-sky-400 shrink-0" />
                    <span className="text-[10px] uppercase font-bold text-slate-400">Contexto do Evento</span>
                  </div>
                  <div className="font-mono text-[11px] text-sky-300 bg-sky-950/50 px-2 py-1 rounded border border-sky-800/40 truncate">
                    {currentEventId}
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Security & Status Footer */}
      <div className="p-3 border-t border-[#1e293b] text-xs text-slate-400 space-y-2">
        <Link
          href="/diagnostico"
          title={collapsed ? 'Diagnóstico & Status' : undefined}
          className={`flex items-center justify-between text-emerald-400 hover:text-emerald-300 font-medium transition ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="shrink-0" />
            {!collapsed && <span>Diagnóstico</span>}
          </div>
          {!collapsed && (
            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Live
            </span>
          )}
        </Link>
        {!collapsed && (
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>Event-Driven</span>
            <span className="text-[10px] font-mono font-bold text-sky-400">
              {EDDIE_BUILD.uiVersion}
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}

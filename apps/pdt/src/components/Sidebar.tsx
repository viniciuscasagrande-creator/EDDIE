'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useProducerEvent } from './ProducerEventContext';
import { useAuthSession } from './AuthSessionContext';
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
  Lock,
  Users,
} from 'lucide-react';

interface MenuItemConfig {
  label: string;
  producerLabel?: string;
  href: string;
  icon: React.ElementType;
  badge: string | null;
  scopes: ('DISKINGRESSOS' | 'PRODUTOR')[];
}

const rawMenuItems: MenuItemConfig[] = [
  {
    label: 'Visão Geral',
    producerLabel: 'Visão Geral',
    href: '/',
    icon: LayoutDashboard,
    badge: null,
    scopes: ['DISKINGRESSOS', 'PRODUTOR'],
  },
  {
    label: 'Central Operacional',
    href: '/operacao',
    icon: Activity,
    badge: 'Ao Vivo',
    scopes: ['DISKINGRESSOS'],
  },
  {
    label: 'Hardening & Segurança',
    href: '/operacao/hardening',
    icon: ShieldCheck,
    badge: 'v11.15',
    scopes: ['DISKINGRESSOS'],
  },
  {
    label: 'Ciclo E2E & Go-Live',
    href: '/operacao/e2e',
    icon: CheckCircle2,
    badge: 'Gate',
    scopes: ['DISKINGRESSOS'],
  },
  {
    label: 'Automações & Regras',
    href: '/automacoes',
    icon: Zap,
    badge: 'Motor',
    scopes: ['DISKINGRESSOS'],
  },
  {
    label: 'Todos os Eventos',
    producerLabel: 'Meus Eventos',
    href: '/eventos',
    icon: Calendar,
    badge: null,
    scopes: ['DISKINGRESSOS', 'PRODUTOR'],
  },
  {
    label: 'Financeiro Geral',
    href: '/financeiro',
    icon: Wallet,
    badge: 'Ledger',
    scopes: ['DISKINGRESSOS'],
  },
  {
    label: 'Extrato & Repasses',
    producerLabel: 'Extrato & Repasses',
    href: '/financeiro/portal-produtor',
    icon: Wallet,
    badge: 'Extrato',
    scopes: ['PRODUTOR'],
  },
  {
    label: 'Contabilidade',
    href: '/contabilidade',
    icon: Scale,
    badge: 'DRE',
    scopes: ['DISKINGRESSOS'],
  },
  {
    label: 'Fechamento & Settlement',
    href: '/fechamento',
    icon: Lock,
    badge: '11.24',
    scopes: ['DISKINGRESSOS'],
  },
  {
    label: 'Estornos & CDC',
    href: '/estorno',
    icon: RotateCcw,
    badge: 'CDC',
    scopes: ['DISKINGRESSOS'],
  },
  {
    label: 'Comercial B2B',
    href: '/comercial',
    icon: Briefcase,
    badge: 'CRM',
    scopes: ['DISKINGRESSOS'],
  },
  {
    label: 'Marketing',
    href: '/marketing',
    icon: Megaphone,
    badge: null,
    scopes: ['DISKINGRESSOS', 'PRODUTOR'],
  },
  {
    label: 'Remarketing',
    href: '/remarketing',
    icon: RotateCcw,
    badge: null,
    scopes: ['DISKINGRESSOS', 'PRODUTOR'],
  },
  {
    label: 'Relatórios',
    producerLabel: 'Relatórios do Evento',
    href: '/relatorios',
    icon: FileBarChart,
    badge: null,
    scopes: ['DISKINGRESSOS', 'PRODUTOR'],
  },
  {
    label: 'Atendimento SAC',
    producerLabel: 'SAC & Chamados',
    href: '/sac',
    icon: Headphones,
    badge: 'SLA',
    scopes: ['DISKINGRESSOS', 'PRODUTOR'],
  },
  {
    label: 'Suporte Operacional',
    href: '/suporte',
    icon: AlertTriangle,
    badge: null,
    scopes: ['DISKINGRESSOS'],
  },
  {
    label: 'Usuários & Permissões',
    producerLabel: 'Minha Equipe',
    href: '/usuarios',
    icon: Users,
    badge: 'RBAC',
    scopes: ['DISKINGRESSOS', 'PRODUTOR'],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { eventoId } = useProducerEvent();
  const { currentVision, selectedProducer, isAdmin } = useAuthSession();
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

  // Filtra itens com base na visão atual
  const visibleMenuItems = rawMenuItems.filter((item) =>
    item.scopes.includes(currentVision),
  );

  return (
    <aside
      className={`bg-[#0d1322] border-r border-[#1e293b] flex flex-col shrink-0 min-h-screen transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 justify-between border-b border-[#1e293b]">
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-black text-base shadow-lg shrink-0 ${
              isAdmin
                ? 'bg-gradient-to-tr from-green-500 to-emerald-400 shadow-green-500/20'
                : 'bg-gradient-to-tr from-sky-400 to-indigo-500 shadow-sky-500/20 text-white'
            }`}
          >
            {isAdmin ? 'Di' : 'Pr'}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-white text-sm leading-tight tracking-tight truncate">
                  {isAdmin ? 'DiskIngressos' : selectedProducer?.nome.split(' ')[0] || 'Produtor'}
                </h1>
                <span
                  className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border shrink-0 ${
                    isAdmin
                      ? 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                      : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                  }`}
                >
                  {isAdmin ? 'ADMIN' : 'PRODUTOR'}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block truncate">
                {isAdmin ? 'Painel do Produtor' : 'Área Restrita'}
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
          <div className="px-2.5 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>{isAdmin ? 'Módulos Globais' : 'Painel da Produtora'}</span>
            {!isAdmin && (
              <span className="text-[9px] text-amber-400 font-mono">Restrito</span>
            )}
          </div>
        )}

        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const displayLabel =
            currentVision === 'PRODUTOR' && item.producerLabel
              ? item.producerLabel
              : item.label;

          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          return (
            <React.Fragment key={item.href}>
              <Link
                href={item.href}
                title={collapsed ? displayLabel : undefined}
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
                  {!collapsed && <span className="truncate">{displayLabel}</span>}
                </div>
                {!collapsed && item.badge && (
                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                    {item.badge}
                  </span>
                )}
              </Link>

              {/* Sub-itens da Operação Global (apenas para Admin) */}
              {!collapsed && item.href === '/operacao' && isActive && isAdmin && (
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

              {/* Modo Evento: Indicador limpo e conciso */}
              {!collapsed && item.href === '/eventos' && (isActive || activeEventId) && (
                <div className="ml-7 mt-1 mb-2 space-y-1 border-l border-sky-900/70 pl-2.5 text-xs">
                  {activeEventId && (
                    <Link href="/eventos" className="block text-[11px] text-sky-400 hover:text-white font-medium">
                      ← {isAdmin ? 'Todos os Eventos' : 'Meus Eventos'}
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
            <span>{isAdmin ? 'Modulith Core' : 'Tenant Sandbox'}</span>
            <span className="text-[10px] font-mono font-bold text-sky-400">
              {EDDIE_BUILD.uiVersion}
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}

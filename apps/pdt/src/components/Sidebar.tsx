'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useProducerEvent } from './ProducerEventContext';
import { useAuthSession } from './AuthSessionContext';
import { EDDIE_BUILD } from '../lib/buildInfo';
import {
  LayoutDashboard,
  Calendar,
  Wallet,
  Activity,
  Megaphone,
  RotateCcw,
  Users,
  ShieldCheck,
  Zap,
  Building,
  Scale,
  Landmark,
  CreditCard,
  FileText,
  FileCheck,
  FileBarChart,
  Sparkles,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Headphones,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useMobileNav } from './MobileNavContext';

interface SubMenuItem {
  label: string;
  href: string;
  badge?: string;
}

interface NavGroup {
  id: string;
  label: string;
  icon: React.ElementType;
  href?: string;
  badge?: string;
  workspaces: ('ALL' | 'CORPORATE' | 'PRODUCER' | 'OPERATIONS' | 'INTELLIGENCE')[];
  subItems?: SubMenuItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    id: 'inicio',
    label: 'Início (Centro 360º)',
    icon: LayoutDashboard,
    href: '/',
    workspaces: ['ALL', 'CORPORATE', 'PRODUCER', 'OPERATIONS', 'INTELLIGENCE'],
  },
  {
    id: 'eventos',
    label: 'Eventos & Vendas',
    icon: Calendar,
    href: '/eventos',
    workspaces: ['ALL', 'PRODUCER', 'OPERATIONS'],
    subItems: [
      { label: 'Todos os Eventos', href: '/eventos' },
      { label: 'Criar Novo Evento', href: '/eventos/novo', badge: 'Novo' },
    ],
  },
  {
    id: 'financeiro',
    label: 'Financeiro & Ledger',
    icon: Wallet,
    href: '/financeiro',
    badge: 'Ledger',
    workspaces: ['ALL', 'CORPORATE', 'PRODUCER'],
    subItems: [
      { label: 'Ledger & Saldos', href: '/financeiro' },
      { label: 'Tesouraria & PIX', href: '/financeiro/tesouraria', badge: 'PIX' },
      { label: 'Pagamentos & Adquirentes', href: '/financeiro/pagamentos' },
      { label: 'Conciliação Bancária', href: '/financeiro/conciliacao' },
      { label: 'Contabilidade & DRE', href: '/contabilidade' },
      { label: 'Fechamento & Settlement', href: '/fechamento' },
      { label: 'Estornos & CDC', href: '/estorno' },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics & Inteligência',
    icon: TrendingUp,
    href: '/inteligencia',
    workspaces: ['ALL', 'CORPORATE', 'INTELLIGENCE'],
    subItems: [
      { label: 'BI & Rentabilidade Real', href: '/inteligencia' },
      { label: 'FP&A e Centros de Custo', href: '/financeiro/fpa' },
      { label: 'Cash Forecast & Liquidez', href: '/financeiro/liquidez' },
      { label: 'Gestão de Riscos & Limites', href: '/financeiro/riscos' },
      { label: 'Relatórios Consolidados', href: '/relatorios' },
    ],
  },
  {
    id: 'marketing',
    label: 'Marketing & Growth',
    icon: Megaphone,
    href: '/marketing',
    badge: 'CAPI',
    workspaces: ['ALL', 'PRODUCER', 'INTELLIGENCE'],
    subItems: [
      { label: 'Campanhas Multi-Pixel', href: '/marketing' },
      { label: 'Remarketing & Carrinho', href: '/remarketing' },
    ],
  },
  {
    id: 'produtores',
    label: 'Produtores & CRM',
    icon: Building,
    href: '/comercial',
    workspaces: ['ALL', 'CORPORATE', 'PRODUCER'],
    subItems: [
      { label: 'Pipeline B2B & Negociação', href: '/comercial' },
      { label: 'Portal do Produtor', href: '/financeiro/portal-produtor' },
    ],
  },
  {
    id: 'atendimento',
    label: 'Atendimento & SAC',
    icon: Headphones,
    href: '/sac',
    workspaces: ['ALL', 'PRODUCER', 'OPERATIONS'],
    subItems: [
      { label: 'Chamados & Customer 360', href: '/sac' },
      { label: 'Suporte de Campo Arenas', href: '/suporte' },
    ],
  },
  {
    id: 'operacoes',
    label: 'Operações & Portaria',
    icon: Activity,
    href: '/operacao',
    badge: 'NOC',
    workspaces: ['ALL', 'OPERATIONS'],
    subItems: [
      { label: 'Command Center (NOC)', href: '/operacao' },
      { label: 'Alertas Operacionais', href: '/operacao/alertas' },
      { label: 'Gestão de Incidentes', href: '/operacao/incidentes' },
      { label: 'Hardening & Segurança', href: '/operacao/hardening' },
      { label: 'Ciclo E2E Homologação', href: '/operacao/e2e' },
    ],
  },
  {
    id: 'rh',
    label: 'RH & Pessoas',
    icon: Users,
    href: '/rh',
    badge: 'Fase 5',
    workspaces: ['ALL', 'CORPORATE'],
    subItems: [
      { label: '1. Visão Geral RH', href: '/rh?tab=visao' },
      { label: '2. Central de Aprovações SoD', href: '/rh?tab=aprovacoes' },
      { label: '3. Pessoas e Estrutura', href: '/rh?tab=pessoas' },
      { label: '4. Dep. Pessoal & Caju Wallets', href: '/rh?tab=dp', badge: 'Fase 5' },
      { label: '5. Ponto REP-P (Portaria 671)', href: '/rh?tab=ponto', badge: 'REP-P' },
      { label: '6. Talentos & Treinamento', href: '/rh?tab=talentos' },
      { label: '7. Saúde & Segurança SST', href: '/rh?tab=seguranca' },
      { label: '8. Eventos e Custos (DRE)', href: '/rh?tab=eventos' },
      { label: '9. Portais do Colaborador', href: '/rh?tab=portais' },
      { label: '10. Administração & Regras', href: '/rh?tab=administracao' },
    ],
  },
  {
    id: 'governanca',
    label: 'Governança & Admin',
    icon: ShieldCheck,
    href: '/governanca',
    workspaces: ['ALL', 'CORPORATE', 'INTELLIGENCE'],
    subItems: [
      { label: 'Qualidade dos Dados & Divergências', href: '/governanca' },
      { label: 'SEEK Flow & Automações', href: '/automacoes', badge: 'Flow' },
      { label: 'Documentos & Contratos', href: '/documentos' },
      { label: 'Fiscal & Tributário (LC 214)', href: '/fiscal' },
      { label: 'Usuários, RBAC & Permissões', href: '/usuarios' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { eventoId, evento } = useProducerEvent();
  const { isAdmin, workspace } = useAuthSession();
  const { isMobileMenuOpen, closeMobileMenu } = useMobileNav();

  // Guarda estado de expansão de cada grupo
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Auto-expande o grupo que contém a rota ativa
  useEffect(() => {
    NAV_GROUPS.forEach((group) => {
      if (group.subItems) {
        const containsActive = group.subItems.some((sub) => {
          if (sub.href === pathname) return true;
          if (sub.href.includes('?') && pathname === sub.href.split('?')[0]) return true;
          return pathname.startsWith(sub.href) && sub.href !== '/';
        });

        if (containsActive) {
          setExpandedGroups((prev) => ({ ...prev, [group.id]: true }));
        }
      }
    });
  }, [pathname]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  // Filtra grupos conforme o Workspace ativo
  const visibleGroups = NAV_GROUPS.filter(
    (g) => workspace === 'ALL' || g.workspaces.includes(workspace)
  );

  return (
    <>
      {/* Backdrop Mobile */}
      {isMobileMenuOpen && (
        <div
          onClick={closeMobileMenu}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden animate-in fade-in"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-[#0b101d] border-r border-slate-200 dark:border-[#1e293b] flex flex-col transition-transform duration-300 ease-in-out shadow-lg lg:shadow-none lg:static lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo Header */}
        <div className="h-16 px-5 border-b border-slate-200 dark:border-[#1e293b] flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/40">
          <Link
            href="/"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-sky-600 text-white flex items-center justify-center font-black text-lg shadow-sm group-hover:scale-105 transition-transform">
              S
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm tracking-tight text-slate-900 dark:text-white">
                  SEEK
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-300 dark:border-emerald-700">
                  Event OS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">DiskIngressos Ecosystem</p>
            </div>
          </Link>

          <button
            type="button"
            onClick={closeMobileMenu}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition lg:hidden cursor-pointer"
            aria-label="Fechar menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Banner de Contexto do Evento Selecionado */}
        {evento && (
          <div className="px-4 py-2 bg-emerald-50/70 dark:bg-emerald-950/20 border-b border-emerald-200 dark:border-emerald-900/40 text-xs">
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
              <Sparkles size={11} className="shrink-0" />
              <span>Evento Ativo</span>
            </div>
            <div className="font-bold text-slate-900 dark:text-white truncate text-xs mt-0.5" title={evento.nome}>
              {evento.nome}
            </div>
          </div>
        )}

        {/* Navegação Hierárquica em Grupos */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1 text-xs">
          {visibleGroups.map((group) => {
            const Icon = group.icon;
            const hasSub = Boolean(group.subItems && group.subItems.length > 0);
            const isExpanded = expandedGroups[group.id] || false;

            const isGroupActive = group.href === pathname || (
              group.subItems && group.subItems.some((s) => s.href === pathname || pathname.startsWith(s.href))
            );

            return (
              <div key={group.id} className="space-y-0.5">
                {/* Cabeçalho do Grupo / Link Principal */}
                {hasSub ? (
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-semibold transition cursor-pointer text-left ${
                      isGroupActive
                        ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isGroupActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                      <span className="truncate">{group.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {group.badge && (
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {group.badge}
                        </span>
                      )}
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>
                ) : (
                  <Link
                    href={group.href || '/'}
                    onClick={closeMobileMenu}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl font-semibold transition ${
                      pathname === group.href
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${pathname === group.href ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                      <span className="truncate">{group.label}</span>
                    </div>
                    {group.badge && (
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {group.badge}
                      </span>
                    )}
                  </Link>
                )}

                {/* Sub-itens do Grupo */}
                {hasSub && isExpanded && (
                  <div className="ml-5 pl-2.5 border-l-2 border-slate-200 dark:border-slate-800 space-y-0.5 py-0.5">
                    {group.subItems!.map((sub) => {
                      const isSubActive =
                        pathname === sub.href ||
                        (sub.href.includes('?') && pathname === sub.href.split('?')[0]);

                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={closeMobileMenu}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition ${
                            isSubActive
                              ? 'text-emerald-900 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/30 border-l-2 border-emerald-600'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50'
                          }`}
                        >
                          <span className="truncate">&bull; {sub.label}</span>
                          {sub.badge && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                              {sub.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer do Menu */}
        <div className="p-3 border-t border-slate-200 dark:border-[#1e293b] text-xs text-slate-500 dark:text-slate-400 space-y-2 shrink-0 bg-slate-50/50 dark:bg-slate-900/40">
          <Link
            href="/diagnostico"
            onClick={closeMobileMenu}
            className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 font-medium transition"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="shrink-0" />
              <span>Diagnóstico &amp; Hardening</span>
            </div>
            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200">
              Ao Vivo
            </span>
          </Link>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
            <span>{isAdmin ? 'DiskIngressos Admin' : 'Portal do Produtor'}</span>
            <span className="font-mono font-bold text-sky-700 dark:text-sky-400 text-[10px]">
              v{EDDIE_BUILD.version}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}

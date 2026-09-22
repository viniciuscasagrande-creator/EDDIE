'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  ChevronRight,
  FileBarChart,
} from 'lucide-react';

const menuItems = [
  {
    label: 'Visão Geral',
    href: '/',
    icon: LayoutDashboard,
    badge: null,
  },
  {
    label: 'Eventos & Lotes',
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
    badge: 'CDC Art. 49',
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
    badge: 'Atribuição',
  },
  {
    label: 'Remarketing',
    href: '/remarketing',
    icon: RotateCcw,
    badge: 'Resgate',
  },
  {
    label: 'Relatórios',
    href: '/relatorios',
    icon: FileBarChart,
    badge: 'Central',
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
    badge: 'Incidentes',
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#0d1322] border-r border-[#1e293b] flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-[#1e293b]">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center font-black text-black text-lg shadow-lg shadow-green-500/20">
          Di
        </div>
        <div>
          <h1 className="font-bold text-white text-base leading-tight tracking-tight">
            DiskIngressos
          </h1>
          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
            Painel do Produtor (PDT)
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Módulos do Sistema
        </div>
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
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={18}
                    className={isActive ? 'text-emerald-400' : 'text-slate-400'}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {item.badge}
                  </span>
                )}
              </Link>
              {item.href === '/relatorios' && isActive && (
                <div className="ml-8 mt-1 mb-2 space-y-0.5 border-l border-slate-800 pl-2">
                  {[
                    ['Painel de Relatórios', '/relatorios'],
                    ['Financeiro', '/relatorios#financeiro'],
                    ['Eventos', '/relatorios#eventos'],
                    ['Contábil', '/relatorios#contabil'],
                    ['Comercial', '/relatorios#comercial'],
                    ['Marketing', '/relatorios#marketing'],
                    ['SAC', '/relatorios#sac'],
                    ['Estornos', '/relatorios#estornos'],
                    ['Operacional', '/relatorios#operacional'],
                  ].map(([label, href]) => (
                    <Link
                      key={label}
                      href={href}
                      className="block px-2 py-1.5 rounded text-xs text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Security & Status Footer */}
      <div className="p-4 border-t border-[#1e293b] text-xs text-slate-400 space-y-2">
        <Link href="/diagnostico" className="flex items-center justify-between text-emerald-400 hover:text-emerald-300 font-medium transition">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} />
            <span>Diagnóstico & Status</span>
          </div>
          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Live
          </span>
        </Link>
        <div className="text-[11px] text-slate-400">
          Arquitetura Event-Driven • Vercel Web
        </div>
      </div>
    </aside>
  );
}

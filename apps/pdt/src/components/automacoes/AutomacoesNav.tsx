'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sliders, Zap, History, CheckSquare, ShieldCheck } from 'lucide-react';

export function AutomacoesNav({ pendentesCount }: { pendentesCount?: number }) {
  const pathname = usePathname();

  const tabs = [
    { href: '/automacoes', label: 'Central de Automações', icon: Zap },
    { href: '/automacoes/regras', label: 'Regras Operacionais', icon: Sliders },
    { href: '/automacoes/execucoes', label: 'Histórico de Execuções', icon: History },
    {
      href: '/automacoes/aprovacoes',
      label: 'Aprovações Pendentes',
      icon: CheckSquare,
      badge: pendentesCount && pendentesCount > 0 ? pendentesCount : undefined,
    },
  ];

  return (
    <nav className="flex flex-wrap items-center gap-1.5 border-b border-slate-800 pb-3" aria-label="Navegação da Automação">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition ${
              active
                ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent'
            }`}
          >
            <Icon size={14} className={active ? 'text-sky-400' : 'text-slate-400'} />
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className="rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[10px] font-mono font-bold text-amber-300 border border-amber-500/40 ml-1">
                {tab.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

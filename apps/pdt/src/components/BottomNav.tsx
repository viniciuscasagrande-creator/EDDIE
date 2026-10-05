'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Activity,
  Wallet,
  Users,
  Menu,
  X,
} from 'lucide-react';
import { useAuthSession } from './AuthSessionContext';
import { useMobileNav } from './MobileNavContext';

export function BottomNav() {
  const pathname = usePathname();
  const { currentVision, isAdmin } = useAuthSession();
  const { isMobileMenuOpen, toggleMobileMenu } = useMobileNav();

  const isHomeActive = pathname === '/';
  const isEventsActive = pathname.startsWith('/eventos');
  const isRhActive = pathname.startsWith('/rh');
  const isOperacaoActive = pathname.startsWith('/operacao');
  const isExtratoActive = pathname.startsWith('/financeiro/portal-produtor');
  const isUsersActive = pathname.startsWith('/usuarios');

  return (
    <nav
      aria-label="Navegação Rápida Mobile"
      className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-[#0d1322]/95 backdrop-blur-md border-t border-[#1e293b] px-1 py-1 pb-[calc(0.25rem+env(safe-area-inset-bottom,0px))] shadow-2xl transition-all"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {/* 1. Visão Geral */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-lg text-[10px] font-medium transition ${
            isHomeActive
              ? 'text-emerald-400 font-bold bg-emerald-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard size={18} className="mb-0.5" />
          <span className="truncate max-w-[64px]">Início</span>
        </Link>

        {/* 2. Eventos */}
        <Link
          href="/eventos"
          className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-lg text-[10px] font-medium transition ${
            isEventsActive
              ? 'text-emerald-400 font-bold bg-emerald-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar size={18} className="mb-0.5" />
          <span className="truncate max-w-[64px]">{isAdmin ? 'Eventos' : 'Meus Shows'}</span>
        </Link>

        {/* 3. Recursos Humanos / Equipes */}
        <Link
          href="/rh"
          className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-lg text-[10px] font-medium transition ${
            isRhActive
              ? 'text-emerald-400 font-bold bg-emerald-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users size={18} className="mb-0.5" />
          <span className="truncate max-w-[64px]">{isAdmin ? 'RH Ponto' : 'Equipes'}</span>
        </Link>

        {/* 4. Operação (Admin) ou Extrato (Produtor) */}
        {isAdmin ? (
          <Link
            href="/operacao"
            className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-lg text-[10px] font-medium transition ${
              isOperacaoActive
                ? 'text-emerald-400 font-bold bg-emerald-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity size={18} className="mb-0.5" />
            <span className="truncate max-w-[64px]">Operação</span>
          </Link>
        ) : (
          <Link
            href="/financeiro/portal-produtor"
            className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-lg text-[10px] font-medium transition ${
              isExtratoActive
                ? 'text-emerald-400 font-bold bg-emerald-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wallet size={18} className="mb-0.5" />
            <span className="truncate max-w-[64px]">Extrato</span>
          </Link>
        )}

        {/* 5. Menu Hambúrguer (Drawer Completo) */}
        <button
          type="button"
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? 'Fechar menu completo' : 'Abrir menu completo'}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-lg text-[10px] font-medium transition ${
            isMobileMenuOpen
              ? 'text-purple-400 font-bold bg-purple-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {isMobileMenuOpen ? (
            <X size={18} className="mb-0.5 text-purple-400" />
          ) : (
            <Menu size={18} className="mb-0.5" />
          )}
          <span className="truncate max-w-[64px]">Mais</span>
        </button>
      </div>
    </nav>
  );
}

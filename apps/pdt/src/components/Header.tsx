'use client';

import React from 'react';
import {
  Bell,
  CalendarDays,
  Loader2,
  RefreshCcw,
  ExternalLink,
  Shield,
  Building2,
  Users,
  Menu,
} from 'lucide-react';
import Link from 'next/link';
import { useProducerEvent } from './ProducerEventContext';
import { useAuthSession, EscopoVisao } from './AuthSessionContext';
import { useMobileNav } from './MobileNavContext';

export function Header() {
  const { eventos, eventoId, selecionarEvento, recarregarEventos, loading, error } = useProducerEvent();
  const {
    currentVision,
    selectedProducer,
    availableProducers,
    switchVision,
    currentUser,
    isAdmin,
  } = useAuthSession();
  const { toggleMobileMenu } = useMobileNav();

  const handleVisionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'DISKINGRESSOS') {
      switchVision('DISKINGRESSOS');
    } else {
      const prod = availableProducers.find((p) => p.id === val);
      if (prod) {
        switchVision('PRODUTOR', prod);
      }
    }
  };

  return (
    <header className="min-h-16 bg-[#0d1322]/90 backdrop-blur border-b border-[#1e293b] flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 py-2 sticky top-0 z-30">
      {/* Lado Esquerdo: Hambúrguer Mobile, Seletor de Visão e Contexto de Evento */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Botão de Menu Hambúrguer (Mobile & Tablet) */}
        <button
          type="button"
          onClick={toggleMobileMenu}
          className="p-1.5 sm:p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition lg:hidden shrink-0 border border-slate-700 bg-slate-900"
          title="Abrir menu de navegação"
          aria-label="Abrir menu"
        >
          <Menu size={18} />
        </button>

        {/* Seletor de Visão DiskIngressos vs Produtor */}
        <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 shrink-0 sm:shrink">
          {isAdmin ? (
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 shrink-0" />
          ) : (
            <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400 shrink-0" />
          )}
          <div className="flex flex-col">
            <span className="text-[8px] sm:text-[9px] uppercase tracking-wider font-bold text-slate-400">
              Escopo
            </span>
            <select
              aria-label="Selecionar Visão do Sistema"
              value={isAdmin ? 'DISKINGRESSOS' : selectedProducer?.id || 'DISKINGRESSOS'}
              onChange={handleVisionChange}
              className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer max-w-[100px] sm:max-w-[170px] md:max-w-xs truncate"
            >
              <option value="DISKINGRESSOS" className="bg-slate-900 text-purple-300">
                🏢 DiskIngressos
              </option>
              <optgroup label="Simular Visão do Produtor" className="bg-slate-900 text-slate-300">
                {availableProducers.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-sky-300">
                    🎭 {p.nome}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        <div className="h-7 w-px bg-slate-700 hidden lg:block" />

        {/* Contexto do Evento */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <CalendarDays
            size={16}
            className={`shrink-0 hidden xs:block ${error ? 'text-rose-400' : 'text-emerald-400'}`}
          />
          <div className="min-w-0">
            <div className="text-[8px] sm:text-[10px] uppercase tracking-wider font-bold text-slate-500 truncate">
              {isAdmin ? 'Evento' : 'Meu Show'}
            </div>
            {loading ? (
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <Loader2 size={12} className="animate-spin text-emerald-400" />
                <span>Carregando eventos...</span>
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 text-xs text-rose-400">
                <span className="truncate max-w-[220px]">{error}</span>
                <button
                  type="button"
                  onClick={() => recarregarEventos()}
                  className="px-2 py-0.5 text-[10px] bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded border border-rose-500/30 transition flex items-center gap-1 shrink-0"
                >
                  <RefreshCcw size={10} />
                  <span>Tentar novamente</span>
                </button>
                <Link
                  href="/diagnostico"
                  className="px-2 py-0.5 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition flex items-center gap-1 shrink-0"
                >
                  <ExternalLink size={10} />
                  <span>Diagnóstico</span>
                </Link>
              </div>
            ) : (
              <select
                aria-label="Selecionar evento"
                value={eventoId}
                onChange={(e) => selecionarEvento(e.target.value)}
                className="max-w-[105px] sm:max-w-[170px] md:max-w-sm w-full bg-transparent text-xs sm:text-sm font-semibold text-white outline-none cursor-pointer truncate"
              >
                {!eventos.length && <option value="">Nenhum evento disponível</option>}
                {eventos.map((e) => (
                  <option key={e.id} value={e.id} className="bg-slate-900">
                    {e.nome} · {e.status}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Lado Direito: Notificações, Atalho Usuários e Perfil */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        <Link
          href="/usuarios"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition"
          title="Gestão de Usuários & Permissões"
        >
          <Users size={14} className="text-teal-400" />
          <span className="hidden md:inline">
            {isAdmin ? 'Usuários & Permissões' : 'Minha Equipe'}
          </span>
        </Link>

        <button
          type="button"
          className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Notificações"
        >
          <Bell size={18} />
        </button>

        <div className="h-6 w-px bg-slate-700 hidden sm:block" />

        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold border shrink-0 ${
              isAdmin
                ? 'bg-gradient-to-tr from-purple-700 to-indigo-600 text-white border-purple-500'
                : 'bg-gradient-to-tr from-sky-700 to-teal-600 text-white border-sky-500'
            }`}
          >
            {isAdmin ? 'AD' : 'PR'}
          </div>
          <div className="text-left hidden md:block">
            <div className="text-xs font-semibold text-white truncate max-w-[130px]">
              {currentUser.nome.split(' ')[0]}
            </div>
            <div className="text-[10px] text-slate-400 truncate max-w-[130px]">
              {isAdmin ? 'DiskIngressos Admin' : selectedProducer?.nome.split(' ')[0] || 'Produtor'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

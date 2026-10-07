'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  ChevronDown,
  Sun,
  Moon,
  Search,
  Zap,
  Activity,
  Layers,
  Sparkles,
  Command,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { useProducerEvent } from './ProducerEventContext';
import { useAuthSession, EscopoVisao, EnterpriseWorkspace } from './AuthSessionContext';
import { useMobileNav } from './MobileNavContext';
import { EDDIE_BUILD } from '../lib/buildInfo';
import { CommandPalette } from './CommandPalette';
import { ReleaseCenterModal } from './ReleaseCenterModal';
import { MyWorkModal } from './MyWorkModal';
import { ActivityCenterModal } from './ActivityCenterModal';

export function Header() {
  const { eventos, eventoId, selecionarEvento, recarregarEventos, loading, error, evento } = useProducerEvent();
  const {
    currentVision,
    selectedProducer,
    availableProducers,
    switchVision,
    currentUser,
    isAdmin,
    workspace,
    setWorkspace,
  } = useAuthSession();
  const { toggleMobileMenu } = useMobileNav();

  // Modais de Governança e Ação Rápida
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [releaseCenterOpen, setReleaseCenterOpen] = useState(false);
  const [myWorkOpen, setMyWorkOpen] = useState(false);
  const [activityCenterOpen, setActivityCenterOpen] = useState(false);

  const [rhMenuOpen, setRhMenuOpen] = useState(false);
  const rhMenuRef = useRef<HTMLDivElement>(null);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');

  // Atalho global do teclado Ctrl + K / Cmd + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('eddie_theme_mode');
        if (saved === 'dark' || saved === 'light') {
          setThemeMode(saved);
          if (saved === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
          } else {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
          }
        } else {
          setThemeMode('light');
          localStorage.setItem('eddie_theme_mode', 'light');
          document.documentElement.classList.add('light');
          document.documentElement.classList.remove('dark');
        }
      } catch {}
    }
  }, []);

  const toggleTheme = () => {
    const next = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(next);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('eddie_theme_mode', next);
        localStorage.setItem('rh_theme_mode', next);
        if (next === 'dark') {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        } else {
          document.documentElement.classList.add('light');
          document.documentElement.classList.remove('dark');
        }
        window.dispatchEvent(new Event('eddie_theme_changed'));
      } catch {}
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (rhMenuRef.current && !rhMenuRef.current.contains(e.target as Node)) {
        setRhMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    <>
      <header className="bg-white/95 dark:bg-[#0d1322]/90 backdrop-blur border-b border-slate-200 dark:border-[#1e293b] sticky top-0 z-30 shadow-xs flex flex-col">
        {/* Linha 1: Contexto Global + Seletor de Evento + Controles Executivos */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 py-2 min-h-16">
          {/* Lado Esquerdo: Hambúrguer Mobile + GLOBAL CONTEXT BAR */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Hambúrguer Mobile */}
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="p-1.5 sm:p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition lg:hidden shrink-0 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs cursor-pointer"
              title="Abrir menu de navegação"
              aria-label="Abrir menu"
            >
              <Menu size={18} />
            </button>

            {/* BARRA DE CONTEXTO GLOBAL (Empresa › Produtor › Evento) */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
              {/* Seletor de Escopo / Empresa */}
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white dark:bg-slate-800 shadow-2xs border border-slate-200 dark:border-slate-700">
                {isAdmin ? (
                  <Shield className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                ) : (
                  <Building2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                )}
                <select
                  aria-label="Selecionar Visão do Sistema"
                  value={isAdmin ? 'DISKINGRESSOS' : selectedProducer?.id || 'DISKINGRESSOS'}
                  onChange={handleVisionChange}
                  className="bg-transparent text-xs font-bold text-slate-800 dark:text-white outline-none cursor-pointer max-w-[95px] sm:max-w-[130px] md:max-w-[180px] truncate"
                >
                  <option value="DISKINGRESSOS" className="bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300">
                    DiskIngressos
                  </option>
                  <optgroup label="Visão do Produtor" className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                    {availableProducers.map((p) => (
                      <option key={p.id} value={p.id} className="bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-300">
                        {p.nome}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:block" />

              {/* Seletor do Evento Ativo */}
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white dark:bg-slate-800 shadow-2xs border border-slate-200 dark:border-slate-700">
                <CalendarDays
                  size={14}
                  className={`shrink-0 ${error ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}`}
                />
                {loading ? (
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Loader2 size={11} className="animate-spin text-emerald-600" />
                    <span>Carregando...</span>
                  </span>
                ) : (
                  <select
                    aria-label="Selecionar evento ativo"
                    value={eventoId}
                    onChange={(e) => selecionarEvento(e.target.value)}
                    className="max-w-[110px] sm:max-w-[170px] md:max-w-[220px] bg-transparent text-xs font-bold text-slate-800 dark:text-white outline-none cursor-pointer truncate"
                  >
                    {!eventos.length && <option value="">Nenhum evento</option>}
                    {eventos.map((e) => (
                      <option key={e.id} value={e.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">
                        {e.nome}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Data / Sessão Ativa */}
              <div className="hidden lg:flex items-center gap-1 px-2 py-1 text-[11px] text-slate-500 font-mono">
                <span>07/10/2026</span>
              </div>
            </div>

            {/* Botão de Busca Rápida Command Palette (Ctrl+K) */}
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 text-xs transition cursor-pointer"
              title="Abrir Command Palette (Ctrl + K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Buscar módulos ou ações...</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[10px] font-mono text-slate-600 dark:text-slate-300">
                Ctrl+K
              </kbd>
            </button>
          </div>

          {/* Lado Direito: Ações Transversais, My Work, Activity Center, Release Center & Perfil */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Botão My Work (Pendências Transversais) */}
            <button
              type="button"
              onClick={() => setMyWorkOpen(true)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Abrir Central de Pendências Transversal (My Work)"
            >
              <Zap className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span className="hidden sm:inline">My Work</span>
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
            </button>

            {/* Botão Activity Center (Timeline de Auditoria) */}
            <button
              type="button"
              onClick={() => setActivityCenterOpen(true)}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
              title="Abrir Activity Center (Timeline Global de Auditoria)"
            >
              <Activity className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span className="hidden md:inline">Activity</span>
            </button>

            {/* Botão Release Center (v11.39.0) */}
            <button
              type="button"
              onClick={() => setReleaseCenterOpen(true)}
              className="hidden lg:flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-mono font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              title="Ver detalhes de versão e arquitetura (Release Center)"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>v{EDDIE_BUILD.version}</span>
            </button>

            {/* Alternador de Tema Claro Corporativo / Modo Escuro */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 bg-amber-50 dark:bg-slate-900 hover:bg-amber-100 dark:hover:bg-slate-800 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-slate-700 transition cursor-pointer shadow-xs"
              title={themeMode === 'light' ? 'Modo Claro Ativo (Clique para Escuro)' : 'Modo Escuro Ativo (Clique para Claro)'}
            >
              {themeMode === 'light' ? (
                <>
                  <Sun size={14} className="text-amber-600" />
                  <span className="hidden xl:inline text-amber-900">Claro</span>
                </>
              ) : (
                <>
                  <Moon size={14} className="text-sky-300" />
                  <span className="hidden xl:inline text-slate-300">Escuro</span>
                </>
              )}
            </button>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

            {/* Perfil do Usuário */}
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
                <div className="text-xs font-semibold text-slate-800 dark:text-white truncate max-w-[120px]">
                  {currentUser.nome.split(' ')[0]}
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                  {isAdmin ? 'Administrador Disk' : selectedProducer?.nome.split(' ')[0] || 'Produtor'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Linha 2: Enterprise Workspace Selector Pills (4 Produtos Integrados) */}
        <div className="px-3 sm:px-6 py-1.5 bg-slate-50/70 dark:bg-[#0b101d] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs overflow-x-auto">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mr-1 hidden sm:inline">
              Workspace:
            </span>

            {[
              { id: 'ALL', label: 'Todos os Módulos' },
              { id: 'CORPORATE', label: '1. Corporate (Financeiro & RH)' },
              { id: 'PRODUCER', label: '2. Producer (Eventos & Vendas)' },
              { id: 'OPERATIONS', label: '3. Operations (NOC & Portaria)' },
              { id: 'INTELLIGENCE', label: '4. Intelligence (BI & Dados)' },
            ].map((ws) => (
              <button
                key={ws.id}
                type="button"
                onClick={() => setWorkspace(ws.id as EnterpriseWorkspace)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  workspace === ws.id
                    ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                {ws.label}
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-500 font-medium shrink-0">
            <span>SEEK &bull; DiskIngressos Event OS</span>
          </div>
        </div>
      </header>

      {/* Modais Transversais */}
      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <ReleaseCenterModal isOpen={releaseCenterOpen} onClose={() => setReleaseCenterOpen(false)} />
      <MyWorkModal isOpen={myWorkOpen} onClose={() => setMyWorkOpen(false)} />
      <ActivityCenterModal isOpen={activityCenterOpen} onClose={() => setActivityCenterOpen(false)} />
    </>
  );
}

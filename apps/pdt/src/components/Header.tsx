'use client';

import React from 'react';
import { Bell, CalendarDays, Loader2, RefreshCcw } from 'lucide-react';
import { useProducerEvent } from './ProducerEventContext';

export function Header() {
  const { eventos, eventoId, selecionarEvento, recarregarEventos, loading, error } = useProducerEvent();

  return (
    <header className="min-h-16 bg-[#0d1322]/90 backdrop-blur border-b border-[#1e293b] flex items-center justify-between gap-4 px-8 py-3 sticky top-0 z-30">
      <div className="flex items-center gap-3 min-w-0">
        {error ? (
          <div className="hidden lg:flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20" title={error}>
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            <span>Contexto indisponível</span>
          </div>
        ) : (
          <div className="hidden lg:flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Contexto operacional</span>
          </div>
        )}
        <div className="h-7 w-px bg-slate-700 hidden lg:block" />
        <div className="flex items-center gap-2 min-w-0">
          <CalendarDays size={16} className={error ? "text-rose-400 shrink-0" : "text-emerald-400 shrink-0"} />
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Evento em operação</div>
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
              </div>
            ) : (
              <select
                aria-label="Selecionar evento"
                value={eventoId}
                onChange={(e) => selecionarEvento(e.target.value)}
                className="max-w-xs md:max-w-sm w-full bg-transparent text-sm font-semibold text-white outline-none cursor-pointer"
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
      <div className="flex items-center gap-4 shrink-0">
        <button type="button" className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition" title="Notificações">
          <Bell size={18} />
        </button>
        <div className="h-6 w-px bg-slate-700" />
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-white text-xs font-bold border border-slate-600">
            VC
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-semibold text-white">Operador PDT</div>
            <div className="text-[10px] text-slate-400">Produtor B2B</div>
          </div>
        </div>
      </div>
    </header>
  );
}

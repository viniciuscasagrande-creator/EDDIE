'use client';

import React from 'react';
import { Bell, User, CheckCircle2 } from 'lucide-react';

export function Header() {
  return (
    <header className="h-16 bg-[#0d1322]/80 backdrop-blur border-b border-[#1e293b] flex items-center justify-between px-8 sticky top-0 z-30">
      {/* Active Context */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Produção Online</span>
        </div>
        <span className="text-slate-400 text-xs">•</span>
        <span className="text-slate-300 text-xs font-medium">
          Produtora: <b>Live Nation Brasil Entretenimento</b>
        </span>
      </div>

      {/* User profile & Actions */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Notificações"
        >
          <Bell size={18} />
        </button>

        <div className="h-6 w-px bg-slate-700" />

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-white text-xs font-bold border border-slate-600">
            VC
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-semibold text-white">Vinicius Casagrande</div>
            <div className="text-[10px] text-slate-400">Produtor Executivo B2B</div>
          </div>
        </div>
      </div>
    </header>
  );
}

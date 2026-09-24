import React from 'react';
import Link from 'next/link';
import { Compass, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-5 shadow-lg shadow-sky-950/30">
        <Compass size={32} />
      </div>

      <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1 text-xs font-mono font-bold text-slate-300 border border-slate-700 mb-3">
        404 · ROTA NÃO ENCONTRADA
      </div>

      <h1 className="text-2xl font-black text-white tracking-tight">
        Módulo ou página inexistente
      </h1>

      <p className="text-sm text-slate-400 max-w-md mt-2">
        A rota requisitada não está disponível ou foi movida na arquitetura do Painel do Produtor (PDT).
      </p>

      <div className="flex items-center gap-3 mt-6">
        <Link
          href="/eventos"
          className="inline-flex items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 px-4 py-2.5 text-xs font-bold text-white transition shadow-lg shadow-sky-950/40"
        >
          <ArrowLeft size={14} />
          <span>Ver Todos os Eventos</span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-bold text-slate-200 transition"
        >
          <Home size={14} />
          <span>Visão Geral</span>
        </Link>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertOctagon, RotateCcw, Home, ShieldAlert } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Erro de runtime interceptado pela Error Boundary:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-5 shadow-lg shadow-rose-950/30">
        <AlertOctagon size={32} />
      </div>

      <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-400 border border-rose-500/20 mb-3">
        <ShieldAlert size={13} />
        FALHA OPERACIONAL RECUPERÁVEL
      </div>

      <h1 className="text-2xl font-black text-white tracking-tight">
        Ocorreu uma instabilidade neste módulo
      </h1>

      <p className="text-sm text-slate-400 max-w-md mt-2">
        A transação foi isolada pelo sistema. Nenhum dado contábil ou financeiro foi corrompido. Você pode tentar recarregar o módulo ou voltar ao painel principal.
      </p>

      {error?.message && (
        <div className="mt-4 p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-rose-300 font-mono max-w-lg truncate">
          {error.message}
        </div>
      )}

      <div className="flex items-center gap-3 mt-6">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white transition shadow-lg shadow-emerald-950/40"
        >
          <RotateCcw size={14} />
          <span>Tentar Novamente</span>
        </button>

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

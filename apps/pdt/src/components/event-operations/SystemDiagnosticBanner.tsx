'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCcw } from 'lucide-react';

export function SystemDiagnosticBanner({
  message,
  onRetry,
  onDiagnostic,
}: {
  message?: string;
  onRetry?: () => void;
  onDiagnostic?: () => void;
}) {
  if (!message) return null;

  return (
    <aside
      role="status"
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-950/20 px-4 py-2.5 text-xs text-amber-200 shadow-sm"
    >
      <div className="flex items-center gap-2 min-w-0">
        <AlertCircle size={15} className="text-amber-400 shrink-0" />
        <span className="truncate">{message}</span>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition"
          >
            <RefreshCcw size={12} />
            <span>Tentar novamente</span>
          </button>
        )}
        {onDiagnostic ? (
          <button
            type="button"
            onClick={onDiagnostic}
            className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            Diagnóstico
          </button>
        ) : (
          <Link
            href="/diagnostico"
            className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            Diagnóstico
          </Link>
        )}
      </div>
    </aside>
  );
}

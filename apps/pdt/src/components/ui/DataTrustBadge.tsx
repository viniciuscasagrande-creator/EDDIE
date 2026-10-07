'use client';

import React, { useState } from 'react';
import { ShieldCheck, Info, CheckCircle2, Clock, Database, Activity } from 'lucide-react';

export interface DataTrustInfo {
  source: string; // Ex: 'Ledger (Partidas Dobradas)', 'Gateway Adquirente', 'REP-P Portaria 671 MTE', 'Meta CAPI / GA4'
  period?: string; // Ex: 'Hoje (00:00 às 23:59)', 'Últimos 30 dias', 'Competência 10/2026'
  attributionModel?: string; // Ex: 'LAST_NON_DIRECT (janela 7 dias)', 'FIRST_CLICK', 'DIRECT_LEDGER'
  status?: 'RELIABLE' | 'PARTIAL' | 'DIVERGENT';
  dataQualityScore?: number; // Ex: 98
  lastUpdated?: string; // Ex: '14:23:10'
  latencyMs?: number; // Ex: 340
}

interface DataTrustBadgeProps {
  info: DataTrustInfo;
  className?: string;
  minimal?: boolean;
}

export function DataTrustBadge({ info, className = '', minimal = false }: DataTrustBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);

  const statusColor =
    info.status === 'PARTIAL'
      ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
      : info.status === 'DIVERGENT'
      ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
      : 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border transition cursor-pointer ${statusColor}`}
        title="Data Trust Layer — Detalhes da Origem e Governança desta Métrica"
      >
        <ShieldCheck className="w-3 h-3 shrink-0" />
        {!minimal && <span>{info.dataQualityScore ? `${info.dataQualityScore}%` : 'Auditado'}</span>}
      </button>

      {isOpen && (
        <div
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          className="absolute right-0 bottom-full mb-1.5 w-72 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 text-left text-xs animate-in fade-in"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Data Trust Dictionary</span>
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300">
              {info.dataQualityScore || 98}/100 Quality
            </span>
          </div>

          <div className="py-2 space-y-1.5 text-[11px]">
            <div>
              <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold">Fonte de Dados</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{info.source}</span>
            </div>

            {info.period && (
              <div>
                <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold">Janela / Período</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">{info.period}</span>
              </div>
            )}

            {info.attributionModel && (
              <div>
                <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold">Modelo de Atribuição</span>
                <span className="font-mono text-purple-700 dark:text-purple-300">{info.attributionModel}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Atualizado: {info.lastUpdated || 'Ao vivo'}</span>
              </span>
              {info.latencyMs && (
                <span className="font-mono text-emerald-600 dark:text-emerald-400">
                  Delay: {info.latencyMs}ms
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  Users,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  Zap,
  Activity,
  Flame,
} from 'lucide-react';
import { cn, formatNumber, formatPercent } from '../../lib/utils';
import { DashboardSummaryResponse } from './dashboard.types';

export interface GateOperationsBlockProps {
  gateOperations: DashboardSummaryResponse['gateOperations'];
  checkinsToday: number;
  loading?: boolean;
  className?: string;
}

export function GateOperationsBlock({
  gateOperations,
  checkinsToday,
  loading = false,
  className,
}: GateOperationsBlockProps) {
  const statusConfig = {
    OPERACIONAL: {
      label: 'Portões Normais',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      dot: 'bg-emerald-400',
    },
    FILA_CRITICA: {
      label: 'Fila Crítica (>5m)',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      dot: 'bg-amber-400 animate-ping',
    },
    OFFLINE: {
      label: 'Catracas Offline',
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      dot: 'bg-rose-400 animate-pulse',
    },
  };

  const status = statusConfig[gateOperations.gateStatus] || statusConfig.OPERACIONAL;

  return (
    <div
      className={cn(
        'bg-[#111827] rounded-xl border border-slate-800 p-6 flex flex-col justify-between shadow-sm',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Building2 size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Portaria & Controle de Acesso
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30">
                Catracas
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Validação de ingressos, lotação dos setores e ritmo
            </p>
          </div>
        </div>

        {/* Gate Status Badge */}
        <div
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
            status.bg,
            status.color,
            status.border
          )}
        >
          <span className={cn('w-2 h-2 rounded-full', status.dot)} />
          <span>{status.label}</span>
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-2 gap-4 my-5">
        <div className="space-y-1">
          <span className="text-xs font-medium text-slate-400">Check-ins Validados</span>
          {loading ? (
            <div className="h-7 w-20 bg-slate-800 animate-pulse rounded" />
          ) : (
            <div className="text-xl lg:text-2xl font-extrabold text-white">
              {formatNumber(checkinsToday)}
            </div>
          )}
          <div className="text-[11px] text-sky-400 font-medium flex items-center gap-1">
            <Users size={12} />
            <span>Público presente hoje</span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-medium text-slate-400">Ritmo de Entrada</span>
          {loading ? (
            <div className="h-7 w-20 bg-slate-800 animate-pulse rounded" />
          ) : (
            <div className="text-xl lg:text-2xl font-extrabold text-white flex items-baseline gap-1">
              <span>{gateOperations.checkinPacePerMinute}</span>
              <span className="text-xs text-slate-400 font-normal">/min</span>
            </div>
          )}
          <div className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
            <Flame size={12} />
            <span>Pico nas catracas</span>
          </div>
        </div>
      </div>

      {/* Occupancy Progress Bar */}
      <div className="space-y-3 pt-4 border-t border-slate-800/60">
        <div>
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="text-slate-400">Ocupação do Espaço</span>
            <span className="text-white font-bold">
              {formatPercent(gateOperations.currentOccupancyPercent, 1)}
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-700',
                gateOperations.currentOccupancyPercent > 90
                  ? 'bg-rose-500'
                  : gateOperations.currentOccupancyPercent > 75
                  ? 'bg-amber-500'
                  : 'bg-sky-500'
              )}
              style={{ width: `${Math.min(gateOperations.currentOccupancyPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Antifraud / Scan Denial Stats */}
        <div className="flex items-center justify-between text-xs pt-1">
          <div className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Tentativas Duplicadas Bloqueadas:</span>
          </div>
          <span className="font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
            {gateOperations.deniedAttemptsCount} bloqueios
          </span>
        </div>
      </div>

      {/* Footer link */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
        <span className="text-slate-400 font-medium">
          {gateOperations.activeEventsCount} evento(s) com portões operando
        </span>
        <Link
          href="/operacao"
          className="text-sky-400 hover:text-sky-300 font-semibold inline-flex items-center gap-1 transition"
        >
          <span>Painel de Catracas</span>
          <ArrowUpRight size={13} />
        </Link>
      </div>
    </div>
  );
}

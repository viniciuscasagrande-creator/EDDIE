'use client';

import React from 'react';
import Link from 'next/link';
import {
  Megaphone,
  TrendingUp,
  Radio,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { cn, formatPercent } from '../../lib/utils';
import { DashboardSummaryResponse, CommandHealth } from './dashboard.types';

export interface MarketingAcquisitionBlockProps {
  marketingHealth: DashboardSummaryResponse['marketingHealth'];
  loading?: boolean;
  className?: string;
}

const healthConfig: Record<
  CommandHealth,
  { label: string; text: string; bg: string; border: string }
> = {
  OPERACIONAL: {
    label: 'Tracking 100% Saudável',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
  ATENCAO: {
    label: 'Atraso em Pixels',
    text: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  DEGRADADO: {
    label: 'CAPI com Degradação',
    text: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
  },
  CRITICO: {
    label: 'Falha Geral de Tracking',
    text: 'text-rose-500',
    bg: 'bg-rose-500/20',
    border: 'border-rose-500/50',
  },
};

export function MarketingAcquisitionBlock({
  marketingHealth,
  loading = false,
  className,
}: MarketingAcquisitionBlockProps) {
  const health = healthConfig[marketingHealth.trackingHealth] || healthConfig.OPERACIONAL;

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
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Megaphone size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Marketing & Aquisição CAPI
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">
                Atribuição
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              ROAS consolidado, eventos de conversão e telemetria multi-pixel
            </p>
          </div>
        </div>

        {/* Tracking Health Badge */}
        <div
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
            health.bg,
            health.text,
            health.border
          )}
        >
          <Radio size={12} className="animate-pulse" />
          <span>{health.label}</span>
        </div>
      </div>

      {/* Main KPI Row */}
      <div className="grid grid-cols-2 gap-4 my-5">
        <div className="space-y-1">
          <span className="text-xs font-medium text-slate-400">Blended ROAS</span>
          {loading ? (
            <div className="h-7 w-20 bg-slate-800 animate-pulse rounded" />
          ) : (
            <div className="text-xl lg:text-2xl font-extrabold text-white flex items-baseline gap-1">
              <span>{marketingHealth.blendedRoas.toFixed(1)}x</span>
            </div>
          )}
          <div className="text-[11px] text-purple-400 font-medium flex items-center gap-1">
            <TrendingUp size={12} />
            <span>Retorno sobre investimento</span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-medium text-slate-400">Campanhas Ativas</span>
          {loading ? (
            <div className="h-7 w-16 bg-slate-800 animate-pulse rounded" />
          ) : (
            <div className="text-xl lg:text-2xl font-extrabold text-white">
              {marketingHealth.activeCampaignsCount}
            </div>
          )}
          <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <Layers size={12} />
            <span>Meta, Google & TikTok</span>
          </div>
        </div>
      </div>

      {/* CAPI Server-Side Delivery Rate Bar */}
      <div className="space-y-2 pt-4 border-t border-slate-800/60">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-400">Entrega Server-Side CAPI</span>
          <span className="text-emerald-400 font-bold">
            {formatPercent(marketingHealth.capiSuccessRatePercent, 1)}
          </span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-purple-500 transition-all duration-700"
            style={{ width: `${Math.min(marketingHealth.capiSuccessRatePercent, 100)}%` }}
          />
        </div>
        <div className="text-[10px] text-slate-400 pt-0.5">
          Deduplicação de eventos via Zod Contracts & Outbox
        </div>
      </div>

      {/* Footer link */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
        <span className="text-slate-400 font-medium">Atribuição por First-Touch e Last-Click</span>
        <Link
          href="/marketing"
          className="text-purple-400 hover:text-purple-300 font-semibold inline-flex items-center gap-1 transition"
        >
          <span>Gerenciador de Campanhas</span>
          <ArrowUpRight size={13} />
        </Link>
      </div>
    </div>
  );
}

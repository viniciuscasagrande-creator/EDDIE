'use client';

import React from 'react';
import {
  CreditCard,
  QrCode,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  ShoppingBag,
} from 'lucide-react';
import { cn, formatBRL, formatNumber, formatPercent } from '../../lib/utils';
import { DashboardSummaryResponse } from './dashboard.types';

export interface SalesPulseBlockProps {
  salesPulse: DashboardSummaryResponse['salesPulse'];
  salesChartData: DashboardSummaryResponse['salesChartData'];
  loading?: boolean;
  className?: string;
}

export function SalesPulseBlock({
  salesPulse,
  salesChartData,
  loading = false,
  className,
}: SalesPulseBlockProps) {
  const maxSales = React.useMemo(() => {
    if (!salesChartData || salesChartData.length === 0) return 1;
    return Math.max(...salesChartData.map((d) => d.salesCents), 1);
  }, [salesChartData]);

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
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <DollarSign size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Pulso de Vendas & Checkout
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Ao Vivo
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Receita consolidada hoje, conversão e ritmo de vendas
            </p>
          </div>
        </div>

        {/* Gateway Health Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border bg-slate-900/80 border-slate-700">
          {salesPulse.gatewayAnomalyDetected ? (
            <>
              <AlertCircle size={14} className="text-amber-400 animate-pulse" />
              <span className="text-amber-400">Instabilidade Gateway</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span className="text-emerald-400">Gateways 100% OK</span>
            </>
          )}
        </div>
      </div>

      {/* Main KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 my-5">
        <div className="space-y-1">
          <span className="text-xs font-medium text-slate-400">GMV Hoje</span>
          {loading ? (
            <div className="h-7 w-28 bg-slate-800 animate-pulse rounded" />
          ) : (
            <div className="text-xl lg:text-2xl font-extrabold text-white">
              {formatBRL(salesPulse.gmvTodayCents)}
            </div>
          )}
          <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <TrendingUp size={12} />
            <span>Processado no Ledger</span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-medium text-slate-400">Ingressos Vendidos</span>
          {loading ? (
            <div className="h-7 w-20 bg-slate-800 animate-pulse rounded" />
          ) : (
            <div className="text-xl lg:text-2xl font-extrabold text-white">
              {formatNumber(salesPulse.ticketsSoldToday)}
            </div>
          )}
          <div className="text-[11px] text-slate-400 font-medium">unidades emitidas</div>
        </div>

        <div className="space-y-1 col-span-2 sm:col-span-1">
          <span className="text-xs font-medium text-slate-400">Ticket Médio</span>
          {loading ? (
            <div className="h-7 w-24 bg-slate-800 animate-pulse rounded" />
          ) : (
            <div className="text-xl lg:text-2xl font-extrabold text-white">
              {formatBRL(salesPulse.averageTicketCents)}
            </div>
          )}
          <div className="text-[11px] text-slate-400 font-medium">por transação paga</div>
        </div>
      </div>

      {/* Payment Split & Mini Live Chart */}
      <div className="space-y-4 pt-4 border-t border-slate-800/60">
        {/* Payment Methods Breakdown */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-1">
              <QrCode size={13} className="text-emerald-400" />
              <span>Pix: {formatPercent(salesPulse.pixPercent, 0)}</span>
            </span>
            <span className="flex items-center gap-1">
              <CreditCard size={13} className="text-sky-400" />
              <span>Cartão: {formatPercent(salesPulse.creditCardPercent, 0)}</span>
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${salesPulse.pixPercent}%` }}
              title={`Pix: ${salesPulse.pixPercent}%`}
            />
            <div
              className="bg-sky-500 h-full transition-all duration-500"
              style={{ width: `${salesPulse.creditCardPercent}%` }}
              title={`Cartão: ${salesPulse.creditCardPercent}%`}
            />
          </div>
        </div>

        {/* Live Timeline Sales Chart (Interactive mini SVG bars) */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Volume de Vendas por Hora
          </span>
          <div className="h-20 flex items-end gap-1.5 pt-2">
            {salesChartData.map((d, idx) => {
              const heightPercent = Math.max(12, Math.round((d.salesCents / maxSales) * 100));
              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end"
                >
                  {/* Tooltip on Hover */}
                  <div className="absolute -top-9 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-900 border border-slate-700 text-[10px] text-white px-2 py-1 rounded shadow-lg whitespace-nowrap z-20">
                    <span className="font-bold">{d.time}:</span> {formatBRL(d.salesCents)} (
                    {d.ordersCount} ped)
                  </div>

                  {/* Bar */}
                  <div
                    className={cn(
                      'w-full rounded-t transition-all duration-300 group-hover:brightness-125',
                      idx === salesChartData.length - 1
                        ? 'bg-emerald-500'
                        : 'bg-emerald-500/40 group-hover:bg-emerald-500/70'
                    )}
                    style={{ height: `${heightPercent}%` }}
                  />

                  {/* Time label */}
                  <span className="text-[9px] text-slate-400 group-hover:text-slate-200">
                    {d.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

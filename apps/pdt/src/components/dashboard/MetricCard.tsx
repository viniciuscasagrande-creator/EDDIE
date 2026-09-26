'use client';

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn, formatBRL, formatNumber, formatPercent } from '../../lib/utils';

export interface MetricCardProps {
  title: string;
  value: number | string;
  type?: 'currency' | 'number' | 'percentage' | 'string';
  cents?: boolean;
  subtitle?: React.ReactNode;
  trend?: {
    value: number | string;
    isPositive?: boolean;
    neutral?: boolean;
    label?: string;
  };
  icon?: LucideIcon;
  variant?: 'emerald' | 'sky' | 'amber' | 'rose' | 'purple' | 'indigo' | 'default';
  badge?: string;
  loading?: boolean;
  className?: string;
  onClick?: () => void;
}

const variantStyles = {
  default: {
    border: 'border-slate-800 hover:border-slate-700',
    iconBg: 'bg-slate-800/60 border-slate-700 text-slate-300',
    accentText: 'text-white',
  },
  emerald: {
    border: 'border-slate-800 hover:border-emerald-500/40',
    iconBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    accentText: 'text-emerald-400',
  },
  sky: {
    border: 'border-slate-800 hover:border-sky-500/40',
    iconBg: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
    accentText: 'text-sky-400',
  },
  amber: {
    border: 'border-slate-800 hover:border-amber-500/40',
    iconBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    accentText: 'text-amber-400',
  },
  rose: {
    border: 'border-slate-800 hover:border-rose-500/40',
    iconBg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
    accentText: 'text-rose-400',
  },
  purple: {
    border: 'border-slate-800 hover:border-purple-500/40',
    iconBg: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    accentText: 'text-purple-400',
  },
  indigo: {
    border: 'border-slate-800 hover:border-indigo-500/40',
    iconBg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
    accentText: 'text-indigo-400',
  },
};

export function MetricCard({
  title,
  value,
  type = 'string',
  cents = false,
  subtitle,
  trend,
  icon: Icon,
  variant = 'default',
  badge,
  loading = false,
  className,
  onClick,
}: MetricCardProps) {
  const styles = variantStyles[variant] || variantStyles.default;

  const formattedValue = React.useMemo(() => {
    if (typeof value === 'string') return value;
    switch (type) {
      case 'currency':
        return formatBRL(cents ? value : Math.round(value * 100));
      case 'number':
        return formatNumber(value);
      case 'percentage':
        return formatPercent(value);
      default:
        return String(value);
    }
  }, [value, type, cents]);

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-[#111827] rounded-xl p-5 border transition-all duration-200 relative group flex flex-col justify-between shadow-sm',
        styles.border,
        onClick && 'cursor-pointer hover:bg-[#151f33]',
        className
      )}
    >
      {/* Header: Title + Icon */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {title}
            </span>
            {badge && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {badge}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <div
            className={cn(
              'w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105',
              styles.iconBg
            )}
          >
            <Icon size={18} />
          </div>
        )}
      </div>

      {/* Value Display */}
      <div className="my-1">
        {loading ? (
          <div className="h-8 w-32 bg-slate-800/80 animate-pulse rounded my-1" />
        ) : (
          <div className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-2">
            <span>{formattedValue}</span>
          </div>
        )}
      </div>

      {/* Footer: Trend and Subtitle */}
      <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        {loading ? (
          <div className="h-4 w-40 bg-slate-800/60 animate-pulse rounded" />
        ) : (
          <>
            <div className="truncate font-medium text-slate-400">
              {subtitle || <span className="opacity-0">—</span>}
            </div>

            {trend && (
              <div
                className={cn(
                  'inline-flex items-center gap-1 font-semibold shrink-0 text-xs px-1.5 py-0.5 rounded',
                  trend.neutral
                    ? 'text-slate-400 bg-slate-800/50'
                    : trend.isPositive
                    ? 'text-emerald-400 bg-emerald-500/10'
                    : 'text-rose-400 bg-rose-500/10'
                )}
              >
                {trend.neutral ? (
                  <Minus size={12} />
                ) : trend.isPositive ? (
                  <TrendingUp size={12} />
                ) : (
                  <TrendingDown size={12} />
                )}
                <span>
                  {typeof trend.value === 'number'
                    ? `${trend.value > 0 ? '+' : ''}${trend.value}%`
                    : trend.value}
                </span>
                {trend.label && (
                  <span className="text-[10px] text-slate-400 font-normal">
                    {trend.label}
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

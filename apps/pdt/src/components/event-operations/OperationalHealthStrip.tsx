'use client';

import React from 'react';

export type HealthState = 'NORMAL' | 'ATENCAO' | 'CRITICO' | 'INDISPONIVEL';

export type HealthItem = {
  label: string;
  state: HealthState;
  detail?: string;
};

export function OperationalHealthStrip({ items }: { items: HealthItem[] }) {
  const getStatusColor = (state: HealthState) => {
    switch (state) {
      case 'NORMAL':
        return {
          dot: 'bg-emerald-400',
          text: 'text-emerald-400',
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        };
      case 'ATENCAO':
        return {
          dot: 'bg-amber-400',
          text: 'text-amber-400',
          badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        };
      case 'CRITICO':
        return {
          dot: 'bg-rose-400',
          text: 'text-rose-400',
          badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        };
      case 'INDISPONIVEL':
      default:
        return {
          dot: 'bg-slate-500',
          text: 'text-slate-400',
          badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
        };
    }
  };

  return (
    <section
      aria-label="Saúde operacional dos subsistemas"
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5"
    >
      {items.map((item) => {
        const colors = getStatusColor(item.state);
        return (
          <div
            key={item.label}
            className="rounded-xl border border-slate-800 bg-[#16181d] px-3.5 py-2.5 shadow-sm flex flex-col justify-between"
          >
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 truncate">
              {item.label}
            </div>
            <div className="mt-1 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${colors.dot} shadow-sm`} />
                <span className={`text-xs font-bold ${colors.text}`}>{item.state}</span>
              </div>
              {item.detail && (
                <span className="text-[10px] text-slate-400 truncate font-mono ml-1 max-w-[80px]">
                  {item.detail}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}

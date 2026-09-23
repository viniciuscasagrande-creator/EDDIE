'use client';

import type { ReactNode } from 'react';

type Props = {
  header: ReactNode;
  navigation?: ReactNode;
  primaryKpis: ReactNode;
  health: ReactNode;
  diagnostic?: ReactNode;
  sales: ReactNode;
  now: ReactNode;
  gate: ReactNode;
  finance: ReactNode;
  marketing: ReactNode;
  incidents: ReactNode;
  timeline?: ReactNode;
};

export function EventOperationsLayout(p: Props) {
  return (
    <div className="min-w-0 space-y-4">
      {p.diagnostic}
      {p.header}
      {p.navigation}
      {p.primaryKpis}
      {p.health}

      {/* Grid Principal: 70% Ritmo de Vendas x 30% Agora no Evento */}
      <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,7fr)_minmax(300px,3fr)]">
        <div className="min-w-0">{p.sales}</div>
        <div className="min-w-0">{p.now}</div>
      </section>

      {/* Segunda Camada: Portaria / Ocupação x Financeiro / Pagamentos */}
      <section className="grid min-w-0 gap-4 lg:grid-cols-2">
        <div className="min-w-0">{p.gate}</div>
        <div className="min-w-0">{p.finance}</div>
      </section>

      {/* Terceira Camada: Marketing / Conversão x Alertas & Ocorrências */}
      <section className="grid min-w-0 gap-4 lg:grid-cols-2">
        <div className="min-w-0">{p.marketing}</div>
        <div className="min-w-0">{p.incidents}</div>
      </section>

      {/* Quarta Camada: Timeline Operacional Unificada */}
      {p.timeline && (
        <section className="min-w-0">
          {p.timeline}
        </section>
      )}
    </div>
  );
}

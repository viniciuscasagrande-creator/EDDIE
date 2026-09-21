'use client';

import React from 'react';
import {
  Calendar,
  MapPin,
  Users,
  Ticket,
  Plus,
  ArrowUpRight,
} from 'lucide-react';

export default function EventosPage() {
  const eventos = [
    {
      id: '1',
      nome: 'Rock Festival Curitiba 2026',
      data: '14/11/2026 - 18:00',
      local: 'Pedreira Paulo Leminski, Curitiba - PR',
      ocupacao: '82%',
      ingressosVendidos: 16400,
      capacidadeTotal: 20000,
      totalVendas: 'R$ 2.460.000,00',
      status: 'publicado',
    },
    {
      id: '2',
      nome: 'Sertanejo Prime Weekend',
      data: '05/12/2026 - 21:00',
      local: 'Live Curitiba, Curitiba - PR',
      ocupacao: '64%',
      ingressosVendidos: 3200,
      capacidadeTotal: 5000,
      totalVendas: 'R$ 480.000,00',
      status: 'publicado',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Eventos, Sessões & Lotes
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Cockpit de produção, virada de lotes automática e monitoramento de capacidade de público.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/20 transition"
        >
          <Plus size={15} />
          <span>Cadastrar Novo Evento</span>
        </button>
      </div>

      {/* Events List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {eventos.map((ev) => (
          <div
            key={ev.id}
            className="bg-[#111827] border border-slate-800 rounded-xl p-6 space-y-4 hover:border-slate-700 transition"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase">
                  {ev.status}
                </span>
                <h2 className="text-lg font-bold text-white mt-2">{ev.nome}</h2>
              </div>
              <span className="text-sm font-bold text-emerald-400">{ev.ocupacao}</span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-slate-500" />
                <span>{ev.data}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-slate-500" />
                <span>{ev.local}</span>
              </div>
              <div className="flex items-center gap-2">
                <Ticket size={14} className="text-slate-500" />
                <span>
                  {ev.ingressosVendidos.toLocaleString('pt-BR')} / {ev.capacidadeTotal.toLocaleString('pt-BR')} ingressos
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Faturado</div>
                <div className="text-base font-bold text-white">{ev.totalVendas}</div>
              </div>

              <button
                type="button"
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
              >
                Cockpit Operacional
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

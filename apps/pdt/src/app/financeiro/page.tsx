'use client';

import React, { useState } from 'react';
import {
  Wallet,
  Lock,
  RefreshCcw,
  Hourglass,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Send,
} from 'lucide-react';

export default function FinanceiroPage() {
  const [activeTab, setActiveTab] = useState<'saldos' | 'extrato' | 'repasses'>('saldos');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Módulo Financeiro & Tesouraria
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Gestão da conta gráfica do produtor em partidas dobradas e controle de liquidações Pix.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition"
        >
          <Send size={15} />
          <span>Solicitar Repasse Pix</span>
        </button>
      </div>

      {/* Buckets Grid (Append-Only Derived Balances) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Disponível */}
        <div className="bg-[#111827] border border-emerald-500/30 rounded-xl p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <span>Disponível</span>
            <Wallet size={18} />
          </div>
          <div className="text-2xl font-black text-white">R$ 148.520,00</div>
          <p className="text-[11px] text-slate-400">
            Liberado para repasse ou pagamento de despesas.
          </p>
        </div>

        {/* Bloqueado */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-400 uppercase tracking-wider">
            <span>Bloqueado</span>
            <Lock size={18} />
          </div>
          <div className="text-2xl font-black text-white">R$ 25.000,00</div>
          <p className="text-[11px] text-slate-400">
            Repasses em análise ou retenções cautelares.
          </p>
        </div>

        {/* Reservado para Estorno */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-rose-400 uppercase tracking-wider">
            <span>Fundo de Estorno</span>
            <RefreshCcw size={18} />
          </div>
          <div className="text-2xl font-black text-white">R$ 12.350,00</div>
          <p className="text-[11px] text-slate-400">
            Reserva para chargebacks e contestações.
          </p>
        </div>

        {/* Retido */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-sky-400 uppercase tracking-wider">
            <span>Retido (Pré-Evento)</span>
            <Hourglass size={18} />
          </div>
          <div className="text-2xl font-black text-white">R$ 390.800,00</div>
          <p className="text-[11px] text-slate-400">
            Vendas brutas aguardando a realização do evento.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('saldos')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition ${
            activeTab === 'saldos'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Extrato do Ledger (Partidas Dobradas)
        </button>
        <button
          onClick={() => setActiveTab('repasses')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition ${
            activeTab === 'repasses'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Solicitações de Repasse Pix
        </button>
      </div>

      {/* Ledger Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">
            Últimos Lançamentos Auditáveis no Ledger
          </h2>
          <span className="text-xs text-slate-400">Livro-Razão Imutável</span>
        </div>

        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900/60 text-slate-400 font-semibold border-b border-slate-800">
              <th className="p-3.5">Data / Hora</th>
              <th className="p-3.5">Origem</th>
              <th className="p-3.5">Bucket</th>
              <th className="p-3.5">Histórico</th>
              <th className="p-3.5 text-right">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            <tr className="hover:bg-slate-800/30 transition">
              <td className="p-3.5 text-slate-400">21/09/2026 15:42</td>
              <td className="p-3.5 font-medium text-emerald-400">pedido_pago</td>
              <td className="p-3.5">
                <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  retido
                </span>
              </td>
              <td className="p-3.5">Venda de 2 ingressos - Pedido #48291</td>
              <td className="p-3.5 text-right font-bold text-emerald-400">+ R$ 420,00</td>
            </tr>
            <tr className="hover:bg-slate-800/30 transition">
              <td className="p-3.5 text-slate-400">21/09/2026 14:10</td>
              <td className="p-3.5 font-medium text-amber-400">repasse</td>
              <td className="p-3.5">
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  bloqueado
                </span>
              </td>
              <td className="p-3.5">Solicitação de Repasse Pix #RP-1002</td>
              <td className="p-3.5 text-right font-bold text-rose-400">- R$ 25.000,00</td>
            </tr>
            <tr className="hover:bg-slate-800/30 transition">
              <td className="p-3.5 text-slate-400">21/09/2026 11:30</td>
              <td className="p-3.5 font-medium text-purple-400">transferencia</td>
              <td className="p-3.5">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  disponivel
                </span>
              </td>
              <td className="p-3.5">Transferência Inter-Eventos (Festival A -&gt; B)</td>
              <td className="p-3.5 text-right font-bold text-emerald-400">+ R$ 50.000,00</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

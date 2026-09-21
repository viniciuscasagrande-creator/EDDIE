'use client';

import React from 'react';
import {
  Megaphone,
  QrCode,
  Tag,
  Activity,
  Plus,
  TrendingUp,
  Share2,
} from 'lucide-react';

export default function MarketingPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Marketing Hub & Atribuição de Vendas
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Campanhas prontas e multicanais, pixels CAPI (Meta, Google, TikTok, Spotify) e gerador de UTMs com QR Code.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition"
          >
            <QrCode size={15} />
            <span>Gerar Link UTM / QR</span>
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg shadow-sky-600/20 transition"
          >
            <Plus size={15} />
            <span>Nova Campanha</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Campanhas Ativas</div>
          <div className="text-2xl font-bold text-white">6</div>
          <div className="text-xs text-emerald-400 font-medium">+2 lançadas hoje</div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cliques Rastreacionados</div>
          <div className="text-2xl font-bold text-white">48.210</div>
          <div className="text-xs text-sky-400 font-medium">8 Links UTM ativos</div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Conversões Atribuídas</div>
          <div className="text-2xl font-bold text-white">1.840</div>
          <div className="text-xs text-emerald-400 font-medium">Taxa de conv.: 3.82%</div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Receita Atribuída</div>
          <div className="text-2xl font-bold text-emerald-400">R$ 382.900,00</div>
          <div className="text-xs text-slate-400 font-medium">ROAS Médio: 4.8x</div>
        </div>
      </div>

      {/* Tracking Pixels Status */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Activity size={18} className="text-emerald-400" />
          <span>Pixels de Conversão Server-Side (CAPI) & Tags Ativas</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">Meta Ads (CAPI)</div>
              <div className="text-[10px] text-emerald-400">● Ativo e Conectado</div>
            </div>
            <span className="text-[10px] font-mono text-slate-500">ID: 8492019</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">Google Ads</div>
              <div className="text-[10px] text-emerald-400">● Ativo e Conectado</div>
            </div>
            <span className="text-[10px] font-mono text-slate-500">AW-48201</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">Google Analytics (GA4)</div>
              <div className="text-[10px] text-emerald-400">● Ativo e Conectado</div>
            </div>
            <span className="text-[10px] font-mono text-slate-500">G-92810</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">TikTok Ads</div>
              <div className="text-[10px] text-emerald-400">● Ativo e Conectado</div>
            </div>
            <span className="text-[10px] font-mono text-slate-500">TT-4910</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">Spotify Ads</div>
              <div className="text-[10px] text-slate-400">○ Aguardando Token</div>
            </div>
            <span className="text-[10px] font-mono text-slate-500">-</span>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">
            Campanhas em Execução & Atribuição
          </h2>
          <span className="text-xs text-slate-400">Last-Click & Cupons</span>
        </div>

        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900/60 text-slate-400 font-semibold border-b border-slate-800">
              <th className="p-3.5">Nome da Campanha</th>
              <th className="p-3.5">Canais</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Orçamento</th>
              <th className="p-3.5 text-right">Investido</th>
              <th className="p-3.5 text-right">Receita Atribuída</th>
              <th className="p-3.5 text-right">ROAS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            <tr className="hover:bg-slate-800/30 transition">
              <td className="p-3.5 font-bold text-white">Lançamento Lote 1 - Rock Festival</td>
              <td className="p-3.5 text-slate-400">Instagram, Facebook, Google</td>
              <td className="p-3.5">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  ativa
                </span>
              </td>
              <td className="p-3.5 text-right">R$ 15.000,00</td>
              <td className="p-3.5 text-right">R$ 4.250,00</td>
              <td className="p-3.5 text-right font-bold text-emerald-400">R$ 38.250,00</td>
              <td className="p-3.5 text-right font-bold text-sky-400">9.0x</td>
            </tr>
            <tr className="hover:bg-slate-800/30 transition">
              <td className="p-3.5 font-bold text-white">Virada de Lote 48h - Sertanejo Prime</td>
              <td className="p-3.5 text-slate-400">WhatsApp, E-mail, Meta Ads</td>
              <td className="p-3.5">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  ativa
                </span>
              </td>
              <td className="p-3.5 text-right">R$ 8.000,00</td>
              <td className="p-3.5 text-right">R$ 2.100,00</td>
              <td className="p-3.5 text-right font-bold text-emerald-400">R$ 14.700,00</td>
              <td className="p-3.5 text-right font-bold text-sky-400">7.0x</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

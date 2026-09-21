'use client';

import React, { useState } from 'react';
import {
  Scale,
  FileSpreadsheet,
  CheckCircle2,
  Lock,
  Download,
  AlertCircle,
} from 'lucide-react';

export default function ContabilidadePage() {
  const [competencia, setCompetencia] = useState('2026-09');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Módulo Contabilidade & Demonstrações
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Escrituração em partidas dobradas, Balancete de Verificação, DRE Gerencial e fechamento mensal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 flex items-center gap-2">
            <span className="text-slate-400">Competência:</span>
            <span className="font-bold text-white">{competencia}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-600/20 transition"
          >
            <Lock size={15} />
            <span>Fechar Competência</span>
          </button>
        </div>
      </div>

      {/* DRE Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Receita Própria (Taxas)
          </div>
          <div className="text-2xl font-bold text-white">R$ 54.200,00</div>
          <div className="text-[11px] text-slate-400">DiskIngressos (Intermediação)</div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Recursos de Terceiros
          </div>
          <div className="text-2xl font-bold text-sky-400">R$ 480.000,00</div>
          <div className="text-[11px] text-slate-400">Passivo / A Repassar a Produtores</div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Deduções e Impostos
          </div>
          <div className="text-2xl font-bold text-rose-400">- R$ 7.420,00</div>
          <div className="text-[11px] text-slate-400">ISS / PIS / COFINS</div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Resultado Operacional (DRE)
          </div>
          <div className="text-2xl font-bold text-emerald-400">R$ 46.780,00</div>
          <div className="text-[11px] text-slate-400">Margem Líquida da Operação</div>
        </div>
      </div>

      {/* Balancete Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FileSpreadsheet size={16} className="text-amber-400" />
            <span>Balancete de Verificação (Partidas Dobradas)</span>
          </h2>
          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 size={14} /> Total Débitos = Total Créditos
          </span>
        </div>

        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900/60 text-slate-400 font-semibold border-b border-slate-800">
              <th className="p-3.5">Código Conta</th>
              <th className="p-3.5">Nome da Conta</th>
              <th className="p-3.5">Grupo</th>
              <th className="p-3.5 text-right">Débitos (R$)</th>
              <th className="p-3.5 text-right">Créditos (R$)</th>
              <th className="p-3.5 text-right">Saldo Atual (R$)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
            <tr className="hover:bg-slate-800/30 transition">
              <td className="p-3.5 font-bold text-white font-sans">1.1.1.01</td>
              <td className="p-3.5 font-sans text-slate-200">Bancos Conta Movimento (Itaú / Santander)</td>
              <td className="p-3.5 font-sans"><span className="text-sky-400">Ativo</span></td>
              <td className="p-3.5 text-right">534.200,00</td>
              <td className="p-3.5 text-right">385.680,00</td>
              <td className="p-3.5 text-right font-bold text-emerald-400">148.520,00 D</td>
            </tr>
            <tr className="hover:bg-slate-800/30 transition">
              <td className="p-3.5 font-bold text-white font-sans">2.1.2.01</td>
              <td className="p-3.5 font-sans text-slate-200">Valores a Repassar a Produtores (Terceiros)</td>
              <td className="p-3.5 font-sans"><span className="text-amber-400">Passivo</span></td>
              <td className="p-3.5 text-right">385.680,00</td>
              <td className="p-3.5 text-right">480.000,00</td>
              <td className="p-3.5 text-right font-bold text-amber-400">94.320,00 C</td>
            </tr>
            <tr className="hover:bg-slate-800/30 transition">
              <td className="p-3.5 font-bold text-white font-sans">3.1.1.01</td>
              <td className="p-3.5 font-sans text-slate-200">Receita de Serviços e Taxas de Conveniência</td>
              <td className="p-3.5 font-sans"><span className="text-emerald-400">Receita</span></td>
              <td className="p-3.5 text-right">0,00</td>
              <td className="p-3.5 text-right">54.200,00</td>
              <td className="p-3.5 text-right font-bold text-emerald-400">54.200,00 C</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

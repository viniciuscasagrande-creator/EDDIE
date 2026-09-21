'use client';

import React from 'react';
import {
  Briefcase,
  Users,
  Plus,
  ArrowRight,
  DollarSign,
  FileCheck,
} from 'lucide-react';

export default function ComercialPage() {
  const etapas = [
    { id: 'prospeccao', label: 'Prospecção', count: 3, total: 'R$ 380k' },
    { id: 'qualificacao', label: 'Qualificação', count: 2, total: 'R$ 210k' },
    { id: 'proposta', label: 'Proposta Enviada', count: 4, total: 'R$ 490k' },
    { id: 'negociacao', label: 'Negociação de Taxas', count: 2, total: 'R$ 340k' },
    { id: 'contrato', label: 'Contrato & Homologação', count: 1, total: 'R$ 180k' },
    { id: 'ganho', label: 'Ganho / Ativo', count: 12, total: 'R$ 2.4M' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Comercial & CRM B2B (Produtores)
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Gestão da carteira de organizadores de eventos, pipeline de prospecção e condições comerciais negociadas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition"
          >
            <Users size={15} />
            <span>Cadastrar Produtor B2B</span>
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 transition"
          >
            <Plus size={15} />
            <span>Nova Oportunidade</span>
          </button>
        </div>
      </div>

      {/* Pipeline Kanban Stage Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {etapas.map((et) => (
          <div
            key={et.id}
            className="bg-[#111827] border border-slate-800 rounded-xl p-3.5 space-y-1.5"
          >
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
              {et.label}
            </div>
            <div className="text-xl font-black text-white">{et.count}</div>
            <div className="text-[11px] font-semibold text-purple-400">{et.total}</div>
          </div>
        ))}
      </div>

      {/* Opportunities & Conditions List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Table */}
        <div className="lg:col-span-2 bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">
              Oportunidades em Negociação
            </h2>
            <span className="text-xs text-slate-400">Funil Ativo</span>
          </div>

          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/60 text-slate-400 font-semibold border-b border-slate-800">
                <th className="p-3.5">Produtor / Título</th>
                <th className="p-3.5">Etapa</th>
                <th className="p-3.5">Probabilidade</th>
                <th className="p-3.5 text-right">Valor Estimado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr className="hover:bg-slate-800/30 transition">
                <td className="p-3.5">
                  <div className="font-bold text-white">Turnê Nacional 2027</div>
                  <div className="text-[11px] text-slate-400">Live Nation Entretenimento Ltda</div>
                </td>
                <td className="p-3.5">
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-semibold">
                    negociacao
                  </span>
                </td>
                <td className="p-3.5 font-semibold text-slate-300">70%</td>
                <td className="p-3.5 text-right font-bold text-emerald-400">R$ 450.000,00</td>
              </tr>
              <tr className="hover:bg-slate-800/30 transition">
                <td className="p-3.5">
                  <div className="font-bold text-white">Festival Sertanejo Prime 2026</div>
                  <div className="text-[11px] text-slate-400">Opus Produções e Eventos</div>
                </td>
                <td className="p-3.5">
                  <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-semibold">
                    proposta
                  </span>
                </td>
                <td className="p-3.5 font-semibold text-slate-300">50%</td>
                <td className="p-3.5 text-right font-bold text-emerald-400">R$ 280.000,00</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Commercial Conditions Card */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCheck size={16} className="text-emerald-400" />
              <span>Condições Comerciais Vigentes</span>
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between font-bold text-white">
                <span>Taxa de Conveniência</span>
                <span className="text-emerald-400 font-mono">10.0%</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Cobrada sobre o valor de face do ingresso ao comprador.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between font-bold text-white">
                <span>Taxa de Processamento (Cartão)</span>
                <span className="text-sky-400 font-mono">2.5%</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Custo de adquirente / antifraude por transação.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between font-bold text-white">
                <span>Prazo de Repasse Contratual</span>
                <span className="text-purple-400 font-mono">D+2 Dias</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Liquidação automática via chave Pix cadastrada.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { X, GitCompare, ArrowRight, DollarSign, Users, ShoppingCart, CheckCircle, TrendingUp } from 'lucide-react';
import type { UtmData } from './UtmManagementModal';

interface UtmCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUtms: UtmData[];
  allUtms: UtmData[];
  onToggleSelect: (utm: UtmData) => void;
}

export function UtmCompareModal({
  isOpen,
  onClose,
  selectedUtms,
  allUtms,
  onToggleSelect,
}: UtmCompareModalProps) {
  if (!isOpen) return null;

  const formatBRL = (cents: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

  const formatNum = (num: number) => new Intl.NumberFormat('pt-BR').format(num);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* CABEÇALHO */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <GitCompare size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Comparador de Desempenho de URLs Rastreáveis</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  {selectedUtms.length} URLs selecionadas
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Compare lado a lado métricas de funil, conversão e retorno financeiro atribuído.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* SELETOR RÁPIDO DE UTMS SE MENOS DE 2 SELECIONADAS */}
        {selectedUtms.length < 2 && (
          <div className="p-3 bg-amber-950/30 border-b border-amber-900/40 text-amber-300 text-xs flex items-center justify-between">
            <span>Selecione ao menos 2 URLs para ativar o comparador completo lado a lado.</span>
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {allUtms.slice(0, 4).map((u) => (
                <button
                  key={u.id}
                  onClick={() => onToggleSelect(u)}
                  className={`px-2 py-1 rounded text-[10px] font-semibold transition ${
                    selectedUtms.some((s) => s.id === u.id)
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  + {u.nome}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TABELA COMPARATIVA LADO A LADO */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedUtms.map((u) => (
              <div
                key={u.id}
                className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4 shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate max-w-[200px]">{u.nome}</span>
                    <button
                      onClick={() => onToggleSelect(u)}
                      className="text-slate-500 hover:text-rose-400 text-[10px]"
                    >
                      Remover
                    </button>
                  </div>
                  <div className="text-[11px] font-mono text-purple-300 mt-1">
                    {u.source} · {u.medium}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">{u.campaign}</div>
                </div>

                {/* MÉTRICAS DE RESUMO */}
                <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Receita Total:</span>
                    <span className="font-mono font-bold text-emerald-400">{formatBRL(u.receitaCents)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Taxa de Conversão:</span>
                    <span className="font-mono font-bold text-purple-300">{u.taxaConversao}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Tíquete Médio:</span>
                    <span className="font-mono text-white">{formatBRL(u.ticketMedioCents)}</span>
                  </div>
                </div>

                {/* FUNIL VISUAL DA URL */}
                <div className="p-3 bg-black/40 rounded-xl border border-slate-800/80 space-y-1.5 text-[11px]">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Etapas do Funil</span>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>1. Visitas:</span>
                    <span className="font-mono font-bold">{formatNum(u.visitas)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>2. Carrinhos:</span>
                    <span className="font-mono">{formatNum(u.carrinhos)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>3. Checkouts:</span>
                    <span className="font-mono">{formatNum(u.checkouts)}</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-400 font-bold pt-1 border-t border-slate-800">
                    <span>4. Compras:</span>
                    <span className="font-mono">{formatNum(u.compras)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RODAPÉ */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Comparação calculada com dados em tempo real do Storefront e Ledger DiskIngressos.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

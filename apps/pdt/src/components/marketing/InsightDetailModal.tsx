// apps/pdt/src/components/marketing/InsightDetailModal.tsx
// EDDIE 11.16.19 — Modal de Detalhamento de Insights de Marketing Baseados em Evidências

'use client';

import React from 'react';
import {
  X,
  Sparkles,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import type { MarketingInsight } from './analytics-attribution-types';

interface InsightDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  insight: MarketingInsight | null;
  onNavigateAction?: (tab: string) => void;
}

export default function InsightDetailModal({
  isOpen,
  onClose,
  insight,
  onNavigateAction,
}: InsightDetailModalProps) {
  if (!isOpen || !insight) return null;

  const handleAction = () => {
    if (insight.diagnosticActionLink && onNavigateAction) {
      onNavigateAction(insight.diagnosticActionLink);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-[#0f172a]/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Sparkles className="text-amber-400" size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{insight.title}</h2>
              </div>
              <p className="text-xs text-slate-400">
                Diagnóstico de Inteligência baseado em evidências numéricas reais.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Metadata badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1.5">
              <Layers size={13} className="text-slate-400" /> Escopo: {insight.scope}
            </span>
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1.5">
              <Calendar size={13} className="text-slate-400" />
              Janela: {new Date(insight.period.from).toLocaleDateString('pt-BR')} até {new Date(insight.period.to).toLocaleDateString('pt-BR')}
            </span>
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${
                insight.dataQuality === 'BOA'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}
            >
              <ShieldCheck size={13} /> Confiabilidade dos Dados: {insight.dataQuality}
            </span>
          </div>

          {/* Evidence Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Evidências Numéricas Observadas
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {insight.evidence.map((ev, idx) => (
                <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">{ev.label}</span>
                  <div className="text-lg font-black text-white font-mono">{ev.value}</div>
                  <div className="text-[10px] text-slate-500 truncate">Fonte: {ev.source}</div>
                  {ev.benchmark && (
                    <div className="text-[10px] text-indigo-400 font-semibold pt-1 border-t border-slate-800/80">
                      Benchmark: {ev.benchmark}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Interpretation & Non-causality Notice */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Interpretação Analítica
            </h3>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 leading-relaxed space-y-2">
              <p>{insight.interpretation}</p>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
                <AlertCircle size={14} className="text-slate-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Ressalva Metodológica:</strong> Correlação observada na amostra não implica causalidade comprovada. Variações sazonais e de dia da semana devem ser ponderadas.
                </span>
              </div>
            </div>
          </div>

          {/* Suggested Action */}
          {insight.suggestedAction && (
            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                <Lightbulb size={14} className="text-indigo-400" />
                Ação Operacional Recomendada
              </div>
              <p className="text-xs text-indigo-100/90 leading-relaxed">
                {insight.suggestedAction}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#0f172a] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
          >
            Fechar
          </button>
          {insight.diagnosticActionLink && (
            <button
              onClick={handleAction}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
            >
              <span>Acessar Módulo Recomendado</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

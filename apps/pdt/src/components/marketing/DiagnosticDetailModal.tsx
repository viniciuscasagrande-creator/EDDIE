'use client';

import React, { useState } from 'react';
import {
  X,
  Zap,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Copy,
  Check,
  Activity,
  Wrench,
} from 'lucide-react';
import type { DiagnosticFinding } from './health-telemetry-types';

interface DiagnosticDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  finding: DiagnosticFinding | null;
  onAutoRepair: (finding: DiagnosticFinding) => void;
}

export function DiagnosticDetailModal({
  isOpen,
  onClose,
  finding,
  onAutoRepair,
}: DiagnosticDetailModalProps) {
  const [copiedCorr, setCopiedCorr] = useState(false);
  const [repairing, setRepairing] = useState(false);

  if (!isOpen || !finding) return null;

  const copyCorrelationId = () => {
    navigator.clipboard.writeText(finding.correlationId);
    setCopiedCorr(true);
    setTimeout(() => setCopiedCorr(false), 2000);
  };

  const handleExecuteRepair = async () => {
    setRepairing(true);
    try {
      await onAutoRepair(finding);
      onClose();
    } finally {
      setRepairing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border ${
                finding.severity === 'CRITICA' || finding.severity === 'ALTA'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}
            >
              <Zap size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{finding.title}</h2>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    finding.severity === 'CRITICA' || finding.severity === 'ALTA'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {finding.severity}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Regra: <span className="text-purple-300">{finding.ruleCode}</span> • Entidade: {finding.entityName}
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          {/* Causa e Classificação */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Causa Identificada
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  finding.causeType === 'CONFIRMADA'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                }`}
              >
                Causa {finding.causeType}
              </span>
            </div>
            <p className="text-white text-xs leading-relaxed font-sans">{finding.probableCause}</p>
          </div>

          {/* Evidências Coletadas */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Evidências & Sinais Técnicos ({finding.evidence.length})
            </span>
            <div className="space-y-1.5">
              {finding.evidence.map((ev, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80 flex items-start gap-2.5"
                >
                  <ArrowRight size={13} className="text-purple-400 mt-0.5 shrink-0" />
                  <span className="text-slate-200">{ev}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ações Sugeridas */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Recomendações Operacionais
            </span>
            <div className="space-y-1.5">
              {finding.suggestedActions.map((act, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-purple-950/20 border border-purple-800/30 text-purple-200 flex items-center gap-2"
                >
                  <CheckCircle2 size={13} className="text-purple-400 shrink-0" />
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Histórico de Autocorreção se houver */}
          {finding.repairAudit && (
            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <CheckCircle2 size={14} /> Autocorreção Executada com Sucesso
              </div>
              <p className="text-[11px] text-slate-300">{finding.repairAudit.outcome}</p>
              <div className="text-[10px] text-slate-500 font-mono">
                Por: {finding.repairAudit.repairedBy} • {new Date(finding.repairAudit.repairedAt).toLocaleTimeString('pt-BR')}
              </div>
            </div>
          )}

          {/* Aviso de Segurança / Limite de Autocorreção */}
          <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center gap-2.5 text-[11px] text-slate-400">
            <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
            <span>
              <strong>Garantia EDDIE:</strong> Orçamento, publicação, encerramento de campanhas e credenciais exigem intervenção humana explícita e nunca são alteradas automaticamente.
            </span>
          </div>

          {/* Correlation ID */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block">Correlation ID:</span>
              <span className="font-mono text-purple-300 text-[11px]">{finding.correlationId}</span>
            </div>
            <button
              onClick={copyCorrelationId}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              title="Copiar Correlation ID"
            >
              {copiedCorr ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
          >
            Fechar
          </button>

          {finding.canAutoRepair && !finding.repairAudit ? (
            <button
              onClick={handleExecuteRepair}
              disabled={repairing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
            >
              <Wrench size={14} />
              <span>{repairing ? 'Executando Autocorreção...' : `Autocorreção Segura (${finding.repairAction || 'Reparar'})`}</span>
            </button>
          ) : (
            <span className="text-[11px] text-slate-500 italic">
              {finding.repairAudit ? 'Já corrigido' : 'Requer ação manual'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

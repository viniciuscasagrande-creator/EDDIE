'use client';

import React, { useState } from 'react';
import {
  X,
  GitCompare,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';
import type { ReconciliationDiscrepancy } from './health-telemetry-types';

interface ReconciliationModalProps {
  isOpen: boolean;
  onClose: () => void;
  discrepancy: ReconciliationDiscrepancy | null;
  onReconcile: (id: string, chosenSource: 'EDDIE' | 'PROVIDER' | 'ARBITRATED') => void;
}

export function ReconciliationModal({
  isOpen,
  onClose,
  discrepancy,
  onReconcile,
}: ReconciliationModalProps) {
  const [chosenSource, setChosenSource] = useState<'EDDIE' | 'PROVIDER' | 'ARBITRATED'>('PROVIDER');
  const [copiedCorr, setCopiedCorr] = useState(false);
  const [reconciling, setReconciling] = useState(false);

  if (!isOpen || !discrepancy) return null;

  const copyCorr = () => {
    navigator.clipboard.writeText(discrepancy.correlationId);
    setCopiedCorr(true);
    setTimeout(() => setCopiedCorr(false), 2000);
  };

  const handleConfirmReconcile = async () => {
    setReconciling(true);
    try {
      await onReconcile(discrepancy.id, chosenSource);
      onClose();
    } finally {
      setReconciling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <GitCompare size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Reconciliador de Status Multicanal</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {discrepancy.discrepancyType}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Campanha: <strong className="text-slate-200">{discrepancy.campaignName}</strong> ({discrepancy.provider})
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
          {/* Comparativo de Estados */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Estado no Painel EDDIE
              </span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">{discrepancy.eddieStatus}</span>
                <span className="text-[10px] text-slate-500 font-mono">Último Comando: {discrepancy.lastCommand}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Registrado pelo painel em {new Date(discrepancy.lastCommandAt).toLocaleTimeString('pt-BR')}.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/70 border border-purple-500/30 space-y-2">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
                Estado no Provedor Remoto ({discrepancy.provider})
              </span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-purple-300">{discrepancy.providerStatus}</span>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={12} /> Verificado via API
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Webhook: {discrepancy.webhookStatus || 'N/A'} • Telemetria: {discrepancy.telemetryDeliveryStatus || 'N/A'}
              </p>
            </div>
          </div>

          {/* Regra de Reconciliação Transparente */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-start gap-2.5">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="block text-xs font-bold text-amber-200">
                Política de Não-Sobrescrita Silenciosa:
              </strong>
              <p className="text-[11px] leading-relaxed text-amber-300/90">
                Divergências operacionais nunca são alteradas silenciosamente no EDDIE. Escolha a fonte da verdade aplicável para sincronizar ambos os lados com trilha de auditoria gravada.
              </p>
            </div>
          </div>

          {/* Seleção da Fonte da Verdade */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Escolher Fonte da Verdade Aplicável:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setChosenSource('PROVIDER')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  chosenSource === 'PROVIDER'
                    ? 'bg-purple-600/20 border-purple-500 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="font-bold text-xs">Adotar Provedor</div>
                  <div className="text-[10px] text-slate-400 mt-1">Atualiza o EDDIE para {discrepancy.providerStatus}</div>
                </div>
                <span className="text-[9px] font-mono text-purple-400 mt-2 block font-bold">RECOMENDADO</span>
              </button>

              <button
                type="button"
                onClick={() => setChosenSource('EDDIE')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  chosenSource === 'EDDIE'
                    ? 'bg-purple-600/20 border-purple-500 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="font-bold text-xs">Manter EDDIE</div>
                  <div className="text-[10px] text-slate-400 mt-1">Força o provedor remoto a assumir {discrepancy.eddieStatus}</div>
                </div>
                <span className="text-[9px] font-mono text-slate-500 mt-2 block">Dispara comando</span>
              </button>

              <button
                type="button"
                onClick={() => setChosenSource('ARBITRATED')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  chosenSource === 'ARBITRATED'
                    ? 'bg-purple-600/20 border-purple-500 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="font-bold text-xs">Arbitrar Manualmente</div>
                  <div className="text-[10px] text-slate-400 mt-1">Registra auditoria de exceção com nota de operador</div>
                </div>
                <span className="text-[9px] font-mono text-slate-500 mt-2 block">Modo avançado</span>
              </button>
            </div>
          </div>

          {/* Correlation ID */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block">Correlation ID da Reconciliação:</span>
              <span className="font-mono text-purple-300 text-[11px]">{discrepancy.correlationId}</span>
            </div>
            <button
              onClick={copyCorr}
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
            Cancelar
          </button>

          <button
            onClick={handleConfirmReconcile}
            disabled={reconciling}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
          >
            <RefreshCw size={13} className={reconciling ? 'animate-spin' : ''} />
            <span>{reconciling ? 'Reconciliando...' : `Confirmar Reconciliação (${chosenSource})`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

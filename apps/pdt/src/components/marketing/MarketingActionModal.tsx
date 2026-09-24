'use client';

import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  X,
  Loader2,
  ShieldCheck,
  TrendingUp,
  RotateCcw,
  Zap,
} from 'lucide-react';
import {
  MarketingAction,
  ACTION_METADATA,
  MarketingActionResult,
  ActionPhase,
} from '../../lib/marketing-actions/action-types';

interface MarketingActionModalProps {
  phase: ActionPhase;
  action: MarketingAction | null;
  result: MarketingActionResult | null;
  errorMsg: string | null;
  onConfirm: () => void;
  onCancel: () => void;
  onCloseResult: () => void;
}

export function MarketingActionModal({
  phase,
  action,
  result,
  errorMsg,
  onConfirm,
  onCancel,
  onCloseResult,
}: MarketingActionModalProps) {
  if (phase === 'IDLE') return null;

  const meta = action ? ACTION_METADATA[action] : null;

  // 1. MODAL DE CONFIRMAÇÃO
  if (phase === 'CONFIRMING') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
        <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div
              className={`rounded-xl p-2.5 ${
                meta?.isDangerous ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
              }`}
            >
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Confirmação de Ação Operacional</h3>
              <p className="text-xs text-slate-400">{meta?.label || 'Ação Crítica'}</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 leading-relaxed">
            {meta?.confirmationMessage || 'Deseja realmente executar esta operação? A alteração será enviada diretamente ao provedor.'}
          </p>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-600 transition"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition ${
                meta?.isDangerous
                  ? 'bg-red-600 hover:bg-red-500 shadow-lg shadow-red-600/20'
                  : 'bg-orange-600 hover:bg-orange-500 shadow-lg shadow-orange-600/20'
              }`}
            >
              Confirmar Operação
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. SPINNER DE PROCESSAMENTO
  if (phase === 'PROCESSING') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl flex flex-col items-center justify-center text-center space-y-3">
          <Loader2 size={36} className="text-orange-500 animate-spin" />
          <h3 className="text-sm font-bold text-white">Comunicando com o Provedor...</h3>
          <p className="text-xs text-slate-400">
            Enviando instrução para a API e reconciliando telemetria no Ledger.
          </p>
        </div>
      </div>
    );
  }

  // 3. RESULTADO DE SUCESSO OU ERRO
  if (phase === 'SUCCESS' || phase === 'ERROR') {
    const isSuccess = phase === 'SUCCESS';
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
        <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`rounded-xl p-2.5 ${
                  isSuccess ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}
              >
                {isSuccess ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {isSuccess ? 'Operação Concluída com Sucesso' : 'Falha na Operação'}
                </h3>
                <p className="text-xs text-slate-400">{meta?.label || 'Ação de Marketing'}</p>
              </div>
            </div>
            <button onClick={onCloseResult} className="text-slate-400 hover:text-white p-1">
              <X size={16} />
            </button>
          </div>

          <div className="text-xs text-slate-300 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <p className="leading-relaxed">{isSuccess ? result?.message : errorMsg}</p>

            {result?.statusReal && (
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">Status Reconciliado:</span>
                <span className="rounded bg-emerald-500/20 text-emerald-300 px-2 py-0.5 font-bold">
                  {result.statusReal.reconciledStatus}
                </span>
              </div>
            )}

            {result?.correlationId && (
              <div className="text-[10px] text-slate-500 font-mono truncate">
                Correlation ID: <span>{result.correlationId}</span>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={onCloseResult}
              className="w-full py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white hover:bg-slate-700 transition"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

'use client';

import React, { useState } from 'react';
import {
  X,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  RefreshCw,
  Copy,
  Check,
  Server,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import type { HealthRecord } from './health-telemetry-types';

interface HealthEntityDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: HealthRecord | null;
  onCheckHealth: (rec: HealthRecord) => void;
  onOpenDiagnostic: (rec: HealthRecord) => void;
  onOpenLogs?: (rec: HealthRecord) => void;
}

export function HealthEntityDetailModal({
  isOpen,
  onClose,
  record,
  onCheckHealth,
  onOpenDiagnostic,
  onOpenLogs,
}: HealthEntityDetailModalProps) {
  const [copiedCorr, setCopiedCorr] = useState(false);

  if (!isOpen || !record) return null;

  const copyCorrelationId = () => {
    navigator.clipboard.writeText(record.correlationId);
    setCopiedCorr(true);
    setTimeout(() => setCopiedCorr(false), 2000);
  };

  const getStatusBadge = () => {
    switch (record.status) {
      case 'OPERACIONAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 size={13} /> OPERACIONAL
          </span>
        );
      case 'ATENCAO':
      case 'DEGRADADO':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertTriangle size={13} /> {record.status}
          </span>
        );
      case 'ERRO':
      case 'DESCONECTADO':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <XCircle size={13} /> {record.status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
            <Clock size={13} /> {record.status}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Activity size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{record.entityName}</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                  {record.entityType}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Provedor: <strong className="text-slate-200">{record.provider || 'EDDIE Interno'}</strong> • ID: <span className="font-mono text-slate-400">{record.entityId}</span>
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
          {/* Status & Latência */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Estado Atual
              </span>
              <div>{getStatusBadge()}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Latência Média
              </span>
              <div className="text-lg font-mono font-bold text-white flex items-center gap-1.5">
                <Server size={15} className="text-purple-400" />
                <span>{record.latencyMs ? `${record.latencyMs}ms` : 'N/A'}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Última Verificação
              </span>
              <div className="text-xs font-mono text-slate-200">
                {new Date(record.checkedAt).toLocaleTimeString('pt-BR')}
              </div>
              <span className="text-[10px] text-slate-500">
                {new Date(record.checkedAt).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>

          {/* Resumo Técnico e Fonte da Verdade */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Diagnóstico / Resumo
              </span>
              <p className="text-slate-200 text-xs leading-relaxed font-sans">
                {record.summary || 'Entidade operando normalmente sem erros registrados.'}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <div>
                <span className="text-slate-500">Fonte da Verificação:</span>{' '}
                <span className="text-slate-300 font-mono">{record.source}</span>
              </div>
              {record.errorCode && (
                <div className="text-rose-400 font-mono font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  Código: {record.errorCode}
                </div>
              )}
            </div>
          </div>

          {/* Correlation ID Auditável */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Correlation ID (Rastreabilidade)</span>
              <span className="font-mono text-purple-300 text-xs select-all">{record.correlationId}</span>
            </div>
            <button
              onClick={copyCorrelationId}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700"
            >
              {copiedCorr ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copiedCorr ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>
        </div>

        {/* Footer com Ações */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={() => onCheckHealth(record)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
          >
            <RefreshCw size={14} /> Verificar Saúde Agora
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onOpenDiagnostic(record);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 font-bold text-xs border border-purple-500/30 transition"
            >
              <Zap size={14} /> Diagnosticar
            </button>

            {onOpenLogs && (
              <button
                onClick={() => {
                  onOpenLogs(record);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition"
              >
                <Server size={14} /> Logs
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

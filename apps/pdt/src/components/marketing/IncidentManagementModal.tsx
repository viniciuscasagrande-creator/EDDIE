'use client';

import React, { useState } from 'react';
import {
  X,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  RotateCcw,
  Save,
  Copy,
  Check,
  FileText,
} from 'lucide-react';
import type { Incident, IncidentStatus } from './health-telemetry-types';

interface IncidentManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: Incident | null;
  onUpdateIncident: (id: string, patch: { status?: IncidentStatus; assignedTo?: string; resolutionNotes?: string }) => void;
  onRetryIncident: (id: string) => void;
}

export function IncidentManagementModal({
  isOpen,
  onClose,
  incident,
  onUpdateIncident,
  onRetryIncident,
}: IncidentManagementModalProps) {
  const [status, setStatus] = useState<IncidentStatus>(incident?.status || 'ABERTO');
  const [assignedTo, setAssignedTo] = useState(incident?.assignedTo || '');
  const [notes, setNotes] = useState(incident?.resolutionNotes || '');
  const [copiedCorr, setCopiedCorr] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  // Sincroniza estado quando modal abre
  React.useEffect(() => {
    if (incident) {
      setStatus(incident.status);
      setAssignedTo(incident.assignedTo || '');
      setNotes(incident.resolutionNotes || '');
    }
  }, [incident, isOpen]);

  if (!isOpen || !incident) return null;

  const copyCorr = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedCorr(id);
    setTimeout(() => setCopiedCorr(null), 2000);
  };

  const handleSave = () => {
    onUpdateIncident(incident.id, {
      status,
      assignedTo: assignedTo.trim() || undefined,
      resolutionNotes: notes.trim() || undefined,
    });
    onClose();
  };

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await onRetryIncident(incident.id);
    } finally {
      setRetrying(false);
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
                incident.severity === 'CRITICA' || incident.severity === 'ALTA'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}
            >
              <AlertOctagon size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{incident.title}</h2>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    incident.severity === 'CRITICA' || incident.severity === 'ALTA'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {incident.severity}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Módulo: <strong className="text-slate-200">{incident.entityType}</strong> • ID: <span className="font-mono text-slate-400">{incident.entityId}</span>
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
          {/* Status e Impacto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Impacto Observado
              </span>
              <p className="text-white text-xs leading-relaxed font-sans">{incident.observedImpact}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Janela Operacional
              </span>
              <div className="text-[11px] text-slate-300">
                Início: <span className="font-mono text-white">{new Date(incident.startedAt).toLocaleString('pt-BR')}</span>
              </div>
              <div className="text-[11px] text-slate-300">
                Última Ocorrência: <span className="font-mono text-white">{new Date(incident.lastOccurredAt).toLocaleString('pt-BR')}</span>
              </div>
              <div className="text-[10px] text-purple-400 font-bold">
                {incident.findingsCount} falha(s) agregada(s) (Anti-Spam ativado)
              </div>
            </div>
          </div>

          {/* Evidências */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Evidências Agrupadas
            </span>
            <div className="space-y-1">
              {incident.evidence.map((ev, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800 text-slate-200">
                  • {ev}
                </div>
              ))}
            </div>
          </div>

          {/* Formulário de Gestão do Incidente */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Gestão de Resolução & Workflow
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Status do Incidente</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as IncidentStatus)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-purple-500"
                >
                  <option value="ABERTO">Aberto</option>
                  <option value="INVESTIGANDO">Em Investigação</option>
                  <option value="MITIGADO">Mitigado</option>
                  <option value="RESOLVIDO">Resolvido</option>
                  <option value="IGNORADO_COM_JUSTIFICATIVA">Ignorado com Justificativa</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Responsável / Operador</label>
                <input
                  type="text"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="Ex: Ops Lead, DevOps, Especialista Ads"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-purple-500 placeholder-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Notas de Resolução / Histórico</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Descreva as medidas adotadas ou motivo da mitigação..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-purple-500 placeholder-slate-600"
              />
            </div>
          </div>

          {/* Correlation IDs */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Correlation IDs do Incidente</span>
            <div className="flex flex-wrap gap-1.5">
              {incident.correlationIds.map((cid, idx) => (
                <button
                  key={idx}
                  onClick={() => copyCorr(cid)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-[10px] font-mono transition"
                >
                  {copiedCorr === cid ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                  <span>{cid}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 font-bold text-xs border border-purple-500/30 transition disabled:opacity-50"
          >
            <RotateCcw size={13} className={retrying ? 'animate-spin' : ''} />
            <span>{retrying ? 'Retentando...' : 'Retentar Operação'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition"
            >
              <Save size={13} />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

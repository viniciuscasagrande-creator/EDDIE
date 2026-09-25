// apps/pdt/src/components/marketing/PixelLogsModal.tsx
// EDDIE 11.16.17 — Modal de Logs de Entrega e Deduplicação (Delivery Log)

'use client';

import React, { useState } from 'react';
import { X, FileText, CheckCircle2, Copy, Check, RefreshCw, AlertCircle } from 'lucide-react';
import type { TrackingDeliveryLog, TrackingConfiguration } from './tracking-types';

interface PixelLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: TrackingConfiguration | null;
  logs: TrackingDeliveryLog[];
  onReprocessLog: (logId: string) => void;
}

export function PixelLogsModal({
  isOpen,
  onClose,
  config,
  logs,
  onReprocessLog,
}: PixelLogsModalProps) {
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen || !config) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const logsFiltrados = logs.filter((log) => {
    if (filtroStatus === 'TODOS') return true;
    return log.status === filtroStatus;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* CABEÇALHO */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <FileText size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Trilha de Auditoria & Delivery Logs</h2>
              <p className="text-xs text-slate-400">
                {config.name} · {config.provider} ({config.publicId})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* BARRA DE FILTROS */}
        <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            {['TODOS', 'ENTREGUE', 'DEDUPLICADO', 'ERRO'].map((st) => (
              <button
                key={st}
                onClick={() => setFiltroStatus(st)}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  filtroStatus === st
                    ? 'bg-purple-600 text-white font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-slate-400">
            Exibindo <b className="text-white">{logsFiltrados.length}</b> eventos de telemetria
          </div>
        </div>

        {/* TABELA DE LOGS */}
        <div className="p-5 overflow-y-auto flex-1 text-xs">
          {logsFiltrados.length === 0 ? (
            <div className="py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
              Nenhum log de entrega encontrado para este filtro.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left">
                <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800 text-[11px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Evento</th>
                    <th className="py-2.5 px-3">Origem</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Latência</th>
                    <th className="py-2.5 px-3">Correlation ID</th>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {logsFiltrados.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-3 font-sans font-bold text-white">
                        {log.eventName}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                            log.source === 'SERVER'
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                          }`}
                        >
                          {log.source}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            log.status === 'ENTREGUE'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : log.status === 'DEDUPLICADO'
                              ? 'bg-purple-500/10 text-purple-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">{log.latencyMs}ms</td>
                      <td className="py-2.5 px-3 text-slate-400">
                        <button
                          onClick={() => copyToClipboard(log.correlationId, log.id)}
                          className="flex items-center gap-1 hover:text-white"
                          title="Copiar correlationId"
                        >
                          <span>{log.correlationId.substring(0, 14)}...</span>
                          {copiedId === log.id ? (
                            <Check size={11} className="text-emerald-400" />
                          ) : (
                            <Copy size={11} />
                          )}
                        </button>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-[10px]">
                        {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {log.status === 'ERRO' ? (
                          <button
                            onClick={() => onReprocessLog(log.id)}
                            className="px-2 py-0.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-sans text-[10px] font-bold"
                          >
                            Reprocessar
                          </button>
                        ) : (
                          <span className="text-slate-600 text-[10px]">OK</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RODAPÉ */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-400" />
            <span>Eventos retidos por 30 dias com criptografia e sem alteração no Ledger</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow-lg shadow-purple-600/20"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

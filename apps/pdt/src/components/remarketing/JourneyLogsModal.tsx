// apps/pdt/src/components/remarketing/JourneyLogsModal.tsx
// EDDIE 11.16.16 — Modal de Trilha de Auditoria e Logs com correlationId e LGPD

'use client';

import React, { useState } from 'react';
import {
  X,
  History,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
  Copy,
  Check,
  Search,
} from 'lucide-react';
import type { JourneyExecutionLog } from './journey-types';

interface JourneyLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  journeyNome: string;
  logs: JourneyExecutionLog[];
}

export function JourneyLogsModal({
  isOpen,
  onClose,
  journeyNome,
  logs,
}: JourneyLogsModalProps) {
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const logsFiltrados = logs.filter((log) => {
    const matchBusca =
      !busca ||
      log.correlationId.toLowerCase().includes(busca.toLowerCase()) ||
      log.nodeTitulo.toLowerCase().includes(busca.toLowerCase()) ||
      log.clienteAnonimizado.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === 'TODOS' || log.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  const handleCopyCorrelation = (corrId: string) => {
    navigator.clipboard.writeText(corrId);
    setCopiedId(corrId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-[#111827] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <History size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Trilha de Execuções da Jornada</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
                  {journeyNome}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Auditoria em tempo real com correlationId, proteção LGPD e registro imutável por nó.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filtros e Busca */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por correlationId, nó ou cliente..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {(['TODOS', 'SUCESSO', 'CONVERTIDO', 'FALHA', 'OPT_OUT'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFiltroStatus(st)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  filtroStatus === st
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800/60 text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Tabela de Logs */}
        <div className="overflow-y-auto flex-1 p-4">
          <div className="space-y-3">
            {logsFiltrados.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                Nenhum log encontrado para os filtros selecionados.
              </div>
            ) : (
              logsFiltrados.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 hover:border-slate-700 transition"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.status === 'SUCESSO'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : log.status === 'CONVERTIDO'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : log.status === 'OPT_OUT'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {log.status}
                      </span>
                      <strong className="text-white">{log.nodeTitulo}</strong>
                      <span className="text-[10px] font-mono text-slate-400">({log.nodeType})</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleCopyCorrelation(log.correlationId)}
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-purple-400 hover:underline"
                        title="Copiar correlationId"
                      >
                        <span>{log.correlationId.slice(0, 14)}...</span>
                        {copiedId === log.correlationId ? <Check size={11} /> : <Copy size={11} />}
                      </button>
                      <span className="text-[10px] font-mono text-slate-500">{log.timestamp}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300">{log.detalhes}</p>

                  <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500 border-t border-slate-800/80">
                    <div>
                      Participante (LGPD): <strong className="text-slate-300">{log.clienteAnonimizado}</strong>
                    </div>
                    {log.canal && (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                        Canal: {log.canal}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#111827] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Máscara LGPD ativa em telefones, CPFs e e-mails de compradores.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

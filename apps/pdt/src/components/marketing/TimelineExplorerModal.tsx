'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Clock,
  Search,
  Filter,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  Send,
  Zap,
  RotateCcw,
  Wrench,
  AlertOctagon,
} from 'lucide-react';
import type { TimelineEvent, TimelineOperation, Severity } from './health-telemetry-types';

interface TimelineExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: TimelineEvent[];
  initialCorrelationId?: string;
}

export function TimelineExplorerModal({
  isOpen,
  onClose,
  events,
  initialCorrelationId = '',
}: TimelineExplorerModalProps) {
  const [searchCorr, setSearchCorr] = useState(initialCorrelationId);
  const [filtroOp, setFiltroOp] = useState<string>('TODAS');
  const [filtroSev, setFiltroSev] = useState<string>('TODAS');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialCorrelationId) {
      setSearchCorr(initialCorrelationId);
    }
  }, [initialCorrelationId, isOpen]);

  if (!isOpen) return null;

  const copyCorr = (corr: string) => {
    navigator.clipboard.writeText(corr);
    setCopiedId(corr);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchCorr =
        !searchCorr.trim() ||
        ev.correlationId.toLowerCase().includes(searchCorr.toLowerCase().trim()) ||
        ev.title.toLowerCase().includes(searchCorr.toLowerCase().trim()) ||
        ev.description.toLowerCase().includes(searchCorr.toLowerCase().trim());

      const matchOp = filtroOp === 'TODAS' || ev.operation === filtroOp;
      const matchSev = filtroSev === 'TODAS' || ev.severity === filtroSev;

      return matchCorr && matchOp && matchSev;
    });
  }, [events, searchCorr, filtroOp, filtroSev]);

  const getOpIcon = (op: TimelineOperation) => {
    switch (op) {
      case 'CONEXAO':
      case 'SYNC':
        return <Activity size={14} className="text-purple-400" />;
      case 'TESTE':
        return <Zap size={14} className="text-sky-400" />;
      case 'PUBLICACAO':
      case 'TRACKING':
        return <Send size={14} className="text-emerald-400" />;
      case 'ERRO':
        return <XCircle size={14} className="text-rose-400" />;
      case 'RETRY':
        return <RotateCcw size={14} className="text-amber-400" />;
      case 'AUTOCORRECAO':
        return <Wrench size={14} className="text-emerald-400" />;
      case 'INCIDENTE':
        return <AlertOctagon size={14} className="text-rose-400" />;
      default:
        return <Clock size={14} className="text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Clock size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Timeline Operacional & Correlation Explorer</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Rastreabilidade ponta a ponta por correlationId através de Meta, Google, TikTok, CAPI e workers.
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

        {/* Barra de Filtros e Busca */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/40 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchCorr}
              onChange={(e) => setSearchCorr(e.target.value)}
              placeholder="Buscar por correlationId, operação ou texto..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-purple-500 placeholder-slate-600 font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filtroOp}
              onChange={(e) => setFiltroOp(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-purple-500"
            >
              <option value="TODAS">Todas as Operações</option>
              <option value="CONEXAO">Conexão</option>
              <option value="TESTE">Teste</option>
              <option value="PUBLICACAO">Publicação</option>
              <option value="SYNC">Sincronização</option>
              <option value="TRACKING">Tracking / CAPI</option>
              <option value="ERRO">Erro</option>
              <option value="RETRY">Retry</option>
              <option value="AUTOCORRECAO">Autocorreção</option>
              <option value="INCIDENTE">Incidente</option>
            </select>

            <select
              value={filtroSev}
              onChange={(e) => setFiltroSev(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-purple-500"
            >
              <option value="TODAS">Todas Severidades</option>
              <option value="INFO">Info</option>
              <option value="BAIXA">Baixa</option>
              <option value="MEDIA">Média</option>
              <option value="ALTA">Alta</option>
              <option value="CRITICA">Crítica</option>
            </select>
          </div>
        </div>

        {/* Lista de Eventos da Timeline */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1 text-xs">
          {filteredEvents.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              Nenhum evento operacional encontrado para os filtros selecionados.
            </div>
          ) : (
            filteredEvents.map((ev) => (
              <div
                key={ev.id}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700">
                      {getOpIcon(ev.operation)}
                    </div>
                    <span className="font-bold text-white text-xs">{ev.title}</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {ev.operation}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(ev.timestamp).toLocaleString('pt-BR')}
                  </span>
                </div>

                <p className="text-slate-300 text-xs pl-8">{ev.description}</p>

                <div className="pt-2 pl-8 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span>Provedor: <strong className="text-slate-300">{ev.provider || 'EDDIE'}</strong></span>
                  </div>

                  <div className="flex items-center gap-1 font-mono text-purple-300">
                    <span className="text-slate-500">CID:</span>
                    <span>{ev.correlationId}</span>
                    <button
                      onClick={() => copyCorr(ev.correlationId)}
                      className="p-1 hover:text-white transition"
                      title="Copiar Correlation ID"
                    >
                      {copiedId === ev.correlationId ? (
                        <Check size={11} className="text-emerald-400" />
                      ) : (
                        <Copy size={11} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Exibindo <strong>{filteredEvents.length}</strong> de <strong>{events.length}</strong> eventos operacionais
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

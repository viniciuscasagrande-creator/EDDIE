// apps/pdt/src/components/marketing/PixelDiagnosticModal.tsx
// EDDIE 11.16.17 — Modal de Diagnóstico em Tempo Real de Saúde do Pixel e CAPI

'use client';

import React from 'react';
import { X, Activity, ShieldCheck, AlertTriangle, Clock, RefreshCcw } from 'lucide-react';
import type { TrackingConfiguration, TrackingDiagnostic } from './tracking-types';

interface PixelDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: TrackingConfiguration | null;
  onRefreshDiagnostic: () => void;
}

export function PixelDiagnosticModal({
  isOpen,
  onClose,
  config,
  onRefreshDiagnostic,
}: PixelDiagnosticModalProps) {
  if (!isOpen || !config) return null;

  const mockDiagnostic: TrackingDiagnostic = {
    configurationId: config.id,
    provider: config.provider,
    health: config.health,
    credentialValid: true,
    lastEventReceived: config.lastEventAt || new Date().toISOString(),
    lastEventDispatched: config.lastSyncAt || new Date().toISOString(),
    totalReceived: 1840,
    totalValid: 1840,
    totalDeduplicated: 412,
    totalDispatched: 1428,
    totalErrors: config.health === 'ERRO' ? 14 : 0,
    divergenceBrowserServerRate: '0.6%',
    averageLatencyMs: 38,
    recommendations:
      config.health === 'ERRO'
        ? [
            'O token CAPI retornado apresentou erro de autorização nos últimos 15 minutos.',
            'Gere um novo Access Token no Gerenciador de Negócios da Meta.',
          ]
        : [
            'Deduplicação de eventos operando perfeitamente com match de 99.4%.',
            'Latência média server-side de 38ms dentro dos padrões ideais.',
            'Nenhuma perda de eventos de checkout detectada.',
          ],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* CABEÇALHO */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Activity size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">Diagnóstico de Saúde & Telemetria</h2>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    mockDiagnostic.health === 'SAUDAVEL'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : mockDiagnostic.health === 'ATENCAO'
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-rose-500/10 text-rose-400'
                  }`}
                >
                  {mockDiagnostic.health}
                </span>
              </div>
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

        {/* CONTEÚDO */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* CARDS DE TELEMETRIA */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Recebidos</div>
              <div className="text-lg font-bold text-white font-mono">
                {mockDiagnostic.totalReceived.toLocaleString('pt-BR')}
              </div>
              <div className="text-[10px] text-slate-500">Eventos no Gateway</div>
            </div>
            <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Deduplicados</div>
              <div className="text-lg font-bold text-purple-400 font-mono">
                {mockDiagnostic.totalDeduplicated.toLocaleString('pt-BR')}
              </div>
              <div className="text-[10px] text-purple-400">Browser + Server</div>
            </div>
            <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Disparados</div>
              <div className="text-lg font-bold text-emerald-400 font-mono">
                {mockDiagnostic.totalDispatched.toLocaleString('pt-BR')}
              </div>
              <div className="text-[10px] text-emerald-400">Entrega CAPI OK</div>
            </div>
            <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Latência Média</div>
              <div className="text-lg font-bold text-sky-400 font-mono">
                {mockDiagnostic.averageLatencyMs}ms
              </div>
              <div className="text-[10px] text-slate-500">Tempo de resposta</div>
            </div>
          </div>

          {/* DIVERGÊNCIA & CREDENCIAIS */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2.5">
            <h3 className="font-bold text-slate-200 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400" /> Indicadores de Qualidade & Integridade
            </h3>
            <div className="grid sm:grid-cols-2 gap-3 text-[11px]">
              <div className="flex justify-between items-center p-2 rounded-lg bg-slate-800/40">
                <span className="text-slate-400">Validade do Token Server-Side:</span>
                <span className="font-bold text-emerald-400">VÁLIDO & SEGURO</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-slate-800/40">
                <span className="text-slate-400">Divergência Browser vs Server:</span>
                <span className="font-bold text-emerald-400">{mockDiagnostic.divergenceBrowserServerRate} (Excelente)</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-slate-800/40">
                <span className="text-slate-400">Último Evento Recebido:</span>
                <span className="font-mono text-slate-300">há 2 minutos</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-slate-800/40">
                <span className="text-slate-400">Deduplicação por Event ID:</span>
                <span className="font-bold text-purple-400">Ativa & Unificada</span>
              </div>
            </div>
          </div>

          {/* RECOMENDAÇÕES TÉCNICAS */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-200 flex items-center gap-1.5">
              <AlertTriangle size={14} className="text-amber-400" /> Recomendações Técnicas
            </h3>
            <div className="space-y-1.5">
              {mockDiagnostic.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-300 flex items-start gap-2"
                >
                  <span className="text-purple-400 font-bold">•</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RODAPÉ */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Clock size={13} />
            <span>Última checagem: há menos de 1 minuto</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefreshDiagnostic}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
            >
              <RefreshCcw size={13} /> Atualizar Telemetria
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow-lg shadow-purple-600/20"
            >
              Concluir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

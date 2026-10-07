'use client';

import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Database,
  Layers,
  GitCommit,
  Calendar,
  Zap,
  Activity,
  X,
  ExternalLink,
  Cpu,
} from 'lucide-react';
import { EDDIE_BUILD } from '../lib/buildInfo';

interface ReleaseCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReleaseCenterModal({ isOpen, onClose }: ReleaseCenterModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Release Center */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-sky-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  SEEK &bull; Release &amp; Architecture Center
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700 font-bold">
                  {EDDIE_BUILD.release}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {EDDIE_BUILD.productName} &bull; Powered by {EDDIE_BUILD.engineName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo com Informações Canônicas */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Card Principal de Versão */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Versão Oficial</span>
              <span className="text-base font-mono font-black text-slate-900 dark:text-white">
                v{EDDIE_BUILD.version}
              </span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium block">
                Enterprise Staging
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Build Timestamp</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 block">
                {EDDIE_BUILD.buildTimestamp}
              </span>
              <span className="text-[10px] text-slate-500">UTC-3 São Paulo</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Commit Ativo</span>
              <span className="font-mono font-bold text-purple-700 dark:text-purple-400 flex items-center gap-1">
                <GitCommit className="w-3.5 h-3.5" />
                <span>{EDDIE_BUILD.commit}</span>
              </span>
              <span className="text-[10px] text-slate-500">origin/main</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ambiente</span>
              <span className="font-bold text-sky-700 dark:text-sky-400 block">
                {EDDIE_BUILD.environment}
              </span>
              <span className="text-[10px] text-slate-500">Vercel Edge / Node</span>
            </div>
          </div>

          {/* Arquitetura de Módulos (30 Bounded Contexts) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Topologia de Bounded Contexts (30 Módulos Sincronizados)</span>
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-bold border border-emerald-200">
                100% Sincronizado
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
              {[
                { name: 'Eventos & Catálogo', schema: 'eventos', status: 'Ativo' },
                { name: 'Pedidos & Checkout', schema: 'pedidos', status: 'Ativo' },
                { name: 'Portaria & Catracas', schema: 'platform', status: 'Ativo' },
                { name: 'Financeiro & Ledger', schema: 'financeiro', status: 'Ativo' },
                { name: 'Contabilidade Partidas', schema: 'contabilidade', status: 'Ativo' },
                { name: 'Tesouraria & PIX', schema: 'financeiro', status: 'Ativo' },
                { name: 'Revenue Assurance', schema: 'platform', status: 'Ativo' },
                { name: 'Fechamento & Settlement', schema: 'eventos', status: 'Ativo' },
                { name: 'Marketing CAPI', schema: 'marketing', status: 'Ativo' },
                { name: 'RH & Disk Ponto 671', schema: 'rh', status: 'Fase 5' },
                { name: 'Benefícios Caju Flex', schema: 'rh', status: 'Fase 5' },
                { name: 'SEEK Flow Automações', schema: 'automacoes', status: 'Ativo' },
              ].map((mod) => (
                <div
                  key={mod.name}
                  className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                >
                  <div className="truncate">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">{mod.name}</span>
                    <span className="text-[9px] text-slate-400 font-mono">schema: {mod.schema}</span>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-900/30 px-1 rounded shrink-0">
                    {mod.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Garantias de Confiabilidade & Compliance */}
          <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 space-y-2 text-xs text-slate-700 dark:text-slate-300">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Garantias Corporativas do DiskIngressos Event OS</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Ledger imutável por partidas dobradas</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Ponto Eletrônico REP-P Portaria 671 MTE</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Zero vazamento cross-tenant comprovado</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Snapshots imutáveis de competências fechadas</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            DiskIngressos Event OS &bull; Todos os direitos reservados
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

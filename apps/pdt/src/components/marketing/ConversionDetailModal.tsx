// apps/pdt/src/components/marketing/ConversionDetailModal.tsx
// EDDIE 11.16.17 — Modal de Detalhamento de Conversão e Atribuição Server-Side

'use client';

import React from 'react';
import { X, ShieldCheck, DollarSign, GitBranch, CheckCheck } from 'lucide-react';
import type { ConversionRecord } from './tracking-types';

interface ConversionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversion: ConversionRecord | null;
}

export function ConversionDetailModal({
  isOpen,
  onClose,
  conversion,
}: ConversionDetailModalProps) {
  if (!isOpen || !conversion) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* CABEÇALHO */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">Auditoria da Conversão</h2>
                <span className="rounded-full bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                  SERVER CONFIRMED
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">Pedido: {conversion.orderId}</p>
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
          {/* VALOR & DATA */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[11px]">Valor Líquido da Conversão:</span>
              <div className="text-xl font-bold text-emerald-400 font-mono">
                {(conversion.valueCents / 100).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: conversion.currency || 'BRL',
                })}
              </div>
            </div>
            <div className="text-right">
              <span className="text-slate-400 text-[11px]">Timestamp:</span>
              <div className="font-mono text-slate-300">
                {new Date(conversion.timestamp).toLocaleString('pt-BR')}
              </div>
            </div>
          </div>

          {/* TOUCHPOINTS */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-200 flex items-center gap-1.5">
              <GitBranch size={14} className="text-sky-400" /> Touchpoints da Jornada de Compra
            </h3>
            <div className="relative pl-5 space-y-2.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {conversion.touchpoints.map((tp, idx) => (
                <div key={idx} className="relative flex items-center gap-2">
                  <div className="absolute -left-[17px] h-2.5 w-2.5 rounded-full bg-sky-500 border border-slate-900" />
                  <span className="text-slate-300 font-mono">{tp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* UTM & ATRIBUIÇÃO */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
            <div className="font-bold text-slate-300">Parâmetros UTM Atribuídos:</div>
            <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
              <div className="p-2 rounded bg-slate-800/40">
                <span className="text-slate-500 text-[9px] block">UTM_SOURCE</span>
                <span className="text-slate-200">{conversion.utmSource || 'direct'}</span>
              </div>
              <div className="p-2 rounded bg-slate-800/40">
                <span className="text-slate-500 text-[9px] block">UTM_MEDIUM</span>
                <span className="text-slate-200">{conversion.utmMedium || 'none'}</span>
              </div>
              <div className="p-2 rounded bg-slate-800/40">
                <span className="text-slate-500 text-[9px] block">UTM_CAMPAIGN</span>
                <span className="text-slate-200">{conversion.utmCampaign || 'organic'}</span>
              </div>
            </div>
          </div>

          {/* PROVEDORES ENTREGUES */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
            <div className="font-bold text-slate-300">Provedores Sincronizados com Deduplicação:</div>
            <div className="flex flex-wrap gap-1.5">
              {conversion.deliveredProviders.map((prov) => (
                <span
                  key={prov}
                  className="rounded px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold font-mono text-[10px]"
                >
                  {prov} · Entregue
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* RODAPÉ */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-emerald-400" />
            <span>Verificação server-side sem impacto no Ledger contábil</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

// apps/pdt/src/components/marketing/AttributionOrderModal.tsx
// EDDIE 11.16.19 — Modal de Visualização da Jornada Multi-Touch & Atribuição do Pedido

'use client';

import React, { useState } from 'react';
import {
  X,
  GitBranch,
  Calendar,
  DollarSign,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  Info,
} from 'lucide-react';
import type {
  OrderAttributionResult,
  AttributionModel,
} from './analytics-attribution-types';

interface AttributionOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderResult: OrderAttributionResult | null;
  onModelChange?: (newModel: AttributionModel) => void;
}

const formatBRL = (cents = 0) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

export default function AttributionOrderModal({
  isOpen,
  onClose,
  orderResult,
  onModelChange,
}: AttributionOrderModalProps) {
  const [selectedModel, setSelectedModel] = useState<AttributionModel>(
    orderResult?.modelUsed || 'LAST_NON_DIRECT'
  );

  if (!isOpen || !orderResult) return null;

  const handleSelectModel = (m: AttributionModel) => {
    setSelectedModel(m);
    if (onModelChange) {
      onModelChange(m);
    }
  };

  const models: Array<{ id: AttributionModel; label: string; desc: string }> = [
    { id: 'FIRST_TOUCH', label: 'First Touch', desc: '100% no canal originador' },
    { id: 'LAST_TOUCH', label: 'Last Touch', desc: '100% no último touchpoint' },
    { id: 'LAST_NON_DIRECT', label: 'Last Non-Direct', desc: '100% no último não-direto' },
    { id: 'LINEAR', label: 'Linear (1/N)', desc: 'Divisão equilibrada entre todos' },
    { id: 'POSITION_BASED', label: 'Position-Based (40-20-40)', desc: 'Primeiro e último recebem 40%' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-[#0f172a]/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <GitBranch className="text-indigo-400" size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Jornada Multi-Touch & Atribuição</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {orderResult.orderId}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Auditoria de canais, UTMs e créditos de conversão atribuídos.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Order Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total do Pedido</span>
              <div className="text-lg font-black text-emerald-400 font-mono mt-1">
                {formatBRL(orderResult.orderTotalCents)}
              </div>
              <span className="text-[10px] text-slate-400">Confirmado Server-Side</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Comprador</span>
              <div className="text-sm font-bold text-white font-mono mt-1 truncate">
                {orderResult.customerEmailMasked}
              </div>
              <span className="text-[10px] text-slate-400">LGPD Protegido</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Touchpoints Registrados</span>
              <div className="text-lg font-black text-sky-400 font-mono mt-1">
                {orderResult.touchpoints.length} pontos
              </div>
              <span className="text-[10px] text-slate-400">Sessões auditadas</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Data da Compra</span>
              <div className="text-xs font-semibold text-slate-300 font-mono mt-1.5 flex items-center gap-1">
                <Calendar size={12} className="text-slate-400" />
                {new Date(orderResult.purchasedAt).toLocaleDateString('pt-BR')} {new Date(orderResult.purchasedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <span className="text-[10px] text-slate-400">Timestamp UTC-3</span>
            </div>
          </div>

          {/* Model Selector Bar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Info size={14} className="text-indigo-400" />
                Simular Sob Outro Modelo de Atribuição:
              </span>
              <span className="text-[10px] text-slate-400">
                Modelo Ativo no Evento: <strong className="text-white">{orderResult.modelUsed}</strong>
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {models.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleSelectModel(m.id)}
                  className={`p-2.5 rounded-lg border text-left transition ${
                    selectedModel === m.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold">{m.label}</div>
                  <div className="text-[10px] opacity-75 truncate">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Touchpoints Ordered Timeline */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Linha do Tempo dos Touchpoints da Conversão
            </h3>
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {orderResult.touchpoints.map((tp, idx) => {
                const cred = orderResult.credits.find((c) => c.touchpointId === tp.id);
                const weightPct = cred ? Math.round(cred.weight * 100) : 0;
                const rev = cred?.attributedRevenueCents || 0;

                return (
                  <div key={tp.id} className="relative group">
                    {/* Bullet marker */}
                    <div className="absolute -left-[19px] top-3 w-3 h-3 rounded-full border-2 border-indigo-500 bg-slate-950 group-hover:scale-125 transition-transform" />

                    <div className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-800 text-slate-300">
                            #{idx + 1}
                          </span>
                          <span className="text-xs font-bold text-white">{tp.channel}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {tp.provider}
                          </span>
                          {tp.clickId && (
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                              {tp.clickId.substring(0, 14)}...
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {new Date(tp.occurredAt).toLocaleString('pt-BR')}
                        </div>
                      </div>

                      {/* Params & UTM */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Campanha:</span>
                          <span className="font-semibold text-slate-200">{tp.campaign}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Origem / Mídia:</span>
                          <span className="font-mono text-slate-300">{tp.source} / {tp.medium}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Sessão:</span>
                          <span className="font-mono text-slate-400">{tp.sessionId}</span>
                        </div>
                      </div>

                      {/* Credit Allocated */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-[11px]">Peso no modelo {selectedModel}:</span>
                          <span className="font-black text-indigo-300 font-mono">{weightPct}%</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400 text-[11px]">Receita Atribuída:</span>
                          <span className="font-black text-emerald-400 font-mono text-sm">{formatBRL(rev)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legal / Ledger Notice */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5">
            <ShieldAlert size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-200/90 leading-relaxed">
              <strong>Aviso de Conformidade:</strong> Esta atribuição é puramente analítica para otimização de campanhas e cálculo de ROAS. O valor integral do ingresso é repassado ao produtor via Ledger Financeiro sem alterações contábeis.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#0f172a] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
          >
            Fechar Visualização
          </button>
        </div>
      </div>
    </div>
  );
}

// apps/pdt/src/components/marketing/CampaignCompareModal.tsx
// EDDIE 11.16.19 — Modal de Comparador de Campanhas Lado a Lado com Alertas de Compatibilidade

'use client';

import React, { useState } from 'react';
import {
  X,
  Scale,
  AlertTriangle,
  Trophy,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  MousePointerClick,
  Eye,
} from 'lucide-react';
import type { CampaignPerformanceMetric } from './analytics-attribution-types';

interface CampaignCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaigns: CampaignPerformanceMetric[];
  initialSelectedIds?: string[];
}

const formatBRL = (cents = 0) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

export default function CampaignCompareModal({
  isOpen,
  onClose,
  campaigns,
  initialSelectedIds = [],
}: CampaignCompareModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialSelectedIds.length >= 2
      ? initialSelectedIds
      : campaigns.slice(0, 2).map((c) => c.campaignId)
  );

  if (!isOpen) return null;

  const toggleCampaign = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 2) {
        setSelectedIds(selectedIds.filter((item) => item !== id));
      }
    } else {
      if (selectedIds.length < 4) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  const compared = campaigns.filter((c) => selectedIds.includes(c.campaignId));

  // Avisos de compatibilidade
  const warnings: string[] = [];
  const hasPaused = compared.some((c) => c.status !== 'ATIVA');
  if (hasPaused) {
    warnings.push('Atenção: uma das campanhas selecionadas está com status pausado ou janela temporal divergente.');
  }

  const channelSets = compared.map((c) => c.channels.join(', '));
  if (new Set(channelSets).size > 1) {
    warnings.push('Nota Metodológica: As campanhas utilizam mix de canais distintos. Considere o CPA e ROAS relativos a cada audiência.');
  }

  // Identifica vencedores
  const bestRoas = [...compared].sort((a, b) => b.roas - a.roas)[0]?.campaignId;
  const bestCpa = [...compared].sort((a, b) => a.cpaCents - b.cpaCents)[0]?.campaignId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-[#0f172a]/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Scale className="text-purple-400" size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Comparador de Campanhas Lado a Lado</h2>
              <p className="text-xs text-slate-400">
                Selecione de 2 a 4 campanhas para contrastar investimento, ROAS, CPA e conversões.
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
          {/* Campaign Selector Pills */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Campanhas no Comparador ({compared.length}/4 selecionadas):
            </span>
            <div className="flex flex-wrap gap-2">
              {campaigns.map((camp) => {
                const isSelected = selectedIds.includes(camp.campaignId);
                return (
                  <button
                    key={camp.campaignId}
                    onClick={() => toggleCampaign(camp.campaignId)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-2 ${
                      isSelected
                        ? 'bg-purple-600/20 border-purple-500 text-purple-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    <span>{camp.campaignName}</span>
                    <span className="text-[10px] opacity-60">({camp.channels.join(', ')})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Warnings Banner */}
          {warnings.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
              {warnings.map((w, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-amber-300/90">
                  <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          )}

          {/* Side-by-Side Comparison Table */}
          <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-900/60 shadow-sm">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60">
                  <th className="p-4 text-slate-400 font-bold uppercase tracking-wider w-48">Métrica</th>
                  {compared.map((camp) => (
                    <th key={camp.campaignId} className="p-4 text-white font-bold">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate max-w-[200px]">{camp.campaignName}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            camp.status === 'ATIVA'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {camp.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                        {camp.channels.join(' · ')}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {/* ROAS */}
                <tr>
                  <td className="p-4 text-slate-400 font-sans font-semibold flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-purple-400" /> ROAS
                  </td>
                  {compared.map((camp) => (
                    <td key={camp.campaignId} className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-purple-400">{camp.roas.toFixed(2)}x</span>
                        {camp.campaignId === bestRoas && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                            <Trophy size={10} /> Melhor Retorno
                          </span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* CPA */}
                <tr>
                  <td className="p-4 text-slate-400 font-sans font-semibold flex items-center gap-1.5">
                    <DollarSign size={14} className="text-sky-400" /> CPA Médio
                  </td>
                  {compared.map((camp) => (
                    <td key={camp.campaignId} className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-sky-400">{formatBRL(camp.cpaCents)}</span>
                        {camp.campaignId === bestCpa && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 size={10} /> Mais Eficiente
                          </span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Investimento */}
                <tr>
                  <td className="p-4 text-slate-400 font-sans font-semibold">Investimento Total</td>
                  {compared.map((camp) => (
                    <td key={camp.campaignId} className="p-4 text-white font-bold">
                      {formatBRL(camp.investmentCents)}
                    </td>
                  ))}
                </tr>

                {/* Receita Atribuída */}
                <tr>
                  <td className="p-4 text-slate-400 font-sans font-semibold">Receita Atribuída</td>
                  {compared.map((camp) => (
                    <td key={camp.campaignId} className="p-4 text-emerald-400 font-black">
                      {formatBRL(camp.attributedRevenueCents)}
                    </td>
                  ))}
                </tr>

                {/* Conversões */}
                <tr>
                  <td className="p-4 text-slate-400 font-sans font-semibold">Ingressos Vendidos</td>
                  {compared.map((camp) => (
                    <td key={camp.campaignId} className="p-4 text-white font-bold">
                      {camp.conversions} ingressos
                    </td>
                  ))}
                </tr>

                {/* Cliques & CTR */}
                <tr>
                  <td className="p-4 text-slate-400 font-sans font-semibold flex items-center gap-1.5">
                    <MousePointerClick size={14} className="text-slate-400" /> Cliques & CTR
                  </td>
                  {compared.map((camp) => (
                    <td key={camp.campaignId} className="p-4 text-slate-300">
                      <div>{camp.clicks.toLocaleString('pt-BR')} cliques</div>
                      <div className="text-[11px] text-emerald-400 font-bold">{camp.ctr.toFixed(2)}% CTR</div>
                    </td>
                  ))}
                </tr>

                {/* Impressões */}
                <tr>
                  <td className="p-4 text-slate-400 font-sans font-semibold flex items-center gap-1.5">
                    <Eye size={14} className="text-slate-400" /> Impressões
                  </td>
                  {compared.map((camp) => (
                    <td key={camp.campaignId} className="p-4 text-slate-400">
                      {camp.impressions.toLocaleString('pt-BR')} visualizações
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#0f172a] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
          >
            Fechar Comparador
          </button>
        </div>
      </div>
    </div>
  );
}

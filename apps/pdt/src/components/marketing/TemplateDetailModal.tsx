'use client';

import React from 'react';
import {
  X,
  Zap,
  CheckCircle2,
  Copy,
  ArrowRight,
  Target,
  Share2,
  Users,
  Image as ImageIcon,
  FileText,
  Clock,
  Sparkles,
  DollarSign,
  TrendingUp,
  Info,
} from 'lucide-react';
import type { Provider } from '../../lib/marketing-actions/action-types';

export interface CampaignTemplate {
  id: string;
  titulo: string;
  categoria: string;
  objetivo: 'CONVERSAO' | 'RECONHECIMENTO' | 'TRAFEGO' | 'LEADS_VIP';
  canaisRecomendados: Provider[];
  canaisTexto: string;
  publicoAlvo: string;
  publicoTipo: 'INTERESSES' | 'LOOKALIKE' | 'VISITANTES' | 'LISTA_VIP_CRM' | 'RETARGETING_GERAL';
  estrategia: string;
  copySugerida: {
    headline: string;
    body: string;
    cta: string;
    formato: 'IMAGEM_UNICA' | 'CARROSSEL' | 'VIDEO_REELS' | 'AUDIO_SPOTIFY';
  };
  trackingSugerido: {
    source: string;
    medium: string;
    campaign: string;
    content: string;
  };
  roasEstimado: string;
  duracaoRecomendada: string;
  melhoresPraticas: string[];
}

interface TemplateDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: CampaignTemplate | null;
  onUseTemplate: (template: CampaignTemplate) => void;
  onDuplicateTemplate?: (template: CampaignTemplate) => void;
}

const PROVIDER_NAMES: Record<Provider, string> = {
  META: 'Meta Ads & Instagram',
  GOOGLE: 'Google Ads & Search',
  TIKTOK: 'TikTok Ads',
  SPOTIFY: 'Spotify Ads',
  WHATSAPP: 'WhatsApp Oficial',
  EMAIL: 'E-mail Marketing Hub',
};

export function TemplateDetailModal({
  isOpen,
  onClose,
  template,
  onUseTemplate,
  onDuplicateTemplate,
}: TemplateDetailModalProps) {
  if (!isOpen || !template) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Zap size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
                  {template.categoria}
                </span>
                <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-mono font-bold">
                  ROAS {template.roasEstimado}
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-1">{template.titulo}</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          {/* Estratégia */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Target size={13} className="text-purple-400" />
                Estratégia & Objetivo de Negócio
              </span>
              <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                <Clock size={12} /> Duração sugerida: {template.duracaoRecomendada}
              </span>
            </div>
            <p className="text-slate-200 text-xs leading-relaxed">{template.estrategia}</p>
          </div>

          {/* Grid: Canais e Público */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Share2 size={13} className="text-sky-400" />
                Canais Recomendados
              </span>
              <div className="flex flex-wrap gap-1.5">
                {template.canaisRecomendados.map((canal) => (
                  <span
                    key={canal}
                    className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-300 border border-sky-500/20 text-[11px] font-semibold flex items-center gap-1"
                  >
                    <CheckCircle2 size={11} className="text-sky-400" />
                    {PROVIDER_NAMES[canal] || canal}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Mix balanceado para maximizar cobertura e eficiência de conversão neste momento da venda.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Users size={13} className="text-emerald-400" />
                Segmentação de Público Sugerida
              </span>
              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 font-mono text-[11px] text-emerald-300">
                {template.publicoAlvo}
              </div>
              <div className="text-[10px] text-slate-500">
                Tipo do público: <span className="text-slate-300 font-semibold">{template.publicoTipo}</span>
              </div>
            </div>
          </div>

          {/* Copy e Formato do Criativo Sugerido */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ImageIcon size={13} className="text-amber-400" />
                Criativo & Copy Sugeridos
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono">
                {template.copySugerida.formato}
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="text-[12px] font-bold text-white flex items-center gap-2">
                <Sparkles size={13} className="text-amber-400" />
                <span>{template.copySugerida.headline}</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed italic">
                &ldquo;{template.copySugerida.body}&rdquo;
              </p>
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">Chamada para Ação (CTA):</span>
                <span className="px-2.5 py-1 rounded bg-purple-600/30 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                  {template.copySugerida.cta}
                </span>
              </div>
            </div>
          </div>

          {/* Tracking & UTM */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileText size={13} className="text-purple-400" />
              Tracking Padronizado Sugerido
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[10px]">
              <div className="p-2 rounded bg-slate-800/50 border border-slate-700/50">
                <span className="text-slate-500 block">utm_source</span>
                <span className="text-white font-bold">{template.trackingSugerido.source}</span>
              </div>
              <div className="p-2 rounded bg-slate-800/50 border border-slate-700/50">
                <span className="text-slate-500 block">utm_medium</span>
                <span className="text-white font-bold">{template.trackingSugerido.medium}</span>
              </div>
              <div className="p-2 rounded bg-slate-800/50 border border-slate-700/50">
                <span className="text-slate-500 block">utm_campaign</span>
                <span className="text-purple-300 font-bold">{template.trackingSugerido.campaign}</span>
              </div>
              <div className="p-2 rounded bg-slate-800/50 border border-slate-700/50">
                <span className="text-slate-500 block">utm_content</span>
                <span className="text-slate-300">{template.trackingSugerido.content}</span>
              </div>
            </div>
          </div>

          {/* Melhores Práticas */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Checklist de Melhores Práticas
            </span>
            <ul className="space-y-1.5">
              {template.melhoresPraticas.map((pratica, idx) => (
                <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-300">
                  <CheckCircle2 size={13} className="text-emerald-400 mt-0.5 shrink-0" />
                  <span>{pratica}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Aviso Operacional */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-start gap-2.5">
            <Info size={16} className="shrink-0 mt-0.5 text-amber-400" />
            <div>
              <strong className="font-semibold block text-amber-200">Acelerador de Campanha</strong>
              Este modelo pré-carrega textos, segmentação e canais recomendados. O orçamento diário,
              período de veiculação e seleção de criativos devem ser revisados no assistente antes da ativação.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/90">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold transition"
          >
            Fechar
          </button>
          <div className="flex items-center gap-2">
            {onDuplicateTemplate && (
              <button
                type="button"
                onClick={() => onDuplicateTemplate(template)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold flex items-center gap-1.5 transition"
              >
                <Copy size={13} />
                <span>Duplicar Modelo</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                onUseTemplate(template);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-2 transition shadow-lg shadow-purple-600/20"
            >
              <Zap size={14} />
              <span>Usar Modelo no Wizard</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

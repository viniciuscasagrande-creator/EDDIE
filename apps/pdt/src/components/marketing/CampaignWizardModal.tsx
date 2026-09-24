'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  Megaphone,
  Target,
  Share2,
  Users,
  Image as ImageIcon,
  DollarSign,
  Calendar,
  Link2,
  Sparkles,
  AlertTriangle,
  Layers,
  Zap,
  Globe,
  Music,
  Video,
  FileText,
  Info,
} from 'lucide-react';
import type { Provider } from '../../lib/marketing-actions/action-types';

export interface CampaignFormData {
  id?: string;
  nome: string;
  eventoId: string;
  eventoNome?: string;
  objetivo: 'CONVERSAO' | 'RECONHECIMENTO' | 'TRAFEGO' | 'LEADS_VIP';
  canais: Provider[];
  publicoTipo: 'INTERESSES' | 'LOOKALIKE' | 'VISITANTES' | 'LISTA_VIP_CRM' | 'RETARGETING_GERAL';
  publicoDetalhes: string;
  criativoTitulo: string;
  criativoCopy: string;
  criativoFormato: 'IMAGEM_UNICA' | 'CARROSSEL' | 'VIDEO_REELS' | 'AUDIO_SPOTIFY';
  criativoCta: string;
  orcamentoTipo: 'DIARIO' | 'TOTAL';
  orcamentoValorBrl: number;
  estrategiaLance: 'MENOR_CUSTO' | 'ROAS_ALVO';
  dataInicio: string;
  dataTermino: string;
  continuoAteVirada: boolean;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  pixelAssociado: string;
  status?: string;
}

interface CampaignWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDraft: (data: CampaignFormData) => void;
  onPublish: (data: CampaignFormData) => void;
  initialData?: Partial<CampaignFormData> | null;
  eventos: Array<{ id: string; nome: string }>;
  currentEventoId?: string | null;
}

const WIZARD_STEPS = [
  { id: 1, label: 'Evento & Nome', icon: <Megaphone size={14} /> },
  { id: 2, label: 'Objetivo', icon: <Target size={14} /> },
  { id: 3, label: 'Canais', icon: <Share2 size={14} /> },
  { id: 4, label: 'Público', icon: <Users size={14} /> },
  { id: 5, label: 'Criativo & Copy', icon: <ImageIcon size={14} /> },
  { id: 6, label: 'Orçamento', icon: <DollarSign size={14} /> },
  { id: 7, label: 'Período', icon: <Calendar size={14} /> },
  { id: 8, label: 'Tracking & UTM', icon: <Link2 size={14} /> },
  { id: 9, label: 'Revisão & Ativação', icon: <Sparkles size={14} /> },
];

export function CampaignWizardModal({
  isOpen,
  onClose,
  onSaveDraft,
  onPublish,
  initialData,
  eventos,
  currentEventoId,
}: CampaignWizardModalProps) {
  const [step, setStep] = useState(1);

  // Status de conexão das plataformas
  const integrationStatus: Record<Provider, { connected: boolean; label: string; details: string }> = {
    META: { connected: true, label: 'Meta Ads & Instagram', details: 'Conta @diskingressos conectada (Pixel & CAPI ativos)' },
    GOOGLE: { connected: true, label: 'Google Ads & Search', details: 'Conta MCC DiskIngressos conectada (Enhanced Conversions)' },
    SPOTIFY: { connected: true, label: 'Spotify Ads', details: 'Ad Studio ID #sp_ad_984102 conectado' },
    TIKTOK: { connected: false, label: 'TikTok Ads', details: 'Não conectado — requer vincular TikTok Business Center' },
    WHATSAPP: { connected: true, label: 'WhatsApp Cloud API', details: 'Número comercial oficial verificado' },
    EMAIL: { connected: true, label: 'E-mail Marketing Hub', details: 'Servidor transacional dedicado 99.2% entrega' },
  };

  const [formData, setFormData] = useState<CampaignFormData>({
    nome: '',
    eventoId: currentEventoId || (eventos[0]?.id ?? 'evento-operacao'),
    eventoNome: eventos.find((e) => e.id === currentEventoId)?.nome || eventos[0]?.nome || 'Festival DiskIngressos Live 2026',
    objetivo: 'CONVERSAO',
    canais: ['META', 'GOOGLE'],
    publicoTipo: 'LOOKALIKE',
    publicoDetalhes: 'Engajamento no Instagram nos últimos 90 dias + Lookalike 1% de compradores',
    criativoTitulo: 'Garanta seu Lote Promocional — Vendas Abertas!',
    criativoCopy: 'Não fique de fora do maior festival do ano. Parcele em até 12x no cartão ou pague via PIX.',
    criativoFormato: 'IMAGEM_UNICA',
    criativoCta: 'Comprar Ingressos',
    orcamentoTipo: 'DIARIO',
    orcamentoValorBrl: 150,
    estrategiaLance: 'MENOR_CUSTO',
    dataInicio: new Date().toISOString().split('T')[0] ?? '',
    dataTermino: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0] ?? '',
    continuoAteVirada: true,
    utmSource: 'meta',
    utmMedium: 'feed_stories',
    utmCampaign: 'lote1_lancamento',
    utmContent: 'carrossel_atracoes',
    pixelAssociado: 'pix_meta_live26_01 (Multi-Pixel DiskIngressos)',
  });

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        eventoId: initialData.eventoId || prev.eventoId,
        eventoNome: initialData.eventoNome || prev.eventoNome,
      }));
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 9) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const toggleCanal = (canal: Provider) => {
    if (!integrationStatus[canal].connected) {
      return; // Bloqueado por não estar conectado
    }
    setFormData((prev) => {
      const exists = prev.canais.includes(canal);
      if (exists) {
        if (prev.canais.length === 1) return prev; // manter ao menos 1
        return { ...prev, canais: prev.canais.filter((c) => c !== canal) };
      }
      return { ...prev, canais: [...prev.canais, canal] };
    });
  };

  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* CABEÇALHO */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Megaphone size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Criador de Campanhas Multicanais</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Passo {step} de 9
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Configure públicos, canais, criativos e orçamentos integrados diretamente aos provedores de anúncios.
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

        {/* BARRA DE PROGRESSO EM ETAPAS */}
        <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-950/40 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            {WIZARD_STEPS.map((s) => (
              <button
                key={s.id}
                onClick={() => setStep(s.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                  step === s.id
                    ? 'bg-purple-600 text-white shadow-sm'
                    : step > s.id
                    ? 'bg-purple-950/50 text-purple-300 border border-purple-800/50'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {step > s.id ? <Check size={12} className="text-emerald-400" /> : s.icon}
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* CORPO DO FORMULÁRIO DO PASSO */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* PASSO 1: EVENTO & NOME */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Identificação da Campanha</h3>
                <p className="text-xs text-slate-400">Selecione o evento de destino e defina o identificador operacional.</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Evento Vinculado</label>
                <select
                  value={formData.eventoId}
                  onChange={(e) => {
                    const sel = eventos.find((ev) => ev.id === e.target.value);
                    setFormData({ ...formData, eventoId: e.target.value, eventoNome: sel?.nome || '' });
                  }}
                  className="w-full mt-1.5 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  {eventos.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.nome} ({ev.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Nome Interno da Campanha</label>
                <input
                  type="text"
                  placeholder="Ex: [Lote 1] Lançamento Geral · Feed + Stories + Google Search"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full mt-1.5 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="p-3 bg-purple-950/20 border border-purple-900/30 rounded-xl text-xs text-purple-300 flex items-start gap-2">
                <Info size={16} className="shrink-0 mt-0.5" />
                <span>
                  O nome será replicado nos canais selecionados com o prefixo <b>[EDDIE-{formData.eventoId}]</b> para conciliação automática com o módulo Financeiro.
                </span>
              </div>
            </div>
          )}

          {/* PASSO 2: OBJETIVO */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Objetivo de Marketing</h3>
                <p className="text-xs text-slate-400">Qual é a principal meta de conversão para esta régua de tráfego?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  {
                    id: 'CONVERSAO',
                    titulo: 'Venda de Ingressos (Conversão Direta)',
                    desc: 'Otimização com foco em Purchase/Checkout completo para maximizar ROAS imediato.',
                    tag: 'Recomendado',
                  },
                  {
                    id: 'RECONHECIMENTO',
                    titulo: 'Alcance & Reconhecimento de Marca',
                    desc: 'Atingir o maior número de fãs de música na região metropolitana do evento.',
                    tag: 'Topo de Funil',
                  },
                  {
                    id: 'TRAFEGO',
                    titulo: 'Tráfego para a Página do Evento',
                    desc: 'Levar usuários qualificados para visualizarem setores, lotes e atrações.',
                    tag: 'Consideração',
                  },
                  {
                    id: 'LEADS_VIP',
                    titulo: 'Lista VIP & Cadastro Pré-venda (Lote Zero)',
                    desc: 'Capturar WhatsApp e e-mail com consentimento LGPD para lançamento antecipado.',
                    tag: 'Pré-lançamento',
                  },
                ].map((obj) => (
                  <button
                    key={obj.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, objetivo: obj.id as any })}
                    className={`text-left p-4 rounded-xl border transition flex flex-col justify-between ${
                      formData.objetivo === obj.id
                        ? 'bg-purple-950/40 border-purple-500 shadow-md shadow-purple-900/20'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{obj.titulo}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-mono font-bold">
                          {obj.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2">{obj.desc}</p>
                    </div>
                    {formData.objetivo === obj.id && (
                      <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                        <Check size={14} /> Selecionado
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PASSO 3: CANAIS & INTEGRAÇÕES */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Canais & Provedores Conectados</h3>
                <p className="text-xs text-slate-400">
                  Somente plataformas com integração ativa podem ser selecionadas para entrega automatizada.
                </p>
              </div>

              <div className="space-y-2.5">
                {(['META', 'GOOGLE', 'SPOTIFY', 'TIKTOK', 'WHATSAPP', 'EMAIL'] as Provider[]).map((canal) => {
                  const status = integrationStatus[canal];
                  const isSelected = formData.canais.includes(canal);

                  return (
                    <div
                      key={canal}
                      className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                        !status.connected
                          ? 'bg-slate-950/40 border-slate-900 opacity-60'
                          : isSelected
                          ? 'bg-purple-950/30 border-purple-500/80'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          disabled={!status.connected}
                          checked={isSelected}
                          onChange={() => toggleCanal(canal)}
                          className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-purple-600 focus:ring-purple-500"
                        />
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            <span>{status.label}</span>
                            {status.connected ? (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                                Conectado
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 text-[10px] font-bold">
                                Indisponível (Desconectado)
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400">{status.details}</p>
                        </div>
                      </div>

                      <div>
                        {status.connected ? (
                          <button
                            type="button"
                            onClick={() => toggleCanal(canal)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                              isSelected
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {isSelected ? 'Ativo na Campanha' : 'Ativar Canal'}
                          </button>
                        ) : (
                          <span className="text-[11px] font-mono text-slate-500">Requer conexão na aba Integrações</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PASSO 4: PÚBLICO */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Definição do Público-Alvo</h3>
                <p className="text-xs text-slate-400">Escolha a base de dados para a entrega dos anúncios.</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Tipo de Segmentação</label>
                <select
                  value={formData.publicoTipo}
                  onChange={(e) => setFormData({ ...formData, publicoTipo: e.target.value as any })}
                  className="w-full mt-1.5 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="LOOKALIKE">Lookalike 1% de Compradores Históricos (Alta Propensão)</option>
                  <option value="VISITANTES">Visitantes do Site & Pixel nos últimos 30 dias (Retargeting)</option>
                  <option value="LISTA_VIP_CRM">Base de Clientes Anteriores do Produtor (CRM DiskIngressos)</option>
                  <option value="INTERESSES">Interesses Musicais + Comportamento de Compra de Shows</option>
                  <option value="RETARGETING_GERAL">Público de Alta Frequência (2+ Visitas sem compra)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Critérios / Parâmetros do Público</label>
                <textarea
                  rows={3}
                  value={formData.publicoDetalhes}
                  onChange={(e) => setFormData({ ...formData, publicoDetalhes: e.target.value })}
                  placeholder="Descreva faixas etárias, localidades e exclusões de quem já comprou..."
                  className="w-full mt-1.5 bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase">Alcance Estimado</span>
                  <div className="text-base font-bold text-white mt-1">128.000 — 184.000 pessoas</div>
                </div>
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase">Exclusão Automática</span>
                  <div className="text-xs font-semibold text-emerald-400 mt-1">✓ Compradores com pedido aprovado</div>
                </div>
              </div>
            </div>
          )}

          {/* PASSO 5: CRIATIVO & COPY */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Criativo, Copy & Chamada para Ação</h3>
                <p className="text-xs text-slate-400">Configure as mensagens visuais e textuais veiculadas nos canais.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Formato do Anúncio</label>
                  <select
                    value={formData.criativoFormato}
                    onChange={(e) => setFormData({ ...formData, criativoFormato: e.target.value as any })}
                    className="w-full mt-1.5 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="IMAGEM_UNICA">Imagem Única (Banner Oficial do Lote 1080x1080 / 1080x1920)</option>
                    <option value="CARROSSEL">Carrossel Dinâmico de Setores (Pista, Camarote, VIP)</option>
                    <option value="VIDEO_REELS">Vídeo Teaser (Reels / TikTok 9:16)</option>
                    <option value="AUDIO_SPOTIFY">Spot de Áudio Oficial Spotify (30s com Companion Banner)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Botão de Ação (CTA)</label>
                  <select
                    value={formData.criativoCta}
                    onChange={(e) => setFormData({ ...formData, criativoCta: e.target.value })}
                    className="w-full mt-1.5 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Comprar Ingressos">Comprar Ingressos</option>
                    <option value="Garantir Lugar">Garantir Lugar</option>
                    <option value="Ver Lotes">Ver Lotes</option>
                    <option value="Cadastre-se na Pré-venda">Cadastre-se na Pré-venda</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Título Principal do Anúncio</label>
                <input
                  type="text"
                  value={formData.criativoTitulo}
                  onChange={(e) => setFormData({ ...formData, criativoTitulo: e.target.value })}
                  className="w-full mt-1.5 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Texto do Anúncio (Copywriting)</label>
                <textarea
                  rows={3}
                  value={formData.criativoCopy}
                  onChange={(e) => setFormData({ ...formData, criativoCopy: e.target.value })}
                  className="w-full mt-1.5 bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          )}

          {/* PASSO 6: ORÇAMENTO */}
          {step === 6 && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Orçamento & Estratégia de Lance</h3>
                <p className="text-xs text-slate-400">Defina o teto de investimento e a estratégia de entrega.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Tipo de Orçamento</label>
                  <div className="flex gap-2 mt-1.5">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, orcamentoTipo: 'DIARIO' })}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                        formData.orcamentoTipo === 'DIARIO'
                          ? 'bg-purple-600 text-white border-purple-500'
                          : 'bg-slate-900 text-slate-400 border-slate-700'
                      }`}
                    >
                      Diário
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, orcamentoTipo: 'TOTAL' })}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                        formData.orcamentoTipo === 'TOTAL'
                          ? 'bg-purple-600 text-white border-purple-500'
                          : 'bg-slate-900 text-slate-400 border-slate-700'
                      }`}
                    >
                      Total da Campanha
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">
                    Valor do Orçamento ({formData.orcamentoTipo === 'DIARIO' ? 'R$ / dia' : 'R$ Total'})
                  </label>
                  <input
                    type="number"
                    min={10}
                    step={10}
                    value={formData.orcamentoValorBrl}
                    onChange={(e) => setFormData({ ...formData, orcamentoValorBrl: Number(e.target.value) })}
                    className="w-full mt-1.5 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                <span className="text-xs font-bold text-white">Estratégia de Distribuição Inteligente</span>
                <p className="text-[11px] text-slate-400">
                  O motor de entrega balanceará automaticamente o orçamento entre os canais selecionados ({formData.canais.join(', ')}) priorizando o canal com menor CPA por ingresso vendido.
                </p>
              </div>
            </div>
          )}

          {/* PASSO 7: PERÍODO */}
          {step === 7 && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Período de Veiculação</h3>
                <p className="text-xs text-slate-400">Quando a campanha deverá iniciar e parar de entregar?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Data de Início</label>
                  <input
                    type="date"
                    value={formData.dataInicio}
                    onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                    className="w-full mt-1.5 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Data de Término</label>
                  <input
                    type="date"
                    value={formData.dataTermino}
                    onChange={(e) => setFormData({ ...formData, dataTermino: e.target.value })}
                    className="w-full mt-1.5 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl">
                <input
                  type="checkbox"
                  id="viradaLote"
                  checked={formData.continuoAteVirada}
                  onChange={(e) => setFormData({ ...formData, continuoAteVirada: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="viradaLote" className="text-xs text-slate-300">
                  <b>Pausar automaticamente na virada de lote:</b> interrompe os anúncios assim que a sessão esgotar o lote atual.
                </label>
              </div>
            </div>
          )}

          {/* PASSO 8: TRACKING & UTM */}
          {step === 8 && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Parâmetros UTM & Multi-Pixel</h3>
                <p className="text-xs text-slate-400">Atribuição de vendas no checkout e rastreamento Server-Side.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">utm_source</label>
                  <input
                    type="text"
                    value={formData.utmSource}
                    onChange={(e) => setFormData({ ...formData, utmSource: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">utm_medium</label>
                  <input
                    type="text"
                    value={formData.utmMedium}
                    onChange={(e) => setFormData({ ...formData, utmMedium: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">utm_campaign</label>
                  <input
                    type="text"
                    value={formData.utmCampaign}
                    onChange={(e) => setFormData({ ...formData, utmCampaign: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">utm_content</label>
                  <input
                    type="text"
                    value={formData.utmContent}
                    onChange={(e) => setFormData({ ...formData, utmContent: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase">Pixel Vinculado</span>
                <div className="text-xs font-mono text-purple-300">{formData.pixelAssociado}</div>
                <div className="text-[10px] text-emerald-400">✓ Conversions API (CAPI) Server-Side Ativo</div>
              </div>
            </div>
          )}

          {/* PASSO 9: REVISÃO & ATIVAÇÃO */}
          {step === 9 && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Revisão Geral da Campanha</h3>
                <p className="text-xs text-slate-400">Verifique os parâmetros configurados antes de salvar ou publicar.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Identificação</span>
                  <div className="font-bold text-white">{formData.nome || 'Campanha sem nome'}</div>
                  <div className="text-slate-400">Evento: <span className="text-purple-300 font-semibold">{formData.eventoNome}</span></div>
                  <div className="text-slate-400">Objetivo: <span className="text-emerald-400 font-bold">{formData.objetivo}</span></div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Canais & Formato</span>
                  <div className="flex flex-wrap gap-1">
                    {formData.canais.map((c) => (
                      <span key={c} className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-bold">
                        {c}
                      </span>
                    ))}
                  </div>
                  <div className="text-slate-400">Formato: <span className="text-slate-200">{formData.criativoFormato}</span></div>
                  <div className="text-slate-400">CTA: <span className="text-slate-200 font-semibold">{formData.criativoCta}</span></div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Orçamento & Período</span>
                  <div className="text-base font-bold font-mono text-emerald-400">
                    {formatBRL(formData.orcamentoValorBrl)} / {formData.orcamentoTipo === 'DIARIO' ? 'dia' : 'total'}
                  </div>
                  <div className="text-slate-400">De {formData.dataInicio} até {formData.dataTermino}</div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Tracking & UTM</span>
                  <div className="font-mono text-slate-300 text-[11px] truncate">
                    utm_source={formData.utmSource}&utm_campaign={formData.utmCampaign}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-semibold">✓ Multi-Pixel e CAPI habilitados</div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Preview do Anúncio</span>
                <div className="text-xs font-bold text-white">{formData.criativoTitulo}</div>
                <div className="text-[11px] text-slate-300">{formData.criativoCopy}</div>
              </div>
            </div>
          )}
        </div>

        {/* RODAPÉ DE NAVEGAÇÃO & AÇÕES */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
              >
                <ChevronLeft size={14} /> Voltar
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onSaveDraft(formData);
                onClose();
              }}
              className="px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
            >
              Salvar Rascunho
            </button>

            {step < 9 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/20 transition"
              >
                <span>Avançar</span>
                <ChevronRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onPublish(formData);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition"
              >
                <Zap size={14} /> Publicar Campanha Imediatamente
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

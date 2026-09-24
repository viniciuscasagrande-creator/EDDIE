'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, Link2, Copy, Check, Sparkles, Globe, Download, Save } from 'lucide-react';

export interface UtmData {
  id: string;
  nome: string;
  eventoId: string;
  canal: string;
  source: string;
  medium: string;
  campaign: string;
  content: string;
  term?: string;
  urlDestino: string;
  urlFinal: string;
  visitas: number;
  carrinhos: number;
  checkouts: number;
  compras: number;
  taxaConversao: string;
  receitaCents: number;
  ticketMedioCents: number;
  status: 'ATIVO' | 'ARQUIVADO';
  criadoEm: string;
}

interface UtmManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (utm: UtmData) => void;
  initialData?: Partial<UtmData> | null;
  eventos: Array<{ id: string; nome: string }>;
  currentEventoId?: string | null;
  mode?: 'create' | 'edit' | 'duplicate';
}

export function UtmManagementModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  eventos,
  currentEventoId,
  mode = 'create',
}: UtmManagementModalProps) {
  const [eventoId, setEventoId] = useState(currentEventoId || eventos[0]?.id || 'evento-operacao');
  const [nome, setNome] = useState('');
  const [canal, setCanal] = useState('Instagram Ads');
  const [source, setSource] = useState('instagram');
  const [medium, setMedium] = useState('stories');
  const [campaign, setCampaign] = useState('lote1_lancamento');
  const [content, setContent] = useState('teaser_video');
  const [term, setTerm] = useState('');
  const [urlDestino, setUrlDestino] = useState('https://newdawn.diskingressos.com.br/evento/festival-live-2026');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialData) {
      setNome(initialData.nome || '');
      setEventoId(initialData.eventoId || currentEventoId || eventos[0]?.id || 'evento-operacao');
      setCanal(initialData.canal || 'Instagram Ads');
      setSource(initialData.source || 'instagram');
      setMedium(initialData.medium || 'stories');
      setCampaign(initialData.campaign || 'lote1_lancamento');
      setContent(initialData.content || 'teaser_video');
      setTerm(initialData.term || '');
      setUrlDestino(initialData.urlDestino || 'https://newdawn.diskingressos.com.br/evento/festival-live-2026');
    } else {
      setNome('');
      setSource('instagram');
      setMedium('stories');
      setCampaign('lote1_lancamento');
      setContent('teaser_video');
      setTerm('');
    }
  }, [initialData, currentEventoId, eventos, isOpen]);

  const urlFinal = useMemo(() => {
    try {
      const u = new URL(urlDestino || 'https://newdawn.diskingressos.com.br');
      if (source) u.searchParams.set('utm_source', source);
      if (medium) u.searchParams.set('utm_medium', medium);
      if (campaign) u.searchParams.set('utm_campaign', campaign);
      if (content) u.searchParams.set('utm_content', content);
      if (term) u.searchParams.set('utm_term', term);
      return u.toString();
    } catch {
      return `${urlDestino}?utm_source=${source}&utm_medium=${medium}&utm_campaign=${campaign}&utm_content=${content}`;
    }
  }, [urlDestino, source, medium, campaign, content, term]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard?.writeText(urlFinal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalId =
      mode === 'create' || mode === 'duplicate'
        ? `utm-${Date.now()}`
        : initialData?.id || `utm-${Date.now()}`;

    const newUtm: UtmData = {
      id: finalId,
      nome: nome || `${source} · ${campaign}`,
      eventoId,
      canal,
      source,
      medium,
      campaign,
      content,
      term,
      urlDestino,
      urlFinal,
      visitas: initialData?.visitas || 0,
      carrinhos: initialData?.carrinhos || 0,
      checkouts: initialData?.checkouts || 0,
      compras: initialData?.compras || 0,
      taxaConversao: initialData?.taxaConversao || '0.0%',
      receitaCents: initialData?.receitaCents || 0,
      ticketMedioCents: initialData?.ticketMedioCents || 0,
      status: initialData?.status || 'ATIVO',
      criadoEm: initialData?.criadoEm || new Date().toISOString(),
    };

    onSave(newUtm);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
        {/* CABEÇALHO */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Link2 size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>
                  {mode === 'create' ? 'Criar Nova URL Rastreável (UTM)' : mode === 'edit' ? 'Editar Parâmetros UTM' : 'Duplicar URL Rastreável'}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Gere links com parâmetros padronizados para atribuição precisa de conversões e ROI.
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

        {/* FORMULÁRIO */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
          <div>
            <label className="text-xs font-semibold text-slate-300">Nome de Identificação da URL</label>
            <input
              type="text"
              placeholder="Ex: Stories Artista X · Lançamento Oficial"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full mt-1.5 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300">Evento de Destino</label>
              <select
                value={eventoId}
                onChange={(e) => setEventoId(e.target.value)}
                className="w-full mt-1.5 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                {eventos.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Canal de Origem</label>
              <select
                value={canal}
                onChange={(e) => {
                  setCanal(e.target.value);
                  const map: Record<string, { s: string; m: string }> = {
                    'Instagram Ads': { s: 'instagram', m: 'stories' },
                    'Facebook Ads': { s: 'facebook', m: 'feed' },
                    'Google Search': { s: 'google', m: 'cpc' },
                    'TikTok Ads': { s: 'tiktok', m: 'spark_ads' },
                    'Spotify Ads': { s: 'spotify', m: 'audio_ads' },
                    'WhatsApp Oficial': { s: 'whatsapp', m: 'direct_msg' },
                    'E-mail Marketing': { s: 'newsletter', m: 'email' },
                    'Influenciador / Promoter': { s: 'influencer', m: 'parceria' },
                  };
                  if (map[e.target.value]) {
                    setSource(map[e.target.value]!.s);
                    setMedium(map[e.target.value]!.m);
                  }
                }}
                className="w-full mt-1.5 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="Instagram Ads">Instagram Ads</option>
                <option value="Facebook Ads">Facebook Ads</option>
                <option value="Google Search">Google Search</option>
                <option value="TikTok Ads">TikTok Ads</option>
                <option value="Spotify Ads">Spotify Ads</option>
                <option value="WhatsApp Oficial">WhatsApp Oficial</option>
                <option value="E-mail Marketing">E-mail Marketing</option>
                <option value="Influenciador / Promoter">Influenciador / Promoter</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">URL Destino (Página do Evento no Storefront)</label>
            <input
              type="url"
              value={urlDestino}
              onChange={(e) => setUrlDestino(e.target.value)}
              className="w-full mt-1.5 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">utm_source *</label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">utm_medium *</label>
              <input
                type="text"
                value={medium}
                onChange={(e) => setMedium(e.target.value)}
                className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">utm_campaign *</label>
              <input
                type="text"
                value={campaign}
                onChange={(e) => setCampaign(e.target.value)}
                className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">utm_content</label>
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">utm_term (Opcional - Palavras-chave ou público)</label>
            <input
              type="text"
              placeholder="Ex: ingressos_curitiba, lookalike_1pct"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
            />
          </div>

          {/* PREVIEW DA URL FINAL */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Preview da URL Rastreável Gerada</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={urlFinal}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-purple-300 select-all"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shrink-0"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* RODAPÉ */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/20 transition"
            >
              <Save size={14} /> Salvar URL Rastreável
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

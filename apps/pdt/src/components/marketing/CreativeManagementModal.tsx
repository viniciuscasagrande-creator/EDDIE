'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Layers,
  Sparkles,
  Eye,
  Check,
  Save,
  Copy,
  ExternalLink,
  Target,
  Music2,
  MessageCircle,
  Mail,
  Activity,
  AlertCircle,
  Sliders,
} from 'lucide-react';
import type { Creative, CreativeType, CreativeFormat } from './creative-types';

interface CreativeManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (creative: Creative) => void;
  initialData?: Partial<Creative> | null;
  mode?: 'create' | 'edit' | 'preview';
  eventos: Array<{ id: string; nome: string }>;
  currentEventoId?: string | null;
  onUseInCampaign?: (creative: Creative) => void;
}

export function CreativeManagementModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode = 'create',
  eventos,
  currentEventoId,
  onUseInCampaign,
}: CreativeManagementModalProps) {
  const [nome, setNome] = useState(initialData?.nome || '');
  const [eventoId, setEventoId] = useState(initialData?.eventoId || currentEventoId || eventos[0]?.id || 'evento-operacao');
  const [tipo, setTipo] = useState<CreativeType>(initialData?.tipo || 'IMAGEM');
  const [formato, setFormato] = useState<CreativeFormat>(initialData?.formato || 'FEED_1_1');
  const [canais, setCanais] = useState<Array<'META' | 'GOOGLE' | 'TIKTOK' | 'SPOTIFY' | 'WHATSAPP' | 'EMAIL'>>(
    initialData?.canais || ['META', 'GOOGLE']
  );
  const [headline, setHeadline] = useState(initialData?.headline || initialData?.titulo || '');
  const [texto, setTexto] = useState(initialData?.texto || '');
  const [cta, setCta] = useState(initialData?.cta || 'Comprar Ingressos');
  const [destinationUrl, setDestinationUrl] = useState(
    initialData?.destinationUrl || 'https://newdawn.diskingressos.com.br/evento/festival-live-2026'
  );
  const [assetUrl, setAssetUrl] = useState(initialData?.assetUrl || '');
  const [tagsInput, setTagsInput] = useState(initialData?.tags?.join(', ') || 'lancamento, line-up, promocional');
  const [previewChannel, setPreviewChannel] = useState<'META' | 'GOOGLE' | 'TIKTOK' | 'SPOTIFY' | 'WHATSAPP'>('META');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialData) {
      setNome(initialData.nome || '');
      setEventoId(initialData.eventoId || currentEventoId || eventos[0]?.id || 'evento-operacao');
      setTipo(initialData.tipo || 'IMAGEM');
      setFormato(initialData.formato || 'FEED_1_1');
      setCanais(initialData.canais || ['META', 'GOOGLE']);
      setHeadline(initialData.headline || initialData.titulo || '');
      setTexto(initialData.texto || '');
      setCta(initialData.cta || 'Comprar Ingressos');
      setDestinationUrl(initialData.destinationUrl || 'https://newdawn.diskingressos.com.br');
      setAssetUrl(initialData.assetUrl || '');
      setTagsInput(initialData.tags?.join(', ') || 'geral');
    }
  }, [initialData, currentEventoId, eventos]);

  if (!isOpen) return null;

  const toggleCanal = (c: 'META' | 'GOOGLE' | 'TIKTOK' | 'SPOTIFY' | 'WHATSAPP' | 'EMAIL') => {
    setCanais((prev) => (prev.includes(c) ? prev.filter((item) => item !== c) : [...prev, c]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const saved: Creative = {
      id: initialData?.id || `cria-${Date.now()}`,
      eventoId,
      eventoNome: eventos.find((ev) => ev.id === eventoId)?.nome || 'Festival DiskIngressos',
      nome: nome || 'Criativo Sem Título',
      tipo,
      formato,
      canais: canais.length > 0 ? canais : ['META'],
      headline,
      titulo: headline,
      texto,
      cta,
      destinationUrl,
      assetUrl: assetUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
      tags,
      status: 'ATIVO',
      campanhasVinculadasCount: initialData?.campanhasVinculadasCount || 1,
      criadoEm: initialData?.criadoEm || new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };

    onSave(saved);
    onClose();
  };

  const handleCopyCopy = () => {
    navigator.clipboard.writeText(`${headline}\n\n${texto}\n\n👉 ${destinationUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-[#111827] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <ImageIcon size={18} />
            </div>
            <div>
              <h2 className="text-base font-black text-white">
                {mode === 'edit'
                  ? 'Editar Criativo de Mídia'
                  : mode === 'preview'
                  ? 'Pré-visualização do Criativo nos Canais'
                  : 'Novo Criativo para Campanhas'}
              </h2>
              <p className="text-xs text-slate-400">
                Cadastro centralizado de imagens, vídeos, áudios e copies para Meta, Google, TikTok, Spotify e WhatsApp.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body com 2 Colunas (Configuração e Preview em tempo real) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
          {/* Coluna de Configuração */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 p-6 space-y-4 border-r border-slate-800/80">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Nome do Criativo</label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Teaser Line-up Principal · Stories Instagram"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Evento</label>
                <select
                  value={eventoId}
                  onChange={(e) => setEventoId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  {eventos.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Tipo de Mídia</label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as CreativeType)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="IMAGEM">Imagem (Estática / Carrossel)</option>
                  <option value="VIDEO">Vídeo (Reels / TikTok / Shorts)</option>
                  <option value="AUDIO">Áudio Spot (Spotify Ads)</option>
                  <option value="TEXTO">Texto Puro (WhatsApp / E-mail)</option>
                  <option value="COMBINADO">Combinado Multimídia</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Formato de Exibição</label>
                <select
                  value={formato}
                  onChange={(e) => setFormato(e.target.value as CreativeFormat)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="FEED_1_1">Quadrado 1:1 (Feed Instagram/Facebook)</option>
                  <option value="STORIES_REELS_9_16">Vertical 9:16 (Stories, Reels, TikTok)</option>
                  <option value="BANNER_16_9">Horizontal 16:9 (Display Google / Banner)</option>
                  <option value="AUDIO_SPOT_30S">Spot de Áudio 30s (Spotify Ads)</option>
                  <option value="TEXT_COPY">Texto / Mensagem Interativa</option>
                  <option value="CARROSSEL_MULTI">Carrossel Multicard</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Chamada para Ação (CTA)</label>
                <input
                  type="text"
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                  placeholder="Ex: Comprar Ingressos, Saiba Mais"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Seleção de Canais Suportados */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Canais Suportados por este Criativo</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'META', label: 'Meta Ads', icon: <Target size={12} /> },
                  { id: 'GOOGLE', label: 'Google Search/Display', icon: <Activity size={12} /> },
                  { id: 'TIKTOK', label: 'TikTok Ads', icon: <Activity size={12} /> },
                  { id: 'SPOTIFY', label: 'Spotify Ads', icon: <Music2 size={12} /> },
                  { id: 'WHATSAPP', label: 'WhatsApp', icon: <MessageCircle size={12} /> },
                  { id: 'EMAIL', label: 'E-mail', icon: <Mail size={12} /> },
                ].map((item) => {
                  const active = canais.includes(item.id as any);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleCanal(item.id as any)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition ${
                        active
                          ? 'bg-purple-600/20 border-purple-500/50 text-purple-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Título / Headline Principal</label>
              <input
                type="text"
                required
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Ex: O Maior Festival do Ano Está de Volta!"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Texto do Anúncio / Copywriting</label>
              <textarea
                rows={3}
                required
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Descreva a atração, urgência de lote ou benefícios exclusivos..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">URL de Destino Oficial</label>
              <input
                type="url"
                required
                value={destinationUrl}
                onChange={(e) => setDestinationUrl(e.target.value)}
                placeholder="https://newdawn.diskingressos.com.br/evento/..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Tags / Identificadores (separados por vírgula)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Ex: line-up, lote1, urgencia, vip"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-300 placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={handleCopyCopy}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
              >
                {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                <span>{copied ? 'Copy Copiada!' : 'Copiar Textos'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition"
                >
                  <Save size={14} />
                  <span>Salvar Criativo</span>
                </button>
              </div>
            </div>
          </form>

          {/* Coluna de Preview Multicanal */}
          <div className="lg:col-span-5 p-6 bg-[#0a0f1d] flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Eye size={14} className="text-purple-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Preview de Exibição</span>
              </div>
              <div className="flex items-center gap-1">
                {(['META', 'GOOGLE', 'SPOTIFY', 'WHATSAPP'] as const).map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setPreviewChannel(ch)}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                      previewChannel === ch
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>

            {/* Container do Preview Estilizado */}
            <div className="flex-1 flex items-center justify-center">
              {previewChannel === 'META' && (
                <div className="w-full max-w-xs bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl text-xs">
                  <div className="p-3 flex items-center justify-between border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-purple-600 flex items-center justify-center font-bold text-[10px] text-white">
                        Di
                      </div>
                      <div>
                        <div className="font-bold text-white text-[11px]">DiskIngressos Oficial</div>
                        <div className="text-[9px] text-slate-500">Patrocinado</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-2.5 text-[11px] text-slate-300 line-clamp-3">
                    {texto || 'Garanta seu ingresso oficial com taxa reduzida e acesso imediato no app.'}
                  </div>
                  <div className="w-full h-44 bg-slate-800 relative flex items-center justify-center overflow-hidden">
                    <img
                      src={assetUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600'}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[9px] text-white font-mono">
                      {formato}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-950 flex items-center justify-between">
                    <div>
                      <div className="text-[9px] text-slate-500 uppercase tracking-wider font-mono">NEWDAWN.DISKINGRESSOS.COM.BR</div>
                      <div className="font-bold text-white text-xs truncate max-w-[170px]">{headline || 'Festival Live 2026'}</div>
                    </div>
                    <div className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-sky-400 font-bold text-[10px]">
                      {cta}
                    </div>
                  </div>
                </div>
              )}

              {previewChannel === 'GOOGLE' && (
                <div className="w-full max-w-sm bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-2 text-xs">
                  <div className="text-[10px] text-emerald-400 font-mono font-bold">Anúncio • diskingressos.com.br/ingressos</div>
                  <div className="text-sm font-bold text-sky-400 hover:underline cursor-pointer">
                    {headline || 'Comprar Ingressos Oficiais · Venda Autorizada 2026'}
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    {texto || 'Compre ingressos online em até 12x no cartão ou via Pix com taxa zero no app oficial.'}
                  </p>
                  <div className="pt-2 border-t border-slate-800 flex gap-2 text-[10px] text-sky-400">
                    <span className="bg-slate-800 px-2 py-1 rounded">Mapa de Assentos</span>
                    <span className="bg-slate-800 px-2 py-1 rounded">Virada de Lote</span>
                    <span className="bg-slate-800 px-2 py-1 rounded">Setor VIP</span>
                  </div>
                </div>
              )}

              {previewChannel === 'SPOTIFY' && (
                <div className="w-full max-w-xs bg-[#121212] rounded-xl border border-slate-800 p-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Music2 size={16} className="text-emerald-400" />
                      <span className="font-bold text-white text-xs">Spotify Audio Ad</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[9px]">0:30</span>
                  </div>
                  <div className="w-full h-32 rounded-lg bg-slate-800 relative overflow-hidden flex items-center justify-center">
                    <img
                      src={assetUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600'}
                      alt="Spotify Companion"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-white text-xs">{headline || 'Ouça os Artistas do Festival'}</div>
                    <p className="text-slate-400 text-[11px] line-clamp-2">{texto || 'Spot de 30 segundos com áudio imersivo e clique direto no banner companion.'}</p>
                  </div>
                  <div className="w-full py-2 rounded-full bg-emerald-500 text-black font-bold text-center text-xs">
                    {cta}
                  </div>
                </div>
              )}

              {previewChannel === 'WHATSAPP' && (
                <div className="w-full max-w-xs bg-[#0b141a] rounded-xl border border-slate-800 p-4 space-y-3 text-xs">
                  <div className="bg-[#202c33] text-[#e9edef] rounded-lg p-3 space-y-1.5 rounded-tl-none shadow">
                    <div className="font-bold text-emerald-400 text-xs">{headline || 'Festival DiskIngressos Live'}</div>
                    <p className="text-[11px] leading-relaxed">{texto || 'Seu código promocional exclusivo para o Lote 1 foi liberado. Clique no link para resgatar.'}</p>
                    <div className="text-[9px] text-slate-400 text-right">11:42 ✓✓</div>
                  </div>
                  <div className="bg-[#202c33] text-sky-400 rounded-lg p-2 text-center font-bold text-xs cursor-pointer hover:bg-[#2a3942] transition">
                    {cta}
                  </div>
                </div>
              )}
            </div>

            {onUseInCampaign && (
              <button
                type="button"
                onClick={() => {
                  handleSubmit({ preventDefault: () => {} } as any);
                  onUseInCampaign({
                    id: initialData?.id || `cria-${Date.now()}`,
                    eventoId,
                    nome: nome || 'Criativo Ativo',
                    tipo,
                    formato,
                    canais,
                    headline,
                    texto,
                    cta,
                    destinationUrl,
                    assetUrl,
                    status: 'ATIVO',
                    campanhasVinculadasCount: 1,
                    criadoEm: new Date().toISOString(),
                    atualizadoEm: new Date().toISOString(),
                  });
                }}
                className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition"
              >
                Vincular Diretamente à Campanha
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

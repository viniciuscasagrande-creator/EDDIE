// apps/pdt/src/components/marketing/PixelManagementModal.tsx
// EDDIE 11.16.17 — Modal Operacional para Cadastro e Edição de Multi-Pixel / CAPI

'use client';

import React, { useState, useEffect } from 'react';
import { X, Target, ShieldCheck, Zap, AlertCircle } from 'lucide-react';
import type {
  TrackingConfiguration,
  TrackingProvider,
  CanonicalEventName,
} from './tracking-types';

interface PixelManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: TrackingConfiguration) => void;
  initialData?: TrackingConfiguration | null;
  eventos: Array<{ id: string; nome: string }>;
  currentEventoId: string;
}

const ALL_CANONICAL_EVENTS: Array<{ id: CanonicalEventName; label: string; desc: string }> = [
  { id: 'PAGE_VIEW', label: 'Page View', desc: 'Visualização de qualquer página do site' },
  { id: 'VIEW_EVENT', label: 'View Event', desc: 'Visualização da página oficial do evento' },
  { id: 'VIEW_ITEM', label: 'View Item', desc: 'Visualização de setor ou tipo de ingresso' },
  { id: 'ADD_TO_CART', label: 'Add to Cart', desc: 'Adição de ingresso ao carrinho' },
  { id: 'BEGIN_CHECKOUT', label: 'Begin Checkout', desc: 'Início do fluxo de pagamento' },
  { id: 'ADD_PAYMENT_INFO', label: 'Add Payment Info', desc: 'Preenchimento de Pix / Cartão' },
  { id: 'PURCHASE', label: 'Purchase (Server-Side)', desc: 'Compra confirmada operacionalmente' },
  { id: 'REFUND', label: 'Refund', desc: 'Estorno ou cancelamento de pedido' },
];

export function PixelManagementModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  eventos,
  currentEventoId,
}: PixelManagementModalProps) {
  const [name, setName] = useState('');
  const [provider, setProvider] = useState<TrackingProvider>('META');
  const [publicId, setPublicId] = useState('');
  const [serverSecret, setServerSecret] = useState('');
  const [environment, setEnvironment] = useState<'PRODUCTION' | 'TEST'>('PRODUCTION');
  const [testEventCode, setTestEventCode] = useState('');
  const [enabledEvents, setEnabledEvents] = useState<CanonicalEventName[]>([
    'PAGE_VIEW',
    'VIEW_EVENT',
    'ADD_TO_CART',
    'BEGIN_CHECKOUT',
    'PURCHASE',
  ]);
  const [eventoId, setEventoId] = useState(currentEventoId);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setProvider(initialData.provider);
      setPublicId(initialData.publicId);
      setServerSecret(''); // Nunca expõe segredo original
      setEnvironment(initialData.environment);
      setTestEventCode(initialData.testEventCode || '');
      setEnabledEvents(initialData.enabledEvents);
      setEventoId(initialData.eventId);
    } else {
      setName('');
      setProvider('META');
      setPublicId('');
      setServerSecret('');
      setEnvironment('PRODUCTION');
      setTestEventCode('');
      setEnabledEvents(['PAGE_VIEW', 'VIEW_EVENT', 'ADD_TO_CART', 'BEGIN_CHECKOUT', 'PURCHASE']);
      setEventoId(currentEventoId);
    }
    setErrorMsg(null);
  }, [initialData, currentEventoId, isOpen]);

  if (!isOpen) return null;

  const toggleEvent = (evt: CanonicalEventName) => {
    setEnabledEvents((prev) =>
      prev.includes(evt) ? prev.filter((e) => e !== evt) : [...prev, evt]
    );
  };

  const handleSalvar = () => {
    if (!name.trim()) {
      setErrorMsg('Informe o nome da configuração do Pixel.');
      return;
    }
    if (!publicId.trim()) {
      setErrorMsg('Informe o ID público (Pixel ID ou Measurement ID).');
      return;
    }

    const config: TrackingConfiguration = {
      id: initialData?.id || `cfg-${provider.toLowerCase()}-${Date.now().toString(36)}`,
      producerId: initialData?.producerId || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      eventId: eventoId,
      name: name.trim(),
      provider,
      publicId: publicId.trim(),
      serverSecretMasked: serverSecret
        ? `${serverSecret.substring(0, 4)}***${serverSecret.slice(-4)}`
        : initialData?.serverSecretMasked || 'N/A',
      status: initialData?.status || 'ATIVO',
      environment,
      testEventCode: testEventCode.trim() || undefined,
      enabledEvents,
      health: initialData?.health || 'SAUDAVEL',
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* CABEÇALHO */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Target size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {initialData ? 'Editar Pixel & Servidor CAPI' : 'Novo Pixel / Servidor de Conversão'}
              </h2>
              <p className="text-xs text-slate-400">
                Integração direta com Meta CAPI, Google Measurement Protocol, TikTok e Spotify
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
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* VÍNCULO DE EVENTO */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-300">Evento Vinculado</label>
            <select
              value={eventoId}
              onChange={(e) => setEventoId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-purple-500"
            >
              {eventos.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.nome}
                </option>
              ))}
            </select>
          </div>

          {/* SELETOR DE PROVEDOR */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-300">Provedor de Mídia / Analytics</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['META', 'GOOGLE', 'TIKTOK', 'SPOTIFY'] as const).map((prov) => (
                <button
                  key={prov}
                  type="button"
                  onClick={() => setProvider(prov)}
                  className={`px-3 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                    provider === prov
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {prov === 'META' && 'Meta Ads / CAPI'}
                  {prov === 'GOOGLE' && 'GA4 / Google Ads'}
                  {prov === 'TIKTOK' && 'TikTok Pixel'}
                  {prov === 'SPOTIFY' && 'Spotify Atribuição'}
                </button>
              ))}
            </div>
          </div>

          {/* NOME DA CONFIGURAÇÃO */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-300">Nome da Integração</label>
            <input
              type="text"
              placeholder="Ex: Meta Pixel Principal da Produtora"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* ID PÚBLICO E SEGREDOS SERVER-SIDE */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300">
                {provider === 'META'
                  ? 'Meta Pixel ID'
                  : provider === 'GOOGLE'
                  ? 'GA4 Measurement ID (G-XXXXX)'
                  : provider === 'TIKTOK'
                  ? 'TikTok Pixel ID'
                  : 'Campaign Tracker ID'}
              </label>
              <input
                type="text"
                placeholder={provider === 'GOOGLE' ? 'G-7X982KJ412' : '284019284019284'}
                value={publicId}
                onChange={(e) => setPublicId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white font-mono placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                <span>Access Token CAPI / Secret</span>
                <span className="text-[10px] text-emerald-400 font-normal">Protegido Server-side</span>
              </label>
              <input
                type="password"
                placeholder={initialData ? initialData.serverSecretMasked : 'Cole o token secreto...'}
                value={serverSecret}
                onChange={(e) => setServerSecret(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white font-mono placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* AMBIENTE & CÓDIGO DE TESTE */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300">Ambiente de Operação</label>
              <div className="flex gap-2">
                {(['PRODUCTION', 'TEST'] as const).map((env) => (
                  <button
                    key={env}
                    type="button"
                    onClick={() => setEnvironment(env)}
                    className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
                      environment === env
                        ? 'bg-slate-700 text-white'
                        : 'bg-slate-900 border border-slate-800 text-slate-400'
                    }`}
                  >
                    {env === 'PRODUCTION' ? 'Produção' : 'Modo Teste / Sandbox'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300">
                Código de Teste do Gerenciador (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: TEST12345"
                value={testEventCode}
                onChange={(e) => setTestEventCode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white font-mono placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* EVENTOS HABILITADOS */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-slate-300">
                Eventos Canônicos Habilitados para Envio
              </label>
              <span className="text-[10px] text-purple-400 font-bold font-mono">
                {enabledEvents.length} de {ALL_CANONICAL_EVENTS.length} ativos
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-2">
              {ALL_CANONICAL_EVENTS.map((evt) => {
                const checked = enabledEvents.includes(evt.id);
                return (
                  <div
                    key={evt.id}
                    onClick={() => toggleEvent(evt.id)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition flex items-start gap-2.5 ${
                      checked
                        ? 'bg-purple-950/20 border-purple-500/40 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-purple-600 focus:ring-0 bg-slate-800 border-slate-700"
                    />
                    <div>
                      <div className="font-bold text-[11px]">{evt.label}</div>
                      <div className="text-[10px] text-slate-400">{evt.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RODAPÉ */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-emerald-400" />
            <span>Deduplicação automática com event_id único</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white font-medium text-xs transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSalvar}
              className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow-lg shadow-purple-600/20"
            >
              Salvar Configuração
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

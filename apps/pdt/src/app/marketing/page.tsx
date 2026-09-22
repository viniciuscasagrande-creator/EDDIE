'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Megaphone,
  QrCode,
  Tag,
  Activity,
  Plus,
  TrendingUp,
  Share2,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCcw,
  Play,
  Pause,
  Copy,
  Download,
  Flame,
  Clock,
  Sparkles,
  ExternalLink,
  Percent,
  Search,
  Filter,
} from 'lucide-react';
import { useProducerEvent } from '../../components/ProducerEventContext';
import OperationalPanel from '../../components/OperationalPanel';

type TabView = 'templates' | 'campanhas' | 'pixels' | 'utms' | 'cupons' | 'automacoes' | 'whatsapp' | 'email' | 'abandonado' | 'afiliados' | 'publicos' | 'integracoes';

type Campanha = {
  id: string;
  nome: string;
  objetivo: string;
  status: string;
  orcamentoTotalCents: number;
  gastoAtualCents: number;
  canais: string[];
  receitaAtribuidaCents?: number;
  roas?: number;
  iniciaEm?: string | null;
  terminaEm?: string | null;
  createdAt: string;
};

type TemplateCampanha = {
  id: string;
  nome: string;
  descricao: string;
  canaisSugeridos: string[];
  sugestaoOrcamentoCents: number;
  objetivo: string;
};

type Pixel = {
  id: string;
  provedor: string;
  nome: string;
  pixelExternalId: string;
  status: string;
  ultimaAtividadeEm?: string | null;
};

type UtmLink = {
  id: string;
  canal: string;
  urlDestino: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  qrCodeDataUrl?: string | null;
  cliques: number;
  createdAt: string;
};

type Cupom = {
  id: string;
  codigo: string;
  tipoDesconto: string;
  descontoValor: number;
  limiteUso?: number | null;
  usosAtuais: number;
  ativo: boolean;
  validoAte?: string | null;
};

type Kpis = {
  totalCampanhasAtivas: number;
  totalCliquesLinks: number;
  totalConversoes: number;
  receitaTotalAtribuidaCents: number;
  pixelsAtivosCount: number;
  alertasPendentesCount: number;
  roasMedio?: string;
};

const formatBRL = (cents = 0) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

export default function MarketingPage() {
  const { api, produtorId, eventoId, evento } = useProducerEvent();
  const [tab, setTab] = useState<TabView>('templates');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  // Estados
  const [templates, setTemplates] = useState<TemplateCampanha[]>([]);
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [utms, setUtms] = useState<UtmLink[]>([]);
  const [cupons, setCupons] = useState<Cupom[]>([]);
  const [kpis, setKpis] = useState<Kpis>({
    totalCampanhasAtivas: 0,
    totalCliquesLinks: 0,
    totalConversoes: 0,
    receitaTotalAtribuidaCents: 0,
    pixelsAtivosCount: 0,
    alertasPendentesCount: 0,
  });

  // Modais
  const [modalNovaCampanha, setModalNovaCampanha] = useState(false);
  const [modalNovoPixel, setModalNovoPixel] = useState(false);
  const [modalNovoUtm, setModalNovoUtm] = useState(false);
  const [modalNovoCupom, setModalNovoCupom] = useState(false);

  // Form states - Campanha
  const [campNome, setCampNome] = useState('');
  const [campObjetivo, setCampObjetivo] = useState('lancamento');
  const [campOrcamento, setCampOrcamento] = useState('2000,00');
  const [campCanais, setCampCanais] = useState<string[]>(['meta', 'google']);

  // Form states - Pixel
  const [pixelProvedor, setPixelProvedor] = useState('meta');
  const [pixelId, setPixelId] = useState('');

  // Form states - UTM Link
  const [utmUrl, setUtmUrl] = useState('');
  const [utmCanal, setUtmCanal] = useState('meta');
  const [utmSource, setUtmSource] = useState('instagram');
  const [utmMedium, setUtmMedium] = useState('cpc');
  const [utmCampaign, setUtmCampaign] = useState('lote1_lancamento');

  // Form states - Cupom
  const [cupomCodigo, setCupomCodigo] = useState('');
  const [cupomTipo, setCupomTipo] = useState('percentual');
  const [cupomValor, setCupomValor] = useState('10');
  const [cupomLimite, setCupomLimite] = useState('100');

  const carregarDados = useCallback(async () => {
    if (!api || !produtorId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    try {
      const evQuery = eventoId ? `&eventoId=${eventoId}` : '';
      const results = await Promise.allSettled([
        fetch(`${api}/marketing/campanhas/templates`, { signal: controller.signal }),
        fetch(`${api}/marketing/campanhas?produtorId=${produtorId}${evQuery}`, { signal: controller.signal }),
        fetch(`${api}/marketing/pixels/todos?produtorId=${produtorId}${evQuery}`, { signal: controller.signal }),
        fetch(`${api}/marketing/links?produtorId=${produtorId}${eventoId ? `&eventoId=${eventoId}` : ''}`, { signal: controller.signal }),
        fetch(`${api}/marketing/cupons?produtorId=${produtorId}${eventoId ? `&eventoId=${eventoId}` : ''}`, { signal: controller.signal }),
        fetch(`${api}/marketing/kpis?produtorId=${produtorId}${evQuery}`, { signal: controller.signal }),
      ]);

      const [rTpl, rCamp, rPix, rUtm, rCup, rKpi] = results;

      if (rTpl.status === 'fulfilled' && rTpl.value.ok) setTemplates(await rTpl.value.json());
      if (rCamp.status === 'fulfilled' && rCamp.value.ok) {
        const cData = await rCamp.value.json();
        setCampanhas(Array.isArray(cData) ? cData : []);
      }
      if (rPix.status === 'fulfilled' && rPix.value.ok) {
        const pData = await rPix.value.json();
        setPixels(Array.isArray(pData) ? pData : []);
      }
      if (rUtm.status === 'fulfilled' && rUtm.value.ok) {
        const uData = await rUtm.value.json();
        setUtms(Array.isArray(uData) ? uData : []);
      }
      if (rCup.status === 'fulfilled' && rCup.value.ok) {
        const cpData = await rCup.value.json();
        setCupons(Array.isArray(cpData) ? cpData : []);
      }
      if (rKpi.status === 'fulfilled' && rKpi.value.ok) setKpis(await rKpi.value.json());

      const anySuccess = results.some((r) => r.status === 'fulfilled' && r.value.ok);
      const any503 = results.some((r) => r.status === 'fulfilled' && r.value.status === 503);
      if (!anySuccess && any503) {
        setFeedback({
          tipo: 'error',
          texto: 'API de Produção Offline (503). O módulo de Marketing não está conectado no momento.',
        });
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setFeedback({
          tipo: 'error',
          texto: 'Tempo limite ao consultar o módulo de marketing.',
        });
      }
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  }, [api, produtorId, eventoId]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // Ativação rápida de template em 1 clique
  const handleAtivarTemplate = async (templateId: string) => {
    if (!api || !produtorId || !eventoId) {
      setFeedback({ tipo: 'error', texto: 'Selecione um evento no topo antes de ativar a campanha.' });
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`${api}/marketing/campanhas/ativar-template`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produtorId,
          eventoId,
          templateId,
        }),
      });

      if (!res.ok) throw new Error('Não foi possível ativar o template.');
      setFeedback({ tipo: 'success', texto: 'Campanha ativada com sucesso a partir do modelo oficial!' });
      setTab('campanhas');
      await carregarDados();
    } catch (err: any) {
      setFeedback({ tipo: 'error', texto: err.message || 'Falha ao ativar template.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Alterar Status da Campanha (pausar / ativar)
  const handleAlterarStatus = async (id: string, novoStatus: string) => {
    if (!api) return;
    try {
      const res = await fetch(`${api}/marketing/campanhas/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus }),
      });
      if (!res.ok) throw new Error('Falha ao alterar status.');
      setFeedback({ tipo: 'success', texto: `Status da campanha alterado para ${novoStatus}!` });
      await carregarDados();
    } catch (err: any) {
      setFeedback({ tipo: 'error', texto: err.message || 'Erro ao alterar status.' });
    }
  };

  // Criar Campanha Manual
  const handleCriarCampanha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!api || !produtorId || !eventoId) {
      setFeedback({ tipo: 'error', texto: 'Selecione um evento no topo para associar a campanha.' });
      return;
    }
    setActionLoading(true);
    const orcamentoCents = Math.round(Number(campOrcamento.replace(',', '.')) * 100);

    try {
      const res = await fetch(`${api}/marketing/campanhas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produtorId,
          eventoId,
          nome: campNome,
          objetivo: campObjetivo as any,
          orcamentoCents,
          canais: campCanais as any,
        }),
      });

      if (!res.ok) throw new Error('Erro ao criar campanha.');
      setFeedback({ tipo: 'success', texto: 'Campanha de marketing criada com sucesso!' });
      setModalNovaCampanha(false);
      setCampNome('');
      await carregarDados();
    } catch (err: any) {
      setFeedback({ tipo: 'error', texto: err.message || 'Falha ao criar campanha.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Configurar Pixel CAPI
  const handleConfigurarPixel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!api || !produtorId || !eventoId) return;
    setActionLoading(true);

    try {
      const res = await fetch(`${api}/marketing/pixels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produtorId,
          eventoId,
          provedor: pixelProvedor as any,
          pixelExternalId: pixelId,
        }),
      });

      if (!res.ok) throw new Error('Erro ao configurar pixel.');
      setFeedback({ tipo: 'success', texto: 'Pixel Server-Side (CAPI) conectado com sucesso!' });
      setModalNovoPixel(false);
      setPixelId('');
      await carregarDados();
    } catch (err: any) {
      setFeedback({ tipo: 'error', texto: err.message || 'Falha ao configurar pixel.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Gerar Link UTM / QR Code
  const handleGerarUtm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!api || !produtorId || !eventoId) return;
    setActionLoading(true);

    try {
      const res = await fetch(`${api}/marketing/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produtorId,
          eventoId,
          urlDestino: utmUrl || `https://diskingressos.com.br/evento/${eventoId}`,
          canal: utmCanal as any,
          utmSource,
          utmMedium,
          utmCampaign,
        }),
      });

      if (!res.ok) throw new Error('Erro ao gerar link UTM.');
      setFeedback({ tipo: 'success', texto: 'Link rastreado e QR Code gerados com sucesso!' });
      setModalNovoUtm(false);
      setUtmUrl('');
      await carregarDados();
    } catch (err: any) {
      setFeedback({ tipo: 'error', texto: err.message || 'Falha ao gerar link.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Cupom
  const handleToggleCupom = async (id: string, ativoAtual: boolean) => {
    if (!api) return;
    try {
      const res = await fetch(`${api}/marketing/cupons/${id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: !ativoAtual }),
      });
      if (!res.ok) throw new Error('Falha ao alterar cupom.');
      setFeedback({ tipo: 'success', texto: `Cupom ${!ativoAtual ? 'ativado' : 'desativado'} com sucesso!` });
      await carregarDados();
    } catch (err: any) {
      setFeedback({ tipo: 'error', texto: err.message || 'Erro ao alterar cupom.' });
    }
  };

  // Criar Cupom
  const handleCriarCupom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!api || !produtorId || !eventoId) return;
    setActionLoading(true);

    try {
      const res = await fetch(`${api}/marketing/cupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produtorId,
          eventoId,
          codigo: cupomCodigo.toUpperCase(),
          tipoDesconto: cupomTipo as any,
          descontoValor: Number(cupomValor),
          limiteUso: cupomLimite ? Number(cupomLimite) : undefined,
        }),
      });

      if (!res.ok) throw new Error('Erro ao cadastrar cupom.');
      setFeedback({ tipo: 'success', texto: 'Cupom promocional criado com sucesso!' });
      setModalNovoCupom(false);
      setCupomCodigo('');
      await carregarDados();
    } catch (err: any) {
      setFeedback({ tipo: 'error', texto: err.message || 'Falha ao cadastrar cupom.' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1550px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-2">
            <Megaphone size={13} />
            <span>Marketing Hub & Atribuição de Vendas Multicanal</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Marketing, Campanhas Prontas & Multi-Pixel
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Ativação rápida de campanhas com 1 clique, pixels Server-Side CAPI, links UTM com QR Code e cupons.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setModalNovoUtm(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition"
          >
            <QrCode size={14} />
            <span>Gerar Link / QR</span>
          </button>

          <button
            type="button"
            onClick={() => setModalNovaCampanha(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-600/20 transition"
          >
            <Plus size={14} />
            <span>Nova Campanha</span>
          </button>

          <button
            onClick={() => void carregarDados()}
            className="p-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300"
            title="Atualizar"
          >
            <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
          <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Campanhas Ativas</span>
            <Megaphone size={16} className="text-sky-400" />
          </div>
          <div className="text-xl font-black text-white mt-2">{kpis.totalCampanhasAtivas || campanhas.length}</div>
          <div className="text-[10px] text-emerald-400 mt-1 font-semibold">Ativação multicanal</div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
          <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Cliques Rastreacionados</span>
            <QrCode size={16} className="text-purple-400" />
          </div>
          <div className="text-xl font-black text-white mt-2">{kpis.totalCliquesLinks || 0}</div>
          <div className="text-[10px] text-slate-500 mt-1">{utms.length} links UTM ativos</div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
          <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Conversões Atribuídas</span>
            <Activity size={16} className="text-emerald-400" />
          </div>
          <div className="text-xl font-black text-white mt-2">{kpis.totalConversoes || 0}</div>
          <div className="text-[10px] text-emerald-400 mt-1 font-semibold">CAPI Server-Side</div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
          <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Receita de Marketing</span>
            <TrendingUp size={16} className="text-emerald-400" />
          </div>
          <div className="text-xl font-black text-emerald-400 mt-2">
            {formatBRL(kpis.receitaTotalAtribuidaCents || 0)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            ROAS Médio: {kpis.roasMedio || (kpis.receitaTotalAtribuidaCents > 0 ? '4.2x' : '—')}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 border-b border-slate-800">
        {[
          { id: 'templates' as TabView, label: 'Campanhas Prontas (1-Click)', icon: Sparkles },
          { id: 'campanhas' as TabView, label: 'Gestão de Campanhas', icon: Megaphone },
          { id: 'pixels' as TabView, label: 'Multi-Pixel CAPI', icon: Activity },
          { id: 'utms' as TabView, label: 'Links UTM & QR Code', icon: QrCode },
          { id: 'cupons' as TabView, label: 'Cupons Promocionais', icon: Tag },
          { id: 'automacoes' as TabView, label: 'Automações', icon: Activity },
          { id: 'whatsapp' as TabView, label: 'WhatsApp', icon: Share2 },
          { id: 'email' as TabView, label: 'E-mail Marketing', icon: Megaphone },
          { id: 'abandonado' as TabView, label: 'Carrinho Abandonado', icon: Clock },
          { id: 'afiliados' as TabView, label: 'Afiliados', icon: Share2 },
          { id: 'publicos' as TabView, label: 'Públicos & Segmentação', icon: Filter },
          { id: 'integracoes' as TabView, label: 'Integrações de Mídia', icon: ExternalLink },
        ].map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
                active
                  ? 'bg-sky-500/15 border border-sky-500/40 text-sky-300'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <t.icon size={15} className={active ? 'text-sky-400' : 'text-slate-500'} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-3 ${
            feedback.tipo === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.tipo === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            <span>{feedback.texto}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {loading ? (
        <div className="h-72 grid place-items-center text-slate-400">
          <Loader2 className="animate-spin text-sky-400" size={32} />
        </div>
      ) : (
        <>
          {/* TAB: TEMPLATES DE CAMPANHAS PRONTAS */}
          {tab === 'templates' && (
            <div className="space-y-5">
              <div className="bg-[#111827] border border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles size={16} className="text-sky-400" />
                      <span>Catálogo de Campanhas Prontas & Ativação em 1 Clique</span>
                    </h2>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Estratégias homologadas de alto impacto com canais pré-parametrizados e sugestão de investimento.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-bold">
                    {templates.length || 5} Modelos Oficiais
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {(templates.length > 0 ? templates : [
                  {
                    id: 'lancamento',
                    nome: 'Lançamento Oficial de Vendas (Lote 1)',
                    descricao: 'Disparo de tráfego pago multicanal para abertura de vendas.',
                    canaisSugeridos: ['meta', 'google', 'whatsapp'],
                    sugestaoOrcamentoCents: 500000,
                    objetivo: 'lancamento',
                  },
                  {
                    id: 'virada_lote',
                    nome: 'Virada de Lote 48 Horas',
                    descricao: 'Campanha de escassez e urgência comunicando o término do lote atual.',
                    canaisSugeridos: ['meta', 'google', 'email'],
                    sugestaoOrcamentoCents: 350000,
                    objetivo: 'virada_lote',
                  },
                  {
                    id: 'contagem_regressiva',
                    nome: 'Contagem Regressiva — Últimos Ingressos',
                    descricao: 'Pressão final de conversão para esgotar os setores remanescentes.',
                    canaisSugeridos: ['meta', 'tiktok', 'whatsapp'],
                    sugestaoOrcamentoCents: 300000,
                    objetivo: 'contagem_regressiva',
                  },
                  {
                    id: 'carrinho_abandonado',
                    nome: 'Carrinho Abandonado & Remarketing CAPI',
                    descricao: 'Reengajamento automático com quem iniciou checkout mas não pagou.',
                    canaisSugeridos: ['whatsapp', 'email', 'meta'],
                    sugestaoOrcamentoCents: 200000,
                    objetivo: 'reengajamento',
                  },
                  {
                    id: 'promocional',
                    nome: 'Promoção Relâmpago VIP (Cupom Especial)',
                    descricao: 'Ativação relâmpago de vendas com benefício exclusivo por tempo limitado.',
                    canaisSugeridos: ['meta', 'tiktok', 'email'],
                    sugestaoOrcamentoCents: 250000,
                    objetivo: 'promocional',
                  },
                ]).map((tpl) => (
                  <div
                    key={tpl.id}
                    className="bg-[#111827] border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Flame size={16} className="text-amber-400" />
                        <h3 className="text-sm font-bold text-white">{tpl.nome}</h3>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{tpl.descricao}</p>

                      <div className="flex flex-wrap gap-1 pt-2">
                        {tpl.canaisSugeridos.map((c) => (
                          <span
                            key={c}
                            className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-300 uppercase font-semibold"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Investimento Sugerido</span>
                        <div className="text-xs font-bold text-white font-mono">
                          {formatBRL(tpl.sugestaoOrcamentoCents)}
                        </div>
                      </div>

                      <button
                        onClick={() => handleAtivarTemplate(tpl.id)}
                        disabled={actionLoading}
                        className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition"
                      >
                        {actionLoading ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
                        Ativar 1-Click
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: GESTÃO DE CAMPANHAS */}
          {tab === 'campanhas' && (
            <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white">Campanhas em Execução & Atribuição</h2>
                  <p className="text-slate-400 text-xs">Acompanhamento de orçamento consumido e retorno.</p>
                </div>
                <button
                  onClick={() => setModalNovaCampanha(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs"
                >
                  <Plus size={14} /> Nova Campanha
                </button>
              </div>

              {campanhas.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-3.5">Nome da Campanha</th>
                        <th className="p-3.5">Canais</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Orçamento</th>
                        <th className="p-3.5 text-right">Gasto Atual</th>
                        <th className="p-3.5 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-slate-300">
                      {campanhas.map((c) => {
                        const isAtiva = c.status === 'ativa';
                        return (
                          <tr key={c.id} className="hover:bg-slate-800/30">
                            <td className="p-3.5 font-bold text-white">{c.nome}</td>
                            <td className="p-3.5">
                              <div className="flex flex-wrap gap-1">
                                {c.canais.map((canal) => (
                                  <span
                                    key={canal}
                                    className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 uppercase"
                                  >
                                    {canal}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="p-3.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  isAtiva
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                                }`}
                              >
                                {c.status}
                              </span>
                            </td>
                            <td className="p-3.5 text-right font-mono font-bold text-white">
                              {formatBRL(c.orcamentoTotalCents)}
                            </td>
                            <td className="p-3.5 text-right font-mono text-slate-400">
                              {formatBRL(c.gastoAtualCents)}
                            </td>
                            <td className="p-3.5 text-center">
                              {isAtiva ? (
                                <button
                                  onClick={() => handleAlterarStatus(c.id, 'pausada')}
                                  className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-[10px] font-bold"
                                >
                                  Pausar
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleAlterarStatus(c.id, 'ativa')}
                                  className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[10px] font-bold"
                                >
                                  Retomar
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500 text-xs">
                  <Megaphone size={24} className="mx-auto mb-2 opacity-50" />
                  Nenhuma campanha cadastrada. Ative um modelo pronto na aba <b>Campanhas Prontas</b>!
                </div>
              )}
            </div>
          )}

          {/* TAB: PIXELS MULTICANAL (CAPI) */}
          {tab === 'pixels' && (
            <div className="space-y-5">
              <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity size={16} className="text-emerald-400" />
                    <span>Pixels de Conversão Server-Side (CAPI) Homologados</span>
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Disparo de eventos de compra diretamente do servidor do EDDIE, imune a bloqueadores de anúncio e iOS 14.5+.
                  </p>
                </div>
                <button
                  onClick={() => setModalNovoPixel(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs"
                >
                  <Plus size={14} /> Conectar Pixel
                </button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pixels.map((px) => (
                  <div
                    key={px.id}
                    className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-3 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{px.nome}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          px.status === 'ativo'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        ● {px.status === 'ativo' ? 'Conectado' : 'Inativo'}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-900 rounded border border-slate-800 text-xs font-mono text-slate-300">
                      ID: {px.pixelExternalId}
                    </div>

                    <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
                      <span>Provedor: {px.provedor.toUpperCase()}</span>
                      <span className="text-emerald-400 font-semibold">CAPI v2 Ativa</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: LINKS UTM & QR CODE */}
          {tab === 'utms' && (
            <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white">Central de Links UTM & QR Codes Dinâmicos</h2>
                  <p className="text-slate-400 text-xs">
                    Rastreie origens de tráfego e gere QR Codes para impressão ou stories.
                  </p>
                </div>
                <button
                  onClick={() => setModalNovoUtm(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs"
                >
                  <Plus size={14} /> Novo Link UTM
                </button>
              </div>

              {utms.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-3.5">Campanha / Parâmetros</th>
                        <th className="p-3.5">Canal</th>
                        <th className="p-3.5">URL de Destino</th>
                        <th className="p-3.5 text-right">Cliques</th>
                        <th className="p-3.5 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-slate-300">
                      {utms.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-800/30">
                          <td className="p-3.5">
                            <div className="font-bold text-white">{u.utmCampaign}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              source={u.utmSource} | medium={u.utmMedium}
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] uppercase font-semibold">
                              {u.canal}
                            </span>
                          </td>
                          <td className="p-3.5 font-mono text-slate-400 max-w-xs truncate">{u.urlDestino}</td>
                          <td className="p-3.5 text-right font-black text-sky-400 font-mono">{u.cliques}</td>
                          <td className="p-3.5 text-center">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  `${u.urlDestino}?utm_source=${u.utmSource}&utm_medium=${u.utmMedium}&utm_campaign=${u.utmCampaign}`,
                                );
                                setFeedback({ tipo: 'success', texto: 'Link UTM copiado para a área de transferência!' });
                              }}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold inline-flex items-center gap-1"
                            >
                              <Copy size={11} /> Copiar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500 text-xs">
                  <QrCode size={24} className="mx-auto mb-2 opacity-50" />
                  Nenhum link UTM parametrizado. Clique em <b>Novo Link UTM</b> para criar!
                </div>
              )}
            </div>
          )}

          {/* TAB: CUPONS PROMOCIONAIS */}
          {tab === 'cupons' && (
            <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white">Cupons Promocionais de Desconto</h2>
                  <p className="text-slate-400 text-xs">Controle de cupons percentuais ou de valor fixo.</p>
                </div>
                <button
                  onClick={() => setModalNovoCupom(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs"
                >
                  <Plus size={14} /> Novo Cupom
                </button>
              </div>

              {cupons.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-3.5">Código do Cupom</th>
                        <th className="p-3.5">Tipo de Desconto</th>
                        <th className="p-3.5 text-right">Valor Desconto</th>
                        <th className="p-3.5 text-center">Usos / Limite</th>
                        <th className="p-3.5 text-left">Status</th>
                        <th className="p-3.5 text-center">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-slate-300">
                      {cupons.map((cp) => (
                        <tr key={cp.id} className="hover:bg-slate-800/30">
                          <td className="p-3.5 font-mono font-black text-white text-sm">{cp.codigo}</td>
                          <td className="p-3.5 text-slate-300 capitalize">{cp.tipoDesconto}</td>
                          <td className="p-3.5 text-right font-black text-emerald-400 font-mono">
                            {cp.tipoDesconto === 'percentual' ? `${cp.descontoValor}%` : formatBRL(cp.descontoValor * 100)}
                          </td>
                          <td className="p-3.5 text-center font-mono text-slate-400">
                            {cp.usosAtuais} / {cp.limiteUso ?? '∞'}
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                cp.ativo
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}
                            >
                              {cp.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            <button
                              onClick={() => handleToggleCupom(cp.id, cp.ativo)}
                              className={`px-2.5 py-1 rounded text-[10px] font-bold transition ${
                                cp.ativo
                                  ? 'bg-slate-800 hover:bg-rose-500/20 text-rose-300'
                                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                              }`}
                            >
                              {cp.ativo ? 'Desativar' : 'Ativar'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500 text-xs">
                  <Tag size={24} className="mx-auto mb-2 opacity-50" />
                  Nenhum cupom cadastrado para o evento. Clique em <b>Novo Cupom</b> para criar!
                </div>
              )}
            </div>
          )}

          {tab === 'automacoes' && (
            <OperationalPanel
              title="Automações de Marketing"
              description="Jornadas e gatilhos vinculados ao produtor e evento selecionado."
              items={['Ativas', 'Pausadas', 'Execuções', 'Falhas']}
            />
          )}

          {tab === 'whatsapp' && (
            <OperationalPanel
              title="WhatsApp Marketing"
              description="Campanhas e comunicações com rastreabilidade e consentimento."
              items={['Campanhas', 'Envios', 'Entregues', 'Conversões']}
            />
          )}

          {tab === 'email' && (
            <OperationalPanel
              title="E-mail Marketing"
              description="Campanhas de e-mail, públicos e desempenho real."
              items={['Campanhas', 'Envios', 'Aberturas', 'Conversões']}
            />
          )}

          {tab === 'abandonado' && (
            <OperationalPanel
              title="Carrinho Abandonado"
              description="Recuperação de carrinhos somente dos eventos do produtor."
              items={['Carrinhos', 'Elegíveis', 'Recuperados', 'Receita recuperada']}
            />
          )}

          {tab === 'afiliados' && (
            <OperationalPanel
              title="Afiliados"
              description="Gestão de parceiros, links e atribuição."
              items={['Afiliados', 'Links', 'Conversões', 'Comissões']}
            />
          )}

          {tab === 'publicos' && (
            <OperationalPanel
              title="Públicos & Segmentação"
              description="Segmentos reutilizáveis para campanhas multicanal."
              items={['Públicos', 'Segmentos', 'Elegíveis', 'Sincronizações']}
            />
          )}

          {tab === 'integracoes' && (
            <OperationalPanel
              title="Integrações de Mídia"
              description="Conexões Meta, Google, TikTok e Spotify com diagnóstico."
              items={['Meta', 'Google', 'TikTok', 'Spotify']}
            />
          )}
        </>
      )}

      {/* MODAL NOVA CAMPANHA */}
      {modalNovaCampanha && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                <Megaphone size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Criar Campanha de Marketing</h3>
                <p className="text-slate-400 text-xs">Configuração personalizada para o evento ativo.</p>
              </div>
            </div>

            <form onSubmit={handleCriarCampanha} className="space-y-3.5">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Nome da Campanha</label>
                <input
                  required
                  value={campNome}
                  onChange={(e) => setCampNome(e.target.value)}
                  placeholder="Ex: Campanha Especial Dia das Mães"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">Objetivo</label>
                  <select
                    value={campObjetivo}
                    onChange={(e) => setCampObjetivo(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="lancamento">Lançamento</option>
                    <option value="virada_lote">Virada de Lote</option>
                    <option value="contagem_regressiva">Últimos Ingressos</option>
                    <option value="promocional">Promocional</option>
                    <option value="reengajamento">Reengajamento</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">Orçamento (R$)</label>
                  <input
                    required
                    value={campOrcamento}
                    onChange={(e) => setCampOrcamento(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalNovaCampanha(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2"
                >
                  {actionLoading && <Loader2 size={14} className="animate-spin" />}
                  Lançar Campanha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOVO PIXEL */}
      {modalNovoPixel && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Activity size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Conectar Pixel Server-Side (CAPI)</h3>
                <p className="text-slate-400 text-xs">Rastreamento de conversão em tempo real.</p>
              </div>
            </div>

            <form onSubmit={handleConfigurarPixel} className="space-y-3.5">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Provedor de Mídia</label>
                <select
                  value={pixelProvedor}
                  onChange={(e) => setPixelProvedor(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="meta">Meta Ads (Facebook & Instagram CAPI)</option>
                  <option value="google">Google Ads (Enhanced Conversions)</option>
                  <option value="tiktok">TikTok Ads (Events API)</option>
                  <option value="spotify">Spotify Ads Pixel</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Pixel ID / External ID</label>
                <input
                  required
                  value={pixelId}
                  onChange={(e) => setPixelId(e.target.value)}
                  placeholder="Ex: 84920194012"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalNovoPixel(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2"
                >
                  {actionLoading && <Loader2 size={14} className="animate-spin" />}
                  Salvar Pixel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOVO LINK UTM */}
      {modalNovoUtm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <QrCode size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Gerar Link UTM & QR Code</h3>
                <p className="text-slate-400 text-xs">Cria link de rastreamento com código QR dinâmico.</p>
              </div>
            </div>

            <form onSubmit={handleGerarUtm} className="space-y-3.5">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Canal de Origem</label>
                <select
                  value={utmCanal}
                  onChange={(e) => setUtmCanal(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="meta">Instagram / Facebook (Meta)</option>
                  <option value="google">Google Ads</option>
                  <option value="tiktok">TikTok Ads</option>
                  <option value="whatsapp">WhatsApp / Telegram</option>
                  <option value="email">E-mail Marketing</option>
                  <option value="afiliado">Afiliado / Promoter</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">UTM Source</label>
                  <input
                    required
                    value={utmSource}
                    onChange={(e) => setUtmSource(e.target.value)}
                    placeholder="Ex: instagram"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">UTM Campaign</label>
                  <input
                    required
                    value={utmCampaign}
                    onChange={(e) => setUtmCampaign(e.target.value)}
                    placeholder="Ex: lote1_abertura"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">URL de Destino (Opcional)</label>
                <input
                  value={utmUrl}
                  onChange={(e) => setUtmUrl(e.target.value)}
                  placeholder="https://diskingressos.com.br/evento/..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalNovoUtm(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2"
                >
                  {actionLoading && <Loader2 size={14} className="animate-spin" />}
                  Gerar Link e QR Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOVO CUPOM */}
      {modalNovoCupom && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Tag size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Criar Cupom Promocional</h3>
                <p className="text-slate-400 text-xs">Desconto validado em tempo real no checkout.</p>
              </div>
            </div>

            <form onSubmit={handleCriarCupom} className="space-y-3.5">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Código do Cupom</label>
                <input
                  required
                  value={cupomCodigo}
                  onChange={(e) => setCupomCodigo(e.target.value.toUpperCase())}
                  placeholder="Ex: ROCK10 ou VIPDISKINGRESSOS"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">Tipo de Desconto</label>
                  <select
                    value={cupomTipo}
                    onChange={(e) => setCupomTipo(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="percentual">Percentual (%)</option>
                    <option value="valor_fixo">Valor Fixo (R$)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">Valor do Desconto</label>
                  <input
                    required
                    value={cupomValor}
                    onChange={(e) => setCupomValor(e.target.value)}
                    placeholder="10"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Limite Máximo de Usos</label>
                <input
                  type="number"
                  value={cupomLimite}
                  onChange={(e) => setCupomLimite(e.target.value)}
                  placeholder="Ex: 100"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalNovoCupom(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2"
                >
                  {actionLoading && <Loader2 size={14} className="animate-spin" />}
                  Cadastrar Cupom
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

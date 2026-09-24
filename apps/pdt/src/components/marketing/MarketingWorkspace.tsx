'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Megaphone,
  TrendingUp,
  DollarSign,
  Users,
  Target,
  BarChart3,
  Link2,
  QrCode,
  Copy,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ArrowRight,
  RefreshCcw,
  Download,
  ExternalLink,
  MessageCircle,
  Mail,
  Tags,
  ShieldCheck,
  Eye,
  Activity,
  Sparkles,
  Radio,
  Layers,
  ShoppingBag,
  Zap,
  Sliders,
  Check,
  Image as ImageIcon,
  Flame,
  Award,
  ChevronRight,
  Percent,
  Music2,
  Workflow,
  CreditCard,
  FileBarChart,
  GitBranch,
  Trophy,
  Gauge,
  Send,
  HelpCircle,
  Play,
  Pause,
  GitCompare,
  Archive,
  Edit3,
} from 'lucide-react';
import { useProducerEvent } from '../ProducerEventContext';
import { ModuleNavigation } from '../navigation/ModuleNavigation';
import { CompactOperationalAlert } from '../navigation/CompactOperationalAlert';
import { useMarketingAction } from './useMarketingAction';
import { MarketingActionModal } from './MarketingActionModal';
import { CampaignWizardModal, type CampaignFormData } from './CampaignWizardModal';
import { UtmManagementModal, type UtmData } from './UtmManagementModal';
import { UtmQrModal } from './UtmQrModal';
import { UtmCompareModal } from './UtmCompareModal';
import type { MarketingAction, Provider } from '../../lib/marketing-actions/action-types';

export type MarketingVideoTab =
  | 'dashboard'
  | 'campanhas'
  | 'campanhas-prontas'
  | 'status-real'
  | 'meta'
  | 'google-analytics'
  | 'tiktok'
  | 'spotify'
  | 'whatsapp'
  | 'email'
  | 'automacoes'
  | 'cupons'
  | 'utm'
  | 'afiliados'
  | 'pixels'
  | 'atribuicao'
  | 'relatorios';

interface MarketingWorkspaceProps {
  initialTab?: string;
  contextEventoId?: string | null;
  eventoId?: string | null;
}

const formatBRL = (cents = 0) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

const INITIAL_CAMPANHAS = [
  {
    id: 'cmp-01',
    nome: 'Lançamento Geral · Feed + Stories Instagram',
    canal: 'Meta Ads',
    orcamentoDiarioCents: 15000,
    cliques: 8420,
    conversoes: 342,
    receitaAtribuidaCents: 6840000,
    status: 'ENTREGANDO',
    dataInicio: '2026-09-01',
    dataTermino: '2026-10-15',
    roas: '6.42x',
  },
  {
    id: 'cmp-02',
    nome: 'Google Search · Palavras-Chave Nome Artista + Ingressos',
    canal: 'Google Search',
    orcamentoDiarioCents: 20000,
    cliques: 5120,
    conversoes: 410,
    receitaAtribuidaCents: 8200000,
    status: 'ENTREGANDO',
    dataInicio: '2026-09-05',
    dataTermino: '2026-10-30',
    roas: '6.53x',
  },
  {
    id: 'cmp-03',
    nome: 'Spotify Audio Ads · Retargeting Ouvintes Playlist Oficial',
    canal: 'Spotify Ads',
    orcamentoDiarioCents: 10000,
    cliques: 2310,
    conversoes: 114,
    receitaAtribuidaCents: 2280000,
    status: 'ENTREGANDO',
    dataInicio: '2026-09-10',
    dataTermino: '2026-10-20',
    roas: '5.66x',
  },
  {
    id: 'cmp-04',
    nome: 'Alerta Virada de Lote 48h · Stories Urgência',
    canal: 'Meta Ads',
    orcamentoDiarioCents: 35000,
    cliques: 4980,
    conversoes: 520,
    receitaAtribuidaCents: 10400000,
    status: 'AGENDADA',
    dataInicio: '2026-10-01',
    dataTermino: '2026-10-03',
    roas: '7.80x Estimado',
  },
  {
    id: 'cmp-05',
    nome: 'Disparo WhatsApp VIP · Pré-venda Exclusiva Lote Zero',
    canal: 'WhatsApp Oficial',
    orcamentoDiarioCents: 5000,
    cliques: 3840,
    conversoes: 490,
    receitaAtribuidaCents: 9800000,
    status: 'FINALIZADA',
    dataInicio: '2026-08-25',
    dataTermino: '2026-08-28',
    roas: '28.4x',
  },
  {
    id: 'cmp-06',
    nome: 'Carrossel Dinâmico Setores Camarote & Lounge VIP',
    canal: 'Meta Ads',
    orcamentoDiarioCents: 12000,
    cliques: 1420,
    conversoes: 68,
    receitaAtribuidaCents: 3740000,
    status: 'PAUSADA',
    dataInicio: '2026-09-12',
    dataTermino: '2026-10-10',
    roas: '4.82x',
  },
];

const INITIAL_UTMS: UtmData[] = [
  {
    id: 'utm-01',
    nome: 'Stories Artista Principal · Teaser Lançamento',
    eventoId: 'evento-operacao',
    canal: 'Instagram Ads',
    source: 'instagram',
    medium: 'stories',
    campaign: 'lote1_lancamento',
    content: 'teaser_video_9x16',
    term: 'publico_lookalike_1pct',
    urlDestino: 'https://newdawn.diskingressos.com.br/evento/festival-live-2026',
    urlFinal: 'https://newdawn.diskingressos.com.br/evento/festival-live-2026?utm_source=instagram&utm_medium=stories&utm_campaign=lote1_lancamento&utm_content=teaser_video_9x16&utm_term=publico_lookalike_1pct',
    visitas: 18420,
    carrinhos: 2840,
    checkouts: 1420,
    compras: 680,
    taxaConversao: '3.69%',
    receitaCents: 13600000,
    ticketMedioCents: 20000,
    status: 'ATIVO',
    criadoEm: '2026-09-01T10:00:00Z',
  },
  {
    id: 'utm-02',
    nome: 'Google Search · Termos Exatos Nome Show Curitiba',
    eventoId: 'evento-operacao',
    canal: 'Google Search',
    source: 'google',
    medium: 'cpc',
    campaign: 'search_marca_evento',
    content: 'link_direto_ingressos',
    term: 'comprar_ingresso_festival_live',
    urlDestino: 'https://newdawn.diskingressos.com.br/evento/festival-live-2026',
    urlFinal: 'https://newdawn.diskingressos.com.br/evento/festival-live-2026?utm_source=google&utm_medium=cpc&utm_campaign=search_marca_evento&utm_content=link_direto_ingressos&utm_term=comprar_ingresso_festival_live',
    visitas: 8420,
    carrinhos: 1980,
    checkouts: 940,
    compras: 512,
    taxaConversao: '6.08%',
    receitaCents: 10240000,
    ticketMedioCents: 20000,
    status: 'ATIVO',
    criadoEm: '2026-09-03T14:30:00Z',
  },
  {
    id: 'utm-03',
    nome: 'Bio do Instagram Oficial DiskIngressos',
    eventoId: 'evento-operacao',
    canal: 'Instagram Ads',
    source: 'instagram',
    medium: 'bio_link',
    campaign: 'institucional_bio',
    content: 'botao_destaque_home',
    term: 'organico',
    urlDestino: 'https://newdawn.diskingressos.com.br/evento/festival-live-2026',
    urlFinal: 'https://newdawn.diskingressos.com.br/evento/festival-live-2026?utm_source=instagram&utm_medium=bio_link&utm_campaign=institucional_bio&utm_content=botao_destaque_home&utm_term=organico',
    visitas: 12150,
    carrinhos: 2100,
    checkouts: 890,
    compras: 440,
    taxaConversao: '3.62%',
    receitaCents: 8800000,
    ticketMedioCents: 20000,
    status: 'ATIVO',
    criadoEm: '2026-09-04T09:15:00Z',
  },
  {
    id: 'utm-04',
    nome: 'QR Code Material Impresso · Cartaz Pontos de Venda',
    eventoId: 'evento-operacao',
    canal: 'Influenciador / Promoter',
    source: 'pdv_fisico',
    medium: 'qrcode_impresso',
    campaign: 'divulgacao_pontos_venda',
    content: 'totem_quiosque_shopping',
    term: 'offline_pdv',
    urlDestino: 'https://newdawn.diskingressos.com.br/evento/festival-live-2026',
    urlFinal: 'https://newdawn.diskingressos.com.br/evento/festival-live-2026?utm_source=pdv_fisico&utm_medium=qrcode_impresso&utm_campaign=divulgacao_pontos_venda&utm_content=totem_quiosque_shopping&utm_term=offline_pdv',
    visitas: 4120,
    carrinhos: 740,
    checkouts: 380,
    compras: 195,
    taxaConversao: '4.73%',
    receitaCents: 3900000,
    ticketMedioCents: 20000,
    status: 'ATIVO',
    criadoEm: '2026-09-08T16:00:00Z',
  },
  {
    id: 'utm-05',
    nome: 'WhatsApp Resgate VIP · Disparo 1-Clique',
    eventoId: 'evento-operacao',
    canal: 'WhatsApp Oficial',
    source: 'whatsapp',
    medium: 'direct_msg',
    campaign: 'resgate_carrinho_expirando',
    content: 'cta_um_clique',
    term: 'carrinho_abandonado_24h',
    urlDestino: 'https://newdawn.diskingressos.com.br/evento/festival-live-2026',
    urlFinal: 'https://newdawn.diskingressos.com.br/evento/festival-live-2026?utm_source=whatsapp&utm_medium=direct_msg&utm_campaign=resgate_carrinho_expirando&utm_content=cta_um_clique&utm_term=carrinho_abandonado_24h',
    visitas: 3200,
    carrinhos: 980,
    checkouts: 620,
    compras: 380,
    taxaConversao: '11.88%',
    receitaCents: 7600000,
    ticketMedioCents: 20000,
    status: 'ATIVO',
    criadoEm: '2026-09-10T11:00:00Z',
  },
  {
    id: 'utm-06',
    nome: 'Newsletter Semanal DiskIngressos · Destaque de Capa',
    eventoId: 'evento-operacao',
    canal: 'E-mail Marketing',
    source: 'newsletter',
    medium: 'email',
    campaign: 'newsletter_semana_38',
    content: 'banner_hero_principal',
    term: 'base_compradores_ativos',
    urlDestino: 'https://newdawn.diskingressos.com.br/evento/festival-live-2026',
    urlFinal: 'https://newdawn.diskingressos.com.br/evento/festival-live-2026?utm_source=newsletter&utm_medium=email&utm_campaign=newsletter_semana_38&utm_content=banner_hero_principal&utm_term=base_compradores_ativos',
    visitas: 6400,
    carrinhos: 910,
    checkouts: 420,
    compras: 210,
    taxaConversao: '3.28%',
    receitaCents: 4200000,
    ticketMedioCents: 20000,
    status: 'ARQUIVADO',
    criadoEm: '2026-09-14T08:00:00Z',
  },
];

export default function MarketingWorkspace({ initialTab = 'dashboard', contextEventoId, eventoId }: MarketingWorkspaceProps) {
  const { api, produtorId, eventoId: globalEventoId, evento, eventos = [] } = useProducerEvent();
  const effectiveEventoId = contextEventoId || eventoId || globalEventoId;
  const isContextual = Boolean(effectiveEventoId && effectiveEventoId !== 'todos');

  const eventosList = useMemo(() => {
    if (eventos && eventos.length > 0) return eventos;
    return [{ id: effectiveEventoId || 'evento-operacao', nome: evento?.nome || 'Festival DiskIngressos Live 2026' }];
  }, [eventos, effectiveEventoId, evento?.nome]);

  // Mapeamento de tab inicial resiliente
  const normalizeTab = (t?: string): MarketingVideoTab => {
    if (!t) return 'dashboard';
    if (t === 'ga4') return 'google-analytics';
    if (t === 'campanhas-multicanal') return 'campanhas';
    if (t === 'utm-conversoes') return 'utm';
    if (t === 'ranking') return 'atribuicao';
    if (t === 'painel') return 'dashboard';
    const validTabs: MarketingVideoTab[] = [
      'dashboard',
      'campanhas',
      'campanhas-prontas',
      'status-real',
      'meta',
      'google-analytics',
      'tiktok',
      'spotify',
      'whatsapp',
      'email',
      'automacoes',
      'cupons',
      'utm',
      'afiliados',
      'pixels',
      'atribuicao',
      'relatorios',
    ];
    return validTabs.includes(t as MarketingVideoTab) ? (t as MarketingVideoTab) : 'dashboard';
  };

  const [activeTab, setActiveTab] = useState<MarketingVideoTab>(normalizeTab(initialTab));
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  // Estados de dados
  const [campanhas, setCampanhas] = useState<any[]>(INITIAL_CAMPANHAS);
  const [cupons, setCupons] = useState<any[]>([]);
  const [pixels, setPixels] = useState<any[]>([]);
  const [linksUtm, setLinksUtm] = useState<UtmData[]>(INITIAL_UTMS);
  const [afiliados, setAfiliados] = useState<any[]>([]);
  const [statusRealData, setStatusRealData] = useState<any[]>([]);

  // Sub-abas internas
  const [subTabCampanhas, setSubTabCampanhas] = useState('Todas');
  const [subTabGA4, setSubTabGA4] = useState('Visão Geral & Desempenho');
  const [subTabTikTok, setSubTabTikTok] = useState('Campanhas & Spark Ads');
  const [subTabSpotify, setSubTabSpotify] = useState('Campanhas no Spotify');
  const [subTabWhatsApp, setSubTabWhatsApp] = useState('Campanhas de Disparo');
  const [subTabEmail, setSubTabEmail] = useState('Campanhas de E-mail');
  const [subTabUTM, setSubTabUTM] = useState<'URLs Rastreáveis' | 'Gerador Rápido & QR' | 'Comparativo de URLs' | 'Funil & Ranking'>('URLs Rastreáveis');
  const [subTabAtribuicao, setSubTabAtribuicao] = useState('Último Clique');

  // Filtros de Status Real
  const [filtroCanalStatusReal, setFiltroCanalStatusReal] = useState('todos');
  const [filtroStatusRealStatus, setFiltroStatusRealStatus] = useState('todos');
  const [buscaStatusReal, setBuscaStatusReal] = useState('');

  // Filtros de UTM
  const [buscaUtm, setBuscaUtm] = useState('');
  const [filtroCanalUtm, setFiltroCanalUtm] = useState('todos');
  const [filtroStatusUtm, setFiltroStatusUtm] = useState<'todos' | 'ATIVO' | 'ARQUIVADO'>('todos');

  // Modais de Campanhas & UTM
  const [modalNovaCampanha, setModalNovaCampanha] = useState(false);
  const [wizardInitialData, setWizardInitialData] = useState<Partial<CampaignFormData> | null>(null);

  const [modalNovoCupom, setModalNovoCupom] = useState(false);
  const [modalNovaUTM, setModalNovaUTM] = useState(false);
  const [utmModalMode, setUtmModalMode] = useState<'create' | 'edit' | 'duplicate'>('create');
  const [activeUtmForEdit, setActiveUtmForEdit] = useState<UtmData | null>(null);
  const [activeUtmForQr, setActiveUtmForQr] = useState<UtmData | null>(null);

  const [modalCompareOpen, setModalCompareOpen] = useState(false);
  const [selectedCompareUtms, setSelectedCompareUtms] = useState<UtmData[]>([INITIAL_UTMS[0]!, INITIAL_UTMS[1]!]);

  const [modalNovoPromoter, setModalNovoPromoter] = useState(false);
  const [modalTestarCAPI, setModalTestarCAPI] = useState(false);
  const [testPayloadResult, setTestPayloadResult] = useState<string | null>(null);

  // UTM Generator Form
  const [utmCanal, setUtmCanal] = useState('instagram');
  const [utmSource, setUtmSource] = useState('instagram');
  const [utmMedium, setUtmMedium] = useState('stories');
  const [utmCampaign, setUtmCampaign] = useState('lote1_lancamento');
  const [utmContent, setUtmContent] = useState('teaser_video');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedUtmId, setCopiedUtmId] = useState<string | null>(null);

  // Carregar dados
  const carregarDados = useCallback(async () => {
    if (!api) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);

    try {
      const results = await Promise.allSettled([
        fetch(`${api}/marketing/campanhas`, { signal: controller.signal }),
        fetch(`${api}/marketing/cupons`, { signal: controller.signal }),
        fetch(`${api}/marketing/pixels`, { signal: controller.signal }),
        fetch(`${api}/marketing/links`, { signal: controller.signal }),
        fetch(`${api}/marketing/status-real`, { signal: controller.signal }),
      ]);

      const [rCamp, rCup, rPix, rLink, rStatus] = results;

      if (rCamp.status === 'fulfilled' && rCamp.value.ok) {
        const data = await rCamp.value.json();
        setCampanhas(Array.isArray(data) ? data : []);
      }
      if (rCup.status === 'fulfilled' && rCup.value.ok) {
        const data = await rCup.value.json();
        setCupons(Array.isArray(data) ? data : []);
      }
      if (rPix.status === 'fulfilled' && rPix.value.ok) {
        const data = await rPix.value.json();
        setPixels(Array.isArray(data) ? data : []);
      }
      if (rLink.status === 'fulfilled' && rLink.value.ok) {
        const raw = await rLink.value.json();
        if (Array.isArray(raw) && raw.length > 0) {
          const normalized: UtmData[] = raw.map((item: any, idx: number) => ({
            id: item.id || `utm-${idx}`,
            nome: item.nome || item.utmCampaign || `Link ${item.canal || 'Rastreável'} #${idx + 1}`,
            eventoId: item.eventoId || effectiveEventoId || 'evento-operacao',
            canal: item.canal || 'Link Direto',
            source: item.utmSource || item.source || 'organico',
            medium: item.utmMedium || item.medium || 'web',
            campaign: item.utmCampaign || item.campaign || 'padrao',
            content: item.utmContent || item.content || '',
            term: item.utmTerm || item.term || '',
            urlDestino: item.urlDestino || item.urlFinal || 'https://newdawn.diskingressos.com.br',
            urlFinal: item.urlDestino || item.urlFinal || 'https://newdawn.diskingressos.com.br',
            visitas: Number(item.visitas ?? item.cliques ?? 0),
            carrinhos: Number(item.carrinhos ?? Math.round(Number(item.visitas ?? item.cliques ?? 0) * 0.15)),
            checkouts: Number(item.checkouts ?? Math.round(Number(item.visitas ?? item.cliques ?? 0) * 0.08)),
            compras: Number(item.compras ?? Math.round(Number(item.visitas ?? item.cliques ?? 0) * 0.04)),
            taxaConversao: item.taxaConversao || (Number(item.visitas ?? item.cliques ?? 0) > 0 ? `${(((Number(item.compras ?? 0)) / Number(item.visitas ?? item.cliques ?? 1)) * 100).toFixed(2)}%` : '4.20%'),
            receitaCents: Number(item.receitaCents ?? (Number(item.compras ?? 0) * 20000)),
            ticketMedioCents: Number(item.ticketMedioCents ?? 20000),
            status: item.status === 'ARQUIVADO' ? 'ARQUIVADO' : 'ATIVO',
            criadoEm: item.createdAt || item.criadoEm || new Date().toISOString(),
          }));
          setLinksUtm(normalized);
        } else {
          setLinksUtm(INITIAL_UTMS);
        }
      }
      if (rStatus.status === 'fulfilled' && rStatus.value.ok) {
        const data = await rStatus.value.json();
        setStatusRealData(Array.isArray(data) ? data : []);
      }
    } catch {
      // Fallback gracioso
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const {
    phase: actionPhase,
    currentAction,
    lastResult: actionResult,
    errorMsg: actionError,
    triggerAction,
    confirmPendingAction,
    cancelPendingAction,
    reset: resetAction,
  } = useMarketingAction({
    onSuccess: (res) => {
      setFeedback({ tipo: 'success', texto: res.message });
      void carregarDados();
    },
    onError: (err) => {
      setFeedback({ tipo: 'error', texto: err.message });
    },
  });

  // Publicação de nova campanha via wizard
  const handlePublishCampaign = (data: CampaignFormData) => {
    triggerAction('PUBLISH', {
      produtorId,
      eventoId: data.eventoId,
      campaignName: data.nome,
      provider: data.canais[0] || 'META',
      payload: data,
    });
    const newCamp = {
      id: `cmp-${Date.now()}`,
      nome: data.nome || 'Nova Campanha Multicanal',
      canal: data.canais.join(', '),
      orcamentoDiarioCents:
        data.orcamentoTipo === 'DIARIO'
          ? data.orcamentoValorBrl * 100
          : Math.round((data.orcamentoValorBrl * 100) / 30),
      cliques: 0,
      conversoes: 0,
      receitaAtribuidaCents: 0,
      status: 'ENTREGANDO',
      dataInicio: data.dataInicio,
      dataTermino: data.dataTermino,
      roas: 'Calculando...',
    };
    setCampanhas((prev) => [newCamp, ...prev]);
    setFeedback({
      tipo: 'success',
      texto: `Campanha "${data.nome}" enviada e em entrega nos canais ${data.canais.join(', ')}!`,
    });
  };

  // Salvar rascunho de campanha via wizard
  const handleSaveDraftCampaign = (data: CampaignFormData) => {
    triggerAction('SAVE_DRAFT', {
      produtorId,
      eventoId: data.eventoId,
      campaignName: data.nome,
      provider: data.canais[0] || 'META',
      payload: data,
    });
    const newCamp = {
      id: `cmp-${Date.now()}`,
      nome: data.nome || 'Rascunho de Campanha',
      canal: data.canais.join(', '),
      orcamentoDiarioCents:
        data.orcamentoTipo === 'DIARIO'
          ? data.orcamentoValorBrl * 100
          : Math.round((data.orcamentoValorBrl * 100) / 30),
      cliques: 0,
      conversoes: 0,
      receitaAtribuidaCents: 0,
      status: 'RASCUNHO',
      dataInicio: data.dataInicio,
      dataTermino: data.dataTermino,
      roas: 'N/A',
    };
    setCampanhas((prev) => [newCamp, ...prev]);
    setFeedback({
      tipo: 'success',
      texto: `Rascunho da campanha "${data.nome}" salvo com sucesso!`,
    });
  };

  // Carregar modelo de Campanhas Prontas no Wizard
  const handleUseTemplate = (modelo: any) => {
    const templateData: Partial<CampaignFormData> = {
      nome: modelo.titulo,
      eventoId: effectiveEventoId || 'evento-operacao',
      eventoNome: eventosList.find((e) => e.id === effectiveEventoId)?.nome || eventosList[0]?.nome,
      objetivo: 'CONVERSAO',
      canais: modelo.canais.includes('Google') ? ['META', 'GOOGLE'] : ['META'],
      criativoTitulo: modelo.titulo,
      criativoCopy: modelo.copy,
      criativoCta: 'Garantir Ingressos',
      publicoDetalhes: modelo.publico,
      orcamentoTipo: 'DIARIO',
      orcamentoValorBrl: 250,
    };
    setWizardInitialData(templateData);
    setModalNovaCampanha(true);
  };

  // Salvar UTM (criar ou editar)
  const handleSaveUtm = (newUtm: UtmData) => {
    setLinksUtm((prev) => {
      const idx = prev.findIndex((u) => u.id === newUtm.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = newUtm;
        return updated;
      }
      return [newUtm, ...prev];
    });
    triggerAction('CREATE_UTM', {
      produtorId,
      eventoId: newUtm.eventoId,
      payload: newUtm,
    });
    setFeedback({
      tipo: 'success',
      texto: `URL rastreável "${newUtm.nome}" salva com sucesso!`,
    });
  };

  // Duplicar UTM
  const handleDuplicateUtm = (utm: UtmData) => {
    setActiveUtmForEdit({
      ...utm,
      id: `utm-${Date.now()}`,
      nome: `${utm.nome} (Cópia)`,
      campaign: `${utm.campaign}_copia`,
      visitas: 0,
      carrinhos: 0,
      checkouts: 0,
      compras: 0,
      taxaConversao: '0.0%',
      receitaCents: 0,
    });
    setUtmModalMode('duplicate');
    setModalNovaUTM(true);
  };

  // Arquivar ou Reativar UTM
  const handleArchiveUtm = (utmId: string) => {
    setLinksUtm((prev) =>
      prev.map((u) => (u.id === utmId ? { ...u, status: u.status === 'ATIVO' ? 'ARQUIVADO' : 'ATIVO' } : u))
    );
    setFeedback({
      tipo: 'success',
      texto: 'Status da URL rastreável atualizado com sucesso!',
    });
  };

  // Selecionar ou Desmarcar para Comparação
  const handleToggleCompareSelect = (utm: UtmData) => {
    setSelectedCompareUtms((prev) => {
      const exists = prev.some((u) => u.id === utm.id);
      if (exists) {
        return prev.filter((u) => u.id !== utm.id);
      }
      if (prev.length >= 4) {
        setFeedback({ tipo: 'error', texto: 'Máximo de 4 URLs para comparação simultânea.' });
        return prev;
      }
      return [...prev, utm];
    });
  };

  // Exportar Relatório CSV de UTMs
  const handleExportUtmCSV = () => {
    triggerAction('EXPORT', {
      produtorId,
      eventoId: effectiveEventoId,
      format: 'CSV',
      reportType: 'CENTRAL_UTM',
    });
    const headers = 'ID,Nome,Canal,Source,Medium,Campaign,Content,Term,Visitas,Carrinhos,Checkouts,Compras,Conversao,Receita,Status\n';
    const rows = linksUtm.map((u) =>
      `"${u.id}","${u.nome}","${u.canal}","${u.source}","${u.medium}","${u.campaign}","${u.content}","${u.term || ''}",${u.visitas},${u.carrinhos},${u.checkouts},${u.compras},"${u.taxaConversao}",${(u.receitaCents / 100).toFixed(2)},"${u.status}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_utms_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyUtmUrl = (utm: UtmData) => {
    navigator.clipboard.writeText(utm.urlFinal);
    setCopiedUtmId(utm.id);
    setFeedback({ tipo: 'success', texto: `URL da campanha "${utm.nome}" copiada para a área de transferência!` });
    setTimeout(() => setCopiedUtmId(null), 2500);
  };

  const campanhasFiltradas = useMemo(() => {
    if (subTabCampanhas === 'Todas') return campanhas;
    if (subTabCampanhas === 'Ativas') return campanhas.filter((c) => c.status === 'ENTREGANDO');
    if (subTabCampanhas === 'Agendadas') return campanhas.filter((c) => c.status === 'AGENDADA');
    if (subTabCampanhas === 'Pausadas') return campanhas.filter((c) => c.status === 'PAUSADA');
    if (subTabCampanhas === 'Finalizadas') return campanhas.filter((c) => c.status === 'FINALIZADA');
    if (subTabCampanhas === 'Rascunhos') return campanhas.filter((c) => c.status === 'RASCUNHO');
    return campanhas;
  }, [campanhas, subTabCampanhas]);

  const handleEditCampaign = (camp: any) => {
    setWizardInitialData({
      nome: camp.nome,
      eventoId: effectiveEventoId || 'evento-operacao',
      eventoNome: eventosList.find((e) => e.id === effectiveEventoId)?.nome || eventosList[0]?.nome,
      canais: camp.canal?.includes('Google') ? ['GOOGLE'] : camp.canal?.includes('Spotify') ? ['SPOTIFY'] : ['META'],
      orcamentoValorBrl: Math.round((camp.orcamentoDiarioCents || 10000) / 100),
      dataInicio: camp.dataInicio || '2026-09-01',
      dataTermino: camp.dataTermino || '2026-10-30',
      criativoTitulo: camp.nome,
    });
    setModalNovaCampanha(true);
  };

  const handleTogglePauseCampaign = (camp: any) => {
    const isPaused = camp.status === 'PAUSADA';
    const nextStatus = isPaused ? 'ENTREGANDO' : 'PAUSADA';
    setCampanhas((prev) => prev.map((c) => (c.id === camp.id ? { ...c, status: nextStatus } : c)));
    triggerAction(isPaused ? 'RESUME' : 'PAUSE', {
      produtorId,
      eventoId: effectiveEventoId,
      campaignName: camp.nome,
      provider: 'META',
    });
    setFeedback({
      tipo: 'success',
      texto: isPaused ? `Campanha "${camp.nome}" retomada!` : `Campanha "${camp.nome}" pausada!`,
    });
  };

  const handleDuplicateCampaign = (camp: any) => {
    const dup = {
      ...camp,
      id: `cmp-${Date.now()}`,
      nome: `${camp.nome} (Cópia)`,
      status: 'RASCUNHO',
      cliques: 0,
      conversoes: 0,
      receitaAtribuidaCents: 0,
      roas: 'N/A',
    };
    setCampanhas((prev) => [dup, ...prev]);
    setFeedback({ tipo: 'success', texto: `Campanha "${dup.nome}" duplicada como rascunho!` });
  };

  const filteredUtms = useMemo(() => {
    return (linksUtm || []).filter((u) => {
      if (!u) return false;
      const q = (buscaUtm || '').toLowerCase().trim();
      const nome = (u.nome || '').toLowerCase();
      const campaign = (u.campaign || '').toLowerCase();
      const source = (u.source || '').toLowerCase();
      const canal = (u.canal || '').toLowerCase();

      const matchBusca =
        !q ||
        nome.includes(q) ||
        campaign.includes(q) ||
        source.includes(q) ||
        canal.includes(q);

      const matchCanal =
        filtroCanalUtm === 'todos' || canal.includes((filtroCanalUtm || '').toLowerCase());

      const matchStatus = filtroStatusUtm === 'todos' || u.status === filtroStatusUtm;

      return matchBusca && matchCanal && matchStatus;
    });
  }, [linksUtm, buscaUtm, filtroCanalUtm, filtroStatusUtm]);

  const utmAggregates = useMemo(() => {
    const list = linksUtm || [];
    const totalVisitas = list.reduce((acc, u) => acc + (u?.visitas || 0), 0);
    const totalCarrinhos = list.reduce((acc, u) => acc + (u?.carrinhos || 0), 0);
    const totalCheckouts = list.reduce((acc, u) => acc + (u?.checkouts || 0), 0);
    const totalCompras = list.reduce((acc, u) => acc + (u?.compras || 0), 0);
    const totalReceitaCents = list.reduce((acc, u) => acc + (u?.receitaCents || 0), 0);
    const convGeral = totalVisitas > 0 ? ((totalCompras / totalVisitas) * 100).toFixed(2) + '%' : '0.0%';
    const ticketMedioGeralCents = totalCompras > 0 ? Math.round(totalReceitaCents / totalCompras) : 0;

    return {
      totalVisitas,
      totalCarrinhos,
      totalCheckouts,
      totalCompras,
      totalReceitaCents,
      convGeral,
      ticketMedioGeralCents,
    };
  }, [linksUtm]);

  // Sincronizar Status Real
  const handleSincronizarStatusReal = () => {
    triggerAction('SYNC', {
      produtorId,
      eventoId: effectiveEventoId,
      provider: 'META',
    });
  };

  // Disparo de teste CAPI
  const handleEnviarPingCAPI = (canal: string) => {
    const providerMap: Record<string, Provider> = {
      'Meta Ads': 'META',
      'Meta Ads CAPI': 'META',
      'Spotify Ads': 'SPOTIFY',
      'Google Analytics': 'GOOGLE',
      'TikTok Ads': 'TIKTOK',
    };
    const provider: Provider = providerMap[canal] || 'META';
    const payload = {
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: 'https://newdawn.diskingressos.com.br/checkout/sucesso',
      user_data: {
        em: 'f660ab912ec121d1b1e928a0bb4bc61b15f5ad44d5efdc4e1c92a25e99b8e44a',
        client_ip_address: '177.182.90.12',
        client_user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      custom_data: {
        currency: 'BRL',
        value: 350.0,
        content_name: 'Ingresso Pista Premium - Lote 1',
        order_id: `PED-${Date.now()}`,
      },
      action_source: 'website',
    };
    setTestPayloadResult(JSON.stringify(payload, null, 2));
    triggerAction('TEST_EVENT', {
      produtorId,
      eventoId: effectiveEventoId,
      provider,
      payload,
    });
  };

  const urlGerada = useMemo(() => {
    const base = 'https://newdawn.diskingressos.com.br/evento/festival-verao-2026';
    const params = new URLSearchParams();
    if (utmSource) params.set('utm_source', utmSource);
    if (utmMedium) params.set('utm_medium', utmMedium);
    if (utmCampaign) params.set('utm_campaign', utmCampaign);
    if (utmContent) params.set('utm_content', utmContent);
    return `${base}?${params.toString()}`;
  }, [utmSource, utmMedium, utmCampaign, utmContent]);

  const handleCopiarLink = () => {
    navigator.clipboard.writeText(urlGerada);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Matriz de navegação oficial do vídeo (17 itens)
  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: <Gauge size={14} /> },
    { id: 'campanhas', label: 'Campanhas', icon: <Megaphone size={14} /> },
    { id: 'campanhas-prontas', label: 'Campanhas Prontas', badge: 'PRONTO', icon: <Zap size={14} /> },
    { id: 'status-real', label: 'Status Real', badge: 'AO VIVO', icon: <Activity size={14} /> },
    { id: 'meta', label: 'Meta Ads & CAPI', badge: 'CAPI', icon: <Target size={14} /> },
    { id: 'google-analytics', label: 'Google Analytics', badge: 'GA4', icon: <BarChart3 size={14} /> },
    { id: 'tiktok', label: 'TikTok Ads', badge: 'PIXEL', icon: <Activity size={14} /> },
    { id: 'spotify', label: 'Spotify Ads', badge: 'ÁUDIO', icon: <Music2 size={14} /> },
    { id: 'whatsapp', label: 'WhatsApp', badge: 'OFICIAL', icon: <MessageCircle size={14} /> },
    { id: 'email', label: 'E-mail Marketing', icon: <Mail size={14} /> },
    { id: 'automacoes', label: 'Automações', icon: <Workflow size={14} /> },
    { id: 'cupons', label: 'Cupons', icon: <Tags size={14} /> },
    { id: 'utm', label: 'Central UTM / QR', badge: 'UTM / QR', icon: <Link2 size={14} /> },
    { id: 'afiliados', label: 'Afiliados & Promoters', icon: <Users size={14} /> },
    { id: 'pixels', label: 'Pixels & Conversões', badge: 'MULTI-PIXEL', icon: <Target size={14} /> },
    { id: 'atribuicao', label: 'Atribuição Multicanal', icon: <GitBranch size={14} /> },
    { id: 'relatorios', label: 'Relatórios', icon: <FileBarChart size={14} /> },
  ];

  return (
    <div className="space-y-6 max-w-[1550px] mx-auto pb-12">
      {/* Header Geral */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-2">
            <Megaphone size={13} />
            <span>EDDIE 11.16.11 — Recuperação Integral das 17 Telas do Vídeo</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <span>Central de Marketing & Growth Multicanal</span>
            {isContextual && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 font-medium">
                Evento: {effectiveEventoId}
              </span>
            )}
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Aquisição, tráfego pago, CAPI, GA4, TikTok, Spotify, WhatsApp Oficial, UTMs com QR e atribuição.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setModalNovaCampanha(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/20 transition"
          >
            <Plus size={14} />
            <span>Nova Campanha</span>
          </button>

          <button
            type="button"
            onClick={() => setModalNovaUTM(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition"
          >
            <Link2 size={14} />
            <span>Gerar Link UTM</span>
          </button>

          <button
            type="button"
            onClick={() => void carregarDados()}
            className="p-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 transition"
            title="Atualizar dados de marketing"
          >
            <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
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

      {/* Navegação Oficial em 17 Abas (Sem quebra, com scroll seguro) */}
      <ModuleNavigation
        items={NAV_ITEMS}
        activeItem={activeTab}
        onSelect={(id) => setActiveTab(id as MarketingVideoTab)}
        ariaLabel="Navegação das 17 Telas de Marketing"
      />

      {/* ============================================================== */}
      {/* 1. DASHBOARD MARKETING */}
      {/* ============================================================== */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Top KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-3.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vendas Atribuídas</span>
              <div className="text-xl font-black text-emerald-400 font-mono mt-1.5">{formatBRL(4800000)}</div>
              <span className="text-[10px] text-emerald-400 font-semibold">+18.4% vs mês anterior</span>
            </div>
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-3.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Investimento Total</span>
              <div className="text-xl font-black text-white font-mono mt-1.5">{formatBRL(800000)}</div>
              <span className="text-[10px] text-slate-400">Meta + Google + TikTok + Spotify</span>
            </div>
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-3.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ROAS Consolidado</span>
              <div className="text-xl font-black text-purple-400 font-mono mt-1.5">6.00x</div>
              <span className="text-[10px] text-purple-400 font-semibold">R$ 6,00 de retorno p/ R$ 1</span>
            </div>
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-3.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Conversões / Ingressos</span>
              <div className="text-xl font-black text-white font-mono mt-1.5">240</div>
              <span className="text-[10px] text-slate-400">Ingressos pagos</span>
            </div>
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-3.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CPA Médio</span>
              <div className="text-xl font-black text-sky-400 font-mono mt-1.5">{formatBRL(3333)}</div>
              <span className="text-[10px] text-sky-400 font-semibold">Custo por ingresso vendido</span>
            </div>
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-3.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CTR Global</span>
              <div className="text-xl font-black text-white font-mono mt-1.5">4.52%</div>
              <span className="text-[10px] text-emerald-400 font-semibold">5.310 cliques totais</span>
            </div>
          </div>

          {/* Atalhos Rápidos para as Telas do Vídeo */}
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
              Módulos Integrados do Vídeo
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {[
                { tab: 'status-real', label: 'Status Real & Entrega', icon: <Activity size={14} className="text-emerald-400" /> },
                { tab: 'campanhas-prontas', label: 'Campanhas Prontas', icon: <Zap size={14} className="text-amber-400" /> },
                { tab: 'spotify', label: 'Spotify Ads & CAPI', icon: <Music2 size={14} className="text-emerald-400" /> },
                { tab: 'google-analytics', label: 'Google Analytics GA4', icon: <BarChart3 size={14} className="text-sky-400" /> },
                { tab: 'utm', label: 'Central UTM / QR', icon: <Link2 size={14} className="text-purple-400" /> },
                { tab: 'atribuicao', label: 'Atribuição Multicanal', icon: <GitBranch size={14} className="text-indigo-400" /> },
              ].map((item) => (
                <button
                  key={item.tab}
                  onClick={() => setActiveTab(item.tab as MarketingVideoTab)}
                  className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-left transition flex items-center gap-2"
                >
                  {item.icon}
                  <span className="text-xs font-semibold text-slate-300 truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Ranking de Campanhas Ativas */}
          <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Ranking de Campanhas de Maior Retorno (ROAS)</h3>
                <p className="text-slate-400 text-xs">Desempenho consolidado por canal com atribuição direta de vendas.</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Campanha</th>
                    <th className="p-3.5">Canal</th>
                    <th className="p-3.5 text-right">Investimento</th>
                    <th className="p-3.5 text-right">Receita Atribuída</th>
                    <th className="p-3.5 text-center">ROAS</th>
                    <th className="p-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {[
                    { nome: 'Meta Ads · Carrossel Line-up Atrações', canal: 'Meta Ads', gasto: 500000, receita: 2840000, roas: '5.68x', status: 'ENTREGANDO' },
                    { nome: 'Google Search · Palavras-Chave Nome Artista', canal: 'Google Search', gasto: 300000, receita: 1960000, roas: '6.53x', status: 'ENTREGANDO' },
                    { nome: 'Spotify Audio Ads · Retargeting Ouvintes', canal: 'Spotify Ads', gasto: 120000, receita: 680000, roas: '5.66x', status: 'EM_ANALISE' },
                  ].map((camp, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition">
                      <td className="p-3.5 font-bold text-white">{camp.nome}</td>
                      <td className="p-3.5 text-slate-400">{camp.canal}</td>
                      <td className="p-3.5 text-right font-mono text-slate-300">{formatBRL(camp.gasto)}</td>
                      <td className="p-3.5 text-right font-mono font-bold text-emerald-400">{formatBRL(camp.receita)}</td>
                      <td className="p-3.5 text-center font-mono font-bold text-purple-400">{camp.roas}</td>
                      <td className="p-3.5 text-center">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                          {camp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. CAMPANHAS MULTICANAIS */}
      {/* ============================================================== */}
      {activeTab === 'campanhas' && (
        <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Megaphone size={16} className="text-purple-400" />
                <span>Central de Campanhas Multicanais</span>
              </h2>
              <p className="text-slate-400 text-xs">Planejamento, ativação e métricas de anúncios em Meta, Google, TikTok e Spotify.</p>
            </div>
            <button
              onClick={() => setModalNovaCampanha(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
            >
              <Plus size={14} /> Nova Campanha
            </button>
          </div>

          <div className="px-6 pt-3 border-b border-slate-800 flex gap-2">
            {['Todas', 'Ativas', 'Agendadas', 'Pausadas', 'Finalizadas', 'Rascunhos'].map((st) => (
              <button
                key={st}
                onClick={() => setSubTabCampanhas(st)}
                className={`px-3 py-1.5 text-xs font-semibold border-b-2 transition ${
                  subTabCampanhas === st
                    ? 'border-purple-500 text-purple-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Nome da Campanha</th>
                  <th className="p-3.5">Canal</th>
                  <th className="p-3.5 text-right">Orçamento Diário</th>
                  <th className="p-3.5 text-center">Cliques</th>
                  <th className="p-3.5 text-center">Conversões</th>
                  <th className="p-3.5 text-right">Receita Atribuída</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {campanhasFiltradas.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/30 transition">
                    <td className="p-3.5 font-bold text-white">{c.nome}</td>
                    <td className="p-3.5 text-slate-400">{c.canal}</td>
                    <td className="p-3.5 text-right font-mono text-slate-300">{formatBRL(c.orcamentoDiarioCents)}</td>
                    <td className="p-3.5 text-center font-mono">{c.cliques || '—'}</td>
                    <td className="p-3.5 text-center font-mono font-bold text-white">{c.conversoes || '—'}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-emerald-400">{formatBRL(c.receitaAtribuidaCents)}</td>
                    <td className="p-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.status === 'ENTREGANDO'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : c.status === 'PAUSADA'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : c.status === 'AGENDADA'
                          ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                          : c.status === 'RASCUNHO'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleEditCampaign(c)}
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                          title="Editar Campanha no Wizard"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTogglePauseCampaign(c)}
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                          title={c.status === 'PAUSADA' ? 'Retomar Campanha' : 'Pausar Campanha'}
                        >
                          {c.status === 'PAUSADA' ? (
                            <Play size={13} className="text-emerald-400" />
                          ) : (
                            <Pause size={13} className="text-amber-400" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicateCampaign(c)}
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                          title="Duplicar Campanha"
                        >
                          <Copy size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. CAMPANHAS PRONTAS (PRONTO) */}
      {/* ============================================================== */}
      {activeTab === 'campanhas-prontas' && (
        <div className="space-y-4">
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-5">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap size={16} className="text-amber-400" />
              <span>Modelos Pré-Configurados de Campanhas para Eventos</span>
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              Ative réguas de tráfego pré-formatadas para as etapas cruciais de venda com UTMs e criativos padronizados.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                titulo: '1. Pré-venda VIP de Clientes Cadastrados',
                canais: 'Meta Ads + WhatsApp Oficial',
                copy: 'Acesso antecipado exclusivo para inscritos. 24 horas antes do lote geral.',
                publico: 'Lista VIP de E-mail / Telefone',
                roas: '8.5x Estimado',
              },
              {
                titulo: '2. Lançamento Oficial · Lote 1',
                canais: 'Meta Ads + Google Search + TikTok Ads',
                copy: 'Vendas abertas! Garanta seu ingresso do Lote 1 antes da virada de preço.',
                publico: 'Engajamento no Instagram + Lookalike',
                roas: '6.2x Estimado',
              },
              {
                titulo: '3. Alerta de Virada de Lote (48 Horas)',
                canais: 'Meta Stories + WhatsApp Marketing',
                copy: 'O Lote 1 está terminando! Últimas 48h para pagar menos no evento.',
                publico: 'Visitantes dos últimos 14 dias sem compra',
                roas: '7.8x Estimado',
              },
              {
                titulo: '4. Últimos Ingressos · Reta Final',
                canais: 'Meta Reels + Spotify Audio Ads',
                copy: 'Restam menos de 500 ingressos! Prepare-se para a maior noite do ano.',
                publico: 'Retargeting Geral + Ouvintes de Spotify',
                roas: '5.4x Estimado',
              },
              {
                titulo: '5. Sold Out & Inscrição para Sessão Extra',
                canais: 'E-mail Marketing + WhatsApp',
                copy: 'Ingressos esgotados! Cadastre-se na lista de espera para liberação de novos lotes.',
                publico: 'Visitantes que abandonaram carrinho',
                roas: 'N/A (Lead Capture)',
              },
            ].map((modelo, i) => (
              <div key={i} className="bg-[#111827] border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between hover:border-slate-700 transition">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                      MODELO RECOMENDADO
                    </span>
                    <span className="text-[10px] text-purple-400 font-mono font-bold">{modelo.roas}</span>
                  </div>
                  <h3 className="text-xs font-bold text-white mt-2">{modelo.titulo}</h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{modelo.copy}</p>
                  <div className="mt-3 pt-2 border-t border-slate-800 space-y-1 text-[10px]">
                    <div className="text-slate-500"><span className="text-slate-400 font-semibold">Canais:</span> {modelo.canais}</div>
                    <div className="text-slate-500"><span className="text-slate-400 font-semibold">Público:</span> {modelo.publico}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleUseTemplate(modelo)}
                  className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition hover:border-purple-500"
                >
                  Usar Modelo
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. STATUS REAL & TELEMETRIA DE ENTREGA (AO VIVO) */}
      {/* ============================================================== */}
      {activeTab === 'status-real' && (
        <div className="space-y-4">
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity size={16} className="text-emerald-400" />
                  <span>Central de Status Real & Telemetria de Entrega</span>
                </h2>
                <p className="text-slate-400 text-xs">
                  Auditoria de veiculação em tempo real para detectar anúncios pausados, rejeições e falta de entrega nas redes.
                </p>
              </div>
              <button
                onClick={handleSincronizarStatusReal}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
              >
                <RefreshCcw size={13} /> Sincronizar Agora
              </button>
            </div>

            {/* 4 Cards de Entrega */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-900/60 border border-emerald-500/20 rounded-xl p-3.5">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Ativas Entregando</span>
                <div className="text-2xl font-black text-white mt-1">3</div>
                <span className="text-[10px] text-slate-500">Impressões normais nas últimas 6h</span>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Ativas sem Entrega</span>
                <div className="text-2xl font-black text-white mt-1">0</div>
                <span className="text-[10px] text-slate-500">Sem impressões registradas</span>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">Em Análise / Fila</span>
                <div className="text-2xl font-black text-white mt-1">1</div>
                <span className="text-[10px] text-slate-500">Aguardando aprovação na plataforma</span>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Problemas / Rejeições</span>
                <div className="text-2xl font-black text-white mt-1">0</div>
                <span className="text-[10px] text-emerald-400 font-semibold">Nenhuma rejeição crítica</span>
              </div>
            </div>
          </div>

          {/* Tabela de Telemetria por Campanha */}
          <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <select
                  value={filtroCanalStatusReal}
                  onChange={(e) => setFiltroCanalStatusReal(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="todos">Todos os Canais</option>
                  <option value="meta">Meta Ads</option>
                  <option value="google">Google Ads</option>
                  <option value="tiktok">TikTok Ads</option>
                  <option value="spotify">Spotify Ads</option>
                </select>
                <select
                  value={filtroStatusRealStatus}
                  onChange={(e) => setFiltroStatusRealStatus(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="todos">Todos os Status</option>
                  <option value="entregando">Entregando</option>
                  <option value="analise">Em Análise</option>
                  <option value="pausada">Pausada</option>
                </select>
              </div>

              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar campanha por ID ou nome..."
                  value={buscaStatusReal}
                  onChange={(e) => setBuscaStatusReal(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 w-64"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Canal</th>
                    <th className="p-3.5">Campanha / Evento</th>
                    <th className="p-3.5 text-center">Status Plataforma</th>
                    <th className="p-3.5 text-center">Status Real</th>
                    <th className="p-3.5 text-right">Impressões 6h</th>
                    <th className="p-3.5 text-right">Cliques 6h</th>
                    <th className="p-3.5 text-right">Gasto 6h</th>
                    <th className="p-3.5">Diagnóstico & Causa</th>
                    <th className="p-3.5 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {[
                    { canal: 'Meta Ads', nome: 'Carrossel Line-up Atrações (ID: 849201)', statusPlat: 'ATIVA', statusReal: 'ENTREGANDO', imp: 14200, cli: 642, gasto: 15000, diag: 'Entrega saudável; CPM estável a R$ 10,50' },
                    { canal: 'Google Ads', nome: 'Search Palavras-Chave Nome Artista', statusPlat: 'ATIVA', statusReal: 'ENTREGANDO', imp: 5800, cli: 410, gasto: 12000, diag: 'Índice de qualidade 9/10; parcela de impressões 84%' },
                    { canal: 'Spotify Ads', nome: 'Retargeting Ouvintes Música (ID: 9812)', statusPlat: 'EM_ANALISE', statusReal: 'EM_ANALISE', imp: 0, cli: 0, gasto: 0, diag: 'Áudio em fila de moderação pela equipe do Spotify' },
                    { canal: 'TikTok Ads', nome: 'Spark Ads Vídeo Teaser Oficial', statusPlat: 'ATIVA', statusReal: 'ENTREGANDO', imp: 22400, cli: 890, gasto: 18000, diag: 'Taxa de conclusão de 6 segundos em 42%' },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition">
                      <td className="p-3.5 font-bold text-white">{row.canal}</td>
                      <td className="p-3.5 font-medium">{row.nome}</td>
                      <td className="p-3.5 text-center">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-slate-300">
                          {row.statusPlat}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${row.statusReal === 'ENTREGANDO' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'}`}>
                          {row.statusReal}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-mono text-slate-300">{row.imp.toLocaleString('pt-BR')}</td>
                      <td className="p-3.5 text-right font-mono text-slate-300">{row.cli.toLocaleString('pt-BR')}</td>
                      <td className="p-3.5 text-right font-mono font-bold text-emerald-400">{formatBRL(row.gasto)}</td>
                      <td className="p-3.5 text-slate-400 max-w-[250px] truncate">{row.diag}</td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => setFeedback({ tipo: 'success', texto: `Campanha "${row.nome}" re-sincronizada com o canal ${row.canal}.` })}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold border border-slate-700"
                        >
                          Sincronizar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. META ADS & PIXEL / CAPI */}
      {/* ============================================================== */}
      {activeTab === 'meta' && (
        <div className="space-y-4">
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Target size={16} className="text-purple-400" />
                  <span>Meta Pixel & Conversions API (CAPI) Server-Side</span>
                </h2>
                <p className="text-slate-400 text-xs">
                  Transmissão dupla (Navegador + Servidor) para mitigar bloqueadores e garantir 100% de mensuração.
                </p>
              </div>
              <button
                onClick={() => handleEnviarPingCAPI('Meta Ads CAPI')}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition"
              >
                <Zap size={13} /> Testar Evento CAPI
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Pixel ID Principal</span>
                <div className="text-sm font-mono font-bold text-white mt-1">849201948102938</div>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                  <CheckCircle2 size={12} /> Conectado & Ativo
                </span>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Match Quality Score (EMQ)</span>
                <div className="text-sm font-mono font-bold text-purple-400 mt-1">8.4 / 10 (Excelente)</div>
                <span className="text-[10px] text-slate-400 mt-1">Hashing SHA-256 de e-mail e telefone</span>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Deduplicação de Eventos</span>
                <div className="text-sm font-mono font-bold text-emerald-400 mt-1">100% dos Eventos</div>
                <span className="text-[10px] text-slate-400 mt-1">Chave única event_id correspondente</span>
              </div>
            </div>
          </div>

          {testPayloadResult && (
            <div className="bg-[#111827] border border-purple-500/30 rounded-xl p-4 space-y-2">
              <span className="text-xs font-bold text-purple-400">Último Payload CAPI Emitido (HTTP 200 OK):</span>
              <pre className="bg-black/60 p-3 rounded text-[11px] font-mono text-emerald-300 overflow-x-auto">
                {testPayloadResult}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. GOOGLE ANALYTICS 4 (GA4) */}
      {/* ============================================================== */}
      {activeTab === 'google-analytics' && (
        <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 size={16} className="text-sky-400" />
                <span>Google Analytics 4 & Measurement Protocol</span>
              </h2>
              <p className="text-slate-400 text-xs">Acompanhamento e-commerce de ponta a ponta e DebugView em tempo real.</p>
            </div>
            <button
              onClick={() => handleEnviarPingCAPI('Google Analytics 4')}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition"
            >
              <Send size={13} /> Enviar Ping DebugView
            </button>
          </div>

          <div className="px-6 pt-3 border-b border-slate-800 flex gap-2">
            {[
              'Visão Geral & Desempenho',
              'Funil de Compras E-commerce',
              'Canais de Aquisição',
              'DebugView em Tempo Real',
              'Configuração & Consent Mode',
            ].map((st) => (
              <button
                key={st}
                onClick={() => setSubTabGA4(st)}
                className={`px-3 py-1.5 text-xs font-semibold border-b-2 transition ${
                  subTabGA4 === st
                    ? 'border-sky-500 text-sky-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="p-6">
            {subTabGA4 === 'Visão Geral & Desempenho' && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Usuários Ativos (30d)</span>
                  <div className="text-2xl font-black text-white mt-1">42.850</div>
                  <span className="text-[10px] text-emerald-400 font-semibold">+12% vs período anterior</span>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Visualizações de Página</span>
                  <div className="text-2xl font-black text-white mt-1">118.420</div>
                  <span className="text-[10px] text-slate-400">2.76 páginas / sessão</span>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Taxa de Engajamento</span>
                  <div className="text-2xl font-black text-sky-400 mt-1">64.2%</div>
                  <span className="text-[10px] text-slate-400">Duração média: 2m 14s</span>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Receita E-commerce (GA4)</span>
                  <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{formatBRL(4800000)}</div>
                  <span className="text-[10px] text-slate-400">Measurement Protocol validado</span>
                </div>
              </div>
            )}

            {subTabGA4 === 'Funil de Compras E-commerce' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Etapas de Conversão do Ingresso</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {[
                    { step: '1. page_view', qtd: '42.850', pct: '100%' },
                    { step: '2. view_item', qtd: '24.200', pct: '56.4%' },
                    { step: '3. add_to_cart', qtd: '8.400', pct: '19.6%' },
                    { step: '4. begin_checkout', qtd: '4.100', pct: '9.5%' },
                    { step: '5. purchase', qtd: '1.840', pct: '4.2%' },
                  ].map((f, i) => (
                    <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 text-center">
                      <span className="text-[10px] font-mono text-sky-400 font-bold block">{f.step}</span>
                      <div className="text-xl font-black text-white mt-1">{f.qtd}</div>
                      <span className="text-[10px] text-slate-500">{f.pct} do total</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {subTabGA4 !== 'Visão Geral & Desempenho' && subTabGA4 !== 'Funil de Compras E-commerce' && (
              <div className="bg-slate-900/40 p-4 rounded-lg border border-slate-800 text-xs text-slate-300">
                Visualização de {subTabGA4} integrada com o Stream de Dados GA4 do produtor. Consent Mode v2 em conformidade com LGPD.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. TIKTOK ADS */}
      {/* ============================================================== */}
      {activeTab === 'tiktok' && (
        <div className="space-y-4">
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity size={16} className="text-rose-400" />
                  <span>TikTok Ads for Business & Events API</span>
                </h2>
                <p className="text-slate-400 text-xs">Spark Ads, criativos virais em vídeo e pixel com Events API server-side.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFeedback({ tipo: 'success', texto: 'Conexão com TikTok Pixel & Events API validada com sucesso!' })}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold"
                >
                  Testar Conexão TikTok
                </button>
                <button
                  onClick={() => setFeedback({ tipo: 'success', texto: 'Assistente de criação Spark Ad iniciado.' })}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                >
                  Criar Spark Ad
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Investimento TikTok</span>
                <div className="text-xl font-black text-white font-mono mt-1">{formatBRL(120000)}</div>
                <span className="text-[10px] text-slate-400">R$ 1.200 aplicados</span>
              </div>
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Video Views (2s+)</span>
                <div className="text-xl font-black text-rose-400 mt-1">84.200</div>
                <span className="text-[10px] text-slate-400">CPV médio de R$ 0,014</span>
              </div>
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase">ROAS Atribuído</span>
                <div className="text-xl font-black text-purple-400 font-mono mt-1">4.20x</div>
                <span className="text-[10px] text-emerald-400 font-semibold">R$ 5.040 em ingressos</span>
              </div>
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Ingressos Vendidos</span>
                <div className="text-xl font-black text-white mt-1">36 un.</div>
                <span className="text-[10px] text-slate-400">CPA de R$ 33,33</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 8. SPOTIFY ADS & CAPI */}
      {/* ============================================================== */}
      {activeTab === 'spotify' && (
        <div className="space-y-4">
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Music2 size={16} className="text-emerald-400" />
                  <span>Spotify Ad Studio & Conversões CAPI de Áudio</span>
                </h2>
                <p className="text-slate-400 text-xs">
                  Anúncios de áudio com banner companion, segmentação por afinidade musical dos artistas do evento e CAPI.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEnviarPingCAPI('Spotify Ads CAPI')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold"
                >
                  Testar CAPI Áudio
                </button>
                <button
                  onClick={() => setFeedback({ tipo: 'success', texto: 'Painel de configuração de credenciais Spotify Ad Studio aberto.' })}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  Configurar Credenciais
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Investimento Áudio</span>
                <div className="text-xl font-black text-white font-mono mt-1">{formatBRL(120000)}</div>
                <span className="text-[10px] text-slate-400">Campanha Ativa</span>
              </div>
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Ouvintes Únicos</span>
                <div className="text-xl font-black text-emerald-400 mt-1">28.400</div>
                <span className="text-[10px] text-slate-400">Frequência média: 1.8x</span>
              </div>
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Conclusão de Áudio</span>
                <div className="text-xl font-black text-white mt-1">94.2%</div>
                <span className="text-[10px] text-emerald-400 font-semibold">Listen-Through Rate</span>
              </div>
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Receita Atribuída (ROAS)</span>
                <div className="text-xl font-black text-purple-400 font-mono mt-1">5.66x</div>
                <span className="text-[10px] text-purple-400 font-semibold">{formatBRL(680000)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 9. WHATSAPP MARKETING */}
      {/* ============================================================== */}
      {activeTab === 'whatsapp' && (
        <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageCircle size={16} className="text-emerald-400" />
                <span>WhatsApp Business Cloud API — Disparos Oficiais</span>
              </h2>
              <p className="text-slate-400 text-xs">Templates pré-aprovados pela Meta, preview em balão interativo e taxa de abertura de 94%.</p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Templates Oficiais Aprovados</h3>
              <div className="space-y-3">
                {[
                  { id: 'tmp-1', nome: 'aviso_virada_lote_v2', texto: 'Olá {{1}}! O Lote 1 do {{2}} está acabando. Garanta agora seu ingresso antes do aumento.', status: 'APROVADO' },
                  { id: 'tmp-2', nome: 'confirmacao_pix_ingresso', texto: 'Recebemos seu pedido #{{1}}! Seu ingresso está disponível no app DiskIngressos.', status: 'APROVADO' },
                ].map((t) => (
                  <div key={t.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-emerald-400">{t.nome}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                        {t.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-mono">{t.texto}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Preview Balão do WhatsApp */}
            <div className="bg-[#0b141a] border border-slate-800 rounded-2xl p-5 max-w-sm mx-auto shadow-2xl space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-xs">Di</div>
                <div>
                  <div className="text-xs font-bold text-white">DiskIngressos Oficial</div>
                  <div className="text-[9px] text-emerald-400">Conta Comercial Verificada</div>
                </div>
              </div>

              <div className="bg-[#202c33] text-[#e9edef] rounded-lg p-3 text-xs space-y-2 rounded-tl-none shadow">
                <p>Olá <strong>Carlos</strong>! O Lote 1 do <strong>Festival de Verão 2026</strong> está terminando hoje às 23h59.</p>
                <p>Garanta seu lugar na Pista Premium com o valor promocional antes da virada.</p>
                <div className="text-[10px] text-slate-400 text-right">14:32 ✓✓</div>
              </div>

              <div className="bg-[#202c33] text-sky-400 rounded-lg p-2.5 text-center text-xs font-bold hover:bg-[#2a3942] cursor-pointer transition">
                Comprar Ingresso Agora
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 10. E-MAIL MARKETING */}
      {/* ============================================================== */}
      {activeTab === 'email' && (
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Mail size={16} className="text-purple-400" />
                <span>E-mail Marketing & Entregabilidade SMTP</span>
              </h2>
              <p className="text-slate-400 text-xs">Disparos segmentados, testes A/B de assunto e monitoramento de bounces e cliques.</p>
            </div>
            <button
              onClick={() => setFeedback({ tipo: 'success', texto: 'Assistente de novo disparo de e-mail aberto.' })}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
            >
              <Plus size={13} /> Novo Disparo de E-mail
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase">E-mails Disparados</span>
              <div className="text-xl font-black text-white mt-1">84.500</div>
              <span className="text-[10px] text-emerald-400 font-semibold">99.2% de entregabilidade</span>
            </div>
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Taxa de Abertura</span>
              <div className="text-xl font-black text-purple-400 mt-1">34.8%</div>
              <span className="text-[10px] text-slate-400">29.400 leituras únicas</span>
            </div>
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Cliques / CTOR</span>
              <div className="text-xl font-black text-white mt-1">14.2%</div>
              <span className="text-[10px] text-slate-400">4.170 cliques no CTA</span>
            </div>
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Receita E-mail</span>
              <div className="text-xl font-black text-emerald-400 font-mono mt-1">{formatBRL(980000)}</div>
              <span className="text-[10px] text-emerald-400 font-semibold">ROAS infinito (base própria)</span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 11. AUTOMAÇÕES & JORNADAS */}
      {/* ============================================================== */}
      {activeTab === 'automacoes' && (
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Workflow size={16} className="text-purple-400" />
              <span>Automações & Réguas de Engajamento</span>
            </h2>
            <p className="text-slate-400 text-xs">Gatilhos programados para recuperar checkouts e avisar sobre viradas de lote.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { nome: 'Resgate de Carrinho em 15 Minutos', gatilho: 'Abandono de Checkout', canal: 'WhatsApp Oficial 1-Clique', status: 'ATIVO', rec: 'R$ 49.200 recuperados' },
              { nome: 'Alerta de Virada de Lote D-2', gatilho: '48h antes do aumento', canal: 'E-mail + WhatsApp', status: 'ATIVO', rec: 'R$ 84.000 gerados' },
              { nome: 'Boas-vindas & Ingresso no App', gatilho: 'Confirmação de Pagamento', canal: 'WhatsApp com QR Code', status: 'ATIVO', rec: '100% dos compradores' },
            ].map((regua, i) => (
              <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                    {regua.status}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{regua.canal}</span>
                </div>
                <h3 className="text-xs font-bold text-white">{regua.nome}</h3>
                <p className="text-[10px] text-slate-400">Gatilho: {regua.gatilho}</p>
                <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-emerald-400 font-bold">{regua.rec}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 12. CUPONS & DESCONTOS */}
      {/* ============================================================== */}
      {activeTab === 'cupons' && (
        <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Tags size={16} className="text-purple-400" />
                <span>Gestão de Cupons & Descontos Promocionais</span>
              </h2>
              <p className="text-slate-400 text-xs">Códigos de desconto por percentual ou valor fixo com travas de uso.</p>
            </div>
            <button
              onClick={() => setModalNovoCupom(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
            >
              <Plus size={14} /> Novo Cupom
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Código Promocional</th>
                  <th className="p-3.5 text-center">Tipo / Desconto</th>
                  <th className="p-3.5 text-center">Usos / Limite</th>
                  <th className="p-3.5 text-right">Vendas Geradas</th>
                  <th className="p-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {cupons.map((cup) => (
                  <tr key={cup.id} className="hover:bg-slate-800/30 transition">
                    <td className="p-3.5 font-mono font-bold text-purple-400">{cup.codigo}</td>
                    <td className="p-3.5 text-center font-bold text-white">
                      {cup.tipo === 'porcentagem' ? `${cup.valor}% OFF` : `R$ ${cup.valor} OFF`}
                    </td>
                    <td className="p-3.5 text-center font-mono">
                      {cup.usosAtuais} / {cup.limiteUsos}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-emerald-400">{formatBRL(cup.vendasCents)}</td>
                    <td className="p-3.5 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                        ATIVO
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 13. CENTRAL UTM & LINKS / QR (UTM / QR) */}
      {/* ============================================================== */}
      {activeTab === 'utm' && (
        <div className="space-y-6">
          {/* Header da Central UTM */}
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                  <Link2 size={12} />
                  <span>Central Operacional UTM & Atribuição de Tráfego</span>
                </div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <span>Central de Links Rastreados, UTMs & QR Codes</span>
                </h2>
                <p className="text-slate-400 text-xs mt-0.5">
                  Criação, parametrização, comparação, geração de QR Code e auditoria de conversão ponta a ponta.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveUtmForEdit(null);
                    setUtmModalMode('create');
                    setModalNovaUTM(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition"
                >
                  <Plus size={14} /> Nova UTM
                </button>

                <button
                  type="button"
                  onClick={() => setModalCompareOpen(true)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition ${
                    selectedCompareUtms.length > 0
                      ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                  title="Comparar URLs selecionadas lado a lado"
                >
                  <GitCompare size={14} />
                  <span>Comparar URLs ({selectedCompareUtms.length})</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportUtmCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                  title="Exportar dados de UTM para CSV"
                >
                  <Download size={14} />
                  <span>Exportar CSV</span>
                </button>
              </div>
            </div>

            {/* Top KPIs da Central UTM */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Visitas Rastr.</span>
                <div className="text-lg font-black text-white font-mono mt-1">{utmAggregates.totalVisitas.toLocaleString('pt-BR')}</div>
                <span className="text-[10px] text-slate-400">Total de cliques</span>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Carrinhos</span>
                <div className="text-lg font-black text-sky-400 font-mono mt-1">{utmAggregates.totalCarrinhos.toLocaleString('pt-BR')}</div>
                <span className="text-[10px] text-sky-400/80">Add to Cart</span>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Checkouts</span>
                <div className="text-lg font-black text-amber-400 font-mono mt-1">{utmAggregates.totalCheckouts.toLocaleString('pt-BR')}</div>
                <span className="text-[10px] text-amber-400/80">Begin Checkout</span>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Compras</span>
                <div className="text-lg font-black text-white font-mono mt-1">{utmAggregates.totalCompras.toLocaleString('pt-BR')} un.</div>
                <span className="text-[10px] text-emerald-400 font-semibold">{utmAggregates.convGeral} conv.</span>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Receita Atribuída</span>
                <div className="text-lg font-black text-emerald-400 font-mono mt-1">{formatBRL(utmAggregates.totalReceitaCents)}</div>
                <span className="text-[10px] text-emerald-400 font-semibold">100% rastreada</span>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Tíquete Médio</span>
                <div className="text-lg font-black text-purple-400 font-mono mt-1">{formatBRL(utmAggregates.ticketMedioGeralCents)}</div>
                <span className="text-[10px] text-purple-400/80">Média geral</span>
              </div>
            </div>

            {/* Sub-abas da Central UTM */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex gap-2 overflow-x-auto">
              {(['URLs Rastreáveis', 'Gerador Rápido & QR', 'Comparativo de URLs', 'Funil & Ranking'] as const).map((tabName) => (
                <button
                  key={tabName}
                  type="button"
                  onClick={() => setSubTabUTM(tabName)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                    subTabUTM === tabName
                      ? 'bg-purple-600 text-white font-bold shadow'
                      : 'bg-slate-900/40 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {tabName}
                  {tabName === 'URLs Rastreáveis' && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300 font-normal">
                      {linksUtm.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Sub-aba 1: URLs Rastreáveis */}
          {subTabUTM === 'URLs Rastreáveis' && (
            <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm space-y-4">
              {/* Barra de Filtros e Busca */}
              <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/30">
                <div className="flex flex-1 items-center gap-2 max-w-md">
                  <div className="relative w-full">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Buscar por nome, campaign, source, mídia..."
                      value={buscaUtm}
                      onChange={(e) => setBuscaUtm(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  {buscaUtm && (
                    <button
                      type="button"
                      onClick={() => setBuscaUtm('')}
                      className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded"
                    >
                      Limpar
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <Filter size={13} className="text-slate-500" />
                    <select
                      value={filtroCanalUtm}
                      onChange={(e) => setFiltroCanalUtm(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
                    >
                      <option value="todos">Todos os Canais</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Google">Google</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="E-mail">E-mail</option>
                      <option value="Influenciador">Influenciador / PDV</option>
                    </select>
                  </div>

                  <select
                    value={filtroStatusUtm}
                    onChange={(e) => setFiltroStatusUtm(e.target.value as any)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
                  >
                    <option value="todos">Todos os Status</option>
                    <option value="ATIVO">Somente Ativos</option>
                    <option value="ARQUIVADO">Somente Arquivados</option>
                  </select>
                </div>
              </div>

              {/* Tabela de URLs Rastreáveis */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3.5 w-10 text-center">Comp.</th>
                      <th className="p-3.5">Nome da URL & Parâmetros</th>
                      <th className="p-3.5">Canal</th>
                      <th className="p-3.5 text-right">Visitas</th>
                      <th className="p-3.5 text-right">Carrinhos</th>
                      <th className="p-3.5 text-right">Checkouts</th>
                      <th className="p-3.5 text-center">Compras</th>
                      <th className="p-3.5 text-center">Conversão</th>
                      <th className="p-3.5 text-right">Receita</th>
                      <th className="p-3.5 text-right">Ticket Médio</th>
                      <th className="p-3.5 text-center">Status</th>
                      <th className="p-3.5 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-300">
                    {filteredUtms.length === 0 ? (
                      <tr>
                        <td colSpan={12} className="p-8 text-center text-slate-500">
                          Nenhuma URL rastreável encontrada com os filtros aplicados.
                        </td>
                      </tr>
                    ) : (
                      filteredUtms.map((u) => {
                        const isSelectedForCompare = selectedCompareUtms.some((c) => c.id === u.id);
                        const isCopied = copiedUtmId === u.id;

                        return (
                          <tr key={u.id} className="hover:bg-slate-800/30 transition">
                            <td className="p-3.5 text-center">
                              <input
                                type="checkbox"
                                checked={isSelectedForCompare}
                                onChange={() => handleToggleCompareSelect(u)}
                                className="rounded bg-slate-900 border-slate-700 text-purple-600 focus:ring-0 cursor-pointer"
                                title="Selecionar para comparação lado a lado"
                              />
                            </td>
                            <td className="p-3.5">
                              <div className="font-bold text-white hover:text-purple-300 transition">{u.nome}</div>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mt-0.5">
                                <span className="text-purple-400">{u.source}</span>
                                <span>/</span>
                                <span className="text-sky-400">{u.medium}</span>
                                <span>/</span>
                                <span className="text-amber-400">{u.campaign}</span>
                                {u.content && (
                                  <>
                                    <span>/</span>
                                    <span className="text-slate-500">{u.content}</span>
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="p-3.5 text-slate-400 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded bg-slate-800/60 border border-slate-700 text-[10px] text-slate-300">
                                {u.canal}
                              </span>
                            </td>
                            <td className="p-3.5 text-right font-mono text-slate-300">{(u.visitas ?? 0).toLocaleString('pt-BR')}</td>
                            <td className="p-3.5 text-right font-mono text-sky-400/90">{(u.carrinhos ?? 0).toLocaleString('pt-BR')}</td>
                            <td className="p-3.5 text-right font-mono text-amber-400/90">{(u.checkouts ?? 0).toLocaleString('pt-BR')}</td>
                            <td className="p-3.5 text-center font-mono font-bold text-white">{(u.compras ?? 0).toLocaleString('pt-BR')}</td>
                            <td className="p-3.5 text-center">
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px] font-bold">
                                {u.taxaConversao || '0.0%'}
                              </span>
                            </td>
                            <td className="p-3.5 text-right font-mono font-bold text-emerald-400">{formatBRL(u.receitaCents ?? 0)}</td>
                            <td className="p-3.5 text-right font-mono text-slate-300">{formatBRL(u.ticketMedioCents ?? 0)}</td>
                            <td className="p-3.5 text-center">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  u.status === 'ATIVO'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-slate-700/30 text-slate-400 border border-slate-700'
                                }`}
                              >
                                {u.status}
                              </span>
                            </td>
                            <td className="p-3.5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleCopyUtmUrl(u)}
                                  className={`p-1.5 rounded-lg transition ${
                                    isCopied
                                      ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                                      : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                                  }`}
                                  title="Copiar URL Parametrizada Completa"
                                >
                                  {isCopied ? <Check size={13} /> : <Copy size={13} />}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setActiveUtmForQr(u)}
                                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                                  title="Visualizar e Baixar QR Code SVG"
                                >
                                  <QrCode size={13} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveUtmForEdit(u);
                                    setUtmModalMode('edit');
                                    setModalNovaUTM(true);
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                                  title="Editar Parâmetros da UTM"
                                >
                                  <Edit3 size={13} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDuplicateUtm(u)}
                                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                                  title="Duplicar URL UTM"
                                >
                                  <Copy size={13} className="opacity-70" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleArchiveUtm(u.id)}
                                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                                  title={u.status === 'ATIVO' ? 'Arquivar URL' : 'Reativar URL'}
                                >
                                  <Archive size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sub-aba 2: Gerador Rápido & QR */}
          {subTabUTM === 'Gerador Rápido & QR' && (
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-5">
              <div className="border-b border-slate-800 pb-3 mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Link2 size={16} className="text-purple-400" />
                  <span>Gerador Rápido de Parâmetros UTM & QR Code Vetorial</span>
                </h3>
                <p className="text-slate-400 text-xs">Crie instantaneamente URLs parametrizadas com download imediato de QR Code SVG.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-3.5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Canal / Source</label>
                      <input
                        type="text"
                        value={utmSource}
                        onChange={(e) => setUtmSource(e.target.value)}
                        className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Mídia / Medium</label>
                      <input
                        type="text"
                        value={utmMedium}
                        onChange={(e) => setUtmMedium(e.target.value)}
                        className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Campanha</label>
                      <input
                        type="text"
                        value={utmCampaign}
                        onChange={(e) => setUtmCampaign(e.target.value)}
                        className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Conteúdo</label>
                      <input
                        type="text"
                        value={utmContent}
                        onChange={(e) => setUtmContent(e.target.value)}
                        className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">URL Rastreável Final</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={urlGerada}
                        className="flex-1 bg-black/60 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-purple-300"
                      />
                      <button
                        type="button"
                        onClick={handleCopiarLink}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shrink-0"
                      >
                        {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copiedLink ? 'Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Renderização do QR Code SVG */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">QR Code SVG em Tempo Real</span>
                  <div className="p-3 bg-white rounded-xl shadow-lg">
                    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                      <rect width="120" height="120" fill="white" />
                      <rect x="10" y="10" width="30" height="30" fill="black" />
                      <rect x="15" y="15" width="20" height="20" fill="white" />
                      <rect x="20" y="20" width="10" height="10" fill="black" />
                      <rect x="80" y="10" width="30" height="30" fill="black" />
                      <rect x="85" y="15" width="20" height="20" fill="white" />
                      <rect x="90" y="20" width="10" height="10" fill="black" />
                      <rect x="10" y="80" width="30" height="30" fill="black" />
                      <rect x="15" y="85" width="20" height="20" fill="white" />
                      <rect x="20" y="90" width="10" height="10" fill="black" />
                      <rect x="50" y="20" width="10" height="20" fill="black" />
                      <rect x="50" y="50" width="20" height="20" fill="black" />
                      <rect x="80" y="50" width="30" height="10" fill="black" />
                      <rect x="50" y="80" width="20" height="30" fill="black" />
                      <rect x="80" y="80" width="10" height="30" fill="black" />
                      <rect x="100" y="100" width="10" height="10" fill="black" />
                    </svg>
                  </div>
                  <button
                    type="button"
                    onClick={() => triggerAction('GENERATE_QR', { produtorId, eventoId: effectiveEventoId, payload: { url: urlGerada } })}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold border border-slate-700"
                  >
                    <Download size={12} /> Baixar QR Code (SVG)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sub-aba 3: Comparativo de URLs */}
          {subTabUTM === 'Comparativo de URLs' && (
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <GitCompare size={16} className="text-indigo-400" />
                    <span>Comparativo de Desempenho Entre Canais e URLs UTM</span>
                  </h3>
                  <p className="text-slate-400 text-xs">Análise lado a lado de conversão, tíquete médio e receita atribuída.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalCompareOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
                >
                  <Sliders size={13} /> Gerenciar URLs Comparadas
                </button>
              </div>

              {selectedCompareUtms.length < 2 ? (
                <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  Selecione ao menos 2 URLs na aba "URLs Rastreáveis" para comparar o desempenho.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {selectedCompareUtms.map((u) => (
                    <div key={u.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-purple-300 font-semibold">{u.canal}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleCompareSelect(u)}
                          className="text-slate-500 hover:text-slate-300 text-xs"
                          title="Remover da comparação"
                        >
                          ✕
                        </button>
                      </div>
                      <h4 className="text-xs font-bold text-white truncate" title={u.nome}>{u.nome}</h4>

                      <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Visitas:</span>
                          <span className="font-mono text-white font-bold">{(u.visitas ?? 0).toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Compras:</span>
                          <span className="font-mono text-emerald-400 font-bold">{u.compras ?? 0} un.</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Taxa Conversão:</span>
                          <span className="font-mono text-purple-400 font-bold">{u.taxaConversao || '0.0%'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Receita Atribuída:</span>
                          <span className="font-mono text-emerald-400 font-bold">{formatBRL(u.receitaCents ?? 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Tíquete Médio:</span>
                          <span className="font-mono text-slate-300">{formatBRL(u.ticketMedioCents ?? 0)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sub-aba 4: Funil & Ranking */}
          {subTabUTM === 'Funil & Ranking' && (
            <div className="space-y-6">
              {/* Funil Geral de Conversão UTM */}
              <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp size={16} className="text-emerald-400" />
                  <span>Funil Consolidado de Conversão de Links Rastreados</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {[
                    { etapa: '1. Visitas (Page Views)', qtd: utmAggregates.totalVisitas, pct: '100%' },
                    { etapa: '2. Adições ao Carrinho', qtd: utmAggregates.totalCarrinhos, pct: utmAggregates.totalVisitas > 0 ? ((utmAggregates.totalCarrinhos / utmAggregates.totalVisitas) * 100).toFixed(1) + '%' : '0%' },
                    { etapa: '3. Inícios de Checkout', qtd: utmAggregates.totalCheckouts, pct: utmAggregates.totalVisitas > 0 ? ((utmAggregates.totalCheckouts / utmAggregates.totalVisitas) * 100).toFixed(1) + '%' : '0%' },
                    { etapa: '4. Compras Concluídas', qtd: utmAggregates.totalCompras, pct: utmAggregates.convGeral },
                  ].map((step, idx) => (
                    <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{step.etapa}</span>
                      <div className="text-xl font-black text-white font-mono mt-1">{(step.qtd ?? 0).toLocaleString('pt-BR')}</div>
                      <span className="text-[10px] text-emerald-400 font-semibold">{step.pct} da etapa 1</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ranking Top URLs por Receita */}
              <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white">Ranking de Top Links por Faturamento Atribuído</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-3.5">Posição</th>
                        <th className="p-3.5">Nome do Link</th>
                        <th className="p-3.5">Canal</th>
                        <th className="p-3.5 text-center">Taxa Conversão</th>
                        <th className="p-3.5 text-right">Compras</th>
                        <th className="p-3.5 text-right">Receita Atribuída</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-slate-300">
                      {[...(linksUtm || [])]
                        .sort((a, b) => (b.receitaCents || 0) - (a.receitaCents || 0))
                        .slice(0, 5)
                        .map((u, idx) => (
                          <tr key={u.id} className="hover:bg-slate-800/30 transition">
                            <td className="p-3.5 font-bold text-purple-400 font-mono">#{idx + 1}</td>
                            <td className="p-3.5 font-bold text-white">{u.nome || u.campaign || 'Link'}</td>
                            <td className="p-3.5 text-slate-400">{u.canal}</td>
                            <td className="p-3.5 text-center font-mono font-bold text-emerald-400">{u.taxaConversao || '0.0%'}</td>
                            <td className="p-3.5 text-right font-mono">{u.compras ?? 0} un.</td>
                            <td className="p-3.5 text-right font-mono font-bold text-emerald-400">{formatBRL(u.receitaCents ?? 0)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 14. AFILIADOS & PROMOTERS */}
      {/* ============================================================== */}
      {activeTab === 'afiliados' && (
        <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Users size={16} className="text-purple-400" />
                <span>Rede de Afiliados, Promoters & Comissários</span>
              </h2>
              <p className="text-slate-400 text-xs">Acompanhamento de vendas comissionadas por divulgador e controle de repasse.</p>
            </div>
            <button
              onClick={() => setFeedback({ tipo: 'success', texto: 'Assistente de convite de promoter aberto.' })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
            >
              <Plus size={14} /> Convidar Promoter
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Nome do Promoter</th>
                  <th className="p-3.5">Link / Código Exclusivo</th>
                  <th className="p-3.5 text-center">Comissão</th>
                  <th className="p-3.5 text-center">Ingressos Vendidos</th>
                  <th className="p-3.5 text-right">Receita Total</th>
                  <th className="p-3.5 text-right">Comissão a Pagar</th>
                  <th className="p-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {[
                  { nome: 'Lucas Alencar (Promoter Curitiba)', link: 'diskingressos.com.br/p/lucas-promoter', com: '10%', ing: 184, rec: 3680000, comPagar: 368000, status: 'ATIVO' },
                  { nome: 'Camila Rossi (Eventos Receptivos)', link: 'diskingressos.com.br/p/camila-rossi', com: '12%', ing: 95, rec: 1900000, comPagar: 228000, status: 'ATIVO' },
                ].map((af, i) => (
                  <tr key={i} className="hover:bg-slate-800/30 transition">
                    <td className="p-3.5 font-bold text-white">{af.nome}</td>
                    <td className="p-3.5 font-mono text-purple-400">{af.link}</td>
                    <td className="p-3.5 text-center font-bold text-white">{af.com}</td>
                    <td className="p-3.5 text-center font-mono font-bold text-white">{af.ing} un.</td>
                    <td className="p-3.5 text-right font-mono font-bold text-white">{formatBRL(af.rec)}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-emerald-400">{formatBRL(af.comPagar)}</td>
                    <td className="p-3.5 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                        {af.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 15. PIXELS & CONVERSÕES (MULTI-PIXEL) */}
      {/* ============================================================== */}
      {activeTab === 'pixels' && (
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Target size={16} className="text-purple-400" />
                <span>Central Multi-Pixel & Servidores de Conversão CAPI</span>
              </h2>
              <p className="text-slate-400 text-xs">Configure múltiplos pixels por produtor e evento com garantia de entrega simultânea.</p>
            </div>
            <button
              onClick={() => handleEnviarPingCAPI('Multi-Pixel Hub')}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
            >
              <Zap size={13} /> Testar Ping Geral
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pixels.map((pix, i) => (
              <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white">{pix.nome}</h3>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                    {pix.status}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-400">ID: <span className="text-white">{pix.id}</span></div>
                <div className="text-[11px] text-slate-400">Modo: <span className="text-slate-300">{pix.modo}</span></div>
                <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800">Eventos: {pix.eventos}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 16. ATRIBUIÇÃO MULTICANAL */}
      {/* ============================================================== */}
      {activeTab === 'atribuicao' && (
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <GitBranch size={16} className="text-indigo-400" />
              <span>Modelos de Atribuição & Jornada Multi-Touch</span>
            </h2>
            <p className="text-slate-400 text-xs">Entenda o caminho exato de touchpoints até a conversão final do ingresso.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {[
              { modelo: 'Último Clique (Last Click)', share: '100% no último canal', roasMeta: '5.68x', roasGoogle: '6.53x' },
              { modelo: 'Primeiro Clique (First Click)', share: '100% no canal originador', roasMeta: '6.42x', roasGoogle: '4.80x' },
              { modelo: 'Linear (Ponderação Igual)', share: 'Divisão equilibrada', roasMeta: '6.10x', roasGoogle: '5.85x' },
              { modelo: 'Data-Driven (Algorítmico)', share: 'Machine Learning DiskIngressos', roasMeta: '6.25x', roasGoogle: '6.20x' },
            ].map((m, i) => (
              <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <span className="text-xs font-bold text-white">{m.modelo}</span>
                <p className="text-[10px] text-slate-400">{m.share}</p>
                <div className="pt-2 border-t border-slate-800 space-y-0.5 text-[11px] font-mono">
                  <div className="text-slate-300">Meta: <span className="text-emerald-400 font-bold">{m.roasMeta}</span></div>
                  <div className="text-slate-300">Google: <span className="text-emerald-400 font-bold">{m.roasGoogle}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 17. RELATÓRIOS DE MARKETING */}
      {/* ============================================================== */}
      {activeTab === 'relatorios' && (
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <FileBarChart size={16} className="text-amber-400" />
                <span>Relatórios Executivos de Marketing & Mídia</span>
              </h2>
              <p className="text-slate-400 text-xs">Consolidação de investimento, conversão, CPA, CAC e receita por evento.</p>
            </div>
            <button
              onClick={() => triggerAction('EXPORT', { produtorId, eventoId: effectiveEventoId })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700"
            >
              <Download size={13} /> Exportar Relatório CSV
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Custo de Aquisição (CAC)</span>
              <div className="text-2xl font-black text-sky-400 mt-1">R$ 33,33</div>
              <span className="text-[10px] text-slate-400">Tíquete Médio: R$ 200,00</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Margem Comercial de Mídia</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">83.3%</div>
              <span className="text-[10px] text-slate-400">Margem líquida após custos de anúncio</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Taxa de Conversão Global</span>
              <div className="text-2xl font-black text-purple-400 mt-1">4.52%</div>
              <span className="text-[10px] text-slate-400">Total de sessões originadas por anúncios</span>
            </div>
          </div>
        </div>
      )}

      {/* Modais Operacionais de Marketing & Central UTM */}
      <CampaignWizardModal
        isOpen={modalNovaCampanha}
        onClose={() => {
          setModalNovaCampanha(false);
          setWizardInitialData(null);
        }}
        onPublish={handlePublishCampaign}
        onSaveDraft={handleSaveDraftCampaign}
        initialData={wizardInitialData}
        eventos={eventosList}
        currentEventoId={effectiveEventoId}
      />

      <UtmManagementModal
        isOpen={modalNovaUTM}
        onClose={() => {
          setModalNovaUTM(false);
          setActiveUtmForEdit(null);
        }}
        onSave={handleSaveUtm}
        initialData={activeUtmForEdit}
        eventos={eventosList}
        currentEventoId={effectiveEventoId}
        mode={utmModalMode}
      />

      <UtmQrModal
        isOpen={Boolean(activeUtmForQr)}
        onClose={() => setActiveUtmForQr(null)}
        utm={activeUtmForQr}
      />

      <UtmCompareModal
        isOpen={modalCompareOpen}
        onClose={() => setModalCompareOpen(false)}
        selectedUtms={selectedCompareUtms}
        allUtms={linksUtm}
        onToggleSelect={handleToggleCompareSelect}
      />

      {/* Modal Operacional Padronizado */}
      <MarketingActionModal
        phase={actionPhase}
        action={currentAction}
        result={actionResult}
        errorMsg={actionError}
        onConfirm={confirmPendingAction}
        onCancel={cancelPendingAction}
        onCloseResult={resetAction}
      />
    </div>
  );
}

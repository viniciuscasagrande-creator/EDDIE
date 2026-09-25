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
  Film,
  FileAudio,
  FileImage,
  Volume2,
  FolderOpen,
  SlidersHorizontal,
  FileText,
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
import { CampaignWorkspaceModal } from './CampaignWorkspaceModal';
import { CreativeManagementModal } from './CreativeManagementModal';
import { TemplateDetailModal, type CampaignTemplate } from './TemplateDetailModal';
import { PixelManagementModal } from './PixelManagementModal';
import { PixelDiagnosticModal } from './PixelDiagnosticModal';
import { PixelLogsModal } from './PixelLogsModal';
import { ConversionDetailModal } from './ConversionDetailModal';
import type {
  TrackingConfiguration,
  TrackingDeliveryLog,
  ConversionRecord,
  ConversionFunnelItem,
  TrackingProvider,
} from './tracking-types';
import type {
  DetailedCampaign,
  ProviderExecution,
  CampaignStatus,
  MarketingChannel,
} from './campaign-types';
import type {
  Creative,
  CreativeType,
  CreativeFormat,
} from './creative-types';
import type { MarketingAction, Provider } from '../../lib/marketing-actions/action-types';

export type MarketingVideoTab =
  | 'dashboard'
  | 'campanhas'
  | 'campanhas-prontas'
  | 'criativos'
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

export const OFFICIAL_TEMPLATES: CampaignTemplate[] = [
  {
    id: 'tpl-01',
    titulo: '1. Lançamento Oficial · Lote 1',
    categoria: 'LANÇAMENTO',
    objetivo: 'CONVERSAO',
    canaisRecomendados: ['META', 'GOOGLE', 'TIKTOK'],
    canaisTexto: 'Meta Ads + Google Search + TikTok Ads',
    publicoAlvo: 'Engajamento no Instagram nos últimos 90 dias + Lookalike 1% compradores',
    publicoTipo: 'LOOKALIKE',
    estrategia: 'Captura massiva na abertura das vendas gerando tração máxima nas primeiras 72 horas. Combinação de impacto visual em redes sociais com captura de busca intencional.',
    copySugerida: {
      headline: 'Vendas Abertas · Lote Promocional Disponível!',
      body: 'O festival mais esperado do ano começou. Garanta seu ingresso em até 12x no cartão ou via PIX sem taxa oculta.',
      cta: 'Comprar Ingressos',
      formato: 'IMAGEM_UNICA',
    },
    trackingSugerido: {
      source: 'meta',
      medium: 'feed_stories',
      campaign: 'lote1_lancamento',
      content: 'banner_lineup',
    },
    roasEstimado: '6.2x',
    duracaoRecomendada: '10 a 14 dias',
    melhoresPraticas: [
      'Ativar CAPI no Meta e Enhanced Conversions no Google',
      'Garantir que a página do evento carregue em menos de 1.5s',
      'Virar criativo para "Últimos Ingressos do Lote" quando 70% da cota for vendida',
    ],
  },
  {
    id: 'tpl-02',
    titulo: '2. Alerta de Virada de Lote (48 Horas)',
    categoria: 'URGÊNCIA',
    objetivo: 'CONVERSAO',
    canaisRecomendados: ['META', 'WHATSAPP'],
    canaisTexto: 'Meta Stories + WhatsApp Oficial',
    publicoAlvo: 'Visitantes do checkout nos últimos 14 dias sem compra concluída',
    publicoTipo: 'VISITANTES',
    estrategia: 'Régua de urgência para acelerar decisões represadas. Notificação de aumento iminente de preço com contagem regressiva.',
    copySugerida: {
      headline: 'Últimas 48h para pagar menos!',
      body: 'O Lote 1 está no fim. A partir de quinta-feira os preços sobem. Garanta o seu antes da virada!',
      cta: 'Garantir Menor Preço',
      formato: 'VIDEO_REELS',
    },
    trackingSugerido: {
      source: 'instagram',
      medium: 'stories',
      campaign: 'virada_lote1_48h',
      content: 'video_cronometro',
    },
    roasEstimado: '7.8x',
    duracaoRecomendada: '48 horas',
    melhoresPraticas: [
      'Definir data e hora exata da virada em todos os criativos',
      'Pausar a campanha imediatamente ao atingir o limite do lote',
      'Disparar WhatsApp VIP apenas nas últimas 12 horas para não desgastar a base',
    ],
  },
  {
    id: 'tpl-03',
    titulo: '3. Últimos Ingressos · Reta Final',
    categoria: 'ESCASSEZ',
    objetivo: 'CONVERSAO',
    canaisRecomendados: ['META', 'SPOTIFY'],
    canaisTexto: 'Meta Reels + Spotify Audio Ads',
    publicoAlvo: 'Retargeting geral de visitantes + Ouvintes de artistas do evento no Spotify',
    publicoTipo: 'RETARGETING_GERAL',
    estrategia: 'Escassez genuína na reta final da venda. Comunicação de que os ingressos estão prestes a esgotar definitivamente.',
    copySugerida: {
      headline: 'Restam menos de 5% da capacidade!',
      body: 'Não fique de fora da experiência mais marcante da temporada. Últimos ingressos disponíveis no DiskIngressos.',
      cta: 'Garantir Agora',
      formato: 'AUDIO_SPOTIFY',
    },
    trackingSugerido: {
      source: 'spotify',
      medium: 'audio_ad',
      campaign: 'ultimos_ingressos',
      content: 'spot_30s',
    },
    roasEstimado: '5.4x',
    duracaoRecomendada: '5 a 7 dias',
    melhoresPraticas: [
      'Usar prova social real da lotação dos setores',
      'Configurar lance para maximizar conversão direta',
      'Ativar companion banner 640x640 no Spotify',
    ],
  },
  {
    id: 'tpl-04',
    titulo: '4. Contagem Regressiva (Últimas 24 Horas)',
    categoria: 'URGÊNCIA MÁXIMA',
    objetivo: 'CONVERSAO',
    canaisRecomendados: ['META', 'WHATSAPP', 'GOOGLE'],
    canaisTexto: 'Meta Ads + WhatsApp Marketing + Google Search',
    publicoAlvo: 'Carrinho abandonado recente (24-48h) + Visitantes com alta frequência',
    publicoTipo: 'VISITANTES',
    estrategia: 'Push final no dia do evento ou nas vésperas. Comunicação com altíssimo senso de urgência e foco em fechamento imediato via PIX.',
    copySugerida: {
      headline: 'É amanhã! Última chance de garantir seu acesso.',
      body: 'As vendas online encerram em breve. Compre online e receba seu ingresso com QR Code no celular instantaneamente.',
      cta: 'Comprar em 1-Clique',
      formato: 'IMAGEM_UNICA',
    },
    trackingSugerido: {
      source: 'meta',
      medium: 'feed_urgencia',
      campaign: 'contagem_regressiva_24h',
      content: 'badge_24h',
    },
    roasEstimado: '9.2x',
    duracaoRecomendada: '24 horas',
    melhoresPraticas: [
      'Destacar facilidade de entrada com QR Code sem fila de bilheteria',
      'Recomendar pagamento PIX para aprovação instantânea',
    ],
  },
  {
    id: 'tpl-05',
    titulo: '5. Carrinho Abandonado (Recuperação Rápida)',
    categoria: 'RECUPERAÇÃO',
    objetivo: 'CONVERSAO',
    canaisRecomendados: ['WHATSAPP', 'META'],
    canaisTexto: 'WhatsApp Oficial + Meta Dynamic Retargeting',
    publicoAlvo: 'Usuários que chegaram ao checkout nos últimos 3 dias sem concluir',
    publicoTipo: 'VISITANTES',
    estrategia: 'Resgate ativo com link pré-preenchido de checkout. Reduz atrito de recompra e recupera faturamento que já demonstrou intenção de compra.',
    copySugerida: {
      headline: 'Seus ingressos continuam reservados!',
      body: 'Notamos que seu pedido não foi concluído. Clique no link para finalizar com segurança em 1 minuto.',
      cta: 'Retomar Meu Pedido',
      formato: 'CARROSSEL',
    },
    trackingSugerido: {
      source: 'whatsapp',
      medium: 'direct_msg',
      campaign: 'recuperacao_carrinho',
      content: 'cta_retomada',
    },
    roasEstimado: '14.5x',
    duracaoRecomendada: 'Contínua',
    melhoresPraticas: [
      'Enviar mensagem entre 15min e 2h após o abandono',
      'Evitar descontos agressivos para não viciar a base',
      'Inserir link direto para a sessão salva do carrinho',
    ],
  },
  {
    id: 'tpl-06',
    titulo: '6. Visitou e Não Comprou (Engajamento Recente)',
    categoria: 'RETARGETING',
    objetivo: 'CONVERSAO',
    canaisRecomendados: ['META', 'GOOGLE'],
    canaisTexto: 'Meta Instagram + Google Display Remarketing',
    publicoAlvo: 'Pessoas que acessaram a página do evento nos últimos 7 dias sem ir ao checkout',
    publicoTipo: 'VISITANTES',
    estrategia: 'Quebra de objeções e reforço das principais atrações, infraestrutura, praça de alimentação e mapa do local.',
    copySugerida: {
      headline: 'Ainda em dúvida? Conheça os setores e a estrutura!',
      body: 'Camarotes com open bar, pista com visão panorâmica e estacionamento seguro. Escolha seu setor ideal.',
      cta: 'Ver Mapa de Setores',
      formato: 'CARROSSEL',
    },
    trackingSugerido: {
      source: 'meta',
      medium: 'stories_retargeting',
      campaign: 'visitou_nao_comprou',
      content: 'carrossel_setores',
    },
    roasEstimado: '5.8x',
    duracaoRecomendada: 'Contínua',
    melhoresPraticas: [
      'Segmentar por setor visitado quando disponível',
      'Exibir depoimentos de edições anteriores',
    ],
  },
  {
    id: 'tpl-07',
    titulo: '7. Compradores Anteriores (Fidelidade & Cross-Sell)',
    categoria: 'FIDELIDADE',
    objetivo: 'LEADS_VIP',
    canaisRecomendados: ['EMAIL', 'WHATSAPP'],
    canaisTexto: 'E-mail Marketing Hub + WhatsApp Oficial',
    publicoAlvo: 'Clientes que compraram em edições anteriores do mesmo produtor/gênero',
    publicoTipo: 'LISTA_VIP_CRM',
    estrategia: 'Reconhecimento da fidelidade com pré-venda exclusiva de 24h a 48h antes do público geral, sem custos de mídia de topo de funil.',
    copySugerida: {
      headline: 'Exclusivo para quem esteve na última edição!',
      body: 'Como forma de agradecimento, liberamos acesso antecipado com lote exclusivo antes de todo mundo.',
      cta: 'Acessar Pré-venda VIP',
      formato: 'IMAGEM_UNICA',
    },
    trackingSugerido: {
      source: 'email_hub',
      medium: 'newsletter_vip',
      campaign: 'pre_venda_fidelidade',
      content: 'cupom_exclusivo',
    },
    roasEstimado: '22.0x',
    duracaoRecomendada: '48 horas',
    melhoresPraticas: [
      'Personalizar com primeiro nome do comprador',
      'Utilizar domínio autenticado DKIM/SPF para 99% de entrega',
    ],
  },
  {
    id: 'tpl-08',
    titulo: '8. Reengajamento de Base Inativa',
    categoria: 'REATIVAÇÃO',
    objetivo: 'TRAFEGO',
    canaisRecomendados: ['META', 'EMAIL'],
    canaisTexto: 'Meta Custom Audience + E-mail Reativação',
    publicoAlvo: 'Clientes da base CRM sem compras nos últimos 12 meses',
    publicoTipo: 'LISTA_VIP_CRM',
    estrategia: 'Despertar o interesse da base que já conhece a DiskIngressos, apresentando o retorno das grandes turnês na cidade.',
    copySugerida: {
      headline: 'Sentimos sua falta nos melhores shows!',
      body: 'Confira as novidades imperdíveis da programação deste semestre com facilidade no parcelamento.',
      cta: 'Explorar Eventos',
      formato: 'CARROSSEL',
    },
    trackingSugerido: {
      source: 'meta',
      medium: 'feed_reativacao',
      campaign: 'base_inativa_12m',
      content: 'carrossel_agenda',
    },
    roasEstimado: '4.6x',
    duracaoRecomendada: '15 dias',
    melhoresPraticas: [
      'Limpar bounces da lista antes do disparo de e-mail',
      'Testar criativo emocional focado na experiência ao vivo',
    ],
  },
  {
    id: 'tpl-09',
    titulo: '9. Spotify Music Drop / Pós-evento',
    categoria: 'STREAMING',
    objetivo: 'RECONHECIMENTO',
    canaisRecomendados: ['SPOTIFY', 'META'],
    canaisTexto: 'Spotify Audio Ads + Instagram Reels',
    publicoAlvo: 'Fãs de música e ouvintes de playlists oficiais de festivais',
    publicoTipo: 'INTERESSES',
    estrategia: 'Sinergia entre streaming musical e experiência ao vivo. Apresenta o lineup com snippets das músicas mais tocadas.',
    copySugerida: {
      headline: 'A trilha sonora da sua vida agora ao vivo!',
      body: 'Ouça as faixas mais tocadas no Spotify e garanta sua presença no festival.',
      cta: 'Ouvir e Comprar',
      formato: 'AUDIO_SPOTIFY',
    },
    trackingSugerido: {
      source: 'spotify',
      medium: 'audio_music_drop',
      campaign: 'spotify_lineup_2026',
      content: 'spot_musical',
    },
    roasEstimado: '5.2x',
    duracaoRecomendada: '20 dias',
    melhoresPraticas: [
      'Sincronizar a playlist oficial do evento no Spotify',
      'Utilizar o Companion Banner com link direto para o ingresso',
    ],
  },
];

export const INITIAL_CREATIVES: Creative[] = [
  {
    id: 'crt-01',
    nome: 'Banner Feed 1:1 - Lineup Oficial Festival Live',
    eventoId: 'evento-operacao',
    eventoNome: 'Festival DiskIngressos Live 2026',
    tipo: 'IMAGEM',
    formato: 'FEED_1_1',
    canais: ['META', 'GOOGLE'],
    status: 'APROVADO',
    assetUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
    previewUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
    titulo: 'Line-up Completo Liberado!',
    texto: 'Garanta seu ingresso para a maior edição do Festival Live. Mais de 12 horas de música sem parar.',
    cta: 'Comprar Ingressos',
    urlDestino: 'https://newdawn.diskingressos.com.br/evento/festival-live-2026',
    tags: ['Feed', 'Lineup', 'Geral'],
    dimensoes: '1080x1080',
    tamanhoBytes: 845000,
    campanhasVinculadasCount: 3,
    metricas: { impressoes: 142500, cliques: 6840, ctr: '4.80%', conversoes: 290 },
    validacao: { valido: true, mensagens: ['Dimensões 1080x1080 válidas para Meta e Google Ads'] },
    criadoEm: '2026-09-01T10:00:00Z',
    atualizadoEm: '2026-09-24T18:00:00Z',
  },
  {
    id: 'crt-02',
    nome: 'Stories & Reels 9:16 - Urgência Virada de Lote 48h',
    eventoId: 'evento-operacao',
    eventoNome: 'Festival DiskIngressos Live 2026',
    tipo: 'VIDEO',
    formato: 'STORIES_REELS_9_16',
    canais: ['META', 'TIKTOK'],
    status: 'ATIVO',
    assetUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    previewUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    titulo: 'Últimas 48h do Lote 1',
    texto: 'O preço vai subir! Não deixe para a última hora. Compre em até 12x no cartão ou no PIX.',
    cta: 'Garantir Lote 1',
    urlDestino: 'https://newdawn.diskingressos.com.br/evento/festival-live-2026',
    tags: ['Stories', 'Reels', 'Urgencia', 'ViradaDeLote'],
    dimensoes: '1080x1920',
    duracaoSegundos: 15,
    tamanhoBytes: 4200000,
    campanhasVinculadasCount: 2,
    metricas: { impressoes: 98400, cliques: 4120, ctr: '4.18%', conversoes: 340 },
    validacao: { valido: true, mensagens: ['Duração 15s aprovada para Meta Stories e TikTok Ads'] },
    criadoEm: '2026-09-05T14:00:00Z',
    atualizadoEm: '2026-09-24T18:00:00Z',
  },
  {
    id: 'crt-03',
    nome: 'Spot de Áudio Spotify 30s + Banner Companion',
    eventoId: 'evento-operacao',
    eventoNome: 'Festival DiskIngressos Live 2026',
    tipo: 'AUDIO',
    formato: 'AUDIO_SPOT_30S',
    canais: ['SPOTIFY'],
    status: 'APROVADO',
    assetUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    previewUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    titulo: 'Ouça a Playlist Oficial e Garanta seu Lugar',
    texto: 'Voz off com trecho da atração principal ao fundo. Call to action sonoro e banner clicável.',
    cta: 'Ouvir e Comprar',
    urlDestino: 'https://newdawn.diskingressos.com.br/evento/festival-live-2026?utm_source=spotify',
    tags: ['Spotify', 'Audio', 'Playlist', 'Ouvintes'],
    duracaoSegundos: 30,
    dimensoes: '640x640 Companion',
    tamanhoBytes: 1850000,
    campanhasVinculadasCount: 2,
    metricas: { impressoes: 64200, cliques: 2310, ctr: '3.60%', conversoes: 114 },
    validacao: { valido: true, mensagens: ['Áudio 30s com companion 640x640 aprovado no Spotify Ad Studio'] },
    criadoEm: '2026-09-08T09:00:00Z',
    atualizadoEm: '2026-09-24T18:00:00Z',
  },
  {
    id: 'crt-04',
    nome: 'Google Search Textual - Termos Exatos Nome Show',
    eventoId: 'evento-operacao',
    eventoNome: 'Festival DiskIngressos Live 2026',
    tipo: 'TEXTO',
    formato: 'TEXT_COPY',
    canais: ['GOOGLE'],
    status: 'ATIVO',
    titulo: 'Ingressos Oficiais Festival Live 2026 | DiskIngressos',
    texto: 'Venda oficial autorizada. Parcele em até 12x. Ingressos com QR code direto no app DiskIngressos.',
    cta: 'Comprar Agora',
    urlDestino: 'https://newdawn.diskingressos.com.br/evento/festival-live-2026?utm_source=google',
    tags: ['GoogleSearch', 'PalavrasChave', 'Marca'],
    campanhasVinculadasCount: 1,
    metricas: { impressoes: 42100, cliques: 5120, ctr: '12.16%', conversoes: 410 },
    validacao: { valido: true, mensagens: ['Texto de busca dentro dos limites de 30 e 90 caracteres do Google Ads'] },
    criadoEm: '2026-09-04T11:00:00Z',
    atualizadoEm: '2026-09-24T18:00:00Z',
  },
  {
    id: 'crt-05',
    nome: 'Card WhatsApp Oficial - Disparo Recuperação Carrinho',
    eventoId: 'evento-operacao',
    eventoNome: 'Festival DiskIngressos Live 2026',
    tipo: 'COMBINADO',
    formato: 'CARROSSEL_MULTI',
    canais: ['WHATSAPP'],
    status: 'ATIVO',
    assetUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80',
    previewUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80',
    titulo: 'Seus ingressos continuam reservados!',
    texto: 'Olá! Notamos que seu pedido para o Festival Live 2026 não foi concluído. Clique abaixo para concluir com PIX em 1 clique.',
    cta: 'Concluir Pedido',
    urlDestino: 'https://newdawn.diskingressos.com.br/checkout/retomada?utm_source=whatsapp',
    tags: ['WhatsApp', 'Disparo', 'CarrinhoAbandonado'],
    campanhasVinculadasCount: 1,
    metricas: { impressoes: 12500, cliques: 3840, ctr: '30.72%', conversoes: 490 },
    validacao: { valido: true, mensagens: ['Template de utilidade verificado pela Meta WhatsApp Cloud API'] },
    criadoEm: '2026-09-10T16:00:00Z',
    atualizadoEm: '2026-09-24T18:00:00Z',
  },
];

export const INITIAL_DETAILED_CAMPANHAS: DetailedCampaign[] = [
  {
    id: 'cmp-01',
    nome: 'Lançamento Geral · Feed + Stories + Search',
    eventoId: 'evento-operacao',
    eventoNome: 'Festival DiskIngressos Live 2026',
    objetivo: 'CONVERSAO',
    status: 'ATIVA',
    canais: ['META', 'GOOGLE', 'TIKTOK'],
    providerExecutions: [
      {
        provider: 'META',
        status: 'ATIVA',
        externalId: 'act_meta_892104',
        lastSyncAt: '2026-09-24T18:30:00Z',
        spendCents: 450000,
        impressions: 142000,
        clicks: 5800,
        conversions: 240,
      },
      {
        provider: 'GOOGLE',
        status: 'ATIVA',
        externalId: 'g_ads_772190',
        lastSyncAt: '2026-09-24T18:30:00Z',
        spendCents: 320000,
        impressions: 38000,
        clicks: 2620,
        conversions: 102,
      },
      {
        provider: 'TIKTOK',
        status: 'ERRO',
        externalId: 'tt_adv_00192',
        errorMessage: 'Requer reconexão de token OAuth no TikTok Business Center',
        lastSyncAt: '2026-09-24T12:00:00Z',
        spendCents: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
      },
    ],
    orcamentoTipo: 'DIARIO',
    orcamentoValorCents: 35000,
    gastoTotalCents: 770000,
    dataInicio: '2026-09-01',
    dataTermino: '2026-10-15',
    cliques: 8420,
    impressoes: 180000,
    conversoes: 342,
    receitaAtribuidaCents: 6840000,
    cpaCents: 2251,
    roas: '8.88x',
    audiences: [
      { id: 'aud-1', nome: 'Lookalike 1% Compradores', tipo: 'LOOKALIKE', alcanceEstimado: 450000, canais: ['META'] },
    ],
    creatives: [
      { id: 'crt-01', nome: 'Banner Feed 1:1', tipo: 'IMAGEM', canal: 'META' },
    ],
    historyLogs: [
      { id: 'log-1', timestamp: '2026-09-01T10:00:00Z', autor: 'Marketing Ops', acao: 'Campanha publicada', detalhes: 'Ativação inicial em Meta e Google' },
      { id: 'log-2', timestamp: '2026-09-20T14:15:00Z', autor: 'Sistema (Sync)', acao: 'Alerta TikTok', detalhes: 'Falha no token de autenticação do TikTok' },
    ],
    criadoEm: '2026-09-01T10:00:00Z',
    atualizadoEm: '2026-09-24T18:30:00Z',
  },
  {
    id: 'cmp-02',
    nome: 'Google Search · Palavras-Chave Nome Artista + Ingressos',
    eventoId: 'evento-operacao',
    eventoNome: 'Festival DiskIngressos Live 2026',
    objetivo: 'CONVERSAO',
    status: 'ATIVA',
    canais: ['GOOGLE'],
    providerExecutions: [
      {
        provider: 'GOOGLE',
        status: 'ATIVA',
        externalId: 'g_ads_search_441',
        lastSyncAt: '2026-09-24T19:00:00Z',
        spendCents: 620000,
        impressions: 42100,
        clicks: 5120,
        conversions: 410,
      },
    ],
    orcamentoTipo: 'DIARIO',
    orcamentoValorCents: 20000,
    gastoTotalCents: 620000,
    dataInicio: '2026-09-05',
    dataTermino: '2026-10-30',
    cliques: 5120,
    impressoes: 42100,
    conversoes: 410,
    receitaAtribuidaCents: 8200000,
    cpaCents: 1512,
    roas: '13.22x',
    audiences: [
      { id: 'aud-2', nome: 'Palavras-Chave de Alta Intenção', tipo: 'INTERESSES', alcanceEstimado: 120000, canais: ['GOOGLE'] },
    ],
    creatives: [
      { id: 'crt-04', nome: 'Google Search Textual', tipo: 'TEXTO', canal: 'GOOGLE' },
    ],
    historyLogs: [
      { id: 'log-1', timestamp: '2026-09-05T09:00:00Z', autor: 'Growth Lead', acao: 'Campanha criada', detalhes: 'Setup de palavras-chave exatas e de frase' },
    ],
    criadoEm: '2026-09-05T09:00:00Z',
    atualizadoEm: '2026-09-24T19:00:00Z',
  },
  {
    id: 'cmp-03',
    nome: 'Spotify Audio Ads · Retargeting Ouvintes Playlist Oficial',
    eventoId: 'evento-operacao',
    eventoNome: 'Festival DiskIngressos Live 2026',
    objetivo: 'RECONHECIMENTO',
    status: 'ATIVA',
    canais: ['SPOTIFY'],
    providerExecutions: [
      {
        provider: 'SPOTIFY',
        status: 'ATIVA',
        externalId: 'sp_camp_9921',
        lastSyncAt: '2026-09-24T17:45:00Z',
        spendCents: 400000,
        impressions: 64200,
        clicks: 2310,
        conversions: 114,
      },
    ],
    orcamentoTipo: 'DIARIO',
    orcamentoValorCents: 10000,
    gastoTotalCents: 400000,
    dataInicio: '2026-09-10',
    dataTermino: '2026-10-20',
    cliques: 2310,
    impressoes: 64200,
    conversoes: 114,
    receitaAtribuidaCents: 2280000,
    cpaCents: 3508,
    roas: '5.70x',
    audiences: [
      { id: 'aud-3', nome: 'Ouvintes de Sertanejo & Pop no PR', tipo: 'INTERESSES', alcanceEstimado: 85000, canais: ['SPOTIFY'] },
    ],
    creatives: [
      { id: 'crt-03', nome: 'Spot 30s + Companion', tipo: 'AUDIO', canal: 'SPOTIFY' },
    ],
    historyLogs: [
      { id: 'log-1', timestamp: '2026-09-10T11:00:00Z', autor: 'Marketing Ops', acao: 'Campanha publicada', detalhes: 'Veiculação aprovada no Spotify Ad Studio' },
    ],
    criadoEm: '2026-09-10T11:00:00Z',
    atualizadoEm: '2026-09-24T17:45:00Z',
  },
  {
    id: 'cmp-04',
    nome: 'Alerta Virada de Lote 48h · Stories Urgência',
    eventoId: 'evento-operacao',
    eventoNome: 'Festival DiskIngressos Live 2026',
    objetivo: 'CONVERSAO',
    status: 'AGENDADA',
    canais: ['META', 'WHATSAPP'],
    providerExecutions: [
      {
        provider: 'META',
        status: 'AGENDADA',
        externalId: 'meta_story_lote2',
        lastSyncAt: '2026-09-24T18:00:00Z',
        spendCents: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
      },
      {
        provider: 'WHATSAPP',
        status: 'AGENDADA',
        externalId: 'wa_flow_virada',
        lastSyncAt: '2026-09-24T18:00:00Z',
        spendCents: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
      },
    ],
    orcamentoTipo: 'DIARIO',
    orcamentoValorCents: 35000,
    gastoTotalCents: 0,
    dataInicio: '2026-10-01',
    dataTermino: '2026-10-03',
    cliques: 0,
    impressoes: 0,
    conversoes: 0,
    receitaAtribuidaCents: 0,
    cpaCents: 0,
    roas: '7.80x Estimado',
    audiences: [
      { id: 'aud-4', nome: 'Visitantes 14 dias sem compra', tipo: 'VISITANTES', alcanceEstimado: 28000, canais: ['META', 'WHATSAPP'] },
    ],
    creatives: [
      { id: 'crt-02', nome: 'Stories Urgência', tipo: 'VIDEO', canal: 'META' },
    ],
    historyLogs: [
      { id: 'log-1', timestamp: '2026-09-23T15:30:00Z', autor: 'Marketing Lead', acao: 'Campanha agendada', detalhes: 'Programada para 48h antes da virada do lote' },
    ],
    criadoEm: '2026-09-23T15:30:00Z',
    atualizadoEm: '2026-09-24T18:00:00Z',
  },
  {
    id: 'cmp-05',
    nome: 'Disparo WhatsApp VIP · Pré-venda Exclusiva Lote Zero',
    eventoId: 'evento-operacao',
    eventoNome: 'Festival DiskIngressos Live 2026',
    objetivo: 'CONVERSAO',
    status: 'ENCERRADA',
    canais: ['WHATSAPP'],
    providerExecutions: [
      {
        provider: 'WHATSAPP',
        status: 'ENCERRADA',
        externalId: 'wa_camp_vip0',
        lastSyncAt: '2026-08-28T23:59:59Z',
        spendCents: 34500,
        impressions: 12500,
        clicks: 3840,
        conversions: 490,
      },
    ],
    orcamentoTipo: 'TOTAL',
    orcamentoValorCents: 35000,
    gastoTotalCents: 34500,
    dataInicio: '2026-08-25',
    dataTermino: '2026-08-28',
    cliques: 3840,
    impressoes: 12500,
    conversoes: 490,
    receitaAtribuidaCents: 9800000,
    cpaCents: 70,
    roas: '284.05x',
    audiences: [
      { id: 'aud-5', nome: 'Lista VIP CRM Compradores Anteriores', tipo: 'LISTA_VIP_CRM', alcanceEstimado: 12500, canais: ['WHATSAPP'] },
    ],
    creatives: [
      { id: 'crt-05', nome: 'Card WhatsApp Oficial', tipo: 'COMBINADO', canal: 'WHATSAPP' },
    ],
    historyLogs: [
      { id: 'log-1', timestamp: '2026-08-28T23:59:59Z', autor: 'Sistema (Automação)', acao: 'Campanha encerrada', detalhes: 'Meta de vendas da pré-venda atingida em 100%' },
    ],
    criadoEm: '2026-08-25T08:00:00Z',
    atualizadoEm: '2026-08-28T23:59:59Z',
  },
  {
    id: 'cmp-06',
    nome: 'Carrossel Dinâmico Setores Camarote & Lounge VIP',
    eventoId: 'evento-operacao',
    eventoNome: 'Festival DiskIngressos Live 2026',
    objetivo: 'CONVERSAO',
    status: 'PAUSADA',
    canais: ['META'],
    providerExecutions: [
      {
        provider: 'META',
        status: 'PAUSADA',
        externalId: 'meta_carr_camarote',
        lastSyncAt: '2026-09-22T10:00:00Z',
        spendCents: 77500,
        impressions: 38000,
        clicks: 1420,
        conversions: 68,
      },
    ],
    orcamentoTipo: 'DIARIO',
    orcamentoValorCents: 12000,
    gastoTotalCents: 77500,
    dataInicio: '2026-09-12',
    dataTermino: '2026-10-10',
    cliques: 1420,
    impressoes: 38000,
    conversoes: 68,
    receitaAtribuidaCents: 3740000,
    cpaCents: 1139,
    roas: '4.82x',
    audiences: [
      { id: 'aud-6', nome: 'Público Alta Renda / Experiências VIP', tipo: 'INTERESSES', alcanceEstimado: 65000, canais: ['META'] },
    ],
    creatives: [
      { id: 'crt-01', nome: 'Banner Feed 1:1', tipo: 'IMAGEM', canal: 'META' },
    ],
    historyLogs: [
      { id: 'log-1', timestamp: '2026-09-22T10:00:00Z', autor: 'Produtor VIP', acao: 'Campanha pausada', detalhes: 'Setor Camarote atingiu 90% de ocupação' },
    ],
    criadoEm: '2026-09-12T10:00:00Z',
    atualizadoEm: '2026-09-22T10:00:00Z',
  },
];

export const INITIAL_CAMPANHAS = INITIAL_DETAILED_CAMPANHAS;

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

const INITIAL_PIXEL_CONFIGS: TrackingConfiguration[] = [
  {
    id: 'cfg-meta-01',
    producerId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    eventId: 'evento-operacao',
    name: 'Meta Ads Oficial & CAPI Hub',
    provider: 'META',
    publicId: '284019284019284',
    serverSecretMasked: 'EAAB***9xQ',
    status: 'ATIVO',
    environment: 'PRODUCTION',
    testEventCode: 'TEST12345',
    enabledEvents: ['PAGE_VIEW', 'VIEW_EVENT', 'ADD_TO_CART', 'BEGIN_CHECKOUT', 'PURCHASE'],
    health: 'SAUDAVEL',
    lastEventAt: '2026-09-25T10:15:00Z',
    lastSyncAt: '2026-09-25T10:10:00Z',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-25T10:15:00Z',
  },
  {
    id: 'cfg-ga4-01',
    producerId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    eventId: 'evento-operacao',
    name: 'Google Analytics 4 Measurement Protocol',
    provider: 'GOOGLE',
    publicId: 'G-7X982KJ412',
    serverSecretMasked: 'mp_sec***4a',
    status: 'ATIVO',
    environment: 'PRODUCTION',
    enabledEvents: ['PAGE_VIEW', 'VIEW_EVENT', 'ADD_TO_CART', 'BEGIN_CHECKOUT', 'PURCHASE'],
    health: 'SAUDAVEL',
    lastEventAt: '2026-09-25T10:14:00Z',
    lastSyncAt: '2026-09-25T10:00:00Z',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-25T10:14:00Z',
  },
  {
    id: 'cfg-tiktok-01',
    producerId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    eventId: 'evento-operacao',
    name: 'TikTok Pixel & Events API',
    provider: 'TIKTOK',
    publicId: 'C89102481920419241',
    serverSecretMasked: 'tt_tok***99',
    status: 'ATIVO',
    environment: 'PRODUCTION',
    enabledEvents: ['PAGE_VIEW', 'VIEW_EVENT', 'ADD_TO_CART', 'BEGIN_CHECKOUT', 'PURCHASE'],
    health: 'SAUDAVEL',
    lastEventAt: '2026-09-25T10:12:00Z',
    lastSyncAt: '2026-09-25T09:50:00Z',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-25T10:12:00Z',
  },
  {
    id: 'cfg-spotify-01',
    producerId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    eventId: 'evento-operacao',
    name: 'Spotify Atribuição de Áudio',
    provider: 'SPOTIFY',
    publicId: 'spot_attr_rock_2026',
    serverSecretMasked: 'spot***api',
    status: 'ATIVO',
    environment: 'PRODUCTION',
    enabledEvents: ['VIEW_EVENT', 'PURCHASE'],
    health: 'SAUDAVEL',
    lastEventAt: '2026-09-25T09:40:00Z',
    lastSyncAt: '2026-09-25T09:30:00Z',
    createdAt: '2026-09-05T12:00:00Z',
    updatedAt: '2026-09-25T09:40:00Z',
  },
];

const INITIAL_DELIVERY_LOGS: TrackingDeliveryLog[] = [
  {
    id: 'del-01',
    configurationId: 'cfg-meta-01',
    canonicalEventId: 'evt_purch_9841',
    eventName: 'PURCHASE',
    provider: 'META',
    source: 'SERVER',
    status: 'ENTREGUE',
    externalId: 'fb_capi_982141',
    correlationId: 'corr_pur_PED-849102',
    responseCode: 200,
    latencyMs: 38,
    retries: 0,
    timestamp: '2026-09-25T10:15:30Z',
  },
  {
    id: 'del-02',
    configurationId: 'cfg-meta-01',
    canonicalEventId: 'evt_cart_9841',
    eventName: 'ADD_TO_CART',
    provider: 'META',
    source: 'BROWSER',
    status: 'DEDUPLICADO',
    externalId: 'fb_capi_dedup_882',
    correlationId: 'corr_cart_984102',
    responseCode: 200,
    latencyMs: 2,
    retries: 0,
    timestamp: '2026-09-25T10:12:15Z',
  },
  {
    id: 'del-03',
    configurationId: 'cfg-ga4-01',
    canonicalEventId: 'evt_purch_9841',
    eventName: 'PURCHASE',
    provider: 'GOOGLE',
    source: 'SERVER',
    status: 'ENTREGUE',
    externalId: 'ga4_mp_812491',
    correlationId: 'corr_pur_PED-849102',
    responseCode: 200,
    latencyMs: 24,
    retries: 0,
    timestamp: '2026-09-25T10:15:31Z',
  },
  {
    id: 'del-04',
    configurationId: 'cfg-tiktok-01',
    canonicalEventId: 'evt_chk_9841',
    eventName: 'BEGIN_CHECKOUT',
    provider: 'TIKTOK',
    source: 'BROWSER',
    status: 'ENTREGUE',
    externalId: 'tt_ev_410291',
    correlationId: 'corr_chk_984100',
    responseCode: 200,
    latencyMs: 42,
    retries: 0,
    timestamp: '2026-09-25T10:14:02Z',
  },
];

const INITIAL_CONVERSIONS: ConversionRecord[] = [
  {
    id: 'conv-01',
    eventId: 'evento-operacao',
    producerId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    orderId: 'PED-849102',
    canonicalEventId: 'evt_purch_9841',
    valueCents: 35000,
    currency: 'BRL',
    utmSource: 'instagram',
    utmMedium: 'reels_ads',
    utmCampaign: 'virada_lote_d2',
    touchpoints: ['instagram_click', 'whatsapp_reminder', 'checkout_server_pix'],
    serverConfirmed: true,
    deliveredProviders: ['META', 'GOOGLE'],
    deduplicated: true,
    timestamp: '2026-09-25T10:15:30Z',
  },
  {
    id: 'conv-02',
    eventId: 'evento-operacao',
    producerId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    orderId: 'PED-849098',
    canonicalEventId: 'evt_purch_9842',
    valueCents: 45000,
    currency: 'BRL',
    utmSource: 'google',
    utmMedium: 'cpc_search',
    utmCampaign: 'ingressos_oficiais',
    touchpoints: ['google_search', 'checkout_server_cc'],
    serverConfirmed: true,
    deliveredProviders: ['META', 'GOOGLE', 'TIKTOK'],
    deduplicated: true,
    timestamp: '2026-09-25T09:42:00Z',
  },
  {
    id: 'conv-03',
    eventId: 'evento-operacao',
    producerId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    orderId: 'PED-849074',
    canonicalEventId: 'evt_purch_9843',
    valueCents: 36000,
    currency: 'BRL',
    utmSource: 'newsletter',
    utmMedium: 'email',
    utmCampaign: 'newsletter_semana_38',
    touchpoints: ['email_click', 'cupom_volta5', 'checkout_server_pix'],
    serverConfirmed: true,
    deliveredProviders: ['META', 'GOOGLE'],
    deduplicated: true,
    timestamp: '2026-09-25T08:50:00Z',
  },
];

const INITIAL_FUNNEL: ConversionFunnelItem[] = [
  { stage: 'VIEW_EVENT', label: 'Visualizou Evento', count: 18420, conversionRate: '100.0%' },
  { stage: 'ADD_TO_CART', label: 'Adicionou ao Carrinho', count: 3840, conversionRate: '20.8%' },
  { stage: 'BEGIN_CHECKOUT', label: 'Iniciou Checkout', count: 1940, conversionRate: '50.5%' },
  { stage: 'PURCHASE', label: 'Compra Confirmada (Server)', count: 812, conversionRate: '41.8%', revenueCents: 20300000 },
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
    if (t === 'criativos' || t === 'central-criativos') return 'criativos';
    if (t === 'utm-conversoes') return 'utm';
    if (t === 'ranking') return 'atribuicao';
    if (t === 'painel') return 'dashboard';
    const validTabs: MarketingVideoTab[] = [
      'dashboard',
      'campanhas',
      'campanhas-prontas',
      'criativos',
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
  const [campanhas, setCampanhas] = useState<DetailedCampaign[]>(INITIAL_DETAILED_CAMPANHAS);
  const [criativos, setCriativos] = useState<Creative[]>(INITIAL_CREATIVES);
  const [cupons, setCupons] = useState<any[]>([]);
  // Estados EDDIE 11.16.17: Multi-Pixel, CAPI, Conversões e Tracking Real
  const [pixelConfigs, setPixelConfigs] = useState<TrackingConfiguration[]>(INITIAL_PIXEL_CONFIGS);
  const [deliveryLogs, setDeliveryLogs] = useState<TrackingDeliveryLog[]>(INITIAL_DELIVERY_LOGS);
  const [conversions, setConversions] = useState<ConversionRecord[]>(INITIAL_CONVERSIONS);
  const [conversionFunnel, setConversionFunnel] = useState<ConversionFunnelItem[]>(INITIAL_FUNNEL);

  const [filtroProviderPixel, setFiltroProviderPixel] = useState<string>('TODOS');
  const [filtroHealthPixel, setFiltroHealthPixel] = useState<string>('TODOS');
  const [buscaPixel, setBuscaPixel] = useState('');

  const [modalPixelOpen, setModalPixelOpen] = useState(false);
  const [activePixelForEdit, setActivePixelForEdit] = useState<TrackingConfiguration | null>(null);

  const [modalDiagnosticOpen, setModalDiagnosticOpen] = useState(false);
  const [activePixelForDiagnostic, setActivePixelForDiagnostic] = useState<TrackingConfiguration | null>(null);

  const [modalLogsOpen, setModalLogsOpen] = useState(false);
  const [activePixelForLogs, setActivePixelForLogs] = useState<TrackingConfiguration | null>(null);

  const [modalConversionDetailOpen, setModalConversionDetailOpen] = useState(false);
  const [activeConversionForDetail, setActiveConversionForDetail] = useState<ConversionRecord | null>(null);

  const [linksUtm, setLinksUtm] = useState<UtmData[]>(INITIAL_UTMS);
  const [afiliados, setAfiliados] = useState<any[]>([]);
  const [statusRealData, setStatusRealData] = useState<any[]>([]);

  // Estados de Workspace e Modais 11.16.15
  const [selectedCampaignForWorkspace, setSelectedCampaignForWorkspace] = useState<DetailedCampaign | null>(null);
  const [modalWorkspaceOpen, setModalWorkspaceOpen] = useState(false);

  const [modalCreativeOpen, setModalCreativeOpen] = useState(false);
  const [activeCreativeForEdit, setActiveCreativeForEdit] = useState<Creative | null>(null);
  const [filtroTipoCriativo, setFiltroTipoCriativo] = useState<string>('todos');
  const [filtroCanalCriativo, setFiltroCanalCriativo] = useState<string>('todos');
  const [buscaCriativo, setBuscaCriativo] = useState('');

  const [selectedTemplateForDetail, setSelectedTemplateForDetail] = useState<CampaignTemplate | null>(null);
  const [modalTemplateDetailOpen, setModalTemplateDetailOpen] = useState(false);

  // Filtros e busca de Campanhas
  const [buscaCampanha, setBuscaCampanha] = useState('');
  const [filtroCanalCampanha, setFiltroCanalCampanha] = useState('todos');

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
        if (Array.isArray(data) && data.length > 0) {
          setPixelConfigs(data);
        }
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

  // Publicação de nova campanha via wizard (DetailedCampaign)
  const handlePublishCampaign = (data: CampaignFormData) => {
    triggerAction('PUBLISH', {
      produtorId,
      eventoId: data.eventoId,
      campaignName: data.nome,
      provider: data.canais[0] || 'META',
      payload: data,
    });
    const channels = data.canais.map((c) => c as MarketingChannel);
    const newCamp: DetailedCampaign = {
      id: `cmp-${Date.now()}`,
      nome: data.nome || 'Nova Campanha Multicanal',
      eventoId: data.eventoId,
      eventoNome: data.eventoNome || eventosList.find((e) => e.id === data.eventoId)?.nome,
      objetivo: data.objetivo || 'CONVERSAO',
      status: 'ATIVA',
      canais: channels,
      providerExecutions: channels.map((provider) => ({
        provider,
        status: 'ATIVA',
        externalId: `${provider.toLowerCase()}_act_${Math.floor(100000 + Math.random() * 900000)}`,
        lastSyncAt: new Date().toISOString(),
        spendCents: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
      })),
      orcamentoTipo: data.orcamentoTipo || 'DIARIO',
      orcamentoValorCents:
        data.orcamentoTipo === 'DIARIO'
          ? data.orcamentoValorBrl * 100
          : Math.round((data.orcamentoValorBrl * 100) / 30),
      gastoTotalCents: 0,
      dataInicio: data.dataInicio || (new Date().toISOString().split('T')[0] ?? ''),
      dataTermino: data.dataTermino || (new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0] ?? ''),
      cliques: 0,
      impressoes: 0,
      conversoes: 0,
      receitaAtribuidaCents: 0,
      cpaCents: 0,
      roas: '0.00x',
      audiences: [
        {
          id: `aud-${Date.now()}`,
          nome: data.publicoDetalhes || 'Público Alvo da Campanha',
          tipo: data.publicoTipo || 'LOOKALIKE',
          canais: channels,
        },
      ],
      creatives: [
        {
          id: `crt-${Date.now()}`,
          nome: data.criativoTitulo || 'Criativo Principal',
          tipo: 'IMAGEM',
          canal: channels[0] || 'META',
        },
      ],
      historyLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          autor: 'Marketing Ops',
          acao: 'Campanha Publicada',
          detalhes: `Ativação imediata nos provedores: ${channels.join(', ')}`,
        },
      ],
      utmSource: data.utmSource,
      utmMedium: data.utmMedium,
      utmCampaign: data.utmCampaign,
      utmContent: data.utmContent,
      pixelAssociado: data.pixelAssociado,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };
    setCampanhas((prev) => [newCamp, ...prev]);
    setFeedback({
      tipo: 'success',
      texto: `Campanha "${data.nome}" enviada e em entrega nos canais ${channels.join(', ')}!`,
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
    const channels = data.canais.map((c) => c as MarketingChannel);
    const newCamp: DetailedCampaign = {
      id: `cmp-${Date.now()}`,
      nome: data.nome || 'Rascunho de Campanha',
      eventoId: data.eventoId,
      eventoNome: data.eventoNome || eventosList.find((e) => e.id === data.eventoId)?.nome,
      objetivo: data.objetivo || 'CONVERSAO',
      status: 'RASCUNHO',
      canais: channels,
      providerExecutions: channels.map((provider) => ({
        provider,
        status: 'RASCUNHO',
        externalId: `${provider.toLowerCase()}_draft_${Math.floor(100000 + Math.random() * 900000)}`,
        lastSyncAt: new Date().toISOString(),
        spendCents: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
      })),
      orcamentoTipo: data.orcamentoTipo || 'DIARIO',
      orcamentoValorCents:
        data.orcamentoTipo === 'DIARIO'
          ? data.orcamentoValorBrl * 100
          : Math.round((data.orcamentoValorBrl * 100) / 30),
      gastoTotalCents: 0,
      dataInicio: data.dataInicio || (new Date().toISOString().split('T')[0] ?? ''),
      dataTermino: data.dataTermino || (new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0] ?? ''),
      cliques: 0,
      impressoes: 0,
      conversoes: 0,
      receitaAtribuidaCents: 0,
      cpaCents: 0,
      roas: 'N/A',
      audiences: [
        {
          id: `aud-${Date.now()}`,
          nome: data.publicoDetalhes || 'Segmento Definido',
          tipo: data.publicoTipo || 'LOOKALIKE',
          canais: channels,
        },
      ],
      creatives: [
        {
          id: `crt-${Date.now()}`,
          nome: data.criativoTitulo || 'Criativo em Rascunho',
          tipo: 'IMAGEM',
          canal: channels[0] || 'META',
        },
      ],
      historyLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          autor: 'Marketing Ops',
          acao: 'Rascunho Salvo',
          detalhes: 'Configurações de campanha salvas sem veiculação externa',
        },
      ],
      utmSource: data.utmSource,
      utmMedium: data.utmMedium,
      utmCampaign: data.utmCampaign,
      utmContent: data.utmContent,
      pixelAssociado: data.pixelAssociado,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };
    setCampanhas((prev) => [newCamp, ...prev]);
    setFeedback({
      tipo: 'success',
      texto: `Rascunho da campanha "${data.nome}" salvo com sucesso!`,
    });
  };

  // Operações de Workspace da Campanha (11.16.15)
  const handleOpenWorkspace = (camp: DetailedCampaign) => {
    setSelectedCampaignForWorkspace(camp);
    setModalWorkspaceOpen(true);
  };

  const handleUpdateDetailedCampaign = (updated: DetailedCampaign) => {
    setCampanhas((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setSelectedCampaignForWorkspace(updated);
    setFeedback({
      tipo: 'success',
      texto: `Campanha "${updated.nome}" atualizada com sucesso!`,
    });
  };

  const handleTogglePauseDetailedCampaign = (camp: DetailedCampaign) => {
    const isPaused = camp.status === 'PAUSADA';
    const newStatus: CampaignStatus = isPaused ? 'ATIVA' : 'PAUSADA';
    const updated: DetailedCampaign = {
      ...camp,
      status: newStatus,
      providerExecutions: (camp.providerExecutions || []).map((p) => ({
        ...p,
        status: p.status === 'ERRO' || p.status === 'REJEITADA' ? p.status : newStatus,
      })),
      historyLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          autor: 'Marketing Lead',
          acao: isPaused ? 'Campanha Retomada' : 'Campanha Pausada',
          detalhes: `Status alterado para ${newStatus} na gestão multicanal`,
        },
        ...(camp.historyLogs || []),
      ],
      atualizadoEm: new Date().toISOString(),
    };
    handleUpdateDetailedCampaign(updated);
    triggerAction(isPaused ? 'RESUME' : 'PAUSE', {
      produtorId,
      eventoId: camp.eventoId,
      campaignName: camp.nome,
      provider: camp.canais[0] || 'META',
    });
  };

  const handleDuplicateDetailedCampaign = (camp: DetailedCampaign) => {
    const duplicated: DetailedCampaign = {
      ...camp,
      id: `cmp-${Date.now()}`,
      nome: `${camp.nome} (Cópia)`,
      status: 'RASCUNHO',
      gastoTotalCents: 0,
      cliques: 0,
      impressoes: 0,
      conversoes: 0,
      receitaAtribuidaCents: 0,
      cpaCents: 0,
      roas: '0.00x',
      providerExecutions: (camp.providerExecutions || []).map((p) => ({
        ...p,
        status: 'RASCUNHO',
        externalId: `${p.provider.toLowerCase()}_draft_${Math.floor(100000 + Math.random() * 900000)}`,
        spendCents: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
      })),
      historyLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          autor: 'Marketing Lead',
          acao: 'Campanha Duplicada',
          detalhes: `Duplicada a partir de ${camp.nome} (#${camp.id})`,
        },
      ],
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };
    setCampanhas((prev) => [duplicated, ...prev]);
    setFeedback({
      tipo: 'success',
      texto: `Campanha "${camp.nome}" duplicada como rascunho com sucesso!`,
    });
  };

  const handlePublishDetailedCampaign = (camp: DetailedCampaign) => {
    const updated: DetailedCampaign = {
      ...camp,
      status: 'ATIVA',
      providerExecutions: (camp.providerExecutions || []).map((p) => ({
        ...p,
        status: 'ATIVA',
        lastSyncAt: new Date().toISOString(),
      })),
      historyLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          autor: 'Marketing Lead',
          acao: 'Campanha Publicada',
          detalhes: 'Publicação manual acionada pelo Workspace da Campanha',
        },
        ...(camp.historyLogs || []),
      ],
      atualizadoEm: new Date().toISOString(),
    };
    handleUpdateDetailedCampaign(updated);
  };

  const handlePauseDetailedCampaign = (camp: DetailedCampaign) => {
    handleTogglePauseDetailedCampaign(camp);
  };

  const handleResumeDetailedCampaign = (camp: DetailedCampaign) => {
    handleTogglePauseDetailedCampaign(camp);
  };

  const handleEndDetailedCampaign = (camp: DetailedCampaign) => {
    const updated: DetailedCampaign = {
      ...camp,
      status: 'ENCERRADA',
      providerExecutions: (camp.providerExecutions || []).map((p) => ({
        ...p,
        status: 'ENCERRADA',
        lastSyncAt: new Date().toISOString(),
      })),
      historyLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          autor: 'Marketing Lead',
          acao: 'Campanha Encerrada',
          detalhes: 'Encerramento de veiculação em todos os canais',
        },
        ...(camp.historyLogs || []),
      ],
      atualizadoEm: new Date().toISOString(),
    };
    handleUpdateDetailedCampaign(updated);
  };

  const handleEditCampaignInWizard = (camp: DetailedCampaign) => {
    const budgetCents = camp.orcamentoValorCents ?? camp.orcamentoTotalCents ?? ((camp as any).budget ? (camp as any).budget * 100 : 0);
    const firstCreative = (camp.creatives || camp.criativos || [])[0];
    const firstAudience = (camp.audiences || camp.publicos || [])[0];
    setWizardInitialData({
      id: camp.id,
      nome: camp.nome,
      eventoId: camp.eventoId,
      eventoNome: camp.eventoNome,
      objetivo: (camp.objetivo as any) || 'CONVERSAO',
      canais: camp.canais.map((c) => c as Provider),
      orcamentoTipo: camp.orcamentoTipo,
      orcamentoValorBrl: Math.round(budgetCents / 100),
      dataInicio: camp.dataInicio,
      dataTermino: camp.dataTermino,
      criativoTitulo: firstCreative?.nome || camp.nome,
      publicoDetalhes: firstAudience?.nome || '',
      utmSource: camp.utmSource,
      utmMedium: camp.utmMedium,
      utmCampaign: camp.utmCampaign,
      utmContent: camp.utmContent,
      pixelAssociado: camp.pixelAssociado,
    });
    setModalNovaCampanha(true);
  };

  // Gestão de Modelos / Campanhas Prontas (11.16.15)
  const handleOpenTemplateDetail = (template: CampaignTemplate) => {
    setSelectedTemplateForDetail(template);
    setModalTemplateDetailOpen(true);
  };

  const handleUseTemplateFromDetail = (template: CampaignTemplate) => {
    handleUseTemplate(template);
  };

  const handleDuplicateTemplate = (template: CampaignTemplate) => {
    setFeedback({
      tipo: 'success',
      texto: `Modelo "${template.titulo}" preparado para personalização no assistente!`,
    });
    handleUseTemplate(template);
  };

  // Carregar modelo de Campanhas Prontas no Wizard
  const handleUseTemplate = (modelo: any) => {
    const isFullTemplate = 'canaisRecomendados' in modelo;
    const canais = isFullTemplate
      ? (modelo.canaisRecomendados as string[]).map((c) => c as Provider)
      : modelo.canais?.includes('Google') ? ['META', 'GOOGLE'] : ['META'];

    const templateData: Partial<CampaignFormData> = {
      nome: isFullTemplate ? modelo.titulo.replace(/^\d+\.\s*/, '') : modelo.titulo,
      eventoId: effectiveEventoId || 'evento-operacao',
      eventoNome: eventosList.find((e) => e.id === effectiveEventoId)?.nome || eventosList[0]?.nome,
      objetivo: isFullTemplate ? modelo.objetivo : 'CONVERSAO',
      canais: canais as Provider[],
      criativoTitulo: isFullTemplate ? modelo.copySugerida?.headline : modelo.titulo,
      criativoCopy: isFullTemplate ? modelo.copySugerida?.body : modelo.copy,
      criativoCta: isFullTemplate ? modelo.copySugerida?.cta : 'Garantir Ingressos',
      criativoFormato: isFullTemplate ? modelo.copySugerida?.formato : 'IMAGEM_UNICA',
      publicoDetalhes: isFullTemplate ? modelo.publicoAlvo : modelo.publico,
      publicoTipo: isFullTemplate ? modelo.publicoTipo : 'LOOKALIKE',
      orcamentoTipo: 'DIARIO',
      orcamentoValorBrl: 250,
      utmSource: isFullTemplate ? modelo.trackingSugerido?.source : 'meta',
      utmMedium: isFullTemplate ? modelo.trackingSugerido?.medium : 'feed_stories',
      utmCampaign: isFullTemplate ? modelo.trackingSugerido?.campaign : 'campanha_pronta',
      utmContent: isFullTemplate ? modelo.trackingSugerido?.content : 'modelo_padrao',
    };
    setWizardInitialData(templateData);
    setModalNovaCampanha(true);
  };

  // Gestão de Criativos (11.16.15)
  const handleOpenCreativeModal = (creative?: Creative) => {
    setActiveCreativeForEdit(creative || null);
    setModalCreativeOpen(true);
  };

  const handleSaveCreative = (creative: Creative) => {
    setCriativos((prev) => {
      const idx = prev.findIndex((c) => c.id === creative.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = creative;
        return next;
      }
      return [creative, ...prev];
    });
    setFeedback({
      tipo: 'success',
      texto: `Criativo "${creative.nome}" salvo com sucesso!`,
    });
  };

  const handleDuplicateCreative = (creative: Creative) => {
    const duplicated: Creative = {
      ...creative,
      id: `crt-${Date.now()}`,
      nome: `${creative.nome} (Cópia)`,
      status: 'EM_ANALISE',
      campanhasVinculadasCount: 0,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };
    setCriativos((prev) => [duplicated, ...prev]);
    setFeedback({
      tipo: 'success',
      texto: `Criativo "${creative.nome}" duplicado com sucesso!`,
    });
  };

  const handleArchiveCreative = (creative: Creative) => {
    const updated: Creative = { ...creative, status: 'ARQUIVADO', atualizadoEm: new Date().toISOString() };
    handleSaveCreative(updated);
    setFeedback({
      tipo: 'success',
      texto: `Criativo "${creative.nome}" arquivado.`,
    });
  };

  const handleUseCreativeInCampaign = (creative: Creative) => {
    const provs = creative.canais.map((c) => c as Provider);
    setWizardInitialData({
      nome: `Campanha · ${creative.nome}`,
      eventoId: creative.eventoId || effectiveEventoId || 'evento-operacao',
      eventoNome: creative.eventoNome || eventosList[0]?.nome,
      canais: provs.length > 0 ? provs : ['META'],
      criativoTitulo: creative.titulo || creative.nome,
      criativoCopy: creative.texto || '',
      criativoCta: creative.cta || 'Comprar Ingressos',
      orcamentoTipo: 'DIARIO',
      orcamentoValorBrl: 200,
    });
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

  // Handlers EDDIE 11.16.17 — Multi-Pixel, CAPI e Telemetria
  const handleSavePixel = (cfg: TrackingConfiguration) => {
    setPixelConfigs((prev) => {
      const idx = prev.findIndex((p) => p.id === cfg.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = cfg;
        return next;
      }
      return [cfg, ...prev];
    });
    setFeedback({ tipo: 'success', texto: `Configuração "${cfg.name}" salva com sucesso!` });
  };

  const handleTogglePausePixel = (cfg: TrackingConfiguration) => {
    const isPaused = cfg.status === 'PAUSADO';
    const nextStatus = isPaused ? 'ATIVO' : 'PAUSADO';
    const nextHealth = isPaused ? 'SAUDAVEL' : 'DESCONECTADO';
    setPixelConfigs((prev) =>
      prev.map((p) => (p.id === cfg.id ? { ...p, status: nextStatus, health: nextHealth, updatedAt: new Date().toISOString() } : p))
    );
    setFeedback({
      tipo: 'success',
      texto: `Pixel "${cfg.name}" ${nextStatus === 'ATIVO' ? 'ativado' : 'pausado'} com sucesso!`,
    });
  };

  const handleTestPixel = (cfg: TrackingConfiguration) => {
    const newLog: TrackingDeliveryLog = {
      id: `del-test-${Date.now()}`,
      configurationId: cfg.id,
      canonicalEventId: `evt_test_${Date.now()}`,
      eventName: 'VIEW_EVENT',
      provider: cfg.provider,
      source: 'SERVER',
      status: 'ENTREGUE',
      externalId: `${cfg.provider.toLowerCase()}_test_${Date.now()}`,
      correlationId: `corr_test_${Date.now()}`,
      responseCode: 200,
      latencyMs: 32,
      retries: 0,
      timestamp: new Date().toISOString(),
    };
    setDeliveryLogs((prev) => [newLog, ...prev]);
    setPixelConfigs((prev) =>
      prev.map((p) => (p.id === cfg.id ? { ...p, lastSyncAt: new Date().toISOString() } : p))
    );
    triggerAction('TEST_EVENT', {
      produtorId,
      eventoId: effectiveEventoId,
      provider: cfg.provider,
      pixelId: cfg.publicId,
    });
  };

  const handleDeletePixel = (cfg: TrackingConfiguration) => {
    setPixelConfigs((prev) => prev.filter((p) => p.id !== cfg.id));
    setFeedback({ tipo: 'success', texto: `Configuração "${cfg.name}" removida com sucesso.` });
  };

  const handleOpenDiagnostic = (cfg: TrackingConfiguration) => {
    setActivePixelForDiagnostic(cfg);
    setModalDiagnosticOpen(true);
  };

  const handleOpenLogs = (cfg: TrackingConfiguration) => {
    setActivePixelForLogs(cfg);
    setModalLogsOpen(true);
  };

  const handleReprocessLog = (logId: string) => {
    setDeliveryLogs((prev) =>
      prev.map((l) => (l.id === logId ? { ...l, status: 'ENTREGUE', retries: l.retries + 1, responseCode: 200 } : l))
    );
    setFeedback({ tipo: 'success', texto: 'Evento reprocessado com garantia idempotente.' });
  };

  const handleOpenConversionDetail = (conv: ConversionRecord) => {
    setActiveConversionForDetail(conv);
    setModalConversionDetailOpen(true);
  };

  const pixelsFiltrados = useMemo(() => {
    return pixelConfigs.filter((pix) => {
      const matchProvider = filtroProviderPixel === 'TODOS' || pix.provider === filtroProviderPixel;
      const matchHealth = filtroHealthPixel === 'TODOS' || pix.health === filtroHealthPixel;
      const matchBusca =
        !buscaPixel ||
        pix.name.toLowerCase().includes(buscaPixel.toLowerCase()) ||
        pix.publicId.toLowerCase().includes(buscaPixel.toLowerCase()) ||
        pix.provider.toLowerCase().includes(buscaPixel.toLowerCase());
      return matchProvider && matchHealth && matchBusca;
    });
  }, [pixelConfigs, filtroProviderPixel, filtroHealthPixel, buscaPixel]);

  const campanhasFiltradas = useMemo(() => {
    return (campanhas || []).filter((c) => {
      if (!c) return false;
      const q = (buscaCampanha || '').toLowerCase().trim();
      const matchSearch =
        !q ||
        (c.nome || '').toLowerCase().includes(q) ||
        (c.eventoNome || '').toLowerCase().includes(q) ||
        (c.canais || []).some((ch) => ch.toLowerCase().includes(q));

      const matchChannel =
        filtroCanalCampanha === 'todos' ||
        (c.canais || []).includes(filtroCanalCampanha as MarketingChannel);

      let matchStatus = true;
      if (subTabCampanhas === 'Ativas') {
        matchStatus = c.status === 'ATIVA' || (c.status as string) === 'ENTREGANDO';
      } else if (subTabCampanhas === 'Agendadas') {
        matchStatus = c.status === 'AGENDADA';
      } else if (subTabCampanhas === 'Pausadas') {
        matchStatus = c.status === 'PAUSADA';
      } else if (subTabCampanhas === 'Finalizadas' || subTabCampanhas === 'Encerradas') {
        matchStatus = c.status === 'ENCERRADA' || (c.status as string) === 'FINALIZADA';
      } else if (subTabCampanhas === 'Rascunhos') {
        matchStatus = c.status === 'RASCUNHO';
      }

      return matchSearch && matchChannel && matchStatus;
    });
  }, [campanhas, subTabCampanhas, buscaCampanha, filtroCanalCampanha]);

  const campanhasAggregates = useMemo(() => {
    const list = campanhas || [];
    const ativas = list.filter((c) => c.status === 'ATIVA' || (c.status as string) === 'ENTREGANDO').length;
    const totalGastoCents = list.reduce(
      (acc, c) => acc + (c.gastoTotalCents ?? (c as any).orcamentoDiarioCents ?? 0),
      0
    );
    const totalImpressoes = list.reduce((acc, c) => acc + (c.impressoes ?? 0), 0);
    const totalCliques = list.reduce((acc, c) => acc + (c.cliques ?? 0), 0);
    const totalConversoes = list.reduce((acc, c) => acc + (c.conversoes ?? 0), 0);
    const totalReceitaCents = list.reduce((acc, c) => acc + (c.receitaAtribuidaCents ?? 0), 0);
    const cpaMedioCents = totalConversoes > 0 ? Math.round(totalGastoCents / totalConversoes) : 0;
    const roasConsolidado =
      totalGastoCents > 0 ? (totalReceitaCents / totalGastoCents).toFixed(2) + 'x' : '0.00x';

    return {
      ativas,
      totalGastoCents,
      totalImpressoes,
      totalCliques,
      totalConversoes,
      totalReceitaCents,
      cpaMedioCents,
      roasConsolidado,
    };
  }, [campanhas]);

  const criativosFiltrados = useMemo(() => {
    return (criativos || []).filter((cr) => {
      if (!cr) return false;
      const q = (buscaCriativo || '').toLowerCase().trim();
      const matchSearch =
        !q ||
        (cr.nome || '').toLowerCase().includes(q) ||
        (cr.titulo || '').toLowerCase().includes(q) ||
        (cr.texto || '').toLowerCase().includes(q) ||
        (cr.tags || []).some((t) => t.toLowerCase().includes(q));

      const matchTipo = filtroTipoCriativo === 'todos' || cr.tipo === filtroTipoCriativo;
      const matchCanal =
        filtroCanalCriativo === 'todos' ||
        (cr.canais || []).includes(filtroCanalCriativo as MarketingChannel);

      return matchSearch && matchTipo && matchCanal;
    });
  }, [criativos, buscaCriativo, filtroTipoCriativo, filtroCanalCriativo]);

  const handleEditCampaign = (camp: DetailedCampaign | any) => {
    handleEditCampaignInWizard(camp);
  };

  const handleTogglePauseCampaign = (camp: DetailedCampaign | any) => {
    handleTogglePauseDetailedCampaign(camp);
  };

  const handleDuplicateCampaign = (camp: DetailedCampaign | any) => {
    handleDuplicateDetailedCampaign(camp);
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

  // Matriz de navegação oficial (18 itens)
  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: <Gauge size={14} /> },
    { id: 'campanhas', label: 'Campanhas', icon: <Megaphone size={14} /> },
    { id: 'campanhas-prontas', label: 'Campanhas Prontas', badge: 'PRONTO', icon: <Zap size={14} /> },
    { id: 'criativos', label: 'Central de Criativos', badge: 'ASSETS', icon: <ImageIcon size={14} /> },
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
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-2">
            <Megaphone size={13} />
            <span>EDDIE 11.16.15 — Campanhas Multicanais Operacionais + Campanhas Prontas + Criativos</span>
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
        <div className="space-y-4">
          {/* Header e Ação */}
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-bold">
                  GESTÃO MULTICANAL
                </span>
                <span className="text-[10px] text-slate-500">Isolamento de falhas por provider</span>
              </div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 mt-1">
                <Megaphone size={18} className="text-purple-400" />
                <span>Central de Campanhas Multicanais</span>
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Criação coordenada, orçamentos, status individual por provider e painel operacional com 9 abas.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setModalNovaCampanha(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition"
              >
                <Plus size={14} /> Nova Campanha
              </button>
            </div>
          </div>

          {/* KPIs com Fontes Reais */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Campanhas Ativas</span>
              <div className="text-lg font-black text-white font-mono mt-1">{campanhasAggregates.ativas}</div>
              <span className="text-[10px] text-emerald-400 font-semibold">Em veiculação</span>
            </div>
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Investimento Real</span>
              <div className="text-lg font-black text-white font-mono mt-1">{formatBRL(campanhasAggregates.totalGastoCents)}</div>
              <span className="text-[10px] text-slate-400">Total apurado</span>
            </div>
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Impressões</span>
              <div className="text-lg font-black text-white font-mono mt-1">{campanhasAggregates.totalImpressoes.toLocaleString('pt-BR')}</div>
              <span className="text-[10px] text-sky-400 font-semibold">Exibições reais</span>
            </div>
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cliques no Link</span>
              <div className="text-lg font-black text-white font-mono mt-1">{campanhasAggregates.totalCliques.toLocaleString('pt-BR')}</div>
              <span className="text-[10px] text-purple-400 font-semibold">Tráfego gerado</span>
            </div>
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Conversões</span>
              <div className="text-lg font-black text-white font-mono mt-1">{campanhasAggregates.totalConversoes.toLocaleString('pt-BR')}</div>
              <span className="text-[10px] text-emerald-400 font-semibold">Ingressos pagos</span>
            </div>
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CPA Médio</span>
              <div className="text-lg font-black text-sky-400 font-mono mt-1">{formatBRL(campanhasAggregates.cpaMedioCents)}</div>
              <span className="text-[10px] text-slate-400">Custo / conversão</span>
            </div>
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ROAS Médio</span>
              <div className="text-lg font-black text-emerald-400 font-mono mt-1">{campanhasAggregates.roasConsolidado}</div>
              <span className="text-[10px] text-emerald-400 font-semibold">Retorno s/ mídia</span>
            </div>
          </div>

          {/* Filtros e Tabela */}
          <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Tabs de Status */}
              <div className="flex flex-wrap gap-1">
                {['Todas', 'Ativas', 'Agendadas', 'Pausadas', 'Finalizadas', 'Rascunhos'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSubTabCampanhas(st)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                      subTabCampanhas === st
                        ? 'bg-purple-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Busca e Filtro de Canal */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    value={buscaCampanha}
                    onChange={(e) => setBuscaCampanha(e.target.value)}
                    placeholder="Buscar campanha ou canal..."
                    className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs w-48 sm:w-60 focus:border-purple-500 outline-none"
                  />
                </div>
                <select
                  value={filtroCanalCampanha}
                  onChange={(e) => setFiltroCanalCampanha(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs outline-none focus:border-purple-500"
                >
                  <option value="todos">Todos os canais</option>
                  <option value="META">Meta Ads</option>
                  <option value="GOOGLE">Google Ads</option>
                  <option value="TIKTOK">TikTok Ads</option>
                  <option value="SPOTIFY">Spotify Ads</option>
                  <option value="WHATSAPP">WhatsApp</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800 font-semibold">
                  <tr>
                    <th className="p-3.5">Campanha & Evento</th>
                    <th className="p-3.5">Status por Provider</th>
                    <th className="p-3.5 text-right">Orçamento / Gasto</th>
                    <th className="p-3.5 text-center">Cliques</th>
                    <th className="p-3.5 text-center">Conv.</th>
                    <th className="p-3.5 text-right">Receita Atribuída</th>
                    <th className="p-3.5 text-center">ROAS</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {campanhasFiltradas.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-white">{c.nome}</div>
                        <div className="text-[10px] text-slate-500">{c.eventoNome || 'Evento Geral'}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1.5">
                          {c.providerExecutions && c.providerExecutions.length > 0 ? (
                            c.providerExecutions.map((p, idx) => (
                              <span
                                key={idx}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${
                                  p.status === 'ATIVA'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : p.status === 'ERRO' || p.status === 'REJEITADA'
                                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                    : p.status === 'PAUSADA'
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                                }`}
                              >
                                <span className="font-mono text-[9px]">{p.provider}:</span>
                                <span>{p.status}</span>
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-500 text-[11px] font-mono">{c.canais?.join(', ') || 'N/A'}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-right font-mono">
                        <div className="text-white font-bold">{formatBRL(c.orcamentoValorCents || (c as any).orcamentoDiarioCents || 0)}</div>
                        <div className="text-[10px] text-slate-500">Gasto: {formatBRL(c.gastoTotalCents || 0)}</div>
                      </td>
                      <td className="p-3.5 text-center font-mono">{(c.cliques ?? 0).toLocaleString('pt-BR')}</td>
                      <td className="p-3.5 text-center font-mono font-bold text-white">{(c.conversoes ?? 0).toLocaleString('pt-BR')}</td>
                      <td className="p-3.5 text-right font-mono font-bold text-emerald-400">
                        {formatBRL(c.receitaAtribuidaCents || 0)}
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold text-purple-400">
                        {c.roas || '0.00x'}
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.status === 'ATIVA' || (c.status as string) === 'ENTREGANDO'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : c.status === 'PAUSADA'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : c.status === 'AGENDADA'
                              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                              : c.status === 'RASCUNHO'
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenWorkspace(c)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-[11px] font-bold transition"
                            title="Abrir Workspace com as 9 Abas Operacionais"
                          >
                            <FolderOpen size={13} />
                            <span>Workspace</span>
                          </button>
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
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. CAMPANHAS PRONTAS (PRONTO) — 9 MODELOS COMPLETOS */}
      {/* ============================================================== */}
      {activeTab === 'campanhas-prontas' && (
        <div className="space-y-4">
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                  BIBLIOTECA OFICIAL
                </span>
                <span className="text-[10px] text-slate-500">9 modelos prontos para eventos</span>
              </div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 mt-1">
                <Zap size={18} className="text-amber-400" />
                <span>Modelos Pré-Configurados de Campanhas para Eventos</span>
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Ative réguas de tráfego pré-formatadas para as etapas cruciais de venda com UTMs e criativos padronizados.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setModalNovaCampanha(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition"
            >
              <Plus size={13} /> Criar do Zero
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {OFFICIAL_TEMPLATES.map((modelo) => (
              <div
                key={modelo.id}
                className="bg-[#111827] border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between hover:border-slate-700 transition shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                      {modelo.categoria}
                    </span>
                    <span className="text-[10px] text-purple-400 font-mono font-bold">ROAS {modelo.roasEstimado}</span>
                  </div>
                  <h3 className="text-xs font-bold text-white mt-2">{modelo.titulo}</h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">{modelo.estrategia}</p>
                  
                  <div className="mt-3 pt-2 border-t border-slate-800/80 space-y-1.5 text-[10px]">
                    <div className="text-slate-500 flex items-center gap-1">
                      <span className="text-slate-400 font-semibold">Canais:</span>
                      <span className="text-sky-300 font-mono">{modelo.canaisTexto}</span>
                    </div>
                    <div className="text-slate-500 truncate">
                      <span className="text-slate-400 font-semibold">Público:</span> {modelo.publicoAlvo}
                    </div>
                  </div>

                  {/* Snippet da Copy */}
                  <div className="mt-2.5 p-2 rounded bg-slate-900/60 border border-slate-800 text-[10px] text-slate-300 italic line-clamp-2">
                    &ldquo;{modelo.copySugerida.headline}&rdquo;
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenTemplateDetail(modelo)}
                    className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs border border-slate-700 transition"
                  >
                    Visualizar Modelo
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUseTemplate(modelo)}
                    className="flex-1 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow-md shadow-purple-600/20"
                  >
                    Usar Modelo
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3.1 CENTRAL DE CRIATIVOS & ASSETS (NOVA TELA OFICIAL 11.16.15) */}
      {/* ============================================================== */}
      {activeTab === 'criativos' && (
        <div className="space-y-4">
          {/* Header e Ação */}
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-bold">
                  BIBLIOTECA DE ASSETS
                </span>
                <span className="text-[10px] text-slate-500">Imagens, vídeos, áudios e textos por produtor</span>
              </div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 mt-1">
                <ImageIcon size={18} className="text-purple-400" />
                <span>Central de Criativos Multicanal</span>
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Gestão centralizada de assets com validação de dimensões e preview específico para Meta, Google, TikTok e Spotify.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenCreativeModal()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition"
            >
              <Plus size={14} /> Novo Criativo
            </button>
          </div>

          {/* KPIs da Central de Criativos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-3.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total de Criativos</span>
              <div className="text-xl font-black text-white font-mono mt-1">{criativos.length}</div>
              <span className="text-[10px] text-slate-500">Assets cadastrados</span>
            </div>
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-3.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ativos / Aprovados</span>
              <div className="text-xl font-black text-emerald-400 font-mono mt-1">
                {criativos.filter((c) => c.status === 'APROVADO' || c.status === 'ATIVO').length}
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold">Prontos para veiculação</span>
            </div>
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-3.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Em Análise</span>
              <div className="text-xl font-black text-amber-400 font-mono mt-1">
                {criativos.filter((c) => c.status === 'EM_ANALISE').length}
              </div>
              <span className="text-[10px] text-amber-400 font-semibold">Validação técnica</span>
            </div>
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-3.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Campanhas Vinculadas</span>
              <div className="text-xl font-black text-purple-400 font-mono mt-1">
                {criativos.reduce((acc, c) => acc + (c.campanhasVinculadasCount || 0), 0)}
              </div>
              <span className="text-[10px] text-purple-400 font-semibold">Reutilização ativa</span>
            </div>
          </div>

          {/* Filtros e Busca de Criativos */}
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tipo:</span>
              {['todos', 'IMAGEM', 'VIDEO', 'AUDIO', 'TEXTO', 'COMBINADO'].map((tp) => (
                <button
                  key={tp}
                  type="button"
                  onClick={() => setFiltroTipoCriativo(tp)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    filtroTipoCriativo === tp
                      ? 'bg-purple-600 text-white font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {tp === 'todos' ? 'Todos os Tipos' : tp}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-2.5 text-slate-500" />
                <input
                  type="text"
                  value={buscaCriativo}
                  onChange={(e) => setBuscaCriativo(e.target.value)}
                  placeholder="Buscar por título ou tag..."
                  className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs w-48 sm:w-56 focus:border-purple-500 outline-none"
                />
              </div>
              <select
                value={filtroCanalCriativo}
                onChange={(e) => setFiltroCanalCriativo(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs outline-none focus:border-purple-500"
              >
                <option value="todos">Todos os Canais</option>
                <option value="META">Meta</option>
                <option value="GOOGLE">Google</option>
                <option value="TIKTOK">TikTok</option>
                <option value="SPOTIFY">Spotify</option>
                <option value="WHATSAPP">WhatsApp</option>
              </select>
            </div>
          </div>

          {/* Grid de Criativos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {criativosFiltrados.map((cr) => (
              <div
                key={cr.id}
                className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition flex flex-col justify-between shadow-sm"
              >
                <div>
                  {/* Thumbnail / Mídia do Criativo */}
                  <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-800">
                    {cr.assetUrl ? (
                      <img
                        src={cr.assetUrl}
                        alt={cr.nome}
                        className="w-full h-full object-cover"
                      />
                    ) : cr.tipo === 'AUDIO' ? (
                      <div className="flex flex-col items-center gap-2 text-emerald-400">
                        <Volume2 size={32} />
                        <span className="text-[10px] font-mono">Spot de Áudio ({cr.duracaoSegundos || 30}s)</span>
                      </div>
                    ) : cr.tipo === 'TEXTO' ? (
                      <div className="p-3 text-left w-full space-y-1">
                        <div className="text-[11px] font-bold text-sky-400 line-clamp-1">{cr.titulo}</div>
                        <div className="text-[10px] text-slate-400 line-clamp-2">{cr.texto}</div>
                      </div>
                    ) : (
                      <ImageIcon size={32} className="text-slate-600" />
                    )}

                    <div className="absolute top-2 left-2 flex gap-1">
                      <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-white text-[9px] font-mono font-bold uppercase">
                        {cr.formato}
                      </span>
                    </div>

                    <div className="absolute top-2 right-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          cr.status === 'APROVADO' || cr.status === 'ATIVO'
                            ? 'bg-emerald-500/80 text-white'
                            : cr.status === 'EM_ANALISE'
                            ? 'bg-amber-500/80 text-white'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {cr.status}
                      </span>
                    </div>
                  </div>

                  {/* Informações */}
                  <div className="p-4 space-y-2.5">
                    <div>
                      <h3 className="text-xs font-bold text-white line-clamp-1">{cr.nome}</h3>
                      <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5">{cr.texto || cr.titulo}</p>
                    </div>

                    {/* Tags e Canais */}
                    <div className="flex flex-wrap gap-1">
                      {cr.canais.map((c) => (
                        <span key={c} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[9px] font-mono">
                          {c}
                        </span>
                      ))}
                      {(cr.tags || []).map((t) => (
                        <span key={t} className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[9px]">
                          #{t}
                        </span>
                      ))}
                    </div>

                    {/* Métricas e Validação */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">
                        {cr.campanhasVinculadasCount || 0} campanhas vinculadas
                      </span>
                      {cr.validacao?.valido && (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 size={11} /> Validado
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="px-4 py-3 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenCreativeModal(cr)}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
                      title="Visualizar Preview"
                    >
                      <Eye size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenCreativeModal(cr)}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
                      title="Editar Criativo"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicateCreative(cr)}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
                      title="Duplicar Criativo"
                    >
                      <Copy size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleArchiveCreative(cr)}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-amber-400 transition"
                      title="Arquivar Criativo"
                    >
                      <Archive size={13} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleUseCreativeInCampaign(cr)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] transition shadow-md shadow-purple-600/20"
                  >
                    <span>Usar em Campanha</span>
                    <ArrowRight size={11} />
                  </button>
                </div>
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
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-6">
          {/* CABEÇALHO DA CENTRAL MULTI-PIXEL */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Target size={18} className="text-purple-400" />
                <h2 className="text-base font-bold text-white">Central Multi-Pixel, CAPI & Tracking Real</h2>
                <span className="rounded-full bg-purple-500/10 text-purple-400 px-2.5 py-0.5 text-[10px] font-mono font-bold border border-purple-500/20">
                  SERVER-SIDE ENGINE
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                Deduplicação estável Browser + Server, Meta CAPI, GA4 Measurement Protocol, TikTok Events API e Atribuição
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setActivePixelForEdit(null);
                  setModalPixelOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow-lg shadow-purple-600/20"
              >
                <Plus size={14} /> Novo Pixel / Servidor CAPI
              </button>
              <button
                onClick={() => {
                  if (pixelConfigs.length > 0) handleOpenDiagnostic(pixelConfigs[0]!);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition"
              >
                <Activity size={14} className="text-sky-400" /> Diagnóstico Geral
              </button>
              <button
                onClick={() => {
                  if (pixelConfigs.length > 0) handleOpenLogs(pixelConfigs[0]!);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition"
              >
                <FileText size={14} className="text-purple-400" /> Logs de Entrega
              </button>
              <button
                onClick={() => handleEnviarPingCAPI('Multi-Pixel Hub')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-purple-500/30 bg-purple-950/20 text-purple-300 hover:bg-purple-900/30 font-bold text-xs transition"
              >
                <Zap size={14} /> Testar Ping Geral
              </button>
            </div>
          </div>

          {/* BARRA DE FILTROS E BUSCA */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              {(['TODOS', 'META', 'GOOGLE', 'TIKTOK', 'SPOTIFY'] as const).map((prov) => (
                <button
                  key={prov}
                  onClick={() => setFiltroProviderPixel(prov)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    filtroProviderPixel === prov
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {prov === 'TODOS'
                    ? 'Todos Provedores'
                    : prov === 'META'
                    ? 'Meta CAPI'
                    : prov === 'GOOGLE'
                    ? 'Google GA4'
                    : prov === 'TIKTOK'
                    ? 'TikTok Pixel'
                    : 'Spotify'}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-64">
              <Search size={14} className="absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar pixel por nome ou ID..."
                value={buscaPixel}
                onChange={(e) => setBuscaPixel(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* GRID DE PIXELS CONFIGURADOS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pixelsFiltrados.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
                Nenhum pixel encontrado para os filtros selecionados.
              </div>
            ) : (
              pixelsFiltrados.map((pix) => (
                <div
                  key={pix.id}
                  className="bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-xl p-4 space-y-3.5 flex flex-col justify-between transition"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-white hover:text-purple-400 transition">
                            {pix.name}
                          </h3>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[9px] font-mono font-bold ${
                              pix.provider === 'META'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : pix.provider === 'GOOGLE'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : pix.provider === 'TIKTOK'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {pix.provider}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                          ID: <span className="text-white font-semibold">{pix.publicId}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            pix.health === 'SAUDAVEL'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : pix.health === 'ATENCAO'
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {pix.health}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                            pix.status === 'ATIVO'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {pix.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
                      <div>
                        <span className="text-slate-500 text-[10px] block">Token CAPI:</span>
                        <span className="font-mono text-purple-400">{pix.serverSecretMasked}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">Ambiente:</span>
                        <span className="font-semibold text-slate-300">
                          {pix.environment === 'PRODUCTION' ? 'Produção' : 'Modo Teste'}
                        </span>
                      </div>
                    </div>

                    {/* EVENTOS HABILITADOS */}
                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                        Eventos Habilitados ({pix.enabledEvents.length})
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {pix.enabledEvents.map((evt) => (
                          <span
                            key={evt}
                            className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] text-slate-300 font-mono"
                          >
                            {evt}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* AÇÕES OPERACIONAIS */}
                  <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-1.5 text-xs">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setActivePixelForEdit(pix);
                          setModalPixelOpen(true);
                        }}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition text-[11px]"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleTogglePausePixel(pix)}
                        className={`px-2 py-1 rounded font-medium transition text-[11px] ${
                          pix.status === 'ATIVO'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                        }`}
                      >
                        {pix.status === 'ATIVO' ? 'Pausar' : 'Reativar'}
                      </button>
                      <button
                        onClick={() => handleTestPixel(pix)}
                        className="px-2 py-1 rounded bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 font-bold transition text-[11px]"
                        title="Enviar evento de teste CAPI"
                      >
                        Testar
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenDiagnostic(pix)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 font-medium transition text-[11px]"
                      >
                        Diagnóstico
                      </button>
                      <button
                        onClick={() => handleOpenLogs(pix)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition text-[11px]"
                      >
                        Logs
                      </button>
                      <button
                        onClick={() => handleDeletePixel(pix)}
                        className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-medium transition text-[11px]"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* PAINEL DE CONVERSÕES REAIS & FUNIL SERVER-SIDE */}
          <div className="rounded-xl border border-slate-800 bg-[#0e131f] p-5 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-400" />
                  <span>Funil de Conversão & Deduplicação Server-Side</span>
                </h3>
                <p className="text-slate-400 text-xs">
                  Eventos de compra confirmados exclusivamente pela operação com garantia contra falsos positivos
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">
                  Deduplicação Browser/Server: <b className="text-emerald-400 font-mono">100% OK</b>
                </span>
              </div>
            </div>

            {/* ETAPAS DO FUNIL */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {conversionFunnel.map((item, idx) => (
                <div
                  key={item.stage}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-1 relative"
                >
                  <div className="text-[10px] text-slate-400 uppercase font-semibold flex justify-between">
                    <span>Etapa {idx + 1}</span>
                    <span className="font-mono text-purple-400">{item.conversionRate}</span>
                  </div>
                  <div className="text-lg font-bold text-white font-mono">
                    {item.count.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-[11px] text-slate-300 font-semibold">{item.label}</div>
                  {item.revenueCents && (
                    <div className="text-[10px] text-emerald-400 font-mono font-bold pt-1">
                      {(item.revenueCents / 100).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* TABELA DE ÚLTIMAS CONVERSÕES CONFIRMADAS */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-200">
                Últimas Conversões Confirmadas Server-Side:
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Pedido</th>
                      <th className="py-2.5 px-3">Valor</th>
                      <th className="py-2.5 px-3">UTM Atribuída</th>
                      <th className="py-2.5 px-3">Touchpoints</th>
                      <th className="py-2.5 px-3">Status Dedup</th>
                      <th className="py-2.5 px-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {conversions.map((conv) => (
                      <tr key={conv.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-2.5 px-3 font-bold text-sky-400">{conv.orderId}</td>
                        <td className="py-2.5 px-3 text-emerald-400 font-bold">
                          {(conv.valueCents / 100).toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: conv.currency || 'BRL',
                          })}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300 font-sans">
                          {conv.utmSource ? `${conv.utmSource} / ${conv.utmCampaign || 'geral'}` : 'Direto / Orgânico'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 text-[10px]">
                          {conv.touchpoints.length} passos registrados
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="rounded-full px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                            SERVER CONFIRMED
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleOpenConversionDetail(conv)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-sans text-[11px] font-bold border border-slate-700"
                          >
                            Auditar Conversão
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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

      {/* Modais EDDIE 11.16.15: Workspace da Campanha, Central de Criativos e Detalhes de Modelos */}
      <CampaignWorkspaceModal
        isOpen={modalWorkspaceOpen}
        onClose={() => {
          setModalWorkspaceOpen(false);
          setSelectedCampaignForWorkspace(null);
        }}
        campaign={selectedCampaignForWorkspace}
        onEdit={handleEditCampaignInWizard}
        onDuplicate={handleDuplicateDetailedCampaign}
        onTogglePause={handleTogglePauseDetailedCampaign}
        onStop={handleEndDetailedCampaign}
        onPublish={handlePublishDetailedCampaign}
        onSync={(camp) => {
          triggerAction('SYNC', {
            produtorId,
            eventoId: camp.eventoId,
            campaignName: camp.nome,
          });
        }}
        onUpdateBudget={(campId, newBudgetCents) => {
          setCampanhas((prev) =>
            prev.map((c) =>
              c.id === campId
                ? {
                    ...c,
                    orcamentoTotalCents: newBudgetCents,
                    orcamentoValorCents: newBudgetCents,
                    historyLogs: [
                      {
                        id: `log-${Date.now()}`,
                        timestamp: new Date().toISOString(),
                        autor: 'Marketing Lead',
                        acao: 'Orçamento Alterado',
                        detalhes: `Novo valor: R$ ${(newBudgetCents / 100).toFixed(2)}`,
                      },
                      ...(c.historyLogs || []),
                    ],
                  }
                : c
            )
          );
        }}
        onOpenQr={(url, name) => {
          setActiveUtmForQr({
            id: `temp-qr-${Date.now()}`,
            nome: name,
            eventoId: effectiveEventoId || 'evento-geral',
            canal: 'Campanha Multicanal',
            source: 'campanha',
            medium: 'multicanal',
            campaign: name,
            content: 'criativo_campanha',
            urlDestino: url,
            urlFinal: url,
            visitas: 0,
            carrinhos: 0,
            checkouts: 0,
            compras: 0,
            taxaConversao: '0.0%',
            receitaCents: 0,
            ticketMedioCents: 0,
            status: 'ATIVO',
            criadoEm: new Date().toISOString(),
          });
        }}
      />

      <CreativeManagementModal
        isOpen={modalCreativeOpen}
        onClose={() => {
          setModalCreativeOpen(false);
          setActiveCreativeForEdit(null);
        }}
        onSave={handleSaveCreative}
        initialData={activeCreativeForEdit}
        eventos={eventosList}
        currentEventoId={effectiveEventoId}
      />

      <TemplateDetailModal
        isOpen={modalTemplateDetailOpen}
        onClose={() => {
          setModalTemplateDetailOpen(false);
          setSelectedTemplateForDetail(null);
        }}
        template={selectedTemplateForDetail}
        onUseTemplate={handleUseTemplateFromDetail}
        onDuplicateTemplate={handleDuplicateTemplate}
      />

      {/* Modais de Tracking, Multi-Pixel, Diagnóstico e Conversões (EDDIE 11.16.17) */}
      <PixelManagementModal
        isOpen={modalPixelOpen}
        onClose={() => {
          setModalPixelOpen(false);
          setActivePixelForEdit(null);
        }}
        onSave={handleSavePixel}
        initialData={activePixelForEdit}
        eventos={eventosList}
        currentEventoId={effectiveEventoId}
      />

      <PixelDiagnosticModal
        isOpen={modalDiagnosticOpen}
        onClose={() => {
          setModalDiagnosticOpen(false);
          setActivePixelForDiagnostic(null);
        }}
        config={activePixelForDiagnostic}
        onRefreshDiagnostic={() => {
          setFeedback({ tipo: 'success', texto: 'Telemetria e diagnóstico do pixel atualizados com sucesso.' });
        }}
      />

      <PixelLogsModal
        isOpen={modalLogsOpen}
        onClose={() => {
          setModalLogsOpen(false);
          setActivePixelForLogs(null);
        }}
        config={activePixelForLogs}
        logs={deliveryLogs}
        onReprocessLog={handleReprocessLog}
      />

      <ConversionDetailModal
        isOpen={modalConversionDetailOpen}
        onClose={() => {
          setModalConversionDetailOpen(false);
          setActiveConversionForDetail(null);
        }}
        conversion={activeConversionForDetail}
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

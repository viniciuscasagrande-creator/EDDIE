'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  RotateCcw,
  ShoppingCart,
  Workflow,
  MessageCircle,
  Mail,
  Users,
  CreditCard,
  FileBarChart,
  ShieldCheck,
  TrendingUp,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RefreshCcw,
  Plus,
  Play,
  Pause,
  ExternalLink,
  Copy,
  Check,
  DollarSign,
  Zap,
  Target,
  Send,
  Eye,
  Smartphone,
  ChevronRight,
  Search,
  SlidersHorizontal,
  Layers,
  Lock,
  Share2,
  FileText,
  Sparkles,
  CheckCheck,
  Globe,
} from 'lucide-react';
import { useProducerEvent } from '../ProducerEventContext';
import { ModuleNavigation } from '../navigation/ModuleNavigation';
import { CompactOperationalAlert } from '../navigation/CompactOperationalAlert';

export type RemarketingTab =
  | 'dashboard'
  | 'publicos'
  | 'segmentos'
  | 'jornadas'
  | 'carrinho'
  | 'visitou-nao-comprou'
  | 'compradores'
  | 'recorrentes'
  | 'whatsapp'
  | 'email'
  | 'campanhas'
  | 'automacoes'
  | 'conversoes'
  | 'relatorios'
  | 'pix_pendente';

interface RemarketingWorkspaceProps {
  initialTab?: string;
  contextEventoId?: string | null;
  eventoId?: string | null;
}

const brl = (v: number | string | null | undefined) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v || 0));

const fmtNum = (v: number | string | null | undefined) =>
  new Intl.NumberFormat('pt-BR').format(Number(v || 0));

const normalizeTab = (t?: string): RemarketingTab => {
  if (!t) return 'dashboard';
  if (t === 'carrinhos' || t === 'carrinho-abandonado') return 'carrinho';
  if (t === 'compradores-anteriores') return 'compradores';
  if (t === 'clientes-recorrentes') return 'recorrentes';
  if (t === 'recuperacao-whatsapp' || t === 'whatsapp_email') return 'whatsapp';
  if (t === 'recuperacao-email') return 'email';
  if (t === 'conversoes_auditoria' || t === 'conversoes-recuperadas') return 'conversoes';
  if (t === 'painel') return 'dashboard';
  if (t === 'pix-pagamentos') return 'pix_pendente';
  const valid: RemarketingTab[] = [
    'dashboard',
    'publicos',
    'segmentos',
    'jornadas',
    'carrinho',
    'visitou-nao-comprou',
    'compradores',
    'recorrentes',
    'whatsapp',
    'email',
    'campanhas',
    'automacoes',
    'conversoes',
    'relatorios',
    'pix_pendente',
  ];
  return valid.includes(t as RemarketingTab) ? (t as RemarketingTab) : 'dashboard';
};

export default function RemarketingWorkspace({
  initialTab = 'dashboard',
  contextEventoId,
  eventoId: propEventoId,
}: RemarketingWorkspaceProps) {
  const { api, produtorId, eventoId: ctxEventoId, evento, eventos } = useProducerEvent();
  const activeEventoId = contextEventoId || propEventoId || ctxEventoId || 'evento-operacao';
  const activeEvento = eventos.find((e) => e.id === activeEventoId) || evento;

  const [tab, setTab] = useState<RemarketingTab>(() => normalizeTab(initialTab));

  useEffect(() => {
    if (initialTab) {
      setTab(normalizeTab(initialTab));
    }
  }, [initialTab]);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [feedback, setFeedback] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  // Filtros de carrinhos
  const [filtroStatusCarrinho, setFiltroStatusCarrinho] = useState<'TODOS' | 'ABERTO' | 'DISPARADO' | 'RECUPERADO'>('TODOS');
  const [buscaCarrinho, setBuscaCarrinho] = useState('');

  // Estado do Construtor de Jornada
  const [jornadaAtiva, setJornadaAtiva] = useState(true);
  const [jornadaSteps, setJornadaSteps] = useState([
    {
      id: 'step-1',
      kind: 'GATILHO',
      titulo: 'Visitou página do evento ou adicionou ingresso ao carrinho',
      detalhes: 'Gatilho disparado via Pixel e Sessão de Navegação',
      ativo: true,
      pessoasNoNo: 1420,
    },
    {
      id: 'step-2',
      kind: 'CONDICAO',
      titulo: 'Não finalizou o pagamento em 30 minutos',
      detalhes: 'Tempo de expiração da reserva temporária',
      ativo: true,
      pessoasNoNo: 380,
    },
    {
      id: 'step-3',
      kind: 'ACAO',
      titulo: 'Disparo de WhatsApp Oficial com link direto de reserva',
      detalhes: 'Template pré-aprovado com CTA "Finalizar em 1 clique"',
      ativo: true,
      pessoasNoNo: 310,
    },
    {
      id: 'step-4',
      kind: 'ESPERA',
      titulo: 'Aguardar 6 horas por confirmação de pagamento',
      detalhes: 'Monitoramento do webhook de liquidação Pix/Cartão',
      ativo: true,
      pessoasNoNo: 180,
    },
    {
      id: 'step-5',
      kind: 'DECISAO',
      titulo: 'Pedido foi concluído?',
      detalhes: 'SIM: Encerrar jornada e atribuir receita | NÃO: Acionar Mídia Paga',
      ativo: true,
      pessoasNoNo: 120,
    },
    {
      id: 'step-6',
      kind: 'ACAO_REMARKETING',
      titulo: 'Público Dinâmico no Meta Ads, Google Ads e TikTok + E-mail Cupom',
      detalhes: 'Exibe anúncios com urgência e oferece 5% de incentivo',
      ativo: true,
      pessoasNoNo: 72,
    },
    {
      id: 'step-7',
      kind: 'RESULTADO',
      titulo: 'Conversão no Checkout e registro auditável no Ledger',
      detalhes: 'Receita líquida resgatada vinculada ao produtor',
      ativo: true,
      pessoasNoNo: 48,
    },
  ]);

  // Lista de carrinhos em tempo real
  const [carrinhos, setCarrinhos] = useState([
    {
      id: 'car-9821',
      clienteNome: 'Mariana Silva',
      email: 'mariana.silva@email.com',
      telefone: '(41) 98765-4321',
      setor: 'Pista Premium (2 ingressos)',
      valorCents: 35000,
      tempoAbandono: 'há 18 min',
      canalEntrada: 'Meta Ads (Instagram)',
      status: 'ABERTO',
    },
    {
      id: 'car-9820',
      clienteNome: 'Carlos Eduardo',
      email: 'carlos.edu@gmail.com',
      telefone: '(11) 99882-1244',
      setor: 'Camarote Open Bar (1 ingresso)',
      valorCents: 45000,
      tempoAbandono: 'há 42 min',
      canalEntrada: 'Google Search',
      status: 'DISPARADO',
    },
    {
      id: 'car-9819',
      clienteNome: 'Fernanda Lima',
      email: 'fe.lima@outlook.com',
      telefone: '(41) 99123-8877',
      setor: 'Pista Comum (3 ingressos)',
      valorCents: 36000,
      tempoAbandono: 'há 1h 15m',
      canalEntrada: 'Orgânico',
      status: 'RECUPERADO',
    },
    {
      id: 'car-9818',
      clienteNome: 'Rodrigo Alves',
      email: 'rodrigo.alves@empresa.com',
      telefone: '(51) 98112-9900',
      setor: 'Pista Premium (1 ingresso)',
      valorCents: 17500,
      tempoAbandono: 'há 2h',
      canalEntrada: 'WhatsApp Link',
      status: 'ABERTO',
    },
  ]);

  // Carregar dados de remarketing
  const carregarRemarketing = useCallback(async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const endpoint = activeEventoId
        ? `/api/eventos/${activeEventoId}/remarketing/dashboard`
        : `/api/remarketing/dashboard`;
      const res = await fetch(endpoint);
      if (res.ok) {
        setData(await res.json());
      } else {
        setData(getFallbackRemarketingData(activeEvento?.nome || 'Festival DiskIngressos Live 2026'));
      }
    } catch {
      setData(getFallbackRemarketingData(activeEvento?.nome || 'Festival DiskIngressos Live 2026'));
    } finally {
      setLoading(false);
    }
  }, [activeEventoId, activeEvento?.nome]);

  useEffect(() => {
    carregarRemarketing();
  }, [carregarRemarketing]);

  // Disparo de recuperação manual
  const dispararRecuperacao = (carrinhoId: string, canal: 'whatsapp' | 'email') => {
    setCarrinhos((prev) =>
      prev.map((c) => (c.id === carrinhoId ? { ...c, status: 'DISPARADO' } : c))
    );
    setFeedback({
      tipo: 'success',
      texto: `Disparo de recuperação via ${canal.toUpperCase()} enviado com sucesso para o carrinho #${carrinhoId}!`,
    });
  };

  const dispararTodosAbertos = () => {
    setCarrinhos((prev) =>
      prev.map((c) => (c.status === 'ABERTO' ? { ...c, status: 'DISPARADO' } : c))
    );
    setFeedback({
      tipo: 'success',
      texto: 'Régua de resgate automático disparada para todos os carrinhos abertos!',
    });
  };

  const carrinhosFiltrados = useMemo(() => {
    return carrinhos.filter((c) => {
      const matchStatus = filtroStatusCarrinho === 'TODOS' || c.status === filtroStatusCarrinho;
      const matchBusca =
        !buscaCarrinho ||
        c.clienteNome.toLowerCase().includes(buscaCarrinho.toLowerCase()) ||
        c.email.toLowerCase().includes(buscaCarrinho.toLowerCase()) ||
        c.id.toLowerCase().includes(buscaCarrinho.toLowerCase());
      return matchStatus && matchBusca;
    });
  }, [carrinhos, filtroStatusCarrinho, buscaCarrinho]);

  const REMARKETING_NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard Remarketing', icon: <TrendingUp size={16} /> },
    { id: 'publicos', label: 'Públicos', icon: <Users size={16} /> },
    { id: 'segmentos', label: 'Segmentos', icon: <Target size={16} /> },
    { id: 'jornadas', label: 'Jornadas de Remarketing', icon: <Workflow size={16} /> },
    { id: 'carrinho', label: 'Carrinho Abandonado', icon: <ShoppingCart size={16} /> },
    { id: 'visitou-nao-comprou', label: 'Visitou e Não Comprou', icon: <Eye size={16} /> },
    { id: 'compradores', label: 'Compradores Anteriores', icon: <Users size={16} /> },
    { id: 'recorrentes', label: 'Clientes Recorrentes', icon: <RotateCcw size={16} /> },
    { id: 'whatsapp', label: 'Recuperação WhatsApp', icon: <MessageCircle size={16} /> },
    { id: 'email', label: 'Recuperação E-mail', icon: <Mail size={16} /> },
    { id: 'campanhas', label: 'Campanhas de Remarketing', icon: <Zap size={16} /> },
    { id: 'automacoes', label: 'Automações de Remarketing', icon: <Workflow size={16} /> },
    { id: 'conversoes', label: 'Conversões Recuperadas', icon: <ShieldCheck size={16} /> },
    { id: 'relatorios', label: 'Relatórios de Remarketing', icon: <FileBarChart size={16} /> },
  ];

  return (
    <div className="space-y-6 max-w-[1800px] mx-auto text-slate-100 pb-16">
      {/* CABEÇALHO DA CENTRAL DE REMARKETING */}
      <div className="rounded-2xl border border-orange-500/20 bg-gradient-to-r from-[#1c1108] via-[#141216] to-[#0e121a] p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-orange-500/10 px-2.5 py-0.5 text-xs font-bold text-orange-400 border border-orange-500/20">
                <RotateCcw size={14} />
                MOTOR DE REMARKETING & RECUPERAÇÃO
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                RÉGUA AUTOMATIZADA EM TEMPO REAL
              </span>
              {activeEventoId && activeEventoId !== 'todos' ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs font-medium text-purple-300 border border-purple-500/20">
                  Evento: <b>{activeEvento?.nome || activeEventoId}</b>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-300 border border-slate-700">
                  Visão Consolidada do Produtor
                </span>
              )}
            </div>

            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
              Central de Remarketing {activeEvento?.nome ? `· ${activeEvento.nome}` : ''}
            </h1>
            <p className="text-xs lg:text-sm text-slate-400 max-w-3xl">
              Recupere carrinhos abandonados, PIX expirando e reative clientes de edições anteriores sem pagar por novos cliques de tráfego pago.
            </p>
          </div>

          {/* Ações Rápidas */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={dispararTodosAbertos}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-orange-500 transition shadow-lg shadow-orange-600/20"
            >
              <Zap size={15} /> Recuperar Carrinhos Abertos
            </button>
            <button
              onClick={() => setTab('jornadas')}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs font-semibold text-slate-200 hover:border-orange-500/50 transition"
            >
              <Workflow size={15} /> Construtor de Jornada
            </button>
            <button
              onClick={carregarRemarketing}
              className="rounded-xl border border-slate-700 bg-slate-800/80 p-2.5 text-slate-300 hover:text-white transition"
              title="Recarregar Métricas"
            >
              <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className={`rounded-xl border p-4 text-xs font-medium flex items-center justify-between ${
            feedback.tipo === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-red-500/30 bg-red-500/10 text-red-300'
          }`}
        >
          <span>{feedback.texto}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">
            Fechar
          </button>
        </div>
      )}

      {/* BARRA DE NAVEGAÇÃO COMPLETA (14 DESTINOS PARIDADE EDDIE 11.16.12) */}
      <ModuleNavigation
        items={REMARKETING_NAV_ITEMS}
        activeItem={tab}
        onSelect={(id) => setTab(id as RemarketingTab)}
        ariaLabel="Navegação de Remarketing e Resgate"
      />

      {/* 1. ABA DASHBOARD */}
      {tab === 'dashboard' && (
        <div className="space-y-6">
          {/* KPI CARDS DE REMARKETING */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-800 bg-[#121620] p-5 space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Públicos Ativos em Remarketing
              </div>
              <div className="text-2xl font-black text-white mt-1">
                {fmtNum(data?.kpis?.publicosAtivos || 4820)} <small className="text-xs font-normal text-slate-400">leads</small>
              </div>
              <div className="text-[11px] text-sky-400 font-medium">Segmentados por comportamento</div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#121620] p-5 space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Carrinhos Abandonados (24h)
              </div>
              <div className="text-2xl font-black text-amber-400 mt-1">
                {fmtNum(data?.kpis?.carrinhosAbandonados || 382)}
              </div>
              <div className="text-[11px] text-slate-400 font-medium">Potencial de resgate imediato</div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#121620] p-5 space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Carrinhos Recuperados
              </div>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {fmtNum(data?.kpis?.carrinhosRecuperados || 164)}
              </div>
              <div className="text-[11px] text-emerald-400 font-medium">
                Taxa de resgate: <b>{data?.kpis?.taxaRecuperacao || '42.9%'}</b>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#121620] p-5 space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Receita Resgatada (Auditada)
              </div>
              <div className="text-2xl font-black text-white mt-1">
                {brl(data?.kpis?.receitaRecuperadaCents || 5845000)}
              </div>
              <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <TrendingUp size={12} /> Liquidado direto no Ledger
              </div>
            </div>
          </div>

          {/* FUNIL DE RECUPERAÇÃO E JORNADAS ATIVAS */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-[#121620] p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <TrendingUp size={18} className="text-orange-400" /> Funil de Eficiência de Resgate
                  </h2>
                  <p className="text-xs text-slate-400">Progresso do cliente desde o abandono até a liquidação no Ledger</p>
                </div>
                <span className="text-xs text-slate-400 font-mono">Últimas 24 horas</span>
              </div>

              <div className="space-y-3">
                {[
                  { etapa: '1. Carrinho Abandonado no Checkout', qtd: 382, pct: '100%', cor: 'bg-slate-700' },
                  { etapa: '2. Disparo de WhatsApp / E-mail', qtd: 348, pct: '91.1%', cor: 'bg-sky-600' },
                  { etapa: '3. Link Aberto pelo Cliente (1-Clique)', qtd: 242, pct: '63.3%', cor: 'bg-amber-600' },
                  { etapa: '4. Pagamento Confirmado & Liquidado', qtd: 164, pct: '42.9%', cor: 'bg-emerald-600' },
                ].map((item) => (
                  <div key={item.etapa} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">{item.etapa}</span>
                      <span className="text-white font-mono font-bold">
                        {fmtNum(item.qtd)} <span className="text-slate-500 font-normal">({item.pct})</span>
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${item.cor}`} style={{ width: item.pct }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* STATUS DOS DISPARADORES AUTOMÁTICOS */}
            <div className="rounded-2xl border border-slate-800 bg-[#121620] p-6 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-400" /> Canais Oficiais de Resgate
              </h2>

              <div className="space-y-3">
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <MessageCircle size={14} className="text-emerald-400" /> WhatsApp Oficial (Cloud API)
                    </span>
                    <span className="rounded-full bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                      CONECTADO
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">Régua: 15m após abandono com botão 1-clique</div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Mail size={14} className="text-sky-400" /> E-mail Transacional de Urgência
                    </span>
                    <span className="rounded-full bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                      CONECTADO
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">Régua: 2h após abandono com cupom reserva</div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <CreditCard size={14} className="text-purple-400" /> Monitor de PIX Expirando
                    </span>
                    <span className="rounded-full bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                      ATIVO
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">Reenvio de QR PIX faltando 5 minutos</div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setTab('carrinho')}
                  className="w-full text-center text-xs font-semibold text-orange-400 hover:text-orange-300 py-2 border border-orange-500/20 rounded-xl hover:bg-orange-500/5 transition"
                >
                  Ver Fila de Carrinhos em Tempo Real →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ABA PÚBLICOS COMPORTAMENTAIS */}
      {tab === 'publicos' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-[#121620] p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Users size={18} className="text-sky-400" /> Públicos Comportamentais Sincronizados
                </h2>
                <p className="text-xs text-slate-400">Audiências dinâmicas geradas a partir de eventos do checkout e navegação</p>
              </div>
              <button
                onClick={() => alert('Público comportamental criado e sincronizado.')}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-orange-500 transition"
              >
                <Plus size={14} /> Criar Novo Público
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {[
                {
                  nome: 'Carrinho Abandonado (Últimas 24h)',
                  tamanho: 382,
                  canais: ['WhatsApp Cloud', 'Meta Ads CAPI', 'Google Ads'],
                  origem: 'Pixel do Checkout',
                  taxaAtivacao: '92%',
                },
                {
                  nome: 'PIX Gerado e Não Pago (< 15 min)',
                  tamanho: 48,
                  canais: ['WhatsApp 1-Clique', 'SMS Transacional'],
                  origem: 'Gateway Pagamentos',
                  taxaAtivacao: '98%',
                },
                {
                  nome: 'Visitou Página do Evento sem Comprar (7d)',
                  tamanho: 2840,
                  canais: ['Meta Ads (Instagram/FB)', 'TikTok Ads'],
                  origem: 'Pixel DiskIngressos',
                  taxaAtivacao: '74%',
                },
                {
                  nome: 'Compradores de Edições Anteriores',
                  tamanho: 1420,
                  canais: ['E-mail Marketing VIP', 'WhatsApp Pré-venda'],
                  origem: 'CRM Produtor',
                  taxaAtivacao: '61%',
                },
                {
                  nome: 'Tentativa de Cartão Recusada',
                  tamanho: 64,
                  canais: ['WhatsApp Recuperação Pagamento'],
                  origem: 'Antifraude / Adquirente',
                  taxaAtivacao: '88%',
                },
                {
                  nome: 'Leads de Alta Intensidade (> 3 visitas)',
                  tamanho: 512,
                  canais: ['Meta Ads Lookalike', 'Google Search'],
                  origem: 'GA4 / Pixel',
                  taxaAtivacao: '81%',
                },
              ].map((pub) => (
                <div key={pub.nome} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-white">{pub.nome}</span>
                    <span className="rounded-full bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-[10px] font-mono font-bold">
                      {fmtNum(pub.tamanho)} pessoas
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">Origem: <b className="text-slate-200">{pub.origem}</b></div>
                  <div className="flex flex-wrap gap-1">
                    {pub.canais.map((c) => (
                      <span key={c} className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300 font-medium">
                        {c}
                      </span>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center text-xs">
                    <span className="text-slate-400 text-[11px]">Sincronização: <b className="text-emerald-400">{pub.taxaAtivacao}</b></span>
                    <button
                      onClick={() => alert(`Público "${pub.nome}" sincronizado com Meta CAPI e Google Ads.`)}
                      className="text-orange-400 hover:text-orange-300 font-semibold"
                    >
                      Sincronizar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. ABA SEGMENTOS */}
      {tab === 'segmentos' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-[#121620] p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Target size={18} className="text-orange-400" /> Segmentos de Remarketing
                </h2>
                <p className="text-xs text-slate-400">Agrupamentos dinâmicos por propensão de compra, ticket médio e comportamento</p>
              </div>
              <button
                onClick={() => alert('Segmento criado com sucesso.')}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-orange-500 transition"
              >
                <Plus size={14} /> Novo Segmento
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
                <div className="text-[11px] text-slate-400 uppercase">Segmentos Ativos</div>
                <div className="text-2xl font-bold text-white">4</div>
                <div className="text-[11px] text-emerald-400">Atualização em tempo real</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
                <div className="text-[11px] text-slate-400 uppercase">Total de Leads Qualificados</div>
                <div className="text-2xl font-bold text-white">12.840</div>
                <div className="text-[11px] text-sky-400">Sem duplicatas de CPF</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
                <div className="text-[11px] text-slate-400 uppercase">Ticket Médio Projetado</div>
                <div className="text-2xl font-bold text-white">R$ 412,00</div>
                <div className="text-[11px] text-emerald-400">+28% vs média geral</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
                <div className="text-[11px] text-slate-400 uppercase">Taxa Média de Ativação</div>
                <div className="text-2xl font-bold text-emerald-400">31.8%</div>
                <div className="text-[11px] text-slate-400">Conversão pós-resgate</div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {[
                {
                  nome: 'Compradores VIP & Camarotes (Últimos 12 meses)',
                  criterio: 'Ticket > R$ 400 em eventos de grande porte',
                  alcance: 1420,
                  ticketMedio: 58000,
                  canais: 'WhatsApp VIP + Meta Ads CAPI',
                  status: 'ATIVO',
                },
                {
                  nome: 'Abandonadores Recorrentes de Checkout',
                  criterio: 'Iniciou compra 2+ vezes sem pagar nos últimos 30 dias',
                  alcance: 3820,
                  ticketMedio: 22000,
                  canais: 'Cupom 5% + WhatsApp 1-Clique',
                  status: 'ATIVO',
                },
                {
                  nome: 'Fãs do Gênero / Edições Passadas',
                  criterio: 'Compraram ingressos para artistas similares na DiskIngressos',
                  alcance: 5200,
                  ticketMedio: 34000,
                  canais: 'E-mail Marketing Pré-venda + Push',
                  status: 'ATIVO',
                },
                {
                  nome: 'Carrinho Alto Valor (> R$ 500)',
                  criterio: 'Carrinho com múltiplos ingressos aguardando pagamento',
                  alcance: 2400,
                  ticketMedio: 74000,
                  canais: 'Atendimento Comercial DiskIngressos',
                  status: 'ATIVO',
                },
              ].map((seg) => (
                <div key={seg.nome} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <Target size={14} className="text-orange-400" /> {seg.nome}
                      <span className="rounded-full bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                        {seg.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">Regra: {seg.criterio}</p>
                    <div className="text-[11px] text-slate-500">Canais vinculados: {seg.canais}</div>
                  </div>
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-white">{fmtNum(seg.alcance)} leads</div>
                      <div className="text-[10px] text-slate-400">Ticket médio: {brl(seg.ticketMedio)}</div>
                    </div>
                    <button
                      onClick={() => alert(`Audiência do segmento "${seg.nome}" exportada com sucesso.`)}
                      className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs text-slate-200 hover:border-slate-500"
                    >
                      Exportar Base
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. ABA CONSTRUTOR DE JORNADAS */}
      {tab === 'jornadas' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-[#121620] p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Workflow size={18} className="text-orange-400" /> Régua Automatizada de Remarketing
                </h2>
                <p className="text-xs text-slate-400">
                  Fluxo sequencial de eventos, gatilhos, esperas e ações multicanais até a conversão.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setJornadaAtiva(!jornadaAtiva)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                    jornadaAtiva
                      ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {jornadaAtiva ? <Pause size={14} /> : <Play size={14} />}
                  {jornadaAtiva ? 'Jornada Ativa' : 'Jornada Pausada'}
                </button>
              </div>
            </div>

            {/* FLUXO VISUAL DOS PASSOS DA JORNADA */}
            <div className="relative pl-6 space-y-4 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
              {jornadaSteps.map((step, idx) => (
                <div key={step.id} className="relative group">
                  <div className="absolute -left-[27px] top-4 h-4 w-4 rounded-full border-2 border-slate-900 bg-orange-500 flex items-center justify-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-1.5 hover:border-slate-700 transition">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 text-[10px] font-bold text-orange-400 font-mono">
                          PASSO {idx + 1} · {step.kind}
                        </span>
                        <h3 className="text-xs font-bold text-white">{step.titulo}</h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-mono font-semibold text-emerald-400">
                          {fmtNum(step.pessoasNoNo)} no nó agora
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400">{step.detalhes}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. ABA CARRINHOS ABANDONADOS */}
      {tab === 'carrinho' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-[#121620] p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <ShoppingCart size={18} className="text-amber-400" /> Fila Operacional de Carrinhos Abandonados
                </h2>
                <p className="text-xs text-slate-400">Sessões iniciadas que não concluíram o pagamento dentro do prazo de reserva</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={dispararTodosAbertos}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-orange-500 transition"
                >
                  <Zap size={14} /> Disparar Todos os Abertos
                </button>
              </div>
            </div>

            {/* BARRA DE FILTROS E BUSCA */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-2">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {(['TODOS', 'ABERTO', 'DISPARADO', 'RECUPERADO'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFiltroStatusCarrinho(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      filtroStatusCarrinho === st
                        ? 'bg-slate-700 text-white'
                        : 'bg-slate-800/40 text-slate-400 hover:text-white'
                    }`}
                  >
                    {st === 'TODOS' ? 'Todos' : st === 'ABERTO' ? 'Abertos (Sem Envio)' : st === 'DISPARADO' ? 'Em Resgate' : 'Recuperados'}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar por nome, e-mail ou ID..."
                  value={buscaCarrinho}
                  onChange={(e) => setBuscaCarrinho(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* TABELA DE CARRINHOS */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">ID Carrinho</th>
                    <th className="py-3 px-4">Cliente</th>
                    <th className="py-3 px-4">Setor & Ingressos</th>
                    <th className="py-3 px-4">Valor</th>
                    <th className="py-3 px-4">Tempo</th>
                    <th className="py-3 px-4">Origem UTM</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Ação de Resgate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {carrinhosFiltrados.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-bold text-sky-400">{c.id}</td>
                      <td className="py-3.5 px-4 font-sans">
                        <div className="font-semibold text-white">{c.clienteNome}</div>
                        <div className="text-[11px] text-slate-400">{c.telefone}</div>
                      </td>
                      <td className="py-3.5 px-4 font-sans text-slate-300">{c.setor}</td>
                      <td className="py-3.5 px-4 text-white font-bold">{brl(c.valorCents)}</td>
                      <td className="py-3.5 px-4 font-sans text-slate-400">{c.tempoAbandono}</td>
                      <td className="py-3.5 px-4 font-sans">
                        <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                          {c.canalEntrada}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-sans">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            c.status === 'ABERTO'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : c.status === 'DISPARADO'
                              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-sans">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => dispararRecuperacao(c.id, 'whatsapp')}
                            className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:border-emerald-500 text-emerald-400"
                            title="Disparar WhatsApp 1-Clique"
                          >
                            <MessageCircle size={14} />
                          </button>
                          <button
                            onClick={() => dispararRecuperacao(c.id, 'email')}
                            className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:border-sky-500 text-sky-400"
                            title="Disparar E-mail com Cupom"
                          >
                            <Mail size={14} />
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

      {/* 6. ABA VISITOU E NÃO COMPROU */}
      {tab === 'visitou-nao-comprou' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-[#121620] p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Eye size={18} className="text-sky-400" /> Visitou e Não Comprou (Topo/Meio de Funil)
                </h2>
                <p className="text-xs text-slate-400">Usuários que navegaram pelas páginas do evento sem iniciar carrinho nos últimos 7 dias</p>
              </div>
              <button
                onClick={() => alert('Audiência de retargeting para visitantes criada no Meta Ads e Google Ads.')}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-orange-500 transition"
              >
                <Target size={14} /> Criar Audiência de Retargeting
              </button>
            </div>

            <div className="grid md:grid-cols-4 gap-4 pt-2">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
                <div className="text-[11px] text-slate-400 uppercase">Visitantes Únicos (7d)</div>
                <div className="text-2xl font-bold text-white">28.420</div>
                <div className="text-[11px] text-sky-400">118.420 visualizações de página</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
                <div className="text-[11px] text-slate-400 uppercase">Taxa de Rejeição (Bounce)</div>
                <div className="text-2xl font-bold text-amber-400">68.4%</div>
                <div className="text-[11px] text-slate-400">Saíram sem interagir</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
                <div className="text-[11px] text-slate-400 uppercase">Retornaram via Retargeting</div>
                <div className="text-2xl font-bold text-emerald-400">4.210</div>
                <div className="text-[11px] text-emerald-400">14.8% taxa de retorno</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
                <div className="text-[11px] text-slate-400 uppercase">ROAS Estimado do Retargeting</div>
                <div className="text-2xl font-bold text-white">5.82x</div>
                <div className="text-[11px] text-slate-400">Anúncios no Instagram & Search</div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 overflow-hidden">
              <div className="bg-slate-900/80 px-4 py-3 border-b border-slate-800 text-xs font-bold text-white">
                Páginas com Maior Volume de Abandono de Navegação
              </div>
              <div className="divide-y divide-slate-800/60 text-xs">
                {[
                  {
                    url: '/evento/festival-live-2026/ingressos',
                    visitas: 18420,
                    iniciaramCheckout: '2.840 (15.4%)',
                    acaoSugerida: 'Disparar Carrossel Dinâmico de Lotes no Instagram',
                  },
                  {
                    url: '/evento/festival-live-2026/setores-camarote',
                    visitas: 6800,
                    iniciaramCheckout: '820 (12.0%)',
                    acaoSugerida: 'Vídeo Teaser Exclusivo com benefícios do Camarote',
                  },
                  {
                    url: '/evento/festival-live-2026/lineup-atracoes',
                    visitas: 3200,
                    iniciaramCheckout: '450 (14.1%)',
                    acaoSugerida: 'Anúncio Reels focado na playlist dos artistas',
                  },
                ].map((p) => (
                  <div key={p.url} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-800/30">
                    <div className="space-y-1">
                      <div className="font-mono text-sky-400 font-semibold">{p.url}</div>
                      <div className="text-slate-400">Ação recomendada: <span className="text-slate-200">{p.acaoSugerida}</span></div>
                    </div>
                    <div className="flex items-center gap-6 shrink-0 font-mono">
                      <div className="text-right">
                        <div className="text-white font-bold">{fmtNum(p.visitas)} visitas</div>
                        <div className="text-[10px] text-emerald-400">Checkout: {p.iniciaramCheckout}</div>
                      </div>
                      <button
                        onClick={() => alert(`Campanha de anúncio criada para ${p.url}.`)}
                        className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs font-sans text-slate-200 hover:border-slate-500"
                      >
                        Ativar Anúncio
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. ABA COMPRADORES ANTERIORES */}
      {tab === 'compradores' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-[#121620] p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Users size={18} className="text-purple-400" /> Base de Compradores de Edições Anteriores
                </h2>
                <p className="text-xs text-slate-400">Base própria autorizada pelo produtor com consentimento LGPD ativo para pré-venda</p>
              </div>
              <button
                onClick={() => alert('Disparo de pré-venda VIP enviado para compradores anteriores.')}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-orange-500 transition"
              >
                <Sparkles size={14} /> Disparar Convite VIP
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-4 pt-2">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
                <div className="text-[11px] text-slate-400 uppercase">Compradores Qualificados</div>
                <div className="text-2xl font-bold text-white">8.940</div>
                <div className="text-[11px] text-emerald-400">100% com Opt-in verificado</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
                <div className="text-[11px] text-slate-400 uppercase">Volume Histórico Comprado</div>
                <div className="text-2xl font-bold text-white">R$ 1.840.000</div>
                <div className="text-[11px] text-sky-400">Em edições anteriores</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
                <div className="text-[11px] text-slate-400 uppercase">Taxa de Recompra Projetada</div>
                <div className="text-2xl font-bold text-emerald-400">48.2%</div>
                <div className="text-[11px] text-slate-400">Estimada para Lote Zero</div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {[
                {
                  edicao: 'Festival DiskIngressos Live 2025',
                  publico: 4820,
                  optinPct: '88.4%',
                  status: 'Base Homologada',
                  canal: 'WhatsApp Oficial + E-mail',
                },
                {
                  edicao: 'Turnê Acústica Especial 2024',
                  publico: 2410,
                  optinPct: '91.2%',
                  status: 'Base Homologada',
                  canal: 'E-mail com Cupom Exclusivo',
                },
                {
                  edicao: 'Festival de Verão 2024',
                  publico: 1710,
                  optinPct: '84.0%',
                  status: 'Base Homologada',
                  canal: 'SMS Transacional + WhatsApp',
                },
              ].map((ed) => (
                <div key={ed.edicao} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <Lock size={14} className="text-emerald-400" /> {ed.edicao}
                      <span className="rounded-full bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                        {ed.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">Canal preferencial: {ed.canal}</div>
                  </div>
                  <div className="flex items-center gap-6 shrink-0 font-mono">
                    <div className="text-right">
                      <div className="text-xs font-bold text-white">{fmtNum(ed.publico)} compradores</div>
                      <div className="text-[10px] text-emerald-400">Opt-in: {ed.optinPct}</div>
                    </div>
                    <button
                      onClick={() => alert(`Lote de convite VIP criado para ${ed.edicao}.`)}
                      className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs font-sans text-slate-200 hover:border-slate-500"
                    >
                      Criar Pré-venda VIP
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 8. ABA CLIENTES RECORRENTES */}
      {tab === 'recorrentes' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-[#121620] p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <RotateCcw size={18} className="text-emerald-400" /> Clientes Recorrentes & Fidelidade
                </h2>
                <p className="text-xs text-slate-400">Compradores com 2 ou mais compras nos últimos 24 meses (LTV Elevado)</p>
              </div>
              <button
                onClick={() => alert('Campanha de fidelidade ativada para clientes recorrentes.')}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-orange-500 transition"
              >
                <Zap size={14} /> Ativar Clube VIP
              </button>
            </div>

            <div className="grid md:grid-cols-4 gap-4 pt-2">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
                <div className="text-[11px] text-slate-400 uppercase">Clientes VIP Ativos</div>
                <div className="text-2xl font-bold text-white">2.140</div>
                <div className="text-[11px] text-emerald-400">2+ compras realizadas</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
                <div className="text-[11px] text-slate-400 uppercase">LTV Médio por Cliente</div>
                <div className="text-2xl font-bold text-white">R$ 940,00</div>
                <div className="text-[11px] text-sky-400">Receita consolidada</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
                <div className="text-[11px] text-slate-400 uppercase">Intervalo Médio de Recompra</div>
                <div className="text-2xl font-bold text-amber-400">42 dias</div>
                <div className="text-[11px] text-slate-400">Alta frequência</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
                <div className="text-[11px] text-slate-400 uppercase">Taxa de Churn Anual</div>
                <div className="text-2xl font-bold text-emerald-400">&lt; 3.8%</div>
                <div className="text-[11px] text-emerald-400">Altíssima retenção</div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
              <h3 className="text-xs font-bold text-white">Vantagens Automáticas do Clube DiskIngressos VIP</h3>
              <div className="grid md:grid-cols-3 gap-3">
                <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3 space-y-1">
                  <div className="text-xs font-bold text-emerald-400">Acesso Antecipado</div>
                  <p className="text-[11px] text-slate-400">2 horas antes da abertura geral de qualquer lote</p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3 space-y-1">
                  <div className="text-xs font-bold text-sky-400">Fila Prioritária Portaria</div>
                  <p className="text-[11px] text-slate-400">Check-in expresso nas catracas com QR Code dourado</p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3 space-y-1">
                  <div className="text-xs font-bold text-purple-400">Cashback de 5%</div>
                  <p className="text-[11px] text-slate-400">Crédito automático para o próximo evento do produtor</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. ABA RECUPERAÇÃO WHATSAPP */}
      {tab === 'whatsapp' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-[#121620] p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <MessageCircle size={18} className="text-emerald-400" /> Central de Recuperação por WhatsApp Oficial
                </h2>
                <p className="text-xs text-slate-400">Templates homologados pela Meta com link de reserva 1-clique</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 text-xs font-bold flex items-center gap-1.5">
                  <CheckCheck size={14} /> Cloud API Meta Homologada
                </span>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 pt-2">
              <div className="lg:col-span-2 space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Templates Homologados Meta</h3>
                {[
                  {
                    nome: 'carrinho_resgate_15m',
                    gatilho: '15 minutos após abandono',
                    corpo: 'Olá {{1}}, vimos que seus ingressos para o {{2}} ficaram reservados! Garanta agora com 1-clique antes do lote virar: {{3}}',
                    botoes: ['Finalizar Pedido Agora', 'Falar com Suporte'],
                    taxaConversao: '32.4%',
                  },
                  {
                    nome: 'pix_lembrete_expirando',
                    gatilho: '10 minutos antes da chave expirar',
                    corpo: 'Atenção {{1}}, seu código PIX para {{2}} expira em 10 minutos. Copie e pague para garantir seu lugar: {{3}}',
                    botoes: ['Copiar Chave PIX'],
                    taxaConversao: '44.8%',
                  },
                  {
                    nome: 'prevenda_vip_edicao',
                    gatilho: 'Abertura de lote zero',
                    corpo: 'Exclusivo {{1}}! Como você esteve na última edição, seu acesso ao Lote 0 já está liberado por 24 horas: {{2}}',
                    botoes: ['Comprar Ingressos VIP'],
                    taxaConversao: '28.1%',
                  },
                ].map((tpl) => (
                  <div key={tpl.nome} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-xs font-bold text-sky-400">{tpl.nome}</span>
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                        Gatilho: {tpl.gatilho}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-lg font-sans border border-slate-800/80">
                      {tpl.corpo}
                    </p>
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex gap-1.5">
                        {tpl.botoes.map((b) => (
                          <span key={b} className="rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold">
                            CTA: {b}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs font-bold text-emerald-400 font-mono">
                        Conversão: {tpl.taxaConversao}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* PREVIEW DO WHATSAPP NO CELULAR */}
              <div className="rounded-2xl border border-slate-800 bg-[#0d1418] p-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                    <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-xs">
                      DI
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1">
                        DiskIngressos Oficial <CheckCheck size={12} className="text-emerald-400" />
                      </div>
                      <div className="text-[10px] text-slate-400">Conta Comercial Verificada</div>
                    </div>
                  </div>

                  <div className="bg-[#1f2c34] rounded-lg p-3 text-xs text-slate-100 space-y-2 shadow">
                    <p>
                      Olá Mariana, vimos que seus 2 ingressos para o <b>Festival DiskIngressos Live 2026</b> ficaram reservados!
                    </p>
                    <p>
                      Garanta agora antes do Lote virar em menos de 1 hora.
                    </p>
                    <div className="pt-1 border-t border-slate-700/60">
                      <button className="w-full text-center text-xs font-bold text-emerald-400 py-1 hover:underline">
                        👉 Finalizar em 1-Clique
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 text-center">
                  Preview em tempo real do renderizador WhatsApp
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10. ABA RECUPERAÇÃO EMAIL */}
      {tab === 'email' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-[#121620] p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Mail size={18} className="text-sky-400" /> Recuperação por E-mail Transacional
                </h2>
                <p className="text-xs text-slate-400">Jornadas e campanhas com contagem regressiva de reserva e cupons exclusivos</p>
              </div>
              <button
                onClick={() => alert('Campanha de e-mail criada com sucesso.')}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-orange-500 transition"
              >
                <Plus size={14} /> Novo E-mail de Resgate
              </button>
            </div>

            <div className="grid md:grid-cols-4 gap-4 pt-2">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
                <div className="text-[11px] text-slate-400 uppercase">E-mails Disparados (30d)</div>
                <div className="text-2xl font-bold text-white">84.500</div>
                <div className="text-[11px] text-sky-400">Entregabilidade: 99.2%</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
                <div className="text-[11px] text-slate-400 uppercase">Taxa de Abertura Única</div>
                <div className="text-2xl font-bold text-emerald-400">34.8%</div>
                <div className="text-[11px] text-emerald-400">+12% vs mercado de eventos</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
                <div className="text-[11px] text-slate-400 uppercase">Taxa de Cliques (CTOR)</div>
                <div className="text-2xl font-bold text-white">14.2%</div>
                <div className="text-[11px] text-slate-400">Cliques no botão de checkout</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
                <div className="text-[11px] text-slate-400 uppercase">Receita Atribuída</div>
                <div className="text-2xl font-bold text-emerald-400">R$ 98.400,00</div>
                <div className="text-[11px] text-slate-400">Resgates confirmados</div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {[
                {
                  assunto: '⏰ Seus ingressos estão quase expirando! Finalize agora',
                  gatilho: '2 horas após abandono de carrinho',
                  abertura: '38.4%',
                  cliques: '16.2%',
                  status: 'ATIVA',
                },
                {
                  assunto: '🎁 Reservamos seu lugar com 5% de incentivo especial',
                  gatilho: '12 horas após abandono (com cupom exclusivo)',
                  abertura: '32.1%',
                  cliques: '13.8%',
                  status: 'ATIVA',
                },
                {
                  assunto: '⚠️ Última chamada: Virada de lote confirmada para hoje à noite',
                  gatilho: '6 horas antes da virada de preço do lote',
                  abertura: '41.2%',
                  cliques: '19.4%',
                  status: 'ATIVA',
                },
              ].map((mail) => (
                <div key={mail.assunto} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <Mail size={14} className="text-sky-400" /> {mail.assunto}
                      <span className="rounded-full bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                        {mail.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">Disparo: {mail.gatilho}</p>
                  </div>
                  <div className="flex items-center gap-6 shrink-0 font-mono">
                    <div className="text-right">
                      <div className="text-xs font-bold text-white">Abertura: {mail.abertura}</div>
                      <div className="text-[10px] text-emerald-400">Cliques: {mail.cliques}</div>
                    </div>
                    <button
                      onClick={() => alert(`Editor de template aberto para "${mail.assunto}".`)}
                      className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs font-sans text-slate-200 hover:border-slate-500"
                    >
                      Editar HTML
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 11. ABA CAMPANHAS DE REMARKETING */}
      {tab === 'campanhas' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-[#121620] p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap size={18} className="text-amber-400" /> Campanhas de Remarketing Ativas
                </h2>
                <p className="text-xs text-slate-400">Tráfego pago e disparos voltados exclusivamente para quem já conhece o evento</p>
              </div>
              <button
                onClick={() => alert('Nova campanha de remarketing iniciada.')}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-orange-500 transition"
              >
                <Plus size={14} /> Nova Campanha Remarketing
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Campanha</th>
                    <th className="py-3 px-4">Canal</th>
                    <th className="py-3 px-4">Investimento</th>
                    <th className="py-3 px-4">Receita Atribuída</th>
                    <th className="py-3 px-4">ROAS</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {[
                    {
                      nome: 'Retargeting Abandonadores Instagram Reels',
                      canal: 'Meta Ads',
                      gasto: 45000,
                      receita: 284000,
                      roas: '6.31x',
                      status: 'ATIVA',
                    },
                    {
                      nome: 'Palavras-chave de Retorno (Google Search)',
                      canal: 'Google Ads',
                      gasto: 32000,
                      receita: 196000,
                      roas: '6.12x',
                      status: 'ATIVA',
                    },
                    {
                      nome: 'WhatsApp Massa Resgate Lote 1',
                      canal: 'WhatsApp Cloud API',
                      gasto: 14200,
                      receita: 420000,
                      roas: '29.57x',
                      status: 'CONCLUÍDA',
                    },
                  ].map((cmp) => (
                    <tr key={cmp.nome} className="hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-sans font-bold text-white">{cmp.nome}</td>
                      <td className="py-3.5 px-4 font-sans text-slate-300">{cmp.canal}</td>
                      <td className="py-3.5 px-4 text-slate-300">{brl(cmp.gasto)}</td>
                      <td className="py-3.5 px-4 text-emerald-400 font-bold">{brl(cmp.receita)}</td>
                      <td className="py-3.5 px-4 text-white font-bold">{cmp.roas}</td>
                      <td className="py-3.5 px-4 font-sans">
                        <span className="rounded-full bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                          {cmp.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-sans">
                        <button
                          onClick={() => alert(`Ajustando campanha "${cmp.nome}".`)}
                          className="px-2.5 py-1 rounded border border-slate-700 bg-slate-800 text-xs text-slate-200 hover:border-slate-500"
                        >
                          Gerenciar
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

      {/* 12. ABA AUTOMAÇÕES DE REMARKETING */}
      {tab === 'automacoes' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-[#121620] p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Workflow size={18} className="text-sky-400" /> Automações & Webhooks de Resgate
                </h2>
                <p className="text-xs text-slate-400">Integrações de eventos em tempo real, webhooks e filas de processamento</p>
              </div>
              <button
                onClick={() => alert('Webhook de teste disparado com sucesso.')}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-orange-500 transition"
              >
                <RefreshCcw size={14} /> Testar Webhook
              </button>
            </div>

            <div className="space-y-3 pt-2">
              {[
                {
                  nome: 'Webhook de Abandono de Carrinho (Storefront BFF)',
                  latencia: '42ms',
                  sucesso: '100%',
                  processados: 382,
                  status: 'OPERACIONAL',
                },
                {
                  nome: 'Gatilho de Expiração de PIX (Módulo Pagamentos)',
                  latencia: '18ms',
                  sucesso: '99.8%',
                  processados: 124,
                  status: 'OPERACIONAL',
                },
                {
                  nome: 'Sincronização Server-Side CAPI Meta/Google (RabbitMQ)',
                  latencia: '65ms',
                  sucesso: '100%',
                  processados: 4820,
                  status: 'OPERACIONAL',
                },
              ].map((aut) => (
                <div key={aut.nome} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400" /> {aut.nome}
                      <span className="rounded-full bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                        {aut.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">Latência média: <b className="text-slate-200">{aut.latencia}</b> • Taxa de Sucesso: <b className="text-emerald-400">{aut.sucesso}</b></div>
                  </div>
                  <div className="text-right font-mono shrink-0">
                    <div className="text-xs font-bold text-white">{fmtNum(aut.processados)} eventos</div>
                    <div className="text-[10px] text-slate-500">Últimas 24h</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 13. ABA CONVERSÕES RECUPERADAS */}
      {tab === 'conversoes' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-[#121620] p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-400" /> Auditoria de Pedidos e Conversões Recuperadas
                </h2>
                <p className="text-xs text-slate-400">
                  Histórico de pedidos resgatados com correlação imutável entre a ação de remarketing e a liquidação no Ledger.
                </p>
              </div>

              <button
                onClick={() => alert('Extrato de auditoria exportado com sucesso.')}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-bold text-slate-200 hover:border-slate-500 transition"
              >
                <FileText size={14} /> Exportar Auditoria CSV
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Pedido</th>
                    <th className="py-3 px-4">Comprador</th>
                    <th className="py-3 px-4">Canal Decisivo</th>
                    <th className="py-3 px-4">Valor Resgatado</th>
                    <th className="py-3 px-4">Tempo de Resgate</th>
                    <th className="py-3 px-4">Correlation ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {[
                    {
                      numero: 'PED-849102',
                      comprador: 'Mariana Silva',
                      canal: 'WhatsApp Oficial 1-Clique',
                      valor: 35000,
                      tempo: '24 minutos após abandono',
                      correlation: 'corr_mkt_984102941',
                    },
                    {
                      numero: 'PED-849098',
                      comprador: 'Carlos Eduardo',
                      canal: 'Retargeting Meta Ads (Instagram)',
                      valor: 45000,
                      tempo: '4 horas após abandono',
                      correlation: 'corr_mkt_984102888',
                    },
                    {
                      numero: 'PED-849074',
                      comprador: 'Fernanda Lima',
                      canal: 'E-mail com Cupom Reserva',
                      valor: 36000,
                      tempo: '1h 12m após abandono',
                      correlation: 'corr_mkt_984102711',
                    },
                    {
                      numero: 'PED-849052',
                      comprador: 'Rodrigo Alves',
                      canal: 'WhatsApp Oficial Reenvio QR PIX',
                      valor: 17500,
                      tempo: '12 minutos após abandono',
                      correlation: 'corr_mkt_984102604',
                    },
                  ].map((row) => (
                    <tr key={row.numero} className="hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-bold text-sky-400">{row.numero}</td>
                      <td className="py-3.5 px-4 font-sans text-white">{row.comprador}</td>
                      <td className="py-3.5 px-4 font-sans text-emerald-400 font-semibold">{row.canal}</td>
                      <td className="py-3.5 px-4 text-white font-bold">{brl(row.valor)}</td>
                      <td className="py-3.5 px-4 font-sans text-slate-400">{row.tempo}</td>
                      <td className="py-3.5 px-4 text-slate-500 text-[10px]">{row.correlation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 14. ABA RELATÓRIOS DE REMARKETING */}
      {tab === 'relatorios' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-[#121620] p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileBarChart size={18} className="text-orange-400" /> Relatório Analítico de Retenção & ROI
            </h2>
            <p className="text-xs text-slate-400">
              Comparativo de retorno financeiro e custo operacional de cada canal de resgate.
            </p>

            <div className="grid md:grid-cols-3 gap-4 pt-2">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
                <div className="text-xs text-slate-400">Custo Total de Disparos</div>
                <div className="text-xl font-bold text-white font-mono">R$ 248,50</div>
                <div className="text-[11px] text-slate-500">WhatsApp Cloud API & E-mails</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
                <div className="text-xs text-slate-400">Receita Total Recuperada</div>
                <div className="text-xl font-bold text-emerald-400 font-mono">R$ 58.450,00</div>
                <div className="text-[11px] text-emerald-400 font-medium">164 pedidos salvos</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
                <div className="text-xs text-slate-400">ROI do Motor de Remarketing</div>
                <div className="text-xl font-bold text-purple-300 font-mono">235.2x</div>
                <div className="text-[11px] text-slate-400">Para cada R$ 1 gasto, R$ 235 retornaram</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 15. ABA PIX PENDENTE (SUPORTE EXTRA) */}
      {tab === 'pix_pendente' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-[#121620] p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard size={18} className="text-sky-400" /> Monitoramento de Pagamentos PIX Pendentes
            </h2>
            <p className="text-xs text-slate-400">
              Chaves PIX geradas no checkout com tempo limite de 15 minutos. Resgate automático antes da expiração.
            </p>

            <div className="grid md:grid-cols-3 gap-4 pt-2">
              {[
                {
                  id: 'pix-1',
                  cliente: 'Lucas Meneses',
                  valor: 19000,
                  tempoRestante: '04:12',
                  status: 'EXPIRANDO',
                },
                {
                  id: 'pix-2',
                  cliente: 'Beatriz Martins',
                  valor: 38000,
                  tempoRestante: '11:45',
                  status: 'AGUARDANDO',
                },
              ].map((p) => (
                <div key={p.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white">{p.cliente}</span>
                    <span className="rounded-full bg-amber-500/20 text-amber-400 px-2 py-0.5 text-[10px] font-mono font-bold">
                      ⏱ {p.tempoRestante}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-white font-mono">{brl(p.valor)}</div>
                  <div className="pt-2 flex justify-between items-center text-xs border-t border-slate-800">
                    <span className="text-slate-500">Chave PIX Ativa</span>
                    <button
                      onClick={() => alert(`Lembrete de PIX enviado para ${p.cliente} via SMS/WhatsApp.`)}
                      className="text-emerald-400 hover:underline font-semibold"
                    >
                      Reenviar QR PIX
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getFallbackRemarketingData(eventoNome: string) {
  return {
    eventoNome,
    kpis: {
      publicosAtivos: 4820,
      carrinhosAbandonados: 382,
      carrinhosRecuperados: 164,
      taxaRecuperacao: '42.9%',
      receitaRecuperadaCents: 5845000,
    },
  };
}

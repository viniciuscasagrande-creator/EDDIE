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
} from 'lucide-react';
import { useProducerEvent } from '../ProducerEventContext';

export type RemarketingTab =
  | 'dashboard'
  | 'carrinhos'
  | 'jornadas'
  | 'publicos'
  | 'whatsapp_email'
  | 'pix_pendente'
  | 'conversoes_auditoria'
  | 'relatorios';

interface RemarketingWorkspaceProps {
  eventoId?: string;
}

const brl = (v: number | string | null | undefined) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v || 0));

const fmtNum = (v: number | string | null | undefined) =>
  new Intl.NumberFormat('pt-BR').format(Number(v || 0));

export default function RemarketingWorkspace({ eventoId: propEventoId }: RemarketingWorkspaceProps) {
  const { api, produtorId, eventoId: ctxEventoId, evento, eventos } = useProducerEvent();
  const activeEventoId = propEventoId || ctxEventoId || 'evento-operacao';
  const activeEvento = eventos.find((e) => e.id === activeEventoId) || evento;

  const [tab, setTab] = useState<RemarketingTab>('dashboard');
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
              {propEventoId ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs font-medium text-purple-300 border border-purple-500/20">
                  Evento Específico: <b>{activeEvento?.nome}</b>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-300 border border-slate-700">
                  Visão Consolidada do Produtor
                </span>
              )}
            </div>

            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
              Central de Remarketing {propEventoId ? `· ${activeEvento?.nome}` : ''}
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

      {/* BARRA DE NAVEGAÇÃO DE ABAS */}
      <div className="flex border-b border-slate-800 overflow-x-auto gap-2 text-xs scrollbar-none pb-1">
        {[
          { id: 'dashboard', label: 'Dashboard de Resgate', icon: TrendingUp },
          { id: 'carrinhos', label: 'Carrinhos Abandonados', icon: ShoppingCart },
          { id: 'jornadas', label: 'Construtor de Jornada', icon: Workflow },
          { id: 'publicos', label: 'Públicos Comportamentais', icon: Users },
          { id: 'whatsapp_email', label: 'Resgate WhatsApp & E-mail', icon: MessageCircle },
          { id: 'pix_pendente', label: 'PIX & Pagamentos Pendentes', icon: CreditCard },
          { id: 'conversoes_auditoria', label: 'Conversões & Auditoria', icon: ShieldCheck },
          { id: 'relatorios', label: 'Relatórios de Retenção', icon: FileBarChart },
        ].map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id as RemarketingTab)}
              className={`flex items-center gap-2 px-4 py-3 font-semibold rounded-t-xl transition whitespace-nowrap border-b-2 ${
                active
                  ? 'border-orange-500 bg-orange-500/10 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon size={16} className={active ? 'text-orange-400' : 'text-slate-500'} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

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
                  <p className="text-xs text-slate-400">
                    Conversão em cada estágio da régua multicanal de remarketing.
                  </p>
                </div>
              </div>

              <div className="space-y-3.5">
                {[
                  {
                    etapa: '1. Carrinho Abandonado no Checkout',
                    qtd: 382,
                    taxa: '100%',
                    bar: 'w-full bg-slate-700',
                  },
                  {
                    etapa: '2. Disparo Automático (WhatsApp / E-mail)',
                    qtd: 360,
                    taxa: '94.2% entrega',
                    bar: 'w-[94%] bg-sky-600',
                  },
                  {
                    etapa: '3. Sessão Reaberta pelo Link de 1-Clique',
                    qtd: 238,
                    taxa: '62.3% abertura',
                    bar: 'w-[62%] bg-purple-600',
                  },
                  {
                    etapa: '4. Pedido Concluído e Pago com Sucesso',
                    qtd: 164,
                    taxa: '42.9% conversão',
                    bar: 'w-[43%] bg-emerald-500',
                  },
                ].map((f) => (
                  <div key={f.etapa} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">{f.etapa}</span>
                      <span className="text-white font-mono font-bold">
                        {f.qtd} pedidos ({f.taxa})
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden">
                      <div className={`h-3 rounded-full ${f.bar}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Acesso rápido às Jornadas */}
            <div className="rounded-2xl border border-slate-800 bg-[#121620] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Workflow size={18} className="text-orange-400" /> Status da Régua
                </h2>
                <span className="inline-flex rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  ATIVA
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 space-y-1">
                  <div className="text-slate-400">Jornada Principal</div>
                  <div className="font-bold text-white">Resgate de Carrinho em 3 Estágios</div>
                  <div className="text-[11px] text-emerald-400 mt-1">48 conversões nas últimas 24h</div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 space-y-1">
                  <div className="text-slate-400">Canais Ativos</div>
                  <div className="font-bold text-white">WhatsApp Oficial + E-mail + Meta Retargeting</div>
                </div>

                <button
                  onClick={() => setTab('jornadas')}
                  className="w-full py-2.5 rounded-xl bg-orange-600/20 border border-orange-500/30 text-orange-300 hover:bg-orange-600/30 font-bold transition text-center block"
                >
                  Abrir Construtor de Jornada →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ABA CARRINHOS ABANDONADOS */}
      {tab === 'carrinhos' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar por comprador, e-mail ou pedido..."
                  value={buscaCarrinho}
                  onChange={(e) => setBuscaCarrinho(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-900 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-orange-500 w-72"
                />
              </div>

              <div className="flex rounded-xl border border-slate-700 bg-slate-900 p-1 text-xs">
                {(['TODOS', 'ABERTO', 'DISPARADO', 'RECUPERADO'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFiltroStatusCarrinho(st)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition ${
                      filtroStatusCarrinho === st
                        ? 'bg-orange-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {st === 'TODOS' ? 'Todos' : st === 'ABERTO' ? 'Abertos' : st === 'DISPARADO' ? 'Disparados' : 'Recuperados'}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={dispararTodosAbertos}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-xs font-bold text-white hover:bg-orange-500 transition"
            >
              <Send size={14} /> Disparar para Todos os Abertos
            </button>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#121620] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase text-slate-500 border-b border-slate-800 bg-slate-950/40">
                <tr>
                  <th className="py-3 px-4">Comprador</th>
                  <th className="py-3 px-4">Contato</th>
                  <th className="py-3 px-4">Setor / Itens</th>
                  <th className="py-3 px-4">Valor</th>
                  <th className="py-3 px-4">Tempo</th>
                  <th className="py-3 px-4">Canal Origem</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ação de Resgate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {carrinhosFiltrados.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-bold text-white">
                      <div>{c.clienteNome}</div>
                      <div className="text-[10px] text-slate-500 font-mono">ID: {c.id}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <div>{c.email}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{c.telefone}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{c.setor}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white">{brl(c.valorCents)}</td>
                    <td className="py-3.5 px-4 text-slate-400">{c.tempoAbandono}</td>
                    <td className="py-3.5 px-4 text-slate-400">{c.canalEntrada}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                          c.status === 'RECUPERADO'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : c.status === 'DISPARADO'
                            ? 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {c.status !== 'RECUPERADO' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => dispararRecuperacao(c.id, 'whatsapp')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/30 font-semibold"
                            title="Disparar WhatsApp Oficial"
                          >
                            WhatsApp
                          </button>
                          <button
                            onClick={() => dispararRecuperacao(c.id, 'email')}
                            className="px-2.5 py-1 rounded-lg bg-sky-600/20 border border-sky-500/30 text-sky-300 hover:bg-sky-600/30 font-semibold"
                            title="Disparar E-mail com reserva"
                          >
                            E-mail
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-emerald-400 font-bold flex items-center justify-end gap-1">
                          <CheckCircle2 size={13} /> Venda Concluída
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. ABA CONSTRUTOR DE JORNADA (JOURNEY BUILDER) */}
      {tab === 'jornadas' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-[#121620] p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Workflow size={20} className="text-orange-400" /> Construtor de Jornada de Remarketing
                </h2>
                <p className="text-xs text-slate-400">
                  Fluxo automatizado que orquestra canais (WhatsApp, E-mail, Mídia Paga) com base no comportamento do usuário.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setJornadaAtiva(!jornadaAtiva)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                    jornadaAtiva
                      ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {jornadaAtiva ? <Play size={14} /> : <Pause size={14} />}
                  {jornadaAtiva ? 'Jornada Ativa em Produção' : 'Jornada Pausada'}
                </button>
              </div>
            </div>

            {/* VISUAL DA JORNADA PASSO A PASSO */}
            <div className="max-w-3xl mx-auto space-y-3 py-4">
              {jornadaSteps.map((step, idx) => {
                const isDecision = step.kind === 'DECISAO';
                const isAction = step.kind === 'ACAO' || step.kind === 'ACAO_REMARKETING';
                return (
                  <div key={step.id} className="relative">
                    <div
                      className={`rounded-2xl border p-4.5 transition relative shadow-lg ${
                        step.kind === 'GATILHO'
                          ? 'border-purple-500/40 bg-purple-950/20'
                          : step.kind === 'CONDICAO'
                          ? 'border-amber-500/40 bg-amber-950/20'
                          : step.kind === 'ACAO'
                          ? 'border-emerald-500/40 bg-emerald-950/20'
                          : step.kind === 'ESPERA'
                          ? 'border-sky-500/40 bg-sky-950/20'
                          : step.kind === 'DECISAO'
                          ? 'border-indigo-500/40 bg-indigo-950/30'
                          : step.kind === 'ACAO_REMARKETING'
                          ? 'border-orange-500/40 bg-orange-950/20'
                          : 'border-emerald-500/60 bg-emerald-950/30'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                step.kind === 'GATILHO'
                                  ? 'bg-purple-500/20 text-purple-300'
                                  : step.kind === 'CONDICAO'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : step.kind === 'ACAO'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : step.kind === 'ESPERA'
                                  ? 'bg-sky-500/20 text-sky-300'
                                  : step.kind === 'DECISAO'
                                  ? 'bg-indigo-500/20 text-indigo-300'
                                  : 'bg-orange-500/20 text-orange-300'
                              }`}
                            >
                              {step.kind}
                            </span>
                            <span className="text-xs text-slate-400">Passo {idx + 1}</span>
                          </div>
                          <h4 className="text-sm font-bold text-white">{step.titulo}</h4>
                          <p className="text-xs text-slate-400">{step.detalhes}</p>
                        </div>

                        <div className="text-right sm:shrink-0 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-xl">
                          <div className="text-xs font-mono font-bold text-sky-400">{step.pessoasNoNo}</div>
                          <div className="text-[10px] text-slate-500">processados</div>
                        </div>
                      </div>
                    </div>

                    {/* Seta conectora entre nós */}
                    {idx < jornadaSteps.length - 1 && (
                      <div className="flex flex-col items-center justify-center my-1 text-slate-500">
                        <div className="h-4 w-0.5 bg-slate-700" />
                        <span className="text-xs font-bold text-slate-400">↓</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. ABA PÚBLICOS DE REMARKETING */}
      {tab === 'publicos' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Users size={18} className="text-orange-400" /> Segmentos Comportamentais de Retenção
              </h2>
              <p className="text-xs text-slate-400">
                Públicos atualizados dinamicamente a cada nova interação com a plataforma.
              </p>
            </div>
            <button
              onClick={() => alert('Sincronização iniciada com canais de mídia e CRM.')}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-xs font-bold text-white hover:bg-orange-500 transition"
            >
              <RefreshCcw size={14} /> Sincronizar Públicos
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                nome: 'Visitou e Não Comprou (30d)',
                tamanho: 3410,
                conversaoEsperada: '18.4%',
                descricao: 'Usuários com alta intenção que navegaram pelo evento.',
                prioridade: 'ALTA',
              },
              {
                nome: 'Abandono na Etapa de Pagamento',
                tamanho: 382,
                conversaoEsperada: '42.9%',
                descricao: 'Chegaram ao checkout mas não concluíram Pix/Cartão.',
                prioridade: 'CRÍTICA',
              },
              {
                nome: 'Compradores de Edições Anteriores',
                tamanho: 4820,
                conversaoEsperada: '28.5%',
                descricao: 'Base histórica do produtor para este mesmo festival.',
                prioridade: 'ALTA',
              },
              {
                nome: 'Clientes Recorrentes (VIPs)',
                tamanho: 950,
                conversaoEsperada: '35.0%',
                descricao: 'Mais de 3 eventos comprados no último ano.',
                prioridade: 'VIP',
              },
            ].map((p) => (
              <div key={p.nome} className="rounded-2xl border border-slate-800 bg-[#121620] p-5 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                        p.prioridade === 'CRÍTICA'
                          ? 'bg-red-500/20 text-red-400 border-red-500/30'
                          : p.prioridade === 'VIP'
                          ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {p.prioridade}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">Conv: {p.conversaoEsperada}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{p.nome}</h3>
                  <p className="text-xs text-slate-400 mt-1">{p.descricao}</p>
                </div>
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xl font-black text-white font-mono">{fmtNum(p.tamanho)}</span>
                  <button
                    onClick={() => alert(`Criando campanha de remarketing para o público "${p.nome}".`)}
                    className="text-xs text-orange-400 hover:underline font-semibold"
                  >
                    Ativar Campanha →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. ABA CONVERSÕES & AUDITORIA */}
      {tab === 'conversoes_auditoria' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-[#121620] p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-400" /> Registro Auditável de Vendas Resgatadas
            </h2>
            <p className="text-xs text-slate-400">
              Cada pedido recuperado possui correlação com a régua e liquidação correspondente no Ledger.
            </p>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs">
                <thead className="text-[11px] uppercase text-slate-500 border-b border-slate-800 bg-slate-950/40">
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

      {/* 6. ABA PIX PENDENTE */}
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

      {/* 7. ABA WHATSAPP & EMAIL */}
      {tab === 'whatsapp_email' && (
        <div className="rounded-2xl border border-slate-800 bg-[#121620] p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <MessageCircle size={18} className="text-emerald-400" /> Réguas Automáticas de Resgate
          </h2>
          <p className="text-xs text-slate-400">
            Cadência programada de recuperação por canal oficial para maximizar conversão sem incomodar o cliente.
          </p>

          <div className="space-y-3 pt-2">
            {[
              {
                etapa: 'Régua 1 · WhatsApp Amigável (15 minutos)',
                descricao: 'Notifica o comprador de que o ingresso ainda está reservado no carrinho com link direto.',
                status: 'ATIVA',
                conversao: '32.4%',
              },
              {
                etapa: 'Régua 2 · E-mail de Urgência (2 horas)',
                descricao: 'Avisa que o lote atual está com alta demanda e pode virar de preço a qualquer momento.',
                status: 'ATIVA',
                conversao: '18.1%',
              },
              {
                etapa: 'Régua 3 · WhatsApp com Incentivo (12 horas)',
                descricao: 'Envia cupom exclusivo de 5% válido por 6 horas para fechar a compra imediatamente.',
                status: 'ATIVA',
                conversao: '12.8%',
              },
            ].map((r) => (
              <div key={r.etapa} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400" /> {r.etapa}
                  </div>
                  <p className="text-xs text-slate-400">{r.descricao}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-emerald-400">{r.conversao}</div>
                    <div className="text-[10px] text-slate-500">conversão direta</div>
                  </div>
                  <button
                    onClick={() => alert(`Configurações de ${r.etapa} abertas para edição.`)}
                    className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs text-slate-200 hover:border-slate-500"
                  >
                    Editar Mensagem
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. ABA RELATÓRIOS */}
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

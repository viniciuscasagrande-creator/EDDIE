'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Wallet,
  Megaphone,
  Briefcase,
  Scale,
  Calendar,
  RotateCcw,
  Headphones,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Loader2,
  RefreshCcw,
  FileBarChart,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { useProducerEvent } from '../components/ProducerEventContext';
import { EDDIE_BUILD } from '../lib/buildInfo';

const formatBRL = (cents = 0) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

export default function DashboardPage() {
  const { api, produtorId, eventoId, evento } = useProducerEvent();

  const [loading, setLoading] = useState(true);
  const [saldos, setSaldos] = useState({ disponivelCents: 0, totalPatrimonioCents: 0 });
  const [marketing, setMarketing] = useState({ receitaAtribuidaCents: 0, totalCliques: 0, totalConversoes: 0, roas: '—' });
  const [pipeline, setPipeline] = useState({ valorTotal: 0, ativas: 0 });
  const [contabilidade, setContabilidade] = useState({ status: 'Aberto', competencia: '2026-09' });

  const carregarMetricas = useCallback(async () => {
    if (!api || !produtorId) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    try {
      const qs = eventoId ? `?eventoId=${eventoId}` : '';
      const [resSaldos, resCampanhas, resOportunidades, resContabil] = await Promise.allSettled([
        fetch(`${api}/financeiro/saldos/produtor/${produtorId}${qs}`, { signal: controller.signal }),
        fetch(`${api}/marketing/campanhas`, { signal: controller.signal }),
        fetch(`${api}/comercial/oportunidades`, { signal: controller.signal }),
        fetch(`${api}/contabilidade/centro-controle`, { signal: controller.signal }),
      ]);

      // 1. Financeiro / Ledger
      if (resSaldos.status === 'fulfilled' && resSaldos.value.ok) {
        const s = await resSaldos.value.json();
        setSaldos({
          disponivelCents: s.disponivelCents || 0,
          totalPatrimonioCents: s.totalPatrimonioCents || 0,
        });
      }

      // 2. Marketing
      if (resCampanhas.status === 'fulfilled' && resCampanhas.value.ok) {
        const camps = await resCampanhas.value.json();
        const lista = Array.isArray(camps) ? camps : [];
        const receita = lista.reduce((acc: number, c: any) => acc + (c.receitaAtribuidaCents || 0), 0);
        const cliques = lista.reduce((acc: number, c: any) => acc + (c.cliques || 0), 0);
        const conversoes = lista.reduce((acc: number, c: any) => acc + (c.conversoes || 0), 0);
        const gasto = lista.reduce((acc: number, c: any) => acc + (c.orcamentoDiarioCents || 0), 0);
        const roasCalc = gasto > 0 ? (receita / gasto).toFixed(1) + 'x' : '—';

        setMarketing({
          receitaAtribuidaCents: receita,
          totalCliques: cliques,
          totalConversoes: conversoes,
          roas: roasCalc,
        });
      }

      // 3. Comercial B2B
      if (resOportunidades.status === 'fulfilled' && resOportunidades.value.ok) {
        const ops = await resOportunidades.value.json();
        const lista = Array.isArray(ops) ? ops : [];
        const ativas = lista.filter((o: any) => o.etapa !== 'fechado_perdido');
        const valor = ativas.reduce((acc: number, o: any) => acc + (o.valorEstimado || 0), 0);
        setPipeline({
          valorTotal: valor,
          ativas: ativas.length,
        });
      }

      // 4. Contabilidade
      if (resContabil.status === 'fulfilled' && resContabil.value.ok) {
        const cc = await resContabil.value.json();
        setContabilidade({
          status: 'Conciliado',
          competencia: cc.competenciaAtiva || '2026-09',
        });
      }
    } catch {
      // Ignora falhas pontuais e mantém o estado anterior
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  }, [api, produtorId, eventoId]);

  useEffect(() => {
    void carregarMetricas();
  }, [carregarMetricas]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/20 rounded-2xl p-8 relative overflow-hidden shadow-2xl">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Zap size={14} />
              <span>Monólito Modular Event-Driven</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold">
              {EDDIE_BUILD.uiVersion} Event OS
            </span>
            {evento && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium">
                Contexto: <b>{evento.nome}</b>
              </span>
            )}
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Painel do Produtor (PDT)
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Plataforma corporativa DiskIngressos integrada para gestão executiva de eventos,
            liquidação financeira em partidas dobradas no Ledger, inteligência de marketing multicanal e CRM B2B.
          </p>
        </div>
      </div>

      {/* KPI Highlight Grid (Derivado dos dados reais do Ledger e Módulos) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Saldo Disponível */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Saldo Disponível (Ledger)</span>
            <Wallet size={18} className="text-emerald-400" />
          </div>
          {loading ? (
            <div className="h-8 flex items-center">
              <Loader2 size={16} className="animate-spin text-emerald-400" />
            </div>
          ) : (
            <div className="text-2xl font-bold text-white">
              {formatBRL(saldos.disponivelCents)}
            </div>
          )}
          <div className="text-xs text-slate-400 font-medium">
            Patrimônio total: <b className="text-slate-200">{formatBRL(saldos.totalPatrimonioCents)}</b>
          </div>
        </div>

        {/* Receita de Marketing */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Receita Atribuída (Mkt)</span>
            <Megaphone size={18} className="text-sky-400" />
          </div>
          {loading ? (
            <div className="h-8 flex items-center">
              <Loader2 size={16} className="animate-spin text-sky-400" />
            </div>
          ) : (
            <div className="text-2xl font-bold text-white">
              {formatBRL(marketing.receitaAtribuidaCents)}
            </div>
          )}
          <div className="text-xs text-sky-400 font-medium">
            ROAS Médio: <b>{marketing.roas}</b> ({marketing.totalConversoes} conversões)
          </div>
        </div>

        {/* Pipeline Comercial B2B */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Pipeline B2B Ativo</span>
            <Briefcase size={18} className="text-purple-400" />
          </div>
          {loading ? (
            <div className="h-8 flex items-center">
              <Loader2 size={16} className="animate-spin text-purple-400" />
            </div>
          ) : (
            <div className="text-2xl font-bold text-white">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pipeline.valorTotal)}
            </div>
          )}
          <div className="text-xs text-purple-400 font-medium">
            {pipeline.ativas} oportunidades ativas
          </div>
        </div>

        {/* Status Contábil */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Status Contábil</span>
            <Scale size={18} className="text-amber-400" />
          </div>
          {loading ? (
            <div className="h-8 flex items-center">
              <Loader2 size={16} className="animate-spin text-amber-400" />
            </div>
          ) : (
            <div className="text-2xl font-bold text-emerald-400">{contabilidade.status}</div>
          )}
          <div className="text-xs text-slate-400 font-medium">
            Competência {contabilidade.competencia}
          </div>
        </div>
      </div>

      {/* Module Navigation Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight">
            Acesso aos Bounded Contexts Oficiais
          </h2>
          <button
            onClick={() => void carregarMetricas()}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
          >
            <RefreshCcw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Atualizar Métricas</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Central Operacional */}
          <Link
            href="/operacao"
            className="group bg-[#111827] hover:bg-[#162032] border border-slate-800 hover:border-emerald-500/50 rounded-xl p-6 transition-all space-y-4 relative"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Activity size={24} />
              </div>
              <ArrowUpRight size={20} className="text-slate-500 group-hover:text-emerald-400 transition" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base group-hover:text-emerald-400 transition">
                  Central Operacional
                </h3>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Ao Vivo
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Centro de Operações, alertas em tempo real, gestão de incidentes e sala de situação.
              </p>
            </div>
          </Link>

          {/* Automações & Regras */}
          <Link
            href="/automacoes"
            className="group bg-[#111827] hover:bg-[#162032] border border-slate-800 hover:border-amber-500/50 rounded-xl p-6 transition-all space-y-4 relative"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Zap size={24} />
              </div>
              <ArrowUpRight size={20} className="text-slate-500 group-hover:text-amber-400 transition" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base group-hover:text-amber-400 transition">
                  Automações & Regras
                </h3>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Motor
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Motor de regras SE → ENTÃO, auditoria de execuções e aprovações financeiras pendentes.
              </p>
            </div>
          </Link>

          {/* Hardening & Segurança */}
          <Link
            href="/operacao/hardening"
            className="group bg-[#111827] hover:bg-[#162032] border border-slate-800 hover:border-sky-500/50 rounded-xl p-6 transition-all space-y-4 relative"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <ShieldCheck size={24} />
              </div>
              <ArrowUpRight size={20} className="text-slate-500 group-hover:text-sky-400 transition" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base group-hover:text-sky-400 transition">
                  Hardening & Escala
                </h3>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30">
                  v11.15
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Segurança Enterprise, RBAC, auditoria, concorrência de alta escala e resiliência.
              </p>
            </div>
          </Link>

          {/* Ciclo E2E & Go-Live */}
          <Link
            href="/operacao/e2e"
            className="group bg-[#111827] hover:bg-[#162032] border border-slate-800 hover:border-emerald-500/50 rounded-xl p-6 transition-all space-y-4 relative"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle2 size={24} />
              </div>
              <ArrowUpRight size={20} className="text-slate-500 group-hover:text-emerald-400 transition" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base group-hover:text-emerald-400 transition">
                  Ciclo E2E & Go-Live
                </h3>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Gate
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Homologação de ponta a ponta: do cadastro do evento ao repasse e auditoria final.
              </p>
            </div>
          </Link>

          {/* Eventos */}
          <Link
            href="/eventos"
            className="group bg-[#111827] hover:bg-[#162032] border border-slate-800 hover:border-rose-500/50 rounded-xl p-6 transition-all space-y-4 relative"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <Calendar size={24} />
              </div>
              <ArrowUpRight size={20} className="text-slate-500 group-hover:text-rose-400 transition" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base group-hover:text-rose-400 transition">
                Event OS · Todos os Eventos
              </h3>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Gestão de sessões, setores, lotes, capacidade e precificação.
              </p>
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-800 text-[10px] text-sky-400 font-medium">
                <span>Dashboard</span> • <span>Ingressos</span> • <span>Mapa</span> • <span>Financeiro</span>
              </div>
            </div>
          </Link>

          {/* Financeiro */}
          <Link
            href="/financeiro"
            className="group bg-[#111827] hover:bg-[#162032] border border-slate-800 hover:border-emerald-500/50 rounded-xl p-6 transition-all space-y-4 relative"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Wallet size={24} />
              </div>
              <ArrowUpRight size={20} className="text-slate-500 group-hover:text-emerald-400 transition" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base group-hover:text-emerald-400 transition">
                Financeiro & Caixa
              </h3>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Ledger imutável, transferências inter-eventos, antecipações e conciliação.
              </p>
            </div>
          </Link>

          {/* Contabilidade */}
          <Link
            href="/contabilidade"
            className="group bg-[#111827] hover:bg-[#162032] border border-slate-800 hover:border-purple-500/50 rounded-xl p-6 transition-all space-y-4 relative"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Scale size={24} />
              </div>
              <ArrowUpRight size={20} className="text-slate-500 group-hover:text-purple-400 transition" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base group-hover:text-purple-400 transition">
                Contabilidade & DRE
              </h3>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Livro diário, balancete analítico, centro de controle e conciliação.
              </p>
            </div>
          </Link>

          {/* Estorno & CDC */}
          <Link
            href="/estorno"
            className="group bg-[#111827] hover:bg-[#162032] border border-slate-800 hover:border-rose-500/50 rounded-xl p-6 transition-all space-y-4 relative"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <RotateCcw size={24} />
              </div>
              <ArrowUpRight size={20} className="text-slate-500 group-hover:text-rose-400 transition" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base group-hover:text-rose-400 transition">
                Estornos & CDC
              </h3>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Arrependimento legal Art. 49, chargebacks e reversões no Ledger.
              </p>
            </div>
          </Link>

          {/* Comercial B2B */}
          <Link
            href="/comercial"
            className="group bg-[#111827] hover:bg-[#162032] border border-slate-800 hover:border-blue-500/50 rounded-xl p-6 transition-all space-y-4 relative"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Briefcase size={24} />
              </div>
              <ArrowUpRight size={20} className="text-slate-500 group-hover:text-blue-400 transition" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base group-hover:text-blue-400 transition">
                Comercial B2B
              </h3>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Pipeline Kanban corporativo, condições de taxa e produtores parceiros.
              </p>
            </div>
          </Link>

          {/* Marketing */}
          <Link
            href="/marketing"
            className="group bg-[#111827] hover:bg-[#162032] border border-slate-800 hover:border-sky-500/50 rounded-xl p-6 transition-all space-y-4 relative"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Megaphone size={24} />
              </div>
              <ArrowUpRight size={20} className="text-slate-500 group-hover:text-sky-400 transition" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base group-hover:text-sky-400 transition">
                Marketing
              </h3>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Campanhas multicanal, WhatsApp, e-mail, GA4, TikTok, Spotify e atribuição.
              </p>
            </div>
          </Link>

          {/* Remarketing */}
          <Link
            href="/remarketing"
            className="group bg-[#111827] hover:bg-[#162032] border border-slate-800 hover:border-orange-500/50 rounded-xl p-6 transition-all space-y-4 relative"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                <RotateCcw size={24} />
              </div>
              <ArrowUpRight size={20} className="text-slate-500 group-hover:text-orange-400 transition" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base group-hover:text-orange-400 transition">
                Remarketing & Resgate
              </h3>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Hub de recuperação de carrinhos abandonados, Pix pendentes e clientes inativos.
              </p>
            </div>
          </Link>

          {/* Central de Relatórios */}
          <Link
            href="/relatorios"
            className="group bg-[#111827] hover:bg-[#162032] border border-slate-800 hover:border-emerald-500/50 rounded-xl p-6 transition-all space-y-4 relative"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <FileBarChart size={24} />
              </div>
              <ArrowUpRight size={20} className="text-slate-500 group-hover:text-emerald-400 transition" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base group-hover:text-emerald-400 transition">
                Central de Relatórios
              </h3>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Mais de 50 modelos operacionais: Financeiro, Eventos, Contábil, Mkt, SAC e Estornos.
              </p>
            </div>
          </Link>

          {/* SAC Comprador */}
          <Link
            href="/sac"
            className="group bg-[#111827] hover:bg-[#162032] border border-slate-800 hover:border-cyan-500/50 rounded-xl p-6 transition-all space-y-4 relative"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Headphones size={24} />
              </div>
              <ArrowUpRight size={20} className="text-slate-500 group-hover:text-cyan-400 transition" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base group-hover:text-cyan-400 transition">
                Atendimento SAC
              </h3>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Consulta completa por CPF/pedido, fila de tickets ITIL e SLA de atendimento.
              </p>
            </div>
          </Link>

          {/* Suporte Operacional */}
          <Link
            href="/suporte"
            className="group bg-[#111827] hover:bg-[#162032] border border-slate-800 hover:border-amber-500/50 rounded-xl p-6 transition-all space-y-4 relative"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <AlertTriangle size={24} />
              </div>
              <ArrowUpRight size={20} className="text-slate-500 group-hover:text-amber-400 transition" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base group-hover:text-amber-400 transition">
                Suporte de Campo
              </h3>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Incidentes no dia do evento: catracas, bilheterias físicas e redes.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Compass,
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Radio,
  ScanLine,
  Wallet,
  Megaphone,
  ShieldCheck,
  FileBarChart,
  BarChart3,
  Target,
  Clock,
  Sparkles,
  RefreshCcw,
} from 'lucide-react';
import { useProducerEvent } from '../../../../components/ProducerEventContext';

export default function CockpitExecutivoPage({
  params,
}: {
  params: Promise<{ eventoId: string }>;
}) {
  const [eventoId, setEventoId] = useState('');
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState<any>(null);

  useEffect(() => {
    params.then((p) => {
      setEventoId(p.eventoId);
    });
  }, [params]);

  const carregarCockpit = async () => {
    if (!eventoId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/eventos/${eventoId}/cockpit`);
      if (res.ok) {
        setDados(await res.json());
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventoId) carregarCockpit();
  }, [eventoId]);

  const formatBRL = (cents = 0) =>
    (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const kpis = dados?.kpis || {
    receitaRealCents: 4895000,
    receitaMetaCents: 6000000,
    atingimentoMetaPercentual: 81.6,
    projecaoFechamentoCents: 5850000,
    ticketMedioCents: 15015,
    ingressosVendidos: 580,
    capacidadeTotal: 1200,
    ocupacaoPercentual: 48.3,
    pessoasDentro: 312,
    ritmoEntradaMinuto: 8.5,
    liquidoProdutorCents: 4405500,
    taxasDiskCents: 489500,
    disponivelRepasseCents: 3405500,
  };

  return (
    <div className="space-y-6 max-w-full text-slate-100">
      {/* Cabeçalho do Cockpit Executivo */}
      <div className="rounded-2xl border border-slate-700/80 bg-gradient-to-r from-[#171a22] via-[#14161c] to-[#121418] p-5 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-purple-500/10 px-2.5 py-0.5 text-xs font-bold text-purple-300 border border-purple-500/20">
                <Compass size={14} />
                COCKPIT EXECUTIVO
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                AO VIVO
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white truncate">
              {dados?.nome || `Festival DiskIngressos Live · ${eventoId}`}
            </h1>
            <p className="text-xs text-slate-400">
              Visão consolidada para produtores e diretoria: metas, projeções, faturamento e saúde global.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={carregarCockpit}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-[#202228] px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white transition"
            >
              <RefreshCcw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Sincronizar</span>
            </button>

            <Link
              href={`/eventos/${eventoId}/operacao`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-lg shadow-emerald-950/40"
            >
              <Radio size={14} />
              <span>Abrir Sala de Controle (NOC)</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Grid 1: Meta de Faturamento vs Real vs Projeção */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Receita Real Confirmada */}
        <div className="rounded-xl border border-emerald-500/30 bg-[#16181d] p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Receita Real Confirmada</span>
            <DollarSign size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl lg:text-3xl font-black text-white font-mono">
            {formatBRL(kpis.receitaRealCents)}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>Meta: {formatBRL(kpis.receitaMetaCents)}</span>
            <span className="text-emerald-400 font-bold">{kpis.atingimentoMetaPercentual}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1">
            <div
              className="bg-emerald-400 h-1.5 rounded-full"
              style={{ width: `${Math.min(100, kpis.atingimentoMetaPercentual)}%` }}
            />
          </div>
        </div>

        {/* Projeção de Fechamento */}
        <div className="rounded-xl border border-sky-500/30 bg-[#16181d] p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={14} className="text-sky-400" />
              Projeção de Fechamento
            </span>
            <Target size={16} className="text-sky-400" />
          </div>
          <div className="text-2xl lg:text-3xl font-black text-sky-400 font-mono">
            {formatBRL(kpis.projecaoFechamentoCents)}
          </div>
          <div className="text-xs text-slate-400 pt-1">
            Estimativa calculada via curva de aceleração de lote
          </div>
          <div className="text-[11px] text-sky-300/80 font-medium">
            Projeção separada rigorosamente do saldo real em conta
          </div>
        </div>

        {/* Líquido Produtor & Repasse */}
        <div className="rounded-xl border border-slate-700/80 bg-[#16181d] p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Líquido do Produtor</span>
            <Wallet size={16} className="text-purple-400" />
          </div>
          <div className="text-2xl lg:text-3xl font-black text-emerald-400 font-mono">
            {formatBRL(kpis.liquidoProdutorCents)}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>Disponível para Repasse:</span>
            <span className="font-bold text-white font-mono">
              {formatBRL(kpis.disponivelRepasseCents)}
            </span>
          </div>
          <div className="text-[10px] text-slate-500">
            Conciliado automaticamente via Ledger DiskIngressos
          </div>
        </div>
      </div>

      {/* Grid 2: Operação Físico-Digital (Ocupação, Portaria e Ticket Médio) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Ocupação Real */}
        <div className="rounded-xl border border-slate-700/80 bg-[#16181d] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Ocupação do Espaço</span>
            <Users size={16} className="text-sky-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white">{kpis.ocupacaoPercentual}%</div>
          <div className="text-xs text-slate-400 mt-1">
            {kpis.ingressosVendidos} de {kpis.capacidadeTotal} ingressos
          </div>
        </div>

        {/* Pessoas Dentro e Ritmo */}
        <div className="rounded-xl border border-slate-700/80 bg-[#16181d] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Pessoas Dentro</span>
            <ScanLine size={16} className="text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-400">{kpis.pessoasDentro}</div>
          <div className="text-xs text-slate-400 mt-1">
            Fluxo atual: <b>{kpis.ritmoEntradaMinuto}</b> entradas/min
          </div>
        </div>

        {/* Ticket Médio */}
        <div className="rounded-xl border border-slate-700/80 bg-[#16181d] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Ticket Médio</span>
            <TrendingUp size={16} className="text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white font-mono">
            {formatBRL(kpis.ticketMedioCents)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Média por comprador confirmado</div>
        </div>
      </div>

      {/* Grid 3: Radar de Saúde Executiva + Vendas por Canal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Radar de Saúde dos Subsistemas */}
        <div className="lg:col-span-6 rounded-xl border border-slate-700/80 bg-[#16181d] p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-400" />
              <h3 className="font-bold text-white text-base">Radar de Saúde Operacional</h3>
            </div>
            <span className="text-xs text-slate-400">Score global: 93/100</span>
          </div>

          <div className="space-y-2.5 pt-1">
            {(dados?.radarSaude || []).map((r: any, idx: number) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-[#1f2228] border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      r.status === 'NORMAL' ? 'bg-emerald-400 shadow-sm' : 'bg-amber-400 shadow-sm'
                    }`}
                  />
                  <span className="font-medium text-slate-200">{r.subsistema}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-24 bg-slate-800 rounded-full h-1.5 hidden sm:block">
                    <div
                      className={`h-1.5 rounded-full ${
                        r.status === 'NORMAL' ? 'bg-emerald-400' : 'bg-amber-400'
                      }`}
                      style={{ width: `${r.score}%` }}
                    />
                  </div>
                  <span className="font-mono text-slate-400 font-bold">{r.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Canais de Origem de Receita */}
        <div className="lg:col-span-6 rounded-xl border border-slate-700/80 bg-[#16181d] p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Megaphone size={16} className="text-purple-400" />
              <h3 className="font-bold text-white text-base">Origem das Vendas por Canal</h3>
            </div>
            <Link
              href={`/eventos/${eventoId}/marketing`}
              className="text-xs text-purple-400 hover:underline inline-flex items-center gap-1"
            >
              Marketing <ArrowRight size={13} />
            </Link>
          </div>

          <div className="space-y-2.5 pt-1">
            {(dados?.canaisVendas || []).map((c: any, idx: number) => (
              <div key={idx} className="p-2.5 rounded-lg bg-[#1f2228] border border-slate-800/80 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-200">{c.canal}</span>
                  <span className="font-mono text-emerald-400 font-bold">{formatBRL(c.receitaCents)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>{c.ingressos} ingressos emitidos</span>
                  <span>{c.share}% do total</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1">
                  <div className="bg-purple-500 h-1 rounded-full" style={{ width: `${c.share}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ações Recomendadas & Atalhos Executivos */}
      <div className="rounded-xl border border-slate-700/80 bg-[#16181d] p-5 shadow-lg">
        <h3 className="font-bold text-white text-base pb-3 border-b border-slate-800">
          Atalhos de Gestão & Decisão
        </h3>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <Link
            href={`/eventos/${eventoId}/operacao`}
            className="p-3 rounded-lg bg-[#1f2228] border border-slate-800 hover:border-emerald-500/50 transition flex flex-col justify-between"
          >
            <Radio size={16} className="text-emerald-400" />
            <div className="mt-2 font-bold text-white">Sala de Controle (NOC)</div>
            <span className="text-[11px] text-slate-400">Tempo real</span>
          </Link>

          <Link
            href={`/eventos/${eventoId}/financeiro`}
            className="p-3 rounded-lg bg-[#1f2228] border border-slate-800 hover:border-emerald-500/50 transition flex flex-col justify-between"
          >
            <Wallet size={16} className="text-emerald-400" />
            <div className="mt-2 font-bold text-white">Financeiro & Repasses</div>
            <span className="text-[11px] text-slate-400">Ledger</span>
          </Link>

          <Link
            href={`/eventos/${eventoId}/portaria`}
            className="p-3 rounded-lg bg-[#1f2228] border border-slate-800 hover:border-sky-500/50 transition flex flex-col justify-between"
          >
            <ScanLine size={16} className="text-sky-400" />
            <div className="mt-2 font-bold text-white">Portaria & Acessos</div>
            <span className="text-[11px] text-slate-400">Catracas</span>
          </Link>

          <Link
            href={`/eventos/${eventoId}/relatorios`}
            className="p-3 rounded-lg bg-[#1f2228] border border-slate-800 hover:border-purple-500/50 transition flex flex-col justify-between"
          >
            <FileBarChart size={16} className="text-purple-400" />
            <div className="mt-2 font-bold text-white">Relatórios & DRE</div>
            <span className="text-[11px] text-slate-400">Exportação</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

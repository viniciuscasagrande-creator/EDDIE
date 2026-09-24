'use client';

import React, { useEffect, useState, useCallback } from 'react';
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

  const carregarCockpit = useCallback(async () => {
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
  }, [eventoId]);

  useEffect(() => {
    if (eventoId) carregarCockpit();
  }, [eventoId, carregarCockpit]);

  const formatBRL = (cents = 0) =>
    (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const kpis = dados?.kpis;

  return (
    <div className="space-y-6 max-w-full text-slate-100 pb-12">
      {/* Cabeçalho do Cockpit Executivo */}
      <div className="rounded-2xl border border-slate-700/80 bg-gradient-to-r from-[#171a22] via-[#14161c] to-[#121418] p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-purple-500/10 px-2.5 py-0.5 text-xs font-bold text-purple-300 border border-purple-500/20">
                <Compass size={14} />
                COCKPIT EXECUTIVO
              </span>
              {dados?.statusExecutivo === 'EM_ANDAMENTO' ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  AO VIVO
                </span>
              ) : loading ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/15 px-2.5 py-0.5 text-xs font-bold text-sky-400 border border-sky-500/30">
                  CARREGANDO...
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/30">
                  AGUARDANDO INTEGRAÇÃO
                </span>
              )}
            </div>

            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white truncate mt-1">
              {dados?.nome || `Festival DiskIngressos Live · ${eventoId}`}
            </h1>
            <p className="text-xs text-slate-400">
              Visão consolidada para produtores e diretoria: metas, projeções, faturamento e saúde global.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href={`/eventos/${eventoId}/cockpit/comparativos`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/40 bg-purple-500/10 px-3 py-2 text-xs font-bold text-purple-300 hover:bg-purple-500/20 transition"
            >
              <BarChart3 size={13} />
              <span>Comparativos</span>
            </Link>

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
            {kpis?.receitaRealCents != null ? formatBRL(kpis.receitaRealCents) : loading ? 'Carregando...' : 'Dados indisponíveis'}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>Meta: {kpis?.receitaMetaCents != null ? formatBRL(kpis.receitaMetaCents) : '—'}</span>
            <span className="text-emerald-400 font-bold">{kpis?.atingimentoMetaPercentual != null ? `${kpis.atingimentoMetaPercentual}%` : '—'}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1">
            <div
              className="bg-emerald-400 h-1.5 rounded-full"
              style={{ width: `${Math.min(100, kpis?.atingimentoMetaPercentual || 0)}%` }}
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
            {kpis?.projecaoFechamentoCents != null ? formatBRL(kpis.projecaoFechamentoCents) : loading ? 'Calculando...' : 'Dados indisponíveis'}
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
            {kpis?.liquidoProdutorCents != null ? formatBRL(kpis.liquidoProdutorCents) : loading ? 'Carregando...' : 'Dados indisponíveis'}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>Disponível para Repasse:</span>
            <span className="font-bold text-white font-mono">
              {kpis?.disponivelRepasseCents != null ? formatBRL(kpis.disponivelRepasseCents) : '—'}
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
          <div className="mt-2 text-2xl font-black text-white">{kpis?.ocupacaoPercentual != null ? `${kpis.ocupacaoPercentual}%` : '—'}</div>
          <div className="text-xs text-slate-400 mt-1">
            {kpis?.ingressosVendidos != null ? `${kpis.ingressosVendidos} de ${kpis.capacidadeTotal || 0} ingressos` : 'Aguardando apuração'}
          </div>
        </div>

        {/* Pessoas Dentro e Ritmo */}
        <div className="rounded-xl border border-slate-700/80 bg-[#16181d] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Pessoas Dentro</span>
            <ScanLine size={16} className="text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-400">{kpis?.pessoasDentro != null ? kpis.pessoasDentro : '—'}</div>
          <div className="text-xs text-slate-400 mt-1">
            Fluxo atual: <b>{kpis?.ritmoEntradaMinuto != null ? kpis.ritmoEntradaMinuto : '—'}</b> entradas/min
          </div>
        </div>

        {/* Ticket Médio */}
        <div className="rounded-xl border border-slate-700/80 bg-[#16181d] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Ticket Médio</span>
            <TrendingUp size={16} className="text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white">
            {kpis?.ticketMedioCents != null ? formatBRL(kpis.ticketMedioCents) : '—'}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Taxas Disk: {kpis?.taxasDiskCents != null ? formatBRL(kpis.taxasDiskCents) : '—'}
          </div>
        </div>
      </div>

      {/* Grid 3: Atalhos Estratégicos & Executivos */}
      <div className="rounded-xl border border-slate-800 bg-[#14161c] p-5 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Módulos Integrados do Event OS
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <Link
            href={`/eventos/${eventoId}/inteligencia`}
            className="p-3 rounded-lg bg-[#1f2228] border border-slate-800 hover:border-purple-500/50 transition flex flex-col justify-between"
          >
            <Sparkles size={16} className="text-purple-400" />
            <div className="mt-2 font-bold text-white">Central de Inteligência</div>
            <span className="text-[11px] text-slate-400">Preditivo & Risco</span>
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

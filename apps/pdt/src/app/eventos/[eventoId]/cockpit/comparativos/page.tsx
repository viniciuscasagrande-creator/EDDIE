'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  DollarSign,
  Download,
  FileBarChart,
  Layers,
  LineChart,
  Megaphone,
  Radio,
  RefreshCcw,
  Sparkles,
  Target,
  Ticket,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import { EventOsShell } from '../../../../../components/eventos/EventOsShell';

export default function CockpitComparativosPage({
  params,
}: {
  params: Promise<{ eventoId: string }>;
}) {
  const [eventoId, setEventoId] = useState('');
  const [loading, setLoading] = useState(false);
  const [visaoSelecionada, setVisaoSelecionada] = useState<'SESSOES' | 'METAS' | 'PACING'>('SESSOES');

  useEffect(() => {
    params.then((p) => setEventoId(p.eventoId));
  }, [params]);

  const formatBRL = (val = 0) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 });

  const sessoesComparativo = [
    {
      id: 'sess-01',
      nome: 'Sessão 1 — Sexta Abertura',
      data: '2026-10-16T20:00:00Z',
      receitaReal: 1450000,
      receitaMeta: 1500000,
      atingimentoMeta: 96.6,
      ingressosVendidos: 3200,
      capacidade: 3500,
      ocupacao: 91.4,
      ticketMedio: 125.0,
      status: 'CONCLUIDA',
      picoEntradaPorMin: 14.2,
    },
    {
      id: 'sess-02',
      nome: 'Sessão 2 — Sábado Principal',
      data: '2026-10-17T20:00:00Z',
      receitaReal: 2854900,
      receitaMeta: 2800000,
      atingimentoMeta: 101.9,
      ingressosVendidos: 5120,
      capacidade: 5200,
      ocupacao: 98.4,
      ticketMedio: 180.5,
      status: 'EM_ANDAMENTO',
      picoEntradaPorMin: 22.8,
    },
    {
      id: 'sess-03',
      nome: 'Sessão 3 — Domingo Sunset',
      data: '2026-10-18T17:00:00Z',
      receitaReal: 1890000,
      receitaMeta: 2200000,
      atingimentoMeta: 85.9,
      ingressosVendidos: 3740,
      capacidade: 4500,
      ocupacao: 83.1,
      ticketMedio: 148.0,
      status: 'FUTURA',
      picoEntradaPorMin: 0,
    },
  ];

  const pacingHistorico = [
    { periodo: 'D-30 (Lançamento)', vendasReal: 320000, meta: 300000, acumulado: 320000 },
    { periodo: 'D-20 (Virada Lote 1)', vendasReal: 850000, meta: 800000, acumulado: 1170000 },
    { periodo: 'D-10 (Campanha Meta Ads)', vendasReal: 1650000, meta: 1600000, acumulado: 2820000 },
    { periodo: 'D-5 (Semana do Evento)', vendasReal: 1820000, meta: 1900000, acumulado: 4640000 },
    { periodo: 'D-0 (Portaria & Bilheteria)', vendasReal: 1554900, meta: 1900000, acumulado: 6194900 },
  ];

  return (
    <EventOsShell eventoId={eventoId || 'evento-operacao'}>
      <div className="space-y-6 max-w-full text-slate-100 pb-12">
        {/* CABEÇALHO */}
        <div className="rounded-2xl border border-slate-700/80 bg-gradient-to-r from-[#171a22] via-[#14161c] to-[#121418] p-5 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Link
                  href={`/eventos/${eventoId || 'evento-operacao'}/cockpit`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white transition"
                >
                  <ArrowLeft size={13} />
                  <span>Voltar ao Cockpit</span>
                </Link>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-purple-500/10 px-2.5 py-1 text-xs font-bold text-purple-300 border border-purple-500/20">
                  <BarChart3 size={14} />
                  COMPARATIVOS EXECUTIVOS
                </span>
              </div>

              <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight mt-2">
                Análise Comparativa de Desempenho
              </h1>
              <p className="text-xs text-slate-400">
                Pacing de vendas, comparação entre sessões e desvio explícito entre Real vs Meta vs Projeção.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-xl bg-slate-900 border border-slate-800 p-1">
                <button
                  onClick={() => setVisaoSelecionada('SESSOES')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    visaoSelecionada === 'SESSOES'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Entre Sessões
                </button>
                <button
                  onClick={() => setVisaoSelecionada('METAS')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    visaoSelecionada === 'METAS'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Real vs Meta
                </button>
                <button
                  onClick={() => setVisaoSelecionada('PACING')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    visaoSelecionada === 'PACING'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Curva de Pacing
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* VISÃO 1: COMPARATIVO ENTRE SESSÕES */}
        {visaoSelecionada === 'SESSOES' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sessoesComparativo.map((sessao) => (
                <div
                  key={sessao.id}
                  className="rounded-2xl border border-slate-800 bg-[#121620] p-5 space-y-4 hover:border-purple-500/40 transition shadow-lg"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white">{sessao.nome}</h3>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {new Date(sessao.data).toLocaleDateString('pt-BR', { dateStyle: 'medium' })}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        sessao.status === 'EM_ANDAMENTO'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : sessao.status === 'CONCLUIDA'
                          ? 'bg-slate-800 text-slate-300'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}
                    >
                      {sessao.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3">
                      <div className="text-[11px] text-slate-400">Faturamento Real</div>
                      <div className="text-lg font-black text-white mt-1">
                        {formatBRL(sessao.receitaReal)}
                      </div>
                      <div className="text-[10px] text-slate-500">Meta: {formatBRL(sessao.receitaMeta)}</div>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3">
                      <div className="text-[11px] text-slate-400">Atingimento Meta</div>
                      <div className={`text-lg font-black mt-1 ${sessao.atingimentoMeta >= 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {sessao.atingimentoMeta}%
                      </div>
                      <div className="text-[10px] text-slate-500">Sobre meta orçada</div>
                    </div>
                  </div>

                  <div className="space-y-2 bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Ingressos Emitidos:</span>
                      <strong className="text-white">{sessao.ingressosVendidos} / {sessao.capacidade}</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Ocupação do Setor:</span>
                      <strong className="text-emerald-400">{sessao.ocupacao}%</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Ticket Médio:</span>
                      <strong className="text-purple-300">{formatBRL(sessao.ticketMedio)}</strong>
                    </div>
                    {sessao.picoEntradaPorMin > 0 && (
                      <div className="flex justify-between text-slate-300">
                        <span>Pico de Portaria:</span>
                        <strong className="text-sky-300">{sessao.picoEntradaPorMin} pessoas/min</strong>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* TABELA CONSOLIDADA DE SESSÕES */}
            <div className="rounded-2xl border border-slate-800 bg-[#121620] p-5 shadow-lg overflow-x-auto">
              <h3 className="text-sm font-bold text-white mb-3">Tabela Comparativa Consolidada</h3>
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Sessão</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Receita Real</th>
                    <th className="p-3 text-right">Meta Orçada</th>
                    <th className="p-3 text-right">Atingimento</th>
                    <th className="p-3 text-right">Público Total</th>
                    <th className="p-3 text-right">Ocupação</th>
                    <th className="p-3 text-right">Ticket Médio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {sessoesComparativo.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-900/50">
                      <td className="p-3 font-semibold text-white">{s.nome}</td>
                      <td className="p-3">
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800">{s.status}</span>
                      </td>
                      <td className="p-3 text-right font-bold text-white">{formatBRL(s.receitaReal)}</td>
                      <td className="p-3 text-right text-slate-400">{formatBRL(s.receitaMeta)}</td>
                      <td className={`p-3 text-right font-bold ${s.atingimentoMeta >= 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {s.atingimentoMeta}%
                      </td>
                      <td className="p-3 text-right">{s.ingressosVendidos}</td>
                      <td className="p-3 text-right">{s.ocupacao}%</td>
                      <td className="p-3 text-right text-purple-300">{formatBRL(s.ticketMedio)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VISÃO 2: REAL vs META vs PROJEÇÃO */}
        {visaoSelecionada === 'METAS' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-emerald-500/40 bg-[#121620] p-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-emerald-400 font-bold uppercase">
                  <span>Faturamento Real Consolidado</span>
                  <CheckCircle2 size={16} />
                </div>
                <div className="text-2xl font-black text-white">{formatBRL(6194900)}</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Líquido confirmado em adquirentes e compensado nas contas bancárias vinculadas ao produtor.
                </p>
              </div>

              <div className="rounded-2xl border border-sky-500/40 bg-[#121620] p-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-sky-400 font-bold uppercase">
                  <span>Meta Orçada Contratual</span>
                  <Target size={16} />
                </div>
                <div className="text-2xl font-black text-white">{formatBRL(6500000)}</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Meta financeira aprovada no planejamento executivo para as 3 sessões do festival.
                </p>
              </div>

              <div className="rounded-2xl border border-purple-500/40 bg-[#121620] p-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-purple-400 font-bold uppercase">
                  <span>Projeção Estatística de Fechamento</span>
                  <Sparkles size={16} />
                </div>
                <div className="text-2xl font-black text-white">{formatBRL(6840000)}</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Calculada sobre o ritmo de vendas D-0 e taxa média de conversão da bilheteria presencial.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#121620] p-5 space-y-3">
              <h3 className="text-sm font-bold text-white">Análise de Desvio Financeiro</h3>
              <p className="text-xs text-slate-400">
                Atingimento atual consolidado está em <strong className="text-emerald-400">95.3%</strong> da meta global com a Sessão 3 ainda em fase de vendas antecipadas. A expectativa é superar a meta em +5.2% até o fechamento da bilheteria de domingo.
              </p>
            </div>
          </div>
        )}

        {/* VISÃO 3: PACING HISTÓRICO */}
        {visaoSelecionada === 'PACING' && (
          <div className="rounded-2xl border border-slate-800 bg-[#121620] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Curva de Aceleração de Vendas (Pacing)</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Evolução do faturamento acumulado comparado ao planejamento por marco temporal.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {pacingHistorico.map((p, idx) => (
                <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <strong className="text-white font-semibold">{p.periodo}</strong>
                    <span className="font-bold text-emerald-400">{formatBRL(p.acumulado)} acumulados</span>
                  </div>

                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (p.acumulado / 6500000) * 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Vendido no período: {formatBRL(p.vendasReal)}</span>
                    <span>Meta do período: {formatBRL(p.meta)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ATALHOS RÁPIDOS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            href={`/eventos/${eventoId}/operacao`}
            className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 transition flex items-center justify-between text-xs"
          >
            <span className="font-bold text-slate-200">Centro de Operações</span>
            <ArrowRight size={13} className="text-slate-400" />
          </Link>

          <Link
            href={`/eventos/${eventoId}/financeiro`}
            className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 transition flex items-center justify-between text-xs"
          >
            <span className="font-bold text-slate-200">Ledger & Repasses</span>
            <ArrowRight size={13} className="text-slate-400" />
          </Link>

          <Link
            href={`/eventos/${eventoId}/portaria`}
            className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 transition flex items-center justify-between text-xs"
          >
            <span className="font-bold text-slate-200">Portaria & Catracas</span>
            <ArrowRight size={13} className="text-slate-400" />
          </Link>

          <Link
            href={`/operacao/incidentes`}
            className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 transition flex items-center justify-between text-xs"
          >
            <span className="font-bold text-slate-200">Incidentes Operacionais</span>
            <ArrowRight size={13} className="text-slate-400" />
          </Link>
        </div>
      </div>
    </EventOsShell>
  );
}

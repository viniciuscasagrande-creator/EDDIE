'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Compass,
  DollarSign,
  Flame,
  HelpCircle,
  Layers,
  LineChart,
  Radio,
  RefreshCcw,
  ScanLine,
  ShieldAlert,
  Sparkles,
  Target,
  Ticket,
  TrendingUp,
  Users,
} from 'lucide-react';

export default function PrevisoesInteligenciaPage({
  params,
}: {
  params: Promise<{ eventoId: string }>;
}) {
  const [eventoId, setEventoId] = useState('');
  const [aba, setAba] = useState<'VENDAS' | 'PORTARIA'>('VENDAS');
  const [dadosVendas, setDadosVendas] = useState<any | null>(null);
  const [dadosPortaria, setDadosPortaria] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((p) => setEventoId(p.eventoId));
  }, [params]);

  const carregarPrevisoes = useCallback(async () => {
    if (!eventoId) return;
    setLoading(true);
    try {
      const [resV, resP] = await Promise.all([
        fetch(`/api/eventos/${eventoId}/previsoes/vendas`),
        fetch(`/api/eventos/${eventoId}/previsoes/portaria`),
      ]);
      if (resV.ok) setDadosVendas(await resV.json());
      if (resP.ok) setDadosPortaria(await resP.json());
    } catch (e) {
      console.error('Falha ao carregar previsões:', e);
    } finally {
      setLoading(false);
    }
  }, [eventoId]);

  useEffect(() => {
    carregarPrevisoes();
    const interval = setInterval(carregarPrevisoes, 15000);
    return () => clearInterval(interval);
  }, [carregarPrevisoes]);

  const formatBRL = (cents = 0) =>
    (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 });

  return (
    <div className="space-y-6 max-w-full text-slate-100 pb-12">
      {/* CABEÇALHO */}
      <div className="rounded-2xl border border-slate-700/80 bg-gradient-to-r from-[#171a22] via-[#14161c] to-[#121418] p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link
                href={`/eventos/${eventoId || 'evento-operacao'}/inteligencia`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white transition"
              >
                <ArrowLeft size={13} />
                <span>Voltar à Inteligência</span>
              </Link>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-purple-500/10 px-2.5 py-1 text-xs font-bold text-purple-300 border border-purple-500/20">
                <Sparkles size={14} />
                MODELOS PREDITIVOS EXPLICÁVEIS
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight mt-2">
              Previsão de Vendas, Ocupação & Portaria
            </h1>
            <p className="text-xs text-slate-400">
              Projeção estatística transparente com metodologia declarada, confiança amostral e comparação Previsto × Realizado.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="inline-flex rounded-xl bg-slate-900 border border-slate-800 p-1">
              <button
                onClick={() => setAba('VENDAS')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  aba === 'VENDAS'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <DollarSign size={13} />
                <span>Vendas & Lotes</span>
              </button>
              <button
                onClick={() => setAba('PORTARIA')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  aba === 'PORTARIA'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ScanLine size={13} />
                <span>Portaria & Filas</span>
              </button>
            </div>

            <button
              onClick={() => carregarPrevisoes()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white transition"
            >
              <RefreshCcw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Atualizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* ABA VENDAS */}
      {aba === 'VENDAS' && (
        <div className="space-y-6">
          {/* CENÁRIOS DE FECHAMENTO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-[#121620] p-5 space-y-2">
              <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Cenário Conservador</div>
              <div className="text-2xl font-black text-white">
                {dadosVendas?.projecaoFechamento?.cenarioConservadorCentavos != null
                  ? formatBRL(dadosVendas.projecaoFechamento.cenarioConservadorCentavos)
                  : loading ? 'Calculando...' : 'Dados indisponíveis'}
              </div>
              <p className="text-xs text-slate-400">
                Considera desaceleração de 20% no ritmo D-0.
              </p>
            </div>

            <div className="rounded-2xl border border-purple-500/50 bg-gradient-to-br from-purple-950/30 to-[#121620] p-5 space-y-2 shadow-lg">
              <div className="text-xs text-purple-300 uppercase font-black tracking-wider flex items-center justify-between">
                <span>Cenário Base (Mais Provável)</span>
                <Sparkles size={15} />
              </div>
              <div className="text-2xl font-black text-white">
                {dadosVendas?.projecaoFechamento?.cenarioBaseCentavos != null
                  ? formatBRL(dadosVendas.projecaoFechamento.cenarioBaseCentavos)
                  : loading ? 'Calculando...' : 'Dados indisponíveis'}
              </div>
              <p className="text-xs text-purple-200/80">
                {dadosVendas?.projecaoFechamento?.probabilidadeAtingirMetaPercentual != null
                  ? `Probabilidade de atingir a meta: ${dadosVendas.projecaoFechamento.probabilidadeAtingirMetaPercentual}%`
                  : 'Aguardando convergência estatística'}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#121620] p-5 space-y-2">
              <div className="text-xs text-emerald-400 uppercase font-bold tracking-wider">Cenário Otimista</div>
              <div className="text-2xl font-black text-emerald-300">
                {dadosVendas?.projecaoFechamento?.cenarioOtimistaCentavos != null
                  ? formatBRL(dadosVendas.projecaoFechamento.cenarioOtimistaCentavos)
                  : loading ? 'Calculando...' : 'Dados indisponíveis'}
              </div>
              <p className="text-xs text-slate-400">
                Com aceleração de bilheteria física até o início da sessão.
              </p>
            </div>
          </div>

          {/* PREVISÃO DE RUPTURA / ESGOTAMENTO DE LOTES */}
          <div className="rounded-2xl border border-slate-800 bg-[#121620] p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers size={16} className="text-purple-400" />
                  <span>Monitor Preditivo de Ruptura de Lotes</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Momento estimado de esgotamento e preparo de virada de lote automático.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(!dadosVendas?.lotesRiscoRuptura || dadosVendas.lotesRiscoRuptura.length === 0) ? (
                <div className="col-span-3 p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                  Nenhum lote com risco iminente de ruptura detectado.
                </div>
              ) : (
                dadosVendas.lotesRiscoRuptura.map((lote: any) => (
                  <div key={lote.loteId} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white text-sm">{lote.nome}</div>
                        <div className="text-[11px] text-slate-400">
                          {lote.ingressosRestantes} restantes / {lote.capacidadeTotal} total
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {lote.ritmoVendasPorHora} un./h
                      </span>
                    </div>

                    <div className="bg-slate-950/60 rounded-lg p-2.5 text-xs space-y-1">
                      <div className="flex justify-between text-slate-300">
                        <span>Esgotamento em:</span>
                        <strong className="text-rose-400">{lote.tempoEstimadoEsgotamentoMinutos} min (~{lote.horaEstimadaRuptura})</strong>
                      </div>
                      <div className="text-[11px] text-slate-400 pt-1 leading-snug">
                        {lote.acaoRecomendada}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* COMPARATIVO PREVISTO vs REALIZADO */}
          <div className="rounded-2xl border border-slate-800 bg-[#121620] p-5 space-y-3 shadow-lg">
            <h3 className="text-sm font-bold text-white">Comparativo de Aderência Preditiva (Previsto × Realizado)</h3>
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-3">Janela de Horário</th>
                  <th className="p-3 text-right">Previsto</th>
                  <th className="p-3 text-right">Realizado</th>
                  <th className="p-3 text-right">Desvio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {(!dadosVendas?.comparativoPrevistoRealizado || dadosVendas.comparativoPrevistoRealizado.length === 0) ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-500">
                      Aguardando dados comparativos de vendas.
                    </td>
                  </tr>
                ) : (
                  dadosVendas.comparativoPrevistoRealizado.map((c: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-900/50">
                      <td className="p-3 font-semibold text-white">{c.hora}</td>
                      <td className="p-3 text-right text-slate-400">R$ {c.previstoMilhares}k</td>
                      <td className="p-3 text-right font-bold text-white">R$ {c.realizadoMilhares}k</td>
                      <td className={`p-3 text-right font-bold ${c.desvioPercentual >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {c.desvioPercentual > 0 ? `+${c.desvioPercentual}` : c.desvioPercentual}%
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA PORTARIA */}
      {aba === 'PORTARIA' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-[#121620] p-5 space-y-2">
              <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Público Total Esperado</div>
              <div className="text-2xl font-black text-white">
                {dadosPortaria?.portariaReal?.publicoEsperado != null ? dadosPortaria.portariaReal.publicoEsperado : '—'}
              </div>
              <div className="text-xs text-slate-400">
                {dadosPortaria?.portariaReal?.totalEntradas != null
                  ? `${dadosPortaria.portariaReal.totalEntradas} já passaram pela catraca.`
                  : 'Aguardando início do check-in.'}
              </div>
            </div>

            <div className="rounded-2xl border border-sky-500/50 bg-[#10141e] p-5 space-y-2 shadow-lg">
              <div className="text-xs text-sky-400 uppercase font-black tracking-wider flex items-center justify-between">
                <span>Horário de Pico de Entrada</span>
                <Clock size={15} />
              </div>
              <div className="text-2xl font-black text-white">
                {dadosPortaria?.projecaoFluxo?.horarioPicoEstimado || 'Aguardando projeção'}
              </div>
              <div className="text-xs text-sky-300">
                {dadosPortaria?.projecaoFluxo?.taxaPicoEsperadaMin != null
                  ? `Fluxo máximo previsto: ${dadosPortaria.projecaoFluxo.taxaPicoEsperadaMin} pessoas/min.`
                  : 'Estimativa baseada no perfil da sessão.'}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#121620] p-5 space-y-2">
              <div className="text-xs text-amber-400 uppercase font-bold tracking-wider">Tempo Estimado de Fila</div>
              <div className="text-2xl font-black text-amber-300">
                {dadosPortaria?.projecaoFluxo?.tempoFilaPicoMinutos != null
                  ? `${dadosPortaria.projecaoFluxo.tempoFilaPicoMinutos} min`
                  : '—'}
              </div>
              <div className="text-xs text-slate-400">
                Normalização esperada às {dadosPortaria?.projecaoFluxo?.horaEstimadaNormalizacao || '—'}.
              </div>
            </div>
          </div>

          {/* CURVA DE FLUXO POR FAIXA DE 15 MIN */}
          <div className="rounded-2xl border border-slate-800 bg-[#121620] p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ScanLine size={16} className="text-sky-400" />
                <span>Curva Projetada de Entradas por Janela de 15 Minutos</span>
              </h3>
            </div>

            <div className="space-y-2.5">
              {(!dadosPortaria?.curvaFluxoFaixas15Min || dadosPortaria.curvaFluxoFaixas15Min.length === 0) ? (
                <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                  Aguardando dados de fluxo de portaria.
                </div>
              ) : (
                dadosPortaria.curvaFluxoFaixas15Min.map((faixa: any, idx: number) => (
                  <div
                    key={idx}
                    className={`rounded-xl border p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs ${
                      faixa.status === 'PROJECAO_PICO'
                        ? 'border-rose-500/60 bg-rose-950/20'
                        : 'border-slate-800 bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 w-36 shrink-0">
                      <span className="font-mono font-bold text-white">{faixa.faixa}</span>
                    </div>

                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <div>
                        <span className="text-slate-400">Projeção:</span>
                        <div className="font-bold text-white">{faixa.previstas} pessoas</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Realizado:</span>
                        <div className="font-bold text-sky-400">{faixa.realizadas !== null ? `${faixa.realizadas} pessoas` : '—'}</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Fila Estimada:</span>
                        <div className="font-bold text-amber-300">{faixa.tempoFilaMin} min</div>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase self-start md:self-auto ${
                        faixa.status === 'CONCLUIDA'
                          ? 'bg-slate-800 text-slate-300'
                          : faixa.status === 'EM_ANDAMENTO'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : faixa.status === 'PROJECAO_PICO'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}
                    >
                      {faixa.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RECOMENDAÇÃO OPERACIONAL */}
          {dadosPortaria?.recomendacaoOperacional && (
            <div className="rounded-2xl border border-sky-500/30 bg-sky-950/20 p-4 text-xs text-sky-300 space-y-1">
              <strong>Recomendação de Dimensionamento:</strong>
              <p>{dadosPortaria.recomendacaoOperacional}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

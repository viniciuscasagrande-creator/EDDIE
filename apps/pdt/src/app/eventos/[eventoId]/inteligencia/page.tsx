'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Compass,
  CreditCard,
  DollarSign,
  Flame,
  HelpCircle,
  Layers,
  LineChart,
  Megaphone,
  Radio,
  RefreshCcw,
  ScanLine,
  ShieldAlert,
  Sparkles,
  Target,
  Ticket,
  TrendingUp,
  Users,
  Wifi,
} from 'lucide-react';

export default function CentralInteligenciaPage({
  params,
}: {
  params: Promise<{ eventoId: string }>;
}) {
  const [eventoId, setEventoId] = useState('');
  const [abaVisao, setAbaVisao] = useState<'AGORA' | 'TENDENCIA' | 'HISTORICO'>('AGORA');
  const [resumo, setResumo] = useState<any | null>(null);
  const [series, setSeries] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((p) => setEventoId(p.eventoId));
  }, [params]);

  const carregarDados = useCallback(async () => {
    if (!eventoId) return;
    setLoading(true);
    try {
      const [resResumo, resSeries] = await Promise.all([
        fetch(`/api/eventos/${eventoId}/inteligencia/resumo`),
        fetch(`/api/eventos/${eventoId}/inteligencia/series?visao=${abaVisao}`),
      ]);
      if (resResumo.ok) setResumo(await resResumo.json());
      if (resSeries.ok) setSeries(await resSeries.json());
    } catch (e) {
      console.error('Falha ao carregar inteligência:', e);
    } finally {
      setLoading(false);
    }
  }, [eventoId, abaVisao]);

  useEffect(() => {
    carregarDados();
    const interval = setInterval(carregarDados, 15000);
    return () => clearInterval(interval);
  }, [carregarDados]);

  const formatBRL = (cents = 0) =>
    (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 });

  return (
    <div className="space-y-6 max-w-full text-slate-100 pb-12">
      {/* BANNER PRINCIPAL DE INTELIGÊNCIA */}
      <div className="rounded-2xl border border-purple-500/40 bg-gradient-to-r from-purple-950/40 via-[#15131b] to-[#121620] p-5 md:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-purple-500/20 px-2.5 py-0.5 text-xs font-bold text-purple-300 border border-purple-500/30">
                <Sparkles size={14} className="text-purple-400" />
                MOTOR DE INTELIGÊNCIA OPERACIONAL
              </span>
              {resumo?.statusConexao === 'AO_VIVO' ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  CORRELAÇÃO AO VIVO
                </span>
              ) : loading ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/15 px-2.5 py-0.5 text-[11px] font-bold text-sky-400 border border-sky-500/30">
                  CARREGANDO...
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-400 border border-amber-500/30">
                  AGUARDANDO INTEGRAÇÃO
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1">
              Central de Inteligência Operacional
            </h1>
            <p className="text-xs md:text-sm text-slate-400">
              Correlação preditiva e analítica em tempo real entre Vendas, Portaria, Pagamentos, Estoque e Risco.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* SELETOR DE VISÃO */}
            <div className="inline-flex rounded-xl bg-slate-900 border border-slate-800 p-1">
              {(['AGORA', 'TENDENCIA', 'HISTORICO'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setAbaVisao(v)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    abaVisao === v
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {v === 'AGORA' ? 'Agora' : v === 'TENDENCIA' ? 'Tendência 24h' : 'Histórico D-14'}
                </button>
              ))}
            </div>

            <button
              onClick={() => carregarDados()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white transition"
            >
              <RefreshCcw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Atualizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* TRÍADE OBRIGATÓRIA: REAL × META × PROJEÇÃO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* BLOCO 1: REAL (CONSOLIDADO E CONFIRMADO) */}
        <div className="rounded-2xl border border-emerald-500/40 bg-[#10151a] p-5 space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2.5">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-400">
              <CheckCircle2 size={16} />
              <span>Dado Real Consolidado</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300">
              {resumo?.real?.receitaBrutaCentavos != null ? 'CONFIRMADO' : 'AGUARDANDO'}
            </span>
          </div>

          <div>
            <div className="text-xs text-slate-400">Receita Bruta Confirmada</div>
            <div className="text-2xl font-black text-white mt-0.5">
              {resumo?.real?.receitaBrutaCentavos != null ? formatBRL(resumo.real.receitaBrutaCentavos) : loading ? 'Carregando...' : 'Dados indisponíveis'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Líquido produtor:{' '}
              <strong className="text-emerald-400">
                {resumo?.real?.receitaLiquidaProdutorCentavos != null ? formatBRL(resumo.real.receitaLiquidaProdutorCentavos) : '—'}
              </strong>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
            <div>
              <span className="text-slate-400">Ingressos Pagos:</span>
              <div className="font-bold text-white text-sm">
                {resumo?.real?.ingressosEmitidos != null ? `${resumo.real.ingressosEmitidos} un.` : '—'}
              </div>
            </div>
            <div>
              <span className="text-slate-400">Público Presente:</span>
              <div className="font-bold text-white text-sm">
                {resumo?.real?.publicoPresente != null ? `${resumo.real.publicoPresente} pessoas` : '—'}
              </div>
            </div>
            <div>
              <span className="text-slate-400">Aprovação Pix:</span>
              <div className="font-bold text-emerald-400">
                {resumo?.real?.aprovacaoPixPercentual != null ? `${resumo.real.aprovacaoPixPercentual}%` : '—'}
              </div>
            </div>
            <div>
              <span className="text-slate-400">Scanners Ativos:</span>
              <div className="font-bold text-white">
                {resumo?.real?.scannersOperando != null ? `${resumo.real.scannersOperando} ativos` : '—'}
              </div>
            </div>
          </div>
        </div>

        {/* BLOCO 2: META (PLANEJAMENTO ORÇAMENTÁRIO) */}
        <div className="rounded-2xl border border-sky-500/40 bg-[#10141d] p-5 space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-sky-500/20 pb-2.5">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-sky-400">
              <Target size={16} />
              <span>Meta Orçada Contratual</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-300">
              {resumo?.meta?.receitaMetaCentavos != null ? 'PLANEJADO' : 'NÃO CADASTRADA'}
            </span>
          </div>

          <div>
            <div className="text-xs text-slate-400">Meta Financeira da Sessão</div>
            <div className="text-2xl font-black text-white mt-0.5">
              {resumo?.meta?.receitaMetaCentavos != null ? formatBRL(resumo.meta.receitaMetaCentavos) : 'Meta não cadastrada'}
            </div>
            <div className="text-[11px] text-sky-300 mt-1 font-semibold">
              {resumo?.meta?.atingimentoReceitaPercentual != null
                ? `Atingimento atual: ${resumo.meta.atingimentoReceitaPercentual}% da meta`
                : 'Aguardando dados de faturamento'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
            <div>
              <span className="text-slate-400">Meta de Público:</span>
              <div className="font-bold text-white text-sm">
                {resumo?.meta?.publicoMeta != null ? `${resumo.meta.publicoMeta} un.` : '—'}
              </div>
            </div>
            <div>
              <span className="text-slate-400">Atingimento Público:</span>
              <div className="font-bold text-emerald-400">
                {resumo?.meta?.atingimentoPublicoPercentual != null ? `${resumo.meta.atingimentoPublicoPercentual}%` : '—'}
              </div>
            </div>
            <div>
              <span className="text-slate-400">Conversão Alvo:</span>
              <div className="font-bold text-white">
                {resumo?.meta?.taxaConversaoMetaPercentual != null ? `${resumo.meta.taxaConversaoMetaPercentual}%` : '—'}
              </div>
            </div>
            <div>
              <span className="text-slate-400">Fila Tolerada:</span>
              <div className="font-bold text-white">
                {resumo?.meta?.tempoFilaMaximoMin != null ? `< ${resumo.meta.tempoFilaMaximoMin} min` : '—'}
              </div>
            </div>
          </div>
        </div>

        {/* BLOCO 3: PROJEÇÃO (ESTATÍSTICA EXPLICÁVEL) */}
        <div className="rounded-2xl border border-purple-500/40 bg-[#15111d] p-5 space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-purple-500/20 pb-2.5">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-purple-400">
              <Sparkles size={16} />
              <span>Projeção Estatística</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300">
              {resumo?.projecao?.receitaFechamentoEstimadaCentavos != null ? 'PREDITIVO' : 'INDISPONÍVEL'}
            </span>
          </div>

          <div>
            <div className="text-xs text-slate-400">Estimativa de Fechamento</div>
            <div className="text-2xl font-black text-white mt-0.5">
              {resumo?.projecao?.receitaFechamentoEstimadaCentavos != null
                ? formatBRL(resumo.projecao.receitaFechamentoEstimadaCentavos)
                : 'Projeção em cálculo'}
            </div>
            <div className="text-[11px] text-purple-300 mt-1">
              {resumo?.projecao?.publicoFechamentoEstimado != null
                ? `Público final previsto: ${resumo.projecao.publicoFechamentoEstimado} (${resumo.projecao.ocupacaoFechamentoPercentual ?? '—'}%)`
                : 'Aguardando amostras para projeção'}
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Pico de Portaria:</span>
              <strong className="text-sky-300">{resumo?.projecao?.horarioPicoEntrada || 'Aguardando histórico'}</strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Fluxo de Pico Previsto:</span>
              <strong className="text-purple-300">
                {resumo?.projecao?.picoFluxoPrevistoPorMin != null
                  ? `${resumo.projecao.picoFluxoPrevistoPorMin} passagens/min`
                  : '—'}
              </strong>
            </div>
            <div className="text-[11px] text-slate-400 pt-1 leading-snug">
              Metodologia: {resumo?.projecao?.metodologia || 'Regressão linear ponderada D-0 + curva gaussiana de pico de acesso.'}
            </div>
          </div>
        </div>
      </div>

      {/* GRÁFICO TEMPORAL DE CORRELAÇÃO */}
      <div className="rounded-2xl border border-slate-800 bg-[#121620] p-5 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 size={16} className="text-purple-400" />
              <span>
                {abaVisao === 'AGORA'
                  ? 'Série em Tempo Real: Ritmo de Vendas vs Entradas de Portaria (a cada 10 min)'
                  : abaVisao === 'TENDENCIA'
                  ? 'Tendência de Faturamento Acumulado vs Meta (últimas 24h)'
                  : 'Curva Histórica de Vendas vs Edição Anterior (D-14 a D-0)'}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Dados consolidados dos endpoints transacionais sem interpolação arbitrária.
            </p>
          </div>

          <div className="text-xs font-mono text-slate-500">
            Intervalo: {series?.intervalo || '10m'} · {series?.totalPontos || (series?.series?.length || 0)} amostras
          </div>
        </div>

        {/* VISUALIZAÇÃO GRÁFICA RESPONSIVA */}
        <div className="space-y-3 pt-2">
          {(!series?.series || series.series.length === 0) ? (
            <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
              Aguardando telemetria em tempo real deste evento.
            </div>
          ) : (
            series.series.map((ponto: any, idx: number) => {
              if (abaVisao === 'AGORA') {
                return (
                  <div key={idx} className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 w-28 shrink-0">
                      <Clock size={13} className="text-slate-500" />
                      <span className="font-mono font-bold text-white">{ponto.hora}</span>
                    </div>

                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <span className="text-slate-400">Vendas:</span>
                        <div className="font-bold text-emerald-400">{ponto.vendasMinuto} ing./min</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Portaria:</span>
                        <div className="font-bold text-sky-400">{ponto.entradasMinuto} pass./min</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Latência Gateway:</span>
                        <div className="font-bold text-amber-400">{ponto.latenciaGatewayMs} ms</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Carrinhos:</span>
                        <div className="font-bold text-purple-300">{ponto.carrinhosAtivos} ativos</div>
                      </div>
                    </div>
                  </div>
                );
              }

              if (abaVisao === 'TENDENCIA') {
                return (
                  <div key={idx} className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 w-24 shrink-0">
                      <span className="font-mono font-bold text-white">{ponto.hora}</span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Real: R$ {ponto.receitaAcumuladaMilhares}k | Projeção: R$ {ponto.projecaoAcumuladaMilhares}k</span>
                        <span className="text-purple-300 font-bold">Meta: R$ {ponto.metaMilhares}k</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-purple-500 h-full rounded-full"
                          style={{ width: `${Math.min(100, (ponto.receitaAcumuladaMilhares / Math.max(ponto.metaMilhares, 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={idx} className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
                  <span className="font-mono font-bold text-white w-20">{ponto.periodo}</span>
                  <span className="text-emerald-400 font-semibold">Atual: R$ {ponto.vendasDiaMilhares}k</span>
                  <span className="text-slate-400">Edição Anterior: R$ {ponto.vendasEdicaoAnteriorMilhares}k</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* FONTES SINCRONIZADAS EM TEMPO REAL */}
      <div className="rounded-2xl border border-slate-800 bg-[#121620] p-5 space-y-3 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Wifi size={16} className="text-sky-400" />
            <span>Fontes de Dados Conectadas à Inteligência</span>
          </h3>
          <span className="text-xs text-slate-500">
            {resumo?.fontesSincronizadas?.length || 0} subsistemas integrados
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(resumo?.fontesSincronizadas || []).map((fonte: any) => (
            <div key={fonte.subsistema} className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-white">{fonte.subsistema}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  fonte.status === 'ONLINE' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {fonte.status}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>Latência: {fonte.latenciaMs}ms</span>
                <span>{new Date(fonte.ultimaSincronizacao).toLocaleTimeString('pt-BR')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ACESSO AOS SUBMÓDULOS DE INTELIGÊNCIA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <Link
          href={`/eventos/${eventoId}/inteligencia/previsoes`}
          className="rounded-2xl border border-slate-800 bg-[#121620] p-4 hover:border-purple-500/50 transition group flex flex-col justify-between"
        >
          <div>
            <div className="text-xs text-purple-400 font-bold uppercase tracking-wider">11.12.2</div>
            <h4 className="font-bold text-white text-base mt-1 group-hover:text-purple-300 transition">
              Previsão de Vendas, Ocupação e Portaria →
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Projeções explicáveis de fechamento, curva de esgotamento de lotes e estimativa de filas.
            </p>
          </div>
        </Link>

        <Link
          href={`/eventos/${eventoId}/inteligencia/anomalias`}
          className="rounded-2xl border border-slate-800 bg-[#121620] p-4 hover:border-rose-500/50 transition group flex flex-col justify-between"
        >
          <div>
            <div className="text-xs text-rose-400 font-bold uppercase tracking-wider">11.12.3</div>
            <h4 className="font-bold text-white text-base mt-1 group-hover:text-rose-300 transition">
              Anomalias, Risco e Recomendações →
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Identificação de desvios em conversão, portaria, pagamentos e sugestões assistivas.
            </p>
          </div>
        </Link>

        <Link
          href={`/eventos/${eventoId}/inteligencia/financeira`}
          className="rounded-2xl border border-slate-800 bg-[#121620] p-4 hover:border-emerald-500/50 transition group flex flex-col justify-between"
        >
          <div>
            <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider">11.12.4</div>
            <h4 className="font-bold text-white text-base mt-1 group-hover:text-emerald-300 transition">
              Inteligência Financeira & Repasses →
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Custódia líquida do produtor, retenções, conciliação e previsão de repasses bancários.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
  ExternalLink,
  Flame,
  Layers,
  Lightbulb,
  Radio,
  RefreshCcw,
  Shield,
  ShieldAlert,
  Sparkles,
  Zap,
} from 'lucide-react';

export default function AnomaliasInteligenciaPage({
  params,
}: {
  params: Promise<{ eventoId: string }>;
}) {
  const [eventoId, setEventoId] = useState('');
  const [anomalias, setAnomalias] = useState<any[]>([]);
  const [recomendacoes, setRecomendacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [executandoAcao, setExecutandoAcao] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setEventoId(p.eventoId));
  }, [params]);

  const carregarDados = useCallback(async () => {
    if (!eventoId) return;
    setLoading(true);
    try {
      const [resA, resR] = await Promise.all([
        fetch(`/api/eventos/${eventoId}/anomalias`),
        fetch(`/api/eventos/${eventoId}/recomendacoes`),
      ]);
      if (resA.ok) {
        const d = await resA.json();
        setAnomalias(d.anomalias || []);
      }
      if (resR.ok) {
        const d = await resR.json();
        setRecomendacoes(d.recomendacoes || []);
      }
    } catch (e) {
      console.error('Falha ao carregar anomalias:', e);
    } finally {
      setLoading(false);
    }
  }, [eventoId]);

  useEffect(() => {
    carregarDados();
    const interval = setInterval(carregarDados, 15000);
    return () => clearInterval(interval);
  }, [carregarDados]);

  const executarRecomendacao = async (rec: any) => {
    setExecutandoAcao(rec.id);
    try {
      const res = await fetch(`/api/eventos/${eventoId}/recomendacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recomendacaoId: rec.id,
          sensivel: rec.sensivel,
          acaoAlvo: rec.acaoAlvo,
        }),
      });
      if (res.ok) {
        carregarDados();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setExecutandoAcao(null);
    }
  };

  return (
    <div className="space-y-6 max-w-full text-slate-100 pb-12">
        {/* CABEÇALHO */}
        <div className="rounded-2xl border border-slate-700/80 bg-gradient-to-r from-[#171a22] via-[#14161c] to-[#121418] p-5 shadow-2xl">
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
                <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-500/10 px-2.5 py-1 text-xs font-bold text-rose-300 border border-rose-500/20">
                  <ShieldAlert size={14} />
                  DETECÇÃO DE ANOMALIAS & RISCO
                </span>
              </div>

              <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight mt-2">
                Anomalias Operacionais & Recomendações Assistivas
              </h1>
              <p className="text-xs text-slate-400">
                Identificação de desvios estatísticos em pagamentos, checkout, catracas e recomendações acionáveis integradas ao Motor de Regras.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/automacoes/aprovacoes"
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition"
              >
                <span>Fila de Aprovação (11.11)</span>
                <ExternalLink size={12} />
              </Link>

              <button
                onClick={() => carregarDados()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white transition"
              >
                <RefreshCcw size={13} className={loading ? 'animate-spin' : ''} />
                <span>Sincronizar</span>
              </button>
            </div>
          </div>
        </div>

        {/* FEED PRIORIZADO DE ANOMALIAS DETECTADAS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertOctagon size={16} className="text-rose-400" />
              <span>Anomalias Ativas Detectadas pelo Modelo</span>
            </h3>
            <span className="text-xs text-slate-400">Classificação por desvio e severidade</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {anomalias.map((anom) => {
              const isCritica = anom.severidade === 'CRITICA';
              const isAlta = anom.severidade === 'ALTA';

              return (
                <div
                  key={anom.id}
                  className={`rounded-2xl border p-5 transition space-y-3 shadow-lg ${
                    isCritica
                      ? 'border-rose-500/70 bg-gradient-to-r from-rose-950/40 via-[#151218] to-[#121620]'
                      : isAlta
                      ? 'border-amber-500/60 bg-gradient-to-r from-amber-950/30 via-[#14151a] to-[#121620]'
                      : 'border-slate-800 bg-[#121620]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-300 bg-slate-900 px-2.5 py-0.5 rounded border border-slate-700">
                        {anom.id}
                      </span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                          isCritica
                            ? 'bg-rose-500 text-white animate-pulse'
                            : isAlta
                            ? 'bg-amber-500 text-black font-bold'
                            : 'bg-yellow-500 text-black'
                        }`}
                      >
                        {anom.severidade}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                        {anom.dominio}
                      </span>
                      <span className="text-[10px] font-bold text-sky-400 bg-sky-950/40 px-2 py-0.5 rounded border border-sky-800/40">
                        {anom.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 font-mono">
                      Detectada às {new Date(anom.detectadaEm).toLocaleTimeString('pt-BR')}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white">{anom.titulo}</h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{anom.evidencia}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/70 rounded-xl p-3 border border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-400">Baseline Histórico:</span>
                      <div className="font-semibold text-white mt-0.5">{anom.baseline}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Valor Observado:</span>
                      <div className="font-bold text-rose-400 mt-0.5">{anom.observado}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Desvio Estatístico:</span>
                      <div className="font-bold text-amber-300 mt-0.5">
                        {anom.desvioPercentual > 0 ? `+${anom.desvioPercentual}%` : `${anom.desvioPercentual}%`} (Z-Score: {anom.zScore})
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-400 pt-1">
                    <span>Impacto: <strong className="text-slate-200">{anom.impacto}</strong></span>
                    {anom.regraAcionadaId && (
                      <span className="text-sky-300 font-mono">Regra vinculada: {anom.regraAcionadaId}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RECOMENDAÇÕES ASSISTIVAS ACIONÁVEIS */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Lightbulb size={16} className="text-amber-400" />
              <span>Ações e Recomendações Assistivas Geradas</span>
            </h3>
            <span className="text-xs text-slate-400">Conectadas ao motor de automações</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recomendacoes.map((rec) => (
              <div
                key={rec.id}
                className="rounded-2xl border border-slate-800 bg-[#121620] p-5 space-y-3 flex flex-col justify-between shadow-lg"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                      {rec.id}
                    </span>
                    {rec.sensivel ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        REQUER APROVAÇÃO
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        AÇÃO DIRETA
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-white text-sm">{rec.titulo}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{rec.justificativa}</p>

                  <div className="bg-slate-950/60 rounded-lg p-2.5 text-xs text-emerald-300 border border-slate-800/80">
                    <strong>Impacto Previsto:</strong> {rec.impactoEstimado}
                  </div>
                </div>

                <div className="pt-2">
                  {rec.sensivel ? (
                    <Link
                      href="/automacoes/aprovacoes"
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 py-2.5 text-xs font-bold text-amber-300 transition"
                    >
                      <Shield size={13} />
                      <span>Encaminhar à Fila de Aprovação</span>
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled={executandoAcao === rec.id || rec.status === 'EXECUTADA'}
                      onClick={() => executarRecomendacao(rec)}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 py-2.5 text-xs font-bold text-white transition disabled:opacity-50"
                    >
                      <Zap size={13} />
                      <span>{executandoAcao === rec.id ? 'Executando...' : rec.status === 'EXECUTADA' ? 'Executada' : 'Aplicar Recomendação'}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
  );
}

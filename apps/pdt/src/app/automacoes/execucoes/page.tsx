'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  History,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Filter,
  Search,
  RefreshCcw,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import { AutomacoesNav } from '../../../components/automacoes/AutomacoesNav';

export default function HistoricoExecucoesPage() {
  const [loading, setLoading] = useState(true);
  const [execucoes, setExecucoes] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODAS');
  const [busca, setBusca] = useState('');

  const carregarExecucoes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/automacoes/execucoes');
      if (res.ok) {
        const d = await res.json();
        setExecucoes(d.execucoes || []);
        setKpis(d.kpis || {});
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarExecucoes();
  }, []);

  const filtradas = execucoes.filter((e) => {
    const okStat = filtroStatus === 'TODOS' || e.status === filtroStatus;
    const okCat = filtroCategoria === 'TODAS' || e.categoria === filtroCategoria;
    const okBusca =
      !busca ||
      e.regraNome.toLowerCase().includes(busca.toLowerCase()) ||
      e.gatilhoDetectado.toLowerCase().includes(busca.toLowerCase()) ||
      e.acaoExecutada.toLowerCase().includes(busca.toLowerCase());
    return okStat && okCat && okBusca;
  });

  return (
    <div className="space-y-6 max-w-full text-slate-100">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
            <History size={15} />
            <span>Auditoria & Observabilidade do Motor</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white mt-0.5">
            Histórico de Execuções
          </h1>
          <p className="text-xs text-slate-400">
            Registro imutável de cada disparo automático ou manual: gatilho detectado, regra e resultado.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={carregarExecucoes}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-[#16181d] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <RefreshCcw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Atualizar Log</span>
          </button>
        </div>
      </div>

      {/* Navegação entre Abas */}
      <AutomacoesNav />

      {/* Métricas do Log */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-700/80 bg-[#16181d] p-3.5">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Execuções Hoje</div>
          <div className="text-xl font-black text-white mt-1">{kpis?.execucoesHoje ?? 142}</div>
        </div>
        <div className="rounded-xl border border-slate-700/80 bg-[#16181d] p-3.5">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Taxa de Sucesso</div>
          <div className="text-xl font-black text-emerald-400 mt-1">{kpis?.taxaSucesso ?? '98.6%'}</div>
        </div>
        <div className="rounded-xl border border-slate-700/80 bg-[#16181d] p-3.5">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Tempo Médio Reação</div>
          <div className="text-xl font-black text-white mt-1">
            {kpis?.tempoMedioMs ?? 46} <span className="text-xs font-normal text-slate-400">ms</span>
          </div>
        </div>
        <div className="rounded-xl border border-slate-700/80 bg-[#16181d] p-3.5">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Aguardando Avaliação</div>
          <div className="text-xl font-black text-amber-400 mt-1">{kpis?.aguardandoAprovacao ?? 3}</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-800 bg-[#16181d] p-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-400 mr-1">Status:</span>
          {['TODOS', 'SUCESSO', 'REQUER_APROVACAO', 'FALHA'].map((s) => (
            <button
              key={s}
              onClick={() => setFiltroStatus(s)}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                filtroStatus === s
                  ? 'bg-sky-600 text-white font-bold'
                  : 'bg-[#202228] text-slate-400 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search size={14} className="absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por regra ou gatilho..."
            className="w-full rounded-lg border border-slate-700 bg-[#121418] pl-8 pr-3 py-1.5 text-xs text-white outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Tabela / Cards de Execuções */}
      <div className="space-y-2.5">
        {filtradas.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-[#16181d] p-12 text-center text-slate-400 text-xs">
            Nenhuma execução encontrada para os filtros aplicados.
          </div>
        ) : (
          filtradas.map((e) => {
            const isSuccess = e.status === 'SUCESSO';
            const isPending = e.status === 'REQUER_APROVACAO';
            return (
              <div
                key={e.id}
                className="rounded-xl border border-slate-800 bg-[#191b21] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-sm hover:border-slate-700 transition"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        isSuccess
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : isPending
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {e.status}
                    </span>

                    <span className="font-mono text-[10px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">
                      {e.id}
                    </span>

                    <span className="font-bold text-white text-sm">{e.regraNome}</span>

                    <span className="text-[10px] font-mono text-slate-400">
                      ({e.categoria})
                    </span>
                  </div>

                  <div className="text-slate-300">
                    <span className="text-slate-500 font-semibold">Gatilho:</span>{' '}
                    {e.gatilhoDetectado}
                  </div>

                  <div className="text-slate-400 text-[11px]">
                    <span className="text-slate-500 font-semibold">Ação:</span>{' '}
                    {e.acaoExecutada} {e.detalhes ? `· ${e.detalhes}` : ''}
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center shrink-0 border-t md:border-t-0 border-slate-800 pt-2 md:pt-0 font-mono text-[11px] text-slate-400">
                  <span className="text-emerald-400 font-semibold">{e.tempoRespostaMs} ms</span>
                  <span className="text-slate-500">
                    {new Date(e.ocorreuEm).toLocaleTimeString('pt-BR')}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

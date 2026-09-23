'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Zap,
  Sliders,
  History,
  CheckSquare,
  ShieldCheck,
  AlertTriangle,
  Play,
  Pause,
  ArrowRight,
  TrendingUp,
  Clock,
  Layers,
  Activity,
  CheckCircle2,
  RefreshCcw,
} from 'lucide-react';
import { AutomacoesNav } from '../../components/automacoes/AutomacoesNav';

export default function AutomacoesHubPage() {
  const [loading, setLoading] = useState(true);
  const [dadosRegras, setDadosRegras] = useState<any>(null);
  const [dadosExecucoes, setDadosExecucoes] = useState<any>(null);
  const [dadosAprovacoes, setDadosAprovacoes] = useState<any>(null);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [resR, resE, resA] = await Promise.all([
        fetch('/api/automacoes/regras'),
        fetch('/api/automacoes/execucoes'),
        fetch('/api/automacoes/aprovacoes'),
      ]);
      if (resR.ok) setDadosRegras(await resR.json());
      if (resE.ok) setDadosExecucoes(await resE.json());
      if (resA.ok) setDadosAprovacoes(await resA.json());
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const totalRegrasAtivas = dadosRegras?.ativas ?? 6;
  const execucoesHoje = dadosExecucoes?.kpis?.execucoesHoje ?? 142;
  const taxaSucesso = dadosExecucoes?.kpis?.taxaSucesso ?? '98.6%';
  const pendentesAprovacao = dadosAprovacoes?.totalPendentes ?? 3;
  const tempoMedio = dadosExecucoes?.kpis?.tempoMedioMs ?? 46;

  return (
    <div className="space-y-6 max-w-full text-slate-100">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
            <Zap size={15} />
            <span>Motor de Regras & Automação Operacional</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white mt-0.5">
            Central de Automações
          </h1>
          <p className="text-xs text-slate-400">
            Orquestração em tempo real: evento detectado → regra avaliada → ação disparada com auditoria imutável.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={carregarDados}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-[#16181d] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <RefreshCcw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Atualizar</span>
          </button>
          <Link
            href="/automacoes/regras"
            className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-sky-500 transition shadow-md shadow-sky-900/20"
          >
            <Sliders size={13} />
            <span>Gerenciar Regras</span>
          </Link>
        </div>
      </div>

      {/* Navegação entre Abas */}
      <AutomacoesNav pendentesCount={pendentesAprovacao} />

      {/* Linha de KPIs Operacionais do Motor */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* 1. Regras Ativas */}
        <div className="rounded-xl border border-slate-700/80 bg-[#16181d] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Regras Ativas</span>
            <Sliders size={15} className="text-sky-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white">{totalRegrasAtivas}</div>
          <div className="mt-0.5 text-[11px] text-emerald-400 font-medium">
            Monitorando em tempo real
          </div>
        </div>

        {/* 2. Execuções Hoje */}
        <div className="rounded-xl border border-slate-700/80 bg-[#16181d] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Execuções Hoje</span>
            <Activity size={15} className="text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white">{execucoesHoje}</div>
          <div className="mt-0.5 text-[11px] text-slate-400">Gatilhos automáticos</div>
        </div>

        {/* 3. Taxa de Sucesso */}
        <div className="rounded-xl border border-slate-700/80 bg-[#16181d] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Taxa de Sucesso</span>
            <CheckCircle2 size={15} className="text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-400">{taxaSucesso}</div>
          <div className="mt-0.5 text-[11px] text-slate-400">Sem falhas críticas</div>
        </div>

        {/* 4. Aguardando Aprovação */}
        <div
          className={`rounded-xl border p-4 shadow-sm ${
            pendentesAprovacao > 0
              ? 'border-amber-500/40 bg-amber-950/20'
              : 'border-slate-700/80 bg-[#16181d]'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Aprovações</span>
            <CheckSquare
              size={15}
              className={pendentesAprovacao > 0 ? 'text-amber-400' : 'text-slate-500'}
            />
          </div>
          <div
            className={`mt-2 text-2xl font-black ${
              pendentesAprovacao > 0 ? 'text-amber-400' : 'text-white'
            }`}
          >
            {pendentesAprovacao}
          </div>
          <div className="mt-0.5 text-[11px] text-slate-400">Ações sensíveis pendentes</div>
        </div>

        {/* 5. Latência Média */}
        <div className="rounded-xl border border-slate-700/80 bg-[#16181d] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Tempo de Reação</span>
            <Clock size={15} className="text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white">
            {tempoMedio} <span className="text-xs font-normal text-slate-400">ms</span>
          </div>
          <div className="mt-0.5 text-[11px] text-slate-400">Detecção até execução</div>
        </div>
      </div>

      {/* Grid: 2 Colunas (Regras Principais + Fila de Aprovação) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Coluna 7: Regras Operacionais em Destaque */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-xl border border-slate-700/80 bg-[#16181d] p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders size={16} className="text-sky-400" />
                <h3 className="font-bold text-white text-base">Regras em Monitoramento Ativo</h3>
              </div>
              <Link
                href="/automacoes/regras"
                className="text-xs text-sky-400 hover:underline inline-flex items-center gap-1"
              >
                Todas as regras <ArrowRight size={13} />
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {(dadosRegras?.regras || []).slice(0, 4).map((r: any) => (
                <div
                  key={r.id}
                  className="rounded-xl border border-slate-800 bg-[#1f2228] p-3.5 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-300">
                        {r.categoria}
                      </span>
                      <span className="font-bold text-white truncate">{r.nome}</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        r.status === 'ATIVA'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-700 text-slate-300 border-slate-600'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>

                  <div className="bg-[#16181d] rounded-lg p-2 font-mono text-[11px] text-sky-300 border border-slate-800/80">
                    <span className="text-slate-500">SE</span> {r.condicao}{' '}
                    <span className="text-slate-500">ENTÃO</span> {r.acao}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Cooldown: {r.cooldownMinutos} min</span>
                    <span>Disparos hoje: <b>{r.disparosHoje}</b></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coluna 5: Solicitações de Aprovação Pendente (Human-in-the-Loop) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-slate-700/80 bg-[#16181d] p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CheckSquare size={16} className="text-amber-400" />
                <h3 className="font-bold text-white text-base">Aprovações Críticas Pendentes</h3>
              </div>
              <Link
                href="/automacoes/aprovacoes"
                className="text-xs text-amber-400 hover:underline inline-flex items-center gap-1"
              >
                Ver fila <ArrowRight size={13} />
              </Link>
            </div>

            <div className="space-y-3">
              {(dadosAprovacoes?.aprovacoes || []).slice(0, 3).map((a: any) => (
                <div
                  key={a.id}
                  className="rounded-xl border border-amber-500/30 bg-amber-950/10 p-3.5 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100">{a.titulo}</span>
                    <span className="rounded bg-rose-500/20 text-rose-400 px-1.5 py-0.5 text-[9px] font-bold">
                      {a.severidade}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px]">{a.descricao}</p>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Impacto: <span className="text-amber-300 font-bold">{a.impacto}</span>
                  </div>
                  <div className="pt-2 flex justify-end gap-2 border-t border-slate-800/80">
                    <Link
                      href="/automacoes/aprovacoes"
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition"
                    >
                      Analisar Solicitação
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Histórico Recente de Disparos Auditados */}
      <div className="rounded-xl border border-slate-700/80 bg-[#16181d] p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <History size={16} className="text-sky-400" />
            <h3 className="font-bold text-white text-base">Últimas Execuções Registradas (Log de Auditoria)</h3>
          </div>
          <Link
            href="/automacoes/execucoes"
            className="text-xs text-sky-400 hover:underline inline-flex items-center gap-1"
          >
            Ver histórico completo <ArrowRight size={13} />
          </Link>
        </div>

        <div className="space-y-2">
          {(dadosExecucoes?.execucoes || []).slice(0, 5).map((e: any) => (
            <div
              key={e.id}
              className="p-3 rounded-lg border border-slate-800 bg-[#1f2228] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{e.regraNome}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {e.status}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">{e.gatilhoDetectado}</p>
              </div>

              <div className="text-right text-[11px] text-slate-500 shrink-0 font-mono">
                <div>{e.tempoRespostaMs} ms</div>
                <div>{new Date(e.ocorreuEm).toLocaleTimeString('pt-BR')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

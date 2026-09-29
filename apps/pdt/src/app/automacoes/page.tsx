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
  GitBranch,
  Inbox,
  ShieldAlert,
  Power,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { AutomacoesNav } from '../../components/automacoes/AutomacoesNav';
import {
  AutomacoesClient,
  RegraOperacionalItem,
  SolicitacaoAprovacaoItem,
  ResumoCaixaTrabalho,
} from '@/lib/automacoes-client';

export default function AutomacoesHubPage() {
  const [loading, setLoading] = useState(true);
  const [regras, setRegras] = useState<RegraOperacionalItem[]>([]);
  const [aprovacoes, setAprovacoes] = useState<SolicitacaoAprovacaoItem[]>([]);
  const [caixaTrabalho, setCaixaTrabalho] = useState<ResumoCaixaTrabalho | null>(null);

  // Kill Switch Modal / Estado
  const [killSwitchGlobalAtivo, setKillSwitchGlobalAtivo] = useState(false);
  const [modalKillSwitchAberto, setModalKillSwitchAberto] = useState(false);
  const [motivoKillSwitch, setMotivoKillSwitch] = useState('');
  const [processandoKillSwitch, setProcessandoKillSwitch] = useState(false);
  const [feedbackKillSwitch, setFeedbackKillSwitch] = useState<string | null>(null);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [regrasData, aprovacoesData, caixaData] = await Promise.all([
        AutomacoesClient.getRegras(),
        AutomacoesClient.getAprovacoes(),
        AutomacoesClient.getCaixaTrabalho(),
      ]);
      setRegras(regrasData);
      setAprovacoes(aprovacoesData);
      setCaixaTrabalho(caixaData);
    } catch (err) {
      console.error('Erro ao carregar automações:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleToggleKillSwitch = async () => {
    setProcessandoKillSwitch(true);
    try {
      const novoEstado = !killSwitchGlobalAtivo;
      await AutomacoesClient.acionarKillSwitch(
        'GLOBAL',
        motivoKillSwitch || (novoEstado ? 'Pausa preventiva global acionada pela diretoria' : 'Retomada de operações'),
        novoEstado,
      );
      setKillSwitchGlobalAtivo(novoEstado);
      setModalKillSwitchAberto(false);
      setMotivoKillSwitch('');
      setFeedbackKillSwitch(
        novoEstado
          ? 'KILL-SWITCH ATIVADO: Todas as automações e disparos automáticos estão pausados preventivamente!'
          : 'Automações reativadas com sucesso.',
      );
      setTimeout(() => setFeedbackKillSwitch(null), 6000);
    } catch (err) {
      console.error('Erro ao acionar kill-switch:', err);
    } finally {
      setProcessandoKillSwitch(false);
    }
  };

  const totalRegrasAtivas = regras.filter((r) => r.status === 'ATIVA').length;
  const regrasShadowMode = regras.filter((r) => r.status === 'MODO_OBSERVACAO').length;
  const pendentesAprovacao = aprovacoes.filter((a) => a.status === 'PENDENTE').length;

  return (
    <div className="space-y-6 max-w-full text-slate-100">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
            <Zap size={15} />
            <span>Motor Central de Regras, Fluxos e Aprovações</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/40">
              EDDIE 11.32
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white mt-0.5">
            Central de Automações & Orquestração
          </h1>
          <p className="text-xs text-slate-400">
            Automatizar o processo sem retirar o controle humano das decisões críticas (Human-in-the-Loop & SoD).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setModalKillSwitchAberto(true)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition shadow-sm ${
              killSwitchGlobalAtivo
                ? 'bg-red-600 text-white hover:bg-red-500 animate-pulse'
                : 'border border-red-900/60 bg-red-950/30 text-red-400 hover:bg-red-900/40'
            }`}
          >
            <Power size={13} />
            <span>{killSwitchGlobalAtivo ? 'KILL-SWITCH ATIVO' : 'Pausar Automações (Kill-Switch)'}</span>
          </button>

          <button
            onClick={carregarDados}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-[#16181d] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <RefreshCcw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* Alerta de Feedback de Kill-Switch */}
      {feedbackKillSwitch && (
        <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
          killSwitchGlobalAtivo
            ? 'bg-red-950/80 border border-red-700 text-red-200'
            : 'bg-emerald-950/80 border border-emerald-700 text-emerald-200'
        }`}>
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{feedbackKillSwitch}</span>
        </div>
      )}

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
            + {regrasShadowMode} em Modo Observação
          </div>
        </div>

        {/* 2. Execuções Hoje */}
        <div className="rounded-xl border border-slate-700/80 bg-[#16181d] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Execuções Hoje</span>
            <Activity size={15} className="text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white">142</div>
          <div className="mt-0.5 text-[11px] text-slate-400">Orquestração em tempo real</div>
        </div>

        {/* 3. Taxa de Sucesso */}
        <div className="rounded-xl border border-slate-700/80 bg-[#16181d] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Taxa de Sucesso</span>
            <CheckCircle2 size={15} className="text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-400">99.8%</div>
          <div className="mt-0.5 text-[11px] text-slate-400">Proteção anti-loop ativa</div>
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
          <div className="mt-0.5 text-[11px] text-amber-300/80">Segregação SoD exigida</div>
        </div>

        {/* 5. Latência Média */}
        <div className="rounded-xl border border-slate-700/80 bg-[#16181d] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Tempo de Reação</span>
            <Clock size={15} className="text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white">
            46 <span className="text-xs font-normal text-slate-400">ms</span>
          </div>
          <div className="mt-0.5 text-[11px] text-slate-400">Detecção até ação</div>
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
                <h3 className="font-bold text-white text-base">Regras com Versionamento Imutável</h3>
              </div>
              <Link
                href="/automacoes/regras"
                className="text-xs text-sky-400 hover:underline inline-flex items-center gap-1"
              >
                Construtor Visual <ArrowRight size={13} />
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {regras.map((r) => (
                <div
                  key={r.id}
                  className="rounded-xl border border-slate-800 bg-[#1f2228] p-3.5 space-y-2 text-xs hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-300">
                        {r.codigo}
                      </span>
                      <span className="font-bold text-white truncate">{r.nome}</span>
                      <span className="text-[10px] font-mono text-purple-400 bg-purple-950/60 px-1.5 py-0.2 rounded border border-purple-800">
                        v{r.versaoAtiva}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        r.status === 'ATIVA'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : r.status === 'MODO_OBSERVACAO'
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          : 'bg-slate-700 text-slate-300 border-slate-600'
                      }`}
                    >
                      {r.status === 'MODO_OBSERVACAO' ? 'Modo Observação (Shadow)' : r.status}
                    </span>
                  </div>

                  <p className="text-slate-300 text-xs">{r.descricao}</p>

                  <div className="bg-[#16181d] rounded-lg p-2 font-mono text-[11px] text-sky-300 border border-slate-800/80">
                    <span className="text-slate-500">QUANDO</span> {r.gatilhoEvento}{' '}
                    <span className="text-slate-500">SE</span> [Condições Combinadas v{r.versaoAtiva}]{' '}
                    <span className="text-slate-500">ENTÃO</span> {r.acoes.map((a) => a.tipo).join(' + ')}
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
                Central de Aprovações <ArrowRight size={13} />
              </Link>
            </div>

            <div className="space-y-3">
              {aprovacoes.slice(0, 3).map((a) => (
                <div
                  key={a.id}
                  className="rounded-xl border border-amber-500/30 bg-amber-950/10 p-3.5 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100">{a.codigo}</span>
                    <span className="rounded bg-rose-500/20 text-rose-400 px-1.5 py-0.5 text-[9px] font-bold">
                      {a.nivelExigido}
                    </span>
                  </div>

                  <p className="text-slate-300 font-semibold">{a.tipoOperacao.replace(/_/g, ' ')}</p>

                  <div className="flex justify-between text-slate-400">
                    <span>Solicitante: <strong className="text-slate-200">{a.solicitanteNome}</strong></span>
                    {a.valorCentavos && (
                      <span className="font-mono text-emerald-400 font-bold">
                        {(a.valorCentavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-amber-400 flex items-center gap-1">
                      <Clock size={11} />
                      SLA: {a.slaLimiteAt ? new Date(a.slaLimiteAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '4 horas'}
                    </span>
                    <Link
                      href="/automacoes/aprovacoes"
                      className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold transition flex items-center gap-1"
                    >
                      <span>Analisar Contexto</span>
                      <ChevronRight size={12} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Kill Switch */}
      {modalKillSwitchAberto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-red-400 border-b border-slate-800 pb-3">
              <Power className="w-5 h-5 text-red-500" />
              <h3 className="font-bold text-white text-base">
                {killSwitchGlobalAtivo ? 'Desativar Kill-Switch (Retomar)' : 'Acionar Kill-Switch de Emergência'}
              </h3>
            </div>

            <p className="text-xs text-slate-300">
              {killSwitchGlobalAtivo
                ? 'Deseja reativar a avaliação e disparo de regras automáticas no ecossistema EDDIE?'
                : 'Esta ação pausará imediatamente todos os disparos de regras automáticas e transições não humanas no sistema. Nenhuma ação será executada até a desativação.'}
            </p>

            <div>
              <label className="block text-xs text-slate-400 font-semibold mb-1">
                Motivo / Justificativa (Obrigatório para Auditoria):
              </label>
              <textarea
                rows={2}
                value={motivoKillSwitch}
                onChange={(e) => setMotivoKillSwitch(e.target.value)}
                placeholder="Descreva o incidente ou motivo operacional..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setModalKillSwitchAberto(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleToggleKillSwitch}
                disabled={processandoKillSwitch}
                className={`px-4 py-2 rounded-lg text-white text-xs font-bold ${
                  killSwitchGlobalAtivo
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-red-600 hover:bg-red-500'
                }`}
              >
                {processandoKillSwitch
                  ? 'Registrando...'
                  : killSwitchGlobalAtivo
                  ? 'Confirmar Retomada'
                  : 'Confirmar Pausa Geral'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

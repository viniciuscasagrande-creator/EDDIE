'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckSquare,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  DollarSign,
  Lock,
  ArrowRight,
  UserCheck,
  Clock,
  HelpCircle,
  FileText,
  Building,
  CreditCard,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { AutomacoesNav } from '../../../components/automacoes/AutomacoesNav';
import {
  AutomacoesClient,
  SolicitacaoAprovacaoItem,
  StatusAprovacao,
} from '@/lib/automacoes-client';

export default function FilaAprovacoesPage() {
  const [loading, setLoading] = useState(true);
  const [aprovacoes, setAprovacoes] = useState<SolicitacaoAprovacaoItem[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<string>('PENDENTE');

  // Modal de Decisão e Contexto
  const [solicitacaoAtiva, setSolicitacaoAtiva] = useState<SolicitacaoAprovacaoItem | null>(null);
  const [justificativa, setJustificativa] = useState('');
  const [processandoDecisao, setProcessandoDecisao] = useState(false);
  const [erroSoD, setErroSoD] = useState<string | null>(null);
  const [feedbackSucesso, setFeedbackSucesso] = useState<string | null>(null);

  // Usuário Atual simulado do PDT
  const [usuarioAtualId] = useState('usr-diretoria-pdt');
  const [usuarioAtualNome] = useState('Diretor Financeiro PDT');

  const carregarAprovacoes = async () => {
    setLoading(true);
    try {
      const data = await AutomacoesClient.getAprovacoes(filtroStatus);
      setAprovacoes(data);
    } catch (err) {
      console.error('Erro ao carregar aprovações:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarAprovacoes();
  }, [filtroStatus]);

  const handleProcessarDecisao = async (decisao: 'APROVADO' | 'REJEITADO' | 'SOLICITADO_INFORMACAO') => {
    if (!solicitacaoAtiva) return;
    setErroSoD(null);

    // Validação de Segregação de Funções (SoD) no cliente antes do envio
    if (solicitacaoAtiva.segregacaoFuncoesObrigatoria && solicitacaoAtiva.solicitanteId === usuarioAtualId) {
      setErroSoD(
        'Violação de Segregação de Funções (SoD): Você é o solicitante desta operação e não possui alçada para aprová-la.',
      );
      return;
    }

    if (!justificativa.trim() && decisao !== 'APROVADO') {
      alert('A justificativa é obrigatória para rejeição ou pedido de informação adicional.');
      return;
    }

    setProcessandoDecisao(true);
    try {
      await AutomacoesClient.decidirAprovacao(solicitacaoAtiva.id, {
        decisao,
        justificativa: justificativa || 'Aprovado conforme conformidade de alçada e saldo em conta',
        aprovadorId: usuarioAtualId,
        aprovadorNome: usuarioAtualNome,
      });

      setFeedbackSucesso(`Solicitação ${solicitacaoAtiva.codigo} ${decisao.toLowerCase()} com sucesso!`);
      setSolicitacaoAtiva(null);
      setJustificativa('');
      await carregarAprovacoes();
      setTimeout(() => setFeedbackSucesso(null), 5000);
    } catch (err: any) {
      setErroSoD(err?.message || 'Erro ao processar decisão');
    } finally {
      setProcessandoDecisao(false);
    }
  };

  const formatBRL = (cents?: number) => {
    if (!cents) return '—';
    return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatReais = (val?: number) => {
    if (val === undefined || val === null) return '—';
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="space-y-6 max-w-full text-slate-100">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <Lock size={15} />
            <span>Alçadas, Segregação de Funções (SoD) & Human-in-the-Loop</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white mt-0.5">
            Central Operacional de Aprovações
          </h1>
          <p className="text-xs text-slate-400">
            Aprovação com contexto analítico completo (saldo, risco, divergências e agenda) sem aprovação cega.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={carregarAprovacoes}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-[#16181d] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <RefreshCcw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Atualizar Fila</span>
          </button>
        </div>
      </div>

      <AutomacoesNav pendentesCount={aprovacoes.filter((a) => a.status === 'PENDENTE').length} />

      {/* Caixa de Métricas de Aprovação */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <p className="text-slate-400 font-semibold uppercase text-[10px]">Pendentes</p>
          <p className="text-xl font-bold text-amber-400 mt-1">28</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Aguardando decisão</p>
        </div>

        <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-900/40">
          <p className="text-red-400 font-semibold uppercase text-[10px]">Urgentes (SLA &lt; 2h)</p>
          <p className="text-xl font-bold text-red-300 mt-1">4</p>
          <p className="text-[11px] text-red-400/80 mt-0.5">Prioridade máxima</p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <p className="text-slate-400 font-semibold uppercase text-[10px]">Minhas Pendências</p>
          <p className="text-xl font-bold text-white mt-1">9</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Na sua alçada direta</p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <p className="text-slate-400 font-semibold uppercase text-[10px]">Delegadas</p>
          <p className="text-xl font-bold text-sky-400 mt-1">2</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Por gestores ausentes</p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <p className="text-slate-400 font-semibold uppercase text-[10px]">Vencidas</p>
          <p className="text-xl font-bold text-slate-300 mt-1">1</p>
          <p className="text-[11px] text-amber-400 mt-0.5">Requer escalonamento</p>
        </div>
      </div>

      {feedbackSucesso && (
        <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackSucesso}</span>
        </div>
      )}

      {/* Lista de Solicitações */}
      <div className="space-y-3">
        {aprovacoes.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
          >
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono font-bold bg-slate-800 text-amber-400 px-2 py-0.5 rounded">
                  {item.codigo}
                </span>
                <span className="font-bold text-white text-sm">
                  {item.tipoOperacao.replace(/_/g, ' ')}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950/80 text-purple-300 border border-purple-800">
                  Alçada: {item.nivelExigido}
                </span>
                {item.segregacaoFuncoesObrigatoria && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-950/80 text-sky-300 border border-sky-800 flex items-center gap-1">
                    <ShieldCheck size={11} /> SoD Obrigatório
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-slate-300">
                <span>Produtor: <strong className="text-white">{item.produtorNome || '—'}</strong></span>
                <span>Evento: <strong className="text-white">{item.eventoNome || 'Geral'}</strong></span>
                <span>Solicitante: <strong className="text-slate-200">{item.solicitanteNome}</strong></span>
                {item.valorCentavos && (
                  <span>Valor: <strong className="font-mono text-emerald-400 font-bold">{formatBRL(item.valorCentavos)}</strong></span>
                )}
              </div>

              {/* Contexto Rápido */}
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                {item.contextoAnalitico?.saldoDisponivel !== undefined && (
                  <span>Saldo Disponível: <strong className="text-emerald-400">{formatReais(item.contextoAnalitico.saldoDisponivel)}</strong></span>
                )}
                {item.contextoAnalitico?.exposicaoFinanceira !== undefined && (
                  <span>Exposição: <strong className="text-amber-400">{formatReais(item.contextoAnalitico.exposicaoFinanceira)}</strong></span>
                )}
                {item.contextoAnalitico?.divergenciasCriticas !== undefined && (
                  <span className={item.contextoAnalitico.divergenciasCriticas > 0 ? 'text-red-400 font-bold' : 'text-slate-400'}>
                    Divergências 11.31: {item.contextoAnalitico.divergenciasCriticas}
                  </span>
                )}
                {item.slaLimiteAt && (
                  <span className="text-amber-400 flex items-center gap-1">
                    <Clock size={11} /> SLA: {new Date(item.slaLimiteAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setSolicitacaoAtiva(item);
                  setErroSoD(null);
                  setJustificativa('');
                }}
                className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <span>Analisar & Decidir</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Análise de Contexto e Decisão SoD */}
      {solicitacaoAtiva && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl w-full space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Lock className="w-5 h-5 text-amber-400" />
                  Decisão de Alçada: {solicitacaoAtiva.codigo}
                </h3>
                <p className="text-slate-400 text-xs">{solicitacaoAtiva.tipoOperacao.replace(/_/g, ' ')}</p>
              </div>
              <button onClick={() => setSolicitacaoAtiva(null)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Alerta de Segregação de Funções */}
            {erroSoD && (
              <div className="p-3 rounded-lg bg-red-950/80 border border-red-700 text-red-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{erroSoD}</span>
              </div>
            )}

            {/* Painel de Contexto Analítico Completo (Anti-Aprovação Cega) */}
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                <Layers size={13} className="text-sky-400" />
                Dossiê Analítico da Operação
              </h4>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <p className="text-slate-400 text-[10px]">Valor Solicitado</p>
                  <p className="font-mono font-bold text-emerald-400 text-sm">
                    {formatBRL(solicitacaoAtiva.valorCentavos)}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400 text-[10px]">Saldo Disponível em Conta</p>
                  <p className="font-mono font-bold text-white text-sm">
                    {formatReais(solicitacaoAtiva.contextoAnalitico?.saldoDisponivel)}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400 text-[10px]">Exposição de Risco</p>
                  <p className="font-mono font-bold text-amber-400 text-sm">
                    {formatReais(solicitacaoAtiva.contextoAnalitico?.exposicaoFinanceira)}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400 text-[10px]">Divergências 11.31</p>
                  <p className="font-mono font-bold text-emerald-400 text-sm">
                    {solicitacaoAtiva.contextoAnalitico?.divergenciasCriticas ?? 0} críticas
                  </p>
                </div>

                <div>
                  <p className="text-slate-400 text-[10px]">Conta Bancária</p>
                  <p className="font-semibold text-slate-200 text-xs truncate">
                    {(solicitacaoAtiva.contextoAnalitico?.contaBancaria as string) || 'Cadastrada'}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400 text-[10px]">Solicitante</p>
                  <p className="font-semibold text-slate-200 text-xs truncate">
                    {solicitacaoAtiva.solicitanteNome}
                  </p>
                </div>
              </div>

              {Boolean(solicitacaoAtiva.contextoAnalitico?.contrapartida) && (
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                  <p className="text-slate-400 font-semibold">Contrapartida Comercial Pactuada:</p>
                  <p className="mt-0.5">{String(solicitacaoAtiva.contextoAnalitico.contrapartida)}</p>
                </div>
              )}
            </div>

            {/* Justificativa Obrigatória */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Parecer / Justificativa da Decisão (Registrada em Trilha Imutável):
              </label>
              <textarea
                rows={3}
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                placeholder="Insira as considerações de alçada, autorização ou motivo de rejeição..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handleProcessarDecisao('SOLICITADO_INFORMACAO')}
                disabled={processandoDecisao}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
              >
                Solicitar Informação
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleProcessarDecisao('REJEITADO')}
                  disabled={processandoDecisao}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold"
                >
                  Rejeitar
                </button>
                <button
                  type="button"
                  onClick={() => handleProcessarDecisao('APROVADO')}
                  disabled={processandoDecisao}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5"
                >
                  <CheckCircle2 size={14} />
                  <span>Aprovar Operação</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

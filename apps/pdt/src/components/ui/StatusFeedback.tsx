'use client';

import React from 'react';
import {
  Loader2,
  Inbox,
  AlertTriangle,
  WifiOff,
  ShieldAlert,
  Clock,
  XCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export type StatusFeedbackType =
  | 'carregando'
  | 'sem_dados'
  | 'indisponivel'
  | 'erro_conexao'
  | 'sem_permissao'
  | 'dados_desatualizados'
  | 'falha_gravacao'
  | 'sucesso_confirmado';

interface StatusFeedbackProps {
  type: StatusFeedbackType;
  title?: string;
  message?: string;
  correlationId?: string;
  onRetry?: () => void;
  className?: string;
}

export function StatusFeedback({
  type,
  title,
  message,
  correlationId,
  onRetry,
  className = '',
}: StatusFeedbackProps) {
  switch (type) {
    case 'carregando':
      return (
        <div
          className={`flex flex-col items-center justify-center p-8 text-center text-slate-400 ${className}`}
          role="status"
          aria-live="polite"
        >
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-3" />
          <h4 className="text-sm font-semibold text-slate-200">
            {title || 'Carregando dados operacionais...'}
          </h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            {message || 'Consultando a fonte primária de verdade no backend.'}
          </p>
        </div>
      );

    case 'sem_dados':
      return (
        <div
          className={`flex flex-col items-center justify-center p-8 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/40 text-slate-400 ${className}`}
        >
          <Inbox className="w-8 h-8 text-slate-600 mb-3" />
          <h4 className="text-sm font-semibold text-slate-300">
            {title || 'Nenhum registro encontrado'}
          </h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            {message || 'Não há dados cadastrados ou eventos para este período.'}
          </p>
        </div>
      );

    case 'indisponivel':
      return (
        <div
          className={`p-6 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 ${className}`}
          role="alert"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-amber-200">
                {title || 'Serviço Temporariamente Indisponível'}
              </h4>
              <p className="text-xs text-amber-300/80 mt-1">
                {message ||
                  'O serviço de dados correspondente está em manutenção ou inacessível no momento.'}
              </p>
              {correlationId && (
                <div className="mt-2 font-mono text-[10px] text-amber-400/60">
                  Protocolo: {correlationId}
                </div>
              )}
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-xs font-medium text-amber-200 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Verificar novamente
                </button>
              )}
            </div>
          </div>
        </div>
      );

    case 'erro_conexao':
      return (
        <div
          className={`p-6 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 ${className}`}
          role="alert"
        >
          <div className="flex items-start gap-3">
            <WifiOff className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-rose-200">
                {title || 'Erro de Conexão com o Backend'}
              </h4>
              <p className="text-xs text-rose-300/80 mt-1">
                {message ||
                  'Tempo limite excedido ou servidor backend inalcançável. Nenhuma informação foi alterada.'}
              </p>
              {correlationId && (
                <div className="mt-2 font-mono text-[10px] text-rose-400/60">
                  Trace ID: {correlationId}
                </div>
              )}
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-xs font-medium text-rose-200 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Tentar novamente
                </button>
              )}
            </div>
          </div>
        </div>
      );

    case 'sem_permissao':
      return (
        <div
          className={`p-6 rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-300 ${className}`}
          role="alert"
        >
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-purple-200">
                {title || 'Sem Permissão de Acesso'}
              </h4>
              <p className="text-xs text-purple-300/80 mt-1">
                {message ||
                  'Seu perfil de produtor/operador não tem autorização para visualizar ou manipular estes recursos.'}
              </p>
              {correlationId && (
                <div className="mt-2 font-mono text-[10px] text-purple-400/60">
                  Ref: {correlationId}
                </div>
              )}
            </div>
          </div>
        </div>
      );

    case 'dados_desatualizados':
      return (
        <div
          className={`p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-300/90 text-xs flex items-center justify-between gap-3 ${className}`}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {message ||
                'Exibindo dados da última sincronização bem-sucedida. O backend está instável.'}
            </span>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-amber-400 hover:text-amber-200 underline font-medium shrink-0"
            >
              Recarregar
            </button>
          )}
        </div>
      );

    case 'falha_gravacao':
      return (
        <div
          className={`p-6 rounded-xl border border-rose-600/40 bg-rose-950/40 text-rose-200 ${className}`}
          role="alert"
        >
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-rose-100">
                {title || 'Falha na Gravação da Operação'}
              </h4>
              <p className="text-xs text-rose-300/90 mt-1">
                {message ||
                  'A gravação foi REJEITADA e nenhuma alteração foi persistida no banco de dados.'}
              </p>
              {correlationId && (
                <div className="mt-2 font-mono text-[10px] text-rose-400/70">
                  Falha rastreada: {correlationId}
                </div>
              )}
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Repetir com segurança
                </button>
              )}
            </div>
          </div>
        </div>
      );

    case 'sucesso_confirmado':
      return (
        <div
          className={`p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 ${className}`}
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-emerald-200">
                {title || 'Sucesso Confirmado'}
              </h4>
              <p className="text-xs text-emerald-300/80 mt-0.5">
                {message || 'A alteração foi persistida com integridade no banco de dados.'}
              </p>
            </div>
          </div>
        </div>
      );
  }
}

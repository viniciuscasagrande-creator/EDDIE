'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  RotateCcw,
  ShieldAlert,
  ArrowRight,
  Zap,
  Check,
  Building2,
  DollarSign,
  Ticket,
} from 'lucide-react';
import { cn, formatBRL } from '../../lib/utils';
import { ActionableAlertItem, AlertUrgency, AlertDomain, ActionType } from './dashboard.types';

export interface ActionableAlertsProps {
  alerts: ActionableAlertItem[];
  onAction?: (alert: ActionableAlertItem) => Promise<boolean | void>;
  loading?: boolean;
  onRefresh?: () => void;
  className?: string;
}

const urgencyConfig: Record<
  AlertUrgency,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  critical: {
    label: 'Crítico',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    dot: 'bg-rose-500 animate-pulse',
  },
  high: {
    label: 'Alta',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    dot: 'bg-amber-500',
  },
  medium: {
    label: 'Média',
    bg: 'bg-sky-500/10',
    text: 'text-sky-400',
    border: 'border-sky-500/30',
    dot: 'bg-sky-500',
  },
  low: {
    label: 'Baixa',
    bg: 'bg-slate-800',
    text: 'text-slate-400',
    border: 'border-slate-700',
    dot: 'bg-slate-500',
  },
};

const domainConfig: Record<
  AlertDomain,
  { label: string; icon: React.ComponentType<{ size?: number; className?: string }>; link: string }
> = {
  ESTORNO: {
    label: 'Estorno & CDC',
    icon: RotateCcw,
    link: '/estorno',
  },
  EVENTO: {
    label: 'Eventos & Lotes',
    icon: Ticket,
    link: '/eventos',
  },
  REPASSE: {
    label: 'Financeiro / Repasse',
    icon: DollarSign,
    link: '/financeiro',
  },
  REVENUE_ASSURANCE: {
    label: 'Garantia de Receita',
    icon: ShieldAlert,
    link: '/operacao/hardening',
  },
  PORTARIA: {
    label: 'Portaria & Acesso',
    icon: Building2,
    link: '/operacao',
  },
};

const actionLabels: Record<ActionType, string> = {
  APROVAR_ESTORNO: 'Aprovar CDC',
  APROVAR_LOTE: 'Publicar Lote',
  LIBERAR_REPASSE: 'Autorizar Repasse',
  VERIFICAR_PORTARIA: 'Triagem de Catracas',
};

export function ActionableAlerts({
  alerts: initialAlerts,
  onAction,
  loading = false,
  onRefresh,
  className,
}: ActionableAlertsProps) {
  const [items, setItems] = useState<ActionableAlertItem[]>(initialAlerts);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id: string; message: string; success: boolean } | null>(
    null
  );

  // Sincroniza se os alerts externos mudarem
  React.useEffect(() => {
    setItems(initialAlerts);
  }, [initialAlerts]);

  const handleExecute = async (alert: ActionableAlertItem) => {
    setProcessingId(alert.id);
    setFeedback(null);

    try {
      if (onAction) {
        await onAction(alert);
      } else {
        // Simulação com pequeno delay caso não haja handler injetado
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      setFeedback({
        id: alert.id,
        message: 'Ação executada com sucesso!',
        success: true,
      });

      // Remove otimisticamente após breve animação de confirmação
      setTimeout(() => {
        setItems((prev) => prev.filter((i) => i.id !== alert.id));
        setFeedback(null);
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao executar ação.';
      setFeedback({
        id: alert.id,
        message: msg,
        success: false,
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div
      className={cn(
        'bg-[#111827] rounded-xl border border-slate-800 p-6 flex flex-col shadow-sm',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Zap size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Centro de Ações Pendentes
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                {items.length} pendente{items.length !== 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Ações executivas com impacto financeiro ou operacional imediato
            </p>
          </div>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60"
          >
            <Clock size={13} className={loading ? 'animate-spin' : ''} />
            <span>Atualizar</span>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="mt-4 flex-1">
        {loading && items.length === 0 ? (
          <div className="space-y-3 py-6">
            <div className="h-16 bg-slate-800/50 rounded-lg animate-pulse" />
            <div className="h-16 bg-slate-800/50 rounded-lg animate-pulse" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 size={24} />
            </div>
            <div className="space-y-1 max-w-sm">
              <h4 className="text-sm font-bold text-white">Inbox Zero no Centro de Comando!</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Todas as solicitações de estorno, limites de portaria e autorizações financeiras
                estão em dia. Nenhuma ação pendente.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((alert) => {
              const urgency = urgencyConfig[alert.urgency] || urgencyConfig.medium;
              const domain = domainConfig[alert.domain] || {
                label: alert.domain,
                icon: AlertTriangle,
                link: '#',
              };
              const DomainIcon = domain.icon;
              const isExecuting = processingId === alert.id;
              const itemFeedback = feedback?.id === alert.id ? feedback : null;

              return (
                <div
                  key={alert.id}
                  className={cn(
                    'p-4 rounded-xl border bg-slate-900/60 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group',
                    itemFeedback?.success
                      ? 'border-emerald-500/40 bg-emerald-950/20'
                      : 'border-slate-800/80 hover:border-slate-700'
                  )}
                >
                  {/* Left info */}
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Urgency Badge */}
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold border',
                          urgency.bg,
                          urgency.text,
                          urgency.border
                        )}
                      >
                        <span className={cn('w-1.5 h-1.5 rounded-full', urgency.dot)} />
                        {urgency.label}
                      </span>

                      {/* Domain Badge */}
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        <DomainIcon size={12} className="text-slate-300" />
                        <span>{domain.label}</span>
                      </span>

                      {alert.amountCents !== undefined && alert.amountCents > 0 && (
                        <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {formatBRL(alert.amountCents)}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-semibold text-white tracking-tight leading-snug">
                      {alert.title}
                    </h4>

                    {itemFeedback && (
                      <div
                        className={cn(
                          'text-xs font-semibold flex items-center gap-1.5',
                          itemFeedback.success ? 'text-emerald-400' : 'text-rose-400'
                        )}
                      >
                        {itemFeedback.success ? <Check size={14} /> : <AlertTriangle size={14} />}
                        <span>{itemFeedback.message}</span>
                      </div>
                    )}
                  </div>

                  {/* Right actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <Link
                      href={domain.link}
                      className="text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition flex items-center gap-1"
                      title="Ver detalhes no módulo completo"
                    >
                      <span>Detalhes</span>
                      <ExternalLink size={12} />
                    </Link>

                    <button
                      onClick={() => void handleExecute(alert)}
                      disabled={isExecuting || !!itemFeedback?.success}
                      className={cn(
                        'text-xs font-semibold px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 shadow-sm active:scale-95',
                        itemFeedback?.success
                          ? 'bg-emerald-600 text-white cursor-default'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50'
                      )}
                    >
                      {isExecuting ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>Processando...</span>
                        </>
                      ) : itemFeedback?.success ? (
                        <>
                          <Check size={13} />
                          <span>Concluído</span>
                        </>
                      ) : (
                        <>
                          <Zap size={13} />
                          <span>{actionLabels[alert.actionType] || 'Executar Ação'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <span>Aprovações refletem no Ledger e nos módulos em tempo real</span>
        <Link
          href="/operacao"
          className="text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1"
        >
          <span>Ver Central de Incidentes</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}

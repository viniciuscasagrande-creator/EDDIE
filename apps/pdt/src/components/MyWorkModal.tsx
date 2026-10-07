'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  Wallet,
  Calendar,
  Users,
  Send,
  X,
  ArrowRight,
  ShieldAlert,
  Zap,
} from 'lucide-react';

export interface PendingTaskItem {
  id: string;
  domain: 'FINANCEIRO' | 'ESTORNO' | 'EVENTO' | 'RH' | 'CONTRATO';
  title: string;
  description: string;
  severity: 'CRITICAL' | 'IMPORTANT' | 'NORMAL';
  dueDate: string;
  amount?: string;
  actionLabel: string;
  targetHref: string;
}

const INITIAL_TASKS: PendingTaskItem[] = [
  {
    id: 'task-1',
    domain: 'ESTORNO',
    title: 'Estorno CDC Pedido #8892',
    description: 'Solicitação de direito de arrependimento em 7 dias (CDC). Cliente: Mariana Duarte.',
    severity: 'CRITICAL',
    dueDate: 'Hoje às 18:00',
    amount: 'R$ 350,00',
    actionLabel: 'Aprovar Estorno CDC',
    targetHref: '/estorno',
  },
  {
    id: 'task-2',
    domain: 'FINANCEIRO',
    title: 'Repasse Quitado pronto para liberação',
    description: 'Lote de liquidação SET-202609-01 para Live Nation Brasil auditado com 10 gates.',
    severity: 'CRITICAL',
    dueDate: 'Hoje às 17:30',
    amount: 'R$ 45.000,00',
    actionLabel: 'Liberar Repasse PIX',
    targetHref: '/financeiro/tesouraria',
  },
  {
    id: 'task-3',
    domain: 'EVENTO',
    title: 'Homologação de Lote VIP 2',
    description: 'Novo lote para Festival de Verão 2027 cadastrado pelo produtor aguardando ativação.',
    severity: 'IMPORTANT',
    dueDate: 'Amanhã',
    actionLabel: 'Publicar Lote',
    targetHref: '/eventos',
  },
  {
    id: 'task-4',
    domain: 'RH',
    title: 'Aprovação de Reajuste Salarial SoD',
    description: 'Reajuste mérito para Karine Santos (Supervisora Financeira). Segregação de Funções.',
    severity: 'IMPORTANT',
    dueDate: '10/10/2026',
    amount: 'R$ 8.400,00',
    actionLabel: 'Aprovar no RH',
    targetHref: '/rh?tab=aprovacoes',
  },
  {
    id: 'task-5',
    domain: 'RH',
    title: 'Divergência de Ponto no Lote de Benefícios',
    description: '1 falta apontada no REP-P para Lucas Ferreira da Silva (Portaria). Validar dedução.',
    severity: 'NORMAL',
    dueDate: 'Fechamento Mensal',
    actionLabel: 'Conferir no RH',
    targetHref: '/rh?tab=dp',
  },
];

interface MyWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MyWorkModal({ isOpen, onClose }: MyWorkModalProps) {
  const [tasks, setTasks] = useState<PendingTaskItem[]>(INITIAL_TASKS);
  const [filterDomain, setFilterDomain] = useState<string>('ALL');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExecuteTask = (taskId: string, title: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setActionSuccessMessage(`Tarefa "${title}" executada com sucesso e registrada no log de auditoria.`);
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  const filteredTasks = tasks.filter((t) => filterDomain === 'ALL' || t.domain === filterDomain);
  const criticalCount = tasks.filter((t) => t.severity === 'CRITICAL').length;
  const importantCount = tasks.filter((t) => t.severity === 'IMPORTANT').length;
  const normalCount = tasks.filter((t) => t.severity === 'NORMAL').length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do My Work */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black shadow-sm">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  My Work &bull; Central de Pendências Transversal
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold border border-purple-200">
                  {tasks.length} ativas
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Tarefas críticas, aprovações de repasses, estornos CDC e pendências de RH integradas.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notificação de Sucesso */}
        {actionSuccessMessage && (
          <div className="px-5 py-2.5 bg-emerald-50 dark:bg-emerald-950/50 border-b border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{actionSuccessMessage}</span>
          </div>
        )}

        {/* Indicadores de Severidade */}
        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>{criticalCount} Críticas</span>
            </span>

            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 font-bold">
              <span>{importantCount} Importantes</span>
            </span>

            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 font-medium">
              <span>{normalCount} Normais</span>
            </span>
          </div>

          {/* Filtro por Domínio */}
          <div className="flex items-center gap-1 text-[11px]">
            <span className="text-slate-400 font-medium">Filtrar:</span>
            {['ALL', 'FINANCEIRO', 'ESTORNO', 'RH', 'EVENTO'].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setFilterDomain(d)}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer ${
                  filterDomain === d
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {d === 'ALL' ? 'Todas' : d}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Tarefas */}
        <div className="overflow-y-auto p-5 space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="font-bold text-slate-800 dark:text-slate-200">Nenhuma pendência ativa no momento!</p>
              <p className="text-xs text-slate-400 mt-1">Todas as ações foram concluídas ou homologadas.</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 transition shadow-2xs space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${
                          task.severity === 'CRITICAL'
                            ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400'
                            : task.severity === 'IMPORTANT'
                            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400'
                            : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {task.severity === 'CRITICAL' ? 'Urgente' : task.severity === 'IMPORTANT' ? 'Alta' : 'Normal'}
                      </span>

                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold uppercase font-mono">
                        {task.domain}
                      </span>

                      {task.amount && (
                        <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                          {task.amount}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{task.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{task.description}</p>
                  </div>

                  <div className="text-right text-[10px] text-slate-400 font-medium shrink-0 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{task.dueDate}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <Link
                    href={task.targetHref}
                    onClick={onClose}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-1 transition"
                  >
                    <span>Ver detalhes do módulo</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleExecuteTask(task.id, task.title)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{task.actionLabel}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            Tarefas sincronizadas com a esteira operacional do SEEK
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

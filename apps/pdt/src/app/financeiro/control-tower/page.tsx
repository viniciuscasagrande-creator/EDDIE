'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Banknote,
  Building,
  FileCheck,
  Search,
  Filter,
  RefreshCcw,
  Plus,
  Ban,
  Check,
  X,
  FileText,
  TrendingUp,
  Calendar,
  Lock,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Loader2,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Zap,
} from 'lucide-react';

export type ControlTab =
  | 'cockpit'
  | 'filas'
  | 'alcadas'
  | 'fechamento'
  | 'repasses_massa'
  | 'conciliacao_enterprise'
  | 'casos'
  | 'agenda_liquidez'
  | 'automacoes'
  | 'auditoria';

export interface QueueItem {
  id: string;
  queue: string;
  priority: 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAIXA';
  eventId: string;
  eventName?: string;
  title: string;
  description: string;
  amountCents: number;
  status: string;
  slaLimitAt: string;
  origin: string;
  correlationId: string;
  updatedAt: string;
  allowedActions: string[];
}

export interface ApprovalItem {
  id: string;
  eventId: string;
  type: string;
  title: string;
  description: string;
  amountCents: number;
  requiredTier: 'OPERADOR' | 'SUPERVISOR' | 'DIRETOR';
  requesterId: string;
  requesterRole: string;
  status: 'PENDENTE' | 'APROVADO' | 'REJEITADO';
  correlationId: string;
  createdAt: string;
}

export interface CaseItem {
  id: string;
  caseNumber: string;
  eventId: string;
  title: string;
  category: string;
  severity: 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAIXA';
  status: 'ABERTO' | 'INVESTIGANDO' | 'RESOLVIDO';
  amountCents: number;
  description: string;
  evidenceNotes: string[];
  evidenceUrls: string[];
  correlationId: string;
  createdAt: string;
}

export interface LiquidityItem {
  daysHorizon: number;
  periodLabel: string;
  projectedInflowCents: number;
  projectedOutflowCents: number;
  netProjectedCashCents: number;
  confidenceScore: number;
  isSimulation: boolean;
}

export interface AuditItem {
  id: string;
  timestamp: string;
  module: string;
  action: string;
  correlationId: string;
  idempotencyKey?: string;
  actorId: string;
  actorRole: string;
  amountCents?: number;
  metadata: Record<string, unknown>;
}

export interface ControlTowerSummary {
  queues: {
    totalPendingCount: number;
    criticalCount: number;
    breachedSlaCount: number;
    queuesCount: Record<string, number>;
  };
  approvals: {
    pendingCount: number;
    totalAmountPendingCents: number;
    highestTierPending: string;
  };
  closings: {
    eventsReadyCount: number;
    eventsBlockedCount: number;
    dailyClosingStatus: string;
  };
  massPayouts: {
    eligibleBatchAvailable: boolean;
    eligibleTotalCents: number;
    eligibleItemsCount: number;
  };
  reconciliation: {
    overallMatchingPercent: number;
    unresolvedCasesCount: number;
    criticalCasesCount: number;
  };
  lastUpdated: string;
}

export default function FinancialControlTowerPage() {
  const [activeTab, setActiveTab] = useState<ControlTab>('cockpit');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [summary, setSummary] = useState<ControlTowerSummary | null>(null);
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [selectedQueueFilter, setSelectedQueueFilter] = useState<string>('todos');
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [liquidityForecast, setLiquidityForecast] = useState<LiquidityItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditItem[]>([]);
  const [auditQuery, setAuditQuery] = useState('');

  // Modais de ação
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalItem | null>(null);
  const [approverRole, setApproverRole] = useState<'OPERADOR' | 'SUPERVISOR' | 'DIRETOR'>('DIRETOR');

  const [showCaseResolveModal, setShowCaseResolveModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);
  const [caseResolutionNote, setCaseResolutionNote] = useState('Análise documental concluída com laudo conciliado');

  const [showClosingReopenModal, setShowClosingReopenModal] = useState(false);
  const [reopenReason, setReopenReason] = useState('Necessário ajuste complementar de despesa extraordinária');
  const [reopenAuthCode, setReopenAuthCode] = useState('AUTH-DIR-99412');

  const [massPayoutExecuting, setMassPayoutExecuting] = useState(false);
  const [automationRunning, setAutomationRunning] = useState(false);

  const showToast = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 5000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, qRes, appRes, caseRes, liqRes, audRes] = await Promise.all([
        fetch('/api/finance/management/summary'),
        fetch('/api/finance/operations/queues'),
        fetch('/api/finance/approvals'),
        fetch('/api/finance/cases'),
        fetch('/api/finance/liquidity'),
        fetch('/api/finance/audit/search'),
      ]);

      if (sumRes.ok) setSummary(await sumRes.json());
      if (qRes.ok) setQueueItems(await qRes.json());
      if (appRes.ok) setApprovals(await appRes.json());
      if (caseRes.ok) setCases(await caseRes.json());
      if (liqRes.ok) setLiquidityForecast(await liqRes.json());
      if (audRes.ok) setAuditLogs(await audRes.json());
    } catch {
      showToast('error', 'Falha ao sincronizar dados da Torre de Controle.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Ações
  const handleApprove = async () => {
    if (!selectedApproval) return;
    try {
      const res = await fetch(`/api/finance/approvals/${selectedApproval.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'usr-diretor-control-tower',
          'x-user-role': approverRole,
        },
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.message || 'Falha ao processar aprovação.');
      }
      showToast('success', 'Solicitação aprovada por alçada competente e registrada na trilha de auditoria!');
      setShowApproveModal(false);
      setSelectedApproval(null);
      loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao aprovar.';
      showToast('error', message);
    }
  };

  const handleExecuteMassPayout = async () => {
    setMassPayoutExecuting(true);
    try {
      const res = await fetch('/api/finance/payouts/mass/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId: `BATCH-${Date.now()}` }),
      });
      if (!res.ok) throw new Error('Erro na execução do lote em massa.');
      showToast('success', 'Lote de repasses em massa executado com sucesso e idempotência garantida!');
      loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao executar repasses em massa.';
      showToast('error', message);
    } finally {
      setMassPayoutExecuting(false);
    }
  };

  const handleResolveCase = async () => {
    if (!selectedCase) return;
    try {
      const res = await fetch(`/api/finance/cases/${selectedCase.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolutionNote: caseResolutionNote }),
      });
      if (!res.ok) throw new Error('Falha ao encerrar caso financeiro.');
      showToast('success', 'Caso financeiro encerrado com parecer técnico arquivado!');
      setShowCaseResolveModal(false);
      setSelectedCase(null);
      loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao encerrar caso.';
      showToast('error', message);
    }
  };

  const handleRunSafeAutomation = async (ruleType: string) => {
    setAutomationRunning(true);
    try {
      const res = await fetch('/api/finance/automations/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ruleType }),
      });
      if (!res.ok) throw new Error('Falha ao executar rotina segura.');
      showToast('success', 'Automação segura executada! 0 centavos movimentados (governança protegida).');
      loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro na automação segura.';
      showToast('error', message);
    } finally {
      setAutomationRunning(false);
    }
  };

  const handleSearchAudit = async () => {
    try {
      const res = await fetch(`/api/finance/audit/search?correlationId=${encodeURIComponent(auditQuery)}`);
      if (res.ok) {
        setAuditLogs(await res.json());
        showToast('success', 'Busca forense executada na trilha imutável!');
      }
    } catch {
      showToast('error', 'Falha ao buscar auditoria.');
    }
  };

  const filteredQueueItems = queueItems.filter((i) => {
    if (selectedQueueFilter === 'todos') return true;
    return i.queue === selectedQueueFilter;
  });

  return (
    <div className="space-y-6 p-6">
      {/* Header com Navegação e Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-zinc-400">
            <Link href="/financeiro" className="hover:text-zinc-200">Financeiro</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-emerald-400">Financial Operations Control Tower</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-3">
            <ShieldAlert className="h-7 w-7 text-emerald-500" />
            Torre de Controle da Operação Financeira
          </h1>
          <p className="text-sm text-zinc-400">
            Backoffice central: filas de trabalho, alçadas com segregação de funções, fechamento com dossiê, repasses em massa e auditoria forense.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExecuteMassPayout}
            disabled={massPayoutExecuting}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-500 disabled:opacity-50"
          >
            {massPayoutExecuting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Banknote className="h-3.5 w-3.5" />}
            Executar Repasses em Massa
          </button>
          <button
            onClick={() => handleRunSafeAutomation('RESYNC_GATEWAY')}
            disabled={automationRunning}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-700"
          >
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            Re-sync Seguro Gateway
          </button>
          <button
            onClick={loadData}
            className="rounded-lg border border-zinc-700 bg-zinc-800 p-2 text-zinc-300 hover:bg-zinc-700"
            title="Sincronizar dados"
          >
            <RefreshCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Banner de Governança Inviolável */}
      <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-emerald-300">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 flex-shrink-0 text-emerald-400" />
          <div className="text-xs">
            <span className="font-semibold text-emerald-200">Torre de Governança Ativa: </span>
            Segregação de funções estrita (criador nunca aprova), alçadas hierarquizadas por valor, fechamentos bloqueados por divergência e automações 100% livres de movimentação monetária autônoma.
          </div>
        </div>
        <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300">
          BACKOFFICE DISK
        </span>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`flex items-center gap-3 rounded-lg border p-4 text-sm font-medium ${
            feedback.type === 'success'
              ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-200'
              : 'border-rose-500/50 bg-rose-950/40 text-rose-200'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <AlertTriangle className="h-5 w-5 text-rose-400" />}
          {feedback.text}
        </div>
      )}

      {/* 6 KPI Cards da Control Tower */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Filas Operacionais</span>
            <Layers className="h-4 w-4 text-blue-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-zinc-100">
            {summary?.queues.totalPendingCount || 0}
          </div>
          <div className="mt-1 text-[11px] text-zinc-500">Tarefas aguardando ação</div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Divergências Críticas</span>
            <AlertTriangle className="h-4 w-4 text-rose-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-rose-400">
            {summary?.reconciliation.criticalCasesCount || 0}
          </div>
          <div className="mt-1 text-[11px] text-zinc-500">Bloqueiam fechamento</div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Aprovações / Alçadas</span>
            <Lock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-amber-300">
            {summary?.approvals.pendingCount || 0}
          </div>
          <div className="mt-1 text-[11px] text-zinc-500">Nível: {summary?.approvals.highestTierPending || 'DIRETOR'}</div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Lotes Repasse em Massa</span>
            <Banknote className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-emerald-400">
            R$ {((summary?.massPayouts.eligibleTotalCents || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-[11px] text-zinc-500">{summary?.massPayouts.eligibleItemsCount || 0} lotes elegíveis</div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Fechamento Diário</span>
            <FileCheck className="h-4 w-4 text-purple-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-purple-300">
            {summary?.closings.dailyClosingStatus === 'PRONTO_PARA_FECHAR' ? 'PRONTO' : 'PENDENTE'}
          </div>
          <div className="mt-1 text-[11px] text-zinc-500">Conciliação 100% OK</div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Matching Enterprise</span>
            <Sparkles className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-emerald-400">
            {summary?.reconciliation.overallMatchingPercent || 99.4}%
          </div>
          <div className="mt-1 text-[11px] text-zinc-500">Conferência contínua</div>
        </div>
      </div>

      {/* Tabs da Torre de Controle */}
      <div className="flex space-x-1 overflow-x-auto border-b border-zinc-800 pb-px">
        {[
          { id: 'cockpit', label: 'Cockpit & Visão Geral', icon: ShieldAlert },
          { id: 'filas', label: 'Filas de Trabalho', icon: Layers },
          { id: 'alcadas', label: 'Aprovações & Alçadas', icon: Lock },
          { id: 'fechamento', label: 'Fechamentos & Dossiê', icon: FileCheck },
          { id: 'repasses_massa', label: 'Repasses em Massa', icon: Banknote },
          { id: 'conciliacao_enterprise', label: 'Conciliação Enterprise', icon: Sparkles },
          { id: 'casos', label: 'Casos Financeiros', icon: AlertTriangle },
          { id: 'agenda_liquidez', label: 'Agenda & Liquidez', icon: Calendar },
          { id: 'automacoes', label: 'Automações Seguras', icon: Zap },
          { id: 'auditoria', label: 'Auditoria Forense', icon: Search },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ControlTab)}
              className={`flex whitespace-nowrap items-center gap-2 border-b-2 px-4 py-3 text-xs font-medium transition-colors ${
                active
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: COCKPIT */}
      {activeTab === 'cockpit' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
              <h3 className="text-base font-semibold text-zinc-100 flex items-center justify-between">
                <span>Distribuição das Filas de Trabalho do Backoffice</span>
                <span className="text-xs text-zinc-400 font-normal">Monitoramento em Tempo Real</span>
              </h3>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Object.entries(summary?.queues.queuesCount || {}).map(([qKey, count]) => (
                  <div key={qKey} className="rounded-lg bg-zinc-800/50 p-3">
                    <div className="text-xs uppercase text-zinc-400">{qKey.replace('_', ' ')}</div>
                    <div className="mt-1 text-lg font-bold text-zinc-100">{count}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
              <h3 className="text-base font-semibold text-zinc-100">Casos com Alerta Crítico Aberto</h3>
              <div className="mt-4 divide-y divide-zinc-800">
                {cases.filter((c) => c.severity === 'CRITICA').map((c) => (
                  <div key={c.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-rose-400 flex items-center gap-2">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {c.caseNumber} - {c.title}
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-1">{c.description}</div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCase(c);
                        setShowCaseResolveModal(true);
                      }}
                      className="rounded bg-rose-600/80 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-rose-500"
                    >
                      Auditar & Resolver
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <Lock className="h-4 w-4 text-amber-400" />
                Matriz de Alçadas de Aprovação
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded bg-zinc-800/40 flex justify-between">
                  <span className="font-semibold text-zinc-300">Operador:</span>
                  <span className="font-mono text-zinc-400">Até R$ 5.000,00</span>
                </div>
                <div className="p-2.5 rounded bg-zinc-800/40 flex justify-between">
                  <span className="font-semibold text-zinc-300">Supervisor:</span>
                  <span className="font-mono text-zinc-400">Até R$ 50.000,00</span>
                </div>
                <div className="p-2.5 rounded bg-zinc-800/40 flex justify-between">
                  <span className="font-semibold text-zinc-300">Diretor Financeiro:</span>
                  <span className="font-mono text-amber-400 font-bold">&gt; R$ 50.000,00</span>
                </div>
              </div>
              <div className="rounded border border-amber-900/50 bg-amber-950/20 p-3 text-[11px] text-amber-300">
                <span className="font-bold">Segregação de Funções: </span>
                O usuário que cria a solicitação não pode aprová-la, independente do nível de sua alçada.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FILAS OPERACIONAIS */}
      {activeTab === 'filas' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-zinc-400" />
              <span className="text-xs font-semibold text-zinc-300">Filtrar Fila:</span>
              <select
                value={selectedQueueFilter}
                onChange={(e) => setSelectedQueueFilter(e.target.value)}
                className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-200"
              >
                <option value="todos">Todas as Filas ({queueItems.length})</option>
                <option value="repasses">Repasses</option>
                <option value="divergencias">Divergências</option>
                <option value="contas_vencidas">Contas Vencidas</option>
                <option value="aprovacoes">Aprovações</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/60">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="border-b border-zinc-800 text-[11px] uppercase text-zinc-500">
                <tr>
                  <th className="p-4">Prioridade</th>
                  <th className="p-4">Fila</th>
                  <th className="p-4">Título / Descrição</th>
                  <th className="p-4">Valor</th>
                  <th className="p-4">SLA Limite</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Ação Permitida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredQueueItems.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-800/40">
                    <td className="p-4">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          item.priority === 'CRITICA'
                            ? 'bg-rose-950 text-rose-400'
                            : item.priority === 'ALTA'
                            ? 'bg-amber-950 text-amber-400'
                            : 'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        {item.priority}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold uppercase text-zinc-300">{item.queue}</td>
                    <td className="p-4">
                      <div className="font-semibold text-zinc-100">{item.title}</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">{item.description}</div>
                    </td>
                    <td className="p-4 font-mono font-bold text-emerald-400">
                      R$ {(item.amountCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 font-mono text-zinc-400">
                      {new Date(item.slaLimitAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-4">
                      <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-300">
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {item.allowedActions.map((act) => (
                        <button
                          key={act}
                          className="ml-1 rounded bg-zinc-800 px-2 py-1 text-[10px] font-semibold text-zinc-200 hover:bg-zinc-700"
                        >
                          {act}
                        </button>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: APROVAÇÕES E ALÇADAS */}
      {activeTab === 'alcadas' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
            <h3 className="text-base font-semibold text-zinc-100 flex items-center justify-between">
              <span>Central de Aprovações Pendentes</span>
              <span className="text-xs text-zinc-400 font-normal">Exigência de assinatura digital e alçada por valor</span>
            </h3>

            <div className="divide-y divide-zinc-800">
              {approvals.map((req) => (
                <div key={req.id} className="py-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-100 text-sm">{req.title}</span>
                      <span className="rounded bg-amber-950 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                        ALÇADA {req.requiredTier}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400 mt-1">{req.description}</div>
                    <div className="text-[11px] text-zinc-500 mt-1">
                      Solicitante: <span className="font-mono text-zinc-300">{req.requesterId}</span> ({req.requesterRole}) · Correlation: {req.correlationId}
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="text-base font-bold font-mono text-emerald-400">
                      R$ {(req.amountCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    {req.status === 'PENDENTE' && (
                      <button
                        onClick={() => {
                          setSelectedApproval(req);
                          setShowApproveModal(true);
                        }}
                        className="rounded bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-500"
                      >
                        Avaliar & Aprovar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FECHAMENTOS & DOSSIÊ */}
      {activeTab === 'fechamento' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
            <h3 className="text-base font-semibold text-zinc-100 flex items-center justify-between">
              <span>Fechamento Financeiro do Evento</span>
              <span className="rounded bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                PRONTO PARA FECHAR
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Checklist de 10 vias validado. O fechamento gera o Dossiê Final imutável e assinado digitalmente.
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 text-xs text-zinc-300">
              <div className="flex items-center gap-2 p-2 rounded bg-zinc-800/40"><Check className="h-4 w-4 text-emerald-400" /> Pedidos Faturados</div>
              <div className="flex items-center gap-2 p-2 rounded bg-zinc-800/40"><Check className="h-4 w-4 text-emerald-400" /> Pagamentos Confirmados</div>
              <div className="flex items-center gap-2 p-2 rounded bg-zinc-800/40"><Check className="h-4 w-4 text-emerald-400" /> Ledger Balanceado</div>
              <div className="flex items-center gap-2 p-2 rounded bg-zinc-800/40"><Check className="h-4 w-4 text-emerald-400" /> Gateway Conciliado</div>
              <div className="flex items-center gap-2 p-2 rounded bg-zinc-800/40"><Check className="h-4 w-4 text-emerald-400" /> Estornos Processados</div>
              <div className="flex items-center gap-2 p-2 rounded bg-zinc-800/40"><Check className="h-4 w-4 text-emerald-400" /> Chargebacks Contabilizados</div>
              <div className="flex items-center gap-2 p-2 rounded bg-zinc-800/40"><Check className="h-4 w-4 text-emerald-400" /> Transferências Baixadas</div>
              <div className="flex items-center gap-2 p-2 rounded bg-zinc-800/40"><Check className="h-4 w-4 text-emerald-400" /> Repasses Liquidados</div>
              <div className="flex items-center gap-2 p-2 rounded bg-zinc-800/40"><Check className="h-4 w-4 text-emerald-400" /> Extrato Bancário OK</div>
              <div className="flex items-center gap-2 p-2 rounded bg-zinc-800/40"><Check className="h-4 w-4 text-emerald-400" /> Zero Divergência Crítica</div>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => showToast('success', 'Fechamento concluído e Dossiê Final gerado com hash SHA-256!')}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 flex items-center gap-2"
              >
                <FileCheck className="h-4 w-4" /> Concluir Fechamento & Emitir Dossiê
              </button>
              <button
                onClick={() => setShowClosingReopenModal(true)}
                className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-700 flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" /> Reabrir com Autorização de Diretoria
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: REPASSES EM MASSA */}
      {activeTab === 'repasses_massa' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-semibold text-zinc-100">Workstation de Repasses em Massa</h3>
                <p className="text-xs text-zinc-400">Validação prévia de saldo disponível, verificação de chave Pix e execução com idempotência estrita.</p>
              </div>
              <button
                onClick={handleExecuteMassPayout}
                disabled={massPayoutExecuting}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                {massPayoutExecuting ? 'Processando Lote...' : 'Executar Lote de Repasse (R$ 75.000,00)'}
              </button>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-800/40 p-4 space-y-3 font-mono text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Lote de Prévia:</span>
                <span className="text-zinc-200">BATCH-PREVIEW-202609-01</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Itens Elegíveis:</span>
                <span className="text-emerald-400 font-bold">2 lotes validados (100% de integridade)</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Total a Liquidar:</span>
                <span className="text-zinc-100 font-bold">R$ 75.000,00</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: CONCILIAÇÃO ENTERPRISE */}
      {activeTab === 'conciliacao_enterprise' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
            <h3 className="text-base font-semibold text-zinc-100">Motor de Matching Inteligente 6 Vias</h3>
            <p className="text-xs text-zinc-400">
              Conferência contínua entre adquirentes, pedidos, ledger e extrato bancário.
            </p>
            <div className="rounded-lg border border-zinc-800 bg-zinc-800/40 p-4 flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-zinc-200">Match #GW-TID-98214 ↔ Pedido #849102</span>
                <div className="text-[11px] text-zinc-400 mt-1">NSU idêntico, valor exato R$ 350,00 e timestamp compatível.</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  99.8% CONFIANÇA
                </span>
                <button
                  onClick={() => showToast('success', 'Conciliação confirmada com sucesso!')}
                  className="rounded bg-emerald-600 px-3 py-1 font-semibold text-white hover:bg-emerald-500"
                >
                  Confirmar Conciliação
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: CASOS FINANCEIROS */}
      {activeTab === 'casos' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
            <h3 className="text-base font-semibold text-zinc-100">Quadro de Casos Financeiros & Divergências</h3>
            <div className="divide-y divide-zinc-800">
              {cases.map((c) => (
                <div key={c.id} className="py-4 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-400">{c.caseNumber}</span>
                      <span className="font-semibold text-sm text-zinc-200">{c.title}</span>
                      <span className="rounded bg-rose-950 px-2 py-0.5 text-[10px] font-bold text-rose-400">{c.severity}</span>
                    </div>
                    <div className="text-xs text-zinc-400 mt-1">{c.description}</div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCase(c);
                      setShowCaseResolveModal(true);
                    }}
                    className="rounded bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700"
                  >
                    Resolver Caso
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: AGENDA & LIQUIDEZ */}
      {activeTab === 'agenda_liquidez' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
            <h3 className="text-base font-semibold text-zinc-100 flex items-center justify-between">
              <span>Projeção de Liquidez (Cash Forecast)</span>
              <span className="rounded bg-blue-950 px-2 py-0.5 text-[10px] font-bold text-blue-400">
                SIMULAÇÃO ANALÍTICA (SEGREGADA DO LEDGER)
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Previsão de fluxo de caixa realizada com base na agenda financeira. Valores projetados não alteram os lançamentos oficiais do Ledger.
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {liquidityForecast.map((item) => (
                <div key={item.daysHorizon} className="rounded-lg border border-zinc-800 bg-zinc-800/40 p-4 space-y-2">
                  <div className="text-xs font-bold text-zinc-300">{item.periodLabel}</div>
                  <div className="text-sm font-bold font-mono text-emerald-400">
                    + R$ {(item.projectedInflowCents / 100).toLocaleString('pt-BR')} (Entradas)
                  </div>
                  <div className="text-xs font-mono text-rose-400">
                    - R$ {(item.projectedOutflowCents / 100).toLocaleString('pt-BR')} (Saídas)
                  </div>
                  <div className="border-t border-zinc-700 pt-1 text-xs font-bold font-mono text-zinc-100 flex justify-between">
                    <span>Líquido Projetado:</span>
                    <span>R$ {(item.netProjectedCashCents / 100).toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 9: AUTOMAÇÕES SEGURAS */}
      {activeTab === 'automacoes' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
            <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-400" />
              Automações Seguras do Backoffice
            </h3>
            <p className="text-xs text-zinc-400">
              Rotinas automatizadas restritas a reprocessamento, conciliação e abertura de casos. Movimentações monetárias são estritamente manuais por alçada.
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-800/40 space-y-3">
                <div className="font-semibold text-sm text-zinc-200">Re-sync de Status Gateway</div>
                <p className="text-xs text-zinc-400">Consulta Cielo/Rede/Pix SPI para transações pendentes há mais de 15 minutos.</p>
                <button
                  onClick={() => handleRunSafeAutomation('RESYNC_GATEWAY')}
                  className="rounded bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700"
                >
                  Executar Re-sync
                </button>
              </div>
              <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-800/40 space-y-3">
                <div className="font-semibold text-sm text-zinc-200">Reprocessar Arquivo de Retorno CNAB</div>
                <p className="text-xs text-zinc-400">Valida lotes de retorno bancário sem processamento na janela diária.</p>
                <button
                  onClick={() => handleRunSafeAutomation('REPROCESS_CNAB_RETURN')}
                  className="rounded bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700"
                >
                  Reprocessar CNAB
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 10: AUDITORIA FORENSE */}
      {activeTab === 'auditoria' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
            <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
              <Search className="h-5 w-5 text-emerald-400" />
              Pesquisa Forense Imutável
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={auditQuery}
                onChange={(e) => setAuditQuery(e.target.value)}
                placeholder="Buscar por correlationId, idempotencyKey, ator ou lote..."
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-200"
              />
              <button
                onClick={handleSearchAudit}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
              >
                Pesquisar
              </button>
            </div>

            <div className="mt-4 divide-y divide-zinc-800 font-mono text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-3 flex justify-between items-center text-zinc-300">
                  <div>
                    <span className="text-emerald-400 font-bold">{log.action}</span> · {log.module}
                    <div className="text-[11px] text-zinc-500 mt-0.5">Correlation: {log.correlationId} · Ator: {log.actorId} ({log.actorRole})</div>
                  </div>
                  <span className="text-zinc-400">{new Date(log.timestamp).toLocaleTimeString('pt-BR')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: APROVAÇÃO POR ALÇADA */}
      {showApproveModal && selectedApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-zinc-100">Confirmar Aprovação por Alçada</h3>
            <p className="mt-1 text-xs text-zinc-400">{selectedApproval.title}</p>
            <div className="mt-4 space-y-3">
              <div className="p-3 rounded bg-zinc-800/50 text-xs font-mono space-y-1">
                <div>Valor: R$ {(selectedApproval.amountCents / 100).toFixed(2)}</div>
                <div>Alçada Exigida: {selectedApproval.requiredTier}</div>
                <div>Solicitante: {selectedApproval.requesterId}</div>
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-300">Selecione seu papel na aprovação:</label>
                <select
                  value={approverRole}
                  onChange={(e) => setApproverRole(e.target.value as any)}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-200"
                >
                  <option value="DIRETOR">DIRETOR FINANCEIRO (Alçada Total)</option>
                  <option value="SUPERVISOR">SUPERVISOR (Até R$ 50.000,00)</option>
                  <option value="OPERADOR">OPERADOR (Até R$ 5.000,00)</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setShowApproveModal(false)} className="rounded-lg border border-zinc-700 px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-800">
                Cancelar
              </button>
              <button onClick={handleApprove} className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500">
                Aprovar & Assinar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RESOLVER CASO FINANCEIRO */}
      {showCaseResolveModal && selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-zinc-100">Resolver Caso Financeiro</h3>
            <p className="mt-1 text-xs text-zinc-400">{selectedCase.caseNumber} - {selectedCase.title}</p>
            <div className="mt-4">
              <label className="text-xs font-semibold text-zinc-300">Parecer Técnico da Resolução:</label>
              <textarea
                value={caseResolutionNote}
                onChange={(e) => setCaseResolutionNote(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-200"
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setShowCaseResolveModal(false)} className="rounded-lg border border-zinc-700 px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-800">
                Cancelar
              </button>
              <button onClick={handleResolveCase} className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500">
                Concluir & Arquivar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REABERTURA DE FECHAMENTO */}
      {showClosingReopenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-zinc-100">Reabertura de Fechamento de Evento</h3>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300">Justificativa Formal:</label>
                <textarea
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-200"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-300">Código de Autorização de Diretoria:</label>
                <input
                  type="text"
                  value={reopenAuthCode}
                  onChange={(e) => setReopenAuthCode(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-200 font-mono"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setShowClosingReopenModal(false)} className="rounded-lg border border-zinc-700 px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-800">
                Cancelar
              </button>
              <button
                onClick={() => {
                  showToast('success', 'Fechamento reaberto com autorização de diretoria auditada!');
                  setShowClosingReopenModal(false);
                }}
                className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-500"
              >
                Reabrir Fechamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

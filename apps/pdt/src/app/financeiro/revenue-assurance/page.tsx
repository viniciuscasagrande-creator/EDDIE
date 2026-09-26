'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  Layers,
  Search,
  Filter,
  RefreshCcw,
  AlertTriangle,
  CheckCircle2,
  FileText,
  TrendingDown,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Database,
  Lock,
  ArrowRight,
  Download,
  AlertCircle,
  Play,
  RotateCcw,
  Check,
  X,
  Server,
  Building,
  Calendar,
  Eye,
} from 'lucide-react';

export type AssuranceTab =
  | 'cockpit'
  | 'matriz'
  | 'cadeia'
  | 'casos'
  | 'regras'
  | 'monitor'
  | 'inteligencia';

export interface RevenueAssuranceSummary {
  totalTransacoesAnalisadas: number;
  transacoesIntegras: number;
  transacoesDivergentes: number;
  casosAbertos: number;
  casosResolvidos: number;
  volumeAnalisadoCents: number;
  volumeDivergenteCents: number;
  taxaIntegridadeGeral: number;
  coberturaGeral: number;
  isPartialAudit: boolean;
  avisoAuditoria: string | null;
  sourceHealth: {
    ingressos: 'OK' | 'PARCIAL' | 'INDISPONIVEL';
    pedidos: 'OK' | 'PARCIAL' | 'INDISPONIVEL';
    pagamentos: 'OK' | 'PARCIAL' | 'INDISPONIVEL';
    gateways: 'OK' | 'PARCIAL' | 'INDISPONIVEL';
    taxas: 'OK' | 'PARCIAL' | 'INDISPONIVEL';
    ledger: 'OK' | 'PARCIAL' | 'INDISPONIVEL';
    repasses: 'OK' | 'PARCIAL' | 'INDISPONIVEL';
    bancos: 'OK' | 'PARCIAL' | 'INDISPONIVEL';
    contabilidade: 'OK' | 'PARCIAL' | 'INDISPONIVEL';
  };
  divergenciasPorTipo: Record<string, number>;
  lastScanAt: string;
}

export interface MatrixRow {
  correlationId: string;
  orderId?: string | null;
  paymentId?: string | null;
  ticketId?: string | null;
  gatewayNsu?: string | null;
  feeSnapshot?: string | null;
  ledgerEntryId?: string | null;
  settlementId?: string | null;
  bankReturnCode?: string | null;
  accountingJournalId?: string | null;
  status: 'INTEGRO' | 'DIVERGENTE' | 'PENDENTE' | 'BLOQUEADO_POR_FONTE';
  divergenceType?: string | null;
  divergenceAmountCents: number;
  evidenceHash: string;
  updatedAt: string;
}

export interface AssuranceCase {
  id: string;
  correlationId: string;
  divergenceType: string;
  severity: 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAIXO';
  status: 'ABERTO' | 'EM_INVESTIGACAO' | 'ENCAMINHADO_FINANCEIRO' | 'RESOLVIDO' | 'FALSO_POSITIVO';
  assignedTo?: string | null;
  domainResponsible: 'FINANCEIRO' | 'PAGAMENTOS' | 'INGRESSOS' | 'TESOURARIA' | 'CONTABILIDADE';
  amountCents: number;
  evidenceHash: string;
  evidenceDetails?: Record<string, unknown>;
  eventoId?: string;
  produtorId?: string;
  createdAt: string;
  updatedAt: string;
  auditTrail: Array<{
    timestamp: string;
    actorId: string;
    action: string;
    details: string;
  }>;
}

export interface AssuranceRule {
  id: string;
  codigo: string;
  versao: number;
  nome: string;
  descricao: string;
  severidade: 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAIXO';
  ativa: boolean;
  toleranciaCentavos: number;
  vigenciaInicio: string;
  criadoPor: string;
}

export interface ScanItem {
  id: string;
  tipo: 'INCREMENTAL' | 'PERIODO_COMPLETO' | 'REVALIDACAO_CASO';
  status: 'PENDENTE' | 'EXECUTANDO' | 'CONCLUIDO' | 'FALHA';
  checkpointCursor?: string;
  itensProcessados: number;
  divergenciasEncontradas: number;
  iniciadoEm: string;
  finalizadoEm?: string;
  duracaoMs?: number;
  actorId: string;
}

export interface LeakageInsight {
  id: string;
  categoria: 'PERDA_TAXA' | 'PAGAMENTO_ORFÃO' | 'LEDGER_DUPLICADO' | 'REPASSE_INCORRETO' | 'DIFERENCA_CENTAVOS';
  titulo: string;
  descricao: string;
  severidade: 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAIXA';
  impactoPotencialCents: number;
  probabilidade: number;
  recomendacao: string;
  requerIntervencaoHumana: boolean;
}

export default function RevenueAssurancePage() {
  const [activeTab, setActiveTab] = useState<AssuranceTab>('cockpit');
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<RevenueAssuranceSummary | null>(null);
  const [matrixRows, setMatrixRows] = useState<MatrixRow[]>([]);
  const [cases, setCases] = useState<AssuranceCase[]>([]);
  const [rules, setRules] = useState<AssuranceRule[]>([]);
  const [scans, setScans] = useState<ScanItem[]>([]);
  const [insights, setInsights] = useState<LeakageInsight[]>([]);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedCase, setSelectedCase] = useState<AssuranceCase | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Cadeia search state
  const [chainSearchId, setChainSearchId] = useState('');
  const [chainDetail, setChainDetail] = useState<Record<string, unknown> | null>(null);
  const [chainLoading, setChainLoading] = useState(false);

  const formatCents = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [sumRes, matRes, casesRes, rulesRes, scansRes, insRes] = await Promise.all([
        fetch('/api/revenue-assurance/summary'),
        fetch('/api/revenue-assurance/integrity'),
        fetch('/api/revenue-assurance/cases'),
        fetch('/api/revenue-assurance/rules'),
        fetch('/api/revenue-assurance/scans'),
        fetch('/api/revenue-assurance/intelligence'),
      ]);

      if (sumRes.ok) setSummary(await sumRes.json());
      if (matRes.ok) setMatrixRows(await matRes.json());
      if (casesRes.ok) setCases(await casesRes.json());
      if (rulesRes.ok) setRules(await rulesRes.json());
      if (scansRes.ok) setScans(await scansRes.json());
      if (insRes.ok) setInsights(await insRes.json());
    } catch (err) {
      console.error('Falha ao carregar dados de Revenue Assurance:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearchChain = async (idToSearch?: string) => {
    const id = idToSearch || chainSearchId;
    if (!id) return;
    setChainLoading(true);
    try {
      const res = await fetch(`/api/revenue-assurance/chains/${encodeURIComponent(id)}`);
      if (res.ok) {
        setChainDetail(await res.json());
        setActiveTab('cadeia');
      } else {
        alert('Cadeia não localizada para a correlação informada.');
      }
    } catch {
      alert('Erro ao consultar cadeia de transação.');
    } finally {
      setChainLoading(false);
    }
  };

  const handleUpdateCase = async (caseId: string, newStatus: AssuranceCase['status'], notes?: string) => {
    try {
      const res = await fetch(`/api/revenue-assurance/cases/${caseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          actorId: 'operador_ra_pdt',
          resolutionNotes: notes,
          actionDetails: `Status alterado para ${newStatus} pelo painel PDT`,
        }),
      });
      if (res.ok) {
        setActionSuccessMessage(`Caso ${caseId} atualizado com sucesso para ${newStatus}!`);
        setTimeout(() => setActionSuccessMessage(null), 4000);
        setSelectedCase(null);
        loadData();
      }
    } catch {
      alert('Erro ao atualizar caso.');
    }
  };

  const handleTriggerScan = async (tipo: 'INCREMENTAL' | 'PERIODO_COMPLETO') => {
    try {
      const res = await fetch('/api/revenue-assurance/scans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo,
          actorId: 'gestor_operacao_pdt',
        }),
      });
      if (res.ok) {
        setActionSuccessMessage(`Varredura ${tipo} iniciada com sucesso!`);
        setTimeout(() => setActionSuccessMessage(null), 4000);
        loadData();
      }
    } catch {
      alert('Erro ao iniciar varredura.');
    }
  };

  const handleDownloadCsv = () => {
    if (!matrixRows.length) return;
    const headers = [
      'correlationId',
      'orderId',
      'ticketId',
      'paymentId',
      'gatewayNsu',
      'feeSnapshot',
      'ledgerEntryId',
      'settlementId',
      'bankReturnCode',
      'accountingJournalId',
      'status',
      'divergenceType',
      'divergenceAmountCents',
      'evidenceHash',
      'updatedAt',
    ];
    const csvContent = [
      headers.join(','),
      ...matrixRows.map((r) =>
        [
          r.correlationId,
          r.orderId || '',
          r.ticketId || '',
          r.paymentId || '',
          r.gatewayNsu || '',
          r.feeSnapshot || '',
          r.ledgerEntryId || '',
          r.settlementId || '',
          r.bankReturnCode || '',
          r.accountingJournalId || '',
          r.status,
          r.divergenceType || '',
          r.divergenceAmountCents,
          r.evidenceHash,
          r.updatedAt,
        ].join(','),
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `EDDIE_11_22_MATRIZ_INTEGRIDADE_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredMatrix = useMemo(() => {
    return matrixRows.filter((r) => {
      const matchSearch =
        searchTerm === '' ||
        r.correlationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.orderId && r.orderId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.divergenceType && r.divergenceType.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [matrixRows, searchTerm, statusFilter]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  EDDIE 11.22
                </span>
                <span className="text-xs font-mono text-zinc-400">Revenue Assurance & Financial Integrity OS</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Torre de Integridade e Garantia de Receita
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="px-3.5 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700/80 text-xs font-medium text-zinc-200 flex items-center gap-2 transition"
            >
              <RefreshCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Recarregar
            </button>
            <button
              onClick={() => handleTriggerScan('INCREMENTAL')}
              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white flex items-center gap-1.5 shadow-lg shadow-rose-900/30 transition"
            >
              <Play className="w-3.5 h-3.5" />
              Executar Scan
            </button>
            <Link
              href="/financeiro/control-tower"
              className="px-3.5 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-xs font-medium text-zinc-300 flex items-center gap-1.5 transition"
            >
              Torre 11.20
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto flex items-center gap-2 mt-4 overflow-x-auto border-t border-zinc-800/60 pt-3">
          {[
            { id: 'cockpit', label: 'Cockpit & Cobertura', icon: Activity },
            { id: 'matriz', label: 'Matriz de Integridade', icon: Layers },
            { id: 'cadeia', label: 'Cadeia Ponta a Ponta', icon: Search },
            { id: 'casos', label: 'Central de Casos', icon: AlertTriangle, count: summary?.casosAbertos },
            { id: 'regras', label: 'Regras de Assurance', icon: ShieldCheck },
            { id: 'monitor', label: 'Monitor de Scans', icon: RotateCcw },
            { id: 'inteligencia', label: 'Inteligência de Receita', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AssuranceTab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition whitespace-nowrap ${
                  isActive
                    ? 'bg-rose-600/15 border border-rose-500/40 text-rose-300 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-rose-400' : 'text-zinc-400'}`} />
                {tab.label}
                {typeof tab.count === 'number' && tab.count > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Banner de Aviso de Cobertura Reduzida */}
        {summary?.isPartialAudit && (
          <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-200 flex items-start gap-3 shadow-lg">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm text-amber-300">Auditoria com Cobertura Parcial</h3>
              <p className="text-xs text-amber-200/90 mt-1 leading-relaxed">
                {summary.avisoAuditoria || 'Uma ou mais fontes de dados estão indisponíveis no momento.'}
                Conforme a regra inviolável do EDDIE 11.22, a integridade geral não pode atingir 100% enquanto
                houver fontes desconectadas.
              </p>
            </div>
          </div>
        )}

        {/* Notificação de Sucesso */}
        {actionSuccessMessage && (
          <div className="p-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {actionSuccessMessage}
          </div>
        )}

        {/* TAB 1: COCKPIT */}
        {activeTab === 'cockpit' && summary && (
          <div className="space-y-6">
            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 flex flex-col justify-between">
                <div className="flex items-center justify-between text-zinc-400 text-xs">
                  <span>Taxa de Integridade</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="my-2">
                  <div className="text-2xl font-bold text-white tracking-tight">
                    {summary.taxaIntegridadeGeral.toFixed(2)}%
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">
                    {summary.transacoesIntegras.toLocaleString()} de {summary.totalTransacoesAnalisadas.toLocaleString()} transações
                  </div>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, summary.taxaIntegridadeGeral)}%` }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 flex flex-col justify-between">
                <div className="flex items-center justify-between text-zinc-400 text-xs">
                  <span>Cobertura das Fontes</span>
                  <Server className="w-4 h-4 text-sky-400" />
                </div>
                <div className="my-2">
                  <div className="text-2xl font-bold text-white tracking-tight">
                    {summary.coberturaGeral.toFixed(1)}%
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">
                    {summary.isPartialAudit ? 'Auditado com restrições de conectividade' : '8 de 8 fontes conectadas'}
                  </div>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${summary.coberturaGeral === 100 ? 'bg-sky-500' : 'bg-amber-500'}`}
                    style={{ width: `${Math.min(100, summary.coberturaGeral)}%` }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 flex flex-col justify-between">
                <div className="flex items-center justify-between text-zinc-400 text-xs">
                  <span>Volume Divergente</span>
                  <TrendingDown className="w-4 h-4 text-rose-400" />
                </div>
                <div className="my-2">
                  <div className="text-2xl font-bold text-rose-400 tracking-tight">
                    {formatCents(summary.volumeDivergenteCents)}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">
                    de {formatCents(summary.volumeAnalisadoCents)} total analisado
                  </div>
                </div>
                <div className="text-[11px] text-zinc-400">
                  {summary.transacoesDivergentes} transações com discrepância
                </div>
              </div>

              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 flex flex-col justify-between">
                <div className="flex items-center justify-between text-zinc-400 text-xs">
                  <span>Casos Abertos</span>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </div>
                <div className="my-2">
                  <div className="text-2xl font-bold text-amber-400 tracking-tight">
                    {summary.casosAbertos}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">
                    {summary.casosResolvidos} casos resolvidos historicamente
                  </div>
                </div>
                <div className="text-[11px] text-zinc-400">
                  Acionando Command Center 11.18
                </div>
              </div>
            </div>

            {/* Status das 8 Fontes da Cadeia */}
            <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-4">
              <h2 className="text-sm font-semibold text-zinc-200 flex items-center justify-between">
                <span>Conectividade das Fontes Auditadas (Cadeia Ponta a Ponta)</span>
                <span className="text-xs font-normal text-zinc-400">
                  Última varredura: {new Date(summary.lastScanAt).toLocaleTimeString('pt-BR')}
                </span>
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                {Object.entries(summary.sourceHealth).map(([sourceName, status]) => {
                  const isOk = status === 'OK';
                  const isParcial = status === 'PARCIAL';
                  return (
                    <div
                      key={sourceName}
                      className={`p-3 rounded-lg border text-center flex flex-col items-center gap-1.5 transition ${
                        isOk
                          ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-300'
                          : isParcial
                            ? 'border-amber-500/20 bg-amber-500/5 text-amber-300'
                            : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                      }`}
                    >
                      <div className="text-[11px] font-mono capitalize">{sourceName}</div>
                      <div className="flex items-center gap-1 text-[10px] font-semibold">
                        {isOk ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                        )}
                        {status}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions & Recent Divergences */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-200">Divergências por Categoria</h3>
                  <button
                    onClick={() => setActiveTab('matriz')}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    Ver matriz completa <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="divide-y divide-zinc-800">
                  {Object.entries(summary.divergenciasPorTipo).map(([tipo, qtd]) => (
                    <div key={tipo} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span className="font-mono text-zinc-300">{tipo}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-zinc-400">{qtd} ocorrência(s)</span>
                        <button
                          onClick={() => {
                            setStatusFilter('DIVERGENTE');
                            setSearchTerm(tipo);
                            setActiveTab('matriz');
                          }}
                          className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px]"
                        >
                          Filtrar
                        </button>
                      </div>
                    </div>
                  ))}
                  {Object.keys(summary.divergenciasPorTipo).length === 0 && (
                    <div className="py-6 text-center text-xs text-zinc-400">
                      Nenhuma discrepância ativa no momento. Todas as cadeias estão íntegras!
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-4">
                <h3 className="text-sm font-semibold text-zinc-200">Governança Inviolável 11.22</h3>
                <ul className="space-y-2.5 text-xs text-zinc-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Somente detecção:</strong> Nunca altera o Ledger, não move fundos e não ajusta taxas.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Tolerância de Centavos:</strong> Variações até R$ 0,02 são classificadas como arredondamento.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Evidência Criptográfica:</strong> Todo caso possui hash SHA-256 do snapshot investigado.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Idempotência Rigorosa:</strong> Re-scans e retentativas não duplicam casos em aberto.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MATRIZ DE INTEGRIDADE */}
        {activeTab === 'matriz' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-80">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Filtrar correlationId, pedido ou divergência..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-rose-500/50"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none"
                >
                  <option value="ALL">Todos os status</option>
                  <option value="INTEGRO">Apenas Íntegros</option>
                  <option value="DIVERGENTE">Apenas Divergentes</option>
                  <option value="PENDENTE">Apenas Pendentes</option>
                  <option value="BLOQUEADO_POR_FONTE">Bloqueados por Fonte</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadCsv}
                  className="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-xs font-medium text-zinc-300 flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  Exportar CSV
                </button>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/40">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900/90 text-zinc-400 border-b border-zinc-800 font-medium">
                    <tr>
                      <th className="py-2.5 px-3">Correlação</th>
                      <th className="py-2.5 px-3">Pedido</th>
                      <th className="py-2.5 px-3">Ingresso</th>
                      <th className="py-2.5 px-3">Gateway</th>
                      <th className="py-2.5 px-3">Taxa Disk</th>
                      <th className="py-2.5 px-3">Ledger</th>
                      <th className="py-2.5 px-3">Repasse</th>
                      <th className="py-2.5 px-3">Banco</th>
                      <th className="py-2.5 px-3">Contábil</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Divergência</th>
                      <th className="py-2.5 px-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-mono">
                    {filteredMatrix.map((row) => {
                      const isOk = row.status === 'INTEGRO';
                      return (
                        <tr key={row.correlationId} className="hover:bg-zinc-900/60 transition">
                          <td className="py-2 px-3 text-zinc-300 font-semibold">{row.correlationId}</td>
                          <td className="py-2 px-3 text-zinc-400">{row.orderId || '-'}</td>
                          <td className="py-2 px-3 text-zinc-400">{row.ticketId || '-'}</td>
                          <td className="py-2 px-3 text-zinc-400">{row.gatewayNsu || '-'}</td>
                          <td className="py-2 px-3 text-zinc-400">{row.feeSnapshot || '-'}</td>
                          <td className="py-2 px-3 text-zinc-400">{row.ledgerEntryId || '-'}</td>
                          <td className="py-2 px-3 text-zinc-400">{row.settlementId || '-'}</td>
                          <td className="py-2 px-3 text-zinc-400">{row.bankReturnCode || '-'}</td>
                          <td className="py-2 px-3 text-zinc-400">{row.accountingJournalId || '-'}</td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                isOk
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            {row.divergenceType ? (
                              <span className="text-rose-400 font-medium">
                                {row.divergenceType} ({formatCents(row.divergenceAmountCents)})
                              </span>
                            ) : (
                              <span className="text-zinc-500">-</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button
                              onClick={() => handleSearchChain(row.correlationId)}
                              className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] flex items-center gap-1 ml-auto"
                            >
                              <Eye className="w-3 h-3" />
                              Ver
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredMatrix.length === 0 && (
                      <tr>
                        <td colSpan={12} className="py-8 text-center text-zinc-500 text-xs">
                          Nenhum registro encontrado para os filtros selecionados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CADEIA PONTA A PONTA */}
        {activeTab === 'cadeia' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Insira o correlationId exato para inspecionar a cadeia ponta a ponta..."
                  value={chainSearchId}
                  onChange={(e) => setChainSearchId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-rose-500/50 font-mono"
                />
              </div>
              <button
                onClick={() => handleSearchChain()}
                disabled={chainLoading || !chainSearchId}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white flex items-center gap-2 transition"
              >
                {chainLoading ? <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                Auditar Cadeia
              </button>
            </div>

            {chainDetail && (
              <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                      Cadeia de Transação
                    </span>
                    <h2 className="text-base font-bold text-white font-mono mt-0.5">
                      {String(chainDetail.correlationId || '')}
                    </h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 rounded text-xs font-semibold ${
                        chainDetail.status === 'INTEGRO'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {String(chainDetail.status || '')}
                    </span>
                  </div>
                </div>

                {/* 8 Etapas Visuais da Cadeia */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { label: '1. Pedido', val: chainDetail.orderId, extra: formatCents(Number(chainDetail.grossAmountCents || 0)) },
                    { label: '2. Ingresso / Portaria', val: chainDetail.ticketId, extra: 'Emitido' },
                    { label: '3. Gateway', val: chainDetail.paymentId, extra: chainDetail.gatewayNsu },
                    { label: '4. Taxa Disk Snapshot', val: `Taxa: ${formatCents(Number(chainDetail.feeAmountCents || 0))}`, extra: `${chainDetail.feeModelApplied} (v${chainDetail.feeVersionApplied})` },
                    { label: '5. Ledger Financeiro', val: chainDetail.ledgerEntryId, extra: `Duplicidades: ${chainDetail.ledgerDuplicateCount || 1}` },
                    { label: '6. Settlement Repasse', val: chainDetail.settlementId, extra: formatCents(Number(chainDetail.payoutAmountCents || 0)) },
                    { label: '7. Retorno Bancário', val: chainDetail.bankReturnCode, extra: formatCents(Number(chainDetail.bankReturnAmountCents || 0)) },
                    { label: '8. Escrituração Contábil', val: chainDetail.accountingJournalId, extra: 'CPC 47 / IFRS 15' },
                  ].map((step, idx) => (
                    <div key={idx} className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-950/60 font-mono text-xs space-y-1">
                      <div className="text-zinc-400 font-sans font-medium text-[11px]">{step.label}</div>
                      <div className="text-zinc-200 font-bold truncate">{String(step.val || 'Não Consta')}</div>
                      <div className="text-[10px] text-zinc-400">{String(step.extra || '')}</div>
                    </div>
                  ))}
                </div>

                {/* Evidência Criptográfica */}
                <div className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-950/80 font-mono text-[11px] text-zinc-400 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Evidence Hash SHA-256:</span>
                    <span className="text-zinc-300 font-semibold">{String(chainDetail.evidenceHash || '')}</span>
                  </div>
                  <span>Auditado em UTC</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CENTRAL DE CASOS */}
        {activeTab === 'casos' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-200">
                Casos Abertos para Resolução nos Domínios de Origem
              </h2>
              <span className="text-xs text-zinc-400">{cases.length} casos registrados</span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {cases.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-white">{c.id}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          c.severity === 'CRITICO'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {c.severity}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300">
                        {c.divergenceType}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-300">
                      Correlação: <span className="font-mono text-zinc-400">{c.correlationId}</span> • Domínio:{' '}
                      <span className="font-semibold text-rose-400">{c.domainResponsible}</span> • Valor:{' '}
                      <span className="font-semibold text-white">{formatCents(c.amountCents)}</span>
                    </div>
                    <div className="text-[11px] font-mono text-zinc-500">
                      Evidence Hash: {c.evidenceHash.slice(0, 16)}...
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {c.status === 'ABERTO' && (
                      <button
                        onClick={() => handleUpdateCase(c.id, 'EM_INVESTIGACAO')}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium"
                      >
                        Investigar
                      </button>
                    )}
                    {c.status === 'EM_INVESTIGACAO' && (
                      <button
                        onClick={() => handleUpdateCase(c.id, 'ENCAMINHADO_FINANCEIRO')}
                        className="px-3 py-1.5 rounded-lg bg-amber-600/80 hover:bg-amber-600 text-white text-xs font-medium"
                      >
                        Encaminhar Domínio
                      </button>
                    )}
                    <button
                      onClick={() => handleUpdateCase(c.id, 'RESOLVIDO', 'Validada correção no domínio financeiro.')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-medium"
                    >
                      Resolver Caso
                    </button>
                  </div>
                </div>
              ))}
              {cases.length === 0 && (
                <div className="p-8 text-center border border-zinc-800 rounded-xl bg-zinc-900/20 text-zinc-500 text-xs">
                  Nenhum caso de divergência em aberto. A esteira financeira está íntegra.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: REGRAS DE ASSURANCE */}
        {activeTab === 'regras' && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-zinc-200">
              Catálogo de Regras de Auditoria Contínua & Integridade
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rules.map((r) => (
                <div key={r.id} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-rose-400">{r.codigo}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      v{r.versao} • Tolerância: {r.toleranciaCentavos}¢
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold text-white">{r.nome}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{r.descricao}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: MONITOR DE SCANS */}
        {activeTab === 'monitor' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-200">Histórico de Varreduras e Scans de Integridade</h2>
              <button
                onClick={() => handleTriggerScan('PERIODO_COMPLETO')}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-medium text-white flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                Varredura Completa do Período
              </button>
            </div>

            <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/40">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 font-sans">
                  <tr>
                    <th className="py-2.5 px-3">Scan ID</th>
                    <th className="py-2.5 px-3">Tipo</th>
                    <th className="py-2.5 px-3">Itens Analisados</th>
                    <th className="py-2.5 px-3">Divergências</th>
                    <th className="py-2.5 px-3">Duração</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {scans.map((s) => (
                    <tr key={s.id} className="hover:bg-zinc-900/60">
                      <td className="py-2.5 px-3 text-zinc-200">{s.id}</td>
                      <td className="py-2.5 px-3 text-zinc-400">{s.tipo}</td>
                      <td className="py-2.5 px-3 text-zinc-300">{s.itensProcessados.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-rose-400">{s.divergenciasEncontradas}</td>
                      <td className="py-2.5 px-3 text-zinc-400">{s.duracaoMs ? `${s.duracaoMs} ms` : '-'}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: INTELIGÊNCIA DE RECEITA */}
        {activeTab === 'inteligencia' && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-zinc-200">
              Diagnósticos Preditivos e Prevenção de Vazamento de Receita
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map((ins) => (
                <div key={ins.id} className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      {ins.categoria}
                    </span>
                    <span className="text-xs font-semibold text-rose-400">
                      Impacto: {formatCents(ins.impactoPotencialCents)}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white">{ins.titulo}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{ins.descricao}</p>
                  <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-950/60 text-xs text-zinc-300">
                    <strong>Recomendação da IA:</strong> {ins.recomendacao}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

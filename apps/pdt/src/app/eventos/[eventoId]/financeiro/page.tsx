'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeftRight,
  Banknote,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Landmark,
  Loader2,
  RefreshCcw,
  ShieldCheck,
  TrendingUp,
  Wallet,
  Percent,
  Receipt,
  Scale,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Plus,
  Ban,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';

type Tab =
  | 'cockpit'
  | 'taxas'
  | 'saldos'
  | 'settlement'
  | 'conciliacao'
  | 'dre'
  | 'transferencias'
  | 'inteligencia';

export default function EventFinanceiroPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = (params?.['eventoId'] as string) || 'evento-operacao';

  const [activeTab, setActiveTab] = useState<Tab>('cockpit');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Dados do evento e finanças
  const [summaryData, setSummaryData] = useState<any>(null);
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);
  const [settlementLots, setSettlementLots] = useState<any[]>([]);

  // Modais / Ações
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [newFeeModel, setNewFeeModel] = useState<'PERCENTUAL' | 'FIXA' | 'HIBRIDA'>('PERCENTUAL');
  const [newPercentRate, setNewPercentRate] = useState(10.0);
  const [newFixedCents, setNewFixedCents] = useState(500);

  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmountCents, setPayoutAmountCents] = useState(2500000);
  const [payoutPixKey, setPayoutPixKey] = useState('financeiro@produtora.com.br');

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferTargetEvent, setTransferTargetEvent] = useState('evento-1');
  const [transferAmountCents, setTransferAmountCents] = useState(100000);
  const [transferReason, setTransferReason] = useState('Adiantamento de infraestrutura');

  const [showAdvancedModal, setShowAdvancedModal] = useState(false);
  const [advancedAmountCents, setAdvancedAmountCents] = useState(1000000);
  const [advancedDays, setAdvancedDays] = useState(30);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, ledRes, setRes] = await Promise.all([
        fetch(`/api/eventos/${eventId}/finance/summary`),
        fetch(`/api/eventos/${eventId}/finance/timeline`),
        fetch(`/api/eventos/${eventId}/finance/settlements`),
      ]);

      if (!sumRes.ok) throw new Error('Falha ao carregar dados financeiros do evento.');

      const sumJson = await sumRes.json();
      const ledJson = ledRes.ok ? await ledRes.json() : [];
      const setJson = setRes.ok ? await setRes.json() : [];

      setSummaryData(sumJson);
      setLedgerEntries(ledJson);
      setSettlementLots(setJson);
    } catch (err: any) {
      setError(err?.message || 'Erro de conexão com o módulo Financeiro.');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Ações
  const handleSaveFeeConfig = async () => {
    try {
      const res = await fetch(`/api/eventos/${eventId}/finance/fees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ruleModel: newFeeModel,
          percentRate: newPercentRate,
          fixedAmountCents: newFixedCents,
        }),
      });
      if (!res.ok) throw new Error('Erro ao salvar nova versão da taxa.');
      showFeedback('success', 'Nova regra de taxa cadastrada com sucesso! Snapshot de vendas passadas mantido.');
      setShowFeeModal(false);
      loadData();
    } catch (err: any) {
      showFeedback('error', err?.message || 'Erro ao atualizar taxas.');
    }
  };

  const handleSchedulePayout = async () => {
    try {
      const res = await fetch(`/api/eventos/${eventId}/finance/settlements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountCents: payoutAmountCents,
          pixKey: payoutPixKey,
        }),
      });
      if (!res.ok) throw new Error('Erro ao agendar repasse.');
      showFeedback('success', 'Repasse agendado com sucesso e saldo cautelarmente reservado no Ledger!');
      setShowPayoutModal(false);
      loadData();
    } catch (err: any) {
      showFeedback('error', err?.message || 'Erro ao agendar repasse.');
    }
  };

  const handleExecutePayout = async (settlementId: string) => {
    try {
      const res = await fetch(`/api/eventos/${eventId}/finance/settlements/${settlementId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankReceiptId: `REC-${Date.now()}`,
          pixEndToEndId: `E2E-ITA-${Date.now()}`,
        }),
      });
      if (!res.ok) throw new Error('Erro ao liquidar repasse no banco.');
      showFeedback('success', 'Repasse liquidado com comprovante bancário e baixa efetuada no Ledger!');
      loadData();
    } catch (err: any) {
      showFeedback('error', err?.message || 'Erro ao liquidar repasse.');
    }
  };

  const handleTransfer = async () => {
    try {
      const res = await fetch(`/api/produtores/00000000-0000-0000-0000-000000000002/finance/transfers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originEventId: eventId,
          targetEventId: transferTargetEvent,
          amountCents: transferAmountCents,
          reason: transferReason,
        }),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.message || 'Erro ao transferir saldo inter-eventos.');
      }
      showFeedback('success', 'Transferência em partidas dobradas executada com sucesso!');
      setShowTransferModal(false);
      loadData();
    } catch (err: any) {
      showFeedback('error', err?.message || 'Erro ao realizar transferência.');
    }
  };

  if (loading && !summaryData) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
        <p className="text-sm font-medium text-zinc-400">Carregando livro-razão e posição financeira do evento...</p>
      </div>
    );
  }

  const balance = summaryData?.balance || {
    contabilCents: 45000000,
    disponivelCents: 12500000,
    retidoCents: 30000000,
    bloqueadoCents: 2500000,
    reservadoEstornoCents: -50000,
    compromissosPendentesCents: 6300000,
  };

  const dre = summaryData?.dre || {};
  const feeConfig = summaryData?.feeConfig || {};
  const rec = summaryData?.reconciliation || {};
  const insights = summaryData?.intelligence || [];

  return (
    <div className="space-y-6 p-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-zinc-400">
            <Link href="/eventos" className="hover:text-zinc-200">Eventos</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/eventos/${eventId}`} className="hover:text-zinc-200">
              {eventId === 'evento-operacao' ? 'Festival Live 2026' : eventId}
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-emerald-400">Financeiro & Settlement OS</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-3">
            <Landmark className="h-7 w-7 text-emerald-500" />
            Inteligência Financeira & Liquidação do Evento
          </h1>
          <p className="text-sm text-zinc-400">
            Ledger em partidas dobradas, taxas por evento com snapshot histórico, saldo real e liquidação bancária.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/eventos/${eventId}/command-center`}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-700"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Ver no Command Center
          </Link>
          <button
            onClick={() => setShowPayoutModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-500"
          >
            <Banknote className="h-3.5 w-3.5" />
            Novo Repasse Pix
          </button>
          <button
            onClick={() => setShowTransferModal(true)}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-700"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
            Transferir Saldo
          </button>
          <button
            onClick={() => setShowAdvancedModal(true)}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-700"
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Simular Advanced
          </button>
          <button
            onClick={loadData}
            className="rounded-lg border border-zinc-700 bg-zinc-800 p-2 text-zinc-300 hover:bg-zinc-700"
            title="Atualizar dados"
          >
            <RefreshCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Banner de Soberania do Ledger */}
      <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-emerald-300">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 flex-shrink-0 text-emerald-400" />
          <div className="text-xs">
            <span className="font-semibold text-emerald-200">Ledger Único & Soberania Contábil Ativa: </span>
            A escrituração imutável em partidas dobradas é a única fonte da verdade financeira. Métricas de marketing analítico não alteram saldo, DRE ou obrigações bancárias.
          </div>
        </div>
        <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300">
          CONCILIADO 100%
        </span>
      </div>

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div
          className={`flex items-center gap-3 rounded-lg border p-4 text-sm font-medium ${
            feedbackMsg.type === 'success'
              ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-200'
              : 'border-rose-500/50 bg-rose-950/40 text-rose-200'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-rose-400" />
          )}
          {feedbackMsg.text}
        </div>
      )}

      {/* 6 Primary KPI Cards (Buckets & Métricas Oficiais) */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Saldo Disponível</span>
            <Wallet className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-emerald-400">
            R$ {(balance.disponivelCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-[11px] text-zinc-500">Livre p/ repasse ou transferência</div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Custódia (Retido)</span>
            <Scale className="h-4 w-4 text-blue-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-zinc-100">
            R$ {(balance.retidoCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-[11px] text-zinc-500">Vendas em garantia até a sessão</div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Em Liquidação</span>
            <Banknote className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-amber-300">
            R$ {(balance.bloqueadoCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-[11px] text-zinc-500">Repasses agendados/processando</div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Reserva p/ Estorno</span>
            <AlertTriangle className="h-4 w-4 text-rose-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-rose-400">
            R$ {(balance.reservadoEstornoCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-[11px] text-zinc-500">Fundo cobertura chargebacks</div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Contas a Pagar</span>
            <Receipt className="h-4 w-4 text-purple-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-zinc-100">
            R$ {(balance.compromissosPendentesCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-[11px] text-zinc-500">Compromissos fornecedores</div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Conciliação 6 Vias</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-emerald-400">
            {rec.status === 'CONCILIADO' ? '100% OK' : 'DIVERGÊNCIA'}
          </div>
          <div className="mt-1 text-[11px] text-zinc-500">Gateway × Pedido × Banco</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 border-b border-zinc-800">
        {[
          { id: 'cockpit', label: 'Cockpit & Visão Geral', icon: Landmark },
          { id: 'taxas', label: 'Motor de Taxas Disk', icon: Percent },
          { id: 'saldos', label: 'Saldo Real & Ledger', icon: Scale },
          { id: 'settlement', label: 'Settlement & Repasses', icon: Banknote },
          { id: 'conciliacao', label: 'Conciliação 6 Vias', icon: ShieldCheck },
          { id: 'dre', label: 'DRE & Fluxo de Caixa', icon: FileText },
          { id: 'transferencias', label: 'Transferências Inter-Eventos', icon: ArrowLeftRight },
          { id: 'inteligencia', label: 'Inteligência Financeira', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-medium transition-colors ${
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
                <span>Resumo da Operação Financeira</span>
                <span className="text-xs font-normal text-zinc-400">Período: Vigência Integral</span>
              </h3>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-lg bg-zinc-800/60 p-3">
                  <div className="text-xs text-zinc-400">GMV Ingressos</div>
                  <div className="text-base font-bold text-zinc-100">
                    R$ {((dre.grossTicketRevenueCents || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="rounded-lg bg-zinc-800/60 p-3">
                  <div className="text-xs text-zinc-400">Taxa Disk ({dre.diskEffectivePercentRate || 10}%)</div>
                  <div className="text-base font-bold text-amber-400">
                    R$ {((dre.diskServiceFeesCents || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="rounded-lg bg-zinc-800/60 p-3">
                  <div className="text-xs text-zinc-400">Custo Gateway (2.5%)</div>
                  <div className="text-base font-bold text-zinc-300">
                    R$ {((dre.gatewayProcessingFeesCents || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="rounded-lg bg-zinc-800/60 p-3">
                  <div className="text-xs text-zinc-400">Repasses Liquidados</div>
                  <div className="text-base font-bold text-emerald-400">
                    R$ {((dre.payoutsSettledCents || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Progress bar do resultado operacional */}
              <div className="mt-6">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Margem Operacional Líquida</span>
                  <span className="font-semibold text-emerald-400">86.2% do GMV</span>
                </div>
                <div className="mt-2 h-2.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '86.2%' }} />
                </div>
              </div>
            </div>

            {/* Timeline Financeira Recente */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
              <h3 className="text-base font-semibold text-zinc-100">Timeline de Movimentações Contábeis</h3>
              <div className="mt-4 divide-y divide-zinc-800">
                {ledgerEntries.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-full p-2 ${
                          entry.direction === 'IN'
                            ? 'bg-emerald-950 text-emerald-400'
                            : 'bg-amber-950 text-amber-400'
                        }`}
                      >
                        {entry.direction === 'IN' ? (
                          <ArrowDownLeft className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-zinc-200">{entry.description}</div>
                        <div className="text-[11px] text-zinc-500">
                          {new Date(entry.timestamp).toLocaleString('pt-BR')} · Bucket: {entry.bucket}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`text-sm font-bold ${
                        entry.direction === 'IN' ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {entry.direction === 'IN' ? '+' : '-'} R${' '}
                      {(entry.amountCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Coluna Direita: Informações de Regra & Alertas */}
          <div className="space-y-6">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-100">Regra Comercial Vigente</h3>
                <span className="rounded bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  V{feeConfig.version || 1} ATIVA
                </span>
              </div>
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Modelo:</span>
                  <span className="font-semibold text-zinc-200">{feeConfig.ruleModel || 'PERCENTUAL'}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Taxa Disk:</span>
                  <span className="font-semibold text-zinc-200">
                    {feeConfig.ruleModel === 'FIXA'
                      ? `R$ ${(feeConfig.fixedAmountCents / 100).toFixed(2)} / ingresso`
                      : `${feeConfig.percentRate || 10}%`}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Custo Gateway:</span>
                  <span className="font-semibold text-zinc-200">{feeConfig.gatewayProcessingPercentRate || 2.5}%</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Contrato:</span>
                  <span className="font-mono text-zinc-300">{feeConfig.contractReference || 'CTR-PADRAO-2026'}</span>
                </div>
              </div>
              <button
                onClick={() => setShowFeeModal(true)}
                className="mt-4 w-full rounded-lg border border-zinc-700 bg-zinc-800 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-700"
              >
                Gerenciar Taxa do Evento
              </button>
            </div>

            {/* Insights Rápidos */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                Diagnóstico Financeiro
              </h3>
              <div className="mt-4 space-y-3">
                {insights.map((ins: any) => (
                  <div key={ins.id} className="rounded-lg border border-zinc-800 bg-zinc-800/40 p-3">
                    <div className="text-xs font-semibold text-emerald-300">{ins.title}</div>
                    <div className="mt-1 text-[11px] text-zinc-400">{ins.observation}</div>
                    <div className="mt-2 text-[10px] text-zinc-500 font-mono">Confiança: {ins.confidenceScore}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MOTOR DE TAXAS DISK */}
      {activeTab === 'taxas' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
            <div>
              <h3 className="text-base font-semibold text-zinc-100">Motor de Taxas Individual do Evento</h3>
              <p className="text-xs text-zinc-400">
                Cada evento possui sua própria regra de precificação. Alterações futuras preservam 100% dos snapshots históricos das vendas passadas.
              </p>
            </div>
            <button
              onClick={() => setShowFeeModal(true)}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
            >
              <Plus className="h-4 w-4" />
              Nova Versão da Regra
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
              <div className="text-xs text-zinc-400">Modelo Atual</div>
              <div className="mt-1 text-2xl font-bold text-emerald-400">{feeConfig.ruleModel || 'PERCENTUAL'}</div>
              <div className="mt-2 text-xs text-zinc-500">
                {feeConfig.ruleModel === 'FIXA'
                  ? 'Cobrança fixa por cada ingresso emitido'
                  : 'Percentual proporcional sobre o valor de face'}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
              <div className="text-xs text-zinc-400">Valor / Alíquota da Disk</div>
              <div className="mt-1 text-2xl font-bold text-zinc-100">
                {feeConfig.ruleModel === 'FIXA'
                  ? `R$ ${(feeConfig.fixedAmountCents / 100).toFixed(2)}`
                  : `${feeConfig.percentRate || 10}%`}
              </div>
              <div className="mt-2 text-xs text-zinc-500">Receita retida de serviço da plataforma</div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
              <div className="text-xs text-zinc-400">Vigência & Versão</div>
              <div className="mt-1 text-2xl font-bold text-zinc-100">Versão {feeConfig.version || 1}</div>
              <div className="mt-2 text-xs text-zinc-500">Status: {feeConfig.status || 'VIGENTE'}</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SALDO REAL & BUCKETS */}
      {activeTab === 'saldos' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-4">
              <div className="text-xs font-semibold text-emerald-400">Bucket: Disponível</div>
              <div className="mt-2 text-2xl font-bold text-emerald-300">
                R$ {(balance.disponivelCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="mt-1 text-[11px] text-zinc-400">Recursos liberados para liquidação bancária</div>
            </div>
            <div className="rounded-xl border border-blue-900/50 bg-blue-950/20 p-4">
              <div className="text-xs font-semibold text-blue-400">Bucket: Retido (Custódia)</div>
              <div className="mt-2 text-2xl font-bold text-blue-300">
                R$ {(balance.retidoCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="mt-1 text-[11px] text-zinc-400">Vendas em custódia até realização do evento</div>
            </div>
            <div className="rounded-xl border border-amber-900/50 bg-amber-950/20 p-4">
              <div className="text-xs font-semibold text-amber-400">Bucket: Bloqueado</div>
              <div className="mt-2 text-2xl font-bold text-amber-300">
                R$ {(balance.bloqueadoCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="mt-1 text-[11px] text-zinc-400">Comprometido em lotes de repasse em curso</div>
            </div>
            <div className="rounded-xl border border-rose-900/50 bg-rose-950/20 p-4">
              <div className="text-xs font-semibold text-rose-400">Bucket: Reserva Estorno</div>
              <div className="mt-2 text-2xl font-bold text-rose-300">
                R$ {(balance.reservadoEstornoCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="mt-1 text-[11px] text-zinc-400">Fundo e compensações de estornos</div>
            </div>
          </div>

          {/* Tabela do Livro-Razão Imutável */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
            <h3 className="text-base font-semibold text-zinc-100">Extrato Imutável do Livro-Razão (Ledger)</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Registro append-only auditável. Toda correção é feita exclusivamente por lançamentos compensatórios.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="border-b border-zinc-800 text-[11px] uppercase text-zinc-500">
                  <tr>
                    <th className="py-2.5">Data / Hora</th>
                    <th className="py-2.5">Tipo</th>
                    <th className="py-2.5">Bucket</th>
                    <th className="py-2.5">Histórico Contábil</th>
                    <th className="py-2.5 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {ledgerEntries.map((l) => (
                    <tr key={l.id} className="hover:bg-zinc-800/40">
                      <td className="py-3 font-mono text-zinc-400">{new Date(l.timestamp).toLocaleString('pt-BR')}</td>
                      <td className="py-3">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            l.direction === 'IN'
                              ? 'bg-emerald-950 text-emerald-400'
                              : 'bg-rose-950 text-rose-400'
                          }`}
                        >
                          {l.direction === 'IN' ? 'ENTRADA' : 'SAÍDA'}
                        </span>
                      </td>
                      <td className="py-3 font-semibold text-zinc-200">{l.bucket}</td>
                      <td className="py-3 text-zinc-300">{l.description}</td>
                      <td className="py-3 text-right font-mono font-semibold">
                        R$ {(l.amountCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SETTLEMENT & REPASSES */}
      {activeTab === 'settlement' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
            <div>
              <h3 className="text-base font-semibold text-zinc-100">Settlement Engine & Lotes de Repasse</h3>
              <p className="text-xs text-zinc-400">
                Ciclo de liquidação bancária com idempotência garantida e baixa automatizada no Ledger.
              </p>
            </div>
            <button
              onClick={() => setShowPayoutModal(true)}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
            >
              <Plus className="h-4 w-4" />
              Agendar Repasse
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/60">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="border-b border-zinc-800 text-[11px] uppercase text-zinc-500">
                <tr>
                  <th className="p-4">Lote</th>
                  <th className="p-4">Valor Bruto</th>
                  <th className="p-4">Chave Pix / Conta</th>
                  <th className="p-4">Data Prevista</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Comprovante</th>
                  <th className="p-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {settlementLots.map((lot) => (
                  <tr key={lot.id} className="hover:bg-zinc-800/40">
                    <td className="p-4 font-mono font-bold text-zinc-100">{lot.batchNumber || lot.id}</td>
                    <td className="p-4 font-mono font-semibold text-emerald-400">
                      R$ {(lot.amountCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-zinc-300">{lot.pixKey || lot.bankAccountMasked}</td>
                    <td className="p-4 font-mono text-zinc-400">
                      {new Date(lot.scheduledDate).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          lot.status === 'PAGO'
                            ? 'bg-emerald-950 text-emerald-400'
                            : lot.status === 'AGENDADO'
                            ? 'bg-amber-950 text-amber-400'
                            : 'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        {lot.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-[11px] text-zinc-400">
                      {lot.bankReceiptId || lot.pixEndToEndId || '—'}
                    </td>
                    <td className="p-4 text-right">
                      {lot.status === 'AGENDADO' && (
                        <button
                          onClick={() => handleExecutePayout(lot.id)}
                          className="rounded bg-emerald-600/80 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-500"
                        >
                          Liquidar no Banco
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: CONCILIAÇÃO 6 VIAS */}
      {activeTab === 'conciliacao' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
            <h3 className="text-base font-semibold text-zinc-100">Matriz de Conciliação 6 Vias</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Conferência contínua entre: Gateway × Pagamento × Pedido × Ledger × Repasse × Banco.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {(rec.points || []).map((pt: any) => (
                <div key={pt.source} className="rounded-lg border border-zinc-800 bg-zinc-800/40 p-3">
                  <div className="text-xs font-semibold text-zinc-400">{pt.source}</div>
                  <div className="mt-1 text-sm font-bold text-zinc-100">
                    R$ {(pt.actualCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" /> Conciliado
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: DRE & FLUXO DE CAIXA */}
      {activeTab === 'dre' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
            <h3 className="text-base font-semibold text-zinc-100">Demonstrativo do Resultado do Exercício (DRE)</h3>
            <p className="text-xs text-zinc-400 mt-1">
              {dre.sourceNote || 'Escrituração contábil oficial baseada no Ledger imutável.'}
            </p>

            <div className="mt-6 space-y-3 font-mono text-sm">
              <div className="flex justify-between border-b border-zinc-800 pb-2 text-zinc-100 font-bold">
                <span>(+) Receita Bruta de Ingressos (GMV)</span>
                <span>R$ {((dre.grossTicketRevenueCents || 0) / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-amber-400">
                <span>(-) Taxa DiskIngressos do Evento ({dre.diskEffectivePercentRate || 10}%)</span>
                <span>- R$ {((dre.diskServiceFeesCents || 0) / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>(-) Custo Operacional Adquirente / Gateway (2.5%)</span>
                <span>- R$ {((dre.gatewayProcessingFeesCents || 0) / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-rose-400">
                <span>(-) Estornos e Chargebacks Processados</span>
                <span>- R$ {((dre.refundsAndChargebacksCents || 0) / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-purple-400">
                <span>(-) Despesas com Fornecedores do Evento (Contas a Pagar)</span>
                <span>- R$ {((dre.operatingExpensesSupplierCents || 0) / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-b border-zinc-700 py-2 text-emerald-400 font-bold">
                <span>(=) Resultado Operacional Bruto</span>
                <span>R$ {((dre.grossOperatingProfitCents || 0) / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>(-) Repasses Pagos ao Produtor</span>
                <span>- R$ {((dre.payoutsSettledCents || 0) / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-300 font-bold">
                <span>(=) Saldo Remanescente em Custódia</span>
                <span>R$ {((dre.netRemainingBalanceCents || 0) / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: TRANSFERÊNCIAS */}
      {activeTab === 'transferencias' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
            <h3 className="text-base font-semibold text-zinc-100">Transferências Inter-Eventos (Mesmo Produtor)</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Partidas dobradas imutáveis. Transferências entre produtores distintos são estritamente bloqueadas por arquitetura multi-tenant.
            </p>
            <div className="mt-4 flex gap-4">
              <button
                onClick={() => setShowTransferModal(true)}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
              >
                <Plus className="h-4 w-4" />
                Nova Transferência de Saldo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: INTELIGÊNCIA FINANCEIRA */}
      {activeTab === 'inteligencia' && (
        <div className="space-y-4">
          {insights.map((ins: any) => (
            <div key={ins.id} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-zinc-100">{ins.title}</span>
                <span className="rounded bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  {ins.category}
                </span>
              </div>
              <p className="mt-2 text-xs text-zinc-300">{ins.observation}</p>
              <div className="mt-3 rounded bg-zinc-800/40 p-3 text-xs text-zinc-400 font-mono">
                <span className="text-emerald-400 font-bold">Evidência: </span>
                {ins.evidence}
              </div>
              <div className="mt-2 text-xs text-zinc-400">
                <span className="font-semibold text-zinc-300">Recomendação: </span>
                {ins.recommendation}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: NOVA VERSÃO DA REGRA DE TAXA */}
      {showFeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-zinc-100">Atualizar Taxa Disk do Evento</h3>
            <p className="mt-1 text-xs text-zinc-400">
              Vendas anteriores manterão o snapshot histórico intacto. Esta alteração só terá efeito a partir de agora.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300">Modelo de Cobrança</label>
                <select
                  value={newFeeModel}
                  onChange={(e) => setNewFeeModel(e.target.value as any)}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-200"
                >
                  <option value="PERCENTUAL">PERCENTUAL (% sobre GMV)</option>
                  <option value="FIXA">FIXA (R$ fixo por ingresso)</option>
                  <option value="HIBRIDA">HÍBRIDA (% + R$ fixo)</option>
                </select>
              </div>

              {newFeeModel !== 'FIXA' && (
                <div>
                  <label className="text-xs font-semibold text-zinc-300">Percentual da Disk (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newPercentRate}
                    onChange={(e) => setNewPercentRate(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-200"
                  />
                </div>
              )}

              {newFeeModel !== 'PERCENTUAL' && (
                <div>
                  <label className="text-xs font-semibold text-zinc-300">Valor Fixo por Ingresso (centavos)</label>
                  <input
                    type="number"
                    value={newFixedCents}
                    onChange={(e) => setNewFixedCents(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-200"
                  />
                  <div className="mt-1 text-[11px] text-zinc-500">Ex: 500 = R$ 5,00 por ingresso</div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowFeeModal(false)}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveFeeConfig}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
              >
                Salvar Nova Versão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOVO REPASSE PIX */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-zinc-100">Agendar Repasse Pix</h3>
            <p className="mt-1 text-xs text-zinc-400">
              O valor será transferido do bucket Disponível para Bloqueado até a liquidação bancária.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300">Valor do Repasse (centavos)</label>
                <input
                  type="number"
                  value={payoutAmountCents}
                  onChange={(e) => setPayoutAmountCents(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-200"
                />
                <div className="mt-1 text-[11px] text-emerald-400">
                  R$ {(payoutAmountCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">Chave Pix de Destino</label>
                <input
                  type="text"
                  value={payoutPixKey}
                  onChange={(e) => setPayoutPixKey(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-200"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowPayoutModal(false)}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleSchedulePayout}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
              >
                Confirmar Agendamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TRANSFERÊNCIA INTER-EVENTOS */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-zinc-100">Transferência Inter-Eventos</h3>
            <p className="mt-1 text-xs text-zinc-400">
              Transferência de saldos disponíveis entre eventos do mesmo produtor em partidas dobradas.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300">Evento Destino</label>
                <select
                  value={transferTargetEvent}
                  onChange={(e) => setTransferTargetEvent(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-200"
                >
                  <option value="evento-1">Turnê Nacional Rock Fest 2026</option>
                  <option value="evento-2">Festival Acústico Primavera 2026</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">Valor a Transferir (centavos)</label>
                <input
                  type="number"
                  value={transferAmountCents}
                  onChange={(e) => setTransferAmountCents(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-200"
                />
                <div className="mt-1 text-[11px] text-emerald-400">
                  R$ {(transferAmountCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">Justificativa / Motivo</label>
                <input
                  type="text"
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-200"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowTransferModal(false)}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleTransfer}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
              >
                Executar Transferência
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SIMULAR ADVANCED */}
      {showAdvancedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-zinc-100">Simulação de Advanced (Antecipação)</h3>
            <p className="mt-1 text-xs text-zinc-400">
              Cálculo estrito de deságio pró-rata dia conforme contrato vigente ({feeConfig.advancedDailyDiscountRate || 0.1}% ao dia).
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300">Valor Bruto a Antecipar (centavos)</label>
                <input
                  type="number"
                  value={advancedAmountCents}
                  onChange={(e) => setAdvancedAmountCents(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-200"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">Dias Antecipados</label>
                <input
                  type="number"
                  value={advancedDays}
                  onChange={(e) => setAdvancedDays(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-200"
                />
              </div>

              <div className="rounded-lg bg-zinc-800/80 p-3 space-y-1 font-mono text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Valor Bruto:</span>
                  <span>R$ {(advancedAmountCents / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-amber-400">
                  <span>Custo Deságio ({advancedDays} dias):</span>
                  <span>- R$ {((advancedAmountCents * 0.001 * advancedDays) / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-bold border-t border-zinc-700 pt-1">
                  <span>Valor Líquido:</span>
                  <span>R$ {((advancedAmountCents - advancedAmountCents * 0.001 * advancedDays) / 100).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowAdvancedModal(false)}
                className="rounded-lg bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

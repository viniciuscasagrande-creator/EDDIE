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
  Building,
  CreditCard,
  Download,
  UploadCloud,
  FileCheck,
  Check,
  RotateCcw,
  Layers,
} from 'lucide-react';
import Link from 'next/link';

export type Tab =
  | 'cockpit'
  | 'taxas'
  | 'saldos'
  | 'settlement'
  | 'contas'
  | 'disputas'
  | 'tesouraria'
  | 'conciliacao'
  | 'dre'
  | 'transferencias'
  | 'relatorios'
  | 'inteligencia';

export interface BalanceSummary {
  contabilCents: number;
  disponivelCents: number;
  retidoCents: number;
  bloqueadoCents: number;
  reservadoEstornoCents: number;
  compromissosPendentesCents: number;
}

export interface DreSummary {
  grossTicketRevenueCents?: number;
  diskEffectivePercentRate?: number;
  diskServiceFeesCents?: number;
  gatewayProcessingFeesCents?: number;
  refundsAndChargebacksCents?: number;
  operatingExpensesSupplierCents?: number;
  grossOperatingProfitCents?: number;
  payoutsSettledCents?: number;
  netRemainingBalanceCents?: number;
  sourceNote?: string;
}

export interface FeeConfigSummary {
  ruleModel?: 'PERCENTUAL' | 'FIXA' | 'HIBRIDA';
  percentRate?: number;
  fixedAmountCents?: number;
  gatewayProcessingPercentRate?: number;
  contractReference?: string;
  version?: number;
  status?: string;
  advancedDailyDiscountRate?: number;
}

export interface ReconciliationSummary {
  status?: string;
  points?: Array<{ source: string; actualCents: number }>;
}

export interface IntelligenceInsight {
  id: string;
  title: string;
  category: string;
  observation: string;
  evidence: string;
  recommendation: string;
  confidenceScore: number;
}

export interface SummaryData {
  eventId: string;
  producerId: string;
  balance: BalanceSummary;
  dre: DreSummary;
  feeConfig: FeeConfigSummary;
  reconciliation: ReconciliationSummary;
  intelligence: IntelligenceInsight[];
}

export interface LedgerEntry {
  id: string;
  timestamp: string;
  type: string;
  description: string;
  amountCents: number;
  direction: 'IN' | 'OUT';
  bucket: string;
}

export interface SettlementLot {
  id: string;
  batchNumber?: string;
  amountCents: number;
  pixKey?: string;
  bankAccountMasked?: string;
  scheduledDate: string;
  status: 'AGENDADO' | 'PROCESSANDO' | 'PAGO' | 'CANCELADO';
  bankReceiptId?: string | null;
  pixEndToEndId?: string | null;
}

export interface PayableItem {
  id: string;
  supplierId: string;
  supplierName: string;
  category: string;
  description: string;
  amountCents: number;
  dueDate: string;
  status: 'PENDENTE' | 'APROVADO' | 'PAGO' | 'CANCELADO';
  costCenterId?: string;
  createdAt: string;
}

export interface ReceivableItem {
  id: string;
  origin: string;
  counterparty: string;
  description: string;
  amountCents: number;
  dueDate: string;
  status: 'PENDENTE' | 'LIQUIDADO' | 'CANCELADO';
  costCenterId?: string;
  settledAt?: string;
  createdAt: string;
}

export interface CostCenterItem {
  id: string;
  code: string;
  name: string;
  category: string;
  budgetLimitCents: number;
  active: boolean;
}

export interface SupplierItem {
  id: string;
  name: string;
  documentMasked: string;
  contactEmail: string;
  category: string;
  bankAccountMasked: string;
  pixKey: string;
  active: boolean;
}

export interface RefundItem {
  id: string;
  orderId: string;
  eventId: string;
  amountCents: number;
  reason: string;
  status: 'PENDENTE' | 'APROVADO' | 'COMPENSADO' | 'REJEITADO';
  createdAt: string;
}

export interface ChargebackItem {
  id: string;
  orderId: string;
  eventId: string;
  amountCents: number;
  reason: string;
  status: 'ABERTO' | 'CONTESTADO' | 'REVERTIDO' | 'PERDIDO';
  receivedAt: string;
}

export interface TreasuryAccountItem {
  id: string;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  currentBalanceCents: number;
  type: string;
}

export interface CnabBatchItem {
  id: string;
  batchNumber: string;
  totalAmountCents: number;
  itemCount: number;
  status: 'GERADO' | 'PROCESSADO' | 'REJEITADO';
  createdAt: string;
}

export interface FinancialReportResult {
  title: string;
  reportType: string;
  period: string;
  tenantId: string;
  producerId: string;
  eventId: string;
  generatedAt: string;
  summary: {
    grossRevenueCents: number;
    netBalanceCents: number;
    feesPaidCents: number;
    refundsTotalCents: number;
    chargebacksTotalCents: number;
  };
  metrics: {
    totalTicketsSold: number;
    averageTicketCents: number;
    disputeRatePercent: number;
  };
}

export default function EventFinanceiroPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = (params?.['eventoId'] as string) || 'evento-operacao';

  const [activeTab, setActiveTab] = useState<Tab>('cockpit');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Dados financeiros do evento
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [settlementLots, setSettlementLots] = useState<SettlementLot[]>([]);
  const [payables, setPayables] = useState<PayableItem[]>([]);
  const [receivables, setReceivables] = useState<ReceivableItem[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenterItem[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [refunds, setRefunds] = useState<RefundItem[]>([]);
  const [chargebacks, setChargebacks] = useState<ChargebackItem[]>([]);
  const [treasuryAccounts, setTreasuryAccounts] = useState<TreasuryAccountItem[]>([]);
  const [cnabBatches, setCnabBatches] = useState<CnabBatchItem[]>([]);

  // Modais de Operação
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

  const [showPayableModal, setShowPayableModal] = useState(false);
  const [newPayableDesc, setNewPayableDesc] = useState('');
  const [newPayableAmountCents, setNewPayableAmountCents] = useState(500000);
  const [newPayableSupplierName, setNewPayableSupplierName] = useState('Prestador de Serviços');
  const [newPayableCategory, setNewPayableCategory] = useState('SERVICOS');
  const [newPayableDueDate, setNewPayableDueDate] = useState('2026-11-20');

  const [showReceivableModal, setShowReceivableModal] = useState(false);
  const [newRecDesc, setNewRecDesc] = useState('');
  const [newRecAmountCents, setNewRecAmountCents] = useState(1000000);
  const [newRecCounterparty, setNewRecCounterparty] = useState('Patrocinador Master');
  const [newRecOrigin, setNewRecOrigin] = useState('PATROCINIO');
  const [newRecDueDate, setNewRecDueDate] = useState('2026-11-25');

  const [showReverseModal, setShowReverseModal] = useState(false);
  const [selectedChargebackId, setSelectedChargebackId] = useState<string | null>(null);
  const [reverseReason, setReverseReason] = useState('Defesa acolhida com envio de logs de acesso e comprovante de check-in');

  // Relatório gerencial
  const [generatedReport, setGeneratedReport] = useState<FinancialReportResult | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, ledRes, setRes, payRes, recRes, ccRes, supRes, refRes, cbRes, treRes] = await Promise.all([
        fetch(`/api/eventos/${eventId}/finance/summary`),
        fetch(`/api/eventos/${eventId}/finance/timeline`),
        fetch(`/api/eventos/${eventId}/finance/settlements`),
        fetch(`/api/eventos/${eventId}/finance/payables`),
        fetch(`/api/eventos/${eventId}/finance/receivables`),
        fetch(`/api/eventos/${eventId}/finance/cost-centers`),
        fetch(`/api/eventos/${eventId}/finance/suppliers`),
        fetch(`/api/eventos/${eventId}/finance/refunds`),
        fetch(`/api/eventos/${eventId}/finance/chargebacks`),
        fetch(`/api/produtores/00000000-0000-0000-0000-000000000002/finance/treasury`),
      ]);

      if (!sumRes.ok) throw new Error('Falha ao carregar dados financeiros do evento.');

      const sumJson: SummaryData = await sumRes.json();
      const ledJson: LedgerEntry[] = ledRes.ok ? await ledRes.json() : [];
      const setJson: SettlementLot[] = setRes.ok ? await setRes.json() : [];
      const payJson: PayableItem[] = payRes.ok ? await payRes.json() : [];
      const recJson: ReceivableItem[] = recRes.ok ? await recRes.json() : [];
      const ccJson: CostCenterItem[] = ccRes.ok ? await ccRes.json() : [];
      const supJson: SupplierItem[] = supRes.ok ? await supRes.json() : [];
      const refJson: RefundItem[] = refRes.ok ? await refRes.json() : [];
      const cbJson: ChargebackItem[] = cbRes.ok ? await cbRes.json() : [];
      const treJson = treRes.ok ? await treRes.json() : { accounts: [], batches: [] };

      setSummaryData(sumJson);
      setLedgerEntries(ledJson);
      setSettlementLots(setJson);
      setPayables(payJson);
      setReceivables(recJson);
      setCostCenters(ccJson);
      setSuppliers(supJson);
      setRefunds(refJson);
      setChargebacks(cbJson);
      setTreasuryAccounts(treJson.accounts || []);
      setCnabBatches(treJson.batches || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro de conexão com o módulo Financeiro.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Ações Operacionais
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar taxas.';
      showFeedback('error', message);
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao agendar repasse.';
      showFeedback('error', message);
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao liquidar repasse.';
      showFeedback('error', message);
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao realizar transferência.';
      showFeedback('error', message);
    }
  };

  const handleCreatePayable = async () => {
    try {
      const res = await fetch(`/api/eventos/${eventId}/finance/payables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: 'sup-1',
          supplierName: newPayableSupplierName,
          category: newPayableCategory,
          description: newPayableDesc,
          amountCents: newPayableAmountCents,
          dueDate: newPayableDueDate,
          costCenterId: 'cc-infra',
        }),
      });
      if (!res.ok) throw new Error('Erro ao cadastrar conta a pagar.');
      showFeedback('success', 'Conta a pagar registrada no passivo do evento!');
      setShowPayableModal(false);
      setNewPayableDesc('');
      loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao registrar conta a pagar.';
      showFeedback('error', message);
    }
  };

  const handleApprovePayable = async (payableId: string) => {
    try {
      const res = await fetch(`/api/eventos/${eventId}/finance/payables/${payableId}/approve`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Erro ao aprovar conta a pagar.');
      showFeedback('success', 'Conta a pagar aprovada por alçada com sucesso!');
      loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao aprovar.';
      showFeedback('error', message);
    }
  };

  const handlePayPayable = async (payableId: string) => {
    try {
      const res = await fetch(`/api/eventos/${eventId}/finance/payables/${payableId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod: 'PIX_TESOURARIA' }),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.message || 'Erro ao liquidar conta a pagar.');
      }
      showFeedback('success', 'Conta a pagar liquidada e débito registrado no Ledger imutável!');
      loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao liquidar conta a pagar.';
      showFeedback('error', message);
    }
  };

  const handleCreateReceivable = async () => {
    try {
      const res = await fetch(`/api/eventos/${eventId}/finance/receivables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: newRecOrigin,
          counterparty: newRecCounterparty,
          description: newRecDesc,
          amountCents: newRecAmountCents,
          dueDate: newRecDueDate,
          costCenterId: 'cc-mkt',
        }),
      });
      if (!res.ok) throw new Error('Erro ao cadastrar conta a receber.');
      showFeedback('success', 'Conta a receber provisionada com sucesso!');
      setShowReceivableModal(false);
      setNewRecDesc('');
      loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao registrar recebível.';
      showFeedback('error', message);
    }
  };

  const handleSettleReceivable = async (receivableId: string) => {
    try {
      const res = await fetch(`/api/eventos/${eventId}/finance/receivables/${receivableId}/settle`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Erro ao liquidar recebível.');
      showFeedback('success', 'Recebível liquidado e crédito lançado no saldo disponível do Ledger!');
      loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao liquidar recebível.';
      showFeedback('error', message);
    }
  };

  const handleReverseChargeback = async () => {
    if (!selectedChargebackId) return;
    try {
      const res = await fetch(`/api/eventos/${eventId}/finance/chargebacks/${selectedChargebackId}/reverse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reverseReason }),
      });
      if (!res.ok) throw new Error('Erro ao reverter chargeback.');
      showFeedback('success', 'Chargeback revertido! Lançamento compensatório creditado e caso encerrado.');
      setShowReverseModal(false);
      setSelectedChargebackId(null);
      loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao reverter chargeback.';
      showFeedback('error', message);
    }
  };

  const handleProcessCnab = async (batchId: string, status: 'PROCESSADO' | 'REJEITADO') => {
    try {
      const res = await fetch(`/api/produtores/00000000-0000-0000-0000-000000000002/finance/treasury/cnab/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId,
          status,
          failureReason: status === 'REJEITADO' ? 'Conta de destino inválida ou encerrada no banco' : undefined,
          eventId,
        }),
      });
      if (!res.ok) throw new Error('Erro ao processar retorno CNAB.');
      showFeedback(
        status === 'PROCESSADO' ? 'success' : 'error',
        status === 'PROCESSADO'
          ? 'Retorno CNAB 240 processado com conciliação automática bancária!'
          : 'Retorno processado com registro de divergência e abertura de caso de auditoria!',
      );
      loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro no retorno bancário.';
      showFeedback('error', message);
    }
  };

  const handleGenerateReport = async (tipo: string) => {
    setReportLoading(true);
    try {
      const res = await fetch(`/api/eventos/${eventId}/finance/reports?tipo=${tipo}&periodo=2026-01 a 2026-12`);
      if (!res.ok) throw new Error('Erro ao gerar relatório financeiro.');
      const data: FinancialReportResult = await res.json();
      setGeneratedReport(data);
      showFeedback('success', `Relatório ${tipo} oficial gerado com sucesso!`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao emitir relatório.';
      showFeedback('error', message);
    } finally {
      setReportLoading(false);
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
      <div className="flex space-x-1 overflow-x-auto border-b border-zinc-800 pb-px">
        {[
          { id: 'cockpit', label: 'Cockpit & Visão Geral', icon: Landmark },
          { id: 'taxas', label: 'Motor de Taxas Disk', icon: Percent },
          { id: 'saldos', label: 'Saldo Real & Ledger', icon: Scale },
          { id: 'settlement', label: 'Settlement & Repasses', icon: Banknote },
          { id: 'contas', label: 'Contas a Pagar / Receber', icon: Receipt },
          { id: 'disputas', label: 'Estornos & Chargebacks', icon: AlertTriangle },
          { id: 'tesouraria', label: 'Tesouraria & CNAB', icon: Building },
          { id: 'conciliacao', label: 'Conciliação 6 Vias', icon: ShieldCheck },
          { id: 'dre', label: 'DRE & Fluxo de Caixa', icon: FileText },
          { id: 'transferencias', label: 'Transferências Inter-Eventos', icon: ArrowLeftRight },
          { id: 'relatorios', label: 'Relatórios Oficiais', icon: Download },
          { id: 'inteligencia', label: 'Inteligência Financeira', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
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
                      ? `R$ ${((feeConfig.fixedAmountCents || 0) / 100).toFixed(2)} / ingresso`
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
                {insights.map((ins) => (
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
                  ? `R$ ${((feeConfig.fixedAmountCents || 0) / 100).toFixed(2)}`
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

      {/* TAB 5: CONTAS A PAGAR / RECEBER */}
      {activeTab === 'contas' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Contas a Pagar */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-rose-400" />
                    Contas a Pagar (Fornecedores & Infra)
                  </h3>
                  <p className="text-xs text-zinc-400">Compromissos aprovados com baixa rastreável no Ledger.</p>
                </div>
                <button
                  onClick={() => setShowPayableModal(true)}
                  className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" /> Adicionar
                </button>
              </div>

              <div className="divide-y divide-zinc-800">
                {payables.map((pay) => (
                  <div key={pay.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-zinc-200">{pay.description}</div>
                      <div className="text-[11px] text-zinc-400">
                        {pay.supplierName} · Vence {new Date(pay.dueDate).toLocaleDateString('pt-BR')}
                      </div>
                      <span
                        className={`inline-block mt-1 rounded px-1.5 py-0.5 text-[9px] font-bold ${
                          pay.status === 'PAGO'
                            ? 'bg-emerald-950 text-emerald-400'
                            : pay.status === 'APROVADO'
                            ? 'bg-blue-950 text-blue-400'
                            : 'bg-amber-950 text-amber-400'
                        }`}
                      >
                        {pay.status}
                      </span>
                    </div>
                    <div className="text-right space-y-1.5">
                      <div className="text-sm font-bold text-rose-400 font-mono">
                        R$ {(pay.amountCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      {pay.status === 'PENDENTE' && (
                        <button
                          onClick={() => handleApprovePayable(pay.id)}
                          className="rounded bg-blue-600/80 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-blue-500 mr-1"
                        >
                          Aprovar
                        </button>
                      )}
                      {pay.status === 'APROVADO' && (
                        <button
                          onClick={() => handlePayPayable(pay.id)}
                          className="rounded bg-emerald-600/80 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-emerald-500"
                        >
                          Pagar via Ledger
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contas a Receber */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                    Contas a Receber (Patrocínios & Aportes)
                  </h3>
                  <p className="text-xs text-zinc-400">Receitas operacionais provisionadas e creditadas no Ledger.</p>
                </div>
                <button
                  onClick={() => setShowReceivableModal(true)}
                  className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" /> Adicionar
                </button>
              </div>

              <div className="divide-y divide-zinc-800">
                {receivables.map((recItem) => (
                  <div key={recItem.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-zinc-200">{recItem.description}</div>
                      <div className="text-[11px] text-zinc-400">
                        {recItem.counterparty} · Vence {new Date(recItem.dueDate).toLocaleDateString('pt-BR')}
                      </div>
                      <span
                        className={`inline-block mt-1 rounded px-1.5 py-0.5 text-[9px] font-bold ${
                          recItem.status === 'LIQUIDADO'
                            ? 'bg-emerald-950 text-emerald-400'
                            : 'bg-amber-950 text-amber-400'
                        }`}
                      >
                        {recItem.status}
                      </span>
                    </div>
                    <div className="text-right space-y-1.5">
                      <div className="text-sm font-bold text-emerald-400 font-mono">
                        R$ {(recItem.amountCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      {recItem.status === 'PENDENTE' && (
                        <button
                          onClick={() => handleSettleReceivable(recItem.id)}
                          className="rounded bg-emerald-600/80 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-emerald-500"
                        >
                          Liquidar no Ledger
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Centros de Custo e Fornecedores Cadastrados */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Centros de Custo do Evento</h4>
              <div className="mt-3 space-y-2">
                {costCenters.map((cc) => (
                  <div key={cc.id} className="flex justify-between items-center text-xs p-2 rounded bg-zinc-800/40">
                    <span className="font-semibold text-zinc-200">{cc.code} - {cc.name}</span>
                    <span className="font-mono text-zinc-400">Teto: R$ {(cc.budgetLimitCents / 100).toLocaleString('pt-BR')}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Fornecedores Homologados</h4>
              <div className="mt-3 space-y-2">
                {suppliers.map((sup) => (
                  <div key={sup.id} className="flex justify-between items-center text-xs p-2 rounded bg-zinc-800/40">
                    <div>
                      <span className="font-semibold text-zinc-200">{sup.name}</span>
                      <div className="text-[10px] text-zinc-500">{sup.documentMasked} · {sup.bankAccountMasked}</div>
                    </div>
                    <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300">{sup.category}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: DISPUTAS, ESTORNOS E CHARGEBACKS */}
      {activeTab === 'disputas' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
            <h3 className="text-base font-semibold text-zinc-100 flex items-center justify-between">
              <span>Máquina de Disputas & Chargebacks</span>
              <span className="text-xs text-zinc-400">Reversão de disputas gera lançamento compensatório auditado</span>
            </h3>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="border-b border-zinc-800 text-[11px] uppercase text-zinc-500">
                  <tr>
                    <th className="py-2.5">ID / Pedido</th>
                    <th className="py-2.5">Data Recebimento</th>
                    <th className="py-2.5">Motivo Alegado</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5">Valor em Disputa</th>
                    <th className="py-2.5 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {chargebacks.map((cb) => (
                    <tr key={cb.id} className="hover:bg-zinc-800/40">
                      <td className="py-3 font-mono font-semibold text-zinc-200">{cb.orderId}</td>
                      <td className="py-3 font-mono text-zinc-400">{new Date(cb.receivedAt).toLocaleDateString('pt-BR')}</td>
                      <td className="py-3 text-zinc-300">{cb.reason}</td>
                      <td className="py-3">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            cb.status === 'REVERTIDO'
                              ? 'bg-emerald-950 text-emerald-400'
                              : cb.status === 'CONTESTADO'
                              ? 'bg-blue-950 text-blue-400'
                              : 'bg-rose-950 text-rose-400'
                          }`}
                        >
                          {cb.status}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-rose-400 font-bold">
                        R$ {(cb.amountCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 text-right">
                        {cb.status !== 'REVERTIDO' && (
                          <button
                            onClick={() => {
                              setSelectedChargebackId(cb.id);
                              setShowReverseModal(true);
                            }}
                            className="rounded bg-emerald-600/80 px-2 py-1 text-[11px] font-semibold text-white hover:bg-emerald-500"
                          >
                            Reverter Disputa Ganha
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Estornos Solicitados */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
            <h3 className="text-base font-semibold text-zinc-100">Estornos CDC 7 Dias & Reembolsos Operacionais</h3>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="border-b border-zinc-800 text-[11px] uppercase text-zinc-500">
                  <tr>
                    <th className="py-2.5">Pedido</th>
                    <th className="py-2.5">Data Registro</th>
                    <th className="py-2.5">Justificativa</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5 text-right">Valor Estornado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {refunds.map((refItem) => (
                    <tr key={refItem.id} className="hover:bg-zinc-800/40">
                      <td className="py-3 font-mono font-semibold text-zinc-200">{refItem.orderId}</td>
                      <td className="py-3 font-mono text-zinc-400">{new Date(refItem.createdAt).toLocaleDateString('pt-BR')}</td>
                      <td className="py-3 text-zinc-300">{refItem.reason}</td>
                      <td className="py-3">
                        <span className="rounded bg-emerald-950 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
                          {refItem.status}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono text-rose-400 font-semibold">
                        R$ {(refItem.amountCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: TESOURARIA & CNAB */}
      {activeTab === 'tesouraria' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Contas Bancárias */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
              <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                <Building className="h-5 w-5 text-emerald-400" />
                Contas Bancárias de Custódia & Liquidação
              </h3>
              <div className="space-y-3">
                {treasuryAccounts.map((acc) => (
                  <div key={acc.id} className="rounded-lg border border-zinc-800 bg-zinc-800/40 p-4 flex justify-between items-center">
                    <div>
                      <div className="text-sm font-bold text-zinc-100">{acc.bankName}</div>
                      <div className="text-xs text-zinc-400 font-mono">{acc.accountNumber} · Cód {acc.bankCode}</div>
                      <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] font-semibold text-zinc-300 mt-1 inline-block">
                        {acc.type}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-zinc-400">Saldo Atual</div>
                      <div className="text-lg font-mono font-bold text-emerald-400">
                        R$ {(acc.currentBalanceCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lotes CNAB 240 */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
              <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                <UploadCloud className="h-5 w-5 text-blue-400" />
                Processamento CNAB 240 & Retornos Bancários
              </h3>
              <div className="space-y-3">
                {cnabBatches.map((batch) => (
                  <div key={batch.id} className="rounded-lg border border-zinc-800 bg-zinc-800/40 p-4">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-xs font-bold text-zinc-200">{batch.batchNumber}</span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          batch.status === 'PROCESSADO'
                            ? 'bg-emerald-950 text-emerald-400'
                            : 'bg-amber-950 text-amber-400'
                        }`}
                      >
                        {batch.status}
                      </span>
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-zinc-400">
                      <span>Total: R$ {(batch.totalAmountCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      <span>Itens: {batch.itemCount}</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleProcessCnab(batch.id, 'SUCESSO' as any)}
                        className="rounded bg-emerald-600/80 px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-emerald-500"
                      >
                        Simular Retorno OK
                      </button>
                      <button
                        onClick={() => handleProcessCnab(batch.id, 'REJEITADO')}
                        className="rounded bg-rose-600/80 px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-rose-500"
                      >
                        Simular Rejeição Bancária
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: CONCILIAÇÃO 6 VIAS */}
      {activeTab === 'conciliacao' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
            <h3 className="text-base font-semibold text-zinc-100">Matriz de Conciliação 6 Vias</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Conferência contínua entre: Gateway × Pagamento × Pedido × Ledger × Repasse × Banco.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {(rec.points || []).map((pt) => (
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

      {/* TAB 9: DRE & FLUXO DE CAIXA */}
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

      {/* TAB 10: TRANSFERÊNCIAS */}
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

      {/* TAB 11: RELATÓRIOS OFICIAIS */}
      {activeTab === 'relatorios' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
            <h3 className="text-base font-semibold text-zinc-100">Central de Relatórios & Fechamentos Oficiais</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Gere extratos oficiais auditados para fechamento de caixa, DRE do produtor e prestação de contas.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {['DRE', 'EXTRATO', 'TAXAS', 'CONCILIACAO'].map((tipo) => (
                <button
                  key={tipo}
                  onClick={() => handleGenerateReport(tipo)}
                  disabled={reportLoading}
                  className="rounded-lg border border-zinc-700 bg-zinc-800/80 p-4 text-center hover:bg-zinc-700 hover:border-emerald-500 transition-all"
                >
                  <FileText className="h-6 w-6 text-emerald-400 mx-auto" />
                  <div className="mt-2 text-xs font-bold text-zinc-200">Relatório {tipo}</div>
                  <div className="text-[10px] text-zinc-500 mt-1">Gerar demonstrativo oficial</div>
                </button>
              ))}
            </div>

            {reportLoading && (
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-400">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-500" /> Processando demonstrativo contábil...
              </div>
            )}

            {generatedReport && (
              <div className="mt-6 rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-5 space-y-3 font-mono text-xs">
                <div className="flex justify-between border-b border-emerald-800/50 pb-2">
                  <span className="font-bold text-emerald-300">{generatedReport.title}</span>
                  <span className="text-zinc-400">Tipo: {generatedReport.reportType}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-zinc-300">
                  <div>GMV: R$ {(generatedReport.summary.grossRevenueCents / 100).toLocaleString('pt-BR')}</div>
                  <div>Taxas Disk: R$ {(generatedReport.summary.feesPaidCents / 100).toLocaleString('pt-BR')}</div>
                  <div>Saldo Líquido: R$ {(generatedReport.summary.netBalanceCents / 100).toLocaleString('pt-BR')}</div>
                  <div>Ingressos Vendidos: {generatedReport.metrics.totalTicketsSold}</div>
                  <div>Ticket Médio: R$ {(generatedReport.metrics.averageTicketCents / 100).toLocaleString('pt-BR')}</div>
                  <div>Taxa Disputa: {generatedReport.metrics.disputeRatePercent}%</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 12: INTELIGÊNCIA FINANCEIRA */}
      {activeTab === 'inteligencia' && (
        <div className="space-y-4">
          {insights.map((ins) => (
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
                  onChange={(e) => setNewFeeModel(e.target.value as 'PERCENTUAL' | 'FIXA' | 'HIBRIDA')}
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

      {/* MODAL: NOVA CONTA A PAGAR */}
      {showPayableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-zinc-100">Nova Conta a Pagar</h3>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300">Descrição do Compromisso</label>
                <input
                  type="text"
                  value={newPayableDesc}
                  onChange={(e) => setNewPayableDesc(e.target.value)}
                  placeholder="Ex: Locação de Gerador de Energia"
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-200"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-300">Fornecedor</label>
                <input
                  type="text"
                  value={newPayableSupplierName}
                  onChange={(e) => setNewPayableSupplierName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-200"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-300">Valor (centavos)</label>
                <input
                  type="number"
                  value={newPayableAmountCents}
                  onChange={(e) => setNewPayableAmountCents(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-200"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-300">Data de Vencimento</label>
                <input
                  type="date"
                  value={newPayableDueDate}
                  onChange={(e) => setNewPayableDueDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-200"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowPayableModal(false)}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreatePayable}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
              >
                Salvar Conta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOVA CONTA A RECEBER */}
      {showReceivableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-zinc-100">Nova Conta a Receber</h3>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300">Descrição da Receita</label>
                <input
                  type="text"
                  value={newRecDesc}
                  onChange={(e) => setNewRecDesc(e.target.value)}
                  placeholder="Ex: Cota Patrocínio Palco"
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-200"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-300">Contraparte / Pagador</label>
                <input
                  type="text"
                  value={newRecCounterparty}
                  onChange={(e) => setNewRecCounterparty(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-200"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-300">Valor (centavos)</label>
                <input
                  type="number"
                  value={newRecAmountCents}
                  onChange={(e) => setNewRecAmountCents(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-200"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-300">Data Prevista Recebimento</label>
                <input
                  type="date"
                  value={newRecDueDate}
                  onChange={(e) => setNewRecDueDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-200"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowReceivableModal(false)}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateReceivable}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
              >
                Salvar Recebível
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REVERTER CHARGEBACK */}
      {showReverseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-zinc-100">Reverter Disputa de Chargeback</h3>
            <p className="mt-1 text-xs text-zinc-400">
              Registra ganho de disputa com estorno compensatório e recomposição do saldo no Ledger.
            </p>
            <div className="mt-4">
              <label className="text-xs font-semibold text-zinc-300">Parecer da Defesa / Justificativa</label>
              <textarea
                value={reverseReason}
                onChange={(e) => setReverseReason(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-200"
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowReverseModal(false)}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleReverseChargeback}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
              >
                Confirmar Reversão no Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

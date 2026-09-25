/**
 * EDDIE 11.19 — EVENT FINANCIAL INTELLIGENCE & SETTLEMENT OS
 * Contratos e tipos do motor financeiro, taxas individuais por evento,
 * saldo real em buckets, transferências inter-eventos, settlement engine,
 * conciliação 6 vias, DRE contábil e inteligência financeira.
 */

export type FeeRuleModel = 'PERCENTUAL' | 'FIXA' | 'HIBRIDA';

export type FeeRuleStatus =
  | 'RASCUNHO'
  | 'EM_APROVACAO'
  | 'VIGENTE'
  | 'EXPIRADA'
  | 'REVOGADA';

export interface EventFeeConfig {
  id: string;
  eventId: string;
  producerId: string;
  tenantId: string;
  version: number;
  ruleModel: FeeRuleModel;
  percentRate: number; // ex: 10.0 = 10%
  fixedAmountCents: number; // ex: 500 = R$ 5,00 por ingresso
  gatewayProcessingPercentRate: number; // ex: 2.5 = 2.5%
  spreadPercentRate: number; // ex: 1.0 = 1.0%
  advancedDailyDiscountRate: number; // ex: 0.1% ao dia
  effectiveFrom: string; // ISO
  effectiveTo: string | null;
  status: FeeRuleStatus;
  approvedBy?: string | null;
  approvedAt?: string | null;
  contractReference?: string;
  notes?: string;
}

export interface FeeSnapshot {
  ruleVersion: number;
  ruleModel: FeeRuleModel;
  percentRate: number;
  fixedAmountCents: number;
  gatewayRate: number;
  grossAmountCents: number;
  ticketsCount: number;
  diskFeeCents: number;
  gatewayCostCents: number;
  netProducerCents: number;
  appliedAt: string;
}

export interface EventRealBalanceDto {
  eventId: string;
  producerId: string;
  contabilCents: number; // Patrimônio total acumulado no Ledger
  disponivelCents: number; // Livre para repasse ou transferências
  bloqueadoCents: number; // Em liquidação / comprometido com solicitações de repasse
  reservadoEstornoCents: number; // Fundo de reserva para estornos e contestações
  retidoCents: number; // Em custódia / a receber de vendas brutas até a sessão
  aReceberCents: number; // Alias para retidoCents
  emLiquidacaoCents: number; // Alias para bloqueadoCents
  compromissosPendentesCents: number; // Contas a pagar de fornecedores pendentes
  lastLedgerEntryAt: string | null;
  ledgerEntriesCount: number;
}

export interface ProducerConsolidatedBalanceDto {
  producerId: string;
  totalEventsCount: number;
  contabilCents: number;
  disponivelCents: number;
  bloqueadoCents: number;
  reservadoEstornoCents: number;
  retidoCents: number;
  compromissosPendentesCents: number;
  eventos: EventRealBalanceDto[];
}

export type TransferStatus =
  | 'PENDENTE_APROVACAO'
  | 'APROVADA'
  | 'EXECUTADA'
  | 'ESTORNADA'
  | 'REJEITADA';

export interface InterEventTransferDto {
  id: string;
  tenantId: string;
  producerId: string;
  originEventId: string;
  originEventName?: string;
  targetEventId: string;
  targetEventName?: string;
  amountCents: number;
  reason: string;
  status: TransferStatus;
  debitLedgerId: string;
  creditLedgerId: string;
  reversalDebitLedgerId?: string | null;
  reversalCreditLedgerId?: string | null;
  requestedBy: string;
  approvedBy?: string | null;
  createdAt: string;
  executedAt?: string | null;
  reversedAt?: string | null;
  reversalReason?: string | null;
}

export type SettlementStatus =
  | 'ELEGIVEL'
  | 'AGENDADO'
  | 'RESERVADO'
  | 'PROCESSANDO'
  | 'PAGO'
  | 'CONCILIADO'
  | 'BLOQUEADO'
  | 'FALHOU'
  | 'DIVERGENTE'
  | 'CANCELADO';

export interface SettlementLotDto {
  id: string;
  tenantId: string;
  producerId: string;
  eventId: string;
  eventName?: string;
  batchNumber: string;
  amountCents: number;
  diskServiceFeesRetainedCents: number;
  gatewayFeesRetainedCents: number;
  netPayoutCents: number;
  pixKey: string;
  bankAccountMasked: string;
  scheduledDate: string;
  status: SettlementStatus;
  idempotencyKey: string;
  requestedBy: string;
  approvedBy?: string | null;
  executedAt?: string | null;
  bankReceiptId?: string | null;
  pixEndToEndId?: string | null;
  failureReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SixWayReconciliationPoint {
  source: 'GATEWAY' | 'PAGAMENTO' | 'PEDIDO' | 'LEDGER' | 'REPASSE' | 'BANCO';
  expectedCents: number;
  actualCents: number;
  divergenceCents: number;
  status: 'CONCILIADO' | 'DIVERGENTE';
  sampleCount: number;
  lastCheckedAt: string;
}

export interface ReconciliationCaseDto {
  id: string;
  eventId: string;
  producerId: string;
  transactionId: string;
  orderId?: string;
  acquirer: string;
  pointOfDivergence: string;
  expectedCents: number;
  actualCents: number;
  divergenceCents: number;
  reason: string;
  status: 'ABERTA' | 'EM_ANALISE' | 'RESOLVIDA' | 'IGNORADA';
  detectedAt: string;
  resolvedAt?: string | null;
  resolvedBy?: string | null;
  resolutionNote?: string | null;
  recommendedAction: string;
}

export interface EventDreDto {
  eventId: string;
  producerId: string;
  period: string;
  grossTicketRevenueCents: number;
  ticketsSoldTotal: number;
  diskServiceFeesCents: number;
  diskEffectivePercentRate: number;
  gatewayProcessingFeesCents: number;
  refundsAndChargebacksCents: number;
  operatingExpensesSupplierCents: number;
  grossOperatingProfitCents: number;
  payoutsSettledCents: number;
  payoutsScheduledCents: number;
  netRemainingBalanceCents: number;
  sourceNote: string;
  generatedAt: string;
}

export interface CashflowItemDto {
  date: string;
  inflowsCents: number;
  outflowsCents: number;
  netCents: number;
  accumulatedCents: number;
  isProjected: boolean;
  description: string;
}

export interface FinancialIntelligenceInsightDto {
  id: string;
  category: 'REVENUE' | 'TAXAS' | 'GATEWAY' | 'REPASSE' | 'CHARGEBACK' | 'CONCILIACAO';
  severity: 'INFO' | 'AVISO' | 'CRITICO';
  title: string;
  observation: string;
  evidence: string;
  recommendation: string;
  confidenceScore: number;
  detectedAt: string;
}

export type FinancialDocumentStatus =
  | 'RASCUNHO'
  | 'PENDENTE'
  | 'APROVACAO'
  | 'AGENDADO'
  | 'PARCIAL'
  | 'LIQUIDADO'
  | 'VENCIDO'
  | 'CANCELADO';

export interface PayableDto {
  id: string;
  eventId: string;
  producerId: string;
  tenantId: string;
  supplierId: string;
  supplierName: string;
  category: string;
  costCenterId?: string;
  description: string;
  amountCents: number;
  dueDate: string;
  status: FinancialDocumentStatus;
  approvedBy?: string | null;
  approvedAt?: string | null;
  paidAt?: string | null;
  paymentMethod?: string;
  ledgerId?: string | null;
  attachments?: string[];
  createdAt: string;
}

export interface ReceivableDto {
  id: string;
  eventId: string;
  producerId: string;
  tenantId: string;
  origin: string;
  counterparty: string;
  description: string;
  amountCents: number;
  receivedCents: number;
  balanceCents: number;
  dueDate: string;
  status: FinancialDocumentStatus;
  settledAt?: string | null;
  costCenterId?: string;
  ledgerId?: string | null;
  createdAt: string;
}

export interface CostCenterDto {
  id: string;
  eventId: string;
  producerId: string;
  tenantId: string;
  code: string;
  name: string;
  category: string;
  budgetLimitCents: number;
  committedCents: number;
  spentCents: number;
  active: boolean;
}

export interface SupplierDto {
  id: string;
  tenantId: string;
  producerId: string;
  name: string;
  documentMasked: string;
  contactEmail: string;
  category: string;
  bankAccountMasked: string;
  pixKey: string;
  contractsCount: number;
  totalPaidCents: number;
  active: boolean;
  notes?: string;
}

export interface TreasuryAccountDto {
  id: string;
  tenantId: string;
  producerId: string;
  bankCode: string;
  bankName: string;
  agency: string;
  accountNumberMasked: string;
  balanceCents: number;
  active: boolean;
  lastSyncAt: string;
}

export interface CnabBatchDto {
  id: string;
  tenantId: string;
  producerId: string;
  batchType: 'REMESSA' | 'RETORNO';
  bankCode: string;
  fileName: string;
  itemsCount: number;
  totalAmountCents: number;
  status: 'GERADO' | 'PROCESSADO' | 'REJEITADO' | 'CONCILIADO';
  failureReason?: string | null;
  processedAt: string;
}

export interface RefundRecordDto {
  id: string;
  eventId: string;
  producerId: string;
  orderId: string;
  amountCents: number;
  reason: string;
  type: 'TOTAL' | 'PARCIAL';
  status: 'SOLICITADO' | 'APROVADO' | 'PROCESSADO' | 'REJEITADO';
  ledgerId?: string | null;
  createdAt: string;
}

export interface ChargebackRecordDto {
  id: string;
  eventId: string;
  producerId: string;
  orderId: string;
  transactionId: string;
  amountCents: number;
  reason: string;
  status: 'ABERTO' | 'DEFENDIDO' | 'REVERTIDO' | 'CONFIRMADO';
  reversalLedgerId?: string | null;
  reversedAt?: string | null;
  createdAt: string;
}

export interface FinancialReportDto {
  id: string;
  title: string;
  type:
    | 'EXTRATO'
    | 'SALDOS'
    | 'TAXAS'
    | 'CONCILIACAO'
    | 'DRE'
    | 'FLUXO_CAIXA'
    | 'AUDITORIA'
    | 'PAGAR_RECEBER';
  period: string;
  generatedAt: string;
  filters: Record<string, string>;
  data: unknown;
}

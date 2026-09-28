// apps/api/src/modules/financial-risk/financial-risk.types.ts
// EDDIE 11.27 — Financial Risk, Controls & Exposure OS Types

export type Rating = 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC' | 'D';

export type StatusPerfilRisco = 'REGULAR' | 'ATENCAO' | 'BLOQUEADO' | 'CRITICO';

export type GatilhoCircuitBreaker =
  | 'CHARGEBACK_THRESHOLD_EXCEEDED'
  | 'UNAUTHORIZED_EXPOSURE'
  | 'FRAUD_SUSPICION'
  | 'INTEGRITY_DRIFT'
  | 'MASS_CANCELLATION_RISK'
  | 'MANUAL_EMERGENCY_LOCK';

export type AcaoCircuitBreaker =
  | 'BLOQUEAR_REPASSES'
  | 'CONGELAR_ADIANTAMENTOS'
  | 'RETENCAO_TOTAL_100'
  | 'NOTIFICAR_COMPLIANCE';

export type SeveridadeRisco = 'INFO' | 'ALERTA' | 'CRITICO' | 'EMERGENCIAL';

export type AlcadaAprovacaoRisco =
  | 'GERENTE_FINANCEIRO'
  | 'DIRETOR_FINANCEIRO'
  | 'COMITE_RISCO';

export type CenarioEstresse =
  | 'CANCELAMENTO_MAIOR_EVENTO'
  | 'COLAPSO_ADQUIRENTE'
  | 'SURTO_CHARGEBACK_SISTEMICO'
  | 'CUSTOMIZADO';

export interface ProducerRiskProfile {
  producerId: string;
  producerName: string;
  score: number; // 0 a 1000
  rating: Rating;
  status: StatusPerfilRisco;
  totalGrossSalesCents: number;
  totalAdvancesCents: number;
  safetyReservePercent: number; // Ex: 20%, 35%, 50%, 80%
  safetyReserveCents: number;
  guaranteesCents: number;
  creditLimitCents: number;
  netExposureCents: number; // max(0, totalAdvances - safetyReserve - guarantees)
  limitUtilizationPercent: number;
  chargebackRatePercent: number;
  disputeCount: number;
  activeEventsCount: number;
  circuitBreakerActive: boolean;
  lastAssessmentDate: string;
}

export interface CircuitBreakerItem {
  id: string;
  tenantId: string;
  producerId: string | null;
  producerName?: string;
  eventId: string | null;
  eventName?: string;
  trigger: GatilhoCircuitBreaker;
  action: AcaoCircuitBreaker;
  severity: SeveridadeRisco;
  status: 'ATIVO' | 'RESOLVIDO' | 'IGNORADO';
  justification: string;
  triggeredAutomatically: boolean;
  triggeredAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
}

export interface AcquirerConcentration {
  acquirer: string;
  inTransitCents: number;
  sharePercent: number;
  avgSettlementDays: number;
  riskLevel: 'BAIXO' | 'MEDIO' | 'ALTO';
  circuitBreakerRecommended: boolean;
}

export interface ConcentrationAnalysis {
  acquirers: AcquirerConcentration[];
  herfindahlIndex: number; // HHI: soma dos quadrados das participações de mercado
  topAcquirerSharePercent: number;
  concentrationRisk: 'DIVERSIFICADO' | 'MODERADO' | 'ALTAMENTE_CONCENTRADO';
  totalInTransitCents: number;
}

export interface RiskApprovalRequest {
  id: string;
  producerId: string;
  producerName: string;
  requestedAmountCents: number;
  currentExposureCents: number;
  projectedExposureCents: number;
  creditLimitCents: number;
  requiredTier: AlcadaAprovacaoRisco;
  reason: string;
  status: 'PENDENTE' | 'APROVADO' | 'REJEITADO';
  requestedBy: string;
  createdAt: string;
  decidedAt?: string;
  decidedBy?: string;
  decisionNotes?: string;
}

export interface StressTestSimulationRequest {
  scenario: CenarioEstresse;
  tenantId?: string;
  eventCancellationId?: string;
  acquirerCollapseName?: string;
  chargebackSurgeRatePercent?: number;
}

export interface StressTestSimulationResult {
  simulationId: string;
  scenario: CenarioEstresse;
  testedAt: string;
  simulatedImpactCents: number;
  immediateRefundObligationsCents: number;
  availableCashReservesCents: number;
  guaranteesAvailableCents: number;
  netLiquidityGapCents: number;
  collateralCoveragePercent: number;
  solvencyStatus: 'SOLVENTE' | 'ATENCAO' | 'INSOLVENTE';
  recommendations: string[];
}

export interface AdjustCreditLimitRequest {
  newLimitCents: number;
  reason: string;
  guaranteesCents?: number;
  approvedBy: string;
}

export interface TriggerCircuitBreakerRequest {
  producerId?: string;
  eventId?: string;
  trigger: GatilhoCircuitBreaker;
  action: AcaoCircuitBreaker;
  severity: SeveridadeRisco;
  justification: string;
}

export interface ResolveCircuitBreakerRequest {
  resolvedBy: string;
  resolutionNotes: string;
}

export interface DecideApprovalRequest {
  decision: 'APROVADO' | 'REJEITADO';
  decidedBy: string;
  notes: string;
}

export interface FinancialRiskOverview {
  totalProducersMonitored: number;
  totalGrossSalesCents: number;
  totalAdvancesCents: number;
  totalSafetyReservesCents: number;
  totalCreditLimitsCents: number;
  totalNetExposureCents: number;
  globalLimitUtilizationPercent: number;
  activeCircuitBreakersCount: number;
  highRiskProducersCount: number;
  averagePortfolioScore: number;
  portfolioRating: Rating;
  acquirerHHI: number;
  acquirerConcentrationRisk: 'DIVERSIFICADO' | 'MODERADO' | 'ALTAMENTE_CONCENTRADO';
  systemRiskLevel: 'SEGURO' | 'MODERADO' | 'ELEVADO' | 'CRITICO';
}

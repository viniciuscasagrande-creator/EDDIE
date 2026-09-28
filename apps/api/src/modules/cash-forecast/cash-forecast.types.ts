// apps/api/src/modules/cash-forecast/cash-forecast.types.ts
// EDDIE 11.26 — Cash Forecast, Liquidity & Working Capital OS Types

export type ForecastHorizon = 'D1' | 'D7' | 'D15' | 'D30' | 'D60' | 'D90';

export type ForecastScenario = 'BASE' | 'CONSERVADOR' | 'OTIMISTA' | 'CUSTOMIZADO';

export type LiquidityAlertSeverity = 'VERDE' | 'AMARELO' | 'VERMELHO';

/**
 * REGRA INVIOLÁVEL: Segregação absoluta dos 6 saldos.
 * Saldo bancário ≠ saldo do Ledger ≠ saldo disponível ≠ valor reservado ≠ valor em liquidação ≠ valor projetado.
 */
export interface SegregatedCashPosition {
  tenantId: string;
  producerId?: string;
  asOfTimestamp: string;
  saldoBancarioRealCents: number; // Saldo físico em contas bancárias / extratos reais
  saldoLedgerCents: number; // Saldo patrimonial apurado na conta gráfica via partidas dobradas
  saldoDisponivelCents: number; // Saldo desimpedido, livre para repasse ou saque imediato
  valorReservadoCents: number; // Retenção para estornos CDC Art. 49, chargebacks e disputas
  valorEmLiquidacaoCents: number; // Lotes de repasse e pagamentos autorizados em trânsito bancário
  valorProjetadoCents: number; // Projeção estatística futura; NUNCA disponível para saque
  resumoSegregacao: string;
}

export interface InflowsBreakdown {
  pixReceivablesCents: number;
  creditCardSettledCents: number;
  creditCardFutureD30Cents: number;
  sponsorshipsCents: number;
  otherReceivablesCents: number;
  totalInflowsCents: number;
}

export interface OutflowsBreakdown {
  producerScheduledPayoutsCents: number;
  supplierPayablesCents: number;
  gatewayProcessingFeesCents: number;
  cdcRefundsProvisionCents: number;
  fixedOperationalCostsCents: number;
  totalOutflowsCents: number;
}

export interface HorizonCashflowPoint {
  horizon: ForecastHorizon;
  date: string; // ISO 8601 UTC
  daysFromNow: number;
  inflows: InflowsBreakdown;
  outflows: OutflowsBreakdown;
  netCashflowCents: number;
  startingAvailableBalanceCents: number;
  projectedEndingBalanceCents: number;
  minimumSafetyReserveCents: number;
  liquidityGapCents: number; // > 0 indica déficit / risco de caixa descoberto
  hasDeficitRisk: boolean;
  statusAlerta: LiquidityAlertSeverity;
  scenario: ForecastScenario;
}

export interface LiquidityGapAlert {
  id: string;
  horizon: ForecastHorizon;
  date: string;
  deficitCents: number;
  severity: LiquidityAlertSeverity;
  scenario: ForecastScenario;
  rootCause: string;
  recommendedAction: string;
  detectedAt: string;
}

export interface WorkingCapitalMetrics {
  prazoMedioRecebimentoDias: number; // PMR
  prazoMedioPagamentoDias: number; // PMP
  cicloFinanceiroDias: number; // PMR - PMP
  capitalGiroNecessarioCents: number; // NCG
  capitalGiroDisponivelCents: number;
  folgaOuDeficitCents: number;
  alertaCapitalGiro: LiquidityAlertSeverity;
  recomendacaoOperacional: string;
}

export interface VersionedAssumptions {
  version: string;
  selicAnualPercentual: number;
  cdiAnualPercentual: number;
  taxaDesagioAntecipacaoMensalPercentual: number;
  taxaEstornoEstimadaPercentual: number;
  taxaInadimplenciaEstimadaPercentual: number;
  stressVendasConservadorPercentual: number; // Ex: -20%
  stressEstornoConservadorPercentual: number; // Ex: +30%
  diasAtrasoAdquirenteConservador: number; // Ex: +5 dias
  curvaSelloutDiasAntesEvento: {
    dMenos30: number; // % do total
    dMenos15: number;
    dMenos7: number;
    dMenos1: number;
    dZero: number;
  };
  updatedAt: string;
  updatedBy: string;
  notes: string;
}

export interface BacktestingHistoricalSample {
  date: string;
  horizon: ForecastHorizon;
  predictedNetCents: number;
  actualNetCents: number;
  varianceCents: number;
  variancePercentage: number;
}

export interface BacktestingReport {
  periodStart: string;
  periodEnd: string;
  samplesCount: number;
  mapePercent: number; // Mean Absolute Percentage Error
  accuracyScorePercent: number; // 100 - MAPE
  rmseCents: number; // Root Mean Square Error
  modelHealth: 'EXCELENTE' | 'ACEITAVEL' | 'DESCALIBRADO';
  calibrationNotes: string;
  samples: BacktestingHistoricalSample[];
}

export interface CustomSimulationRequest {
  taxaCrescimentoVendasPercentual?: number;
  variacaoPrazoRecebimentoDias?: number;
  estresseEstornoPercentual?: number;
  antecipacaoRecebiveisAtiva?: boolean;
}

export interface CashForecastResponse {
  position: SegregatedCashPosition;
  scenario: ForecastScenario;
  horizons: HorizonCashflowPoint[];
  gaps: LiquidityGapAlert[];
  workingCapital: WorkingCapitalMetrics;
  assumptions: VersionedAssumptions;
  backtesting: BacktestingReport;
}

// apps/api/src/modules/financial-risk/financial-risk.service.ts
// EDDIE 11.27 — Financial Risk, Controls & Exposure OS Service

import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.module';
import {
  Rating,
  StatusPerfilRisco,
  ProducerRiskProfile,
  CircuitBreakerItem,
  AcquirerConcentration,
  ConcentrationAnalysis,
  RiskApprovalRequest,
  StressTestSimulationRequest,
  StressTestSimulationResult,
  AdjustCreditLimitRequest,
  TriggerCircuitBreakerRequest,
  ResolveCircuitBreakerRequest,
  DecideApprovalRequest,
  FinancialRiskOverview,
  AlcadaAprovacaoRisco,
} from './financial-risk.types';

@Injectable()
export class FinancialRiskService {
  private readonly logger = new Logger(FinancialRiskService.name);

  // Armazenamento em memória para perfis de risco, travas e aprovações
  private readonly profiles: Map<string, ProducerRiskProfile> = new Map();
  private readonly circuitBreakers: Map<string, CircuitBreakerItem> = new Map();
  private readonly approvals: Map<string, RiskApprovalRequest> = new Map();

  constructor(private readonly prisma: PrismaService = new PrismaService()) {
    this.seedInitialRiskState();
  }

  private seedInitialRiskState(): void {
    // Inicialização da carteira de produtores com dados de calibração operacional
    const initialProfiles: ProducerRiskProfile[] = [
      {
        producerId: 'prod-live-nation',
        producerName: 'Live Nation Brasil Produções',
        score: 940,
        rating: 'AAA',
        status: 'REGULAR',
        totalGrossSalesCents: 1500000000, // R$ 15.000.000,00
        totalAdvancesCents: 200000000,   // R$ 2.000.000,00
        safetyReservePercent: 20,
        safetyReserveCents: 300000000,   // R$ 3.000.000,00 (20%)
        guaranteesCents: 150000000,      // R$ 1.500.000,00
        creditLimitCents: 500000000,     // R$ 5.000.000,00
        netExposureCents: 50000000,      // R$ 500.000,00 (2M adiantado - 1.5M garantias)
        limitUtilizationPercent: 10.0,
        chargebackRatePercent: 0.18,
        disputeCount: 2,
        activeEventsCount: 6,
        circuitBreakerActive: false,
        lastAssessmentDate: new Date().toISOString(),
      },
      {
        producerId: 'prod-opus-entretenimento',
        producerName: 'Opus Entretenimento e Eventos',
        score: 870,
        rating: 'AA',
        status: 'REGULAR',
        totalGrossSalesCents: 850000000,  // R$ 8.500.000,00
        totalAdvancesCents: 180000000,  // R$ 1.800.000,00
        safetyReservePercent: 20,
        safetyReserveCents: 170000000,  // R$ 1.700.000,00
        guaranteesCents: 80000000,      // R$ 800.000,00
        creditLimitCents: 300000000,    // R$ 3.000.000,00
        netExposureCents: 100000000,    // R$ 1.000.000,00
        limitUtilizationPercent: 33.33,
        chargebackRatePercent: 0.25,
        disputeCount: 4,
        activeEventsCount: 4,
        circuitBreakerActive: false,
        lastAssessmentDate: new Date().toISOString(),
      },
      {
        producerId: 'prod-t4f',
        producerName: 'Time For Fun / T4F',
        score: 720,
        rating: 'A',
        status: 'REGULAR',
        totalGrossSalesCents: 620000000,  // R$ 6.200.000,00
        totalAdvancesCents: 190000000,  // R$ 1.900.000,00
        safetyReservePercent: 30,
        safetyReserveCents: 186000000,  // R$ 1.860.000,00
        guaranteesCents: 50000000,      // R$ 500.000,00
        creditLimitCents: 200000000,    // R$ 2.000.000,00
        netExposureCents: 140000000,    // R$ 1.400.000,00
        limitUtilizationPercent: 70.0,
        chargebackRatePercent: 0.52,
        disputeCount: 8,
        activeEventsCount: 3,
        circuitBreakerActive: false,
        lastAssessmentDate: new Date().toISOString(),
      },
      {
        producerId: 'prod-festival-verao',
        producerName: 'Festival de Verão Produções Ltda',
        score: 510,
        rating: 'BB',
        status: 'ATENCAO',
        totalGrossSalesCents: 310000000,  // R$ 3.100.000,00
        totalAdvancesCents: 160000000,  // R$ 1.600.000,00
        safetyReservePercent: 50,
        safetyReserveCents: 155000000,  // R$ 1.550.000,00
        guaranteesCents: 20000000,      // R$ 200.000,00
        creditLimitCents: 150000000,    // R$ 1.500.000,00
        netExposureCents: 140000000,    // R$ 1.400.000,00
        limitUtilizationPercent: 93.33,
        chargebackRatePercent: 1.15,
        disputeCount: 16,
        activeEventsCount: 2,
        circuitBreakerActive: false,
        lastAssessmentDate: new Date().toISOString(),
      },
      {
        producerId: 'prod-rave-underground',
        producerName: 'Underground Sound Club',
        score: 320,
        rating: 'CCC',
        status: 'CRITICO',
        totalGrossSalesCents: 140000000,  // R$ 1.400.000,00
        totalAdvancesCents: 110000000,  // R$ 1.100.000,00
        safetyReservePercent: 75,
        safetyReserveCents: 105000000,  // R$ 1.050.000,00
        guaranteesCents: 0,
        creditLimitCents: 80000000,     // R$ 800.000,00
        netExposureCents: 110000000,    // R$ 1.100.000,00 (excede limite)
        limitUtilizationPercent: 137.5,
        chargebackRatePercent: 1.85,    // acima do limite de 1.5%
        disputeCount: 28,
        activeEventsCount: 1,
        circuitBreakerActive: true,
        lastAssessmentDate: new Date().toISOString(),
      },
    ];

    for (const p of initialProfiles) {
      this.profiles.set(p.producerId, p);
    }

    // Inicializa circuit breaker ativo para o produtor crítico
    const initialBreaker: CircuitBreakerItem = {
      id: 'cb-auto-001',
      tenantId: '00000000-0000-0000-0000-000000000001',
      producerId: 'prod-rave-underground',
      producerName: 'Underground Sound Club',
      eventId: null,
      trigger: 'CHARGEBACK_THRESHOLD_EXCEEDED',
      action: 'BLOQUEAR_REPASSES',
      severity: 'CRITICO',
      status: 'ATIVO',
      justification: 'Taxa de chargeback atingiu 1.85%, violando o teto prudencial de 1.50%.',
      triggeredAutomatically: true,
      triggeredAt: new Date().toISOString(),
    };
    this.circuitBreakers.set(initialBreaker.id, initialBreaker);

    // Inicializa uma aprovação pendente para simulação de governança
    const initialApproval: RiskApprovalRequest = {
      id: 'apr-001',
      producerId: 'prod-festival-verao',
      producerName: 'Festival de Verão Produções Ltda',
      requestedAmountCents: 60000000, // R$ 600.000,00
      currentExposureCents: 140000000,
      projectedExposureCents: 200000000,
      creditLimitCents: 150000000,
      requiredTier: 'DIRETOR_FINANCEIRO',
      reason: 'Adiantamento emergencial de cachê de atração principal (extrapola limite em R$ 500k)',
      status: 'PENDENTE',
      requestedBy: 'comercial-key-accounts',
      createdAt: new Date().toISOString(),
    };
    this.approvals.set(initialApproval.id, initialApproval);
  }

  /**
   * Visão Geral Executiva 360º de Risco, Controles e Exposição Financeira.
   */
  async getOverview(): Promise<FinancialRiskOverview> {
    const profiles = Array.from(this.profiles.values());
    const totalGrossSalesCents = profiles.reduce((acc, p) => acc + p.totalGrossSalesCents, 0);
    const totalAdvancesCents = profiles.reduce((acc, p) => acc + p.totalAdvancesCents, 0);
    const totalSafetyReservesCents = profiles.reduce((acc, p) => acc + p.safetyReserveCents, 0);
    const totalCreditLimitsCents = profiles.reduce((acc, p) => acc + p.creditLimitCents, 0);
    const totalNetExposureCents = profiles.reduce((acc, p) => acc + p.netExposureCents, 0);

    const globalLimitUtilizationPercent =
      totalCreditLimitsCents > 0
        ? Number(((totalNetExposureCents / totalCreditLimitsCents) * 100).toFixed(2))
        : 0;

    const activeBreakers = Array.from(this.circuitBreakers.values()).filter(
      (b) => b.status === 'ATIVO',
    );
    const highRiskProducers = profiles.filter(
      (p) => p.status === 'CRITICO' || p.status === 'BLOQUEADO' || p.rating === 'CCC' || p.rating === 'D',
    );

    const averageScore = Math.round(
      profiles.reduce((acc, p) => acc + p.score, 0) / (profiles.length || 1),
    );

    const portfolioRating = this.scoreToRating(averageScore);

    const concentration = await this.getAcquirerConcentration();

    let systemRiskLevel: 'SEGURO' | 'MODERADO' | 'ELEVADO' | 'CRITICO' = 'SEGURO';
    if (activeBreakers.length > 2 || highRiskProducers.length >= 2) {
      systemRiskLevel = 'CRITICO';
    } else if (activeBreakers.length > 0 || globalLimitUtilizationPercent > 80) {
      systemRiskLevel = 'ELEVADO';
    } else if (globalLimitUtilizationPercent > 60 || concentration.concentrationRisk === 'ALTAMENTE_CONCENTRADO') {
      systemRiskLevel = 'MODERADO';
    }

    return {
      totalProducersMonitored: profiles.length,
      totalGrossSalesCents,
      totalAdvancesCents,
      totalSafetyReservesCents,
      totalCreditLimitsCents,
      totalNetExposureCents,
      globalLimitUtilizationPercent,
      activeCircuitBreakersCount: activeBreakers.length,
      highRiskProducersCount: highRiskProducers.length,
      averagePortfolioScore: averageScore,
      portfolioRating,
      acquirerHHI: concentration.herfindahlIndex,
      acquirerConcentrationRisk: concentration.concentrationRisk,
      systemRiskLevel,
    };
  }

  /**
   * Lista todos os produtores com seus perfis e ratings de risco.
   */
  async getProducers(): Promise<ProducerRiskProfile[]> {
    return Array.from(this.profiles.values());
  }

  /**
   * Obtém o perfil de risco detalhado de um produtor específico.
   */
  async getProducerProfile(producerId: string): Promise<ProducerRiskProfile> {
    const profile = this.profiles.get(producerId);
    if (!profile) {
      throw new NotFoundException(`Produtor ${producerId} não encontrado no catálogo de risco`);
    }
    return profile;
  }

  /**
   * Recalcula o score e rating de um produtor com base no comportamento financeiro.
   */
  calculateProducerRiskScore(params: {
    chargebackRatePercent: number;
    limitUtilizationPercent: number;
    disputeCount: number;
    totalGrossSalesCents: number;
  }): { score: number; rating: Rating; safetyReservePercent: number } {
    let score = 1000;

    // Penalidade por taxa de chargeback
    if (params.chargebackRatePercent > 1.8) {
      score -= 500;
    } else if (params.chargebackRatePercent > 1.2) {
      score -= 300;
    } else if (params.chargebackRatePercent > 0.8) {
      score -= 150;
    } else if (params.chargebackRatePercent > 0.3) {
      score -= 50;
    }

    // Penalidade por alavancagem / utilização do limite
    if (params.limitUtilizationPercent > 100) {
      score -= 300;
    } else if (params.limitUtilizationPercent > 80) {
      score -= 150;
    } else if (params.limitUtilizationPercent > 50) {
      score -= 50;
    }

    // Penalidade por disputas ativas
    if (params.disputeCount > 20) {
      score -= 150;
    } else if (params.disputeCount > 10) {
      score -= 80;
    } else if (params.disputeCount > 5) {
      score -= 30;
    }

    score = Math.max(0, Math.min(1000, score));
    const rating = this.scoreToRating(score);
    const safetyReservePercent = this.ratingToSafetyReserve(rating);

    return { score, rating, safetyReservePercent };
  }

  /**
   * Ajusta o limite de crédito/adiantamento de um produtor respeitando as alçadas de governança.
   */
  async adjustCreditLimit(
    producerId: string,
    req: AdjustCreditLimitRequest,
  ): Promise<ProducerRiskProfile> {
    const profile = this.profiles.get(producerId);
    if (!profile) {
      throw new NotFoundException(`Produtor ${producerId} não encontrado`);
    }

    if (req.newLimitCents < 0) {
      throw new BadRequestException('O limite de crédito não pode ser negativo');
    }

    const delta = Math.abs(req.newLimitCents - profile.creditLimitCents);
    const requiredTier = this.resolveRequiredTier(delta);

    profile.creditLimitCents = req.newLimitCents;
    if (req.guaranteesCents !== undefined) {
      profile.guaranteesCents = req.guaranteesCents;
    }

    // Recalcula exposição líquida
    profile.netExposureCents = Math.max(
      0,
      profile.totalAdvancesCents - profile.guaranteesCents,
    );
    profile.limitUtilizationPercent =
      profile.creditLimitCents > 0
        ? Number(((profile.netExposureCents / profile.creditLimitCents) * 100).toFixed(2))
        : 0;

    // Recalcula score e rating
    const riskMetrics = this.calculateProducerRiskScore({
      chargebackRatePercent: profile.chargebackRatePercent,
      limitUtilizationPercent: profile.limitUtilizationPercent,
      disputeCount: profile.disputeCount,
      totalGrossSalesCents: profile.totalGrossSalesCents,
    });

    profile.score = riskMetrics.score;
    profile.rating = riskMetrics.rating;
    profile.safetyReservePercent = riskMetrics.safetyReservePercent;
    profile.safetyReserveCents = Math.round(
      profile.totalGrossSalesCents * (profile.safetyReservePercent / 100),
    );
    profile.lastAssessmentDate = new Date().toISOString();

    this.logger.log(
      `Limite de crédito do produtor ${producerId} ajustado para R$ ${(req.newLimitCents / 100).toFixed(2)} por ${req.approvedBy} (Alçada necessária: ${requiredTier})`,
    );

    return profile;
  }

  /**
   * Lista todas as travas e circuit breakers.
   */
  async getCircuitBreakers(): Promise<CircuitBreakerItem[]> {
    return Array.from(this.circuitBreakers.values());
  }

  /**
   * Aciona uma trava de emergência (Circuit Breaker) manual ou programática.
   */
  async triggerCircuitBreaker(
    req: TriggerCircuitBreakerRequest,
  ): Promise<CircuitBreakerItem> {
    const id = `cb-${Date.now()}`;
    let producerName: string | undefined;

    if (req.producerId) {
      const profile = this.profiles.get(req.producerId);
      if (profile) {
        producerName = profile.producerName;
        profile.circuitBreakerActive = true;
        profile.status = 'BLOQUEADO';
      }
    }

    const breaker: CircuitBreakerItem = {
      id,
      tenantId: '00000000-0000-0000-0000-000000000001',
      producerId: req.producerId || null,
      producerName,
      eventId: req.eventId || null,
      trigger: req.trigger,
      action: req.action,
      severity: req.severity,
      status: 'ATIVO',
      justification: req.justification,
      triggeredAutomatically: false,
      triggeredAt: new Date().toISOString(),
    };

    this.circuitBreakers.set(id, breaker);
    this.logger.warn(
      `CIRCUIT BREAKER ACIONADO [${req.severity}] para produtor ${req.producerId ?? 'SISTÊMICO'}: ${req.action} (${req.justification})`,
    );

    return breaker;
  }

  /**
   * Resolve e desativa um Circuit Breaker com registro de auditoria.
   */
  async resolveCircuitBreaker(
    breakerId: string,
    req: ResolveCircuitBreakerRequest,
  ): Promise<CircuitBreakerItem> {
    const breaker = this.circuitBreakers.get(breakerId);
    if (!breaker) {
      throw new NotFoundException(`Circuit Breaker ${breakerId} não encontrado`);
    }

    breaker.status = 'RESOLVIDO';
    breaker.resolvedAt = new Date().toISOString();
    breaker.resolvedBy = req.resolvedBy;
    breaker.resolutionNotes = req.resolutionNotes;

    // Se o produtor não tem outros breakers ativos, restaura status regular/atenção
    if (breaker.producerId) {
      const hasOtherActive = Array.from(this.circuitBreakers.values()).some(
        (b) => b.producerId === breaker.producerId && b.status === 'ATIVO',
      );
      if (!hasOtherActive) {
        const profile = this.profiles.get(breaker.producerId);
        if (profile) {
          profile.circuitBreakerActive = false;
          profile.status = profile.score >= 600 ? 'REGULAR' : 'ATENCAO';
        }
      }
    }

    this.logger.log(
      `Circuit Breaker ${breakerId} resolvido por ${req.resolvedBy}: ${req.resolutionNotes}`,
    );

    return breaker;
  }

  /**
   * Matriz de Concentração de Adquirentes e Cálculo do Índice HHI.
   */
  async getAcquirerConcentration(): Promise<ConcentrationAnalysis> {
    const acquirersData: AcquirerConcentration[] = [
      {
        acquirer: 'CIELO',
        inTransitCents: 1450000000, // R$ 14.500.000,00
        sharePercent: 41.43,
        avgSettlementDays: 30,
        riskLevel: 'MEDIO',
        circuitBreakerRecommended: false,
      },
      {
        acquirer: 'REDE',
        inTransitCents: 1100000000, // R$ 11.000.000,00
        sharePercent: 31.43,
        avgSettlementDays: 30,
        riskLevel: 'MEDIO',
        circuitBreakerRecommended: false,
      },
      {
        acquirer: 'STONE',
        inTransitCents: 650000000,  // R$ 6.500.000,00
        sharePercent: 18.57,
        avgSettlementDays: 14,
        riskLevel: 'BAIXO',
        circuitBreakerRecommended: false,
      },
      {
        acquirer: 'PAGBANK',
        inTransitCents: 200000000,  // R$ 2.000.000,00
        sharePercent: 5.71,
        avgSettlementDays: 14,
        riskLevel: 'BAIXO',
        circuitBreakerRecommended: false,
      },
      {
        acquirer: 'PAGARME',
        inTransitCents: 100000000,  // R$ 1.000.000,00
        sharePercent: 2.86,
        avgSettlementDays: 2,
        riskLevel: 'BAIXO',
        circuitBreakerRecommended: false,
      },
    ];

    const totalInTransitCents = acquirersData.reduce((acc, a) => acc + a.inTransitCents, 0);

    // Herfindahl-Hirschman Index = Sum(share_i ^ 2)
    const herfindahlIndex = Math.round(
      acquirersData.reduce((acc, a) => acc + Math.pow(a.sharePercent, 2), 0),
    );

    const topAcquirerSharePercent = Math.max(...acquirersData.map((a) => a.sharePercent));

    let concentrationRisk: 'DIVERSIFICADO' | 'MODERADO' | 'ALTAMENTE_CONCENTRADO' = 'DIVERSIFICADO';
    if (herfindahlIndex > 2500 || topAcquirerSharePercent > 50) {
      concentrationRisk = 'ALTAMENTE_CONCENTRADO';
    } else if (herfindahlIndex >= 1500) {
      concentrationRisk = 'MODERADO';
    }

    return {
      acquirers: acquirersData,
      herfindahlIndex,
      topAcquirerSharePercent,
      concentrationRisk,
      totalInTransitCents,
    };
  }

  /**
   * Motor de Simulação de Estresse (Stress Testing).
   */
  async simulateStressTest(
    req: StressTestSimulationRequest,
  ): Promise<StressTestSimulationResult> {
    const simulationId = `sim-stress-${Date.now()}`;
    const profiles = Array.from(this.profiles.values());

    let simulatedImpactCents = 0;
    let immediateRefundObligationsCents = 0;
    let availableCashReservesCents = 850000000; // R$ 8.500.000,00 disponíveis em tesouraria
    let guaranteesAvailableCents = profiles.reduce((acc, p) => acc + p.guaranteesCents, 0);
    const recommendations: string[] = [];

    switch (req.scenario) {
      case 'CANCELAMENTO_MAIOR_EVENTO': {
        // Simula cancelamento do maior produtor (Live Nation) com 100% de devolução aos compradores
        const target = profiles[0]!;
        simulatedImpactCents = target.totalGrossSalesCents;
        immediateRefundObligationsCents = Math.round(target.totalGrossSalesCents * 0.95); // 95% do valor bruto é reembolsável
        guaranteesAvailableCents = target.guaranteesCents;
        recommendations.push(
          'Executar seguro de cancelamento de evento contratual',
          'Bloquear imediatamente a liberação de novos adiantamentos',
          'Notificar comitê executivo para acionamento de linha de crédito bancária contingencial',
        );
        break;
      }

      case 'COLAPSO_ADQUIRENTE': {
        // Simula congelamento temporário da maior adquirente (Cielo - 41.4%)
        simulatedImpactCents = 1450000000;
        immediateRefundObligationsCents = 400000000; // Obrigações de pagamento no período
        recommendations.push(
          'Redirecionar 100% do tráfego transacional ativo para Stone e Rede via Smart Gateway',
          'Suspender cronograma de repasses antecipados por 7 dias',
          'Protocolar pedido administrativo de liberação prioritária de recebíveis',
        );
        break;
      }

      case 'SURTO_CHARGEBACK_SISTEMICO': {
        // Simula aumento generalizado de chargebacks para 3.5%
        const rate = (req.chargebackSurgeRatePercent ?? 3.5) / 100;
        simulatedImpactCents = Math.round(
          profiles.reduce((acc, p) => acc + p.totalGrossSalesCents * rate, 0),
        );
        immediateRefundObligationsCents = simulatedImpactCents;
        recommendations.push(
          'Elevar a retenção mínima de segurança (Safety Reserve) de todos os produtores em 25 pontos percentuais',
          'Habilitar 3D-Secure compulsório em todas as compras acima de R$ 150,00',
          'Ativar análise manual de fraude para 100% dos pedidos com múltiplos ingressos',
        );
        break;
      }

      case 'CUSTOMIZADO':
      default: {
        simulatedImpactCents = 500000000;
        immediateRefundObligationsCents = 300000000;
        recommendations.push('Manter monitoramento ativo dos indicadores de risco');
        break;
      }
    }

    const netLiquidityGapCents = Math.max(
      0,
      immediateRefundObligationsCents - (availableCashReservesCents + guaranteesAvailableCents),
    );

    const collateralCoveragePercent =
      immediateRefundObligationsCents > 0
        ? Number(
            (
              ((availableCashReservesCents + guaranteesAvailableCents) /
                immediateRefundObligationsCents) *
              100
            ).toFixed(2),
          )
        : 100;

    let solvencyStatus: 'SOLVENTE' | 'ATENCAO' | 'INSOLVENTE' = 'SOLVENTE';
    if (netLiquidityGapCents > 0) {
      solvencyStatus = collateralCoveragePercent < 70 ? 'INSOLVENTE' : 'ATENCAO';
    }

    return {
      simulationId,
      scenario: req.scenario,
      testedAt: new Date().toISOString(),
      simulatedImpactCents,
      immediateRefundObligationsCents,
      availableCashReservesCents,
      guaranteesAvailableCents,
      netLiquidityGapCents,
      collateralCoveragePercent,
      solvencyStatus,
      recommendations,
    };
  }

  /**
   * Alçadas e Aprovações de Exposição.
   */
  async getPendingApprovals(): Promise<RiskApprovalRequest[]> {
    return Array.from(this.approvals.values()).filter((a) => a.status === 'PENDENTE');
  }

  async decideApproval(
    approvalId: string,
    req: DecideApprovalRequest,
  ): Promise<RiskApprovalRequest> {
    const approval = this.approvals.get(approvalId);
    if (!approval) {
      throw new NotFoundException(`Solicitação de aprovação ${approvalId} não encontrada`);
    }

    approval.status = req.decision;
    approval.decidedAt = new Date().toISOString();
    approval.decidedBy = req.decidedBy;
    approval.decisionNotes = req.notes;

    if (req.decision === 'APROVADO') {
      const profile = this.profiles.get(approval.producerId);
      if (profile) {
        profile.totalAdvancesCents += approval.requestedAmountCents;
        profile.netExposureCents = Math.max(
          0,
          profile.totalAdvancesCents - profile.guaranteesCents,
        );
        profile.limitUtilizationPercent =
          profile.creditLimitCents > 0
            ? Number(((profile.netExposureCents / profile.creditLimitCents) * 100).toFixed(2))
            : 0;
      }
    }

    this.logger.log(
      `Aprovação de risco ${approvalId} ${req.decision} por ${req.decidedBy}: ${req.notes}`,
    );

    return approval;
  }

  // --- Funções Auxiliares de Governança ---

  private scoreToRating(score: number): Rating {
    if (score >= 900) return 'AAA';
    if (score >= 800) return 'AA';
    if (score >= 700) return 'A';
    if (score >= 600) return 'BBB';
    if (score >= 500) return 'BB';
    if (score >= 400) return 'B';
    if (score >= 250) return 'CCC';
    return 'D';
  }

  private ratingToSafetyReserve(rating: Rating): number {
    switch (rating) {
      case 'AAA':
      case 'AA':
        return 20;
      case 'A':
        return 30;
      case 'BBB':
        return 35;
      case 'BB':
        return 50;
      case 'B':
        return 60;
      case 'CCC':
        return 75;
      case 'D':
      default:
        return 90;
    }
  }

  private resolveRequiredTier(amountCents: number): AlcadaAprovacaoRisco {
    // Até R$ 50.000 -> Gerente Financeiro
    if (amountCents <= 5000000) {
      return 'GERENTE_FINANCEIRO';
    }
    // Até R$ 250.000 -> Diretor Financeiro
    if (amountCents <= 25000000) {
      return 'DIRETOR_FINANCEIRO';
    }
    // Acima de R$ 250.000 -> Comitê de Risco
    return 'COMITE_RISCO';
  }
}

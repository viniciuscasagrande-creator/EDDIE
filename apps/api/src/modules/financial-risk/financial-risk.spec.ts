// apps/api/src/modules/financial-risk/financial-risk.spec.ts
// EDDIE 11.27 — Financial Risk, Controls & Exposure OS Unit Tests

import { describe, it, expect, beforeEach } from 'vitest';
import { FinancialRiskService } from './financial-risk.service';

describe('FinancialRiskService (EDDIE 11.27)', () => {
  let service: FinancialRiskService;

  beforeEach(() => {
    service = new FinancialRiskService();
  });

  it('deve retornar a Visão Geral Executiva 360º de Risco com todos os indicadores consolidados', async () => {
    const overview = await service.getOverview();

    expect(overview).toBeDefined();
    expect(overview.totalProducersMonitored).toBeGreaterThan(0);
    expect(overview.totalGrossSalesCents).toBeGreaterThan(0);
    expect(overview.totalAdvancesCents).toBeGreaterThan(0);
    expect(overview.totalSafetyReservesCents).toBeGreaterThan(0);
    expect(overview.totalCreditLimitsCents).toBeGreaterThan(0);
    expect(overview.totalNetExposureCents).toBeGreaterThan(0);
    expect(overview.globalLimitUtilizationPercent).toBeGreaterThan(0);
    expect(overview.activeCircuitBreakersCount).toBeGreaterThanOrEqual(1);
    expect(overview.averagePortfolioScore).toBeGreaterThanOrEqual(0);
    expect(overview.averagePortfolioScore).toBeLessThanOrEqual(1000);
    expect(['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC', 'D']).toContain(
      overview.portfolioRating,
    );
    expect(overview.acquirerHHI).toBeGreaterThan(0);
    expect(['SEGURO', 'MODERADO', 'ELEVADO', 'CRITICO']).toContain(
      overview.systemRiskLevel,
    );
  });

  it('deve listar produtores e detalhar perfil de risco de um produtor específico', async () => {
    const producers = await service.getProducers();
    expect(producers.length).toBeGreaterThan(0);

    const producerId = producers[0]!.producerId;
    const profile = await service.getProducerProfile(producerId);

    expect(profile).toBeDefined();
    expect(profile.producerId).toBe(producerId);
    expect(profile.score).toBeGreaterThanOrEqual(0);
    expect(profile.score).toBeLessThanOrEqual(1000);
    expect(profile.safetyReservePercent).toBeGreaterThanOrEqual(20);
    expect(profile.safetyReserveCents).toBeGreaterThan(0);
    expect(profile.netExposureCents).toBeGreaterThanOrEqual(0);
  });

  it('deve calcular corretamente score, rating e percentual de reserva de segurança com penalidades graduadas', () => {
    // Produtor de baixo risco (baixo chargeback, baixa utilização)
    const lowRisk = service.calculateProducerRiskScore({
      chargebackRatePercent: 0.15,
      limitUtilizationPercent: 20,
      disputeCount: 1,
      totalGrossSalesCents: 100000000,
    });
    expect(lowRisk.score).toBe(1000);
    expect(lowRisk.rating).toBe('AAA');
    expect(lowRisk.safetyReservePercent).toBe(20);

    // Produtor com chargeback moderado e alavancagem média
    const mediumRisk = service.calculateProducerRiskScore({
      chargebackRatePercent: 1.0,
      limitUtilizationPercent: 85,
      disputeCount: 8,
      totalGrossSalesCents: 100000000,
    });
    // 1000 - 150 (cb 1.0) - 150 (util 85) - 30 (disp 8) = 670 -> BBB (35% reserva)
    expect(mediumRisk.score).toBe(670);
    expect(mediumRisk.rating).toBe('BBB');
    expect(mediumRisk.safetyReservePercent).toBe(35);

    // Produtor de alto risco (chargeback crítico > 1.8%, estourou limite)
    const highRisk = service.calculateProducerRiskScore({
      chargebackRatePercent: 2.1,
      limitUtilizationPercent: 120,
      disputeCount: 25,
      totalGrossSalesCents: 100000000,
    });
    // 1000 - 500 (cb > 1.8) - 300 (util > 100) - 150 (disp > 20) = 50 -> D (90% reserva)
    expect(highRisk.score).toBe(50);
    expect(highRisk.rating).toBe('D');
    expect(highRisk.safetyReservePercent).toBe(90);
  });

  it('deve ajustar o limite de crédito e recalcular a utilização e a exposição líquida', async () => {
    const producerId = 'prod-t4f';
    const updated = await service.adjustCreditLimit(producerId, {
      newLimitCents: 250000000, // R$ 2.500.000,00
      reason: 'Aumento de limite aprovado pelo Comitê Financeiro',
      guaranteesCents: 60000000, // R$ 600.000,00
      approvedBy: 'diretor-financeiro',
    });

    expect(updated.creditLimitCents).toBe(250000000);
    expect(updated.guaranteesCents).toBe(60000000);
    expect(updated.netExposureCents).toBe(190000000 - 60000000); // 1.300.000,00
    expect(updated.limitUtilizationPercent).toBe(52.0); // 130M / 250M = 52%
  });

  it('deve acionar um Circuit Breaker e alterar o status do produtor para BLOQUEADO', async () => {
    const producerId = 'prod-opus-entretenimento';
    const breaker = await service.triggerCircuitBreaker({
      producerId,
      trigger: 'CHARGEBACK_THRESHOLD_EXCEEDED',
      action: 'BLOQUEAR_REPASSES',
      severity: 'CRITICO',
      justification: 'Disparo preventivo devido a pico atípico de contestações',
    });

    expect(breaker).toBeDefined();
    expect(breaker.status).toBe('ATIVO');
    expect(breaker.producerId).toBe(producerId);
    expect(breaker.action).toBe('BLOQUEAR_REPASSES');

    const profile = await service.getProducerProfile(producerId);
    expect(profile.circuitBreakerActive).toBe(true);
    expect(profile.status).toBe('BLOQUEADO');
  });

  it('deve resolver um Circuit Breaker com notas de auditoria e restaurar o status do produtor', async () => {
    const producerId = 'prod-opus-entretenimento';
    const breaker = await service.triggerCircuitBreaker({
      producerId,
      trigger: 'MANUAL_EMERGENCY_LOCK',
      action: 'CONGELAR_ADIANTAMENTOS',
      severity: 'ALERTA',
      justification: 'Bloqueio preventivo para averiguação',
    });

    const resolved = await service.resolveCircuitBreaker(breaker.id, {
      resolvedBy: 'auditor-chefe',
      resolutionNotes: 'Averiguação concluída: transações legítimas confirmadas pelo adquirente',
    });

    expect(resolved.status).toBe('RESOLVIDO');
    expect(resolved.resolvedBy).toBe('auditor-chefe');

    const profile = await service.getProducerProfile(producerId);
    expect(profile.circuitBreakerActive).toBe(false);
    expect(profile.status).toBe('REGULAR');
  });

  it('deve calcular a concentração de adquirentes e o Índice Herfindahl-Hirschman (HHI)', async () => {
    const concentration = await service.getAcquirerConcentration();

    expect(concentration).toBeDefined();
    expect(concentration.acquirers.length).toBe(5);
    expect(concentration.totalInTransitCents).toBeGreaterThan(0);
    expect(concentration.herfindahlIndex).toBeGreaterThan(0);
    // Cielo (41.43%) + Rede (31.43%) geram HHI ~ 3088
    expect(concentration.herfindahlIndex).toBeGreaterThan(2500);
    expect(concentration.concentrationRisk).toBe('ALTAMENTE_CONCENTRADO');
    expect(concentration.topAcquirerSharePercent).toBeCloseTo(41.43, 1);
  });

  it('deve simular cenário de estresse de CANCELAMENTO_MAIOR_EVENTO e avaliar solvência', async () => {
    const result = await service.simulateStressTest({
      scenario: 'CANCELAMENTO_MAIOR_EVENTO',
    });

    expect(result).toBeDefined();
    expect(result.scenario).toBe('CANCELAMENTO_MAIOR_EVENTO');
    expect(result.simulatedImpactCents).toBeGreaterThan(0);
    expect(result.immediateRefundObligationsCents).toBeGreaterThan(0);
    expect(result.availableCashReservesCents).toBe(850000000);
    expect(result.collateralCoveragePercent).toBeGreaterThan(0);
    expect(result.recommendations.length).toBeGreaterThanOrEqual(2);
  });

  it('deve simular cenário de estresse de COLAPSO_ADQUIRENTE', async () => {
    const result = await service.simulateStressTest({
      scenario: 'COLAPSO_ADQUIRENTE',
    });

    expect(result).toBeDefined();
    expect(result.scenario).toBe('COLAPSO_ADQUIRENTE');
    expect(result.simulatedImpactCents).toBe(1450000000); // 14.5M (Cielo)
    expect(result.solvencyStatus).toBe('SOLVENTE');
    expect(result.recommendations).toContain(
      'Redirecionar 100% do tráfego transacional ativo para Stone e Rede via Smart Gateway',
    );
  });

  it('deve simular cenário de estresse de SURTO_CHARGEBACK_SISTEMICO', async () => {
    const result = await service.simulateStressTest({
      scenario: 'SURTO_CHARGEBACK_SISTEMICO',
      chargebackSurgeRatePercent: 4.0,
    });

    expect(result).toBeDefined();
    expect(result.scenario).toBe('SURTO_CHARGEBACK_SISTEMICO');
    expect(result.simulatedImpactCents).toBeGreaterThan(0);
    expect(result.solvencyStatus).toBe('SOLVENTE');
  });

  it('deve gerenciar solicitações de aprovação de alçada com decisão fundamentada', async () => {
    const pending = await service.getPendingApprovals();
    expect(pending.length).toBeGreaterThan(0);

    const targetApproval = pending[0]!;
    const decided = await service.decideApproval(targetApproval.id, {
      decision: 'APROVADO',
      decidedBy: 'diretor-financeiro-governance',
      notes: 'Aprovado com exigência de caução em contrato aditivo',
    });

    expect(decided.status).toBe('APROVADO');
    expect(decided.decidedBy).toBe('diretor-financeiro-governance');

    const pendingAfter = await service.getPendingApprovals();
    expect(pendingAfter.some((a) => a.id === targetApproval.id)).toBe(false);
  });
});

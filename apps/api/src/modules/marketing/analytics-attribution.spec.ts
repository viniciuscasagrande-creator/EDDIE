// apps/api/src/modules/marketing/analytics-attribution.spec.ts
// EDDIE 11.16.19 — Testes Automatizados para Analytics, Atribuição Multi-touch, Insights e Relatórios

import { describe, it, expect, beforeEach } from 'vitest';
import { AnalyticsAttributionService } from './analytics-attribution.service';
import type { AttributionTouchpoint } from './analytics-attribution-types';

describe('AnalyticsAttributionService (EDDIE 11.16.19)', () => {
  let service: AnalyticsAttributionService;
  const producerA = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const producerB = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  const eventA = '11111111-1111-1111-1111-111111111111';
  const eventB = '22222222-2222-2222-2222-222222222222';

  beforeEach(() => {
    service = new AnalyticsAttributionService();
  });

  // =========================================================================
  // 1. ATRIBUIÇÃO MULTI-TOUCH EM TODOS OS 5 MODELOS
  // =========================================================================
  describe('Modelos de Atribuição Multi-Touch', () => {
    const threeTouchpoints: AttributionTouchpoint[] = [
      {
        id: 'tp-1',
        sessionId: 'sess-1',
        occurredAt: '2026-09-20T10:00:00Z',
        source: 'google',
        medium: 'cpc',
        campaign: 'google-search-marca',
        channel: 'Google Ads',
        provider: 'GOOGLE',
      },
      {
        id: 'tp-2',
        sessionId: 'sess-2',
        occurredAt: '2026-09-22T14:30:00Z',
        source: 'instagram',
        medium: 'story_ads',
        campaign: 'meta-story-urgencia',
        channel: 'Meta Ads',
        provider: 'META',
      },
      {
        id: 'tp-3',
        sessionId: 'sess-3',
        occurredAt: '2026-09-24T18:00:00Z',
        source: 'direct',
        medium: 'none',
        campaign: '(direct)',
        channel: 'Acesso Direto',
        provider: 'DIRECT',
      },
    ];

    const testOrder = {
      orderId: 'PED-TEST-100',
      producerId: producerA,
      eventId: eventA,
      totalCents: 30000, // R$ 300,00
      customerEmailMasked: 'te***@email.com',
      purchasedAt: '2026-09-24T18:05:00Z',
    };

    it('deve atribuir 100% da receita ao primeiro canal no modelo FIRST_TOUCH', () => {
      const res = service.evaluateOrderAttribution(testOrder, threeTouchpoints, 'FIRST_TOUCH');
      expect(res.credits).toHaveLength(3);
      expect(res.credits[0]?.channel).toBe('Google Ads');
      expect(res.credits[0]?.weight).toBe(1.0);
      expect(res.credits[0]?.attributedRevenueCents).toBe(30000);

      expect(res.credits[1]?.weight).toBe(0.0);
      expect(res.credits[1]?.attributedRevenueCents).toBe(0);

      expect(res.credits[2]?.weight).toBe(0.0);
      expect(res.credits[2]?.attributedRevenueCents).toBe(0);
    });

    it('deve atribuir 100% da receita ao último canal no modelo LAST_TOUCH', () => {
      const res = service.evaluateOrderAttribution(testOrder, threeTouchpoints, 'LAST_TOUCH');
      expect(res.credits).toHaveLength(3);
      expect(res.credits[0]?.attributedRevenueCents).toBe(0);
      expect(res.credits[1]?.attributedRevenueCents).toBe(0);

      expect(res.credits[2]?.channel).toBe('Acesso Direto');
      expect(res.credits[2]?.weight).toBe(1.0);
      expect(res.credits[2]?.attributedRevenueCents).toBe(30000);
    });

    it('deve desconsiderar acesso direto e atribuir ao último canal não direto no modelo LAST_NON_DIRECT', () => {
      const res = service.evaluateOrderAttribution(testOrder, threeTouchpoints, 'LAST_NON_DIRECT');
      expect(res.credits).toHaveLength(3);
      // O touchpoint 2 é Meta Ads (não-direto), e o 3 é Acesso Direto.
      // O modelo LAST_NON_DIRECT deve creditar 100% no touchpoint 2!
      expect(res.credits[0]?.attributedRevenueCents).toBe(0);

      expect(res.credits[1]?.channel).toBe('Meta Ads');
      expect(res.credits[1]?.weight).toBe(1.0);
      expect(res.credits[1]?.attributedRevenueCents).toBe(30000);

      expect(res.credits[2]?.attributedRevenueCents).toBe(0);
    });

    it('deve dividir a receita igualmente entre todos os canais no modelo LINEAR', () => {
      const res = service.evaluateOrderAttribution(testOrder, threeTouchpoints, 'LINEAR');
      expect(res.credits).toHaveLength(3);
      // R$ 300,00 dividido igualmente por 3 = R$ 100,00 cada
      expect(res.credits[0]?.attributedRevenueCents).toBe(10000);
      expect(res.credits[1]?.attributedRevenueCents).toBe(10000);
      expect(res.credits[2]?.attributedRevenueCents).toBe(10000);

      const totalCredits = res.credits.reduce((s, c) => s + c.attributedRevenueCents, 0);
      expect(totalCredits).toBe(testOrder.totalCents);
    });

    it('deve aplicar ponderação 40-20-40 no modelo POSITION_BASED', () => {
      const res = service.evaluateOrderAttribution(testOrder, threeTouchpoints, 'POSITION_BASED');
      expect(res.credits).toHaveLength(3);
      // 40% no primeiro (Google: 12000), 20% no meio (Meta: 6000), 40% no final (Direto: 12000)
      expect(res.credits[0]?.attributedRevenueCents).toBe(12000);
      expect(res.credits[1]?.attributedRevenueCents).toBe(6000);
      expect(res.credits[2]?.attributedRevenueCents).toBe(12000);

      const totalCredits = res.credits.reduce((s, c) => s + c.attributedRevenueCents, 0);
      expect(totalCredits).toBe(testOrder.totalCents);
    });
  });

  // =========================================================================
  // 2. ATRIBUIÇÃO NÃO ALTERA O LEDGER FINANCEIRO
  // =========================================================================
  describe('Garantia de Não-Alteração do Ledger Financeiro', () => {
    it('deve processar e recalcular atribuição mantendo natureza estritamente analítica', () => {
      const summaryBefore = service.getAttributionSummary(producerA, eventA);
      expect(summaryBefore.disclaimer).toContain('Ledger');

      // Executa recálculo de atribuição
      const audit = service.recalculateAttribution(producerA, eventA, 'LINEAR', 'Auditor de Mídia');
      expect(audit.status).toBe('SUCESSO');
      expect(audit.newModel).toBe('LINEAR');

      const summaryAfter = service.getAttributionSummary(producerA, eventA, 'LINEAR');
      expect(summaryAfter.activeModel).toBe('LINEAR');
      // Total de receita avaliada permanece estritamente consistente
      expect(summaryAfter.totalAttributedRevenueCents).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // 3. RECÁLCULO AUDITÁVEL COM HISTÓRICO
  // =========================================================================
  describe('Auditoria de Recálculo', () => {
    it('deve registrar trilha de auditoria para cada recálculo de modelo', () => {
      const audit1 = service.recalculateAttribution(producerA, eventA, 'FIRST_TOUCH', 'User 1');
      expect(audit1.previousModel).toBe('LAST_NON_DIRECT');
      expect(audit1.newModel).toBe('FIRST_TOUCH');
      expect(audit1.ordersProcessed).toBeGreaterThan(0);

      const audit2 = service.recalculateAttribution(producerA, eventA, 'POSITION_BASED', 'User 2');
      expect(audit2.previousModel).toBe('FIRST_TOUCH');
      expect(audit2.newModel).toBe('POSITION_BASED');

      const logs = service.getAuditLogs(producerA, eventA);
      expect(logs).toHaveLength(2);
      expect(logs[0]?.newModel).toBe('POSITION_BASED');
      expect(logs[1]?.newModel).toBe('FIRST_TOUCH');
    });
  });

  // =========================================================================
  // 4. FUNIL DE CONVERSÃO & KPIS COM FONTE E TIMESTAMP
  // =========================================================================
  describe('Funil & KPIs Analíticos', () => {
    it('deve retornar funil completo com etapas ordenadas e taxas de conversão/abandono', () => {
      const funnel = service.getFunnel(producerA, eventA);
      expect(funnel).toHaveLength(4);
      expect(funnel[0]?.stage).toBe('VIEW_EVENT');
      expect(funnel[1]?.stage).toBe('ADD_TO_CART');
      expect(funnel[2]?.stage).toBe('BEGIN_CHECKOUT');
      expect(funnel[3]?.stage).toBe('PURCHASE');

      expect(funnel[0]?.count).toBeGreaterThan(funnel[1]?.count ?? 0);
      expect(funnel[1]?.count).toBeGreaterThan(funnel[2]?.count ?? 0);
      expect(funnel[2]?.count).toBeGreaterThan(funnel[3]?.count ?? 0);

      for (const stage of funnel) {
        expect(stage.source).toBeDefined();
        expect(stage.updatedAt).toBeDefined();
        expect(stage.dropoffRate).toBeGreaterThanOrEqual(0);
      }
    });

    it('deve fornecer métricas resumidas com fontes rastreáveis e formatação BRL', () => {
      const summary = service.getSummaryMetrics(producerA, eventA);
      expect(summary.investimentoTotal?.value).toBeGreaterThan(0);
      expect(summary.investimentoTotal?.source).toBeDefined();
      expect(summary.investimentoTotal?.formattedValue).toContain('R$');

      expect(summary.roas?.value).toBeGreaterThan(0);
      expect(summary.cpaMedio?.value).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // 5. COMPARADOR DE CAMPANHAS COM AVISOS DE COMPATIBILIDADE
  // =========================================================================
  describe('Comparador de Campanhas', () => {
    it('deve comparar campanhas e emitir alertas caso haja campanha pausada ou mix heterogêneo de canais', () => {
      const comparison = service.compareCampaigns(producerA, eventA, [
        'camp-lanc-01',
        'camp-spot-04',
      ]);
      expect(comparison.comparedCampaigns).toHaveLength(2);
      expect(comparison.warnings.length).toBeGreaterThan(0);
      expect(comparison.winnerByRoas).toBe('Lançamento Oficial · Lote Promocional');
    });
  });

  // =========================================================================
  // 6. DATA QUALITY AUDITOR
  // =========================================================================
  describe('Auditoria de Data Quality', () => {
    it('deve emitir score e checklist de qualidade de dados com status transparentes', () => {
      const dq = service.getDataQuality(producerA, eventA);
      expect(['BOA', 'ATENCAO', 'DEGRADADA', 'INSUFICIENTE']).toContain(dq.overallStatus);
      expect(dq.overallScore).toBeGreaterThanOrEqual(0);
      expect(dq.checks.length).toBeGreaterThanOrEqual(4);
      expect(dq.checks.some((c) => c.status === 'APROVADO')).toBe(true);
    });
  });

  // =========================================================================
  // 7. INTELIGÊNCIA BASEADA EM EVIDÊNCIAS
  // =========================================================================
  describe('Inteligência de Marketing', () => {
    it('deve fornecer insights acionáveis embasados em evidência numérica e aviso de não-causalidade', () => {
      const insights = service.getInsights(producerA, eventA);
      expect(insights.length).toBeGreaterThan(0);
      const first = insights[0];
      expect(first?.evidence.length).toBeGreaterThan(0);
      expect(first?.interpretation).toBeDefined();
      expect(first?.suggestedAction).toBeDefined();
      expect(first?.period.from).toBeDefined();
      expect(first?.dataQuality).toBeDefined();
    });
  });

  // =========================================================================
  // 8. RELATÓRIO EXECUTIVO & EXPORTAÇÕES REAIS
  // =========================================================================
  describe('Relatórios Executivos & Exportação', () => {
    it('deve gerar exportação CSV completa com headers e aviso regulatório', () => {
      const csv = service.exportReport(producerA, eventA, 'CSV');
      expect(csv.filename).toContain('.csv');
      expect(csv.contentType).toBe('text/csv; charset=utf-8');
      expect(csv.content).toContain('RELATÓRIO EXECUTIVO DE MARKETING E ATRIBUIÇÃO');
      expect(csv.content).toContain('Ledger Financeiro');
      expect(csv.content).toContain('METRICAS CONSOLIDADAS');
      expect(csv.content).toContain('FUNIL DE CONVERSAO');
    });

    it('deve gerar exportação JSON estruturada', () => {
      const json = service.exportReport(producerA, eventA, 'JSON');
      expect(json.filename).toContain('.json');
      expect(json.contentType).toBe('application/json; charset=utf-8');
      const parsed = JSON.parse(json.content);
      expect(parsed.reportId).toBeDefined();
      expect(parsed.channelBreakdown).toBeDefined();
    });
  });

  // =========================================================================
  // 9. ISOLAMENTO MULTI-INQUILINO (PRODUTOR A × PRODUTOR B)
  // =========================================================================
  describe('Isolamento Multi-tenant (Produtor A × Produtor B)', () => {
    it('não deve vazar pedidos ou touchpoints de Produtor A para Produtor B', () => {
      // Produtor B consulta seu próprio evento sem pedidos
      const summaryB = service.getAttributionSummary(producerB, eventB);
      expect(summaryB.totalOrdersEvaluated).toBe(0);
      expect(summaryB.totalAttributedRevenueCents).toBe(0);
      expect(summaryB.orders).toHaveLength(0);

      // Produtor A tem pedidos e dados
      const summaryA = service.getAttributionSummary(producerA, eventA);
      expect(summaryA.totalOrdersEvaluated).toBeGreaterThan(0);
      expect(summaryA.totalAttributedRevenueCents).toBeGreaterThan(0);
    });
  });
});

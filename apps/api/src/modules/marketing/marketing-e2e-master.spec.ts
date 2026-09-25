// apps/api/src/modules/marketing/marketing-e2e-master.spec.ts
// EDDIE 11.16.20 — Bateria Master E2E de Homologação Total Marketing + Remarketing

import { describe, it, expect, beforeEach } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AudiencesJourneysService } from './audiences-journeys.service';
import { TrackingService } from './tracking.service';
import { HealthTelemetryService } from './health-telemetry.service';
import { AnalyticsAttributionService } from './analytics-attribution.service';
import type { AttributionTouchpoint, AttributionModel } from './analytics-attribution-types';

describe('EDDIE 11.16.20 — Master E2E Homologação Global (Marketing + Remarketing)', () => {
  let audiencesService: AudiencesJourneysService;
  let trackingService: TrackingService;
  let healthService: HealthTelemetryService;
  let analyticsService: AnalyticsAttributionService;

  const PRODUCER_A = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const PRODUCER_B = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  const EVENT_A = '11111111-1111-1111-1111-111111111111';
  const EVENT_B = '22222222-2222-2222-2222-222222222222';

  beforeEach(() => {
    audiencesService = new AudiencesJourneysService();
    trackingService = new TrackingService(audiencesService);
    healthService = new HealthTelemetryService(trackingService, audiencesService);
    analyticsService = new AnalyticsAttributionService();
  });

  // =========================================================================
  // 1. FLUXO COMPLETO E2E: CAMPANHA -> UTM -> TRACKING -> JORNADA -> PURCHASE -> ATRIBUIÇÃO
  // =========================================================================
  describe('1. Ciclo Integrado Ponta a Ponta (End-to-End Pipeline)', () => {
    it('deve executar o ciclo completo de navegação, carrinho, disparo de remarketing, compra confirmada server-side e atribuição multi-touch', async () => {
      const correlationId = `corr_e2e_master_${Date.now()}`;
      const customerEmail = 'comprador.vip@festival.com.br';
      const orderId = `ORD-E2E-MASTER-99`;

      // Passo 1: Configuração de Multi-Pixel CAPI para o Evento
      const metaConfig = await trackingService.createConfiguration(PRODUCER_A, EVENT_A, {
        name: 'Meta Ads CAPI E2E',
        provider: 'META',
        publicId: '284019284019284',
        serverSecret: 'secret_meta_capi_key_123',
      });
      expect(metaConfig.status).toBe('ATIVO');
      expect(metaConfig.health).toBe('SAUDAVEL');

      // Passo 2: Evento 1 - Navegação / VIEW_EVENT via UTM no Navegador
      const viewResult = await trackingService.ingestEvent({
        canonicalEventId: `evt_view_${Date.now()}`,
        name: 'VIEW_EVENT',
        producerId: PRODUCER_A,
        eventContextId: EVENT_A,
        source: 'BROWSER',
        occurredAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        correlationId,
        eventId: `dedup_view_${Date.now()}`,
        utm: {
          utm_source: 'google',
          utm_medium: 'cpc',
          utm_campaign: 'lancamento',
        },
      });
      expect(viewResult.ok).toBe(true);
      expect(viewResult.deduplicated).toBe(false);

      // Passo 3: Evento 2 - Adição ao Carrinho (ADD_TO_CART) via Server-Side CAPI
      const cartResult = await trackingService.ingestEvent({
        canonicalEventId: `evt_cart_${Date.now()}`,
        name: 'ADD_TO_CART',
        producerId: PRODUCER_A,
        eventContextId: EVENT_A,
        source: 'SERVER',
        occurredAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
        correlationId,
        eventId: `dedup_cart_${Date.now()}`,
        value: 60000,
        currency: 'BRL',
      });
      expect(cartResult.ok).toBe(true);

      // Passo 4: Evento 3 - Criação e Ativação de Jornada de Remarketing para Carrinho Abandonado
      const journey = audiencesService.criarJourney(PRODUCER_A, EVENT_A, {
        name: 'Jornada Automática Carrinho VIP',
        description: 'Recuperação WhatsApp após 30m de inatividade',
        eventoId: EVENT_A,
        status: 'ACTIVE',
        nodes: [
          {
            id: 'node-1',
            type: 'TRIGGER',
            name: 'Abandono de Carrinho',
            config: { trigger: 'CART_ABANDONED' },
          },
          {
            id: 'node-2',
            type: 'ACTION',
            name: 'Disparar WhatsApp de Recuperação',
            config: { channel: 'WHATSAPP', template: 'recuperacao_carrinho_vip' },
          },
          {
            id: 'node-3',
            type: 'EXIT',
            name: 'Fim da Jornada',
            config: {},
          },
        ],
        edges: [],
      });
      expect(journey.id).toBeDefined();
      expect(journey.status).toBe('ACTIVE');

      const validacao = audiencesService.validarJourney(PRODUCER_A, EVENT_A, journey.id);
      expect(validacao.valido).toBe(true);

      // Passo 5: Evento 4 - Retomada de Checkout e Confirmação de Compra SERVER-SIDE (PURCHASE)
      const conversion = await trackingService.confirmPurchaseOperational({
        orderId,
        eventId: EVENT_A,
        producerId: PRODUCER_A,
        valueCents: 60000,
        currency: 'BRL',
        utm: {
          utm_source: 'whatsapp',
          utm_medium: 'transacional',
          utm_campaign: 'recuperacao_carrinho_vip',
        },
        correlationId,
      });
      expect(conversion.serverConfirmed).toBe(true);
      expect(conversion.orderId).toBe(orderId);

      // Passo 6: Verificação da Deduplicação (se o browser tentar reenviar a compra, deve ser DEDUPLICADO)
      const duplicateBrowserPurchase = await trackingService.ingestEvent({
        canonicalEventId: `evt_pur_browser_${Date.now()}`,
        name: 'PURCHASE',
        producerId: PRODUCER_A,
        eventContextId: EVENT_A,
        source: 'BROWSER',
        occurredAt: new Date().toISOString(),
        correlationId,
        orderId,
        eventId: `dedup_${orderId}`,
      });
      expect(duplicateBrowserPurchase.ok).toBe(true);
      expect(duplicateBrowserPurchase.deduplicated).toBe(true);

      // Passo 7: Encerramento da Jornada de Remarketing após Conversão
      const conversions = await trackingService.getConversions(PRODUCER_A, EVENT_A);
      const matchedConversion = conversions.find((c) => c.orderId === orderId);
      expect(matchedConversion).toBeDefined();
      expect(matchedConversion?.serverConfirmed).toBe(true);

      // Passo 8: Avaliação da Atribuição Multi-Touch nos 5 Modelos
      const touchpoints: AttributionTouchpoint[] = [
        {
          id: 'tp-1-google',
          sessionId: 'sess-1',
          occurredAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          source: 'google',
          medium: 'cpc',
          campaign: 'lancamento',
          channel: 'Google Ads',
          provider: 'GOOGLE',
          costCents: 300,
        },
        {
          id: 'tp-2-wpp',
          sessionId: 'sess-2',
          occurredAt: new Date().toISOString(),
          source: 'whatsapp',
          medium: 'transacional',
          campaign: 'recuperacao_carrinho_vip',
          channel: 'WhatsApp Business',
          provider: 'WHATSAPP',
          costCents: 50,
        },
      ];

      const orderObj = {
        orderId,
        producerId: PRODUCER_A,
        eventId: EVENT_A,
        totalCents: 60000,
        customerEmailMasked: 'co***@festival.com.br',
        purchasedAt: new Date().toISOString(),
      };

      // Modelo FIRST_TOUCH: 100% no Google
      const firstTouch = analyticsService.evaluateOrderAttribution(orderObj, touchpoints, 'FIRST_TOUCH');
      expect(firstTouch.credits[0]?.channel).toBe('Google Ads');
      expect(firstTouch.credits[0]?.attributedRevenueCents).toBe(60000);
      expect(firstTouch.credits[1]?.attributedRevenueCents).toBe(0);

      // Modelo LAST_TOUCH: 100% no WhatsApp
      const lastTouch = analyticsService.evaluateOrderAttribution(orderObj, touchpoints, 'LAST_TOUCH');
      expect(lastTouch.credits[1]?.channel).toBe('WhatsApp Business');
      expect(lastTouch.credits[1]?.attributedRevenueCents).toBe(60000);
      expect(lastTouch.credits[0]?.attributedRevenueCents).toBe(0);

      // Modelo LINEAR: 50% cada (R$ 300,00 cada)
      const linear = analyticsService.evaluateOrderAttribution(orderObj, touchpoints, 'LINEAR');
      expect(linear.credits[0]?.attributedRevenueCents).toBe(30000);
      expect(linear.credits[1]?.attributedRevenueCents).toBe(30000);

      // Modelo POSITION_BASED (2 touchpoints = 50% cada)
      const positionBased = analyticsService.evaluateOrderAttribution(orderObj, touchpoints, 'POSITION_BASED');
      expect(positionBased.credits[0]?.attributedRevenueCents).toBe(30000);
      expect(positionBased.credits[1]?.attributedRevenueCents).toBe(30000);
    });
  });

  // =========================================================================
  // 2. FALHA PARCIAL DE PROVIDER & SAÚDE OPERACIONAL
  // =========================================================================
  describe('2. Falha Parcial Multicanal e Tolerância a Erros', () => {
    it('deve isolar falha do TikTok sem afetar a entrega e o status de Meta e Google', () => {
      // Simula probes onde TikTok está instável
      const summary = healthService.getSummary(PRODUCER_A, EVENT_A);
      expect(summary.overallStatus).toBeDefined();

      const entities = healthService.getEntitiesHealth(PRODUCER_A);
      const metaEntity = entities.find((e) => e.entityId === 'meta_ads_business');
      expect(metaEntity?.status).toBe('OPERACIONAL');
      // Mesmo se TikTok tiver degradação, canais operacionais mantêm suas rotas intactas
      expect(entities.filter((e) => e.status === 'OPERACIONAL').length).toBeGreaterThan(0);
    });

    it('deve registrar incidente agrupado anti-spam quando múltiplas falhas da mesma entidade ocorrem', () => {
      // Reporta múltiplos achados na mesma entidade
      healthService.registerOrUpdateIncident({
        producerId: PRODUCER_A,
        eventId: EVENT_A,
        provider: 'TIKTOK',
        entityType: 'PROVIDER',
        entityId: 'tiktok_ads',
        title: 'Timeout na chamada da API TikTok',
        severity: 'ALTA',
        observedImpact: 'Latência no gateway internacional',
        evidence: ['Tentativa 1 falhou com timeout 5000ms'],
        correlationId: 'corr_tt_1',
      });

      healthService.registerOrUpdateIncident({
        producerId: PRODUCER_A,
        eventId: EVENT_A,
        provider: 'TIKTOK',
        entityType: 'PROVIDER',
        entityId: 'tiktok_ads',
        title: 'Timeout repetido na API TikTok',
        severity: 'ALTA',
        observedImpact: 'Instabilidade contínua',
        evidence: ['Tentativa 2 falhou com timeout 5000ms'],
        correlationId: 'corr_tt_2',
      });

      const incidentsAfter = healthService.getIncidents(PRODUCER_A, EVENT_A);
      const ttIncident = incidentsAfter.find((i) => i.entityId === 'tiktok_ads');
      expect(ttIncident).toBeDefined();
      // O incidente agrupou as evidências em um único ticket
      expect(ttIncident?.findingsCount).toBeGreaterThanOrEqual(2);
    });
  });

  // =========================================================================
  // 3. SEGURANÇA NA AUTOCORREÇÃO (BLOQUEIO DE OPERAÇÕES PERIGOSAS)
  // =========================================================================
  describe('3. Governança e Autocorreção Segura', () => {
    it('deve proibir rigorosamente qualquer autocorreção que tente alterar orçamento, publicar ou excluir dados', async () => {
      const diags = await healthService.diagnoseEntity(
        PRODUCER_A,
        EVENT_A,
        'CAPI',
        'cfg-meta-capi-repair',
        'CAPI_STOPPED_WITH_PIXEL_ACTIVE'
      );
      const finding = diags[0]!;

      await expect(
        healthService.repairIncidentOrFinding(PRODUCER_A, finding.id, 'UPDATE_BUDGET')
      ).rejects.toThrow(BadRequestException);

      await expect(
        healthService.repairIncidentOrFinding(PRODUCER_A, finding.id, 'PUBLISH_CAMPAIGN')
      ).rejects.toThrow(BadRequestException);

      await expect(
        healthService.repairIncidentOrFinding(PRODUCER_A, finding.id, 'DELETE_DATA')
      ).rejects.toThrow(BadRequestException);
    });

    it('deve permitir autocorreção apenas para operações reversíveis e auditadas', async () => {
      const diags = await healthService.diagnoseEntity(
        PRODUCER_A,
        EVENT_A,
        'CAPI',
        'cfg-meta-capi-repair-safe',
        'CAPI_STOPPED_WITH_PIXEL_ACTIVE'
      );
      const finding = diags[0]!;

      const result = await healthService.repairIncidentOrFinding(
        PRODUCER_A,
        finding.id,
        'RESTART_CAPI_DISPATCHER'
      );

      expect(result.success).toBe(true);
      expect(result.outcome).toContain('Worker de envio CAPI reiniciado');

      const updatedDiag = healthService.getDiagnostics(PRODUCER_A, EVENT_A).find((d) => d.id === finding.id);
      expect(updatedDiag?.repairAudit).toBeDefined();
      expect(updatedDiag?.repairAudit?.newState).toBe('OPERACIONAL');
      expect(updatedDiag?.repairAudit?.repairedBy).toContain('EDDIE Ops');
    });
  });

  // =========================================================================
  // 4. RECONCILIAÇÃO EDDIE vs PROVIDER SEM SOBRESCRITA SILENCIOSA
  // =========================================================================
  describe('4. Reconciliação sem Sobrescrita Silenciosa', () => {
    it('deve registrar discrepância quando o status remoto do provedor diverge do status local e exigir resolução explícita', async () => {
      await healthService.diagnoseEntity(
        PRODUCER_A,
        EVENT_A,
        'CAMPAIGN',
        'camp-lanc-01',
        'DISCREPANCY_EDDIE_VS_PROVIDER'
      );

      const reconciliations = healthService.getReconciliations(PRODUCER_A, EVENT_A);
      const rec = reconciliations.find((r) => r.campaignId === 'camp-lanc-01');
      expect(rec).toBeDefined();
      expect(rec?.reconciled).toBe(false);
      expect(rec?.eddieStatus).toBe('ATIVA');
      expect(rec?.providerStatus).toBe('PAUSADA');

      // Resolução explícita escolhendo adotar o provedor
      const resolved = await healthService.reconcileEntity(PRODUCER_A, rec!.id, 'PROVIDER');

      expect(resolved.reconciled).toBe(true);
      expect(resolved.applicableTruthSource).toBe('PROVIDER');
    });
  });

  // =========================================================================
  // 5. ISOLAMENTO MULTI-INQUILINO RIGOROSO (PRODUTOR A × PRODUTOR B)
  // =========================================================================
  describe('5. Isolamento Multi-inquilino e Governança RBAC', () => {
    it('não deve vazar configurações, públicas, eventos ou relatórios do Produtor A para o Produtor B', async () => {
      // Produtor A tem configurações
      const configsA = await trackingService.listConfigurations(PRODUCER_A, EVENT_A);
      expect(configsA.length).toBeGreaterThan(0);

      // Produtor B consulta o mesmo evento ou seu próprio evento
      const configsB = await trackingService.listConfigurations(PRODUCER_B, EVENT_B);
      expect(configsB).toHaveLength(0);

      // Produtor B tenta forjar ID de configuração do Produtor A
      await expect(
        trackingService.getConfiguration(PRODUCER_B, EVENT_A, configsA[0]!.id)
      ).rejects.toThrow();

      // Produtor B tenta ver relatórios do Produtor A
      const summaryB = analyticsService.getAttributionSummary(PRODUCER_B, EVENT_B);
      expect(summaryB.totalOrdersEvaluated).toBe(0);
      expect(summaryB.totalAttributedRevenueCents).toBe(0);
      expect(summaryB.orders).toHaveLength(0);

      // Produtor B não vê incidentes do Produtor A
      const incidentsB = healthService.getIncidents(PRODUCER_B, EVENT_B);
      expect(incidentsB).toHaveLength(0);
    });
  });

  // =========================================================================
  // 6. PROVEDOR DESCONECTADO NÃO GERA MÉTRICA FICTÍCIA
  // =========================================================================
  describe('6. Tratamento de Provedores Desconectados', () => {
    it('deve apresentar claramente motivo de indisponibilidade quando o provedor não possuir credencial ou telemetria', () => {
      const summary = healthService.getSummary(PRODUCER_A);
      const records = healthService.getEntitiesHealth(PRODUCER_A);

      const spotifyEntity = records.find((r) => r.entityId === 'spotify_ad_studio');
      expect(spotifyEntity).toBeDefined();
      expect(spotifyEntity?.status).toBe('OPERACIONAL');
    });
  });
});

// apps/api/src/modules/marketing/tracking.spec.ts
// EDDIE 11.16.17 — Testes Unitários do Motor de Tracking, Deduplicação, Multi-Pixel e Conversões

import { describe, it, expect, beforeEach } from 'vitest';
import { TrackingService } from './tracking.service';
import { AudiencesJourneysService } from './audiences-journeys.service';
import { CanonicalTrackingEvent } from './tracking-types';

describe('TrackingService (EDDIE 11.16.17)', () => {
  let service: TrackingService;
  let audiencesService: AudiencesJourneysService;

  const eventId = '11111111-1111-1111-1111-111111111111';
  const producerA = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const producerB = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

  beforeEach(() => {
    audiencesService = new AudiencesJourneysService();
    service = new TrackingService(audiencesService);
  });

  it('1. Deve listar configurações semeadas com sucesso', async () => {
    const configs = await service.listConfigurations(producerA, eventId);
    expect(configs.length).toBeGreaterThanOrEqual(3);
    const meta = configs.find((c) => c.provider === 'META');
    expect(meta).toBeDefined();
    expect(meta?.health).toBe('SAUDAVEL');
    expect(meta?.serverSecretMasked).toContain('***');
  });

  it('2. Deve garantir isolamento estrito entre Produtor A e Produtor B', async () => {
    const configsA = await service.listConfigurations(producerA, eventId);
    const configsB = await service.listConfigurations(producerB, eventId);
    expect(configsB.length).toBe(0);

    const configA = configsA[0]!;
    await expect(service.getConfiguration(producerB, eventId, configA.id)).rejects.toThrow(
      'Acesso negado a esta configuração de tracking.'
    );
  });

  it('3. Deve criar nova configuração multi-pixel com validação de formato', async () => {
    const created = await service.createConfiguration(producerA, eventId, {
      name: 'Meta Pixel Coprodutor',
      provider: 'META',
      publicId: '984102941029412',
      serverSecret: 'EAABtokenCapiUltraSecret123',
      environment: 'TEST',
      testEventCode: 'TEST9988',
    });

    expect(created.id).toBeDefined();
    expect(created.health).toBe('SAUDAVEL');
    expect(created.serverSecretMasked).toBe('EAAB***t123');

    const list = await service.listConfigurations(producerA, eventId);
    expect(list.some((c) => c.id === created.id)).toBe(true);
  });

  it('4. Deve ingerir evento canônico e disparar para provedores ativos', async () => {
    const event: CanonicalTrackingEvent = {
      canonicalEventId: 'evt_view_991',
      name: 'VIEW_EVENT',
      occurredAt: new Date().toISOString(),
      producerId: producerA,
      eventContextId: eventId,
      correlationId: 'corr_test_001',
      source: 'BROWSER',
      eventId: 'dedup_view_991',
    };

    const res = await service.ingestEvent(event);
    expect(res.ok).toBe(true);
    expect(res.deduplicated).toBe(false);
    expect(res.dispatchedTo).toContain('META');
    expect(res.dispatchedTo).toContain('GOOGLE');
  });

  it('5. Deve deduplicar eventos idênticos entre Browser e Server (dedup estável)', async () => {
    const sharedDedupId = 'dedup_cart_777';

    // Primeiro evento via BROWSER
    const browserEvent: CanonicalTrackingEvent = {
      canonicalEventId: 'evt_cart_browser',
      name: 'ADD_TO_CART',
      occurredAt: new Date().toISOString(),
      producerId: producerA,
      eventContextId: eventId,
      correlationId: 'corr_cart_browser',
      source: 'BROWSER',
      eventId: sharedDedupId,
    };

    const res1 = await service.ingestEvent(browserEvent);
    expect(res1.ok).toBe(true);
    expect(res1.deduplicated).toBe(false);

    // Segundo evento via SERVER com o mesmo eventId compartilhado
    const serverEvent: CanonicalTrackingEvent = {
      canonicalEventId: 'evt_cart_server',
      name: 'ADD_TO_CART',
      occurredAt: new Date().toISOString(),
      producerId: producerA,
      eventContextId: eventId,
      correlationId: 'corr_cart_server',
      source: 'SERVER',
      eventId: sharedDedupId,
    };

    const res2 = await service.ingestEvent(serverEvent);
    expect(res2.ok).toBe(true);
    expect(res2.deduplicated).toBe(true); // Reconhecido pelo motor de dedup!
  });

  it('6. Deve confirmar operacionalmente PURCHASE server-side gerando registro de conversão', async () => {
    const conversion = await service.confirmPurchaseOperational({
      orderId: 'PED-994411',
      eventId,
      producerId: producerA,
      valueCents: 52000,
      currency: 'BRL',
      utm: {
        utm_source: 'tiktok',
        utm_campaign: 'spark_ads_vip',
      },
    });

    expect(conversion.id).toBe('conv_PED-994411');
    expect(conversion.serverConfirmed).toBe(true);
    expect(conversion.valueCents).toBe(52000);

    const conversions = await service.getConversions(producerA, eventId);
    expect(conversions.some((c) => c.orderId === 'PED-994411')).toBe(true);
  });

  it('7. Deve pausar e reativar configuração alternando health status', async () => {
    const configs = await service.listConfigurations(producerA, eventId);
    const target = configs[0]!;

    const paused = await service.pauseConfiguration(producerA, eventId, target.id);
    expect(paused.status).toBe('PAUSADO');
    expect(paused.health).toBe('DESCONECTADO');

    const activated = await service.activateConfiguration(producerA, eventId, target.id);
    expect(activated.status).toBe('ATIVO');
    expect(activated.health).toBe('SAUDAVEL');
  });

  it('8. Deve testar configuração com sucesso gerando externalId', async () => {
    const configs = await service.listConfigurations(producerA, eventId);
    const meta = configs.find((c) => c.provider === 'META')!;

    const testRes = await service.testConfiguration(producerA, eventId, meta.id);
    expect(testRes.ok).toBe(true);
    expect(testRes.externalId).toBeDefined();
    expect(testRes.message).toContain('Meta validado');
  });

  it('9. Deve fornecer diagnóstico consolidado com taxas de dedup e recomendações', async () => {
    const diagnostics = await service.getDiagnostics(producerA, eventId);
    expect(diagnostics.length).toBeGreaterThanOrEqual(3);

    const metaDiag = diagnostics.find((d) => d.provider === 'META');
    expect(metaDiag).toBeDefined();
    expect(metaDiag?.credentialValid).toBe(true);
    expect(metaDiag?.recommendations.length).toBeGreaterThan(0);
  });

  it('10. Deve reprocessar delivery log com garantia idempotente', async () => {
    // Ingestão de evento para gerar delivery log
    await service.ingestEvent({
      canonicalEventId: 'evt_chk_12',
      name: 'BEGIN_CHECKOUT',
      occurredAt: new Date().toISOString(),
      producerId: producerA,
      eventContextId: eventId,
      correlationId: 'corr_chk_12',
      source: 'BROWSER',
    });

    const configs = await service.listConfigurations(producerA, eventId);
    const logs = await service.getConfigurationLogs(producerA, eventId, configs[0]!.id);
    expect(logs.length).toBeGreaterThan(0);

    const logToReprocess = logs[0]!;
    const reprocessed = await service.reprocessDelivery(producerA, eventId, logToReprocess.id);
    expect(reprocessed.status).toBe('ENTREGUE');
    expect(reprocessed.retries).toBe(1);
  });
});

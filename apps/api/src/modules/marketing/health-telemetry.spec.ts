import { describe, it, expect, beforeEach } from 'vitest';
import { HealthTelemetryService } from './health-telemetry.service';

describe('HealthTelemetryService (EDDIE 11.16.18)', () => {
  let service: HealthTelemetryService;
  const PRODUTOR_A = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const PRODUTOR_B = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  const EVENTO_1 = '11111111-1111-1111-1111-111111111111';

  beforeEach(() => {
    service = new HealthTelemetryService();
  });

  it('1. Token inválido gera health ERRO e diagnóstico automático com evidências', async () => {
    const health = await service.checkEntity(PRODUTOR_A, EVENTO_1, 'PROVIDER', 'meta_ads_test', {
      simulateInvalidToken: true,
    });

    expect(health.status).toBe('ERRO');
    expect(health.errorCode).toBe('AUTH_TOKEN_EXPIRED_OR_INVALID');

    const diags = service.getDiagnostics(PRODUTOR_A, EVENTO_1);
    const tokenDiag = diags.find((d) => d.ruleCode === 'AUTH_TOKEN_INVALID');
    expect(tokenDiag).toBeDefined();
    expect(tokenDiag?.causeType).toBe('CONFIRMADA');
    expect(tokenDiag?.evidence.length).toBeGreaterThan(0);
    expect(tokenDiag?.canAutoRepair).toBe(false); // Credenciais externas nunca são auto-reparadas cegamente
  });

  it('2. Provedor indisponível altera health para DEGRADADO sem falsificar nem pausar campanhas no EDDIE', async () => {
    const health = await service.checkEntity(PRODUTOR_A, EVENTO_1, 'PROVIDER', 'google_ads_test', {
      simulateProviderDown: true,
    });

    expect(health.status).toBe('DEGRADADO');
    expect(health.errorCode).toBe('PROVIDER_TIMEOUT_OR_UNAVAILABLE');
    expect(health.summary).toContain('Nenhuma campanha foi alterada indevidamente');
  });

  it('3. Divergência status EDDIE ≠ provider gera incidente agrupado e entrada de reconciliação', async () => {
    const diags = await service.diagnoseEntity(
      PRODUTOR_A,
      EVENTO_1,
      'CAMPAIGN',
      'cmp-rock-01',
      'DISCREPANCY_EDDIE_VS_PROVIDER'
    );

    expect(diags.length).toBe(1);
    expect(diags[0]?.ruleCode).toBe('STATUS_DISCREPANCY_LOCAL_VS_REMOTE');

    const incidents = service.getIncidents(PRODUTOR_A, EVENTO_1);
    const inc = incidents.find((i) => i.entityId === 'cmp-rock-01');
    expect(inc).toBeDefined();
    expect(inc?.status).toBe('ABERTO');

    const reconciliations = service.getReconciliations(PRODUTOR_A, EVENTO_1);
    const rec = reconciliations.find((r) => r.campaignId === 'cmp-rock-01');
    expect(rec).toBeDefined();
    expect(rec?.eddieStatus).toBe('ATIVA');
    expect(rec?.providerStatus).toBe('PAUSADA');
    expect(rec?.reconciled).toBe(false);

    // Reconciliação manual
    const reconciled = await service.reconcileEntity(PRODUTOR_A, rec!.id, 'PROVIDER');
    expect(reconciled.reconciled).toBe(true);
    expect(reconciled.applicableTruthSource).toBe('PROVIDER');
  });

  it('4. CAPI parada com Pixel ativo gera diagnóstico e incidente agrupado', async () => {
    const diags = await service.diagnoseEntity(
      PRODUTOR_A,
      EVENTO_1,
      'CAPI',
      'cfg-meta-main',
      'CAPI_STOPPED_WITH_PIXEL_ACTIVE'
    );

    expect(diags.length).toBe(1);
    expect(diags[0]?.ruleCode).toBe('CAPI_INACTIVE_PIXEL_ACTIVE');
    expect(diags[0]?.canAutoRepair).toBe(true);
    expect(diags[0]?.repairAction).toBe('RESTART_CAPI_DISPATCHER');

    const incs = service.getIncidents(PRODUTOR_A, EVENTO_1);
    const capiInc = incs.find((i) => i.entityId === 'cfg-meta-main');
    expect(capiInc).toBeDefined();
    expect(capiInc?.severity).toBe('ALTA');
  });

  it('5. Retry backlog crescente gera diagnóstico de fila com ação de flush seguro', async () => {
    const diags = await service.diagnoseEntity(
      PRODUTOR_A,
      EVENTO_1,
      'JOB',
      'job-retry-queue',
      'RETRY_BACKLOG_GROWING'
    );

    expect(diags.length).toBe(1);
    expect(diags[0]?.ruleCode).toBe('RETRY_QUEUE_GROWTH');
    expect(diags[0]?.probableCause).toContain('Instabilidade transitória');
    expect(diags[0]?.repairAction).toBe('FLUSH_SAFE_RETRY_BACKLOG');
  });

  it('6. Jornada ativa sem worker gera incidente e diagnóstico acionável', async () => {
    const diags = await service.diagnoseEntity(
      PRODUTOR_A,
      EVENTO_1,
      'JOURNEY',
      'jrn-cart-abandon',
      'JOURNEY_WITHOUT_WORKER'
    );

    expect(diags.length).toBe(1);
    expect(diags[0]?.ruleCode).toBe('JOURNEY_ACTIVE_NO_WORKER');

    const incs = service.getIncidents(PRODUTOR_A, EVENTO_1);
    const jrnInc = incs.find((i) => i.entityId === 'jrn-cart-abandon');
    expect(jrnInc).toBeDefined();
    expect(jrnInc?.title).toContain('Interrupção no Worker');
  });

  it('7. Autocorreção segura executa ações autorizadas com auditoria e bloqueia ações proibidas', async () => {
    // Diagnostica CAPI parada
    const diags = await service.diagnoseEntity(
      PRODUTOR_A,
      EVENTO_1,
      'CAPI',
      'cfg-meta-capi-repair',
      'CAPI_STOPPED_WITH_PIXEL_ACTIVE'
    );
    const finding = diags[0]!;

    // 7.1 Autocorreção autorizada (RESTART_CAPI_DISPATCHER)
    const result = await service.repairIncidentOrFinding(PRODUTOR_A, finding.id, 'RESTART_CAPI_DISPATCHER');
    expect(result.success).toBe(true);
    expect(result.correlationId).toBeDefined();

    const updatedFinding = service.getDiagnostics(PRODUTOR_A, EVENTO_1).find((d) => d.id === finding.id);
    expect(updatedFinding?.repairAudit).toBeDefined();
    expect(updatedFinding?.repairAudit?.repairedBy).toContain('EDDIE Ops');
    expect(updatedFinding?.repairAudit?.newState).toBe('OPERACIONAL');

    // 7.2 Bloqueio de ação proibida (ex: UPDATE_BUDGET ou PUBLISH_CAMPAIGN)
    await expect(
      service.repairIncidentOrFinding(PRODUTOR_A, finding.id, 'UPDATE_BUDGET')
    ).rejects.toThrow('não é elegível para autocorreção automática');
  });

  it('8. Isolamento estrito Produtor A × Produtor B na telemetria, incidentes e diagnóstico', async () => {
    // Produtor A gera incidente
    await service.diagnoseEntity(
      PRODUTOR_A,
      EVENTO_1,
      'CAMPAIGN',
      'cmp-tenant-a',
      'DISCREPANCY_EDDIE_VS_PROVIDER'
    );

    // Produtor B consulta
    const incsB = service.getIncidents(PRODUTOR_B);
    const diagsB = service.getDiagnostics(PRODUTOR_B);
    const summaryB = service.getSummary(PRODUTOR_B);

    expect(incsB.some((i) => i.entityId === 'cmp-tenant-a')).toBe(false);
    expect(diagsB.some((d) => d.entityId === 'cmp-tenant-a')).toBe(false);
    expect(summaryB.openIncidentsCount).toBe(0);
  });
});

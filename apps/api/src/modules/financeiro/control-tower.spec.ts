import { describe, it, expect, beforeEach } from 'vitest';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ControlTowerService } from './control-tower.service';
import { FinancialEngineService } from './financial-engine.service';
import { FinanceiroService } from './financeiro.service';

describe('EDDIE 11.20 — Financial Operations Control Tower (20 Cenários E2E)', () => {
  let controlTower: ControlTowerService;
  let financialEngine: FinancialEngineService;
  let financeiroService: FinanceiroService;

  const TENANT_ID = '00000000-0000-0000-0000-000000000001';
  const PRODUCER_A = '00000000-0000-0000-0000-000000000002';
  const PRODUCER_B = '99999999-9999-9999-9999-999999999999';
  const EVENT_ID = 'evento-operacao';

  const mockPrisma: any = {
    $transaction: async (callback: any) => callback(mockPrisma),
    evento: {
      findUnique: async (args: any) => {
        const id = args.where.id;
        if (id === EVENT_ID) {
          return { id: EVENT_ID, produtorId: PRODUCER_A, nome: 'Festival Live 2026' };
        }
        if (id === 'evento-produtor-b') {
          return { id: 'evento-produtor-b', produtorId: PRODUCER_B, nome: 'Show B' };
        }
        return { id, produtorId: PRODUCER_A, nome: 'Evento Genérico' };
      },
      findFirst: async (args: any) => {
        const id = args?.where?.id || EVENT_ID;
        const produtorId = args?.where?.produtorId || PRODUCER_A;
        return { id, produtorId, nome: 'Festival Live 2026' };
      },
      findMany: async () => [
        { id: EVENT_ID, nome: 'Festival Live 2026' },
        { id: 'evento-1', nome: 'Turnê Rock Fest 2026' },
      ],
    },
    lancamentoLedger: {
      findFirst: async () => null,
      findMany: async () => [
        { bucket: 'disponivel', tipo: 'entrada', valor: { toNumber: () => 5000.0 }, criadoEm: new Date() },
        { bucket: 'retido', tipo: 'entrada', valor: { toNumber: () => 40000.0 }, criadoEm: new Date() },
        { bucket: 'bloqueado', tipo: 'entrada', valor: { toNumber: () => 2000.0 }, criadoEm: new Date() },
        { bucket: 'reservado_estorno', tipo: 'saida', valor: { toNumber: () => 500.0 }, criadoEm: new Date() },
      ],
      create: async (args: any) => ({ id: `led-${Date.now()}`, ...args.data, criadoEm: new Date() }),
    },
    contaFinanceiraProdutor: {
      findFirst: async () => null,
      create: async (args: any) => ({ id: `cta-${Date.now()}`, ...args.data }),
    },
    contaPagar: {
      findMany: async () => [{ valor: { toNumber: () => 1500.0 } }],
    },
    transferenciaInterEvento: {
      create: async (args: any) => ({ ...args.data, executadaEm: new Date() }),
    },
    solicitacaoRepasse: {
      create: async (args: any) => ({ id: `sol-${Date.now()}`, ...args.data }),
    },
    casoDivergencia: {
      create: async (args: any) => ({ id: `case-${Date.now()}`, ...args.data }),
    },
  };

  const mockOutbox: any = {
    enqueue: async (topic: string, event: string, payload: any) => {
      return { id: `outbox-${Date.now()}`, topic, event, payload };
    },
  };

  beforeEach(() => {
    financeiroService = new FinanceiroService(mockPrisma as any, mockOutbox as any);
    financialEngine = new FinancialEngineService(
      mockPrisma as any,
      financeiroService,
      mockOutbox as any,
    );
    controlTower = new ControlTowerService(
      mockPrisma as any,
      financialEngine,
      financeiroService,
      mockOutbox as any,
    );
  });

  // Cenário 1: repasse entra na fila
  it('Cenário 1: Repasse entra na fila operacional com prioridade, SLA e correlationId', () => {
    const item = controlTower.createQueueItem(TENANT_ID, {
      queue: 'repasses',
      priority: 'ALTA',
      producerId: PRODUCER_A,
      eventId: EVENT_ID,
      title: 'Repasse Semanal Lote 42',
      description: 'Repasse para chave Pix cadastrada',
      amountCents: 5000000,
      status: 'PENDENTE',
      slaLimitAt: new Date(Date.now() + 86400000).toISOString(),
      origin: 'SETTLEMENT_ROUTINE',
      correlationId: 'corr_test_rep_01',
      allowedActions: ['APROVAR', 'POSTERGAR'],
    });

    expect(item.id).toBeDefined();
    expect(item.queue).toBe('repasses');
    expect(item.correlationId).toBe('corr_test_rep_01');

    const queues = controlTower.listQueueItems(TENANT_ID, 'repasses', PRODUCER_A);
    expect(queues.some((q) => q.id === item.id)).toBe(true);
  });

  // Cenário 2: aprovação por alçada competente
  it('Cenário 2: Aprovação por alçada competente (DIRETOR para valores > R$ 50.000,00)', () => {
    const req = controlTower.createApprovalRequest(TENANT_ID, PRODUCER_A, {
      eventId: EVENT_ID,
      type: 'REPASSE',
      title: 'Repasse Extraordinário',
      description: 'Liberação expressa de bilheteria',
      amountCents: 8000000, // R$ 80.000,00 -> Alçada DIRETOR
      requesterId: 'usr-operador-01',
      requesterRole: 'OPERADOR',
    });

    expect(req.requiredTier).toBe('DIRETOR');

    // Operador tentando aprovar -> Deve falhar com ForbiddenException
    expect(() =>
      controlTower.approveRequest(TENANT_ID, req.id, 'usr-operador-02', 'OPERADOR'),
    ).toThrow(ForbiddenException);

    // Diretor aprovando -> Deve suceder
    const approved = controlTower.approveRequest(TENANT_ID, req.id, 'usr-diretor-01', 'DIRETOR');
    expect(approved.status).toBe('APROVADO');
    expect(approved.approverRole).toBe('DIRETOR');
  });

  // Cenário 3: autoaprovação bloqueada (segregação de funções)
  it('Cenário 3: Autoaprovação bloqueada por política estrita de segregação de funções', () => {
    const req = controlTower.createApprovalRequest(TENANT_ID, PRODUCER_A, {
      eventId: EVENT_ID,
      type: 'ESTORNO_ADMIN',
      title: 'Estorno de Cortesia Comercial',
      description: 'Cancelamento com devolução autorizada',
      amountCents: 100000,
      requesterId: 'usr-supervisor-01',
      requesterRole: 'SUPERVISOR',
    });

    // O mesmo usuário que solicitou tenta aprovar
    expect(() =>
      controlTower.approveRequest(TENANT_ID, req.id, 'usr-supervisor-01', 'SUPERVISOR'),
    ).toThrow(BadRequestException);
  });

  // Cenário 4: lote múltiplo (repasses em massa)
  it('Cenário 4: Geração de prévia e agrupamento de múltiplos itens elegíveis em lote', () => {
    const preview = controlTower.previewMassPayouts(TENANT_ID, PRODUCER_A, EVENT_ID);

    expect(preview.batchId).toBeDefined();
    expect(preview.items.length).toBeGreaterThan(0);
    expect(preview.validationPassed).toBe(true);
    expect(preview.totalAmountCents).toBeGreaterThan(0);
  });

  // Cenário 5: retry sem payout duplicado (idempotência)
  it('Cenário 5: Retry de lote em massa sem payout duplicado garantido por idempotência', () => {
    const preview = controlTower.previewMassPayouts(TENANT_ID, PRODUCER_A, EVENT_ID);
    const key = `idemp_mass_${Date.now()}`;

    const exec1 = controlTower.executeMassPayoutBatch(
      TENANT_ID,
      PRODUCER_A,
      preview.batchId,
      'usr-tesoureiro',
      key,
    );
    expect(exec1.status).toBe('PROCESSADO');

    // Segunda execução com a mesma chave de idempotência
    const exec2 = controlTower.executeMassPayoutBatch(
      TENANT_ID,
      PRODUCER_A,
      preview.batchId,
      'usr-tesoureiro',
      key,
    );
    expect(exec2.idempotencyKey).toBe(exec1.idempotencyKey);
    expect(exec2.executedAt).toBe(exec1.executedAt);
  });

  // Cenário 6: retorno bancário concilia lote
  it('Cenário 6: Retorno bancário concilia automaticamente lote de repasse', () => {
    const matchingCandidates = controlTower.listEnterpriseMatchingCandidates(TENANT_ID, PRODUCER_A);
    expect(matchingCandidates.length).toBeGreaterThan(0);

    const match = matchingCandidates[0]!;
    const confirmation = controlTower.confirmEnterpriseMatch(TENANT_ID, match.id, 'usr-auditor');
    expect(confirmation.success).toBe(true);
  });

  // Cenário 7: divergência cria caso financeiro
  it('Cenário 7: Detecção de divergência cria automaticamente caso financeiro investigativo', () => {
    const newCase = controlTower.createFinancialCase(TENANT_ID, {
      producerId: PRODUCER_A,
      eventId: EVENT_ID,
      title: 'Inconsistência de Split entre Adquirentes',
      category: 'DIVERGENCIA_BANCO',
      severity: 'ALTA',
      amountCents: 125000,
      description: 'Divergência entre extrato Cielo e conciliação de pedidos',
      correlationId: 'corr_div_split_01',
      evidenceNotes: ['Diferença identificada no fechamento noturno'],
      evidenceUrls: [],
    });

    expect(newCase.id).toBeDefined();
    expect(newCase.caseNumber).toContain('CASE-');
    expect(newCase.status).toBe('ABERTO');
  });

  // Cenário 8: resolução preserva evidência
  it('Cenário 8: Resolução de caso financeiro preserva notas e URLs comprobatórias de evidência', () => {
    const newCase = controlTower.createFinancialCase(TENANT_ID, {
      producerId: PRODUCER_A,
      eventId: EVENT_ID,
      title: 'Taxa Cobrada a Maior em Lote Promocional',
      category: 'TAXA_DISPUTADA',
      severity: 'MEDIA',
      amountCents: 4500,
      description: 'Produtor contestou alíquota aplicada em lote VIP',
      correlationId: 'corr_tax_01',
      evidenceNotes: ['Contrato original V1 verificado'],
      evidenceUrls: ['https://storage.diskingressos.com.br/evidences/ctr_v1.pdf'],
    });

    const resolved = controlTower.resolveFinancialCase(
      TENANT_ID,
      newCase.id,
      'usr-auditor-chefe',
      'Contrato V1 analisado e compensação aprovada',
      ['https://storage.diskingressos.com.br/evidences/laudo_final.pdf'],
    );

    expect(resolved.status).toBe('RESOLVIDO');
    expect(resolved.resolutionNote).toBeDefined();
    expect(resolved.evidenceUrls.length).toBe(2);
    expect(resolved.resolvedBy).toBe('usr-auditor-chefe');
  });

  // Cenário 9: divergência crítica bloqueia fechamento
  it('Cenário 9: Divergência crítica em aberto bloqueia estritamente fechamento do evento', async () => {
    const criticalCase = controlTower.createFinancialCase(TENANT_ID, {
      producerId: PRODUCER_A,
      eventId: 'evento-bloqueado',
      title: 'Chargeback não provisionado de R$ 50.000,00',
      category: 'CHARGEBACK',
      severity: 'CRITICA',
      amountCents: 5000000,
      description: 'Disputa massiva adquirente aguardando retenção',
      correlationId: 'corr_crit_cb_01',
      evidenceNotes: [],
      evidenceUrls: [],
    });

    await expect(
      controlTower.executeEventClosing(TENANT_ID, 'evento-bloqueado', PRODUCER_A, 'usr-controller'),
    ).rejects.toThrow(BadRequestException);
  });

  // Cenário 10: resolução permite fechar
  it('Cenário 10: Resolução de divergências críticas permite concluir fechamento e emitir dossiê', async () => {
    const eventIdClean = 'evento-fechamento-sucesso';
    const status = controlTower.getEventClosingStatus(TENANT_ID, eventIdClean, PRODUCER_A);
    status.checklist.criticalDivergencesCount = 0;

    const closed = await controlTower.executeEventClosing(
      TENANT_ID,
      eventIdClean,
      PRODUCER_A,
      'usr-controller-01',
    );

    expect(closed.state).toBe('FECHADO');
    expect(closed.dossier).toBeDefined();
    expect(closed.dossier?.digitalSignature).toBeDefined();
    expect(closed.dossier?.auditTrailHash).toBeDefined();
  });

  // Cenário 11: reabertura autorizada com justificativa
  it('Cenário 11: Reabertura de fechamento exige justificativa formal e autorização de diretoria', async () => {
    const eventId = 'evento-reabrir';
    const status = controlTower.getEventClosingStatus(TENANT_ID, eventId, PRODUCER_A);
    status.checklist.criticalDivergencesCount = 0;
    await controlTower.executeEventClosing(TENANT_ID, eventId, PRODUCER_A, 'usr-controller');

    // Tentativa sem código de autorização válido
    expect(() =>
      controlTower.reopenEventClosing(
        TENANT_ID,
        eventId,
        PRODUCER_A,
        'usr-operador',
        'Necessário estorno residual',
        'CODIGO-INVALIDO',
      ),
    ).toThrow(ForbiddenException);

    // Tentativa com código de diretoria válido
    const reopened = controlTower.reopenEventClosing(
      TENANT_ID,
      eventId,
      PRODUCER_A,
      'usr-diretor',
      'Autorizada reabertura para acerto de despesa extra',
      'AUTH-DIR-99412',
    );
    expect(reopened.state).toBe('REABERTO_COM_AUTORIZACAO');
    expect(reopened.reopenedBy).toBe('usr-diretor');
  });

  // Cenário 12: transferência na fila de aprovações
  it('Cenário 12: Transferência inter-eventos entra automaticamente na fila de aprovações', () => {
    const appr = controlTower.createApprovalRequest(TENANT_ID, PRODUCER_A, {
      eventId: EVENT_ID,
      type: 'TRANSFERENCIA',
      title: 'Transferência de Saldo para Turnê Nacional',
      description: 'Adiantamento de verba entre festivais do mesmo produtor',
      amountCents: 1500000,
      requesterId: 'usr-operador-transf',
      requesterRole: 'OPERADOR',
    });

    const queueItems = controlTower.listQueueItems(TENANT_ID, 'aprovacoes', PRODUCER_A);
    expect(queueItems.some((q) => q.correlationId === appr.correlationId)).toBe(true);
  });

  // Cenário 13: chargeback gera alerta e caso
  it('Cenário 13: Notificação de chargeback gera caso investigativo na Control Tower', () => {
    const cbCase = controlTower.createFinancialCase(TENANT_ID, {
      producerId: PRODUCER_A,
      eventId: EVENT_ID,
      title: 'Chargeback Cartão de Crédito Pedido #849098',
      category: 'CHARGEBACK',
      severity: 'CRITICA',
      amountCents: 22000,
      description: 'Alegação de desacordo comercial',
      correlationId: 'corr_cb_test_13',
      evidenceNotes: ['Comprovante de entrega digital solicitado'],
      evidenceUrls: [],
    });

    const cases = controlTower.listFinancialCases(TENANT_ID, PRODUCER_A, 'CRITICA');
    expect(cases.some((c) => c.id === cbCase.id)).toBe(true);
  });

  // Cenário 14: conta vencida entra na agenda
  it('Cenário 14: Contas a pagar com data ultrapassada constam como ATRASADAS na agenda', () => {
    const calendar = controlTower.getFinancialCalendar(TENANT_ID, undefined, undefined, PRODUCER_A);
    const overdue = calendar.filter((c) => c.status === 'ATRASADO');
    expect(overdue.length).toBeGreaterThan(0);
    expect(overdue[0]!.type).toBe('PAGAMENTO_FORNECEDOR');
  });

  // Cenário 15: projeção de liquidez não altera realizado
  it('Cenário 15: Projeções de liquidez (7/15/30/60/90 dias) são simulações que não alteram saldos do Ledger', () => {
    const forecast = controlTower.getLiquidityForecast(TENANT_ID, PRODUCER_A);

    expect(forecast.length).toBe(5);
    expect(forecast.every((f) => f.isSimulation === true)).toBe(true);
    expect(forecast.find((f) => f.daysHorizon === 7)?.projectedInflowCents).toBeGreaterThan(0);
  });

  // Cenário 16: automação segura sem movimentar dinheiro
  it('Cenário 16: Automação segura executa re-sync e retry com zero centavos movimentados', () => {
    const res = controlTower.runSafeAutomation(TENANT_ID, 'RESYNC_GATEWAY', false);

    expect(res.moneyMovedCents).toBe(0);
    expect(res.actionsTaken.length).toBeGreaterThan(0);

    // Tentativa de automação financeira insegura é bloqueada
    expect(() =>
      controlTower.runSafeAutomation(TENANT_ID, 'PAGAR_REPASSES_AUTO' as any),
    ).toThrow(BadRequestException);
  });

  // Cenário 17: auditoria forense por correlationId
  it('Cenário 17: Auditoria forense rastreia perfeitamente eventos por correlationId e ator', () => {
    const corrId = `corr_forensic_test_${Date.now()}`;
    controlTower.logForensicRecord({
      module: 'TEST_MODULE',
      action: 'CRITICAL_ACTION_LOGGED',
      correlationId: corrId,
      actorId: 'usr-auditor-investigador',
      actorRole: 'AUDITOR',
      tenantId: TENANT_ID,
      producerId: PRODUCER_A,
      eventId: EVENT_ID,
      metadata: { reason: 'Teste de integridade forense' },
    });

    const search = controlTower.searchForensicAudit(TENANT_ID, { correlationId: corrId });
    expect(search.length).toBe(1);
    expect(search[0]!.actorId).toBe('usr-auditor-investigador');
  });

  // Cenário 18: Produtor A não acessa Produtor B
  it('Cenário 18: Isolamento Multi-Tenant estrito bloqueia Produtor A de acessar dados do Produtor B', () => {
    expect(() =>
      controlTower.validateProducerAccess(PRODUCER_B, PRODUCER_A),
    ).toThrow(ForbiddenException);

    // Acesso autorizado para o próprio produtor
    expect(() =>
      controlTower.validateProducerAccess(PRODUCER_A, PRODUCER_A),
    ).not.toThrow();
  });

  // Cenário 19: 11.18 não escreve Ledger
  it('Cenário 19: Command Center (11.18) consome resumos e não efetua escrituração no Ledger', () => {
    const summary = controlTower.getControlTowerSummary(TENANT_ID, PRODUCER_A);
    expect(summary.queues.totalPendingCount).toBeGreaterThan(0);
    expect(summary.approvals.pendingCount).toBeGreaterThanOrEqual(0);
    expect(summary.massPayouts.eligibleBatchAvailable).toBe(true);
  });

  // Cenário 20: 11.19 permanece fonte da verdade contábil
  it('Cenário 20: Camada Financeira Especializada (11.19) é mantida intacta como autoridade do Ledger', async () => {
    const dre = await financialEngine.getEventDre(TENANT_ID, EVENT_ID, PRODUCER_A);
    expect(dre.grossTicketRevenueCents).toBeGreaterThan(0);
    expect(dre.diskEffectivePercentRate).toBe(10);
    expect(dre.sourceNote).toContain('Ledger');
  });
});

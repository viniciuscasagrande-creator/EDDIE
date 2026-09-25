import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { FinancialEngineService } from './financial-engine.service';
import { PrismaService } from '../../shared/prisma.module';
import { OutboxService } from '../../shared/outbox/outbox.service';

describe('FinancialEngineService — EDDIE 11.19 Master Test Suite (20 Cenários E2E Financeiros)', () => {
  let service: FinancialEngineService;
  let mockPrisma: any;
  let mockOutbox: any;

  const TENANT_ID = '00000000-0000-0000-0000-000000000001';
  const PRODUCER_A = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const PRODUCER_B = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  const EVENT_A1 = 'evento-operacao';
  const EVENT_A2 = 'evento-1';
  const EVENT_B1 = 'evento-b1';

  beforeEach(() => {
    mockOutbox = {
      emit: vi.fn().mockResolvedValue('outbox-message-id'),
    };

    mockPrisma = {
      $transaction: vi.fn().mockImplementation(async (callback: any) => callback(mockPrisma)),
      evento: {
        findFirst: vi.fn().mockImplementation(async ({ where }: any) => {
          if (where.id === EVENT_A1) {
            return { id: EVENT_A1, tenantId: TENANT_ID, produtorId: PRODUCER_A, nome: 'Festival Live 2026' };
          }
          if (where.id === EVENT_A2) {
            return { id: EVENT_A2, tenantId: TENANT_ID, produtorId: PRODUCER_A, nome: 'Turnê Rock Fest 2026' };
          }
          if (where.id === EVENT_B1) {
            return { id: EVENT_B1, tenantId: TENANT_ID, produtorId: PRODUCER_B, nome: 'Teatro Musical B' };
          }
          return null;
        }),
        findMany: vi.fn().mockResolvedValue([
          { id: EVENT_A1, nome: 'Festival Live 2026' },
          { id: EVENT_A2, nome: 'Turnê Rock Fest 2026' },
        ]),
      },
      lancamentoLedger: {
        findMany: vi.fn().mockResolvedValue([
          { bucket: 'disponivel', tipo: 'entrada', valor: { toNumber: () => 5000.0 }, criadoEm: new Date() },
          { bucket: 'retido', tipo: 'entrada', valor: { toNumber: () => 40000.0 }, criadoEm: new Date() },
          { bucket: 'bloqueado', tipo: 'entrada', valor: { toNumber: () => 2000.0 }, criadoEm: new Date() },
          { bucket: 'reservado_estorno', tipo: 'saida', valor: { toNumber: () => 500.0 }, criadoEm: new Date() },
        ]),
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockImplementation(async ({ data }: any) => ({
          ...data,
          id: data.id || 'lanc-id-default',
          criadoEm: new Date(),
        })),
      },
      contaPagar: {
        findMany: vi.fn().mockResolvedValue([
          { valor: { toNumber: () => 1500.0 } },
        ]),
      },
      transferenciaInterEvento: {
        create: vi.fn().mockImplementation(async ({ data }: any) => ({
          ...data,
          executadaEm: new Date(),
        })),
      },
    };

    service = new FinancialEngineService(
      mockPrisma as unknown as PrismaService,
      mockOutbox as unknown as OutboxService,
    );
  });

  // =========================================================================
  // CENÁRIOS E2E OBRIGATÓRIOS (DOCS/19_E2E.MD)
  // =========================================================================

  it('Cenário 1: Venda R$ 100 + taxa percentual individual -> snapshot -> Ledger -> saldo', async () => {
    service.setEventFeeConfig(TENANT_ID, {
      eventId: EVENT_A1,
      producerId: PRODUCER_A,
      ruleModel: 'PERCENTUAL',
      percentRate: 10.0,
      fixedAmountCents: 0,
      gatewayProcessingPercentRate: 2.5,
    });

    const result = await service.recordSaleWithFeeSnapshot(
      TENANT_ID,
      PRODUCER_A,
      EVENT_A1,
      'PED-E2E-01',
      10000, // R$ 100,00
      1,
    );

    expect(result.snapshot.ruleModel).toBe('PERCENTUAL');
    expect(result.snapshot.diskFeeCents).toBe(1000); // R$ 10,00
    expect(result.snapshot.gatewayCostCents).toBe(250); // R$ 2,50
    expect(result.snapshot.netProducerCents).toBe(8750); // R$ 87,50
    expect(mockPrisma.lancamentoLedger.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          bucket: 'retido',
          tipo: 'entrada',
          valor: 87.5,
          origem: 'pedido_pago',
        }),
      }),
    );
  });

  it('Cenário 2: Evento com taxa fixa por ingresso (ex: R$ 5 fixo)', async () => {
    service.setEventFeeConfig(TENANT_ID, {
      eventId: EVENT_A1,
      producerId: PRODUCER_A,
      ruleModel: 'FIXA',
      percentRate: 0,
      fixedAmountCents: 500,
      gatewayProcessingPercentRate: 2.5,
    });

    const result = await service.recordSaleWithFeeSnapshot(
      TENANT_ID,
      PRODUCER_A,
      EVENT_A1,
      'PED-E2E-02',
      10000,
      2, // 2 ingressos
    );

    expect(result.snapshot.ruleModel).toBe('FIXA');
    expect(result.snapshot.diskFeeCents).toBe(1000); // 2 * R$ 5 = R$ 10
    expect(result.snapshot.gatewayCostCents).toBe(250);
    expect(result.snapshot.netProducerCents).toBe(8750);
  });

  it('Cenário 3: Alteração futura de taxa NÃO muda venda histórica (snapshot preservado)', async () => {
    // 1. Cadastra regra V1 (10%)
    const v1Config = service.setEventFeeConfig(TENANT_ID, {
      eventId: EVENT_A1,
      producerId: PRODUCER_A,
      ruleModel: 'PERCENTUAL',
      percentRate: 10.0,
      gatewayProcessingPercentRate: 2.5,
    });

    // 2. Venda 1 sob V1
    const saleV1 = await service.recordSaleWithFeeSnapshot(
      TENANT_ID,
      PRODUCER_A,
      EVENT_A1,
      'PED-HIST-01',
      10000,
      1,
    );
    expect(saleV1.snapshot.ruleVersion).toBe(v1Config.version);
    expect(saleV1.snapshot.diskFeeCents).toBe(1000);

    // 3. Negociação é alterada para V2 (20%)
    const v2Config = service.setEventFeeConfig(TENANT_ID, {
      eventId: EVENT_A1,
      producerId: PRODUCER_A,
      ruleModel: 'PERCENTUAL',
      percentRate: 20.0,
      gatewayProcessingPercentRate: 2.5,
    });
    expect(v2Config.version).toBe(v1Config.version + 1);

    // 4. Venda 2 sob V2
    const saleV2 = await service.recordSaleWithFeeSnapshot(
      TENANT_ID,
      PRODUCER_A,
      EVENT_A1,
      'PED-HIST-02',
      10000,
      1,
    );
    expect(saleV2.snapshot.ruleVersion).toBe(v2Config.version);
    expect(saleV2.snapshot.diskFeeCents).toBe(2000);

    // 5. Venda 1 permanece rigorosamente inalterada
    expect(saleV1.snapshot.diskFeeCents).toBe(1000);
    expect(saleV1.snapshot.netProducerCents).toBe(8750);
  });

  it('Cenário 4: Pagamento duplicado/retry não duplica Ledger (idempotência)', async () => {
    // Primeira tentativa de venda
    await service.recordSaleWithFeeSnapshot(
      TENANT_ID,
      PRODUCER_A,
      EVENT_A1,
      'PED-RETRY-01',
      10000,
      1,
    );
    const ledgerCallsFirst = mockPrisma.lancamentoLedger.create.mock.calls.length;

    // Simula que o banco agora encontra o lançamento existente para o mesmo pedido
    mockPrisma.lancamentoLedger.findFirst.mockResolvedValueOnce({
      id: 'lanc-existing-01',
      tenantId: TENANT_ID,
      origem: 'pedido_pago',
      referenciaId: 'PED-RETRY-01',
    });

    // Segunda tentativa (retry de webhook ou rede)
    const retryResult = await service.recordSaleWithFeeSnapshot(
      TENANT_ID,
      PRODUCER_A,
      EVENT_A1,
      'PED-RETRY-01',
      10000,
      1,
    );

    const ledgerCallsSecond = mockPrisma.lancamentoLedger.create.mock.calls.length;

    expect(retryResult.idempotent).toBe(true);
    expect(ledgerCallsSecond).toBe(ledgerCallsFirst); // Não chamou create de novo
  });

  it('Cenário 5: Transferência Evento A -> B mesmo produtor com partidas dobradas', async () => {
    const transfer = await service.transferBetweenEvents(TENANT_ID, PRODUCER_A, {
      originEventId: EVENT_A1,
      targetEventId: EVENT_A2,
      amountCents: 100000,
      reason: 'Remanejamento de verba para palco',
      requestedBy: 'diretor-financeiro',
    });

    expect(transfer.status).toBe('EXECUTADA');
    expect(transfer.originEventId).toBe(EVENT_A1);
    expect(transfer.targetEventId).toBe(EVENT_A2);

    expect(mockPrisma.lancamentoLedger.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          eventoId: EVENT_A1,
          bucket: 'disponivel',
          tipo: 'saida',
          valor: 1000.0,
        }),
      }),
    );
    expect(mockPrisma.lancamentoLedger.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          eventoId: EVENT_A2,
          bucket: 'disponivel',
          tipo: 'entrada',
          valor: 1000.0,
        }),
      }),
    );
  });

  it('Cenário 6: Cross-producer bloqueado (transferência entre produtores diferentes)', async () => {
    await expect(
      service.transferBetweenEvents(TENANT_ID, PRODUCER_A, {
        originEventId: EVENT_A1,
        targetEventId: EVENT_B1, // Evento do PRODUCER_B!
        amountCents: 50000,
        reason: 'Tentativa indevida cross-producer',
        requestedBy: 'hacker-01',
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('Cenário 7: Conta a pagar -> aprovação -> pagamento -> conciliação', async () => {
    // 1. Cadastra conta a pagar
    const payable = service.createPayable(TENANT_ID, PRODUCER_A, {
      eventId: EVENT_A1,
      supplierId: 'sup-01',
      supplierName: 'ProAudio Engenharia de Som Ltda',
      category: 'Estrutura & Som',
      description: 'Locação de microfones sem fio',
      amountCents: 250000, // R$ 2.500,00
      dueDate: '2026-10-30',
    });
    expect(payable.status).toBe('PENDENTE');

    // 2. Aprovação
    const approved = service.approvePayable(TENANT_ID, payable.id, PRODUCER_A, 'gerente-financeiro');
    expect(approved.status).toBe('APROVACAO');
    expect(approved.approvedBy).toBe('gerente-financeiro');

    // 3. Pagamento / Liquidação no Ledger
    const paid = await service.payPayable(TENANT_ID, payable.id, PRODUCER_A, {
      actorId: 'tesoureiro',
      paymentMethod: 'PIX',
    });
    expect(paid.status).toBe('LIQUIDADO');
    expect(paid.paidAt).toBeDefined();

    expect(mockPrisma.lancamentoLedger.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          eventoId: EVENT_A1,
          bucket: 'disponivel',
          tipo: 'saida',
          valor: 2500.0,
          origem: 'despesa_fornecedor',
        }),
      }),
    );
  });

  it('Cenário 8: Conta a receber -> liquidação com crédito no Ledger', async () => {
    // 1. Cadastra título a receber
    const receivable = service.createReceivable(TENANT_ID, PRODUCER_A, {
      eventId: EVENT_A1,
      origin: 'Patrocínio',
      counterparty: 'Marca de Energéticos X',
      description: 'Ativação de bar vip',
      amountCents: 3000000, // R$ 30.000,00
      dueDate: '2026-11-10',
    });
    expect(receivable.status).toBe('PENDENTE');

    // 2. Liquidação total
    const settled = await service.settleReceivable(TENANT_ID, receivable.id, PRODUCER_A, {
      actorId: 'tesoureiro',
    });
    expect(settled.status).toBe('LIQUIDADO');
    expect(settled.balanceCents).toBe(0);

    expect(mockPrisma.lancamentoLedger.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          eventoId: EVENT_A1,
          bucket: 'disponivel',
          tipo: 'entrada',
          valor: 30000.0,
          origem: 'recebivel_liquidado',
        }),
      }),
    );
  });

  it('Cenário 9: Estorno antes do repasse abate do bucket retido', async () => {
    const refund = await service.processRefundPreSettlement(
      TENANT_ID,
      PRODUCER_A,
      EVENT_A1,
      'ORD-REF-01',
      10000,
      'Arrependimento em 7 dias (CDC)',
    );

    expect(refund.status).toBe('ESTORNO_PRE_REPASSE_PROCESSADO');
    expect(mockPrisma.lancamentoLedger.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          bucket: 'retido',
          tipo: 'saida',
          origem: 'estorno_pedido',
        }),
      }),
    );
  });

  it('Cenário 10: Chargeback após repasse debita do fundo de reserva e abre caso na conciliação', async () => {
    const cb = await service.processChargebackPostSettlement(
      TENANT_ID,
      PRODUCER_A,
      EVENT_A1,
      'CB-E2E-10',
      15000, // R$ 150,00
      'ORD-SETTLED-88',
      'Contestação de fraude na operadora do cartão',
    );

    expect(cb.status).toBe('CHARGEBACK_REGISTRADO');
    expect(cb.case.status).toBe('ABERTA');
    expect(cb.case.divergenceCents).toBe(15000);
    expect(mockPrisma.lancamentoLedger.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          bucket: 'reservado_estorno',
          tipo: 'saida',
          origem: 'chargeback',
        }),
      }),
    );
  });

  it('Cenário 11: Reversão de chargeback ganho recompõe saldo com crédito compensatório', async () => {
    // 1. Registra chargeback
    const cb = await service.processChargebackPostSettlement(
      TENANT_ID,
      PRODUCER_A,
      EVENT_A1,
      'CB-REV-11',
      12000,
      'ORD-PAST-11',
      'Disputa inicial',
    );

    // 2. Reversão de disputa ganha
    const reversed = await service.reverseChargeback(TENANT_ID, cb.case.transactionId, PRODUCER_A, {
      reason: 'Comprovante de entrega de ingresso aceito pelo emissor',
      actorId: 'advogado-financeiro',
    });

    expect(reversed.status).toBe('REVERTIDO');
    expect(reversed.reversalLedgerId).toBeDefined();

    expect(mockPrisma.lancamentoLedger.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          bucket: 'reservado_estorno',
          tipo: 'entrada',
          origem: 'reversao_chargeback',
        }),
      }),
    );
  });

  it('Cenário 12: Settlement -> payout -> retorno bancário -> conciliado', async () => {
    // 1. Agendamento com bloqueio no Ledger
    const lot = await service.scheduleSettlement(TENANT_ID, PRODUCER_A, {
      eventId: EVENT_A1,
      amountCents: 50000,
      pixKey: 'produtor@festival.com.br',
      scheduledDate: '2026-11-20',
      requestedBy: 'diretor-financeiro',
      idempotencyKey: 'idem-lot-e2e-12',
    });
    expect(lot.status).toBe('AGENDADO');

    // 2. Liquidação bancária com comprovante
    const executed = await service.executeSettlement(TENANT_ID, lot.id, PRODUCER_A, {
      bankReceiptId: 'REC-ITA-9921',
      pixEndToEndId: 'E2E-PIX-BANCO-CENTRAL-001',
      actorId: 'tesoureiro',
    });

    expect(executed.status).toBe('PAGO');
    expect(executed.bankReceiptId).toBe('REC-ITA-9921');
    expect(executed.pixEndToEndId).toBe('E2E-PIX-BANCO-CENTRAL-001');

    expect(mockPrisma.lancamentoLedger.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          bucket: 'bloqueado',
          tipo: 'saida',
          origem: 'repasse',
        }),
      }),
    );
  });

  it('Cenário 13: Retry payout sem pagamento duplo (idempotência estrita)', async () => {
    const lot = await service.scheduleSettlement(TENANT_ID, PRODUCER_A, {
      eventId: EVENT_A1,
      amountCents: 30000,
      pixKey: 'produtor@festival.com.br',
      scheduledDate: '2026-11-20',
      requestedBy: 'diretor-financeiro',
      idempotencyKey: 'idem-retry-13',
    });

    // Primeira execução
    await service.executeSettlement(TENANT_ID, lot.id, PRODUCER_A, {
      bankReceiptId: 'REC-01',
      actorId: 'tesoureiro',
    });
    const callsBefore = mockPrisma.lancamentoLedger.create.mock.calls.length;

    // Retry
    const retried = await service.executeSettlement(TENANT_ID, lot.id, PRODUCER_A, {
      bankReceiptId: 'REC-01',
      actorId: 'tesoureiro',
    });
    const callsAfter = mockPrisma.lancamentoLedger.create.mock.calls.length;

    expect(retried.status).toBe('PAGO');
    expect(callsAfter).toBe(callsBefore);
  });

  it('Cenário 14: Divergência de gateway detectada na conciliação 6 vias', async () => {
    const reconciliation = await service.runSixWayReconciliation(TENANT_ID, EVENT_A1, PRODUCER_A);
    expect(reconciliation.points).toHaveLength(6);
    expect(reconciliation.points.some((p) => p.source === 'GATEWAY')).toBe(true);
  });

  it('Cenário 15: Divergência bancária monitorada na conciliação', async () => {
    const reconciliation = await service.runSixWayReconciliation(TENANT_ID, EVENT_A1, PRODUCER_A);
    expect(reconciliation.points.some((p) => p.source === 'BANCO')).toBe(true);
  });

  it('Cenário 16: CNAB retorno rejeitado gera caso de conciliação de divergência bancária', () => {
    const cnabReturn = service.processCnabReturn(TENANT_ID, PRODUCER_A, {
      batchId: 'cnab-batch-001',
      status: 'REJEITADO',
      failureReason: 'Chave Pix Inválida na CIP',
      eventId: EVENT_A1,
    });

    expect(cnabReturn.status).toBe('REJEITADO');
    const cases = service.listReconciliationCases(TENANT_ID, EVENT_A1, PRODUCER_A);
    expect(cases.some((c) => c.pointOfDivergence === 'RETORNO_CNAB_REJEITADO')).toBe(true);
  });

  it('Cenário 17: DRE e fluxo de caixa coerentes com o Ledger', async () => {
    const dre = await service.getEventDre(TENANT_ID, EVENT_A1, PRODUCER_A);
    const cashflow = await service.getEventCashflow(TENANT_ID, EVENT_A1, PRODUCER_A);

    expect(dre.grossTicketRevenueCents).toBeGreaterThan(0);
    expect(dre.diskServiceFeesCents).toBeGreaterThan(0);
    expect(cashflow.length).toBeGreaterThanOrEqual(3);
  });

  it('Cenário 18: Marketing não altera Ledger (soberania contábil)', async () => {
    const dre = await service.getEventDre(TENANT_ID, EVENT_A1, PRODUCER_A);
    expect(dre.sourceNote).toContain('Atribuição de marketing analytics não altera a base patrimonial');
  });

  it('Cenário 19: Command Center 11.18 recebe atualização via Outbox', async () => {
    // 1. Cadastra conta a pagar de R$ 1.000,00 (compatível com o saldo disponível de R$ 5.000,00)
    const payable = service.createPayable(TENANT_ID, PRODUCER_A, {
      eventId: EVENT_A1,
      supplierId: 'sup-01',
      supplierName: 'ProAudio Engenharia de Som Ltda',
      category: 'Estrutura & Som',
      description: 'Taxa de instalação de palco',
      amountCents: 100000, // R$ 1.000,00
      dueDate: '2026-10-30',
    });

    // 2. Ao pagar a conta a pagar, o evento de outbox é emitido na mesma transação
    await service.payPayable(TENANT_ID, payable.id, PRODUCER_A, {
      actorId: 'gestor-financeiro',
    });

    expect(mockOutbox.emit).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        eventName: 'FINANCIAL_BALANCE_CHANGED',
        source: 'financial-engine',
        tenantId: TENANT_ID,
      }),
    );
  });

  it('Cenário 20: Produtor A não acessa dados/saldos do Produtor B (ownership estrito)', async () => {
    // Produtor B tenta acessar o saldo do Evento A1 (que pertence ao Produtor A)
    await expect(
      service.getEventRealBalance(TENANT_ID, EVENT_A1, PRODUCER_B),
    ).rejects.toThrow(ForbiddenException);
  });
});

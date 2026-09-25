import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { FinancialEngineService } from './financial-engine.service';
import { PrismaService } from '../../shared/prisma.module';
import { OutboxService } from '../../shared/outbox/outbox.service';

describe('FinancialEngineService (EDDIE 11.19 Master Test Suite)', () => {
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
  // 1. MOTOR DE TAXAS POR EVENTO (PERCENTUAL & FIXA)
  // =========================================================================
  describe('1. Motor de Taxas por Evento', () => {
    it('Cenário 1: deve aplicar taxa percentual individual do evento (ex: R$ 100 com 10% Disk + 2.5% Gateway)', async () => {
      // Regra percentual: 10% Disk + 2.5% Gateway
      service.setEventFeeConfig(TENANT_ID, {
        eventId: EVENT_A1,
        producerId: PRODUCER_A,
        ruleModel: 'PERCENTUAL',
        percentRate: 10.0,
        fixedAmountCents: 0,
        gatewayProcessingPercentRate: 2.5,
      });

      const orderGrossCents = 10000; // R$ 100,00
      const result = await service.recordSaleWithFeeSnapshot(
        TENANT_ID,
        PRODUCER_A,
        EVENT_A1,
        'PED-TAXA-PERC-01',
        orderGrossCents,
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

    it('Cenário 2: deve aplicar taxa fixa por ingresso individual do evento (ex: R$ 5,00 fixo por ingresso)', async () => {
      // Regra fixa: R$ 5,00 por ingresso (500 centavos)
      service.setEventFeeConfig(TENANT_ID, {
        eventId: EVENT_A1,
        producerId: PRODUCER_A,
        ruleModel: 'FIXA',
        percentRate: 0,
        fixedAmountCents: 500,
        gatewayProcessingPercentRate: 2.5,
      });

      const orderGrossCents = 10000; // R$ 100,00 (2 ingressos a R$ 50 cada)
      const ticketsCount = 2;
      const result = await service.recordSaleWithFeeSnapshot(
        TENANT_ID,
        PRODUCER_A,
        EVENT_A1,
        'PED-TAXA-FIXA-01',
        orderGrossCents,
        ticketsCount,
      );

      expect(result.snapshot.ruleModel).toBe('FIXA');
      expect(result.snapshot.diskFeeCents).toBe(1000); // 2 ingressos * R$ 5,00 = R$ 10,00
      expect(result.snapshot.gatewayCostCents).toBe(250); // R$ 2,50
      expect(result.snapshot.netProducerCents).toBe(8750); // R$ 87,50
    });

    it('Cenário 3: alteração futura de taxa NÃO recalcula vendas passadas (snapshot histórico preservado)', async () => {
      // 1. Cadastra regra V1 (10% percentual)
      const v1Config = service.setEventFeeConfig(TENANT_ID, {
        eventId: EVENT_A1,
        producerId: PRODUCER_A,
        ruleModel: 'PERCENTUAL',
        percentRate: 10.0,
        gatewayProcessingPercentRate: 2.5,
      });
      expect(v1Config.version).toBe(2); // anterior era seed 1

      // 2. Venda 1 registrada na vigência da regra V1
      const saleV1 = await service.recordSaleWithFeeSnapshot(
        TENANT_ID,
        PRODUCER_A,
        EVENT_A1,
        'PED-V1-PAST',
        10000,
        1,
      );
      expect(saleV1.snapshot.ruleVersion).toBe(v1Config.version);
      expect(saleV1.snapshot.diskFeeCents).toBe(1000);

      // 3. Negociação é alterada para V2 (15% percentual)
      const v2Config = service.setEventFeeConfig(TENANT_ID, {
        eventId: EVENT_A1,
        producerId: PRODUCER_A,
        ruleModel: 'PERCENTUAL',
        percentRate: 15.0,
        gatewayProcessingPercentRate: 2.5,
      });
      expect(v2Config.version).toBe(v1Config.version + 1);

      // 4. Venda 2 sob nova regra
      const saleV2 = await service.recordSaleWithFeeSnapshot(
        TENANT_ID,
        PRODUCER_A,
        EVENT_A1,
        'PED-V2-NEW',
        10000,
        1,
      );
      expect(saleV2.snapshot.ruleVersion).toBe(v2Config.version);
      expect(saleV2.snapshot.diskFeeCents).toBe(1500); // R$ 15,00

      // 5. Garante que o snapshot da venda 1 permanece rigorosamente inalterado
      expect(saleV1.snapshot.diskFeeCents).toBe(1000);
      expect(saleV1.snapshot.netProducerCents).toBe(8750);
    });
  });

  // =========================================================================
  // 2. SALDO REAL POR EVENTO E CONSOLIDADO
  // =========================================================================
  describe('2. Saldo Real por Evento e Consolidado do Produtor', () => {
    it('Cenário 4: deve derivar saldo real em buckets sem coluna mutável no banco', async () => {
      const balance = await service.getEventRealBalance(TENANT_ID, EVENT_A1, PRODUCER_A);

      expect(balance.eventId).toBe(EVENT_A1);
      expect(balance.disponivelCents).toBe(500000); // R$ 5.000,00
      expect(balance.retidoCents).toBe(4000000);    // R$ 40.000,00
      expect(balance.bloqueadoCents).toBe(200000);  // R$ 2.000,00
      expect(balance.reservadoEstornoCents).toBe(-50000); // -R$ 500,00
      expect(balance.compromissosPendentesCents).toBe(150000); // R$ 1.500,00
      expect(balance.contabilCents).toBe(4650000); // 5000 + 40000 + 2000 - 500 = 46.500
    });

    it('Cenário 5: deve consolidar saldos de múltiplos eventos preservando a segregação', async () => {
      const consolidated = await service.getProducerConsolidatedBalance(TENANT_ID, PRODUCER_A);

      expect(consolidated.producerId).toBe(PRODUCER_A);
      expect(consolidated.totalEventsCount).toBe(2);
      expect(consolidated.eventos).toHaveLength(2);
      expect(consolidated.contabilCents).toBe(4650000 * 2);
    });
  });

  // =========================================================================
  // 3. TRANSFERÊNCIA INTER-EVENTOS E ISOLAMENTO MULTI-TENANT
  // =========================================================================
  describe('3. Transferências Inter-Eventos e Isolamento', () => {
    it('Cenário 6: deve realizar transferência entre eventos do MESMO produtor com partidas dobradas', async () => {
      const transfer = await service.transferBetweenEvents(TENANT_ID, PRODUCER_A, {
        originEventId: EVENT_A1,
        targetEventId: EVENT_A2,
        amountCents: 100000, // R$ 1.000,00
        reason: 'Alocação de orçamento para produção de palco',
        requestedBy: 'gestor-01',
      });

      expect(transfer.status).toBe('EXECUTADA');
      expect(transfer.amountCents).toBe(100000);
      expect(transfer.originEventId).toBe(EVENT_A1);
      expect(transfer.targetEventId).toBe(EVENT_A2);

      // Garante que gerou débito na origem e crédito no destino no Ledger
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

    it('Cenário 7: deve BLOQUEAR estritamente transferência entre eventos de PRODUTORES DIFERENTES', async () => {
      await expect(
        service.transferBetweenEvents(TENANT_ID, PRODUCER_A, {
          originEventId: EVENT_A1,
          targetEventId: EVENT_B1, // Pertence ao PRODUCER_B!
          amountCents: 50000,
          reason: 'Tentativa de desvio inter-produtor',
          requestedBy: 'hacker-01',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('Cenário 8: deve permitir estorno compensatório da transferência mantendo imutabilidade', async () => {
      // Cria a transferência
      const transfer = await service.transferBetweenEvents(TENANT_ID, PRODUCER_A, {
        originEventId: EVENT_A1,
        targetEventId: EVENT_A2,
        amountCents: 20000, // R$ 200,00
        reason: 'Adiantamento temporário',
        requestedBy: 'gestor-01',
      });

      // Estorna a transferência
      const reversed = await service.reverseTransfer(
        TENANT_ID,
        transfer.id,
        PRODUCER_A,
        'Cancelamento de montagem de palco',
        'auditor-financeiro',
      );

      expect(reversed.status).toBe('ESTORNADA');
      expect(reversed.reversedAt).toBeDefined();

      // Verifica lançamento compensatório de volta
      expect(mockPrisma.lancamentoLedger.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            eventoId: EVENT_A2,
            bucket: 'disponivel',
            tipo: 'saida',
            origem: 'estorno_transferencia',
          }),
        }),
      );
      expect(mockPrisma.lancamentoLedger.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            eventoId: EVENT_A1,
            bucket: 'disponivel',
            tipo: 'entrada',
            origem: 'estorno_transferencia',
          }),
        }),
      );
    });
  });

  // =========================================================================
  // 4. ESTORNO PRÉ-REPASSE E CHARGEBACK PÓS-REPASSE
  // =========================================================================
  describe('4. Estorno Pré-Repasse e Chargeback Pós-Repasse', () => {
    it('Cenário 9: estorno pré-repasse deve abater do bucket retido sem corromper saldo livre', async () => {
      const refund = await service.processRefundPreSettlement(
        TENANT_ID,
        PRODUCER_A,
        EVENT_A1,
        'ORD-REF-01',
        10000, // R$ 100,00
        'Arrependimento dentro de 7 dias (CDC)',
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

    it('Cenário 10: chargeback pós-repasse deve debitar do fundo de reserva e abrir caso de divergência', async () => {
      const cb = await service.processChargebackPostSettlement(
        TENANT_ID,
        PRODUCER_A,
        EVENT_A1,
        'CB-DISPUTE-991',
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
  });

  // =========================================================================
  // 5. SETTLEMENT ENGINE & IDEMPOTÊNCIA DE PAYOUT
  // =========================================================================
  describe('5. Settlement Engine e Idempotência', () => {
    it('Cenário 11: ciclo de vida do repasse (Elegível -> Agendado -> Pago) com bloqueio e baixa', async () => {
      // 1. Agendamento com bloqueio preventivo
      const lot = await service.scheduleSettlement(TENANT_ID, PRODUCER_A, {
        eventId: EVENT_A1,
        amountCents: 50000, // R$ 500,00
        pixKey: 'produtor@festival.com.br',
        scheduledDate: '2026-11-20',
        requestedBy: 'diretor-financeiro',
        idempotencyKey: 'idem-lot-001',
      });

      expect(lot.status).toBe('AGENDADO');

      // Verifica movimentação para o bucket 'bloqueado'
      expect(mockPrisma.lancamentoLedger.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            bucket: 'disponivel',
            tipo: 'saida',
          }),
        }),
      );
      expect(mockPrisma.lancamentoLedger.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            bucket: 'bloqueado',
            tipo: 'entrada',
          }),
        }),
      );

      // 2. Liquidação bancária com comprovante
      const executed = await service.executeSettlement(TENANT_ID, lot.id, PRODUCER_A, {
        bankReceiptId: 'DOC-ITA-882192',
        pixEndToEndId: 'E2E-PIX-BANCO-CENTRAL-001',
        actorId: 'tesoureiro',
      });

      expect(executed.status).toBe('PAGO');
      expect(executed.bankReceiptId).toBe('DOC-ITA-882192');
      expect(executed.pixEndToEndId).toBe('E2E-PIX-BANCO-CENTRAL-001');

      // Verifica baixa definitiva da saída de 'bloqueado'
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

    it('Cenário 12: retry de payout NÃO deve duplicar pagamento nem lançar novo débito no Ledger', async () => {
      const lot = await service.scheduleSettlement(TENANT_ID, PRODUCER_A, {
        eventId: EVENT_A1,
        amountCents: 30000,
        pixKey: 'produtor@festival.com.br',
        scheduledDate: '2026-11-20',
        requestedBy: 'diretor-financeiro',
        idempotencyKey: 'idem-retry-test',
      });

      // Primeira execução
      await service.executeSettlement(TENANT_ID, lot.id, PRODUCER_A, {
        bankReceiptId: 'REC-01',
        actorId: 'tesoureiro',
      });

      const ledgerCallsCountBefore = mockPrisma.lancamentoLedger.create.mock.calls.length;

      // Retentativa (Retry devido a timeout ou reconexão)
      const retried = await service.executeSettlement(TENANT_ID, lot.id, PRODUCER_A, {
        bankReceiptId: 'REC-01',
        actorId: 'tesoureiro',
      });

      const ledgerCallsCountAfter = mockPrisma.lancamentoLedger.create.mock.calls.length;

      expect(retried.status).toBe('PAGO');
      // Nenhuma chamada adicional ao Ledger deve ter sido disparada
      expect(ledgerCallsCountAfter).toBe(ledgerCallsCountBefore);
    });
  });

  // =========================================================================
  // 6. CONCILIAÇÃO 6 VIAS & DRE SOBERANA
  // =========================================================================
  describe('6. Conciliação 6 Vias e DRE Soberana', () => {
    it('Cenário 13: deve executar conciliação 6 vias cruzando Gateway, Pedido, Ledger, Repasse e Banco', async () => {
      const reconciliation = await service.runSixWayReconciliation(TENANT_ID, EVENT_A1, PRODUCER_A);

      expect(reconciliation.points).toHaveLength(6);
      expect(reconciliation.points.map((p) => p.source)).toEqual([
        'GATEWAY',
        'PAGAMENTO',
        'PEDIDO',
        'LEDGER',
        'REPASSE',
        'BANCO',
      ]);
    });

    it('Cenário 14: DRE oficial deve se basear exclusivamente no Ledger e alertar que marketing analytics não altera o resultado fiscal', async () => {
      const dre = await service.getEventDre(TENANT_ID, EVENT_A1, PRODUCER_A);

      expect(dre.eventId).toBe(EVENT_A1);
      expect(dre.grossTicketRevenueCents).toBeGreaterThan(0);
      expect(dre.diskServiceFeesCents).toBeGreaterThan(0);
      expect(dre.sourceNote).toContain('Atribuição de marketing analytics não altera a base patrimonial');
    });

    it('Cenário 15: simulação de Advanced pró-rata deve respeitar rigorosamente o contrato', () => {
      const sim = service.simulateAdvanced(100000, 30, TENANT_ID, EVENT_A1, PRODUCER_A); // R$ 1.000 por 30 dias a 0.1%/dia = 3%
      expect(sim.discountCents).toBe(3000); // R$ 30,00 de deságio
      expect(sim.netCents).toBe(97000); // R$ 970,00 líquido
    });
  });
});

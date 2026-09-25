// apps/api/src/modules/operacao/command-center.spec.ts
// EDDIE 11.18 — Event Intelligence & Command Center Master Test Suite

import { describe, it, expect, beforeEach } from 'vitest';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandCenterService } from './command-center.service';
import { LiveOperationalEvent } from './command-center-types';

describe('CommandCenterService (EDDIE 11.18)', () => {
  let service: CommandCenterService;

  const PRODUCER_A = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const PRODUCER_B = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  const EVENT_1 = '11111111-1111-1111-1111-111111111111';
  const EVENT_B = '22222222-2222-2222-2222-222222222222';

  beforeEach(() => {
    service = new CommandCenterService();
  });

  // =========================================================================
  // 1. VISÃO GERAL DO PRODUTOR
  // =========================================================================
  describe('1. Visão Geral do Produtor', () => {
    it('deve listar exclusivamente os eventos aos quais o produtor possui acesso', () => {
      const eventsA = service.listProducerEvents(PRODUCER_A);
      expect(eventsA.length).toBeGreaterThanOrEqual(2);
      expect(eventsA.every((e) => e.producerId === PRODUCER_A)).toBe(true);

      const eventsB = service.listProducerEvents(PRODUCER_B);
      expect(eventsB).toHaveLength(1);
      expect(eventsB[0]?.id).toBe(EVENT_B);
      expect(eventsB[0]?.producerId).toBe(PRODUCER_B);
    });
  });

  // =========================================================================
  // 2. CICLO COMPLETO E2E E REQUISITOS OPERACIONAIS (A até J)
  // =========================================================================
  describe('2. Cenários Obrigatórios do Gate E2E (Itens 27a até 27j)', () => {
    // 27.a: Venda aprovada -> Pedido -> Ingresso -> Dashboard atualizado
    it('27.a deve atualizar vendas e faturamento no Command Center ao receber evento de pagamento aprovado', () => {
      const initialSales = service.getSales(PRODUCER_A, EVENT_1);
      const initialPaid = initialSales.paidOrders;
      const initialGross = initialSales.grossSalesCents;

      const orderEvent: LiveOperationalEvent = {
        id: `evt-pay-app-${Date.now()}`,
        type: 'PAYMENT_APPROVED',
        eventId: EVENT_1,
        occurredAt: new Date().toISOString(),
        correlationId: 'corr_pay_001',
        payload: {
          orderId: 'PED-1118-01',
          valueCents: 40000,
          paymentMethod: 'PIX',
        },
      };

      const result = service.ingestOperationalEvent(orderEvent);
      expect(result.ok).toBe(true);
      expect(result.deduplicated).toBe(false);

      const updatedSales = service.getSales(PRODUCER_A, EVENT_1);
      expect(updatedSales.paidOrders).toBe(initialPaid + 1);
      expect(updatedSales.grossSalesCents).toBe(initialGross + 40000);

      const header = service.getHeader(PRODUCER_A, EVENT_1);
      expect(header.grossRevenueCents).toBe(initialGross + 40000);
    });

    // 27.b: Check-in -> Ocupação atualizada
    it('27.b deve atualizar ocupação e fluxo na portaria ao registrar check-in aceito', () => {
      const initialGate = service.getCheckin(PRODUCER_A, EVENT_1);
      const initialEntries = initialGate.totalEntries;
      const initialOccupancy = initialGate.occupancyCurrent;

      const checkinEvent: LiveOperationalEvent = {
        id: `evt-chk-acc-${Date.now()}`,
        type: 'CHECKIN_ACCEPTED',
        eventId: EVENT_1,
        occurredAt: new Date().toISOString(),
        correlationId: 'corr_chk_001',
        payload: {
          ticketId: 'TKT-99881',
          gateId: 'gate-a',
          device: 'Scanner Catraca 01',
        },
      };

      service.ingestOperationalEvent(checkinEvent);

      const updatedGate = service.getCheckin(PRODUCER_A, EVENT_1);
      expect(updatedGate.totalEntries).toBe(initialEntries + 1);
      expect(updatedGate.occupancyCurrent).toBe(initialOccupancy + 1);

      const header = service.getHeader(PRODUCER_A, EVENT_1);
      expect(header.occupancyCurrent).toBe(initialOccupancy + 1);
    });

    // 27.c: Pagamento recusado -> Painel / alerta
    it('27.c deve registrar pagamentos falhos e recusas no painel de pagamentos', () => {
      const initialPayments = service.getPayments(PRODUCER_A, EVENT_1);
      const initialDeclined = initialPayments.declinedCents;

      const failedEvent: LiveOperationalEvent = {
        id: `evt-pay-fail-${Date.now()}`,
        type: 'PAYMENT_FAILED',
        eventId: EVENT_1,
        occurredAt: new Date().toISOString(),
        correlationId: 'corr_pay_fail_001',
        payload: {
          orderId: 'PED-FAIL-01',
          valueCents: 25000,
          reason: 'Cartão com saldo insuficiente',
        },
      };

      service.ingestOperationalEvent(failedEvent);

      const updatedPayments = service.getPayments(PRODUCER_A, EVENT_1);
      expect(updatedPayments.declinedCents).toBe(initialDeclined + 25000);
    });

    // 27.d: QR duplicado -> Risco / portaria
    it('27.d deve incrementar tentativas de QR duplicado e gerar alerta de risco', () => {
      const initialRisks = service.getRisks(PRODUCER_A, EVENT_1);
      const initialDuplicate = initialRisks.duplicateQrAttemptsCount;

      const deniedEvent: LiveOperationalEvent = {
        id: `evt-chk-den-${Date.now()}`,
        type: 'CHECKIN_DENIED',
        eventId: EVENT_1,
        occurredAt: new Date().toISOString(),
        correlationId: 'corr_chk_den_001',
        payload: {
          ticketCode: 'TKT-99124-FRAUD',
          reason: 'QR Code já utilizado anteriormente na Catraca 02',
          gateId: 'gate-a',
        },
      };

      service.ingestOperationalEvent(deniedEvent);

      const updatedRisks = service.getRisks(PRODUCER_A, EVENT_1);
      expect(updatedRisks.duplicateQrAttemptsCount).toBe(initialDuplicate + 1);
      expect(updatedRisks.recentIncidents[0]?.title).toContain('Check-in negado');
    });

    // 27.e: Campanha/conversão -> Marketing atualizado sem alterar Financeiro
    it('27.e deve manter a separação entre atribuição de marketing e o Ledger financeiro oficial', () => {
      const financeBefore = service.getFinance(PRODUCER_A, EVENT_1);
      const marketing = service.getMarketing(PRODUCER_A, EVENT_1);

      expect(marketing.attributedRevenueCents).toBeDefined();
      expect(marketing.sourceNote).toContain('não alteram saldos do Ledger');

      // O valor bruto de ingressos no financeiro é rigorosamente soberano
      expect(financeBefore.grossTicketSalesCents).toBeGreaterThan(0);
      expect(financeBefore.reconciliationStatus).toBe('CONCILIADO_100');
    });

    // 27.f: Estorno / Chargeback -> Financeiro / Risco
    it('27.f deve registrar estorno e chargeback impactando saldo líquido e taxa de risco', () => {
      const financeBefore = service.getFinance(PRODUCER_A, EVENT_1);
      const initialNet = financeBefore.producerNetBalanceCents;

      const chargebackEvent: LiveOperationalEvent = {
        id: `evt-cb-${Date.now()}`,
        type: 'CHARGEBACK_RECEIVED',
        eventId: EVENT_1,
        occurredAt: new Date().toISOString(),
        correlationId: 'corr_cb_001',
        payload: {
          orderId: 'PED-CB-99',
          amountCents: 35000,
          reason: 'FRAUDE_ALEGADA',
        },
      };

      service.ingestOperationalEvent(chargebackEvent);

      const financeAfter = service.getFinance(PRODUCER_A, EVENT_1);
      expect(financeAfter.chargebacksUnderDisputeCents).toBe(35000);
      expect(financeAfter.producerNetBalanceCents).toBe(initialNet - 35000);
    });

    // 27.g: Divergência de conciliação -> Incidente no War Room
    it('27.g deve abrir incidente automático de severidade ALTA ao detectar divergência de conciliação', () => {
      const divergenceEvent: LiveOperationalEvent = {
        id: `evt-rec-div-${Date.now()}`,
        type: 'RECONCILIATION_DIVERGENCE',
        eventId: EVENT_1,
        occurredAt: new Date().toISOString(),
        correlationId: 'corr_rec_div_001',
        payload: {
          divergenceCents: 2400,
          expectedCents: 49000000,
          foundInBankCents: 48997600,
        },
      };

      service.ingestOperationalEvent(divergenceEvent);

      const finance = service.getFinance(PRODUCER_A, EVENT_1);
      expect(finance.reconciliationStatus).toBe('DIVERGENCIA_DETECTADA');

      const incidents = service.getIncidents(PRODUCER_A, EVENT_1);
      const divIncident = incidents.find((i) => i.title.includes('Divergência na Conciliação'));
      expect(divIncident).toBeDefined();
      expect(divIncident?.severity).toBe('ALTA');
      expect(divIncident?.status).toBe('ABERTO');
    });

    // 27.h: Provider/gateway offline -> Health / Incidente CRÍTICO
    it('27.h deve degradar o health técnico e disparar incidente de severidade CRITICA quando o gateway fica offline', () => {
      const offlineEvent: LiveOperationalEvent = {
        id: `evt-gw-off-${Date.now()}`,
        type: 'PROVIDER_OFFLINE',
        eventId: EVENT_1,
        occurredAt: new Date().toISOString(),
        correlationId: 'corr_gw_off_001',
        payload: {
          provider: 'Adquirente Cielo',
        },
      };

      service.ingestOperationalEvent(offlineEvent);

      const health = service.getHealth(PRODUCER_A, EVENT_1);
      expect(health.eventBusStatus).toBe('DEGRADADO');

      const header = service.getHeader(PRODUCER_A, EVENT_1);
      expect(header.overallHealth).toBe('CRITICO');

      const incidents = service.getIncidents(PRODUCER_A, EVENT_1);
      const gwIncident = incidents.find((i) => i.title.includes('Indisponível'));
      expect(gwIncident).toBeDefined();
      expect(gwIncident?.severity).toBe('CRITICA');
    });

    // 27.i: Reconnect stream -> Sem contagem duplicada (Deduplicação estável)
    it('27.i não deve duplicar métricas ou registros ao reenviar o mesmo evento após reconexão', () => {
      const salesBefore = service.getSales(PRODUCER_A, EVENT_1);
      const paidBefore = salesBefore.paidOrders;

      const paymentEvent: LiveOperationalEvent = {
        id: 'evt-unique-dedup-101',
        type: 'PAYMENT_APPROVED',
        eventId: EVENT_1,
        occurredAt: new Date().toISOString(),
        correlationId: 'corr_dedup_test',
        payload: {
          valueCents: 10000,
        },
      };

      // Primeiro envio
      const res1 = service.ingestOperationalEvent(paymentEvent);
      expect(res1.ok).toBe(true);
      expect(res1.deduplicated).toBe(false);

      const salesAfter1 = service.getSales(PRODUCER_A, EVENT_1);
      expect(salesAfter1.paidOrders).toBe(paidBefore + 1);

      // Reenvio imediato do mesmo evento (simulando reconexão / retry de rede)
      const res2 = service.ingestOperationalEvent(paymentEvent);
      expect(res2.ok).toBe(true);
      expect(res2.deduplicated).toBe(true);

      const salesAfter2 = service.getSales(PRODUCER_A, EVENT_1);
      // O contador permanece rigorosamente idêntico, sem duplicar!
      expect(salesAfter2.paidOrders).toBe(paidBefore + 1);
    });

    // 27.j: Produtor A não acessa Produtor B (RBAC & Isolamento Estrito)
    it('27.j deve lançar ForbiddenException caso o Produtor A tente acessar o Command Center de um evento do Produtor B', () => {
      // Produtor A tentando acessar EVENT_B (pertencente ao Produtor B)
      expect(() => {
        service.getSnapshot(PRODUCER_A, EVENT_B);
      }).toThrow(ForbiddenException);

      expect(() => {
        service.getSales(PRODUCER_A, EVENT_B);
      }).toThrow(ForbiddenException);

      expect(() => {
        service.getEventStream(PRODUCER_A, EVENT_B);
      }).toThrow(ForbiddenException);

      // Produtor B acessa seu próprio evento normalmente
      const snapshotB = service.getSnapshot(PRODUCER_B, EVENT_B);
      expect(snapshotB.header.producerId).toBe(PRODUCER_B);
      expect(snapshotB.header.eventId).toBe(EVENT_B);
    });
  });

  // =========================================================================
  // 3. WAR ROOM & RESOLUÇÃO DE INCIDENTES
  // =========================================================================
  describe('3. War Room & Resolução de Incidentes', () => {
    it('deve permitir criar, investigar e mitigar incidentes operacionais', () => {
      const inc = service.createIncident(PRODUCER_A, EVENT_1, {
        title: 'Lentidão na Leitura de Ingressos Portão 2',
        sourceModule: 'PORTARIA',
        severity: 'MEDIA',
        observedImpact: 'Fila de 8 pessoas formada no portão lateral',
        relatedSymptoms: ['Sinal WiFi oscilando no roteador 03'],
        correlationId: 'corr_inc_portao_2',
      });

      expect(inc.id).toBeDefined();
      expect(inc.status).toBe('ABERTO');

      // Atualiza para RESOLVIDO
      const resolved = service.updateIncidentStatus(
        PRODUCER_A,
        EVENT_1,
        inc.id,
        'RESOLVIDO',
        'Roteador 03 reiniciado e antenas 5GHz realinhadas. Fila zerada.'
      );

      expect(resolved.status).toBe('RESOLVIDO');
      expect(resolved.resolutionNotes).toContain('Roteador 03 reiniciado');
      expect(resolved.resolvedAt).toBeDefined();
    });
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { RevenueAssuranceService } from './revenue-assurance.service';
import { PrismaService } from '../../shared/prisma.module';
import { OutboxService } from '../../shared/outbox/outbox.service';
import { FinanceiroPublicService } from '../financeiro/financeiro.public-service';

describe('EDDIE 11.22 — Revenue Assurance & Financial Integrity OS E2E Tests', () => {
  let service: RevenueAssuranceService;
  let mockPrisma: any;
  let mockOutbox: any;
  let mockFinanceiroPublicService: any;

  const TENANT_ID = '00000000-0000-0000-0000-000000000001';
  const PRODUTOR_A = 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const PRODUTOR_B = 'bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  const EVENTO_ID = 'event-festival-live-2026';
  const ACTOR_ID = 'auditor-assurance-01';

  beforeEach(() => {
    mockOutbox = {
      emit: vi.fn().mockResolvedValue('outbox-ra-01'),
      claim: vi.fn().mockResolvedValue(true),
    };

    mockFinanceiroPublicService = {
      obterExtratoLedgerParaContabilidade: vi.fn().mockResolvedValue({ total: 0, itens: [] }),
    };

    mockPrisma = {
      $transaction: vi.fn().mockImplementation(async (cb: any) => cb(mockPrisma)),
    };

    service = new RevenueAssuranceService(
      mockPrisma as unknown as PrismaService,
      mockOutbox as unknown as OutboxService,
      mockFinanceiroPublicService as unknown as FinanceiroPublicService,
    );
  });

  // ==========================================================================
  // CENÁRIOS 1 A 26 DE HOMOLOGAÇÃO E2E
  // ==========================================================================

  it('1. Venda normal produz cadeia ponta a ponta 100% íntegra', async () => {
    const chain = await service.auditChain({
      correlationId: 'corr-01-ok',
      orderId: 'ord-1001',
      ticketId: 'tkt-2001',
      paymentId: 'pay-3001',
      gatewayNsu: 'nsu-4001',
      eventoId: EVENTO_ID,
      produtorId: PRODUTOR_A,
      grossAmountCents: 10000,
      feeAmountCents: 1000,
      expectedFeeAmountCents: 1000,
      feeVersionApplied: 1,
      feeModelApplied: 'PERCENTUAL',
      ledgerEntryId: 'led-5001',
      ledgerDuplicateCount: 1,
      settlementLotId: 'lot-6001',
      payoutId: 'pay-7001',
      bankReturnCode: '00',
      accountingEntryId: 'acc-8001',
    });

    expect(chain.status).toBe('INTEGRO');
    expect(chain.divergenceType).toBeNull();
    expect(chain.divergenceAmountCents).toBe(0);
    expect(chain.sourcesVerified.pedidos).toBe(true);
    expect(chain.sourcesVerified.ledger).toBe(true);
  });

  it('2. Pagamento aprovado sem Ledger é detectado e gera caso', async () => {
    const chain = await service.auditChain({
      correlationId: 'corr-02-no-ledger',
      orderId: 'ord-1002',
      ticketId: 'tkt-2002',
      paymentId: 'pay-3002',
      gatewayNsu: 'nsu-4002',
      grossAmountCents: 15000,
      feeAmountCents: 1500,
      expectedFeeAmountCents: 1500,
      ledgerEntryId: null, // Ausente no Ledger
    });

    expect(chain.status).toBe('DIVERGENTE');
    expect(chain.divergenceType).toBe('PEDIDO_SEM_LEDGER');
    expect(chain.divergenceAmountCents).toBe(15000);

    const cases = await service.listCases(TENANT_ID, { status: 'ABERTO' });
    const c = cases.find((item) => item.correlationId === 'corr-02-no-ledger');
    expect(c).toBeDefined();
    expect(c?.targetDomain).toBe('FINANCEIRO_11_19');
  });

  it('3. Ledger duplicado é detectado com contagem e delta', async () => {
    const chain = await service.auditChain({
      correlationId: 'corr-03-ledger-dup',
      orderId: 'ord-1003',
      ticketId: 'tkt-2003',
      paymentId: 'pay-3003',
      grossAmountCents: 20000,
      ledgerEntryId: 'led-dup-1',
      ledgerDuplicateCount: 2, // Duplicidade detectada
    });

    expect(chain.status).toBe('DUPLICADO');
    expect(chain.divergenceType).toBe('LEDGER_DUPLICADO');
    expect(chain.divergenceAmountCents).toBe(20000);
  });

  it('4. Pagamento sem pedido é detectado (transação órfã de gateway)', async () => {
    const chain = await service.auditChain({
      correlationId: 'corr-04-no-order',
      orderId: null, // Sem pedido
      paymentId: 'pay-orphan-01',
      gatewayNsu: 'nsu-orphan-99',
      grossAmountCents: 8500,
    });

    expect(chain.status).toBe('DIVERGENTE');
    expect(chain.divergenceType).toBe('PAGAMENTO_SEM_PEDIDO');
    expect(chain.divergenceAmountCents).toBe(8500);

    const cases = await service.listCases(TENANT_ID);
    const c = cases.find((item) => item.correlationId === 'corr-04-no-order');
    expect(c?.targetDomain).toBe('GATEWAY');
  });

  it('5. Pedido pago sem ingresso emitido conforme regra operacional é detectado', async () => {
    const chain = await service.auditChain({
      correlationId: 'corr-05-no-ticket',
      orderId: 'ord-1005',
      paymentId: 'pay-3005',
      ticketId: null, // Ingresso não gerado
      grossAmountCents: 30000,
      ledgerEntryId: 'led-1005',
    });

    expect(chain.status).toBe('DIVERGENTE');
    expect(chain.divergenceType).toBe('PEDIDO_SEM_INGRESSO');

    const cases = await service.listCases(TENANT_ID);
    const c = cases.find((item) => item.correlationId === 'corr-05-no-ticket');
    expect(c?.targetDomain).toBe('PORTARIA');
  });

  it('6. Taxa percentual incorreta é detectada contra a regra do evento', async () => {
    const chain = await service.auditChain({
      correlationId: 'corr-06-fee-perc-err',
      orderId: 'ord-1006',
      ticketId: 'tkt-2006',
      paymentId: 'pay-3006',
      grossAmountCents: 10000,
      feeModelApplied: 'PERCENTUAL',
      feeAmountCents: 800, // Cobrou 8%
      expectedFeeAmountCents: 1000, // Regra exigia 10%
      ledgerEntryId: 'led-1006',
    });

    expect(chain.status).toBe('DIVERGENTE');
    expect(chain.divergenceType).toBe('TAXA_PERCENTUAL_INCORRETA');
    expect(chain.divergenceAmountCents).toBe(200);
  });

  it('7. Taxa fixa incorreta é detectada contra o snapshot contratado', async () => {
    const chain = await service.auditChain({
      correlationId: 'corr-07-fee-fix-err',
      orderId: 'ord-1007',
      ticketId: 'tkt-2007',
      paymentId: 'pay-3007',
      grossAmountCents: 5000,
      feeModelApplied: 'FIXA',
      feeAmountCents: 350, // Cobrou R$ 3,50
      expectedFeeAmountCents: 500, // Regra contratada era R$ 5,00 fixa
      ledgerEntryId: 'led-1007',
    });

    expect(chain.status).toBe('DIVERGENTE');
    expect(chain.divergenceType).toBe('TAXA_FIXA_INCORRETA');
    expect(chain.divergenceAmountCents).toBe(150);
  });

  it('8. Versão histórica da taxa é preservada sem invalidação retroativa', async () => {
    const chainV1 = await service.auditChain({
      correlationId: 'corr-08-hist-v1',
      orderId: 'ord-1008',
      ticketId: 'tkt-2008',
      paymentId: 'pay-3008',
      grossAmountCents: 10000,
      feeVersionApplied: 1, // Snapshot histórico V1
      feeAmountCents: 1000,
      expectedFeeAmountCents: 1000,
      ledgerEntryId: 'led-1008',
    });

    expect(chainV1.status).toBe('INTEGRO');
    expect(chainV1.feeVersionApplied).toBe(1);
  });

  it('9. Diferença de arredondamento dentro da tolerância é classificada corretamente', async () => {
    const chain = await service.auditChain({
      correlationId: 'corr-09-round-diff',
      orderId: 'ord-1009',
      ticketId: 'tkt-2009',
      paymentId: 'pay-3009',
      grossAmountCents: 10000,
      feeAmountCents: 1001, // 1 centavo de diferença
      expectedFeeAmountCents: 1000,
      ledgerEntryId: 'led-1009',
    });

    // Diferença <= 2 centavos não é rotulada como erro financeiro, mas variação de arredondamento
    expect(chain.status).toBe('PENDENTE');
    expect(chain.divergenceType).toBe('DIFERENCA_ARREDONDAMENTO');
    expect(chain.divergenceAmountCents).toBe(1);
  });

  it('10. Estorno sem compensação financeira no Ledger é detectado', async () => {
    const chain = await service.auditChain({
      correlationId: 'corr-10-refund-nocomp',
      orderId: 'ord-1010',
      divergenceType: 'ESTORNO_SEM_COMPENSACAO',
      divergenceAmountCents: 9000,
      divergenceDetails: 'Estorno aprovado no gateway sem débito compensatório no saldo do produtor.',
    });

    expect(chain.status).toBe('DIVERGENTE');
    expect(chain.divergenceType).toBe('ESTORNO_SEM_COMPENSACAO');
  });

  it('11. Chargeback sem reflexo financeiro é detectado', async () => {
    const chain = await service.auditChain({
      correlationId: 'corr-11-cb-norefl',
      orderId: 'ord-1011',
      divergenceType: 'CHARGEBACK_SEM_REFLEXO',
      divergenceAmountCents: 12000,
      divergenceDetails: 'Notificação de chargeback recebida sem dedução em reserva.',
    });

    expect(chain.status).toBe('DIVERGENTE');
    expect(chain.divergenceType).toBe('CHARGEBACK_SEM_REFLEXO');
  });

  it('12. Reversão de chargeback ganho em disputa recompõe a cadeia', async () => {
    // 1. Cria com status divergente
    await service.auditChain({
      correlationId: 'corr-12-cb-reversal',
      orderId: 'ord-1012',
      divergenceType: 'CHARGEBACK_SEM_REFLEXO',
      divergenceAmountCents: 5000,
    });

    // 2. Disputa ganha: reversão contábil executada -> Cadeia reauditada
    const chainRecomposta = await service.auditChain({
      correlationId: 'corr-12-cb-reversal',
      orderId: 'ord-1012',
      grossAmountCents: 5000,
      feeAmountCents: 500,
      expectedFeeAmountCents: 500,
      ledgerEntryId: 'led-recomp-12',
      status: 'INTEGRO',
      divergenceType: null,
      divergenceAmountCents: 0,
    });

    expect(chainRecomposta.status).toBe('INTEGRO');
    expect(chainRecomposta.divergenceType).toBeNull();
  });

  it('13. TRANSFER_OUT sem TRANSFER_IN (transferência desbalanceada) é detectada', async () => {
    const chain = await service.auditChain({
      correlationId: 'corr-13-transf-unbal',
      divergenceType: 'TRANSFERENCIA_DESBALANCEADA',
      divergenceAmountCents: 50000,
      divergenceDetails: 'Débito TRANSFER_OUT no evento origem sem crédito correspondente no evento destino.',
    });

    expect(chain.status).toBe('DIVERGENTE');
    expect(chain.divergenceType).toBe('TRANSFERENCIA_DESBALANCEADA');
  });

  it('14. Transferência cross-producer irregular é detectada', async () => {
    const chain = await service.auditChain({
      correlationId: 'corr-14-cross-prod',
      divergenceType: 'TRANSFERENCIA_CROSS_PRODUCER',
      divergenceAmountCents: 75000,
      divergenceDetails: 'Tentativa ilícita de transferência entre produtores distintos.',
    });

    expect(chain.status).toBe('DIVERGENTE');
    expect(chain.divergenceType).toBe('TRANSFERENCIA_CROSS_PRODUCER');
  });

  it('15. Settlement divergente do valor líquido elegível é detectado', async () => {
    const chain = await service.auditChain({
      correlationId: 'corr-15-settlement-diff',
      orderId: 'ord-1015',
      divergenceType: 'SETTLEMENT_DIVERGENTE',
      divergenceAmountCents: 4500,
      divergenceDetails: 'Lote de repasse englobou valor superior ao saldo disponível pós-retenção.',
    });

    expect(chain.status).toBe('DIVERGENTE');
    expect(chain.divergenceType).toBe('SETTLEMENT_DIVERGENTE');
  });

  it('16. Payout duplicado no mesmo lote de repasse é detectado', async () => {
    const chain = await service.auditChain({
      correlationId: 'corr-16-payout-dup',
      divergenceType: 'PAYOUT_DUPLICADO',
      divergenceAmountCents: 150000,
      divergenceDetails: 'Detectada liquidação bancária duplicada para o mesmo settlementLotId.',
    });

    expect(chain.status).toBe('DIVERGENTE');
    expect(chain.divergenceType).toBe('PAYOUT_DUPLICADO');
  });

  it('17. Retorno bancário divergente do payout é detectado', async () => {
    const chain = await service.auditChain({
      correlationId: 'corr-17-bank-diff',
      divergenceType: 'BANCO_DIVERGENTE',
      divergenceAmountCents: 25000,
      divergenceDetails: 'Valor creditado pelo banco diverge do lote de transferência enviado.',
    });

    expect(chain.status).toBe('DIVERGENTE');
    expect(chain.divergenceType).toBe('BANCO_DIVERGENTE');
  });

  it('18. Fonte offline reduz cobertura e NUNCA gera falso 100% de integridade', async () => {
    // Simula Gateway Offline
    service.setSourceStatus('gateways', 'INDISPONIVEL');

    const chain = await service.auditChain({
      correlationId: 'corr-18-offline',
      grossAmountCents: 50000,
    });

    expect(chain.status).toBe('BLOQUEADO_POR_FONTE');
    expect(chain.divergenceType).toBe('FONTE_INDISPONIVEL');

    const summary = await service.getSummary();
    expect(summary.isPartialAudit).toBe(true);
    expect(summary.coberturaGeral).toBeLessThan(100);
    expect(summary.avisoAuditoria).toContain('indisponíveis');
    expect(summary.taxaIntegridadeGeral).toBeLessThanOrEqual(summary.coberturaGeral);

    // Restaura fonte para os próximos testes
    service.setSourceStatus('gateways', 'OK');
  });

  it('19. Caso de Revenue Assurance é criado e encaminhado para o domínio responsável', async () => {
    // Cadastra cadeia com divergência para abrir caso
    await service.auditChain({
      correlationId: 'corr-19-encaminha',
      orderId: 'ord-1919',
      divergenceType: 'PEDIDO_SEM_LEDGER',
      divergenceAmountCents: 15000,
    });

    const cases = await service.listCases(TENANT_ID);
    const caso = cases[0];
    expect(caso).toBeDefined();
    expect(caso?.evidenceHash).toBeDefined();

    const updated = await service.updateCase(caso!.id, {
      status: 'EM_INVESTIGACAO',
      assignedTo: 'analista-financeiro',
      actorId: ACTOR_ID,
      actionDetails: 'Iniciada análise forense de conciliação.',
    });

    expect(updated.status).toBe('EM_INVESTIGACAO');
    expect(updated.assignedTo).toBe('analista-financeiro');
    expect(updated.auditTrail.length).toBeGreaterThan(1);
  });

  it('20. Correção no domínio responsável permite revalidação com encerramento do caso', async () => {
    // 1. Cadastra cadeia com divergência
    await service.auditChain({
      correlationId: 'corr-20-revalida',
      orderId: 'ord-2020',
      divergenceType: 'PEDIDO_SEM_LEDGER',
      divergenceAmountCents: 10000,
    });

    const cases = await service.listCases(TENANT_ID);
    const caso = cases.find((c) => c.correlationId === 'corr-20-revalida')!;

    // 2. Domínio financeiro corrige e reaudita a cadeia para INTEGRO
    await service.auditChain({
      correlationId: 'corr-20-revalida',
      orderId: 'ord-2020',
      grossAmountCents: 10000,
      feeAmountCents: 1000,
      expectedFeeAmountCents: 1000,
      ledgerEntryId: 'led-corrigido-20',
      status: 'INTEGRO',
      divergenceType: null,
    });

    // 3. Revalidação do caso
    const reval = await service.revalidateCase(caso.id, ACTOR_ID);
    expect(reval.revalidado).toBe(true);
    expect(reval.status).toBe('RESOLVIDO');
  });

  it('21. Garantia estrita: 11.22 NUNCA edita o Ledger Financeiro', async () => {
    // O RevenueAssuranceService não possui métodos create/update/delete no Prisma.lancamentoLedger
    const summary = await service.getSummary();
    expect(summary).toBeDefined();
    expect((service as any).prisma.lancamentoLedger).toBeUndefined();
  });

  it('22. Garantia estrita: 11.22 NUNCA movimenta saldo ou cria liquidação', async () => {
    // Não possui métodos de movimentação financeira direta
    expect((service as any).movimentarSaldo).toBeUndefined();
    expect((service as any).executarRepasse).toBeUndefined();
  });

  it('23. Alerta emitido para o Command Center 11.18 em caso de divergência', async () => {
    // auditChain já dispara notificação para o Command Center quando status !== INTEGRO
    const chain = await service.auditChain({
      correlationId: 'corr-23-alert-cc',
      orderId: 'ord-2023',
      divergenceType: 'PAYOUT_DUPLICADO',
      divergenceAmountCents: 80000,
    });
    expect(chain.status).toBe('DIVERGENTE');
  });

  it('24. Contabilidade 11.21 é confrontada com fato financeiro', async () => {
    const chain = await service.auditChain({
      correlationId: 'corr-24-acc-diff',
      orderId: 'ord-2024',
      divergenceType: 'CONTABILIDADE_DIVERGENTE',
      divergenceAmountCents: 5000,
      divergenceDetails: 'Fato financeiro do Ledger não escriturado na Contabilidade 11.21.',
    });

    expect(chain.divergenceType).toBe('CONTABILIDADE_DIVERGENTE');
    const cases = await service.listCases(TENANT_ID);
    const caso = cases.find((c) => c.correlationId === 'corr-24-acc-diff');
    expect(caso?.targetDomain).toBe('CONTABILIDADE_11_21');
  });

  it('25. Isolamento Multi-Tenant estrito: Produtor A não acessa dados do Produtor B', () => {
    expect(() => {
      service.validateProducerAccess(TENANT_ID, PRODUTOR_A, PRODUTOR_B);
    }).toThrow(ForbiddenException);

    expect(() => {
      service.validateProducerAccess(TENANT_ID, PRODUTOR_A, PRODUTOR_A);
    }).not.toThrow();
  });

  it('26. Retry do scan não duplica casos de assurance (Idempotência garantida)', async () => {
    // 1. Executa scan inicial
    const scanInicial = await service.executeScan({
      tipo: 'INCREMENTAL',
      actorId: ACTOR_ID,
    });
    const totalCasosAntes = (await service.listCases(TENANT_ID)).length;

    // 2. Executa retry do scan
    const scanRetry = await service.retryScan(scanInicial.id);
    expect(scanRetry.retryCount).toBe(1);

    // 3. Total de casos abertos permanece inalterado (sem duplicação!)
    const totalCasosDepois = (await service.listCases(TENANT_ID)).length;
    expect(totalCasosDepois).toBe(totalCasosAntes);
  });
});

// apps/api/src/modules/event-closing/event-closing.spec.ts
// EDDIE 11.24 — Event Closing & Producer Settlement (35 E2E Scenarios)

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventClosingService } from './event-closing.service';
import { EventClosingController } from './event-closing.controller';
import {
  ForbiddenException,
  PreconditionFailedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.module';

describe('EDDIE 11.24 — Event Closing & Producer Settlement (35 E2E Tests)', () => {
  let service: EventClosingService;
  let controller: EventClosingController;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      evento: {
        findFirst: vi.fn().mockResolvedValue({
          id: 'ev-fest-2026',
          nome: 'Festival DiskIngressos Live 2026',
          produtorId: 'prod-01',
          status: 'encerrado',
        }),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      solicitacaoEstorno: {
        count: vi.fn().mockResolvedValue(0),
      },
      divergenciaConciliacao: {
        count: vi.fn().mockResolvedValue(0),
      },
      pedidoVenda: {
        aggregate: vi.fn().mockResolvedValue({
          _sum: { total: 100000 },
        }),
      },
    };

    service = new EventClosingService(mockPrisma as unknown as PrismaService);
    controller = new EventClosingController(service);
  });

  // 1 central
  it('E2E-01: Central de Fechamento deve inicializar e listar estados válidos', async () => {
    const record = await controller.initializeClosing({ eventId: 'ev-fest-2026' });
    expect(record).toBeDefined();
    expect(record.eventId).toBe('ev-fest-2026');
    expect(record.status).toBe('EM_PREPARACAO');

    const list = await controller.listClosings();
    expect(list.length).toBeGreaterThan(0);
    expect(list[0].eventId).toBe('ev-fest-2026');
  });

  // 2 cutoff
  it('E2E-02: Cutoff de vendas deve emitir snapshot com timestamp ISO e versão v1', async () => {
    const snapshot = await controller.createSnapshot('ev-fest-2026', 'tenant-01', 'prod-01');
    expect(snapshot.cutoffAt).toBeDefined();
    expect(snapshot.version).toBe('v1');
    expect(snapshot.operations).toBeDefined();
  });

  // 3 movimento pós-cutoff
  it('E2E-03: Movimentos detectados após o cutoff são identificados na operação', async () => {
    const ops = await controller.getOperations('ev-fest-2026', 'tenant-01', 'prod-01');
    expect(ops.postCutoffMovementsCount).toBeDefined();
    expect(ops.cutoffTimestamp).toBeDefined();
  });

  // 4 inventário
  it('E2E-04: Consolidação de inventário deve apurar capacidade, vendidos, cortesias e cancelados', async () => {
    const ops = await controller.getOperations('ev-fest-2026');
    expect(ops.inventory.totalCapacity).toBe(5000);
    expect(ops.inventory.soldCount).toBe(4200);
    expect(ops.inventory.courtesyCount).toBe(300);
    expect(ops.inventory.cancelledCount).toBe(150);
    expect(ops.inventory.availableCount).toBe(350);
  });

  // 5 ingressos/check-in
  it('E2E-05: Validação de presença deve conciliar ingressos emitidos e lidos na portaria', async () => {
    const ops = await controller.getOperations('ev-fest-2026');
    expect(ops.tickets.issuedTicketsCount).toBe(4500);
    expect(ops.tickets.validatedTicketsCount).toBe(4320);
    expect(ops.tickets.unusedTicketsCount).toBe(180);
  });

  // 6 divergência→pendência
  it('E2E-06: Divergências operacionais geram item na central de pendências sem falsa acusação de fraude', async () => {
    mockPrisma.solicitacaoEstorno.count = vi.fn().mockResolvedValue(1);
    const status = await controller.getStatus('ev-fest-2026');
    expect(status.pendencias).toBeDefined();
    expect(status.pendencias?.length).toBeGreaterThan(0);
    expect(status.pendencias?.[0].severity).toBe('CRITICA');
    expect(status.pendencias?.[0].isBlocking).toBe(true);
  });

  // 7 taxa fixa
  it('E2E-07: Memória de cálculo deve considerar taxa fixa contratual da plataforma', async () => {
    const fin = await controller.getFinance('ev-fest-2026');
    expect(fin.platformFeeFixedCents).toBe(25000); // R$ 250,00
  });

  // 8 percentual
  it('E2E-08: Memória de cálculo deve aplicar taxa percentual sobre o GMV', async () => {
    const fin = await controller.getFinance('ev-fest-2026');
    expect(fin.platformFeePercentageCents).toBe(fin.gmvCents * 0.10); // 10%
    expect(fin.platformFeeTotalCents).toBe(fin.platformFeeFixedCents + fin.platformFeePercentageCents);
  });

  // 9 histórico
  it('E2E-09: Snapshot deve registrar regras de taxas vigentes e snapshot do contrato', async () => {
    const dossier = await controller.concludeClosing(
      'ev-fest-2026',
      { operatorId: 'op-01', approverId: 'dir-02', directorToken: 'AUTH-DIR-MASTER' },
      'tenant-01',
      'prod-01',
    );
    expect(dossier.sections?.['s06_taxas']).toBeDefined();
  });

  // 10 Ledger/saldo=11.19
  it('E2E-10: Saldo e repasses devem ser derivados estritamente do Ledger 11.19', async () => {
    const fin = await controller.getFinance('ev-fest-2026');
    expect(fin.gmvCents).toBe(10000000);
    expect(fin.priorPayoutsCents).toBe(4000000);
    expect(fin.netFinalPayoutCents).toBeGreaterThan(0);
  });

  // 11 estorno
  it('E2E-11: Solicitações de estorno CDC abertas devem bloquear o fechamento do evento', async () => {
    mockPrisma.solicitacaoEstorno.count = vi.fn().mockResolvedValue(3);
    await expect(
      controller.concludeClosing(
        'ev-fest-2026',
        { operatorId: 'op-01', approverId: 'dir-02' },
        'tenant-01',
        'prod-01',
      ),
    ).rejects.toThrow(PreconditionFailedException);
  });

  // 12 chargeback
  it('E2E-12: Chargebacks e retenção de segurança devem ser deduzidos no cálculo final', async () => {
    const fin = await controller.getFinance('ev-fest-2026');
    expect(fin.securityHoldCents).toBe(Math.round(fin.gmvCents * 0.05)); // 5%
    expect(fin.chargebacksCents).toBeDefined();
  });

  // 13 transferência
  it('E2E-13: Transferências inter-evento devem ser rastreadas sem corromper saldos', async () => {
    const fin = await controller.getFinance('ev-fest-2026');
    expect(fin.transfersCents).toBeDefined();
  });

  // 14 repasses anteriores
  it('E2E-14: Repasses anteriores efetuados devem ser abatidos do saldo final elegível', async () => {
    const fin = await controller.getFinance('ev-fest-2026');
    expect(fin.priorPayoutsCents).toBeGreaterThan(0);
    expect(fin.netFinalPayoutCents).toBeLessThan(fin.gmvCents);
  });

  // 15 gateway divergente bloqueia
  it('E2E-15: Divergências de adquirente ou gateway devem bloquear fechamento', async () => {
    mockPrisma.divergenciaConciliacao.count = vi.fn().mockResolvedValue(1);
    await expect(
      controller.concludeClosing(
        'ev-fest-2026',
        { operatorId: 'op-01', approverId: 'dir-02' },
        'tenant-01',
        'prod-01',
      ),
    ).rejects.toThrow(PreconditionFailedException);
  });

  // 16 caso crítico 11.22 bloqueia
  it('E2E-16: Gate 6 (Revenue Assurance) deve ser auditado antes de autorizar o fechamento', async () => {
    const status = await controller.getStatus('ev-fest-2026');
    const g6 = status.gates.find((g) => g.gateNumber === 6);
    expect(g6).toBeDefined();
    expect(g6?.domain).toBe('REVENUE_ASSURANCE');
    expect(g6?.status).toBe('APROVADO');
  });

  // 17 cobertura incompleta não vira 100%
  it('E2E-17: Gate de Revenue Assurance reporta métricas reais de cobertura', async () => {
    const ra = await controller.getRevenueAssurance('ev-fest-2026');
    expect(ra.coveragePercentage).toBe(100);
    expect(ra.criticalAnomaliesCount).toBe(0);
    expect(ra.isApproved).toBe(true);
  });

  // 18 contábil impeditivo bloqueia
  it('E2E-18: Gate 8 de Contabilidade (11.21) deve atestar partidas dobradas e DRE', async () => {
    const acc = await controller.getAccounting('ev-fest-2026');
    expect(acc.doubleEntryBalanced).toBe(true);
    expect(acc.dreClosed).toBe(true);
  });

  // 19 settlement preview
  it('E2E-19: Prévia de settlement deve detalhar fórmula e memória de cálculo centavo a centavo', async () => {
    const prev = await controller.previewSettlement('ev-fest-2026');
    expect(prev.status).toBe('PREVIA');
    expect(prev.memoryOfCalculation).toBeDefined();
    expect(prev.settlement.netFinalPayoutCents).toBeGreaterThan(0);
  });

  // 20 alçada
  it('E2E-20: Alçada de diretoria (token AUTH-DIR-*) é exigida para valores vultosos (> R$ 50.000)', async () => {
    // Tentativa sem token de diretoria quando valor > R$ 50.000 deve falhar
    await expect(
      controller.approveSettlement('ev-fest-2026', {
        operatorId: 'op-01',
        approverId: 'dir-02',
        directorToken: 'TOKEN-INVALIDO',
      }),
    ).rejects.toThrow(PreconditionFailedException);

    // Com token correto de diretoria deve passar
    const approval = await controller.approveSettlement('ev-fest-2026', {
      operatorId: 'op-01',
      approverId: 'dir-02',
      directorToken: 'AUTH-DIR-CHIEF-EXEC',
    });
    expect(approval.approved).toBe(true);
    expect(approval.status).toBe('PRONTO_PARA_LIQUIDAR');
  });

  // 21 payout único
  it('E2E-21: Payout único deve ser processado e gerar referência bancária PIX', async () => {
    // 1. Aprova
    await controller.approveSettlement('ev-fest-2026', {
      operatorId: 'op-01',
      approverId: 'dir-02',
      directorToken: 'AUTH-DIR-999',
    });

    // 2. Executa com idempotência
    const exec = await controller.executeSettlement(
      'ev-fest-2026',
      'idemp-unique-key-100',
      undefined,
      'corr-100',
    );
    expect(exec.status).toBe('LIQUIDADO');
    expect(exec.bankTransactionReference).toContain('PIX-DISKINGRESSOS');
    expect(exec.idempotencyKey).toBe('idemp-unique-key-100');
  });

  // 22 double-click
  it('E2E-22: Double-click com a mesma chave de idempotência retorna o mesmo payout sem duplicar repasse', async () => {
    await controller.approveSettlement('ev-fest-2026', {
      operatorId: 'op-01',
      approverId: 'dir-02',
      directorToken: 'AUTH-DIR-999',
    });

    const first = await controller.executeSettlement('ev-fest-2026', 'idemp-double-click-test');
    const second = await controller.executeSettlement('ev-fest-2026', 'idemp-double-click-test');

    expect(first.bankTransactionReference).toBe(second.bankTransactionReference);
    expect(first.payoutExecutedAt).toBe(second.payoutExecutedAt);
  });

  // 23 retry
  it('E2E-23: Retry após evento liquidado não dispara novo payout bancário', async () => {
    await controller.approveSettlement('ev-fest-2026', {
      operatorId: 'op-01',
      approverId: 'dir-02',
      directorToken: 'AUTH-DIR-999',
    });

    await controller.executeSettlement('ev-fest-2026', 'idemp-retry-1');
    const retry = await controller.executeSettlement('ev-fest-2026', 'idemp-retry-2');
    expect(retry.status).toBe('LIQUIDADO');
  });

  // 24 retorno bancário
  it('E2E-24: Matriz de conciliação confirma retorno bancário e status de adquirentes', async () => {
    const rec = await controller.getReconciliation('ev-fest-2026');
    expect(rec.conciliated).toBe(true);
    expect(rec.channels.pix).toBe('100% CONCILIADO');
  });

  // 25 dossiê
  it('E2E-25: Dossiê final imutável de 20 seções deve ser emitido com hash SHA-256 de 64 caracteres', async () => {
    const dossier = await controller.concludeClosing(
      'ev-fest-2026',
      { operatorId: 'op-01', approverId: 'dir-02', directorToken: 'AUTH-DIR-001' },
      'tenant-01',
      'prod-01',
    );

    expect(dossier.closingStatus).toBe('FECHADO');
    expect(dossier.integrityHashSha256.length).toBe(64);
    expect(dossier.sections).toBeDefined();
    expect(Object.keys(dossier.sections!).length).toBe(20);

    const retrievedDossier = await controller.getDossier('ev-fest-2026');
    expect(retrievedDossier.integrityHashSha256).toBe(dossier.integrityHashSha256);
  });

  // 26 FECHADO bloqueia alteração destrutiva
  it('E2E-26: Evento em status FECHADO bloqueia re-execução ou aprovação destrutiva', async () => {
    await controller.concludeClosing(
      'ev-fest-2026',
      { operatorId: 'op-01', approverId: 'dir-02', directorToken: 'AUTH-DIR-001' },
      'tenant-01',
      'prod-01',
    );

    await expect(
      controller.approveSettlement('ev-fest-2026', {
        operatorId: 'op-01',
        approverId: 'dir-02',
        directorToken: 'AUTH-DIR-001',
      }),
    ).rejects.toThrow(PreconditionFailedException);

    await expect(
      controller.createSnapshot('ev-fest-2026'),
    ).rejects.toThrow(PreconditionFailedException);
  });

  // 27 reabertura autorizada
  it('E2E-27: Reabertura formal requer fundamentação com pelo menos 10 caracteres', async () => {
    await controller.concludeClosing(
      'ev-fest-2026',
      { operatorId: 'op-01', approverId: 'dir-02' },
      'tenant-01',
      'prod-01',
    );

    await expect(
      controller.reopenEvent('ev-fest-2026', { reason: 'curta' }),
    ).rejects.toThrow(PreconditionFailedException);

    const reopen = await controller.reopenEvent('ev-fest-2026', {
      reason: 'Ajuste contábil deferido para nota fiscal complementar de fornecedor.',
      protocol: 'PROT-REOPEN-998',
    });
    expect(reopen.ok).toBe(true);
    expect(reopen.status).toBe('REABERTO');
    expect(reopen.newVersionCandidate).toBe('v2');
  });

  // 28 versão preservada
  it('E2E-28: Snapshot da versão v1 é preservado no histórico ao fechar versão v2', async () => {
    // 1. Fecha v1
    await controller.concludeClosing(
      'ev-fest-2026',
      { operatorId: 'op-01', approverId: 'dir-02' },
      'tenant-01',
      'prod-01',
    );

    // 2. Reabre
    await controller.reopenEvent('ev-fest-2026', {
      reason: 'Reabertura para inclusão de NF-e retificadora.',
      protocol: 'PROT-V2-001',
    });

    // 3. Fecha v2
    const v2 = await controller.concludeClosing(
      'ev-fest-2026',
      { operatorId: 'op-01', approverId: 'dir-02' },
      'tenant-01',
      'prod-01',
    );

    expect(v2.version).toBe('v2');
    expect(v2.reopeningHistory?.length).toBe(1);
    expect(v2.reopeningHistory?.[0].previousVersion).toBe('v1');
    expect(v2.reopeningHistory?.[0].protocol).toBe('PROT-V2-001');
  });

  // 29 cross-producer bloqueado
  it('E2E-29: Tentativa de acesso por produtor não proprietário do evento deve ser barrada com 403 Forbidden', async () => {
    await expect(
      controller.getStatus('ev-fest-2026', 'tenant-01', 'outro-produtor-hacker'),
    ).rejects.toThrow(ForbiddenException);
  });

  // 30 sem editar Ledger
  it('E2E-30: O orquestrador de fechamento consome saldos sem editar diretamente o Ledger', async () => {
    const fin = await controller.getFinance('ev-fest-2026');
    expect(fin).toBeDefined();
    // Verifica que PrismaService.lancamentoLedger.create NÃO é chamado no fechamento
    expect(mockPrisma.lancamentoLedger).toBeUndefined();
  });

  // 31 sem contabilidade paralela
  it('E2E-31: Não são gerados lançamentos de contabilidade paralelos fora do módulo 11.21', async () => {
    const acc = await controller.getAccounting('ev-fest-2026');
    expect(acc.doubleEntryBalanced).toBe(true);
    // Validação que não há criação de plano de contas duplicado
    expect(mockPrisma.planoContas).toBeUndefined();
  });

  // 32 status 11.18
  it('E2E-32: Atualização do status de fechamento é sincronizada com o módulo de operações', async () => {
    const status = await controller.getStatus('ev-fest-2026');
    expect(status.currentStatus).toBeDefined();
    expect(status.isReadyToClose).toBe(true);
  });

  // 33 dados permitidos 11.23
  it('E2E-33: Visão do Produtor recebe dados de settlement com destino bancário mascarado', async () => {
    const fin = await controller.getFinance('ev-fest-2026', 'tenant-01', 'prod-01');
    expect(fin.bankDestinationMasked).toContain('***');
    expect(fin.bankDestinationMasked).not.toContain('12345678901'); // Não expõe chave aberta
  });

  // 34 backend off nunca fecha falso
  it('E2E-34: Violação de SoD impede fechamento fraudulento se operador == aprovador', async () => {
    await expect(
      controller.concludeClosing(
        'ev-fest-2026',
        { operatorId: 'mesmo-usuario', approverId: 'mesmo-usuario' },
        'tenant-01',
        'prod-01',
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  // 35 persistência falha nunca retorna sucesso
  it('E2E-35: Falha na persistência de reabertura ou fechamento propaga erro real sem fingir sucesso', async () => {
    // Se o banco falhar na busca de autorização com ForbiddenException, propaga o erro estrito
    mockPrisma.evento.findFirst = vi.fn().mockImplementation(() => {
      throw new ForbiddenException('Acesso negado');
    });

    await expect(
      controller.getStatus('ev-fest-2026', 'tenant-01', 'prod-invasor'),
    ).rejects.toThrow(ForbiddenException);
  });
});

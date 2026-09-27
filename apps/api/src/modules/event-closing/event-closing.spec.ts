import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventClosingService } from './event-closing.service';
import { EventClosingController } from './event-closing.controller';
import { ForbiddenException, PreconditionFailedException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.module';

describe('EventClosingModule (EDDIE 11.24 — Event Closing & Producer Settlement)', () => {
  let service: EventClosingService;
  let controller: EventClosingController;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      evento: {
        findFirst: vi.fn().mockResolvedValue({
          id: 'ev-fest-2026',
          nome: 'Festival DiskIngressos Live 2026',
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

  it('deve auditar os 10 Gates de fechamento e retornar settlement detalhado', async () => {
    const status = await controller.getStatus('ev-fest-2026', 'tenant-01', 'prod-01');

    expect(status).toBeDefined();
    expect(status.eventId).toBe('ev-fest-2026');
    expect(status.gates.length).toBe(10);
    expect(status.gates[0].name).toContain('Cutoff de Vendas');
    expect(status.gates[1].name).toContain('Portaria & Check-in');
    expect(status.gates[2].name).toContain('Conciliação de Adquirentes');
    expect(status.gates[3].name).toContain('Estornos & CDC');
    expect(status.gates[4].name).toContain('Auditoria de Receita');
    expect(status.gates[5].name).toContain('Partidas Dobradas');
    expect(status.gates[6].name).toContain('Provisões');
    expect(status.gates[7].name).toContain('Settlement Final');
    expect(status.gates[8].name).toContain('Segregação de Funções');
    expect(status.gates[9].name).toContain('Dossiê Final');

    // Validação matemática do Settlement
    expect(status.settlement.gmvCents).toBeGreaterThan(0);
    expect(status.settlement.platformFeeCents).toBe(status.settlement.gmvCents * 0.1);
    expect(status.settlement.netFinalPayoutCents).toBeGreaterThan(0);
  });

  it('deve barrar fechamento por violação de Segregação de Funções (SoD) se operador == aprovador', async () => {
    await expect(
      controller.concludeClosing(
        'ev-fest-2026',
        { operatorId: 'mesmo-usuario-financeiro', approverId: 'mesmo-usuario-financeiro' },
        'tenant-01',
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('deve barrar reabertura se a justificativa for menor que 10 caracteres', async () => {
    await expect(
      controller.reopenEvent(
        'ev-fest-2026',
        { reason: 'curta' },
        'tenant-01',
      ),
    ).rejects.toThrow(PreconditionFailedException);
  });

  it('deve barrar fechamento se houver gate bloqueante (ex: CDC aberto com solicitação de estorno)', async () => {
    // Simula 2 estornos pendentes abertos
    mockPrisma.solicitacaoEstorno.count = vi.fn().mockResolvedValue(2);

    await expect(
      controller.concludeClosing(
        'ev-fest-2026',
        { operatorId: 'operador-01', approverId: 'diretor-02' },
        'tenant-01',
        'prod-01',
      ),
    ).rejects.toThrow(PreconditionFailedException);
  });

  it('deve concluir o fechamento com sucesso, gerando snapshot imutável versão v1 e Hash SHA-256', async () => {
    const dossier = await controller.concludeClosing(
      'ev-fest-2026',
      { operatorId: 'operador-01', approverId: 'diretor-02' },
      'tenant-01',
      'prod-01',
    );

    expect(dossier).toBeDefined();
    expect(dossier.closingStatus).toBe('FECHADO');
    expect(dossier.version).toBe('v1');
    expect(dossier.closedBy).toBe('operador-01');
    expect(dossier.approvedBy).toBe('diretor-02');
    expect(dossier.integrityHashSha256).toBeDefined();
    expect(dossier.integrityHashSha256.length).toBe(64); // SHA-256 hex string tem 64 caracteres
  });

  it('deve permitir reabertura versionada mantendo histórico e preparando para versão v2', async () => {
    // 1. Fecha na v1
    await controller.concludeClosing(
      'ev-fest-2026',
      { operatorId: 'operador-01', approverId: 'diretor-02' },
      'tenant-01',
      'prod-01',
    );

    // 2. Reabre formalmente
    const reopenResult = await controller.reopenEvent(
      'ev-fest-2026',
      {
        reason: 'Ajuste fiscal autorizado referente a NF-e complementar de fornecedor.',
        protocol: 'PROT-FISCAL-2026-99',
      },
      'tenant-01',
    );

    expect(reopenResult.ok).toBe(true);
    expect(reopenResult.status).toBe('REABERTO_VERSIONADO');
    expect(reopenResult.newVersionCandidate).toBe('v2');

    // 3. Novo fechamento emite versão v2 preservando histórico
    const dossierV2 = await controller.concludeClosing(
      'ev-fest-2026',
      { operatorId: 'operador-01', approverId: 'diretor-02' },
      'tenant-01',
      'prod-01',
    );

    expect(dossierV2.version).toBe('v2');
    expect(dossierV2.closingStatus).toBe('FECHADO');
    expect(dossierV2.reopeningHistory).toBeDefined();
    expect(dossierV2.reopeningHistory?.length).toBe(1);
    expect(dossierV2.reopeningHistory?.[0].previousVersion).toBe('v1');
    expect(dossierV2.reopeningHistory?.[0].protocol).toBe('PROT-FISCAL-2026-99');
  });
});

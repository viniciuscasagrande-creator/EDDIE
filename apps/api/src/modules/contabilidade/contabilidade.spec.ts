import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ContabilidadeService } from './contabilidade.service';
import { ContabilidadePublicService } from './contabilidade.public-service';
import { ContabilidadeEvents } from '@ticketing/contracts';
import { PrismaService } from '../../shared/prisma.module';
import { OutboxService } from '../../shared/outbox/outbox.service';

describe('ContabilidadeService & PublicService (Partidas Dobradas, Fechamento, DRE)', () => {
  let service: ContabilidadeService;
  let publicService: ContabilidadePublicService;
  let mockPrisma: any;
  let mockOutbox: any;

  const TENANT_ID = '00000000-0000-0000-0000-000000000001';
  const COMPETENCIA = '2026-09';
  const USER_ID = 'uuuuuuuu-uuuu-uuuu-uuuu-uuuuuuuuuuuu';

  beforeEach(() => {
    mockOutbox = {
      emit: vi.fn().mockResolvedValue('outbox-contab-01'),
      claim: vi.fn().mockResolvedValue(true),
    };

    mockPrisma = {
      $transaction: vi.fn().mockImplementation(async (callback: any) => {
        return callback(mockPrisma);
      }),
      contaContabil: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
      },
      lancamentoContabil: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
      partidaContabil: {
        findMany: vi.fn(),
      },
      fechamentoContabil: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
        update: vi.fn(),
      },
      conciliacaoContabil: {
        upsert: vi.fn(),
        findMany: vi.fn(),
      },
    };

    service = new ContabilidadeService(
      mockPrisma as unknown as PrismaService,
      mockOutbox as unknown as OutboxService,
    );

    publicService = new ContabilidadePublicService(
      mockPrisma as unknown as PrismaService,
      service,
    );
  });

  describe('criarLancamento()', () => {
    it('deve registrar lançamento quando partidas dobradas estiverem perfeitamente balanceadas (Débito === Crédito)', async () => {
      mockPrisma.fechamentoContabil.findUnique.mockResolvedValue(null); // Período aberto
      mockPrisma.contaContabil.findMany.mockResolvedValue([
        { id: 'c1', codigo: '1.1.2.01', nome: 'Adquirentes a Receber', analitica: true },
        { id: 'c2', codigo: '2.1.2.01', nome: 'Recursos a Repassar', analitica: true },
        { id: 'c3', codigo: '3.1.1.01', nome: 'Receita Própria de Serviços', analitica: true },
      ]);

      mockPrisma.lancamentoContabil.create.mockResolvedValue({
        id: 'lanc-01',
        numeroLancamento: 101,
        total: 100.0,
        competencia: COMPETENCIA,
        historico: 'Venda de Ingressos Pedido #123',
        origemTipo: 'pedido_pago',
        origemReferenciaId: 'ped-123',
        eventoId: null,
        produtorId: null,
        criadoPor: USER_ID,
        data: new Date(),
        createdAt: new Date(),
      });

      const resultado = await service.criarLancamento(TENANT_ID, {
        data: '2026-09-21T10:00:00.000Z',
        competencia: COMPETENCIA,
        historico: 'Venda de Ingressos Pedido #123',
        origemTipo: 'pedido_pago',
        origemReferenciaId: 'ped-123',
        criadoPor: USER_ID,
        partidas: [
          { contaCodigo: '1.1.2.01', tipo: 'D', valorCents: 10000 }, // R$ 100,00 Débito
          { contaCodigo: '2.1.2.01', tipo: 'C', valorCents: 9000 },  // R$ 90,00 Crédito (repasse)
          { contaCodigo: '3.1.1.01', tipo: 'C', valorCents: 1000 },  // R$ 10,00 Crédito (taxa)
        ],
      });

      expect(resultado.id).toBe('lanc-01');
      expect(mockOutbox.emit).toHaveBeenCalledWith(
        mockPrisma,
        expect.objectContaining({
          eventName: ContabilidadeEvents.LancamentoContabilCriado.name,
          source: 'contabilidade',
          payload: expect.objectContaining({
            totalCents: 10000,
            origemTipo: 'pedido_pago',
          }),
        }),
      );
    });

    it('deve rejeitar com BadRequestException se débitos e créditos forem desiguais', async () => {
      mockPrisma.fechamentoContabil.findUnique.mockResolvedValue(null);

      await expect(
        service.criarLancamento(TENANT_ID, {
          data: '2026-09-21T10:00:00.000Z',
          competencia: COMPETENCIA,
          historico: 'Lançamento desbalanceado',
          origemTipo: 'manual',
          origemReferenciaId: 'ref-01',
          criadoPor: USER_ID,
          partidas: [
            { contaCodigo: '1.1.2.01', tipo: 'D', valorCents: 10000 },
            { contaCodigo: '2.1.2.01', tipo: 'C', valorCents: 8500 }, // Faltam 1500 cents!
          ],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve recusar escrituração se a competência contábil estiver fechada', async () => {
      mockPrisma.fechamentoContabil.findUnique.mockResolvedValue({
        status: 'fechado',
      });

      await expect(
        service.criarLancamento(TENANT_ID, {
          data: '2026-09-21T10:00:00.000Z',
          competencia: COMPETENCIA,
          historico: 'Tentativa em período fechado',
          origemTipo: 'manual',
          origemReferenciaId: 'ref-02',
          criadoPor: USER_ID,
          partidas: [
            { contaCodigo: '1.1.1.01', tipo: 'D', valorCents: 5000 },
            { contaCodigo: '2.1.1.01', tipo: 'C', valorCents: 5000 },
          ],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('fecharPeriodo() & reabrirPeriodo()', () => {
    it('deve fechar competência, calcular resultado e emitir PeriodoContabilFechado', async () => {
      mockPrisma.lancamentoContabil.findMany.mockResolvedValue([
        {
          total: 500.0,
          partidas: [
            { tipo: 'D', valor: { toNumber: () => 500.0 }, conta: { tipo: 'ativo' } },
            { tipo: 'C', valor: { toNumber: () => 400.0 }, conta: { tipo: 'passivo' } },
            { tipo: 'C', valor: { toNumber: () => 100.0 }, conta: { tipo: 'receita' } },
          ],
        },
      ]);

      mockPrisma.fechamentoContabil.upsert.mockResolvedValue({
        id: 'fech-01',
        competencia: COMPETENCIA,
        fechadoEm: new Date(),
      });

      const fechamento = await service.fecharPeriodo(TENANT_ID, {
        competencia: COMPETENCIA,
        fechadoPor: USER_ID,
      });

      expect(fechamento.id).toBe('fech-01');
      expect(mockOutbox.emit).toHaveBeenCalledWith(
        mockPrisma,
        expect.objectContaining({
          eventName: ContabilidadeEvents.PeriodoContabilFechado.name,
          payload: expect.objectContaining({
            competencia: COMPETENCIA,
            totalDebitosCents: 50000,
            resultadoExercicioCents: 10000, // R$ 100,00 de receita
          }),
        }),
      );
    });

    it('deve reabrir período com justificativa e emitir PeriodoContabilReaberto', async () => {
      mockPrisma.fechamentoContabil.findUnique.mockResolvedValue({
        id: 'fech-01',
        status: 'fechado',
      });
      mockPrisma.fechamentoContabil.update.mockResolvedValue({
        id: 'fech-01',
        status: 'reaberto',
      });

      await service.reabrirPeriodo(TENANT_ID, {
        competencia: COMPETENCIA,
        motivo: 'Reabertura autorizada por auditoria externa para ajuste de taxa',
        reabertoPor: USER_ID,
      });

      expect(mockOutbox.emit).toHaveBeenCalledWith(
        mockPrisma,
        expect.objectContaining({
          eventName: ContabilidadeEvents.PeriodoContabilReaberto.name,
          payload: expect.objectContaining({
            competencia: COMPETENCIA,
            motivo: expect.stringContaining('auditoria externa'),
          }),
        }),
      );
    });
  });

  describe('conciliarConta()', () => {
    it('deve marcar como conciliado quando saldo contábil for idêntico ao extrato', async () => {
      mockPrisma.contaContabil.findUnique.mockResolvedValue({
        id: 'c-banco',
        codigo: '1.1.1.01',
        natureza: 'devedora',
      });
      mockPrisma.partidaContabil.findMany.mockResolvedValue([
        { tipo: 'D', valor: { toNumber: () => 1000.0 } },
        { tipo: 'C', valor: { toNumber: () => 200.0 } },
      ]); // Saldo contábil = 800.0 = 80000 cents

      mockPrisma.conciliacaoContabil.upsert.mockResolvedValue({
        id: 'conc-01',
        status: 'conciliado',
        conciliadoEm: new Date(),
      });

      const conc = await service.conciliarConta(TENANT_ID, {
        contaCodigo: '1.1.1.01',
        competencia: COMPETENCIA,
        saldoExtratoCents: 80000, // Igual
        conciliadoPor: USER_ID,
      });

      expect(conc.status).toBe('conciliado');
      expect(mockOutbox.emit).toHaveBeenCalledWith(
        mockPrisma,
        expect.objectContaining({
          eventName: ContabilidadeEvents.ConciliacaoContabilFinalizada.name,
          payload: expect.objectContaining({
            status: 'conciliado',
            diferencaCents: 0,
          }),
        }),
      );
    });
  });

  describe('ContabilidadePublicService', () => {
    it('consultarSaldoConta() deve calcular o saldo atual em centavos', async () => {
      mockPrisma.contaContabil.findUnique.mockResolvedValue({
        id: 'c-taxas',
        codigo: '3.1.1.01',
        nome: 'Receita de Serviços',
        tipo: 'receita',
        natureza: 'credora',
      });
      mockPrisma.partidaContabil.findMany.mockResolvedValue([
        { tipo: 'C', valor: { toNumber: () => 350.0 } }, // +350
        { tipo: 'D', valor: { toNumber: () => 50.0 } },  // -50 estorno -> 300
      ]);

      const saldo = await publicService.consultarSaldoConta(TENANT_ID, '3.1.1.01', COMPETENCIA);

      expect(saldo).not.toBeNull();
      expect(saldo?.saldoCents).toBe(30000); // R$ 300,00
    });
  });
});

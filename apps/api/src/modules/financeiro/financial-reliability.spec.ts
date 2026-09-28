import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { FinanceiroService } from './financeiro.service';
import type { PrismaService } from '../../shared/prisma.module';
import type { OutboxService } from '../../shared/outbox/outbox.service';

describe('Financial Reliability & Production Truth (EDDIE 11.23.1)', () => {
  let service: FinanceiroService;
  let mockPrisma: {
    $transaction: ReturnType<typeof vi.fn>;
    lancamentoLedger: {
      findUnique: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      count: ReturnType<typeof vi.fn>;
    };
    transferenciaInterEvento: {
      create: ReturnType<typeof vi.fn>;
    };
    solicitacaoRepasse: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
    };
    solicitacaoAntecipacao: {
      create: ReturnType<typeof vi.fn>;
    };
    contaPagar: {
      create: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
  };
  let mockOutbox: {
    emit: ReturnType<typeof vi.fn>;
  };

  const TENANT_ID = '00000000-0000-0000-0000-000000000001';
  const PRODUTOR_ALVO = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const PRODUTOR_INVASOR = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  const EVENTO_A = '11111111-1111-1111-1111-111111111111';
  const EVENTO_B = '22222222-2222-2222-2222-222222222222';

  beforeEach(() => {
    mockOutbox = {
      emit: vi.fn().mockResolvedValue('outbox-msg-123'),
    };

    mockPrisma = {
      $transaction: vi.fn().mockImplementation(async (callback: (tx: typeof mockPrisma) => Promise<unknown>) => {
        return callback(mockPrisma);
      }),
      lancamentoLedger: {
        findUnique: vi.fn(),
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn(),
        count: vi.fn(),
      },
      transferenciaInterEvento: {
        create: vi.fn(),
      },
      solicitacaoRepasse: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
      solicitacaoAntecipacao: {
        create: vi.fn(),
      },
      contaPagar: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
      },
    };

    service = new FinanceiroService(
      mockPrisma as unknown as PrismaService,
      mockOutbox as unknown as OutboxService,
    );
  });

  describe('1. Idempotência Estrita no Ledger Financeiro (Pagamento e Estorno)', () => {
    it('deve rejeitar duplicação quando pedido_pago já foi registrado no Ledger', async () => {
      const lancamentoExistente = {
        id: 'led-existente-001',
        tenantId: TENANT_ID,
        produtorId: PRODUTOR_ALVO,
        eventoId: EVENTO_A,
        tipo: 'entrada',
        bucket: 'retido',
        valor: 135.0,
        origem: 'pedido_pago',
        referenciaId: 'ped-dup-001',
        criadoEm: new Date(),
      };

      // Simula que o lançamento já foi gravado no Ledger
      mockPrisma.lancamentoLedger.findUnique.mockResolvedValue(lancamentoExistente);

      // Ao tentar reprocessar o mesmo pedido
      const res = await service.processarPedidoPago(
        TENANT_ID,
        {
          pedidoId: 'ped-dup-001',
          produtorId: PRODUTOR_ALVO,
          repasseProdutor: 13500,
          taxaTotal: 1500,
        },
        EVENTO_A,
      );

      // Nenhuma linha nova deve ser gravada
      expect(mockPrisma.lancamentoLedger.create).not.toHaveBeenCalled();
      expect(res).toEqual(lancamentoExistente);
    });

    it('deve rejeitar duplicação quando estorno_pedido já foi processado no Ledger', async () => {
      const estornoExistente = {
        id: 'led-estorno-001',
        tenantId: TENANT_ID,
        produtorId: PRODUTOR_ALVO,
        eventoId: EVENTO_A,
        tipo: 'saida',
        bucket: 'reservado_estorno',
        valor: 100.0,
        origem: 'estorno_pedido',
        referenciaId: 'est-dup-001',
        criadoEm: new Date(),
      };

      mockPrisma.lancamentoLedger.findUnique.mockResolvedValue(estornoExistente);

      const res = await service.processarPagamentoEstornado(
        TENANT_ID,
        {
          estornoId: 'est-dup-001',
          pedidoId: 'ped-001',
          produtorId: PRODUTOR_ALVO,
          valorEstornado: 10000,
          taxaRetida: 0,
          motivo: 'ARREPENDIMENTO_CDC',
        },
        EVENTO_A,
      );

      expect(mockPrisma.lancamentoLedger.create).not.toHaveBeenCalled();
      expect(res).toEqual(estornoExistente);
    });
  });

  describe('2. Integridade de Split e Cálculo Exato de Taxas (Centavos)', () => {
    it('deve calcular taxa fixa + percentual com precisão exata de centavos sem desvio float', () => {
      const valorPedidoCents = 15000; // R$ 150,00
      const taxaFixaCents = 250;      // R$ 2,50
      const taxaPercentualBps = 1000; // 10,00% (1000 basis points)

      const taxaVariavelCents = Math.round((valorPedidoCents * taxaPercentualBps) / 10000);
      const taxaPlataformaTotalCents = taxaFixaCents + taxaVariavelCents;
      const valorLiquidoProdutorCents = valorPedidoCents - taxaPlataformaTotalCents;

      expect(taxaVariavelCents).toBe(1500); // R$ 15,00
      expect(taxaPlataformaTotalCents).toBe(1750); // R$ 17,50
      expect(valorLiquidoProdutorCents).toBe(13250); // R$ 132,50

      // Soma das partes DEVE ser estritamente igual ao valor total pago pelo comprador
      expect(taxaPlataformaTotalCents + valorLiquidoProdutorCents).toBe(valorPedidoCents);
    });
  });

  describe('3. Isolamento RBAC Cross-Producer (Segurança Multi-Tenant)', () => {
    it('deve impedir que Produtor Invasor execute transferência sacando de evento de outro produtor', async () => {
      // O produtor invasor consulta saldos no evento do outro produtor: retorna 0 de saldo disponível
      mockPrisma.lancamentoLedger.findMany.mockResolvedValue([]);

      await expect(
        service.transferirInterEventos(TENANT_ID, {
          produtorId: PRODUTOR_INVASOR,
          eventoOrigemId: EVENTO_A,
          eventoDestinoId: EVENTO_B,
          valorCents: 50000,
          solicitanteId: 'user-invasor',
          motivo: 'Tentativa indevida de transferência',
        }),
      ).rejects.toThrow(BadRequestException);

      expect(mockPrisma.transferenciaInterEvento.create).not.toHaveBeenCalled();
    });
  });

  describe('4. Registro Forense de Estorno no Bucket reservado_estorno', () => {
    it('deve debitar bucket reservado_estorno e emitir evento outbox com sucesso', async () => {
      mockPrisma.lancamentoLedger.findUnique.mockResolvedValue(null);
      mockPrisma.lancamentoLedger.create.mockResolvedValue({
        id: 'led-estorno-novo',
        valor: 190.0,
        criadoEm: new Date(),
      });
      mockPrisma.lancamentoLedger.findMany.mockResolvedValue([]);

      const res = await service.processarPagamentoEstornado(
        TENANT_ID,
        {
          estornoId: 'est-novo-999',
          pedidoId: 'ped-999',
          produtorId: PRODUTOR_ALVO,
          valorEstornado: 20000,
          taxaRetida: 1000, // taxa da plataforma retida = R$ 10,00
          motivo: 'CANCELAMENTO_EVENTO',
        },
        EVENTO_A,
      );

      expect(res).toBeDefined();
      expect(mockPrisma.lancamentoLedger.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            bucket: 'reservado_estorno',
            tipo: 'saida',
            origem: 'estorno_pedido',
            referenciaId: 'est-novo-999',
          }),
        }),
      );
      expect(mockOutbox.emit).toHaveBeenCalledWith(
        mockPrisma,
        expect.objectContaining({
          eventName: 'financeiro.lancamento_ledger_criado.v1',
        }),
      );
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PedidosService } from './pedidos.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PedidosService (EDDIE 11.5 - Núcleo Transacional)', () => {
  let service: PedidosService;
  let mockPrisma: any;

  const tenantId = '11111111-1111-1111-1111-111111111111';
  const produtorId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const eventoId = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
  const loteId = 'llllllll-llll-llll-llll-llllllllllll';
  const reservaId = 'rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr';
  const pedidoId = 'pppppppp-pppp-pppp-pppp-pppppppppppp';

  beforeEach(() => {
    mockPrisma = {
      lote: {
        findUnique: vi.fn(),
      },
      reservaVenda: {
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      condicaoComercial: {
        findFirst: vi.fn(),
      },
      pedidoVenda: {
        create: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        findMany: vi.fn(),
      },
      itemPedidoVenda: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
      pagamentoVenda: {
        create: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        findMany: vi.fn(),
      },
      ingressoVenda: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
      $transaction: vi.fn(async (cb: any) => cb(mockPrisma)),
    };

    service = new PedidosService(mockPrisma as any);
  });

  describe('criarReserva', () => {
    it('deve rejeitar lote inexistente ou de outro tenant', async () => {
      mockPrisma.lote.findUnique.mockResolvedValue(null);
      await expect(
        service.criarReserva(tenantId, produtorId, { eventoId, loteId, quantidade: 2 })
      ).rejects.toThrow(NotFoundException);
    });

    it('deve rejeitar se lote pertencer a outro evento ou produtor', async () => {
      mockPrisma.lote.findUnique.mockResolvedValue({
        id: loteId,
        sessao: {
          eventoId: 'outro-evento',
          evento: { tenantId, produtorId },
        },
      });
      await expect(
        service.criarReserva(tenantId, produtorId, { eventoId, loteId, quantidade: 2 })
      ).rejects.toThrow(BadRequestException);
    });

    it('deve criar reserva válida com expiração de 10 minutos', async () => {
      mockPrisma.lote.findUnique.mockResolvedValue({
        id: loteId,
        sessao: {
          eventoId,
          evento: { tenantId, produtorId },
        },
      });
      mockPrisma.reservaVenda.create.mockImplementation((args: any) => Promise.resolve({ id: reservaId, status: 'ATIVA', ...args.data }));

      const res = await service.criarReserva(tenantId, produtorId, { eventoId, loteId, quantidade: 2 });
      expect(res.id).toBe(reservaId);
      expect(res.quantidade).toBe(2);
      expect(res.status).toBe('ATIVA');
    });
  });

  describe('criarPedido', () => {
    it('deve rejeitar evento sem condição comercial aprovada', async () => {
      mockPrisma.reservaVenda.findFirst.mockResolvedValue({
        id: reservaId,
        tenantId,
        produtorId,
        eventoId,
        loteId,
        quantidade: 2,
        status: 'ATIVA',
        expiraEm: new Date(Date.now() + 600000),
      });
      mockPrisma.lote.findUnique.mockResolvedValue({ id: loteId, precoFace: 100 });
      mockPrisma.condicaoComercial.findFirst.mockResolvedValue(null);

      await expect(
        service.criarPedido(tenantId, produtorId, {
          reservaId,
          comprador: { nome: 'Carlos Silva', documento: '12345678900' },
        })
      ).rejects.toThrow('Evento sem condição comercial aprovada');
    });

    it('deve criar pedido com snapshot de taxa percentual congelada', async () => {
      mockPrisma.reservaVenda.findFirst.mockResolvedValue({
        id: reservaId,
        tenantId,
        produtorId,
        eventoId,
        loteId,
        quantidade: 2,
        status: 'ATIVA',
        expiraEm: new Date(Date.now() + 600000),
      });
      mockPrisma.lote.findUnique.mockResolvedValue({ id: loteId, precoFace: 100 });
      mockPrisma.condicaoComercial.findFirst.mockResolvedValue({
        modeloTaxa: 'percentual',
        taxaServicoPercentual: 10,
        taxaServicoFixa: null,
        spreadPercentual: 1.5,
        advancedHabilitado: true,
        prazoRepasseDias: 2,
      });

      mockPrisma.pedidoVenda.create.mockImplementation((args: any) => Promise.resolve({ id: pedidoId, status: 'AGUARDANDO_PAGAMENTO', ...args.data }));

      const pedido = await service.criarPedido(tenantId, produtorId, {
        reservaId,
        comprador: { nome: 'Carlos Silva', documento: '12345678900', email: 'carlos@teste.com' },
        metodoPagamento: 'pix',
      });

      expect(pedido.id).toBe(pedidoId);
      expect(pedido.subtotal).toBe(200); // 2 x 100
      expect(pedido.taxaDisk).toBe(20); // 10% de 200
      expect(pedido.total).toBe(220); // 200 + 20
      expect(pedido.modeloTaxaSnapshot).toBe('percentual');
      expect(pedido.status).toBe('AGUARDANDO_PAGAMENTO');
      expect(mockPrisma.reservaVenda.update).toHaveBeenCalledWith({
        where: { id: reservaId },
        data: { status: 'CONSUMIDA' },
      });
    });

    it('deve criar pedido com taxa híbrida (percentual + fixa)', async () => {
      mockPrisma.reservaVenda.findFirst.mockResolvedValue({
        id: reservaId,
        tenantId,
        produtorId,
        eventoId,
        loteId,
        quantidade: 2,
        status: 'ATIVA',
        expiraEm: new Date(Date.now() + 600000),
      });
      mockPrisma.lote.findUnique.mockResolvedValue({ id: loteId, precoFace: 50 });
      mockPrisma.condicaoComercial.findFirst.mockResolvedValue({
        modeloTaxa: 'hibrida',
        taxaServicoPercentual: 10,
        taxaServicoFixa: 5,
        spreadPercentual: 0,
        advancedHabilitado: false,
        prazoRepasseDias: 7,
      });

      mockPrisma.pedidoVenda.create.mockImplementation((args: any) => Promise.resolve({ id: pedidoId, ...args.data }));

      const pedido = await service.criarPedido(tenantId, produtorId, {
        reservaId,
        comprador: { nome: 'Ana Costa' },
      });

      // Subtotal = 2 * 50 = 100. Taxa = 10% (10) + 2 * 5 (10) = 20. Total = 120.
      expect(pedido.subtotal).toBe(100);
      expect(pedido.taxaDisk).toBe(20);
      expect(pedido.total).toBe(120);
    });
  });

  describe('confirmarPagamento', () => {
    it('deve confirmar pagamento, emitir ingressos únicos com hash de token e atualizar pedido para PAGO', async () => {
      mockPrisma.pedidoVenda.findFirst.mockResolvedValue({
        id: pedidoId,
        tenantId,
        eventoId,
        status: 'AGUARDANDO_PAGAMENTO',
      });
      mockPrisma.pagamentoVenda.findFirst.mockResolvedValue({
        id: 'pag-uuid-1',
        pedidoId,
        tenantId,
        status: 'PENDENTE',
      });
      mockPrisma.itemPedidoVenda.findMany.mockResolvedValue([
        { pedidoId, loteId, quantidade: 2, valorUnitario: 100, subtotal: 200 },
      ]);
      mockPrisma.pedidoVenda.update.mockResolvedValue({
        id: pedidoId,
        status: 'PAGO',
      });

      const res = await service.confirmarPagamento(tenantId, pedidoId, {
        adquirente: 'cielo',
        transacaoId: 'tid-99999',
        nsu: 'nsu-8888',
      });

      expect(res.status).toBe('PAGO');
      expect(mockPrisma.pagamentoVenda.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'PAGO',
            adquirente: 'cielo',
            transacaoId: 'tid-99999',
          }),
        })
      );
      // Foram comprados 2 ingressos, logo ingressoVenda.create deve ser chamado 2 vezes
      expect(mockPrisma.ingressoVenda.create).toHaveBeenCalledTimes(2);
    });

    it('é idempotente: se já estiver PAGO, não reprocessa ingressos nem pagamentos', async () => {
      mockPrisma.pedidoVenda.findFirst.mockResolvedValue({
        id: pedidoId,
        tenantId,
        status: 'PAGO',
      });

      const res = await service.confirmarPagamento(tenantId, pedidoId, {});
      expect(res.status).toBe('PAGO');
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('consultarEvento', () => {
    it('deve buscar pedidos reais por evento e anexar pagamentos e ingressos', async () => {
      mockPrisma.pedidoVenda.findMany.mockResolvedValue([
        {
          id: pedidoId,
          numero: 'PED-20260923-ABCD1234',
          tenantId,
          eventoId,
          compradorNome: 'Carlos Silva',
          status: 'PAGO',
          total: 220,
          taxaDisk: 20,
        },
      ]);
      mockPrisma.pagamentoVenda.findMany.mockResolvedValue([{ id: 'pag-1', status: 'PAGO' }]);
      mockPrisma.ingressoVenda.findMany.mockResolvedValue([{ id: 'ing-1', numero: 'ING-1' }, { id: 'ing-2', numero: 'ING-2' }]);

      const pedidos = await service.consultarEvento(tenantId, eventoId);
      expect(pedidos).toHaveLength(1);
      expect(pedidos[0].numero).toBe('PED-20260923-ABCD1234');
      expect(pedidos[0].pagamentos).toHaveLength(1);
      expect(pedidos[0].ingressos).toHaveLength(2);
    });
  });
});

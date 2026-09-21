import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FinanceiroService } from './financeiro.service';
import { FinanceiroEvents } from '@ticketing/contracts';
import { PrismaService } from '../../shared/prisma.module';
import { OutboxService } from '../../shared/outbox/outbox.service';

describe('FinanceiroService (Ledger, Conta Gráfica e Tesouraria)', () => {
  let service: FinanceiroService;
  let mockPrisma: any;
  let mockOutbox: any;

  const TENANT_ID = '00000000-0000-0000-0000-000000000001';
  const PRODUTOR_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const EVENTO_A = '11111111-1111-1111-1111-111111111111';
  const EVENTO_B = '22222222-2222-2222-2222-222222222222';
  const USER_ID = 'user-supervisor-01';

  beforeEach(() => {
    mockOutbox = {
      emit: jest.fn().mockResolvedValue('outbox-message-id'),
    };

    mockPrisma = {
      $transaction: jest.fn().mockImplementation(async (callback: any) => {
        return callback(mockPrisma);
      }),
      lancamentoLedger: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        count: jest.fn(),
      },
      transferenciaInterEvento: {
        create: jest.fn(),
      },
      solicitacaoRepasse: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
      solicitacaoAntecipacao: {
        create: jest.fn(),
      },
      contaPagar: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
    };

    service = new FinanceiroService(
      mockPrisma as unknown as PrismaService,
      mockOutbox as unknown as OutboxService,
    );
  });

  describe('obterSaldosContaGrafica()', () => {
    it('deve derivar os saldos agregados corretamente a partir do Ledger (SUM entradas - SUM saídas)', async () => {
      // Mock de lançamentos simulados no ledger
      mockPrisma.lancamentoLedger.findMany.mockResolvedValue([
        { bucket: 'disponivel', tipo: 'entrada', valor: { toNumber: () => 1000.0 } }, // +1000
        { bucket: 'disponivel', tipo: 'saida', valor: { toNumber: () => 200.0 } },    // -200 -> disp: 800
        { bucket: 'bloqueado', tipo: 'entrada', valor: { toNumber: () => 150.0 } },   // +150
        { bucket: 'reservado_estorno', tipo: 'saida', valor: { toNumber: () => 50.0 } }, // -50 -> res: -50
        { bucket: 'retido', tipo: 'entrada', valor: { toNumber: () => 5000.0 } },     // +5000
      ]);

      const saldos = await service.obterSaldosContaGrafica(TENANT_ID, PRODUTOR_ID);

      expect(saldos.produtorId).toBe(PRODUTOR_ID);
      expect(saldos.disponivelCents).toBe(80000);       // R$ 800,00
      expect(saldos.bloqueadoCents).toBe(15000);        // R$ 150,00
      expect(saldos.reservadoEstornoCents).toBe(-5000); // -R$ 50,00
      expect(saldos.retidoCents).toBe(500000);          // R$ 5.000,00
      expect(saldos.totalPatrimonioCents).toBe(590000); // R$ 5.900,00
    });
  });

  describe('transferirInterEventos()', () => {
    it('deve recusar transferência se evento de origem for igual ao de destino', async () => {
      await expect(
        service.transferirInterEventos(TENANT_ID, {
          produtorId: PRODUTOR_ID,
          eventoOrigemId: EVENTO_A,
          eventoDestinoId: EVENTO_A,
          valorCents: 50000,
          justificativa: 'Transferência inválida mesmo evento',
          autorId: USER_ID,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve recusar transferência se o saldo disponível no evento de origem for insuficiente', async () => {
      // Mock saldo insuficiente (origem possui apenas R$ 200,00)
      mockPrisma.lancamentoLedger.findMany.mockResolvedValue([
        { bucket: 'disponivel', tipo: 'entrada', valor: { toNumber: () => 200.0 } },
      ]);

      await expect(
        service.transferirInterEventos(TENANT_ID, {
          produtorId: PRODUTOR_ID,
          eventoOrigemId: EVENTO_A,
          eventoDestinoId: EVENTO_B,
          valorCents: 50000, // R$ 500,00 solicitado
          justificativa: 'Cobrir despesas de som do evento B',
          autorId: USER_ID,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve realizar transferência com partidas dobradas e emitir evento no outbox', async () => {
      // Origem possui R$ 2.000,00
      mockPrisma.lancamentoLedger.findMany.mockResolvedValue([
        { bucket: 'disponivel', tipo: 'entrada', valor: { toNumber: () => 2000.0 } },
      ]);

      mockPrisma.transferenciaInterEvento.create.mockResolvedValue({
        id: 'transf-uuid-1',
        executadaEm: new Date('2026-09-21T12:00:00Z'),
      });

      await service.transferirInterEventos(TENANT_ID, {
        produtorId: PRODUTOR_ID,
        eventoOrigemId: EVENTO_A,
        eventoDestinoId: EVENTO_B,
        valorCents: 50000, // R$ 500,00
        justificativa: 'Cobertura de custos operacionais',
        autorId: USER_ID,
      });

      // Partida dobrada: 2 lançamentos no ledger (débito na origem + crédito no destino)
      expect(mockPrisma.lancamentoLedger.create).toHaveBeenCalledTimes(2);

      // Emissão no outbox
      expect(mockOutbox.emit).toHaveBeenCalledWith(
        mockPrisma,
        expect.objectContaining({
          eventName: FinanceiroEvents.TransferenciaInterEventoRealizada.name,
          payload: expect.objectContaining({
            produtorId: PRODUTOR_ID,
            eventoOrigemId: EVENTO_A,
            eventoDestinoId: EVENTO_B,
            valor: 50000,
          }),
        }),
      );
    });
  });

  describe('solicitarRepasse()', () => {
    it('deve mover saldo de disponivel para bloqueado e emitir repasse.solicitado.v1', async () => {
      // Mock saldo de R$ 10.000,00
      mockPrisma.lancamentoLedger.findMany.mockResolvedValue([
        { bucket: 'disponivel', tipo: 'entrada', valor: { toNumber: () => 10000.0 } },
      ]);

      mockPrisma.solicitacaoRepasse.create.mockResolvedValue({
        id: 'repasse-uuid-1',
        status: 'solicitado',
      });

      await service.solicitarRepasse(
        TENANT_ID,
        {
          produtorId: PRODUTOR_ID,
          eventoId: EVENTO_A,
          valorCents: 300000, // R$ 3.000,00
          chavePix: 'financeiro@produtora.com.br',
          dataProgramada: '2026-09-25T10:00:00Z',
        },
        USER_ID,
      );

      // 2 lançamentos no ledger: saida do disponivel, entrada no bloqueado
      expect(mockPrisma.lancamentoLedger.create).toHaveBeenCalledTimes(2);
      expect(mockOutbox.emit).toHaveBeenCalledWith(
        mockPrisma,
        expect.objectContaining({
          eventName: FinanceiroEvents.RepasseSolicitado.name,
          payload: expect.objectContaining({
            valor: 300000,
            chavePix: 'financeiro@produtora.com.br',
          }),
        }),
      );
    });
  });

  describe('simularAntecipacao()', () => {
    it('deve calcular taxa pró-rata dia e valor líquido com precisão de centavos', () => {
      // R$ 100.000,00 brutos a 2.5% ao mês, antecipando 15 dias
      // Taxa diária = 2.5 / 30 / 100 = 0.0008333333333333334
      // Custo = 10.000.000 * 0.0008333333333333334 * 15 = 125.000 cents (R$ 1.250,00)
      const simulacao = service.simularAntecipacao({
        produtorId: PRODUTOR_ID,
        eventoId: EVENTO_A,
        valorBrutoCents: 10000000,
        taxaDesagioPercentual: 2.5,
        diasAntecipados: 15,
      });

      expect(simulacao.valorBrutoCents).toBe(10000000);
      expect(simulacao.custoDesagioCents).toBe(125000);
      expect(simulacao.valorLiquidoDisponibilizadoCents).toBe(9875000);
    });
  });

  describe('pagarConta()', () => {
    it('deve recusar liquidação se o saldo disponível no evento for insuficiente', async () => {
      mockPrisma.contaPagar.findUnique.mockResolvedValue({
        id: 'conta-uuid-1',
        produtorId: PRODUTOR_ID,
        eventoId: EVENTO_A,
        valor: { toNumber: () => 1500.0 }, // R$ 1.500,00
        status: 'pendente',
      });

      // Saldo do evento é apenas R$ 500,00
      mockPrisma.lancamentoLedger.findMany.mockResolvedValue([
        { bucket: 'disponivel', tipo: 'entrada', valor: { toNumber: () => 500.0 } },
      ]);

      await expect(
        service.pagarConta(TENANT_ID, 'conta-uuid-1', USER_ID),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve debitar saldo disponível e liquidar conta a pagar com sucesso', async () => {
      mockPrisma.contaPagar.findUnique.mockResolvedValue({
        id: 'conta-uuid-1',
        produtorId: PRODUTOR_ID,
        eventoId: EVENTO_A,
        valor: { toNumber: () => 1500.0 },
        fornecedorNome: 'Geradores Silva',
        descricao: 'Aluguel de geradores 250kVA',
        status: 'pendente',
      });

      // Saldo do evento é R$ 5.000,00
      mockPrisma.lancamentoLedger.findMany.mockResolvedValue([
        { bucket: 'disponivel', tipo: 'entrada', valor: { toNumber: () => 5000.0 } },
      ]);

      mockPrisma.contaPagar.update.mockResolvedValue({
        id: 'conta-uuid-1',
        status: 'paga',
        pagoEm: new Date(),
      });

      const res = await service.pagarConta(TENANT_ID, 'conta-uuid-1', USER_ID);

      expect(res.status).toBe('paga');
      expect(mockPrisma.lancamentoLedger.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          bucket: 'disponivel',
          tipo: 'saida',
          origem: 'pagamento_fornecedor',
        }),
      });
    });
  });

  describe('processarPedidoPago() e processarPagamentoEstornado()', () => {
    it('deve creditar o bucket retido na recepção de pedido.pago.v1 e emitir evento outbox', async () => {
      mockPrisma.lancamentoLedger.findUnique.mockResolvedValue(null);
      mockPrisma.lancamentoLedger.create.mockResolvedValue({
        id: 'lanc-1',
        historico: 'Crédito em custódia',
        criadoEm: new Date(),
      });

      mockPrisma.lancamentoLedger.findMany.mockResolvedValue([
        { bucket: 'retido', tipo: 'entrada', valor: { toNumber: () => 190.0 } },
      ]);

      await service.processarPedidoPago(
        TENANT_ID,
        {
          pedidoId: 'pedido-111',
          pagamentoId: 'pag-111',
          clienteId: 'cli-111',
          produtorId: PRODUTOR_ID,
          total: 20000,
          repasseProdutor: 19000, // R$ 190,00
          receitaPlataforma: 1000,
          metodo: 'pix',
          bandeira: null,
          parcelas: 1,
          adquirente: 'cielo',
          nsu: '123456',
          pagoEm: new Date().toISOString(),
          liquidacaoPrevistaEm: new Date().toISOString(),
          itens: [
            {
              itemId: 'item-1',
              loteId: 'lote-1',
              sessaoId: 'sessao-1',
              setorId: 'setor-1',
              assento: null,
              tipo: 'inteira',
              precoFace: 19000,
              taxaConveniencia: 1000,
              desconto: 0,
            },
          ],
        },
        EVENTO_A,
      );

      expect(mockPrisma.lancamentoLedger.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          bucket: 'retido',
          tipo: 'entrada',
          origem: 'pedido_pago',
          referenciaId: 'pedido-111',
        }),
      });

      expect(mockOutbox.emit).toHaveBeenCalledWith(
        mockPrisma,
        expect.objectContaining({
          eventName: FinanceiroEvents.LancamentoLedgerCriado.name,
        }),
      );
    });

    it('deve debitar bucket reservado_estorno na recepção de pagamento.estornado.v1', async () => {
      mockPrisma.lancamentoLedger.findUnique.mockResolvedValue(null);
      mockPrisma.lancamentoLedger.create.mockResolvedValue({
        id: 'lanc-estorno-1',
        historico: 'Débito por estorno',
        criadoEm: new Date(),
      });

      mockPrisma.lancamentoLedger.findMany.mockResolvedValue([
        { bucket: 'reservado_estorno', tipo: 'saida', valor: { toNumber: () => 190.0 } },
      ]);

      await service.processarPagamentoEstornado(TENANT_ID, {
        estornoId: 'estorno-uuid-1',
        pedidoId: 'pedido-111',
        pagamentoId: 'pag-111',
        clienteId: 'cli-111',
        produtorId: PRODUTOR_ID,
        itensIds: ['item-1'],
        valorEstornado: 20000,
        taxaRetida: 1000,
        motivo: 'arrependimento_cdc',
        devolverInventario: true,
        estornadoEm: new Date().toISOString(),
      });

      expect(mockPrisma.lancamentoLedger.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          bucket: 'reservado_estorno',
          tipo: 'saida',
          origem: 'estorno_pedido',
          referenciaId: 'estorno-uuid-1',
        }),
      });
    });
  });
});

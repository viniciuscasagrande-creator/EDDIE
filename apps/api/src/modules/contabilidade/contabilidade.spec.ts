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
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
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
      regraContabil: {
        create: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      ajusteContabil: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
      fechamentoContabilEvento: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
      },
      centroResultado: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
      contaBancaria: {
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

  describe('EDDIE 11.37 — Motor Contábil, Ajustes, Fechamento de Eventos e Conciliação Cruzada', () => {
    describe('Motor Contábil & Simulador Dry-Run', () => {
      it('deve registrar e versionar regra contábil emitindo evento RegraContabilPublicadaV1', async () => {
        mockPrisma.regraContabil.findFirst.mockResolvedValue(null);
        mockPrisma.regraContabil.create.mockResolvedValue({
          id: 'reg-01',
          codigo: 'REG-VENDA-01',
          fatoTipo: 'VENDA_INGRESSO',
          versao: 1,
          descricao: 'Regra de Venda com Segregação Estrita',
          status: 'VIGENTE',
          contaDebitoCodigo: '1.1.2.01',
          contaCreditoCodigo: '2.1.2.01',
          contaTaxaCreditoCodigo: '3.1.1.01',
          politicaReconhecimento: 'IMEDIATO',
          vigenciaInicio: new Date('2026-01-01'),
          vigenciaFim: null,
          criadoPor: USER_ID,
          createdAt: new Date(),
        });

        const resultado = await service.criarRegraContabil(TENANT_ID, {
          codigo: 'REG-VENDA-01',
          fatoTipo: 'VENDA_INGRESSO',
          descricao: 'Regra de Venda com Segregação Estrita',
          contaDebitoCodigo: '1.1.2.01',
          contaCreditoCodigo: '2.1.2.01',
          contaTaxaCreditoCodigo: '3.1.1.01',
          politicaReconhecimento: 'IMEDIATO',
          status: 'VIGENTE',
          criadoPor: USER_ID,
        });

        expect(resultado.codigo).toBe('REG-VENDA-01');
        expect(mockOutbox.emit).toHaveBeenCalledWith(
          mockPrisma,
          expect.objectContaining({
            eventName: ContabilidadeEvents.RegraContabilPublicadaV1.name,
            payload: expect.objectContaining({
              regraId: 'reg-01',
              fatoTipo: 'VENDA_INGRESSO',
            }),
          }),
        );
      });

      it('deve simular contabilização (dry-run) garantindo Sum(Débitos) === Sum(Créditos)', async () => {
        mockPrisma.regraContabil.findFirst.mockResolvedValue(null); // Usará regras canônicas padrão

        const sim = await service.simularRegraContabil(TENANT_ID, {
          fatoTipo: 'VENDA_INGRESSO',
          valorBrutoCents: 11000, // R$ 110,00
          valorTaxaDiskCents: 1000, // R$ 10,00
          valorRepasseProdutorCents: 10000, // R$ 100,00
          competencia: COMPETENCIA,
        });

        expect(sim.sucesso).toBe(true);
        expect(sim.balanceado).toBe(true);
        expect(sim.totalDebitoCents).toBe(11000);
        expect(sim.totalCreditoCents).toBe(11000);
        expect(sim.partidasSimuladas.length).toBe(3);
        // Verifica segregação: recurso do produtor != taxa Disk
        const partidaProdutor = sim.partidasSimuladas.find((p) => p.contaCodigo === '2.1.2.01');
        const partidaDisk = sim.partidasSimuladas.find((p) => p.contaCodigo === '3.1.1.01');
        expect(partidaProdutor?.valorCents).toBe(10000);
        expect(partidaDisk?.valorCents).toBe(10000 ? 1000 : 0);
      });
    });

    describe('Máquina de Ajustes e Reclassificações (Imutabilidade)', () => {
      it('deve estornar lançamento original mantendo-o imutável e gerando contrapartida', async () => {
        mockPrisma.lancamentoContabil.findUnique.mockResolvedValue({
          id: 'lanc-orig-01',
          numeroLancamento: 42,
          competencia: COMPETENCIA,
          total: 100.0,
          status: 'confirmado',
          origemTipo: 'pedido_pago',
          origemReferenciaId: 'ped-orig',
          partidas: [
            { contaId: 'c1', tipo: 'D', valor: 100.0 },
            { contaId: 'c2', tipo: 'C', valor: 100.0 },
          ],
        });
        mockPrisma.fechamentoContabil.findUnique.mockResolvedValue(null);
        mockPrisma.lancamentoContabil.create.mockResolvedValue({
          id: 'lanc-novo-01',
          numeroLancamento: 43,
          total: 100.0,
        });
        mockPrisma.lancamentoContabil.update.mockResolvedValue({});
        mockPrisma.ajusteContabil.create.mockResolvedValue({
          id: 'aju-01',
          codigo: 'AJU-2026-0001',
          tipo: 'ESTORNO',
          lancamentoOriginalId: 'lanc-orig-01',
          lancamentoNovoId: 'lanc-novo-01',
          motivo: 'Estorno por chargeback confirmado',
          justificativa: 'Procedimento solicitado pelo time antifraude',
          documentoSuporteId: 'doc-01',
          aprovadoPor: USER_ID,
          createdAt: new Date(),
        });

        const res = await service.criarAjusteContabil(TENANT_ID, {
          tipo: 'ESTORNO',
          lancamentoOriginalId: 'lanc-orig-01',
          motivo: 'Estorno por chargeback confirmado',
          justificativa: 'Procedimento solicitado pelo time antifraude',
          documentoSuporteId: 'doc-01',
          aprovadoPor: USER_ID,
        });

        expect(res.ajuste.codigo).toBe('AJU-2026-0001');
        expect(mockPrisma.lancamentoContabil.update).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { id: 'lanc-orig-01' },
            data: expect.objectContaining({ status: 'estornado' }),
          }),
        );
        expect(mockOutbox.emit).toHaveBeenCalledWith(
          mockPrisma,
          expect.objectContaining({
            eventName: ContabilidadeEvents.AjusteContabilRealizadoV1.name,
          }),
        );
      });
    });

    describe('Fechamento Financeiro-Contábil de Evento (12 Gates)', () => {
      it('deve fechar evento financeiramente após validar os 12 gates e emitir evento', async () => {
        const EVENTO_ID = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
        mockPrisma.lancamentoContabil.findMany.mockResolvedValue([
          {
            partidas: [
              { tipo: 'C', valor: 250.0, conta: { tipo: 'receita', codigo: '3.1.1.01' } },
              { tipo: 'D', valor: 2000.0, conta: { tipo: 'passivo', codigo: '2.1.2.01' } },
            ],
          },
        ]);
        mockPrisma.fechamentoContabilEvento.upsert.mockResolvedValue({
          id: 'fch-ev-01',
          eventoId: EVENTO_ID,
          competencia: COMPETENCIA,
          status: 'FINANCEIRAMENTE_ENCERRADO',
          fechadoEm: new Date(),
        });

        const res = await service.fecharContabilmenteEvento(TENANT_ID, {
          eventoId: EVENTO_ID,
          competencia: COMPETENCIA,
          fechadoPor: USER_ID,
        });

        expect(res.status).toBe('FINANCEIRAMENTE_ENCERRADO');
        expect(res.gatesAprovadosCount).toBe(12);
        expect(mockOutbox.emit).toHaveBeenCalledWith(
          mockPrisma,
          expect.objectContaining({
            eventName: ContabilidadeEvents.FechamentoEventoContabilConcluidoV1.name,
          }),
        );
      });
    });

    describe('Conciliação Cruzada de Subsistemas e Rastreamento 360º', () => {
      it('deve conciliar os 3 subsistemas (Bancos, Recebíveis e Ledger)', async () => {
        mockPrisma.contaContabil.findUnique.mockResolvedValue({ id: 'c-bancos' });
        mockPrisma.partidaContabil.findMany.mockResolvedValue([]);
        mockPrisma.contaBancaria.findMany.mockResolvedValue([]);

        const conc = await service.obterConciliacaoSubsistemas(TENANT_ID, COMPETENCIA);

        expect(conc.subsistemas.length).toBe(3);
        expect(conc.statusGeral).toBe('CONFORME');
      });

      it('deve rastrear lançamento ponta a ponta fornecendo trilha forense', async () => {
        mockPrisma.lancamentoContabil.findFirst.mockResolvedValue({
          id: 'lanc-trace-01',
          codigo: 'LCT-2026-0001',
          numeroLancamento: 99,
          data: new Date('2026-09-20'),
          competencia: COMPETENCIA,
          total: 100.0,
          historico: 'Venda de Ingresso Online',
          origemTipo: 'pedido_pago',
          origemReferenciaId: 'ped-trace-01',
          eventoId: 'ev-01',
          produtorId: 'prod-01',
          status: 'confirmado',
          criadoPor: USER_ID,
          createdAt: new Date('2026-09-20'),
          partidas: [
            { id: 'p1', tipo: 'D', valor: 100.0, conta: { codigo: '1.1.2.01', nome: 'Adquirentes' } },
            { id: 'p2', tipo: 'C', valor: 100.0, conta: { codigo: '2.1.2.01', nome: 'Recursos Terceiros' } },
          ],
        });

        const trace = await service.rastrearLancamento(TENANT_ID, 'LCT-2026-0001');

        expect(trace.lancamento.codigo).toBe('LCT-2026-0001');
        expect(trace.origensRelacionadas.pedido).not.toBeNull();
        expect(trace.origensRelacionadas.ledger).not.toBeNull();
        expect(trace.trilhaAuditoria.length).toBeGreaterThanOrEqual(4);
      });
    });
  });
});

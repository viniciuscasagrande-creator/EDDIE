import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RHService, calcularDistanciaHaversine, validarBolsosCaju } from './rh.service';
import { RHPublicService } from './rh.public-service';
import { Prisma } from '@prisma/client';

describe('RHService & RHPublicService (EDDIE 11.39 Recursos Humanos & Disk Ponto)', () => {
  let service: RHService;
  let publicService: RHPublicService;
  let mockPrisma: any;
  let mockOutbox: any;

  const TENANT_ID = '00000000-0000-0000-0000-000000000001';
  const COLABORADOR_ID = 'colab-1234-uuid';
  const EVENTO_ID = 'evento-show-2026';

  beforeEach(() => {
    mockOutbox = {
      emit: vi.fn().mockResolvedValue('outbox-rh-01'),
      claim: vi.fn().mockResolvedValue(true),
    };

    mockPrisma = {
      colaboradorRH: {
        count: vi.fn().mockResolvedValue(42),
        findMany: vi.fn().mockResolvedValue([]),
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      registroPontoRH: {
        count: vi.fn().mockResolvedValue(38),
        findMany: vi.fn().mockResolvedValue([{ colaboradorId: COLABORADOR_ID }]),
        findFirst: vi.fn().mockResolvedValue({ nsr: 10450 }),
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: data.id, ...data })),
      },
      localGeofenceRH: {
        findMany: vi.fn().mockResolvedValue([]),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: data.id, ...data })),
      },
      custoMaoDeObraEventoRH: {
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: data.id, ...data })),
      },
      rHAuditLogRH: {
        create: vi.fn().mockResolvedValue({ id: 'log-uuid' }),
      },
      beneficioCajuRH: {
        upsert: vi.fn().mockImplementation(({ create, update }) =>
          Promise.resolve({
            id: create?.id || 'caju-1',
            ...(create || update),
          }),
        ),
        findUnique: vi.fn(),
      },
      fornecedorBeneficioRH: {
        findMany: vi.fn().mockResolvedValue([]),
        findUnique: vi.fn().mockResolvedValue({
          id: 'forn-caju-01',
          nomeFantasia: 'Caju Benefícios',
          cnpj: '33.221.849/0001-49',
          tipoIntegracao: 'API_REST',
        }),
      },
      beneficioCatalogoRH: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      colaboradorBeneficioRH: {
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn(),
      },
      pedidoCompraBeneficioRH: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: data.id, ...data })),
        findUnique: vi.fn(),
        update: vi.fn().mockImplementation(({ where, data }) =>
          Promise.resolve({ id: where.id, ...data }),
        ),
        findMany: vi.fn().mockResolvedValue([]),
      },
    };

    service = new RHService(mockPrisma, mockOutbox);
    publicService = new RHPublicService(service);
  });


  describe('1. Cálculo Geodésico de Haversine', () => {
    it('deve calcular distância 0 para coordenadas idênticas', () => {
      const dist = calcularDistanciaHaversine(-25.4284, -49.2733, -25.4284, -49.2733);
      expect(dist).toBe(0);
    });

    it('deve calcular distância correta entre Sede e Arena da Baixada (~3 km)', () => {
      // Sede Disk: -25.4284, -49.2733 | Arena: -25.4484, -49.2770
      const dist = calcularDistanciaHaversine(-25.4284, -49.2733, -25.4484, -49.2770);
      expect(dist).toBeGreaterThan(2000);
      expect(dist).toBeLessThan(3000);
    });
  });

  describe('2. Resumo Executivo RH', () => {
    it('deve retornar métricas executivas consolidadas com KPIs', async () => {
      const resumo = await service.obterResumoExecutivo(TENANT_ID);
      expect(resumo.totalColaboradores).toBe(42);
      expect(resumo.presentesHoje).toBe(1);
      expect(resumo.custoTotalPessoalMesCentavos).toBeGreaterThan(BigInt(0));
      expect(resumo.saldoBancoHorasMinutos).toBe(11040);
    });
  });

  describe('3. Cadastro de Colaborador', () => {
    it('deve criar colaborador e registrar log de auditoria imutável', async () => {
      mockPrisma.colaboradorRH.create.mockResolvedValueOnce({
        id: COLABORADOR_ID,
        nome: 'Vinicius Casagrande',
        matricula: 'DISK-00001',
      });

      const colab = await service.cadastrarColaborador(TENANT_ID, {
        matricula: 'DISK-00001',
        nome: 'Vinicius Casagrande',
        cpf: '123.456.789-00',
        email: 'vinicius@diskingressos.com.br',
        telefone: '(41) 99999-9999',
        cargoId: 'cargo-1',
        departamentoId: 'depto-1',
      });

      expect(colab.id).toBe(COLABORADOR_ID);
      expect(mockPrisma.colaboradorRH.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.rHAuditLogRH.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            acao: 'CADASTRO_COLABORADOR',
            entidade: 'ColaboradorRH',
          }),
        }),
      );
    });
  });

  describe('4. Registro de Ponto Eletrônico (Portaria 671 MTE & Geofencing)', () => {
    it('deve registrar ponto dentro do geofence gerando NSR incremental e hash SHA-256', async () => {
      mockPrisma.colaboradorRH.findUnique.mockResolvedValueOnce({
        id: COLABORADOR_ID,
        tenantId: TENANT_ID,
        nome: 'Vinicius Casagrande',
        cpf: '123.456.789-00',
        geofencePadrao: {
          id: 'geo-sede',
          latitude: -25.4284,
          longitude: -49.2733,
          raioMetros: 150,
        },
      });

      const resultado = await service.registrarPonto(TENANT_ID, {
        colaboradorId: COLABORADOR_ID,
        tipo: 'ENTRADA',
        latitude: -25.4284, // No centro da sede
        longitude: -49.2733,
        precisaoMetros: 8.5,
      });

      expect(resultado.nsr).toBe(10451);
      expect(resultado.dentroGeofence).toBe(true);
      expect(resultado.distanciaMetros).toBe(0);
      expect(resultado.hashIntegridade).toHaveLength(64); // SHA-256 hex
      expect(resultado.comprovanteNsr).toContain('COMP-10451-');
      expect(mockPrisma.registroPontoRH.create).toHaveBeenCalledTimes(1);
    });

    it('deve registrar ponto fora do geofence com status apropriado de alerta', async () => {
      mockPrisma.colaboradorRH.findUnique.mockResolvedValueOnce({
        id: COLABORADOR_ID,
        tenantId: TENANT_ID,
        nome: 'Vinicius Casagrande',
        cpf: '123.456.789-00',
        geofencePadraoId: 'geo-sede',
        geofencePadrao: {
          id: 'geo-sede',
          latitude: -25.4284,
          longitude: -49.2733,
          raioMetros: 150,
        },
      });

      const resultado = await service.registrarPonto(TENANT_ID, {
        colaboradorId: COLABORADOR_ID,
        tipo: 'ENTRADA',
        latitude: -25.4500, // Fora do raio (> 2 km)
        longitude: -49.2800,
      });

      expect(resultado.dentroGeofence).toBe(false);
      expect(resultado.distanciaMetros).toBeGreaterThan(150);
      expect(resultado.mensagem).toContain('Aviso: Ponto registrado fora da cerca virtual');
    });
  });

  describe('5. Apropriação de Custo de Mão de Obra por Evento (DRE)', () => {
    it('deve calcular diária + horas extras + alimentação + transporte e apropriar ao evento', async () => {
      const custo = await service.apropriarCustoEvento(TENANT_ID, {
        eventoId: EVENTO_ID,
        colaboradorId: COLABORADOR_ID,
        cargoFuncao: 'Coordenador de Portaria',
        tipoContratacao: 'FREELANCER_EVENTO',
        valorDiaria: 350.0,
        horasTrabalhadas: 10,
        valorHorasExtras: 90.0,
        auxilioAlimentacao: 50.0,
        auxilioTransporte: 30.0,
      });

      expect(mockPrisma.custoMaoDeObraEventoRH.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            eventoId: EVENTO_ID,
            cargoFuncao: 'Coordenador de Portaria',
            valorTotal: new Prisma.Decimal(520.0),
          }),
        }),
      );
    });

    it('deve retornar resumo consolidado de custos para o DRE do evento via RHPublicService', async () => {
      mockPrisma.custoMaoDeObraEventoRH.findMany.mockResolvedValueOnce([
        {
          valorDiaria: new Prisma.Decimal(350.0),
          valorHorasExtras: new Prisma.Decimal(50.0),
          auxilioAlimentacao: new Prisma.Decimal(40.0),
          auxilioTransporte: new Prisma.Decimal(20.0),
          valorTotal: new Prisma.Decimal(460.0),
          horasTrabalhadas: new Prisma.Decimal(8),
        },
        {
          valorDiaria: new Prisma.Decimal(200.0),
          valorHorasExtras: new Prisma.Decimal(0.0),
          auxilioAlimentacao: new Prisma.Decimal(40.0),
          auxilioTransporte: new Prisma.Decimal(20.0),
          valorTotal: new Prisma.Decimal(260.0),
          horasTrabalhadas: new Prisma.Decimal(6),
        },
      ]);

      const resumo = await publicService.obterCustoMaoDeObraPorEvento(TENANT_ID, EVENTO_ID);
      expect(resumo.totalAlocados).toBe(2);
      expect(resumo.totalHoras).toBe(14);
      expect(resumo.totalDiariasCentavos).toBe(BigInt(55000)); // R$ 550,00
      expect(resumo.custoTotalCentavos).toBe(BigInt(72000)); // R$ 720,00
      expect(resumo.statusApropriacao).toBe('CONSOLIDADO_DRE');
    });
  });

  describe('6. Gestão e Validação Matemática de Bolsos Caju (Caju Wallets)', () => {
    it('deve validar positivamente quando a soma dos bolsos bater 100% da verba total', () => {
      const validacao = validarBolsosCaju(1650.0, {
        refeicao: 850.0,
        alimentacao: 500.0,
        mobilidade: 300.0,
        cultura: 0,
        livre: 0,
      });

      expect(validacao.valido).toBe(true);
      expect(validacao.diferenca).toBe(0);
      expect(validacao.somaBolsos).toBe(1650.0);
    });

    it('deve reprovar com aviso descritivo se a soma dos bolsos for diferente da verba total', () => {
      const validacao = validarBolsosCaju(1650.0, {
        refeicao: 800.0,
        alimentacao: 500.0,
        mobilidade: 300.0, // Soma = 1600.0, falta 50.0
      });

      expect(validacao.valido).toBe(false);
      expect(validacao.diferenca).toBe(-50.0);
      expect(validacao.mensagem).toContain('inferior à verba total em R$ 50.00');
    });

    it('deve recusar cadastro de bolsos se validação matemática falhar', async () => {
      await expect(
        service.configurarBolsosCaju(TENANT_ID, {
          colaboradorId: COLABORADOR_ID,
          verbaTotalMensal: 1500.0,
          saldoRefeicao: 700.0,
          saldoAlimentacao: 500.0,
          saldoMobilidade: 200.0, // Soma = 1400.0 (falta 100)
        }),
      ).rejects.toThrow('inferior à verba total');
    });

    it('deve salvar bolsos Caju com sucesso e emitir evento no Outbox', async () => {
      mockPrisma.colaboradorRH.findUnique.mockResolvedValueOnce({
        id: COLABORADOR_ID,
        tenantId: TENANT_ID,
        nome: 'Karine Santos',
        matricula: 'DK-1042',
      });

      const resultado = await service.configurarBolsosCaju(TENANT_ID, {
        colaboradorId: COLABORADOR_ID,
        verbaTotalMensal: 1650.0,
        saldoRefeicao: 850.0,
        saldoAlimentacao: 500.0,
        saldoMobilidade: 300.0,
        saldoCultura: 0,
        saldoLivre: 0,
      });

      expect(resultado).toBeDefined();
      expect(mockPrisma.beneficioCajuRH.upsert).toHaveBeenCalledTimes(1);
      expect(mockOutbox.emit).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          eventName: 'rh.beneficios.caju_configurado.v1',
          payload: expect.objectContaining({
            colaboradorId: COLABORADOR_ID,
            verbaTotal: 1650,
          }),
        }),
      );
    });
  });

  describe('7. Motor de Compra de Benefícios & Dedução de Faltas do Ponto', () => {
    it('deve calcular lote de benefícios aplicando dedução de faltas e teto legal 6% VT CLT', async () => {
      const lote = await service.calcularCompraBeneficios(TENANT_ID, {
        competencia: '2026-10',
        diasUteis: 21,
        deduzirFaltasPonto: true,
      });

      expect(lote.competencia).toBe('2026-10');
      expect(lote.diasUteis).toBe(21);
      expect(lote.totalVidas).toBeGreaterThan(0);
      expect(lote.totalGeralRecargaCentavos).toBeGreaterThan(BigInt(0));
      expect(lote.pedidosPorFornecedor.length).toBeGreaterThan(0);

      // Encontrar item de colaboradora com faltas para verificar dedução
      const itemComFalta = lote.itens.find((i) => i.diasFaltas > 0 && i.fornecedorNome === 'Caju Benefícios');
      if (itemComFalta) {
        expect(itemComFalta.diasEfetivos).toBeLessThan(itemComFalta.diasUteis);
        expect(itemComFalta.valorRecargaBruto).toBeLessThan(itemComFalta.valorDiario * itemComFalta.diasUteis + 1);
      }

      // Verificar teto de 6% do VT no colaborador CLT
      for (const item of lote.itens) {
        if (item.regraDescontoFolha === 'CLT_VT_6' && item.tipoContrato === 'CLT') {
          const tetoMaximo = item.salarioBase * 0.06;
          expect(item.descontoColaborador).toBeLessThanOrEqual(tetoMaximo + 0.01);
        }
      }
    });

    it('deve retornar pedidos agrupados por fornecedor (Caju Benefícios e SulAmérica)', async () => {
      const lote = await publicService.calcularCompraBeneficios(TENANT_ID, '2026-10', 21);
      const nomesFornecedores = lote.pedidosPorFornecedor.map((p) => p.fornecedorNome);

      expect(nomesFornecedores).toContain('Caju Benefícios');
      expect(nomesFornecedores).toContain('SulAmérica Saúde');
    });
  });

  describe('8. Aprovação do Lote e Integração Financeira (Contas a Pagar / Tesouraria)', () => {
    it('deve criar pedido com status AGUARDANDO_APROVACAO_FINANCEIRA e chave PIX gerada', async () => {
      const pedido = await service.criarPedidoCompraBeneficios(TENANT_ID, {
        fornecedorId: 'forn-caju-01',
        competencia: '2026-10',
        diasUteis: 21,
        valorTotal: 5350.0,
        qtdVidas: 4,
      });

      expect(pedido.status).toBe('AGUARDANDO_APROVACAO_FINANCEIRA');
      expect(pedido.codigoPix).toContain('BR.GOV.BCB.PIX');
      expect(pedido.batchIdCaju).toContain('recarga-caju-2026-10');
      expect(mockOutbox.emit).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          eventName: 'rh.beneficios.pedido_gerado.v1',
        }),
      );
    });

    it('deve aprovar pedido, atualizar status para APROVADO_FINANCEIRO e emitir evento no Outbox', async () => {
      const PEDIDO_ID = 'pedido-compra-123';
      mockPrisma.pedidoCompraBeneficioRH.findUnique.mockResolvedValueOnce({
        id: PEDIDO_ID,
        tenantId: TENANT_ID,
        fornecedorId: 'forn-caju-01',
        fornecedor: { nomeFantasia: 'Caju Benefícios' },
        competencia: '2026-10',
        diasUteis: 21,
        valorTotal: new Prisma.Decimal(5350.0),
        qtdVidas: 4,
        status: 'AGUARDANDO_APROVACAO_FINANCEIRA',
        codigoPix: 'pix-simulado-caju',
        batchIdCaju: 'recarga-caju-2026-10-abc',
      });

      const pedidoAprovado = await service.aprovarPedidoBeneficiosFinanceiro(
        TENANT_ID,
        PEDIDO_ID,
        'DIRETORIA_RH',
      );

      expect(pedidoAprovado.status).toBe('APROVADO_FINANCEIRO');
      expect(pedidoAprovado.aprovadoPor).toBe('DIRETORIA_RH');
      expect(mockPrisma.pedidoCompraBeneficioRH.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: PEDIDO_ID },
          data: expect.objectContaining({
            status: 'APROVADO_FINANCEIRO',
            aprovadoPor: 'DIRETORIA_RH',
          }),
        }),
      );
      expect(mockOutbox.emit).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          eventName: 'rh.beneficios.pedido_aprovado.v1',
          payload: expect.objectContaining({
            pedidoId: PEDIDO_ID,
            aprovadoPor: 'DIRETORIA_RH',
          }),
        }),
      );
    });
  });
});


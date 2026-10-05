import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RHService, calcularDistanciaHaversine } from './rh.service';
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
});

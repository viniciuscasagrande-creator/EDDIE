import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComercialService } from './comercial.service';
import { ComercialPublicService } from './comercial.public-service';
import { ComercialEvents } from '@ticketing/contracts';
import { PrismaService } from '../../shared/prisma.module';
import { OutboxService } from '../../shared/outbox/outbox.service';

describe('ComercialService & PublicService (CRM B2B, Pipeline, Condições)', () => {
  let service: ComercialService;
  let publicService: ComercialPublicService;
  let mockPrisma: any;
  let mockOutbox: any;

  const TENANT_ID = '00000000-0000-0000-0000-000000000001';
  const PRODUTOR_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const EXECUTIVO_ID = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
  const OPORTUNIDADE_ID = 'oooooooo-oooo-oooo-oooo-oooooooooooo';
  const CONDICAO_ID = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

  beforeEach(() => {
    mockOutbox = {
      emit: vi.fn().mockResolvedValue('outbox-msg-com-01'),
      claim: vi.fn().mockResolvedValue(true),
    };

    mockPrisma = {
      $transaction: vi.fn().mockImplementation(async (callback: any) => {
        return callback(mockPrisma);
      }),
      produtorB2B: {
        create: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
      },
      oportunidadeComercial: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
      },
      historicoEtapaPipeline: {
        create: vi.fn(),
      },
      condicaoComercial: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
      },
      atividadeComercial: {
        create: vi.fn(),
      },
    };

    service = new ComercialService(
      mockPrisma as unknown as PrismaService,
      mockOutbox as unknown as OutboxService,
    );

    publicService = new ComercialPublicService(
      mockPrisma as unknown as PrismaService,
    );
  });

  describe('cadastrarProdutor()', () => {
    it('deve cadastrar produtor B2B e emitir ProdutorB2BCadastrado via outbox', async () => {
      mockPrisma.produtorB2B.create.mockResolvedValue({
        id: PRODUTOR_ID,
        tenantId: TENANT_ID,
        razaoSocial: 'Live Nation Entretenimento Ltda',
        nomeFantasia: 'Live Nation Brasil',
        documento: '12.345.678/0001-90',
        email: 'contato@livenation.com.br',
        executivoResponsavelId: EXECUTIVO_ID,
        status: 'prospeccao',
        createdAt: new Date(),
      });

      const produtor = await service.cadastrarProdutor(TENANT_ID, {
        razaoSocial: 'Live Nation Entretenimento Ltda',
        nomeFantasia: 'Live Nation Brasil',
        documento: '12.345.678/0001-90',
        email: 'contato@livenation.com.br',
        executivoResponsavelId: EXECUTIVO_ID,
      });

      expect(produtor.id).toBe(PRODUTOR_ID);
      expect(mockOutbox.emit).toHaveBeenCalledWith(
        mockPrisma,
        expect.objectContaining({
          eventName: ComercialEvents.ProdutorB2BCadastrado.name,
          payload: expect.objectContaining({
            produtorId: PRODUTOR_ID,
            razaoSocial: 'Live Nation Entretenimento Ltda',
          }),
        }),
      );
    });
  });

  describe('criarOportunidade()', () => {
    it('deve criar oportunidade no pipeline e registrar histórico da primeira etapa', async () => {
      mockPrisma.produtorB2B.findFirst.mockResolvedValue({ id: PRODUTOR_ID });
      mockPrisma.oportunidadeComercial.create.mockResolvedValue({
        id: OPORTUNIDADE_ID,
        tenantId: TENANT_ID,
        produtorId: PRODUTOR_ID,
        titulo: 'Festival de Verão 2027',
        valorEstimado: 500000.0,
        etapa: 'prospeccao',
        createdAt: new Date(),
      });

      const op = await service.criarOportunidade(TENANT_ID, {
        produtorId: PRODUTOR_ID,
        titulo: 'Festival de Verão 2027',
        valorEstimadoCents: 50000000, // R$ 500.000,00
        etapa: 'prospeccao',
        probabilidadePercentual: 30,
        executivoId: EXECUTIVO_ID,
      });

      expect(op.id).toBe(OPORTUNIDADE_ID);
      expect(mockPrisma.historicoEtapaPipeline.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          etapaAnterior: 'nenhuma',
          etapaNova: 'prospeccao',
        }),
      });

      expect(mockOutbox.emit).toHaveBeenCalledWith(
        mockPrisma,
        expect.objectContaining({
          eventName: ComercialEvents.OportunidadeCriada.name,
          payload: expect.objectContaining({
            oportunidadeId: expect.any(String),
            valorEstimadoCents: 50000000,
          }),
        }),
      );
    });
  });

  describe('alterarEtapaOportunidade()', () => {
    it('deve atualizar etapa e emitir EtapaPipelineAlterada', async () => {
      mockPrisma.oportunidadeComercial.findUnique.mockResolvedValue({
        id: OPORTUNIDADE_ID,
        tenantId: TENANT_ID,
        produtorId: PRODUTOR_ID,
        etapa: 'proposta',
      });

      mockPrisma.oportunidadeComercial.update.mockResolvedValue({
        id: OPORTUNIDADE_ID,
        etapa: 'negociacao',
      });

      const atualizada = await service.alterarEtapaOportunidade(TENANT_ID, OPORTUNIDADE_ID, {
        etapaNova: 'negociacao',
        alteradoPor: EXECUTIVO_ID,
        motivo: 'Produtor solicitou revisão de taxas de conveniência',
      });

      expect(atualizada.etapa).toBe('negociacao');
      expect(mockOutbox.emit).toHaveBeenCalledWith(
        mockPrisma,
        expect.objectContaining({
          eventName: ComercialEvents.EtapaPipelineAlterada.name,
          payload: expect.objectContaining({
            etapaAnterior: 'proposta',
            etapaNova: 'negociacao',
          }),
        }),
      );
    });
  });

  describe('aprovarCondicao()', () => {
    it('deve aprovar condição comercial e emitir CondicaoComercialAprovada', async () => {
      mockPrisma.condicaoComercial.findUnique.mockResolvedValue({
        id: CONDICAO_ID,
        tenantId: TENANT_ID,
        produtorId: PRODUTOR_ID,
        status: 'em_aprovacao',
      });

      const dataAprov = new Date();
      mockPrisma.condicaoComercial.update.mockResolvedValue({
        id: CONDICAO_ID,
        produtorId: PRODUTOR_ID,
        eventoId: null,
        taxaServicoPercentual: 10.0,
        taxaProcessamentoPercentual: 2.5,
        prazoRepasseDias: 2,
        vigenciaInicio: new Date('2026-01-01'),
        vigenciaFim: null,
        status: 'aprovada',
      });

      const resultado = await service.aprovarCondicao(TENANT_ID, CONDICAO_ID, {
        aprovadoPor: EXECUTIVO_ID,
      });

      expect(resultado.status).toBe('aprovada');
      expect(mockOutbox.emit).toHaveBeenCalledWith(
        mockPrisma,
        expect.objectContaining({
          eventName: ComercialEvents.CondicaoComercialAprovada.name,
          payload: expect.objectContaining({
            taxaServicoPercentual: 10.0,
            prazoRepasseDias: 2,
          }),
        }),
      );
    });
  });

  describe('ComercialPublicService', () => {
    it('deve retornar a condição comercial vigente do produtor', async () => {
      mockPrisma.condicaoComercial.findFirst.mockResolvedValue({
        id: CONDICAO_ID,
        produtorId: PRODUTOR_ID,
        eventoId: null,
        taxaServicoPercentual: 8.5,
        taxaProcessamentoPercentual: 2.0,
        prazoRepasseDias: 1,
        vigenciaInicio: new Date('2026-01-01'),
        vigenciaFim: null,
        status: 'aprovada',
      });

      const cond = await publicService.obterCondicaoComercialVigente(TENANT_ID, PRODUTOR_ID);

      expect(cond).not.toBeNull();
      expect(cond?.taxaServicoPercentual).toBe(8.5);
      expect(cond?.prazoRepasseDias).toBe(1);
    });
  });
});

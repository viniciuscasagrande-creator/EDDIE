import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MarketingService } from './marketing.service';
import { MarketingPublicService } from './marketing.public-service';
import { MarketingEvents } from '@ticketing/contracts';
import { PrismaService } from '../../shared/prisma.module';
import { OutboxService } from '../../shared/outbox/outbox.service';

describe('MarketingService & PublicService (Hub, Campanhas, UTMs, Pixels, Cupons)', () => {
  let service: MarketingService;
  let publicService: MarketingPublicService;
  let mockPrisma: any;
  let mockOutbox: any;

  const TENANT_ID = '00000000-0000-0000-0000-000000000001';
  const PRODUTOR_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const EVENTO_ID = '11111111-1111-1111-1111-111111111111';
  const CAMPANHA_ID = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

  beforeEach(() => {
    mockOutbox = {
      emit: vi.fn().mockResolvedValue('outbox-msg-01'),
      claim: vi.fn().mockResolvedValue(true),
    };

    mockPrisma = {
      $transaction: vi.fn().mockImplementation(async (callback: any) => {
        return callback(mockPrisma);
      }),
      campanhaMarketing: {
        create: vi.fn(),
        update: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
      },
      pixelTracking: {
        create: vi.fn(),
        update: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
      },
      utmLink: {
        create: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
      cupomMarketing: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
      },
      conversaoMarketing: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
      alertaMarketing: {
        create: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
      },
    };

    service = new MarketingService(
      mockPrisma as unknown as PrismaService,
      mockOutbox as unknown as OutboxService,
    );

    publicService = new MarketingPublicService(
      service,
      mockPrisma as unknown as PrismaService,
    );
  });

  describe('criarCampanha()', () => {
    it('deve criar campanha com orçamento em Decimal e emitir evento CampanhaCriada via outbox', async () => {
      const dataCriacao = new Date('2026-09-21T12:00:00.000Z');
      mockPrisma.campanhaMarketing.create.mockResolvedValue({
        id: CAMPANHA_ID,
        tenantId: TENANT_ID,
        produtorId: PRODUTOR_ID,
        eventoId: EVENTO_ID,
        nome: 'Lançamento Lote Promocional',
        objetivo: 'Vendas Iniciais',
        status: 'rascunho',
        orcamentoTotal: 5000.0,
        gastoAtual: 0,
        canais: ['meta_ads', 'google_ads'],
        createdAt: dataCriacao,
      });

      const resultado = await service.criarCampanha(TENANT_ID, {
        produtorId: PRODUTOR_ID,
        eventoId: EVENTO_ID,
        nome: 'Lançamento Lote Promocional',
        objetivo: 'Vendas Iniciais',
        canais: ['meta_ads', 'google_ads'],
        orcamentoCents: 500000, // R$ 5.000,00
      });

      expect(resultado.id).toBe(CAMPANHA_ID);
      expect(mockPrisma.campanhaMarketing.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          orcamentoTotal: 5000.0,
          status: 'rascunho',
          canais: ['meta_ads', 'google_ads'],
        }),
      });

      expect(mockOutbox.emit).toHaveBeenCalledWith(
        mockPrisma,
        expect.objectContaining({
          eventName: MarketingEvents.CampanhaCriada.name,
          source: 'marketing',
          payload: expect.objectContaining({
            campanhaId: expect.any(String),
            orcamentoCents: 500000,
          }),
        }),
      );
    });
  });

  describe('alterarStatusCampanha()', () => {
    it('deve atualizar status da campanha e emitir evento via outbox', async () => {
      mockPrisma.campanhaMarketing.findUnique.mockResolvedValue({
        id: CAMPANHA_ID,
        tenantId: TENANT_ID,
        produtorId: PRODUTOR_ID,
        eventoId: EVENTO_ID,
        status: 'rascunho',
      });

      mockPrisma.campanhaMarketing.update.mockResolvedValue({
        id: CAMPANHA_ID,
        status: 'ativa',
        updatedAt: new Date(),
      });

      const resultado = await service.alterarStatusCampanha(TENANT_ID, CAMPANHA_ID, {
        statusNovo: 'ativa',
        motivo: 'Aprovação do produtor',
      });

      expect(resultado.status).toBe('ativa');
      expect(mockOutbox.emit).toHaveBeenCalledWith(
        mockPrisma,
        expect.objectContaining({
          eventName: MarketingEvents.CampanhaStatusAlterado.name,
          payload: expect.objectContaining({
            campanhaId: CAMPANHA_ID,
            statusAnterior: 'rascunho',
            statusNovo: 'ativa',
          }),
        }),
      );
    });

    it('deve lançar NotFoundException se a campanha não existir', async () => {
      mockPrisma.campanhaMarketing.findUnique.mockResolvedValue(null);

      await expect(
        service.alterarStatusCampanha(TENANT_ID, 'id-inexistente', { statusNovo: 'ativa' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('gerarLinkUtm()', () => {
    it('deve construir URL parametrizada e gerar payload para QR Code', async () => {
      mockPrisma.utmLink.create.mockImplementation(({ data }: any) => ({
        ...data,
        id: 'link-utm-01',
        urlFinal: data.urlDestino,
        qrPayload: data.urlDestino,
        codigo: 'link-utm-01',
        cliques: 0,
        conversoes: 0,
      }));

      const link = await service.gerarLinkUtm(TENANT_ID, {
        produtorId: PRODUTOR_ID,
        eventoId: EVENTO_ID,
        canal: 'instagram',
        urlDestino: 'https://diskingressos.com.br/evento/rock-festival',
        utmSource: 'instagram_bio',
        utmMedium: 'social',
        utmCampaign: 'virada_lote',
      });

      expect(link.urlFinal).toContain('utm_source=instagram_bio');
      expect(link.urlFinal).toContain('utm_medium=social');
      expect(link.urlFinal).toContain('utm_campaign=virada_lote');
      expect(link.qrPayload).toBe(link.urlFinal);
      expect(link.codigo).toBeDefined();
    });
  });

  describe('validarCupom()', () => {
    it('deve calcular corretamente desconto percentual sobre o subtotal do carrinho', async () => {
      mockPrisma.cupomMarketing.findUnique.mockResolvedValue({
        id: 'cupom-10',
        codigo: 'PROMO10',
        tipoDesconto: 'percentual',
        descontoValor: { toNumber: () => 10 }, // 10%
        ativo: true,
        validoAte: null,
        limiteUso: null,
        usosAtuais: 0,
      });

      const resultado = await service.validarCupom(
        TENANT_ID,
        EVENTO_ID,
        'promo10',
        20000, // R$ 200,00
      );

      expect(resultado.valido).toBe(true);
      expect(resultado.descontoCents).toBe(2000); // 10% de R$ 200,00 = R$ 20,00
      expect(resultado.codigo).toBe('PROMO10');
    });

    it('deve calcular corretamente desconto fixo limitado ao subtotal', async () => {
      mockPrisma.cupomMarketing.findUnique.mockResolvedValue({
        id: 'cupom-fixo',
        codigo: 'DESCONTO50',
        tipoDesconto: 'valor_fixo',
        descontoValor: { toNumber: () => 50.0 }, // R$ 50,00 = 5000 cents
        ativo: true,
        validoAte: null,
        limiteUso: null,
        usosAtuais: 0,
      });

      const resultado = await service.validarCupom(
        TENANT_ID,
        EVENTO_ID,
        'DESCONTO50',
        3000, // Subtotal de R$ 30,00
      );

      expect(resultado.valido).toBe(true);
      expect(resultado.descontoCents).toBe(3000); // Limitado ao subtotal
    });

    it('deve recusar cupom expirado', async () => {
      mockPrisma.cupomMarketing.findUnique.mockResolvedValue({
        id: 'cupom-exp',
        codigo: 'EXPIRADO',
        ativo: true,
        validoAte: new Date('2020-01-01'),
        limiteUso: null,
        usosAtuais: 0,
      });

      const resultado = await service.validarCupom(TENANT_ID, EVENTO_ID, 'EXPIRADO', 10000);
      expect(resultado.valido).toBe(false);
      expect(resultado.motivo).toContain('expirado');
    });

    it('deve recusar cupom com limite de uso esgotado', async () => {
      mockPrisma.cupomMarketing.findUnique.mockResolvedValue({
        id: 'cupom-esgotado',
        codigo: 'ESGOTADO',
        ativo: true,
        validoAte: null,
        limiteUso: 100,
        usosAtuais: 100,
      });

      const resultado = await service.validarCupom(TENANT_ID, EVENTO_ID, 'ESGOTADO', 10000);
      expect(resultado.valido).toBe(false);
      expect(resultado.motivo).toContain('esgotado');
    });
  });

  describe('atribuirConversao()', () => {
    it('deve registrar conversão, incrementar uso do cupom e emitir ConversaoAtribuida no outbox', async () => {
      mockPrisma.cupomMarketing.findUnique.mockResolvedValue({
        id: 'cupom-vip',
        codigo: 'VIP',
      });
      mockPrisma.cupomMarketing.update.mockResolvedValue({});
      mockPrisma.conversaoMarketing.create.mockResolvedValue({
        id: 'conv-01',
        atribuidaEm: new Date(),
      });

      await service.atribuirConversao(TENANT_ID, {
        produtorId: PRODUTOR_ID,
        eventoId: EVENTO_ID,
        pedidoId: 'ped-999',
        valorTotalCents: 15000,
        cupomCodigo: 'VIP',
      });

      expect(mockPrisma.cupomMarketing.update).toHaveBeenCalledWith({
        where: { id: 'cupom-vip' },
        data: { usosAtuais: { increment: 1 } },
      });

      expect(mockOutbox.emit).toHaveBeenCalledWith(
        mockPrisma,
        expect.objectContaining({
          eventName: MarketingEvents.ConversaoAtribuida.name,
          source: 'marketing',
          payload: expect.objectContaining({
            pedidoId: 'ped-999',
            cupomCodigo: 'VIP',
            valorTotalCents: 15000,
          }),
        }),
      );
    });
  });

  describe('MarketingPublicService', () => {
    it('obterResumoMarketingEvento() deve calcular ROAS e métricas agregadas', async () => {
      mockPrisma.campanhaMarketing.findMany.mockResolvedValue([
        { status: 'ativa', orcamentoTotal: 2000.0, gastoAtual: { toNumber: () => 1000.0 } },
      ]);
      mockPrisma.conversaoMarketing.findMany.mockResolvedValue([
        { receitaAtribuida: { toNumber: () => 5000.0 } },
      ]);
      mockPrisma.utmLink.count.mockResolvedValue(4);
      mockPrisma.pixelTracking.count.mockResolvedValue(2);

      const resumo = await publicService.obterResumoMarketingEvento(
        TENANT_ID,
        PRODUTOR_ID,
        EVENTO_ID,
      );

      expect(resumo.campanhasAtivas).toBe(1);
      expect(resumo.totalInvestidoCents).toBe(100000);   // R$ 1.000,00
      expect(resumo.receitaAtribuidaCents).toBe(500000); // R$ 5.000,00
      expect(resumo.roasMedio).toBe(5.0);               // 5000 / 1000 = 5x
      expect(resumo.linksAtivos).toBe(4);
      expect(resumo.pixelsConfigurados).toBe(2);
    });

    it('verificarReadinessMarketing() deve alertar se faltar pixels ou links UTM', async () => {
      mockPrisma.pixelTracking.findMany.mockResolvedValue([]);
      mockPrisma.utmLink.count.mockResolvedValue(0);
      mockPrisma.campanhaMarketing.count.mockResolvedValue(0);

      const readiness = await publicService.verificarReadinessMarketing(
        TENANT_ID,
        PRODUTOR_ID,
        EVENTO_ID,
      );

      expect(readiness.pronto).toBe(true);
      expect(readiness.avisos.length).toBeGreaterThan(0);
      expect(readiness.avisos[0]).toContain('Meta Pixel');
    });
  });
});

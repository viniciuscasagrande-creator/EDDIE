import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FiscalService } from './fiscal.service';
import { FiscalPublicService } from './fiscal.public-service';
import { FiscalEvents } from '@ticketing/contracts';
import { Prisma } from '@prisma/client';

describe('FiscalService & FiscalPublicService (EDDIE 11.38 Fiscal & Tributário)', () => {
  let service: FiscalService;
  let publicService: FiscalPublicService;
  let mockPrisma: any;
  let mockOutbox: any;

  const TENANT_ID = '00000000-0000-0000-0000-000000000001';
  const COMPETENCIA = '2026-09';
  const USER_ID = 'user-fiscal-test-uuid';

  beforeEach(() => {
    mockOutbox = {
      emit: vi.fn().mockResolvedValue('outbox-fiscal-01'),
      claim: vi.fn().mockResolvedValue(true),
    };

    mockPrisma = {
      $transaction: vi.fn().mockImplementation(async (callback: any) => {
        return callback(mockPrisma);
      }),
      regraTributaria: {
        create: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      itemRegraTributaria: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
      documentoFiscal: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
      itemDocumentoFiscal: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
      retencaoTributaria: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
      apuracaoTributaria: {
        create: vi.fn(),
        upsert: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
      },
      obrigacaoFiscal: {
        create: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
      },
      pendenciaFiscal: {
        create: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
      },
      certificadoDigitalFiscal: {
        findMany: vi.fn(),
      },
      fechamentoFiscal: {
        create: vi.fn(),
        upsert: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      pedido: {
        findMany: vi.fn(),
      },
      tituloPagar: {
        findMany: vi.fn(),
      },
    };

    service = new FiscalService(mockPrisma as any, mockOutbox as any);
    publicService = new FiscalPublicService(mockPrisma as any, service);
  });

  describe('1. Regras Tributárias Versionadas (LC 214 / LC 227)', () => {
    it('deve criar uma regra tributária versão 1 e publicar evento no outbox', async () => {
      mockPrisma.regraTributaria.findFirst.mockResolvedValue(null);
      mockPrisma.regraTributaria.create.mockImplementation(({ data }: any) => ({
        id: data.id,
        tenantId: data.tenantId,
        codigo: data.codigo,
        versao: data.versao,
        descricao: data.descricao,
        operacaoTipo: data.operacaoTipo,
        regimeTributario: data.regimeTributario,
        status: data.status,
        vigenciaInicio: data.vigenciaInicio,
        vigenciaFim: data.vigenciaFim,
        criadoPor: data.criadoPor,
        createdAt: new Date(),
        itens: data.itens.create,
      }));

      const res = await service.criarRegraTributaria(TENANT_ID, {
        codigo: 'REG-INTERMED-01',
        descricao: 'Regra de Intermediação Curitiba V1',
        operacaoTipo: 'INTERMEDIACAO_VENDA',
        regimeTributario: 'LUCRO_PRESUMIDO',
        municipioIncidencia: 'Curitiba',
        ufIncidencia: 'PR',
        status: 'VIGENTE',
        exigeNfse: true,
        politicaRetencao: 'DISPENSADA',
        criadoPor: USER_ID,
        itens: [
          {
            tributoCodigo: 'ISS',
            basePercentual: 100,
            aliquotaPercentual: 5.0,
            retencao: false,
            responsavelRetencao: 'PRESTADOR',
          },
          {
            tributoCodigo: 'PIS',
            basePercentual: 100,
            aliquotaPercentual: 0.65,
            retencao: false,
            responsavelRetencao: 'PRESTADOR',
          },
        ],
      });

      expect(res.versao).toBe(1);
      expect(mockOutbox.emit).toHaveBeenCalledWith(
        mockPrisma,
        expect.objectContaining({
          eventName: FiscalEvents.RegraTributariaPublicadaV1.name,
          source: 'fiscal',
          payload: expect.objectContaining({
            codigo: 'REG-INTERMED-01',
            versao: 1,
          }),
        }),
      );
    });

    it('deve incrementar a versão automaticamente quando já existir versão prévia', async () => {
      mockPrisma.regraTributaria.findFirst.mockResolvedValue({
        id: 'regra-v1-id',
        versao: 1,
      });
      mockPrisma.regraTributaria.create.mockImplementation(({ data }: any) => ({
        id: data.id,
        codigo: data.codigo,
        versao: data.versao,
        vigenciaInicio: new Date(),
        createdAt: new Date(),
        itens: [],
      }));

      const res = await service.criarRegraTributaria(TENANT_ID, {
        codigo: 'REG-INTERMED-01',
        descricao: 'Regra de Intermediação V2',
        operacaoTipo: 'INTERMEDIACAO_VENDA',
        regimeTributario: 'LUCRO_PRESUMIDO',
        status: 'VIGENTE',
        exigeNfse: true,
        politicaRetencao: 'DISPENSADA',
        criadoPor: USER_ID,
        itens: [
          {
            tributoCodigo: 'ISS',
            basePercentual: 100,
            aliquotaPercentual: 4.5,
            retencao: false,
            responsavelRetencao: 'PRESTADOR',
          },
        ],
      });

      expect(res.versao).toBe(2);
    });
  });

  describe('2. Princípio da Segregação de Receita & Simulação Dry-Run', () => {
    it('deve tributar estritamente a taxa Disk em intermediação de venda (Ingresso R$ 100 + Taxa R$ 10)', async () => {
      mockPrisma.regraTributaria.findFirst.mockResolvedValue({
        id: 'reg-taxa-id',
        codigo: 'REG-TAXA',
        operacaoTipo: 'INTERMEDIACAO_VENDA',
        regimeTributario: 'LUCRO_PRESUMIDO',
        itens: [
          {
            tributoCodigo: 'ISS',
            basePercentual: new Prisma.Decimal(100),
            aliquotaPercentual: new Prisma.Decimal(5.0),
            retencao: false,
            responsavelRetencao: 'PRESTADOR',
          },
        ],
      });

      // Total pago: R$ 110 (11000 cents), sendo R$ 10 de taxa Disk (1000 cents)
      const simulacao = await service.simularOperacaoFiscal(TENANT_ID, {
        operacaoTipo: 'INTERMEDIACAO_VENDA',
        valorBrutoCents: 11000,
        valorTaxaDiskCents: 1000,
        tomadorCpfCnpj: '12345678901',
      });

      // Valor do produtor segregado: R$ 100 (10000 cents)
      expect(simulacao.valorReceitaProdutorCents).toBe(10000);
      expect(simulacao.recursosTerceirosNaoTributaveisCents).toBe(10000);
      // Base de cálculo tributável da Disk é EXCLUSIVAMENTE a taxa (R$ 10 = 1000 cents)
      expect(simulacao.baseCalculoTributavelCents).toBe(1000);
      expect(simulacao.baseCalculoDiskCents).toBe(1000);
      // ISS de 5% sobre R$ 10 = R$ 0,50 (50 cents)
      expect(simulacao.valorTributosPropriosCents).toBe(50);
      expect(simulacao.totalTributosDevidosCents).toBe(50);
      expect(simulacao.tributosCalculados).toHaveLength(1);
      expect(simulacao.tributosCalculados[0]?.tributoCodigo).toBe('ISS');
      expect(simulacao.tributosCalculados[0]?.valorTributoCents).toBe(50);
    });

    it('deve simular comparativo da Reforma Tributária (LC 214 IBS/CBS)', async () => {
      mockPrisma.regraTributaria.findFirst.mockResolvedValue(null);

      const comparativo = await service.compararReformaTributaria(TENANT_ID, {
        operacaoTipo: 'TAXA_CONVENIENCIA',
        valorBrutoCents: 2000, // R$ 20 de conveniência
        valorTaxaDiskCents: 2000,
        tomadorCpfCnpj: '98765432000199',
      });

      expect(comparativo.regimeAtual.baseCalculoCentavos).toBe(2000);
      expect(comparativo.reformaTributariaLC214.baseCalculoCentavos).toBe(2000);
      expect(comparativo.reformaTributariaLC214.cbsCents).toBeGreaterThan(0);
      expect(comparativo.reformaTributariaLC214.ibsCents).toBeGreaterThan(0);
      expect(comparativo.reformaTributariaLC214.fundamentoLegal).toContain('LC 214/2025');
    });
  });

  describe('3. Emissão de Documento Fiscal (NFS-e) & Idempotência', () => {
    it('deve emitir documento fiscal com chaveFiscal única e emitir evento outbox', async () => {
      mockPrisma.documentoFiscal.findUnique.mockResolvedValue(null);
      mockPrisma.documentoFiscal.count.mockResolvedValue(42);
      mockPrisma.documentoFiscal.create.mockImplementation(({ data }: any) => ({
        id: data.id,
        chaveFiscal: data.chaveFiscal,
        tipo: data.tipo,
        numero: data.numero,
        serie: data.serie,
        status: data.status,
        protocoloAutorizacao: data.protocoloAutorizacao,
        competencia: data.competencia,
        valorTotalCentavos: data.valorTotalCentavos,
        baseCalculoCentavos: data.baseCalculoCentavos,
        valorTributosCentavos: data.valorTributosCentavos,
        valorLiquidoCentavos: data.valorLiquidoCentavos,
        dataAutorizacao: new Date(),
        dataEmissao: new Date(),
        itens: data.itens.create,
        retencoes: [],
      }));

      const res = await service.emitirDocumentoFiscal(TENANT_ID, {
        chaveFiscal: 'CHAVE-NFSE-2026-0001',
        tipo: 'NFSE',
        prestadorCnpj: '12345678000195',
        tomadorCpfCnpj: '98765432000188',
        tomadorNome: 'Produtor XPTO LTDA',
        competencia: '2026-09',
        valorTotalCentavos: 10000,
        baseCalculoCentavos: 10000,
        origemTipo: 'SERVICO_DISK',
        origemReferenciaId: 'srv-001',
        itens: [
          {
            descricao: 'Taxa de intermediação de ingressos',
            valorCentavos: 10000,
            baseCalculoCentavos: 10000,
            aliquota: 5.0,
            tributoCodigo: 'ISS',
          },
        ],
      });

      expect(res.chaveFiscal).toBe('CHAVE-NFSE-2026-0001');
      expect(res.status).toBe('AUTORIZADO');
      expect(mockOutbox.emit).toHaveBeenCalledWith(
        mockPrisma,
        expect.objectContaining({
          eventName: FiscalEvents.DocumentoFiscalAutorizadoV1.name,
          source: 'fiscal',
        }),
      );
    });

    it('deve ser idempotente: retornar documento já existente se chaveFiscal já foi emitida', async () => {
      mockPrisma.documentoFiscal.findUnique.mockResolvedValue({
        id: 'doc-existente-id',
        chaveFiscal: 'CHAVE-NFSE-REPETIDA',
        status: 'AUTORIZADO',
        valorTotalCentavos: BigInt(10000),
        baseCalculoCentavos: BigInt(10000),
        valorTributosCentavos: BigInt(500),
        valorLiquidoCentavos: BigInt(9500),
        itens: [],
        retencoes: [],
      });

      const res = await service.emitirDocumentoFiscal(TENANT_ID, {
        chaveFiscal: 'CHAVE-NFSE-REPETIDA',
        tipo: 'NFSE',
        prestadorCnpj: '12345678000195',
        tomadorCpfCnpj: '98765432000188',
        tomadorNome: 'Produtor XPTO LTDA',
        competencia: '2026-09',
        valorTotalCentavos: 10000,
        baseCalculoCentavos: 10000,
        origemTipo: 'SERVICO_DISK',
        origemReferenciaId: 'srv-001',
        itens: [
          {
            descricao: 'Item',
            valorCentavos: 10000,
            baseCalculoCentavos: 10000,
            aliquota: 5.0,
            tributoCodigo: 'ISS',
          },
        ],
      });

      expect(res.id).toBe('doc-existente-id');
      expect(mockPrisma.documentoFiscal.create).not.toHaveBeenCalled();
    });

    it('deve cancelar documento fiscal e emitir outbox DocumentoFiscalCanceladoV1', async () => {
      mockPrisma.documentoFiscal.findUnique.mockResolvedValue({
        id: 'doc-cancelar-id',
        tenantId: TENANT_ID,
        chaveFiscal: 'CHAVE-CANCELAR',
        status: 'AUTORIZADO',
        tipo: 'NFSE',
        competencia: '2026-09',
        valorTotalCentavos: BigInt(50000),
      });

      mockPrisma.documentoFiscal.update.mockResolvedValue({
        id: 'doc-cancelar-id',
        status: 'CANCELADO',
        motivoCancelamento: 'Venda cancelada pelo comprador',
      });

      const cancelado = await service.cancelarDocumentoFiscal(TENANT_ID, {
        documentoId: '00000000-0000-0000-0000-000000000099',
        motivoCancelamento: 'Venda cancelada pelo comprador com estorno',
        canceladoPor: USER_ID,
      });

      expect(cancelado.status).toBe('CANCELADO');
      expect(mockOutbox.emit).toHaveBeenCalledWith(
        mockPrisma,
        expect.objectContaining({
          eventName: FiscalEvents.DocumentoFiscalCanceladoV1.name,
        }),
      );
    });
  });

  describe('4. Central de Apuração Tributária com Memória de Cálculo', () => {
    it('deve calcular apuração de tributo com base nos documentos autorizados e gerar memória de cálculo', async () => {
      mockPrisma.documentoFiscal.findMany.mockResolvedValue([
        {
          id: 'doc-1',
          chaveFiscal: 'CHAVE-1',
          baseCalculoCentavos: BigInt(100000),
          valorTotalCentavos: BigInt(100000),
          itens: [
            {
              tributoCodigo: 'ISS',
              aliquota: new Prisma.Decimal(5.0),
              baseCalculoCentavos: BigInt(100000),
              valorTributoCentavos: BigInt(5000),
            },
          ],
        },
        {
          id: 'doc-2',
          chaveFiscal: 'CHAVE-2',
          baseCalculoCentavos: BigInt(200000),
          valorTotalCentavos: BigInt(200000),
          itens: [
            {
              tributoCodigo: 'ISS',
              aliquota: new Prisma.Decimal(5.0),
              baseCalculoCentavos: BigInt(200000),
              valorTributoCentavos: BigInt(10000),
            },
          ],
        },
      ]);

      mockPrisma.retencaoTributaria.findMany.mockResolvedValue([]);
      mockPrisma.apuracaoTributaria.upsert.mockImplementation(({ create }: any) => ({
        ...create,
        updatedAt: new Date(),
      }));

      const apuracao = await service.apurarTributos(TENANT_ID, {
        competencia: '2026-09',
        tributoCodigo: 'ISS',
        fechadoPor: USER_ID,
      });

      // Total base: R$ 3.000 = 300000 cents
      expect(apuracao.baseCalculoCentavos).toBe(300000);
      // Total ISS: R$ 150 = 15000 cents
      expect(apuracao.valorApuradoCentavos).toBe(15000);
      expect(apuracao.memoriaCalculo).toBeDefined();
      expect(mockOutbox.emit).toHaveBeenCalledWith(
        mockPrisma,
        expect.objectContaining({
          eventName: FiscalEvents.ApuracaoTributariaConcluidaV1.name,
        }),
      );
    });
  });

  describe('5. Three-Way Match no Fiscal de Entrada', () => {
    it('deve aprovar Three-Way Match quando Documento Fiscal == Contrato == Pagamento', async () => {
      const match = await service.validarThreeWayMatch(TENANT_ID, {
        fornecedorCnpj: '11222333000144',
        fornecedorNome: 'Geradores Silva LTDA',
        documentoFiscalNumero: 'NF-1029',
        valorDocumentoFiscalCentavos: 500000, // R$ 5.000
        valorContratoCentavos: 500000,
        valorPagamentoCentavos: 500000,
        eventoId: '00000000-0000-0000-0000-000000000123',
      });

      expect(match.aprovado).toBe(true);
      expect(match.status).toBe('CORRESPONDENCIA_EXATA');
      expect(match.divergencias).toHaveLength(0);
      expect(match.alocacaoEventoId).toBe('00000000-0000-0000-0000-000000000123');
    });

    it('deve rejeitar e registrar divergência quando o Documento Fiscal for divergente do Contrato', async () => {
      mockPrisma.pendenciaFiscal.create.mockResolvedValue({ id: 'pend-01' });

      const match = await service.validarThreeWayMatch(TENANT_ID, {
        fornecedorCnpj: '11222333000144',
        fornecedorNome: 'Geradores Silva LTDA',
        documentoFiscalNumero: 'NF-1029',
        valorDocumentoFiscalCentavos: 550000, // R$ 5.500 (+ R$ 500)
        valorContratoCentavos: 500000,        // R$ 5.000
        valorPagamentoCentavos: 550000,
      });

      expect(match.aprovado).toBe(false);
      expect(match.status).toBe('DIVERGENCIA_VALOR');
      expect(match.divergencias?.length).toBeGreaterThan(0);
      expect(mockOutbox.emit).toHaveBeenCalledWith(
        mockPrisma,
        expect.objectContaining({
          eventName: FiscalEvents.DivergenciaFiscalDetectadaV1.name,
        }),
      );
    });
  });

  describe('6. Fechamento e Reabertura do Período Fiscal', () => {
    it('deve fechar período fiscal com checklist', async () => {
      mockPrisma.documentoFiscal.findMany.mockResolvedValue([
        { valorTotalCentavos: BigInt(100000) },
      ]);
      mockPrisma.fechamentoFiscal.upsert.mockImplementation(({ create }: any) => ({
        ...create,
        updatedAt: new Date(),
      }));

      const fechamento = await service.fecharPeriodoFiscal(TENANT_ID, {
        competencia: '2026-09',
        fechadoPor: USER_ID,
        checklist: {
          todasNfseEmitidas: true,
          apuracoesConcluidas: true,
          retencoesConferidas: true,
        },
      });

      expect(fechamento.status).toBe('FECHADO');
    });

    it('deve reabrir período fiscal com justificativa auditada', async () => {
      mockPrisma.fechamentoFiscal.findUnique.mockResolvedValue({
        id: 'fech-01',
        competencia: '2026-09',
        status: 'FECHADO',
      });
      mockPrisma.fechamentoFiscal.update.mockResolvedValue({
        id: 'fech-01',
        status: 'REABERTO',
        motivoReabertura: 'Retificação da apuração do ISS de Curitiba',
      });

      const reaberto = await service.reabrirPeriodoFiscal(TENANT_ID, {
        competencia: '2026-09',
        motivo: 'Retificação da apuração do ISS de Curitiba',
        reabertoPor: USER_ID,
      });

      expect(reaberto.status).toBe('REABERTO');
    });
  });

  describe('7. FiscalPublicService (Integração Cross-Module & Gate Fiscal)', () => {
    it('consultarDocumentoPorOrigem deve retornar o documento fiscal formatado em centavos', async () => {
      mockPrisma.documentoFiscal.findFirst.mockResolvedValue({
        id: 'doc-origem-id',
        chaveFiscal: 'CHAVE-SRV-999',
        tipo: 'NFSE',
        numero: '999',
        serie: '1',
        status: 'AUTORIZADO',
        competencia: '2026-09',
        valorTotalCentavos: BigInt(15000),
        baseCalculoCentavos: BigInt(15000),
        valorTributosCentavos: BigInt(750),
        dataAutorizacao: new Date(),
        dataCancelamento: null,
        urlPdfDanfe: 'https://storage/danfe-999.pdf',
      });

      const res = await publicService.consultarDocumentoPorOrigem(TENANT_ID, 'SERVICO_DISK', 'srv-999');

      expect(res).not.toBeNull();
      expect(res?.chaveFiscal).toBe('CHAVE-SRV-999');
      expect(res?.valorTotalCentavos).toBe(15000);
      expect(res?.valorTributosCentavos).toBe(750);
    });

    it('verificarSituacaoFiscalEvento deve aprovar quando todos os docs estão autorizados e sem pendências', async () => {
      mockPrisma.documentoFiscal.findMany.mockResolvedValue([
        { id: 'doc-evt-1', status: 'AUTORIZADO' },
        { id: 'doc-evt-2', status: 'AUTORIZADO' },
      ]);
      mockPrisma.pendenciaFiscal.count.mockResolvedValue(0);

      const situacao = await publicService.verificarSituacaoFiscalEvento(
        TENANT_ID,
        '00000000-0000-0000-0000-000000000050',
      );

      expect(situacao.aptoParaFechamento).toBe(true);
      expect(situacao.totalDocumentosEmitidos).toBe(2);
      expect(situacao.totalDocumentosAutorizados).toBe(2);
      expect(situacao.totalPendenciasFiscais).toBe(0);
    });

    it('verificarSituacaoFiscalEvento deve bloquear o fechamento do evento se houver pendências fiscais em aberto', async () => {
      mockPrisma.documentoFiscal.findMany.mockResolvedValue([
        { id: 'doc-evt-1', status: 'AUTORIZADO' },
      ]);
      mockPrisma.pendenciaFiscal.count.mockResolvedValue(2);

      const situacao = await publicService.verificarSituacaoFiscalEvento(
        TENANT_ID,
        '00000000-0000-0000-0000-000000000050',
      );

      expect(situacao.aptoParaFechamento).toBe(false);
      expect(situacao.motivoInaptidao).toContain('Existem 2 pendência(s) fiscal(is)');
    });
  });
});

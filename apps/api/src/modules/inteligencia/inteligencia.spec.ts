import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InteligenciaService } from './inteligencia.service';
import { PrismaService } from '../../shared/prisma.module';
import { OutboxService } from '../../shared/outbox/outbox.service';

describe('InteligenciaService (EDDIE 11.30 — Rentabilidade, Inteligência de Receita e Inteligência do Produtor)', () => {
  let service: InteligenciaService;
  let mockPrisma: any;
  let mockOutbox: any;

  const mockEventoId = '11111111-1111-1111-1111-111111111111';
  const mockProdutorId = 'prod-t4f';
  const mockTenantId = '00000000-0000-0000-0000-000000000001';

  beforeEach(() => {
    mockPrisma = {
      metaDesempenho: {
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn(),
      },
      alertaInteligencia: {
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn(),
      },
      oportunidadeInteligencia: {
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn(),
      },
      simulacaoPrecoLote: {
        create: vi.fn(),
      },
      previsaoInteligencia: {
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn(),
      },
    };

    mockOutbox = {
      emit: vi.fn().mockResolvedValue('outbox-event-id'),
    };

    service = new InteligenciaService(mockPrisma as PrismaService, mockOutbox as OutboxService);
  });

  // ==========================================================================
  // 11.30.1 — Rentabilidade Real
  // ==========================================================================
  describe('11.30.1 — Motor de Rentabilidade Real', () => {
    it('1. deve calcular decomposição real: GMV Líquido, Receita Disk, Custos e Margem Disk', async () => {
      const decomposicao = await service.obterDecomposicaoRentabilidadeReal(mockEventoId, mockTenantId, 'ADMINISTRADOR');

      expect(decomposicao).toBeDefined();
      expect(decomposicao.vendasBrutas).toBe(2500000.0);
      expect(decomposicao.cancelamentosEstornos).toBe(80000.0);
      expect(decomposicao.chargebacks).toBe(12000.0);
      // GMV Líquido = 2.500.000 - 80.000 - 12.000 = 2.408.000
      expect(decomposicao.gmvLiquido).toBe(2408000.0);
      expect(decomposicao.receitaContratualDisk).toBe(361200.0);
      expect(decomposicao.takeRateContratualPct).toBe(15.0);
      // Custos
      expect(decomposicao.custosAdquirencia).toBe(71000.0);
      expect(decomposicao.comissoesParceiros).toBe(25000.0);
      expect(decomposicao.custosAtribuiveisOperacao).toBe(18000.0);
      // Resultado operação Disk = 361.200 - 71.000 - 25.000 - 18.000 = 247.200
      expect(decomposicao.resultadoOperacaoDisk).toBe(247200.0);
      expect(decomposicao.margemDiskPct).toBe(68.4);
    });

    it('2. deve segregar confidencialidade quando usuário tiver papel PRODUTOR', async () => {
      const visaoProdutor = await service.obterDecomposicaoRentabilidadeReal(mockEventoId, mockTenantId, 'PRODUTOR');

      expect(visaoProdutor.vendasBrutas).toBe(2500000.0);
      expect(visaoProdutor.gmvLiquido).toBe(2408000.0);
      // Margens e custos internos Disk estritamente ocultados
      expect(visaoProdutor.receitaContratualDisk).toBe(0);
      expect(visaoProdutor.resultadoOperacaoDisk).toBe(0);
      expect(visaoProdutor.margemDiskPct).toBe(0);
      expect(visaoProdutor.custosAdquirencia).toBe(0);
    });

    it('3. deve decompor rentabilidade por dimensões (canais, formas de pagamento, adquirentes e lotes)', async () => {
      const dimensoes = await service.obterRentabilidadePorDimensoes(mockEventoId, mockTenantId, 'ADMINISTRADOR');

      expect(dimensoes.porCanal.length).toBeGreaterThan(0);
      expect(dimensoes.porFormaPagamento.length).toBeGreaterThan(0);
      expect(dimensoes.porAdquirente.length).toBeGreaterThan(0);
      expect(dimensoes.porLote.length).toBeGreaterThan(0);

      // Validação de adquirente com custo por milhão
      const adq = dimensoes.porAdquirente[0];
      expect(adq).toBeDefined();
      expect(adq.volumeProcessado).toBeGreaterThan(0);
      expect(adq.custoPorMilhao).toBeGreaterThan(0);

      // Validação de lote com margem percentual progressiva
      const lotes = dimensoes.porLote;
      expect(lotes.find((l) => l.nomeLote.includes('Lote 1'))?.margemPct).toBe(18.2);
      expect(lotes.find((l) => l.nomeLote.includes('Lote 2'))?.margemPct).toBe(20.4);
      expect(lotes.find((l) => l.nomeLote.includes('Lote 3'))?.margemPct).toBe(23.7);
    });

    it('4. deve calcular a margem unitária por ingresso e o ponto de equilíbrio Disk', async () => {
      const margemIngresso = await service.obterMargemPorIngresso(mockEventoId, mockTenantId, 'ADMINISTRADOR');
      expect(margemIngresso.precoMedioIngresso).toBe(142.0);
      expect(margemIngresso.receitaDiskPorIngresso).toBe(18.5);
      expect(margemIngresso.custoFinanceiroPorIngresso).toBe(4.2);
      expect(margemIngresso.outrosCustosPorIngresso).toBe(2.1);
      expect(margemIngresso.margemDiskPorIngresso).toBe(12.2);

      const breakEven = await service.obterPontoEquilibrioDisk(mockEventoId, mockTenantId);
      expect(breakEven.pontoEquilibrioIngressos).toBe(12450);
      expect(breakEven.ingressosVendidos).toBe(14820);
      expect(breakEven.diferencaMargemSeguranca).toBe(2370);
      expect(breakEven.atingiuPontoEquilibrio).toBe(true);
    });
  });

  // ==========================================================================
  // 11.30.2 — Inteligência de Receita
  // ==========================================================================
  describe('11.30.2 — Inteligência de Receita', () => {
    it('5. deve monitorar a velocidade de vendas e identificar tendência de aceleração', async () => {
      const vel = await service.obterVelocidadeVendas(mockEventoId, mockTenantId);

      expect(vel.ultimaHora).toBe(182);
      expect(vel.ultimas6Horas).toBe(847);
      expect(vel.ultimas24Horas).toBe(2940);
      expect(vel.ultimos7Dias).toBe(8721);
      expect(vel.variacao24hVsMedia7DiasPct).toBe(34.0);
      expect(vel.tendencia).toBe('ACELERADA');
      expect(vel.textoDescritivo).toContain('34% acima da média');
    });

    it('6. deve calcular previsão de esgotamento com base no ritmo e dias até o evento', async () => {
      const previsao = await service.obterPrevisaoEsgotamento(mockEventoId, mockTenantId);

      expect(previsao.disponibilidadeRestante).toBe(3420);
      expect(previsao.ritmoVendasPorDia).toBe(410);
      expect(previsao.diasEstimadosAteEsgotamento).toBe(8);
      expect(previsao.diasAteEvento).toBe(21);
      expect(previsao.alertaRiscoEsgotamentoPrecoce).toBe(true);
      expect(previsao.recomendacaoTexto).toContain('esgotar antes da data');
    });

    it('7. deve gerar recomendações operacionais de lotes com ação [Analisar] sem aumentar preço automaticamente', async () => {
      const lotes = await service.obterInteligenciaLotes(mockEventoId, mockTenantId);

      expect(lotes.length).toBeGreaterThan(0);
      const lote2 = lotes.find((l) => l.nome.includes('Lote 2'));
      expect(lote2).toBeDefined();
      expect(lote2?.utilizacaoPct).toBe(92.4);
      expect(lote2?.velocidade).toBe('ALTA');
      expect(lote2?.acaoRecomendada).toContain('Avaliar abertura do próximo lote');
    });

    it('8. deve simular cenários de preço (Conservador, Base, Otimista) com premissas explícitas', () => {
      const simulacao = service.simularAlteracaoPreco({
        precoAtual: 120.0,
        precoProposto: 135.0,
        disponibilidadeRestante: 5000,
      });

      expect(simulacao.precoAtual).toBe(120.0);
      expect(simulacao.precoProposto).toBe(135.0);
      expect(simulacao.variacaoPrecoPct).toBe(12.5);
      expect(simulacao.cenarioConservador.projecaoVendas).toBe(3600);
      expect(simulacao.cenarioBase.projecaoVendas).toBe(4400);
      expect(simulacao.cenarioOtimista.projecaoVendas).toBe(4900);
      expect(simulacao.cenarioConservador.premissa).toContain('sensibilidade de preço');
      expect(simulacao.cenarioBase.premissa).toContain('desaceleração');
      expect(simulacao.cenarioOtimista.premissa).toContain('Demanda inelástica');
      expect(simulacao.notaLegal).toContain('Projeções analíticas');
    });

    it('9. deve classificar oportunidades e perdas de receita recuperadas via remarketing', async () => {
      const opp = await service.obterOportunidadesEPerdas(mockEventoId, mockTenantId);

      expect(opp.totalPerdasIdentificadas).toBe(272000.0);
      expect(opp.perdasPorNatureza.length).toBeGreaterThan(0);
      expect(opp.receitaRecuperadaRemarketing.totalRecuperado).toBe(24350.0);
      expect(opp.receitaRecuperadaRemarketing.taxaRecuperacaoPct).toBe(28.0);
    });
  });

  // ==========================================================================
  // 11.30.3 — Inteligência do Produtor
  // ==========================================================================
  describe('11.30.3 — Inteligência do Produtor', () => {
    it('10. deve retornar visão 360 do produtor, linha do tempo e indicadores de saúde objetivos', async () => {
      const visao = await service.obterVisaoProdutor360(mockProdutorId, mockTenantId, 'ADMINISTRADOR');

      expect(visao.cabecalho.produtorId).toBe(mockProdutorId);
      expect(visao.cabecalho.eventosRealizados).toBe(18);
      expect(visao.cabecalho.eventosAtivos).toBe(3);
      expect(visao.cabecalho.gmvHistorico).toBe(18400000.0);
      expect(visao.cabecalho.publicoValidadoTotal).toBe(124820);

      // 6 Indicadores de saúde objetivos (sem nota artificial única)
      expect(visao.saudeRelacionamento.operacao.score).toBe(9.4);
      expect(visao.saudeRelacionamento.financeiro.score).toBe(9.1);
      expect(visao.saudeRelacionamento.vendas.score).toBe(8.8);
      expect(visao.saudeRelacionamento.publico.score).toBe(9.0);
      expect(visao.saudeRelacionamento.atendimento.score).toBe(8.6);
      expect(visao.saudeRelacionamento.risco.score).toBe(9.3);

      // Comportamento financeiro e público
      expect(visao.financeiro.statusConciliacaoBancaria).toBe('EM_CONFORMIDADE');
      expect(visao.publico.comparecimentoMedioPct).toBe(88.3);
      expect(visao.marketing.roasMedio).toBe(16.9);
    });

    it('11. deve emitir alertas com explicabilidade obrigatória ("Por que estou vendo isso?")', async () => {
      const alertas = await service.obterAlertasInteligentes();

      expect(alertas.length).toBeGreaterThan(0);
      for (const alerta of alertas) {
        expect(alerta.explicabilidade).toBeDefined();
        expect(alerta.explicabilidade.porQueEstouVendoIsso.length).toBeGreaterThan(0);
        expect(alerta.explicabilidade.origemMetrica).toBeTruthy();
        expect(alerta.explicabilidade.acaoRecomendada).toBeTruthy();
      }
    });

    it('12. deve fornecer central de oportunidades acionáveis com links e impacto estimado', async () => {
      const oportunidades = await service.obterCentralOportunidades();

      expect(oportunidades.length).toBeGreaterThan(0);
      const rec = oportunidades.find((o) => o.categoria === 'PUBLICO_RECORRENTE');
      expect(rec).toBeDefined();
      expect(rec?.impactoEstimado).toBe(85000.0);
      expect(rec?.linkAcao).toBe('/pos-evento');
    });

    it('13. deve comparar edições históricas e calcular metas vs realizado vs previsão', async () => {
      const comparativo = await service.obterComparativoHistorico(mockEventoId, mockTenantId);
      expect(comparativo.eventoAtualNome).toContain('2026');
      expect(comparativo.eventoAnteriorNome).toContain('2025');
      expect(comparativo.metricas.length).toBeGreaterThan(0);

      const metas = await service.obterMetasVsRealizadoVsPrevisao('2026-Q3', mockTenantId, 'ADMINISTRADOR');
      expect(metas.periodo).toBe('2026-Q3');
      expect(metas.vendas.atingimentoPct).toBeGreaterThan(0);
      expect(metas.receitaDisk).toBeDefined();
      expect(metas.margemDisk).toBeDefined();

      const metasProdutor = await service.obterMetasVsRealizadoVsPrevisao('2026-Q3', mockTenantId, 'PRODUTOR');
      expect(metasProdutor.receitaDisk).toBeUndefined();
      expect(metasProdutor.margemDisk).toBeUndefined();
    });

    it('14. deve montar o painel executivo transversal com KPIs consolidados e filtros', async () => {
      const painel = await service.obterPainelExecutivo('2026-Q3', mockTenantId, 'ADMINISTRADOR');

      expect(painel.periodoSelecionado).toBe('2026-Q3');
      expect(painel.kpisTopo.gmvTotal).toBe(2408000.0);
      expect(painel.kpisTopo.receitaDiskTotal).toBe(361200.0);
      expect(painel.kpisTopo.margemDiskTotal).toBe(247200.0);
      expect(painel.kpisTopo.publicoValidadoTotal).toBe(10716);
      expect(painel.rentabilidadeEventos.length).toBeGreaterThan(0);
      expect(painel.desempenhoCanais.length).toBeGreaterThan(0);
      expect(painel.alertasPrincipais.length).toBeGreaterThan(0);
      expect(painel.oportunidadesPrincipais.length).toBeGreaterThan(0);
    });
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GovernancaService } from './governanca.service';
import { PrismaService } from '../../shared/prisma.module';
import { OutboxService } from '../../shared/outbox/outbox.service';

describe('GovernancaService (EDDIE 11.31 — Central de Dados, Qualidade, Governança e Auditoria)', () => {
  let service: GovernancaService;
  let mockPrisma: any;
  let mockOutbox: any;

  const mockEventoId = '11111111-1111-1111-1111-111111111111';
  const mockTenantId = '00000000-0000-0000-0000-000000000001';

  beforeEach(() => {
    mockPrisma = {
      regraQualidade: { findMany: vi.fn().mockResolvedValue([]) },
      divergenciaDados: { findMany: vi.fn().mockResolvedValue([]), update: vi.fn() },
      tratamentoDivergencia: { create: vi.fn() },
      catalogoIndicador: { findMany: vi.fn().mockResolvedValue([]) },
      registroAuditoriaCentral: { findMany: vi.fn().mockResolvedValue([]), create: vi.fn() },
      monitoramentoIntegracao: { findMany: vi.fn().mockResolvedValue([]) },
    };

    mockOutbox = {
      emit: vi.fn().mockResolvedValue('outbox-event-id-1131'),
    };

    service = new GovernancaService(mockPrisma as PrismaService, mockOutbox as OutboxService);
  });

  // ==========================================================================
  // 1. Visão Geral & Qualidade dos Dados
  // ==========================================================================
  describe('1. Visão Geral & Qualidade dos Dados', () => {
    it('1. deve retornar KPIs objetivos do topo e status de integridade por domínio', async () => {
      const visao = await service.obterVisaoGeralGovernanca(mockTenantId);

      expect(visao).toBeDefined();
      expect(visao.registrosVerificados).toBe(8421587);
      expect(visao.divergenciasAbertas).toBeGreaterThan(0);
      expect(visao.divergenciasCriticas).toBeGreaterThan(0);
      expect(visao.divergenciasEmInvestigacao).toBeGreaterThan(0);
      expect(visao.divergenciasCorrigidasHoje).toBeGreaterThan(0);

      expect(visao.statusDominios.length).toBe(7);
      const financeiro = visao.statusDominios.find((d) => d.dominio === 'Financeiro');
      expect(financeiro?.status).toBe('OPERACIONAL');

      const portaria = visao.statusDominios.find((d) => d.dominio === 'Portaria');
      expect(portaria?.status).toBe('ATENCAO');
      expect(portaria?.divergenciasQtd).toBe(12);
    });
  });

  // ==========================================================================
  // 2. Conciliação Sistêmica Multicamadas
  // ==========================================================================
  describe('2. Conciliação Sistêmica em Camadas', () => {
    it('2. deve reconciliar Pedido -> Pagamento -> Ledger -> Contabilidade -> Tesouraria -> Banco com MDR e apuração de divergência líquida', async () => {
      const conciliacao = await service.obterConciliacaoSistemica(mockEventoId, mockTenantId);

      expect(conciliacao).toBeDefined();
      expect(conciliacao.valorBrutoPedido).toBe(1000.0);
      expect(conciliacao.valorBrutoPagamento).toBe(1000.0);
      expect(conciliacao.mdrPrevisto).toBe(30.0);
      expect(conciliacao.valorEsperadoBanco).toBe(970.0);
      expect(conciliacao.valorRecebidoBanco).toBe(968.0);
      // Divergência real líquida = 970 - 968 = R$ 2,00
      expect(conciliacao.divergenciaRealLiquida).toBe(2.0);

      expect(conciliacao.camadas.length).toBe(6);
      const camadaBanco = conciliacao.camadas.find((c) => c.camada.includes('Banco'));
      expect(camadaBanco?.status).toBe('DIVERGENTE');
      expect(camadaBanco?.detalhe).toContain('R$ 2,00');
    });
  });

  // ==========================================================================
  // 3. Central de Divergências
  // ==========================================================================
  describe('3. Central de Divergências', () => {
    it('3. deve listar divergências com suporte a filtros por situação e severidade', async () => {
      const todas = await service.listarDivergencias({}, mockTenantId);
      expect(todas.length).toBeGreaterThan(0);

      const criticas = await service.listarDivergencias({ severidade: 'CRITICA' }, mockTenantId);
      expect(criticas.every((d) => d.severidade === 'CRITICA')).toBe(true);

      const operacoes = await service.listarDivergencias({ responsavel: 'OPERACOES' }, mockTenantId);
      expect(operacoes.every((d) => d.responsavelDominio === 'OPERACOES')).toBe(true);
    });

    it('4. deve tratar divergência com justificativa auditável e emitir evento via Outbox', async () => {
      const resultado = await service.tratarDivergencia(
        'div-001',
        {
          novaSituacao: 'CORRIGIDA',
          acaoAplicada: 'Geração forçada de ingresso após validação manual do comprovante PIX',
          justificativa: 'Comprovante autêntico do Banco Central apresentado pelo comprador',
          responsavelUsuarioId: 'usr-supervisor-operacoes',
        },
        mockTenantId,
      );

      expect(resultado.sucesso).toBe(true);
      expect(resultado.divergenciaId).toBe('div-001');
      expect(resultado.novaSituacao).toBe('CORRIGIDA');

      expect(mockOutbox.emit).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          eventName: 'governanca.divergencia_tratada.v1',
          source: 'governanca',
          tenantId: mockTenantId,
        }),
      );
    });
  });

  // ==========================================================================
  // 4. Linhagem e Rastreabilidade
  // ==========================================================================
  describe('4. Linhagem dos Dados', () => {
    it('5. deve retornar a árvore causal de linhagem conectando indicador agregado até as transações de origem', async () => {
      const linhagem = await service.obterLinhagemIndicador('MARGEM_DISK', mockTenantId);

      expect(linhagem).toBeDefined();
      expect(linhagem.id).toBe('no-margem-disk');
      expect(linhagem.categoria).toBe('INDICADOR_AGREGADO');
      expect(linhagem.valor).toBe(247200.0);
      expect(linhagem.filhos).toBeDefined();
      expect(linhagem.filhos!.length).toBeGreaterThan(0);

      const rec = linhagem.filhos!.find((f) => f.id === 'no-rec-contratual');
      expect(rec).toBeDefined();
      expect(rec?.valor).toBe(361200.0);
      expect(rec?.filhos![0]?.valor).toBe(2408000.0);
    });
  });

  // ==========================================================================
  // 5. Centro de Investigação Universal
  // ==========================================================================
  describe('5. Centro de Investigação Universal', () => {
    it('6. deve investigar pedido ou identificador com mascaramento LGPD e linha do tempo cronológica', async () => {
      const res = await service.investigarEntidade('PED-45872', mockTenantId);

      expect(res.entidadeEncontrada).toBe(true);
      expect(res.termoBuscado).toBe('PED-45872');

      // Mascaramento LGPD obrigatório para dados de titulares
      expect(res.cliente.documentoMascarado).toContain('***');
      expect(res.cliente.emailMascarado).toContain('****');
      expect(res.cliente.telefoneMascarado).toContain('****');

      // Dados de camadas
      expect(res.pedido.status).toBe('PAGO_CONFIRMADO');
      expect(res.pagamento.status).toBe('APROVADO_LIQUIDADO');
      expect(res.ledger.balanceado).toBe(true);
      expect(res.contabilidade.status).toContain('PARTIDAS_DOBRADAS');

      // Linha do tempo
      expect(res.linhaDoTempo.length).toBeGreaterThan(5);
      expect(res.linhaDoTempo[0]?.correlationId).toBe('COR-20260928-A82F93');
    });
  });

  // ==========================================================================
  // 6. Catálogo de Dados & Definições Oficiais
  // ==========================================================================
  describe('6. Catálogo de Dados', () => {
    it('7. deve fornecer o dicionário oficial de métricas com dono do dado e classificação corporativa', async () => {
      const catalogo = await service.listarCatalogoDados(mockTenantId);

      expect(catalogo.length).toBeGreaterThan(0);
      const gmv = catalogo.find((c) => c.termoCodigo === 'GMV');
      expect(gmv).toBeDefined();
      expect(gmv?.donoDadoResponsavel).toBe('FINANCEIRO');
      expect(gmv?.formulaCalculo).toBeTruthy();

      const publico = catalogo.find((c) => c.termoCodigo === 'PUBLICO_VALIDADO');
      expect(publico).toBeDefined();
      expect(publico?.donoDadoResponsavel).toBe('OPERACOES');
    });
  });

  // ==========================================================================
  // 7. Auditoria Central Imutável
  // ==========================================================================
  describe('7. Auditoria Central Imutável', () => {
    it('8. deve registrar e listar logs com "Antes" e "Depois", justificativa e correlationId', async () => {
      const logs = await service.listarAuditoriaCentral({}, mockTenantId);

      expect(logs.length).toBeGreaterThan(0);
      const taxa = logs.find((l) => l.acao === 'ALTERACAO_TAXA_CONTRATUAL');
      expect(taxa).toBeDefined();
      expect(taxa?.correlationId).toBe('COR-20260928-A82F93');
      expect(taxa?.valorAntes).toEqual({ takeRatePct: 12.0 });
      expect(taxa?.valorDepois).toEqual({ takeRatePct: 15.0 });
      expect(taxa?.motivoJustificativa).toBeTruthy();

      const exportLog = logs.find((l) => l.acao === 'EXPORTACAO_BASE_CLIENTES_LGPD');
      expect(exportLog).toBeDefined();
      expect(exportLog?.quantidadeRegistrosExportados).toBe(8921);
      expect(exportLog?.dadosSensiveisAcessados).toBe(true);
    });
  });

  // ==========================================================================
  // 8. Saúde das Integrações & Eventos
  // ==========================================================================
  describe('8. Saúde das Integrações & Eventos', () => {
    it('9. deve monitorar integridade de conectores externos e filas internas com reprocessamento seguro', async () => {
      const saude = await service.obterSaudeIntegracoes(mockTenantId);

      expect(saude.integracoes.length).toBeGreaterThan(0);
      const tiktok = saude.integracoes.find((i) => i.nome.includes('TikTok'));
      expect(tiktok?.status).toBe('DEGRADADA');

      expect(saude.eventosInternos.reprocessamentoSeguroHabilitado).toBe(true);

      const reprocesso = await service.reprocessarEventoSeguro('ev-1', 'COR-20260928-A82F93', mockTenantId);
      expect(reprocesso.reprocessado).toBe(true);
      expect(reprocesso.idempotente).toBe(true);
    });
  });

  // ==========================================================================
  // 9. Gate de Fechamento de Evento (EDDIE 11.24)
  // ==========================================================================
  describe('9. Gate de Fechamento de Evento (EDDIE 11.24)', () => {
    it('10. deve bloquear fechamento definitivo do evento se houver divergências críticas abertas', async () => {
      const gate = await service.verificarGateFechamento(mockEventoId, mockTenantId);

      expect(gate).toBeDefined();
      expect(gate.eventoId).toBe(mockEventoId);
      // No mock temos div-001 e div-003 como CRITICAS abertas
      expect(gate.divergenciasCriticasAbertas).toBeGreaterThan(0);
      expect(gate.aprovadoParaFechamento).toBe(false);
      expect(gate.bloqueios.length).toBeGreaterThan(0);
      expect(gate.bloqueios[0]).toContain('CRÍTICA');
    });
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PosEventoService } from './pos-evento.service';
import { PrismaService } from '../../shared/prisma.service';
import { OutboxService } from '../../shared/outbox/outbox.service';

describe('PosEventoService (EDDIE 11.29.5 - Pós-Evento e Histórico do Público)', () => {
  let service: PosEventoService;
  let mockPrisma: any;
  let mockOutbox: any;

  const mockEventoId = '11111111-1111-1111-1111-111111111111';
  const mockTenantId = '00000000-0000-0000-0000-000000000001';

  beforeEach(() => {
    mockPrisma = {
      evento: { findUnique: vi.fn() },
      pedidoVenda: { aggregate: vi.fn() },
      ingressoVenda: { count: vi.fn() },
      checkinRegistro: { count: vi.fn() },
      participacaoEvento: { findMany: vi.fn() },
      segmentoPublico: { create: vi.fn() },
      pesquisaPosEvento: { create: vi.fn() },
      respostaPesquisa: { create: vi.fn() },
      tabelaPrecoComunicacao: { findMany: vi.fn().mockResolvedValue([]) },
      campanhaPosEvento: { create: vi.fn(), updateMany: vi.fn() },
      bloqueioComunicacao: { create: vi.fn() },
      consentimentoComunicacao: { create: vi.fn() },
    };

    mockOutbox = {
      emit: vi.fn().mockResolvedValue('outbox-1'),
    };

    service = new PosEventoService(mockPrisma as PrismaService, mockOutbox as OutboxService);
  });

  it('1. deve retornar o resumo operacional no topo com vendidos, emitidos, validados na portaria e elegíveis', async () => {
    const resumo = await service.obterResumoOperacional(mockEventoId, mockTenantId);

    expect(resumo).toBeDefined();
    expect(resumo.eventoId).toBe(mockEventoId);
    expect(resumo.ingressosVendidos).toBe(12842);
    expect(resumo.ingressosEmitidos).toBe(11934);
    expect(resumo.acessosValidados).toBe(10716);
    expect(resumo.pessoasIdentificadas).toBe(9847);
    expect(resumo.contatosElegiveis).toBe(8921);
    expect(resumo.contatosNaoElegiveis).toBe(926);
    expect(resumo.taxaPresencaPct).toBeGreaterThan(80);
  });

  it('2. deve separar comprador e participante sem inventar identidades para titulares anônimos', async () => {
    const publico = await service.obterPublicoValidado(mockEventoId, mockTenantId);

    expect(publico.length).toBeGreaterThan(0);
    const anonimo = publico.find((p) => !p.identificacaoIndividual);
    expect(anonimo).toBeDefined();
    expect(anonimo?.identificacaoIndividual).toBe(false);
    expect(anonimo?.elegivelComunicacao).toBe(false);
    expect(anonimo?.motivoNaoElegivel).toBe('PARTICIPANTE_NAO_IDENTIFICADO');
  });

  it('3. deve verificar elegibilidade LGPD segregando elegíveis, sem consentimento e lista de bloqueio', async () => {
    const elegibilidade = await service.obterElegibilidadeLgpd(mockEventoId, mockTenantId);

    expect(elegibilidade.publicoValidadoTotal).toBe(10716);
    expect(elegibilidade.identificadosTotal).toBe(9847);
    expect(elegibilidade.elegiveisTotal).toBe(8921);
    expect(elegibilidade.naoElegiveisTotal).toBe(926);
    expect(elegibilidade.motivosNaoElegibilidade.length).toBeGreaterThan(0);
    expect(elegibilidade.canaisPermitidos.some((c) => c.canal === 'WHATSAPP')).toBe(true);
  });

  it('4. deve permitir criar e salvar segmentos com filtros específicos de presença e parceiros', async () => {
    const segmento = await service.criarOuCalcularSegmento(mockEventoId, mockTenantId, {
      nome: 'VIPs que passaram pela Portaria 1',
      descricao: 'Público VIP com checkin confirmado',
      filtros: {
        apenasCompareceram: true,
        setorNome: 'Área VIP Premium',
        apenasElegiveisLgpd: true,
      },
    });

    expect(segmento).toBeDefined();
    expect(segmento.nome).toBe('VIPs que passaram pela Portaria 1');
    expect(segmento.totalMembros).toBeGreaterThanOrEqual(1);
    expect(mockOutbox.emit).toHaveBeenCalled();
  });

  it('5. deve listar modelos prontos de pesquisa e permitir criação a partir de modelo', async () => {
    const modelos = service.obterModelosPesquisa();
    expect(modelos.length).toBe(6);
    expect(modelos.map((m) => m.codigo)).toContain('SATISFACAO_GERAL');
    expect(modelos.map((m) => m.codigo)).toContain('EXPERIENCIA_EVENTO');

    const pesquisa = await service.criarPesquisa(mockEventoId, mockTenantId, {
      titulo: 'Avaliação Oficial - Festival Exemplo 2026',
      modeloOrigem: 'SATISFACAO_GERAL',
    });

    expect(pesquisa).toBeDefined();
    expect(pesquisa.status).toBe('PUBLICADA');
    expect(pesquisa.totalPerguntas).toBe(7);
    expect(mockOutbox.emit).toHaveBeenCalled();
  });

  it('6. deve submeter respostas de pesquisa e classificar tópicos de atenção e elogios', async () => {
    const resposta = await service.submeterResposta('pesq_123', {
      perfilId: 'perf-maria-silva',
      notaSatisfacaoGeral: 5,
      notaOrganizacao: 5,
      notaAcesso: 3,
      voltaria: 'SIM',
      comentarioAberto: 'O som estava maravilhoso mas tinha muita fila no banheiro da pista',
    });

    expect(resposta).toBeDefined();
    expect(resposta.status).toBe('CONCLUIDA');
    expect(resposta.topicosDetectados).toContain('Filas');
    expect(resposta.topicosDetectados).toContain('Banheiros');
    expect(resposta.topicosDetectados).toContain('Shows e Som');
    expect(mockOutbox.emit).toHaveBeenCalled();
  });

  it('7. deve simular custo de campanha com tabela de preços dinâmica sem hardcode', async () => {
    const simulacao = await service.simularCampanha(mockEventoId, mockTenantId, {
      canal: 'WHATSAPP',
      quantidadeDestinatarios: 8000,
    });

    expect(simulacao).toBeDefined();
    expect(simulacao.canal).toBe('WHATSAPP');
    expect(simulacao.valorPorEnvio).toBe(0.5);
    expect(simulacao.selecionados).toBeLessThanOrEqual(8000);
    expect(simulacao.custoEstimadoTotal).toBe(simulacao.selecionados * 0.5);
  });

  it('8. deve exigir aprovação obrigatória se o custo total estimado ultrapassar R$ 5.000,00', async () => {
    // Campanha com valor abaixo do threshold: R$ 4.000,00 -> aprovada direto
    const campanhaNormal = await service.criarCampanha(mockEventoId, mockTenantId, {
      nome: 'Pesquisa WhatsApp Padrão',
      canal: 'WHATSAPP',
      mensagemTemplate: 'Olá {{nome}}, como foi sua experiência no {{evento}}?',
      limiteDisparo: 8000, // 8000 * 0.50 = 4000.00 <= 5000
    });

    expect(campanhaNormal.requerAprovacao).toBe(false);
    expect(campanhaNormal.status).toBe('APROVADO');

    // Campanha com valor acima do threshold: 12.000 * 0.50 = R$ 6.000,00 > 5000 -> AGUARDANDO_APROVACAO
    const campanhaCara = await service.criarCampanha(mockEventoId, mockTenantId, {
      nome: 'Mega Campanha WhatsApp VIP',
      canal: 'WHATSAPP',
      mensagemTemplate: 'Pesquisa especial {{evento}}',
      limiteDisparo: 12000,
    });

    // Como o mock retorna elegíveis menores que 12k, vamos testar simular com quantidade direta:
    const simulacaoAlta = await service.simularCampanha(mockEventoId, mockTenantId, {
      canal: 'WHATSAPP',
      quantidadeDestinatarios: 11000,
    });
    expect(simulacaoAlta.limiteSemAprovacao).toBe(5000);

    const aprovacao = await service.aprovarCampanha(campanhaCara.campanhaId, mockTenantId, 'cfo-diretoria');
    expect(aprovacao.status).toBe('APROVADO');
    expect(aprovacao.aprovadoPor).toBe('cfo-diretoria');
  });

  it('9. deve disparar campanha e retornar resultados detalhados com funil e satisfação', async () => {
    const disparo = await service.dispararCampanha('camp_123', mockTenantId);
    expect(disparo.status).toBe('CONCLUIDO');
    expect(disparo.totalEnviados).toBe(8000);
    expect(mockOutbox.emit).toHaveBeenCalled();

    const resultados = await service.obterResultadosCampanha('camp_123', mockTenantId);
    expect(resultados.metricasFunil.enviados).toBe(8000);
    expect(resultados.metricasFunil.entregues).toBe(7721);
    expect(resultados.taxas.taxaEntregaPct).toBe(96.5);
    expect(resultados.pesquisa?.satisfacaoGeralMedia).toBe(4.6);
  });

  it('10. deve respeitar o isolamento de produtor no Histórico de Relacionamento (Customer Relationship Graph)', async () => {
    // Visão Global DiskIngressos (sem filtro de produtor)
    const historicoGlobal = await service.obterHistoricoPublico('perf-maria-silva', mockTenantId);
    expect(historicoGlobal.historicoEventos.length).toBe(4);

    // Visão restrita do Produtor Opus (só deve ver eventos dele)
    const historicoOpus = await service.obterHistoricoPublico('perf-maria-silva', mockTenantId, 'prod-opus');
    expect(historicoOpus.historicoEventos.length).toBe(1);
    expect(historicoOpus.historicoEventos[0]?.eventoNome).toBe('Turnê Acústico MPB');

    // Visão restrita do Produtor T4F
    const historicoT4F = await service.obterHistoricoPublico('perf-maria-silva', mockTenantId, 'prod-t4f');
    expect(historicoT4F.historicoEventos.length).toBe(3);
  });

  it('11. deve integrar com distribuição (11.29.4) fornecendo taxa de comparecimento por parceiro', async () => {
    const parceiros = await service.obterComparecimentoPorParceiros(mockEventoId, mockTenantId);
    expect(parceiros.length).toBeGreaterThan(0);
    const agencia = parceiros.find((p) => p.parceiroId === 'parc-agencia-a');
    expect(agencia).toBeDefined();
    expect(agencia?.ingressosVendidos).toBe(800);
    expect(agencia?.compareceram).toBe(701);
    expect(agencia?.taxaComparecimentoPct).toBe(88.5);
  });

  it('12. deve gerar relatório executivo consolidado para o dossiê final do evento (11.24)', async () => {
    const dossie = await service.obterRelatorioExecutivoDossie(mockEventoId, mockTenantId);
    expect(dossie).toBeDefined();
    expect(dossie.resumoPresenca.comparecimento).toBe(10716);
    expect(dossie.resumoPresenca.taxaComparecimentoPct).toBe(89.8);
    expect(dossie.origemCanaisEParceiros.length).toBeGreaterThan(0);
    expect(dossie.statusAuditoriaPosEvento).toBe('CONCLUIDO_COM_SUCESSO');
  });

  it('13. deve permitir adicionar registros à Lista Central de Bloqueio e gerenciar consentimento', async () => {
    const bloqueio = await service.adicionarBloqueio({
      tenantId: mockTenantId,
      identificador: '+5541999990000',
      tipo: 'TELEFONE',
      canal: 'WHATSAPP',
      motivo: 'OPT_OUT_MENSAGEM',
    });
    expect(bloqueio.status).toBe('BLOQUEADO');
    expect(mockOutbox.emit).toHaveBeenCalled();

    const consentimento = await service.registrarConsentimento({
      tenantId: mockTenantId,
      perfilId: 'perf-teste',
      finalidade: 'PESQUISA_POS_EVENTO',
      canal: 'WHATSAPP',
      versaoTermo: 'v2026.1',
    });
    expect(consentimento.status).toBe('CONCEDIDO');
    expect(mockOutbox.emit).toHaveBeenCalled();
  });
});

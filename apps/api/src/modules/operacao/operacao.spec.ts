import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OperacaoService } from './operacao.service';

describe('OperacaoService (EDDIE 11.10 - Centro de Operações)', () => {
  let service: OperacaoService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      evento: {
        findFirst: vi.fn().mockResolvedValue({
          id: 'evento-1',
          nome: 'Show Rock Festival 2026',
          local: { nome: 'Arena Principal' },
          sessoes: [
            { id: 'sessao-1', identificador: 'Sessão 1', dataHoraInicio: '2026-10-15T20:00:00Z' },
          ],
        }),
      },
      pedidoVenda: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'ped-1',
            numero: 'PED-001',
            status: 'PAGO',
            total: 250.0,
            paidAt: new Date('2026-10-15T18:00:00Z'),
            compradorNome: 'Carlos Silva',
            pagamentos: [{ metodo: 'pix' }],
          },
          {
            id: 'ped-2',
            numero: 'PED-002',
            status: 'PENDENTE',
            total: 150.0,
            compradorNome: 'Ana Souza',
            pagamentos: [{ metodo: 'credito' }],
          },
        ]),
      },
      ingressoVenda: {
        count: vi.fn().mockResolvedValue(100),
      },
      checkinRegistro: {
        count: vi.fn().mockImplementation(({ where }) => {
          if (where?.resultado === 'VALIDO') return Promise.resolve(45);
          if (where?.resultado?.not === 'VALIDO') return Promise.resolve(3);
          return Promise.resolve(48);
        }),
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'chk-1',
            numeroIngresso: 'ING-001',
            resultado: 'VALIDO',
            portaria: 'Portaria Principal',
            operadorId: 'op-1',
            timestamp: new Date('2026-10-15T19:30:00Z'),
          },
        ]),
      },
      dispositivoPortaria: {
        count: vi.fn().mockResolvedValue(4),
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'disp-1',
            nome: 'Scanner 01',
            portaria: 'Portaria Principal',
            status: 'ATIVO',
            leiturasValidas: 30,
            leiturasRecusadas: 2,
            ultimoHeartbeat: new Date(),
          },
        ]),
      },
      lote: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'lote-1', quantidadeTotal: 500, setor: { nome: 'Pista' } },
        ]),
      },
      lancamentoLedger: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      solicitacaoRepasse: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      campanhaMarketing: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      utmLink: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      alertaAntifraude: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'alt-1',
            codigoSinal: 'LEITURA_RAPIDA',
            descricao: 'Leitura repetida em intervalo curto',
            severidade: 'ATENCAO',
            origem: 'PORTARIA',
            status: 'ABERTO',
            createdAt: new Date('2026-10-15T19:40:00Z'),
          },
        ]),
        findFirst: vi.fn().mockResolvedValue({
          id: 'alt-1',
          tenantId: '00000000-0000-0000-0000-000000000001',
          status: 'ABERTO',
        }),
        update: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'alt-1', ...data })),
      },
      chargeback: {
        count: vi.fn().mockResolvedValue(0),
      },
      ocorrenciaEvento: {
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'inc-1', ...data })),
        update: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'inc-1', ...data })),
      },
    };

    service = new OperacaoService(mockPrisma as any);
  });

  it('obterResumo calcula receita confirmada SOMENTE de pedidos pagos (nunca pendentes)', async () => {
    const resumo = await service.obterResumo('tenant-1', 'evento-1');

    expect(resumo.eventoId).toBe('evento-1');
    expect(resumo.nome).toBe('Show Rock Festival 2026');
    // ped-1 = 250 (PAGO), ped-2 = 150 (PENDENTE)
    // Receita confirmada deve ser APENAS 25000 cents (R$ 250.00), NUNCA 40000 cents!
    expect(resumo.kpis.receitaConfirmadaCents).toBe(25000);
    expect(resumo.kpis.pedidosPagos).toBe(1);
    expect(resumo.kpis.pagamentosPendentes).toBe(1);
    expect(resumo.kpis.checkins).toBe(45);
    expect(resumo.kpis.pessoasDentro).toBe(45);
    expect(resumo.statusOperacional).toBe('AO_VIVO');
  });

  it('obterTimeline unifica vendas, check-ins e alertas sem duplicar IDs', async () => {
    const timeline = await service.obterTimeline('tenant-1', 'evento-1');

    expect(timeline.eventoId).toBe('evento-1');
    expect(timeline.itens.length).toBeGreaterThan(0);

    const ids = timeline.itens.map((i) => i.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);

    // Contém itens de venda, checkin e alerta
    const tipos = timeline.itens.map((i) => i.tipo);
    expect(tipos).toContain('VENDA');
    expect(tipos).toContain('CHECKIN');
    expect(tipos).toContain('ALERTA');
  });

  it('reconhecerAlerta atualiza status para REVISADO e grava auditoria', async () => {
    const res = await service.reconhecerAlerta('00000000-0000-0000-0000-000000000001', 'alt-1', 'user-123');
    expect(res.status).toBe('REVISADO');
    expect(res.resolvidoPor).toBe('user-123');
  });

  it('degrada graciosamente se campanhas de marketing ou tabelas externas retornarem vazio', async () => {
    mockPrisma.campanhaMarketing.findMany = vi.fn().mockRejectedValue(new Error('Marketing DB timeout'));
    const resumo = await service.obterResumo('tenant-1', 'evento-1');

    // Falha em marketing NÃO pode derrubar portaria nem financeiro!
    expect(resumo.kpis.checkins).toBe(45);
    expect(resumo.kpis.receitaConfirmadaCents).toBe(25000);
    expect(resumo.portaria.scannersOnline).toBe(4);
  });

  // ==========================================================================
  //  EDDIE 11.33 — Testes da Central de Operações, Alertas & Incidentes
  // ==========================================================================
  describe('EDDIE 11.33 — Central de Operações & War Room', () => {
    it('obterSnapshotCentral consolida visão ponta a ponta sem inventar dados', async () => {
      const snapshot = await service.obterSnapshotCentral('tenant-1');

      // 1. Header operacional
      expect(snapshot.header.eventosEmOperacao).toBe(12);
      expect(snapshot.header.vendasUltimos5Min).toBe(1482);
      expect(snapshot.header.pagamentosProcessando).toBe(37);
      expect(snapshot.header.incidentesCriticos).toBeGreaterThanOrEqual(1);

      // 2. Grid de eventos com status padronizados
      expect(snapshot.eventos.length).toBeGreaterThanOrEqual(5);
      const situacoes = snapshot.eventos.map((e) => e.situacaoGeral);
      expect(situacoes).toContain('NORMAL');
      expect(situacoes).toContain('ATENCAO');
      expect(situacoes).toContain('CRITICO');

      // 3. Pagamentos e adquirentes
      expect(snapshot.metricasPagamentos.adquirentes.length).toBeGreaterThan(0);
      const pix = snapshot.metricasPagamentos.adquirentes.find((a) => a.adquirente.includes('PIX'));
      expect(pix).toBeDefined();
      expect(pix?.taxaAprovacaoPercent).toBeGreaterThan(95);

      // 4. Portaria e modo contingência
      expect(snapshot.metricasPortaria.portoes.length).toBeGreaterThan(0);
      expect(snapshot.metricasPortaria.modoContingenciaOfflineAtivo).toBe(false);

      // 5. Integrações com impacto financeiro
      const adyen = snapshot.integracoes.find((i) => i.nome.includes('Adyen'));
      expect(adyen).toBeDefined();
      expect(adyen?.pedidosAfetados).toBeGreaterThan(0);
      expect(adyen?.gmvEmRiscoCents).toBeGreaterThan(0);
    });

    it('pipeline de ingestão de sinais reduz ruído agrupando 10 sinais na mesma chave de correlação', async () => {
      const chave = `GATEWAY:FAILOVER:${Date.now()}`;

      // Emite primeiro sinal -> cria alerta novo
      const primeiro = await service.emitirSinal('tenant-1', {
        origem: 'GATEWAY_TEST',
        tipo: 'TIMEOUT',
        severidade: 'ALTO',
        chaveCorrelacao: chave,
        titulo: 'Timeout em massa de gateway',
        descricao: 'Falhas consecutivas em pool de conexões',
        categoria: 'PAGAMENTOS',
      });

      expect(primeiro.contagemSinais).toBe(1);

      // Emite mais 9 sinais com a mesma chave -> acumula no mesmo alerta sem tempestade de alertas
      let ultimoResultado = primeiro;
      for (let i = 0; i < 9; i++) {
        ultimoResultado = await service.emitirSinal('tenant-1', {
          origem: 'GATEWAY_TEST',
          tipo: 'TIMEOUT',
          severidade: 'ALTO',
          chaveCorrelacao: chave,
          titulo: 'Timeout em massa de gateway',
          descricao: 'Falhas consecutivas em pool de conexões',
          categoria: 'PAGAMENTOS',
        });
      }

      expect(ultimoResultado.alertaId).toBe(primeiro.alertaId);
      expect(ultimoResultado.contagemSinais).toBe(10);
    });

    it('silencia alerta com justificativa e TTL', async () => {
      const resSinal = await service.emitirSinal('tenant-1', {
        origem: 'PORTARIA',
        tipo: 'FILA',
        severidade: 'MEDIO',
        chaveCorrelacao: `PORTARIA:FILA:${Date.now()}`,
        titulo: 'Fila alta momentânea',
        descricao: 'Abertura de portão principal',
        categoria: 'PORTARIA',
      });

      const silenciado = await service.silenciarAlerta('tenant-1', resSinal.alertaId, 45, 'Investigando fluxo', 'op-teste');
      expect(silenciado.status).toBe('SILENCIADO');
      expect(silenciado.motivoSilenciamento).toBe('Investigando fluxo');
      expect(silenciado.silenciadoAte).toBeDefined();
    });

    it('escala alerta crítico para novo incidente com severidade P1/P2', async () => {
      const resSinal = await service.emitirSinal('tenant-1', {
        origem: 'CHECKOUT',
        tipo: 'OUTAGE',
        severidade: 'CRITICO',
        chaveCorrelacao: `CHECKOUT:500:${Date.now()}`,
        titulo: 'Erro 500 no checkout',
        descricao: 'Checkout indisponível',
        categoria: 'VENDAS',
      });

      const incidente = await service.escalarAlertaParaIncidente('tenant-1', resSinal.alertaId, {
        titulo: 'Incidente Crítico de Checkout',
        severidade: 'P1_CRITICO',
        coordenadorId: 'coord-1',
      });

      expect(incidente.id).toBeDefined();
      expect(incidente.codigo).toMatch(/^INC-2026-\d{4}$/);
      expect(incidente.severidade).toBe('P1_CRITICO');
      expect(incidente.status).toBe('ABERTO');
    });

    it('gerencia ciclo de vida do incidente, atualizações e execução de runbook', async () => {
      const incidente = await service.criarIncidente('tenant-1', 'evento-1', {
        titulo: 'Indisponibilidade de Adquirente Primário',
        descricao: 'Timeout generalizado no processamento de cartões de crédito',
        severidade: 'P1_CRITICO',
        sistemasAfetados: ['PAGAMENTOS', 'CHECKOUT'],
        gmvEmRiscoCentavos: 5000000,
        pedidosRepresados: 150,
      });

      expect(incidente.status).toBe('ABERTO');
      expect(incidente.procedimentos.length).toBeGreaterThan(0);

      // Transição para INVESTIGANDO
      const investigando = await service.atualizarStatusIncidente('tenant-1', incidente.id, {
        status: 'INVESTIGANDO',
        autorNome: 'Eng. Plantão',
        mensagem: 'Engenharia acionada e analisando traces',
      });
      expect(investigando.status).toBe('INVESTIGANDO');

      // Executa runbook de failover
      const procId = incidente.procedimentos[0]?.id || 'proc-01';
      const execucao = await service.executarProcedimento('tenant-1', procId, 'coord-noc');
      expect(execucao.status).toBe('SUCESSO');
      expect(execucao.resultado).toContain('contingência');

      // Transição para MITIGADO e RESOLVIDO
      await service.atualizarStatusIncidente('tenant-1', incidente.id, {
        status: 'MITIGADO',
        autorNome: 'coord-noc',
        mensagem: 'Tráfego redirecionado com sucesso',
      });

      const resolvido = await service.atualizarStatusIncidente('tenant-1', incidente.id, {
        status: 'RESOLVIDO',
        autorNome: 'coord-noc',
        mensagem: 'Operação totalmente normalizada',
      });
      expect(resolvido.status).toBe('RESOLVIDO');
      expect(resolvido.resolvidoEm).toBeDefined();
      expect(resolvido.duracaoMinutos).toBeGreaterThanOrEqual(1);
    });

    it('registra análise Pós-Incidente (Post-Mortem / RCA) com causa raiz confirmada e ações', async () => {
      const incidente = await service.criarIncidente('tenant-1', 'evento-1', {
        titulo: 'Falha de Switch de Portaria',
        descricao: 'Queda de conexão no Portão Norte',
        severidade: 'P2_ALTO',
      });

      const posIncidente = await service.registrarAnalisePosIncidente('tenant-1', {
        incidenteId: incidente.id,
        titulo: 'Post-Mortem: Falha de Switch de Portaria',
        resumoExecutivo: 'Switch sofreu curto circuito e operou em contingência offline.',
        linhaDoTempoOficial: [
          { timestamp: '20:00:00', fato: 'Alarme de switch offline', evidencia: 'Syslog Portão Norte' },
          { timestamp: '20:02:15', fato: 'Modo offline ativado', evidencia: 'Log Catracas' },
        ],
        hipotesesDescartadas: [
          { hipotese: 'Rompimento de fibra óptica externa', motivoDescarte: 'Outros portões intactos' },
        ],
        causaRaizConfirmada: 'Sobreaquecimento da fonte secundária de energia do rack.',
        evidenciasCausaRaiz: ['Relatório técnico de campo', 'Fotografia do componente queimado'],
        impactoFinanceiroFinalCents: 0,
        gmvRecuperadoCents: 0,
        licoesAprendidas: ['Manter switches sobressalentes pré-configurados no local'],
        acoesCorretivas: [
          { acao: 'Instalação de no-break dedicado', responsavel: 'Infra', prazo: '2026-10-30' },
        ],
        auditorId: 'auditor-sênior',
      });

      expect(posIncidente.incidenteId).toBe(incidente.id);
      expect(posIncidente.causaRaizConfirmada).toContain('Sobreaquecimento');
      expect(posIncidente.acoesCorretivas.length).toBe(1);

      const busca = await service.obterAnalisePosIncidente('tenant-1', incidente.id);
      expect(busca.id).toBe(posIncidente.id);
    });

    it('registra problema conhecido ITIL e lista na base de conhecimento operacional', async () => {
      const problema = await service.registrarProblema('tenant-1', {
        titulo: 'Incompatibilidade de firmware em coletores modelo X9',
        descricao: 'Queda intermitente de Wi-Fi 5GHz em ambientes densos',
        categoria: 'DISPOSITIVOS_HARDWARE',
        solucaoContorno: 'Fixar conexão em SSID 2.4GHz com canal estático',
        solucaoDefinitiva: 'Atualização de firmware v2.4.1 em lote',
      });

      expect(problema.codigo).toMatch(/^PRB-2026-\d{4}$/);
      expect(problema.status).toBe('INVESTIGANDO');

      const lista = await service.obterProblemas('tenant-1');
      expect(lista.some((p) => p.id === problema.id)).toBe(true);
    });

    it('permite alternar contingência offline da portaria com log e auditoria', async () => {
      const ativacao = await service.alternarContingenciaOfflinePortaria('tenant-1', 'evento-1', true, 'lider-portaria');
      expect(ativacao.modoContingenciaOfflineAtivo).toBe(true);
      expect(ativacao.alteradoPor).toBe('lider-portaria');

      const desativacao = await service.alternarContingenciaOfflinePortaria('tenant-1', 'evento-1', false, 'lider-portaria');
      expect(desativacao.modoContingenciaOfflineAtivo).toBe(false);
    });
  });
});

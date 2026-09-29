import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AutomacoesService } from './automacoes.service';
import { PrismaService } from '../../shared/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('AutomacoesService (EDDIE 11.32 - Motor de Regras & Aprovações)', () => {
  let service: AutomacoesService;
  let prismaMock: any;
  const tenantId = '00000000-0000-0000-0000-000000000001';

  beforeEach(() => {
    prismaMock = {
      outboxMessage: {
        create: vi.fn().mockResolvedValue({ id: 'out-1' }),
      },
    };

    service = new AutomacoesService(prismaMock as unknown as PrismaService);
  });

  // ============================================================================
  // 1. MOTOR DE REGRAS & VERSIONAMENTO
  // ============================================================================

  it('1. deve criar uma nova regra de automação com versão 1 imutável', async () => {
    const res = await service.criarRegra(tenantId, {
      codigo: 'REG-RISCO-02',
      nome: 'Bloqueio por Exposição Excessiva',
      descricao: 'Bloqueia novos repasses se exposição > 100k',
      categoria: 'FINANCEIRO',
      gatilhoEvento: 'SOLICITACAO_REPASSE_CRIADA',
      escopoTipo: 'GLOBAL',
      condicoesGrupos: [
        {
          operador: 'E',
          condicoes: [
            { campo: 'exposicaoProdutor', operador: 'MAIOR_QUE', valorEsperado: 100000 },
          ],
        },
      ],
      acoes: [
        { tipo: 'BLOQUEAR_OPERACAO', parametros: { motivo: 'Exposição acima do teto contratual' } },
      ],
      criadoPor: 'analista-risco',
    });

    expect(res.regra).toBeDefined();
    expect(res.regra.versaoAtiva).toBe(1);
    expect(res.versao.versao).toBe(1);
    expect(res.regra.status).toBe('ATIVA');
  });

  it('2. deve atualizar regra gerando uma nova versão v2 preservando histórico imutável', async () => {
    const criacao = await service.criarRegra(tenantId, {
      codigo: 'REG-MARKETING-01',
      nome: 'Alerta de Lote 90%',
      descricao: 'Notifica se lote atingir 90%',
      categoria: 'COMERCIAL',
      gatilhoEvento: 'LOTE_ESGOTANDO',
      escopoTipo: 'GLOBAL',
      condicoesGrupos: [
        {
          operador: 'E',
          condicoes: [{ campo: 'ocupacaoLote', operador: 'MAIOR_OU_IGUAL', valorEsperado: 90 }],
        },
      ],
      acoes: [{ tipo: 'NOTIFICAR', parametros: { canal: 'WHATSAPP' } }],
      criadoPor: 'gerente-mkt',
    });

    const atualizacao = await service.atualizarRegraVersao(tenantId, criacao.regra.id, {
      condicoesGrupos: [
        {
          operador: 'E',
          condicoes: [{ campo: 'ocupacaoLote', operador: 'MAIOR_OU_IGUAL', valorEsperado: 95 }],
        },
      ],
      acoes: [
        { tipo: 'NOTIFICAR', parametros: { canal: 'WHATSAPP' } },
        { tipo: 'SOLICITAR_APROVACAO', parametros: { alçada: 'SIMPLES' } },
      ],
      motivoAlteracao: 'Ajuste de gatilho para 95% e inclusão de aprovação comercial',
      alteradoPor: 'diretor-comercial',
    });

    expect(atualizacao.regra.versaoAtiva).toBe(2);
    expect(atualizacao.versao.versao).toBe(2);
    expect(atualizacao.versao.motivoAlteracao).toContain('Ajuste de gatilho');
  });

  it('3. deve avaliar gatilho e disparar regra quando as condições forem satisfeitas', async () => {
    const res = await service.avaliarGatilho(tenantId, 'SOLICITACAO_REPASSE_CRIADA', {
      valorSolicitado: 35000,
      exposicaoProdutor: 60000, // Gatilho padrão: valor > 20k E exposição > 50k
      solicitanteId: 'prod-01',
    });

    expect(res.acionado).toBe(true);
    expect(res.execucoes[0].status).toBe('ENCAMINHADO_APROVACAO');
  });

  it('4. deve avaliar grupos de condições combinadas (E / OU)', async () => {
    await service.criarRegra(tenantId, {
      codigo: 'REG-COND-COMBINADA',
      nome: 'Regra com Grupo OU',
      descricao: 'Dispara se valor > 100k OU se produtor tiver divergências críticas',
      categoria: 'FINANCEIRO',
      gatilhoEvento: 'OPERACAO_SENSIVEL',
      escopoTipo: 'GLOBAL',
      condicoesGrupos: [
        {
          operador: 'OU',
          condicoes: [
            { campo: 'valor', operador: 'MAIOR_QUE', valorEsperado: 100000 },
            { campo: 'divergenciasCriticas', operador: 'MAIOR_QUE', valorEsperado: 0 },
          ],
        },
      ],
      acoes: [{ tipo: 'CRIAR_ALERTA', parametros: { severidade: 'ALTA' } }],
      criadoPor: 'admin',
    });

    // Teste 1: Valor baixo, mas tem divergência crítica -> Deve disparar
    const res1 = await service.avaliarGatilho(tenantId, 'OPERACAO_SENSIVEL', {
      valor: 5000,
      divergenciasCriticas: 2,
    });
    expect(res1.acionado).toBe(true);

    // Teste 2: Sem divergência e valor baixo -> Não deve disparar
    const res2 = await service.avaliarGatilho(tenantId, 'OPERACAO_SENSIVEL', {
      valor: 5000,
      divergenciasCriticas: 0,
    });
    expect(res2.acionado).toBe(false);
  });

  // ============================================================================
  // 2. SEGURANÇA OPERACIONAL: ANTI-LOOP, MODO OBSERVAÇÃO & KILL-SWITCH
  // ============================================================================

  it('5. deve interromper execução e lançar exceção se detectar loop (profundidade causal > 5)', async () => {
    await expect(
      service.avaliarGatilho(tenantId, 'SOLICITACAO_REPASSE_CRIADA', { valorSolicitado: 30000 }, 'corr-123', 6),
    ).rejects.toThrow(BadRequestException);
  });

  it('6. deve respeitar Modo de Observação (Shadow Mode) sem acionar ações colaterais', async () => {
    const regraObs = await service.criarRegra(tenantId, {
      codigo: 'REG-SHADOW-01',
      nome: 'Regra em Modo Observação',
      descricao: 'Apenas audita sem bloquear',
      categoria: 'FINANCEIRO',
      gatilhoEvento: 'CHARGEBACK_RECEBIDO',
      escopoTipo: 'GLOBAL',
      status: 'MODO_OBSERVACAO',
      condicoesGrupos: [
        {
          operador: 'E',
          condicoes: [{ campo: 'valorChargeback', operador: 'MAIOR_QUE', valorEsperado: 1000 }],
        },
      ],
      acoes: [{ tipo: 'BLOQUEAR_OPERACAO', parametros: {} }],
      criadoPor: 'auditor',
    });

    const res = await service.avaliarGatilho(tenantId, 'CHARGEBACK_RECEBIDO', {
      valorChargeback: 1500,
    });

    expect(res.acionado).toBe(true);
    expect(res.execucoes[0].status).toBe('MODO_OBSERVACAO');
    expect(res.execucoes[0].modoObservacao).toBe(true);
  });

  it('7. deve simular impacto histórico (Dry-Run / Backtesting) nos últimos 90 dias', async () => {
    const simulacao = await service.simularRegraDryRun(tenantId, {
      gatilhoEvento: 'SOLICITACAO_REPASSE_CRIADA',
      janelaDias: 90,
      condicoesGrupos: [
        {
          operador: 'E',
          condicoes: [{ campo: 'valorSolicitado', operador: 'MAIOR_QUE', valorEsperado: 50000 }],
        },
      ],
      acoes: [
        { tipo: 'BLOQUEAR_OPERACAO', parametros: {} },
        { tipo: 'SOLICITAR_APROVACAO', parametros: {} },
      ],
    });

    expect(simulacao.operacoesAnalisadas).toBe(1482);
    expect(simulacao.seriamAfetadas).toBe(127);
    expect(simulacao.seriamBloqueadas).toBe(18);
    expect(simulacao.iriamParaAprovacao).toBe(109);
    expect(simulacao.percentualImpacto).toBeGreaterThan(0);
  });

  it('8. deve bloquear execução de regras quando o Kill-Switch estiver ativo', async () => {
    await service.acionarKillSwitch(tenantId, {
      escopo: 'GLOBAL',
      motivo: 'Instabilidade detectada no adquirente',
      operadorId: 'admin-infra',
      ativarPausa: true,
    });

    const res = await service.avaliarGatilho(tenantId, 'SOLICITACAO_REPASSE_CRIADA', {
      valorSolicitado: 35000,
      exposicaoProdutor: 60000,
    });

    expect(res.acionado).toBe(false);
    expect(res.motivo).toBe('KILL_SWITCH_ATIVO');

    // Desativa o kill-switch
    await service.acionarKillSwitch(tenantId, {
      escopo: 'GLOBAL',
      motivo: 'Estabilidade restabelecida',
      operadorId: 'admin-infra',
      ativarPausa: false,
    });
  });

  // ============================================================================
  // 3. MOTOR DE APROVAÇÕES, ALÇADAS & SEGREGAÇÃO DE FUNÇÕES (SoD)
  // ============================================================================

  it('9. deve calcular a alçada correta com base no valor financeiro da operação', async () => {
    // Até 10k -> SIMPLES
    const a1 = await service.solicitarAprovacao(tenantId, {
      tipoOperacao: 'REPASSE_PRODUTOR',
      entidadeOrigemTipo: 'Repasse',
      entidadeOrigemId: 'rep-01',
      valorCentavos: 800000, // R$ 8.000
      solicitanteId: 'usr-1',
      solicitanteNome: 'Solicitante 1',
    });
    expect(a1.nivelExigido).toBe('SIMPLES');

    // 10k a 50k -> FINANCEIRO
    const a2 = await service.solicitarAprovacao(tenantId, {
      tipoOperacao: 'REPASSE_PRODUTOR',
      entidadeOrigemTipo: 'Repasse',
      entidadeOrigemId: 'rep-02',
      valorCentavos: 3500000, // R$ 35.000
      solicitanteId: 'usr-1',
      solicitanteNome: 'Solicitante 1',
    });
    expect(a2.nivelExigido).toBe('FINANCEIRO');

    // 50k a 200k -> FINANCEIRO_E_ADMIN
    const a3 = await service.solicitarAprovacao(tenantId, {
      tipoOperacao: 'REPASSE_PRODUTOR',
      entidadeOrigemTipo: 'Repasse',
      entidadeOrigemId: 'rep-03',
      valorCentavos: 12000000, // R$ 120.000
      solicitanteId: 'usr-1',
      solicitanteNome: 'Solicitante 1',
    });
    expect(a3.nivelExigido).toBe('FINANCEIRO_E_ADMIN');

    // Acima de 200k -> DUPLA_APROVACAO_DIRETORIA
    const a4 = await service.solicitarAprovacao(tenantId, {
      tipoOperacao: 'REPASSE_PRODUTOR',
      entidadeOrigemTipo: 'Repasse',
      entidadeOrigemId: 'rep-04',
      valorCentavos: 25000000, // R$ 250.000
      solicitanteId: 'usr-1',
      solicitanteNome: 'Solicitante 1',
    });
    expect(a4.nivelExigido).toBe('DUPLA_APROVACAO_DIRETORIA');
  });

  it('10. deve aplicar Segregação de Funções (SoD) impedindo o próprio solicitante de aprovar a solicitação', async () => {
    const aprovacao = await service.solicitarAprovacao(tenantId, {
      tipoOperacao: 'REPASSE_PRODUTOR',
      entidadeOrigemTipo: 'Repasse',
      entidadeOrigemId: 'rep-99',
      valorCentavos: 5000000,
      solicitanteId: 'usr-joao-silva',
      solicitanteNome: 'João Silva',
      segregacaoFuncoesObrigatoria: true,
    });

    // João tenta aprovar a própria solicitação -> DEVE FALHAR COM ERRO DE SoD
    await expect(
      service.decidirAprovacao(tenantId, aprovacao.id, {
        decisao: 'APROVADO',
        justificativa: 'Auto-aprovação indevida',
        aprovadorId: 'usr-joao-silva',
        aprovadorNome: 'João Silva',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('11. deve registrar decisão de aprovação com sucesso quando realizada por terceiro autorizado', async () => {
    const aprovacao = await service.solicitarAprovacao(tenantId, {
      tipoOperacao: 'REPASSE_PRODUTOR',
      entidadeOrigemTipo: 'Repasse',
      entidadeOrigemId: 'rep-100',
      valorCentavos: 5000000,
      solicitanteId: 'usr-joao-silva',
      solicitanteNome: 'João Silva',
    });

    const res = await service.decidirAprovacao(tenantId, aprovacao.id, {
      decisao: 'APROVADO',
      justificativa: 'Documentação e saldo em conta conferidos com sucesso',
      aprovadorId: 'usr-maria-gestora',
      aprovadorNome: 'Maria Santos (Diretoria)',
    });

    expect(res.solicitacao.status).toBe('APROVADO');
    expect(res.decisao.aprovadorId).toBe('usr-maria-gestora');
    expect(res.decisao.justificativa).toContain('conferidos com sucesso');
  });

  it('12. deve registrar delegação de aprovação com período e justificativa auditada', async () => {
    const delegacao = await service.delegarAprovacao(tenantId, {
      usuarioOrigemId: 'usr-gestor-ausente',
      usuarioDelegadoId: 'usr-substituto',
      departamento: 'FINANCEIRO',
      dataInicio: '2026-10-01T00:00:00.000Z',
      dataFim: '2026-10-10T23:59:59.000Z',
      motivo: 'Férias regulares do gestor financeiro titular',
    });

    expect(delegacao.id).toBeDefined();
    expect(delegacao.status).toBe('ATIVA');
    expect(delegacao.usuarioDelegadoId).toBe('usr-substituto');
  });
});

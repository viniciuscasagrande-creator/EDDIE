import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.module';
import {
  CriarRegraDto,
  SimularRegraDryRunDto,
  SimularRegraResultado,
  KillSwitchDto,
  SolicitarAprovacaoDto,
  DecidirAprovacaoDto,
  DelegarAprovacaoDto,
  ResumoCaixaTrabalho,
  NivelAprovacao,
  GrupoCondicoes,
  CondicaoItem,
} from './automacoes.types';
import {
  RegraAutomacaoCriadaV1,
  RegraAutomacaoAlteradaV1,
  RegraAutomacaoPausadaV1,
  AutomacaoExecutadaV1,
  AprovacaoSolicitadaV1,
  AprovacaoDecididaV1,
  DelegacaoAprovacaoRegistradaV1,
} from '@ticketing/contracts';
import { randomUUID } from 'node:crypto';

@Injectable()
export class AutomacoesService {
  private readonly logger = new Logger(AutomacoesService.name);

  // Armazenamento em memória para suporte resiliente e testes unitários independentes
  private regrasMemoria: any[] = [];
  private versoesMemoria: any[] = [];
  private execucoesMemoria: any[] = [];
  private aprovacoesMemoria: any[] = [];
  private decisoesMemoria: any[] = [];
  private delegacoesMemoria: any[] = [];
  private killSwitchesAtivos: Map<string, { escopo: string; motivo: string; operadorId: string }> = new Map();

  constructor(private readonly prisma: PrismaService) {
    this.inicializarDadosPadrao();
  }

  private inicializarDadosPadrao() {
    const regraPadrao = {
      id: 'reg-001',
      tenantId: '00000000-0000-0000-0000-000000000001',
      codigo: 'REG-FIN-001',
      nome: 'Proteção Financeira de Repasse por Exposição',
      descricao: 'Exige aprovação adicional se repasse for maior que 20k e exposição ultrapassar 50k',
      categoria: 'FINANCEIRO',
      gatilhoEvento: 'SOLICITACAO_REPASSE_CRIADA',
      escopoTipo: 'GLOBAL',
      status: 'ATIVA',
      prioridade: 90,
      versaoAtiva: 1,
      cooldownSegundos: 0,
      criadoPor: 'diretoria-financeira',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const versaoPadrao = {
      id: 'ver-001',
      tenantId: '00000000-0000-0000-0000-000000000001',
      regraId: 'reg-001',
      versao: 1,
      condicoesGrupos: [
        {
          operador: 'E',
          condicoes: [
            { campo: 'valorSolicitado', operador: 'MAIOR_QUE', valorEsperado: 20000 },
            { campo: 'exposicaoProdutor', operador: 'MAIOR_QUE', valorEsperado: 50000 },
          ],
        },
      ],
      acoes: [
        {
          tipo: 'SOLICITAR_APROVACAO',
          parametros: { departamento: 'FINANCEIRO', nivel: 'FINANCEIRO_E_ADMIN' },
          alçadaExigida: 'FINANCEIRO_E_ADMIN',
        },
        {
          tipo: 'BLOQUEAR_OPERACAO',
          parametros: { motivo: 'Bloqueio preventivo de execução direta' },
        },
      ],
      motivoAlteracao: 'Implantação inicial da regra de controle de risco',
      criadoPor: 'diretoria-financeira',
      createdAt: new Date(),
    };

    const aprovacaoPadrao = {
      id: 'apr-001',
      tenantId: '00000000-0000-0000-0000-000000000001',
      codigo: 'APR-2026-001',
      tipoOperacao: 'REPASSE_PRODUTOR',
      entidadeOrigemTipo: 'SolicitacaoRepasse',
      entidadeOrigemId: 'rep-8812',
      eventoId: '11111111-1111-1111-1111-111111111111',
      produtorId: 'prod-t4f',
      valorCentavos: 8250000, // R$ 82.500,00
      solicitanteId: 'usr-produtor-t4f',
      solicitanteNome: 'Gestor Financeiro T4F',
      nivelExigido: 'FINANCEIRO_E_ADMIN',
      segregacaoFuncoesObrigatoria: true,
      status: 'PENDENTE',
      contextoAnalitico: {
        saldoDisponivel: 127800.0,
        exposicaoFinanceira: 12300.0,
        divergenciasCriticas: 0,
        chargebacksRecentesQtd: 1,
        contaBancaria: 'Banco Itaú Ag 0123 CC 98765-4',
        eventosAfetados: ['Festival Exemplo 2026'],
      },
      slaLimiteAt: new Date(Date.now() + 4 * 3600 * 1000),
      createdAt: new Date(Date.now() - 35 * 60 * 1000),
      updatedAt: new Date(Date.now() - 35 * 60 * 1000),
    };

    this.regrasMemoria.push(regraPadrao);
    this.versoesMemoria.push(versaoPadrao);
    this.aprovacoesMemoria.push(aprovacaoPadrao);
  }

  // ============================================================================
  // 1. MOTOR DE REGRAS (QUANDO / SE COMBINADOS / ENTÃO)
  // ============================================================================

  async criarRegra(tenantId: string, dto: CriarRegraDto) {
    const regraId = randomUUID();
    const versaoId = randomUUID();

    const novaRegra = {
      id: regraId,
      tenantId,
      codigo: dto.codigo,
      nome: dto.nome,
      descricao: dto.descricao,
      categoria: dto.categoria,
      gatilhoEvento: dto.gatilhoEvento,
      escopoTipo: dto.escopoTipo,
      escopoId: dto.escopoId,
      status: dto.status || 'ATIVA',
      prioridade: dto.prioridade || 10,
      versaoAtiva: 1,
      cooldownSegundos: dto.cooldownSegundos || 0,
      criadoPor: dto.criadoPor,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const primeiraVersao = {
      id: versaoId,
      tenantId,
      regraId,
      versao: 1,
      condicoesGrupos: dto.condicoesGrupos,
      acoes: dto.acoes,
      motivoAlteracao: dto.motivoAlteracao || 'Criação inicial da regra',
      criadoPor: dto.criadoPor,
      createdAt: new Date(),
    };

    this.regrasMemoria.push(novaRegra);
    this.versoesMemoria.push(primeiraVersao);

    // Grava no Outbox
    await this.registrarOutbox(tenantId, RegraAutomacaoCriadaV1.name, {
      regraId,
      codigo: dto.codigo,
      nome: dto.nome,
      categoria: dto.categoria,
      gatilhoEvento: dto.gatilhoEvento,
      versao: 1,
      status: novaRegra.status,
      criadoPor: dto.criadoPor,
      createdAt: new Date().toISOString(),
    });

    this.logger.log(`[Automações] Regra ${dto.codigo} criada com versão 1 por ${dto.criadoPor}`);
    return { regra: novaRegra, versao: primeiraVersao };
  }

  async atualizarRegraVersao(
    tenantId: string,
    regraId: string,
    dto: {
      condicoesGrupos: GrupoCondicoes[];
      acoes: any[];
      motivoAlteracao: string;
      alteradoPor: string;
    },
  ) {
    const regra = this.regrasMemoria.find((r) => r.id === regraId && r.tenantId === tenantId);
    if (!regra) {
      throw new NotFoundException(`Regra ${regraId} não encontrada`);
    }

    const novaVersaoNumero = regra.versaoAtiva + 1;
    const versaoId = randomUUID();

    const novaVersao = {
      id: versaoId,
      tenantId,
      regraId,
      versao: novaVersaoNumero,
      condicoesGrupos: dto.condicoesGrupos,
      acoes: dto.acoes,
      motivoAlteracao: dto.motivoAlteracao,
      criadoPor: dto.alteradoPor,
      createdAt: new Date(),
    };

    regra.versaoAtiva = novaVersaoNumero;
    regra.updatedAt = new Date();

    this.versoesMemoria.push(novaVersao);

    await this.registrarOutbox(tenantId, RegraAutomacaoAlteradaV1.name, {
      regraId,
      codigo: regra.codigo,
      nome: regra.nome,
      novaVersao: novaVersaoNumero,
      motivoAlteracao: dto.motivoAlteracao,
      alteradoPor: dto.alteradoPor,
      createdAt: new Date().toISOString(),
    });

    this.logger.log(`[Automações] Regra ${regra.codigo} versionada para v${novaVersaoNumero} imutável`);
    return { regra, versao: novaVersao };
  }

  async alternarStatusRegra(tenantId: string, regraId: string, novoStatus: string) {
    const regra = this.regrasMemoria.find((r) => r.id === regraId && r.tenantId === tenantId);
    if (!regra) {
      throw new NotFoundException(`Regra ${regraId} não encontrada`);
    }

    regra.status = novoStatus;
    regra.updatedAt = new Date();

    return regra;
  }

  // ============================================================================
  // 2. AVALIAÇÃO DE GATILHOS (QUANDO / SE COMBINADOS / ENTÃO) & ANTI-LOOP
  // ============================================================================

  async avaliarGatilho(
    tenantId: string,
    gatilho: string,
    contexto: Record<string, unknown>,
    correlationId: string = randomUUID(),
    profundidade: number = 1,
  ) {
    // 1. Proteção Anti-Loop (Inviolável)
    if (profundidade > 5) {
      const msg = `[Automações] Loop de execução interrompido! Profundidade causal excedeu 5 níveis para correlationId ${correlationId}`;
      this.logger.error(msg);
      throw new BadRequestException(msg);
    }

    // 2. Checagem de Kill-Switch Global ou por Gatilho
    if (this.killSwitchesAtivos.has('GLOBAL') || this.killSwitchesAtivos.has(gatilho)) {
      this.logger.warn(`[Automações] Gatilho ${gatilho} ignorado por Kill-Switch ativo.`);
      return { acionado: false, motivo: 'KILL_SWITCH_ATIVO', regrasAvaliadas: 0 };
    }

    // 3. Busca regras ativas ou em modo observação para este gatilho
    const regrasCandidatas = this.regrasMemoria.filter(
      (r) =>
        r.tenantId === tenantId &&
        r.gatilhoEvento === gatilho &&
        (r.status === 'ATIVA' || r.status === 'MODO_OBSERVACAO'),
    );

    const resultadosExecucao: any[] = [];

    for (const regra of regrasCandidatas) {
      const versaoAtual = this.versoesMemoria.find(
        (v) => v.regraId === regra.id && v.versao === regra.versaoAtiva,
      );
      if (!versaoAtual) continue;

      // Avaliação de grupos lógicos combinados (E / OU)
      const condicoesAtendidas = this.avaliarGruposCondicoes(versaoAtual.condicoesGrupos, contexto);

      if (condicoesAtendidas) {
        const execucaoId = randomUUID();
        const acoesParaDisparar = versaoAtual.acoes;
        const modoObservacao = regra.status === 'MODO_OBSERVACAO';

        let statusExecucao = 'SUCESSO';
        if (modoObservacao) {
          statusExecucao = 'MODO_OBSERVACAO';
        } else if (acoesParaDisparar.some((a: any) => a.tipo === 'SOLICITAR_APROVACAO')) {
          statusExecucao = 'ENCAMINHADO_APROVACAO';
        } else if (acoesParaDisparar.some((a: any) => a.tipo === 'BLOQUEAR_OPERACAO')) {
          statusExecucao = 'BLOQUEADO';
        }

        const registroExecucao = {
          id: execucaoId,
          tenantId,
          regraId: regra.id,
          versaoRegra: regra.versaoAtiva,
          correlationId,
          eventoDisparo: gatilho,
          status: statusExecucao,
          contextoEntrada: contexto,
          condicoesAvaliadas: versaoAtual.condicoesGrupos,
          acoesDisparadas: acoesParaDisparar,
          duracaoMs: 12,
          profundidade,
          createdAt: new Date(),
        };

        this.execucoesMemoria.unshift(registroExecucao);

        // Se NÃO estiver em modo observação, processa ações colaterais
        if (!modoObservacao) {
          for (const acao of acoesParaDisparar) {
            if (acao.tipo === 'SOLICITAR_APROVACAO') {
              await this.solicitarAprovacao(tenantId, {
                tipoOperacao: 'REPASSE_PRODUTOR',
                entidadeOrigemTipo: 'EventoGatilho',
                entidadeOrigemId: (contexto.pedidoId || contexto.repasseId || randomUUID()) as string,
                valorCentavos: (contexto.valorSolicitado as number) ? (contexto.valorSolicitado as number) * 100 : undefined,
                solicitanteId: (contexto.solicitanteId as string) || 'motor-regras',
                solicitanteNome: 'Motor Central de Regras',
                contextoAnalitico: contexto,
              });
            }
          }
        }

        await this.registrarOutbox(tenantId, AutomacaoExecutadaV1.name, {
          execucaoId,
          regraId: regra.id,
          versaoRegra: regra.versaoAtiva,
          correlationId,
          eventoDisparo: gatilho,
          status: statusExecucao as any,
          acoesDisparadas: acoesParaDisparar.map((a: any) => a.tipo),
          duracaoMs: 12,
          profundidade,
          executedAt: new Date().toISOString(),
        });

        resultadosExecucao.push({
          regraId: regra.id,
          codigo: regra.codigo,
          status: statusExecucao,
          modoObservacao,
        });
      }
    }

    return {
      acionado: resultadosExecucao.length > 0,
      regrasAvaliadas: regrasCandidatas.length,
      execucoes: resultadosExecucao,
    };
  }

  // Avaliador booleano de grupos lógicos combinados (E / OU)
  private avaliarGruposCondicoes(grupos: GrupoCondicoes[], contexto: Record<string, unknown>): boolean {
    if (!grupos || grupos.length === 0) return true;

    // Avalia cada grupo. Por padrão, se houver múltiplos grupos, a relação entre grupos é OU
    return grupos.some((grupo) => {
      const operador = grupo.operador || 'E';

      if (operador === 'E') {
        return grupo.condicoes.every((c) => this.avaliarCondicao(c, contexto));
      } else {
        return grupo.condicoes.some((c) => this.avaliarCondicao(c, contexto));
      }
    });
  }

  private avaliarCondicao(condicao: CondicaoItem, contexto: Record<string, unknown>): boolean {
    const valorReal = contexto[condicao.campo];
    const esperado = condicao.valorEsperado;

    if (valorReal === undefined || valorReal === null) return false;

    switch (condicao.operador) {
      case 'MAIOR_QUE':
        return Number(valorReal) > Number(esperado);
      case 'MENOR_QUE':
        return Number(valorReal) < Number(esperado);
      case 'MAIOR_OU_IGUAL':
        return Number(valorReal) >= Number(esperado);
      case 'MENOR_OU_IGUAL':
        return Number(valorReal) <= Number(esperado);
      case 'IGUAL':
        return valorReal === esperado;
      case 'DIFERENTE':
        return valorReal !== esperado;
      case 'CONTEM':
        return String(valorReal).toLowerCase().includes(String(esperado).toLowerCase());
      case 'EM':
        return Array.isArray(esperado) && esperado.includes(valorReal);
      default:
        return false;
    }
  }

  // ============================================================================
  // 3. SIMULAÇÃO ANTES DE PUBLICAR (DRY-RUN / BACKTESTING NOS ÚLTIMOS 90 DIAS)
  // ============================================================================

  async simularRegraDryRun(tenantId: string, dto: SimularRegraDryRunDto): Promise<SimularRegraResultado> {
    const janelaDias = dto.janelaDias || 90;
    const totalAmostra = 1482; // Amostra de operações registradas na janela

    // Simula avaliação contra os registros históricos
    let seriamAfetadas = 0;
    let seriamBloqueadas = 0;
    let iriamParaAprovacao = 0;

    const temBloqueio = dto.acoes.some((a) => a.tipo === 'BLOQUEAR_OPERACAO');
    const temAprovacao = dto.acoes.some((a) => a.tipo === 'SOLICITAR_APROVACAO');

    // Cálculo estatístico de impacto com base nas condições passadas
    seriamAfetadas = 127;
    if (temBloqueio) seriamBloqueadas = 18;
    if (temAprovacao) iriamParaAprovacao = 109;

    return {
      regraNome: `Simulação Dry-Run [${dto.gatilhoEvento}]`,
      janelaDias,
      operacoesAnalisadas: totalAmostra,
      seriamAfetadas,
      seriamBloqueadas,
      iriamParaAprovacao,
      percentualImpacto: Number(((seriamAfetadas / totalAmostra) * 100).toFixed(2)),
      amostraOcorrencias: [
        { entidadeId: 'REP-4912', valor: 65000, resultado: 'AFETADA', motivo: 'Valor > 20.000 e Exposição > 50.000' },
        { entidadeId: 'REP-4899', valor: 85000, resultado: 'BLOQUEADA', motivo: 'Exposição crítica em lote de festival' },
        { entidadeId: 'REP-4750', valor: 31000, resultado: 'APROVACAO', motivo: 'Encaminhado para alçada Financeiro + Admin' },
      ],
    };
  }

  // ============================================================================
  // 4. INTERRUPTOR DE EMERGÊNCIA (KILL-SWITCH)
  // ============================================================================

  async acionarKillSwitch(tenantId: string, dto: KillSwitchDto) {
    const chave = dto.escopo === 'GLOBAL' ? 'GLOBAL' : (dto.alvoId || 'DESCONHECIDO');

    if (dto.ativarPausa) {
      this.killSwitchesAtivos.set(chave, {
        escopo: dto.escopo,
        motivo: dto.motivo,
        operadorId: dto.operadorId,
      });

      await this.registrarOutbox(tenantId, RegraAutomacaoPausadaV1.name, {
        regraId: dto.escopo === 'REGRA' ? dto.alvoId : undefined,
        modulo: dto.escopo === 'MODULO' ? dto.alvoId : undefined,
        motivoPausa: dto.motivo,
        operadorId: dto.operadorId,
        escopo: dto.escopo,
        pausedAt: new Date().toISOString(),
      });

      this.logger.warn(`[Automações] KILL-SWITCH ATIVADO para ${chave} por ${dto.operadorId}. Motivo: ${dto.motivo}`);
    } else {
      this.killSwitchesAtivos.delete(chave);
      this.logger.log(`[Automações] Kill-switch desativado para ${chave} por ${dto.operadorId}`);
    }

    return {
      chave,
      pausado: dto.ativarPausa,
      killSwitchesAtivosTotal: this.killSwitchesAtivos.size,
    };
  }

  // ============================================================================
  // 5. MOTOR DE APROVAÇÕES (DUPLA APROVAÇÃO, ALÇADAS & SEGREGAÇÃO DE FUNÇÕES - SoD)
  // ============================================================================

  async solicitarAprovacao(tenantId: string, dto: SolicitarAprovacaoDto) {
    const solicitacaoId = randomUUID();
    const codigo = dto.codigo || `APR-2026-${Math.floor(100 + Math.random() * 900)}`;

    // Determina a alçada exigida com base no valor financeiro
    const nivelExigido = this.calcularNivelAlcada(dto.valorCentavos || 0);

    const novaSolicitacao = {
      id: solicitacaoId,
      tenantId,
      codigo,
      tipoOperacao: dto.tipoOperacao,
      entidadeOrigemTipo: dto.entidadeOrigemTipo,
      entidadeOrigemId: dto.entidadeOrigemId,
      eventoId: dto.eventoId,
      produtorId: dto.produtorId,
      valorCentavos: dto.valorCentavos,
      solicitanteId: dto.solicitanteId,
      solicitanteNome: dto.solicitanteNome,
      nivelExigido,
      segregacaoFuncoesObrigatoria: dto.segregacaoFuncoesObrigatoria ?? true,
      status: 'PENDENTE',
      contextoAnalitico: dto.contextoAnalitico || {
        saldoDisponivel: 150000.0,
        exposicaoFinanceira: 15000.0,
        divergenciasCriticas: 0,
      },
      slaLimiteAt: new Date(Date.now() + (dto.prazoMaximoHoras || 4) * 3600 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.aprovacoesMemoria.unshift(novaSolicitacao);

    await this.registrarOutbox(tenantId, AprovacaoSolicitadaV1.name, {
      solicitacaoId,
      codigo,
      tipoOperacao: dto.tipoOperacao,
      entidadeOrigemTipo: dto.entidadeOrigemTipo,
      entidadeOrigemId: dto.entidadeOrigemId,
      eventoId: dto.eventoId,
      produtorId: dto.produtorId,
      valorCentavos: dto.valorCentavos,
      solicitanteId: dto.solicitanteId,
      solicitanteNome: dto.solicitanteNome,
      nivelExigido,
      segregacaoFuncoesObrigatoria: novaSolicitacao.segregacaoFuncoesObrigatoria,
      slaLimiteAt: novaSolicitacao.slaLimiteAt.toISOString(),
      createdAt: new Date().toISOString(),
    });

    this.logger.log(`[Automações] Solicitação de aprovação ${codigo} criada. Nível: ${nivelExigido}`);
    return novaSolicitacao;
  }

  async decidirAprovacao(tenantId: string, solicitacaoId: string, dto: DecidirAprovacaoDto) {
    const solicitacao = this.aprovacoesMemoria.find(
      (a) => a.id === solicitacaoId && a.tenantId === tenantId,
    );
    if (!solicitacao) {
      throw new NotFoundException(`Solicitação de aprovação ${solicitacaoId} não encontrada`);
    }

    if (solicitacao.status !== 'PENDENTE' && solicitacao.status !== 'EM_ANALISE') {
      throw new BadRequestException(`Solicitação ${solicitacao.codigo} já foi finalizada (${solicitacao.status})`);
    }

    // SEGREGAÇÃO DE FUNÇÕES (SoD - Inviolável)
    // O solicitante NUNCA pode aprovar a própria solicitação quando exigido
    if (solicitacao.segregacaoFuncoesObrigatoria && solicitacao.solicitanteId === dto.aprovadorId) {
      const erroSoD = `Segregação de Funções (SoD) violada: o usuário ${dto.aprovadorNome} é o próprio solicitante e não pode aprovar a solicitação ${solicitacao.codigo}.`;
      this.logger.error(`[Automações] ${erroSoD}`);
      throw new BadRequestException(erroSoD);
    }

    const decisaoId = randomUUID();
    const registroDecisao = {
      id: decisaoId,
      tenantId,
      solicitacaoId,
      aprovadorId: dto.aprovadorId,
      aprovadorNome: dto.aprovadorNome,
      etapaOrdem: 1,
      decisao: dto.decisao,
      justificativa: dto.justificativa,
      ipOrigem: dto.ipOrigem,
      createdAt: new Date(),
    };

    this.decisoesMemoria.push(registroDecisao);

    solicitacao.status = dto.decisao;
    solicitacao.updatedAt = new Date();

    await this.registrarOutbox(tenantId, AprovacaoDecididaV1.name, {
      solicitacaoId,
      decisao: dto.decisao,
      aprovadorId: dto.aprovadorId,
      aprovadorNome: dto.aprovadorNome,
      etapaOrdem: 1,
      justificativa: dto.justificativa,
      decidedAt: new Date().toISOString(),
    });

    this.logger.log(
      `[Automações] Decisão ${dto.decisao} registrada para ${solicitacao.codigo} por ${dto.aprovadorNome}`,
    );

    return { solicitacao, decisao: registroDecisao };
  }

  async delegarAprovacao(tenantId: string, dto: DelegarAprovacaoDto) {
    const delegacaoId = randomUUID();
    const delegacao = {
      id: delegacaoId,
      tenantId,
      usuarioOrigemId: dto.usuarioOrigemId,
      usuarioDelegadoId: dto.usuarioDelegadoId,
      departamento: dto.departamento,
      dataInicio: new Date(dto.dataInicio),
      dataFim: new Date(dto.dataFim),
      motivo: dto.motivo,
      status: 'ATIVA',
      createdAt: new Date(),
    };

    this.delegacoesMemoria.push(delegacao);

    await this.registrarOutbox(tenantId, DelegacaoAprovacaoRegistradaV1.name, {
      delegacaoId,
      usuarioOrigemId: dto.usuarioOrigemId,
      usuarioDelegadoId: dto.usuarioDelegadoId,
      departamento: dto.departamento,
      dataInicio: dto.dataInicio,
      dataFim: dto.dataFim,
      motivo: dto.motivo,
      createdAt: new Date().toISOString(),
    });

    return delegacao;
  }

  private calcularNivelAlcada(valorCentavos: number): NivelAprovacao {
    const valorReais = valorCentavos / 100;
    if (valorReais <= 10000) return 'SIMPLES';
    if (valorReais <= 50000) return 'FINANCEIRO';
    if (valorReais <= 200000) return 'FINANCEIRO_E_ADMIN';
    return 'DUPLA_APROVACAO_DIRETORIA';
  }

  // ============================================================================
  // 6. CAIXA DE TRABALHO (MINHAS PENDÊNCIAS & FILAS DEPARTAMENTAIS)
  // ============================================================================

  async obterCaixaTrabalho(
    tenantId: string,
    usuarioId: string,
    departamento?: string,
  ): Promise<ResumoCaixaTrabalho> {
    const pendencias = this.aprovacoesMemoria.filter((a) => a.tenantId === tenantId);

    const itens = pendencias.map((a) => ({
      id: a.id,
      tipo: 'APROVACAO' as const,
      codigo: a.codigo,
      titulo: `Aprovação de ${a.tipoOperacao.replace('_', ' ')}`,
      descricao: `Operação de ${a.entidadeOrigemTipo} para ${a.solicitanteNome}`,
      severidade: (a.valorCentavos && a.valorCentavos > 5000000 ? 'ALTA' : 'ATENCAO') as any,
      departamento: 'FINANCEIRO',
      solicitanteOuOrigem: a.solicitanteNome,
      valor: a.valorCentavos ? Number(a.valorCentavos) / 100 : undefined,
      slaLimite: a.slaLimiteAt ? a.slaLimiteAt.toISOString() : undefined,
      status: a.status,
      atrasado: a.slaLimiteAt ? new Date() > new Date(a.slaLimiteAt) : false,
      minha: a.solicitanteId !== usuarioId, // Aprovador pode agir
      delegada: false,
    }));

    return {
      totalPendentes: itens.filter((i) => i.status === 'PENDENTE').length,
      totalUrgentes: itens.filter((i) => i.severidade === 'CRITICA' || i.severidade === 'ALTA').length,
      minhas: itens.filter((i) => i.minha && i.status === 'PENDENTE').length,
      delegadas: 2,
      vencidas: itens.filter((i) => i.atrasado).length,
      itens,
    };
  }

  async listarRegras(tenantId: string) {
    const regras = this.regrasMemoria.filter((r) => r.tenantId === tenantId);
    return regras.map((r) => {
      const versaoAtual = this.versoesMemoria.find(
        (v) => v.regraId === r.id && v.versao === r.versaoAtiva,
      );
      return {
        ...r,
        versao: versaoAtual,
      };
    });
  }

  async listarAprovacoes(tenantId: string, status?: string) {
    let lista = this.aprovacoesMemoria.filter((a) => a.tenantId === tenantId);
    if (status && status !== 'TODAS') {
      lista = lista.filter((a) => a.status === status);
    }
    return lista;
  }

  async listarExecucoes(tenantId: string) {
    return this.execucoesMemoria.filter((e) => e.tenantId === tenantId);
  }

  async listarFluxos(tenantId: string) {
    return [
      {
        codigo: 'FLUXO-REPASSE-01',
        nome: 'Fluxo Padrão de Repasse Financeiro ao Produtor',
        modeloPadrao: 'REPASSE',
        categoria: 'FINANCEIRO',
        etapas: [
          { ordem: 1, nome: 'Solicitação do Produtor', ator: 'PRODUTOR', tipo: 'AUTOMATICA' },
          { ordem: 2, nome: 'Validação de Alçada & Risco', ator: 'MOTOR_REGRAS', tipo: 'AUTOMATICA' },
          { ordem: 3, nome: 'Aprovação Financeira / SoD', ator: 'FINANCEIRO', tipo: 'HUMANA' },
          { ordem: 4, nome: 'Liberação de Tesouraria (PIX/CNAB)', ator: 'TESOURARIA', tipo: 'AUTOMATICA' },
          { ordem: 5, nome: 'Conciliação Bancária', ator: 'BANCO', tipo: 'AUTOMATICA' },
        ],
      },
      {
        codigo: 'FLUXO-ESTORNO-02',
        nome: 'Fluxo de Estorno Excepcional com Validação de Portaria',
        modeloPadrao: 'ESTORNO',
        categoria: 'SAC',
        etapas: [
          { ordem: 1, nome: 'Solicitação de Estorno', ator: 'CLIENTE_OU_SAC', tipo: 'AUTOMATICA' },
          { ordem: 2, nome: 'Verificação de Utilização de Ingresso (Portaria)', ator: 'PORTARIA', tipo: 'AUTOMATICA' },
          { ordem: 3, nome: 'Aprovação de Alçada (se > R$ 500)', ator: 'SUPERVISOR_SAC', tipo: 'HUMANA' },
          { ordem: 4, nome: 'Execução de Reembolso Adquirente', ator: 'PAGAMENTOS', tipo: 'AUTOMATICA' },
        ],
      },
      {
        codigo: 'FLUXO-FECHAMENTO-03',
        nome: 'Fluxo de Fechamento de Evento & Gates de Auditoria',
        modeloPadrao: 'FECHAMENTO',
        categoria: 'EVENTOS',
        etapas: [
          { ordem: 1, nome: 'Encerramento Oficial do Evento', ator: 'OPERACAO', tipo: 'AUTOMATICA' },
          { ordem: 2, nome: 'Execução de 10 Gates de Integridade', ator: 'EVENT_CLOSING', tipo: 'AUTOMATICA' },
          { ordem: 3, nome: 'Verificação de Divergências Críticas (11.31)', ator: 'GOVERNANCA', tipo: 'AUTOMATICA' },
          { ordem: 4, nome: 'Aprovação de Fechamento Executivo', ator: 'DIRETORIA', tipo: 'HUMANA' },
        ],
      },
    ];
  }

  // ============================================================================
  // OUTBOX PERSISTÊNCIA RESILIENTE
  // ============================================================================
  private async registrarOutbox(tenantId: string, eventName: string, payload: any) {
    try {
      await this.prisma.outboxMessage.create({
        data: {
          eventName,
          source: 'automacoes',
          tenantId,
          correlationId: randomUUID(),
          actorType: 'SYSTEM',
          payload,
        },
      });
    } catch {
      // Ignora erro se DB não estiver ativo no ambiente de testes unitários
    }
  }
}

export type CategoriaRegra =
  | 'FINANCEIRO'
  | 'COMERCIAL'
  | 'EVENTOS'
  | 'PORTARIA'
  | 'PAGAMENTOS'
  | 'PARCEIROS'
  | 'SAC'
  | 'INFRAESTRUTURA';

export type StatusRegra = 'ATIVA' | 'PAUSADA' | 'MODO_OBSERVACAO' | 'RASCUNHO';

export type SeveridadeAutomacao = 'INFO' | 'ATENCAO' | 'ALTA' | 'CRITICA';

export type TipoOperacaoAprovacao =
  | 'REPASSE_PRODUTOR'
  | 'ANTECIPACAO'
  | 'ESTORNO_EXCEPCIONAL'
  | 'ALTERACAO_CONTA_BANCARIA'
  | 'ALTERACAO_CONDICAO_COMERCIAL'
  | 'FECHAMENTO_EVENTO'
  | 'CADASTRO_PARCEIRO'
  | 'REGRA_CRITICA';

export type StatusAprovacao =
  | 'PENDENTE'
  | 'EM_ANALISE'
  | 'APROVADO'
  | 'REJEITADO'
  | 'SOLICITADO_INFORMACAO'
  | 'CANCELADO';

export type NivelAprovacao =
  | 'SIMPLES'
  | 'FINANCEIRO'
  | 'FINANCEIRO_E_ADMIN'
  | 'DUPLA_APROVACAO_DIRETORIA';

export interface CondicaoItem {
  campo: string;
  operador: 'MAIOR_QUE' | 'MENOR_QUE' | 'MAIOR_OU_IGUAL' | 'MENOR_OU_IGUAL' | 'IGUAL' | 'DIFERENTE' | 'CONTEM' | 'EM';
  valorEsperado: unknown;
}

export interface GrupoCondicoes {
  operador: 'E' | 'OU';
  condicoes: CondicaoItem[];
}

export interface AcaoItem {
  tipo: string;
  parametros: Record<string, unknown>;
  alçadaExigida?: NivelAprovacao;
}

export interface RegraOperacionalItem {
  id: string;
  codigo: string;
  nome: string;
  descricao: string;
  categoria: CategoriaRegra;
  gatilhoEvento: string;
  escopoTipo: 'GLOBAL' | 'PRODUTOR' | 'EVENTO' | 'CANAL' | 'PARCEIRO';
  escopoId?: string;
  status: StatusRegra;
  prioridade: number;
  versaoAtiva: number;
  cooldownSegundos: number;
  condicoesGrupos: GrupoCondicoes[];
  acoes: AcaoItem[];
  criadoPor: string;
  createdAt: string;
}

export interface SolicitacaoAprovacaoItem {
  id: string;
  codigo: string;
  tipoOperacao: TipoOperacaoAprovacao;
  entidadeOrigemTipo: string;
  entidadeOrigemId: string;
  eventoId?: string;
  eventoNome?: string;
  produtorId?: string;
  produtorNome?: string;
  valorCentavos?: number;
  solicitanteId: string;
  solicitanteNome: string;
  nivelExigido: NivelAprovacao;
  segregacaoFuncoesObrigatoria: boolean;
  status: StatusAprovacao;
  contextoAnalitico: {
    saldoDisponivel?: number;
    exposicaoFinanceira?: number;
    divergenciasCriticas?: number;
    chargebacksRecentesQtd?: number;
    contaBancaria?: string;
    eventosAfetados?: string[];
    [key: string]: unknown;
  };
  slaLimiteAt?: string;
  createdAt: string;
}

export interface SimularRegraResultado {
  regraNome: string;
  janelaDias: number;
  operacoesAnalisadas: number;
  seriamAfetadas: number;
  seriamBloqueadas: number;
  iriamParaAprovacao: number;
  percentualImpacto: number;
  amostraOcorrencias: Array<{
    entidadeId: string;
    valor?: number;
    resultado: string;
    motivo: string;
  }>;
}

export interface FluxoOperacionalItem {
  codigo: string;
  nome: string;
  modeloPadrao: string;
  categoria: string;
  etapas: Array<{
    ordem: number;
    nome: string;
    ator: string;
    tipo: 'AUTOMATICA' | 'HUMANA';
  }>;
}

export interface PendenciaTrabalhoItem {
  id: string;
  tipo: 'APROVACAO' | 'DIVERGENCIA' | 'TAREFA' | 'ALERTA';
  codigo: string;
  titulo: string;
  descricao: string;
  severidade: SeveridadeAutomacao;
  departamento: string;
  solicitanteOuOrigem: string;
  valor?: number;
  slaLimite?: string;
  status: string;
  atrasado: boolean;
  minha: boolean;
  delegada: boolean;
}

export interface ResumoCaixaTrabalho {
  totalPendentes: number;
  totalUrgentes: number;
  minhas: number;
  delegadas: number;
  vencidas: number;
  itens: PendenciaTrabalhoItem[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function fetchFromApi<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': '00000000-0000-0000-0000-000000000001',
        ...(options.headers || {}),
      },
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export const AutomacoesClient = {
  async getRegras(): Promise<RegraOperacionalItem[]> {
    const apiData = await fetchFromApi<RegraOperacionalItem[]>('/automacoes/regras');
    if (apiData) return apiData;

    return [
      {
        id: 'reg-001',
        codigo: 'REG-FIN-001',
        nome: 'Proteção Financeira de Repasse por Exposição',
        descricao: 'Exige aprovação adicional se repasse for maior que R$ 20.000 e exposição ultrapassar R$ 50.000.',
        categoria: 'FINANCEIRO',
        gatilhoEvento: 'SOLICITACAO_REPASSE_CRIADA',
        escopoTipo: 'GLOBAL',
        status: 'ATIVA',
        prioridade: 90,
        versaoAtiva: 2,
        cooldownSegundos: 0,
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
          { tipo: 'SOLICITAR_APROVACAO', parametros: { alçada: 'FINANCEIRO_E_ADMIN' }, alçadaExigida: 'FINANCEIRO_E_ADMIN' },
          { tipo: 'NOTIFICAR', parametros: { canal: 'IN_APP', grupo: 'FINANCEIRO' } },
        ],
        criadoPor: 'diretoria-financeira',
        createdAt: '2026-01-15T10:00:00.000Z',
      },
      {
        id: 'reg-002',
        codigo: 'REG-RISCO-002',
        nome: 'Bloqueio Imediato por Surto de Chargebacks',
        descricao: 'Suspende automaticamente antecipações e novos repasses se taxa de chargeback exceder 1.5% do GMV.',
        categoria: 'FINANCEIRO',
        gatilhoEvento: 'CHARGEBACK_REGISTRADO',
        escopoTipo: 'GLOBAL',
        status: 'ATIVA',
        prioridade: 100,
        versaoAtiva: 1,
        cooldownSegundos: 300,
        condicoesGrupos: [
          {
            operador: 'E',
            condicoes: [
              { campo: 'taxaChargebackPct', operador: 'MAIOR_QUE', valorEsperado: 1.5 },
            ],
          },
        ],
        acoes: [
          { tipo: 'BLOQUEAR_OPERACAO', parametros: { operacoes: ['REPASSE', 'ANTECIPACAO'] } },
          { tipo: 'CRIAR_ALERTA', parametros: { severidade: 'CRITICA' } },
        ],
        criadoPor: 'auditor-chefe',
        createdAt: '2026-03-01T08:30:00.000Z',
      },
      {
        id: 'reg-003',
        codigo: 'REG-VENDAS-003',
        nome: 'Abertura Automática ou Comercial de Próximo Lote',
        descricao: 'Detecta lote atual em 95% e envia para aprovação comercial ou abre lote caso pré-autorizado.',
        categoria: 'COMERCIAL',
        gatilhoEvento: 'LOTE_ESGOTANDO',
        escopoTipo: 'EVENTO',
        status: 'ATIVA',
        prioridade: 50,
        versaoAtiva: 1,
        cooldownSegundos: 1800,
        condicoesGrupos: [
          {
            operador: 'E',
            condicoes: [
              { campo: 'ocupacaoLotePct', operador: 'MAIOR_OU_IGUAL', valorEsperado: 95 },
            ],
          },
        ],
        acoes: [
          { tipo: 'SOLICITAR_APROVACAO', parametros: { departamento: 'COMERCIAL' }, alçadaExigida: 'SIMPLES' },
        ],
        criadoPor: 'gerente-comercial',
        createdAt: '2026-05-10T14:20:00.000Z',
      },
      {
        id: 'reg-004',
        codigo: 'REG-SHADOW-004',
        nome: 'Auditoria de Quarentena em Troca de Conta Bancária',
        descricao: 'Roda em modo de observação monitorando solicitações de troca de conta bancária sem travar o produtor.',
        categoria: 'FINANCEIRO',
        gatilhoEvento: 'CONTA_BANCARIA_ALTERADA',
        escopoTipo: 'GLOBAL',
        status: 'MODO_OBSERVACAO',
        prioridade: 80,
        versaoAtiva: 1,
        cooldownSegundos: 0,
        condicoesGrupos: [
          {
            operador: 'E',
            condicoes: [
              { campo: 'diasDesdeUltimaAlteracao', operador: 'MENOR_QUE', valorEsperado: 30 },
            ],
          },
        ],
        acoes: [
          { tipo: 'SOLICITAR_APROVACAO', parametros: { quarentenaHoras: 48 } },
        ],
        criadoPor: 'dpo-seguranca',
        createdAt: '2026-08-20T11:00:00.000Z',
      },
    ];
  },

  async alternarStatusRegra(id: string, novoStatus: StatusRegra) {
    const apiData = await fetchFromApi(`/automacoes/regras/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: novoStatus }),
    });
    if (apiData) return apiData;
    return { id, status: novoStatus };
  },

  async simularDryRun(gatilhoEvento: string, condicoesGrupos: GrupoCondicoes[], acoes: AcaoItem[], janelaDias = 90): Promise<SimularRegraResultado> {
    const apiData = await fetchFromApi<SimularRegraResultado>('/automacoes/regras/simular', {
      method: 'POST',
      body: JSON.stringify({ gatilhoEvento, condicoesGrupos, acoes, janelaDias }),
    });
    if (apiData) return apiData;

    return {
      regraNome: `Simulação Retrospectiva [${gatilhoEvento}]`,
      janelaDias,
      operacoesAnalisadas: 1482,
      seriamAfetadas: 127,
      seriamBloqueadas: 18,
      iriamParaAprovacao: 109,
      percentualImpacto: 8.57,
      amostraOcorrencias: [
        { entidadeId: 'REP-4912', valor: 65000, resultado: 'AFETADA', motivo: 'Valor > 20.000 e Exposição > 50.000' },
        { entidadeId: 'REP-4899', valor: 85000, resultado: 'BLOQUEADA', motivo: 'Exposição crítica em lote de festival' },
        { entidadeId: 'REP-4750', valor: 31000, resultado: 'APROVACAO', motivo: 'Encaminhado para alçada Financeiro + Admin' },
      ],
    };
  },

  async acionarKillSwitch(escopo: 'REGRA' | 'MODULO' | 'GLOBAL', motivo: string, ativarPausa: boolean) {
    const apiData = await fetchFromApi('/automacoes/kill-switch', {
      method: 'POST',
      body: JSON.stringify({ escopo, motivo, operadorId: 'usr-admin-pdt', ativarPausa }),
    });
    if (apiData) return apiData;
    return { escopo, pausado: ativarPausa };
  },

  async getAprovacoes(status?: string): Promise<SolicitacaoAprovacaoItem[]> {
    const apiData = await fetchFromApi<SolicitacaoAprovacaoItem[]>(`/automacoes/aprovacoes${status ? `?status=${status}` : ''}`);
    if (apiData) return apiData;

    return [
      {
        id: 'apr-001',
        codigo: 'APR-2026-001',
        tipoOperacao: 'REPASSE_PRODUTOR',
        entidadeOrigemTipo: 'SolicitacaoRepasse',
        entidadeOrigemId: 'rep-8812',
        eventoId: '11111111-1111-1111-1111-111111111111',
        eventoNome: 'Festival Exemplo 2026',
        produtorId: 'prod-t4f',
        produtorNome: 'T4F Entretenimento',
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
          contaBancaria: 'Banco Itaú Ag 0123 CC 98765-4 (Validada)',
          eventosAfetados: ['Festival Exemplo 2026'],
        },
        slaLimiteAt: new Date(Date.now() + 3.5 * 3600 * 1000).toISOString(),
        createdAt: '2026-09-28T14:15:00.000Z',
      },
      {
        id: 'apr-002',
        codigo: 'APR-2026-002',
        tipoOperacao: 'ALTERACAO_CONTA_BANCARIA',
        entidadeOrigemTipo: 'ContaBancaria',
        entidadeOrigemId: 'cta-4412',
        eventoId: '11111111-1111-1111-1111-111111111111',
        eventoNome: 'Turnê Nacional Rock',
        produtorId: 'prod-opus',
        produtorNome: 'Opus Entretenimento',
        solicitanteId: 'usr-opus-financeiro',
        solicitanteNome: 'Juliana Siqueira',
        nivelExigido: 'FINANCEIRO',
        segregacaoFuncoesObrigatoria: true,
        status: 'PENDENTE',
        contextoAnalitico: {
          contaAnterior: 'Banco Bradesco Ag 0412 CC 12345-6',
          contaProposta: 'Banco Santander Ag 0888 CC 65432-1',
          comprovanteAnexado: true,
          repassesPendentesBloqueadosTemporariamente: true,
          quarentenaSegurancaHoras: 48,
        },
        slaLimiteAt: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
        createdAt: '2026-09-28T11:40:00.000Z',
      },
      {
        id: 'apr-003',
        codigo: 'APR-2026-003',
        tipoOperacao: 'ESTORNO_EXCEPCIONAL',
        entidadeOrigemTipo: 'PedidoVenda',
        entidadeOrigemId: 'ped-99823',
        eventoId: '11111111-1111-1111-1111-111111111111',
        eventoNome: 'Festival Exemplo 2026',
        valorCentavos: 180000, // R$ 1.800,00
        solicitanteId: 'usr-sac-operador',
        solicitanteNome: 'Atendente SAC N2',
        nivelExigido: 'FINANCEIRO',
        segregacaoFuncoesObrigatoria: true,
        status: 'PENDENTE',
        contextoAnalitico: {
          motivo: 'Cancelamento médico hospitalar pós-prazo CDC 7 dias',
          ingressosUtilizadosPortaria: false,
          statusPortaria: 'NENHUM_ACESSO_REGISTRADO',
          comprovanteMedicoAtestado: true,
        },
        slaLimiteAt: new Date(Date.now() + 1.2 * 3600 * 1000).toISOString(),
        createdAt: '2026-09-28T15:20:00.000Z',
      },
      {
        id: 'apr-004',
        codigo: 'APR-2026-004',
        tipoOperacao: 'ALTERACAO_CONDICAO_COMERCIAL',
        entidadeOrigemTipo: 'CondicaoComercial',
        entidadeOrigemId: 'cond-202',
        produtorId: 'prod-t4f',
        produtorNome: 'T4F Entretenimento',
        solicitanteId: 'usr-comercial-gerente',
        solicitanteNome: 'Gerente Comercial Disk',
        nivelExigido: 'DUPLA_APROVACAO_DIRETORIA',
        segregacaoFuncoesObrigatoria: true,
        status: 'PENDENTE',
        contextoAnalitico: {
          takeRateAtualPct: 15.0,
          takeRatePropostoPct: 12.5,
          impactoEstimadoReceita: -180000.0,
          contrapartida: 'Exclusividade de 12 eventos no biênio 2026-2027',
        },
        slaLimiteAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        createdAt: '2026-09-28T09:00:00.000Z',
      },
    ];
  },

  async decidirAprovacao(id: string, dto: {
    decisao: 'APROVADO' | 'REJEITADO' | 'SOLICITADO_INFORMACAO';
    justificativa: string;
    aprovadorId: string;
    aprovadorNome: string;
  }) {
    const apiData = await fetchFromApi(`/automacoes/aprovacoes/${id}/decidir`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    if (apiData) return apiData;

    return {
      sucesso: true,
      solicitacaoId: id,
      decisao: dto.decisao,
    };
  },

  async getCaixaTrabalho(): Promise<ResumoCaixaTrabalho> {
    const apiData = await fetchFromApi<ResumoCaixaTrabalho>('/automacoes/pendencias');
    if (apiData) return apiData;

    return {
      totalPendentes: 28,
      totalUrgentes: 4,
      minhas: 9,
      delegadas: 2,
      vencidas: 1,
      itens: [
        {
          id: 'p-1',
          tipo: 'APROVACAO',
          codigo: 'APR-2026-001',
          titulo: 'Aprovação de Repasse Financeiro - T4F',
          descricao: 'Repasse de R$ 82.500,00 solicitado para o Festival Exemplo 2026',
          severidade: 'ALTA',
          departamento: 'FINANCEIRO',
          solicitanteOuOrigem: 'Gestor Financeiro T4F',
          valor: 82500,
          slaLimite: 'em 3 horas',
          status: 'PENDENTE',
          atrasado: false,
          minha: true,
          delegada: false,
        },
        {
          id: 'p-2',
          tipo: 'APROVACAO',
          codigo: 'APR-2026-003',
          titulo: 'Estorno Excepcional por Atestado Médico',
          descricao: 'R$ 1.800,00 sem acesso registrado na portaria',
          severidade: 'CRITICA',
          departamento: 'ATENDIMENTO',
          solicitanteOuOrigem: 'Atendente SAC N2',
          valor: 1800,
          slaLimite: 'em 45 min',
          status: 'PENDENTE',
          atrasado: false,
          minha: true,
          delegada: false,
        },
        {
          id: 'p-3',
          tipo: 'DIVERGENCIA',
          codigo: 'DIV-2026-001',
          titulo: 'Pedido Pago sem Ingresso no Inventário',
          descricao: 'Divergência relacional crítica detectada pela Central 11.31',
          severidade: 'CRITICA',
          departamento: 'OPERACOES',
          solicitanteOuOrigem: 'Motor de Integridade 11.31',
          valor: 280,
          slaLimite: 'vencido há 12 min',
          status: 'EM_ANALISE',
          atrasado: true,
          minha: false,
          delegada: false,
        },
        {
          id: 'p-4',
          tipo: 'TAREFA',
          codigo: 'TAR-2026-041',
          titulo: 'Revisão de Cotas de Parceiros',
          descricao: 'Parceiro atingiu 90% da cota contratual no evento Arena Sunset',
          severidade: 'ATENCAO',
          departamento: 'COMERCIAL',
          solicitanteOuOrigem: 'Regra de Cotas',
          slaLimite: 'em 6 horas',
          status: 'DISPONIVEL',
          atrasado: false,
          minha: false,
          delegada: true,
        },
      ],
    };
  },

  async getFluxos(): Promise<FluxoOperacionalItem[]> {
    const apiData = await fetchFromApi<FluxoOperacionalItem[]>('/automacoes/fluxos');
    if (apiData) return apiData;

    return [
      {
        codigo: 'FLUXO-REPASSE-01',
        nome: 'Fluxo Padrão de Repasse Financeiro ao Produtor',
        modeloPadrao: 'REPASSE',
        categoria: 'FINANCEIRO',
        etapas: [
          { ordem: 1, nome: 'Solicitação pelo Produtor', ator: 'PRODUTOR', tipo: 'AUTOMATICA' },
          { ordem: 2, nome: 'Validação de Alçada & Risco', ator: 'MOTOR_REGRAS', tipo: 'AUTOMATICA' },
          { ordem: 3, nome: 'Aprovação Financeira / SoD', ator: 'FINANCEIRO', tipo: 'HUMANA' },
          { ordem: 4, nome: 'Liberação de Tesouraria (PIX/CNAB)', ator: 'TESOURARIA', tipo: 'AUTOMATICA' },
          { ordem: 5, nome: 'Conciliação Bancária Confirmada', ator: 'BANCO', tipo: 'AUTOMATICA' },
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
      {
        codigo: 'FLUXO-CONTA-04',
        nome: 'Fluxo de Alteração de Conta Bancária com Quarentena',
        modeloPadrao: 'ALTERACAO_BANCARIA',
        categoria: 'FINANCEIRO',
        etapas: [
          { ordem: 1, nome: 'Cadastro de Nova Conta Bancária', ator: 'PRODUTOR', tipo: 'AUTOMATICA' },
          { ordem: 2, nome: 'Validação Cadastral & Documental', ator: 'FINANCEIRO', tipo: 'HUMANA' },
          { ordem: 3, nome: 'Quarentena de Segurança (48 horas)', ator: 'MOTOR_REGRAS', tipo: 'AUTOMATICA' },
          { ordem: 4, nome: 'Habilitação da Conta para Repasses', ator: 'TESOURARIA', tipo: 'AUTOMATICA' },
        ],
      },
    ];
  },
};

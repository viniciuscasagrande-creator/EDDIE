export type SeveridadeDivergencia = 'INFORMATIVA' | 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';
export type SituacaoDivergencia = 'NOVA' | 'EM_ANALISE' | 'AGUARDANDO_INFORMACAO' | 'EM_CORRECAO' | 'CORRIGIDA' | 'ACEITA' | 'ENCERRADA';
export type ResponsavelDominio = 'FINANCEIRO' | 'CONTABILIDADE' | 'OPERACOES' | 'PORTARIA' | 'MARKETING' | 'ATENDIMENTO' | 'TECNOLOGIA';
export type ClassificacaoDado = 'PUBLICO' | 'INTERNO' | 'CONFIDENCIAL' | 'FINANCEIRO' | 'DADO_PESSOAL' | 'DADO_SENSIVEL' | 'RESTRITO';

export interface StatusDominioItem {
  dominio: string;
  status: 'OPERACIONAL' | 'DEGRADADO' | 'ATENCAO';
  divergenciasQtd: number;
  detalhe: string;
}

export interface VisaoGeralGovernanca {
  registrosVerificados: number;
  divergenciasAbertas: number;
  divergenciasCriticas: number;
  divergenciasEmInvestigacao: number;
  divergenciasCorrigidasHoje: number;
  statusDominios: StatusDominioItem[];
}

export interface CamadaConciliacaoItem {
  camada: string;
  valorEsperado: number;
  valorRegistrado: number;
  status: 'CONCILIADO' | 'DIVERGENTE';
  detalhe: string;
}

export interface ConciliacaoSistemica {
  eventoId: string;
  eventoNome: string;
  valorBrutoPedido: number;
  valorBrutoPagamento: number;
  mdrPrevisto: number;
  valorEsperadoBanco: number;
  valorRecebidoBanco: number;
  divergenciaRealLiquida: number;
  camadas: CamadaConciliacaoItem[];
}

export interface DivergenciaItem {
  id: string;
  codigoDivergencia: string;
  tipo: string;
  camadaOrigem: string;
  camadaDestino: string;
  eventoId?: string;
  eventoNome?: string;
  produtorId?: string;
  produtorNome?: string;
  valorEnvolvido: number;
  severidade: SeveridadeDivergencia;
  responsavelDominio: ResponsavelDominio;
  situacao: SituacaoDivergencia;
  descricaoProblema: string;
  detalhesTecnicos?: Record<string, unknown>;
  dataDeteccao: string;
  prazoResolucao?: string;
}

export interface TratarDivergenciaDto {
  novaSituacao: SituacaoDivergencia;
  acaoAplicada: string;
  justificativa: string;
  responsavelUsuarioId: string;
}

export interface LinhagemNo {
  id: string;
  label: string;
  categoria: string;
  origem: string;
  valor?: number | string;
  filhos?: LinhagemNo[];
}

export interface CentroInvestigacaoResultado {
  termoBuscado: string;
  entidadeEncontrada: boolean;
  cliente: {
    nome: string;
    documentoMascarado: string;
    emailMascarado: string;
    telefoneMascarado: string;
  };
  pedido: {
    pedidoId: string;
    status: string;
    totalCentavos: number;
    createdAt: string;
  };
  pagamento: {
    pagamentoId: string;
    status: string;
    adquirente: string;
    nsu: string;
    tid: string;
  };
  ingressos: Array<{
    ingressoId: string;
    titular: string;
    codigoValidacao: string;
    status: string;
  }>;
  checkin?: {
    portaria: string;
    checkinAt: string;
    catraca: string;
  };
  ledger: {
    lancamentoId: string;
    valor: number;
    tipo: string;
    balanceado: boolean;
  };
  contabilidade: {
    loteContabilId: string;
    debito: number;
    credito: number;
    status: string;
  };
  liquidacao?: {
    repasseId: string;
    banco: string;
    status: string;
    ordemPagamento: string;
  };
  linhaDoTempo: Array<{
    hora: string;
    evento: string;
    modulo: string;
    correlationId: string;
    status: string;
  }>;
}

export interface CatalogoIndicadorItem {
  id: string;
  termoCodigo: string;
  nomeOficial: string;
  definicaoCorporativa: string;
  formulaCalculo?: string;
  donoDadoResponsavel: ResponsavelDominio;
  classificacaoDado: ClassificacaoDado;
  frequenciaAtualizacao: string;
  fontesSistemas: string[];
  utilizadoEm: string[];
}

export interface RegistroAuditoriaItem {
  id: string;
  correlationId: string;
  modulo: string;
  acao: string;
  usuarioId: string;
  usuarioNome: string;
  ipOrigem?: string;
  eventoId?: string;
  produtorId?: string;
  entidadeTipo: string;
  entidadeId: string;
  valorAntes?: Record<string, unknown>;
  valorDepois?: Record<string, unknown>;
  motivoJustificativa: string;
  aprovadorUsuarioId?: string;
  dadosSensiveisAcessados: boolean;
  quantidadeRegistrosExportados?: number;
  createdAt: string;
}

export interface IntegracaoItem {
  nome: string;
  categoria: string;
  status: 'OPERACIONAL' | 'DEGRADADA' | 'FORA_DO_AR';
  latenciaMs: number;
  taxaErroPct: number;
  filaPendenteQtd: number;
  ultimoSucesso: string;
  ultimoErro?: string;
}

export interface EventosInternosMetricas {
  outboxPendente: number;
  falhasProcessamento: number;
  filaErrosDlq: number;
  atrasoMedioProcessamentoSegundos: number;
  reprocessamentoSeguroHabilitado: boolean;
}

export interface SaudeIntegracoesResponse {
  integracoes: IntegracaoItem[];
  eventosInternos: EventosInternosMetricas;
}

export interface GateFechamentoGovernancaResultado {
  eventoId: string;
  aprovadoParaFechamento: boolean;
  divergenciasCriticasAbertas: number;
  divergenciasAltasAbertas: number;
  bloqueios: string[];
}

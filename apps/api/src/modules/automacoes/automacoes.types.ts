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

export type OperadorLogico = 'E' | 'OU';

export type OperadorComparacao =
  | 'MAIOR_QUE'
  | 'MENOR_QUE'
  | 'MAIOR_OU_IGUAL'
  | 'MENOR_OU_IGUAL'
  | 'IGUAL'
  | 'DIFERENTE'
  | 'CONTEM'
  | 'EM';

export interface CondicaoItem {
  campo: string;
  operador: OperadorComparacao;
  valorEsperado: unknown;
}

export interface GrupoCondicoes {
  operador: OperadorLogico;
  condicoes: CondicaoItem[];
}

export type TipoAcaoAutomacao =
  | 'NOTIFICAR'
  | 'SOLICITAR_APROVACAO'
  | 'BLOQUEAR_OPERACAO'
  | 'LIBERAR_OPERACAO'
  | 'ATUALIZAR_SITUACAO'
  | 'CRIAR_ALERTA'
  | 'CRIAR_TAREFA'
  | 'REPROCESSAR_INTEGRACAO'
  | 'ACIONAR_WEBHOOK';

export interface AcaoAutomacaoItem {
  tipo: TipoAcaoAutomacao;
  parametros: Record<string, unknown>;
  alçadaExigida?: NivelAprovacao;
}

export interface CriarRegraDto {
  codigo: string;
  nome: string;
  descricao: string;
  categoria: CategoriaRegra;
  gatilhoEvento: string;
  escopoTipo: 'GLOBAL' | 'PRODUTOR' | 'EVENTO' | 'CANAL' | 'PARCEIRO';
  escopoId?: string;
  prioridade?: number;
  cooldownSegundos?: number;
  status?: StatusRegra;
  condicoesGrupos: GrupoCondicoes[];
  acoes: AcaoAutomacaoItem[];
  criadoPor: string;
  motivoAlteracao?: string;
}

export interface SimularRegraDryRunDto {
  gatilhoEvento: string;
  condicoesGrupos: GrupoCondicoes[];
  acoes: AcaoAutomacaoItem[];
  janelaDias?: number; // 30, 60, 90
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

export interface KillSwitchDto {
  escopo: 'REGRA' | 'MODULO' | 'GLOBAL';
  alvoId?: string; // regraId ou nome do modulo
  motivo: string;
  operadorId: string;
  ativarPausa: boolean;
}

export interface SolicitarAprovacaoDto {
  codigo?: string;
  tipoOperacao: TipoOperacaoAprovacao;
  entidadeOrigemTipo: string;
  entidadeOrigemId: string;
  eventoId?: string;
  produtorId?: string;
  valorCentavos?: number;
  solicitanteId: string;
  solicitanteNome: string;
  contextoAnalitico?: Record<string, unknown>;
  segregacaoFuncoesObrigatoria?: boolean;
  prazoMaximoHoras?: number;
}

export interface DecidirAprovacaoDto {
  decisao: 'APROVADO' | 'REJEITADO' | 'SOLICITADO_INFORMACAO';
  justificativa: string;
  aprovadorId: string;
  aprovadorNome: string;
  ipOrigem?: string;
}

export interface DelegarAprovacaoDto {
  usuarioOrigemId: string;
  usuarioDelegadoId: string;
  departamento: string;
  dataInicio: string;
  dataFim: string;
  motivo: string;
}

export interface CaixaTrabalhoItem {
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
  itens: CaixaTrabalhoItem[];
}

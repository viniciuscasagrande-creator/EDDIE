export enum TipoDocumentoDtoEnum {
  CONTRATO = 'CONTRATO',
  ADITIVO = 'ADITIVO',
  BORDERO = 'BORDERO',
  SOLICITACAO_REPASSE = 'SOLICITACAO_REPASSE',
  ANTECIPACAO = 'ANTECIPACAO',
  TERMO = 'TERMO',
  DECLARACAO = 'DECLARACAO',
  COMPROVANTE = 'COMPROVANTE',
  RELATORIO = 'RELATORIO',
  FECHAMENTO_EVENTO = 'FECHAMENTO_EVENTO',
  DOCUMENTO_FISCAL = 'DOCUMENTO_FISCAL',
  DOCUMENTO_BANCARIO = 'DOCUMENTO_BANCARIO',
  DOCUMENTO_OPERACIONAL = 'DOCUMENTO_OPERACIONAL',
  DOCUMENTO_PARCEIRO = 'DOCUMENTO_PARCEIRO',
}

export enum SituacaoDocumentoDtoEnum {
  RASCUNHO = 'RASCUNHO',
  EM_ELABORACAO = 'EM_ELABORACAO',
  AGUARDANDO_APROVACAO = 'AGUARDANDO_APROVACAO',
  APROVADO = 'APROVADO',
  AGUARDANDO_ASSINATURA = 'AGUARDANDO_ASSINATURA',
  PARCIALMENTE_ASSINADO = 'PARCIALMENTE_ASSINADO',
  ASSINADO = 'ASSINADO',
  VIGENTE = 'VIGENTE',
  SUBSTITUIDO = 'SUBSTITUIDO',
  CANCELADO = 'CANCELADO',
  EXPIRADO = 'EXPIRADO',
  ARQUIVADO = 'ARQUIVADO',
}

export enum ClassificacaoSensibilidadeDtoEnum {
  INTERNO = 'INTERNO',
  CONFIDENCIAL = 'CONFIDENCIAL',
  FINANCEIRO = 'FINANCEIRO',
  CONTRATUAL = 'CONTRATUAL',
  DADO_PESSOAL = 'DADO_PESSOAL',
  RESTRITO = 'RESTRITO',
}

export class CriarDocumentoDto {
  tipo!: TipoDocumentoDtoEnum;
  titulo!: string;
  produtorId?: string;
  produtorNome?: string;
  eventoId?: string;
  eventoNome?: string;
  parceiroId?: string;
  parceiroNome?: string;
  tipoOperacaoOrigem?: string;
  idOperacaoOrigem?: string;
  origemDescricao!: string;
  sensibilidade?: ClassificacaoSensibilidadeDtoEnum;
  vigenciaInicio?: string;
  vigenciaFim?: string;
  conteudoTexto?: string;
  metadados?: Record<string, unknown>;
  ordemAssinatura?: 'SEQUENCIAL' | 'PARALELA';
  regraFinanceiraUltimoAssinante?: boolean;
  signatarios?: Array<{
    nome: string;
    email: string;
    documentoIdentificacao: string;
    papel: string;
    ordem?: number;
    metodoAutenticacao?: string;
  }>;
}

export class DecidirAprovacaoDocumentoDto {
  aprovado!: boolean;
  motivo?: string;
}

export class ContestarDocumentoDto {
  motivo!: string;
  solicitanteNome!: string;
}

export class VisualizarDocumentoQueryDto {
  aplicarMarcaDagua?: boolean;
  usuarioVisualizador?: string;
}

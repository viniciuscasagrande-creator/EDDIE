/**
 * EDDIE 11.38 — FISCAL, TRIBUTÁRIO, DOCUMENTOS FISCAIS E OBRIGAÇÕES
 * Tipagem canônica e DTOs do Motor Fiscal e Tributário Especializado.
 *
 * Princípios Invioláveis:
 * 1. VENDA DO INGRESSO ≠ RECEITA DA DISK ≠ BASE TRIBUTÁVEL DA DISK.
 *    Dinheiro movimentado no banco/caixa não é receita própria nem base tributável.
 * 2. Reforma Tributária (LC 214/2025, LC 227/2026, IBS/CBS): Regras parametrizadas e versionadas por vigência.
 * 3. NFS-e e Provedores Fiscais: Emissão com chave idempotente, XML autorizado na Central 11.35.
 * 4. Retenções Tributárias não são descontos comerciais.
 * 5. Apuração com Memória de Cálculo e Drill-Down rastreável.
 * 6. Fiscal de Entrada & Three-Way Match (Contrato ↔ Documento Fiscal ↔ Pagamento).
 * 7. Obrigações integradas à Tesouraria 11.36 para recolhimento.
 * 8. Conciliação Fiscal em 4 Pontos.
 * 9. CNPJ em string normalizada (compatível com CNPJ alfanumérico).
 */

export type TaxSphere = 'MUNICIPAL' | 'FEDERAL' | 'ESTADUAL';
export type TaxType = 'DIRETO' | 'INDIRETO' | 'CONTRIBUICAO';

export type FiscalOperationType =
  | 'INTERMEDIACAO_VENDA'
  | 'TAXA_CONVENIENCIA'
  | 'SERVICO_PLATAFORMA'
  | 'DESPESA_FORNECEDOR';

export type TaxRegime =
  | 'LUCRO_PRESUMIDO'
  | 'LUCRO_REAL'
  | 'SIMPLES_NACIONAL'
  | 'REFORMA_TRIBUTARIA';

export type FiscalDocStatus =
  | 'PENDENTE'
  | 'EM_PROCESSAMENTO'
  | 'AUTORIZADO'
  | 'REJEITADO'
  | 'CANCELAMENTO_SOLICITADO'
  | 'CANCELADO'
  | 'SUBSTITUIDO'
  | 'ERRO';

export type ThreeWayMatchStatus =
  | 'CORRESPONDENCIA_EXATA'
  | 'DIVERGENCIA_VALOR'
  | 'DIVERGENCIA_FORNECEDOR'
  | 'PENDENTE_VALIDACAO';

export interface TributoDto {
  id: string;
  codigo: string;
  nome: string;
  esfera: TaxSphere;
  tipo: TaxType;
  aliquotaReferencia: number;
  vigenciaInicio: string;
  vigenciaFim?: string | null;
  ativo: boolean;
}

export interface ItemRegraTributariaDto {
  id?: string;
  tributoCodigo: string;
  basePercentual: number;
  aliquotaPercentual: number;
  retencao: boolean;
  responsavelRetencao: 'TOMADOR' | 'PRESTADOR';
}

export interface RegraTributariaDto {
  id: string;
  codigo: string;
  versao: number;
  descricao: string;
  operacaoTipo: FiscalOperationType;
  regimeTributario: TaxRegime;
  municipioIncidencia?: string | null;
  ufIncidencia?: string | null;
  status: 'RASCUNHO' | 'VIGENTE' | 'EXPIRADA' | 'REVOGADA';
  exigeNfse: boolean;
  politicaRetencao: string;
  vigenciaInicio: string;
  vigenciaFim?: string | null;
  criadoPor: string;
  aprovadoPor?: string | null;
  itens: ItemRegraTributariaDto[];
}

export interface SimulacaoFiscalInputDto {
  operacaoTipo: FiscalOperationType;
  valorBrutoCents: number;
  valorTaxaDiskCents?: number;
  tomadorCpfCnpj: string;
  municipioTomador?: string;
  regimeTributario?: TaxRegime;
  dataCompetencia?: string;
}

export interface SimulacaoFiscalResultDto {
  sucesso: boolean;
  regraAplicada: {
    codigo: string;
    versao: number;
    regimeTributario: string;
    exigeNfse: boolean;
  };
  valorBrutoTotalCents: number;
  baseCalculoDiskCents: number;
  recursosTerceirosNaoTributaveisCents: number;
  tributosCalculados: {
    tributoCodigo: string;
    esfera: string;
    baseCalculoCents: number;
    aliquotaPercentual: number;
    valorTributoCents: number;
    retencao: boolean;
    responsavel: string;
  }[];
  totalTributosDevidosCents: number;
  totalRetencoesCents: number;
  valorLiquidoNfseCents: number;
  valorReceitaProdutorCents?: number;
  baseCalculoTributavelCents?: number;
  valorTributosPropriosCents?: number;
  alertas: string[];
}

export interface ComparativoReformaTributariaDto {
  operacao: string;
  valorBrutoCents: number;
  baseCalculoDiskCents: number;
  regimeAtual: {
    nome: string;
    pisCents: number;
    cofinsCents: number;
    issCents: number;
    totalTributosCents: number;
    aliquotaEfetiva: number;
    baseCalculoCentavos?: number;
  };
  reformaTributariaLC214: {
    nome: string;
    cbsCents: number;
    ibsCents: number;
    cbsCentavos?: number;
    ibsCentavos?: number;
    impostoSeletivoCents: number;
    totalTributosCents: number;
    aliquotaEfetiva: number;
    baseCalculoCentavos?: number;
    fundamentoLegal?: string;
  };
  variacaoTributariaCents: number;
  impactoPercentual: number;
  parecerCompliance: string;
}

export interface ItemDocumentoFiscalDto {
  id: string;
  descricao: string;
  valorCentavos: number;
  baseCalculoCentavos: number;
  aliquota: number;
  valorTributoCentavos: number;
  tributoCodigo: string;
}

export interface RetencaoTributariaDto {
  id: string;
  tributoCodigo: string;
  baseCalculoCentavos: number;
  aliquotaPercentual: number;
  valorRetidoCentavos: number;
  responsavelRecolhimento: 'TOMADOR' | 'PRESTADOR';
  competencia: string;
  status: 'APURADA' | 'RECOLHIDA' | 'COMPENSADA';
}

export interface DocumentoFiscalDto {
  id: string;
  chaveFiscal: string;
  numero?: string | null;
  serie?: string | null;
  tipo: string;
  prestadorCnpj: string;
  tomadorCpfCnpj: string;
  tomadorNome: string;
  competencia: string;
  valorTotalCentavos: number;
  baseCalculoCentavos: number;
  valorTributosCentavos: number;
  valorLiquidoCentavos: number;
  status: FiscalDocStatus;
  protocoloAutorizacao?: string | null;
  xmlAutorizado?: string | null;
  motivoRejeicao?: string | null;
  origemTipo: string;
  origemReferenciaId: string;
  contratoId?: string | null;
  eventoId?: string | null;
  produtorId?: string | null;
  dataEmissao: string;
  dataAutorizacao?: string | null;
  itens: ItemDocumentoFiscalDto[];
  retencoes: RetencaoTributariaDto[];
}

export interface ApuracaoTributariaDto {
  id: string;
  codigo: string;
  competencia: string;
  tributoCodigo: string;
  valorFaturamentoCentavos: number;
  baseCalculoCentavos: number;
  debitosCentavos: number;
  creditosCentavos: number;
  retencoesCentavos: number;
  valorApuradoCentavos: number;
  status: 'EM_REVISAO' | 'CONCLUIDA' | 'FECHADA';
  memoriaCalculo: {
    totalDocumentosConsiderados: number;
    documentosIds: string[];
    aliquotaMediaEfetiva: number;
    justificativaCreditos?: string;
  };
  fechadoPor?: string | null;
  fechadoEm?: string | null;
}

export interface ObrigacaoFiscalDto {
  id: string;
  codigo: string;
  tipo: 'PRINCIPAL' | 'ACESSORIA';
  tributoCodigo?: string | null;
  descricao: string;
  competencia: string;
  dataVencimento: string;
  valorPrevistoCentavos: number;
  valorEfetivoCentavos: number;
  status: 'PENDENTE' | 'EM_PREPARACAO' | 'AGUARDANDO_PAGAMENTO' | 'PAGA_CUMPRIDA' | 'ATRASADA';
  guiaCodigoBarras?: string | null;
  tituloPagarId?: string | null;
  comprovanteDocumentoId?: string | null;
  cumpridoPor?: string | null;
  cumpridoEm?: string | null;
}

export interface ThreeWayMatchResultDto {
  fornecedorNome: string;
  fornecedorCnpj: string;
  documentoFiscalNumero: string;
  eventoId?: string | null;
  alocacaoEventoId?: string | null;
  valorContratoCentavos: number;
  valorDocumentoFiscalCentavos: number;
  valorPagamentoCentavos: number;
  diferencaCentavos: number;
  status: ThreeWayMatchStatus;
  aprovado?: boolean;
  divergenciaMotivo?: string;
  divergencias?: string[];
  validadoEm: string;
}

export interface ConciliacaoQuatroPontosDto {
  competencia: string;
  pontos: {
    ponto: 'OPERACAO_DOCUMENTO' | 'DOCUMENTO_CONTABILIDADE' | 'CONTABILIDADE_APURACAO' | 'APURACAO_PAGAMENTO';
    descricao: string;
    origemDescricao: string;
    destinoDescricao: string;
    valorOrigemCentavos: number;
    valorDestinoCentavos: number;
    diferencaCentavos: number;
    status: 'CONCILIADO' | 'DIVERGENTE';
    diagnostico: string;
  }[];
  statusGeral: 'CONFORME' | 'COM_DIVERGENCIAS';
  totalDivergenciasCriticas: number;
}

export interface ConformidadeFiscalSummaryDto {
  competencia: string;
  operacoesSemClassificacao: number;
  documentosAusentes: number;
  documentosRejeitados: number;
  divergenciasFiscalContabil: number;
  regrasExpirandoEm60Dias: number;
  obrigaçõesProximasVencimento: number;
  certificadosProximosExpiracao: number;
  statusConformidade: 'EXCELENTE' | 'ATENCAO' | 'CRITICO';
  pendenciasDetalhadas: {
    id: string;
    tipo: string;
    severidade: string;
    descricao: string;
    competencia: string;
    status: string;
  }[];
}

export interface RastrearDocumentoFiscal360Dto {
  documento: DocumentoFiscalDto;
  origemOperacional: {
    pedidoId?: string;
    pedidoCodigo?: string;
    eventoNome?: string;
    produtorNome?: string;
    contratoCodigo?: string;
    valorGmvCentavos: number;
    recursosTerceirosCentavos: number;
  };
  reflexoContabil: {
    lancamentoId?: string;
    numeroLancamento?: number;
    competencia?: string;
    statusContabil?: string;
  };
  apuracaoTributaria: {
    apuracaoCodigo?: string;
    tributosApurados: string[];
    valorApuradoCentavos: number;
  };
  liquidacaoFinanceira: {
    obrigacaoId?: string;
    guiaCodigo?: string;
    pagamentoTesourariaId?: string;
    bancoLiquidador?: string;
    statusPagamento?: string;
  };
  timelineForense: {
    ordem: number;
    etapa: string;
    descricao: string;
    dataHora: string;
    responsavel: string;
  }[];
}

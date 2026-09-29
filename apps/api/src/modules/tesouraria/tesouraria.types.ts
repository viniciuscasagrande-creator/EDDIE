import {
  BancoCodigo,
  LayoutCnab,
  StatusRemessaCnab,
  StatusItemCnab,
  StatusPixPayout,
  TipoChavePix,
  TipoOrdemPagamento,
  StatusOrdemPagamento,
  MetodoOrdemPagamento,
  NivelConciliacao,
  StatusConciliacaoRegistro,
  CenarioProjecaoCaixa,
  TipoTransferencia,
  TipoFechamentoCaixa,
} from '@ticketing/contracts';

export type {
  BancoCodigo,
  LayoutCnab,
  StatusRemessaCnab,
  StatusItemCnab,
  StatusPixPayout,
  TipoChavePix,
  TipoOrdemPagamento,
  StatusOrdemPagamento,
  MetodoOrdemPagamento,
  NivelConciliacao,
  StatusConciliacaoRegistro,
  CenarioProjecaoCaixa,
  TipoTransferencia,
  TipoFechamentoCaixa,
};

export interface ContaBancaria {
  id: string;
  bancoCodigo: BancoCodigo;
  bancoNome: string;
  agencia: string;
  conta: string;
  digito: string;
  tipo: 'CORRENTE' | 'APLICACAO' | 'PAGAMENTO';
  finalidade?: string;
  tipoTitularidade?: string;
  titular: string;
  cnpj: string;
  saldoReal: number;
  saldoConciliado: number;
  saldoBloqueado: number;
  saldoDisponivel: number;
  saldoEmLiquidacao: number;
  ultimaSincronizacao: string;
  status: 'ATIVA' | 'INATIVA' | 'BLOQUEADA';
}

export interface ItemRemessaCnab {
  id: string;
  favorecidoNome: string;
  favorecidoCpfCnpj: string;
  bancoDestino: string;
  agenciaDestino: string;
  contaDestino: string;
  chavePix: string | null;
  tipoChavePix: TipoChavePix | null;
  valorCentavos: number;
  referenciaEventoId: string;
  produtorId: string;
  status: StatusItemCnab;
  codigoOcorrenciaRetorno: string | null;
  mensagemRetorno: string | null;
  liquidadoEm: string | null;
}

export interface LoteRemessaCnab {
  id: string;
  bancoCodigo: BancoCodigo;
  layout: LayoutCnab;
  sequencialArquivo: number;
  totalItens: number;
  valorTotalCentavos: number;
  status: StatusRemessaCnab;
  sha256Hash: string;
  conteudoArquivoMock: string;
  itens: ItemRemessaCnab[];
  criadoPor: string;
  criadoEm: string;
  processadoEm: string | null;
}

export interface PixPayout {
  id: string;
  e2eId: string;
  produtorId: string;
  produtorNome: string;
  eventoId: string;
  eventoNome: string;
  valorCentavos: number;
  chavePix: string;
  tipoChave: TipoChavePix;
  status: StatusPixPayout;
  idempotencyKey: string;
  tarifaPixCentavos: number;
  comprovanteAutenticacao: string;
  criadoEm: string;
  liquidadoEm: string | null;
}

export interface PosicaoConsolidadaTesouraria {
  totalSaldoBancarioRealCentavos: number;
  totalSaldoDisponivelCentavos: number;
  totalSaldoBloqueadoCentavos: number;
  totalEmLiquidacaoCentavos: number;
  totalAplicacoesLiquidezDiariaCentavos: number;
  totalRepassesPendentesCentavos: number;
  indiceCoberturaImediata: number;
  dataHora: string;
  contas: ContaBancaria[];
}

// ============================================================================
//  DTOs EDDIE 11.25 Legados Mantidos para Retrocompatibilidade
// ============================================================================

export interface GerarRemessaDto {
  bancoCodigo: BancoCodigo;
  layout: LayoutCnab;
  itens: {
    favorecidoNome: string;
    favorecidoCpfCnpj: string;
    bancoDestino: string;
    agenciaDestino: string;
    contaDestino: string;
    chavePix?: string;
    tipoChavePix?: TipoChavePix;
    valorCentavos: number;
    referenciaEventoId: string;
    produtorId: string;
  }[];
  criadoPor: string;
}

export interface ProcessarRetornoDto {
  loteRemessaId: string;
  bancoCodigo: BancoCodigo;
  linhasRetorno: string[];
  processadoPor: string;
}

export interface ExecutarPixDto {
  produtorId: string;
  produtorNome: string;
  eventoId: string;
  eventoNome: string;
  valorCentavos: number;
  chavePix: string;
  tipoChave: TipoChavePix;
  idempotencyKey: string;
  executadoPor: string;
  documentoId?: string;
  simularTimeoutBancario?: boolean;
}

// ============================================================================
//  Novos DTOs & Interfaces EDDIE 11.36
// ============================================================================

export interface SubcontaEventoSegregada {
  eventoId: string;
  eventoNome: string;
  produtorId: string;
  produtorNome: string;
  saldoCentavos: number;
  saldoDisponivelCentavos: number;
  saldoRetidoCentavos: number;
}

export interface PosicaoCaixaSegregadaDto {
  saldoBancarioRealCentavos: number;
  saldoConciliadoCentavos: number;
  saldoDisponivelCentavos: number;
  saldoComprometidoCentavos: number;
  saldoEmLiquidacaoCentavos: number;
  recursosPropriosDiskCentavos: number;
  recursosTerceirosProdutoresCentavos: number;
  valoresEmConciliacaoCentavos: number;
  subcontasEventos: SubcontaEventoSegregada[];
  contas: ContaBancaria[];
  dataHora: string;
}

export interface AgendaFinanceiraItem {
  id: string;
  dataPrevista: string;
  tipo: 'ENTRADA' | 'SAIDA';
  categoria: 'RECEBIVEL_ADQUIRENTE' | 'PIX_RECEBIDO' | 'REPASSE_PRODUTOR' | 'ANTECIPACAO' | 'FORNECEDOR' | 'TRIBUTO' | 'TARIFA';
  descricao: string;
  valorCentavos: number;
  status: string;
  contraparte: string;
}

export interface AgendaFinanceiraProjetadaDto {
  cenario: CenarioProjecaoCaixa;
  dataInicio: string;
  dataFim: string;
  posicaoInicialCentavos: number;
  totalEntradasPrevistasCentavos: number;
  totalSaidasPrevistasCentavos: number;
  posicaoFinalProjetadaCentavos: number;
  itens: AgendaFinanceiraItem[];
  fatoresEstresseAplicados?: { fator: string; impactoCentavos: number }[];
}

export interface RecebivelAdquirenteDto {
  id: string;
  adquirente: string;
  bandeira: string;
  modalidade: string;
  nsu: string;
  codigoAutorizacao?: string;
  eventoId?: string;
  produtorId?: string;
  dataVenda: string;
  dataPrevista: string;
  dataLiquidada?: string;
  valorBrutoCentavos: number;
  mdrTaxaEsperadaPercent: number;
  mdrValorEsperadoCentavos: number;
  mdrTaxaCobradaPercent?: number;
  mdrValorCobradoCentavos?: number;
  divergenciaCentavos: number;
  valorLiquidoCentavos: number;
  status: string;
}

export interface AuditarMdrDto {
  recebivelId: string;
  mdrTaxaCobradaPercent: number;
  mdrValorCobradoCentavos: number;
  auditadoPor: string;
}

export interface CriarOrdemPagamentoDto {
  tipo: TipoOrdemPagamento;
  metodo: MetodoOrdemPagamento;
  beneficiarioNome: string;
  beneficiarioCpfCnpj: string;
  beneficiarioChavePix?: string;
  beneficiarioBanco?: string;
  beneficiarioAgencia?: string;
  beneficiarioConta?: string;
  beneficiarioTipoConta?: string;
  valorCentavos: number;
  dataVencimento: string;
  idempotencyKey: string;
  documentoId?: string;
  documentoCodigo?: string;
  operacaoOrigem?: string;
  operacaoOrigemId?: string;
  eventoId?: string;
  produtorId?: string;
  contaBancariaId?: string;
  solicitadoPor: string;
}

export interface OrdemPagamentoDto {
  id: string;
  codigo: string;
  tipo: TipoOrdemPagamento;
  status: StatusOrdemPagamento;
  metodo: MetodoOrdemPagamento;
  beneficiarioNome: string;
  beneficiarioCpfCnpj: string;
  beneficiarioChavePix?: string;
  beneficiarioBanco?: string;
  beneficiarioAgencia?: string;
  beneficiarioConta?: string;
  beneficiarioTipoConta?: string;
  valorCentavos: number;
  dataVencimento: string;
  dataAgendada?: string;
  dataLiquidacao?: string;
  idempotencyKey: string;
  documentoId?: string;
  documentoCodigo?: string;
  operacaoOrigem?: string;
  operacaoOrigemId?: string;
  eventoId?: string;
  produtorId?: string;
  contaBancariaId?: string;
  lotePagamentoId?: string;
  endToEndId?: string;
  autenticacaoBancaria?: string;
  motivoRejeicao?: string;
  solicitadoPor: string;
  aprovadoPor?: string;
  executadoPor?: string;
  comprovanteUrl?: string;
  createdAt: string;
}

export interface AvancarStatusOrdemDto {
  novoStatus: StatusOrdemPagamento;
  operador: string;
  motivo?: string;
  autenticacaoBancaria?: string;
  endToEndId?: string;
  contaBancariaId?: string;
}

export interface CriarLotePagamentoDto {
  contaBancariaId: string;
  metodo: string;
  ordensIds: string[];
  solicitadoPor: string;
}

export interface LotePagamentoDto {
  id: string;
  codigo: string;
  status: string;
  contaBancariaId: string;
  metodo: string;
  quantidadeOrdens: number;
  valorTotalCentavos: number;
  saldoDisponivelNoMomentoCentavos: number;
  impactoSaldoProjetadoCentavos: number;
  sha256Hash?: string;
  solicitadoPor: string;
  aprovadoPor?: string;
  executadoPor?: string;
  executadoEm?: string;
  createdAt: string;
  ordens?: OrdemPagamentoDto[];
}

export interface ConciliacaoRegistroDto {
  contaBancariaId: string;
  nivel: NivelConciliacao;
  dataExtrato: string;
  descricaoExtrato: string;
  valorCentavos: number;
  tipo: 'ENTRADA' | 'SAIDA';
  correspondenciaTipo?: string;
  correspondenciaId?: string;
  status: StatusConciliacaoRegistro;
  diferencaCentavos?: number;
  justificativaDivergencia?: string;
  conciliadoPor: string;
}

export interface ConciliacaoItemDto {
  id: string;
  contaBancariaId: string;
  dataExtrato: string;
  saldoExtrato: number;
  saldoLedger: number;
  divergencia: number;
  status: string;
  nivel: string;
  correspondenciaTipo?: string;
  correspondenciaId?: string;
  diferencaCentavos: number;
  justificativaDivergencia?: string;
  divergenciasDetectadas: number;
  conciliadoPor: string;
  conciliadoEm: string;
}

export interface TransferenciaBancariaDto {
  contaOrigemId: string;
  contaDestinoId: string;
  valorCentavos: number;
  motivo: string;
  solicitadoPor: string;
}

export interface TransferenciaInternaLedgerDto {
  eventoOrigemId: string;
  eventoDestinoId: string;
  produtorOrigemId?: string;
  produtorDestinoId?: string;
  valorCentavos: number;
  motivo: string;
  justificativa: string;
  solicitadoPor: string;
}

export interface TimelineItemRastreamento {
  fase: string;
  titulo: string;
  descricao: string;
  dataHora: string;
  status: 'CONCLUIDO' | 'EM_ANDAMENTO' | 'PENDENTE' | 'ALERTA';
  detalhes?: Record<string, any>;
}

export interface RastreamentoResultadoDto {
  encontrado: boolean;
  tipoIdentificado: string;
  codigo: string;
  valorCentavos: number;
  beneficiario: string;
  origemOperacao: string;
  documentoFormal: { codigo?: string; assinado: boolean; status?: string };
  ordemPagamento: { codigo?: string; status?: string; metodo?: string };
  bancario: { banco?: string; endToEndId?: string; autenticacao?: string; liquidadoEm?: string };
  conciliacao: { status?: string; nivel?: string; conciliadoEm?: string };
  ledger: { registrado: boolean; subconta?: string };
  timeline: TimelineItemRastreamento[];
}

export interface FechamentoTesourariaDto {
  tipo: TipoFechamentoCaixa;
  dataReferencia: string;
  fechadoPor: string;
  checklist: { item: string; verificado: boolean; observacao?: string }[];
  ressalvas?: string[];
}

export interface CadastrarBeneficiarioDto {
  produtorId?: string;
  nome: string;
  cpfCnpj: string;
  tipoChavePix?: string;
  chavePix?: string;
  banco: string;
  agencia: string;
  conta: string;
  digito?: string;
  tipoConta?: string;
  aprovadoPor?: string;
  justificativa?: string;
}

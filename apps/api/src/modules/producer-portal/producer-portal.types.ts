export type SettlementStatus =
  | 'PREVISTO'
  | 'AGENDADO'
  | 'RESERVADO'
  | 'PROCESSANDO'
  | 'PAGO'
  | 'CONCILIADO'
  | 'BLOQUEADO';

export type RequestStatus =
  | 'PENDENTE'
  | 'EM_ANALISE'
  | 'APROVADO'
  | 'REJEITADO'
  | 'CONCLUIDO';

export type RequestCategory =
  | 'TRANSFERENCIA_EVENTOS'
  | 'ALTERACAO_DADOS_BANCARIOS'
  | 'CONTESTACAO_CHARGEBACK'
  | 'SOLICITACAO_DOCUMENTO'
  | 'ESCLARECIMENTO_REPASSE';

export interface ProducerHomeSummaryDto {
  producerId: string;
  consolidatedBalance: {
    disponivelCents: number;
    aReceberCents: number;
    reservadoEstornoCents: number;
    emLiquidacaoCents: number;
    bloqueadoCents: number;
    contabilCents: number;
    totalRecebidoAcumuladoCents: number;
  };
  proximoRepasse: {
    dataProgramada: string | null;
    valorEstimadoCents: number;
    status: SettlementStatus | null;
    eventoNome?: string | null;
  } | null;
  metricasOperacionais: {
    totalEventosAtivos: number;
    ingressosVendidosTotal: number;
    totalEstornosCents: number;
    totalChargebacksCents: number;
    taxaEfetivaMediaPercent: number;
  };
  solicitacoesAbertasCount: number;
  pendenciasCadastraisCount: number;
  notificacoesNaoLidasCount: number;
  lastUpdatedAt: string;
}

export interface ProducerEventItemDto {
  eventId: string;
  nome: string;
  slug: string;
  status: string;
  dataInicio: string;
  local: string;
  ingressosVendidos: number;
  capacidadeTotal: number;
  receitaBrutaCents: number;
  balance: {
    disponivelCents: number;
    retidoCents: number;
    reservadoEstornoCents: number;
    emLiquidacaoCents: number;
    bloqueadoCents: number;
    contabilCents: number;
  };
  taxaContratada: {
    modelo: 'PERCENTUAL' | 'FIXA';
    taxaPercentual?: number;
    taxaFixaCentavos?: number;
    versao: number;
  };
}

export interface ProducerStatementEntryDto {
  id: string;
  data: string;
  eventoId: string;
  eventoNome?: string;
  tipo: 'CREDITO' | 'DEBITO';
  categoria:
    | 'VENDA_INGRESSO'
    | 'TAXA_SERVICO'
    | 'TAXA_GATEWAY'
    | 'REPASSE_EFETUADO'
    | 'ESTORNO_COMPENSACAO'
    | 'CHARGEBACK_RETENCAO'
    | 'TRANSFERENCIA_ENTRADA'
    | 'TRANSFERENCIA_SAIDA'
    | 'DESPESA_OPERACIONAL';
  descricao: string;
  valorCents: number;
  saldoResultanteCents: number;
  referenciaId: string;
  status: 'CONFIRMADO' | 'PENDENTE';
}

export interface ProducerEventFeesDto {
  eventId: string;
  eventoNome: string;
  taxaVigente: {
    modelo: 'PERCENTUAL' | 'FIXA';
    taxaPercentual?: number;
    taxaFixaCentavos?: number;
    versao: number;
    vigenciaInicio: string;
    observacoes?: string;
  };
  historicoVersoes: Array<{
    versao: number;
    modelo: 'PERCENTUAL' | 'FIXA';
    taxaPercentual?: number;
    taxaFixaCentavos?: number;
    vigenciaInicio: string;
    vigenciaFim?: string;
    motivoAlteracao?: string;
  }>;
  preservacaoHistorica: boolean; // Confirma que vendas passadas mantiveram o snapshot de sua época
}

export interface ProducerSettlementDto {
  id: string;
  eventId: string | null;
  eventoNome?: string;
  valorBrutoBaseCents: number;
  retencoesTaxaCents: number;
  descontosAutorizadosCents: number;
  valorLiquidoCents: number;
  status: SettlementStatus;
  dataProgramada: string;
  dataLiquidacao: string | null;
  destinoBancarioMascarado: string;
  codigoRetornoBancario: string | null;
  temComprovante: boolean;
  comprovanteUrl?: string;
  referencia: string;
}

export interface TransferBetweenOwnEventsRequestDto {
  sourceEventId: string;
  targetEventId: string;
  amountCents: number;
  reason: string;
}

export interface TransferBetweenOwnEventsResultDto {
  protocolo: string;
  solicitadoEm: string;
  sourceEventId: string;
  targetEventId: string;
  amountCents: number;
  status: 'PENDENTE_APROVACAO' | 'APROVADO';
  saldoOrigemAntesCents: number;
  saldoOrigemDepoisCents: number;
  saldoDestinoAntesCents: number;
  saldoDestinoDepoisCents: number;
  mensagem: string;
}

export interface ProducerRefundItemDto {
  id: string;
  eventId: string;
  eventoNome?: string;
  pedidoNumero: string;
  valorCents: number;
  taxaDiskCents: number;
  motivo: string;
  dataSolicitacao: string;
  dataProcessamento: string | null;
  status: 'APROVADO' | 'PROCESSANDO' | 'CONCLUIDO';
  impactoSaldo: string;
}

export interface ProducerChargebackItemDto {
  id: string;
  eventId: string;
  eventoNome?: string;
  pedidoNumero: string;
  valorCents: number;
  dataNotificacao: string;
  prazoDefesaAte: string;
  status: 'EM_CONTESTACAO' | 'GANHO' | 'PERDIDO';
  motivoAlegado: string;
  reflexoFinanceiro: string;
}

export interface ProducerCashflowDto {
  periodo: string;
  realizado: {
    entradasCents: number;
    saidasTaxasCents: number;
    repassesEfetuadosCents: number;
    saldoLiquidoRealizadoCents: number;
    itens: Array<{
      data: string;
      descricao: string;
      tipo: 'ENTRADA' | 'SAIDA';
      valorCents: number;
    }>;
  };
  projetado: {
    entradasPrevistasCents: number;
    repassesAgendadosCents: number;
    saldoLiquidoProjetadoCents: number;
    itens: Array<{
      dataEstimada: string;
      descricao: string;
      tipo: 'RECEBIMENTO_PREVISTO' | 'REPASSE_AGENDADO';
      valorCents: number;
    }>;
  };
  avisoSegregacao: string;
}

export interface ProducerDreDto {
  producerId: string;
  eventId: string | null;
  periodo: string;
  receitaBrutaIngressosCents: number;
  ingressosVendidosTotal: number;
  taxasServicoDiskCents: number;
  taxasProcessamentoGatewayCents: number;
  estornosEChargebacksCents: number;
  repassesLiquidadosCents: number;
  despesasOperacionaisCadastradasCents: number;
  resultadoLiquidoProdutorCents: number;
  disclaimer: string;
}

export interface ProducerDocumentDto {
  id: string;
  titulo: string;
  categoria: 'COMPROVANTE_REPASSE' | 'EXTRATO_MENSAL' | 'CONTRATO_COMERCIAL' | 'INFORME_RENDIMENTOS' | 'RELATORIO_FECHAMENTO';
  eventoId?: string;
  dataEmissao: string;
  tamanhoBytes: number;
  formato: 'PDF' | 'CSV' | 'XLSX';
  downloadUrl: string;
}

export interface ProducerBankAccountDto {
  bancoNome: string;
  bancoCodigo: string;
  agenciaMascarada: string;
  contaMascarada: string;
  tipoConta: 'CORRENTE' | 'POUPANCA';
  titularNome: string;
  titularCpfCnpjMascarado: string;
  chavePixMascarada: string;
  statusVerificacao: 'VERIFICADA' | 'EM_ANALISE' | 'REJEITADA';
  ultimaAlteracaoEm: string;
  temSolicitacaoEmAndamento: boolean;
}

export interface BankAccountChangeRequestDto {
  bancoCodigo: string;
  bancoNome: string;
  agencia: string;
  conta: string;
  tipoConta: 'CORRENTE' | 'POUPANCA';
  titularNome: string;
  titularCpfCnpj: string;
  chavePix?: string;
  justificativa: string;
  documentoComprovanteUrl?: string;
}

export interface ProducerRequestItemDto {
  id: string;
  protocolo: string;
  categoria: RequestCategory;
  titulo: string;
  descricao: string;
  status: RequestStatus;
  criadoEm: string;
  atualizadoEm: string;
  respostaSuporte?: string;
  timeline: Array<{
    data: string;
    autor: string;
    evento: string;
    detalhes?: string;
  }>;
}

export interface ProducerNotificationDto {
  id: string;
  titulo: string;
  mensagem: string;
  categoria: 'REPASSE' | 'SALDO' | 'TAXA' | 'DOCUMENTO' | 'ALERTA';
  severidade: 'INFO' | 'AVISO' | 'URGENTE';
  lida: boolean;
  data: string;
  acaoUrl?: string;
}

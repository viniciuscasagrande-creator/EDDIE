/**
 * EDDIE 11.21 — ACCOUNTING & FISCAL INTELLIGENCE OS
 * Tipagem canônica e DTOs da Contabilidade Especializada.
 *
 * Princípios Invioláveis:
 * 1. Não duplica o Ledger Financeiro: a Contabilidade é escritural a partir dos fatos financeiros.
 * 2. Intermediação de Terceiros (CPC 47 / IFRS 15): Recurso do produtor NUNCA é receita da Disk.
 * 3. Partidas Dobradas: Sum(Débitos) === Sum(Créditos) estritamente.
 * 4. Competência e Receita Diferida: Apropriada somente quando política configurada exigir.
 * 5. Determinismo nas Regras: Sem regra confiável -> Central de Pendências.
 * 6. Imutabilidade em Período Fechado: Modificações exigem autorização formal e justificativa.
 * 7. Nenhuma obrigação tributária ou fiscal não documentada é inventada.
 */

export type AccountType = 'ativo' | 'passivo' | 'patrimonio_liquido' | 'receita' | 'despesa';
export type AccountNature = 'devedora' | 'credora';
export type EntryLineType = 'D' | 'C';

export type FinancialFactType =
  | 'VENDA_INGRESSO'
  | 'TAXA_CONVENIENCIA'
  | 'REPASSE_PRODUTOR'
  | 'ESTORNO_VENDA'
  | 'CHARGEBACK'
  | 'DESPESA_PRODUCAO'
  | 'TRANSFERENCIA_SALDO'
  | 'ADIANTAMENTO_ADVANCED';

export type RecognitionPolicy = 'IMEDIATO' | 'RECEITA_DIFERIDA';

export type ClosingStatus =
  | 'ABERTO'
  | 'EM_PREPARACAO'
  | 'EM_REVISAO'
  | 'COM_PENDENCIAS'
  | 'PRONTO_PARA_FECHAR'
  | 'FECHADO'
  | 'REABERTO_COM_AUTORIZACAO';

export type PendencyType =
  | 'SEM_REGRA_CLASSIFICACAO'
  | 'DIVERGENCIA_LEDGER'
  | 'COMPETENCIA_INCONSISTENTE'
  | 'CONTA_INVALIDA_OU_INATIVA'
  | 'PARTIDAS_DESBALANCEADAS'
  | 'DOCUMENTO_FALTANTE'
  | 'BLOQUEIO_FECHAMENTO';

export type PendencySeverity = 'BAIXO' | 'MEDIO' | 'ALTO' | 'CRITICO';
export type PendencyStatus = 'PENDENTE' | 'EM_ANALISE' | 'RESOLVIDO' | 'CANCELADO';

// ---------------------------------------------------------------------------
// 1. Plano de Contas
// ---------------------------------------------------------------------------

export interface ChartOfAccountsItemDto {
  id: string;
  codigo: string;
  nome: string;
  tipo: AccountType;
  natureza: AccountNature;
  nivel: number;
  analitica: boolean;
  contaPaiId?: string | null;
  ativa: boolean;
  versao: number;
  vigenciaInicio: string;
  vigenciaFim?: string | null;
  descricao?: string;
}

// ---------------------------------------------------------------------------
// 2. Regras de Classificação Contábil
// ---------------------------------------------------------------------------

export interface ClassificationRuleDto {
  id: string;
  fatoTipo: FinancialFactType;
  versao: number;
  descricao: string;
  contaDebitoCodigo: string;
  contaCreditoCodigo: string;
  contaTaxaCreditoCodigo?: string; // Para separação de intermediação
  politicaReconhecimento: RecognitionPolicy;
  contaReceitaDiferidaCodigo?: string;
  ativa: boolean;
  vigenciaInicio: string;
  vigenciaFim?: string | null;
  criadoPor: string;
  criadoEm: string;
}

export interface ClassifyFactInputDto {
  tenantId: string;
  fatoTipo: FinancialFactType;
  origemReferenciaId: string;
  data: string;
  competencia: string;
  valorBrutoCents: number;
  valorTaxaDiskCents?: number;
  valorRepasseProdutorCents?: number;
  eventoId?: string | null;
  produtorId?: string | null;
  historico: string;
  correlationId?: string;
  evidencias?: string[];
}

export interface ClassificationResultDto {
  sucesso: boolean;
  lancamentoId?: string;
  pendenciaId?: string;
  motivo?: string;
  regraVersaoAplicada?: number;
}

// ---------------------------------------------------------------------------
// 3. Lançamentos Contábeis (Partidas Dobradas)
// ---------------------------------------------------------------------------

export interface AccountingEntryLineDto {
  id: string;
  tipo: EntryLineType;
  valorCents: number;
  contaCodigo: string;
  contaNome: string;
  contaTipo: AccountType;
  natureza: AccountNature;
  historicoComplementar?: string | null;
}

export interface AccountingEntryDto {
  id: string;
  numeroLancamento: number;
  data: string;
  competencia: string;
  totalCents: number;
  historico: string;
  origemTipo: string;
  origemReferenciaId: string;
  eventoId?: string | null;
  produtorId?: string | null;
  regraVersao?: number | null;
  correlationId?: string;
  status: 'confirmado' | 'estornado' | 'reclassificado';
  criadoPor: string;
  createdAt: string;
  partidas: AccountingEntryLineDto[];
  estornoDeId?: string | null;
  documentoId?: string | null;
}

// ---------------------------------------------------------------------------
// 4. Receita Diferida e Competência por Evento
// ---------------------------------------------------------------------------

export interface DeferredRevenuePolicyDto {
  id: string;
  eventoId: string;
  ativo: boolean;
  dataRealizacaoEvento: string;
  contaReceitaDiferidaCodigo: string;
  contaReceitaRealizadaCodigo: string;
  totalDiferidoCents: number;
  totalApropriadoCents: number;
  saldoDiferidoCents: number;
  status: 'EM_ACUMULACAO' | 'APROPRIADO' | 'CANCELADO';
  configuradoEm: string;
  configuradoPor: string;
}

// ---------------------------------------------------------------------------
// 5. Conciliação Ledger Financeiro x Contabilidade
// ---------------------------------------------------------------------------

export interface LedgerReconciliationItemDto {
  id: string;
  fatoOrigemId: string;
  fatoTipo: string;
  dataFato: string;
  competencia: string;
  valorLedgerCents: number;
  valorContabilCents: number;
  diferencaCents: number;
  status: 'CONCILIADO' | 'DIVERGENTE' | 'SEM_LANCAMENTO_CONTABIL' | 'SEM_ORIGEM_LEDGER';
  observacoes?: string;
  eventoId?: string | null;
  produtorId?: string | null;
  conciliadoEm: string;
}

export interface LedgerReconciliationSummaryDto {
  competencia: string;
  totalFatosLedger: number;
  totalLancamentosContabeis: number;
  totalConciliados: number;
  totalDivergentes: number;
  valorTotalLedgerCents: number;
  valorTotalContabilCents: number;
  diferencaTotalCents: number;
  divergencias: LedgerReconciliationItemDto[];
}

// ---------------------------------------------------------------------------
// 6. Livros & Demonstrações (Diário, Razão, Balancete, DRE)
// ---------------------------------------------------------------------------

export interface JournalEntryLineDto {
  data: string;
  numeroLancamento: number;
  contaCodigo: string;
  contaNome: string;
  tipo: EntryLineType;
  valorCents: number;
  historico: string;
  correlationId?: string;
}

export interface GeneralLedgerAccountDto {
  contaCodigo: string;
  contaNome: string;
  tipo: AccountType;
  natureza: AccountNature;
  saldoAnteriorCents: number;
  debitosCents: number;
  creditosCents: number;
  saldoAtualCents: number;
  movimentos: {
    data: string;
    numeroLancamento: number;
    historico: string;
    tipo: EntryLineType;
    valorCents: number;
    saldoAposCents: number;
  }[];
}

export interface TrialBalanceItemDto {
  contaCodigo: string;
  contaNome: string;
  tipo: AccountType;
  natureza: AccountNature;
  nivel: number;
  analitica: boolean;
  saldoAnteriorCents: number;
  debitosCents: number;
  creditosCents: number;
  saldoAtualCents: number;
}

export interface IncomeStatementDto {
  competencia: string;
  modelo: 'CONTABIL_COMPETENCIA' | 'GERENCIAL_CAIXA';
  receitaBrutaServicosCents: number;
  receitasDiferidasApropriadasCents: number;
  recursosTerceirosTransitoCents: number; // Informativo: não compõe receita
  deducoesImpostosCents: number;
  receitaLiquidaCents: number;
  despesasOperacionaisCents: number;
  resultadoOperacionalCents: number;
  discriminacaoContas: {
    contaCodigo: string;
    contaNome: string;
    tipo: string;
    valorCents: number;
  }[];
}

// ---------------------------------------------------------------------------
// 7. Fechamento Mensal e por Evento
// ---------------------------------------------------------------------------

export interface MonthlyClosingDto {
  id: string;
  competencia: string;
  status: ClosingStatus;
  totalDebitosCents: number;
  totalCreditosCents: number;
  resultadoExercicioCents: number;
  totalLancamentos: number;
  totalPendenciasCriticas: number;
  fechadoPor?: string | null;
  fechadoEm?: string | null;
  reabertoPor?: string | null;
  reabertoEm?: string | null;
  motivoReabertura?: string | null;
  dossierHash?: string;
  digitalSignature?: string;
}

export interface EventAccountingClosingDto {
  id: string;
  eventoId: string;
  competencia: string;
  status: ClosingStatus;
  receitaTotalDiskCents: number;
  recursosRepassadosProdutorCents: number;
  saldoPassivoResidualCents: number;
  receitaDiferidaLiquidadaCents: number;
  pendenciasAbertasCount: number;
  fechadoPor?: string | null;
  fechadoEm?: string | null;
  dossierHash: string;
  digitalSignature: string;
}

// ---------------------------------------------------------------------------
// 8. Central de Pendências
// ---------------------------------------------------------------------------

export interface AccountingPendencyDto {
  id: string;
  tipo: PendencyType;
  severidade: PendencySeverity;
  status: PendencyStatus;
  descricao: string;
  fatoOrigemTipo?: string;
  fatoOrigemId?: string;
  competencia: string;
  eventoId?: string | null;
  produtorId?: string | null;
  detalhesTecnicos?: Record<string, unknown>;
  criadoEm: string;
  resolvidoEm?: string | null;
  resolvidoPor?: string | null;
  parecerResolucao?: string | null;
  lancamentoAjusteId?: string | null;
}

// ---------------------------------------------------------------------------
// 9. Documentos & Evidências
// ---------------------------------------------------------------------------

export interface AccountingDocumentDto {
  id: string;
  tipo: 'CONTRATO' | 'EXTRATO' | 'COMPROVANTE' | 'PARECER' | 'RELATORIO' | 'DOSSIE';
  nomeArquivo: string;
  hashSha256: string;
  competencia: string;
  eventoId?: string | null;
  produtorId?: string | null;
  vinculadoLancamentoId?: string | null;
  criadoPor: string;
  criadoEm: string;
}

// ---------------------------------------------------------------------------
// 10. Exportação Estruturada para Contador
// ---------------------------------------------------------------------------

export interface AccountantExportBundleDto {
  exportId: string;
  tenantId: string;
  competencia: string;
  geradoEm: string;
  geradoPor: string;
  hashIntegridade: string;
  arquivos: {
    nome: string;
    formato: 'JSON' | 'CSV';
    tamanhoBytes: number;
    registrosCount: number;
    conteudo: string;
  }[];
  resumo: {
    totalLancamentos: number;
    totalContasPlano: number;
    totalDebitosCents: number;
    totalCreditosCents: number;
    resultadoExercicioCents: number;
    statusFechamento: ClosingStatus;
    pendenciasPendentes: number;
  };
}

// ---------------------------------------------------------------------------
// 11. Inteligência Contábil & Diagnósticos
// ---------------------------------------------------------------------------

export interface AccountingInsightDto {
  id: string;
  categoria: 'CLASSIFICACAO' | 'CONCILIACAO' | 'COMPETENCIA' | 'FECHAMENTO' | 'DOCUMENTACAO';
  titulo: string;
  diagnostico: string;
  evidencias: string[];
  scoreConfianca: number; // 0.0 a 1.0
  severidade: 'INFO' | 'ATENCAO' | 'ALERTA_CRITICO';
  acaoRecomendada: string;
  requerAprovacaoHumana: boolean;
  geradoEm: string;
}

// ---------------------------------------------------------------------------
// 12. Trilha Forense de Auditoria Contábil
// ---------------------------------------------------------------------------

export interface AccountingAuditLogDto {
  id: string;
  acao: string;
  entidade: 'PLANO_CONTAS' | 'REGRA_CLASSIFICACAO' | 'LANCAMENTO' | 'FECHAMENTO' | 'PENDENCIA' | 'DOCUMENTO' | 'EXPORTACAO';
  entidadeId: string;
  actorId: string;
  timestamp: string;
  correlationId?: string;
  motivo?: string;
  dadosAnteriores?: Record<string, unknown> | null;
  dadosNovos?: Record<string, unknown> | null;
}

// ---------------------------------------------------------------------------
// 13. Resumo Geral da Contabilidade
// ---------------------------------------------------------------------------

export interface AccountingSummaryDto {
  competencia: string;
  totalLancamentos: number;
  totalDebitosCents: number;
  totalCreditosCents: number;
  partidasEquilibradas: boolean;
  statusFechamento: ClosingStatus;
  receitaBrutaServicosCents: number;
  recursosTerceirosCents: number;
  receitaLiquidaCents: number;
  contasAtivasCount: number;
  pendenciasAbertasCount: number;
  pendenciasCriticasCount: number;
  conciliacaoLedgerStatus: 'EM_CONFORMIDADE' | 'COM_DIVERGENCIAS';
  receitasDiferidasSaldoCents: number;
}

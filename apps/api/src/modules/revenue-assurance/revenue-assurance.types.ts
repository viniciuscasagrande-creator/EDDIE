/**
 * EDDIE 11.22 — REVENUE ASSURANCE & FINANCIAL INTEGRITY OS
 * Tipagem canônica e DTOs da Torre de Garantia de Receita e Integridade Financeira.
 *
 * Princípios Invioláveis:
 * 1. Cadeia Completa: Evento/Ingresso -> Pedido -> Pagamento -> Gateway -> Taxa Disk ->
 *    Ledger -> Saldo -> Settlement -> Repasse -> Banco -> Contabilidade.
 * 2. 11.22 NUNCA movimenta dinheiro, transfere saldo, altera taxa ou edita Ledger.
 * 3. Cobertura Explícita: Se uma fonte estiver indisponível/offline, a cobertura é reduzida.
 *    NUNCA apresentar falso 100% de integridade.
 * 4. Rastreabilidade com correlationId e preservação de evidências com hash criptográfico.
 * 5. Multi-tenant estrito: Produtor A jamais acessa registros do Produtor B.
 */

export type IntegrityStatus =
  | 'INTEGRO'
  | 'PENDENTE'
  | 'DIVERGENTE'
  | 'SEM_CORRESPONDENCIA'
  | 'DUPLICADO'
  | 'EM_INVESTIGACAO'
  | 'RESOLVIDO'
  | 'BLOQUEADO_POR_FONTE';

export type DivergenceType =
  | 'PAGAMENTO_SEM_PEDIDO'
  | 'PEDIDO_SEM_LEDGER'
  | 'LEDGER_DUPLICADO'
  | 'PEDIDO_SEM_INGRESSO'
  | 'TAXA_PERCENTUAL_INCORRETA'
  | 'TAXA_FIXA_INCORRETA'
  | 'VERSAO_TAXA_INCORRETA'
  | 'DIFERENCA_ARREDONDAMENTO'
  | 'ESTORNO_SEM_COMPENSACAO'
  | 'CHARGEBACK_SEM_REFLEXO'
  | 'TRANSFERENCIA_DESBALANCEADA'
  | 'TRANSFERENCIA_CROSS_PRODUCER'
  | 'SETTLEMENT_DIVERGENTE'
  | 'PAYOUT_DUPLICADO'
  | 'BANCO_DIVERGENTE'
  | 'CONTABILIDADE_DIVERGENTE'
  | 'FONTE_INDISPONIVEL';

export type AssuranceSeverity = 'INFO' | 'BAIXO' | 'MEDIO' | 'ALTO' | 'CRITICO';

export type CaseStatus =
  | 'ABERTO'
  | 'EM_INVESTIGACAO'
  | 'ENCAMINHADO_FINANCEIRO'
  | 'AGUARDANDO_REVALIDACAO'
  | 'RESOLVIDO'
  | 'CANCELADO';

export type TargetDomain =
  | 'FINANCEIRO_11_19'
  | 'CONTROL_TOWER_11_20'
  | 'CONTABILIDADE_11_21'
  | 'PEDIDOS'
  | 'GATEWAY'
  | 'PORTARIA';

export type SourceStatus = 'OK' | 'PARCIAL' | 'INDISPONIVEL';

// ---------------------------------------------------------------------------
// 1. Cadeia de Integridade Ponta a Ponta
// ---------------------------------------------------------------------------

export interface IntegrityChainDto {
  correlationId: string;
  orderId?: string | null;
  ticketId?: string | null;
  paymentId?: string | null;
  gatewayNsu?: string | null;
  eventoId?: string | null;
  produtorId?: string | null;
  grossAmountCents: number;
  feeAmountCents: number;
  expectedFeeAmountCents: number;
  feeVersionApplied: number;
  feeModelApplied: 'PERCENTUAL' | 'FIXA' | 'HIBRIDA';
  ledgerEntryId?: string | null;
  ledgerDuplicateCount: number;
  settlementLotId?: string | null;
  payoutId?: string | null;
  bankReturnCode?: string | null;
  accountingEntryId?: string | null;
  status: IntegrityStatus;
  divergenceType?: DivergenceType | null;
  divergenceAmountCents: number;
  divergenceDetails?: string | null;
  sourcesVerified: {
    ingressos: boolean;
    pedidos: boolean;
    pagamentos: boolean;
    gateways: boolean;
    ledger: boolean;
    settlement: boolean;
    banco: boolean;
    contabilidade: boolean;
  };
  verifiedAt: string;
}

// ---------------------------------------------------------------------------
// 2. Linha da Matriz de Integridade
// ---------------------------------------------------------------------------

export interface IntegrityMatrixRowDto {
  correlationId: string;
  orderId: string;
  paymentId: string;
  gatewayNsu: string;
  ticketId: string;
  eventoNome: string;
  produtorNome: string;
  taxaContratada: string;
  taxaAplicadaCents: number;
  ledgerRef: string;
  repasseRef: string;
  bancoRef: string;
  contabilidadeRef: string;
  status: IntegrityStatus;
  divergenciaTipo?: DivergenceType | null;
  deltaCentavos: number;
  ultimaAuditoria: string;
}

// ---------------------------------------------------------------------------
// 3. Regras de Assurance (Motor Versionado)
// ---------------------------------------------------------------------------

export interface AssuranceRuleDto {
  id: string;
  codigo: string;
  versao: number;
  nome: string;
  descricao: string;
  severidade: AssuranceSeverity;
  ativa: boolean;
  toleranciaCentavos: number;
  vigenciaInicio: string;
  vigenciaFim?: string | null;
  criadoPor: string;
}

// ---------------------------------------------------------------------------
// 4. Casos de Revenue Assurance
// ---------------------------------------------------------------------------

export interface RevenueAssuranceCaseDto {
  id: string;
  numeroCaso: number;
  correlationId: string;
  divergenceType: DivergenceType;
  severity: AssuranceSeverity;
  status: CaseStatus;
  targetDomain: TargetDomain;
  descricao: string;
  divergenceAmountCents: number;
  eventoId?: string | null;
  produtorId?: string | null;
  evidenceHash: string;
  evidencias: Array<{
    chave: string;
    valor: unknown;
    origem: string;
    timestamp: string;
  }>;
  assignedTo?: string | null;
  resolutionNotes?: string | null;
  criadoEm: string;
  atualizadoEm: string;
  resolvidoEm?: string | null;
  auditTrail: Array<{
    action: string;
    actorId: string;
    timestamp: string;
    details?: string;
  }>;
}

// ---------------------------------------------------------------------------
// 5. Monitor de Integridade & Varreduras (Scans)
// ---------------------------------------------------------------------------

export interface IntegrityScanDto {
  id: string;
  tipo: 'INCREMENTAL' | 'PERIODO_COMPLETO' | 'REVALIDACAO_CASO';
  checkpointCursor?: string | null;
  status: 'PROCESSANDO' | 'CONCLUIDO' | 'FALHA';
  totalAuditado: number;
  divergenciasEncontradas: number;
  coberturaApurada: number;
  fontesAuditadas: Record<string, SourceStatus>;
  tempoExecucaoMs: number;
  retryCount: number;
  iniciadoEm: string;
  finalizadoEm?: string | null;
  erroMensagem?: string | null;
}

// ---------------------------------------------------------------------------
// 6. Resumo Executivo & Cobertura Explícita
// ---------------------------------------------------------------------------

export interface RevenueAssuranceSummaryDto {
  periodo: string;
  totalTransacoesAuditadas: number;
  totalIntegro: number;
  totalDivergente: number;
  totalEmInvestigacao: number;
  totalResolvido: number;
  valorTotalAuditadoCents: number;
  valorEmRiscoCents: number;
  taxaIntegridadeGeral: number; // 0.0 a 100.0%
  coberturaGeral: number; // 0.0 a 100.0%
  coberturaExplícita: {
    ingressos: SourceStatus;
    pedidos: SourceStatus;
    pagamentos: SourceStatus;
    gateways: SourceStatus;
    ledger: SourceStatus;
    settlement: SourceStatus;
    banco: SourceStatus;
    contabilidade: SourceStatus;
  };
  isPartialAudit: boolean;
  avisoAuditoria?: string | null;
  casosAbertosCount: number;
  casosCriticosCount: number;
  ultimaVarreduraEm: string;
}

// ---------------------------------------------------------------------------
// 7. Inteligência de Receita & Relatórios
// ---------------------------------------------------------------------------

export interface RevenueLeakageInsightDto {
  id: string;
  categoria: 'VAZAMENTO_RECEITA' | 'TAXA_INCORRETA' | 'DUPLICIDADE' | 'ARREDONDAMENTO' | 'REPASSE';
  titulo: string;
  diagnostico: string;
  impactoMonetarioCents: number;
  populacaoAfetadaCount: number;
  evidencias: string[];
  severidade: AssuranceSeverity;
  acaoRecomendada: string;
  geradoEm: string;
}

export interface RevenueAssuranceReportDto {
  reportId: string;
  tipo: 'MATRIZ_COMPLETA' | 'DIVERGENCIAS' | 'TAXAS' | 'LEDGER' | 'REPASSES' | 'COBERTURA';
  geradoEm: string;
  geradoPor: string;
  hashIntegridade: string;
  formato: 'JSON' | 'CSV';
  totalLinhas: number;
  conteudo: string;
}

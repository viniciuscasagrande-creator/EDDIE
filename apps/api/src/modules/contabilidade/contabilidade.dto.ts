import { z } from 'zod';
import { TipoPartidaContabil } from '@ticketing/contracts';

export const CriarContaContabilSchema = z.object({
  codigo: z.string().min(1),
  nome: z.string().min(3),
  tipo: z.enum(['ativo', 'passivo', 'patrimonio_liquido', 'receita', 'despesa']),
  natureza: z.enum(['devedora', 'credora']),
  nivel: z.number().int().min(1).max(5),
  analitica: z.boolean().default(true),
  contaPaiId: z.string().uuid().optional(),
});
export type CriarContaContabilInput = z.infer<typeof CriarContaContabilSchema>;

export const PartidaLancamentoSchema = z.object({
  contaCodigo: z.string().min(1),
  tipo: TipoPartidaContabil,
  valorCents: z.number().int().positive(),
  historicoComplementar: z.string().optional(),
});
export type PartidaLancamentoInput = z.infer<typeof PartidaLancamentoSchema>;

export const CriarLancamentoContabilSchema = z.object({
  data: z.string(), // ISO date
  competencia: z.string().regex(/^\d{4}-\d{2}$/), // "AAAA-MM"
  historico: z.string().min(5),
  origemTipo: z.string().min(3), // "pedido_pago", "repasse_produtor", "estorno", "manual"
  origemReferenciaId: z.string().min(1),
  eventoId: z.string().uuid().optional(),
  produtorId: z.string().uuid().optional(),
  partidas: z.array(PartidaLancamentoSchema).min(2),
  criadoPor: z.string().min(1),
});
export type CriarLancamentoContabilInput = z.infer<typeof CriarLancamentoContabilSchema>;

export const FecharPeriodoSchema = z.object({
  competencia: z.string().regex(/^\d{4}-\d{2}$/),
  fechadoPor: z.string().uuid(),
});
export type FecharPeriodoInput = z.infer<typeof FecharPeriodoSchema>;

export const ReabrirPeriodoSchema = z.object({
  competencia: z.string().regex(/^\d{4}-\d{2}$/),
  motivo: z.string().min(10),
  reabertoPor: z.string().uuid(),
});
export type ReabrirPeriodoInput = z.infer<typeof ReabrirPeriodoSchema>;

export const RealizarConciliacaoSchema = z.object({
  contaCodigo: z.string().min(1),
  competencia: z.string().regex(/^\d{4}-\d{2}$/),
  saldoExtratoCents: z.number().int(),
  observacoes: z.string().optional(),
  conciliadoPor: z.string().uuid(),
});
export type RealizarConciliacaoInput = z.infer<typeof RealizarConciliacaoSchema>;

export interface LinhaBalanceteDto {
  contaCodigo: string;
  contaNome: string;
  tipo: string;
  saldoAnteriorCents: number;
  debitosCents: number;
  creditosCents: number;
  saldoAtualCents: number;
}

export interface DreGerencialDto {
  competencia: string;
  receitaBrutaServicosCents: number;
  recursosTerceirosCents: number;
  deducoesImpostosCents: number;
  receitaLiquidaCents: number;
  despesasOperacionaisCents: number;
  resultadoOperacionalCents: number;
}

export interface DashboardContabilDto {
  competencia: string;
  totalLancamentos: number;
  totalDebitosCents: number;
  totalCreditosCents: number;
  periodoFechado: boolean;
  contasConciliadas: number;
  contasDivergentes: number;
}

// ============================================================================
//  11.37 DTOs e Schemas — Motor Contábil, Ajustes, Eventos e Subsistemas
// ============================================================================

export const CriarRegraContabilSchema = z.object({
  codigo: z.string().min(2),
  fatoTipo: z.string().min(3),
  descricao: z.string().min(5),
  contaDebitoCodigo: z.string().min(1),
  contaCreditoCodigo: z.string().min(1),
  contaTaxaCreditoCodigo: z.string().optional(),
  politicaReconhecimento: z.enum(['IMEDIATO', 'RECEITA_DIFERIDA']).default('IMEDIATO'),
  contaReceitaDiferidaCodigo: z.string().optional(),
  vigenciaInicio: z.string().optional(),
  vigenciaFim: z.string().optional(),
  status: z.enum(['RASCUNHO', 'APROVADA', 'VIGENTE', 'EXPIRADA']).default('VIGENTE'),
  criadoPor: z.string().min(1),
  partidasRegra: z
    .array(
      z.object({
        tipo: TipoPartidaContabil,
        contaCodigo: z.string().min(1),
        naturezaValor: z.enum(['TOTAL_BRUTO', 'RECURSO_TERCEIROS', 'TAXA_DISK', 'IMPOSTO']),
        formulaPercentual: z.number().optional(),
        historicoComplementar: z.string().optional(),
      }),
    )
    .optional(),
});
export type CriarRegraContabilInput = z.infer<typeof CriarRegraContabilSchema>;

export const SimularRegraContabilSchema = z.object({
  fatoTipo: z.string().min(3),
  valorBrutoCents: z.number().int().positive(),
  valorTaxaDiskCents: z.number().int().default(0),
  valorRepasseProdutorCents: z.number().int().default(0),
  competencia: z.string().regex(/^\d{4}-\d{2}$/),
  eventoId: z.string().uuid().optional(),
  produtorId: z.string().uuid().optional(),
  canal: z.string().default('WEB'),
  historico: z.string().default('Simulação de contabilização dry-run'),
});
export type SimularRegraContabilInput = z.infer<typeof SimularRegraContabilSchema>;

export const CriarAjusteContabilSchema = z.object({
  tipo: z.enum(['ESTORNO', 'RECLASSIFICACAO', 'AJUSTE_COMPETENCIA']),
  lancamentoOriginalId: z.string().uuid(),
  motivo: z.string().min(5),
  justificativa: z.string().min(10),
  documentoSuporteId: z.string().optional(),
  aprovadoPor: z.string().min(1),
  novaContaDebitoCodigo: z.string().optional(),
  novaContaCreditoCodigo: z.string().optional(),
});
export type CriarAjusteContabilInput = z.infer<typeof CriarAjusteContabilSchema>;

export const FecharEventoContabilSchema = z.object({
  eventoId: z.string().uuid(),
  produtorId: z.string().uuid().optional(),
  competencia: z.string().regex(/^\d{4}-\d{2}$/),
  fechadoPor: z.string().uuid(),
  checklist: z.record(z.boolean()).optional(),
  motivo: z.string().optional(),
});
export type FecharEventoContabilInput = z.infer<typeof FecharEventoContabilSchema>;

export const ReabrirEventoContabilSchema = z.object({
  eventoId: z.string().uuid(),
  motivo: z.string().min(10),
  reabertoPor: z.string().uuid(),
});
export type ReabrirEventoContabilInput = z.infer<typeof ReabrirEventoContabilSchema>;

export const CriarCentroResultadoSchema = z.object({
  codigo: z.string().min(2),
  nome: z.string().min(3),
  tipo: z.enum(['UNIDADE_NEGOCIO', 'EVENTO', 'PRODUTOR', 'CANAL']).default('UNIDADE_NEGOCIO'),
  descricao: z.string().optional(),
});
export type CriarCentroResultadoInput = z.infer<typeof CriarCentroResultadoSchema>;

export interface DryRunSimulationResultDto {
  sucesso: boolean;
  fatoTipo: string;
  regraAplicada: {
    codigo: string;
    versao: number;
    politicaReconhecimento: string;
  } | null;
  partidasSimuladas: {
    tipo: 'D' | 'C';
    contaCodigo: string;
    contaNome: string;
    valorCents: number;
    natureza: string;
    historicoComplementar?: string;
  }[];
  totalDebitoCents: number;
  totalCreditoCents: number;
  balanceado: boolean;
  alertas: string[];
}

export interface AuditTrailTrackingDto {
  lancamento: {
    id: string;
    codigo: string;
    numeroLancamento: number;
    data: string;
    competencia: string;
    totalCents: number;
    historico: string;
    origemTipo: string;
    origemReferenciaId: string;
    eventoId?: string | null;
    produtorId?: string | null;
    centroResultado?: string | null;
    canal?: string | null;
    documentoSuporteId?: string | null;
    regraVersao?: number | null;
    status: string;
    criadoPor: string;
    createdAt: string;
  };
  partidas: {
    id: string;
    tipo: 'D' | 'C';
    contaCodigo: string;
    contaNome: string;
    valorCents: number;
    centroResultado?: string | null;
  }[];
  origensRelacionadas: {
    pedido?: { id: string; codigo?: string; totalCents?: number; status?: string } | null;
    pagamento?: { id: string; metodo?: string; valorCents?: number; status?: string } | null;
    ledger?: { entryId: string; tipo: string; valorCents: number; contaGrafica: string } | null;
    tesouraria?: { movimentacaoId?: string; contaBancaria?: string; status?: string } | null;
    documento?: { documentoId?: string; codigo?: string; tipo?: string } | null;
  };
  trilhaAuditoria: {
    etapa: string;
    descricao: string;
    dataHora: string;
    responsavel: string;
    status: string;
  }[];
}

export interface SubsystemReconciliationSummaryDto {
  competencia: string;
  dataProcessamento: string;
  subsistemas: {
    nome: 'BANCOS_TESOURARIA' | 'RECEBIVEIS_PAGAMENTOS' | 'OBRIGACOES_LEDGER';
    descricao: string;
    valorContabilCents: number;
    valorSubsistemaCents: number;
    diferencaCents: number;
    status: 'CONCILIADO' | 'DIVERGENTE';
    detalhes: {
      contaContabil: string;
      fonteOrigem: string;
      divergenciasCount: number;
      itensAvaliados: number;
    };
  }[];
  statusGeral: 'CONFORME' | 'DIVERGENTE';
  totalDivergenciasCriticas: number;
}

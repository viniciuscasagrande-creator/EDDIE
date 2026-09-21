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

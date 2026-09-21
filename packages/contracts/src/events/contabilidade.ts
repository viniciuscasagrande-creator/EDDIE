import { z } from 'zod';
import { defineEvent } from '../shared/envelope.js';
import { Money } from '../shared/money.js';

export const TipoPartidaContabil = z.enum(['D', 'C']); // Débito ou Crédito
export type TipoPartidaContabil = z.infer<typeof TipoPartidaContabil>;

export const PartidaContabilItem = z.object({
  contaCodigo: z.string(),
  tipo: TipoPartidaContabil,
  valorCents: Money,
  historicoComplementar: z.string().optional(),
});
export type PartidaContabilItem = z.infer<typeof PartidaContabilItem>;

/**
 * Publicado quando uma escrituração contábil em partidas dobradas é formalizada.
 */
export const LancamentoContabilCriado = defineEvent(
  'contabilidade.lancamento_criado.v1',
  z.object({
    lancamentoId: z.string().uuid(),
    numeroLancamento: z.number().int().positive(),
    data: z.string(),
    competencia: z.string(), // ex: "2026-09"
    totalCents: Money,
    historico: z.string(),
    origemTipo: z.string(), // "pedido_pago", "repasse_produtor", "estorno", "ajuste_manual"
    origemReferenciaId: z.string(),
    eventoId: z.string().uuid().nullable(),
    produtorId: z.string().uuid().nullable(),
    partidas: z.array(PartidaContabilItem).min(2),
    criadoPor: z.string(),
    criadoEm: z.string().datetime(),
  }),
);

/**
 * Publicado no encerramento periódico/mensal da competência contábil.
 */
export const PeriodoContabilFechado = defineEvent(
  'contabilidade.periodo_fechado.v1',
  z.object({
    fechamentoId: z.string().uuid(),
    competencia: z.string(), // ex: "2026-09"
    totalDebitosCents: Money,
    totalCreditosCents: Money,
    resultadoExercicioCents: Money,
    fechadoPor: z.string().uuid(),
    fechadoEm: z.string().datetime(),
  }),
);

/**
 * Publicado quando um período contábil previamente fechado é reaberto com autorização formal de compliance.
 */
export const PeriodoContabilReaberto = defineEvent(
  'contabilidade.periodo_reaberto.v1',
  z.object({
    fechamentoId: z.string().uuid(),
    competencia: z.string(),
    motivo: z.string().min(10),
    reabertoPor: z.string().uuid(),
    reabertoEm: z.string().datetime(),
  }),
);

/**
 * Publicado na finalização de uma conciliação contábil com extrato ou adquirente.
 */
export const ConciliacaoContabilFinalizada = defineEvent(
  'contabilidade.conciliacao_finalizada.v1',
  z.object({
    conciliacaoId: z.string().uuid(),
    contaCodigo: z.string(),
    competencia: z.string(),
    saldoContabilCents: Money,
    saldoExtratoCents: Money,
    diferencaCents: Money,
    status: z.enum(['conciliado', 'divergente']),
    conciliadoPor: z.string().uuid(),
    conciliadoEm: z.string().datetime(),
  }),
);

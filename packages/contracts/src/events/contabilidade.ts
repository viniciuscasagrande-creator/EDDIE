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

/**
 * Publicado quando uma regra do motor contábil é criada, versionada ou publicada.
 */
export const RegraContabilPublicadaV1 = defineEvent(
  'contabilidade.regra.publicada.v1',
  z.object({
    regraId: z.string().uuid(),
    fatoTipo: z.string(),
    versao: z.number().int().positive(),
    descricao: z.string(),
    status: z.enum(['RASCUNHO', 'APROVADA', 'VIGENTE', 'EXPIRADA']),
    vigenciaInicio: z.string(),
    vigenciaFim: z.string().nullable().optional(),
    publicadoPor: z.string().uuid(),
    publicadoEm: z.string().datetime(),
  }),
);

/**
 * Publicado quando um ajuste contábil ou reclassificação é realizado sobre lançamentos imutáveis.
 */
export const AjusteContabilRealizadoV1 = defineEvent(
  'contabilidade.ajuste.realizado.v1',
  z.object({
    ajusteId: z.string().uuid(),
    codigo: z.string(),
    tipo: z.enum(['ESTORNO', 'RECLASSIFICACAO', 'AJUSTE_COMPETENCIA']),
    lancamentoOriginalId: z.string().uuid(),
    lancamentoNovoId: z.string().uuid(),
    motivo: z.string(),
    documentoSuporteId: z.string().optional().nullable(),
    aprovadoPor: z.string().uuid(),
    realizadoEm: z.string().datetime(),
  }),
);

/**
 * Publicado quando um evento atinge o fechamento financeiro e contábil definitivo (12 gates).
 */
export const FechamentoEventoContabilConcluidoV1 = defineEvent(
  'contabilidade.evento.fechamento_concluido.v1',
  z.object({
    fechamentoId: z.string().uuid(),
    eventoId: z.string().uuid(),
    competencia: z.string(),
    receitaTotalDiskCents: Money,
    recursosRepassadosProdutorCents: Money,
    dossieHash: z.string(),
    gatesAprovadosCount: z.number().int(),
    fechadoPor: z.string().uuid(),
    fechadoEm: z.string().datetime(),
  }),
);

/**
 * Publicado quando uma conciliação cruzada de subsistemas detecta divergência.
 */
export const DivergenciaSubsistemaDetectadaV1 = defineEvent(
  'contabilidade.conciliacao.divergencia_detectada.v1',
  z.object({
    subsistema: z.enum(['BANCOS_TESOURARIA', 'RECEBIVEIS_PAGAMENTOS', 'OBRIGACOES_LEDGER']),
    competencia: z.string(),
    valorContabilCents: Money,
    valorSubsistemaCents: Money,
    diferencaCents: Money,
    descricao: z.string(),
    detectadoEm: z.string().datetime(),
  }),
);

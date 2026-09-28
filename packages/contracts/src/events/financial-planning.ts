import { z } from 'zod';
import { defineEvent } from '../shared/envelope.js';
import { Money } from '../shared/money.js';

/**
 * Eventos de domínio do módulo FP&A, BUDGETING & MULTI-YEAR FINANCIAL PLANNING (EDDIE 11.28).
 */

export const TipoDespesa = z.enum(['OPEX', 'CAPEX']);

export const StatusVariancia = z.enum([
  'FAVORAVEL',
  'NEUTRO',
  'DESFAVORAVEL',
  'CRITICO',
]);

export const CategoriaCentroCusto = z.enum([
  'OPERACOES_EVENTOS',
  'TECNOLOGIA_PLATAFORMA',
  'MARKETING_AQUISICAO',
  'COMERCIAL_B2B',
  'ADMINISTRATIVO_FINANCEIRO',
]);

/**
 * Publicado quando um orçamento anual/mensal para um Centro de Custo é aprovado ou redefinido.
 */
export const OrcamentoDefinido = defineEvent(
  'financial_planning.orcamento_definido.v1',
  z.object({
    budgetId: z.string().uuid(),
    tenantId: z.string().uuid(),
    anoExercicio: z.number().int().min(2025).max(2035),
    centroCustoCodigo: z.string(),
    categoria: CategoriaCentroCusto,
    tipoDespesa: TipoDespesa,
    valorOrcadoCents: Money,
    tetoAlertaAmareloPercentual: z.number().min(50).max(100),
    tetoBloqueioVermelhoPercentual: z.number().min(80).max(150),
    definidoPor: z.string(),
    definidoEm: z.string().datetime(),
  }),
);

/**
 * Publicado quando o motor de FP&A detecta um desvio significativo (orçado vs realizado).
 */
export const DesvioOrcamentarioDetectado = defineEvent(
  'financial_planning.desvio_orcamentario_detectado.v1',
  z.object({
    desvioId: z.string().uuid(),
    tenantId: z.string().uuid(),
    anoExercicio: z.number().int(),
    mes: z.number().int().min(1).max(12),
    centroCustoCodigo: z.string(),
    nomeRubrica: z.string(),
    valorOrcadoCents: Money,
    valorRealizadoCents: Money,
    varianciaCents: Money,
    varianciaPercentual: z.number(),
    status: StatusVariancia,
    justificativaExigida: z.boolean(),
    detectadoEm: z.string().datetime(),
  }),
);

/**
 * Publicado quando uma revisão orçamentária extraordinária (Forecast Roll-Forward) é homologada.
 */
export const RevisaoOrcamentariaAprovada = defineEvent(
  'financial_planning.revisao_orcamentaria_aprovada.v1',
  z.object({
    revisaoId: z.string().uuid(),
    tenantId: z.string().uuid(),
    anoExercicio: z.number().int(),
    versao: z.string(), // ex: 2026.Q2-R1
    valorOrcadoAnteriorCents: Money,
    novoValorOrcadoCents: Money,
    motivo: z.string(),
    aprovadoPor: z.string(),
    aprovadoEm: z.string().datetime(),
  }),
);

/**
 * Publicado quando uma projeção plurianual (12 a 36 meses) é gerada pelo modelo de FP&A.
 */
export const ProjecaoPlurianualCalculada = defineEvent(
  'financial_planning.projecao_plurianual_calculada.v1',
  z.object({
    projecaoId: z.string().uuid(),
    tenantId: z.string().uuid(),
    anoBase: z.number().int(),
    horizonteAnos: z.number().int().min(1).max(5),
    receitaBrutaProjetadaCents: Money,
    ebitdaProjetadoCents: Money,
    margemContribuicaoProjetadaPercentual: z.number(),
    cagrEstimadoPercentual: z.number(),
    calculadoEm: z.string().datetime(),
  }),
);

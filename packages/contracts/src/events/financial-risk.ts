import { z } from 'zod';
import { defineEvent } from '../shared/envelope.js';
import { Money } from '../shared/money.js';

/**
 * Eventos de domínio do módulo FINANCIAL RISK, CONTROLS & EXPOSURE OS (EDDIE 11.27).
 */

export const RatingRisco = z.enum([
  'AAA',
  'AA',
  'A',
  'BBB',
  'BB',
  'B',
  'CCC',
  'D',
]);

export const StatusPerfilRisco = z.enum([
  'REGULAR',
  'ATENCAO',
  'BLOQUEADO',
  'CRITICO',
]);

export const GatilhoCircuitBreaker = z.enum([
  'CHARGEBACK_THRESHOLD_EXCEEDED',
  'UNAUTHORIZED_EXPOSURE',
  'FRAUD_SUSPICION',
  'INTEGRITY_DRIFT',
  'MASS_CANCELLATION_RISK',
  'MANUAL_EMERGENCY_LOCK',
]);

export const AcaoCircuitBreaker = z.enum([
  'BLOQUEAR_REPASSES',
  'CONGELAR_ADIANTAMENTOS',
  'RETENCAO_TOTAL_100',
  'NOTIFICAR_COMPLIANCE',
]);

export const SeveridadeRisco = z.enum(['INFO', 'ALERTA', 'CRITICO', 'EMERGENCIAL']);

export const AlcadaAprovacaoRisco = z.enum([
  'GERENTE_FINANCEIRO',
  'DIRETOR_FINANCEIRO',
  'COMITE_RISCO',
]);

export const CenarioEstresse = z.enum([
  'CANCELAMENTO_MAIOR_EVENTO',
  'COLAPSO_ADQUIRENTE',
  'SURTO_CHARGEBACK_SISTEMICO',
  'CUSTOMIZADO',
]);

/**
 * Publicado quando o score e rating de crédito/exposição de um produtor são recalculados.
 */
export const ScoreProdutorAtualizado = defineEvent(
  'financial_risk.score_produtor_atualizado.v1',
  z.object({
    riskId: z.string().uuid(),
    tenantId: z.string().uuid(),
    produtorId: z.string().uuid(),
    score: z.number().int().min(0).max(1000),
    rating: RatingRisco,
    chargebackRatePercentual: z.number().nonnegative(),
    limiteExposicaoMaximo: Money,
    reservaSegurancaPercentual: z.number().nonnegative().max(100),
    exposicaoLiquidaAtual: Money,
    status: StatusPerfilRisco,
    atualizadoEm: z.string().datetime(),
  }),
);

/**
 * Publicado quando o limite de crédito/adiantamento de um produtor é alterado ou aprovado por uma alçada.
 */
export const LimiteCreditoAjustado = defineEvent(
  'financial_risk.limite_credito_ajustado.v1',
  z.object({
    ajusteId: z.string().uuid(),
    tenantId: z.string().uuid(),
    produtorId: z.string().uuid(),
    limiteAnterior: Money,
    novoLimite: Money,
    alcada: AlcadaAprovacaoRisco,
    aprovadoPor: z.string(),
    motivo: z.string(),
    garantiasExigidas: Money,
    ajustadoEm: z.string().datetime(),
  }),
);

/**
 * Publicado quando uma trava automática de segurança (Circuit Breaker) é acionada ou desativada.
 */
export const CircuitBreakerAcionado = defineEvent(
  'financial_risk.circuit_breaker_acionado.v1',
  z.object({
    breakerId: z.string().uuid(),
    tenantId: z.string().uuid(),
    produtorId: z.string().uuid().nullable(),
    eventoId: z.string().uuid().nullable(),
    gatilho: GatilhoCircuitBreaker,
    acaoTomada: AcaoCircuitBreaker,
    severidade: SeveridadeRisco,
    justificativa: z.string(),
    acionadoAutomaticamente: z.boolean(),
    acionadoEm: z.string().datetime(),
  }),
);

/**
 * Publicado quando o índice de concentração de adquirentes ou produtor ultrapassa o patamar prudencial.
 */
export const AlertaConcentracaoGerado = defineEvent(
  'financial_risk.alerta_concentracao_gerado.v1',
  z.object({
    alertaId: z.string().uuid(),
    tenantId: z.string().uuid(),
    tipoEntidade: z.enum(['ADQUIRENTE', 'PRODUTOR', 'EVENTO']),
    entidadeId: z.string(),
    nomeEntidade: z.string(),
    percentualConcentracao: z.number().nonnegative().max(100),
    hhiCalculado: z.number().nonnegative(),
    limitePrudencialPercentual: z.number().nonnegative(),
    severidade: SeveridadeRisco,
    geradoEm: z.string().datetime(),
  }),
);

/**
 * Publicado quando uma simulação de estresse financeiro (Stress Test) é concluída.
 */
export const StressTestExecutado = defineEvent(
  'financial_risk.stress_test_executado.v1',
  z.object({
    simulacaoId: z.string().uuid(),
    tenantId: z.string().uuid(),
    cenario: CenarioEstresse,
    exposicaoTotalCents: z.number().int().nonnegative(),
    deficitLiquidezProjetadoCents: z.number().int(),
    taxaCoberturaGarantiasPercentual: z.number().nonnegative(),
    statusSolvencia: z.enum(['SOLVENTE', 'ATENCAO', 'INSOLVENTE']),
    executadoPor: z.string(),
    executadoEm: z.string().datetime(),
  }),
);

import { z } from 'zod';
import { defineEvent } from '../shared/envelope.js';
import { Money } from '../shared/money.js';

/**
 * Eventos de domínio do módulo CASH FORECAST & LIQUIDITY (EDDIE 11.26).
 */

export const PrevisaoCaixaGerada = defineEvent(
  'cash_forecast.previsao_gerada.v1',
  z.object({
    forecastId: z.string().uuid(),
    tenantId: z.string().uuid(),
    producerId: z.string().uuid().nullable(),
    horizonte: z.enum(['D1', 'D7', 'D15', 'D30', 'D60', 'D90']),
    cenario: z.enum(['BASE', 'CONSERVADOR', 'OTIMISTA', 'CUSTOMIZADO']),
    saldoBancarioReal: Money,
    saldoLedger: Money,
    saldoDisponivel: Money,
    valorReservado: Money,
    valorEmLiquidacao: Money,
    valorProjetado: Money,
    inflowsPrevistos: Money,
    outflowsPrevistos: Money,
    gapLiquidez: Money,
    geradoEm: z.string().datetime(),
    versaoPremissas: z.string(),
  }),
);

export const GapLiquidezDetectado = defineEvent(
  'cash_forecast.gap_liquidez_detectado.v1',
  z.object({
    gapId: z.string().uuid(),
    tenantId: z.string().uuid(),
    producerId: z.string().uuid().nullable(),
    dataPrevisao: z.string().datetime(),
    deficitProjetado: Money,
    severidade: z.enum(['INFO', 'ALERTA', 'CRITICO']),
    cenario: z.enum(['BASE', 'CONSERVADOR', 'OTIMISTA', 'CUSTOMIZADO']),
    recomendacao: z.string(),
    detectadoEm: z.string().datetime(),
  }),
);

export const PremissaFinanceiraAtualizada = defineEvent(
  'cash_forecast.premissa_atualizada.v1',
  z.object({
    premissaId: z.string().uuid(),
    versao: z.string(),
    taxaCDIPercentual: z.number().nonnegative(),
    taxaInadimplenciaEstimadaPercentual: z.number().nonnegative(),
    taxaEstornoEstimadaPercentual: z.number().nonnegative(),
    prazoMedioRecebimentoDias: z.number().int().positive(),
    atualizadoPor: z.string(),
    atualizadoEm: z.string().datetime(),
  }),
);

export const BacktestingCalculado = defineEvent(
  'cash_forecast.backtesting_calculado.v1',
  z.object({
    backtestId: z.string().uuid(),
    tenantId: z.string().uuid(),
    periodoInicio: z.string().datetime(),
    periodoFim: z.string().datetime(),
    mapePercentual: z.number().nonnegative(),
    rmseCents: z.number().int().nonnegative(),
    amostrasContabilizadas: z.number().int().positive(),
    statusAcuracia: z.enum(['EXCELENTE', 'ACEITAVEL', 'DESCALIBRADO']),
    calculadoEm: z.string().datetime(),
  }),
);

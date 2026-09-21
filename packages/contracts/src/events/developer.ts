import { z } from 'zod';
import { defineEvent } from '../envelope';

export const AuditoriaRegistradaPayloadSchema = z.object({
  auditId: z.string().uuid(),
  modulo: z.string(),
  acao: z.string(),
  autorId: z.string().uuid(),
  autorTipo: z.enum(['USUARIO', 'SISTEMA', 'API_KEY']),
  entidadeAfetada: z.string(),
  entidadeId: z.string(),
  estadoAnterior: z.record(z.unknown()).optional(),
  estadoNovo: z.record(z.unknown()).optional(),
  registradoEm: z.string().datetime(),
});

export const LlmChamadaPayloadSchema = z.object({
  callId: z.string().uuid(),
  modulo: z.string(),
  funcionalidade: z.string(),
  modelo: z.string(),
  tokensEntrada: z.number().int().nonnegative(),
  tokensSaida: z.number().int().nonnegative(),
  custoEstimadoMicros: z.number().int().nonnegative(),
  latenciaMs: z.number().int().nonnegative(),
  sucesso: z.boolean(),
  executadoEm: z.string().datetime(),
});

export const AuditoriaRegistradaV1 = defineEvent('auditoria.registrada.v1', AuditoriaRegistradaPayloadSchema);
export const LlmChamadaV1 = defineEvent('llm.chamada.v1', LlmChamadaPayloadSchema);

export type AuditoriaRegistradaPayload = z.infer<typeof AuditoriaRegistradaPayloadSchema>;
export type LlmChamadaPayload = z.infer<typeof LlmChamadaPayloadSchema>;

import { z } from 'zod';
import { defineEvent } from '../envelope.js';

export const MetaDefinidaPayloadSchema = z.object({
  metaId: z.string().uuid(),
  tenantId: z.string().uuid(),
  produtorId: z.string().uuid().optional(),
  eventoId: z.string().uuid().optional(),
  tipoMeta: z.enum(['VENDAS', 'PUBLICO', 'RECEITA_DISK', 'MARGEM_DISK', 'CONVERSAO', 'ROAS']),
  valorMetaCents: z.number().int().nonnegative(),
  periodoCompetencia: z.string(),
  criadoEm: z.string().datetime(),
});

export const AlertaGeradoPayloadSchema = z.object({
  alertaId: z.string().uuid(),
  tenantId: z.string().uuid(),
  tipo: z.enum(['FINANCEIRO', 'VENDAS', 'INVENTARIO', 'OPERACAO', 'MARKETING', 'RELACIONAMENTO']),
  severidade: z.enum(['CRITICA', 'ALTA', 'MEDIA', 'INFORMATIVA']),
  titulo: z.string(),
  descricao: z.string(),
  motivoExplicabilidade: z.string(),
  origemModulo: z.string(),
  eventoId: z.string().uuid().optional(),
  produtorId: z.string().uuid().optional(),
  geradoEm: z.string().datetime(),
});

export const OportunidadeDetectadaPayloadSchema = z.object({
  oportunidadeId: z.string().uuid(),
  tenantId: z.string().uuid(),
  categoria: z.enum(['ESGOTAMENTO_LOTE', 'PUBLICO_RECORRENTE', 'PAGAMENTOS_RECUPERAVEIS', 'CANAL_ALTA_MARGEM']),
  titulo: z.string(),
  impactoEstimadoCents: z.number().int().nonnegative(),
  acaoRecomendada: z.string(),
  eventoId: z.string().uuid().optional(),
  produtorId: z.string().uuid().optional(),
  detectadaEm: z.string().datetime(),
});

export const PrevisaoCalculadaPayloadSchema = z.object({
  previsaoId: z.string().uuid(),
  tenantId: z.string().uuid(),
  eventoId: z.string().uuid(),
  metrica: z.enum(['GMV_FINAL', 'PUBLICO_FINAL', 'RECEITA_DISK', 'MARGEM_DISK']),
  valorPrevistoCents: z.number().int().nonnegative(),
  intervaloConfiancaMinCents: z.number().int().nonnegative(),
  intervaloConfiancaMaxCents: z.number().int().nonnegative(),
  metodologia: z.string(),
  calculadoEm: z.string().datetime(),
});

export const MetaDefinidaV1 = defineEvent('inteligencia.meta_definida.v1', MetaDefinidaPayloadSchema);
export const AlertaGeradoV1 = defineEvent('inteligencia.alerta_gerado.v1', AlertaGeradoPayloadSchema);
export const OportunidadeDetectadaV1 = defineEvent('inteligencia.oportunidade_detectada.v1', OportunidadeDetectadaPayloadSchema);
export const PrevisaoCalculadaV1 = defineEvent('inteligencia.previsao_calculada.v1', PrevisaoCalculadaPayloadSchema);

export type MetaDefinidaPayload = z.infer<typeof MetaDefinidaPayloadSchema>;
export type AlertaGeradoPayload = z.infer<typeof AlertaGeradoPayloadSchema>;
export type OportunidadeDetectadaPayload = z.infer<typeof OportunidadeDetectadaPayloadSchema>;
export type PrevisaoCalculadaPayload = z.infer<typeof PrevisaoCalculadaPayloadSchema>;

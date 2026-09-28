import { z } from 'zod';
import { defineEvent } from '../envelope.js';

export const SeveridadeDivergenciaSchema = z.enum([
  'INFORMATIVA',
  'BAIXA',
  'MEDIA',
  'ALTA',
  'CRITICA',
]);

export const SituacaoDivergenciaSchema = z.enum([
  'NOVA',
  'EM_ANALISE',
  'AGUARDANDO_INFORMACAO',
  'EM_CORRECAO',
  'CORRIGIDA',
  'ACEITA',
  'ENCERRADA',
]);

export const ResponsavelDominioSchema = z.enum([
  'FINANCEIRO',
  'CONTABILIDADE',
  'OPERACOES',
  'PORTARIA',
  'MARKETING',
  'ATENDIMENTO',
  'TECNOLOGIA',
]);

export const ClassificacaoDadoSchema = z.enum([
  'PUBLICO',
  'INTERNO',
  'CONFIDENCIAL',
  'FINANCEIRO',
  'DADO_PESSOAL',
  'DADO_SENSIVEL',
  'RESTRITO',
]);

// 1. Payload: Divergência Detectada
export const DivergenciaDetectadaPayloadSchema = z.object({
  divergenciaId: z.string().uuid(),
  codigoDivergencia: z.string(), // ex: DIV-2026-001
  tipo: z.string(),
  camadaOrigem: z.string(),
  camadaDestino: z.string(),
  eventoId: z.string().uuid().optional(),
  produtorId: z.string().optional(),
  pedidoId: z.string().optional(),
  valorEnvolvidoCentavos: z.number().int().nonnegative().optional(),
  severidade: SeveridadeDivergenciaSchema,
  responsavelDominio: ResponsavelDominioSchema,
  descricaoProblema: z.string(),
  dataDeteccao: z.string().datetime(),
});

// 2. Payload: Divergência Tratada / Corrigida
export const DivergenciaTratadaPayloadSchema = z.object({
  divergenciaId: z.string().uuid(),
  codigoDivergencia: z.string(),
  situacaoAnterior: SituacaoDivergenciaSchema,
  novaSituacao: SituacaoDivergenciaSchema,
  acaoAplicada: z.string(),
  justificativa: z.string(),
  responsavelUsuarioId: z.string(),
  resolvido: z.boolean(),
  evidenciaHash: z.string().optional(),
  dataTratamento: z.string().datetime(),
});

// 3. Payload: Auditoria Operação Registrada
export const AuditoriaOperacaoRegistradaPayloadSchema = z.object({
  auditoriaId: z.string().uuid(),
  correlationId: z.string(),
  modulo: z.string(),
  acao: z.string(),
  usuarioId: z.string(),
  usuarioNome: z.string(),
  ipOrigem: z.string().optional(),
  eventoId: z.string().uuid().optional(),
  produtorId: z.string().optional(),
  entidadeTipo: z.string(),
  entidadeId: z.string(),
  motivoJustificativa: z.string(),
  aprovadorUsuarioId: z.string().optional(),
  dadosSensiveisAcessados: z.boolean().default(false),
  quantidadeRegistrosExportados: z.number().int().optional(),
  dataHora: z.string().datetime(),
});

// 4. Payload: Catálogo Termo Atualizado
export const CatalogoTermoAtualizadoPayloadSchema = z.object({
  termoCodigo: z.string(),
  nomeOficial: z.string(),
  definicaoCorporativa: z.string(),
  formulaCalculo: z.string().optional(),
  donoDadoResponsavel: ResponsavelDominioSchema,
  classificacaoDado: ClassificacaoDadoSchema,
  versaoTermo: z.number().int().positive(),
  atualizadoPorUsuarioId: z.string(),
});

// 5. Payload: Integração Status Alterado
export const IntegracaoStatusAlteradoPayloadSchema = z.object({
  integracaoNome: z.string(),
  statusAnterior: z.enum(['OPERACIONAL', 'DEGRADADA', 'FORA_DO_AR']),
  novoStatus: z.enum(['OPERACIONAL', 'DEGRADADA', 'FORA_DO_AR']),
  latenciaMs: z.number().int().nonnegative().optional(),
  taxaErroPercentual: z.number().nonnegative().optional(),
  filaPendenteQtd: z.number().int().nonnegative().optional(),
  descricaoIncidente: z.string().optional(),
  timestamp: z.string().datetime(),
});

export const DivergenciaDetectadaV1 = defineEvent('governanca.divergencia_detectada.v1', DivergenciaDetectadaPayloadSchema);
export const DivergenciaTratadaV1 = defineEvent('governanca.divergencia_tratada.v1', DivergenciaTratadaPayloadSchema);
export const AuditoriaOperacaoRegistradaV1 = defineEvent('governanca.auditoria_operacao_registrada.v1', AuditoriaOperacaoRegistradaPayloadSchema);
export const CatalogoTermoAtualizadoV1 = defineEvent('governanca.catalogo_termo_atualizado.v1', CatalogoTermoAtualizadoPayloadSchema);
export const IntegracaoStatusAlteradoV1 = defineEvent('governanca.integracao_status_alterado.v1', IntegracaoStatusAlteradoPayloadSchema);

export type DivergenciaDetectadaPayload = z.infer<typeof DivergenciaDetectadaPayloadSchema>;
export type DivergenciaTratadaPayload = z.infer<typeof DivergenciaTratadaPayloadSchema>;
export type AuditoriaOperacaoRegistradaPayload = z.infer<typeof AuditoriaOperacaoRegistradaPayloadSchema>;
export type CatalogoTermoAtualizadoPayload = z.infer<typeof CatalogoTermoAtualizadoPayloadSchema>;
export type IntegracaoStatusAlteradoPayload = z.infer<typeof IntegracaoStatusAlteradoPayloadSchema>;

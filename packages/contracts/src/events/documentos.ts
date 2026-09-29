import { z } from 'zod';
import { defineEvent } from '../envelope.js';

export const TipoDocumentoOperacionalSchema = z.enum([
  'CONTRATO',
  'ADITIVO',
  'BORDERO',
  'SOLICITACAO_REPASSE',
  'ANTECIPACAO',
  'TERMO',
  'DECLARACAO',
  'COMPROVANTE',
  'RELATORIO',
  'FECHAMENTO_EVENTO',
  'DOCUMENTO_FISCAL',
  'DOCUMENTO_BANCARIO',
  'DOCUMENTO_OPERACIONAL',
  'DOCUMENTO_PARCEIRO',
]);

export const SituacaoDocumentoSchema = z.enum([
  'RASCUNHO',
  'EM_ELABORACAO',
  'AGUARDANDO_APROVACAO',
  'APROVADO',
  'AGUARDANDO_ASSINATURA',
  'PARCIALMENTE_ASSINADO',
  'ASSINADO',
  'VIGENTE',
  'SUBSTITUIDO',
  'CANCELADO',
  'EXPIRADO',
  'ARQUIVADO',
]);

export const ClassificacaoSensibilidadeSchema = z.enum([
  'INTERNO',
  'CONFIDENCIAL',
  'FINANCEIRO',
  'CONTRATUAL',
  'DADO_PESSOAL',
  'RESTRITO',
]);

export const MetodoAssinaturaSchema = z.enum([
  'INTERNA_SESSAO',
  'LINK_SEGURO_EXTERNO',
  'CERTIFICADO_DIGITAL',
  'PROVEDOR_EXTERNO',
]);

export const OrdemAssinaturaSchema = z.enum([
  'SEQUENCIAL',
  'PARALELA',
]);

export const PapelSignatarioSchema = z.enum([
  'PRODUTOR',
  'FINANCEIRO_DISK',
  'DIRETORIA_DISK',
  'PARCEIRO',
  'TESTEMUNHA',
  'JURIDICO',
]);

export const StatusSignatarioSchema = z.enum([
  'PENDENTE',
  'ASSINADO',
  'RECUSADO',
  'EXPIRADO',
]);

export const TipoDossieSchema = z.enum([
  'EVENTO',
  'PRODUTOR',
  'PARCEIRO',
]);

export const StatusDossieSchema = z.enum([
  'EM_FORMACAO',
  'FECHADO',
  'REABERTO',
]);

// 1. Payload: Documento Criado
export const DocumentoCriadoPayloadSchema = z.object({
  documentoId: z.string().uuid(),
  codigo: z.string(),
  tipo: TipoDocumentoOperacionalSchema,
  titulo: z.string(),
  produtorId: z.string().optional(),
  eventoId: z.string().optional(),
  origem: z.string(),
  versao: z.number().int().min(1),
  situacao: SituacaoDocumentoSchema,
  sensibilidade: ClassificacaoSensibilidadeSchema,
  criadoPor: z.string(),
});

// 2. Payload: Documento Aprovado
export const DocumentoAprovadoPayloadSchema = z.object({
  documentoId: z.string().uuid(),
  codigo: z.string(),
  aprovadoPor: z.string(),
  aprovadoEm: z.string().datetime(),
  situacaoAnterior: SituacaoDocumentoSchema,
  situacaoNova: SituacaoDocumentoSchema,
});

// 3. Payload: Documento Rejeitado
export const DocumentoRejeitadoPayloadSchema = z.object({
  documentoId: z.string().uuid(),
  codigo: z.string(),
  rejeitadoPor: z.string(),
  motivo: z.string(),
  rejeitadoEm: z.string().datetime(),
});

// 4. Payload: Solicitação de Assinatura Emitida
export const SolicitacaoAssinaturaPayloadSchema = z.object({
  documentoId: z.string().uuid(),
  codigo: z.string(),
  signatarioId: z.string().uuid(),
  signatarioNome: z.string(),
  signatarioEmail: z.string(),
  ordem: z.number().int(),
  tipoAutenticacao: MetodoAssinaturaSchema,
  expiraEm: z.string().datetime(),
});

// 5. Payload: Assinatura Realizada
export const AssinaturaRealizadaPayloadSchema = z.object({
  documentoId: z.string().uuid(),
  codigo: z.string(),
  signatarioId: z.string().uuid(),
  signatarioNome: z.string(),
  papel: PapelSignatarioSchema,
  metodo: MetodoAssinaturaSchema,
  hashEvidencia: z.string(),
  timestamp: z.string().datetime(),
  eUltimoAssinante: z.boolean(),
});

// 6. Payload: Documento Concluído (Totalmente Assinado e Selado)
export const DocumentoConcluidoPayloadSchema = z.object({
  documentoId: z.string().uuid(),
  codigo: z.string(),
  tipo: TipoDocumentoOperacionalSchema,
  hashFinal: z.string(),
  totalSignatarios: z.number().int(),
  concluidoEm: z.string().datetime(),
});

// 7. Payload: Documento Contestado
export const DocumentoContestadoPayloadSchema = z.object({
  documentoId: z.string().uuid(),
  codigo: z.string(),
  solicitanteId: z.string(),
  solicitanteNome: z.string(),
  motivo: z.string(),
  contestadoEm: z.string().datetime(),
});

// 8. Payload: Divergência Contratual Detectada
export const DivergenciaContratualDetectadaPayloadSchema = z.object({
  contratoCodigo: z.string(),
  produtorId: z.string(),
  eventoId: z.string().optional(),
  campo: z.string(),
  valorContratual: z.union([z.string(), z.number(), z.boolean()]),
  valorOperacional: z.union([z.string(), z.number(), z.boolean()]),
  severidade: z.enum(['BAIXA', 'MEDIA', 'ALTA', 'CRITICA']),
  detectadoEm: z.string().datetime(),
});

// 9. Payload: Dossiê Snapshot Gerado
export const DossieSnapshotGeradoPayloadSchema = z.object({
  dossieId: z.string().uuid(),
  codigo: z.string(),
  tipo: TipoDossieSchema,
  referenciaId: z.string(),
  versaoFechamento: z.number().int(),
  manifestoHash: z.string(),
  totalArquivos: z.number().int(),
  totalDocumentosAssinados: z.number().int(),
  geradoEm: z.string().datetime(),
});

// 10. Payload: Dossiê Reaberto
export const DossieReabertoPayloadSchema = z.object({
  dossieId: z.string().uuid(),
  codigo: z.string(),
  reabertoPor: z.string(),
  motivo: z.string(),
  aprovadoPor: z.string(),
  reabertoEm: z.string().datetime(),
});

// Event definitions
export const DocumentoCriadoV1 = defineEvent(
  'documentos.documento.criado.v1',
  DocumentoCriadoPayloadSchema,
);

export const DocumentoAprovadoV1 = defineEvent(
  'documentos.documento.aprovado.v1',
  DocumentoAprovadoPayloadSchema,
);

export const DocumentoRejeitadoV1 = defineEvent(
  'documentos.documento.rejeitado.v1',
  DocumentoRejeitadoPayloadSchema,
);

export const SolicitacaoAssinaturaEmitidaV1 = defineEvent(
  'documentos.solicitacao_assinatura.emitida.v1',
  SolicitacaoAssinaturaPayloadSchema,
);

export const AssinaturaRealizadaV1 = defineEvent(
  'documentos.assinatura.realizada.v1',
  AssinaturaRealizadaPayloadSchema,
);

export const DocumentoConcluidoV1 = defineEvent(
  'documentos.documento.concluido.v1',
  DocumentoConcluidoPayloadSchema,
);

export const DocumentoContestadoV1 = defineEvent(
  'documentos.documento.contestado.v1',
  DocumentoContestadoPayloadSchema,
);

export const DivergenciaContratualDetectadaV1 = defineEvent(
  'documentos.contrato.divergencia_detectada.v1',
  DivergenciaContratualDetectadaPayloadSchema,
);

export const DossieSnapshotGeradoV1 = defineEvent(
  'documentos.dossie.snapshot_gerado.v1',
  DossieSnapshotGeradoPayloadSchema,
);

export const DossieReabertoV1 = defineEvent(
  'documentos.dossie.reaberto.v1',
  DossieReabertoPayloadSchema,
);

export type TipoDocumentoOperacional = z.infer<typeof TipoDocumentoOperacionalSchema>;
export type SituacaoDocumento = z.infer<typeof SituacaoDocumentoSchema>;
export type ClassificacaoSensibilidade = z.infer<typeof ClassificacaoSensibilidadeSchema>;
export type MetodoAssinatura = z.infer<typeof MetodoAssinaturaSchema>;
export type OrdemAssinatura = z.infer<typeof OrdemAssinaturaSchema>;
export type PapelSignatario = z.infer<typeof PapelSignatarioSchema>;
export type StatusSignatario = z.infer<typeof StatusSignatarioSchema>;
export type TipoDossie = z.infer<typeof TipoDossieSchema>;
export type StatusDossie = z.infer<typeof StatusDossieSchema>;

export type DocumentoCriadoPayload = z.infer<typeof DocumentoCriadoPayloadSchema>;
export type DocumentoAprovadoPayload = z.infer<typeof DocumentoAprovadoPayloadSchema>;
export type DocumentoRejeitadoPayload = z.infer<typeof DocumentoRejeitadoPayloadSchema>;
export type SolicitacaoAssinaturaPayload = z.infer<typeof SolicitacaoAssinaturaPayloadSchema>;
export type AssinaturaRealizadaPayload = z.infer<typeof AssinaturaRealizadaPayloadSchema>;
export type DocumentoConcluidoPayload = z.infer<typeof DocumentoConcluidoPayloadSchema>;
export type DocumentoContestadoPayload = z.infer<typeof DocumentoContestadoPayloadSchema>;
export type DivergenciaContratualDetectadaPayload = z.infer<typeof DivergenciaContratualDetectadaPayloadSchema>;
export type DossieSnapshotGeradoPayload = z.infer<typeof DossieSnapshotGeradoPayloadSchema>;
export type DossieReabertoPayload = z.infer<typeof DossieReabertoPayloadSchema>;

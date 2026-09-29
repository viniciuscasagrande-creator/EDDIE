import { z } from 'zod';
import { defineEvent } from '../shared/envelope.js';
import { Money } from '../shared/money.js';

export const StatusDocumentoFiscal = z.enum([
  'PENDENTE',
  'EM_PROCESSAMENTO',
  'AUTORIZADO',
  'REJEITADO',
  'CANCELAMENTO_SOLICITADO',
  'CANCELADO',
  'SUBSTITUIDO',
  'ERRO',
]);
export type StatusDocumentoFiscal = z.infer<typeof StatusDocumentoFiscal>;

export const TipoDocumentoFiscal = z.enum([
  'NFSE',
  'NFE',
  'CTE',
  'OUTRO',
]);
export type TipoDocumentoFiscal = z.infer<typeof TipoDocumentoFiscal>;

/**
 * Publicado quando um documento fiscal é gerado e enviado para autorização pelo provedor fiscal.
 */
export const DocumentoFiscalEmitidoV1 = defineEvent(
  'fiscal.documento.emitido.v1',
  z.object({
    documentoId: z.string().uuid(),
    chaveFiscal: z.string(),
    tipo: TipoDocumentoFiscal,
    prestadorCnpj: z.string(),
    tomadorCpfCnpj: z.string(),
    tomadorNome: z.string(),
    competencia: z.string(),
    valorTotalCents: Money,
    baseCalculoCents: Money,
    valorTributosCents: Money,
    origemTipo: z.string(),
    origemReferenciaId: z.string(),
    contratoId: z.string().optional().nullable(),
    eventoId: z.string().uuid().optional().nullable(),
    produtorId: z.string().uuid().optional().nullable(),
    emitidoPor: z.string(),
    emitidoEm: z.string().datetime(),
  }),
);

/**
 * Publicado quando a autoridade fazendária / provedor autoriza o documento fiscal.
 */
export const DocumentoFiscalAutorizadoV1 = defineEvent(
  'fiscal.documento.autorizado.v1',
  z.object({
    documentoId: z.string().uuid(),
    chaveFiscal: z.string(),
    numero: z.string(),
    serie: z.string(),
    protocoloAutorizacao: z.string(),
    xmlAutorizadoSha256: z.string(),
    dataAutorizacao: z.string().datetime(),
    competencia: z.string(),
    valorTotalCents: Money,
    baseCalculoCents: Money,
  }),
);

/**
 * Publicado quando o documento fiscal é rejeitado pelo provedor ou município.
 */
export const DocumentoFiscalRejeitadoV1 = defineEvent(
  'fiscal.documento.rejeitado.v1',
  z.object({
    documentoId: z.string().uuid(),
    chaveFiscal: z.string(),
    codigoErro: z.string(),
    motivoRejeicao: z.string(),
    dataRejeicao: z.string().datetime(),
  }),
);

/**
 * Publicado quando o cancelamento formal de um documento fiscal é homologado.
 */
export const DocumentoFiscalCanceladoV1 = defineEvent(
  'fiscal.documento.cancelado.v1',
  z.object({
    documentoId: z.string().uuid(),
    chaveFiscal: z.string(),
    numero: z.string(),
    motivoCancelamento: z.string(),
    protocoloCancelamento: z.string(),
    canceladoPor: z.string(),
    canceladoEm: z.string().datetime(),
  }),
);

/**
 * Publicado quando uma regra tributária parametrizada e versionada é publicada/ativada.
 */
export const RegraTributariaPublicadaV1 = defineEvent(
  'fiscal.regra.publicada.v1',
  z.object({
    regraId: z.string().uuid(),
    codigo: z.string(),
    versao: z.number().int().positive(),
    descricao: z.string(),
    operacaoTipo: z.string(),
    regimeTributario: z.string(),
    status: z.enum(['RASCUNHO', 'VIGENTE', 'EXPIRADA', 'REVOGADA']),
    vigenciaInicio: z.string(),
    vigenciaFim: z.string().nullable().optional(),
    publicadoPor: z.string(),
    publicadoEm: z.string().datetime(),
  }),
);

/**
 * Publicado quando a apuração periódica de tributos é formalmente concluída.
 */
export const ApuracaoTributariaConcluidaV1 = defineEvent(
  'fiscal.apuracao.concluida.v1',
  z.object({
    apuracaoId: z.string().uuid(),
    competencia: z.string(),
    tributoCodigo: z.string(), // ex: "PIS", "COFINS", "ISS", "CBS", "IBS"
    baseCalculoTotalCents: Money,
    valorApuradoLiquidoCents: Money,
    totalRetencoesCents: Money,
    totalCreditosCents: Money,
    memoriaCalculoHash: z.string(),
    apuradoPor: z.string(),
    apuradoEm: z.string().datetime(),
  }),
);

/**
 * Publicado quando uma obrigação tributária principal ou acessória é cumprida.
 */
export const ObrigacaoFiscalCumpridaV1 = defineEvent(
  'fiscal.obrigacao.cumprida.v1',
  z.object({
    obrigacaoId: z.string().uuid(),
    tipo: z.enum(['PRINCIPAL', 'ACESSORIA']),
    codigo: z.string(), // ex: "DARF-PIS", "SPED", "EFD-REINF"
    competencia: z.string(),
    valorPagoCents: Money.optional().nullable(),
    protocoloEntrega: z.string().optional().nullable(),
    comprovanteDocumentoId: z.string().optional().nullable(),
    cumpridoPor: z.string(),
    cumpridoEm: z.string().datetime(),
  }),
);

/**
 * Publicado quando uma retenção tributária sobre serviços é formalizada.
 */
export const RetencaoTributariaRegistradaV1 = defineEvent(
  'fiscal.retencao.registrada.v1',
  z.object({
    retencaoId: z.string().uuid(),
    documentoFiscalId: z.string().uuid(),
    tributoCodigo: z.string(),
    baseCalculoCents: Money,
    aliquotaPercentual: z.number(),
    valorRetidoCents: Money,
    responsavelRecolhimento: z.enum(['TOMADOR', 'PRESTADOR']),
    competencia: z.string(),
    registradoEm: z.string().datetime(),
  }),
);

/**
 * Publicado quando uma conciliação fiscal em 4 pontos detecta divergência.
 */
export const DivergenciaFiscalDetectadaV1 = defineEvent(
  'fiscal.conciliacao.divergencia_detectada.v1',
  z.object({
    pontoConciliacao: z.enum([
      'OPERACAO_DOCUMENTO',
      'DOCUMENTO_CONTABILIDADE',
      'CONTABILIDADE_APURACAO',
      'APURACAO_PAGAMENTO',
    ]),
    competencia: z.string(),
    valorEsperadoCents: Money,
    valorEncontradoCents: Money,
    diferencaCents: Money,
    descricao: z.string(),
    detectadoEm: z.string().datetime(),
  }),
);

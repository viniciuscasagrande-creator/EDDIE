import { z } from 'zod';

export const CriarRegraTributariaSchema = z.object({
  codigo: z.string().min(2),
  descricao: z.string().min(5),
  operacaoTipo: z.enum([
    'INTERMEDIACAO_VENDA',
    'TAXA_CONVENIENCIA',
    'SERVICO_PLATAFORMA',
    'DESPESA_FORNECEDOR',
  ]),
  regimeTributario: z.enum([
    'LUCRO_PRESUMIDO',
    'LUCRO_REAL',
    'SIMPLES_NACIONAL',
    'REFORMA_TRIBUTARIA',
  ]),
  municipioIncidencia: z.string().optional(),
  ufIncidencia: z.string().length(2).optional(),
  status: z.enum(['RASCUNHO', 'VIGENTE', 'EXPIRADA', 'REVOGADA']).default('VIGENTE'),
  exigeNfse: z.boolean().default(true),
  politicaRetencao: z.string().default('DISPENSADA'),
  vigenciaInicio: z.string().optional(),
  vigenciaFim: z.string().optional(),
  criadoPor: z.string().min(1),
  itens: z.array(
    z.object({
      tributoCodigo: z.string().min(2),
      basePercentual: z.number().default(100.0),
      aliquotaPercentual: z.number().min(0).max(100),
      retencao: z.boolean().default(false),
      responsavelRetencao: z.enum(['TOMADOR', 'PRESTADOR']).default('PRESTADOR'),
    }),
  ).min(1),
});
export type CriarRegraTributariaInput = z.infer<typeof CriarRegraTributariaSchema>;

export const SimularOperacaoFiscalSchema = z.object({
  operacaoTipo: z.enum([
    'INTERMEDIACAO_VENDA',
    'TAXA_CONVENIENCIA',
    'SERVICO_PLATAFORMA',
    'DESPESA_FORNECEDOR',
  ]),
  valorBrutoCents: z.number().int().positive(),
  valorTaxaDiskCents: z.number().int().optional(),
  tomadorCpfCnpj: z.string().min(11),
  municipioTomador: z.string().optional(),
  regimeTributario: z
    .enum(['LUCRO_PRESUMIDO', 'LUCRO_REAL', 'SIMPLES_NACIONAL', 'REFORMA_TRIBUTARIA'])
    .optional(),
  dataCompetencia: z.string().optional(),
});
export type SimularOperacaoFiscalInput = z.infer<typeof SimularOperacaoFiscalSchema>;

export const EmitirDocumentoFiscalSchema = z.object({
  chaveFiscal: z.string().min(3),
  tipo: z.enum(['NFSE', 'NFE', 'CTE', 'OUTRO']).default('NFSE'),
  prestadorCnpj: z.string().min(14),
  tomadorCpfCnpj: z.string().min(11),
  tomadorNome: z.string().min(3),
  competencia: z.string().regex(/^\d{4}-\d{2}$/),
  valorTotalCentavos: z.number().int().positive(),
  baseCalculoCentavos: z.number().int().positive(),
  origemTipo: z.enum(['SERVICO_DISK', 'EVENTO_PRODUTOR', 'FORNECEDOR_ENTRADA']).default('SERVICO_DISK'),
  origemReferenciaId: z.string().min(1),
  contratoId: z.string().uuid().optional(),
  eventoId: z.string().uuid().optional(),
  produtorId: z.string().uuid().optional(),
  itens: z.array(
    z.object({
      descricao: z.string().min(3),
      valorCentavos: z.number().int().positive(),
      baseCalculoCentavos: z.number().int().positive(),
      aliquota: z.number().min(0).max(100),
      tributoCodigo: z.string().min(2),
    }),
  ).min(1),
});
export type EmitirDocumentoFiscalInput = z.infer<typeof EmitirDocumentoFiscalSchema>;

export const CancelarDocumentoFiscalSchema = z.object({
  documentoId: z.string().uuid(),
  motivoCancelamento: z.string().min(10),
  canceladoPor: z.string().min(1),
});
export type CancelarDocumentoFiscalInput = z.infer<typeof CancelarDocumentoFiscalSchema>;

export const RealizarApuracaoSchema = z.object({
  competencia: z.string().regex(/^\d{4}-\d{2}$/),
  tributoCodigo: z.string().min(2), // "PIS", "COFINS", "ISS", "CBS", "IBS"
  fechadoPor: z.string().min(1),
});
export type RealizarApuracaoInput = z.infer<typeof RealizarApuracaoSchema>;

export const ValidarThreeWayMatchSchema = z.object({
  fornecedorCnpj: z.string().min(14),
  fornecedorNome: z.string().min(3),
  documentoFiscalNumero: z.string().min(1),
  valorDocumentoFiscalCentavos: z.number().int().positive(),
  valorContratoCentavos: z.number().int().positive(),
  valorPagamentoCentavos: z.number().int().positive(),
  eventoId: z.string().uuid().optional(),
});
export type ValidarThreeWayMatchInput = z.infer<typeof ValidarThreeWayMatchSchema>;

export const RegistrarObrigacaoSchema = z.object({
  codigo: z.string().min(2),
  tipo: z.enum(['PRINCIPAL', 'ACESSORIA']).default('PRINCIPAL'),
  tributoCodigo: z.string().optional(),
  descricao: z.string().min(5),
  competencia: z.string().regex(/^\d{4}-\d{2}$/),
  dataVencimento: z.string(),
  valorPrevistoCentavos: z.number().int().default(0),
  guiaCodigoBarras: z.string().optional(),
});
export type RegistrarObrigacaoInput = z.infer<typeof RegistrarObrigacaoSchema>;

export const FecharPeriodoFiscalSchema = z.object({
  competencia: z.string().regex(/^\d{4}-\d{2}$/),
  fechadoPor: z.string().min(1),
  checklist: z.record(z.boolean()).optional(),
});
export type FecharPeriodoFiscalInput = z.infer<typeof FecharPeriodoFiscalSchema>;

export const ReabrirPeriodoFiscalSchema = z.object({
  competencia: z.string().regex(/^\d{4}-\d{2}$/),
  motivo: z.string().min(10),
  reabertoPor: z.string().min(1),
});
export type ReabrirPeriodoFiscalInput = z.infer<typeof ReabrirPeriodoFiscalSchema>;

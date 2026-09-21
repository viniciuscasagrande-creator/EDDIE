import { z } from 'zod';
import { defineEvent } from '../shared/envelope.js';
import { Money } from '../shared/money.js';

export const EtapaPipelineEnum = z.enum([
  'prospeccao',
  'qualificacao',
  'diagnostico',
  'proposta',
  'negociacao',
  'contrato',
  'ganho',
  'perdido',
]);
export type EtapaPipelineEnum = z.infer<typeof EtapaPipelineEnum>;

export const TipoAtividadeComercial = z.enum([
  'ligacao',
  'reuniao',
  'email',
  'proposta',
  'visita',
  'followup',
]);
export type TipoAtividadeComercial = z.infer<typeof TipoAtividadeComercial>;

/**
 * Publicado ao cadastrar ou credenciar um novo produtor B2B na carteira.
 */
export const ProdutorB2BCadastrado = defineEvent(
  'comercial.produtor_cadastrado.v1',
  z.object({
    produtorId: z.string().uuid(),
    razaoSocial: z.string(),
    nomeFantasia: z.string(),
    documento: z.string(),
    executivoResponsavelId: z.string().uuid(),
    cadastradoEm: z.string().datetime(),
  }),
);

/**
 * Publicado ao abrir uma nova oportunidade comercial no pipeline B2B.
 */
export const OportunidadeCriada = defineEvent(
  'comercial.oportunidade_criada.v1',
  z.object({
    oportunidadeId: z.string().uuid(),
    produtorId: z.string().uuid(),
    titulo: z.string(),
    valorEstimadoCents: Money,
    etapa: EtapaPipelineEnum,
    executivoId: z.string().uuid(),
    criadoEm: z.string().datetime(),
  }),
);

/**
 * Publicado ao avançar ou regredir uma oportunidade no funil de vendas.
 */
export const EtapaPipelineAlterada = defineEvent(
  'comercial.etapa_pipeline_alterada.v1',
  z.object({
    oportunidadeId: z.string().uuid(),
    produtorId: z.string().uuid(),
    etapaAnterior: EtapaPipelineEnum,
    etapaNova: EtapaPipelineEnum,
    motivo: z.string().nullable(),
    alteradoPor: z.string().uuid(),
    alteradoEm: z.string().datetime(),
  }),
);

/**
 * Publicado ao aprovar condições comerciais (taxas, prazos, split) negociadas com o produtor.
 * Alimenta automaticamente os módulos Financeiro e Eventos.
 */
export const CondicaoComercialAprovada = defineEvent(
  'comercial.condicao_comercial_aprovada.v1',
  z.object({
    condicaoId: z.string().uuid(),
    produtorId: z.string().uuid(),
    eventoId: z.string().uuid().nullable(), // null = condição padrão da produtora
    taxaServicoPercentual: z.number().nonnegative(),
    taxaProcessamentoPercentual: z.number().nonnegative(),
    prazoRepasseDias: z.number().int().nonnegative(),
    vigenciaInicio: z.string().datetime(),
    vigenciaFim: z.string().datetime().nullable(),
    aprovadoPor: z.string().uuid(),
    aprovadoEm: z.string().datetime(),
  }),
);

/**
 * Publicado ao registrar atividade ou follow-up comercial.
 */
export const AtividadeComercialRegistrada = defineEvent(
  'comercial.atividade_registrada.v1',
  z.object({
    atividadeId: z.string().uuid(),
    produtorId: z.string().uuid(),
    oportunidadeId: z.string().uuid().nullable(),
    tipo: TipoAtividadeComercial,
    descricao: z.string(),
    executadoPor: z.string().uuid(),
    registradoEm: z.string().datetime(),
  }),
);

import { z } from 'zod';
import { defineEvent } from '../shared/envelope.js';
import { Money } from '../shared/money.js';

export const CanalMarketing = z.enum([
  'meta',
  'google',
  'tiktok',
  'spotify',
  'whatsapp',
  'email',
  'link_direto',
  'afiliado',
]);
export type CanalMarketing = z.infer<typeof CanalMarketing>;

export const ProvedorPixel = z.enum(['meta', 'google', 'tiktok', 'spotify']);
export type ProvedorPixel = z.infer<typeof ProvedorPixel>;

export const StatusCampanha = z.enum([
  'rascunho',
  'agendada',
  'ativa',
  'pausada',
  'com_alerta',
  'erro',
  'encerrada',
]);
export type StatusCampanha = z.infer<typeof StatusCampanha>;

export const TipoDescontoCupom = z.enum(['percentual', 'valor_fixo']);
export type TipoDescontoCupom = z.infer<typeof TipoDescontoCupom>;

export const ModeloAtribuicao = z.enum([
  'last_click',
  'first_click',
  'linear',
  'cupom_direto',
]);
export type ModeloAtribuicao = z.infer<typeof ModeloAtribuicao>;

/**
 * Publicado quando uma nova campanha de marketing (pronta ou multicanal) é criada.
 */
export const CampanhaCriada = defineEvent(
  'marketing.campanha_criada.v1',
  z.object({
    campanhaId: z.string().uuid(),
    produtorId: z.string().uuid(),
    eventoId: z.string().uuid(),
    nome: z.string(),
    objetivo: z.string(),
    canais: z.array(CanalMarketing).min(1),
    orcamentoCents: Money,
    criadoEm: z.string().datetime(),
  }),
);

/**
 * Publicado ao alterar o status real de entrega ou pausa da campanha.
 */
export const CampanhaStatusAlterado = defineEvent(
  'marketing.campanha_status_alterado.v1',
  z.object({
    campanhaId: z.string().uuid(),
    produtorId: z.string().uuid(),
    eventoId: z.string().uuid(),
    statusAnterior: StatusCampanha,
    statusNovo: StatusCampanha,
    motivo: z.string().nullable(),
    alteradoEm: z.string().datetime(),
  }),
);

/**
 * Publicado ao registrar ou atualizar um pixel/tag de conversão vinculado ao evento.
 */
export const PixelConfigurado = defineEvent(
  'marketing.pixel_configurado.v1',
  z.object({
    pixelId: z.string().uuid(),
    produtorId: z.string().uuid(),
    eventoId: z.string().uuid(),
    provedor: ProvedorPixel,
    pixelExternalId: z.string(),
    configuradoEm: z.string().datetime(),
  }),
);

/**
 * Publicado ao criar um cupom de desconto/promocional para um evento ou campanha.
 */
export const CupomCriado = defineEvent(
  'marketing.cupom_criado.v1',
  z.object({
    cupomId: z.string().uuid(),
    produtorId: z.string().uuid(),
    eventoId: z.string().uuid(),
    campanhaId: z.string().uuid().nullable(),
    codigo: z.string(),
    tipoDesconto: TipoDescontoCupom,
    descontoValor: Money,
    limiteUso: z.number().int().positive().nullable(),
    validoAte: z.string().datetime().nullable(),
    criadoEm: z.string().datetime(),
  }),
);

/**
 * Publicado quando um pedido pago é correlacionado a UTMs, campanhas ou cupons de marketing.
 */
export const ConversaoAtribuida = defineEvent(
  'marketing.conversao_atribuida.v1',
  z.object({
    conversaoId: z.string().uuid(),
    produtorId: z.string().uuid(),
    eventoId: z.string().uuid(),
    pedidoId: z.string().uuid(),
    campanhaId: z.string().uuid().nullable(),
    canal: CanalMarketing.nullable(),
    utmSource: z.string().nullable(),
    utmMedium: z.string().nullable(),
    utmCampaign: z.string().nullable(),
    cupomCodigo: z.string().nullable(),
    modeloAtribuicao: ModeloAtribuicao,
    valorTotalCents: Money,
    receitaAtribuidaCents: Money,
    atribuidaEm: z.string().datetime(),
  }),
);

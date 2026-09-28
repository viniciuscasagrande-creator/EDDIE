import { z } from 'zod';
import { defineEvent } from '../envelope.js';

export const PesquisaCriadaPayloadSchema = z.object({
  pesquisaId: z.string().uuid(),
  eventoId: z.string().uuid(),
  tenantId: z.string().uuid(),
  titulo: z.string(),
  modeloOrigem: z.string().optional(),
  criadoEm: z.string().datetime(),
});

export const CampanhaDisparadaPayloadSchema = z.object({
  campanhaId: z.string().uuid(),
  eventoId: z.string().uuid(),
  tenantId: z.string().uuid(),
  canal: z.enum(['WHATSAPP', 'EMAIL', 'SMS']),
  publicoTotal: z.number().int().nonnegative(),
  custoTotalCents: z.number().int().nonnegative(),
  custoUnitarioCents: z.number().int().nonnegative(),
  aprovadoPor: z.string().optional(),
  disparadoEm: z.string().datetime(),
});

export const PesquisaRespondidaPayloadSchema = z.object({
  respostaId: z.string().uuid(),
  pesquisaId: z.string().uuid(),
  eventoId: z.string().uuid(),
  perfilId: z.string().uuid().optional(),
  notaSatisfacaoGeral: z.number().min(1).max(5),
  npsScore: z.number().min(0).max(10).optional(),
  voltaria: z.enum(['SIM', 'TALVEZ', 'NAO']),
  comentarioAberto: z.string().optional(),
  respondidoEm: z.string().datetime(),
});

export const ConsentimentoRegistradoPayloadSchema = z.object({
  consentimentoId: z.string().uuid(),
  perfilId: z.string().uuid(),
  tenantId: z.string().uuid(),
  finalidade: z.string(),
  canal: z.enum(['WHATSAPP', 'EMAIL', 'SMS', 'NOTIFICACAO']),
  versaoTermo: z.string(),
  registradoEm: z.string().datetime(),
});

export const BloqueioRegistradoPayloadSchema = z.object({
  bloqueioId: z.string().uuid(),
  tenantId: z.string().uuid(),
  identificador: z.string(),
  canal: z.string(),
  motivo: z.string(),
  bloqueadoEm: z.string().datetime(),
});

export const SegmentoSalvoPayloadSchema = z.object({
  segmentoId: z.string().uuid(),
  tenantId: z.string().uuid(),
  eventoId: z.string().uuid().optional(),
  nome: z.string(),
  totalMembros: z.number().int().nonnegative(),
  salvoEm: z.string().datetime(),
});

export const PesquisaCriadaV1 = defineEvent('pos_evento.pesquisa_criada.v1', PesquisaCriadaPayloadSchema);
export const CampanhaDisparadaV1 = defineEvent('pos_evento.campanha_disparada.v1', CampanhaDisparadaPayloadSchema);
export const PesquisaRespondidaV1 = defineEvent('pos_evento.pesquisa_respondida.v1', PesquisaRespondidaPayloadSchema);
export const ConsentimentoRegistradoV1 = defineEvent('pos_evento.consentimento_registrado.v1', ConsentimentoRegistradoPayloadSchema);
export const BloqueioRegistradoV1 = defineEvent('pos_evento.bloqueio_registrado.v1', BloqueioRegistradoPayloadSchema);
export const SegmentoSalvoV1 = defineEvent('pos_evento.segmento_salvo.v1', SegmentoSalvoPayloadSchema);

export type PesquisaCriadaPayload = z.infer<typeof PesquisaCriadaPayloadSchema>;
export type CampanhaDisparadaPayload = z.infer<typeof CampanhaDisparadaPayloadSchema>;
export type PesquisaRespondidaPayload = z.infer<typeof PesquisaRespondidaPayloadSchema>;
export type ConsentimentoRegistradoPayload = z.infer<typeof ConsentimentoRegistradoPayloadSchema>;
export type BloqueioRegistradoPayload = z.infer<typeof BloqueioRegistradoPayloadSchema>;
export type SegmentoSalvoPayload = z.infer<typeof SegmentoSalvoPayloadSchema>;

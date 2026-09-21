import { z } from 'zod';
import { defineEvent } from '../shared/envelope.js';

/** Publicados pelo módulo ACESSO. */

export const IngressoEmitido = defineEvent(
  'acesso.ingresso_emitido.v1',
  z.object({
    ingressoId: z.string().uuid(),
    pedidoId: z.string().uuid(),
    itemId: z.string().uuid(),
    sessaoId: z.string().uuid(),
    clienteId: z.string().uuid(),
    /** Payload do QR assinado (HMAC). Nunca logar em claro. */
    qrHash: z.string(),
    emitidoEm: z.string().datetime(),
  }),
);

export const IngressoInvalidado = defineEvent(
  'acesso.ingresso_invalidado.v1',
  z.object({
    ingressoId: z.string().uuid(),
    pedidoId: z.string().uuid(),
    motivo: z.enum(['estorno', 'fraude', 'transferencia', 'cancelamento']),
  }),
);

export const CheckinRealizado = defineEvent(
  'acesso.checkin_realizado.v1',
  z.object({
    ingressoId: z.string().uuid(),
    sessaoId: z.string().uuid(),
    portaoId: z.string(),
    operadorId: z.string().nullable(),
    /** true se validado offline e sincronizado depois. */
    offline: z.boolean(),
    checkinEm: z.string().datetime(),
  }),
);

import { z } from 'zod';
import { defineEvent } from '../shared/envelope.js';
import { Money } from '../shared/money.js';

/** Publicados pelo módulo EVENTOS. */

export const EventoPublicado = defineEvent(
  'evento.publicado.v1',
  z.object({
    eventoId: z.string().uuid(),
    produtorId: z.string().uuid(),
    nome: z.string(),
    slug: z.string(),
    localNome: z.string(),
    cidade: z.string(),
    uf: z.string().length(2),
    classificacaoEtaria: z.number().int().min(0),
    publicadoEm: z.string().datetime(),
  }),
);

export const SessaoCriada = defineEvent(
  'evento.sessao_criada.v1',
  z.object({
    sessaoId: z.string().uuid(),
    eventoId: z.string().uuid(),
    inicioEm: z.string().datetime(),
    fimEm: z.string().datetime().nullable(),
    capacidadeTotal: z.number().int().positive(),
  }),
);

export const LoteAberto = defineEvent(
  'evento.lote_aberto.v1',
  z.object({
    loteId: z.string().uuid(),
    sessaoId: z.string().uuid(),
    setorId: z.string().uuid(),
    nome: z.string(),                    // "1º Lote — Pista"
    precoFace: Money,                    // valor do ingresso
    taxaConveniencia: Money,             // taxa da plataforma
    quantidade: z.number().int().positive(),
    abreEm: z.string().datetime(),
    fechaEm: z.string().datetime().nullable(),
  }),
);

export const EventoCancelado = defineEvent(
  'evento.cancelado.v1',
  z.object({
    eventoId: z.string().uuid(),
    motivo: z.string(),
    /** Se true, o módulo Estorno abre reembolso total automático (inclui taxa). */
    estornoAutomatico: z.boolean(),
    canceladoEm: z.string().datetime(),
  }),
);

export const EventoAdiado = defineEvent(
  'evento.adiado.v1',
  z.object({
    eventoId: z.string().uuid(),
    sessaoId: z.string().uuid(),
    novaDataEm: z.string().datetime(),
    /** Janela em que o comprador pode optar por estorno em vez de manter. */
    janelaOpcaoEstornoDias: z.number().int().positive(),
  }),
);

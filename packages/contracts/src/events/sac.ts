import { z } from 'zod';
import { defineEvent } from '../shared/envelope.js';

/** Publicados pelo módulo SAC (padrão ITIL). */

export const TipoChamado = z.enum([
  'incidente',    // algo quebrado: "não recebi meu ingresso"
  'requisicao',   // pedido padrão: "quero transferir titularidade"
  'problema',     // causa raiz de incidentes recorrentes
  'mudanca',      // change que impacta cliente
]);

export const Prioridade = z.enum(['P1', 'P2', 'P3', 'P4']);

export const ChamadoAberto = defineEvent(
  'sac.chamado_aberto.v1',
  z.object({
    chamadoId: z.string().uuid(),
    numero: z.string(),                       // SAC-2026-000123
    tipo: TipoChamado,
    clienteId: z.string().uuid().nullable(),
    pedidoId: z.string().uuid().nullable(),
    canal: z.enum(['whatsapp', 'email', 'chat', 'telefone', 'reclame_aqui']),
    assunto: z.string(),
    impacto: z.enum(['alto', 'medio', 'baixo']),
    urgencia: z.enum(['alta', 'media', 'baixa']),
    prioridade: Prioridade,                   // derivada da matriz impacto x urgência
    slaRespostaEm: z.string().datetime(),
    slaResolucaoEm: z.string().datetime(),
    /** Classificação automática feita pela IA. */
    classificacaoIa: z
      .object({
        categoria: z.string(),
        confianca: z.number().min(0).max(1),
        sentimento: z.enum(['positivo', 'neutro', 'negativo', 'critico']),
        modelo: z.string(),
      })
      .nullable(),
  }),
);

export const SlaViolado = defineEvent(
  'sac.sla_violado.v1',
  z.object({
    chamadoId: z.string().uuid(),
    numero: z.string(),
    prioridade: Prioridade,
    tipoSla: z.enum(['resposta', 'resolucao']),
    previstoEm: z.string().datetime(),
    atrasoMinutos: z.number().int().positive(),
    responsavelId: z.string().uuid().nullable(),
  }),
);

export const ChamadoResolvido = defineEvent(
  'sac.chamado_resolvido.v1',
  z.object({
    chamadoId: z.string().uuid(),
    numero: z.string(),
    tipo: TipoChamado,
    solucao: z.string(),
    tempoResolucaoMinutos: z.number().int(),
    dentroDoSla: z.boolean(),
    resolvidoPor: z.string(),
    /** true quando a IA resolveu sem intervenção humana. */
    resolvidoPorIa: z.boolean(),
    csat: z.number().int().min(1).max(5).nullable(),
  }),
);

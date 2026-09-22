import { z } from 'zod';

export const CriarChamadoSchema = z.object({
  compradorNome: z.string().min(2),
  compradorCpf: z.string().min(11),
  compradorEmail: z.string().email(),
  compradorTelefone: z.string().min(8),
  pedidoId: z.string().uuid().optional(),
  eventoId: z.string().uuid().optional(),
  assunto: z.string().min(3),
  categoria: z.enum(['duvida', 'cancelamento', 'ingresso', 'pagamento', 'outro']).default('duvida'),
  prioridade: z.enum(['baixa', 'media', 'alta', 'urgente']).default('media'),
  mensagemInicial: z.string().min(5),
});

export const AdicionarMensagemSchema = z.object({
  autorTipo: z.enum(['agente', 'comprador', 'sistema']).default('agente'),
  autorNome: z.string().min(2),
  conteudo: z.string().min(1),
});

export const AtualizarStatusChamadoSchema = z.object({
  status: z.enum(['aberto', 'em_atendimento', 'aguardando_cliente', 'resolvido', 'cancelado']),
  agenteResponsavel: z.string().optional(),
  solucao: z.string().optional(),
});

export type CriarChamadoDto = z.infer<typeof CriarChamadoSchema>;
export type AdicionarMensagemDto = z.infer<typeof AdicionarMensagemSchema>;
export type AtualizarStatusChamadoDto = z.infer<typeof AtualizarStatusChamadoSchema>;

import { z } from 'zod';

export const CriarOcorrenciaSchema = z.object({
  eventoId: z.string().uuid(),
  produtorId: z.string().uuid(),
  titulo: z.string().min(3),
  descricao: z.string().min(5),
  tipo: z.enum(['catraca', 'bilheteria', 'rede', 'credenciamento', 'seguranca', 'outro']).default('catraca'),
  severidade: z.enum(['baixa', 'media', 'alta', 'critica']).default('media'),
  responsavel: z.string().optional(),
});

export const AtualizarStatusOcorrenciaSchema = z.object({
  status: z.enum(['aberta', 'em_andamento', 'escalada', 'resolvida']),
  responsavel: z.string().optional(),
  solucao: z.string().optional(),
});

export type CriarOcorrenciaDto = z.infer<typeof CriarOcorrenciaSchema>;
export type AtualizarStatusOcorrenciaDto = z.infer<typeof AtualizarStatusOcorrenciaSchema>;

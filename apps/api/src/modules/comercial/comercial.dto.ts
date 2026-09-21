import { z } from 'zod';
import {
  EtapaPipelineEnum,
  TipoAtividadeComercial,
} from '@ticketing/contracts';

export const CadastrarProdutorB2BSchema = z.object({
  razaoSocial: z.string().min(3),
  nomeFantasia: z.string().min(2),
  documento: z.string().min(11).max(18),
  email: z.string().email(),
  telefone: z.string().optional(),
  executivoResponsavelId: z.string().uuid(),
  observacoes: z.string().optional(),
});
export type CadastrarProdutorB2BInput = z.infer<typeof CadastrarProdutorB2BSchema>;

export const CriarOportunidadeSchema = z.object({
  produtorId: z.string().uuid(),
  titulo: z.string().min(3),
  valorEstimadoCents: z.number().int().positive(),
  etapa: EtapaPipelineEnum.default('prospeccao'),
  probabilidadePercentual: z.number().int().min(0).max(100).default(20),
  dataFechamentoPrevista: z.string().datetime().optional(),
  executivoId: z.string().uuid(),
});
export type CriarOportunidadeInput = z.infer<typeof CriarOportunidadeSchema>;

export const AlterarEtapaOportunidadeSchema = z.object({
  etapaNova: EtapaPipelineEnum,
  motivo: z.string().optional(),
  alteradoPor: z.string().uuid(),
});
export type AlterarEtapaOportunidadeInput = z.infer<typeof AlterarEtapaOportunidadeSchema>;

export const NegociarCondicaoComercialSchema = z.object({
  produtorId: z.string().uuid(),
  eventoId: z.string().uuid().optional(),
  taxaServicoPercentual: z.number().min(0).max(100),
  taxaProcessamentoPercentual: z.number().min(0).max(100),
  prazoRepasseDias: z.number().int().min(0).default(2),
  vigenciaInicio: z.string().datetime(),
  vigenciaFim: z.string().datetime().optional(),
});
export type NegociarCondicaoComercialInput = z.infer<typeof NegociarCondicaoComercialSchema>;

export const AprovarCondicaoComercialSchema = z.object({
  aprovadoPor: z.string().uuid(),
});
export type AprovarCondicaoComercialInput = z.infer<typeof AprovarCondicaoComercialSchema>;

export const RegistrarAtividadeComercialSchema = z.object({
  produtorId: z.string().uuid(),
  oportunidadeId: z.string().uuid().optional(),
  tipo: TipoAtividadeComercial,
  descricao: z.string().min(3),
  dataAgendada: z.string().datetime(),
  executadoPor: z.string().uuid(),
});
export type RegistrarAtividadeComercialInput = z.infer<typeof RegistrarAtividadeComercialSchema>;

export const DefinirMetaComercialSchema = z.object({
  executivoId: z.string().uuid(),
  periodo: z.string().min(4), // Ex: "2026-Q3", "2026-09"
  valorMetaCents: z.number().int().positive(),
});
export type DefinirMetaComercialInput = z.infer<typeof DefinirMetaComercialSchema>;

export interface ResumoPipelineDto {
  totalOportunidades: number;
  valorTotalEstimadoCents: number;
  porEtapa: Record<string, { quantidade: number; valorTotalCents: number }>;
}

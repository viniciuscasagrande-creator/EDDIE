import { z } from 'zod';

export const BucketEnum = z.enum([
  'disponivel',
  'bloqueado',
  'reservado_estorno',
  'retido',
]);

export const SolicitarTransferenciaInterEventoSchema = z.object({
  produtorId: z.string().uuid(),
  eventoOrigemId: z.string().uuid(),
  eventoDestinoId: z.string().uuid(),
  valorCents: z.number().int().positive(),
  justificativa: z.string().min(5),
  autorId: z.string().min(1),
});

export const SolicitarRepasseSchema = z.object({
  produtorId: z.string().uuid(),
  eventoId: z.string().uuid().optional(),
  valorCents: z.number().int().positive(),
  chavePix: z.string().min(3),
  dataProgramada: z.string().datetime(),
});

export const SimularAntecipacaoSchema = z.object({
  produtorId: z.string().uuid(),
  eventoId: z.string().uuid(),
  valorBrutoCents: z.number().int().positive(),
  taxaDesagioPercentual: z.number().positive(),
  diasAntecipados: z.number().int().positive(),
});

export const SolicitarAntecipacaoSchema = SimularAntecipacaoSchema;

export const CriarContaPagarSchema = z.object({
  produtorId: z.string().uuid(),
  eventoId: z.string().uuid(),
  fornecedorNome: z.string().min(2),
  fornecedorDocumento: z.string().min(11),
  chavePix: z.string().optional(),
  categoria: z.string().min(2),
  descricao: z.string().min(3),
  valorCents: z.number().int().positive(),
  vencimentoEm: z.string().datetime(),
});

export type SolicitarTransferenciaInterEventoInput = z.infer<typeof SolicitarTransferenciaInterEventoSchema>;
export type SolicitarRepasseInput = z.infer<typeof SolicitarRepasseSchema>;
export type SimularAntecipacaoInput = z.infer<typeof SimularAntecipacaoSchema>;
export type SolicitarAntecipacaoInput = z.infer<typeof SolicitarAntecipacaoSchema>;
export type CriarContaPagarInput = z.infer<typeof CriarContaPagarSchema>;

export interface SaldosContaGraficaDto {
  produtorId: string;
  eventoId?: string | null;
  disponivelCents: number;
  bloqueadoCents: number;
  reservadoEstornoCents: number;
  retidoCents: number;
  totalPatrimonioCents: number;
}

export interface SimulacaoAntecipacaoDto {
  valorBrutoCents: number;
  taxaDesagioPercentual: number;
  custoDesagioCents: number;
  valorLiquidoDisponibilizadoCents: number;
  diasAntecipados: number;
}

export const ExtratoQuerySchema = z.object({
  eventoId: z.string().uuid().optional(),
  bucket: BucketEnum.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});
export type ExtratoQueryInput = z.infer<typeof ExtratoQuerySchema>;

export const PagarContaSchema = z.object({
  aprovadoPor: z.string().min(1),
});
export type PagarContaInput = z.infer<typeof PagarContaSchema>;


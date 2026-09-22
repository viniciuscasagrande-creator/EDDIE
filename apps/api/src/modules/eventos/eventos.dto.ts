import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const criarEventoSchema = z.object({
  produtorId: z.string().uuid(),
  nome: z.string().min(3).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  descricao: z.string().optional(),
  categoria: z.enum(['show', 'teatro', 'esporte', 'festa', 'congresso', 'outro']),
  classificacaoEtaria: z.number().int().min(0).max(18).default(0),
  imagemUrl: z.string().url().optional(),
});
export class CriarEventoDto extends createZodDto(criarEventoSchema) {}

export const criarSessaoSchema = z
  .object({
    localId: z.string().uuid(),
    inicioEm: z.coerce.date(),
    fimEm: z.coerce.date().optional(),
    vendaAbreEm: z.coerce.date(),
    vendaFechaEm: z.coerce.date(),
    capacidadeTotal: z.number().int().positive(),
  })
  .refine((s) => s.vendaAbreEm < s.vendaFechaEm, {
    message: 'vendaAbreEm deve ser anterior a vendaFechaEm',
  });
export class CriarSessaoDto extends createZodDto(criarSessaoSchema) {}

export const criarSetorSchema = z.object({
  nome: z.string().min(1),
  marcado: z.boolean().default(false),
  capacidade: z.number().int().positive().optional(),
});
export class CriarSetorDto extends createZodDto(criarSetorSchema) {}

export const criarLoteSchema = z.object({
  setorId: z.string().uuid(),
  nome: z.string().min(1),
  ordem: z.number().int().positive(),
  precoFace: z.number().nonnegative(),
  taxaConveniencia: z.number().nonnegative(),
  quantidade: z.number().int().positive(),
  abreEm: z.coerce.date(),
  fechaEm: z.coerce.date().optional(),
});
export class CriarLoteDto extends createZodDto(criarLoteSchema) {}

export const cancelarEventoSchema = z.object({
  motivo: z.string().min(10),
  estornoAutomatico: z.boolean().default(true),
});
export class CancelarEventoDto extends createZodDto(cancelarEventoSchema) {}

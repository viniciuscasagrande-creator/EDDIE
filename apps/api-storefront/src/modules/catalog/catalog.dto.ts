import { z } from 'zod';

export const ListarEventosQuerySchema = z.object({
  cidade: z.string().optional(),
  categoria: z.string().optional(),
  busca: z.string().optional(),
  pagina: z.coerce.number().int().positive().default(1),
  limite: z.coerce.number().int().positive().max(50).default(20),
});

export type ListarEventosQuery = z.infer<typeof ListarEventosQuerySchema>;

export interface EventoVitrineDto {
  id: string;
  slug: string;
  titulo: string;
  categoria: string;
  localNome: string;
  cidade: string;
  estado: string;
  imagemUrl?: string;
  dataInicioPrimeiraSessao: string;
  precoMinimoCents: number;
}

export interface LoteVitrineDto {
  id: string;
  nome: string;
  precoFaceCents: number;
  taxaConvenienciaCents: number;
  totalCents: number;
  esgotado: boolean;
}

export interface SetorVitrineDto {
  id: string;
  nome: string;
  comAssentoMarcado: boolean;
  lotes: LoteVitrineDto[];
}

export interface SessaoVitrineDto {
  id: string;
  dataHoraInicio: string;
  dataHoraFim?: string;
  setores: SetorVitrineDto[];
}

export interface EventoDetalheDto {
  id: string;
  slug: string;
  titulo: string;
  descricao?: string;
  categoria: string;
  localNome: string;
  endereco: string;
  cidade: string;
  estado: string;
  imagemUrl?: string;
  sessoes: SessaoVitrineDto[];
}

export interface AssentoMapaDto {
  id: string;
  fila: string;
  numero: string;
  status: 'DISPONIVEL' | 'RESERVADO' | 'OCUPADO';
}

export interface MapaAssentosSetorDto {
  setorId: string;
  sessaoId: string;
  assentos: AssentoMapaDto[];
}

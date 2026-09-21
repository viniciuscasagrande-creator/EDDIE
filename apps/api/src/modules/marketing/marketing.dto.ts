import { z } from 'zod';
import {
  CanalMarketing,
  ProvedorPixel,
  StatusCampanha,
  TipoDescontoCupom,
  ModeloAtribuicao,
} from '@ticketing/contracts';

export const CriarCampanhaSchema = z.object({
  produtorId: z.string().uuid(),
  eventoId: z.string().uuid(),
  nome: z.string().min(3),
  objetivo: z.string().min(3),
  canais: z.array(CanalMarketing).min(1),
  orcamentoCents: z.number().int().positive(),
  iniciaEm: z.string().datetime().optional(),
  terminaEm: z.string().datetime().optional(),
});
export type CriarCampanhaInput = z.infer<typeof CriarCampanhaSchema>;

export const AlterarStatusCampanhaSchema = z.object({
  statusNovo: StatusCampanha,
  motivo: z.string().optional(),
});
export type AlterarStatusCampanhaInput = z.infer<typeof AlterarStatusCampanhaSchema>;

export const ConfigurarPixelSchema = z.object({
  produtorId: z.string().uuid(),
  eventoId: z.string().uuid(),
  provedor: ProvedorPixel,
  pixelExternalId: z.string().min(3),
  nome: z.string().optional(),
});
export type ConfigurarPixelInput = z.infer<typeof ConfigurarPixelSchema>;

export const GerarLinkUtmSchema = z.object({
  produtorId: z.string().uuid(),
  eventoId: z.string().uuid(),
  campanhaId: z.string().uuid().optional(),
  canal: CanalMarketing,
  urlDestino: z.string().url(),
  utmSource: z.string().min(1),
  utmMedium: z.string().min(1),
  utmCampaign: z.string().min(1),
  utmContent: z.string().optional(),
  utmTerm: z.string().optional(),
});
export type GerarLinkUtmInput = z.infer<typeof GerarLinkUtmSchema>;

export const CriarCupomSchema = z.object({
  produtorId: z.string().uuid(),
  eventoId: z.string().uuid(),
  campanhaId: z.string().uuid().optional(),
  codigo: z.string().min(3).max(30).transform((v) => v.toUpperCase().trim()),
  tipoDesconto: TipoDescontoCupom,
  descontoValor: z.number().int().positive(), // Cents se valor_fixo, ou base 100 se percentual (ex: 1000 = 10%)
  limiteUso: z.number().int().positive().optional(),
  validoAte: z.string().datetime().optional(),
});
export type CriarCupomInput = z.infer<typeof CriarCupomSchema>;

export interface CampanhaProntaTemplateDto {
  id: string;
  nome: string;
  objetivo: string;
  descricao: string;
  canaisSugeridos: CanalMarketing[];
  estrategia: string;
}

export interface KpisMarketingDto {
  eventoId: string | null;
  produtorId: string;
  totalCampanhasAtivas: number;
  totalCliquesLinks: number;
  totalConversoes: number;
  receitaTotalAtribuidaCents: number;
  pixelsAtivosCount: number;
  alertasPendentesCount: number;
}

export const ValidarCupomQuerySchema = z.object({
  eventoId: z.string().uuid(),
  codigo: z.string().min(1),
  subtotalCents: z.coerce.number().int().positive(),
});
export type ValidarCupomQueryInput = z.infer<typeof ValidarCupomQuerySchema>;


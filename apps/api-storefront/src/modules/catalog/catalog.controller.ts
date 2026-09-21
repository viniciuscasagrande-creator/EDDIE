import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ListarEventosQuery,
  EventoVitrineDto,
  EventoDetalheDto,
  MapaAssentosSetorDto,
} from './catalog.dto';

@Controller('catalog')
export class CatalogController {
  @Get('events')
  async listarEventosPublicos(
    @Query() query: ListarEventosQuery,
  ): Promise<{ data: EventoVitrineDto[]; total: number; pagina: number }> {
    // Chamada à porta pública do módulo de Eventos (EventosPublicService)
    // Sem acesso ao Prisma direto
    return {
      data: [],
      total: 0,
      pagina: query.pagina || 1,
    };
  }

  @Get('events/:slug')
  async obterDetalhesPorSlug(
    @Param('slug') slug: string,
  ): Promise<EventoDetalheDto> {
    // Chamada à porta pública do módulo de Eventos
    return {} as EventoDetalheDto;
  }

  @Get('events/:slug/sessions/:sessionId/sectors/:sectorId/seats')
  async obterMapaAssentos(
    @Param('slug') slug: string,
    @Param('sessionId') sessionId: string,
    @Param('sectorId') sectorId: string,
  ): Promise<MapaAssentosSetorDto> {
    // Retorna apenas disponibilidade booleana (DISPONIVEL / RESERVADO / OCUPADO)
    return {
      setorId,
      sessaoId: sessionId,
      assentos: [],
    };
  }
}

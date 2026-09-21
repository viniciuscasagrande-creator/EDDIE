import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EventosService } from './eventos.service';
import {
  CriarEventoDto, CriarSessaoDto, CriarLoteDto, CancelarEventoDto,
} from './eventos.dto';

// TODO: substituir por decorators reais de auth (@CurrentTenant, @CurrentUser)
const TENANT = (req?: unknown) => '00000000-0000-0000-0000-000000000001';
const ATOR = (req?: unknown) => '00000000-0000-0000-0000-000000000002';

@ApiTags('eventos')
@Controller('eventos')
export class EventosController {
  constructor(private readonly service: EventosService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um evento em rascunho' })
  criar(@Body() dto: CriarEventoDto) {
    return this.service.criar(TENANT(), dto, ATOR());
  }

  @Post(':id/sessoes')
  adicionarSessao(@Param('id') id: string, @Body() dto: CriarSessaoDto) {
    return this.service.adicionarSessao(TENANT(), id, dto);
  }

  @Post('sessoes/:sessaoId/lotes')
  adicionarLote(@Param('sessaoId') sessaoId: string, @Body() dto: CriarLoteDto) {
    return this.service.adicionarLote(TENANT(), sessaoId, dto);
  }

  @Post(':id/publicar')
  @ApiOperation({ summary: 'Publica o evento e libera a venda' })
  publicar(@Param('id') id: string) {
    return this.service.publicar(TENANT(), id, ATOR());
  }

  @Post(':id/cancelar')
  @ApiOperation({ summary: 'Cancela o evento e dispara estorno em cascata' })
  cancelar(@Param('id') id: string, @Body() dto: CancelarEventoDto) {
    return this.service.cancelar(TENANT(), id, dto, ATOR());
  }
}

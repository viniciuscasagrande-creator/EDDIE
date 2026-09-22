import { Body, Controller, Get, Headers, Param, Patch, Post, Query } from '@nestjs/common';
import { SuporteService } from './suporte.service';

@Controller('suporte-eventos')
export class SuporteController {
  constructor(private readonly service: SuporteService) {}

  @Get('ocorrencias')
  listar(@Headers('x-tenant-id') tenantId = '', @Query('eventoId') eventoId?: string) {
    return this.service.listar(tenantId, eventoId);
  }

  @Post('ocorrencias')
  criar(@Headers('x-tenant-id') tenantId = '', @Body() body: any) {
    return this.service.criar(tenantId, body);
  }

  @Patch('ocorrencias/:id')
  atualizar(@Headers('x-tenant-id') tenantId = '', @Param('id') id: string, @Body() body: any) {
    return this.service.atualizar(tenantId, id, body);
  }
}

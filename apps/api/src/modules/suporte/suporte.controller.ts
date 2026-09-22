import { Body, Controller, Get, Headers, Param, Patch, Post, Query } from '@nestjs/common';
import { SuporteService } from './suporte.service';

@Controller(['suporte', 'suporte-eventos'])
export class SuporteController {
  constructor(private readonly service: SuporteService) {}

  @Get('ocorrencias')
  listar(
    @Headers('x-tenant-id') tenantId?: string,
    @Query('eventoId') eventoId?: string,
    @Query('produtorId') produtorId?: string,
  ) {
    return this.service.listar(tenantId, eventoId, produtorId);
  }

  @Get('ocorrencias/:id')
  obterPorId(
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Param('id') id: string,
  ) {
    return this.service.obterPorId(tenantId, id);
  }

  @Post('ocorrencias')
  criar(
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: any,
  ) {
    return this.service.criar(tenantId, body);
  }

  @Patch(['ocorrencias/:id', 'ocorrencias/:id/status'])
  atualizar(
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.service.atualizar(tenantId, id, body);
  }
}

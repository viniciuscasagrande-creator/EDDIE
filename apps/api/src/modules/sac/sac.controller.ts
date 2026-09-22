import { Body, Controller, Get, Headers, Param, Patch, Post, Query } from '@nestjs/common';
import { SacService } from './sac.service';

@Controller('sac')
export class SacController {
  constructor(private readonly service: SacService) {}

  @Get('chamados')
  listar(@Headers('x-tenant-id') tenantId = '', @Query('status') status?: string) {
    return this.service.listar(tenantId, status);
  }

  @Get('consulta')
  buscar(@Headers('x-tenant-id') tenantId = '', @Query('q') q = '') {
    return this.service.buscar(tenantId, q);
  }

  @Post('chamados')
  criar(@Headers('x-tenant-id') tenantId = '', @Body() body: any) {
    return this.service.criar(tenantId, body);
  }

  @Patch('chamados/:id')
  atualizar(@Headers('x-tenant-id') tenantId = '', @Param('id') id: string, @Body() body: any) {
    return this.service.atualizar(tenantId, id, body);
  }
}

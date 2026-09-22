import { Body, Controller, Get, Headers, Param, Patch, Post, Query } from '@nestjs/common';
import { SacService } from './sac.service';

@Controller('sac')
export class SacController {
  constructor(private readonly service: SacService) {}

  @Get('chamados')
  listar(@Headers('x-tenant-id') tenantId?: string, @Query('status') status?: string) {
    return this.service.listar(tenantId, status);
  }

  @Get(['consulta', 'consultar'])
  buscar(@Headers('x-tenant-id') tenantId?: string, @Query('q') q = '') {
    return this.service.consultar(tenantId, q);
  }

  @Get('chamados/:id')
  obterPorId(@Headers('x-tenant-id') tenantId: string | undefined, @Param('id') id: string) {
    return this.service.obterPorId(tenantId, id);
  }

  @Post('chamados')
  criar(@Headers('x-tenant-id') tenantId: string | undefined, @Body() body: any) {
    return this.service.criar(tenantId, body);
  }

  @Post('chamados/:id/mensagens')
  adicionarMensagem(
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.service.adicionarMensagem(tenantId, id, body);
  }

  @Patch(['chamados/:id', 'chamados/:id/status'])
  atualizar(
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.service.atualizar(tenantId, id, body);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
} from '@nestjs/common';
import { GovernancaService } from './governanca.service';
import { TratarDivergenciaDto } from './governanca.types';

@Controller('governanca')
export class GovernancaController {
  constructor(private readonly governancaService: GovernancaService) {}

  @Get('visao-geral')
  async obterVisaoGeral(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.governancaService.obterVisaoGeralGovernanca(tenantId);
  }

  @Get('conciliacao/:eventoId')
  async obterConciliacaoSistemica(
    @Param('eventoId') eventoId: string,
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.governancaService.obterConciliacaoSistemica(eventoId, tenantId);
  }

  @Get('divergencias')
  async listarDivergencias(
    @Query('situacao') situacao?: string,
    @Query('severidade') severidade?: string,
    @Query('responsavel') responsavel?: string,
    @Query('eventoId') eventoId?: string,
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.governancaService.listarDivergencias(
      { situacao, severidade, responsavel, eventoId },
      tenantId,
    );
  }

  @Post('divergencias/:id/tratar')
  async tratarDivergencia(
    @Param('id') id: string,
    @Body() dto: TratarDivergenciaDto,
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.governancaService.tratarDivergencia(id, dto, tenantId);
  }

  @Get('linhagem/:indicadorCodigo')
  async obterLinhagemIndicador(
    @Param('indicadorCodigo') indicadorCodigo: string,
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.governancaService.obterLinhagemIndicador(indicadorCodigo, tenantId);
  }

  @Get('investigar')
  async investigarEntidade(
    @Query('termo') termo: string,
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.governancaService.investigarEntidade(termo, tenantId);
  }

  @Get('catalogo')
  async listarCatalogoDados(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.governancaService.listarCatalogoDados(tenantId);
  }

  @Get('auditoria')
  async listarAuditoria(
    @Query('correlationId') correlationId?: string,
    @Query('modulo') modulo?: string,
    @Query('usuarioId') usuarioId?: string,
    @Query('eventoId') eventoId?: string,
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.governancaService.listarAuditoriaCentral(
      { correlationId, modulo, usuarioId, eventoId },
      tenantId,
    );
  }

  @Get('integracoes')
  async obterSaudeIntegracoes(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.governancaService.obterSaudeIntegracoes(tenantId);
  }

  @Post('reprocessar')
  async reprocessarEvento(
    @Body() body: { eventoId: string; correlationId: string },
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.governancaService.reprocessarEventoSeguro(body.eventoId, body.correlationId, tenantId);
  }

  @Get('gate-fechamento/:eventoId')
  async verificarGateFechamento(
    @Param('eventoId') eventoId: string,
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.governancaService.verificarGateFechamento(eventoId, tenantId);
  }
}

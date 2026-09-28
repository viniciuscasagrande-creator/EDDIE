import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
} from '@nestjs/common';
import { InteligenciaService } from './inteligencia.service';
import { SimulacaoPrecoDto, PapelUsuarioContexto } from './inteligencia.types';

@Controller('inteligencia')
export class InteligenciaController {
  constructor(private readonly inteligenciaService: InteligenciaService) {}

  @Get('painel-executivo')
  async obterPainelExecutivo(
    @Query('periodo') periodo = '2026-Q3',
    @Query('produtorId') produtorId?: string,
    @Query('eventoId') eventoId?: string,
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Headers('x-papel-usuario') papelHeader?: PapelUsuarioContexto,
    @Query('papelUsuario') papelQuery?: PapelUsuarioContexto,
  ) {
    const papel: PapelUsuarioContexto = papelQuery || papelHeader || 'ADMINISTRADOR';
    return this.inteligenciaService.obterPainelExecutivo(periodo, tenantId, papel, produtorId, eventoId);
  }

  @Get('rentabilidade/:eventoId')
  async obterRentabilidadeReal(
    @Param('eventoId') eventoId: string,
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Headers('x-papel-usuario') papelHeader?: PapelUsuarioContexto,
    @Query('papelUsuario') papelQuery?: PapelUsuarioContexto,
  ) {
    const papel: PapelUsuarioContexto = papelQuery || papelHeader || 'ADMINISTRADOR';
    return this.inteligenciaService.obterDecomposicaoRentabilidadeReal(eventoId, tenantId, papel);
  }

  @Get('rentabilidade/:eventoId/dimensoes')
  async obterRentabilidadeDimensoes(
    @Param('eventoId') eventoId: string,
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Headers('x-papel-usuario') papelHeader?: PapelUsuarioContexto,
    @Query('papelUsuario') papelQuery?: PapelUsuarioContexto,
  ) {
    const papel: PapelUsuarioContexto = papelQuery || papelHeader || 'ADMINISTRADOR';
    return this.inteligenciaService.obterRentabilidadePorDimensoes(eventoId, tenantId, papel);
  }

  @Get('rentabilidade/:eventoId/margem-ingresso')
  async obterMargemIngresso(
    @Param('eventoId') eventoId: string,
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Headers('x-papel-usuario') papelHeader?: PapelUsuarioContexto,
    @Query('papelUsuario') papelQuery?: PapelUsuarioContexto,
  ) {
    const papel: PapelUsuarioContexto = papelQuery || papelHeader || 'ADMINISTRADOR';
    return this.inteligenciaService.obterMargemPorIngresso(eventoId, tenantId, papel);
  }

  @Get('rentabilidade/:eventoId/ponto-equilibrio')
  async obterPontoEquilibrio(
    @Param('eventoId') eventoId: string,
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.inteligenciaService.obterPontoEquilibrioDisk(eventoId, tenantId);
  }

  @Get('receita/:eventoId/velocidade')
  async obterVelocidadeVendas(
    @Param('eventoId') eventoId: string,
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.inteligenciaService.obterVelocidadeVendas(eventoId, tenantId);
  }

  @Get('receita/:eventoId/esgotamento')
  async obterPrevisaoEsgotamento(
    @Param('eventoId') eventoId: string,
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.inteligenciaService.obterPrevisaoEsgotamento(eventoId, tenantId);
  }

  @Get('receita/:eventoId/lotes')
  async obterInteligenciaLotes(
    @Param('eventoId') eventoId: string,
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.inteligenciaService.obterInteligenciaLotes(eventoId, tenantId);
  }

  @Post('receita/simular-preco')
  simularAlteracaoPreco(@Body() dto: SimulacaoPrecoDto) {
    return this.inteligenciaService.simularAlteracaoPreco(dto);
  }

  @Get('receita/:eventoId/canais')
  async obterPerformancePorCanal(
    @Param('eventoId') eventoId: string,
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.inteligenciaService.obterPerformancePorCanal(eventoId, tenantId);
  }

  @Get('receita/:eventoId/oportunidades-perdas')
  async obterOportunidadesEPerdas(
    @Param('eventoId') eventoId: string,
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.inteligenciaService.obterOportunidadesEPerdas(eventoId, tenantId);
  }

  @Get('produtor/:produtorId/visao-360')
  async obterVisaoProdutor360(
    @Param('produtorId') produtorId: string,
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Headers('x-papel-usuario') papelHeader?: PapelUsuarioContexto,
    @Query('papelUsuario') papelQuery?: PapelUsuarioContexto,
  ) {
    const papel: PapelUsuarioContexto = papelQuery || papelHeader || 'ADMINISTRADOR';
    return this.inteligenciaService.obterVisaoProdutor360(produtorId, tenantId, papel);
  }

  @Get('alertas')
  async obterAlertas(
    @Query('eventoId') eventoId?: string,
    @Query('produtorId') produtorId?: string,
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.inteligenciaService.obterAlertasInteligentes(eventoId, produtorId, tenantId);
  }

  @Get('oportunidades')
  async obterOportunidades(
    @Query('eventoId') eventoId?: string,
    @Query('produtorId') produtorId?: string,
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.inteligenciaService.obterCentralOportunidades(eventoId, produtorId, tenantId);
  }

  @Get('comparativo-historico/:eventoId')
  async obterComparativoHistorico(
    @Param('eventoId') eventoId: string,
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.inteligenciaService.obterComparativoHistorico(eventoId, tenantId);
  }

  @Get('metas-previsao')
  async obterMetasVsRealizadoVsPrevisao(
    @Query('periodo') periodo = '2026-Q3',
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Headers('x-papel-usuario') papelHeader?: PapelUsuarioContexto,
    @Query('papelUsuario') papelQuery?: PapelUsuarioContexto,
  ) {
    const papel: PapelUsuarioContexto = papelQuery || papelHeader || 'ADMINISTRADOR';
    return this.inteligenciaService.obterMetasVsRealizadoVsPrevisao(periodo, tenantId, papel);
  }
}

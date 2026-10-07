import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RHService } from './rh.service';
import type {
  CadastrarColaboradorInput,
  RegistrarPontoInput,
  CadastrarGeofenceInput,
  ApropriarCustoEventoInput,
  ConfigurarBolsosCajuInput,
  CalcularCompraBeneficiosInput,
  CriarPedidoBeneficioInput,
  AprovarPedidoBeneficioInput,
} from './rh.dto';

const resolveTenant = (headerTenant?: string): string =>
  headerTenant || '00000000-0000-0000-0000-000000000001';

@ApiTags('rh')
@Controller('rh')
export class RHController {
  constructor(private readonly rhService: RHService) {}


  @Get('resumo')
  @ApiOperation({ summary: 'Obter resumo executivo e KPIs do RH Disk' })
  async obterResumo(@Headers('x-tenant-id') tenantId?: string) {
    return this.rhService.obterResumoExecutivo(resolveTenant(tenantId));
  }

  @Get('colaboradores')
  @ApiOperation({ summary: 'Listar todos os colaboradores ativos e inativos' })
  async listarColaboradores(@Headers('x-tenant-id') tenantId?: string) {
    return this.rhService.listarColaboradores(resolveTenant(tenantId));
  }

  @Post('colaboradores')
  @ApiOperation({ summary: 'Cadastrar novo colaborador no RH Disk' })
  async cadastrarColaborador(
    @Body() input: CadastrarColaboradorInput,
    @Headers('x-tenant-id') tenantId?: string,
  ) {
    return this.rhService.cadastrarColaborador(resolveTenant(tenantId), input);
  }

  @Post('ponto/registrar')
  @ApiOperation({ summary: 'Registrar ponto eletrônico REP-P (Portaria 671 MTE) com geofence' })
  async registrarPonto(
    @Body() input: RegistrarPontoInput,
    @Headers('x-tenant-id') tenantId?: string,
  ) {
    return this.rhService.registrarPonto(resolveTenant(tenantId), input);
  }

  @Get('geofences')
  @ApiOperation({ summary: 'Listar cercas virtuais (geofences) de sedes e eventos' })
  async listarGeofences(@Headers('x-tenant-id') tenantId?: string) {
    return this.rhService.listarGeofences(resolveTenant(tenantId));
  }

  @Post('geofences')
  @ApiOperation({ summary: 'Cadastrar nova cerca virtual (geofence)' })
  async cadastrarGeofence(
    @Body() input: CadastrarGeofenceInput,
    @Headers('x-tenant-id') tenantId?: string,
  ) {
    return this.rhService.criarGeofence(resolveTenant(tenantId), input);
  }

  @Get('eventos/:eventoId/custos')
  @ApiOperation({ summary: 'Obter resumo consolidado de custos de mão de obra de um evento para o DRE' })
  async obterCustosEvento(
    @Param('eventoId') eventoId: string,
    @Headers('x-tenant-id') tenantId?: string,
  ) {
    return this.rhService.obterResumoCustosEvento(resolveTenant(tenantId), eventoId);
  }

  @Post('eventos/:eventoId/custos')
  @ApiOperation({ summary: 'Apropriar custo de colaborador ou freelancer a um evento' })
  async apropriarCustoEvento(
    @Param('eventoId') eventoId: string,
    @Body() input: Omit<ApropriarCustoEventoInput, 'eventoId'>,
    @Headers('x-tenant-id') tenantId?: string,
  ) {
    return this.rhService.apropriarCustoEvento(resolveTenant(tenantId), {
      ...input,
      eventoId,
    });
  }

  // ==========================================================================
  //  BENEFÍCIOS CORPORATIVOS & CAJU WALLETS
  // ==========================================================================

  @Post('beneficios/caju/configurar')
  @ApiOperation({ summary: 'Configurar e calibrar bolsos de benefícios Caju com validação matemática' })
  async configurarBolsosCaju(
    @Body() input: ConfigurarBolsosCajuInput,
    @Headers('x-tenant-id') tenantId?: string,
  ) {
    return this.rhService.configurarBolsosCaju(resolveTenant(tenantId), input);
  }

  @Get('beneficios/caju/:colaboradorId')
  @ApiOperation({ summary: 'Obter configuração de bolsos Caju de um colaborador' })
  async obterBolsosCajuColaborador(
    @Param('colaboradorId') colaboradorId: string,
    @Headers('x-tenant-id') tenantId?: string,
  ) {
    return this.rhService.obterBolsosCajuColaborador(resolveTenant(tenantId), colaboradorId);
  }

  @Get('beneficios/catalogo')
  @ApiOperation({ summary: 'Listar catálogo de benefícios corporativos ativos' })
  async listarBeneficiosCatalogo(@Headers('x-tenant-id') tenantId?: string) {
    return this.rhService.listarBeneficiosCatalogo(resolveTenant(tenantId));
  }

  @Post('beneficios/calcular')
  @ApiOperation({ summary: 'Calcular lote de compra de benefícios com dedução de faltas do ponto e teto 6% VT' })
  async calcularCompraBeneficios(
    @Body() input: CalcularCompraBeneficiosInput,
    @Headers('x-tenant-id') tenantId?: string,
  ) {
    return this.rhService.calcularCompraBeneficios(resolveTenant(tenantId), input);
  }

  @Get('beneficios/pedidos')
  @ApiOperation({ summary: 'Listar pedidos de compra de benefícios' })
  async listarPedidosBeneficios(
    @Query('competencia') competencia?: string,
    @Headers('x-tenant-id') tenantId?: string,
  ) {
    return this.rhService.listarPedidosCompraBeneficios(resolveTenant(tenantId), competencia);
  }

  @Post('beneficios/pedidos')
  @ApiOperation({ summary: 'Criar pedido de compra de benefícios para aprovação financeira' })
  async criarPedidoBeneficios(
    @Body() input: CriarPedidoBeneficioInput,
    @Headers('x-tenant-id') tenantId?: string,
  ) {
    return this.rhService.criarPedidoCompraBeneficios(resolveTenant(tenantId), input);
  }

  @Post('beneficios/pedidos/:pedidoId/aprovar')
  @ApiOperation({ summary: 'Aprovar pedido de compra de benefícios e integrar à Tesouraria (Contas a Pagar/PIX)' })
  async aprovarPedidoBeneficios(
    @Param('pedidoId') pedidoId: string,
    @Body() input: { aprovadoPor: string },
    @Headers('x-tenant-id') tenantId?: string,
  ) {
    return this.rhService.aprovarPedidoBeneficiosFinanceiro(
      resolveTenant(tenantId),
      pedidoId,
      input.aprovadoPor || 'DIRETORIA_RH',
    );
  }
}


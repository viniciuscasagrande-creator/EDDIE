import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RHService } from './rh.service';
import type {
  CadastrarColaboradorInput,
  RegistrarPontoInput,
  CadastrarGeofenceInput,
  ApropriarCustoEventoInput,
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
}

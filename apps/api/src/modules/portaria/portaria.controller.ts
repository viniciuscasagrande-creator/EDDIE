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
import { PortariaService } from './portaria.service';

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

@ApiTags('portaria')
@Controller()
export class PortariaController {
  constructor(private readonly portariaService: PortariaService) {}

  // ==========================================================================
  //  CHECK-IN ATÔMICO
  // ==========================================================================

  @Post('checkin/validar')
  @ApiOperation({ summary: 'Validação atômica e consumo de ingresso na portaria' })
  async validarCheckin(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Headers('x-user-id') userIdHeader: string,
    @Body()
    body: {
      eventoId: string;
      qrToken: string;
      operadorId?: string;
      dispositivoId?: string;
      portaria?: string;
      sessaoId?: string;
    },
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    const operadorId = body.operadorId || userIdHeader || 'operador-portaria';
    return this.portariaService.validarCheckin(tenantId, {
      ...body,
      operadorId,
    });
  }

  // ==========================================================================
  //  PORTARIA DO EVENTO (RESUMO, CHECK-INS, DISPOSITIVOS)
  // ==========================================================================

  @Get('eventos/:eventoId/portaria/resumo')
  @ApiOperation({ summary: 'Resumo em tempo real da portaria do evento' })
  async obterResumoPortaria(
    @Param('eventoId') eventoId: string,
    @Headers('x-tenant-id') tenantIdHeader: string,
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    return this.portariaService.obterResumoPortaria(tenantId, eventoId);
  }

  @Get('eventos/:eventoId/portaria/checkins')
  @ApiOperation({ summary: 'Histórico de check-ins e leituras recentes' })
  async listarCheckins(
    @Param('eventoId') eventoId: string,
    @Query('limit') limit: string,
    @Headers('x-tenant-id') tenantIdHeader: string,
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    return this.portariaService.listarCheckins(
      tenantId,
      eventoId,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Get('eventos/:eventoId/portaria/dispositivos')
  @ApiOperation({ summary: 'Lista dispositivos/leitores autorizados para a portaria do evento' })
  async listarDispositivos(
    @Param('eventoId') eventoId: string,
    @Headers('x-tenant-id') tenantIdHeader: string,
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    return this.portariaService.listarDispositivos(tenantId, eventoId);
  }

  @Post('eventos/:eventoId/portaria/dispositivos')
  @ApiOperation({ summary: 'Cadastra e autoriza novo leitor/catraca' })
  async cadastrarDispositivo(
    @Param('eventoId') eventoId: string,
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: { nome: string; portaria?: string; identificador?: string },
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    return this.portariaService.cadastrarDispositivo(tenantId, eventoId, body);
  }

  @Post('portaria/dispositivos/:id/revogar')
  @ApiOperation({ summary: 'Revoga remotamente a autorização de um leitor' })
  async revogarDispositivo(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantIdHeader: string,
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    return this.portariaService.revogarDispositivo(tenantId, id);
  }

  @Post('portaria/dispositivos/:id/heartbeat')
  @ApiOperation({ summary: 'Sinaliza heartbeat de leitor ativo' })
  async heartbeatDispositivo(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantIdHeader: string,
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    return this.portariaService.heartbeatDispositivo(tenantId, id);
  }

  // ==========================================================================
  //  ANTIFRAUDE OPERACIONAL DO EVENTO
  // ==========================================================================

  @Get('eventos/:eventoId/antifraude/alertas')
  @ApiOperation({ summary: 'Lista alertas antifraude com sinais operacionais' })
  async listarAlertasAntifraude(
    @Param('eventoId') eventoId: string,
    @Headers('x-tenant-id') tenantIdHeader: string,
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    return this.portariaService.listarAlertasAntifraude(tenantId, eventoId);
  }

  @Post('antifraude/alertas/:id/revisar')
  @ApiOperation({ summary: 'Revisa e decide sobre alerta antifraude' })
  async revisarAlerta(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Headers('x-user-id') userIdHeader: string,
    @Body() body: { status: 'REVISADO' | 'BLOQUEADO' | 'PERMITIDO' },
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    const operadorId = userIdHeader || 'supervisor-antifraude';
    return this.portariaService.revisarAlerta(tenantId, id, {
      ...body,
      operadorId,
    });
  }
}

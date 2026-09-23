import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  Sse,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { OperacaoService } from './operacao.service';

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

@ApiTags('operacao')
@Controller()
export class OperacaoController {
  constructor(private readonly operacaoService: OperacaoService) {}

  // ==========================================================================
  //  SNAPSHOT / RESUMO DO EVENTO AO VIVO
  // ==========================================================================
  @Get('eventos/:eventoId/operacao/resumo')
  @ApiOperation({ summary: 'Snapshot consolidado de operação em tempo real do evento' })
  async obterResumo(
    @Param('eventoId') eventoId: string,
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Query('sessaoId') sessaoId?: string,
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    return this.operacaoService.obterResumo(tenantId, eventoId, sessaoId);
  }

  // ==========================================================================
  //  TIMELINE OPERACIONAL UNIFICADA
  // ==========================================================================
  @Get('eventos/:eventoId/operacao/timeline')
  @ApiOperation({ summary: 'Timeline de eventos operacionais deduplicada e em ordem cronológica' })
  async obterTimeline(
    @Param('eventoId') eventoId: string,
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Query('sessaoId') sessaoId?: string,
    @Query('cursor') cursor?: string,
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    return this.operacaoService.obterTimeline(tenantId, eventoId, sessaoId, cursor);
  }

  // ==========================================================================
  //  CENTRAL DE ALERTAS
  // ==========================================================================
  @Get('eventos/:eventoId/operacao/alertas')
  @ApiOperation({ summary: 'Alertas operacionais do evento' })
  async obterAlertas(
    @Param('eventoId') eventoId: string,
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Query('sessaoId') sessaoId?: string,
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    return this.operacaoService.obterAlertas(tenantId, eventoId, sessaoId);
  }

  @Post('operacao/alertas/:id/reconhecer')
  @ApiOperation({ summary: 'Reconhece (acknowledge) um alerta operacional' })
  async reconhecerAlerta(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Headers('x-user-id') userIdHeader: string,
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    return this.operacaoService.reconhecerAlerta(tenantId, id, userIdHeader || 'operador');
  }

  @Post('operacao/alertas/:id/atribuir')
  @ApiOperation({ summary: 'Atribui um alerta a um membro da equipe' })
  async atribuirAlerta(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: { responsavelId: string },
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    return this.operacaoService.atribuirAlerta(tenantId, id, body.responsavelId);
  }

  // ==========================================================================
  //  INCIDENTES OPERACIONAIS (Integrados ao SAC/ITIL)
  // ==========================================================================
  @Post('eventos/:eventoId/incidentes')
  @ApiOperation({ summary: 'Abre um novo incidente operacional para o evento' })
  async criarIncidente(
    @Param('eventoId') eventoId: string,
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: any,
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    return this.operacaoService.criarIncidente(tenantId, eventoId, body);
  }

  @Get('eventos/:eventoId/incidentes')
  @ApiOperation({ summary: 'Lista incidentes operacionais do evento' })
  async listarIncidentes(
    @Param('eventoId') eventoId: string,
    @Headers('x-tenant-id') tenantIdHeader: string,
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    return this.operacaoService.obterIncidentes(tenantId, eventoId);
  }

  @Patch('incidentes/:id')
  @ApiOperation({ summary: 'Atualiza status ou detalhes de um incidente' })
  async atualizarIncidente(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: any,
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    return this.operacaoService.atualizarIncidente(tenantId, id, body);
  }

  // ==========================================================================
  //  STREAM SSE EM TEMPO REAL
  // ==========================================================================
  @Sse('eventos/:eventoId/operacao/stream')
  @ApiOperation({ summary: 'Canal Server-Sent Events (SSE) para atualização em tempo real' })
  streamOperacao(
    @Param('eventoId') eventoId: string,
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Query('sessaoId') sessaoId?: string,
  ): Observable<MessageEvent> {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    return this.operacaoService.streamOperacao(tenantId, eventoId, sessaoId);
  }
}

// apps/api/src/modules/marketing/audiences-journeys.controller.ts
// EDDIE 11.16.16 — Controller de Públicos, Segmentação AND/OR, Journey Builder e Automações

import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AudiencesJourneysService, type AudienceDto, type JourneyDto } from './audiences-journeys.service';

const resolveTenant = (headerTenant?: string): string =>
  headerTenant || '00000000-0000-0000-0000-000000000001';

@ApiTags('marketing-audiences-journeys')
@Controller()
export class AudiencesJourneysController {
  constructor(private readonly service: AudiencesJourneysService) {}

  // ==========================================================================
  //  CENTRAL DE PÚBLICOS
  // ==========================================================================

  @Get('eventos/:eventId/marketing/audiences')
  @ApiOperation({ summary: 'Lista públicos e audiências do evento' })
  listarAudiences(
    @Param('eventId') eventId: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    return this.service.listarAudiences(resolveTenant(tenantIdHeader), eventId);
  }

  @Post('eventos/:eventId/marketing/audiences')
  @ApiOperation({ summary: 'Cria novo público com segmentação AND/OR' })
  criarAudience(
    @Param('eventId') eventId: string,
    @Body() dto: AudienceDto,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    return this.service.criarAudience(resolveTenant(tenantIdHeader), eventId, dto);
  }

  @Get('eventos/:eventId/marketing/audiences/:id')
  @ApiOperation({ summary: 'Obtém detalhes do público' })
  obterAudience(
    @Param('eventId') eventId: string,
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    return this.service.obterAudience(resolveTenant(tenantIdHeader), eventId, id);
  }

  @Patch('eventos/:eventId/marketing/audiences/:id')
  @ApiOperation({ summary: 'Atualiza dados ou regras do público' })
  atualizarAudience(
    @Param('eventId') eventId: string,
    @Param('id') id: string,
    @Body() dto: Partial<AudienceDto>,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    return this.service.atualizarAudience(resolveTenant(tenantIdHeader), eventId, id, dto);
  }

  @Post('eventos/:eventId/marketing/audiences/:id/duplicate')
  @ApiOperation({ summary: 'Duplica um público existente' })
  duplicarAudience(
    @Param('eventId') eventId: string,
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    return this.service.duplicarAudience(resolveTenant(tenantIdHeader), eventId, id);
  }

  @Post('eventos/:eventId/marketing/audiences/:id/recalculate')
  @ApiOperation({ summary: 'Recalcula o tamanho de um público dinâmico' })
  recalcularAudience(
    @Param('eventId') eventId: string,
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    return this.service.recalcularAudience(resolveTenant(tenantIdHeader), eventId, id);
  }

  @Post('eventos/:eventId/marketing/audiences/:id/sync')
  @ApiOperation({ summary: 'Sincroniza público com provedores de anúncio Ads' })
  sincronizarAudience(
    @Param('eventId') eventId: string,
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    return this.service.sincronizarAudience(resolveTenant(tenantIdHeader), eventId, id);
  }

  @Get('eventos/:eventId/marketing/audiences/:id/diagnostics')
  @ApiOperation({ summary: 'Obtém diagnóstico de integridade do público' })
  diagnosticoAudience(
    @Param('eventId') eventId: string,
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    return this.service.obterAudienceDiagnostics(resolveTenant(tenantIdHeader), eventId, id);
  }

  @Post('eventos/:eventId/marketing/segments/preview')
  @ApiOperation({ summary: 'Calcula preview real de regras de segmentação AND/OR' })
  previewSegmento(
    @Param('eventId') eventId: string,
    @Body() body: any,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    return this.service.previewSegmento(resolveTenant(tenantIdHeader), eventId, body);
  }

  // ==========================================================================
  //  JOURNEY BUILDER & AUTOMAÇÕES
  // ==========================================================================

  @Get('eventos/:eventId/marketing/journeys')
  @ApiOperation({ summary: 'Lista jornadas automatizadas do evento' })
  listarJourneys(
    @Param('eventId') eventId: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    return this.service.listarJourneys(resolveTenant(tenantIdHeader), eventId);
  }

  @Post('eventos/:eventId/marketing/journeys')
  @ApiOperation({ summary: 'Cria nova jornada com fluxo de nós persistentes' })
  criarJourney(
    @Param('eventId') eventId: string,
    @Body() dto: JourneyDto,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    return this.service.criarJourney(resolveTenant(tenantIdHeader), eventId, dto);
  }

  @Get('eventos/:eventId/marketing/journeys/:id')
  @ApiOperation({ summary: 'Obtém grafo e detalhes da jornada' })
  obterJourney(
    @Param('eventId') eventId: string,
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    return this.service.obterJourney(resolveTenant(tenantIdHeader), eventId, id);
  }

  @Patch('eventos/:eventId/marketing/journeys/:id')
  @ApiOperation({ summary: 'Atualiza definição ou nós da jornada' })
  atualizarJourney(
    @Param('eventId') eventId: string,
    @Param('id') id: string,
    @Body() dto: Partial<JourneyDto>,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    return this.service.atualizarJourney(resolveTenant(tenantIdHeader), eventId, id, dto);
  }

  @Post('eventos/:eventId/marketing/journeys/:id/duplicate')
  @ApiOperation({ summary: 'Duplica uma jornada' })
  duplicarJourney(
    @Param('eventId') eventId: string,
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    return this.service.duplicarJourney(resolveTenant(tenantIdHeader), eventId, id);
  }

  @Post('eventos/:eventId/marketing/journeys/:id/validate')
  @ApiOperation({ summary: 'Valida a integridade do grafo da jornada' })
  validarJourney(
    @Param('eventId') eventId: string,
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    return this.service.validarJourney(resolveTenant(tenantIdHeader), eventId, id);
  }

  @Post('eventos/:eventId/marketing/journeys/:id/activate')
  @ApiOperation({ summary: 'Ativa a execução contínua da jornada' })
  ativarJourney(
    @Param('eventId') eventId: string,
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    return this.service.ativarJourney(resolveTenant(tenantIdHeader), eventId, id);
  }

  @Post('eventos/:eventId/marketing/journeys/:id/pause')
  @ApiOperation({ summary: 'Pausa temporariamente a jornada' })
  pausarJourney(
    @Param('eventId') eventId: string,
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    return this.service.pausarJourney(resolveTenant(tenantIdHeader), eventId, id);
  }

  @Post('eventos/:eventId/marketing/journeys/:id/resume')
  @ApiOperation({ summary: 'Retoma a execução da jornada' })
  retomarJourney(
    @Param('eventId') eventId: string,
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    return this.service.retomarJourney(resolveTenant(tenantIdHeader), eventId, id);
  }

  @Post('eventos/:eventId/marketing/journeys/:id/stop')
  @ApiOperation({ summary: 'Encerra a execução da jornada' })
  encerrarJourney(
    @Param('eventId') eventId: string,
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    return this.service.encerrarJourney(resolveTenant(tenantIdHeader), eventId, id);
  }

  @Post('eventos/:eventId/marketing/journeys/:id/test')
  @ApiOperation({ summary: 'Simula passo a passo a jornada com correlationId' })
  testarJourney(
    @Param('eventId') eventId: string,
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    return this.service.testarJourney(resolveTenant(tenantIdHeader), eventId, id);
  }

  @Get('eventos/:eventId/marketing/journeys/:id/executions')
  @ApiOperation({ summary: 'Obtém estatísticas de execução e funil da jornada' })
  obterExecucoes(
    @Param('eventId') eventId: string,
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    return this.service.obterJourneyExecutions(resolveTenant(tenantIdHeader), eventId, id);
  }

  @Get('eventos/:eventId/marketing/journeys/:id/logs')
  @ApiOperation({ summary: 'Obtém trilha de auditoria e logs com correlationId' })
  obterLogs(
    @Param('eventId') eventId: string,
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    return this.service.obterJourneyLogs(resolveTenant(tenantIdHeader), eventId, id);
  }

  // ==========================================================================
  //  REMARKETING & RECUPERAÇÃO
  // ==========================================================================

  @Get('eventos/:eventId/remarketing/recovery')
  @ApiOperation({ summary: 'Obtém KPIs de resgate e funil de conversão' })
  obterRemarketingRecovery(
    @Param('eventId') eventId: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    return this.service.obterRemarketingRecovery(resolveTenant(tenantIdHeader), eventId);
  }
}

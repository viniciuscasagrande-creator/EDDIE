import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { HealthTelemetryService } from './health-telemetry.service';
import {
  HealthSummary,
  HealthRecord,
  DiagnosticFinding,
  Incident,
  ReconciliationDiscrepancy,
  TimelineEvent,
  TelemetryMetrics,
  EntityType,
  Severity,
  IncidentStatus,
  TimelineOperation,
} from './health-telemetry-types';

@Controller()
export class HealthTelemetryController {
  constructor(private readonly healthTelemetryService: HealthTelemetryService) {}

  private getEffectiveProducerId(headerProducerId?: string): string {
    return headerProducerId || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  }

  // 1. Sumário Executivo de Saúde Global
  @Get('api/marketing/health/summary')
  getHealthSummary(@Headers('x-producer-id') producerHeader?: string): HealthSummary {
    const producerId = this.getEffectiveProducerId(producerHeader);
    return this.healthTelemetryService.getSummary(producerId);
  }

  // 2. Saúde por Evento
  @Get('api/eventos/:eventId/marketing/health')
  getEventHealth(
    @Param('eventId') eventId: string,
    @Headers('x-producer-id') producerHeader?: string
  ): HealthSummary {
    const producerId = this.getEffectiveProducerId(producerHeader);
    return this.healthTelemetryService.getSummary(producerId, eventId);
  }

  // 3. Entidades de Health
  @Get('api/eventos/:eventId/marketing/health/entities')
  getHealthEntities(
    @Param('eventId') eventId: string,
    @Query('type') type?: EntityType,
    @Headers('x-producer-id') producerHeader?: string
  ): HealthRecord[] {
    const producerId = this.getEffectiveProducerId(producerHeader);
    return this.healthTelemetryService.getEntitiesHealth(producerId, eventId, type);
  }

  // 4. Detalhe de Saúde de Entidade Específica
  @Get('api/eventos/:eventId/marketing/health/entities/:type/:id')
  getEntityHealth(
    @Param('eventId') eventId: string,
    @Param('type') type: EntityType,
    @Param('id') id: string,
    @Headers('x-producer-id') producerHeader?: string
  ): HealthRecord | undefined {
    const producerId = this.getEffectiveProducerId(producerHeader);
    return this.healthTelemetryService.getEntityHealth(producerId, eventId, type, id);
  }

  // 5. Check Ativo de Saúde da Entidade
  @Post('api/eventos/:eventId/marketing/health/entities/:type/:id/check')
  @HttpCode(HttpStatus.OK)
  async checkEntityHealth(
    @Param('eventId') eventId: string,
    @Param('type') type: EntityType,
    @Param('id') id: string,
    @Body() body?: { simulateInvalidToken?: boolean; simulateProviderDown?: boolean },
    @Headers('x-producer-id') producerHeader?: string
  ): Promise<HealthRecord> {
    const producerId = this.getEffectiveProducerId(producerHeader);
    return this.healthTelemetryService.checkEntity(producerId, eventId, type, id, body);
  }

  // 6. Diagnóstico Específico da Entidade
  @Post('api/eventos/:eventId/marketing/health/entities/:type/:id/diagnose')
  @HttpCode(HttpStatus.OK)
  async diagnoseEntity(
    @Param('eventId') eventId: string,
    @Param('type') type: EntityType,
    @Param('id') id: string,
    @Body()
    body?: {
      scenario?:
        | 'CAPI_STOPPED_WITH_PIXEL_ACTIVE'
        | 'RETRY_BACKLOG_GROWING'
        | 'JOURNEY_WITHOUT_WORKER'
        | 'DISCREPANCY_EDDIE_VS_PROVIDER'
        | 'AUDIENCE_NO_SYNC';
    },
    @Headers('x-producer-id') producerHeader?: string
  ): Promise<DiagnosticFinding[]> {
    const producerId = this.getEffectiveProducerId(producerHeader);
    return this.healthTelemetryService.diagnoseEntity(producerId, eventId, type, id, body?.scenario);
  }

  // 7. Lista de Diagnósticos
  @Get('api/eventos/:eventId/marketing/diagnostics')
  getDiagnostics(
    @Param('eventId') eventId: string,
    @Query('severity') severity?: Severity,
    @Headers('x-producer-id') producerHeader?: string
  ): DiagnosticFinding[] {
    const producerId = this.getEffectiveProducerId(producerHeader);
    return this.healthTelemetryService.getDiagnostics(producerId, eventId, severity);
  }

  // 8. Lista de Incidentes Agrupados
  @Get('api/eventos/:eventId/marketing/incidents')
  getIncidents(
    @Param('eventId') eventId: string,
    @Query('status') status?: IncidentStatus,
    @Headers('x-producer-id') producerHeader?: string
  ): Incident[] {
    const producerId = this.getEffectiveProducerId(producerHeader);
    return this.healthTelemetryService.getIncidents(producerId, eventId, status);
  }

  // 9. Detalhe de Incidente
  @Get('api/eventos/:eventId/marketing/incidents/:id')
  getIncident(
    @Param('id') id: string,
    @Headers('x-producer-id') producerHeader?: string
  ): Incident | undefined {
    const producerId = this.getEffectiveProducerId(producerHeader);
    return this.healthTelemetryService.getIncident(producerId, id);
  }

  // 10. Atualização de Incidente (Status, Atribuição, Resolução)
  @Patch('api/eventos/:eventId/marketing/incidents/:id')
  updateIncident(
    @Param('id') id: string,
    @Body() patch: { status?: IncidentStatus; assignedTo?: string; resolutionNotes?: string },
    @Headers('x-producer-id') producerHeader?: string
  ): Incident {
    const producerId = this.getEffectiveProducerId(producerHeader);
    return this.healthTelemetryService.updateIncident(producerId, id, patch);
  }

  // 11. Retentativa de Incidente
  @Post('api/eventos/:eventId/marketing/incidents/:id/retry')
  @HttpCode(HttpStatus.OK)
  async retryIncident(
    @Param('id') id: string,
    @Headers('x-producer-id') producerHeader?: string
  ): Promise<{ success: boolean; correlationId: string; message: string }> {
    const producerId = this.getEffectiveProducerId(producerHeader);
    return this.healthTelemetryService.retryIncident(producerId, id);
  }

  // 12. Autocorreção Segura de Incidente / Diagnóstico
  @Post('api/eventos/:eventId/marketing/incidents/:id/repair')
  @HttpCode(HttpStatus.OK)
  async repairIncident(
    @Param('id') id: string,
    @Body() body?: { action?: string },
    @Headers('x-producer-id') producerHeader?: string
  ): Promise<{ success: boolean; outcome: string; correlationId: string }> {
    const producerId = this.getEffectiveProducerId(producerHeader);
    return this.healthTelemetryService.repairIncidentOrFinding(producerId, id, body?.action);
  }

  // 13. Telemetria Técnica
  @Get('api/eventos/:eventId/marketing/telemetry')
  getTelemetry(
    @Param('eventId') eventId: string,
    @Headers('x-producer-id') producerHeader?: string
  ): TelemetryMetrics {
    const producerId = this.getEffectiveProducerId(producerHeader);
    return this.healthTelemetryService.getTelemetry(producerId, eventId);
  }

  // 14. Timeline Operacional
  @Get('api/eventos/:eventId/marketing/timeline')
  getTimeline(
    @Param('eventId') eventId: string,
    @Query('correlationId') correlationId?: string,
    @Query('operation') operation?: TimelineOperation,
    @Headers('x-producer-id') producerHeader?: string
  ): TimelineEvent[] {
    const producerId = this.getEffectiveProducerId(producerHeader);
    return this.healthTelemetryService.getTimeline(producerId, eventId, correlationId, operation);
  }

  // 15. Reconciliador EDDIE ↔ Provider
  @Get('api/eventos/:eventId/marketing/reconciliations')
  getReconciliations(
    @Param('eventId') eventId: string,
    @Headers('x-producer-id') producerHeader?: string
  ): ReconciliationDiscrepancy[] {
    const producerId = this.getEffectiveProducerId(producerHeader);
    return this.healthTelemetryService.getReconciliations(producerId, eventId);
  }

  @Post('api/eventos/:eventId/marketing/reconciliations/:id/reconcile')
  @HttpCode(HttpStatus.OK)
  async reconcileEntity(
    @Param('id') id: string,
    @Body() body?: { chosenSource?: 'EDDIE' | 'PROVIDER' | 'ARBITRATED' },
    @Headers('x-producer-id') producerHeader?: string
  ): Promise<ReconciliationDiscrepancy> {
    const producerId = this.getEffectiveProducerId(producerHeader);
    return this.healthTelemetryService.reconcileEntity(producerId, id, body?.chosenSource);
  }
}

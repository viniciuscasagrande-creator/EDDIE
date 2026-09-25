// apps/api/src/modules/operacao/command-center.controller.ts
// EDDIE 11.18 — Event Intelligence & Command Center Controller

import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Headers,
  Body,
  Query,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Observable, map } from 'rxjs';
import { CommandCenterService } from './command-center.service';
import {
  CommandCenterSnapshot,
  ProducerEventOverview,
  CommandCenterHeader,
  LiveSalesMetric,
  LivePaymentMetric,
  LiveGateMetric,
  LiveMarketingMetric,
  LiveFinanceMetric,
  LiveSupportMetric,
  LiveRiskMetric,
  LiveHealthMetric,
  CommandIncident,
  OperationalInsight,
  LiveOperationalEvent,
} from './command-center-types';

const DEFAULT_PRODUCER_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

@ApiTags('command-center')
@Controller()
export class CommandCenterController {
  constructor(private readonly commandCenterService: CommandCenterService) {}

  // =========================================================================
  // 1. VISÃO GERAL DO PRODUTOR (TODOS OS EVENTOS)
  // =========================================================================
  @Get('produtores/:producerId/command-center/events')
  @ApiOperation({ summary: 'Lista visão geral de todos os eventos autorizados do produtor' })
  listProducerEvents(
    @Param('producerId') producerId: string
  ): ProducerEventOverview[] {
    return this.commandCenterService.listProducerEvents(producerId);
  }

  // =========================================================================
  // 2. COMMAND CENTER INDIVIDUAL DO EVENTO
  // =========================================================================
  @Get('eventos/:eventId/command-center/summary')
  @ApiOperation({ summary: 'Snapshot executivo completo e consolidado do evento' })
  getSummary(
    @Param('eventId') eventId: string,
    @Headers('x-producer-id') producerHeader?: string
  ): CommandCenterSnapshot {
    const producerId = producerHeader || DEFAULT_PRODUCER_ID;
    return this.commandCenterService.getSnapshot(producerId, eventId);
  }

  @Get('eventos/:eventId/command-center/live')
  @ApiOperation({ summary: 'Header operacional e dados ao vivo do evento' })
  getLiveHeader(
    @Param('eventId') eventId: string,
    @Headers('x-producer-id') producerHeader?: string
  ): CommandCenterHeader {
    const producerId = producerHeader || DEFAULT_PRODUCER_ID;
    return this.commandCenterService.getHeader(producerId, eventId);
  }

  @Get('eventos/:eventId/command-center/sales')
  @ApiOperation({ summary: 'Métricas de vendas, ingressos por setor e lotes' })
  getSales(
    @Param('eventId') eventId: string,
    @Headers('x-producer-id') producerHeader?: string
  ): LiveSalesMetric {
    const producerId = producerHeader || DEFAULT_PRODUCER_ID;
    return this.commandCenterService.getSales(producerId, eventId);
  }

  @Get('eventos/:eventId/command-center/payments')
  @ApiOperation({ summary: 'Métricas de pagamentos (PIX, Cartão, aprovação e recusas)' })
  getPayments(
    @Param('eventId') eventId: string,
    @Headers('x-producer-id') producerHeader?: string
  ): LivePaymentMetric {
    const producerId = producerHeader || DEFAULT_PRODUCER_ID;
    return this.commandCenterService.getPayments(producerId, eventId);
  }

  @Get('eventos/:eventId/command-center/checkin')
  @ApiOperation({ summary: 'Métricas de portaria, fluxo por minuto e catracas' })
  getCheckin(
    @Param('eventId') eventId: string,
    @Headers('x-producer-id') producerHeader?: string
  ): LiveGateMetric {
    const producerId = producerHeader || DEFAULT_PRODUCER_ID;
    return this.commandCenterService.getCheckin(producerId, eventId);
  }

  @Get('eventos/:eventId/command-center/marketing')
  @ApiOperation({ summary: 'Métricas de marketing e atribuição analítica' })
  getMarketing(
    @Param('eventId') eventId: string,
    @Headers('x-producer-id') producerHeader?: string
  ): LiveMarketingMetric {
    const producerId = producerHeader || DEFAULT_PRODUCER_ID;
    return this.commandCenterService.getMarketing(producerId, eventId);
  }

  @Get('eventos/:eventId/command-center/finance')
  @ApiOperation({ summary: 'Métricas financeiras do evento extraídas do Ledger contábil' })
  getFinance(
    @Param('eventId') eventId: string,
    @Headers('x-producer-id') producerHeader?: string
  ): LiveFinanceMetric {
    const producerId = producerHeader || DEFAULT_PRODUCER_ID;
    return this.commandCenterService.getFinance(producerId, eventId);
  }

  @Get('eventos/:eventId/command-center/support')
  @ApiOperation({ summary: 'Métricas de atendimento SAC e chamados abertos' })
  getSupport(
    @Param('eventId') eventId: string,
    @Headers('x-producer-id') producerHeader?: string
  ): LiveSupportMetric {
    const producerId = producerHeader || DEFAULT_PRODUCER_ID;
    return this.commandCenterService.getSupport(producerId, eventId);
  }

  @Get('eventos/:eventId/command-center/risks')
  @ApiOperation({ summary: 'Métricas de antifraude, tentativas de QR duplicado e chargeback' })
  getRisks(
    @Param('eventId') eventId: string,
    @Headers('x-producer-id') producerHeader?: string
  ): LiveRiskMetric {
    const producerId = producerHeader || DEFAULT_PRODUCER_ID;
    return this.commandCenterService.getRisks(producerId, eventId);
  }

  @Get('eventos/:eventId/command-center/health')
  @ApiOperation({ summary: 'Saúde técnica de infraestrutura, gateways e provedores' })
  getHealth(
    @Param('eventId') eventId: string,
    @Headers('x-producer-id') producerHeader?: string
  ): LiveHealthMetric {
    const producerId = producerHeader || DEFAULT_PRODUCER_ID;
    return this.commandCenterService.getHealth(producerId, eventId);
  }

  @Get('eventos/:eventId/command-center/timeline')
  @ApiOperation({ summary: 'Timeline de eventos operacionais unificada com suporte a cursor' })
  getTimeline(
    @Param('eventId') eventId: string,
    @Headers('x-producer-id') producerHeader?: string,
    @Query('cursor') cursor?: string
  ): LiveOperationalEvent[] {
    const producerId = producerHeader || DEFAULT_PRODUCER_ID;
    return this.commandCenterService.getTimeline(producerId, eventId, cursor);
  }

  @Get('eventos/:eventId/command-center/incidents')
  @ApiOperation({ summary: 'Lista incidentes operacionais do War Room' })
  getIncidents(
    @Param('eventId') eventId: string,
    @Headers('x-producer-id') producerHeader?: string
  ): CommandIncident[] {
    const producerId = producerHeader || DEFAULT_PRODUCER_ID;
    return this.commandCenterService.getIncidents(producerId, eventId);
  }

  @Post('eventos/:eventId/command-center/incidents')
  @ApiOperation({ summary: 'Registra novo incidente no Command Center' })
  createIncident(
    @Param('eventId') eventId: string,
    @Headers('x-producer-id') producerHeader: string | undefined,
    @Body()
    body: {
      title: string;
      sourceModule: CommandIncident['sourceModule'];
      severity: CommandIncident['severity'];
      observedImpact: string;
      relatedSymptoms: string[];
      correlationId?: string;
    }
  ): CommandIncident {
    const producerId = producerHeader || DEFAULT_PRODUCER_ID;
    return this.commandCenterService.createIncident(producerId, eventId, body);
  }

  @Patch('eventos/:eventId/command-center/incidents/:id')
  @ApiOperation({ summary: 'Atualiza status do incidente no War Room' })
  updateIncident(
    @Param('eventId') eventId: string,
    @Param('id') id: string,
    @Headers('x-producer-id') producerHeader: string | undefined,
    @Body() body: { status: CommandIncident['status']; resolutionNotes?: string }
  ): CommandIncident {
    const producerId = producerHeader || DEFAULT_PRODUCER_ID;
    return this.commandCenterService.updateIncidentStatus(producerId, eventId, id, body.status, body.resolutionNotes);
  }

  @Get('eventos/:eventId/command-center/insights')
  @ApiOperation({ summary: 'Gera insights e recomendações de inteligência operacional' })
  getInsights(
    @Param('eventId') eventId: string,
    @Headers('x-producer-id') producerHeader?: string
  ): OperationalInsight[] {
    const producerId = producerHeader || DEFAULT_PRODUCER_ID;
    return this.commandCenterService.getInsights(producerId, eventId);
  }

  // =========================================================================
  // 3. STREAM REALTIME SSE (SERVER-SENT EVENTS)
  // =========================================================================
  @Sse('eventos/:eventId/command-center/stream')
  @ApiOperation({ summary: 'Canal SSE de eventos operacionais ao vivo com heartbeat' })
  streamEvents(
    @Param('eventId') eventId: string,
    @Headers('x-producer-id') producerHeader?: string
  ): Observable<MessageEvent> {
    const producerId = producerHeader || DEFAULT_PRODUCER_ID;
    return this.commandCenterService.getEventStream(producerId, eventId).pipe(
      map((evt) => ({
        data: evt,
        id: evt.id,
        type: evt.type,
        retry: 5000,
      }))
    );
  }

  // Ingestão interna de eventos operacionais
  @Post('eventos/:eventId/command-center/events')
  @ApiOperation({ summary: 'Ingestão de evento operacional no Command Center' })
  ingestEvent(
    @Param('eventId') eventId: string,
    @Body() event: LiveOperationalEvent
  ): { ok: boolean; deduplicated: boolean } {
    return this.commandCenterService.ingestOperationalEvent({
      ...event,
      eventId,
    });
  }
}

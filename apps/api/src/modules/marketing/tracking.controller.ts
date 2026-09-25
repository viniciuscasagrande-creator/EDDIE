// apps/api/src/modules/marketing/tracking.controller.ts
// EDDIE 11.16.17 — Endpoints REST do Tracking Gateway, CAPI e Conversões

import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TrackingService } from './tracking.service';
import {
  CanonicalTrackingEvent,
  TrackingConfiguration,
  TrackingDeliveryLog,
  ConversionRecord,
  TrackingDiagnostic,
  ConversionFunnelItem,
  TrackingProvider,
  CanonicalEventName,
} from './tracking-types';

@Controller()
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  // =========================================================================
  // 1. INGESTÃO DE EVENTOS PÚBLICOS (BROWSER / GATEWAY)
  // =========================================================================

  @Post(['api/tracking/events', 'tracking/events'])
  @HttpCode(HttpStatus.OK)
  async ingestEvent(@Body() event: CanonicalTrackingEvent) {
    return this.trackingService.ingestEvent(event);
  }

  @Post(['api/tracking/events/batch', 'tracking/events/batch'])
  @HttpCode(HttpStatus.OK)
  async ingestBatch(@Body() body: { events: CanonicalTrackingEvent[] }) {
    return this.trackingService.ingestBatch(body.events || []);
  }

  // =========================================================================
  // 2. CONFIGURAÇÕES MULTI-PIXEL POR EVENTO
  // =========================================================================

  @Get([
    'api/eventos/:eventId/marketing/tracking/configurations',
    'eventos/:eventId/marketing/tracking/configurations',
  ])
  async listConfigurations(
    @Param('eventId') eventId: string,
    @Headers('x-producer-id') producerIdHeader?: string
  ): Promise<TrackingConfiguration[]> {
    const producerId = producerIdHeader || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    return this.trackingService.listConfigurations(producerId, eventId);
  }

  @Post([
    'api/eventos/:eventId/marketing/tracking/configurations',
    'eventos/:eventId/marketing/tracking/configurations',
  ])
  async createConfiguration(
    @Param('eventId') eventId: string,
    @Headers('x-producer-id') producerIdHeader: string | undefined,
    @Body()
    body: {
      name: string;
      provider: TrackingProvider;
      publicId: string;
      serverSecret?: string;
      environment?: 'PRODUCTION' | 'TEST';
      testEventCode?: string;
      enabledEvents?: CanonicalEventName[];
    }
  ): Promise<TrackingConfiguration> {
    const producerId = producerIdHeader || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    return this.trackingService.createConfiguration(producerId, eventId, body);
  }

  @Get([
    'api/eventos/:eventId/marketing/tracking/configurations/:id',
    'eventos/:eventId/marketing/tracking/configurations/:id',
  ])
  async getConfiguration(
    @Param('eventId') eventId: string,
    @Param('id') id: string,
    @Headers('x-producer-id') producerIdHeader?: string
  ): Promise<TrackingConfiguration> {
    const producerId = producerIdHeader || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    return this.trackingService.getConfiguration(producerId, eventId, id);
  }

  @Patch([
    'api/eventos/:eventId/marketing/tracking/configurations/:id',
    'eventos/:eventId/marketing/tracking/configurations/:id',
  ])
  async updateConfiguration(
    @Param('eventId') eventId: string,
    @Param('id') id: string,
    @Headers('x-producer-id') producerIdHeader: string | undefined,
    @Body() body: Partial<TrackingConfiguration> & { serverSecret?: string }
  ): Promise<TrackingConfiguration> {
    const producerId = producerIdHeader || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    return this.trackingService.updateConfiguration(producerId, eventId, id, body);
  }

  @Post([
    'api/eventos/:eventId/marketing/tracking/configurations/:id/test',
    'eventos/:eventId/marketing/tracking/configurations/:id/test',
  ])
  async testConfiguration(
    @Param('eventId') eventId: string,
    @Param('id') id: string,
    @Headers('x-producer-id') producerIdHeader?: string
  ): Promise<{ ok: boolean; externalId?: string; message: string }> {
    const producerId = producerIdHeader || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    return this.trackingService.testConfiguration(producerId, eventId, id);
  }

  @Post([
    'api/eventos/:eventId/marketing/tracking/configurations/:id/activate',
    'eventos/:eventId/marketing/tracking/configurations/:id/activate',
  ])
  async activateConfiguration(
    @Param('eventId') eventId: string,
    @Param('id') id: string,
    @Headers('x-producer-id') producerIdHeader?: string
  ): Promise<TrackingConfiguration> {
    const producerId = producerIdHeader || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    return this.trackingService.activateConfiguration(producerId, eventId, id);
  }

  @Post([
    'api/eventos/:eventId/marketing/tracking/configurations/:id/pause',
    'eventos/:eventId/marketing/tracking/configurations/:id/pause',
  ])
  async pauseConfiguration(
    @Param('eventId') eventId: string,
    @Param('id') id: string,
    @Headers('x-producer-id') producerIdHeader?: string
  ): Promise<TrackingConfiguration> {
    const producerId = producerIdHeader || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    return this.trackingService.pauseConfiguration(producerId, eventId, id);
  }

  @Get([
    'api/eventos/:eventId/marketing/tracking/configurations/:id/health',
    'eventos/:eventId/marketing/tracking/configurations/:id/health',
  ])
  async getConfigurationHealth(
    @Param('eventId') eventId: string,
    @Param('id') id: string,
    @Headers('x-producer-id') producerIdHeader?: string
  ): Promise<TrackingDiagnostic> {
    const producerId = producerIdHeader || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    const diagnostics = await this.trackingService.getDiagnostics(producerId, eventId);
    const found = diagnostics.find((d) => d.configurationId === id);
    if (found) return found;
    return {
      configurationId: id,
      provider: 'META',
      health: 'SAUDAVEL',
      credentialValid: true,
      totalReceived: 0,
      totalValid: 0,
      totalDeduplicated: 0,
      totalDispatched: 0,
      totalErrors: 0,
      divergenceBrowserServerRate: '0%',
      averageLatencyMs: 0,
      recommendations: [],
    };
  }

  @Get([
    'api/eventos/:eventId/marketing/tracking/configurations/:id/logs',
    'eventos/:eventId/marketing/tracking/configurations/:id/logs',
  ])
  async getConfigurationLogs(
    @Param('eventId') eventId: string,
    @Param('id') id: string,
    @Headers('x-producer-id') producerIdHeader?: string
  ): Promise<TrackingDeliveryLog[]> {
    const producerId = producerIdHeader || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    return this.trackingService.getConfigurationLogs(producerId, eventId, id);
  }

  // =========================================================================
  // 3. CONVERSÕES, FUNIL & DIAGNÓSTICO
  // =========================================================================

  @Get([
    'api/eventos/:eventId/marketing/conversions',
    'eventos/:eventId/marketing/conversions',
  ])
  async getConversions(
    @Param('eventId') eventId: string,
    @Headers('x-producer-id') producerIdHeader?: string
  ): Promise<ConversionRecord[]> {
    const producerId = producerIdHeader || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    return this.trackingService.getConversions(producerId, eventId);
  }

  @Get([
    'api/eventos/:eventId/marketing/conversions/funnel',
    'eventos/:eventId/marketing/conversions/funnel',
  ])
  async getConversionFunnel(
    @Param('eventId') eventId: string,
    @Headers('x-producer-id') producerIdHeader?: string
  ): Promise<ConversionFunnelItem[]> {
    const producerId = producerIdHeader || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    return this.trackingService.getConversionFunnel(producerId, eventId);
  }

  @Get([
    'api/eventos/:eventId/marketing/tracking/diagnostics',
    'eventos/:eventId/marketing/tracking/diagnostics',
  ])
  async getDiagnostics(
    @Param('eventId') eventId: string,
    @Headers('x-producer-id') producerIdHeader?: string
  ): Promise<TrackingDiagnostic[]> {
    const producerId = producerIdHeader || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    return this.trackingService.getDiagnostics(producerId, eventId);
  }

  @Post([
    'api/eventos/:eventId/marketing/tracking/reprocess/:deliveryId',
    'eventos/:eventId/marketing/tracking/reprocess/:deliveryId',
  ])
  async reprocessDelivery(
    @Param('eventId') eventId: string,
    @Param('deliveryId') deliveryId: string,
    @Headers('x-producer-id') producerIdHeader?: string
  ): Promise<TrackingDeliveryLog> {
    const producerId = producerIdHeader || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    return this.trackingService.reprocessDelivery(producerId, eventId, deliveryId);
  }

  @Post([
    'api/eventos/:eventId/marketing/tracking/purchase/confirm',
    'eventos/:eventId/marketing/tracking/purchase/confirm',
  ])
  async confirmPurchase(
    @Param('eventId') eventId: string,
    @Headers('x-producer-id') producerIdHeader: string | undefined,
    @Body()
    body: {
      orderId: string;
      valueCents: number;
      currency?: string;
      items?: Array<{ id: string; name?: string; quantity: number; value?: number }>;
      utm?: Record<string, string | undefined>;
      correlationId?: string;
    }
  ): Promise<ConversionRecord> {
    const producerId = producerIdHeader || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    return this.trackingService.confirmPurchaseOperational({
      orderId: body.orderId,
      eventId,
      producerId,
      valueCents: body.valueCents,
      currency: body.currency || 'BRL',
      items: body.items,
      utm: body.utm,
      correlationId: body.correlationId,
    });
  }
}

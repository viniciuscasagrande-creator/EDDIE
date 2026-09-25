// apps/api/src/modules/marketing/analytics-attribution.controller.ts
// EDDIE 11.16.19 — REST Controller para Analytics, Atribuição Multicanal, Insights e Relatórios

import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { AnalyticsAttributionService } from './analytics-attribution.service';
import type {
  AttributionModel,
} from './analytics-attribution-types';

@Controller()
export class AnalyticsAttributionController {
  constructor(private readonly analyticsService: AnalyticsAttributionService) {}

  private getEffectiveProducerId(headerProducerId?: string): string {
    return headerProducerId || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  }

  // 1. Resumo Consolidado de KPIs
  @Get('api/eventos/:eventId/marketing/analytics/summary')
  getAnalyticsSummary(
    @Param('eventId') eventId: string,
    @Headers('x-producer-id') producerHeader?: string
  ) {
    const producerId = this.getEffectiveProducerId(producerHeader);
    return this.analyticsService.getSummaryMetrics(producerId, eventId);
  }

  // 2. Séries Temporais (Investimento, Cliques, Conversões, ROAS)
  @Get('api/eventos/:eventId/marketing/analytics/timeseries')
  getTimeseries(
    @Param('eventId') eventId: string,
    @Headers('x-producer-id') producerHeader?: string
  ) {
    const producerId = this.getEffectiveProducerId(producerHeader);
    return this.analyticsService.getTimeseries(producerId, eventId);
  }

  // 3. Funil de Conversão (Visita -> Carrinho -> Checkout -> Compra)
  @Get('api/eventos/:eventId/marketing/analytics/funnel')
  getFunnel(
    @Param('eventId') eventId: string,
    @Headers('x-producer-id') producerHeader?: string
  ) {
    const producerId = this.getEffectiveProducerId(producerHeader);
    return this.analyticsService.getFunnel(producerId, eventId);
  }

  // 4. Performance por Canal / Provider
  @Get('api/eventos/:eventId/marketing/analytics/channels')
  getChannelPerformance(
    @Param('eventId') eventId: string,
    @Headers('x-producer-id') producerHeader?: string
  ) {
    const producerId = this.getEffectiveProducerId(producerHeader);
    return this.analyticsService.getChannelPerformance(producerId, eventId);
  }

  // 5. Performance de Campanhas
  @Get('api/eventos/:eventId/marketing/analytics/campaigns')
  getCampaignPerformance(
    @Param('eventId') eventId: string,
    @Headers('x-producer-id') producerHeader?: string
  ) {
    const producerId = this.getEffectiveProducerId(producerHeader);
    return this.analyticsService.getCampaignPerformance(producerId, eventId);
  }

  // 6. Comparador de Campanhas Lado a Lado
  @Post('api/eventos/:eventId/marketing/analytics/campaigns/compare')
  @HttpCode(HttpStatus.OK)
  compareCampaigns(
    @Param('eventId') eventId: string,
    @Body() body: { campaignIds: string[] },
    @Headers('x-producer-id') producerHeader?: string
  ) {
    const producerId = this.getEffectiveProducerId(producerHeader);
    return this.analyticsService.compareCampaigns(producerId, eventId, body.campaignIds || []);
  }

  // 7. Performance de Criativos
  @Get('api/eventos/:eventId/marketing/analytics/creatives')
  getCreativesPerformance(
    @Param('eventId') eventId: string,
    @Headers('x-producer-id') producerHeader?: string
  ) {
    const producerId = this.getEffectiveProducerId(producerHeader);
    return this.analyticsService.getCreativesPerformance(producerId, eventId);
  }

  // 8. Performance de Públicos
  @Get('api/eventos/:eventId/marketing/analytics/audiences')
  getAudiencesPerformance(
    @Param('eventId') eventId: string,
    @Headers('x-producer-id') producerHeader?: string
  ) {
    const producerId = this.getEffectiveProducerId(producerHeader);
    return this.analyticsService.getAudiencesPerformance(producerId, eventId);
  }

  // 9. Performance de Jornadas & Recuperação de Remarketing
  @Get('api/eventos/:eventId/marketing/analytics/journeys')
  getJourneysPerformance(
    @Param('eventId') eventId: string,
    @Headers('x-producer-id') producerHeader?: string
  ) {
    const producerId = this.getEffectiveProducerId(producerHeader);
    return this.analyticsService.getJourneysPerformance(producerId, eventId);
  }

  // 10. Performance de Links UTM
  @Get('api/eventos/:eventId/marketing/analytics/utm')
  getUtmPerformance(
    @Param('eventId') eventId: string,
    @Headers('x-producer-id') producerHeader?: string
  ) {
    const producerId = this.getEffectiveProducerId(producerHeader);
    return this.analyticsService.getUtmPerformance(producerId, eventId);
  }

  // 11. Auditoria de Data Quality
  @Get('api/eventos/:eventId/marketing/analytics/data-quality')
  getDataQuality(
    @Param('eventId') eventId: string,
    @Headers('x-producer-id') producerHeader?: string
  ) {
    const producerId = this.getEffectiveProducerId(producerHeader);
    return this.analyticsService.getDataQuality(producerId, eventId);
  }

  // 12. Sumário de Atribuição Multicanal
  @Get('api/eventos/:eventId/marketing/attribution')
  getAttribution(
    @Param('eventId') eventId: string,
    @Query('model') model?: AttributionModel,
    @Headers('x-producer-id') producerHeader?: string
  ) {
    const producerId = this.getEffectiveProducerId(producerHeader);
    return this.analyticsService.getAttributionSummary(producerId, eventId, model);
  }

  // 13. Recálculo Auditado de Atribuição
  @Post('api/eventos/:eventId/marketing/attribution/recalculate')
  @HttpCode(HttpStatus.OK)
  recalculateAttribution(
    @Param('eventId') eventId: string,
    @Body() body: { model: AttributionModel; requestedBy?: string },
    @Headers('x-producer-id') producerHeader?: string
  ) {
    const producerId = this.getEffectiveProducerId(producerHeader);
    return this.analyticsService.recalculateAttribution(
      producerId,
      eventId,
      body.model,
      body.requestedBy || 'Equipe de Mídia PDT'
    );
  }

  // 14. Atribuição de Pedido Individual com Journey Touchpoints
  @Get('api/eventos/:eventId/marketing/attribution/orders/:orderId')
  getOrderAttribution(
    @Param('eventId') eventId: string,
    @Param('orderId') orderId: string,
    @Query('model') model?: AttributionModel,
    @Headers('x-producer-id') producerHeader?: string
  ) {
    const producerId = this.getEffectiveProducerId(producerHeader);
    return this.analyticsService.getOrderAttribution(producerId, eventId, orderId, model);
  }

  // 15. Insights de Inteligência de Marketing
  @Get('api/eventos/:eventId/marketing/insights')
  getInsights(
    @Param('eventId') eventId: string,
    @Headers('x-producer-id') producerHeader?: string
  ) {
    const producerId = this.getEffectiveProducerId(producerHeader);
    return this.analyticsService.getInsights(producerId, eventId);
  }

  // 16. Relatório Executivo Estruturado
  @Get('api/eventos/:eventId/marketing/reports')
  getReport(
    @Param('eventId') eventId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('model') model?: AttributionModel,
    @Headers('x-producer-id') producerHeader?: string
  ) {
    const producerId = this.getEffectiveProducerId(producerHeader);
    return this.analyticsService.getExecutiveReport(producerId, eventId, { from, to, model });
  }

  // 17. Exportação de Relatório (CSV / JSON)
  @Post('api/eventos/:eventId/marketing/reports/export')
  @HttpCode(HttpStatus.OK)
  exportReport(
    @Param('eventId') eventId: string,
    @Body() body: { format?: 'CSV' | 'JSON'; model?: AttributionModel },
    @Headers('x-producer-id') producerHeader?: string,
    @Res() res?: Response
  ) {
    const producerId = this.getEffectiveProducerId(producerHeader);
    const result = this.analyticsService.exportReport(
      producerId,
      eventId,
      body?.format || 'CSV',
      { model: body?.model }
    );

    if (res) {
      res.setHeader('Content-Type', result.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      return res.send(result.content);
    }

    return result;
  }
}

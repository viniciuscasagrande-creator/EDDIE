// apps/api/src/modules/event-closing/event-closing.controller.ts
// EDDIE 11.24 — Event Closing & Producer Settlement Controller

import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { EventClosingService } from './event-closing.service';
import {
  EventClosingStatusResponse,
  EventClosingSnapshot,
} from './event-closing.types';

@ApiTags('event-closing')
@Controller()
export class EventClosingController {
  constructor(private readonly eventClosingService: EventClosingService) {}

  @Get([
    'v1/admin/eventos/:id/fechamento',
    'admin/eventos/:id/fechamento',
    'eventos/:id/fechamento',
  ])
  @ApiOperation({
    summary: 'Consulta o status dos 10 Gates de Fechamento e o Settlement do Evento',
  })
  async getStatus(
    @Param('id') eventId: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ): Promise<EventClosingStatusResponse> {
    const tenantId = tenantIdHeader || '00000000-0000-0000-0000-000000000001';
    return this.eventClosingService.getClosingStatus(
      tenantId,
      eventId,
      producerIdHeader,
    );
  }

  @Post([
    'v1/admin/eventos/:id/fechamento/concluir',
    'admin/eventos/:id/fechamento/concluir',
    'eventos/:id/fechamento/concluir',
  ])
  @ApiOperation({
    summary: 'Conclui o Fechamento Definitivo do Evento e emite o Dossiê Imutável (Hash SHA-256)',
  })
  async concludeClosing(
    @Param('id') eventId: string,
    @Body() body: { operatorId?: string; approverId?: string },
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
    @Headers('x-user-id') userIdHeader?: string,
  ): Promise<EventClosingSnapshot> {
    const tenantId = tenantIdHeader || '00000000-0000-0000-0000-000000000001';
    const operatorId = body.operatorId || userIdHeader || 'operador-financeiro-01';
    const approverId = body.approverId || 'diretor-financeiro-02';

    return this.eventClosingService.concludeClosing(
      tenantId,
      eventId,
      operatorId,
      approverId,
      producerIdHeader,
    );
  }

  @Post([
    'v1/admin/eventos/:id/fechamento/reabrir',
    'admin/eventos/:id/fechamento/reabrir',
    'eventos/:id/fechamento/reabrir',
  ])
  @ApiOperation({
    summary: 'Reabre formalmente um evento com versionamento (v2) preservando o histórico do snapshot anterior',
  })
  async reopenEvent(
    @Param('id') eventId: string,
    @Body() body: { reason: string; protocol?: string },
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-user-id') userIdHeader?: string,
  ) {
    const tenantId = tenantIdHeader || '00000000-0000-0000-0000-000000000001';
    const requestorId = userIdHeader || 'auditor-master-01';

    return this.eventClosingService.reopenEvent(
      tenantId,
      eventId,
      requestorId,
      body.reason,
      body.protocol || `REOPEN-${Date.now()}`,
    );
  }
}

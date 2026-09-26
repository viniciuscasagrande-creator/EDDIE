// apps/api/src/modules/dashboard/dashboard.controller.ts
// EDDIE — Super Dashboard & Centro de Comando 360º Controller

import { Controller, Get, Headers } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardSummaryResponse } from './dashboard.types';

@ApiTags('admin-dashboard')
@Controller()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get(['v1/admin/dashboard/summary', 'admin/dashboard/summary', 'dashboard/summary'])
  @ApiOperation({ summary: 'Retorna o resumo 360º de métricas e ações rápidas do Centro de Comando' })
  async getSummary(
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ): Promise<DashboardSummaryResponse> {
    return this.dashboardService.getConsolidatedMetrics(tenantIdHeader, producerIdHeader);
  }
}

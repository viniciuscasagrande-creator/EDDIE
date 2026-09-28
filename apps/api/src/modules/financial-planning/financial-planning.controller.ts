// apps/api/src/modules/financial-planning/financial-planning.controller.ts
// EDDIE 11.28 — FP&A, Budgeting & Multi-Year Financial Planning Controller

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FinancialPlanningService } from './financial-planning.service';
import {
  AdjustBudgetRequest,
  SimulateMultiYearRequest,
} from './financial-planning.types';

@Controller('v1/financial-planning')
export class FinancialPlanningController {
  constructor(private readonly fpaService: FinancialPlanningService) {}

  /**
   * Visão Geral Executiva de FP&A, Orçamento e Indicadores Chave.
   */
  @Get('overview')
  async getOverview() {
    return this.fpaService.getOverview();
  }

  /**
   * Lista todos os Centros de Custo com tetos e consumo orçamentário.
   */
  @Get('cost-centers')
  async getCostCenters() {
    return this.fpaService.getCostCenters();
  }

  /**
   * Detalhamento de um Centro de Custo específico.
   */
  @Get('cost-centers/:code')
  async getCostCenter(@Param('code') code: string) {
    return this.fpaService.getCostCenter(code);
  }

  /**
   * Ajuste de teto orçamentário de um Centro de Custo.
   */
  @Post('cost-centers/:code/adjust-budget')
  @HttpCode(HttpStatus.OK)
  async adjustCostCenterBudget(
    @Param('code') code: string,
    @Body() body: AdjustBudgetRequest,
  ) {
    return this.fpaService.adjustCostCenterBudget(code, body);
  }

  /**
   * Análise de Desvios Orçamentários (Budget vs Actual / Variâncias).
   */
  @Get('variances')
  async getVariances() {
    return this.fpaService.getVariances();
  }

  /**
   * Margem de Contribuição apurada por categoria de evento.
   */
  @Get('margins')
  async getContributionMargins() {
    return this.fpaService.getContributionMargins();
  }

  /**
   * Modelo de Planejamento Financeiro Plurianual (2026 - 2028).
   */
  @Post('multi-year/simulate')
  @HttpCode(HttpStatus.OK)
  async simulateMultiYearPlan(@Body() body: SimulateMultiYearRequest) {
    return this.fpaService.getMultiYearPlan(body);
  }
}

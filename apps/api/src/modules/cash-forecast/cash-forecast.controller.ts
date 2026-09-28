// apps/api/src/modules/cash-forecast/cash-forecast.controller.ts
// EDDIE 11.26 — Cash Forecast, Liquidity & Working Capital OS Controller

import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CashForecastService } from './cash-forecast.service';
import {
  CashForecastResponse,
  SegregatedCashPosition,
  HorizonCashflowPoint,
  LiquidityGapAlert,
  WorkingCapitalMetrics,
  VersionedAssumptions,
  BacktestingReport,
  ForecastScenario,
  CustomSimulationRequest,
} from './cash-forecast.types';

@ApiTags('cash-forecast')
@Controller('api/cash-forecast')
export class CashForecastController {
  constructor(private readonly cashForecastService: CashForecastService) {}

  @Get(['', 'overview'])
  @ApiOperation({ summary: 'Visão consolidada 360º de previsão de caixa, liquidez e capital de giro' })
  async getOverview(
    @Query('scenario') scenario: ForecastScenario = 'BASE',
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ): Promise<CashForecastResponse> {
    const tenantId = tenantIdHeader || '00000000-0000-0000-0000-000000000001';
    return this.cashForecastService.getFullForecastOverview(
      tenantId,
      scenario,
      undefined,
      producerIdHeader,
    );
  }

  @Get('position')
  @ApiOperation({ summary: 'Consulta a posição segregada dos 6 saldos (bancário, ledger, disponível, reservado, em liquidação e projetado)' })
  async getSegregatedPosition(
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ): Promise<SegregatedCashPosition> {
    const tenantId = tenantIdHeader || '00000000-0000-0000-0000-000000000001';
    return this.cashForecastService.getSegregatedPosition(tenantId, producerIdHeader);
  }

  @Get('horizons')
  @ApiOperation({ summary: 'Projeção de fluxo de caixa nos 6 horizontes temporais (D+1, D+7, D+15, D+30, D+60 e D+90)' })
  async getHorizons(
    @Query('scenario') scenario: ForecastScenario = 'BASE',
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ): Promise<HorizonCashflowPoint[]> {
    const tenantId = tenantIdHeader || '00000000-0000-0000-0000-000000000001';
    return this.cashForecastService.generateHorizonForecast(
      tenantId,
      scenario,
      undefined,
      producerIdHeader,
    );
  }

  @Post('scenarios/simulate')
  @ApiOperation({ summary: 'Simula cenários de estresse de liquidez (Conservador, Otimista ou Customizado)' })
  async simulateScenario(
    @Body()
    body: {
      scenario: ForecastScenario;
      customParams?: CustomSimulationRequest;
    },
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ): Promise<HorizonCashflowPoint[]> {
    const tenantId = tenantIdHeader || '00000000-0000-0000-0000-000000000001';
    return this.cashForecastService.generateHorizonForecast(
      tenantId,
      body.scenario,
      body.customParams,
      producerIdHeader,
    );
  }

  @Get('gaps')
  @ApiOperation({ summary: 'Identifica e monitora gaps críticos de liquidez e riscos de caixa a descoberto' })
  async getLiquidityGaps(
    @Query('scenario') scenario: ForecastScenario = 'BASE',
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ): Promise<LiquidityGapAlert[]> {
    const tenantId = tenantIdHeader || '00000000-0000-0000-0000-000000000001';
    const horizons = await this.cashForecastService.generateHorizonForecast(
      tenantId,
      scenario,
      undefined,
      producerIdHeader,
    );
    return this.cashForecastService.detectLiquidityGaps(horizons);
  }

  @Get('working-capital')
  @ApiOperation({ summary: 'Consulta métricas de capital de giro, ciclo financeiro e necessidade de capital (NCG)' })
  async getWorkingCapital(
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ): Promise<WorkingCapitalMetrics> {
    const tenantId = tenantIdHeader || '00000000-0000-0000-0000-000000000001';
    return this.cashForecastService.calculateWorkingCapitalMetrics(tenantId, producerIdHeader);
  }

  @Get('backtesting')
  @ApiOperation({ summary: 'Relatório de acurácia preditiva (Previsto vs Realizado, MAPE e calibração estatística)' })
  getBacktesting(
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ): BacktestingReport {
    const tenantId = tenantIdHeader || '00000000-0000-0000-0000-000000000001';
    return this.cashForecastService.runBacktesting(tenantId);
  }

  @Get('assumptions')
  @ApiOperation({ summary: 'Consulta as premissas macroeconômicas e operacionais ativas de previsão' })
  getAssumptions(): VersionedAssumptions {
    return this.cashForecastService.getActiveAssumptions();
  }

  @Post('assumptions')
  @ApiOperation({ summary: 'Atualiza e versiona premissas de previsão financeira (v1.0 -> v1.1)' })
  updateAssumptions(
    @Body()
    body: {
      assumptions: Partial<VersionedAssumptions>;
      updatedBy: string;
      notes?: string;
    },
  ): VersionedAssumptions {
    return this.cashForecastService.updateAssumptions(
      body.assumptions,
      body.updatedBy,
      body.notes,
    );
  }
}

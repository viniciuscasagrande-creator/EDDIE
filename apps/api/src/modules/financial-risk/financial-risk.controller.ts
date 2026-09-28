// apps/api/src/modules/financial-risk/financial-risk.controller.ts
// EDDIE 11.27 — Financial Risk, Controls & Exposure OS Controller

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FinancialRiskService } from './financial-risk.service';
import {
  AdjustCreditLimitRequest,
  TriggerCircuitBreakerRequest,
  ResolveCircuitBreakerRequest,
  StressTestSimulationRequest,
  DecideApprovalRequest,
} from './financial-risk.types';

@Controller('v1/financial-risk')
export class FinancialRiskController {
  constructor(private readonly riskService: FinancialRiskService) {}

  /**
   * Visão Geral Executiva 360º de Risco, Controles e Exposição.
   */
  @Get('overview')
  async getOverview() {
    return this.riskService.getOverview();
  }

  /**
   * Catálogo de Produtores com scores, ratings e limites.
   */
  @Get('producers')
  async getProducers() {
    return this.riskService.getProducers();
  }

  /**
   * Detalhamento do perfil de risco de um produtor específico.
   */
  @Get('producers/:producerId')
  async getProducerProfile(@Param('producerId') producerId: string) {
    return this.riskService.getProducerProfile(producerId);
  }

  /**
   * Ajuste de limite de crédito e garantias de um produtor.
   */
  @Post('producers/:producerId/adjust-limit')
  @HttpCode(HttpStatus.OK)
  async adjustCreditLimit(
    @Param('producerId') producerId: string,
    @Body() body: AdjustCreditLimitRequest,
  ) {
    return this.riskService.adjustCreditLimit(producerId, body);
  }

  /**
   * Lista de travas e Circuit Breakers ativos e históricos.
   */
  @Get('circuit-breakers')
  async getCircuitBreakers() {
    return this.riskService.getCircuitBreakers();
  }

  /**
   * Acionamento manual ou programático de um Circuit Breaker.
   */
  @Post('circuit-breakers/trigger')
  @HttpCode(HttpStatus.CREATED)
  async triggerCircuitBreaker(@Body() body: TriggerCircuitBreakerRequest) {
    return this.riskService.triggerCircuitBreaker(body);
  }

  /**
   * Resolução e destravamento de um Circuit Breaker.
   */
  @Post('circuit-breakers/:breakerId/resolve')
  @HttpCode(HttpStatus.OK)
  async resolveCircuitBreaker(
    @Param('breakerId') breakerId: string,
    @Body() body: ResolveCircuitBreakerRequest,
  ) {
    return this.riskService.resolveCircuitBreaker(breakerId, body);
  }

  /**
   * Matriz de Concentração de Adquirentes e Índice HHI.
   */
  @Get('acquirers')
  async getAcquirerConcentration() {
    return this.riskService.getAcquirerConcentration();
  }

  /**
   * Simulação de Cenários de Estresse (Stress Test).
   */
  @Post('stress-test/simulate')
  @HttpCode(HttpStatus.OK)
  async simulateStressTest(@Body() body: StressTestSimulationRequest) {
    return this.riskService.simulateStressTest(body);
  }

  /**
   * Lista de solicitações de aprovação de alçada pendentes.
   */
  @Get('approvals')
  async getPendingApprovals() {
    return this.riskService.getPendingApprovals();
  }

  /**
   * Deliberação de alçada de risco (aprovar ou rejeitar).
   */
  @Post('approvals/:approvalId/decide')
  @HttpCode(HttpStatus.OK)
  async decideApproval(
    @Param('approvalId') approvalId: string,
    @Body() body: DecideApprovalRequest,
  ) {
    return this.riskService.decideApproval(approvalId, body);
  }
}

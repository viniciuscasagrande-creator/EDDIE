import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RevenueAssuranceService } from './revenue-assurance.service';
import type {
  CaseStatus,
  IntegrityChainDto,
  RevenueAssuranceReportDto,
} from './revenue-assurance.types';

const resolveTenant = (headerTenant?: string): string =>
  headerTenant || '00000000-0000-0000-0000-000000000001';

@ApiTags('revenue-assurance')
@Controller('api/revenue-assurance')
export class RevenueAssuranceController {
  constructor(private readonly assuranceService: RevenueAssuranceService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Resumo executivo de garantia de receita com cobertura explícita' })
  async getSummary(
    @Query('produtorId') produtorId?: string,
    @Query('eventoId') eventoId?: string,
    @Query('periodo') periodo?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    return this.assuranceService.getSummary({ produtorId, eventoId, periodo });
  }

  @Get('integrity')
  @ApiOperation({ summary: 'Matriz de integridade ponta a ponta com filtros e paginação' })
  async getIntegrity(
    @Query('status') status?: string,
    @Query('divergenciaTipo') divergenciaTipo?: string,
    @Query('eventoId') eventoId?: string,
    @Query('produtorId') produtorId?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    return this.assuranceService.getIntegrityMatrix({
      status,
      divergenciaTipo,
      eventoId,
      produtorId,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  @Get('chains/:correlationId')
  @ApiOperation({ summary: 'Cadeia completa de transação por correlationId' })
  async getChain(
    @Param('correlationId') correlationId: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    return this.assuranceService.getChainByCorrelationId(correlationId);
  }

  @Get('exceptions')
  @ApiOperation({ summary: 'Lista apenas transações com exceções e discrepâncias de receita' })
  async getExceptions(
    @Query('limit') limit?: number,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    return this.assuranceService.getIntegrityMatrix({
      status: 'DIVERGENTE',
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('fees')
  @ApiOperation({ summary: 'Auditoria de taxas Disk por evento e conformidade com snapshots' })
  async getFeesAudit(
    @Query('eventoId') eventoId?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    return this.assuranceService.getIntegrityMatrix({
      divergenciaTipo: 'TAXA_PERCENTUAL_INCORRETA',
      eventoId,
    });
  }

  @Get('ledger')
  @ApiOperation({ summary: 'Auditoria de integridade e duplicidades do Ledger Financeiro' })
  async getLedgerAudit(
    @Query('limit') limit?: number,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    return this.assuranceService.getIntegrityMatrix({
      divergenciaTipo: 'LEDGER_DUPLICADO',
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('settlements')
  @ApiOperation({ summary: 'Auditoria de lotes de repasse e conformidade com o saldo' })
  async getSettlementsAudit(
    @Query('limit') limit?: number,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    return this.assuranceService.getIntegrityMatrix({
      divergenciaTipo: 'SETTLEMENT_DIVERGENTE',
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('banking')
  @ApiOperation({ summary: 'Auditoria de retorno bancário vs payouts' })
  async getBankingAudit(
    @Query('limit') limit?: number,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    return this.assuranceService.getIntegrityMatrix({
      divergenciaTipo: 'BANCO_DIVERGENTE',
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('transfers')
  @ApiOperation({ summary: 'Auditoria de transferências inter-eventos e isolamento entre produtores' })
  async getTransfersAudit(
    @Query('limit') limit?: number,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    return this.assuranceService.getIntegrityMatrix({
      divergenciaTipo: 'TRANSFERENCIA_CROSS_PRODUCER',
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('cases')
  @ApiOperation({ summary: 'Lista casos abertos de Revenue Assurance' })
  async listCases(
    @Query('status') status?: string,
    @Query('severity') severity?: string,
    @Query('eventoId') eventoId?: string,
    @Query('produtorId') produtorId?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.assuranceService.listCases(tenantId, { status, severity, eventoId, produtorId });
  }

  @Post('cases')
  @ApiOperation({ summary: 'Submete uma cadeia para auditoria e gera caso se divergente' })
  async auditAndCreateCase(
    @Body() chain: Partial<IntegrityChainDto> & { correlationId: string },
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    return this.assuranceService.auditChain(chain);
  }

  @Get('cases/:id')
  @ApiOperation({ summary: 'Consulta caso específico de Revenue Assurance com evidências' })
  async getCase(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    return this.assuranceService.getCaseById(id);
  }

  @Patch('cases/:id')
  @ApiOperation({ summary: 'Atualiza status, encaminhamento ou resolução de caso' })
  async updateCase(
    @Param('id') id: string,
    @Body()
    body: {
      status?: CaseStatus;
      assignedTo?: string;
      resolutionNotes?: string;
      actorId: string;
      actionDetails?: string;
    },
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    return this.assuranceService.updateCase(id, body);
  }

  @Post('cases/:id/revalidate')
  @ApiOperation({ summary: 'Revalida caso após retificação no domínio de origem' })
  async revalidateCase(
    @Param('id') id: string,
    @Body() body: { actorId: string },
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    return this.assuranceService.revalidateCase(id, body.actorId);
  }

  @Post('scans')
  @ApiOperation({ summary: 'Dispara varredura de integridade (incremental ou por período)' })
  async triggerScan(
    @Body()
    body: {
      tipo: 'INCREMENTAL' | 'PERIODO_COMPLETO' | 'REVALIDACAO_CASO';
      checkpointCursor?: string;
      periodoInicio?: string;
      periodoFim?: string;
      actorId: string;
    },
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    return this.assuranceService.executeScan(body);
  }

  @Post('scans/:id/retry')
  @ApiOperation({ summary: 'Retenta varredura de forma idempotente sem duplicar casos' })
  async retryScan(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    return this.assuranceService.retryScan(id);
  }

  @Get('reports')
  @ApiOperation({ summary: 'Gera relatório auditável de integridade e divergências' })
  async getReports(
    @Query('tipo') tipo: RevenueAssuranceReportDto['tipo'] = 'MATRIZ_COMPLETA',
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    return this.assuranceService.generateReport(tipo, 'auditor_chefe');
  }

  @Get('intelligence')
  @ApiOperation({ summary: 'Diagnósticos e insights de vazamento de receita' })
  async getIntelligence(@Headers('x-tenant-id') tenantIdHeader?: string) {
    return this.assuranceService.getRevenueIntelligence();
  }

  @Get('health')
  @ApiOperation({ summary: 'Status de conectividade das 8 fontes da cadeia e taxa de cobertura' })
  async getHealth(@Headers('x-tenant-id') tenantIdHeader?: string) {
    return this.assuranceService.getSummary();
  }
}

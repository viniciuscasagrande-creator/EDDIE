import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ControlTowerService } from './control-tower.service';
import {
  QueueType,
  ApprovalStatus,
  FinancialCaseDto,
  SafeAutomationRuleDto,
  ForensicAuditQueryDto,
} from './control-tower.types';

function resolveTenant(header?: string): string {
  return header || '00000000-0000-0000-0000-000000000001';
}

function resolveProducer(header?: string, query?: string): string {
  return query || header || '00000000-0000-0000-0000-000000000002';
}

function resolveUser(header?: string): string {
  return header || 'usr-control-tower-operator';
}

function resolveRole(header?: string): string {
  return header || 'OPERADOR';
}

@ApiTags('control-tower')
@Controller('finance')
export class ControlTowerController {
  constructor(private readonly controlTower: ControlTowerService) {}

  @Get('management/summary')
  @ApiOperation({ summary: 'Obtém resumo executivo de filas, aprovações, conciliação e fechamento' })
  getSummary(
    @Query('produtorId') queryProducer?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader, queryProducer);
    return this.controlTower.getControlTowerSummary(tenantId, producerId);
  }

  // 1. Filas Operacionais
  @Get('operations/queues')
  @ApiOperation({ summary: 'Lista itens das filas operacionais da Control Tower com prioridade e SLA' })
  listQueues(
    @Query('queue') queue?: QueueType,
    @Query('produtorId') queryProducer?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader, queryProducer);
    return this.controlTower.listQueueItems(tenantId, queue, producerId);
  }

  @Patch('operations/queues/:id/status')
  @ApiOperation({ summary: 'Atualiza status de um item de fila operacional' })
  updateQueueStatus(
    @Param('id') itemId: string,
    @Body() body: { status: 'PENDENTE' | 'EM_ANALISE' | 'APROVADO' | 'PROCESSANDO' | 'CONCLUIDO' | 'REJEITADO' | 'BLOQUEADO' },
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-user-id') userIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const actorId = resolveUser(userIdHeader);
    return this.controlTower.updateQueueItemStatus(tenantId, itemId, body.status, actorId);
  }

  // 2. Alçadas e Aprovações
  @Get('approvals')
  @ApiOperation({ summary: 'Lista solicitações de aprovação pendentes ou filtradas por status' })
  listApprovals(
    @Query('status') status?: ApprovalStatus,
    @Query('produtorId') queryProducer?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader, queryProducer);
    return this.controlTower.listApprovalRequests(tenantId, producerId, status);
  }

  @Post('approvals')
  @ApiOperation({ summary: 'Submete nova solicitação para aprovação por alçada competente' })
  createApproval(
    @Body() body: {
      eventId: string;
      type: 'TAXA' | 'TRANSFERENCIA' | 'PAGAMENTO' | 'REPASSE' | 'LOTE' | 'ESTORNO_ADMIN' | 'ADVANCED' | 'AJUSTE';
      title: string;
      description: string;
      amountCents: number;
      correlationId?: string;
    },
    @Query('produtorId') queryProducer?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
    @Headers('x-user-id') userIdHeader?: string,
    @Headers('x-user-role') roleHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader, queryProducer);
    const requesterId = resolveUser(userIdHeader);
    const requesterRole = resolveRole(roleHeader);

    return this.controlTower.createApprovalRequest(tenantId, producerId, {
      ...body,
      requesterId,
      requesterRole,
    });
  }

  @Post('approvals/:id/approve')
  @ApiOperation({ summary: 'Aprova solicitação com validação de alçada e segregação de funções' })
  approve(
    @Param('id') requestId: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-user-id') userIdHeader?: string,
    @Headers('x-user-role') roleHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const approverId = resolveUser(userIdHeader);
    const approverRole = resolveRole(roleHeader);
    return this.controlTower.approveRequest(tenantId, requestId, approverId, approverRole);
  }

  @Post('approvals/:id/reject')
  @ApiOperation({ summary: 'Rejeita solicitação informando justificativa contábil' })
  reject(
    @Param('id') requestId: string,
    @Body() body: { reason: string },
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-user-id') userIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const reviewerId = resolveUser(userIdHeader);
    return this.controlTower.rejectRequest(tenantId, requestId, reviewerId, body.reason);
  }

  // 3. Fechamentos & Dossiê
  @Get('closings/event/:eventId')
  @ApiOperation({ summary: 'Verifica status e checklist para fechamento financeiro do evento' })
  getEventClosing(
    @Param('eventId') eventId: string,
    @Query('produtorId') queryProducer?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader, queryProducer);
    return this.controlTower.getEventClosingStatus(tenantId, eventId, producerId);
  }

  @Post('closings/event/:eventId/close')
  @ApiOperation({ summary: 'Executa fechamento do evento e gera Dossiê Final auditado' })
  async closeEvent(
    @Param('eventId') eventId: string,
    @Query('produtorId') queryProducer?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
    @Headers('x-user-id') userIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader, queryProducer);
    const actorId = resolveUser(userIdHeader);
    return this.controlTower.executeEventClosing(tenantId, eventId, producerId, actorId);
  }

  @Post('closings/event/:eventId/reopen')
  @ApiOperation({ summary: 'Reabre fechamento mediante autorização explícita e justificativa formal' })
  reopenEvent(
    @Param('eventId') eventId: string,
    @Body() body: { reason: string; authorizationCode: string },
    @Query('produtorId') queryProducer?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
    @Headers('x-user-id') userIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader, queryProducer);
    const actorId = resolveUser(userIdHeader);
    return this.controlTower.reopenEventClosing(
      tenantId,
      eventId,
      producerId,
      actorId,
      body.reason,
      body.authorizationCode,
    );
  }

  @Get('closings/daily')
  @ApiOperation({ summary: 'Obtém fechamento diário do período' })
  getDailyClosing(
    @Query('date') date?: string,
    @Query('produtorId') queryProducer?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader, queryProducer);
    const targetDate = date || new Date().toISOString().split('T')[0]!;
    return this.controlTower.getDailyClosing(tenantId, targetDate, producerId);
  }

  // 4. Repasses em Massa
  @Post('payouts/mass/preview')
  @ApiOperation({ summary: 'Gera prévia validada para execução de repasses em massa' })
  previewMassPayouts(
    @Body() body: { eventId?: string },
    @Query('produtorId') queryProducer?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader, queryProducer);
    return this.controlTower.previewMassPayouts(tenantId, producerId, body?.eventId);
  }

  @Post('payouts/mass/execute')
  @ApiOperation({ summary: 'Executa lote de repasses em massa com proteção de idempotência' })
  executeMassPayouts(
    @Body() body: { batchId: string; idempotencyKey?: string },
    @Query('produtorId') queryProducer?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
    @Headers('x-user-id') userIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader, queryProducer);
    const approverId = resolveUser(userIdHeader);
    return this.controlTower.executeMassPayoutBatch(
      tenantId,
      producerId,
      body.batchId,
      approverId,
      body.idempotencyKey,
    );
  }

  // 5. Conciliação Enterprise Workstation
  @Get('reconciliation/enterprise')
  @ApiOperation({ summary: 'Lista candidatos de matching automático e manual da Workstation Enterprise' })
  listReconciliationCandidates(
    @Query('produtorId') queryProducer?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader, queryProducer);
    return this.controlTower.listEnterpriseMatchingCandidates(tenantId, producerId);
  }

  @Post('reconciliation/enterprise/match')
  @ApiOperation({ summary: 'Confirma conciliação de par identificado com registro de auditoria' })
  confirmMatch(
    @Body() body: { matchId: string },
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-user-id') userIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const actorId = resolveUser(userIdHeader);
    return this.controlTower.confirmEnterpriseMatch(tenantId, body.matchId, actorId);
  }

  // 6. Casos Financeiros
  @Get('cases')
  @ApiOperation({ summary: 'Lista casos financeiros e divergências em aberto' })
  listCases(
    @Query('severity') severity?: FinancialCaseDto['severity'],
    @Query('status') status?: FinancialCaseDto['status'],
    @Query('produtorId') queryProducer?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader, queryProducer);
    return this.controlTower.listFinancialCases(tenantId, producerId, severity, status);
  }

  @Post('cases')
  @ApiOperation({ summary: 'Registra novo caso financeiro para investigação' })
  createCase(
    @Body() body: Omit<FinancialCaseDto, 'id' | 'caseNumber' | 'status' | 'createdAt' | 'updatedAt' | 'tenantId'>,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.controlTower.createFinancialCase(tenantId, body);
  }

  @Post('cases/:id/resolve')
  @ApiOperation({ summary: 'Encerra caso financeiro com parecer técnico e arquivamento de evidências' })
  resolveCase(
    @Param('id') caseId: string,
    @Body() body: { resolutionNote: string; evidenceUrls?: string[] },
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-user-id') userIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const actorId = resolveUser(userIdHeader);
    return this.controlTower.resolveFinancialCase(
      tenantId,
      caseId,
      actorId,
      body.resolutionNote,
      body.evidenceUrls,
    );
  }

  // 7. Agenda & Liquidez
  @Get('calendar')
  @ApiOperation({ summary: 'Obtém calendário unificado de compromissos e repasses financeiros' })
  getCalendar(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('produtorId') queryProducer?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader, queryProducer);
    return this.controlTower.getFinancialCalendar(tenantId, startDate, endDate, producerId);
  }

  @Get('liquidity')
  @ApiOperation({ summary: 'Gera projeção de liquidez (7/15/30/60/90 dias) estritamente segregada do realizado' })
  getLiquidity(
    @Query('produtorId') queryProducer?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader, queryProducer);
    return this.controlTower.getLiquidityForecast(tenantId, producerId);
  }

  // 8. Automações Seguras
  @Post('automations/run')
  @ApiOperation({ summary: 'Dispara rotina de automação segura (re-sync/retry) sem movimentar dinheiro' })
  runAutomation(
    @Body() body: { ruleType: SafeAutomationRuleDto['type']; dryRun?: boolean },
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.controlTower.runSafeAutomation(tenantId, body.ruleType, body.dryRun);
  }

  // 9. Auditoria Forense
  @Get('audit/search')
  @ApiOperation({ summary: 'Pesquisa histórico de auditoria forense por correlationId, idempotencyKey ou ator' })
  searchAuditGet(
    @Query() query: ForensicAuditQueryDto,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.controlTower.searchForensicAudit(tenantId, query);
  }

  @Post('audit/search')
  @ApiOperation({ summary: 'Pesquisa avançada de auditoria forense' })
  searchAuditPost(
    @Body() query: ForensicAuditQueryDto,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.controlTower.searchForensicAudit(tenantId, query);
  }
}

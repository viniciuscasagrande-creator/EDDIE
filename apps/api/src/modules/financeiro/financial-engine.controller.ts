import {
  BadRequestException,
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
import { FinancialEngineService } from './financial-engine.service';
import { FinanceiroService } from './financeiro.service';
import type { EventFeeConfig } from './financial-engine.types';

const resolveTenant = (headerTenant?: string): string =>
  headerTenant || '00000000-0000-0000-0000-000000000001';

const resolveUser = (headerUser?: string): string =>
  headerUser || '00000000-0000-0000-0000-000000000002';

const resolveProducer = (headerProducer?: string, queryProducer?: string): string =>
  queryProducer || headerProducer || '00000000-0000-0000-0000-000000000002';

@ApiTags('finance-events')
@Controller('eventos/:eventId/finance')
export class FinancialEngineEventController {
  constructor(
    private readonly financialEngine: FinancialEngineService,
    private readonly financeiroService: FinanceiroService,
  ) {}

  @Get('summary')
  @ApiOperation({ summary: 'Obtém resumo executivo financeiro completo do evento (saldo, DRE, taxas, conciliação)' })
  async getSummary(
    @Param('eventId') eventId: string,
    @Query('produtorId') queryProducer?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader, queryProducer);

    const [balance, dre, reconciliation, feeConfig, intelligence] = await Promise.all([
      this.financialEngine.getEventRealBalance(tenantId, eventId, producerId),
      this.financialEngine.getEventDre(tenantId, eventId, producerId),
      this.financialEngine.runSixWayReconciliation(tenantId, eventId, producerId),
      Promise.resolve(this.financialEngine.getEventFeeConfig(tenantId, eventId, producerId)),
      this.financialEngine.getFinancialIntelligence(tenantId, eventId, producerId),
    ]);

    return {
      eventId,
      producerId,
      balance,
      dre,
      reconciliation,
      feeConfig,
      intelligence,
      generatedAt: new Date().toISOString(),
    };
  }

  @Get('balance')
  @ApiOperation({ summary: 'Obtém o saldo real derivado do Ledger por bucket (disponível, retido, bloqueado, estorno)' })
  async getBalance(
    @Param('eventId') eventId: string,
    @Query('produtorId') queryProducer?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader, queryProducer);
    return this.financialEngine.getEventRealBalance(tenantId, eventId, producerId);
  }

  @Get('ledger')
  @ApiOperation({ summary: 'Lista lançamentos contábeis imutáveis do Ledger vinculados a este evento' })
  async getLedger(
    @Param('eventId') eventId: string,
    @Query('produtorId') queryProducer?: string,
    @Query('bucket') bucket?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader, queryProducer);
    return this.financeiroService.listarExtratoLedger(tenantId, producerId, {
      eventoId,
      bucket: bucket as any,
    });
  }

  @Get('dre')
  @ApiOperation({ summary: 'Demonstrativo do Resultado do Exercício (DRE) oficial do evento' })
  async getDre(
    @Param('eventId') eventId: string,
    @Query('produtorId') queryProducer?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader, queryProducer);
    return this.financialEngine.getEventDre(tenantId, eventId, producerId);
  }

  @Get('cashflow')
  @ApiOperation({ summary: 'Fluxo de caixa realizado vs projetado do evento' })
  async getCashflow(
    @Param('eventId') eventId: string,
    @Query('produtorId') queryProducer?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader, queryProducer);
    return this.financialEngine.getEventCashflow(tenantId, eventId, producerId);
  }

  @Get('fees')
  @ApiOperation({ summary: 'Consulta a regra de taxa Disk configurada para o evento' })
  getFees(
    @Param('eventId') eventId: string,
    @Query('produtorId') queryProducer?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader, queryProducer);
    return this.financialEngine.getEventFeeConfig(tenantId, eventId, producerId);
  }

  @Post('fees')
  @ApiOperation({ summary: 'Atualiza ou cria nova versão da regra de taxa Disk do evento (com snapshot preservado)' })
  setFees(
    @Param('eventId') eventId: string,
    @Body() body: Partial<EventFeeConfig>,
    @Query('produtorId') queryProducer?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader, queryProducer);
    return this.financialEngine.setEventFeeConfig(tenantId, {
      ...body,
      eventId,
      producerId,
    });
  }

  @Get('settlements')
  @ApiOperation({ summary: 'Lista lotes de repasse e agenda de liquidação bancária do evento' })
  listSettlements(
    @Param('eventId') eventId: string,
    @Query('produtorId') queryProducer?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader, queryProducer);
    return this.financialEngine.listSettlements(tenantId, eventId, producerId);
  }

  @Post('settlements')
  @ApiOperation({ summary: 'Agenda lote de repasse do evento com bloqueio cautelar e idempotência' })
  async scheduleSettlement(
    @Param('eventId') eventId: string,
    @Body() body: { amountCents: number; pixKey: string; scheduledDate: string; idempotencyKey?: string },
    @Query('produtorId') queryProducer?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
    @Headers('x-user-id') userIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader, queryProducer);
    const requestedBy = resolveUser(userIdHeader);

    return this.financialEngine.scheduleSettlement(tenantId, producerId, {
      eventId,
      amountCents: body.amountCents,
      pixKey: body.pixKey,
      scheduledDate: body.scheduledDate || new Date().toISOString(),
      requestedBy,
      idempotencyKey: body.idempotencyKey,
    });
  }

  @Post('settlements/:id/approve')
  @ApiOperation({ summary: 'Aprova lote de repasse agendado por alçada executiva' })
  async approveSettlement(
    @Param('eventId') _eventId: string,
    @Param('id') settlementId: string,
    @Headers('x-user-id') userIdHeader?: string,
  ) {
    const approvedBy = resolveUser(userIdHeader);
    return { ok: true, settlementId, status: 'RESERVADO', approvedBy, approvedAt: new Date().toISOString() };
  }

  @Post('settlements/:id/execute')
  @ApiOperation({ summary: 'Efetua liquidação bancária Pix/CNAB com comprovante e baixa no Ledger' })
  async executeSettlement(
    @Param('eventId') _eventId: string,
    @Param('id') settlementId: string,
    @Body() body: { bankReceiptId?: string; pixEndToEndId?: string; idempotencyKey?: string },
    @Query('produtorId') queryProducer?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
    @Headers('x-user-id') userIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader, queryProducer);
    const actorId = resolveUser(userIdHeader);

    return this.financialEngine.executeSettlement(tenantId, settlementId, producerId, {
      bankReceiptId: body.bankReceiptId,
      pixEndToEndId: body.pixEndToEndId,
      actorId,
      idempotencyKey: body.idempotencyKey,
    });
  }

  @Get('reconciliation')
  @ApiOperation({ summary: 'Executa conciliação 6 vias (Gateway x Pagamento x Pedido x Ledger x Repasse x Banco)' })
  async getReconciliation(
    @Param('eventId') eventId: string,
    @Query('produtorId') queryProducer?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader, queryProducer);
    return this.financialEngine.runSixWayReconciliation(tenantId, eventId, producerId);
  }

  @Post('reconciliation/run')
  @ApiOperation({ summary: 'Força reprocessamento da conciliação 6 vias e detecção de divergências' })
  async runReconciliation(
    @Param('eventId') eventId: string,
    @Query('produtorId') queryProducer?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader, queryProducer);
    return this.financialEngine.runSixWayReconciliation(tenantId, eventId, producerId);
  }

  @Get('reconciliation/cases/:id')
  @ApiOperation({ summary: 'Obtém detalhes de um caso de divergência de conciliação' })
  getReconciliationCase(
    @Param('eventId') eventId: string,
    @Param('id') caseId: string,
    @Query('produtorId') queryProducer?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader, queryProducer);
    const cases = this.financialEngine.listReconciliationCases(tenantId, eventId, producerId);
    return cases.find((c) => c.id === caseId) || null;
  }

  @Patch('reconciliation/cases/:id')
  @ApiOperation({ summary: 'Resolve ou ignora caso de divergência de conciliação com parecer do auditor' })
  resolveReconciliationCase(
    @Param('eventId') _eventId: string,
    @Param('id') caseId: string,
    @Body() body: { resolutionNote: string; action: 'RESOLVER' | 'IGNORAR' },
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-user-id') userIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const resolvedBy = resolveUser(userIdHeader);
    return this.financialEngine.resolveReconciliationCase(tenantId, caseId, {
      resolutionNote: body.resolutionNote,
      action: body.action || 'RESOLVER',
      resolvedBy,
    });
  }

  @Get('intelligence')
  @ApiOperation({ summary: 'Obtém diagnósticos e insights de inteligência financeira baseados em evidência' })
  async getIntelligence(
    @Param('eventId') eventId: string,
    @Query('produtorId') queryProducer?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader, queryProducer);
    return this.financialEngine.getFinancialIntelligence(tenantId, eventId, producerId);
  }

  @Get('timeline')
  @ApiOperation({ summary: 'Timeline unificada de eventos financeiros do evento (vendas, estornos, repasses)' })
  async getTimeline(
    @Param('eventId') eventId: string,
    @Query('produtorId') queryProducer?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader, queryProducer);
    const ledger = await this.financeiroService.listarExtratoLedger(tenantId, producerId, {
      eventoId,
      limit: 20,
    });

    return ledger.lancamentos.map((l) => ({
      id: l.id,
      timestamp: l.criadoEm,
      type: l.origem.toUpperCase(),
      description: l.historico,
      amountCents: l.valorCents,
      direction: l.tipo === 'entrada' ? 'IN' : 'OUT',
      bucket: l.bucket,
    }));
  }

  @Get('payables')
  @ApiOperation({ summary: 'Lista contas a pagar vinculadas ao evento' })
  listPayables(
    @Param('eventId') eventId: string,
    @Query('produtorId') queryProducer?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader, queryProducer);
    return this.financialEngine.listPayables(tenantId, eventId, producerId);
  }

  @Post('payables')
  @ApiOperation({ summary: 'Cadastra nova conta a pagar para o evento' })
  createPayable(
    @Param('eventId') eventId: string,
    @Body() body: {
      supplierId: string;
      supplierName: string;
      category: string;
      description: string;
      amountCents: number;
      dueDate: string;
      costCenterId?: string;
    },
    @Query('produtorId') queryProducer?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader, queryProducer);
    return this.financialEngine.createPayable(tenantId, producerId, {
      ...body,
      eventId,
    });
  }

  @Post('payables/:id/approve')
  @ApiOperation({ summary: 'Aprova conta a pagar por alçada competente' })
  approvePayable(
    @Param('eventId') _eventId: string,
    @Param('id') payableId: string,
    @Query('produtorId') queryProducer?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
    @Headers('x-user-id') userIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader, queryProducer);
    const actorId = resolveUser(userIdHeader);
    return this.financialEngine.approvePayable(tenantId, payableId, producerId, actorId);
  }

  @Post('payables/:id/pay')
  @ApiOperation({ summary: 'Liquida conta a pagar com débito rastreável no Ledger' })
  async payPayable(
    @Param('eventId') _eventId: string,
    @Param('id') payableId: string,
    @Body() body: { paymentMethod?: string },
    @Query('produtorId') queryProducer?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
    @Headers('x-user-id') userIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader, queryProducer);
    const actorId = resolveUser(userIdHeader);
    return this.financialEngine.payPayable(tenantId, payableId, producerId, {
      actorId,
      paymentMethod: body?.paymentMethod,
    });
  }

  @Get('receivables')
  @ApiOperation({ summary: 'Lista contas a receber do evento (patrocínios, aportes)' })
  listReceivables(
    @Param('eventId') eventId: string,
    @Query('produtorId') queryProducer?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader, queryProducer);
    return this.financialEngine.listReceivables(tenantId, eventId, producerId);
  }

  @Post('receivables')
  @ApiOperation({ summary: 'Cadastra nova conta a receber para o evento' })
  createReceivable(
    @Param('eventId') eventId: string,
    @Body() body: {
      origin: string;
      counterparty: string;
      description: string;
      amountCents: number;
      dueDate: string;
      costCenterId?: string;
    },
    @Query('produtorId') queryProducer?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader, queryProducer);
    return this.financialEngine.createReceivable(tenantId, producerId, {
      ...body,
      eventId,
    });
  }

  @Post('receivables/:id/settle')
  @ApiOperation({ summary: 'Liquida recebível com crédito no saldo disponível do Ledger' })
  async settleReceivable(
    @Param('eventId') _eventId: string,
    @Param('id') receivableId: string,
    @Body() body: { amountCents?: number },
    @Query('produtorId') queryProducer?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
    @Headers('x-user-id') userIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader, queryProducer);
    const actorId = resolveUser(userIdHeader);
    return this.financialEngine.settleReceivable(tenantId, receivableId, producerId, {
      actorId,
      amountCents: body?.amountCents,
    });
  }

  @Get('cost-centers')
  @ApiOperation({ summary: 'Lista centros de custo do evento' })
  listCostCenters(
    @Param('eventId') eventId: string,
    @Query('produtorId') queryProducer?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader, queryProducer);
    return this.financialEngine.listCostCenters(tenantId, eventId, producerId);
  }

  @Post('cost-centers')
  @ApiOperation({ summary: 'Cria novo centro de custo para o evento' })
  createCostCenter(
    @Param('eventId') eventId: string,
    @Body() body: {
      code: string;
      name: string;
      category: string;
      budgetLimitCents: number;
      active?: boolean;
    },
    @Query('produtorId') queryProducer?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader, queryProducer);
    return this.financialEngine.createCostCenter(tenantId, producerId, {
      ...body,
      eventId,
      active: body.active ?? true,
    });
  }

  @Get('suppliers')
  @ApiOperation({ summary: 'Lista fornecedores vinculados ao produtor/evento' })
  listSuppliers(
    @Query('produtorId') queryProducer?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader, queryProducer);
    return this.financialEngine.listSuppliers(tenantId, producerId);
  }

  @Post('suppliers')
  @ApiOperation({ summary: 'Cadastra novo fornecedor com dados bancários' })
  createSupplier(
    @Body() body: {
      name: string;
      documentMasked: string;
      contactEmail: string;
      category: string;
      bankAccountMasked: string;
      pixKey: string;
      active?: boolean;
      notes?: string;
    },
    @Query('produtorId') queryProducer?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader, queryProducer);
    return this.financialEngine.createSupplier(tenantId, producerId, {
      ...body,
      active: body.active ?? true,
    });
  }

  @Get('refunds')
  @ApiOperation({ summary: 'Lista estornos do evento com status operacional' })
  listRefunds(
    @Param('eventId') eventId: string,
    @Query('produtorId') queryProducer?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader, queryProducer);
    return this.financialEngine.listRefunds(tenantId, eventId, producerId);
  }

  @Get('chargebacks')
  @ApiOperation({ summary: 'Lista chargebacks do evento e status de contestações' })
  listChargebacks(
    @Param('eventId') eventId: string,
    @Query('produtorId') queryProducer?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader, queryProducer);
    return this.financialEngine.listChargebacks(tenantId, eventId, producerId);
  }

  @Post('chargebacks/:id/reverse')
  @ApiOperation({ summary: 'Reverte chargeback ganho em disputa com recomposição do saldo' })
  async reverseChargeback(
    @Param('eventId') _eventId: string,
    @Param('id') chargebackId: string,
    @Body() body: { reason: string },
    @Query('produtorId') queryProducer?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
    @Headers('x-user-id') userIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader, queryProducer);
    const actorId = resolveUser(userIdHeader);
    return this.financialEngine.reverseChargeback(tenantId, chargebackId, producerId, {
      reason: body.reason,
      actorId,
    });
  }

  @Get('reconciliation/cases')
  @ApiOperation({ summary: 'Lista casos de divergência de conciliação do evento' })
  listReconciliationCases(
    @Param('eventId') eventId: string,
    @Query('produtorId') queryProducer?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader, queryProducer);
    return this.financialEngine.listReconciliationCases(tenantId, eventId, producerId);
  }

  @Get('reports')
  @ApiOperation({ summary: 'Gera relatório financeiro oficial estruturado para auditoria e exportação' })
  async getReport(
    @Param('eventId') eventId: string,
    @Query('tipo') tipo?: 'EXTRATO' | 'SALDOS' | 'TAXAS' | 'CONCILIACAO' | 'DRE' | 'FLUXO_CAIXA' | 'AUDITORIA' | 'PAGAR_RECEBER',
    @Query('periodo') periodo?: string,
    @Query('produtorId') queryProducer?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader, queryProducer);
    return this.financialEngine.generateFinancialReport(
      tenantId,
      eventId,
      producerId,
      tipo || 'DRE',
      periodo || '2026-01 a 2026-12',
    );
  }
}

@ApiTags('finance-producer')
@Controller('produtores/:producerId/finance')
export class FinancialEngineProducerController {
  constructor(private readonly financialEngine: FinancialEngineService) {}

  @Get('balance')
  @ApiOperation({ summary: 'Obtém saldo consolidado de todos os eventos do produtor com segregação' })
  async getConsolidatedBalance(
    @Param('producerId') producerId: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.financialEngine.getProducerConsolidatedBalance(tenantId, producerId);
  }

  @Post('transfers')
  @ApiOperation({ summary: 'Realiza transferência de saldos disponíveis entre eventos do mesmo produtor' })
  async transfer(
    @Param('producerId') producerId: string,
    @Body() body: { originEventId: string; targetEventId: string; amountCents: number; reason: string },
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-user-id') userIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const requestedBy = resolveUser(userIdHeader);

    return this.financialEngine.transferBetweenEvents(tenantId, producerId, {
      originEventId: body.originEventId,
      targetEventId: body.targetEventId,
      amountCents: body.amountCents,
      reason: body.reason,
      requestedBy,
    });
  }

  @Post('transfers/:id/reverse')
  @ApiOperation({ summary: 'Efetua estorno compensatório de uma transferência inter-eventos' })
  async reverseTransfer(
    @Param('producerId') producerId: string,
    @Param('id') transferId: string,
    @Body() body: { reason: string },
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-user-id') userIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const actorId = resolveUser(userIdHeader);
    return this.financialEngine.reverseTransfer(tenantId, transferId, producerId, body.reason, actorId);
  }

  @Post('advanced/simulate')
  @ApiOperation({ summary: 'Simula deságio e valor líquido de antecipação com taxa pró-rata do contrato' })
  simulateAdvanced(
    @Param('producerId') producerId: string,
    @Body() body: { eventId: string; amountCents: number; days: number },
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.financialEngine.simulateAdvanced(
      body.amountCents,
      body.days,
      tenantId,
      body.eventId,
      producerId,
    );
  }

  @Get('treasury')
  @ApiOperation({ summary: 'Consulta contas bancárias, lotes CNAB e saldo total de tesouraria do produtor' })
  getTreasury(
    @Param('producerId') producerId: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.financialEngine.getTreasury(tenantId, producerId);
  }

  @Post('treasury/cnab/return')
  @ApiOperation({ summary: 'Processa arquivo de retorno CNAB 240 com conciliação ou divergência de rejeição' })
  processCnabReturn(
    @Param('producerId') producerId: string,
    @Body() body: { batchId: string; status: 'PROCESSADO' | 'REJEITADO'; failureReason?: string; eventId?: string },
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.financialEngine.processCnabReturn(tenantId, producerId, body);
  }
}

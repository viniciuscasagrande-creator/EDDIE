import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProducerPortalService } from './producer-portal.service';
import type {
  TransferBetweenOwnEventsRequestDto,
  BankAccountChangeRequestDto,
} from './producer-portal.types';

const resolveTenant = (headerTenant?: string): string =>
  headerTenant || '00000000-0000-0000-0000-000000000001';

const resolveProducer = (headerProducer?: string): string =>
  headerProducer || '00000000-0000-0000-0000-000000000002';

@ApiTags('producer-finance')
@Controller('api/producer/finance')
export class ProducerPortalController {
  constructor(private readonly portalService: ProducerPortalService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Início financeiro consolidado do produtor' })
  async getSummary(
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader);
    return this.portalService.getHomeSummary(tenantId, producerId);
  }

  @Get('events')
  @ApiOperation({ summary: 'Lista de eventos do produtor com seus saldos detalhados' })
  async getEvents(
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader);
    return this.portalService.getProducerEvents(tenantId, producerId);
  }

  @Get('events/:eventId/balance')
  @ApiOperation({ summary: 'Saldo real e buckets de um evento específico do produtor' })
  async getEventBalance(
    @Param('eventId') eventId: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader);
    return this.portalService.getEventBalance(tenantId, producerId, eventId);
  }

  @Get('events/:eventId/statement')
  @ApiOperation({ summary: 'Extrato financeiro detalhado de um evento derivado do 11.19' })
  async getEventStatement(
    @Param('eventId') eventId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader);
    return this.portalService.getEventStatement(tenantId, producerId, eventId, {
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  @Get('events/:eventId/fees')
  @ApiOperation({ summary: 'Taxas vigentes e histórico versionado por evento' })
  async getEventFees(
    @Param('eventId') eventId: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader);
    return this.portalService.getEventFees(tenantId, producerId, eventId);
  }

  @Get('settlements')
  @ApiOperation({ summary: 'Agenda de repasses e repasses liquidados' })
  async getSettlements(
    @Query('eventId') eventId?: string,
    @Query('status') status?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader);
    return this.portalService.getSettlements(tenantId, producerId, { eventId, status });
  }

  @Get('settlements/:id/receipt')
  @ApiOperation({ summary: 'Comprovante bancário de repasse liquidado' })
  async getSettlementReceipt(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader);
    return this.portalService.getSettlementReceipt(tenantId, producerId, id);
  }

  @Post('transfers')
  @ApiOperation({ summary: 'Solicitação de transferência entre eventos do MESMO produtor' })
  async requestTransfer(
    @Body() body: TransferBetweenOwnEventsRequestDto,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader);
    return this.portalService.requestTransferBetweenEvents(tenantId, producerId, body);
  }

  @Get('refunds')
  @ApiOperation({ summary: 'Estornos com impacto em saldo e reserva' })
  async getRefunds(
    @Query('eventId') eventId?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader);
    return this.portalService.getRefunds(tenantId, producerId, { eventId });
  }

  @Get('chargebacks')
  @ApiOperation({ summary: 'Contestações bancárias e prazos de defesa' })
  async getChargebacks(
    @Query('eventId') eventId?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader);
    return this.portalService.getChargebacks(tenantId, producerId, { eventId });
  }

  @Get('cashflow')
  @ApiOperation({ summary: 'Fluxo de caixa segregando Realizado vs Projetado' })
  async getCashflow(
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader);
    return this.portalService.getCashflow(tenantId, producerId);
  }

  @Get('dre')
  @ApiOperation({ summary: 'DRE gerencial do produtor/evento' })
  async getDre(
    @Query('eventId') eventId?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader);
    return this.portalService.getDre(tenantId, producerId, eventId);
  }

  @Get('documents')
  @ApiOperation({ summary: 'Documentos fiscais e relatórios disponíveis' })
  async getDocuments(
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader);
    return this.portalService.getDocuments(tenantId, producerId);
  }

  @Get('documents/:id/download')
  @ApiOperation({ summary: 'Download seguro de documento com checagem de titularidade' })
  async downloadDocument(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader);
    return this.portalService.downloadDocument(tenantId, producerId, id);
  }

  @Get('bank-account')
  @ApiOperation({ summary: 'Dados bancários cadastrados (mascarados)' })
  async getBankAccount(
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader);
    return this.portalService.getBankAccount(tenantId, producerId);
  }

  @Post('bank-account/request-change')
  @ApiOperation({ summary: 'Solicitação de alteração de domicílio bancário' })
  async requestBankAccountChange(
    @Body() body: BankAccountChangeRequestDto,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader);
    return this.portalService.requestBankAccountChange(tenantId, producerId, body);
  }

  @Get('requests')
  @ApiOperation({ summary: 'Central de solicitações e protocolos do produtor' })
  async getRequests(
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader);
    return this.portalService.getRequests(tenantId, producerId);
  }

  @Get('requests/:protocol')
  @ApiOperation({ summary: 'Consulta solicitação por protocolo e timeline' })
  async getRequestByProtocol(
    @Param('protocol') protocol: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader);
    return this.portalService.getRequestByProtocol(tenantId, producerId, protocol);
  }

  @Get('notifications')
  @ApiOperation({ summary: 'Notificações financeiras seguras do produtor' })
  async getNotifications(
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-producer-id') producerIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const producerId = resolveProducer(producerIdHeader);
    return this.portalService.getNotifications(tenantId, producerId);
  }
}

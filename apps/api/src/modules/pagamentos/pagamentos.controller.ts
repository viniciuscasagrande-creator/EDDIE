import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { PagamentosService } from './pagamentos.service';
import {
  ConciliarAdquirenteDto,
  ConfirmPaymentDto,
  CreatePaymentIntentDto,
  PaymentIntentFilterDto,
  ProcessCardDto,
  ProcessPixDto,
  RefusePaymentDto,
} from './pagamentos.types';

@Controller('pagamentos')
export class PagamentosController {
  constructor(private readonly pagamentosService: PagamentosService) {}

  @Get('metricas')
  async obterMetricas() {
    return this.pagamentosService.obterMetricasGerais();
  }

  @Get('intencoes')
  async listarIntencoes(
    @Query('status') status?: any,
    @Query('metodo') metodo?: any,
    @Query('adquirente') adquirente?: string,
    @Query('busca') termoBusca?: string,
    @Query('pagina') pagina?: string,
    @Query('limite') limite?: string,
  ) {
    const filter: PaymentIntentFilterDto = {
      status,
      metodo,
      adquirente,
      termoBusca,
      pagina: pagina ? parseInt(pagina, 10) : 1,
      limite: limite ? parseInt(limite, 10) : 20,
    };
    return this.pagamentosService.listarIntencoes(filter);
  }

  @Get('intencoes/:id')
  async consultarIntencao(@Param('id') id: string) {
    return this.pagamentosService.consultarIntencao(id);
  }

  @Post('intencoes')
  @HttpCode(HttpStatus.CREATED)
  async criarIntencao(@Body() body: CreatePaymentIntentDto) {
    return this.pagamentosService.criarIntencao(body);
  }

  @Post('intencoes/:id/pix')
  async gerarPix(@Param('id') id: string, @Body() body?: ProcessPixDto) {
    return this.pagamentosService.gerarPixCobranca(id, body);
  }

  @Post('intencoes/:id/cartao')
  async processarCartao(@Param('id') id: string, @Body() body: ProcessCardDto) {
    return this.pagamentosService.processarCartao(id, body);
  }

  @Post('intencoes/:id/confirmar')
  async confirmarPagamento(@Param('id') id: string, @Body() body: ConfirmPaymentDto) {
    return this.pagamentosService.confirmarPagamento(id, body);
  }

  @Post('intencoes/:id/recusar')
  async recusarPagamento(@Param('id') id: string, @Body() body: RefusePaymentDto) {
    return this.pagamentosService.recusarPagamento(id, body);
  }

  @Post('webhooks/:adquirente')
  @HttpCode(HttpStatus.OK)
  async receberWebhook(
    @Param('adquirente') adquirente: string,
    @Body() payload: Record<string, unknown>,
  ) {
    const webhookEventId = (payload.eventId || payload.id || `whk-${Date.now()}`) as string;
    const tipoEvento = (payload.eventType || payload.type || 'PAYMENT_NOTIFICATION') as string;
    return this.pagamentosService.processarWebhook({
      adquirente,
      webhookEventId,
      tipoEvento,
      payload,
    });
  }

  @Get('conciliacao')
  async listarConciliacoes() {
    return this.pagamentosService.listarLotesConciliacao();
  }

  @Post('conciliacao')
  @HttpCode(HttpStatus.CREATED)
  async conciliarLote(@Body() body: ConciliarAdquirenteDto) {
    return this.pagamentosService.conciliarLoteAdquirente(body);
  }
}

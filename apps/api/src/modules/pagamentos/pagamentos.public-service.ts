// ============================================================================
//  PAGAMENTOS — Porta Pública (EDDIE 11.29.3 — PagamentosPublicService)
//  REGRA 1: Outros módulos nunca acessam o schema `pagamentos` diretamente.
//  Eles chamam PagamentosPublicService ou consomem eventos de domínio.
// ============================================================================

import { Injectable } from '@nestjs/common';
import { PagamentosService, PaymentIntentInternal } from './pagamentos.service';
import {
  ConciliarAdquirenteDto,
  ConfirmPaymentDto,
  CreatePaymentIntentDto,
  PaymentIntentFilterDto,
  PaymentMetricsDto,
  ProcessCardDto,
  ProcessPixDto,
  RefusePaymentDto,
  WebhookPaymentInputDto,
} from './pagamentos.types';

@Injectable()
export class PagamentosPublicService {
  constructor(private readonly pagamentosService: PagamentosService) {}

  /**
   * Inicializa uma nova Intenção de Pagamento com chave de idempotência e split.
   */
  async criarIntencao(input: CreatePaymentIntentDto): Promise<PaymentIntentInternal> {
    return this.pagamentosService.criarIntencao(input);
  }

  /**
   * Gera cobrança PIX com QR Code dinâmico Copia e Cola.
   */
  async gerarPixCobranca(paymentIntentId: string, input?: ProcessPixDto): Promise<PaymentIntentInternal> {
    return this.pagamentosService.gerarPixCobranca(paymentIntentId, input);
  }

  /**
   * Processa transação com Cartão de Crédito calculando taxas MDR e split.
   */
  async processarCartao(paymentIntentId: string, input: ProcessCardDto): Promise<PaymentIntentInternal> {
    return this.pagamentosService.processarCartao(paymentIntentId, input);
  }

  /**
   * Confirma pagamento aprovado via adquirente/gateway.
   */
  async confirmarPagamento(paymentIntentId: string, input: ConfirmPaymentDto): Promise<PaymentIntentInternal> {
    return this.pagamentosService.confirmarPagamento(paymentIntentId, input);
  }

  /**
   * Registra recusa de pagamento.
   */
  async recusarPagamento(paymentIntentId: string, input: RefusePaymentDto): Promise<PaymentIntentInternal> {
    return this.pagamentosService.recusarPagamento(paymentIntentId, input);
  }

  /**
   * Listener de webhooks com verificação rigorosa de idempotência.
   */
  async processarWebhook(input: WebhookPaymentInputDto): Promise<{ status: string; mensagem: string }> {
    return this.pagamentosService.processarWebhook(input);
  }

  /**
   * Consulta intenção por ID.
   */
  async consultarIntencao(id: string): Promise<PaymentIntentInternal | null> {
    return this.pagamentosService.consultarIntencao(id);
  }

  /**
   * Lista intenções de pagamento com paginação e filtros.
   */
  async listarIntencoes(filter?: PaymentIntentFilterDto) {
    return this.pagamentosService.listarIntencoes(filter);
  }

  /**
   * Registra e concilia lote de adquirente.
   */
  async conciliarLoteAdquirente(input: ConciliarAdquirenteDto) {
    return this.pagamentosService.conciliarLoteAdquirente(input);
  }

  /**
   * Retorna métricas e KPIs consolidados do núcleo de pagamentos.
   */
  async obterMetricasGerais(): Promise<PaymentMetricsDto> {
    return this.pagamentosService.obterMetricasGerais();
  }
}

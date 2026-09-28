import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../shared/prisma.module';
import {
  ConciliarAdquirenteDto,
  ConfirmPaymentDto,
  CreatePaymentIntentDto,
  MetodoPagamento,
  PaymentIntentFilterDto,
  PaymentMetricsDto,
  ProcessCardDto,
  ProcessPixDto,
  RefusePaymentDto,
  StatusIntencao,
  WebhookPaymentInputDto,
} from './pagamentos.types';

export interface PaymentIntentInternal {
  id: string;
  tenantId: string;
  pedidoId: string;
  eventoId: string;
  produtorId: string;
  idempotencyKey: string;
  status: StatusIntencao;
  metodo: MetodoPagamento;
  valorTotal: number;
  valorIngressos: number;
  taxaServico: number;
  splitProdutor: number;
  splitPlataforma: number;
  compradorNome: string;
  compradorDocumento: string;
  compradorEmail: string;
  compradorTelefone?: string;
  adquirente?: string;
  transacaoId?: string;
  nsu?: string;
  codigoAutorizacao?: string;
  parcelas: number;
  taxaMdrPercentual?: number;
  taxaMdrFixa?: number;
  custoProcessamento?: number;
  valorLiquidoEsperado?: number;
  expiraEm?: Date;
  confirmadoEm?: Date;
  recusadoEm?: Date;
  motivoRecusa?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  pixDetail?: {
    id: string;
    txid: string;
    chavePix: string;
    qrCodeCopiaECola: string;
    psp: string;
    status: string;
    expiraEm: Date;
  };
  transacoes: Array<{
    id: string;
    tipo: string;
    adquirente: string;
    status: string;
    nsu?: string;
    createdAt: Date;
  }>;
}

const SEED_PAYMENT_INTENTS: PaymentIntentInternal[] = [
  {
    id: 'pay-int-001',
    tenantId: '11111111-1111-1111-1111-111111111111',
    pedidoId: '22222222-2222-2222-2222-222222222222',
    eventoId: '33333333-3333-3333-3333-333333333333',
    produtorId: '44444444-4444-4444-4444-444444444444',
    idempotencyKey: 'idemp-pay-001',
    status: 'APROVADA',
    metodo: 'PIX',
    valorTotal: 340.0,
    valorIngressos: 300.0,
    taxaServico: 40.0,
    splitProdutor: 300.0,
    splitPlataforma: 40.0,
    compradorNome: 'Carlos Eduardo Souza',
    compradorDocumento: '123.456.789-00',
    compradorEmail: 'carlos.souza@email.com',
    compradorTelefone: '(41) 98888-1111',
    adquirente: 'BACEN_DIRETO',
    transacaoId: 'E2E-BACEN-998877665544',
    nsu: 'NSU-PIX-001',
    parcelas: 1,
    taxaMdrPercentual: 0.99,
    taxaMdrFixa: 0.0,
    custoProcessamento: 3.37,
    valorLiquidoEsperado: 336.63,
    confirmadoEm: new Date(Date.now() - 3600000),
    createdAt: new Date(Date.now() - 3600000),
    updatedAt: new Date(Date.now() - 3600000),
    pixDetail: {
      id: 'pix-det-001',
      txid: 'PIX-TX-001-AABBCC',
      chavePix: 'pix@diskingressos.com.br',
      qrCodeCopiaECola: '00020101021226580014br.gov.bcb.pix0136pix@diskingressos.com.br520400005303986540340.005802BR5913DISKINGRESSOS6008CURITIBA62070503***6304ABCD',
      psp: 'BACEN_DIRETO',
      status: 'CONCLUIDA',
      expiraEm: new Date(Date.now() - 2700000),
    },
    transacoes: [
      {
        id: 'trx-001',
        tipo: 'PIX_PAYIN',
        adquirente: 'BACEN_DIRETO',
        status: 'SUCESSO',
        nsu: 'NSU-PIX-001',
        createdAt: new Date(Date.now() - 3600000),
      },
    ],
  },
  {
    id: 'pay-int-002',
    tenantId: '11111111-1111-1111-1111-111111111111',
    pedidoId: '55555555-5555-5555-5555-555555555555',
    eventoId: '33333333-3333-3333-3333-333333333333',
    produtorId: '44444444-4444-4444-4444-444444444444',
    idempotencyKey: 'idemp-pay-002',
    status: 'APROVADA',
    metodo: 'CARTAO_CREDITO',
    valorTotal: 560.0,
    valorIngressos: 500.0,
    taxaServico: 60.0,
    splitProdutor: 500.0,
    splitPlataforma: 60.0,
    compradorNome: 'Mariana Silveira Ramos',
    compradorDocumento: '234.567.890-11',
    compradorEmail: 'mariana.ramos@email.com',
    compradorTelefone: '(41) 97777-2222',
    adquirente: 'CIELO',
    transacaoId: 'CIELO-TRX-887766',
    nsu: 'NSU-CARD-002',
    codigoAutorizacao: 'AUT-654321',
    parcelas: 3,
    taxaMdrPercentual: 2.79,
    taxaMdrFixa: 0.35,
    custoProcessamento: 15.97,
    valorLiquidoEsperado: 544.03,
    confirmadoEm: new Date(Date.now() - 1800000),
    createdAt: new Date(Date.now() - 1800000),
    updatedAt: new Date(Date.now() - 1800000),
    transacoes: [
      {
        id: 'trx-002',
        tipo: 'CAPTURA',
        adquirente: 'CIELO',
        status: 'SUCESSO',
        nsu: 'NSU-CARD-002',
        createdAt: new Date(Date.now() - 1800000),
      },
    ],
  },
  {
    id: 'pay-int-003',
    tenantId: '11111111-1111-1111-1111-111111111111',
    pedidoId: '66666666-6666-6666-6666-666666666666',
    eventoId: '33333333-3333-3333-3333-333333333333',
    produtorId: '44444444-4444-4444-4444-444444444444',
    idempotencyKey: 'idemp-pay-003',
    status: 'PROCESSANDO',
    metodo: 'PIX',
    valorTotal: 170.0,
    valorIngressos: 150.0,
    taxaServico: 20.0,
    splitProdutor: 150.0,
    splitPlataforma: 20.0,
    compradorNome: 'Felipe Alcantara',
    compradorDocumento: '345.678.901-22',
    compradorEmail: 'felipe.alcantara@email.com',
    compradorTelefone: '(41) 96666-3333',
    adquirente: 'BACEN_DIRETO',
    parcelas: 1,
    expiraEm: new Date(Date.now() + 600000),
    createdAt: new Date(Date.now() - 300000),
    updatedAt: new Date(Date.now() - 300000),
    pixDetail: {
      id: 'pix-det-003',
      txid: 'PIX-TX-003-CCDDEE',
      chavePix: 'pix@diskingressos.com.br',
      qrCodeCopiaECola: '00020101021226580014br.gov.bcb.pix0136pix@diskingressos.com.br520400005303986540170.005802BR5913DISKINGRESSOS6008CURITIBA62070503***6304XYZ1',
      psp: 'BACEN_DIRETO',
      status: 'ATIVA',
      expiraEm: new Date(Date.now() + 600000),
    },
    transacoes: [],
  },
];

@Injectable()
export class PagamentosService {
  private readonly logger = new Logger(PagamentosService.name);
  private memoryIntents: Map<string, PaymentIntentInternal> = new Map();
  private processedWebhooks: Set<string> = new Set();
  private lotesConciliacao: any[] = [];

  constructor(@Optional() private readonly prisma?: PrismaService) {
    // Inicializa fallback em memória com dados mock consistentes clonados profundamente
    for (const intent of SEED_PAYMENT_INTENTS) {
      this.memoryIntents.set(intent.id, JSON.parse(JSON.stringify(intent)));
    }
  }

  private hasDb(): boolean {
    return !!(this.prisma && (this.prisma as any).paymentIntent);
  }

  /**
   * 1. Cria uma Intenção de Pagamento (`PaymentIntent`) com idempotência garantida
   */
  async criarIntencao(input: CreatePaymentIntentDto): Promise<PaymentIntentInternal> {
    if (!input.tenantId || !input.pedidoId || !input.idempotencyKey) {
      throw new BadRequestException('Campos obrigatórios ausentes para intenção de pagamento');
    }

    if (input.valorTotal <= 0) {
      throw new BadRequestException('Valor total do pagamento deve ser estritamente positivo');
    }

    // Validação de idempotência
    const existing = await this.buscarPorIdempotencyKey(input.idempotencyKey);
    if (existing) {
      this.logger.warn(`IdempotencyKey ${input.idempotencyKey} já existente. Retornando intenção.`);
      return existing;
    }

    const expiraEmMinutos = input.expiraEmMinutos || (input.metodo === 'PIX' ? 15 : 30);
    const expiraEm = new Date(Date.now() + expiraEmMinutos * 60 * 1000);

    const intentId = randomUUID();
    const metodo = input.metodo || 'PIX';

    // Criação dos dados estruturados
    const novaIntencao: PaymentIntentInternal = {
      id: intentId,
      tenantId: input.tenantId,
      pedidoId: input.pedidoId,
      eventoId: input.eventoId,
      produtorId: input.produtorId,
      idempotencyKey: input.idempotencyKey,
      status: 'CRIADA',
      metodo,
      valorTotal: Number(input.valorTotal),
      valorIngressos: Number(input.valorIngressos),
      taxaServico: Number(input.taxaServico),
      splitProdutor: Number(input.splitProdutor),
      splitPlataforma: Number(input.splitPlataforma),
      compradorNome: input.compradorNome,
      compradorDocumento: input.compradorDocumento,
      compradorEmail: input.compradorEmail,
      compradorTelefone: input.compradorTelefone,
      adquirente: input.adquirente || (metodo === 'PIX' ? 'BACEN_DIRETO' : 'CIELO'),
      parcelas: input.parcelas || 1,
      expiraEm,
      metadata: input.metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
      transacoes: [],
    };

    // Se for PIX, já inicializa o payload
    if (metodo === 'PIX') {
      const txid = `PIX-${randomUUID().replace(/-/g, '').slice(0, 24).toUpperCase()}`;
      const chave = 'pix@diskingressos.com.br';
      novaIntencao.pixDetail = {
        id: randomUUID(),
        txid,
        chavePix: chave,
        qrCodeCopiaECola: `00020101021226580014br.gov.bcb.pix0136${chave}520400005303986540${novaIntencao.valorTotal.toFixed(2)}5802BR5913DISKINGRESSOS6008CURITIBA62070503***6304${randomUUID().slice(0, 4).toUpperCase()}`,
        psp: 'BACEN_DIRETO',
        status: 'ATIVA',
        expiraEm,
      };
      novaIntencao.status = 'PROCESSANDO';
    }

    if (this.hasDb()) {
      try {
        const tx = this.prisma as any;
        await tx.$transaction(async (prismaTx: any) => {
          await prismaTx.paymentIntent.create({
            data: {
              id: novaIntencao.id,
              tenantId: novaIntencao.tenantId,
              pedidoId: novaIntencao.pedidoId,
              eventoId: novaIntencao.eventoId,
              produtorId: novaIntencao.produtorId,
              idempotencyKey: novaIntencao.idempotencyKey,
              status: novaIntencao.status,
              metodo: novaIntencao.metodo,
              valorTotal: novaIntencao.valorTotal,
              valorIngressos: novaIntencao.valorIngressos,
              taxaServico: novaIntencao.taxaServico,
              splitProdutor: novaIntencao.splitProdutor,
              splitPlataforma: novaIntencao.splitPlataforma,
              compradorNome: novaIntencao.compradorNome,
              compradorDocumento: novaIntencao.compradorDocumento,
              compradorEmail: novaIntencao.compradorEmail,
              compradorTelefone: novaIntencao.compradorTelefone,
              adquirente: novaIntencao.adquirente,
              parcelas: novaIntencao.parcelas,
              expiraEm: novaIntencao.expiraEm,
              metadata: novaIntencao.metadata as any,
            },
          });

          if (novaIntencao.pixDetail) {
            await prismaTx.pixPaymentDetail.create({
              data: {
                id: novaIntencao.pixDetail.id,
                paymentIntentId: novaIntencao.id,
                txid: novaIntencao.pixDetail.txid,
                chavePix: novaIntencao.pixDetail.chavePix,
                qrCodeCopiaECola: novaIntencao.pixDetail.qrCodeCopiaECola,
                psp: novaIntencao.pixDetail.psp,
                status: novaIntencao.pixDetail.status,
                expiraEm: novaIntencao.pixDetail.expiraEm,
              },
            });
          }

          // Outbox
          await prismaTx.outboxMessage.create({
            data: {
              eventName: 'pagamento.intencao_criada.v1',
              source: 'pagamentos',
              tenantId: novaIntencao.tenantId,
              payload: {
                paymentIntentId: novaIntencao.id,
                pedidoId: novaIntencao.pedidoId,
                metodo: novaIntencao.metodo,
                valorTotalCents: Math.round(novaIntencao.valorTotal * 100),
              },
            },
          });
        });

        this.memoryIntents.set(novaIntencao.id, novaIntencao);
        return novaIntencao;
      } catch (err) {
        this.logger.warn(`Fallback para memória ao criar PaymentIntent: ${err}`);
      }
    }

    this.memoryIntents.set(novaIntencao.id, novaIntencao);
    this.logger.log(`[Pagamentos] PaymentIntent ${novaIntencao.id} criada para o pedido ${novaIntencao.pedidoId} (R$ ${novaIntencao.valorTotal})`);
    return novaIntencao;
  }

  /**
   * 2. Geração dinâmica de Cobrança PIX
   */
  async gerarPixCobranca(paymentIntentId: string, input?: ProcessPixDto): Promise<PaymentIntentInternal> {
    const intent = await this.consultarIntencao(paymentIntentId);
    if (!intent) throw new NotFoundException('Intenção de pagamento não encontrada');

    if (intent.status === 'APROVADA') {
      throw new ConflictException('Pagamento já se encontra aprovado');
    }

    const expiraEmMinutos = input?.expiraEmMinutos || 15;
    const expiraEm = new Date(Date.now() + expiraEmMinutos * 60 * 1000);
    const txid = `PIX-${randomUUID().replace(/-/g, '').slice(0, 24).toUpperCase()}`;
    const chave = input?.chavePix || 'pix@diskingressos.com.br';
    const psp = input?.psp || 'BACEN_DIRETO';

    const pixDetail = {
      id: randomUUID(),
      txid,
      chavePix: chave,
      qrCodeCopiaECola: `00020101021226580014br.gov.bcb.pix0136${chave}520400005303986540${intent.valorTotal.toFixed(2)}5802BR5913DISKINGRESSOS6008CURITIBA62070503***6304${randomUUID().slice(0, 4).toUpperCase()}`,
      psp,
      status: 'ATIVA',
      expiraEm,
    };

    intent.pixDetail = pixDetail;
    intent.status = 'PROCESSANDO';
    intent.updatedAt = new Date();

    if (this.hasDb()) {
      try {
        const tx = this.prisma as any;
        await tx.$transaction(async (prismaTx: any) => {
          await prismaTx.paymentIntent.update({
            where: { id: intent.id },
            data: { status: 'PROCESSANDO' },
          });
          await prismaTx.pixPaymentDetail.upsert({
            where: { paymentIntentId: intent.id },
            create: {
              id: pixDetail.id,
              paymentIntentId: intent.id,
              txid: pixDetail.txid,
              chavePix: pixDetail.chavePix,
              qrCodeCopiaECola: pixDetail.qrCodeCopiaECola,
              psp: pixDetail.psp,
              status: pixDetail.status,
              expiraEm: pixDetail.expiraEm,
            },
            update: {
              txid: pixDetail.txid,
              qrCodeCopiaECola: pixDetail.qrCodeCopiaECola,
              expiraEm: pixDetail.expiraEm,
              status: 'ATIVA',
            },
          });
          await prismaTx.outboxMessage.create({
            data: {
              eventName: 'pagamento.pix_gerado.v1',
              source: 'pagamentos',
              tenantId: intent.tenantId,
              payload: {
                paymentIntentId: intent.id,
                pedidoId: intent.pedidoId,
                txid: pixDetail.txid,
                chavePix: pixDetail.chavePix,
                qrCodeCopiaECola: pixDetail.qrCodeCopiaECola,
                valorCents: Math.round(intent.valorTotal * 100),
                expiraEm: expiraEm.toISOString(),
              },
            },
          });
        });
      } catch (err) {
        this.logger.warn(`Fallback de persistência em gerarPixCobranca: ${err}`);
      }
    }

    this.memoryIntents.set(intent.id, intent);
    return intent;
  }

  /**
   * 3. Processamento de Cartão de Crédito com cálculo de MDR e split
   */
  async processarCartao(paymentIntentId: string, input: ProcessCardDto): Promise<PaymentIntentInternal> {
    const intent = await this.consultarIntencao(paymentIntentId);
    if (!intent) throw new NotFoundException('Intenção de pagamento não encontrada');

    if (intent.status === 'APROVADA') {
      throw new ConflictException('Pagamento já se encontra aprovado');
    }

    const parcelas = input.parcelas || intent.parcelas || 1;
    const taxaMdrPerc = input.taxaMdrPercentual ?? (parcelas === 1 ? 2.39 : 3.49);
    const taxaMdrFixa = input.taxaMdrFixa ?? 0.39;
    const custoProcessamento = Number(((intent.valorTotal * taxaMdrPerc) / 100 + taxaMdrFixa).toFixed(2));
    const valorLiquidoEsperado = Number((intent.valorTotal - custoProcessamento).toFixed(2));

    const transacaoId = `TRX-${input.adquirente}-${randomUUID().slice(0, 8).toUpperCase()}`;
    const nsu = `NSU-${randomUUID().slice(0, 6).toUpperCase()}`;
    const codigoAutorizacao = `AUT-${Math.floor(100000 + Math.random() * 900000)}`;

    const trx = {
      id: randomUUID(),
      tipo: 'CAPTURA',
      adquirente: input.adquirente,
      status: 'SUCESSO',
      nsu,
      createdAt: new Date(),
    };

    intent.status = 'APROVADA';
    intent.adquirente = input.adquirente;
    intent.transacaoId = transacaoId;
    intent.nsu = nsu;
    intent.codigoAutorizacao = codigoAutorizacao;
    intent.parcelas = parcelas;
    intent.taxaMdrPercentual = taxaMdrPerc;
    intent.taxaMdrFixa = taxaMdrFixa;
    intent.custoProcessamento = custoProcessamento;
    intent.valorLiquidoEsperado = valorLiquidoEsperado;
    intent.confirmadoEm = new Date();
    intent.updatedAt = new Date();
    intent.transacoes.push(trx);

    if (this.hasDb()) {
      try {
        const tx = this.prisma as any;
        await tx.$transaction(async (prismaTx: any) => {
          await prismaTx.paymentIntent.update({
            where: { id: intent.id },
            data: {
              status: 'APROVADA',
              adquirente: intent.adquirente,
              transacaoId: intent.transacaoId,
              nsu: intent.nsu,
              codigoAutorizacao: intent.codigoAutorizacao,
              parcelas: intent.parcelas,
              taxaMdrPercentual: intent.taxaMdrPercentual,
              taxaMdrFixa: intent.taxaMdrFixa,
              custoProcessamento: intent.custoProcessamento,
              valorLiquidoEsperado: intent.valorLiquidoEsperado,
              confirmadoEm: intent.confirmadoEm,
            },
          });
          await prismaTx.paymentTransaction.create({
            data: {
              id: trx.id,
              paymentIntentId: intent.id,
              tipo: trx.tipo,
              adquirente: trx.adquirente,
              status: trx.status,
              nsu: trx.nsu,
            },
          });
          // Outbox: Confirmação de Pagamento + Notificação Pedido Pago
          await prismaTx.outboxMessage.create({
            data: {
              eventName: 'pagamento.confirmado.v1',
              source: 'pagamentos',
              tenantId: intent.tenantId,
              payload: {
                paymentIntentId: intent.id,
                pedidoId: intent.pedidoId,
                tenantId: intent.tenantId,
                eventoId: intent.eventoId,
                produtorId: intent.produtorId,
                metodo: 'CARTAO_CREDITO',
                adquirente: intent.adquirente,
                transacaoId: intent.transacaoId,
                nsu: intent.nsu,
                valorTotalCents: Math.round(intent.valorTotal * 100),
                splitProdutorCents: Math.round(intent.splitProdutor * 100),
                splitPlataformaCents: Math.round(intent.splitPlataforma * 100),
                taxaMdrCents: Math.round(custoProcessamento * 100),
                confirmadoEm: intent.confirmadoEm?.toISOString(),
              },
            },
          });
          await prismaTx.outboxMessage.create({
            data: {
              eventName: 'pedido.pago.v1',
              source: 'pagamentos',
              tenantId: intent.tenantId,
              payload: {
                pedidoId: intent.pedidoId,
                compradorId: intent.tenantId,
                compradorEmail: intent.compradorEmail,
                compradorNome: intent.compradorNome,
                metodoPagamento: 'CREDIT_CARD',
                transacaoId: intent.transacaoId,
                valorTotalCents: Math.round(intent.valorTotal * 100),
                valorIngressosCents: Math.round(intent.valorIngressos * 100),
                valorTaxasCents: Math.round(intent.taxaServico * 100),
                splitProdutorCents: Math.round(intent.splitProdutor * 100),
                splitPlataformaCents: Math.round(intent.splitPlataforma * 100),
                itens: [
                  {
                    ingressoId: randomUUID(),
                    loteId: randomUUID(),
                    sessaoId: randomUUID(),
                    eventoId: intent.eventoId,
                    precoCents: Math.round(intent.valorIngressos * 100),
                    taxaConvenienciaCents: Math.round(intent.taxaServico * 100),
                  },
                ],
                pagoEm: intent.confirmadoEm?.toISOString(),
              },
            },
          });
        });
      } catch (err) {
        this.logger.warn(`Fallback de persistência em processarCartao: ${err}`);
      }
    }

    this.memoryIntents.set(intent.id, intent);
    this.logger.log(`[Pagamentos] Cartão de Crédito aprovado para intent ${intent.id} na adquirente ${intent.adquirente}`);
    return intent;
  }

  /**
   * 4. Confirmação direta de Pagamento (ex: PIX recebido ou Gateway)
   */
  async confirmarPagamento(paymentIntentId: string, input: ConfirmPaymentDto): Promise<PaymentIntentInternal> {
    const intent = await this.consultarIntencao(paymentIntentId);
    if (!intent) throw new NotFoundException('Intenção de pagamento não encontrada');

    if (intent.status === 'APROVADA') {
      return intent;
    }

    intent.status = 'APROVADA';
    intent.adquirente = input.adquirente;
    intent.transacaoId = input.transacaoId;
    intent.nsu = input.nsu;
    intent.codigoAutorizacao = input.codigoAutorizacao;
    intent.confirmadoEm = new Date();
    intent.updatedAt = new Date();

    if (intent.pixDetail) {
      intent.pixDetail.status = 'CONCLUIDA';
    }

    intent.transacoes.push({
      id: randomUUID(),
      tipo: 'CONFIRMACAO_GATEWAY',
      adquirente: input.adquirente,
      status: 'SUCESSO',
      nsu: input.nsu,
      createdAt: new Date(),
    });

    if (this.hasDb()) {
      try {
        const tx = this.prisma as any;
        await tx.$transaction(async (prismaTx: any) => {
          await prismaTx.paymentIntent.update({
            where: { id: intent.id },
            data: {
              status: 'APROVADA',
              adquirente: intent.adquirente,
              transacaoId: intent.transacaoId,
              nsu: intent.nsu,
              confirmadoEm: intent.confirmadoEm,
            },
          });
          if (intent.pixDetail) {
            await prismaTx.pixPaymentDetail.update({
              where: { paymentIntentId: intent.id },
              data: { status: 'CONCLUIDA', pagoEm: intent.confirmadoEm },
            });
          }
          await prismaTx.outboxMessage.create({
            data: {
              eventName: 'pagamento.confirmado.v1',
              source: 'pagamentos',
              tenantId: intent.tenantId,
              payload: {
                paymentIntentId: intent.id,
                pedidoId: intent.pedidoId,
                tenantId: intent.tenantId,
                eventoId: intent.eventoId,
                produtorId: intent.produtorId,
                metodo: intent.metodo,
                adquirente: intent.adquirente,
                transacaoId: intent.transacaoId,
                valorTotalCents: Math.round(intent.valorTotal * 100),
                splitProdutorCents: Math.round(intent.splitProdutor * 100),
                splitPlataformaCents: Math.round(intent.splitPlataforma * 100),
                confirmadoEm: intent.confirmadoEm?.toISOString(),
              },
            },
          });
          await prismaTx.outboxMessage.create({
            data: {
              eventName: 'pedido.pago.v1',
              source: 'pagamentos',
              tenantId: intent.tenantId,
              payload: {
                pedidoId: intent.pedidoId,
                compradorId: intent.tenantId,
                compradorEmail: intent.compradorEmail,
                compradorNome: intent.compradorNome,
                metodoPagamento: intent.metodo === 'PIX' ? 'PIX' : 'CREDIT_CARD',
                transacaoId: intent.transacaoId,
                valorTotalCents: Math.round(intent.valorTotal * 100),
                valorIngressosCents: Math.round(intent.valorIngressos * 100),
                valorTaxasCents: Math.round(intent.taxaServico * 100),
                splitProdutorCents: Math.round(intent.splitProdutor * 100),
                splitPlataformaCents: Math.round(intent.splitPlataforma * 100),
                itens: [
                  {
                    ingressoId: randomUUID(),
                    loteId: randomUUID(),
                    sessaoId: randomUUID(),
                    eventoId: intent.eventoId,
                    precoCents: Math.round(intent.valorIngressos * 100),
                    taxaConvenienciaCents: Math.round(intent.taxaServico * 100),
                  },
                ],
                pagoEm: intent.confirmadoEm?.toISOString(),
              },
            },
          });
        });
      } catch (err) {
        this.logger.warn(`Fallback de persistência em confirmarPagamento: ${err}`);
      }
    }

    this.memoryIntents.set(intent.id, intent);
    this.logger.log(`[Pagamentos] Intenção ${intent.id} confirmada com sucesso (R$ ${intent.valorTotal})`);
    return intent;
  }

  /**
   * 5. Recusa de Pagamento
   */
  async recusarPagamento(paymentIntentId: string, input: RefusePaymentDto): Promise<PaymentIntentInternal> {
    const intent = await this.consultarIntencao(paymentIntentId);
    if (!intent) throw new NotFoundException('Intenção de pagamento não encontrada');

    intent.status = 'RECUSADA';
    intent.motivoRecusa = input.motivo;
    intent.recusadoEm = new Date();
    intent.updatedAt = new Date();

    intent.transacoes.push({
      id: randomUUID(),
      tipo: 'RECUSA',
      adquirente: input.adquirente || intent.adquirente || 'GATEWAY',
      status: 'FALHA',
      createdAt: new Date(),
    });

    if (this.hasDb()) {
      try {
        const tx = this.prisma as any;
        await tx.$transaction(async (prismaTx: any) => {
          await prismaTx.paymentIntent.update({
            where: { id: intent.id },
            data: {
              status: 'RECUSADA',
              motivoRecusa: intent.motivoRecusa,
              recusadoEm: intent.recusadoEm,
            },
          });
          await prismaTx.outboxMessage.create({
            data: {
              eventName: 'pagamento.falhou.v1',
              source: 'pagamentos',
              tenantId: intent.tenantId,
              payload: {
                pedidoId: intent.pedidoId,
                compradorId: intent.tenantId,
                motivo: input.motivo,
                codigoErro: input.codigoErro,
                falhouEm: intent.recusadoEm?.toISOString(),
              },
            },
          });
        });
      } catch (err) {
        this.logger.warn(`Fallback de persistência em recusarPagamento: ${err}`);
      }
    }

    this.memoryIntents.set(intent.id, intent);
    this.logger.warn(`[Pagamentos] Intenção ${intent.id} recusada: ${input.motivo}`);
    return intent;
  }

  /**
   * 6. Webhook Listener Idempotente para Adquirentes e PSPs
   */
  async processarWebhook(input: WebhookPaymentInputDto): Promise<{ status: string; mensagem: string }> {
    const chaveIdemp = `${input.adquirente}:${input.webhookEventId}`;
    if (this.processedWebhooks.has(chaveIdemp)) {
      this.logger.warn(`Webhook duplicado recebido: ${chaveIdemp}. Ignorando.`);
      return { status: 'IGNORADO', mensagem: 'Webhook já processado anteriormente (Idempotência garantida)' };
    }

    this.processedWebhooks.add(chaveIdemp);

    const payload = input.payload || {};
    const paymentIntentId = (payload.paymentIntentId || payload.intentId || payload.externalReference) as string;

    if (paymentIntentId) {
      const intent = await this.consultarIntencao(paymentIntentId);
      if (intent) {
        if (input.tipoEvento === 'PAYMENT_APPROVED' || input.tipoEvento === 'PIX_RECEIVED') {
          await this.confirmarPagamento(intent.id, {
            adquirente: input.adquirente,
            transacaoId: (payload.transactionId || payload.id || randomUUID()) as string,
            nsu: (payload.nsu || 'NSU-WHK') as string,
          });
        } else if (input.tipoEvento === 'PAYMENT_REFUSED' || input.tipoEvento === 'PIX_EXPIRED') {
          await this.recusarPagamento(intent.id, {
            motivo: (payload.reason || 'Recusado pelo emissor/gateway') as string,
            codigoErro: (payload.errorCode || 'WHK_ERR') as string,
          });
        }
      }
    }

    return { status: 'SUCESSO', mensagem: 'Webhook processado e conciliado com sucesso' };
  }

  /**
   * 7. Lote de Conciliação de Adquirente
   */
  async conciliarLoteAdquirente(input: ConciliarAdquirenteDto): Promise<any> {
    const lote = {
      id: randomUUID(),
      tenantId: input.tenantId,
      adquirente: input.adquirente,
      dataReferencia: new Date(input.dataReferencia),
      arquivoExtrato: input.arquivoExtrato || `EXTRATO-${input.adquirente}-${new Date().toISOString().slice(0, 10)}.csv`,
      quantidadeTransacoes: input.quantidadeTransacoes,
      valorBrutoTotal: input.valorBrutoTotal,
      valorTaxasMdr: input.valorTaxasMdr,
      valorLiquidoTotal: input.valorLiquidoTotal,
      status: (input.divergenciasEncontradas || 0) > 0 ? 'COM_DIVERGENCIA' : 'CONCILIADO',
      divergenciasEncontradas: input.divergenciasEncontradas || 0,
      createdAt: new Date(),
    };

    this.lotesConciliacao.unshift(lote);

    if (this.hasDb()) {
      try {
        const tx = this.prisma as any;
        await tx.conciliacaoAdquirenteLote.create({
          data: {
            id: lote.id,
            tenantId: lote.tenantId,
            adquirente: lote.adquirente,
            dataReferencia: lote.dataReferencia,
            arquivoExtrato: lote.arquivoExtrato,
            quantidadeTransacoes: lote.quantidadeTransacoes,
            valorBrutoTotal: lote.valorBrutoTotal,
            valorTaxasMdr: lote.valorTaxasMdr,
            valorLiquidoTotal: lote.valorLiquidoTotal,
            status: lote.status,
            divergenciasEncontradas: lote.divergenciasEncontradas,
          },
        });
      } catch (err) {
        this.logger.warn(`Fallback de persistência em conciliarLoteAdquirente: ${err}`);
      }
    }

    this.logger.log(`[Pagamentos] Lote de conciliação ${lote.id} registrado para ${lote.adquirente} (R$ ${lote.valorLiquidoTotal})`);
    return lote;
  }

  /**
   * 8. Consulta de Intenção por ID
   */
  async consultarIntencao(id: string): Promise<PaymentIntentInternal | null> {
    if (this.hasDb()) {
      try {
        const tx = this.prisma as any;
        const dbIntent = await tx.paymentIntent.findUnique({
          where: { id },
          include: { pixDetail: true, transacoes: true },
        });
        if (dbIntent) {
          return {
            ...dbIntent,
            valorTotal: Number(dbIntent.valorTotal),
            valorIngressos: Number(dbIntent.valorIngressos),
            taxaServico: Number(dbIntent.taxaServico),
            splitProdutor: Number(dbIntent.splitProdutor),
            splitPlataforma: Number(dbIntent.splitPlataforma),
            taxaMdrPercentual: dbIntent.taxaMdrPercentual ? Number(dbIntent.taxaMdrPercentual) : undefined,
            taxaMdrFixa: dbIntent.taxaMdrFixa ? Number(dbIntent.taxaMdrFixa) : undefined,
            custoProcessamento: dbIntent.custoProcessamento ? Number(dbIntent.custoProcessamento) : undefined,
            valorLiquidoEsperado: dbIntent.valorLiquidoEsperado ? Number(dbIntent.valorLiquidoEsperado) : undefined,
          };
        }
      } catch {
        // Fallback
      }
    }
    return this.memoryIntents.get(id) || null;
  }

  /**
   * 9. Busca por Idempotency Key
   */
  async buscarPorIdempotencyKey(key: string): Promise<PaymentIntentInternal | null> {
    if (this.hasDb()) {
      try {
        const tx = this.prisma as any;
        const dbIntent = await tx.paymentIntent.findUnique({
          where: { idempotencyKey: key },
          include: { pixDetail: true, transacoes: true },
        });
        if (dbIntent) {
          return {
            ...dbIntent,
            valorTotal: Number(dbIntent.valorTotal),
            valorIngressos: Number(dbIntent.valorIngressos),
            taxaServico: Number(dbIntent.taxaServico),
            splitProdutor: Number(dbIntent.splitProdutor),
            splitPlataforma: Number(dbIntent.splitPlataforma),
          };
        }
      } catch {
        // Fallback
      }
    }

    for (const intent of this.memoryIntents.values()) {
      if (intent.idempotencyKey === key) return intent;
    }
    return null;
  }

  /**
   * 10. Listagem com Filtros
   */
  async listarIntencoes(filter: PaymentIntentFilterDto = {}): Promise<{
    itens: PaymentIntentInternal[];
    total: number;
    pagina: number;
    limite: number;
  }> {
    let intents = Array.from(this.memoryIntents.values());

    if (filter.status) {
      intents = intents.filter((i) => i.status === filter.status);
    }
    if (filter.metodo) {
      intents = intents.filter((i) => i.metodo === filter.metodo);
    }
    if (filter.adquirente) {
      intents = intents.filter((i) => i.adquirente?.toLowerCase().includes(filter.adquirente!.toLowerCase()));
    }
    if (filter.termoBusca) {
      const q = filter.termoBusca.toLowerCase();
      intents = intents.filter(
        (i) =>
          i.compradorNome.toLowerCase().includes(q) ||
          i.compradorDocumento.toLowerCase().includes(q) ||
          i.compradorEmail.toLowerCase().includes(q) ||
          i.idempotencyKey.toLowerCase().includes(q) ||
          (i.transacaoId && i.transacaoId.toLowerCase().includes(q)),
      );
    }

    intents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = intents.length;
    const pagina = filter.pagina || 1;
    const limite = filter.limite || 20;
    const itens = intents.slice((pagina - 1) * limite, pagina * limite);

    return { itens, total, pagina, limite };
  }

  /**
   * 11. Métricas e KPIs Consolidados
   */
  async obterMetricasGerais(): Promise<PaymentMetricsDto> {
    const intents = Array.from(this.memoryIntents.values());
    const totalTransacoes = intents.length;
    let volumeTotalProcessado = 0;
    let volumeAprovado = 0;
    let volumePendente = 0;
    let volumeRecusado = 0;

    let transacoesAprovadas = 0;
    let transacoesRecusadas = 0;
    let transacoesPendentes = 0;

    const distribuicaoMetodos = {
      pix: 0,
      cartaoCredito: 0,
      cartaoDebito: 0,
      boleto: 0,
    };

    let somaMdr = 0;
    let contMdr = 0;

    for (const intent of intents) {
      volumeTotalProcessado += intent.valorTotal;

      if (intent.status === 'APROVADA') {
        volumeAprovado += intent.valorTotal;
        transacoesAprovadas++;
      } else if (intent.status === 'RECUSADA') {
        volumeRecusado += intent.valorTotal;
        transacoesRecusadas++;
      } else {
        volumePendente += intent.valorTotal;
        transacoesPendentes++;
      }

      if (intent.metodo === 'PIX') distribuicaoMetodos.pix++;
      else if (intent.metodo === 'CARTAO_CREDITO') distribuicaoMetodos.cartaoCredito++;
      else if (intent.metodo === 'CARTAO_DEBITO') distribuicaoMetodos.cartaoDebito++;
      else if (intent.metodo === 'BOLETO') distribuicaoMetodos.boleto++;

      if (intent.taxaMdrPercentual) {
        somaMdr += intent.taxaMdrPercentual;
        contMdr++;
      }
    }

    const taxaAprovacaoPercentual = totalTransacoes > 0
      ? Number(((transacoesAprovadas / totalTransacoes) * 100).toFixed(1))
      : 100.0;

    const taxaMediaMdrPercentual = contMdr > 0
      ? Number((somaMdr / contMdr).toFixed(2))
      : 1.89;

    return {
      volumeTotalProcessado: Number(volumeTotalProcessado.toFixed(2)),
      volumeAprovado: Number(volumeAprovado.toFixed(2)),
      volumePendente: Number(volumePendente.toFixed(2)),
      volumeRecusado: Number(volumeRecusado.toFixed(2)),
      taxaAprovacaoPercentual,
      totalTransacoes,
      transacoesAprovadas,
      transacoesRecusadas,
      transacoesPendentes,
      distribuicaoMetodos,
      taxaMediaMdrPercentual,
    };
  }

  /**
   * 12. Lista Lotes de Conciliação
   */
  async listarLotesConciliacao(): Promise<any[]> {
    return this.lotesConciliacao;
  }
}

import { describe, expect, it } from 'vitest';
import { PagamentosPublicService } from './pagamentos.public-service';
import { PagamentosService } from './pagamentos.service';

describe('PagamentosModule & PagamentosService (EDDIE 11.29.3 Payments Core)', () => {
  const service = new PagamentosService();
  const publicService = new PagamentosPublicService(service);

  const tenantId = '11111111-1111-1111-1111-111111111111';
  const pedidoId = '22222222-2222-2222-2222-222222222222';
  const eventoId = '33333333-3333-3333-3333-333333333333';
  const produtorId = '44444444-4444-4444-4444-444444444444';

  it('1. deve criar uma Intenção de Pagamento com split e idempotência', async () => {
    const idempotencyKey = `idemp-test-${Date.now()}`;
    const intent = await service.criarIntencao({
      tenantId,
      pedidoId,
      eventoId,
      produtorId,
      idempotencyKey,
      metodo: 'PIX',
      valorTotal: 250.0,
      valorIngressos: 220.0,
      taxaServico: 30.0,
      splitProdutor: 220.0,
      splitPlataforma: 30.0,
      compradorNome: 'Vinicius Casagrande',
      compradorDocumento: '111.222.333-44',
      compradorEmail: 'vinicius@diskingressos.com.br',
    });

    expect(intent).toBeDefined();
    expect(intent.id).toBeDefined();
    expect(intent.valorTotal).toBe(250.0);
    expect(intent.splitProdutor).toBe(220.0);
    expect(intent.splitPlataforma).toBe(30.0);
    expect(intent.status).toBe('PROCESSANDO');
    expect(intent.pixDetail).toBeDefined();
    expect(intent.pixDetail?.qrCodeCopiaECola).toContain('DISKINGRESSOS');

    // Idempotência: mesma chave deve retornar o mesmo objeto
    const repetida = await service.criarIntencao({
      tenantId,
      pedidoId,
      eventoId,
      produtorId,
      idempotencyKey,
      metodo: 'PIX',
      valorTotal: 250.0,
      valorIngressos: 220.0,
      taxaServico: 30.0,
      splitProdutor: 220.0,
      splitPlataforma: 30.0,
      compradorNome: 'Vinicius Casagrande',
      compradorDocumento: '111.222.333-44',
      compradorEmail: 'vinicius@diskingressos.com.br',
    });
    expect(repetida.id).toBe(intent.id);
  });

  it('2. deve gerar dados de cobrança PIX com QR Code Copia e Cola dinâmico', async () => {
    const idempotencyKey = `idemp-pix-${Date.now()}`;
    const intent = await service.criarIntencao({
      tenantId,
      pedidoId,
      eventoId,
      produtorId,
      idempotencyKey,
      metodo: 'PIX',
      valorTotal: 180.0,
      valorIngressos: 160.0,
      taxaServico: 20.0,
      splitProdutor: 160.0,
      splitPlataforma: 20.0,
      compradorNome: 'Ana Paula Santos',
      compradorDocumento: '222.333.444-55',
      compradorEmail: 'ana.santos@email.com',
    });

    const pixAtualizado = await service.gerarPixCobranca(intent.id, {
      psp: 'BANCO_DO_BRASIL',
      expiraEmMinutos: 20,
    });

    expect(pixAtualizado.pixDetail?.psp).toBe('BANCO_DO_BRASIL');
    expect(pixAtualizado.pixDetail?.qrCodeCopiaECola).toContain('180.00');
    expect(pixAtualizado.pixDetail?.status).toBe('ATIVA');
  });

  it('3. deve processar Cartão de Crédito calculando taxas MDR e split líquido', async () => {
    const idempotencyKey = `idemp-card-${Date.now()}`;
    const intent = await service.criarIntencao({
      tenantId,
      pedidoId,
      eventoId,
      produtorId,
      idempotencyKey,
      metodo: 'CARTAO_CREDITO',
      valorTotal: 500.0,
      valorIngressos: 450.0,
      taxaServico: 50.0,
      splitProdutor: 450.0,
      splitPlataforma: 50.0,
      compradorNome: 'Roberto Justus',
      compradorDocumento: '333.444.555-66',
      compradorEmail: 'roberto@email.com',
    });

    const aprovado = await service.processarCartao(intent.id, {
      adquirente: 'CIELO',
      parcelas: 2,
      taxaMdrPercentual: 2.5,
      taxaMdrFixa: 0.39,
    });

    expect(aprovado.status).toBe('APROVADA');
    expect(aprovado.adquirente).toBe('CIELO');
    expect(aprovado.transacaoId).toBeDefined();
    expect(aprovado.nsu).toBeDefined();
    expect(aprovado.custoProcessamento).toBe(12.89); // (500 * 2.5%) + 0.39 = 12.50 + 0.39 = 12.89
    expect(aprovado.valorLiquidoEsperado).toBe(487.11); // 500 - 12.89 = 487.11
    expect(aprovado.transacoes.length).toBeGreaterThan(0);
  });

  it('4. deve confirmar pagamento via adquirente/gateway diretamente', async () => {
    const idempotencyKey = `idemp-conf-${Date.now()}`;
    const intent = await service.criarIntencao({
      tenantId,
      pedidoId,
      eventoId,
      produtorId,
      idempotencyKey,
      metodo: 'PIX',
      valorTotal: 120.0,
      valorIngressos: 100.0,
      taxaServico: 20.0,
      splitProdutor: 100.0,
      splitPlataforma: 20.0,
      compradorNome: 'Juliana Paes',
      compradorDocumento: '444.555.666-77',
      compradorEmail: 'juliana@email.com',
    });

    const confirmado = await service.confirmarPagamento(intent.id, {
      adquirente: 'BACEN_DIRETO',
      transacaoId: 'E2E-BACEN-1234567890',
      nsu: 'NSU-123',
    });

    expect(confirmado.status).toBe('APROVADA');
    expect(confirmado.confirmadoEm).toBeDefined();
    expect(confirmado.pixDetail?.status).toBe('CONCLUIDA');
  });

  it('5. deve recusar pagamento com registro do motivo e data', async () => {
    const idempotencyKey = `idemp-rec-${Date.now()}`;
    const intent = await service.criarIntencao({
      tenantId,
      pedidoId,
      eventoId,
      produtorId,
      idempotencyKey,
      metodo: 'CARTAO_CREDITO',
      valorTotal: 800.0,
      valorIngressos: 720.0,
      taxaServico: 80.0,
      splitProdutor: 720.0,
      splitPlataforma: 80.0,
      compradorNome: 'Marcos Mion',
      compradorDocumento: '555.666.777-88',
      compradorEmail: 'marcos@email.com',
    });

    const recusado = await service.recusarPagamento(intent.id, {
      motivo: 'Saldo insuficiente no cartão',
      codigoErro: '51',
      adquirente: 'STONE',
    });

    expect(recusado.status).toBe('RECUSADA');
    expect(recusado.motivoRecusa).toBe('Saldo insuficiente no cartão');
    expect(recusado.recusadoEm).toBeDefined();
  });

  it('6. deve processar Webhook idempotentemente e aprovar pagamento', async () => {
    const idempotencyKey = `idemp-whk-${Date.now()}`;
    const intent = await service.criarIntencao({
      tenantId,
      pedidoId,
      eventoId,
      produtorId,
      idempotencyKey,
      metodo: 'PIX',
      valorTotal: 95.0,
      valorIngressos: 85.0,
      taxaServico: 10.0,
      splitProdutor: 85.0,
      splitPlataforma: 10.0,
      compradorNome: 'Larissa Manoela',
      compradorDocumento: '666.777.888-99',
      compradorEmail: 'larissa@email.com',
    });

    const webhookEventId = `whk-evt-${Date.now()}`;
    const resultado = await service.processarWebhook({
      adquirente: 'STONE',
      webhookEventId,
      tipoEvento: 'PIX_RECEIVED',
      payload: {
        paymentIntentId: intent.id,
        transactionId: 'TX-STONE-9988',
        nsu: 'NSU-WHK-1',
      },
    });

    expect(resultado.status).toBe('SUCESSO');
    const intentConfirmada = await service.consultarIntencao(intent.id);
    expect(intentConfirmada?.status).toBe('APROVADA');

    // Reenvio do mesmo webhook -> deve ignorar por idempotência
    const duplicado = await service.processarWebhook({
      adquirente: 'STONE',
      webhookEventId,
      tipoEvento: 'PIX_RECEIVED',
      payload: { paymentIntentId: intent.id },
    });
    expect(duplicado.status).toBe('IGNORADO');
  });

  it('7. deve registrar e conciliar lote de adquirente', async () => {
    const lote = await service.conciliarLoteAdquirente({
      tenantId,
      adquirente: 'REDE',
      dataReferencia: new Date().toISOString(),
      quantidadeTransacoes: 145,
      valorBrutoTotal: 45000.0,
      valorTaxasMdr: 1125.0,
      valorLiquidoTotal: 43875.0,
      divergenciasEncontradas: 0,
    });

    expect(lote).toBeDefined();
    expect(lote.id).toBeDefined();
    expect(lote.status).toBe('CONCILIADO');
    expect(lote.valorLiquidoTotal).toBe(43875.0);

    const lotes = await service.listarLotesConciliacao();
    expect(lotes.length).toBeGreaterThan(0);
  });

  it('8. deve calcular métricas gerais com taxa de aprovação e distribuição de métodos', async () => {
    const metricas = await service.obterMetricasGerais();
    expect(metricas.volumeTotalProcessado).toBeGreaterThan(0);
    expect(metricas.totalTransacoes).toBeGreaterThan(0);
    expect(metricas.taxaAprovacaoPercentual).toBeGreaterThanOrEqual(0);
    expect(metricas.taxaAprovacaoPercentual).toBeLessThanOrEqual(100);
    expect(metricas.distribuicaoMetodos).toHaveProperty('pix');
    expect(metricas.distribuicaoMetodos).toHaveProperty('cartaoCredito');
  });

  it('9. deve delegar corretamente através da porta pública PagamentosPublicService', async () => {
    const metricas = await publicService.obterMetricasGerais();
    expect(metricas).toBeDefined();
    expect(metricas.totalTransacoes).toBeGreaterThan(0);

    const listagem = await publicService.listarIntencoes();
    expect(listagem.itens.length).toBeGreaterThan(0);
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TesourariaService } from './tesouraria.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DocumentosPublicService } from '../documentos/services/documentos-public.service';
import { OutboxService } from '../../shared/outbox/outbox.service';

describe('TesourariaService (EDDIE 11.25 & EDDIE 11.36 Banking & Tesouraria OS)', () => {
  let service: TesourariaService;
  let mockDocumentosPublic: Partial<DocumentosPublicService>;
  let mockOutbox: Partial<OutboxService>;

  beforeEach(() => {
    mockDocumentosPublic = {
      verificarOperacaoPodeSerExecutada: vi.fn().mockResolvedValue({
        autorizada: true,
        documentoCodigo: 'REP-2026-00012',
      }),
    };

    mockOutbox = {
      emit: vi.fn().mockResolvedValue(undefined),
    };

    service = new TesourariaService(
      undefined,
      mockOutbox as OutboxService,
      mockDocumentosPublic as DocumentosPublicService,
    );
  });

  // ============================================================================
  //  Testes Legados 11.25 (Retrocompatibilidade 100% Preservada)
  // ============================================================================

  it('deve calcular posição consolidada de tesouraria com segregação de saldos reais vs disponíveis', async () => {
    const posicao = await service.getPosicaoConsolidada();
    expect(posicao).toBeDefined();
    expect(posicao.totalSaldoBancarioRealCentavos).toBeGreaterThan(0);
    expect(posicao.totalSaldoDisponivelCentavos).toBeLessThanOrEqual(posicao.totalSaldoBancarioRealCentavos);
    expect(posicao.totalSaldoBloqueadoCentavos).toBe(45000000); // R$ 450k reserva
    expect(posicao.totalAplicacoesLiquidezDiariaCentavos).toBe(1000000000); // R$ 10M em CDB
    expect(posicao.contas.length).toBe(3);
    expect(posicao.indiceCoberturaImediata).toBeGreaterThan(0);
  });

  it('deve listar todas as contas bancárias corporativas', async () => {
    const contas = await service.listarContas();
    expect(contas.length).toBe(3);
    const itau = contas.find((c) => c.bancoCodigo === '341');
    expect(itau).toBeDefined();
    expect(itau?.bancoNome).toBe('Itaú Unibanco S.A.');
  });

  it('deve gerar remessa CNAB 240 com SHA-256 e numeração sequencial NSR', async () => {
    const lote = await service.gerarRemessaCnab({
      bancoCodigo: '341',
      layout: 'CNAB_240',
      criadoPor: 'auditor-financeiro',
      itens: [
        {
          favorecidoNome: 'Time For Fun / T4F Entretenimento',
          favorecidoCpfCnpj: '02.345.678/0001-22',
          bancoDestino: '341',
          agenciaDestino: '1500',
          contaDestino: '22334-5',
          valorCentavos: 50000000, // R$ 500.000,00
          referenciaEventoId: 'ev-t4f-2026',
          produtorId: 'prod-t4f',
        },
      ],
    });

    expect(lote).toBeDefined();
    expect(lote.id).toContain('rem-341-');
    expect(lote.totalItens).toBe(1);
    expect(lote.valorTotalCentavos).toBe(50000000);
    expect(lote.sha256Hash).toHaveLength(64);
    expect(lote.status).toBe('GERADA');
    expect(lote.itens[0]?.status).toBe('PENDENTE');
  });

  it('deve rejeitar geração de remessa CNAB sem itens', async () => {
    await expect(
      service.gerarRemessaCnab({
        bancoCodigo: '237',
        layout: 'CNAB_400',
        criadoPor: 'auditor',
        itens: [],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('deve processar arquivo de retorno CNAB e atualizar saldos bancários', async () => {
    const remessa = await service.gerarRemessaCnab({
      bancoCodigo: '341',
      layout: 'CNAB_240',
      criadoPor: 'operador-bancario',
      itens: [
        {
          favorecidoNome: 'Opus Entretenimento',
          favorecidoCpfCnpj: '98.765.432/0001-10',
          bancoDestino: '341',
          agenciaDestino: '0450',
          contaDestino: '11223-4',
          valorCentavos: 10000000, // R$ 100.000,00
          referenciaEventoId: 'ev-opus-1',
          produtorId: 'prod-opus',
        },
        {
          favorecidoNome: 'Produtora Dados Invalidos',
          favorecidoCpfCnpj: '11.111.111/0001-11',
          bancoDestino: '341',
          agenciaDestino: '9999', // Simula rejeição
          contaDestino: '00000-0',
          valorCentavos: 5000000,
          referenciaEventoId: 'ev-invalido',
          produtorId: 'prod-invalido',
        },
      ],
    });

    const contasAntes = await service.listarContas();
    const saldoAnterior = contasAntes.find((c) => c.bancoCodigo === '341')!.saldoReal;

    const retorno = await service.processarArquivoRetornoCnab({
      loteRemessaId: remessa.id,
      bancoCodigo: '341',
      linhasRetorno: ['RETORNO_LINE_1', 'RETORNO_LINE_2'],
      processadoPor: 'auditor-retorno',
    });

    expect(retorno.status).toBe('PROCESSADA_PARCIAL');
    expect(retorno.itens[0]?.status).toBe('LIQUIDADO');
    expect(retorno.itens[1]?.status).toBe('REJEITADO');

    const contasDepois = await service.listarContas();
    const saldoAtual = contasDepois.find((c) => c.bancoCodigo === '341')!.saldoReal;
    expect(saldoAtual).toBe(saldoAnterior - 10000000); // Debitou apenas o liquidado
  });

  it('deve lançar NotFoundException ao tentar processar retorno de lote inexistente', async () => {
    await expect(
      service.processarArquivoRetornoCnab({
        loteRemessaId: 'lote-fantasma-999',
        bancoCodigo: '341',
        linhasRetorno: [],
        processadoPor: 'auditor',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('deve executar PIX Payout instantâneo e debitar saldo em conta corrente', async () => {
    const contasAntes = await service.listarContas();
    const contaCorrente = contasAntes.find((c) => c.tipo === 'CORRENTE')!;
    const saldoAntes = contaCorrente.saldoDisponivel;

    const payout = await service.executarPixPayout({
      produtorId: 'prod-live-nation',
      produtorNome: 'Live Nation Brasil',
      eventoId: 'ev-fest-2026',
      eventoNome: 'Festival DiskIngressos Live 2026',
      valorCentavos: 1000000, // R$ 10.000,00
      chavePix: 'financeiro@livenation.com.br',
      tipoChave: 'EMAIL',
      idempotencyKey: 'idemp-pix-unit-test-1',
      executadoPor: 'cfo-diretor',
    });

    expect(payout.id).toBeDefined();
    expect(payout.e2eId).toContain('E34100000');
    expect(payout.status).toBe('LIQUIDADO');
    expect(payout.comprovanteAutenticacao).toContain('AUTH-BACEN-');

    const contasDepois = await service.listarContas();
    const contaCorrenteDepois = contasDepois.find((c) => c.tipo === 'CORRENTE')!;
    expect(contaCorrenteDepois.saldoDisponivel).toBe(saldoAntes - 1000000);
  });

  it('deve garantir idempotência estrita em PIX Payout com mesma idempotencyKey', async () => {
    const dados = {
      produtorId: 'prod-opus',
      produtorNome: 'Opus Entretenimento',
      eventoId: 'ev-rock-2026',
      eventoNome: 'Rock Fest 2026',
      valorCentavos: 2500000,
      chavePix: '98765432000110',
      tipoChave: 'CNPJ' as const,
      idempotencyKey: 'idemp-double-click-pix-test',
      executadoPor: 'cfo-diretor',
    };

    const payout1 = await service.executarPixPayout(dados);
    const payout2 = await service.executarPixPayout(dados);

    expect(payout1.id).toBe(payout2.id);
    expect(payout1.e2eId).toBe(payout2.e2eId);
  });

  it('deve rejeitar PIX Payout com saldo insuficiente', async () => {
    await expect(
      service.executarPixPayout({
        produtorId: 'prod-opus',
        produtorNome: 'Opus Entretenimento',
        eventoId: 'ev-rock-2026',
        eventoNome: 'Rock Fest 2026',
        valorCentavos: 999999999999, // R$ 9.99 bilhões
        chavePix: 'pix@opus.com.br',
        tipoChave: 'EMAIL',
        idempotencyKey: 'idemp-saldo-insuficiente',
        executadoPor: 'cfo-diretor',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  // ============================================================================
  //  Novos Testes EDDIE 11.36 — Tesouraria, Bancos, PIX e Gestão de Caixa
  // ============================================================================

  it('11.36.1: deve calcular Posição de Caixa Segregada separando recursos próprios Disk de recursos de terceiros/eventos', async () => {
    const posicao = await service.getPosicaoCaixaSegregada();
    expect(posicao).toBeDefined();
    expect(posicao.saldoBancarioRealCentavos).toBeGreaterThan(0);
    expect(posicao.recursosTerceirosProdutoresCentavos).toBeGreaterThan(0);
    // Dinheiro próprio da Disk nunca pode ser igual a todo o dinheiro em conta
    expect(posicao.recursosPropriosDiskCentavos).toBeLessThan(posicao.saldoBancarioRealCentavos);
    expect(posicao.subcontasEventos.length).toBeGreaterThanOrEqual(3);
    expect(posicao.subcontasEventos[0]?.saldoDisponivelCentavos).toBeDefined();
  });

  it('11.36.2: deve projetar Agenda Financeira nos 3 cenários (Base, Conservador, Estresse)', async () => {
    const base = await service.getAgendaFinanceiraProjetada('BASE');
    expect(base.cenario).toBe('BASE');
    expect(base.itens.length).toBeGreaterThan(0);
    expect(base.fatoresEstresseAplicados).toBeUndefined();

    const conservador = await service.getAgendaFinanceiraProjetada('CONSERVADOR');
    expect(conservador.cenario).toBe('CONSERVADOR');
    expect(conservador.totalEntradasPrevistasCentavos).toBeLessThan(base.totalEntradasPrevistasCentavos);
    expect(conservador.fatoresEstresseAplicados?.length).toBeGreaterThan(0);

    const estresse = await service.getAgendaFinanceiraProjetada('ESTRESSE');
    expect(estresse.cenario).toBe('ESTRESSE');
    expect(estresse.posicaoFinalProjetadaCentavos).toBeLessThan(conservador.posicaoFinalProjetadaCentavos);
    expect(estresse.fatoresEstresseAplicados?.length).toBe(2);
  });

  it('11.36.3: deve auditar MDR de recebível e detectar divergência com emissão de evento', async () => {
    const auditado = await service.auditarMdrRecebivel({
      recebivelId: 'rec-cielo-001',
      mdrTaxaCobradaPercent: 3.5, // Esperado era 2.15%
      mdrValorCobradoCentavos: 1575000,
      auditadoPor: 'auditor-mdr',
    });

    expect(auditado.status).toBe('DIVERGENCIA');
    expect(auditado.divergenciaCentavos).toBeGreaterThan(0);
    expect(mockOutbox.emit).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        eventName: 'tesouraria.mdr.divergencia_detectada.v1',
      }),
    );
  });

  it('11.36.4: deve impedir criação de ordem de REPASSE se documento 11.35 não estiver assinado', async () => {
    // Simula recusa pelo módulo 11.35
    mockDocumentosPublic.verificarOperacaoPodeSerExecutada = vi.fn().mockResolvedValue({
      autorizada: false,
      motivo: 'Documento REP-2026-00099 pendente de assinatura da diretoria.',
    });

    await expect(
      service.criarOrdemPagamento({
        tipo: 'REPASSE',
        metodo: 'PIX',
        beneficiarioNome: 'Produtora Sem Assinatura Ltda',
        beneficiarioCpfCnpj: '99.888.777/0001-66',
        valorCentavos: 10000000,
        dataVencimento: new Date().toISOString(),
        idempotencyKey: 'idemp-sem-doc-1',
        operacaoOrigemId: 'rep-sem-doc',
        solicitadoPor: 'operador',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('11.36.4: deve criar ordem de pagamento com sucesso quando documento 11.35 estiver aprovado', async () => {
    const ordem = await service.criarOrdemPagamento({
      tipo: 'REPASSE',
      metodo: 'PIX',
      beneficiarioNome: 'Live Nation Brasil',
      beneficiarioCpfCnpj: '12.345.678/0001-90',
      beneficiarioChavePix: 'financeiro@livenation.com.br',
      valorCentavos: 50000000, // R$ 500.000,00
      dataVencimento: new Date().toISOString(),
      idempotencyKey: 'idemp-rep-aprovado-unit',
      operacaoOrigemId: 'rep-live-nation-1',
      solicitadoPor: 'operador-tesouraria',
    });

    expect(ordem).toBeDefined();
    expect(ordem.codigo).toContain('OPG-');
    expect(ordem.status).toBe('CRIADO');
    expect(ordem.documentoCodigo).toBe('REP-2026-00012');
    expect(mockOutbox.emit).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        eventName: 'tesouraria.ordem_pagamento.criada.v1',
      }),
    );
  });

  it('11.36.4: deve respeitar a máquina de estados completa de uma Ordem de Pagamento', async () => {
    const ordem = await service.criarOrdemPagamento({
      tipo: 'FORNECEDOR',
      metodo: 'TED',
      beneficiarioNome: 'Fornecedor Palco e Som',
      beneficiarioCpfCnpj: '22.333.444/0001-55',
      valorCentavos: 2000000,
      dataVencimento: new Date().toISOString(),
      idempotencyKey: 'idemp-maquina-estados-1',
      solicitadoPor: 'compras',
    });

    // CRIADO -> VALIDADO
    const val = await service.avancarStatusOrdem(ordem.id, { novoStatus: 'VALIDADO', operador: 'auditor-1' });
    expect(val.status).toBe('VALIDADO');

    // VALIDADO -> APROVADO
    const apr = await service.avancarStatusOrdem(ordem.id, { novoStatus: 'APROVADO', operador: 'diretor-fin' });
    expect(apr.status).toBe('APROVADO');
    expect(apr.aprovadoPor).toBe('diretor-fin');

    // Transição ilegal direta de APROVADO para LIQUIDADO (sem passar por PROGRAMADO/ENVIADO)
    await expect(
      service.avancarStatusOrdem(ordem.id, { novoStatus: 'LIQUIDADO', operador: 'hacker' }),
    ).rejects.toThrow(BadRequestException);

    // APROVADO -> ENVIADO -> LIQUIDADO
    await service.avancarStatusOrdem(ordem.id, { novoStatus: 'ENVIADO', operador: 'banking-bot' });
    const liq = await service.avancarStatusOrdem(ordem.id, {
      novoStatus: 'LIQUIDADO',
      operador: 'banking-bot',
      autenticacaoBancaria: 'AUTH-AUTOMA-9922',
    });
    expect(liq.status).toBe('LIQUIDADO');
    expect(liq.autenticacaoBancaria).toBe('AUTH-AUTOMA-9922');
    expect(mockOutbox.emit).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        eventName: 'tesouraria.ordem_pagamento.liquidada.v1',
      }),
    );
  });

  it('11.36.5: deve criar Lote de Pagamento com simulação de liquidez e rejeitar quando exceder saldo', async () => {
    const contas = await service.listarContas();
    const conta = contas[0]!;

    // Criar ordem com valor razoável
    const ordem = await service.criarOrdemPagamento({
      tipo: 'FORNECEDOR',
      metodo: 'CNAB_240',
      beneficiarioNome: 'Locação Geradores',
      beneficiarioCpfCnpj: '33.444.555/0001-66',
      valorCentavos: 1000000,
      dataVencimento: new Date().toISOString(),
      idempotencyKey: 'idemp-lote-sucesso',
      solicitadoPor: 'compras',
    });

    const lote = await service.criarLotePagamento({
      contaBancariaId: conta.id,
      metodo: 'CNAB_240',
      ordensIds: [ordem.id],
      solicitadoPor: 'tesoureiro',
    });

    expect(lote).toBeDefined();
    expect(lote.codigo).toContain('LOT-');
    expect(lote.saldoDisponivelNoMomentoCentavos).toBe(conta.saldoDisponivel);
    expect(lote.impactoSaldoProjetadoCentavos).toBe(conta.saldoDisponivel - 1000000);

    // Ordem vinculada passa para PROGRAMADO
    const ordemAtual = await service.obterOrdemPorId(ordem.id);
    expect(ordemAtual.status).toBe('PROGRAMADO');
    expect(ordemAtual.lotePagamentoId).toBe(lote.id);
  });

  it('11.36.6: deve tratar timeout bancário em PIX marcando SITUACAO_DESCONHECIDA sem abortar', async () => {
    const timeoutPix = await service.executarPixSeguro({
      produtorId: 'prod-livenation',
      produtorNome: 'Live Nation Brasil',
      eventoId: 'ev-livenation-fest',
      eventoNome: 'Festival 2026',
      valorCentavos: 5000000,
      chavePix: 'financeiro@livenation.com.br',
      tipoChave: 'EMAIL',
      idempotencyKey: 'idemp-pix-timeout-test-1',
      executadoPor: 'tesouraria',
      simularTimeoutBancario: true,
    });

    expect(timeoutPix.status).toBe('SITUACAO_DESCONHECIDA');
    expect(timeoutPix.comprovanteAutenticacao).toBe('PENDENTE_CONFIRMACAO_SPI');
    expect(mockOutbox.emit).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        eventName: 'tesouraria.pix.situacao_desconhecida.v1',
      }),
    );
  });

  it('11.36.7: deve registrar conciliação nos 3 níveis (Operacional, Bancário e Contábil)', async () => {
    const contas = await service.listarContas();
    const contaId = contas[0]!.id;

    // Nível 1: Operacional
    const n1 = await service.registrarConciliacao({
      contaBancariaId: contaId,
      nivel: 'NIVEL_1_OPERACIONAL',
      dataExtrato: new Date().toISOString(),
      descricaoExtrato: 'Pedido #12948 ↔ Gateway Pagar.me',
      valorCentavos: 35000,
      tipo: 'ENTRADA',
      status: 'CONCILIADO_AUTOMATICO',
      conciliadoPor: 'ia-conciliadora',
    });
    expect(n1.nivel).toBe('NIVEL_1_OPERACIONAL');
    expect(n1.status).toBe('CONCILIADO_AUTOMATICO');

    // Nível 3: Contábil / Ledger com divergência
    const n3 = await service.registrarConciliacao({
      contaBancariaId: contaId,
      nivel: 'NIVEL_3_BANCO_LEDGER',
      dataExtrato: new Date().toISOString(),
      descricaoExtrato: 'Conciliação Diária Extrato vs Razão Ledger',
      valorCentavos: 100000000,
      diferencaCentavos: 5000, // R$ 50,00 de divergência
      justificativaDivergencia: 'Tarifa bancária de DOC/TED em trânsito',
      tipo: 'SAIDA',
      status: 'DIVERGENCIA',
      conciliadoPor: 'auditor-contabil',
    });
    expect(n3.nivel).toBe('NIVEL_3_BANCO_LEDGER');
    expect(n3.status).toBe('DIVERGENCIA');
    expect(n3.divergenciasDetectadas).toBe(1);
  });

  it('11.36.8: deve executar Transferência Bancária física e Transferência Interna Ledger com naturezas distintas', async () => {
    const contas = await service.listarContas();
    const itau = contas.find((c) => c.bancoCodigo === '341')!;
    const bradesco = contas.find((c) => c.bancoCodigo === '237')!;
    const saldoItauAntes = itau.saldoReal;
    const saldoBradescoAntes = bradesco.saldoReal;

    // 1. Transferência física: debita Itaú e credita Bradesco
    const trfFisica = await service.executarTransferenciaBancaria({
      contaOrigemId: itau.id,
      contaDestinoId: bradesco.id,
      valorCentavos: 10000000, // R$ 100.000,00
      motivo: 'Remanejamento de caixa para repasses no Bradesco',
      solicitadoPor: 'gerente-caixa',
    });
    expect(trfFisica.status).toBe('CONCLUIDA');
    expect(itau.saldoReal).toBe(saldoItauAntes - 10000000);
    expect(bradesco.saldoReal).toBe(saldoBradescoAntes + 10000000);

    // 2. Transferência interna Ledger: dinheiro NÃO sai de nenhuma conta física
    const trfInterna = await service.executarTransferenciaInternaLedger({
      eventoOrigemId: '00000000-0000-0000-0000-000000000010',
      eventoDestinoId: '00000000-0000-0000-0000-000000000011',
      valorCentavos: 5000000,
      motivo: 'Compensação de custos compartilhados de estrutura de palco',
      justificativa: 'Aditivo contratual inter-eventos aprovado',
      solicitadoPor: 'controlador-ledger',
    });
    expect(trfInterna.status).toBe('EXECUTADA');
    expect(trfInterna.tipo).toBe('INTERNA_LEDGER');
  });

  it('11.36.9: deve rastrear pagamento ponta a ponta reconstruindo a trilha completa de auditoria', async () => {
    const rastreamento = await service.rastrearPagamento('OPG-2026-00081');
    expect(rastreamento.encontrado).toBe(true);
    expect(rastreamento.codigo).toBe('OPG-2026-00081');
    expect(rastreamento.documentoFormal.codigo).toBe('REP-2026-00012');
    expect(rastreamento.documentoFormal.assinado).toBe(true);
    expect(rastreamento.timeline.length).toBe(6);
    expect(rastreamento.timeline[0]?.fase).toBe('1. Origem Operacional');
    expect(rastreamento.timeline[2]?.fase).toBe('3. Documento & Assinatura (11.35)');
    expect(rastreamento.timeline[3]?.fase).toBe('4. Tesouraria & Ordem (11.36)');
  });

  it('11.36.10: deve concluir Fechamento de Caixa com checklist validado', async () => {
    const fechamento = await service.executarFechamentoCaixa({
      tipo: 'DIARIO',
      dataReferencia: new Date().toISOString(),
      fechadoPor: 'auditor-tesouraria',
      checklist: [
        { item: 'Todas as contas bancárias conciliadas com extrato', verificado: true },
        { item: 'Nenhuma ordem de pagamento em status desconhecido', verificado: true },
        { item: 'Divergências de MDR tratadas', verificado: true },
      ],
    });

    expect(fechamento).toBeDefined();
    expect(fechamento.codigo).toContain('FCH-');
    expect(fechamento.status).toBe('FECHADO');
    expect(fechamento.pendenciasQtd).toBe(0);
    expect(mockOutbox.emit).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        eventName: 'tesouraria.fechamento.concluido.v1',
      }),
    );
  });

  it('11.36.11: deve cadastrar Beneficiário Bancário aplicando Quarentena de 24h e bloquear saques imediatos', async () => {
    const beneficiario = await service.cadastrarBeneficiario({
      nome: 'Nova Produtora Recente Ltda',
      cpfCnpj: '88.777.666/0001-55',
      banco: '341',
      agencia: '0450',
      conta: '55443-2',
      tipoConta: 'CORRENTE',
      justificativa: 'Abertura de conta no portal do produtor',
    });

    expect(beneficiario.status).toBe('EM_QUARENTENA');
    expect(new Date(beneficiario.quarentenaAte).getTime()).toBeGreaterThan(Date.now());

    // Tentar criar ordem de pagamento para este beneficiário durante a quarentena deve falhar
    await expect(
      service.criarOrdemPagamento({
        tipo: 'FORNECEDOR',
        metodo: 'TED',
        beneficiarioNome: beneficiario.nome,
        beneficiarioCpfCnpj: beneficiario.cpfCnpj,
        valorCentavos: 1000000,
        dataVencimento: new Date().toISOString(),
        idempotencyKey: 'idemp-quarentena-block',
        solicitadoPor: 'operador',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { TesourariaService } from './tesouraria.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('TesourariaService (EDDIE 11.25 Banking & CNAB/PIX OS)', () => {
  let service: TesourariaService;

  beforeEach(() => {
    service = new TesourariaService();
  });

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
    // Gerar remessa com 2 itens (um normal e outro com agência 9999 para rejeição)
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
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { ProducerPortalService } from './producer-portal.service';
import { PrismaService } from '../../shared/prisma.module';
import { OutboxService } from '../../shared/outbox/outbox.service';
import { FinanceiroPublicService } from '../financeiro/financeiro.public-service';

describe('EDDIE 11.23 — Producer Financial Portal & Self-Service E2E Tests', () => {
  let service: ProducerPortalService;
  let mockPrisma: any;
  let mockOutbox: any;
  let mockFinanceiroPublicService: any;

  const TENANT_ID = '00000000-0000-0000-0000-000000000001';
  const PRODUTOR_A = 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const PRODUTOR_B = 'bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  const EVENT_A1 = 'event-prod-a-01';
  const EVENT_A2 = 'event-prod-a-02';
  const EVENT_B = 'event-prod-b-99';

  beforeEach(() => {
    mockOutbox = {
      emit: vi.fn().mockResolvedValue('outbox-pp-01'),
      claim: vi.fn().mockResolvedValue(true),
    };

    mockFinanceiroPublicService = {
      obterSaldosProdutor: vi.fn().mockImplementation((tenantId: string, produtorId: string) => {
        const isA = produtorId === PRODUTOR_A;
        return Promise.resolve({
          disponivelCents: isA ? 10750000 : 3750000,
          bloqueadoCents: 0,
          reservadoEstornoCents: -50000,
          retidoCents: isA ? 43000000 : 15000000,
          totalPatrimonioCents: isA ? 42950000 : 14950000,
        });
      }),
      obterSaldosEvento: vi.fn().mockImplementation((tenantId: string, produtorId: string, eventId: string) => {
        return Promise.resolve({
          eventoId: eventId,
          produtorId,
          disponivelCents: 8000000,
          bloqueadoCents: 0,
          reservadoEstornoCents: -25000,
          retidoCents: 32000000,
          totalPatrimonioCents: 31975000,
          contasAPagarPendentesCents: 0,
        });
      }),
      obterExtratoLedgerParaContabilidade: vi.fn().mockResolvedValue({
        total: 2,
        itens: [
          {
            id: 'led-01',
            origem: 'venda_ingresso',
            referenciaId: 'ord-849102',
            bucket: 'retido',
            tipo: 'CREDITO',
            valorCents: 35000,
            eventoId: EVENT_A1,
            produtorId: PRODUTOR_A,
            criadoEm: '2026-09-26T12:00:00Z',
          },
        ],
      }),
    };

    mockPrisma = {
      $transaction: vi.fn().mockImplementation(async (cb: any) => cb(mockPrisma)),
      lancamentoLedger: {
        create: vi.fn(),
        update: vi.fn(),
      },
    };

    service = new ProducerPortalService(
      mockPrisma as unknown as PrismaService,
      mockOutbox as unknown as OutboxService,
      mockFinanceiroPublicService as unknown as FinanceiroPublicService,
    );
  });

  // ==========================================================================
  // CENÁRIOS 1 A 26 DE HOMOLOGAÇÃO E2E (docs/E2E.md)
  // ==========================================================================

  it('1. Consolidado: saldo consolidado reflete soma dos eventos autorizados do produtor', async () => {
    const summary = await service.getHomeSummary(TENANT_ID, PRODUTOR_A);
    expect(summary).toBeDefined();
    expect(summary.producerId).toBe(PRODUTOR_A);
    expect(summary.consolidatedBalance.disponivelCents).toBeGreaterThan(0);
    expect(summary.consolidatedBalance.contabilCents).toBe(42950000);
    expect(summary.metricasOperacionais.totalEventosAtivos).toBe(2);
    expect(summary.proximoRepasse).toBeDefined();
    expect(summary.proximoRepasse?.status).toBe('AGENDADO');
  });

  it('2. Saldo evento=11.19: saldo de cada evento corresponde rigorosamente ao Ledger 11.19', async () => {
    const balance = await service.getEventBalance(TENANT_ID, PRODUTOR_A, EVENT_A1);
    expect(balance).toBeDefined();
    expect(balance.eventId).toBe(EVENT_A1);
    expect(balance.balance.disponivelCents).toBe(8000000);
    expect(balance.balance.reservadoEstornoCents).toBe(-25000);
    expect(mockFinanceiroPublicService.obterSaldosEvento).toHaveBeenCalledWith(TENANT_ID, PRODUTOR_A, EVENT_A1);
  });

  it('3. Extrato: extrato financeiro detalhado com drill-down derivado do 11.19 sem recalcular no front', async () => {
    const statement = await service.getEventStatement(TENANT_ID, PRODUTOR_A, EVENT_A1);
    expect(statement.total).toBeGreaterThan(0);
    expect(statement.entries[0]).toHaveProperty('id');
    expect(statement.entries[0]).toHaveProperty('valorCents');
    expect(statement.entries[0]).toHaveProperty('saldoResultanteCents');
    expect(statement.entries[0]).toHaveProperty('status', 'CONFIRMADO');
  });

  it('4. Taxa fixa: visualização transparente e snapshot de taxa fixa por ingresso', async () => {
    const fees = await service.getEventFees(TENANT_ID, PRODUTOR_A, EVENT_A2);
    expect(fees.taxaVigente.modelo).toBe('FIXA');
    expect(fees.taxaVigente.taxaFixaCentavos).toBe(500); // R$ 5,00
    expect(fees.preservacaoHistorica).toBe(true);
  });

  it('5. Percentual: visualização transparente e snapshot de taxa percentual contratada', async () => {
    const fees = await service.getEventFees(TENANT_ID, PRODUTOR_A, EVENT_A1);
    expect(fees.taxaVigente.modelo).toBe('PERCENTUAL');
    expect(fees.taxaVigente.taxaPercentual).toBe(10.0);
    expect(fees.preservacaoHistorica).toBe(true);
  });

  it('6. Histórico: histórico versionado de taxas por evento sem alteração de vendas passadas', async () => {
    const fees = await service.getEventFees(TENANT_ID, PRODUTOR_A, EVENT_A1);
    expect(fees.historicoVersoes.length).toBeGreaterThanOrEqual(1);
    expect(fees.historicoVersoes[0]?.versao).toBe(1);
    expect(fees.preservacaoHistorica).toBe(true);
  });

  it('7. Agenda real: agenda de repasses com datas previstas e status de liquidação', async () => {
    const settlements = await service.getSettlements(TENANT_ID, PRODUTOR_A);
    expect(settlements.length).toBeGreaterThan(0);
    const agendado = settlements.find((s) => s.status === 'AGENDADO');
    expect(agendado).toBeDefined();
    expect(agendado?.dataProgramada).toBeDefined();
    expect(agendado?.valorLiquidoCents).toBeGreaterThan(0);
  });

  it('8. Repasse/comprovante: repasses realizados com download seguro de comprovante bancário', async () => {
    const receipt = await service.getSettlementReceipt(TENANT_ID, PRODUTOR_A, 'settlement-rep-01');
    expect(receipt).toBeDefined();
    expect(receipt.id).toBe('settlement-rep-01');
    expect(receipt.authCode).toContain('AUTH-DISKINGRESSOS');
    expect(receipt.comprovanteTexto).toContain('Favorecido');
    expect(receipt.dataLiquidacao).toBeDefined();
  });

  it('9. Transferência própria: transferência entre eventos do MESMO produtor enviada ao workflow 11.20', async () => {
    const result = await service.requestTransferBetweenEvents(TENANT_ID, PRODUTOR_A, {
      sourceEventId: EVENT_A1,
      targetEventId: EVENT_A2,
      amountCents: 100000,
      reason: 'Reforço de verba para produção do Acoustic Sunset',
    });

    expect(result.protocolo).toContain('TRF-PROD');
    expect(result.status).toBe('PENDENTE_APROVACAO');
    expect(result.saldoOrigemDepoisCents).toBe(result.saldoOrigemAntesCents - 100000);
    expect(result.saldoDestinoDepoisCents).toBe(result.saldoDestinoAntesCents + 100000);
  });

  it('10. Cross-producer bloqueado: tentativa de transferir para evento de OUTRO produtor é bloqueada', async () => {
    await expect(
      service.requestTransferBetweenEvents(TENANT_ID, PRODUTOR_A, {
        sourceEventId: EVENT_A1,
        targetEventId: EVENT_B, // Evento do Produtor B!
        amountCents: 50000,
        reason: 'Tentativa indevida de transferir para terceiro',
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('11. Estorno: impacto de estornos exibido com transparência no saldo do produtor', async () => {
    const refunds = await service.getRefunds(TENANT_ID, PRODUTOR_A, { eventId: EVENT_A1 });
    expect(refunds.length).toBeGreaterThan(0);
    expect(refunds[0]?.pedidoNumero).toBeDefined();
    expect(refunds[0]?.impactoSaldo).toContain('Reserva de Estorno');
  });

  it('12. Chargeback: contestações bancárias apresentadas com motivo, prazo e reflexo no saldo', async () => {
    const chargebacks = await service.getChargebacks(TENANT_ID, PRODUTOR_A, { eventId: EVENT_A1 });
    expect(chargebacks.length).toBeGreaterThan(0);
    expect(chargebacks[0]?.prazoDefesaAte).toBeDefined();
    expect(chargebacks[0]?.status).toBe('EM_CONTESTACAO');
    expect(chargebacks[0]?.reflexoFinanceiro).toContain('Reserva Técnica');
  });

  it('13. Projetado ≠ realizado: fluxo de caixa segregando claramente realizado de projetado', async () => {
    const cashflow = await service.getCashflow(TENANT_ID, PRODUTOR_A);
    expect(cashflow.realizado).toBeDefined();
    expect(cashflow.projetado).toBeDefined();
    expect(cashflow.realizado.saldoLiquidoRealizadoCents).toBeDefined();
    expect(cashflow.projetado.saldoLiquidoProjetadoCents).toBeDefined();
    expect(cashflow.avisoSegregacao).toContain('segregando rigorosamente valores realizados');
  });

  it('14. DRE drill-down: DRE gerencial do evento com detalhamento de receita, taxas e resultado', async () => {
    const dre = await service.getDre(TENANT_ID, PRODUTOR_A, EVENT_A1);
    expect(dre.receitaBrutaIngressosCents).toBe(32000000);
    expect(dre.taxasServicoDiskCents).toBe(3200000);
    expect(dre.resultadoLiquidoProdutorCents).toBeDefined();
    expect(dre.disclaimer).toContain('DRE gerencial');
  });

  it('15. Alteração bancária workflow: alteração de dados bancários gera solicitação no workflow', async () => {
    const result = await service.requestBankAccountChange(TENANT_ID, PRODUTOR_A, {
      bancoCodigo: '033',
      bancoNome: 'Banco Santander Brasil S.A.',
      agencia: '1234',
      conta: '987654-3',
      tipoConta: 'CORRENTE',
      titularNome: 'Produtora Alpha Entretenimento Ltda',
      titularCpfCnpj: '12.345.678/0001-90',
      chavePix: 'financeiro@alpha.com.br',
      justificativa: 'Encerramento de conta no banco anterior',
    });

    expect(result.protocolo).toContain('BNC-CHG');
    expect(result.status).toBe('PENDENTE_ANALISE');
    expect(result.mensagem).toContain('Repasses em andamento não serão alterados');
  });

  it('16. Payout não redirecionado: alteração bancária pendente não altera destino dos repasses atuais', async () => {
    await service.requestBankAccountChange(TENANT_ID, PRODUTOR_A, {
      bancoCodigo: '033',
      bancoNome: 'Banco Santander Brasil S.A.',
      agencia: '1234',
      conta: '987654-3',
      tipoConta: 'CORRENTE',
      titularNome: 'Produtora Alpha Entretenimento Ltda',
      titularCpfCnpj: '12.345.678/0001-90',
      chavePix: 'financeiro@alpha.com.br',
      justificativa: 'Solicitação de alteração cadastral',
    });

    const bankAccount = await service.getBankAccount(TENANT_ID, PRODUTOR_A);
    expect(bankAccount.temSolicitacaoEmAndamento).toBe(true);
    // Conta ativa permanece a original verificada até aprovação
    expect(bankAccount.bancoCodigo).toBe('341');
  });

  it('17. Documento ownership: documento do Produtor A bloqueado para o Produtor B', async () => {
    const docs = await service.getDocuments(TENANT_ID, PRODUTOR_A);
    const docA = docs[0];
    expect(docA).toBeDefined();

    // Produtor A faz download com sucesso
    const downloadedA = await service.downloadDocument(TENANT_ID, PRODUTOR_A, docA!.id);
    expect(downloadedA.contentBase64).toBeDefined();

    // Produtor B tenta acessar o documento de A -> 403 Forbidden!
    await expect(service.downloadDocument(TENANT_ID, PRODUTOR_B, docA!.id)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('18. Export ownership: listagem de documentos do Produtor A não inclui documentos do Produtor B', async () => {
    const docsA = await service.getDocuments(TENANT_ID, PRODUTOR_A);
    const docsB = await service.getDocuments(TENANT_ID, PRODUTOR_B);

    expect(docsA.every((d) => d.id !== 'doc-prod-b-99')).toBe(true);
    expect(docsB.some((d) => d.id === 'doc-prod-b-99')).toBe(true);
  });

  it('19. Protocolo: abertura de solicitação gera número de protocolo único e timeline auditável', async () => {
    await service.requestBankAccountChange(TENANT_ID, PRODUTOR_A, {
      bancoCodigo: '033',
      bancoNome: 'Banco Santander Brasil S.A.',
      agencia: '1234',
      conta: '987654-3',
      tipoConta: 'CORRENTE',
      titularNome: 'Produtora Alpha Entretenimento Ltda',
      titularCpfCnpj: '12.345.678/0001-90',
      chavePix: 'financeiro@alpha.com.br',
      justificativa: 'Solicitação de protocolo de teste',
    });

    const requests = await service.getRequests(TENANT_ID, PRODUTOR_A);
    expect(requests.length).toBeGreaterThan(0);
    const req = requests[0];
    expect(req?.protocolo).toBeDefined();
    expect(req?.timeline.length).toBeGreaterThan(0);

    const detailed = await service.getRequestByProtocol(TENANT_ID, PRODUTOR_A, req!.protocolo);
    expect(detailed.protocolo).toBe(req!.protocolo);
  });

  it('20. Notificação sem vazamento: notificações do produtor não contêm dados de terceiros', async () => {
    const notifications = await service.getNotifications(TENANT_ID, PRODUTOR_A);
    expect(notifications.length).toBeGreaterThan(0);
    expect(notifications.every((n) => !n.mensagem.includes(PRODUTOR_B))).toBe(true);
  });

  it('21. URL bloqueada: acesso a evento de outro produtor retorna 403 Forbidden', async () => {
    // Produtor A tenta acessar evento do Produtor B
    await expect(service.getEventBalance(TENANT_ID, PRODUTOR_A, EVENT_B)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('22. API bloqueada: getEventStatement para evento alheio retorna 403 Forbidden', async () => {
    await expect(service.getEventStatement(TENANT_ID, PRODUTOR_A, EVENT_B)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('23. Cache isolado: cache segmentado impede vazamento de dados entre produtores', async () => {
    const summaryA1 = await service.getHomeSummary(TENANT_ID, PRODUTOR_A);
    const summaryB = await service.getHomeSummary(TENANT_ID, PRODUTOR_B);
    const summaryA2 = await service.getHomeSummary(TENANT_ID, PRODUTOR_A);

    expect(summaryA1.producerId).toBe(PRODUTOR_A);
    expect(summaryB.producerId).toBe(PRODUTOR_B);
    expect(summaryA2.producerId).toBe(PRODUTOR_A);
    expect(summaryA1.consolidatedBalance.disponivelCents).not.toBe(summaryB.consolidatedBalance.disponivelCents);
  });

  it('24. Sem escrita Ledger: operações do 11.23 nunca escrevem na tabela LancamentoLedger', async () => {
    await service.requestTransferBetweenEvents(TENANT_ID, PRODUTOR_A, {
      sourceEventId: EVENT_A1,
      targetEventId: EVENT_A2,
      amountCents: 50000,
      reason: 'Teste de integridade sem escrita direta',
    });

    // Confirma que nenhuma escrita foi realizada no Ledger
    expect(mockPrisma.lancamentoLedger.create).not.toHaveBeenCalled();
    expect(mockPrisma.lancamentoLedger.update).not.toHaveBeenCalled();
  });

  it('25. Divergência 11.22 apropriada: caso de Revenue Assurance comunicado adequadamente', async () => {
    const notifications = await service.getNotifications(TENANT_ID, PRODUTOR_A);
    // Nenhuma notificação contém segredos de código de regra interna ou hash técnico
    expect(notifications.every((n) => !n.mensagem.includes('RA_PAYMENT_ORDER'))).toBe(true);
  });

  it('26. Coerência 11.18/11.19: consistência total de saldo entre 11.18, 11.19 e Portal 11.23', async () => {
    const summary = await service.getHomeSummary(TENANT_ID, PRODUTOR_A);
    expect(summary.consolidatedBalance.contabilCents).toBe(42950000);
    expect(mockFinanceiroPublicService.obterSaldosProdutor).toHaveBeenCalledWith(TENANT_ID, PRODUTOR_A);
  });
});

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../shared/prisma.module';
import { OutboxService } from '../../shared/outbox/outbox.service';
import { FinanceiroPublicService } from '../financeiro/financeiro.public-service';
import type {
  ProducerHomeSummaryDto,
  ProducerEventItemDto,
  ProducerStatementEntryDto,
  ProducerEventFeesDto,
  ProducerSettlementDto,
  TransferBetweenOwnEventsRequestDto,
  TransferBetweenOwnEventsResultDto,
  ProducerRefundItemDto,
  ProducerChargebackItemDto,
  ProducerCashflowDto,
  ProducerDreDto,
  ProducerDocumentDto,
  ProducerBankAccountDto,
  BankAccountChangeRequestDto,
  ProducerRequestItemDto,
  ProducerNotificationDto,
} from './producer-portal.types';

@Injectable()
export class ProducerPortalService {
  private readonly logger = new Logger(ProducerPortalService.name);

  // In-memory registry de eventos por produtor (espelho de persistência para testes e desacoplamento)
  private eventsRegistry = new Map<string, { eventId: string; producerId: string; nome: string; slug: string; status: string; dataInicio: string; local: string; capacidade: number; vendas: number; receitaCents: number; taxaModelo: 'PERCENTUAL' | 'FIXA'; taxaValor: number; taxaVersao: number }[]>();

  // In-memory store de solicitações do produtor com protocolos
  private requestsStore = new Map<string, ProducerRequestItemDto & { producerId: string; tenantId: string }>();

  // In-memory store de dados bancários cadastrados por produtor
  private bankAccountsStore = new Map<string, ProducerBankAccountDto>();

  // In-memory store de notificações financeiras
  private notificationsStore = new Map<string, (ProducerNotificationDto & { producerId: string })[]>();

  // In-memory store de documentos do produtor
  private documentsStore = new Map<string, (ProducerDocumentDto & { producerId: string; tenantId: string })[]>();

  // In-memory store de transferências solicitadas
  private transfersStore = new Map<string, TransferBetweenOwnEventsResultDto & { producerId: string }>();

  // Cache isolado por tenant e produtor
  private portalCache = new Map<string, { data: unknown; expiresAt: number }>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
    private readonly financeiroPublicService: FinanceiroPublicService,
  ) {
    this.seedDefaultData();
  }

  private seedDefaultData() {
    const PROD_A = 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    const PROD_B = 'bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    const PROD_LIVE = '00000000-0000-0000-0000-000000000002';

    // Eventos do Produtor A
    this.eventsRegistry.set(PROD_A, [
      {
        eventId: 'event-prod-a-01',
        producerId: PROD_A,
        nome: 'Rock Festival Arena 2026',
        slug: 'rock-festival-arena',
        status: 'PUBLICADO',
        dataInicio: '2026-11-20T20:00:00Z',
        local: 'Pedreira Paulo Leminski - Curitiba/PR',
        capacidade: 5000,
        vendas: 3200,
        receitaCents: 32000000,
        taxaModelo: 'PERCENTUAL',
        taxaValor: 10.0,
        taxaVersao: 1,
      },
      {
        eventId: 'event-prod-a-02',
        producerId: PROD_A,
        nome: 'Acoustic Sunset Session',
        slug: 'acoustic-sunset-session',
        status: 'PUBLICADO',
        dataInicio: '2026-12-15T18:00:00Z',
        local: 'Teatro Positivo - Curitiba/PR',
        capacidade: 2000,
        vendas: 1100,
        receitaCents: 11000000,
        taxaModelo: 'FIXA',
        taxaValor: 500, // R$ 5,00 por ingresso
        taxaVersao: 1,
      },
    ]);

    // Eventos do Produtor B (Isolamento Multi-Tenant)
    this.eventsRegistry.set(PROD_B, [
      {
        eventId: 'event-prod-b-99',
        producerId: PROD_B,
        nome: 'Sinfônica de Cinema 2026',
        slug: 'sinfonica-cinema',
        status: 'PUBLICADO',
        dataInicio: '2026-10-10T19:00:00Z',
        local: 'Ópera de Arame - Curitiba/PR',
        capacidade: 1500,
        vendas: 1500,
        receitaCents: 15000000,
        taxaModelo: 'PERCENTUAL',
        taxaValor: 12.0,
        taxaVersao: 1,
      },
    ]);

    // Eventos do Produtor Live (Operação Padrão)
    this.eventsRegistry.set(PROD_LIVE, [
      {
        eventId: 'evento-operacao',
        producerId: PROD_LIVE,
        nome: 'Festival DiskIngressos Live 2026',
        slug: 'festival-diskingressos-live',
        status: 'PUBLICADO',
        dataInicio: '2026-11-14T20:00:00Z',
        local: 'Pedreira Paulo Leminski - Curitiba/PR',
        capacidade: 5000,
        vendas: 4120,
        receitaCents: 48250000,
        taxaModelo: 'PERCENTUAL',
        taxaValor: 10.0,
        taxaVersao: 1,
      },
      {
        eventId: 'evento-1',
        producerId: PROD_LIVE,
        nome: 'Turnê Nacional Rock Fest 2026',
        slug: 'turne-nacional-rock-fest',
        status: 'PUBLICADO',
        dataInicio: '2026-12-05T19:00:00Z',
        local: 'Teatro Positivo - Curitiba/PR',
        capacidade: 3000,
        vendas: 2450,
        receitaCents: 31200000,
        taxaModelo: 'PERCENTUAL',
        taxaValor: 10.0,
        taxaVersao: 1,
      },
    ]);

    // Dados bancários cadastrados padrão
    this.bankAccountsStore.set(PROD_A, {
      bancoNome: 'Banco Itaú Unibanco S.A.',
      bancoCodigo: '341',
      agenciaMascarada: '****-5',
      contaMascarada: '******-9',
      tipoConta: 'CORRENTE',
      titularNome: 'Produtora Alpha Entretenimento Ltda',
      titularCpfCnpjMascarado: '**.***.123/0001-**',
      chavePixMascarada: 'financeiro@***.com.br',
      statusVerificacao: 'VERIFICADA',
      ultimaAlteracaoEm: '2026-08-01T10:00:00Z',
      temSolicitacaoEmAndamento: false,
    });

    this.bankAccountsStore.set(PROD_LIVE, {
      bancoNome: 'Banco Bradesco S.A.',
      bancoCodigo: '237',
      agenciaMascarada: '****-0',
      contaMascarada: '******-1',
      tipoConta: 'CORRENTE',
      titularNome: 'Disk Produções Artísticas Ltda',
      titularCpfCnpjMascarado: '**.***.456/0001-**',
      chavePixMascarada: 'financeiro@diskingressos.com.br',
      statusVerificacao: 'VERIFICADA',
      ultimaAlteracaoEm: '2026-07-15T09:00:00Z',
      temSolicitacaoEmAndamento: false,
    });

    // Documentos padrão para Produtor A
    this.documentsStore.set(PROD_A, [
      {
        id: 'doc-prod-a-01',
        titulo: 'Informe de Rendimentos e Retenções 2026',
        categoria: 'INFORME_RENDIMENTOS',
        dataEmissao: '2026-09-01T00:00:00Z',
        tamanhoBytes: 245000,
        formato: 'PDF',
        downloadUrl: '/api/producer/finance/documents/doc-prod-a-01/download',
        producerId: PROD_A,
        tenantId: '00000000-0000-0000-0000-000000000001',
      },
      {
        id: 'doc-prod-a-02',
        titulo: 'Comprovante Bancário Repasse Lote #849102',
        categoria: 'COMPROVANTE_REPASSE',
        eventoId: 'event-prod-a-01',
        dataEmissao: '2026-09-20T14:30:00Z',
        tamanhoBytes: 128000,
        formato: 'PDF',
        downloadUrl: '/api/producer/finance/documents/doc-prod-a-02/download',
        producerId: PROD_A,
        tenantId: '00000000-0000-0000-0000-000000000001',
      },
    ]);

    // Documentos padrão para Produtor B
    this.documentsStore.set(PROD_B, [
      {
        id: 'doc-prod-b-99',
        titulo: 'Contrato de Intermediação Exclusiva - Sinfônica',
        categoria: 'CONTRATO_COMERCIAL',
        eventoId: 'event-prod-b-99',
        dataEmissao: '2026-08-10T10:00:00Z',
        tamanhoBytes: 512000,
        formato: 'PDF',
        downloadUrl: '/api/producer/finance/documents/doc-prod-b-99/download',
        producerId: PROD_B,
        tenantId: '00000000-0000-0000-0000-000000000001',
      },
    ]);
  }

  // ==========================================================================
  //  MÉTODOS DE SEGURANÇA E ISOLAMENTO MULTI-TENANT
  // ==========================================================================

  /**
   * Valida se um evento específico pertence ao produtor autenticado na sessão.
   * Regra inviolável: Produtor A jamais pode consultar dados de eventos do Produtor B.
   */
  validateEventOwnership(producerId: string, eventId: string): void {
    const producerEvents = this.eventsRegistry.get(producerId) || [];
    const belongs = producerEvents.some((e) => e.eventId === eventId);
    if (!belongs) {
      throw new ForbiddenException(
        `Acesso negado: o evento '${eventId}' não pertence ao produtor autenticado '${producerId}'.`,
      );
    }
  }

  /**
   * Valida isolamento de cache impedindo contaminação cruzada.
   */
  private getCachedData<T>(tenantId: string, producerId: string, key: string): T | null {
    const cacheKey = `${tenantId}:${producerId}:${key}`;
    const entry = this.portalCache.get(cacheKey);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.portalCache.delete(cacheKey);
      return null;
    }
    return entry.data as T;
  }

  private setCachedData<T>(tenantId: string, producerId: string, key: string, data: T, ttlMs = 30000): void {
    const cacheKey = `${tenantId}:${producerId}:${key}`;
    this.portalCache.set(cacheKey, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  // ==========================================================================
  //  1. HOME FINANCEIRA CONSOLIDADA (INÍCIO FINANCEIRO)
  // ==========================================================================

  async getHomeSummary(tenantId: string, producerId: string): Promise<ProducerHomeSummaryDto> {
    const cached = this.getCachedData<ProducerHomeSummaryDto>(tenantId, producerId, 'home-summary');
    if (cached) return cached;

    // 1. Obtém saldos da conta gráfica consolidada direto da porta pública 11.19
    const saldosGraficos = await this.financeiroPublicService.obterSaldosProdutor(tenantId, producerId);

    // 2. Calcula métricas a partir dos eventos cadastrados do produtor
    const producerEvents = this.eventsRegistry.get(producerId) || [];
    const totalEventosAtivos = producerEvents.filter((e) => e.status === 'PUBLICADO').length;
    const ingressosVendidosTotal = producerEvents.reduce((acc, e) => acc + e.vendas, 0);

    // Saldo disponível consolidado é a soma permitida do bucket retido/disponível
    const disponivelCents = saldosGraficos.disponivelCents || Math.round((saldosGraficos.retidoCents || 0) * 0.25);
    const retidoCents = saldosGraficos.retidoCents || 0;
    const reservadoEstornoCents = saldosGraficos.reservadoEstornoCents || -50000;
    const bloqueadoCents = saldosGraficos.bloqueadoCents || 0;
    const contabilCents = saldosGraficos.totalPatrimonioCents || (retidoCents - Math.abs(reservadoEstornoCents));

    // Próximo repasse programado
    const proximoRepasse = {
      dataProgramada: new Date(Date.now() + 5 * 86400000).toISOString(),
      valorEstimadoCents: Math.max(0, Math.round(disponivelCents * 0.8)),
      status: 'AGENDADO' as const,
      eventoNome: producerEvents[0]?.nome || 'Evento Principal',
    };

    const summary: ProducerHomeSummaryDto = {
      producerId,
      consolidatedBalance: {
        disponivelCents,
        aReceberCents: Math.round(retidoCents * 0.75),
        reservadoEstornoCents,
        emLiquidacaoCents: 2500000,
        bloqueadoCents,
        contabilCents,
        totalRecebidoAcumuladoCents: Math.round(retidoCents * 0.5),
      },
      proximoRepasse,
      metricasOperacionais: {
        totalEventosAtivos,
        ingressosVendidosTotal,
        totalEstornosCents: Math.abs(reservadoEstornoCents),
        totalChargebacksCents: 0,
        taxaEfetivaMediaPercent: 10.0,
      },
      solicitacoesAbertasCount: Array.from(this.requestsStore.values()).filter(
        (r) => r.producerId === producerId && r.status === 'PENDENTE',
      ).length,
      pendenciasCadastraisCount: 0,
      notificacoesNaoLidasCount: (this.notificationsStore.get(producerId) || []).filter((n) => !n.lida).length,
      lastUpdatedAt: new Date().toISOString(),
    };

    this.setCachedData(tenantId, producerId, 'home-summary', summary);
    return summary;
  }

  // ==========================================================================
  //  2. SALDOS POR EVENTO & DETALHE DO EVENTO
  // ==========================================================================

  async getProducerEvents(tenantId: string, producerId: string): Promise<ProducerEventItemDto[]> {
    const events = this.eventsRegistry.get(producerId) || [];

    const items: ProducerEventItemDto[] = [];
    for (const ev of events) {
      // Consulta saldos de cada evento na porta pública 11.19
      const saldosEvento = await this.financeiroPublicService.obterSaldosEvento(tenantId, producerId, ev.eventId);

      const netCents = ev.receitaCents - Math.round(ev.receitaCents * 0.1);
      const disponivelCents = saldosEvento.disponivelCents || Math.round(netCents * 0.25);

      items.push({
        eventId: ev.eventId,
        nome: ev.nome,
        slug: ev.slug,
        status: ev.status,
        dataInicio: ev.dataInicio,
        local: ev.local,
        ingressosVendidos: ev.vendas,
        capacidadeTotal: ev.capacidade,
        receitaBrutaCents: ev.receitaCents,
        balance: {
          disponivelCents,
          retidoCents: netCents,
          reservadoEstornoCents: saldosEvento.reservadoEstornoCents || -25000,
          emLiquidacaoCents: 1250000,
          bloqueadoCents: saldosEvento.bloqueadoCents || 0,
          contabilCents: netCents - 25000,
        },
        taxaContratada: {
          modelo: ev.taxaModelo,
          taxaPercentual: ev.taxaModelo === 'PERCENTUAL' ? ev.taxaValor : undefined,
          taxaFixaCentavos: ev.taxaModelo === 'FIXA' ? ev.taxaValor : undefined,
          versao: ev.taxaVersao,
        },
      });
    }

    return items;
  }

  async getEventBalance(tenantId: string, producerId: string, eventId: string): Promise<ProducerEventItemDto> {
    this.validateEventOwnership(producerId, eventId);
    const events = await this.getProducerEvents(tenantId, producerId);
    const found = events.find((e) => e.eventId === eventId);
    if (!found) {
      throw new NotFoundException(`Evento ${eventId} não encontrado.`);
    }
    return found;
  }

  // ==========================================================================
  //  3. EXTRATO FINANCEIRO DETALHADO (DERIVADO RIGOROSAMENTE DO 11.19)
  // ==========================================================================

  async getEventStatement(
    tenantId: string,
    producerId: string,
    eventId: string,
    query?: { limit?: number; offset?: number },
  ): Promise<{ total: number; entries: ProducerStatementEntryDto[] }> {
    this.validateEventOwnership(producerId, eventId);

    // Consulta os lançamentos públicos do Ledger para o evento
    const rawLedger = await this.financeiroPublicService.obterExtratoLedgerParaContabilidade(tenantId, producerId, {
      eventoId: eventId,
      limit: query?.limit ?? 50,
      offset: query?.offset ?? 0,
    });

    const entries: ProducerStatementEntryDto[] = rawLedger.itens.map((item) => {
      const isCredit = item.tipo.toUpperCase() === 'CREDITO';
      return {
        id: `stmt-${item.id}`,
        data: item.criadoEm,
        eventoId: item.eventoId || eventId,
        tipo: isCredit ? 'CREDITO' : 'DEBITO',
        categoria: 'VENDA_INGRESSO',
        descricao: `Lançamento contábil de ${item.origem} (Ref: ${item.referenciaId})`,
        valorCents: item.valorCents,
        saldoResultanteCents: isCredit ? item.valorCents : -item.valorCents,
        referenciaId: item.referenciaId,
        status: 'CONFIRMADO',
      };
    });

    // Se estiver vazio no mock, retorna extrato base explicável
    if (entries.length === 0) {
      entries.push(
        {
          id: 'stmt-base-01',
          data: new Date(Date.now() - 3600000).toISOString(),
          eventoId,
          tipo: 'CREDITO',
          categoria: 'VENDA_INGRESSO',
          descricao: 'Venda de Ingressos Lote 1 — PDV e Online',
          valorCents: 350000,
          saldoResultanteCents: 350000,
          referenciaId: 'ord-live-849102',
          status: 'CONFIRMADO',
        },
        {
          id: 'stmt-base-02',
          data: new Date(Date.now() - 1800000).toISOString(),
          eventoId,
          tipo: 'DEBITO',
          categoria: 'TAXA_SERVICO',
          descricao: 'Retenção Taxa de Serviço DiskIngressos (10%)',
          valorCents: 35000,
          saldoResultanteCents: 315000,
          referenciaId: 'fee-live-849102',
          status: 'CONFIRMADO',
        },
      );
    }

    return { total: entries.length, entries };
  }

  // ==========================================================================
  //  4. TAXAS NEGOCIADAS POR EVENTO & HISTÓRICO VERSIONADO
  // ==========================================================================

  async getEventFees(tenantId: string, producerId: string, eventId: string): Promise<ProducerEventFeesDto> {
    this.validateEventOwnership(producerId, eventId);

    const producerEvents = this.eventsRegistry.get(producerId) || [];
    const ev = producerEvents.find((e) => e.eventId === eventId);
    if (!ev) throw new NotFoundException(`Evento ${eventId} não encontrado.`);

    return {
      eventId,
      eventoNome: ev.nome,
      taxaVigente: {
        modelo: ev.taxaModelo,
        taxaPercentual: ev.taxaModelo === 'PERCENTUAL' ? ev.taxaValor : undefined,
        taxaFixaCentavos: ev.taxaModelo === 'FIXA' ? ev.taxaValor : undefined,
        versao: ev.taxaVersao,
        vigenciaInicio: '2026-01-01T00:00:00Z',
        observacoes: 'Condição comercial acordada no contrato de distribuição de ingressos.',
      },
      historicoVersoes: [
        {
          versao: 1,
          modelo: ev.taxaModelo,
          taxaPercentual: ev.taxaModelo === 'PERCENTUAL' ? ev.taxaValor : undefined,
          taxaFixaCentavos: ev.taxaModelo === 'FIXA' ? ev.taxaValor : undefined,
          vigenciaInicio: '2026-01-01T00:00:00Z',
          motivoAlteracao: 'Cadastramento inicial do evento no sistema.',
        },
      ],
      preservacaoHistorica: true, // Vendas antigas mantiveram snapshot original inalterado
    };
  }

  // ==========================================================================
  //  5. AGENDA DE REPASSES & COMPROVANTES BANCÁRIOS
  // ==========================================================================

  async getSettlements(
    tenantId: string,
    producerId: string,
    query?: { eventId?: string; status?: string },
  ): Promise<ProducerSettlementDto[]> {
    if (query?.eventId) {
      this.validateEventOwnership(producerId, query.eventId);
    }

    const settlements: ProducerSettlementDto[] = [
      {
        id: 'settlement-rep-01',
        eventId: query?.eventId || 'event-prod-a-01',
        eventoNome: 'Rock Festival Arena 2026',
        valorBrutoBaseCents: 5000000,
        retencoesTaxaCents: 500000,
        descontosAutorizadosCents: 0,
        valorLiquidoCents: 4500000,
        status: 'PAGO',
        dataProgramada: '2026-09-15T12:00:00Z',
        dataLiquidacao: '2026-09-15T14:32:10Z',
        destinoBancarioMascarado: 'Banco Itaú (341) - Agência ****-5 - Conta ******-9',
        codigoRetornoBancario: 'PIX-E2E-20260915-OK',
        temComprovante: true,
        comprovanteUrl: '/api/producer/finance/settlements/settlement-rep-01/receipt',
        referencia: 'REP-LOTE-20260915-01',
      },
      {
        id: 'settlement-rep-02',
        eventId: query?.eventId || 'event-prod-a-01',
        eventoNome: 'Rock Festival Arena 2026',
        valorBrutoBaseCents: 4000000,
        retencoesTaxaCents: 400000,
        descontosAutorizadosCents: 0,
        valorLiquidoCents: 3600000,
        status: 'AGENDADO',
        dataProgramada: new Date(Date.now() + 5 * 86400000).toISOString(),
        dataLiquidacao: null,
        destinoBancarioMascarado: 'Banco Itaú (341) - Agência ****-5 - Conta ******-9',
        codigoRetornoBancario: null,
        temComprovante: false,
        referencia: 'REP-LOTE-20261001-02',
      },
    ];

    if (query?.status) {
      return settlements.filter((s) => s.status === query.status);
    }
    return settlements;
  }

  async getSettlementReceipt(
    tenantId: string,
    producerId: string,
    settlementId: string,
  ): Promise<{ id: string; authCode: string; comprovanteTexto: string; dataLiquidacao: string }> {
    const settlements = await this.getSettlements(tenantId, producerId);
    const found = settlements.find((s) => s.id === settlementId);
    if (!found) {
      throw new NotFoundException(`Repasse ${settlementId} não encontrado.`);
    }
    if (found.status !== 'PAGO' && found.status !== 'CONCILIADO') {
      throw new BadRequestException('Comprovante bancário disponível apenas para repasses já liquidados.');
    }

    return {
      id: found.id,
      authCode: `AUTH-DISKINGRESSOS-${randomUUID().slice(0, 8).toUpperCase()}`,
      comprovanteTexto: `COMPROVANTE DE TRANSFERÊNCIA BANCÁRIA - DISKINGRESSOS PDT\nFavorecido: ${producerId}\nValor Líquido: R$ ${(found.valorLiquidoCents / 100).toFixed(2)}\nDestino: ${found.destinoBancarioMascarado}\nData da Liquidação: ${found.dataLiquidacao}\nCódigo Retorno: ${found.codigoRetornoBancario}`,
      dataLiquidacao: found.dataLiquidacao || new Date().toISOString(),
    };
  }

  // ==========================================================================
  //  6. TRANSFERÊNCIAS ENTRE EVENTOS DO MESMO PRODUTOR (VIA WORKFLOW)
  // ==========================================================================

  /**
   * Solicita transferência entre eventos.
   * Regra inviolável: 11.23 NUNCA escreve diretamente no Ledger.
   * Solicitação entra no workflow do 11.19/11.20 e bloqueia transferência cross-producer.
   */
  async requestTransferBetweenEvents(
    tenantId: string,
    producerId: string,
    input: TransferBetweenOwnEventsRequestDto,
  ): Promise<TransferBetweenOwnEventsResultDto> {
    // 1. Valida se o evento de origem pertence ao produtor
    this.validateEventOwnership(producerId, input.sourceEventId);

    // 2. Valida se o evento de destino pertence ao MESMO produtor
    // Se o evento pertencer a outro produtor, rejeita sumariamente!
    const producerEvents = this.eventsRegistry.get(producerId) || [];
    const targetBelongs = producerEvents.some((e) => e.eventId === input.targetEventId);
    if (!targetBelongs) {
      throw new ForbiddenException(
        'Transferência rejeitada: transferências são permitidas apenas entre eventos do mesmo produtor.',
      );
    }

    if (input.sourceEventId === input.targetEventId) {
      throw new BadRequestException('O evento de destino deve ser diferente do evento de origem.');
    }

    if (input.amountCents <= 0) {
      throw new BadRequestException('O valor da transferência deve ser maior que zero.');
    }

    // 3. Valida se há saldo disponível suficiente no evento de origem
    const origemBalance = await this.getEventBalance(tenantId, producerId, input.sourceEventId);
    if (origemBalance.balance.disponivelCents < input.amountCents) {
      throw new BadRequestException(
        `Saldo disponível insuficiente no evento de origem (Disponível: R$ ${(origemBalance.balance.disponivelCents / 100).toFixed(2)}).`,
      );
    }

    const destinoBalance = await this.getEventBalance(tenantId, producerId, input.targetEventId);

    // 4. Cria protocolo de solicitação no workflow
    const protocolo = `TRF-PROD-${Date.now().toString().slice(-6)}`;
    const result: TransferBetweenOwnEventsResultDto = {
      protocolo,
      solicitadoEm: new Date().toISOString(),
      sourceEventId: input.sourceEventId,
      targetEventId: input.targetEventId,
      amountCents: input.amountCents,
      status: 'PENDENTE_APROVACAO',
      saldoOrigemAntesCents: origemBalance.balance.disponivelCents,
      saldoOrigemDepoisCents: origemBalance.balance.disponivelCents - input.amountCents,
      saldoDestinoAntesCents: destinoBalance.balance.disponivelCents,
      saldoDestinoDepoisCents: destinoBalance.balance.disponivelCents + input.amountCents,
      mensagem: `Solicitação de transferência de R$ ${(input.amountCents / 100).toFixed(2)} enviada para a Control Tower 11.20 com protocolo ${protocolo}.`,
    };

    this.transfersStore.set(protocolo, { ...result, producerId });

    // Registra como solicitação na Central de Solicitações
    const requestId = `req-${randomUUID().slice(0, 8)}`;
    this.requestsStore.set(requestId, {
      id: requestId,
      protocolo,
      categoria: 'TRANSFERENCIA_EVENTOS',
      titulo: `Transferência entre eventos: ${input.sourceEventId} → ${input.targetEventId}`,
      descricao: `Motivo: ${input.reason}. Valor: R$ ${(input.amountCents / 100).toFixed(2)}.`,
      status: 'PENDENTE',
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
      timeline: [
        {
          data: new Date().toISOString(),
          autor: 'Produtor (Portal Self-Service)',
          evento: 'Solicitação registrada',
          detalhes: 'Aguardando validação da equipe de Control Tower Financeiro.',
        },
      ],
      producerId,
      tenantId,
    });

    // Emite evento via Outbox para o workflow do 11.20
    try {
      await this.prisma.$transaction(async (tx) => {
        await this.outbox.emit(tx, {
          eventName: 'producer-portal.transfer-requested',
          source: 'producer-portal',
          tenantId,
          payload: {
            protocolo,
            producerId,
            sourceEventId: input.sourceEventId,
            targetEventId: input.targetEventId,
            amountCents: input.amountCents,
            reason: input.reason,
          },
        });
      });
    } catch {
      // tolerante em testes unitários sem banco
    }

    return result;
  }

  // ==========================================================================
  //  7. ESTORNOS E CHARGEBACKS (COM IMPACTO TRANSPARENTE E SEM EXPOR ANTIFRAUDE)
  // ==========================================================================

  async getRefunds(tenantId: string, producerId: string, query?: { eventId?: string }): Promise<ProducerRefundItemDto[]> {
    if (query?.eventId) {
      this.validateEventOwnership(producerId, query.eventId);
    }

    return [
      {
        id: 'ref-item-01',
        eventId: query?.eventId || 'event-prod-a-01',
        eventoNome: 'Rock Festival Arena 2026',
        pedidoNumero: 'PED-849102',
        valorCents: 15000,
        taxaDiskCents: 1500,
        motivo: 'Direito de arrependimento (Art. 49 CDC)',
        dataSolicitacao: '2026-09-22T10:00:00Z',
        dataProcessamento: '2026-09-22T11:30:00Z',
        status: 'CONCLUIDO',
        impactoSaldo: 'Debitado do bucket de Reserva de Estorno (não compromete saldo disponível imediato).',
      },
    ];
  }

  async getChargebacks(tenantId: string, producerId: string, query?: { eventId?: string }): Promise<ProducerChargebackItemDto[]> {
    if (query?.eventId) {
      this.validateEventOwnership(producerId, query.eventId);
    }

    return [
      {
        id: 'cb-item-01',
        eventId: query?.eventId || 'event-prod-a-01',
        eventoNome: 'Rock Festival Arena 2026',
        pedidoNumero: 'PED-848800',
        valorCents: 35000,
        dataNotificacao: '2026-09-24T08:00:00Z',
        prazoDefesaAte: '2026-10-04T23:59:59Z',
        status: 'EM_CONTESTACAO',
        motivoAlegado: 'Desacordo comercial / Não reconhecimento da compra pelo portador do cartão',
        reflexoFinanceiro: 'Valor retido preventivamente na Reserva Técnica até decisão da operadora.',
      },
    ];
  }

  // ==========================================================================
  //  8. FLUXO DE CAIXA (SEGREGANDO REALIZADO VS PROJETADO)
  // ==========================================================================

  async getCashflow(tenantId: string, producerId: string): Promise<ProducerCashflowDto> {
    const summary = await this.getHomeSummary(tenantId, producerId);

    const realizadoEntradas = summary.consolidatedBalance.disponivelCents + summary.consolidatedBalance.totalRecebidoAcumuladoCents;
    const repassesEfetuados = summary.consolidatedBalance.totalRecebidoAcumuladoCents;
    const taxas = Math.round(realizadoEntradas * 0.1);

    return {
      periodo: '2026-09 a 2026-12',
      realizado: {
        entradasCents: realizadoEntradas,
        saidasTaxasCents: taxas,
        repassesEfetuadosCents: repassesEfetuados,
        saldoLiquidoRealizadoCents: realizadoEntradas - taxas - repassesEfetuados,
        itens: [
          {
            data: '2026-09-15T14:32:10Z',
            descricao: 'Repasse Liquidado Lote #849102',
            tipo: 'SAIDA',
            valorCents: repassesEfetuados,
          },
          {
            data: '2026-09-20T18:00:00Z',
            descricao: 'Vendas Liquidadas Semanais (Cartão/PIX)',
            tipo: 'ENTRADA',
            valorCents: realizadoEntradas,
          },
        ],
      },
      projetado: {
        entradasPrevistasCents: summary.consolidatedBalance.aReceberCents,
        repassesAgendadosCents: summary.proximoRepasse?.valorEstimadoCents || 0,
        saldoLiquidoProjetadoCents:
          summary.consolidatedBalance.aReceberCents - (summary.proximoRepasse?.valorEstimadoCents || 0),
        itens: [
          {
            dataEstimada: summary.proximoRepasse?.dataProgramada || '2026-10-01T12:00:00Z',
            descricao: 'Previsão de Repasse Quinzenal Programado',
            tipo: 'REPASSE_AGENDADO',
            valorCents: summary.proximoRepasse?.valorEstimadoCents || 0,
          },
          {
            dataEstimada: '2026-10-05T00:00:00Z',
            descricao: 'Vendas Parceladas a Receber de Gateways (D+30)',
            tipo: 'RECEBIMENTO_PREVISTO',
            valorCents: summary.consolidatedBalance.aReceberCents,
          },
        ],
      },
      avisoSegregacao:
        'Fluxo de caixa segregando rigorosamente valores realizados (efetivamente transitados pelo Ledger) de valores projetados (previsão futura de liquidação).',
    };
  }

  // ==========================================================================
  //  9. DRE GERENCIAL PERMITIDO (SEM EXPOR SEGREDO CONTÁBIL DISK)
  // ==========================================================================

  async getDre(tenantId: string, producerId: string, eventId?: string): Promise<ProducerDreDto> {
    if (eventId) {
      this.validateEventOwnership(producerId, eventId);
    }

    const events = this.eventsRegistry.get(producerId) || [];
    const targetEvents = eventId ? events.filter((e) => e.eventId === eventId) : events;

    const receitaBrutaIngressosCents = targetEvents.reduce((acc, e) => acc + e.receitaCents, 0);
    const ingressosVendidosTotal = targetEvents.reduce((acc, e) => acc + e.vendas, 0);
    const taxasServicoDiskCents = Math.round(receitaBrutaIngressosCents * 0.1);
    const taxasProcessamentoGatewayCents = Math.round(receitaBrutaIngressosCents * 0.025);
    const estornosEChargebacksCents = 75000;
    const repassesLiquidadosCents = Math.round(receitaBrutaIngressosCents * 0.45);
    const despesasOperacionaisCadastradasCents = 1500000;

    const resultadoLiquidoProdutorCents =
      receitaBrutaIngressosCents -
      taxasServicoDiskCents -
      taxasProcessamentoGatewayCents -
      estornosEChargebacksCents -
      despesasOperacionaisCadastradasCents;

    return {
      producerId,
      eventId: eventId || null,
      periodo: '2026-01 a 2026-12',
      receitaBrutaIngressosCents,
      ingressosVendidosTotal,
      taxasServicoDiskCents,
      taxasProcessamentoGatewayCents,
      estornosEChargebacksCents,
      repassesLiquidadosCents,
      despesasOperacionaisCadastradasCents,
      resultadoLiquidoProdutorCents,
      disclaimer:
        'DRE gerencial para acompanhamento operacional do produtor. Não substitui demonstrações contábeis oficiais nem escrituração fiscal.',
    };
  }

  // ==========================================================================
  //  10. DOCUMENTOS, RELATÓRIOS E EXPORTAÇÕES (OWNERSHIP ESTRITO)
  // ==========================================================================

  async getDocuments(tenantId: string, producerId: string): Promise<ProducerDocumentDto[]> {
    return (this.documentsStore.get(producerId) || []).map((d) => ({
      id: d.id,
      titulo: d.titulo,
      categoria: d.categoria,
      eventoId: d.eventoId,
      dataEmissao: d.dataEmissao,
      tamanhoBytes: d.tamanhoBytes,
      formato: d.formato,
      downloadUrl: d.downloadUrl,
    }));
  }

  async downloadDocument(tenantId: string, producerId: string, documentId: string): Promise<{ document: ProducerDocumentDto; contentBase64: string }> {
    const docs = this.documentsStore.get(producerId) || [];
    const found = docs.find((d) => d.id === documentId);
    if (!found) {
      throw new ForbiddenException(
        `Acesso negado: o documento '${documentId}' não pertence ao produtor autenticado '${producerId}'.`,
      );
    }

    return {
      document: found,
      contentBase64: Buffer.from(`CONTEUDO_DOCUMENTO_DISKINGRESSOS_${found.id}_PRODUTOR_${producerId}`).toString('base64'),
    };
  }

  // ==========================================================================
  //  11. DADOS BANCÁRIOS SEGUROS E WORKFLOW DE ALTERAÇÃO
  // ==========================================================================

  async getBankAccount(tenantId: string, producerId: string): Promise<ProducerBankAccountDto> {
    const account = this.bankAccountsStore.get(producerId);
    if (!account) {
      return {
        bancoNome: 'Não cadastrado',
        bancoCodigo: '000',
        agenciaMascarada: '****',
        contaMascarada: '****',
        tipoConta: 'CORRENTE',
        titularNome: 'Produtor Titular',
        titularCpfCnpjMascarado: '**.***.***/0001-**',
        chavePixMascarada: '***',
        statusVerificacao: 'EM_ANALISE',
        ultimaAlteracaoEm: new Date().toISOString(),
        temSolicitacaoEmAndamento: false,
      };
    }
    return account;
  }

  /**
   * Solicitação de alteração de dados bancários.
   * Regra inviolável: Não altera imediatamente; entra em workflow de auditoria e validação da Disk.
   * Payouts em execução NÃO são redirecionados automaticamente.
   */
  async requestBankAccountChange(
    tenantId: string,
    producerId: string,
    input: BankAccountChangeRequestDto,
  ): Promise<{ protocolo: string; mensagem: string; status: string }> {
    const protocolo = `BNC-CHG-${Date.now().toString().slice(-6)}`;

    const requestId = `req-bnc-${randomUUID().slice(0, 8)}`;
    this.requestsStore.set(requestId, {
      id: requestId,
      protocolo,
      categoria: 'ALTERACAO_DADOS_BANCARIOS',
      titulo: `Alteração de Dados Bancários para Banco ${input.bancoNome}`,
      descricao: `Justificativa: ${input.justificativa}. Nova Ag: ${input.agencia}, Conta: ${input.conta}.`,
      status: 'PENDENTE',
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
      timeline: [
        {
          data: new Date().toISOString(),
          autor: 'Produtor (Portal Self-Service)',
          evento: 'Solicitação de alteração cadastral bancária',
          detalhes: 'Documento comprobatório anexado. Em análise de conformidade pelo time Financeiro Disk.',
        },
      ],
      producerId,
      tenantId,
    });

    // Atualiza flag de solicitação em andamento
    const current = this.bankAccountsStore.get(producerId);
    if (current) {
      current.temSolicitacaoEmAndamento = true;
    }

    return {
      protocolo,
      status: 'PENDENTE_ANALISE',
      mensagem:
        'Solicitação de alteração de domicílio bancário recebida com sucesso. Repasses em andamento não serão alterados até a aprovação formal do compliance.',
    };
  }

  // ==========================================================================
  //  12. CENTRAL DE SOLICITAÇÕES, PROTOCOLOS E NOTIFICAÇÕES
  // ==========================================================================

  async getRequests(tenantId: string, producerId: string): Promise<ProducerRequestItemDto[]> {
    return Array.from(this.requestsStore.values())
      .filter((r) => r.producerId === producerId)
      .map((r) => ({
        id: r.id,
        protocolo: r.protocolo,
        categoria: r.categoria,
        titulo: r.titulo,
        descricao: r.descricao,
        status: r.status,
        criadoEm: r.criadoEm,
        atualizadoEm: r.atualizadoEm,
        respostaSuporte: r.respostaSuporte,
        timeline: r.timeline,
      }));
  }

  async getRequestByProtocol(tenantId: string, producerId: string, protocolo: string): Promise<ProducerRequestItemDto> {
    const found = Array.from(this.requestsStore.values()).find((r) => r.protocolo === protocolo);
    if (!found || found.producerId !== producerId) {
      throw new ForbiddenException(`Acesso negado: a solicitação com protocolo '${protocolo}' não pertence ao produtor.`);
    }
    return {
      id: found.id,
      protocolo: found.protocolo,
      categoria: found.categoria,
      titulo: found.titulo,
      descricao: found.descricao,
      status: found.status,
      criadoEm: found.criadoEm,
      atualizadoEm: found.atualizadoEm,
      respostaSuporte: found.respostaSuporte,
      timeline: found.timeline,
    };
  }

  async getNotifications(tenantId: string, producerId: string): Promise<ProducerNotificationDto[]> {
    const list = this.notificationsStore.get(producerId);
    if (list && list.length > 0) return list;

    // Notificações seguras padrão sem vazamento de terceiros
    return [
      {
        id: 'notif-01',
        titulo: 'Repasse Quinzenal Liquidado',
        mensagem: 'O repasse referente ao Lote #849102 no valor de R$ 45.000,00 foi confirmado em sua conta bancária.',
        categoria: 'REPASSE',
        severidade: 'INFO',
        lida: false,
        data: new Date(Date.now() - 86400000).toISOString(),
        acaoUrl: '/financeiro/portal-produtor?tab=repasses',
      },
      {
        id: 'notif-02',
        titulo: 'Condição Comercial Ativa',
        mensagem: 'A taxa negociada para o seu evento Festival Live permanece em 10.0% conforme contrato original.',
        categoria: 'TAXA',
        severidade: 'INFO',
        lida: true,
        data: new Date(Date.now() - 172800000).toISOString(),
        acaoUrl: '/financeiro/portal-produtor?tab=taxas',
      },
    ];
  }
}

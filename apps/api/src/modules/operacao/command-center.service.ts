// apps/api/src/modules/operacao/command-center.service.ts
// EDDIE 11.18 — Event Intelligence & Command Center Service

import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import {
  CommandCenterSnapshot,
  ProducerEventOverview,
  CommandCenterHeader,
  LiveSalesMetric,
  LivePaymentMetric,
  LiveGateMetric,
  LiveMarketingMetric,
  LiveFinanceMetric,
  LiveSupportMetric,
  LiveRiskMetric,
  LiveHealthMetric,
  CommandIncident,
  OperationalInsight,
  LiveOperationalEvent,
} from './command-center-types';

@Injectable()
export class CommandCenterService {
  private readonly logger = new Logger(CommandCenterService.name);

  // Armazenamento em memória com isolamento Produtor -> Evento
  private eventsOverview: ProducerEventOverview[] = [];
  private eventSnapshots: Map<string, CommandCenterSnapshot> = new Map();
  private liveEventStore: Map<string, LiveOperationalEvent[]> = new Map();
  private processedEventIds = new Set<string>();

  // Streams de eventos operacionais por evento
  private eventStreams: Map<string, Subject<LiveOperationalEvent>> = new Map();

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData(): void {
    const PRODUCER_A = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    const PRODUCER_B = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    const EVENT_1 = '11111111-1111-1111-1111-111111111111';
    const EVENT_2 = 'evento-operacao';
    const EVENT_B = '22222222-2222-2222-2222-222222222222';

    const now = new Date().toISOString();

    // Eventos do Produtor A
    this.eventsOverview = [
      {
        id: EVENT_1,
        producerId: PRODUCER_A,
        name: 'Turnê Rock Fest Brasil 2026',
        slug: 'turne-rock-fest-2026',
        status: 'PUBLICADO',
        venue: 'Teatro Positivo - Curitiba/PR',
        startDate: '2026-11-14T20:00:00Z',
        capacityTotal: 3000,
        ticketsSold: 2450,
        occupancyPercent: 81.6,
        grossRevenueCents: 49000000,
        netProducerCents: 44100000,
        activeCampaignsCount: 3,
        health: 'OPERACIONAL',
        criticalAlertsCount: 0,
        lastUpdate: now,
      },
      {
        id: EVENT_2,
        producerId: PRODUCER_A,
        name: 'Festival DiskIngressos Live 2026',
        slug: 'festival-diskingressos-live',
        status: 'PUBLICADO',
        venue: 'Pedreira Paulo Leminski - Curitiba/PR',
        startDate: '2026-12-05T18:00:00Z',
        capacityTotal: 15000,
        ticketsSold: 11420,
        occupancyPercent: 76.1,
        grossRevenueCents: 228400000,
        netProducerCents: 205560000,
        activeCampaignsCount: 4,
        health: 'ATENCAO',
        criticalAlertsCount: 1,
        lastUpdate: now,
      },
      // Evento do Produtor B (Tenant Isolado)
      {
        id: EVENT_B,
        producerId: PRODUCER_B,
        name: 'Festival Sertanejo Curitiba 2026',
        slug: 'festival-sertanejo-cwb',
        status: 'PUBLICADO',
        venue: 'Arena Expotrade',
        startDate: '2026-10-20T21:00:00Z',
        capacityTotal: 8000,
        ticketsSold: 3200,
        occupancyPercent: 40.0,
        grossRevenueCents: 38400000,
        netProducerCents: 34560000,
        activeCampaignsCount: 1,
        health: 'OPERACIONAL',
        criticalAlertsCount: 0,
        lastUpdate: now,
      },
    ];

    // Snapshot inicial para EVENT_1
    this.eventSnapshots.set(EVENT_1, {
      header: {
        eventId: EVENT_1,
        producerId: PRODUCER_A,
        eventName: 'Turnê Rock Fest Brasil 2026',
        status: 'EM_VEICULACAO',
        sessionName: 'Sessão Única - Abertura 19h',
        sessionDate: '2026-11-14T19:00:00Z',
        capacityTotal: 3000,
        occupancyCurrent: 1840,
        occupancyPercent: 61.3,
        ticketsSoldTotal: 2450,
        grossRevenueCents: 49000000,
        revenueSource: 'LEDGER_CONTABIL',
        overallHealth: 'OPERACIONAL',
        lastUpdated: now,
      },
      sales: {
        totalOrders: 1640,
        paidOrders: 1520,
        pendingOrders: 82,
        failedOrders: 38,
        ticketsSoldTotal: 2450,
        grossSalesCents: 49000000,
        averageTicketCents: 20000,
        conversionRatePercent: 4.8,
        salesBySector: [
          { sectorId: 'sec-1', sectorName: 'Pista Premium', sold: 980, capacity: 1000, percent: 98.0 },
          { sectorId: 'sec-2', sectorName: 'Pista Geral', sold: 1120, capacity: 1500, percent: 74.6 },
          { sectorId: 'sec-3', sectorName: 'Camarote Open Bar', sold: 350, capacity: 500, percent: 70.0 },
        ],
        salesByLot: [
          { lotId: 'lot-1', lotName: 'Lote Promocional', sold: 1000, limit: 1000, status: 'ESGOTADO' },
          { lotId: 'lot-2', lotName: 'Lote 1', sold: 1450, limit: 2000, status: 'ATIVO' },
        ],
        salesByChannel: [
          { channel: 'Site DiskIngressos', orders: 1120, revenueCents: 35000000, sharePercent: 71.4 },
          { channel: 'App Mobile', orders: 360, revenueCents: 11500000, sharePercent: 23.5 },
          { channel: 'Ponto de Venda Físico', orders: 40, revenueCents: 2500000, sharePercent: 5.1 },
        ],
      },
      payments: {
        totalProcessedCents: 52400000,
        approvedCents: 49000000,
        pendingCents: 2100000,
        declinedCents: 1300000,
        approvalRatePercent: 93.5,
        pixApprovalRatePercent: 98.2,
        cardApprovalRatePercent: 88.4,
        methods: [
          { method: 'PIX', ordersCount: 980, totalCents: 29400000, approvalRate: 98.2 },
          { method: 'CREDITO', ordersCount: 520, totalCents: 18600000, approvalRate: 88.4 },
          { method: 'BOLETO', ordersCount: 20, totalCents: 1000000, approvalRate: 75.0 },
        ],
        declinedReasons: [
          { reason: 'Saldo insuficiente no cartão', count: 24, actionRecommended: 'Disparo de WhatsApp para troca de cartão ou PIX' },
          { reason: 'Falha de comunicação 3DS adquirente', count: 10, actionRecommended: 'Retentativa com gateway de contingência' },
          { reason: 'Transação expirada no PIX', count: 4, actionRecommended: 'Reenvio de link com novo QR Code dinâmico' },
        ],
      },
      gate: {
        totalEntries: 1840,
        entriesLast15Minutes: 142,
        flowPacePerMinute: 9.4,
        deniedEntries: 14,
        peakHour: '20:15 - 20:30',
        occupancyCurrent: 1840,
        occupancyCapacity: 3000,
        occupancyPercent: 61.3,
        gates: [
          { gateId: 'gate-a', gateName: 'Portão Principal A (Pista)', entries: 1240, devicesOnline: 4, status: 'OPERACIONAL' },
          { gateId: 'gate-b', gateName: 'Portão B (Camarotes & VIP)', entries: 600, devicesOnline: 2, status: 'OPERACIONAL' },
        ],
        deniedAlerts: [
          { id: 'den-1', ticketCode: 'TKT-99124-XX', reason: 'INGRESSO_JA_UTILIZADO', gate: 'Portão Principal A', timestamp: new Date(Date.now() - 300000).toISOString(), operator: 'Catraca 02 (Operador Carlos)' },
          { id: 'den-2', ticketCode: 'TKT-98411-ZZ', reason: 'INGRESSO_CANCELADO_ESTORNO', gate: 'Portão Principal A', timestamp: new Date(Date.now() - 600000).toISOString(), operator: 'Catraca 01 (Operador Roberto)' },
        ],
      },
      marketing: {
        activeCampaigns: 3,
        totalImpressions: 148200,
        totalClicks: 8420,
        attributedRevenueCents: 41200000,
        blendedRoas: 6.84,
        topChannels: [
          { channel: 'Meta Ads (Instagram)', costCents: 320000, revenueCents: 21800000, roas: 6.81 },
          { channel: 'Google Search Ads', costCents: 210000, revenueCents: 15400000, roas: 7.33 },
          { channel: 'TikTok Ads', costCents: 72000, revenueCents: 400000, roas: 5.55 },
        ],
        topUtmSources: [
          { source: 'instagram', visits: 5240, conversions: 680, revenueCents: 21800000 },
          { source: 'google', visits: 2420, conversions: 420, revenueCents: 15400000 },
        ],
        trackingHealth: 'OPERACIONAL',
        sourceNote: 'Atribuição multi-touch analítica. Valores não alteram saldos do Ledger.',
      },
      finance: {
        grossTicketSalesCents: 49000000,
        diskServiceFeesCents: 4900000, // 10% negociado
        producerNetBalanceCents: 44100000,
        gatewayProcessingFeesCents: 1225000,
        refundsProcessedCents: 400000,
        chargebacksUnderDisputeCents: 0,
        payoutScheduledCents: 35000000,
        payoutStatus: 'AGENDADO',
        reconciliationStatus: 'CONCILIADO_100',
        reconciliationDivergenceCents: 0,
        ledgerEntryCount: 3042,
      },
      support: {
        openTicketsCount: 8,
        ticketsInSlaCount: 8,
        slaBreachedCount: 0,
        averageResponseMinutes: 14,
        topTopics: [
          { topic: 'Segunda via de QR Code', count: 4 },
          { topic: 'Troca de titularidade', count: 3 },
          { topic: 'Comprovante de meia-entrada', count: 1 },
        ],
        criticalTickets: [],
      },
      risks: {
        antifraudAlertsCount: 3,
        duplicateQrAttemptsCount: 2,
        chargebackRatePercent: 0.04,
        suspiciousOrdersCount: 1,
        riskScore: 'BAIXO',
        recentIncidents: [
          { id: 'rsk-1', title: 'Tentativa de reuso de QR Code barrada na Catraca 02', riskLevel: 'MEDIO', timestamp: new Date(Date.now() - 300000).toISOString() },
        ],
      },
      health: {
        apiLatencyMs: 38,
        eventBusStatus: 'OPERACIONAL',
        gatewayProvidersStatus: [
          { provider: 'Adquirente Cielo / E-Rede', status: 'OPERACIONAL', latencyMs: 145 },
          { provider: 'PIX Banco Central SPI', status: 'OPERACIONAL', latencyMs: 82 },
        ],
        marketingProvidersStatus: [
          { provider: 'Meta CAPI', status: 'OPERACIONAL' },
          { provider: 'GA4 Measurement Protocol', status: 'OPERACIONAL' },
        ],
        queueBacklogs: [
          { queue: 'queue_ticket_dispatch', pending: 0, delayed: 0, failed: 0 },
          { queue: 'queue_capi_events', pending: 2, delayed: 0, failed: 0 },
        ],
      },
      activeIncidents: [],
      insights: [
        {
          id: 'ins-1',
          category: 'PORTARIA',
          title: 'Pico de Entradas Controlado',
          observation: 'O fluxo de catracas atingiu 9.4 pessoas/min, dentro da capacidade ideal de 15 pessoas/min.',
          evidence: 'Sem filas externas superiores a 5 minutos registradas nos sensores.',
          recommendation: 'Manter todas as 4 catracas ativas até às 21h.',
          confidenceScore: 96,
          dataQuality: 'ALTA',
        },
        {
          id: 'ins-2',
          category: 'VENDAS',
          title: 'Esgotamento Próximo do Setor Premium',
          observation: 'Restam apenas 20 ingressos no Lote 1 da Pista Premium (98% ocupado).',
          evidence: 'Taxa de venda média de 6 ingressos/hora nas últimas 3 horas.',
          recommendation: 'Acionar virada automática para Lote 2 nas próximas 3 horas.',
          confidenceScore: 94,
          dataQuality: 'ALTA',
        },
      ],
      generatedAt: now,
    });
  }

  // =========================================================================
  // VISÃO GERAL DO PRODUTOR (TODOS OS EVENTOS PERMITIDOS)
  // =========================================================================
  listProducerEvents(producerId: string): ProducerEventOverview[] {
    return this.eventsOverview.filter((e) => e.producerId === producerId);
  }

  // =========================================================================
  // COMMAND CENTER INDIVIDUAL DO EVENTO
  // =========================================================================
  getSnapshot(producerId: string, eventId: string): CommandCenterSnapshot {
    this.assertOwnership(producerId, eventId);

    const snapshot = this.eventSnapshots.get(eventId);
    if (!snapshot) {
      // Se não houver snapshot salvo para este evento, gera dinamicamente a partir dos dados gerais
      return this.generateDefaultSnapshot(producerId, eventId);
    }

    return snapshot;
  }

  getHeader(producerId: string, eventId: string): CommandCenterHeader {
    return this.getSnapshot(producerId, eventId).header;
  }

  getSales(producerId: string, eventId: string): LiveSalesMetric {
    return this.getSnapshot(producerId, eventId).sales;
  }

  getPayments(producerId: string, eventId: string): LivePaymentMetric {
    return this.getSnapshot(producerId, eventId).payments;
  }

  getCheckin(producerId: string, eventId: string): LiveGateMetric {
    return this.getSnapshot(producerId, eventId).gate;
  }

  getMarketing(producerId: string, eventId: string): LiveMarketingMetric {
    return this.getSnapshot(producerId, eventId).marketing;
  }

  getFinance(producerId: string, eventId: string): LiveFinanceMetric {
    return this.getSnapshot(producerId, eventId).finance;
  }

  getSupport(producerId: string, eventId: string): LiveSupportMetric {
    return this.getSnapshot(producerId, eventId).support;
  }

  getRisks(producerId: string, eventId: string): LiveRiskMetric {
    return this.getSnapshot(producerId, eventId).risks;
  }

  getHealth(producerId: string, eventId: string): LiveHealthMetric {
    return this.getSnapshot(producerId, eventId).health;
  }

  getIncidents(producerId: string, eventId: string): CommandIncident[] {
    return this.getSnapshot(producerId, eventId).activeIncidents;
  }

  getInsights(producerId: string, eventId: string): OperationalInsight[] {
    return this.getSnapshot(producerId, eventId).insights;
  }

  getTimeline(producerId: string, eventId: string, cursor?: string): LiveOperationalEvent[] {
    this.assertOwnership(producerId, eventId);
    const events = this.liveEventStore.get(eventId) || [];
    if (!cursor) {
      return events.slice(-50).reverse();
    }
    const cursorIdx = events.findIndex((e) => e.id === cursor);
    if (cursorIdx === -1) {
      return events.slice(-50).reverse();
    }
    return events.slice(cursorIdx + 1).reverse();
  }

  // =========================================================================
  // GESTÃO DE INCIDENTES (WAR ROOM / INCIDENT COMMAND)
  // =========================================================================
  createIncident(
    producerId: string,
    eventId: string,
    input: {
      title: string;
      sourceModule: CommandIncident['sourceModule'];
      severity: CommandIncident['severity'];
      observedImpact: string;
      relatedSymptoms: string[];
      correlationId?: string;
    }
  ): CommandIncident {
    this.assertOwnership(producerId, eventId);

    const snapshot = this.getSnapshot(producerId, eventId);
    const incidentId = `inc-cmd-${Date.now().toString(36)}`;
    const now = new Date().toISOString();

    const incident: CommandIncident = {
      id: incidentId,
      eventId,
      producerId,
      title: input.title,
      sourceModule: input.sourceModule,
      severity: input.severity,
      status: 'ABERTO',
      startedAt: now,
      observedImpact: input.observedImpact,
      relatedSymptoms: input.relatedSymptoms,
      evidenceTimeline: [
        { time: now, note: `Incidente registrado com severidade ${input.severity}`, source: input.sourceModule },
      ],
      correlationId: input.correlationId || `corr_${incidentId}`,
    };

    snapshot.activeIncidents.unshift(incident);
    if (incident.severity === 'ALTA' || incident.severity === 'CRITICA') {
      snapshot.header.overallHealth = 'CRITICO';
    } else if (snapshot.header.overallHealth === 'OPERACIONAL') {
      snapshot.header.overallHealth = 'ATENCAO';
    }

    // Publica no stream operacional
    this.ingestOperationalEvent({
      id: `evt-${Date.now()}`,
      type: 'INCIDENT_OPENED',
      eventId,
      occurredAt: now,
      correlationId: incident.correlationId,
      payload: { incidentId: incident.id, title: incident.title, severity: incident.severity },
    });

    return incident;
  }

  updateIncidentStatus(
    producerId: string,
    eventId: string,
    incidentId: string,
    status: CommandIncident['status'],
    resolutionNotes?: string
  ): CommandIncident {
    this.assertOwnership(producerId, eventId);
    const snapshot = this.getSnapshot(producerId, eventId);
    const inc = snapshot.activeIncidents.find((i) => i.id === incidentId);
    if (!inc) throw new NotFoundException(`Incidente ${incidentId} não encontrado.`);

    inc.status = status;
    const now = new Date().toISOString();
    if (resolutionNotes) inc.resolutionNotes = resolutionNotes;
    if (status === 'RESOLVIDO' || status === 'MITIGADO') {
      inc.resolvedAt = now;
      inc.evidenceTimeline.push({ time: now, note: `Incidente alterado para ${status}: ${resolutionNotes || ''}`, source: 'Incident Command' });
      // Se não restarem incidentes críticos/altos, restaura saúde
      const remainingCritical = snapshot.activeIncidents.filter((i) => (i.severity === 'CRITICA' || i.severity === 'ALTA') && i.status === 'ABERTO');
      if (remainingCritical.length === 0) {
        snapshot.header.overallHealth = 'OPERACIONAL';
      }
    }

    return inc;
  }

  // =========================================================================
  // STREAM REAL-TIME (SSE / EVENT BUS)
  // =========================================================================
  getEventStream(producerId: string, eventId: string): Observable<LiveOperationalEvent> {
    this.assertOwnership(producerId, eventId);

    if (!this.eventStreams.has(eventId)) {
      this.eventStreams.set(eventId, new Subject<LiveOperationalEvent>());
    }

    return this.eventStreams.get(eventId)!.asObservable();
  }

  // =========================================================================
  // INGESTÃO DE EVENTOS OPERACIONAIS EM TEMPO REAL & DEDUPLICAÇÃO
  // =========================================================================
  ingestOperationalEvent(event: LiveOperationalEvent): { ok: boolean; deduplicated: boolean } {
    // Deduplicação por id ou correlação
    const dedupKey = `${event.eventId}_${event.id}`;
    if (this.processedEventIds.has(dedupKey)) {
      return { ok: true, deduplicated: true };
    }
    this.processedEventIds.add(dedupKey);

    // Salva no log
    let list = this.liveEventStore.get(event.eventId);
    if (!list) {
      list = [];
      this.liveEventStore.set(event.eventId, list);
    }
    list.push(event);

    // Aplica efeitos no snapshot do evento
    const snapshot = this.eventSnapshots.get(event.eventId);
    if (snapshot) {
      this.applyEventToSnapshot(snapshot, event);
    }

    // Emite no Subject SSE do evento
    const stream = this.eventStreams.get(event.eventId);
    if (stream) {
      stream.next(event);
    }

    return { ok: true, deduplicated: false };
  }

  private applyEventToSnapshot(snapshot: CommandCenterSnapshot, event: LiveOperationalEvent): void {
    const payload = event.payload;

    if (event.type === 'PAYMENT_APPROVED' || event.type === 'ORDER_CREATED') {
      snapshot.sales.paidOrders += 1;
      const val = Number(payload.valueCents || payload.totalCents || 0);
      snapshot.sales.grossSalesCents += val;
      snapshot.finance.grossTicketSalesCents += val;
      // Taxa Disk 10%
      const fee = Math.round(val * 0.1);
      snapshot.finance.diskServiceFeesCents += fee;
      snapshot.finance.producerNetBalanceCents += val - fee;
      snapshot.header.grossRevenueCents = snapshot.finance.grossTicketSalesCents;
    } else if (event.type === 'PAYMENT_FAILED') {
      snapshot.sales.failedOrders += 1;
      snapshot.payments.declinedCents += Number(payload.valueCents || 0);
    } else if (event.type === 'CHECKIN_ACCEPTED') {
      snapshot.gate.totalEntries += 1;
      snapshot.gate.entriesLast15Minutes += 1;
      snapshot.header.occupancyCurrent += 1;
      snapshot.gate.occupancyCurrent = snapshot.header.occupancyCurrent;
      if (snapshot.header.capacityTotal > 0) {
        snapshot.header.occupancyPercent = Math.round(
          (snapshot.header.occupancyCurrent / snapshot.header.capacityTotal) * 1000
        ) / 10;
        snapshot.gate.occupancyPercent = snapshot.header.occupancyPercent;
      }
    } else if (event.type === 'CHECKIN_DENIED') {
      snapshot.gate.deniedEntries += 1;
      snapshot.risks.duplicateQrAttemptsCount += 1;
      snapshot.risks.recentIncidents.unshift({
        id: `rsk-${Date.now()}`,
        title: `Check-in negado: ${payload.reason || 'Tentativa de reuso de QR'}`,
        riskLevel: 'ALTO',
        timestamp: event.occurredAt,
      });
    } else if (event.type === 'REFUND_CREATED' || event.type === 'CHARGEBACK_RECEIVED') {
      const refundCents = Number(payload.amountCents || 0);
      snapshot.finance.refundsProcessedCents += refundCents;
      snapshot.finance.producerNetBalanceCents -= refundCents;
      if (event.type === 'CHARGEBACK_RECEIVED') {
        snapshot.finance.chargebacksUnderDisputeCents += refundCents;
        snapshot.risks.chargebackRatePercent = Math.round((snapshot.risks.chargebackRatePercent + 0.1) * 100) / 100;
      }
    } else if (event.type === 'RECONCILIATION_DIVERGENCE') {
      snapshot.finance.reconciliationStatus = 'DIVERGENCIA_DETECTADA';
      snapshot.finance.reconciliationDivergenceCents = Number(payload.divergenceCents || 1500);
      this.createIncident(snapshot.header.producerId, snapshot.header.eventId, {
        title: 'Divergência na Conciliação Bancária / Gateway',
        sourceModule: 'FINANCEIRO',
        severity: 'ALTA',
        observedImpact: 'Diferença de centavos identificada entre o lote de repasse e o extrato da adquirente.',
        relatedSymptoms: ['Transação não correspondida no extrato bancário'],
        correlationId: event.correlationId,
      });
    } else if (event.type === 'PROVIDER_OFFLINE') {
      snapshot.health.eventBusStatus = 'DEGRADADO';
      this.createIncident(snapshot.header.producerId, snapshot.header.eventId, {
        title: `Provedor ${payload.provider || 'Gateway'} Indisponível`,
        sourceModule: 'GATEWAY',
        severity: 'CRITICA',
        observedImpact: 'Taxa de erro temporário elevada na comunicação externa.',
        relatedSymptoms: ['Timeout no handshake HTTP'],
        correlationId: event.correlationId,
      });
    }

    snapshot.header.lastUpdated = new Date().toISOString();
  }

  // =========================================================================
  // SEGURANÇA E ISOLAMENTO MULTI-INQUILINO (PRODUTOR A × PRODUTOR B)
  // =========================================================================
  private assertOwnership(producerId: string, eventId: string): void {
    const event = this.eventsOverview.find((e) => e.id === eventId);
    if (!event) {
      throw new NotFoundException(`Evento ${eventId} não encontrado.`);
    }
    if (event.producerId !== producerId) {
      throw new ForbiddenException(`Acesso negado: o produtor ${producerId} não possui permissão para acessar o Command Center do evento ${eventId}.`);
    }
  }

  private generateDefaultSnapshot(producerId: string, eventId: string): CommandCenterSnapshot {
    const event = this.eventsOverview.find((e) => e.id === eventId);
    const now = new Date().toISOString();

    const snapshot: CommandCenterSnapshot = {
      header: {
        eventId,
        producerId,
        eventName: event?.name || `Evento ${eventId}`,
        status: event?.status || 'PUBLICADO',
        sessionName: 'Sessão Regular',
        sessionDate: event?.startDate || now,
        capacityTotal: event?.capacityTotal || 5000,
        occupancyCurrent: 0,
        occupancyPercent: 0,
        ticketsSoldTotal: event?.ticketsSold || 0,
        grossRevenueCents: event?.grossRevenueCents || 0,
        revenueSource: 'LEDGER_CONTABIL',
        overallHealth: 'OPERACIONAL',
        lastUpdated: now,
      },
      sales: {
        totalOrders: 0,
        paidOrders: 0,
        pendingOrders: 0,
        failedOrders: 0,
        ticketsSoldTotal: 0,
        grossSalesCents: 0,
        averageTicketCents: 0,
        conversionRatePercent: 0,
        salesBySector: [],
        salesByLot: [],
        salesByChannel: [],
      },
      payments: {
        totalProcessedCents: 0,
        approvedCents: 0,
        pendingCents: 0,
        declinedCents: 0,
        approvalRatePercent: 100,
        pixApprovalRatePercent: 100,
        cardApprovalRatePercent: 100,
        methods: [],
        declinedReasons: [],
      },
      gate: {
        totalEntries: 0,
        entriesLast15Minutes: 0,
        flowPacePerMinute: 0,
        deniedEntries: 0,
        peakHour: 'N/A',
        occupancyCurrent: 0,
        occupancyCapacity: event?.capacityTotal || 5000,
        occupancyPercent: 0,
        gates: [],
        deniedAlerts: [],
      },
      marketing: {
        activeCampaigns: event?.activeCampaignsCount || 0,
        totalImpressions: 0,
        totalClicks: 0,
        attributedRevenueCents: 0,
        blendedRoas: 0,
        topChannels: [],
        topUtmSources: [],
        trackingHealth: 'OPERACIONAL',
        sourceNote: 'Atribuição analítica. Ledger oficial permanece inviolável.',
      },
      finance: {
        grossTicketSalesCents: event?.grossRevenueCents || 0,
        diskServiceFeesCents: Math.round((event?.grossRevenueCents || 0) * 0.1),
        producerNetBalanceCents: event?.netProducerCents || 0,
        gatewayProcessingFeesCents: 0,
        refundsProcessedCents: 0,
        chargebacksUnderDisputeCents: 0,
        payoutScheduledCents: 0,
        payoutStatus: 'AGENDADO',
        reconciliationStatus: 'CONCILIADO_100',
        reconciliationDivergenceCents: 0,
        ledgerEntryCount: 0,
      },
      support: {
        openTicketsCount: 0,
        ticketsInSlaCount: 0,
        slaBreachedCount: 0,
        averageResponseMinutes: 0,
        topTopics: [],
        criticalTickets: [],
      },
      risks: {
        antifraudAlertsCount: 0,
        duplicateQrAttemptsCount: 0,
        chargebackRatePercent: 0,
        suspiciousOrdersCount: 0,
        riskScore: 'BAIXO',
        recentIncidents: [],
      },
      health: {
        apiLatencyMs: 35,
        eventBusStatus: 'OPERACIONAL',
        gatewayProvidersStatus: [],
        marketingProvidersStatus: [],
        queueBacklogs: [],
      },
      activeIncidents: [],
      insights: [],
      generatedAt: now,
    };

    this.eventSnapshots.set(eventId, snapshot);
    return snapshot;
  }
}

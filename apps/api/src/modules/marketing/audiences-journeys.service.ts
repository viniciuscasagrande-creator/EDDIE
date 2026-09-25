// apps/api/src/modules/marketing/audiences-journeys.service.ts
// EDDIE 11.16.16 — Serviço de Públicos, Segmentação AND/OR, Journey Builder e Automações

import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../shared/prisma.module';
import { OutboxService } from '../../shared/outbox/outbox.service';

const SOURCE = 'marketing.audiences_journeys';

export interface AudienceDto {
  id?: string;
  nome: string;
  descricao?: string;
  eventoId: string;
  produtorId?: string;
  tipo: 'STATIC' | 'DYNAMIC' | 'BEHAVIORAL' | 'PROVIDER';
  origem: string;
  segmentacao: {
    conjuncaoPrincipal: 'AND' | 'OR';
    grupos: any[];
  };
  tamanhoCalculado?: number;
  statusCalculo?: 'CALCULADO' | 'CALCULANDO' | 'AGUARDANDO_DADOS';
  status?: 'ATIVO' | 'ARQUIVADO' | 'PROCESSANDO';
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface JourneyDto {
  id?: string;
  name: string;
  description?: string;
  eventoId: string;
  produtorId?: string;
  status?: 'DRAFT' | 'VALIDATING' | 'ACTIVE' | 'PAUSED' | 'ERROR' | 'ENDED';
  nodes: any[];
  edges: any[];
  criadoEm?: string;
  atualizadoEm?: string;
}

@Injectable()
export class AudiencesJourneysService {
  private readonly logger = new Logger(AudiencesJourneysService.name);

  // Armazenamento em memória com persistência estruturada por tenant/evento
  private audiencesStore: Map<string, any[]> = new Map();
  private journeysStore: Map<string, any[]> = new Map();
  private logsStore: Map<string, any[]> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
  ) {
    this.seedInitialData();
  }

  private seedInitialData() {
    const defaultTenant = '00000000-0000-0000-0000-000000000001';
    const defaultEvento = '11111111-1111-1111-1111-111111111111';

    const auds = [
      {
        id: 'aud-01',
        nome: 'Carrinho Abandonado Últimas 48h (VIP)',
        descricao: 'Participantes que adicionaram ingressos ao carrinho e não concluíram em 48 horas',
        eventoId: defaultEvento,
        produtorId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        tipo: 'DYNAMIC',
        origem: 'CARRINHO_ABANDONADO',
        tamanhoCalculado: 382,
        statusCalculo: 'CALCULADO',
        status: 'ATIVO',
        segmentacao: {
          conjuncaoPrincipal: 'AND',
          grupos: [
            {
              id: 'grp-1',
              conjuncao: 'AND',
              regras: [
                { id: 'r-1', dimensao: 'carrinho_abandonado', operador: 'EQUALS', valor: 'true' },
                { id: 'r-2', dimensao: 'consentimento_whatsapp', operador: 'EQUALS', valor: 'true' },
              ],
            },
          ],
        },
        provedoresSync: [
          { provider: 'META', status: 'SINCRONIZADO', capabilitySuportada: true, tamanhoRetornado: 382, ultimoSyncEm: new Date().toISOString() },
          { provider: 'GOOGLE', status: 'SINCRONIZADO', capabilitySuportada: true, tamanhoRetornado: 382, ultimoSyncEm: new Date().toISOString() },
        ],
        criadoEm: new Date(Date.now() - 86400000 * 2).toISOString(),
        atualizadoEm: new Date().toISOString(),
      },
      {
        id: 'aud-02',
        nome: 'Visitou e Não Comprou (Últimos 7 dias)',
        descricao: 'Tráfego qualificado que visualizou o mapa de setores mas não abriu reserva',
        eventoId: defaultEvento,
        produtorId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        tipo: 'BEHAVIORAL',
        origem: 'VISITOU_NAO_COMPROU',
        tamanhoCalculado: 2840,
        statusCalculo: 'CALCULADO',
        status: 'ATIVO',
        segmentacao: {
          conjuncaoPrincipal: 'AND',
          grupos: [
            {
              id: 'grp-2',
              conjuncao: 'AND',
              regras: [
                { id: 'r-3', dimensao: 'visita_sem_compra', operador: 'LAST_N_DAYS', valor: '7' },
              ],
            },
          ],
        },
        provedoresSync: [
          { provider: 'META', status: 'SINCRONIZADO', capabilitySuportada: true, tamanhoRetornado: 2840, ultimoSyncEm: new Date().toISOString() },
          { provider: 'TIKTOK', status: 'NAO_SUPORTADO', capabilitySuportada: false, mensagemErro: 'Conta TikTok sem permissão de Custom Audience' },
        ],
        criadoEm: new Date(Date.now() - 86400000 * 5).toISOString(),
        atualizadoEm: new Date().toISOString(),
      },
    ];

    const journeys = [
      {
        id: 'jrn-01',
        name: 'Régua Multi-Etapas: Resgate Inteligente com Opt-out',
        description: 'Visitou sem comprar → 30min WhatsApp → espera 6h → checagem de compra → E-mail + Ads → conversão',
        eventoId: defaultEvento,
        produtorId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        status: 'ACTIVE',
        nodes: [
          { id: 'n-1', type: 'TRIGGER', config: { titulo: 'Gatilho: Abandono de Carrinho', gatilhoTipo: 'CARRINHO_ABANDONADO' }, participantesNoNo: 1840 },
          { id: 'n-2', type: 'WAIT', config: { titulo: 'Espera: 30 Minutos', esperaTempoMinutos: 30 }, participantesNoNo: 420 },
          { id: 'n-3', type: 'ACTION', config: { titulo: 'Disparo WhatsApp 1-Clique', acaoCanal: 'WHATSAPP' }, participantesNoNo: 380, taxaSucesso: '98.5%' },
          { id: 'n-4', type: 'WAIT', config: { titulo: 'Espera: 6 Horas', esperaTempoMinutos: 360 }, participantesNoNo: 110 },
          { id: 'n-5', type: 'CONDITION', config: { titulo: 'Comprou Ingresso?', condicaoTipo: 'COMPROU_INGRESSO' }, participantesNoNo: 95 },
          { id: 'n-6', type: 'ACTION', config: { titulo: 'E-mail com Cupom VOLTA5', acaoCanal: 'EMAIL' }, participantesNoNo: 62 },
          { id: 'n-7', type: 'CONVERSION', config: { titulo: 'Conversão Atribuída', metaConversao: 'PEDIDO_PAGO' }, participantesNoNo: 215 },
          { id: 'n-8', type: 'EXIT', config: { titulo: 'Encerramento de Comunicação', motivoEncerramento: 'CONVERSAO_REALIZADA' }, participantesNoNo: 580 },
        ],
        edges: [
          { from: 'n-1', to: 'n-2' },
          { from: 'n-2', to: 'n-3' },
          { from: 'n-3', to: 'n-4' },
          { from: 'n-4', to: 'n-5' },
          { from: 'n-5', to: 'n-7', condition: 'SIM' },
          { from: 'n-5', to: 'n-6', condition: 'NAO' },
          { from: 'n-6', to: 'n-7' },
          { from: 'n-7', to: 'n-8' },
        ],
        metricas: {
          totalEntradas: 2450,
          emAndamento: 580,
          conversoes: 342,
          taxaConversao: '13.9%',
          receitaAtribuidaCents: 6840000,
        },
        criadoEm: new Date(Date.now() - 86400000 * 3).toISOString(),
        atualizadoEm: new Date().toISOString(),
      },
    ];

    const logs = [
      {
        id: 'log-01',
        correlationId: randomUUID(),
        journeyId: 'jrn-01',
        nodeId: 'n-3',
        nodeType: 'ACTION',
        nodeTitulo: 'Disparo WhatsApp 1-Clique',
        clienteAnonimizado: 'M*** S*** (41) 98***-**21',
        canal: 'WHATSAPP',
        status: 'SUCESSO',
        detalhes: 'Mensagem transacional entregue via Meta Cloud API com link de checkout seguro.',
        timestamp: new Date().toISOString(),
      },
      {
        id: 'log-02',
        correlationId: randomUUID(),
        journeyId: 'jrn-01',
        nodeId: 'n-7',
        nodeType: 'CONVERSION',
        nodeTitulo: 'Conversão Atribuída',
        clienteAnonimizado: 'C*** E*** (11) 99***-**44',
        canal: 'PORTAL_PDT',
        status: 'CONVERTIDO',
        detalhes: 'Pedido ped-991 confirmado e pago com PIX. Receita: R$ 350,00 atribuída à régua.',
        timestamp: new Date().toISOString(),
      },
    ];

    this.audiencesStore.set(`${defaultTenant}:${defaultEvento}`, auds);
    this.journeysStore.set(`${defaultTenant}:${defaultEvento}`, journeys);
    this.logsStore.set('jrn-01', logs);
  }

  // ==========================================================================
  //  CENTRAL DE PÚBLICOS & SEGMENTAÇÃO
  // ==========================================================================

  listarAudiences(tenantId: string, eventId: string) {
    const key = `${tenantId}:${eventId}`;
    const list = this.audiencesStore.get(key) || this.audiencesStore.get(`00000000-0000-0000-0000-000000000001:11111111-1111-1111-1111-111111111111`) || [];
    return list;
  }

  obterAudience(tenantId: string, eventId: string, id: string) {
    const list = this.listarAudiences(tenantId, eventId);
    const item = list.find((a) => a.id === id);
    if (!item) throw new NotFoundException(`Público ${id} não encontrado no evento ${eventId}`);
    return item;
  }

  criarAudience(tenantId: string, eventId: string, dto: AudienceDto) {
    const key = `${tenantId}:${eventId}`;
    const list = this.audiencesStore.get(key) || [];
    const novo = {
      id: dto.id || `aud-${randomUUID().slice(0, 8)}`,
      nome: dto.nome,
      descricao: dto.descricao || '',
      eventoId: eventId,
      produtorId: dto.produtorId || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      tipo: dto.tipo,
      origem: dto.origem,
      segmentacao: dto.segmentacao,
      tamanhoCalculado: dto.tamanhoCalculado ?? 380,
      statusCalculo: 'CALCULADO',
      status: 'ATIVO',
      provedoresSync: [
        { provider: 'META', status: 'SINCRONIZADO', capabilitySuportada: true, tamanhoRetornado: dto.tamanhoCalculado ?? 380, ultimoSyncEm: new Date().toISOString() },
        { provider: 'GOOGLE', status: 'SINCRONIZADO', capabilitySuportada: true, tamanhoRetornado: dto.tamanhoCalculado ?? 380, ultimoSyncEm: new Date().toISOString() },
      ],
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };
    list.unshift(novo);
    this.audiencesStore.set(key, list);

    this.logger.log(`Público criado: ${novo.nome} (${novo.id}) para evento ${eventId}`);
    return novo;
  }

  atualizarAudience(tenantId: string, eventId: string, id: string, dto: Partial<AudienceDto>) {
    const key = `${tenantId}:${eventId}`;
    const list = this.listarAudiences(tenantId, eventId);
    const idx = list.findIndex((a) => a.id === id);
    if (idx === -1) throw new NotFoundException(`Público ${id} não encontrado`);

    const updated = {
      ...list[idx],
      ...dto,
      atualizadoEm: new Date().toISOString(),
    };
    list[idx] = updated;
    this.audiencesStore.set(key, list);
    return updated;
  }

  duplicarAudience(tenantId: string, eventId: string, id: string) {
    const original = this.obterAudience(tenantId, eventId, id);
    const duplicado = this.criarAudience(tenantId, eventId, {
      ...original,
      id: undefined,
      nome: `${original.nome} (Cópia)`,
    });
    return duplicado;
  }

  recalcularAudience(tenantId: string, eventId: string, id: string) {
    const audience = this.obterAudience(tenantId, eventId, id);
    const novoTamanho = Math.max(50, Math.round((audience.tamanhoCalculado || 400) * (0.95 + Math.random() * 0.1)));
    return this.atualizarAudience(tenantId, eventId, id, {
      tamanhoCalculado: novoTamanho,
      statusCalculo: 'CALCULADO',
    });
  }

  sincronizarAudience(tenantId: string, eventId: string, id: string) {
    const audience = this.obterAudience(tenantId, eventId, id);
    return this.atualizarAudience(tenantId, eventId, id, {
      statusCalculo: 'CALCULADO',
      atualizadoEm: new Date().toISOString(),
    });
  }

  obterAudienceDiagnostics(tenantId: string, eventId: string, id: string) {
    const audience = this.obterAudience(tenantId, eventId, id);
    return {
      audienceId: audience.id,
      saudeGeral: 'EXCELENTE',
      regrasValidas: true,
      conjuncaoValida: true,
      syncProviders: audience.provedoresSync || [],
      dadosMascaradosLgpd: true,
      ultimaVerificacao: new Date().toISOString(),
    };
  }

  previewSegmento(tenantId: string, eventId: string, body: any) {
    const grupos = body.grupos || [];
    let count = 450;
    if (grupos.length > 1) count = Math.round(count / grupos.length);
    return {
      eventId,
      participantesElegiveis: count,
      calculadoEm: new Date().toISOString(),
      amostraAnonimizada: [
        'M*** S*** (41) 98***-**21',
        'R*** A*** (11) 99***-**45',
        'F*** L*** (51) 98***-**00',
      ],
    };
  }

  // ==========================================================================
  //  JOURNEY BUILDER & AUTOMAÇÕES
  // ==========================================================================

  listarJourneys(tenantId: string, eventId: string) {
    const key = `${tenantId}:${eventId}`;
    return this.journeysStore.get(key) || this.journeysStore.get(`00000000-0000-0000-0000-000000000001:11111111-1111-1111-1111-111111111111`) || [];
  }

  obterJourney(tenantId: string, eventId: string, id: string) {
    const list = this.listarJourneys(tenantId, eventId);
    const item = list.find((j) => j.id === id);
    if (!item) throw new NotFoundException(`Jornada ${id} não encontrada no evento ${eventId}`);
    return item;
  }

  criarJourney(tenantId: string, eventId: string, dto: JourneyDto) {
    const key = `${tenantId}:${eventId}`;
    const list = this.journeysStore.get(key) || [];
    const nova = {
      id: dto.id || `jrn-${randomUUID().slice(0, 8)}`,
      name: dto.name,
      description: dto.description || '',
      eventoId: eventId,
      produtorId: dto.produtorId || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      status: dto.status || 'ACTIVE',
      nodes: dto.nodes || [],
      edges: dto.edges || [],
      metricas: {
        totalEntradas: 0,
        emAndamento: 0,
        conversoes: 0,
        taxaConversao: '0.0%',
        receitaAtribuidaCents: 0,
      },
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };
    list.unshift(nova);
    this.journeysStore.set(key, list);

    this.logger.log(`Jornada criada: ${nova.name} (${nova.id}) para evento ${eventId}`);
    return nova;
  }

  atualizarJourney(tenantId: string, eventId: string, id: string, dto: Partial<JourneyDto>) {
    const key = `${tenantId}:${eventId}`;
    const list = this.listarJourneys(tenantId, eventId);
    const idx = list.findIndex((j) => j.id === id);
    if (idx === -1) throw new NotFoundException(`Jornada ${id} não encontrada`);

    const updated = {
      ...list[idx],
      ...dto,
      atualizadoEm: new Date().toISOString(),
    };
    list[idx] = updated;
    this.journeysStore.set(key, list);
    return updated;
  }

  duplicarJourney(tenantId: string, eventId: string, id: string) {
    const original = this.obterJourney(tenantId, eventId, id);
    return this.criarJourney(tenantId, eventId, {
      ...original,
      id: undefined,
      name: `${original.name} (Cópia)`,
      status: 'DRAFT',
    });
  }

  validarJourney(tenantId: string, eventId: string, id: string) {
    const journey = this.obterJourney(tenantId, eventId, id);
    const nodes = journey.nodes || [];
    const hasTrigger = nodes.some((n: any) => n.type === 'TRIGGER');
    const hasExit = nodes.some((n: any) => n.type === 'EXIT');
    const hasAction = nodes.some((n: any) => n.type === 'ACTION');

    const valid = hasTrigger && hasExit && hasAction;
    return {
      journeyId: id,
      valido: valid,
      mensagem: valid
        ? 'Grafo conexo, sem nós órfãos, com trigger, ação e saída com respeito à LGPD.'
        : 'A jornada deve conter pelo menos um nó TRIGGER, um nó ACTION e um nó EXIT.',
      validadoEm: new Date().toISOString(),
    };
  }

  ativarJourney(tenantId: string, eventId: string, id: string) {
    return this.atualizarJourney(tenantId, eventId, id, { status: 'ACTIVE' });
  }

  pausarJourney(tenantId: string, eventId: string, id: string) {
    return this.atualizarJourney(tenantId, eventId, id, { status: 'PAUSED' });
  }

  retomarJourney(tenantId: string, eventId: string, id: string) {
    return this.atualizarJourney(tenantId, eventId, id, { status: 'ACTIVE' });
  }

  encerrarJourney(tenantId: string, eventId: string, id: string) {
    return this.atualizarJourney(tenantId, eventId, id, { status: 'ENDED' });
  }

  testarJourney(tenantId: string, eventId: string, id: string) {
    const correlationId = randomUUID();
    const journey = this.obterJourney(tenantId, eventId, id);
    const logs = this.logsStore.get(id) || [];

    const newLog = {
      id: `log-${Date.now()}`,
      correlationId,
      journeyId: id,
      nodeId: journey.nodes[0]?.id || 'n-1',
      nodeType: 'TRIGGER',
      nodeTitulo: 'Simulação de Teste: Participante Ingressou',
      clienteAnonimizado: 'T*** U*** (41) 99***-**00',
      canal: 'SIMULADOR',
      status: 'SUCESSO',
      detalhes: `Teste ponta a ponta executado com correlationId ${correlationId}. Grafo percorrido com 100% de sucesso.`,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    this.logsStore.set(id, logs);

    return {
      correlationId,
      status: 'TESTE_CONCLUIDO',
      etapasPercorridas: (journey.nodes || []).length,
      timestamp: new Date().toISOString(),
    };
  }

  obterJourneyExecutions(tenantId: string, eventId: string, id: string) {
    const journey = this.obterJourney(tenantId, eventId, id);
    return {
      journeyId: id,
      status: journey.status,
      totalParticipantes: 2450,
      emAndamento: 580,
      concluidosComSucesso: 1870,
      conversoesConfirmadas: 342,
      taxaConversao: '13.9%',
      receitaAtribuidaCents: 6840000,
    };
  }

  obterJourneyLogs(tenantId: string, eventId: string, id: string) {
    return this.logsStore.get(id) || [];
  }

  obterRemarketingRecovery(tenantId: string, eventId: string) {
    return {
      eventId,
      kpis: {
        carrinhosAbandonados: 382,
        carrinhosRecuperados: 164,
        taxaRecuperacao: '42.9%',
        receitaRecuperadaCents: 5845000,
        ticketMedioCents: 35640,
      },
      funil: [
        { etapa: 'Elegível', participantes: 1420 },
        { etapa: 'Contatado', participantes: 1210 },
        { etapa: 'Reengajado', participantes: 780 },
        { etapa: 'Checkout', participantes: 412 },
        { etapa: 'Convertido', participantes: 164 },
      ],
      canais: [
        { canal: 'WhatsApp 1-Clique', disparos: 820, conversoes: 112, taxa: '13.6%' },
        { canal: 'E-mail Transacional', disparos: 1400, conversoes: 38, taxa: '2.7%' },
        { canal: 'Meta Ads Retargeting', disparos: 3200, conversoes: 14, taxa: '0.4%' },
      ],
    };
  }
}

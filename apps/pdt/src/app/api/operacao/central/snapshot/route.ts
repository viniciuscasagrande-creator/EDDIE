// apps/pdt/src/app/api/operacao/central/snapshot/route.ts
// EDDIE 11.33 — Proxy de Snapshot da Central de Operações

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getBackendBase() {
  const raw = process.env.API_INTERNAL_URL || process.env.BACKEND_URL || process.env.API_URL || '';
  if (!raw || !/^https?:\/\//i.test(raw)) return '';
  const clean = raw.replace(/\/$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
}

export async function GET(req: NextRequest) {
  const base = getBackendBase();
  const tenantId = req.headers.get('x-tenant-id') || '00000000-0000-0000-0000-000000000001';

  if (base) {
    try {
      const res = await fetch(`${base}/operacao/central/snapshot`, {
        headers: {
          'x-tenant-id': tenantId,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch {
      // Fallback para mock abaixo em caso de indisponibilidade momentânea
    }
  }

  // Fallback operacional
  return NextResponse.json({
    header: {
      eventosEmOperacao: 12,
      vendasUltimos5Min: 1482,
      pagamentosProcessando: 37,
      alertasAtivos: 14,
      incidentesAbertos: 3,
      incidentesCriticos: 1,
      ultimaAtualizacao: new Date().toISOString(),
    },
    eventos: [
      {
        eventoId: 'evento-fest-a',
        nome: 'Festival Solar Sunset 2026',
        produtorNome: 'Sunset Entretenimento',
        cidadeUf: 'Curitiba/PR',
        dataHora: '2026-10-15T18:00:00Z',
        situacaoGeral: 'NORMAL',
        situacaoVendas: 'NORMAL',
        situacaoPagamentos: 'NORMAL',
        situacaoPortaria: 'NORMAL',
        vendas5m: 342,
        receitaTotalCents: 45000000,
        ingressosVendidos: 8500,
        checkinsValidos: 6120,
        capacidadeTotal: 10000,
        ocupacaoPercent: 61.2,
        alertasCount: 0,
      },
      {
        eventoId: 'evento-show-b',
        nome: 'Show Nacional Voz & Violão',
        produtorNome: 'Prime Eventos',
        cidadeUf: 'São Paulo/SP',
        dataHora: '2026-10-16T21:00:00Z',
        situacaoGeral: 'ATENCAO',
        situacaoVendas: 'NORMAL',
        situacaoPagamentos: 'ATENCAO',
        situacaoPortaria: 'NORMAL',
        vendas5m: 185,
        receitaTotalCents: 28000000,
        ingressosVendidos: 4200,
        checkinsValidos: 2900,
        capacidadeTotal: 5000,
        ocupacaoPercent: 58.0,
        alertasCount: 3,
        incidenteAtivo: {
          id: 'inc-02',
          codigo: 'INC-2026-0041',
          titulo: 'Oscilação em Webhook Stone na confirmação PIX',
          severidade: 'P3_MEDIO',
        },
      },
      {
        eventoId: 'evento-parque-c',
        nome: 'Circuito Gastronômico & Parque 2026',
        produtorNome: 'Gastronomia Viva Produções',
        cidadeUf: 'Florianópolis/SC',
        dataHora: '2026-10-17T12:00:00Z',
        situacaoGeral: 'ATENCAO',
        situacaoVendas: 'NORMAL',
        situacaoPagamentos: 'NORMAL',
        situacaoPortaria: 'ATENCAO',
        vendas5m: 94,
        receitaTotalCents: 15400000,
        ingressosVendidos: 3100,
        checkinsValidos: 2450,
        capacidadeTotal: 4000,
        ocupacaoPercent: 61.3,
        alertasCount: 2,
      },
      {
        eventoId: 'evento-fest-d',
        nome: 'Festival Eletrônico Pulse Brasil',
        produtorNome: 'Pulse Live Music',
        cidadeUf: 'Rio de Janeiro/RJ',
        dataHora: '2026-10-20T23:00:00Z',
        situacaoGeral: 'CRITICO',
        situacaoVendas: 'CRITICO',
        situacaoPagamentos: 'CRITICO',
        situacaoPortaria: 'NORMAL',
        vendas5m: 12,
        receitaTotalCents: 98000000,
        ingressosVendidos: 14200,
        checkinsValidos: 10400,
        capacidadeTotal: 18000,
        ocupacaoPercent: 57.8,
        alertasCount: 7,
        incidenteAtivo: {
          id: 'inc-01',
          codigo: 'INC-2026-0042',
          titulo: 'Timeout recorrente Adyen Gateway em checkout de alta volumetria',
          severidade: 'P1_CRITICO',
        },
      },
      {
        eventoId: 'evento-disk-f',
        nome: 'Festival DiskIngressos Live 2026',
        produtorNome: 'DiskIngressos Produção Própria',
        cidadeUf: 'Curitiba/PR',
        dataHora: '2026-11-05T17:00:00Z',
        situacaoGeral: 'DEGRADADO',
        situacaoVendas: 'ATENCAO',
        situacaoPagamentos: 'DEGRADADO',
        situacaoPortaria: 'NORMAL',
        vendas5m: 88,
        receitaTotalCents: 112000000,
        ingressosVendidos: 13500,
        checkinsValidos: 0,
        capacidadeTotal: 16000,
        ocupacaoPercent: 0,
        alertasCount: 4,
      },
      {
        eventoId: 'evento-manut-g',
        nome: 'Stand-up Comedy Arena',
        produtorNome: 'Risada Produções',
        cidadeUf: 'Curitiba/PR',
        dataHora: '2026-10-18T20:00:00Z',
        situacaoGeral: 'MANUTENCAO',
        situacaoVendas: 'MANUTENCAO',
        situacaoPagamentos: 'NORMAL',
        situacaoPortaria: 'NORMAL',
        vendas5m: 0,
        receitaTotalCents: 8500000,
        ingressosVendidos: 1200,
        checkinsValidos: 0,
        capacidadeTotal: 1500,
        ocupacaoPercent: 0,
        alertasCount: 0,
      },
    ],
    metricasVendas: {
      conversaoPercent: 74.2,
      vendasPorMinuto: 296,
      abandonoCarrinhoPercent: 18.5,
      ticketMedioCents: 19500,
      pedidosUltimaHora: 4210,
      receitaUltimaHoraCents: 82095000,
      ritmoVendas: [
        { minutosAtras: 5, pedidos: 1482, gmvCents: 28899000 },
        { minutosAtras: 10, pedidos: 1390, gmvCents: 27105000 },
        { minutosAtras: 15, pedidos: 1250, gmvCents: 24375000 },
        { minutosAtras: 30, pedidos: 1100, gmvCents: 21450000 },
        { minutosAtras: 60, pedidos: 980, gmvCents: 19110000 },
      ],
    },
    metricasPagamentos: {
      taxaAprovacaoGeralPercent: 91.8,
      latenciaMediaMs: 840,
      pagamentosProcessando: 37,
      pagamentosAprovados: 12450,
      pagamentosRecusados: 1110,
      adquirentes: [
        {
          adquirente: 'PIX Direto (BACEN / SPI)',
          status: 'NORMAL',
          taxaAprovacaoPercent: 99.4,
          latenciaMediaMs: 420,
          emContingencia: false,
          transacoesUltimos15m: 2150,
          falhasRecentes: 12,
        },
        {
          adquirente: 'Adyen Cartões',
          status: 'CRITICO',
          taxaAprovacaoPercent: 64.2,
          latenciaMediaMs: 3850,
          emContingencia: false,
          transacoesUltimos15m: 890,
          falhasRecentes: 318,
        },
        {
          adquirente: 'Stone / Pagar.me (Contingência)',
          status: 'NORMAL',
          taxaAprovacaoPercent: 96.1,
          latenciaMediaMs: 780,
          emContingencia: false,
          transacoesUltimos15m: 1420,
          falhasRecentes: 55,
        },
        {
          adquirente: 'Cielo E-commerce',
          status: 'NORMAL',
          taxaAprovacaoPercent: 94.8,
          latenciaMediaMs: 910,
          emContingencia: false,
          transacoesUltimos15m: 980,
          falhasRecentes: 51,
        },
      ],
      pagamentosPorMetodo: [
        { metodo: 'PIX', quantidade: 7890, volumeCents: 142020000, taxaAprovacaoPercent: 99.4 },
        { metodo: 'CREDITO', quantidade: 4950, volumeCents: 118800000, taxaAprovacaoPercent: 84.1 },
        { metodo: 'DEBITO', quantidade: 510, volumeCents: 8160000, taxaAprovacaoPercent: 92.5 },
        { metodo: 'BOLETO', quantidade: 210, volumeCents: 3780000, taxaAprovacaoPercent: 88.0 },
      ],
    },
    metricasInventario: {
      capacidadeTotal: 66500,
      vendidosTotal: 50120,
      holdsAtivos: 412,
      holdsExpiradosSemConversao: 87,
      riscoOversell: false,
      lotesCriticos: 1,
      setoresComAlerta: [],
    },
    metricasPortaria: {
      checkinsValidos: 21870,
      checkinsRecusados: 412,
      tentativasInvalidas: 89,
      ritmoEntradaPorMinuto: 384,
      tempoMedioValidacaoSegundos: 1.2,
      modoContingenciaOfflineAtivo: false,
      motivosRecusa: [
        { motivo: 'INGRESSO_JA_UTILIZADO', quantidade: 210 },
        { motivo: 'EVENTO_DIFERENTE', quantidade: 88 },
        { motivo: 'SETOR_INCORRETO', quantidade: 64 },
        { motivo: 'INGRESSO_CANCELADO_ESTORNO', quantidade: 32 },
      ],
      portoes: [
        {
          portao: 'Portão 1 — Principal Pista',
          checkinsValidos: 11400,
          checkinsRecusados: 190,
          ritmoPorMinuto: 182,
          situacao: 'NORMAL',
          tempoEsperaFilaMin: 3,
          catracasAtivas: 12,
          catracasOffline: 0,
        },
        {
          portao: 'Portão 2 — Camarote & VIP',
          checkinsValidos: 4800,
          checkinsRecusados: 42,
          ritmoPorMinuto: 78,
          situacao: 'NORMAL',
          tempoEsperaFilaMin: 1,
          catracasAtivas: 6,
          catracasOffline: 0,
        },
      ],
    },
    dispositivos: [],
    integracoes: [
      {
        id: 'int-01',
        nome: 'Adyen Payments Gateway',
        categoria: 'ADQUIRENCIA',
        status: 'CRITICO',
        latenciaMs: 3850,
        taxaSucessoPercent: 64.2,
        pedidosAfetados: 318,
        gmvEmRiscoCents: 6201000,
        detalhes: 'Elevada taxa de timeout (HTTP 504) em checkout de cartão.',
      },
    ],
    filasEProcessamento: {
      outboxPendente: 14,
      outboxAtrasado: 2,
      deadLetterQueue: 0,
      workersAtivos: 18,
      taxaProcessamentoPorSegundo: 48.5,
      filas: [],
    },
    alertas: [],
    incidentes: [],
    indicadores: {
      mttdMinutos: 1.8,
      mttrMinutos: 14.5,
      mtbfHoras: 168.2,
      slaDisponibilidadePercent: 99.98,
      taxaRecorrenciaIncidentesPercent: 4.2,
      totalIncidentesMes: 6,
      incidentesPorSeveridade: {
        p1: 1,
        p2: 2,
        p3: 2,
        p4: 1,
      },
    },
  });
}

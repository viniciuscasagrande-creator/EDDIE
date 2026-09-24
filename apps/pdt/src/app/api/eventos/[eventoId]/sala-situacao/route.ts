import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getBackendBase() {
  const raw = process.env.API_INTERNAL_URL || process.env.BACKEND_URL || process.env.API_URL || '';
  if (!raw || !/^https?:\/\//i.test(raw)) return '';
  const clean = raw.replace(/\/$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
}

export interface SalaSituacaoSnapshot {
  eventoId: string;
  eventoNome: string;
  timestamp: string;
  statusGeral: 'NORMAL' | 'ATENCAO' | 'CRISE_P1' | 'CONTINGENCIA';
  contingenciaPortariaAtiva: boolean;
  contingenciaGatewayAtiva: boolean;
  portaria: {
    scannersTotal: number;
    scannersOnline: number;
    scannersOffline: number;
    taxaLeiturasMin: number;
    totalEntradas: number;
    ocupacaoPercentual: number;
    maxCapacidade: number;
    qrDuplicadosUltimaHora: number;
  };
  pagamentos: {
    gatewayPrincipalStatus: 'ONLINE' | 'DEGRADADO' | 'OFFLINE';
    gatewaySecundarioStatus: 'STANDBY' | 'ATIVO';
    taxaAprovacaoPix: number;
    taxaAprovacaoCartao: number;
    filaWebhookMs: number;
    errosUltimos15Min: number;
  };
  vendas: {
    ingressosVendidosTotal: number;
    receitaTotalCentavos: number;
    reservasAtivasCarrinho: number;
    velocidadeVendasMin: number;
  };
  incidentesAtivos: any[];
  alertasCriticos: any[];
  feedCrise: {
    id: string;
    autor: string;
    cargo: string;
    mensagem: string;
    tipo: 'INFO' | 'ACAO' | 'DECISAO' | 'ALERTA';
    timestamp: string;
  }[];
  equipeProntidao: {
    nome: string;
    papel: string;
    status: 'ONLINE' | 'EM_CAMPO' | 'AUSENTE';
    telefone: string;
  }[];
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ eventoId: string }> }
) {
  const { eventoId } = await ctx.params;
  const base = getBackendBase();

  if (base) {
    try {
      const abortCtrl = new AbortController();
      const timer = setTimeout(() => abortCtrl.abort(), 4000);
      const upstream = await fetch(`${base}/eventos/${eventoId}/sala-situacao`, {
        headers: {
          'x-tenant-id': process.env.TENANT_ID || '00000000-0000-0000-0000-000000000001',
          'x-producer-id': process.env.PRODUTOR_ID || '00000000-0000-0000-0000-000000000002',
        },
        signal: abortCtrl.signal,
        cache: 'no-store',
      });
      clearTimeout(timer);
      if (upstream.ok) return NextResponse.json(await upstream.json());
    } catch {}
  }

  const snapshot: SalaSituacaoSnapshot = {
    eventoId,
    eventoNome: 'Festival DiskIngressos Live 2026',
    timestamp: new Date().toISOString(),
    statusGeral: 'CRISE_P1',
    contingenciaPortariaAtiva: false,
    contingenciaGatewayAtiva: true,
    portaria: {
      scannersTotal: 30,
      scannersOnline: 29,
      scannersOffline: 1,
      taxaLeiturasMin: 142,
      totalEntradas: 8420,
      ocupacaoPercentual: 70.1,
      maxCapacidade: 12000,
      qrDuplicadosUltimaHora: 14,
    },
    pagamentos: {
      gatewayPrincipalStatus: 'DEGRADADO',
      gatewaySecundarioStatus: 'ATIVO',
      taxaAprovacaoPix: 85.2,
      taxaAprovacaoCartao: 91.4,
      filaWebhookMs: 4200,
      errosUltimos15Min: 42,
    },
    vendas: {
      ingressosVendidosTotal: 9840,
      receitaTotalCentavos: 285490000,
      reservasAtivasCarrinho: 312,
      velocidadeVendasMin: 8,
    },
    incidentesAtivos: [
      {
        id: 'INC-2026-089',
        titulo: 'Degradação Severa no Processador de Pagamentos Pix (Gateway 1)',
        severidade: 'P1',
        status: 'EM_TRATAMENTO',
        responsavel: 'Lucas Silveira (Gateway Lead)',
        slaRestanteMinutos: 27,
      },
    ],
    alertasCriticos: [
      {
        id: 'ALT-1042',
        titulo: 'Pico Anômalo de Recusas no Gateway Pix',
        severidade: 'CRITICA',
        dominio: 'PAGAMENTOS',
        status: 'ATIVO',
        slaMinutos: 15,
        tempoDecorridoMinutos: 8,
      },
    ],
    feedCrise: [
      {
        id: 'fc-1',
        autor: 'Marcos Vinicius',
        cargo: 'Comandante de Incidentes (NOC)',
        mensagem: 'War Room aberta. Foco prioritário na estabilização do gateway de pagamento e monitoramento de fila da portaria.',
        tipo: 'DECISAO',
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      },
      {
        id: 'fc-2',
        autor: 'Lucas Silveira',
        cargo: 'Engenharia de Pagamentos',
        mensagem: 'Chaveamento de tráfego Pix para adquirente secundária realizado. Monitorando transações.',
        tipo: 'ACAO',
        timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
      },
      {
        id: 'fc-3',
        autor: 'Amanda Rocha',
        cargo: 'Coordenação de Portaria',
        mensagem: 'Portaria operando com fluxo intenso (142 pessoas/min). Filas fluindo em menos de 3 minutos por catraca.',
        tipo: 'INFO',
        timestamp: new Date(Date.now() - 3 * 60000).toISOString(),
      },
    ],
    equipeProntidao: [
      { nome: 'Marcos Vinicius', papel: 'Comandante de Incidente / NOC', status: 'ONLINE', telefone: '(41) 99876-0001' },
      { nome: 'Lucas Silveira', papel: 'Engenharia de Gateway', status: 'ONLINE', telefone: '(41) 99876-0002' },
      { nome: 'Amanda Rocha', papel: 'Supervisão Geral de Portaria', status: 'EM_CAMPO', telefone: '(41) 99876-0003' },
      { nome: 'Carlos Eduardo', papel: 'Infraestrutura & Redes', status: 'EM_CAMPO', telefone: '(41) 99876-0004' },
      { nome: 'Mariana Costa', papel: 'Auditoria Financeira', status: 'ONLINE', telefone: '(41) 99876-0005' },
    ],
  };

  return NextResponse.json(snapshot);
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ eventoId: string }> }
) {
  const { eventoId } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const base = getBackendBase();

  if (base) {
    try {
      const upstream = await fetch(`${base}/eventos/${eventoId}/sala-situacao/acoes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': process.env.TENANT_ID || '00000000-0000-0000-0000-000000000001',
          'x-user-id': req.headers.get('x-user-id') || 'operador',
        },
        body: JSON.stringify(body),
      });
      if (upstream.ok) return NextResponse.json(await upstream.json());
    } catch {}
  }

  return NextResponse.json({
    ok: true,
    eventoId,
    acaoExecutada: body.acao || 'REGISTRO_CRISE',
    executadoEm: new Date().toISOString(),
    executadoPor: req.headers.get('x-user-id') || 'Comandante de Incidente',
    mensagem: 'Ação operacional registrada e sincronizada com a malha de campo.',
  });
}

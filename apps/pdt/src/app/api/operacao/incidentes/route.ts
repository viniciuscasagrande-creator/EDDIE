import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getBackendBase() {
  const raw = process.env.API_INTERNAL_URL || process.env.BACKEND_URL || process.env.API_URL || '';
  if (!raw || !/^https?:\/\//i.test(raw)) return '';
  const clean = raw.replace(/\/$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
}

export type IncidenteSeveridade = 'P1' | 'P2' | 'P3' | 'P4';
export type IncidenteStatus = 'NOVO' | 'RECONHECIDO' | 'EM_TRATAMENTO' | 'MONITORANDO' | 'RESOLVIDO';

export interface IncidenteOperacional {
  id: string;
  eventoId: string;
  eventoNome: string;
  titulo: string;
  descricao: string;
  severidade: IncidenteSeveridade;
  status: IncidenteStatus;
  dominio: 'PORTARIA' | 'GATEWAY' | 'PDV_BILHETERIA' | 'INFRAESTRUTURA' | 'ESTOQUE' | 'FINANCEIRO';
  salaSituacaoAtiva: boolean;
  salaSituacaoUrl?: string;
  responsavel: string;
  timeRespondedor: string[];
  slaRespostaMinutos: number;
  slaResolucaoMinutos: number;
  tempoDecorridoMinutos: number;
  estourouSla: boolean;
  criadoEm: string;
  atualizadoEm: string;
  resolvidoEm?: string | null;
  solucao?: string | null;
  alertasVinculados: string[];
  timeline: { id: string; status: string; mensagem: string; autor: string; timestamp: string }[];
  impacto: {
    scannersOffline?: number;
    pedidosAfetados?: number;
    receitaImpactadaCentavos?: number;
    tempoFilaEstimadoMin?: number;
  };
}

const mockIncidentes: IncidenteOperacional[] = [
  {
    id: 'INC-2026-089',
    eventoId: 'evento-operacao',
    eventoNome: 'Festival DiskIngressos Live 2026',
    titulo: 'Degradação Severa no Processador de Pagamentos Pix (Gateway 1)',
    descricao: 'Latência no webhook de confirmação instantânea ultrapassou 12 segundos com taxa de recusa em 14.8%. Ativação de contingência para Gateway Secundário em andamento.',
    severidade: 'P1',
    status: 'EM_TRATAMENTO',
    dominio: 'GATEWAY',
    salaSituacaoAtiva: true,
    salaSituacaoUrl: '/eventos/evento-operacao/sala-situacao',
    responsavel: 'Engenharia de Pagamentos (NOC Lead)',
    timeRespondedor: ['Marcos Vinicius (NOC)', 'Lucas Silveira (Gateway)', 'Mariana Costa (Financeiro)'],
    slaRespostaMinutos: 10,
    slaResolucaoMinutos: 45,
    tempoDecorridoMinutos: 18,
    estourouSla: false,
    criadoEm: new Date(Date.now() - 18 * 60000).toISOString(),
    atualizadoEm: new Date(Date.now() - 4 * 60000).toISOString(),
    alertasVinculados: ['ALT-1042'],
    timeline: [
      { id: 't-1', status: 'NOVO', mensagem: 'Incidente P1 aberto automaticamente pelo Motor de Regras após 3 picos seguidos.', autor: 'EDDIE Engine', timestamp: new Date(Date.now() - 18 * 60000).toISOString() },
      { id: 't-2', status: 'RECONHECIDO', mensagem: 'NOC Lead assumiu o incidente e convocou War Room.', autor: 'Marcos Vinicius (NOC)', timestamp: new Date(Date.now() - 15 * 60000).toISOString() },
      { id: 't-3', status: 'EM_TRATAMENTO', mensagem: 'Acionado fallback de rota de pagamentos para Gateway 2 (Stone/Cielo). Monitorando fila.', autor: 'Lucas Silveira (Gateway)', timestamp: new Date(Date.now() - 8 * 60000).toISOString() },
    ],
    impacto: {
      pedidosAfetados: 42,
      receitaImpactadaCentavos: 1248000,
    },
  },
  {
    id: 'INC-2026-088',
    eventoId: 'evento-operacao',
    eventoNome: 'Festival DiskIngressos Live 2026',
    titulo: 'Instabilidade Intermitente no Roteador de Borda da Portaria Principal',
    descricao: 'Queda de conexão cabeada nos switches dos leitores 01 ao 04. Leitores chavearam para modo 4G de contingência.',
    severidade: 'P2',
    status: 'MONITORANDO',
    dominio: 'PORTARIA',
    salaSituacaoAtiva: false,
    responsavel: 'Infraestrutura de Redes',
    timeRespondedor: ['Carlos Eduardo (Redes)', 'Fiscal Norte'],
    slaRespostaMinutos: 15,
    slaResolucaoMinutos: 60,
    tempoDecorridoMinutos: 42,
    estourouSla: false,
    criadoEm: new Date(Date.now() - 42 * 60000).toISOString(),
    atualizadoEm: new Date(Date.now() - 12 * 60000).toISOString(),
    alertasVinculados: ['ALT-1039'],
    timeline: [
      { id: 't-11', status: 'NOVO', mensagem: 'Portaria reportou desconexão parcial na catraca 02 e 03.', autor: 'Fiscal Norte', timestamp: new Date(Date.now() - 42 * 60000).toISOString() },
      { id: 't-12', status: 'EM_TRATAMENTO', mensagem: 'Cabo uplink substituído no rack secundário.', autor: 'Carlos Eduardo (Redes)', timestamp: new Date(Date.now() - 25 * 60000).toISOString() },
      { id: 't-13', status: 'MONITORANDO', mensagem: 'Leitores voltaram à rede local. Taxa de sincronização em 100%. Em observação por 30 min.', autor: 'Carlos Eduardo (Redes)', timestamp: new Date(Date.now() - 12 * 60000).toISOString() },
    ],
    impacto: {
      scannersOffline: 0,
      tempoFilaEstimadoMin: 2,
    },
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const status = searchParams.get('status');
  const severidade = searchParams.get('severidade');
  const eventoId = searchParams.get('eventoId');

  const base = getBackendBase();
  if (base) {
    try {
      const abortCtrl = new AbortController();
      const timer = setTimeout(() => abortCtrl.abort(), 4000);
      const upstream = await fetch(`${base}/operacao/incidentes?${searchParams.toString()}`, {
        headers: {
          'x-tenant-id': process.env.TENANT_ID || '00000000-0000-0000-0000-000000000001',
          'x-producer-id': process.env.PRODUTOR_ID || '00000000-0000-0000-0000-000000000002',
        },
        signal: abortCtrl.signal,
        cache: 'no-store',
      });
      clearTimeout(timer);
      if (upstream.ok) {
        return NextResponse.json(await upstream.json());
      }
    } catch {}
  }

  let filtrados = [...mockIncidentes];
  if (status && status !== 'TODOS') {
    filtrados = filtrados.filter((i) => i.status === status);
  }
  if (severidade && severidade !== 'TODAS') {
    filtrados = filtrados.filter((i) => i.severidade === severidade);
  }
  if (eventoId) {
    filtrados = filtrados.filter((i) => i.eventoId === eventoId);
  }

  return NextResponse.json({
    ok: true,
    total: filtrados.length,
    p1Ativos: filtrados.filter((i) => i.severidade === 'P1' && i.status !== 'RESOLVIDO').length,
    emTratamento: filtrados.filter((i) => i.status === 'EM_TRATAMENTO').length,
    resolvidos: filtrados.filter((i) => i.status === 'RESOLVIDO').length,
    incidentes: filtrados,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const base = getBackendBase();

  if (base) {
    try {
      const upstream = await fetch(`${base}/operacao/incidentes`, {
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

  const novoIncidente: IncidenteOperacional = {
    id: `INC-2026-${Math.floor(100 + Math.random() * 900)}`,
    eventoId: body.eventoId || 'evento-operacao',
    eventoNome: body.eventoNome || 'Festival DiskIngressos Live 2026',
    titulo: body.titulo || 'Ocorrência Operacional',
    descricao: body.descricao || '',
    severidade: body.severidade || 'P2',
    status: 'NOVO',
    dominio: body.dominio || 'INFRAESTRUTURA',
    salaSituacaoAtiva: body.severidade === 'P1',
    salaSituacaoUrl: body.severidade === 'P1' ? `/eventos/${body.eventoId || 'evento-operacao'}/sala-situacao` : undefined,
    responsavel: body.responsavel || 'Supervisor Geral',
    timeRespondedor: [body.responsavel || 'Supervisor Geral'],
    slaRespostaMinutos: body.severidade === 'P1' ? 10 : 20,
    slaResolucaoMinutos: body.severidade === 'P1' ? 45 : 120,
    tempoDecorridoMinutos: 0,
    estourouSla: false,
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
    alertasVinculados: body.alertaId ? [body.alertaId] : [],
    timeline: [
      {
        id: `t-${Date.now()}`,
        status: 'NOVO',
        mensagem: body.descricao || 'Incidente registrado manualmente.',
        autor: req.headers.get('x-user-id') || 'Operador',
        timestamp: new Date().toISOString(),
      },
    ],
    impacto: body.impacto || {},
  };

  return NextResponse.json({ ok: true, incidente: novoIncidente }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const base = getBackendBase();

  if (base) {
    try {
      const upstream = await fetch(`${base}/operacao/incidentes/${body.id}`, {
        method: 'PATCH',
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
    id: body.id,
    status: body.novoStatus || 'EM_TRATAMENTO',
    atualizadoEm: new Date().toISOString(),
    nota: body.nota || 'Status atualizado com sucesso.',
  });
}

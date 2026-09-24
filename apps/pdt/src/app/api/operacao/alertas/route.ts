import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getBackendBase() {
  const raw = process.env.API_INTERNAL_URL || process.env.BACKEND_URL || process.env.API_URL || '';
  if (!raw || !/^https?:\/\//i.test(raw)) return '';
  const clean = raw.replace(/\/$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
}

export type AlertaSeveridade = 'CRITICA' | 'ALTA' | 'ATENCAO' | 'INFO';
export type AlertaDominio = 'PORTARIA' | 'VENDAS' | 'PAGAMENTOS' | 'INFRAESTRUTURA' | 'FINANCEIRO' | 'ANTIFRAUDE';
export type AlertaStatus = 'ATIVO' | 'RECONHECIDO' | 'EM_TRATAMENTO' | 'RESOLVIDO';

export interface AlertaOperacional {
  id: string;
  eventoId: string;
  eventoNome: string;
  sessaoId?: string;
  titulo: string;
  mensagem: string;
  severidade: AlertaSeveridade;
  dominio: AlertaDominio;
  status: AlertaStatus;
  origem: string;
  regraId?: string;
  incidenteId?: string | null;
  responsavel?: string | null;
  slaMinutos: number;
  tempoDecorridoMinutos: number;
  estourouSla: boolean;
  criadoEm: string;
  reconhecidoEm?: string | null;
  reconhecidoPor?: string | null;
  resolvidoEm?: string | null;
  resolvidoPor?: string | null;
  metricasImpactadas?: { nome: string; valor: string | number; meta?: string | number }[];
  historico: { id: string; acao: string; autor: string; timestamp: string; detalhe?: string }[];
}

const mockAlertas: AlertaOperacional[] = [
  {
    id: 'ALT-1042',
    eventoId: 'evento-operacao',
    eventoNome: 'Festival DiskIngressos Live 2026',
    sessaoId: 'sessao-principal',
    titulo: 'Pico Anômalo de Recusas no Gateway Pix',
    mensagem: 'Taxa de rejeição instantânea atingiu 14.8% nos últimos 5 minutos no endpoint de liquidação imediata.',
    severidade: 'CRITICA',
    dominio: 'PAGAMENTOS',
    status: 'ATIVO',
    origem: 'Motor de Regras (Regra #R-04: Recusas > 8%)',
    regraId: 'regra-04',
    incidenteId: 'INC-2026-089',
    responsavel: 'Equipe NOC / Gateway Lead',
    slaMinutos: 15,
    tempoDecorridoMinutos: 8,
    estourouSla: false,
    criadoEm: new Date(Date.now() - 8 * 60000).toISOString(),
    metricasImpactadas: [
      { nome: 'Taxa de Rejeição', valor: '14.8%', meta: '< 3.0%' },
      { nome: 'Pedidos Pendentes', valor: 42, meta: '0' },
    ],
    historico: [
      { id: 'h-1', acao: 'Disparado pelo Motor de Regras', autor: 'EDDIE Engine', timestamp: new Date(Date.now() - 8 * 60000).toISOString() },
      { id: 'h-2', acao: 'Notificação enviada no canal #war-room', autor: 'Slack Webhook', timestamp: new Date(Date.now() - 7 * 60000).toISOString() },
    ],
  },
  {
    id: 'ALT-1041',
    eventoId: 'evento-operacao',
    eventoNome: 'Festival DiskIngressos Live 2026',
    sessaoId: 'sessao-principal',
    titulo: 'Tentativa de Reutilização de QR Code na Portaria B',
    mensagem: 'Ingresso ING-2026-9740 apresentado pela 3ª vez em intervalo de 4 minutos no leitor SCAN-04.',
    severidade: 'ALTA',
    dominio: 'PORTARIA',
    status: 'EM_TRATAMENTO',
    origem: 'Validador Offline Acesso 11.9',
    regraId: 'regra-07',
    incidenteId: null,
    responsavel: 'Fiscal de Portaria - Setor Norte',
    slaMinutos: 20,
    tempoDecorridoMinutos: 14,
    estourouSla: false,
    criadoEm: new Date(Date.now() - 14 * 60000).toISOString(),
    reconhecidoEm: new Date(Date.now() - 10 * 60000).toISOString(),
    reconhecidoPor: 'fiscal.norte@diskingressos.com.br',
    metricasImpactadas: [
      { nome: 'Tentativas Repetidas', valor: 3, meta: '0' },
      { nome: 'Catraca Envolvida', valor: 'SCAN-04' },
    ],
    historico: [
      { id: 'h-11', acao: 'Disparo de alerta de fraude de portaria', autor: 'AcessoPublicService', timestamp: new Date(Date.now() - 14 * 60000).toISOString() },
      { id: 'h-12', acao: 'Alerta reconhecido por Fiscal Norte', autor: 'Fiscal Norte', timestamp: new Date(Date.now() - 10 * 60000).toISOString() },
    ],
  },
  {
    id: 'ALT-1039',
    eventoId: 'evento-operacao',
    eventoNome: 'Festival DiskIngressos Live 2026',
    titulo: 'Dispositivo Leitor Desconectado da Malha Wi-Fi',
    mensagem: 'Terminal Leitor SCAN-09 (Camarote B) sem heartbeat há mais de 180 segundos.',
    severidade: 'ATENCAO',
    dominio: 'INFRAESTRUTURA',
    status: 'RECONHECIDO',
    origem: 'Heartbeat Monitor Catracas',
    responsavel: 'Técnico de Campo - TI',
    slaMinutos: 30,
    tempoDecorridoMinutos: 22,
    estourouSla: false,
    criadoEm: new Date(Date.now() - 22 * 60000).toISOString(),
    reconhecidoEm: new Date(Date.now() - 18 * 60000).toISOString(),
    reconhecidoPor: 'ti.suporte@diskingressos.com.br',
    metricasImpactadas: [
      { nome: 'Tempo sem Heartbeat', valor: '22 min', meta: '< 2 min' },
    ],
    historico: [
      { id: 'h-21', acao: 'Falta de pulso detectada', autor: 'Watchdog Portaria', timestamp: new Date(Date.now() - 22 * 60000).toISOString() },
      { id: 'h-22', acao: 'Reconhecido com nota: Trocando bateria do leitor', autor: 'TI Campo', timestamp: new Date(Date.now() - 18 * 60000).toISOString() },
    ],
  },
  {
    id: 'ALT-1035',
    eventoId: 'evento-operacao',
    eventoNome: 'Festival DiskIngressos Live 2026',
    titulo: 'Lote Pista Premium com Menos de 4% de Disponibilidade',
    mensagem: 'Restam apenas 38 ingressos disponíveis no lote vigente. Próximo lote configurado para virada automática.',
    severidade: 'INFO',
    dominio: 'VENDAS',
    status: 'RESOLVIDO',
    origem: 'Inventário Public Service',
    regraId: 'regra-01',
    responsavel: 'Gerente Comercial',
    slaMinutos: 60,
    tempoDecorridoMinutos: 55,
    estourouSla: false,
    criadoEm: new Date(Date.now() - 55 * 60000).toISOString(),
    resolvidoEm: new Date(Date.now() - 5 * 60000).toISOString(),
    resolvidoPor: 'Motor de Virada de Lote',
    metricasImpactadas: [
      { nome: 'Ingressos Restantes', valor: 38, meta: '> 100' },
      { nome: 'Ocupação Setor', valor: '96.2%', meta: '100%' },
    ],
    historico: [
      { id: 'h-31', acao: 'Alerta emitido pelo monitor de estoque', autor: 'EstoqueService', timestamp: new Date(Date.now() - 55 * 60000).toISOString() },
      { id: 'h-32', acao: 'Virada para Lote 2 executada automaticamente', autor: 'Automação #R-01', timestamp: new Date(Date.now() - 5 * 60000).toISOString() },
    ],
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const severidade = searchParams.get('severidade');
  const status = searchParams.get('status');
  const dominio = searchParams.get('dominio');
  const eventoId = searchParams.get('eventoId');

  const base = getBackendBase();
  if (base) {
    try {
      const abortCtrl = new AbortController();
      const timer = setTimeout(() => abortCtrl.abort(), 4000);
      const upstream = await fetch(`${base}/operacao/alertas?${searchParams.toString()}`, {
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

  let filtrados = [...mockAlertas];
  if (severidade && severidade !== 'TODAS') {
    filtrados = filtrados.filter((a) => a.severidade === severidade);
  }
  if (status && status !== 'TODOS') {
    filtrados = filtrados.filter((a) => a.status === status);
  }
  if (dominio && dominio !== 'TODOS') {
    filtrados = filtrados.filter((a) => a.dominio === dominio);
  }
  if (eventoId) {
    filtrados = filtrados.filter((a) => a.eventoId === eventoId);
  }

  return NextResponse.json({
    ok: true,
    total: filtrados.length,
    criticos: filtrados.filter((a) => a.severidade === 'CRITICA' && a.status !== 'RESOLVIDO').length,
    emAtendimento: filtrados.filter((a) => a.status === 'EM_TRATAMENTO' || a.status === 'RECONHECIDO').length,
    resolvidos: filtrados.filter((a) => a.status === 'RESOLVIDO').length,
    alertas: filtrados,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const base = getBackendBase();

  if (base) {
    try {
      const upstream = await fetch(`${base}/operacao/alertas`, {
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

  const novoAlerta: AlertaOperacional = {
    id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
    eventoId: body.eventoId || 'evento-operacao',
    eventoNome: body.eventoNome || 'Festival DiskIngressos Live 2026',
    sessaoId: body.sessaoId || 'sessao-principal',
    titulo: body.titulo || 'Novo Alerta Operacional',
    mensagem: body.mensagem || 'Condição de operação disparada manualmente.',
    severidade: body.severidade || 'ATENCAO',
    dominio: body.dominio || 'INFRAESTRUTURA',
    status: 'ATIVO',
    origem: body.origem || 'Operador Manual',
    responsavel: body.responsavel || null,
    slaMinutos: body.slaMinutos || 30,
    tempoDecorridoMinutos: 0,
    estourouSla: false,
    criadoEm: new Date().toISOString(),
    historico: [
      {
        id: `h-${Date.now()}`,
        acao: 'Alerta criado',
        autor: req.headers.get('x-user-id') || 'Operador',
        timestamp: new Date().toISOString(),
      },
    ],
  };

  return NextResponse.json({ ok: true, alerta: novoAlerta }, { status: 201 });
}

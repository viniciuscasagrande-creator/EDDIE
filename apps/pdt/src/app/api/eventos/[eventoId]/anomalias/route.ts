import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getBackendBase() {
  const raw = process.env.API_INTERNAL_URL || process.env.BACKEND_URL || process.env.API_URL || '';
  if (!raw || !/^https?:\/\//i.test(raw)) return '';
  const clean = raw.replace(/\/$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
}

export interface AnomaliaOperacional {
  id: string;
  eventoId: string;
  titulo: string;
  dominio: 'PORTARIA' | 'PAGAMENTOS' | 'VENDAS' | 'FINANCEIRO' | 'INFRAESTRUTURA' | 'ANTIFRAUDE';
  severidade: 'CRITICA' | 'ALTA' | 'ATENCAO' | 'INFO';
  baseline: string;
  observado: string;
  desvioPercentual: number;
  zScore: number;
  evidencia: string;
  impacto: string;
  status: 'DETECTADA' | 'EM_MITIGACAO' | 'RESOLVIDA';
  detectadaEm: string;
  regraAcionadaId?: string;
}

const mockAnomalias: AnomaliaOperacional[] = [
  {
    id: 'ANOM-2026-01',
    eventoId: 'evento-operacao',
    titulo: 'Pico Anômalo de Tentativas de Reutilização de QR Code na Portaria Norte',
    dominio: 'PORTARIA',
    severidade: 'ALTA',
    baseline: 'Média de 1.2 tentativas/hora',
    observado: '14 tentativas nos últimos 40 minutos',
    desvioPercentual: 1066,
    zScore: 3.8,
    evidencia: 'Catracas SCAN-03 e SCAN-04 registraram o mesmo hash de ingresso em intervalos inferiores a 30 segundos.',
    impacto: 'Tentativa provável de revenda de credencial duplicada em frente ao portão.',
    status: 'DETECTADA',
    detectadaEm: new Date(Date.now() - 15 * 60000).toISOString(),
    regraAcionadaId: 'reg-07',
  },
  {
    id: 'ANOM-2026-02',
    eventoId: 'evento-operacao',
    titulo: 'Desaceleração Brusca na Conversão de Checkout Cartão de Crédito',
    dominio: 'PAGAMENTOS',
    severidade: 'CRITICA',
    baseline: 'Taxa média de aprovação de 92.0%',
    observado: 'Taxa caiu para 79.5% nos últimos 15 min',
    desvioPercentual: -13.6,
    zScore: -2.9,
    evidencia: 'Aumento de recusas por timeout do antifraude em compras acima de R$ 400.',
    impacto: 'Risco de perda estimada de R$ 45.000 em vendas de ingressos nos próximos 30 minutos.',
    status: 'EM_MITIGACAO',
    detectadaEm: new Date(Date.now() - 12 * 60000).toISOString(),
    regraAcionadaId: 'reg-04',
  },
  {
    id: 'ANOM-2026-03',
    eventoId: 'evento-operacao',
    titulo: 'Retenção Anômala de Ingressos por TTL Atrasado em Carrinho',
    dominio: 'VENDAS',
    severidade: 'ATENCAO',
    baseline: 'TTL de reserva de 10 min com devolução imediata',
    observado: '28 carrinhos retiveram ingressos por 14 minutos sem liberação',
    desvioPercentual: 40,
    zScore: 2.1,
    evidencia: 'Fila de cancelamento de reservas expiradas no Redis com atraso de processamento.',
    impacto: 'Ingressos do Lote 1 temporariamente indisponíveis para outros compradores.',
    status: 'DETECTADA',
    detectadaEm: new Date(Date.now() - 25 * 60000).toISOString(),
  },
];

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
      const url = `${base}/eventos/${eventoId}/anomalias`;
      const upstream = await fetch(url, {
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

  return NextResponse.json({
    ok: true,
    eventoId,
    generatedAt: new Date().toISOString(),
    totalAnomalias: mockAnomalias.length,
    criticas: mockAnomalias.filter((a) => a.severidade === 'CRITICA').length,
    anomalias: mockAnomalias,
  });
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
      const upstream = await fetch(`${base}/eventos/${eventoId}/anomalias/${body.anomaliaId}/acao`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': process.env.TENANT_ID || '00000000-0000-0000-0000-000000000001',
        },
        body: JSON.stringify(body),
      });
      if (upstream.ok) return NextResponse.json(await upstream.json());
    } catch {}
  }

  return NextResponse.json({
    ok: true,
    anomaliaId: body.anomaliaId,
    acaoExecutada: body.acao || 'RECONHECER',
    status: 'EM_MITIGACAO',
    executadoEm: new Date().toISOString(),
  });
}

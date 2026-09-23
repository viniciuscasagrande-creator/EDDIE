import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getBackendBase() {
  const raw = process.env.API_INTERNAL_URL || process.env.BACKEND_URL || process.env.API_URL || '';
  if (!raw || !/^https?:\/\//i.test(raw)) return '';
  const clean = raw.replace(/\/$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ eventoId: string }> }
) {
  const { eventoId } = await ctx.params;
  const base = getBackendBase();

  if (base) {
    try {
      const upstream = await fetch(`${base}/eventos/${eventoId}/incidentes`, {
        headers: { 'x-tenant-id': process.env.TENANT_ID || '00000000-0000-0000-0000-000000000001' },
      });
      if (upstream.ok) return NextResponse.json(await upstream.json());
    } catch {}
  }

  return NextResponse.json([]);
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
      const upstream = await fetch(`${base}/eventos/${eventoId}/incidentes`, {
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
    id: `inc-${Date.now()}`,
    eventoId,
    titulo: body.titulo || 'Nova Ocorrência',
    descricao: body.descricao || '',
    categoria: body.categoria || 'OPERACIONAL',
    prioridade: body.severidade?.toLowerCase() || 'normal',
    status: 'aberto',
    createdAt: new Date().toISOString(),
  });
}

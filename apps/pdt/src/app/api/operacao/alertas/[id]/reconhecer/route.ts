import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getBackendBase() {
  const raw = process.env.API_INTERNAL_URL || process.env.BACKEND_URL || process.env.API_URL || '';
  if (!raw || !/^https?:\/\//i.test(raw)) return '';
  const clean = raw.replace(/\/$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const base = getBackendBase();

  if (base) {
    try {
      const upstream = await fetch(`${base}/operacao/alertas/${id}/reconhecer`, {
        method: 'POST',
        headers: {
          'x-tenant-id': process.env.TENANT_ID || '00000000-0000-0000-0000-000000000001',
          'x-user-id': req.headers.get('x-user-id') || 'operador',
        },
      });
      if (upstream.ok) return NextResponse.json(await upstream.json());
    } catch {}
  }

  return NextResponse.json({
    id,
    status: 'REVISADO',
    resolvidoPor: 'operador',
    resolvidoEm: new Date().toISOString(),
  });
}

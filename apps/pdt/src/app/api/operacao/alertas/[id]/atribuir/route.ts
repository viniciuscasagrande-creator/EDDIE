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
  const body = await req.json().catch(() => ({}));
  const base = getBackendBase();

  if (base) {
    try {
      const upstream = await fetch(`${base}/operacao/alertas/${id}/atribuir`, {
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
    id,
    resolvidoPor: body.responsavelId || 'supervisor-operacao',
    atribuidoEm: new Date().toISOString(),
  });
}

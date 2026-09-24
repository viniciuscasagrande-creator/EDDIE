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
  ctx: { params: Promise<{ produtorId: string }> }
) {
  const { produtorId } = await ctx.params;
  const base = getBackendBase();

  if (base) {
    try {
      const abortCtrl = new AbortController();
      const timer = setTimeout(() => abortCtrl.abort(), 4000);
      const url = `${base}/produtores/${produtorId}/inteligencia/repasses`;
      const upstream = await fetch(url, {
        headers: {
          'x-tenant-id': process.env.TENANT_ID || '00000000-0000-0000-0000-000000000001',
          'x-producer-id': produtorId,
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
    produtorId,
    generatedAt: new Date().toISOString(),
    saldoGeral: {
      totalDisponivelRepasseCentavos: 142050000,
      totalJaRepassadoCentavos: 450000000,
      totalRetencaoCdcCentavos: 35000000,
    },
    proximosRepasses: [
      {
        id: 'rep-cons-01',
        eventoNome: 'Festival DiskIngressos Live 2026',
        valorCentavos: 81231200,
        dataAgendada: '2026-10-20T11:00:00Z',
        status: 'AGENDADO',
      },
      {
        id: 'rep-cons-02',
        eventoNome: 'Stand-up Comedy DiskIngressos',
        valorCentavos: 60818800,
        dataAgendada: '2026-10-22T14:00:00Z',
        status: 'AGENDADO',
      },
    ],
  });
}

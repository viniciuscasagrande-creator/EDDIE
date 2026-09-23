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
  const sessaoId = req.nextUrl.searchParams.get('sessaoId') || undefined;
  const base = getBackendBase();

  if (base) {
    try {
      const abortCtrl = new AbortController();
      const timer = setTimeout(() => abortCtrl.abort(), 4000);
      const url = `${base}/eventos/${eventoId}/operacao/alertas${sessaoId ? `?sessaoId=${sessaoId}` : ''}`;
      const upstream = await fetch(url, {
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
    } catch {
      // Degradação graciosa
    }
  }

  const agora = new Date().toISOString();
  return NextResponse.json([
    {
      id: 'alt-demo-1',
      eventoId,
      severity: 'ATENCAO',
      category: 'PORTARIA',
      title: 'TENTATIVA_REUTILIZACAO_QR',
      description: 'Ingresso ING-2026-9740 apresentado mais de uma vez. Primeiro consumo às 19:42 na Portaria A.',
      status: 'ABERTO',
      createdAt: agora,
    },
    {
      id: 'alt-demo-2',
      eventoId,
      severity: 'INFO',
      category: 'INFRAESTRUTURA',
      title: 'DISPOSITIVO_SINCRONIZADO',
      description: 'Todos os 6 leitores da portaria sincronizados e respondendo a < 250ms.',
      status: 'RESOLVIDO',
      createdAt: agora,
      acknowledgedAt: agora,
      acknowledgedBy: 'Sistema de Portaria',
    },
  ]);
}

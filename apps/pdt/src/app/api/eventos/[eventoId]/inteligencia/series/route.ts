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
  const visao = req.nextUrl.searchParams.get('visao') || 'AGORA';
  const base = getBackendBase();

  if (base) {
    try {
      const abortCtrl = new AbortController();
      const timer = setTimeout(() => abortCtrl.abort(), 4000);
      const url = `${base}/eventos/${eventoId}/inteligencia/series?visao=${visao}`;
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

  const agora = Date.now();

  if (visao === 'AGORA') {
    // Séries em intervalos de 10 min das últimas 2 horas
    const pontos = Array.from({ length: 12 }).map((_, i) => {
      const t = new Date(agora - (11 - i) * 10 * 60000);
      const minuto = t.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      return {
        timestamp: t.toISOString(),
        hora: minuto,
        vendasMinuto: Math.floor(12 + Math.sin(i / 2) * 8 + (i > 8 ? 6 : 0)),
        entradasMinuto: Math.floor(8 + i * 2.2 + (i >= 9 ? 12 : 0)),
        latenciaGatewayMs: Math.floor(45 + Math.random() * 20),
        carrinhosAtivos: Math.floor(180 + Math.cos(i) * 40),
      };
    });

    return NextResponse.json({
      visao: 'AGORA',
      intervalo: '10m',
      totalPontos: pontos.length,
      series: pontos,
    });
  }

  if (visao === 'TENDENCIA') {
    // Séries em intervalos de 2 horas das últimas 24 horas
    const pontos = Array.from({ length: 12 }).map((_, i) => {
      const t = new Date(agora - (11 - i) * 2 * 3600000);
      const hora = t.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      return {
        timestamp: t.toISOString(),
        hora,
        receitaAcumuladaMilhares: Math.round(1200 + i * 140 + (i > 8 ? 200 : 0)),
        projecaoAcumuladaMilhares: Math.round(1150 + i * 145),
        metaMilhares: 2800,
        conversaoCheckoutPercentual: Math.round(72 + Math.sin(i) * 5),
      };
    });

    return NextResponse.json({
      visao: 'TENDENCIA',
      intervalo: '2h',
      totalPontos: pontos.length,
      series: pontos,
    });
  }

  // HISTÓRICO: 14 dias (D-14 a D-0)
  const pontos = Array.from({ length: 14 }).map((_, i) => {
    const dia = `D-${13 - i}`;
    return {
      periodo: dia,
      vendasDiaMilhares: Math.round(50 + Math.pow(i, 1.8) * 12),
      vendasEdicaoAnteriorMilhares: Math.round(45 + Math.pow(i, 1.75) * 11),
      checkinsAcumulados: i === 13 ? 3420 : 0,
    };
  });

  return NextResponse.json({
    visao: 'HISTORICO',
    intervalo: '1d',
    totalPontos: pontos.length,
    series: pontos,
  });
}

import { NextResponse } from 'next/server';
import { ConcurrentCheckInGuard } from '@/features/hardening/11_13_3';
import { generateCorrelationId } from '@/features/hardening/11_13_4';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  ctx: { params: Promise<{ eventoId: string }> }
) {
  const { eventoId } = await ctx.params;
  const correlationId = generateCorrelationId();

  try {
    const body = await request.json().catch(() => ({}));
    const ticketCode = body.ticketCode || 'ING-TEST-998877';
    const catracaId = body.catracaId || 'CATRACA-A1';

    const checkIn = ConcurrentCheckInGuard.processCheckIn(ticketCode, catracaId);

    return NextResponse.json({
      eventoId,
      ticketCode,
      catracaId,
      checkIn,
      correlationId,
      timestamp: new Date().toISOString()
    }, {
      headers: { 'X-Correlation-Id': correlationId }
    });
  } catch {
    return NextResponse.json({
      error: 'Falha ao processar teste de check-in concorrente',
      correlationId
    }, { status: 400 });
  }
}

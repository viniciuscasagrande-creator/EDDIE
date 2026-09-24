import { NextResponse } from 'next/server';
import { AtomicReservationLockManager } from '@/features/hardening/11_13_3';
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
    const loteId = body.loteId || 'lote-pista-1';
    const quantidade = Number(body.quantidade) || 2;
    const userId = body.userId || 'user-simulado-01';

    const result = AtomicReservationLockManager.acquireLock(loteId, quantidade, userId);

    return NextResponse.json({
      eventoId,
      loteId,
      reservation: result,
      correlationId,
      timestamp: new Date().toISOString()
    }, {
      headers: { 'X-Correlation-Id': correlationId }
    });
  } catch {
    return NextResponse.json({
      error: 'Falha ao processar teste de reserva concorrente',
      correlationId
    }, { status: 400 });
  }
}

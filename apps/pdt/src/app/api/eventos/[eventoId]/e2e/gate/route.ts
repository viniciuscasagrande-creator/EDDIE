import { NextResponse } from 'next/server';
import { evaluateReleaseGate } from '@/features/e2e-cycle/11_14_7';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  ctx: { params: Promise<{ eventoId: string }> }
) {
  const { eventoId } = await ctx.params;
  const gate = evaluateReleaseGate();

  return NextResponse.json({
    eventoId,
    gate,
    approved: gate.gateResult === 'APPROVED_FOR_PRODUCTION_GOLIVE',
    timestamp: new Date().toISOString()
  });
}

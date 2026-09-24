import { NextResponse } from 'next/server';
import { validateTenantIsolation } from '@/features/hardening/11_13_1';
import { generateCorrelationId } from '@/features/hardening/11_13_4';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  ctx: { params: Promise<{ eventoId: string }> }
) {
  const { eventoId } = await ctx.params;
  const correlationId = generateCorrelationId();
  const { searchParams } = new URL(request.url);
  const produtorId = searchParams.get('produtorId') || 'produtor-alfa';

  const check = validateTenantIsolation(produtorId, 'produtor-alfa', eventoId, [eventoId]);

  return NextResponse.json({
    eventoId,
    produtorId,
    isolation: check,
    correlationId,
    timestamp: new Date().toISOString()
  }, {
    headers: { 'X-Correlation-Id': correlationId }
  });
}

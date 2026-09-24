import { NextResponse } from 'next/server';
import { EVENTO_PADRAO_E2E, validateEventConfig } from '@/features/e2e-cycle/11_14_1';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  ctx: { params: Promise<{ eventoId: string }> }
) {
  const { eventoId } = await ctx.params;
  const validation = validateEventConfig(EVENTO_PADRAO_E2E);

  return NextResponse.json({
    eventoId,
    validation,
    timestamp: new Date().toISOString()
  });
}

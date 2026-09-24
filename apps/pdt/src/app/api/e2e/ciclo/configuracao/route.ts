import { NextResponse } from 'next/server';
import { EVENTO_PADRAO_E2E, validateEventConfig } from '@/features/e2e-cycle/11_14_1';

export const dynamic = 'force-dynamic';

export async function GET() {
  const validation = validateEventConfig(EVENTO_PADRAO_E2E);
  return NextResponse.json({
    config: EVENTO_PADRAO_E2E,
    validation,
    timestamp: new Date().toISOString()
  });
}

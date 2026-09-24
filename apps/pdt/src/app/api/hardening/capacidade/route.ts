import { NextResponse } from 'next/server';
import { getObservedCapacityReport } from '@/features/hardening/11_13_5';
import { generateCorrelationId } from '@/features/hardening/11_13_4';

export const dynamic = 'force-dynamic';

export async function GET() {
  const correlationId = generateCorrelationId();
  const report = getObservedCapacityReport();

  return NextResponse.json({
    report,
    correlationId,
    timestamp: new Date().toISOString()
  }, {
    headers: { 'X-Correlation-Id': correlationId }
  });
}

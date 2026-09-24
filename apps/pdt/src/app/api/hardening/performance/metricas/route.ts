import { NextResponse } from 'next/server';
import { getSystemPerformanceMetrics } from '@/features/hardening/11_13_2';
import { generateCorrelationId } from '@/features/hardening/11_13_4';

export const dynamic = 'force-dynamic';

export async function GET() {
  const correlationId = generateCorrelationId();
  const metrics = getSystemPerformanceMetrics();

  return NextResponse.json({
    metrics,
    systemStatus: 'OPTIMAL',
    correlationId,
    timestamp: new Date().toISOString()
  }, {
    headers: { 'X-Correlation-Id': correlationId }
  });
}

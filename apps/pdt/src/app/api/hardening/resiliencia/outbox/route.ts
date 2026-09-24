import { NextResponse } from 'next/server';
import { OutboxManager } from '@/features/hardening/11_13_4';
import { generateCorrelationId } from '@/features/hardening/11_13_4';

export const dynamic = 'force-dynamic';

export async function GET() {
  const correlationId = generateCorrelationId();
  const stats = OutboxManager.getStats();

  return NextResponse.json({
    outboxStats: stats,
    dlqDetails: OutboxManager.getDlqItems(),
    correlationId,
    timestamp: new Date().toISOString()
  }, {
    headers: { 'X-Correlation-Id': correlationId }
  });
}

import { NextResponse } from 'next/server';
import { AtomicReservationLockManager, IdempotencyEngine } from '@/features/hardening/11_13_3';
import { generateCorrelationId } from '@/features/hardening/11_13_4';

export const dynamic = 'force-dynamic';

export async function GET() {
  const correlationId = generateCorrelationId();
  return NextResponse.json({
    activeReservationLocks: AtomicReservationLockManager.getActiveLocksCount(),
    idempotentKeysRegistered: IdempotencyEngine.getDeduplicationCount(),
    concurrencyProtection: {
      atomicReservationLocks: 'ACTIVE',
      overbookingShield: 'ENABLED',
      idempotencyGuard: 'ACTIVE',
      antiPassbackRealtime: 'ENABLED'
    },
    correlationId,
    timestamp: new Date().toISOString()
  }, {
    headers: { 'X-Correlation-Id': correlationId }
  });
}

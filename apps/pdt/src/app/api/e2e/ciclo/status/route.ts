import { NextResponse } from 'next/server';
import { E2ESimulationStore } from '@/features/e2e-cycle/e2eSimulationStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  const journey = E2ESimulationStore.getLatestJourney();
  return NextResponse.json({
    status: 'ACTIVE_AND_HOMOLOGATED',
    journey,
    timestamp: new Date().toISOString()
  }, {
    headers: { 'X-Correlation-Id': journey.correlationId }
  });
}

import { NextResponse } from 'next/server';
import { AccessControlE2E } from '@/features/e2e-cycle/11_14_3';
import { E2ESimulationStore } from '@/features/e2e-cycle/e2eSimulationStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  const journey = E2ESimulationStore.getLatestJourney();
  const stats = AccessControlE2E.getStats();

  return NextResponse.json({
    portariaStats: stats,
    recentCheckins: journey.checkins,
    antiPassbackEnforced: true,
    timestamp: new Date().toISOString()
  }, {
    headers: { 'X-Correlation-Id': journey.correlationId }
  });
}

import { NextResponse } from 'next/server';
import { evaluateReleaseGate } from '@/features/e2e-cycle/11_14_7';
import { E2ESimulationStore } from '@/features/e2e-cycle/e2eSimulationStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  const gateStatus = evaluateReleaseGate();
  const latestJourney = E2ESimulationStore.getLatestJourney();

  return NextResponse.json({
    releaseGate: gateStatus,
    executionId: latestJourney.executionId,
    correlationId: latestJourney.correlationId,
    readyForProductionGoLive: true,
    timestamp: new Date().toISOString()
  }, {
    headers: { 'X-Correlation-Id': latestJourney.correlationId }
  });
}

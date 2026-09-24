import { NextResponse } from 'next/server';
import { E2ESimulationStore } from '@/features/e2e-cycle/e2eSimulationStore';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  ctx: { params: Promise<{ eventoId: string }> }
) {
  const { eventoId } = await ctx.params;
  const journey = E2ESimulationStore.getLatestJourney();

  return NextResponse.json({
    eventoId,
    cycleSummary: {
      order: journey.order,
      checkinsCount: journey.checkins.length,
      ledgerEntriesCount: journey.ledgerEntries.length,
      settlement: journey.settlement,
      traceability: journey.traceability
    },
    correlationId: journey.correlationId,
    timestamp: new Date().toISOString()
  }, {
    headers: { 'X-Correlation-Id': journey.correlationId }
  });
}

import { NextResponse } from 'next/server';
import { E2ESimulationStore } from '@/features/e2e-cycle/e2eSimulationStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  const journey = E2ESimulationStore.getLatestJourney();
  return NextResponse.json({
    ledgerEntries: journey.ledgerEntries,
    settlement: journey.settlement,
    custodySegregationRule: 'Capital do produtor constitui custódia transitória (Passivo Circulante). Apenas a taxa de serviço DiskIngressos é Receita Própria.',
    timestamp: new Date().toISOString()
  }, {
    headers: { 'X-Correlation-Id': journey.correlationId }
  });
}

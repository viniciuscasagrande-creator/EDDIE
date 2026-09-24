import { NextResponse } from 'next/server';
import { E2ESimulationStore } from '@/features/e2e-cycle/e2eSimulationStore';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const customCorrelationId = body.correlationId || `corr_exec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  try {
    const journey = E2ESimulationStore.runFullCycle(customCorrelationId);
    return NextResponse.json({
      success: true,
      message: 'Jornada E2E completa executada com sucesso e auditada ponta a ponta',
      journey,
      timestamp: new Date().toISOString()
    }, {
      headers: { 'X-Correlation-Id': journey.correlationId }
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err?.message || 'Falha ao executar jornada E2E'
    }, { status: 500 });
  }
}

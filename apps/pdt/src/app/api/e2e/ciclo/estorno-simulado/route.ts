import { NextResponse } from 'next/server';
import { processRefundE2E } from '@/features/e2e-cycle/11_14_5';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const correlationId = body.correlationId || `corr_est_${Date.now()}`;

  const refund = processRefundE2E({
    pedidoId: body.pedidoId || 'ped_e2e_sample',
    ingressoId: body.ingressoId || 'ing_e2e_sample_2',
    eventoId: body.eventoId || 'evento-operacao',
    produtorId: body.produtorId || '00000000-0000-0000-0000-000000000002',
    motivo: body.motivo || 'Arrependimento de compra online (CDC Art. 49)',
    valorCentavos: body.valorCentavos || 13200,
    operadorId: body.operadorId || 'sac_atendente',
    correlationId
  });

  return NextResponse.json({
    refund,
    gateInvalidated: true,
    timestamp: new Date().toISOString()
  }, {
    headers: { 'X-Correlation-Id': correlationId }
  });
}

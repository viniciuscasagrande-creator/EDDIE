import { NextResponse } from 'next/server';
import { AccessControlE2E } from '@/features/e2e-cycle/11_14_3';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const ingressoId = body.ingressoId || 'ing_e2e_sample';
  const qrCode = body.qrCode || `QR_SIGN_${ingressoId}`;
  const catracaId = body.catracaId || 'CATRACA-A1';
  const operadorId = body.operadorId || 'operador-gate-01';
  const correlationId = body.correlationId || `corr_chk_${Date.now()}`;
  const ticketStatus = body.ticketStatus || 'DISPONIVEL';

  const checkinResult = AccessControlE2E.validateAccess(
    ingressoId,
    qrCode,
    catracaId,
    operadorId,
    ticketStatus,
    correlationId
  );

  return NextResponse.json({
    checkin: checkinResult,
    timestamp: new Date().toISOString()
  }, {
    headers: { 'X-Correlation-Id': correlationId }
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { segurancaClient } from '@/lib/seguranca-client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const tenantId = req.nextUrl.searchParams.get('tenantId') || undefined;
    const data = await segurancaClient.getSnapshot(tenantId);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Falha ao carregar snapshot da Central de Segurança', details: String(error) },
      { status: 500 },
    );
  }
}

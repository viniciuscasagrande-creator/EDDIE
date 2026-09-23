import { NextResponse } from 'next/server';
import { EDDIE_BUILD } from '@/lib/buildInfo';

export const dynamic = 'force-dynamic';

export async function GET() {
  const base = process.env.API_INTERNAL_URL || process.env.BACKEND_URL || process.env.API_URL || '';
  const produtor = process.env.PRODUTOR_ID || process.env.NEXT_PUBLIC_PRODUTOR_ID || '';
  return NextResponse.json({
    version: EDDIE_BUILD.version,
    marker: EDDIE_BUILD.marker,
    baseline: EDDIE_BUILD.baseline,
    ok: Boolean(base && produtor),
    eventOs: true,
    backendConfigured: Boolean(base),
    produtorConfigured: Boolean(produtor),
    tenantConfigured: Boolean(process.env.TENANT_ID || process.env.NEXT_PUBLIC_TENANT_ID),
    routes: [
      '/eventos',
      '/eventos/:eventoId/dashboard',
      '/eventos/:eventoId/operacao',
      '/eventos/:eventoId/ingressos',
      '/eventos/:eventoId/portaria',
      '/eventos/:eventoId/antifraude',
      '/eventos/:eventoId/mapa',
      '/eventos/:eventoId/cortesias',
      '/eventos/:eventoId/financeiro',
      '/eventos/:eventoId/marketing',
      '/eventos/:eventoId/remarketing',
      '/eventos/:eventoId/relatorios',
      '/eventos/:eventoId/detalhes',
      '/financeiro',
      '/financeiro/conciliacao',
      '/estornos',
    ],
  });
}

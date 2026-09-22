import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function backendBase() {
  const raw = process.env.API_INTERNAL_URL || process.env.BACKEND_URL || process.env.API_URL || '';
  if (!raw || !/^https?:\/\//i.test(raw)) return '';
  const clean = raw.replace(/\/$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
}

export async function GET() {
  const produtorId = process.env.PRODUTOR_ID || process.env.NEXT_PUBLIC_PRODUTOR_ID || '';
  const tenantId = process.env.TENANT_ID || process.env.NEXT_PUBLIC_TENANT_ID || '';
  const eventoId = process.env.EVENTO_ID || process.env.NEXT_PUBLIC_EVENTO_ID || '';
  const base = backendBase();

  if (!produtorId) {
    return NextResponse.json({
      configured: false, produtorId: '', tenantId, eventoId,
      code: 'PRODUTOR_NAO_CONFIGURADO',
      message: 'Configure PRODUTOR_ID na Vercel para resolver o contexto operacional.'
    }, { status: 503 });
  }
  if (!base) {
    return NextResponse.json({
      configured: false, produtorId, tenantId, eventoId,
      code: 'BACKEND_NAO_CONFIGURADO',
      message: 'Configure API_INTERNAL_URL na Vercel com a API EDDIE.'
    }, { status: 503 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const headers = new Headers();
    if (tenantId) headers.set('x-tenant-id', tenantId);
    const response = await fetch(`${base}/eventos/produtor/${produtorId}`, { cache: 'no-store', signal: controller.signal, headers });
    const payload = await response.json().catch(() => null);
    const eventos = Array.isArray(payload) ? payload : (payload?.items || []);
    if (!response.ok) {
      return NextResponse.json({ configured: true, produtorId, tenantId, eventoId, backendReachable: true, eventsReachable: false, backendStatus: response.status, code: 'EVENTOS_INDISPONIVEIS', message: payload?.message || `API de eventos respondeu HTTP ${response.status}.` }, { status: 503 });
    }
    return NextResponse.json({
      configured: true, produtorId, tenantId, eventoId,
      backendReachable: true, eventsReachable: true,
      totalEventos: eventos.length,
      message: eventos.length ? 'Contexto operacional validado.' : 'Contexto válido, mas o produtor não possui eventos neste tenant.'
    });
  } catch (error) {
    return NextResponse.json({
      configured: true, produtorId, tenantId, eventoId,
      backendReachable: false, eventsReachable: false,
      code: 'BACKEND_INALCANCAVEL',
      message: error instanceof Error && error.name === 'AbortError' ? 'Tempo limite ao validar a API EDDIE.' : 'Não foi possível conectar à API EDDIE.'
    }, { status: 503 });
  } finally { clearTimeout(timer); }
}

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function configuredBackend() {
  const raw = process.env.API_INTERNAL_URL || process.env.BACKEND_URL || process.env.API_URL || '';
  if (!raw || !/^https?:\/\//i.test(raw)) return '';
  const clean = raw.replace(/\/$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
}

export async function GET() {
  const base = configuredBackend();
  if (!base) {
    return NextResponse.json({
      status: 'misconfigured',
      proxy: 'online',
      backendConfigured: false,
      message: 'Configure API_INTERNAL_URL na Vercel com a URL pública da API EDDIE.',
    }, { status: 503 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  try {
    const response = await fetch(`${base}/health`, { cache: 'no-store', signal: controller.signal });
    const payload = await response.json().catch(() => ({}));
    return NextResponse.json({
      status: response.ok ? 'ok' : 'degraded',
      proxy: 'online',
      backendConfigured: true,
      backendReachable: response.ok,
      backendStatus: response.status,
      backend: payload,
    }, { status: response.ok ? 200 : 503 });
  } catch (error) {
    return NextResponse.json({
      status: 'offline',
      proxy: 'online',
      backendConfigured: true,
      backendReachable: false,
      message: error instanceof Error ? error.message : 'Backend indisponível',
    }, { status: 503 });
  } finally {
    clearTimeout(timer);
  }
}

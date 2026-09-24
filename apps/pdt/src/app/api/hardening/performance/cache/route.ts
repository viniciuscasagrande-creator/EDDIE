import { NextResponse } from 'next/server';
import { SecureTenantCache } from '@/features/hardening/11_13_2';
import { generateCorrelationId } from '@/features/hardening/11_13_4';

export const dynamic = 'force-dynamic';

export async function GET() {
  const correlationId = generateCorrelationId();
  // Popula um valor seguro de teste se vazio
  SecureTenantCache.set('produtor-alfa', 'dashboard', 'resumo', { status: 'ONLINE', activeSales: 120 }, 300);

  const stats = SecureTenantCache.getStats();

  return NextResponse.json({
    cacheStats: stats,
    tenantIsolated: true,
    correlationId,
    timestamp: new Date().toISOString()
  }, {
    headers: { 'X-Correlation-Id': correlationId }
  });
}

export async function POST(request: Request) {
  const correlationId = generateCorrelationId();
  try {
    const body = await request.json();
    const tenantId = body.tenantId || 'produtor-alfa';
    const namespace = body.namespace;

    const invalidatedCount = SecureTenantCache.invalidateTenant(tenantId, namespace);

    return NextResponse.json({
      success: true,
      invalidatedCount,
      tenantId,
      namespace: namespace || 'ALL',
      correlationId,
      timestamp: new Date().toISOString()
    }, {
      headers: { 'X-Correlation-Id': correlationId }
    });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Invalid payload for cache invalidation',
      correlationId
    }, { status: 400 });
  }
}

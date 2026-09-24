import { NextResponse } from 'next/server';
import { RBAC_PERMISSIONS, Role, hasPermission } from '@/features/hardening/11_13_1';
import { generateCorrelationId } from '@/features/hardening/11_13_4';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const correlationId = generateCorrelationId();
  const { searchParams } = new URL(request.url);
  const role = (searchParams.get('role') as Role) || 'ADMIN';
  const permission = searchParams.get('permission');

  if (permission) {
    const allowed = hasPermission(role, permission);
    return NextResponse.json({
      role,
      permission,
      allowed,
      correlationId,
      timestamp: new Date().toISOString()
    }, {
      headers: { 'X-Correlation-Id': correlationId }
    });
  }

  return NextResponse.json({
    roles: Object.keys(RBAC_PERMISSIONS),
    matrix: RBAC_PERMISSIONS,
    correlationId,
    timestamp: new Date().toISOString()
  }, {
    headers: { 'X-Correlation-Id': correlationId }
  });
}

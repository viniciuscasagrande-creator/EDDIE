export type Role = 'ADMIN' | 'PRODUTOR' | 'OPERADOR' | 'PORTARIA' | 'FINANCEIRO' | 'AUDITOR';

export interface SecurityUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  produtorId?: string;
  allowedEvents?: string[];
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: Role;
  action: string;
  resource: string;
  tenantId: string;
  status: 'ALLOWED' | 'DENIED';
  ip: string;
  correlationId: string;
  details?: Record<string, unknown>;
}

export const RBAC_PERMISSIONS: Record<Role, string[]> = {
  ADMIN: ['*'],
  PRODUTOR: [
    'eventos:read', 'eventos:write',
    'ingressos:read', 'ingressos:write',
    'lotes:read', 'lotes:write',
    'relatorios:read',
    'financeiro:read',
    'marketing:read', 'marketing:write',
    'inteligencia:read'
  ],
  OPERADOR: [
    'eventos:read',
    'ingressos:read',
    'portaria:read', 'portaria:write',
    'alertas:read', 'alertas:write',
    'incidentes:read', 'incidentes:write',
    'automacoes:read'
  ],
  PORTARIA: [
    'portaria:read', 'portaria:write',
    'checkin:execute',
    'scanner:sync'
  ],
  FINANCEIRO: [
    'financeiro:read', 'financeiro:write',
    'contabilidade:read', 'contabilidade:write',
    'conciliacao:read', 'conciliacao:write',
    'estorno:read', 'estorno:write',
    'repasses:read'
  ],
  AUDITOR: [
    'auditoria:read',
    'financeiro:read',
    'contabilidade:read',
    'relatorios:read',
    'logs:read'
  ]
};

export function hasPermission(role: Role, requiredPermission: string): boolean {
  const permissions = RBAC_PERMISSIONS[role] || [];
  if (permissions.includes('*')) return true;
  return permissions.includes(requiredPermission);
}

export function validateTenantIsolation(
  actorProdutorId: string | undefined,
  targetProdutorId: string,
  targetEventoId?: string,
  allowedEvents?: string[]
): { allowed: boolean; reason?: string } {
  // Administradores ou produtores donos do recurso
  if (!actorProdutorId) {
    return { allowed: false, reason: 'Produtor não identificado no contexto do usuário' };
  }
  if (actorProdutorId !== targetProdutorId) {
    return { allowed: false, reason: 'Violação de isolamento: Produtor não autorizado para este recurso' };
  }
  if (targetEventoId && allowedEvents && allowedEvents.length > 0 && !allowedEvents.includes(targetEventoId)) {
    return { allowed: false, reason: 'Violação de isolamento: Evento fora do escopo atribuído' };
  }
  return { allowed: true };
}

export function maskPii(data: {
  cpf?: string;
  email?: string;
  phone?: string;
  cardLastFour?: string;
}): {
  cpf?: string;
  email?: string;
  phone?: string;
  cardLastFour?: string;
} {
  return {
    cpf: data.cpf ? data.cpf.replace(/(\d{3})\d{6}(\d{2})/, '$1.***.***-$2') : undefined,
    email: data.email ? data.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : undefined,
    phone: data.phone ? data.phone.replace(/(\(\d{2}\)\s*)(\d{1})\d{4}-(\d{4})/, '$1$2****-$3') : undefined,
    cardLastFour: data.cardLastFour ? `•••• •••• •••• ${data.cardLastFour}` : undefined,
  };
}

export const featureManifest = {
  phase: "11.13.1",
  title: "EDDIE 11.13.1 — Segurança Enterprise + RBAC + Isolamento de Dados",
  routes: [
    "/api/hardening/seguranca/rbac",
    "/api/hardening/seguranca/auditoria",
    "/api/eventos/:eventoId/seguranca/sessao"
  ],
  requiresStrictTenantIsolation: true,
  strictLgpdCompliance: true
} as const;

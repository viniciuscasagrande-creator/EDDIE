import { NextResponse } from 'next/server';
import { AuditEntry, maskPii } from '@/features/hardening/11_13_1';
import { generateCorrelationId } from '@/features/hardening/11_13_4';

export const dynamic = 'force-dynamic';

const initialLogs: AuditEntry[] = [
  {
    id: 'aud_001',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    actor: 'admin@diskingressos.com.br',
    role: 'ADMIN',
    action: 'CONFIGURACAO_ACESSO',
    resource: 'produtores/global',
    tenantId: 'produtor-master',
    status: 'ALLOWED',
    ip: '10.0.4.15',
    correlationId: 'corr_init_01'
  },
  {
    id: 'aud_002',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    actor: 'operador_portaria@diskingressos.com.br',
    role: 'PORTARIA',
    action: 'CHECKIN_SCANNER_SYNC',
    resource: 'eventos/evento-operacao/catracas',
    tenantId: 'produtor-alfa',
    status: 'ALLOWED',
    ip: '192.168.1.102',
    correlationId: 'corr_init_02'
  },
  {
    id: 'aud_003',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    actor: 'guest_unauth',
    role: 'OPERADOR',
    action: 'TENTATIVA_ACESSO_FINANCEIRO',
    resource: 'eventos/evento-operacao/repasses',
    tenantId: 'produtor-alfa',
    status: 'DENIED',
    ip: '203.0.113.45',
    correlationId: 'corr_init_03',
    details: { reason: 'Perfil insuficiente para visualização de custódia' }
  }
];

export async function GET() {
  const correlationId = generateCorrelationId();
  return NextResponse.json({
    totalLogs: initialLogs.length,
    logs: initialLogs,
    lgpdExample: maskPii({
      cpf: '12345678901',
      email: 'comprador.vip@gmail.com',
      phone: '(41) 99888-7766',
      cardLastFour: '4012'
    }),
    correlationId,
    timestamp: new Date().toISOString()
  }, {
    headers: { 'X-Correlation-Id': correlationId }
  });
}

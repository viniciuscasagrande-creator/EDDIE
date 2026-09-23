# Contratos Real-time — EDDIE 11.10

## Snapshot
GET /api/eventos/:eventoId/operacao/resumo?sessaoId=
GET /api/eventos/:eventoId/operacao/timeline?sessaoId=&cursor=
GET /api/eventos/:eventoId/operacao/alertas?sessaoId=

## Stream
GET /api/eventos/:eventoId/operacao/stream?sessaoId=
ou canal WebSocket equivalente já existente.

Envelope:
{
  eventId: string,
  type: string,
  eventoId: string,
  sessaoId?: string,
  occurredAt: string,
  correlationId?: string,
  sequence?: number,
  payload: object
}

Tipos iniciais:
sale.updated
payment.updated
inventory.updated
ticket.issued
checkin.created
gate.device.updated
risk.alert.created
finance.updated
marketing.updated
incident.updated

## Alertas
POST /api/operacao/alertas/:id/reconhecer
POST /api/operacao/alertas/:id/atribuir

## Incidentes
POST /api/eventos/:eventoId/incidentes
GET /api/eventos/:eventoId/incidentes
PATCH /api/incidentes/:id

Autorização e tenant/produtor/evento são obrigatórios.

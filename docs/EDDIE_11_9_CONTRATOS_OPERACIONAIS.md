# Contratos — EDDIE 11.9

## Portaria
POST /api/checkin/validar
GET  /api/eventos/:eventoId/portaria/resumo
GET  /api/eventos/:eventoId/portaria/checkins
GET  /api/eventos/:eventoId/portaria/dispositivos
POST /api/eventos/:eventoId/portaria/dispositivos
POST /api/portaria/dispositivos/:id/revogar
POST /api/portaria/dispositivos/:id/heartbeat

## Antifraude
GET  /api/eventos/:eventoId/antifraude/alertas
POST /api/antifraude/alertas/:id/revisar

## Conciliação
POST /api/conciliacao/importacoes
POST /api/conciliacao/processar
GET  /api/conciliacao/divergencias
GET  /api/conciliacao/:id
POST /api/conciliacao/:id/revisar

## Chargeback/Estorno
POST /api/webhooks/pagamentos/:provider
GET  /api/chargebacks
GET  /api/chargebacks/:id
POST /api/chargebacks/:id/evidencias
POST /api/pedidos/:pedidoId/estornos
GET  /api/pedidos/:pedidoId/estornos

Todas as mutações críticas exigem idempotency-key/correlation-id quando aplicável.

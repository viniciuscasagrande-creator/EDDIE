# EDDIE 11.8 — Contratos transacionais

## Endpoints alvo
GET  /api/eventos/:eventoId/disponibilidade
POST /api/eventos/:eventoId/reservas
DELETE /api/reservas/:reservaId
POST /api/pedidos
GET  /api/pedidos/:pedidoId
POST /api/pedidos/:pedidoId/pagamentos/pix
POST /api/pedidos/:pedidoId/pagamentos/cartao
POST /api/webhooks/pagamentos/:provider
GET  /api/pedidos/:pedidoId/ingressos
POST /api/ingressos/:ingressoId/reemitir
POST /api/checkin/validar
GET  /api/eventos/:eventoId/checkins
GET  /api/eventos/:eventoId/financeiro/resumo
GET  /api/eventos/:eventoId/repasses
POST /api/eventos/:eventoId/repasses/programar

## Cabeçalhos internos
x-tenant-id
x-produtor-id
x-correlation-id
idempotency-key (operações mutáveis críticas)

## Regras de resposta
409: conflito de inventário/idempotência incompatível.
422: regra de negócio.
401/403: autenticação/permissão/contexto.
404: recurso não pertencente ao contexto.
503: dependência externa indisponível, sem converter em sucesso falso.

## Webhook
Validar assinatura usando corpo bruto quando o provedor exigir.
Persistir `providerEventId` único.
ACK somente após persistência segura/decisão idempotente.
Nunca logar PAN, CVV, token sensível ou QR secreto.

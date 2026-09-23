# Migration EDDIE 11.8

Antes de aplicar, alinhar nomes às tabelas/models já existentes no Prisma da baseline.
Mudanças necessárias:
- idempotency keys em reservas/pedidos/pagamentos;
- providerEventId único para webhook;
- QR token hash/version/status em ingresso;
- check-ins com unique de consumo ativo por ingresso;
- outbox transacional;
- correlationId em entidades críticas;
- liquidação/repasse com chaves idempotentes.

Não criar tabelas duplicadas se a baseline já possuir equivalentes.

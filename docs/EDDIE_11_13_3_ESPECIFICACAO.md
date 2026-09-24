# EDDIE 11.13.3 — Concorrência + Alta Escala de Vendas

## Objetivo
Testar disponibilidade, reserva, expiração, pedido, PIX/cartão, webhook duplicado/fora de ordem, emissão, QR, check-in, estorno, Ledger, liquidação e repasse. Validar atomicidade, transactions, constraints e idempotência. Stress somente em ambiente seguro.

## Regras obrigatórias
- Preservar regras de negócio e UX anteriores.
- UI 100% pt-BR.
- Isolamento Produtor → Evento → Sessão.
- Nunca expor secrets/tokens/PII desnecessária.
- Nunca `prisma migrate reset` em produção.
- Nunca executar stress destrutivo em produção.
- Não remover validações/módulos para testes passarem.
- Não inventar capacidade ou performance.
- Baseline e reteste obrigatórios quando mensurável.
- Preservar build-info e correlationId.
- Sem push/deploy sem autorização.

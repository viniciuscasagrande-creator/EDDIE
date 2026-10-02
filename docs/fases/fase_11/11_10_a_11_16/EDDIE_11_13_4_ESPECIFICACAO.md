# EDDIE 11.13.4 — Resiliência + Observabilidade + Recuperação

## Objetivo
Endurecer Outbox/Event Bus/filas, retry/backoff, DLQ quando suportada, timeouts, health/readiness, logs estruturados, correlationId, métricas/tracing e runbooks. Validar recuperação e backup/restore em ambiente seguro.

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

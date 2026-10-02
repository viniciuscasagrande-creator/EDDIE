# EDDIE 11.14.7 — Go-Live Final + Release Gate

## Escopo
Consolidar evidências, migrations, builds, smoke, health/readiness, observabilidade, backup/restore, rollback/runbook e build-info; gate final.

## Evidência obrigatória
ID, pré-condição, passos, IDs gerados, esperado, realizado, correlationId/logs, evidência, status e defeito vinculado.

## Regras
- Sandbox/homologação para providers externos.
- Nunca inventar aprovação externa.
- Mock não vale como evidência final.
- Contexto Produtor → Evento → Sessão e pt-BR.
- Sem teste destrutivo/reset em produção.
- Não mascarar falhas.
- Sem push/deploy final sem autorização.

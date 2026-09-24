# EDDIE 11.14.6 — Relatórios, Auditoria e Rastreabilidade

## Escopo
Consistência entre relatórios de evento, financeiro, contábil, portaria, marketing e operação; rastreabilidade, filtros, exportação, timezone e permissões.

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

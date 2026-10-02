# EDDIE 11.14.5 — Estorno, Chargeback e Reversões

## Escopo
Estorno parcial/total quando suportado, ingresso, reflexos financeiros, chargeback e reversões com auditoria/correlationId.

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

# EDDIE 11.14.3 — Portaria, Check-in e Antifraude

## Escopo
QR válido, utilizado, duplicado, inválido e cancelado; scanners, entrada, idempotência e atualização do Centro de Operações.

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

# EDDIE 11.14.1 — Cadastro e Configuração do Evento

## Escopo
Produtor, evento, local, sessões, setores, lotes, cortesias, inventário e condição comercial individual; taxa Disk percentual ou fixa conforme negociação do evento.

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

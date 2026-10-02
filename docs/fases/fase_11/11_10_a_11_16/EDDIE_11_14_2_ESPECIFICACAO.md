# EDDIE 11.14.2 — Venda, Pagamento e Ingresso

## Escopo
Disponibilidade, reserva, pedido, PIX/cartão em homologação, webhook, confirmação, emissão e QR; incluir falhas, expiração, duplicidade e concorrência.

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

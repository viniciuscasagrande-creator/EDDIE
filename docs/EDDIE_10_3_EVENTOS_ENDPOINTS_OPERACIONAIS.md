# EDDIE 10.3 — Eventos e Endpoints Operacionais

## Endpoints de Eventos consolidados
- GET /eventos/locais
- GET /eventos/produtor/:produtorId
- GET /eventos/:id
- POST /eventos
- PATCH /eventos/:id
- POST /eventos/:id/sessoes
- PATCH /eventos/sessoes/:id
- POST /eventos/sessoes/:sessaoId/setores
- PATCH /eventos/setores/:id
- POST /eventos/sessoes/:sessaoId/lotes
- PATCH /eventos/lotes/:id
- POST /eventos/:id/publicar
- POST /eventos/:id/cancelar

Todos passam a respeitar `x-tenant-id`; ações autorais aceitam `x-user-id`. A regra é um único cadastro oficial de Evento → Sessão → Setor → Lote.

## Relatórios
Este pacote mantém a Central de Relatórios do 10.2 e seus endpoints, para que Relatórios seja um item visível do menu principal e não apenas abas escondidas dentro dos módulos.

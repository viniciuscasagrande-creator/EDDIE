# Módulo RELATÓRIOS

## Bounded context
Central de inteligência operacional, relatórios consolidados e exportação de dados para tomada de decisão e auditoria.
Consome exclusivamente dados oficiais via Prisma/Ledger, segregados por tenant, produtor e evento.

## Endpoints
- `GET /relatorios/catalogo`: Lista os relatórios disponíveis no ecossistema
- `GET /relatorios/executivo`: Indicadores agregados executivos
- `GET /relatorios/eventos`: Inventário e lotes de eventos
- `GET /relatorios/financeiro`: Extrato do Ledger, contas, repasses e divergências
- `GET /relatorios/contabilidade`: Balancetes, planos de contas e conciliações
- `GET /relatorios/comercial`: Carteira B2B, oportunidades e metas
- `GET /relatorios/marketing`: Campanhas, conversões e links de rastreamento
- `GET /relatorios/sac`: Fila de atendimento e histórico de chamados
- `GET /relatorios/suporte`: Ocorrências de campo e credenciamento
- `GET /relatorios/estornos`: Solicitações de estorno e transições de status

## Regras invioláveis
1. Nunca inventar dados nem retornar constantes artificiais.
2. Todo relatório respeita os filtros de isolamento `x-tenant-id`, `produtorId` e `eventoId`.
3. Exportações no frontend geram JSON/CSV baseadas exclusivamente na resposta da API.

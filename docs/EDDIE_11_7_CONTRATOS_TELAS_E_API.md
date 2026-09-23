# Contratos de telas e API — EDDIE 11.7

## Rotas de API sugeridas
GET /api/eventos/:eventoId
PUT /api/eventos/:eventoId
POST /api/eventos
GET /api/eventos/:eventoId/sessoes
POST /api/eventos/:eventoId/sessoes
GET /api/eventos/:eventoId/setores
POST /api/eventos/:eventoId/setores
GET /api/eventos/:eventoId/lotes
POST /api/eventos/:eventoId/lotes
GET /api/eventos/:eventoId/cortesias
POST /api/eventos/:eventoId/cortesias
GET /api/pedidos/evento/:eventoId/consulta?q=
GET /api/eventos/:eventoId/relatorios/resumo

## Consulta de ingressos
Filtros: q, status, sessão, setor, lote, modalidade, período.
Tabela: ingresso, pedido, comprador/titular, modalidade, setor, lote, pagamento, status, check-in.

## Relatórios
Cards: receita bruta, pedidos, ingressos, ticket médio, cortesias, ocupação.
Gráficos: ritmo de vendas, meios de pagamento, modalidades, setores/lotes.
Tabela: transações recentes.

## Cadastro
Persistir rascunho entre etapas. Validação por etapa. Publicação somente após requisitos obrigatórios e condição comercial válida.

## Segurança
Todas as operações validam tenant/produtor/evento. Operações sensíveis registram usuário, timestamp, origem e antes/depois quando aplicável.

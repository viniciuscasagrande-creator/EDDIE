# Contratos/Endpoints alvo
GET /api/eventos/:eventoId/marketing/dashboard
GET/POST /api/eventos/:eventoId/marketing/campanhas
GET/POST /api/eventos/:eventoId/marketing/criativos
GET /api/eventos/:eventoId/marketing/analytics
GET/POST /api/eventos/:eventoId/marketing/automacoes
GET/POST /api/eventos/:eventoId/marketing/cupons
GET/POST /api/eventos/:eventoId/marketing/links
GET/POST /api/eventos/:eventoId/marketing/afiliados
GET/POST /api/eventos/:eventoId/marketing/pixels
GET /api/eventos/:eventoId/marketing/conversoes
GET /api/eventos/:eventoId/marketing/integracoes
POST /api/eventos/:eventoId/marketing/integracoes/:provider/conectar
GET /api/eventos/:eventoId/remarketing/dashboard
GET/POST /api/eventos/:eventoId/remarketing/publicos
GET/POST /api/eventos/:eventoId/remarketing/segmentos
GET/POST /api/eventos/:eventoId/remarketing/jornadas
GET /api/eventos/:eventoId/remarketing/carrinhos
POST /api/eventos/:eventoId/remarketing/carrinhos/:id/recuperar
GET /api/eventos/:eventoId/remarketing/conversoes
GET /api/eventos/:eventoId/remarketing/relatorios

Auditar endpoints já existentes antes de criar novos. Não duplicar contratos equivalentes.

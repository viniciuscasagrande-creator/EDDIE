# EDDIE 10.8 — Marketing + Remarketing recuperados do vídeo

Base: EDDIE 10.7.

## Marketing
- Painel operacional com período, filtros, metas, receita atribuída, investimento, ROAS, conversões, CPA e receita recuperada (dados reais quando disponíveis).
- Central de Campanhas Multicanal.
- WhatsApp Marketing & CRM.
- E-mail Marketing & CRM.
- Status Real das Campanhas / diagnóstico por canal.
- Google Analytics 4.
- TikTok Ads & Pixel / Events API.
- Spotify Ads & Conversões CAPI.
- Central UTM & Conversões.
- Atribuição Multicanal.
- Ranking de Campanhas.

## Remarketing — menu separado
- Hub de Remarketing & Recuperação.
- Carrinhos Abandonados.
- Recuperação de Pix & Pagamentos.
- Régua de Fluxos de Resgate.
- WhatsApp Remarketing.
- E-mail Remarketing.
- Clientes Inativos.
- Relatórios de Resgate.

## Endpoint de integração
GET /marketing/video/:grupo/:screen?produtorId=&eventoId=

## Regra de dados
Nenhum número demonstrativo do vídeo foi copiado como dado real. A interface e as responsabilidades foram recuperadas; métricas são calculadas a partir de CampanhaMarketing, UtmLink, ConversaoMarketing, PixelTracking, CupomMarketing e AlertaMarketing. Onde o schema não possui a fonte operacional (ex.: carrinho/checkout abandonado dedicado), a tela informa a ausência em vez de fabricar dados.

## Rotas principais
/marketing e /marketing/[slug]
/remarketing e /remarketing/[slug]

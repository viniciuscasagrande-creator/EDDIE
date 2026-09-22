# EDDIE 10.8 HOMOLOGÁVEL — Marketing + Remarketing Completo

## Base oficial
Este pacote foi consolidado diretamente sobre **EDDIE 10.7 HOMOLOGADO**.

## Regra desta entrega
O vídeo `marketing.mp4` foi usado como referência funcional para recuperar o conjunto de Marketing e Remarketing. O padrão visual continua sendo o Design System do EDDIE. Não foram importados números demonstrativos do vídeo como dados de produção.

## Marketing
- Painel de Marketing
- Central de Campanhas Multicanal
- WhatsApp Marketing & CRM
- E-mail Marketing & CRM
- Status Real das Campanhas
- Google Analytics 4
- TikTok Ads & Pixel / Events API
- Spotify Ads & Conversões CAPI
- Central UTM & Conversões
- Central de Atribuição Multicanal
- Ranking de Campanhas

Rotas: `/marketing` e `/marketing/[slug]`.

## Remarketing
- Hub de Remarketing & Recuperação
- Carrinhos Abandonados
- Recuperação de Pix & Pagamentos
- Régua de Fluxos de Resgate
- WhatsApp Remarketing
- E-mail Remarketing
- Clientes Inativos
- Relatórios de Resgate

Rotas: `/remarketing` e `/remarketing/[slug]`.

## Backend
Endpoint de leitura operacional:
`GET /marketing/video/:grupo/:screen?produtorId=<UUID>&eventoId=<UUID>`

Fontes atuais: `CampanhaMarketing`, `UtmLink`, `ConversaoMarketing`, `PixelTracking`, `CupomMarketing` e `AlertaMarketing` via Prisma.

## Integridade dos dados
- Nenhuma métrica fictícia.
- Sem dados: estado vazio.
- API indisponível: erro explícito e timeout finito.
- Contexto: produtor e evento do EDDIE.
- Carrinho/checkout abandonado não é inventado: enquanto não existir fonte transacional dedicada, a tela informa a ausência da integração real.

## Homologação obrigatória
1. `pnpm install`
2. `pnpm db:generate`
3. `pnpm --filter @ticketing/api build`
4. `pnpm --filter @ticketing/pdt build`
5. Validar `/marketing` e todas as 11 subtelas.
6. Validar `/remarketing` e todas as 8 subtelas.
7. Confirmar os dois menus na Sidebar.
8. Confirmar troca de evento/produtor sem vazamento de tenant.
9. Confirmar endpoint `marketing/video` com banco real.
10. Confirmar que erro de API não deixa loading infinito.

## Não alterar durante implantação
Financeiro, Contabilidade, Relatórios, Eventos, Comercial B2B, SAC, Estornos, Ledger e modelos oficiais de Evento do 10.7 homologado devem permanecer preservados.

# Módulo MARKETING & REMARKETING

## Bounded context
Central de inteligência de aquisição, tração e conversão de vendas para eventos e produtores.
Responsável pelo **Marketing Hub, Campanhas Prontas e Multicanais**, gerenciamento e injeção de **Pixels de Rastreamento (Meta CAPI, Google Ads, GA4, TikTok, Spotify)**, gerador de **Links UTMs com QR Code**, gestão de **Cupons Promocionais** e **Motor de Atribuição de Conversões (Last-Click e Cupom Direto)**.

## Entidades (Schema `marketing`)
- `CampanhaMarketing`: Campanhas ativas, pausadas e finalizadas com orçamento e limites por canal.
- `PixelTracking`: Pixels configurados por evento e produtor (`meta`, `google_ads`, `ga4`, `tiktok`, `spotify`).
- `CupomMarketing`: Cupons de desconto percentual ou fixo com controle de validade e limite de usos. Chave única: `@@unique([tenantId, eventoId, codigo])`.
- `UtmLink`: Links parametrizados com UTMs (source, medium, campaign, content, term) e payload de QR Code. Chave única: `@@unique([tenantId, codigo])`.
- `ConversaoMarketing`: Conversões de pedidos atribuídas a links UTM, campanhas e cupons. Chave única: `@@unique([tenantId, pedidoId])`.
- `AlertaMarketing`: Alertas de performance (ROAS abaixo da meta, orçamento estourando, queda brusca no tráfego).

## Publica
- `marketing.campanha_criada.v1`
- `marketing.campanha_status_alterado.v1`
- `marketing.pixel_configurado.v1`
- `marketing.cupom_criado.v1`
- `marketing.conversao_atribuida.v1`

## Consome
- `pedido.pago.v1` -> Atribui conversão de venda (receita atribuída, modelo de atribuição, incremento de uso do cupom, atualização de métricas da campanha).

## Regras de negócio invioláveis
1. **Idolatração do Outbox:** Toda criação de campanha, configuração de pixel, cupom ou atribuição de conversão ocorre dentro de `$transaction` e emite evento via `outbox.emit()`.
2. **Moeda em Centavos nos Contratos e Decimal no Banco:** Orçamentos, faturamentos e descontos são expressos em centavos (`number` / `Money`) nos DTOs e gravados como `Decimal(14, 2)` no PostgreSQL.
3. **Isolamento de Domínio do Storefront:** O checkout e o site público (`apps/api-storefront`) NUNCA acessam tabelas de marketing diretamente. A validação de cupons e a consulta de pixels são feitas exclusivamente via `MarketingPublicService`.
4. **Unicidade de Cupons:** O código do cupom é case-insensitive (convertido para MAIÚSCULO) e único por evento e tenant.
5. **Idempotência de Atribuição:** Cada `pedidoId` possui no máximo uma conversão atribuída (`@@unique([tenantId, pedidoId])`).
6. **Fronteira com CRM e SAC:** Clientes do Marketing e Remarketing são tratados com anonimização / LGPD. Dados cadastrais e chamados individuais pertencem ao SAC / Atendimento.

## Dashboard & Telas (PDT)
- Rotas: `/marketing/campanhas`, `/marketing/prontas`, `/marketing/pixels`, `/marketing/links-utm`, `/marketing/cupons`, `/marketing/analytics`.
- Visualização de ROAS em tempo real, receita atribuída e ranking de canais de aquisição.

## Ao gerar código aqui
- Strict TypeScript sem `any`.
- Acesso por outros bounded contexts exclusivamente através de `MarketingPublicService`.

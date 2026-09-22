# EDDIE 10.9 — Marketing & Remarketing Operacional Real

Baseline oficial: EDDIE 10.8 HOMOLOGÁVEL.

## O que esta versão entrega

1. **Dois Menus Independentes com Submenus Completos na Sidebar:**
   - **Marketing (11 submenus operacionais):**
     - Painel de Marketing (`/marketing/painel`)
     - Central de Campanhas Multicanal (`/marketing/campanhas-multicanal`)
     - WhatsApp Marketing & CRM (`/marketing/whatsapp`)
     - E-mail Marketing & CRM (`/marketing/email`)
     - Status Real das Campanhas (`/marketing/status-real`)
     - Google Analytics 4 (`/marketing/ga4`)
     - TikTok Ads & Pixel / Events API (`/marketing/tiktok`)
     - Spotify Ads & CAPI (`/marketing/spotify`)
     - Central UTM & Conversões (`/marketing/utm-conversoes`)
     - Atribuição Multicanal (`/marketing/atribuicao`)
     - Ranking de Campanhas (`/marketing/ranking`)
   - **Remarketing (8 submenus operacionais):**
     - Hub de Remarketing & Recuperação (`/remarketing/painel`)
     - Carrinhos Abandonados (`/remarketing/carrinhos`)
     - Recuperação de PIX/Pagamentos (`/remarketing/pix-pagamentos`)
     - Régua de Fluxos de Resgate (`/remarketing/regua-fluxos`)
     - WhatsApp Remarketing (`/remarketing/whatsapp`)
     - E-mail Remarketing (`/remarketing/email`)
     - Clientes Inativos (`/remarketing/clientes-inativos`)
     - Relatórios de Resgate (`/remarketing/relatorios`)

2. **Home Page Consolidada:**
   - Módulo Marketing atualizado.
   - Módulo Remarketing adicionado ao grid principal.
   - Módulo Central de Relatórios adicionado ao grid principal.

3. **Backend NestJS Operacional:**
   - `GET /marketing/video/:grupo/:screen?produtorId=<UUID>&eventoId=<UUID>`
   - Consulta real às tabelas Prisma: `CampanhaMarketing`, `UtmLink`, `ConversaoMarketing`, `PixelTracking`, `CupomMarketing` e `AlertaMarketing`.

4. **Resolução Definitiva do Contexto Produtor/Evento:**
   - Timeout de 5000ms com encerramento explícito de loading.
   - Mensagem clara caso `NEXT_PUBLIC_PRODUTOR_ID` não esteja configurado na Vercel em produção.
   - Diagnóstico em tempo real em `/diagnostico` e `/api/status`.

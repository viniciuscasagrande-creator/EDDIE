# Mapeamento do Remarketing Real — EDDIE 11.23.1

Este documento formaliza o pipeline real do módulo de Marketing & Remarketing no EDDIE, estabelecendo o fluxo ponta a ponta:
**Tela → Ação → Endpoint → Service → Persistência**.

## 1. Princípio Fundamental
**A ausência de backend upstream NUNCA é preenchida por fallback falso ou simulação de persistência.**
Anteriormente, o arquivo `route.ts` continha blocos em `handleAutonomousStore` que respondiam a chamadas de mutação com `{ success: true, loggedToLedger: true }`. Esses blocos foram completamente expurgados do código. Qualquer operação em Marketing sem conectividade com o NestJS resulta em **HTTP 503 Service Unavailable** com mensagem explícita e rastreamento forense.

---

## 2. Fluxo Ponta a Ponta Mapeado

### 2.1. Criação e Gestão de Públicos (Audiences)
1. **Tela:** `apps/pdt/src/app/(marketing)/eventos/[eventoId]/remarketing/page.tsx`
2. **Componente de Ação:** `AudienceManagementModal.tsx`
3. **Ação do Usuário:** Criar público com regras de segmentação (ex.: Compradores VIP com mais de 2 ingressos ou Carrinho Abandonado > 48h).
4. **Chamada Frontend:** `POST /api/eventos/:eventId/marketing/audiences`
5. **Proxy Next.js:** Propaga `x-correlation-id`, `x-tenant-id`, `x-producer-id` para o upstream NestJS.
6. **Controller NestJS:** `AudiencesJourneysController.criarAudience()`
7. **Service:** `AudiencesJourneysService.criarAudience()`
8. **Persistência / Contrato:**
   - Valida estrutura de grupos `AND`/`OR`.
   - Persiste no store de audiências vinculado a `tenantId:eventId`.
   - Retorna o objeto público com ID gerado (`aud-...`), tamanho calculado e status `ATIVO`.
   - Se o backend falhar: o proxy retorna HTTP 503 com `{ ok: false, code: "BACKEND_UNAVAILABLE" }` e o modal exibe o erro na UI.

### 2.2. Journey Builder (Automações e Jornadas de Reengajamento)
1. **Tela:** `apps/pdt/src/components/remarketing/JourneyBuilderModal.tsx`
2. **Ação do Usuário:** Desenho do grafo de nós (Trigger -> Condição -> Ação de WhatsApp/E-mail -> Exit LGPD) e clique em "Salvar e Validar".
3. **Chamada Frontend:** `POST /api/eventos/:eventId/marketing/journeys`
4. **Controller NestJS:** `AudiencesJourneysController.criarJourney()`
5. **Service:** `AudiencesJourneysService.criarJourney()` e `validarJourney()`
6. **Regra de Validação:**
   - O grafo obrigatoriamente deve conter pelo menos 1 nó `TRIGGER`, 1 nó `ACTION` e 1 nó `EXIT` (conformidade LGPD).
   - Grafos incompletos retornam `valido: false` e mensagem de instrução.
   - Grafos completos são salvos e retornam status `ACTIVE` ou `DRAFT`.

### 2.3. Gateway CAPI Multi-Pixel e Rastreamento Server-Side
1. **Origem:** Eventos de checkout (`Purchase`, `InitiateCheckout`, `AddToCart`) originados no Storefront ou Webhook de Adquirente.
2. **Chamada:** `POST /api/tracking/events`
3. **Controller NestJS:** `TrackingController.ingestEvent()`
4. **Service:** `TrackingService.ingestEvent()`
5. **Persistência / Disparo:**
   - Normaliza o evento no formato canônico `CanonicalTrackingEvent`.
   - Dispara payload assinado para Meta CAPI e Google Analytics Measurement Protocol com `test_event_code` ou credenciais do produtor.
   - Registra log de entrega em `trackingDeliveryLog` com latência e status HTTP real retornado pelo provedor externo.

---

## 3. Garantias Arquiteturais
- **Zero Mock Mutations:** O endpoint `POST /api/marketing/actions` não finge execução de campanhas fora do ar.
- **Rastreamento Multi-Pixel:** Provedores desconectados são marcados como `INACTIVE` com timestamp real de sincronização.
- **Auditoria:** Toda mutação de status em campanha gera registro auditável vinculado ao operador.

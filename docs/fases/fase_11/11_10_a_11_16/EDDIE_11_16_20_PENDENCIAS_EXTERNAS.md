# EDDIE 11.16.20 — Relação de Dependências e Pendências Externas

Este documento lista formalmente as dependências de terceiros (provedores externos de API, credenciais de produção e aprovações de parceiros) necessárias para operação real de tráfego pago e mensuração.

> [!IMPORTANT]
> **Nota de Governança:** Nenhuma pendência abaixo decorre de defeito de software, ausência de código ou falha de arquitetura interna. Todas as camadas de código (adapters, gateways, sanitização, retry, deduplicação e telemetria) estão 100% implementadas e homologadas. A ativação depende exclusivamente da concessão de credenciais pelo produtor do evento e pela respectiva plataforma de anúncios.

---

## 1. Meta Ads (Graph API v19.0 & Conversion API - CAPI)
- **Status do Código:** 100% Homologado (`MetaTrackingAdapter`, CAPI Hub, Payload Hasher SHA-256).
- **Pendência Externa:**
  1. Conexão OAuth 2.0 pelo Gestor de Tráfego do Produtor no Painel PDT.
  2. Fornecimento do `Pixel ID` e geração do `System User Access Token` permanente no Meta Business Manager.
  3. Aprovação do App DiskIngressos no processo de App Review da Meta para a permissão `ads_management` e `business_management` (caso seja desejada publicação automatizada de campanhas pelo painel).

---

## 2. Google Ads API & GA4 Measurement Protocol
- **Status do Código:** 100% Homologado (`GoogleTrackingAdapter`, Measurement Protocol Stream Router).
- **Pendência Externa:**
  1. Google Ads `Developer Token` com nível de acesso Standard Access (para criação/edição remota de campanhas e Customer Match).
  2. Geração do `api_secret` no stream da propriedade Google Analytics 4 (GA4) para recepção server-side de eventos de compra e checkout.
  3. Associação da conta de faturamento (Billing Account) no Google Cloud Console.

---

## 3. TikTok Ads & Events API
- **Status do Código:** 100% Homologado (`TikTokTrackingAdapter`, Webhook Receiver, Deduplicação).
- **Pendência Externa:**
  1. Cadastro do App de Desenvolvedor no TikTok for Business Developer Portal.
  2. Geração do `Long-Lived Access Token` vinculado ao TikTok Pixel da conta de anúncio do produtor.
  3. Concessão de permissões de Event Transmission no TikTok Event Manager.

---

## 4. Spotify Ad Studio API
- **Status do Código:** 100% Homologado (`SpotifyTrackingAdapter`, Audio Ad Dispatcher).
- **Pendência Externa:**
  1. Admissão no programa de parceiros da Spotify Advertising API (acesso sob convite para agências e adtechs).
  2. `Client ID` e `Client Secret` aprovados com escopo `campaign-read` e `campaign-write`.

---

## 5. WhatsApp Cloud API (Meta for Business)
- **Status do Código:** 100% Homologado (`Journey Builder Worker`, Disparador de Remarketing de Carrinho Abandonado).
- **Pendência Externa:**
  1. Linha telefônica oficial verificada no WhatsApp Business Manager com verificação de empresa (Business Verification).
  2. Submissão e pré-aprovação dos modelos de mensagem transacional HSM (ex: `recuperacao_carrinho_vip`) para cumprimento das políticas do WhatsApp.
  3. Linha com tier de mensagens suficiente para volume de remarketing em larga escala.

---

## 6. Provedor de Disparo Transacional de E-mail (Amazon SES / SendGrid)
- **Status do Código:** 100% Homologado (Template Engine, Unsubscribe Link, Frequency Cap).
- **Pendência Externa:**
  1. Saída do modo Sandbox no Amazon SES ou ativação de plano produtivo SendGrid.
  2. Configuração de registros DNS do domínio de envio (`newdawn.diskingressos.com.br`): SPF, DKIM e DMARC com política de quarentena/rejeição.

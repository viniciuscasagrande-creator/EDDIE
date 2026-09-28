# Módulo de Pagamentos — Núcleo de Pagamentos (EDDIE 11.29.3)

> Contexto local do bounded context de Pagamentos (Payments Core) do DiskIngressos ERP.

## Responsabilidade

O módulo **Pagamentos** (`schema("pagamentos")`) é o núcleo transacional desacoplado de processamento de pagamentos, responsável por:
1. **Intenção de Pagamento (`PaymentIntent`)**: Orquestração do ciclo de vida de pagamento com chave de idempotência obrigatória, valores em Decimal/centavos e cálculo de split em tempo real (Produtor vs DiskIngressos).
2. **PIX Direto & PSP**: Emissão de cobranças PIX dinâmicas com QR Code Copia e Cola, chave PIX, expiração com TTL configurável e conciliação de EndToEndId.
3. **Cartões & Adquirentes**: Roteamento multi-adquirente (Cielo, Stone, Rede, Mercado Pago, etc.), captura com cálculo de taxa MDR e custo operacional.
4. **Webhook Listener Idempotente**: Recepção e processamento com garantia de idempotência (`[adquirente, webhookEventId]`) para confirmação ou recusa de pagamentos.
5. **Conciliação de Adquirentes**: Lotes de conciliação financeira de adquirentes e bandeiras, auditoria de divergências e liquidação.
6. **Publicação via Outbox**: Publicação atômica de `pagamento.confirmado.v1` e `pedido.pago.v1` disparando a cascata para Ledger/Financeiro, Ingressos/Portaria, Contabilidade e Marketing.

## Portas Públicas

- `PagamentosPublicService`:
  - `criarIntencao(input)`: Inicializa uma nova `PaymentIntent` com chave de idempotência e dados de split.
  - `gerarPixCobranca(paymentIntentId, input)`: Gera cobrança PIX dinamicamente com QR Code copia e cola.
  - `processarCartao(paymentIntentId, input)`: Executa autorização/captura de cartão com cálculo de MDR.
  - `processarWebhook(adquirente, webhookEventId, payload)`: Processador idempotente de notificações de pagamento.
  - `consultarIntencao(id)`: Retorna o status e os detalhes consolidados da intenção de pagamento.
  - `listarIntencoes(filtro)`: Lista intenções com paginação e filtros.
  - `conciliarLoteAdquirente(input)`: Registra e processa lote de conciliação de adquirente.
  - `obterMetricasGerais()`: Consolida KPIs operacionais e financeiros em tempo real.

## Eventos Publicados (Outbox)

- `pagamento.confirmado.v1`
- `pagamento.pix_gerado.v1`
- `pagamento.falhou.v1`
- `pagamento.conciliado.v1`
- `pedido.pago.v1`

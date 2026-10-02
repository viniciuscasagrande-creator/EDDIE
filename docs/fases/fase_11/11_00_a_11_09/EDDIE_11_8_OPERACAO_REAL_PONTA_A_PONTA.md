# EDDIE 11.8 — Operação Real Ponta a Ponta

## Objetivo
Fechar a cadeia operacional real da venda:
Disponibilidade/Inventário → Reserva → Pedido → PIX/Cartão → Confirmação → Ingresso/QR Code → Check-in → Financeiro → Ledger → Liquidação → Repasse.

## Princípios inegociáveis
- Não simular aprovação de pagamento.
- Não gerar saldo financeiro por pedido pendente.
- Idempotência em checkout, webhooks, emissão, check-in, ledger e repasse.
- `eventoId`, `produtorId` e `tenantId` validados em todas as operações.
- Taxa DiskIngressos é a condição comercial vigente do EVENTO, com snapshot no pedido.
- Pedido, pagamento, ingresso, QR, ledger e repasse têm identificadores independentes.
- Operações financeiras usam Decimal/centavos; nunca float.
- Sem inventário negativo e sem dupla venda.
- QR não contém dados pessoais nem segredo reutilizável.
- Toda ação sensível gera auditoria.
- Toda UI visível em pt-BR.

## 1. Inventário e reserva
Estados: DISPONIVEL, RESERVADO, VENDIDO, BLOQUEADO, CORTESIA.
Reserva atômica com expiração (`expiresAt`) e token idempotente.
Concorrência deve impedir duas reservas/vendas da mesma unidade.
Para ingresso não numerado, usar contador transacional de capacidade.
Para assento numerado, lock/constraint por assento+sessão.

## 2. Pedido
Estados:
RASCUNHO → AGUARDANDO_PAGAMENTO → PAGO → PARCIALMENTE_ESTORNADO/ESTORNADO/CANCELADO/EXPIRADO.
O pedido congela snapshot de preços, taxas, condição comercial, spread/advanced e regras relevantes.

## 3. Pagamentos
Adaptadores de gateway; domínio não depende de um adquirente específico.
PIX: criação de cobrança, expiração, txid/providerId, confirmação por webhook.
Cartão: tokenização no provedor; EDDIE não armazena PAN/CVV; autorização/captura conforme gateway.
Webhooks: assinatura, timestamp/replay protection, persistência do evento bruto seguro, idempotência por providerEventId.

## 4. Emissão de ingresso
Somente após pagamento confirmado/capturado conforme regra.
Número de ingresso único.
QR assinado/opaque token, versionado e revogável.
Reemissão invalida token anterior quando aplicável.

## 5. Check-in
Validação online por padrão.
Estados: VÁLIDO, JÁ_UTILIZADO, CANCELADO, ESTORNADO, INVÁLIDO, FORA_DA_SESSÃO.
Operação atômica: primeiro scanner válido consome o ingresso.
Registrar portaria/dispositivo/operador/data/hora.
Preparar modo offline futuro sem habilitá-lo implicitamente.

## 6. Financeiro e Ledger
`pagamento.confirmado.v1` dispara contabilização idempotente.
Separar:
- valor bruto da venda
- valor do produtor
- taxa Disk
- spread quando aplicável
- advanced/antecipação quando aplicável
- custos/gateway quando modelados
- estornos/chargebacks
Nunca tratar dinheiro do produtor como receita própria da Disk.
Ledger deve ser double-entry quando o módulo existente suportar, sem duplicar o ledger já existente.

## 7. Liquidação e repasse
Somente valores liquidados/elegíveis entram em saldo disponível.
Repasse respeita evento/produtor, prazo, bloqueios, chargebacks, antecipações e regras negociadas.
Estados: PROGRAMADO, EM_PROCESSAMENTO, PAGO, FALHOU, CANCELADO.
Lotes de repasse idempotentes e conciliáveis.

## 8. Eventos de domínio
inventario.reservado.v1
pedido.criado.v1
pagamento.pendente.v1
pagamento.confirmado.v1
pagamento.falhou.v1
ingresso.emitido.v1
ingresso.checkin.v1
pedido.estornado.v1
ledger.postado.v1
liquidacao.disponivel.v1
repasse.programado.v1
repasse.pago.v1

Outbox transacional obrigatória para eventos críticos.

## 9. Telas
Evento > Dashboard: disponibilidade, vendas, receita, meios de pagamento e ritmo.
Evento > Ingressos: pedido, ingresso, pagamento, QR/status e check-in.
Evento > Mapa: disponibilidade real, reserva/bloqueio/cortesia.
Financeiro: bruto, taxa Disk, produtor, liquidando, disponível, bloqueado, repasses.
Check-in: scanner/entrada manual, resultado imediato e histórico recente.

## 10. Observabilidade
Correlation ID do checkout ao ledger/repasse.
Métricas: reservas expiradas, conversão, pagamentos pendentes/falhos, webhook lag, emissão, check-in duplicado, divergência financeira.
DLQ/reprocessamento controlado para eventos assíncronos.

## Critérios de homologação
- duas compras concorrentes não vendem a mesma unidade;
- webhook repetido não duplica ingresso nem ledger;
- pedido pendente não gera ingresso/saldo;
- pagamento confirmado emite exatamente os ingressos comprados;
- QR usado duas vezes bloqueia a segunda entrada;
- estorno revoga ingresso e produz reversão financeira;
- taxa comercial usada é a do evento e permanece congelada no pedido;
- repasse usa somente saldo elegível;
- nenhuma tela fica em loading infinito;
- nenhuma informação mock aparece como real.

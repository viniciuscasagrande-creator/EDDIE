# EDDIE 11.19 — Registro de Divergências & Conciliação 6 Vias

> Documento de auditoria e governança das divergências financeiras detectadas entre as 6 pontas:
> **Gateway × Pagamento × Pedido × Ledger × Repasse × Banco**.

---

## 1. Topologia da Conciliação 6 Vias

A conciliação do ecossistema DiskIngressos opera em batimento cruzado contínuo com tolerância zero a diferenças de centavos:

| Ponta | Descrição | Fonte Primária | Critério de Matching |
|---|---|---|---|
| **1. Gateway** | Transação bruta capturada e liquidada pela adquirente (Cielo, E-Rede, Pagar.me, Asaas) | Extrato EDI / API Adquirente | `transacaoId`, `nsu`, `tid` |
| **2. Pagamento** | Registro do pagamento aprovado no checkout | `pagamentos.transacoes` | `transacaoId`, `checkoutId` |
| **3. Pedido** | Emissão dos ingressos e valor facial | `pedidos.pedidos` | `orderId`, `numeroPedido` |
| **4. Ledger** | Livro-razão em partidas dobradas imutáveis (append-only) | `financeiro.lancamentos_ledger` | `referenciaId`, `bucket`, `origem` |
| **5. Repasse** | Lotes de liquidação da agenda de repasses aos produtores | `financeiro.solicitacoes_repasse` / `SettlementLot` | `settlementId`, `loteId` |
| **6. Banco** | Extrato da conta corrente movimento / Retorno Pix / CNAB 240 | Webhook Pix Banco Central / Extrato OFX | `pixEndToEndId`, `comprovanteId` |

---

## 2. Tipos de Divergências Mapeadas & Protocolos de Tratamento

### Divergência Tipo A: Chargeback Recebido Pós-Liquidação Bancária
- **Cenário:** O repasse do evento foi integralmente liquidado e pago na conta bancária do produtor em D+2. Trinta dias após o evento, o comprador final abre contestação de chargeback na emissora do cartão.
- **Protocolo de Resolução:**
  1. O repasse bancário já liquidado **NUNCA** é alterado ou deletado (inviolabilidade contábil).
  2. O valor do chargeback é lançado como débito no bucket `reservado_estorno` (fundo de reserva ou saldo devedor do evento).
  3. É gerado automaticamente um caso auditável em `DivergenciaConciliacao` (`pointOfDivergence: CHARGEBACK_POS_LIQUIDACAO`).
  4. O sistema compensa o saldo em liquidações futuras de outros eventos do mesmo produtor ou aciona termo de garantia contratual.

### Divergência Tipo B: Discrepância na Taxa de Processamento de Gateway
- **Cenário:** Adquirente cobra taxa efetiva com arredondamento ou variação de centavos em relação à taxa tabelada negociada (ex: 2.51% vs 2.50%).
- **Protocolo de Resolução:**
  1. Detecção automática na importação do extrato EDI/API.
  2. Criação do caso com `valorEsperadoCents` vs `valorRecebidoCents` e `diferencaCents`.
  3. Parecer do operador financeiro via ação: `BAIXAR_AJUSTE` (lançamento compensatório de tarifa bancária no Ledger) ou `IGNORAR_TOLERANCIA` (quando dentro da faixa de tolerância de 1 centavo).

### Divergência Tipo C: Timeout na Confirmação Bancária de Repasse (Retry de Payout)
- **Cenário:** Falha de comunicação transitória durante a execução do Pix pelo banco parceiro.
- **Protocolo de Resolução:**
  1. O Settlement Engine utiliza `idempotencyKey` determinística por lote de repasse.
  2. Retentativas (`retry`) do payout identificam o lote existente e consultam o status bancário antes de disparar qualquer nova ordem.
  3. Garante que nunca ocorra duplicidade de pagamento ou duplo débito na conta gráfica.

---

## 3. Matriz de Casos Auditados nos Testes de Homologação

| Caso ID | Evento | Origem Divergência | Valor Esperado | Valor Apurado | Diferença | Ação Executada | Status |
|---|---|---|---|---|---|---|---|
| `case-cb-991` | `evento-operacao` | Chargeback Pós-Liquidação | R$ 0,00 | R$ 150,00 | +R$ 150,00 | Débito em `reservado_estorno` | CASO_AUDITADO |
| `case-edi-02` | `evento-1` | Tarifa Adquirente Cielo | R$ 25,00 | R$ 25,12 | +R$ 0,12 | Lançamento Compensatório Ajuste | RESOLVIDO |
| `case-pix-03` | `evento-operacao` | Retry Payout SPI | R$ 500,00 | R$ 500,00 | R$ 0,00 | Idempotência ativada (0 novos débitos) | CONCILIADO |

---

## 4. Conclusão de Auditoria

A camada de conciliação 6 vias garante rastreabilidade matemática fim a fim sem criação de saldos paralelos. Toda divergência identificada gera um caso formal auditável com timestamp, identificador forte de transação e parecer fundamentado do auditor.

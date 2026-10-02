# EDDIE 11.22 — Catálogo de Regras de Revenue Assurance & Integridade Financeira

Este documento detalha o catálogo oficial de regras do motor de integridade e garantia de receita do **EDDIE 11.22**. Todas as regras são versionadas, auditáveis, possuem severidade definida, limites de tolerância matemática e executam verificações sem nunca alterar fundos ou lançamentos automaticamente.

---

## 1. Princípios de Governança das Regras

1. **Princípio da Não-Intervenção Financeira:** O motor de assurance detecta, classifica, calcula o impacto e abre casos de auditoria. Ele **NUNCA** executa pagamentos, estornos, ajustes ou modificações no Ledger Financeiro (EDDIE 11.19/11.20) ou na Contabilidade (EDDIE 11.21).
2. **Versionamento Estrito:** Toda alteração de regra gera uma nova versão imutável (`v1`, `v2`, etc.), preservando a rastreabilidade histórica das transações auditadas no passado.
3. **Tolerância Monetária Conhecida:** Discrepâncias de até R$ 0,02 (2 centavos) decorrentes de arredondamento fracionário em divisões de taxas não são tratadas como erro operacional grave, mas como `DIFERENCA_ARREDONDAMENTO`.
4. **Idempotência Operacional:** Execuções sucessivas de regras sobre a mesma população não duplicam casos em aberto nem disparam alertas repetidos para a mesma divergência não resolvida.

---

## 2. Catálogo Oficial de Regras

### `RA_PAYMENT_ORDER` (v1)
- **Nome:** Pagamento Aprovado deve possuir Pedido Correspondente
- **Severidade:** `CRITICO`
- **Tolerância:** 0 centavos
- **Domínio Responsável:** `PAGAMENTOS`
- **Descrição:** Cruza os pagamentos capturados no gateway contra a base de pedidos do sistema. Detecta pagamentos órfãos gerados por falhas de callback de webhook ou instabilidade de rede.
- **Ação na Divergência:** Gera caso `PAGAMENTO_ORFAO` e notifica o Command Center 11.18.

### `RA_ORDER_LEDGER` (v1)
- **Nome:** Pedido Pago deve possuir Entrada no Ledger Financeiro
- **Severidade:** `CRITICO`
- **Tolerância:** 0 centavos
- **Domínio Responsável:** `FINANCEIRO`
- **Descrição:** Garante que todo pedido com status `PAGO` possua o correspondente crédito escriturado no saldo retido/contábil do evento no Ledger Financeiro 11.19.
- **Ação na Divergência:** Gera caso `PEDIDO_SEM_LEDGER` para o backoffice financeiro.

### `RA_LEDGER_DUPLICATE` (v1)
- **Nome:** Detecção de Duplicidade no Ledger Financeiro
- **Severidade:** `CRITICO`
- **Tolerância:** 0 centavos
- **Domínio Responsável:** `FINANCEIRO`
- **Descrição:** Identifica lançamentos contábeis repetidos com a mesma chave de idempotência (`correlationId` ou `orderId`) creditados ou debitados no mesmo bucket.
- **Ação na Divergência:** Abre caso `LEDGER_DUPLICADO` com severidade crítica e bloqueia liquidação do lote.

### `RA_ORDER_TICKET` (v1)
- **Nome:** Pedido Pago deve possuir Ingresso / QR Code Emitido
- **Severidade:** `ALTO`
- **Tolerância:** 0 centavos
- **Domínio Responsável:** `INGRESSOS`
- **Descrição:** Verifica se a confirmação financeira resultou na emissão dos ingressos nominais e tickets no sistema de controle de acesso (11.08 / Portaria).
- **Ação na Divergência:** Gera caso `PEDIDO_SEM_INGRESSO` com alerta para emissão manual de contingência.

### `RA_FEE_INTEGRITY` (v1)
- **Nome:** Integridade de Taxa Disk por Evento e Snapshot Histórico
- **Severidade:** `ALTO`
- **Tolerância:** 2 centavos (para lidar com arredondamentos de percentuais)
- **Domínio Responsável:** `FINANCEIRO`
- **Descrição:** Confronta a taxa Disk aplicada na venda contra o snapshot do contrato comercial vigente para aquele evento (seja taxa percentual ou fixa por ingresso). Alterações cadastrais futuras de taxa nunca afetam transações passadas.
- **Ação na Divergência:** Abre caso `TAXA_PERCENTUAL_INCORRETA` ou `TAXA_FIXA_INCORRETA`.

### `RA_REFUND_COMPENSATION` (v1)
- **Nome:** Estorno deve possuir Lançamento Compensatório Espelhado
- **Severidade:** `CRITICO`
- **Tolerância:** 0 centavos
- **Domínio Responsável:** `FINANCEIRO`
- **Descrição:** Valida se todo estorno aprovado e liquidado no gateway possui o devido débito de estorno espelhado no saldo do produtor e no bucket de reserva de estornos.
- **Ação na Divergência:** Gera caso `ESTORNO_SEM_COMPENSACAO`.

### `RA_CHARGEBACK_REFLECTION` (v1)
- **Nome:** Chargeback Bancário deve possuir Reflexo Financeiro
- **Severidade:** `CRITICO`
- **Tolerância:** 0 centavos
- **Domínio Responsável:** `FINANCEIRO`
- **Descrição:** Detecta notificações de chargeback bancário que não tenham debitado o saldo do produtor ou criado contestação formal na Central de Disputas do 11.19/11.20.
- **Ação na Divergência:** Gera caso `CHARGEBACK_SEM_REFLEXO`.

### `RA_TRANSFER_BALANCE` (v1)
- **Nome:** Transferência Inter-Eventos em Partidas Dobradas
- **Severidade:** `CRITICO`
- **Tolerância:** 0 centavos
- **Domínio Responsável:** `FINANCEIRO`
- **Descrição:** Assegura que toda transferência de saldo entre eventos possua exatamente uma perna de débito (`TRANSFER_OUT`) e uma de crédito (`TRANSFER_IN`) de mesmo valor.
- **Ação na Divergência:** Gera caso `TRANSFERENCIA_DESBALANCEADA`.

### `RA_TRANSFER_PRODUCER_ISOLATION` (v1)
- **Nome:** Isolamento Multi-Tenant em Transferências
- **Severidade:** `CRITICO`
- **Tolerância:** 0 centavos
- **Domínio Responsável:** `FINANCEIRO`
- **Descrição:** Bloqueia e sinaliza qualquer tentativa de transferência de recursos entre eventos pertencentes a produtores jurídicos diferentes.
- **Ação na Divergência:** Abre caso `TRANSFERENCIA_CROSS_PRODUCER` com bloqueio cautelar imediato.

### `RA_SETTLEMENT_PAYOUT` (v1)
- **Nome:** Lote de Settlement deve Corresponder ao Payout Autorizado
- **Severidade:** `CRITICO`
- **Tolerância:** 0 centavos
- **Domínio Responsável:** `TESOURARIA`
- **Descrição:** Confronta a soma dos itens liquidados no lote de repasse contra o valor nominal do payout gerado para envio bancário.
- **Ação na Divergência:** Abre caso `SETTLEMENT_DIVERGENTE`.

### `RA_PAYOUT_DUPLICATE` (v1)
- **Nome:** Prevenção e Detecção de Payout Duplicado
- **Severidade:** `CRITICO`
- **Tolerância:** 0 centavos
- **Domínio Responsável:** `TESOURARIA`
- **Descrição:** Monitora se o mesmo lote de liquidação gerou mais de uma ordem de pagamento bancária ou chave idempotente repetida.
- **Ação na Divergência:** Gera caso `PAYOUT_DUPLICADO` com alerta sonoro e visual crítico no Command Center 11.18.

### `RA_BANK_RECONCILIATION` (v1)
- **Nome:** Retorno Bancário deve Corresponder ao Payout
- **Severidade:** `ALTO`
- **Tolerância:** 0 centavos
- **Domínio Responsável:** `TESOURARIA`
- **Descrição:** Confronta os registros de retorno de arquivo CNAB ou extrato PIX bancário com o montante e status do payout autorizado.
- **Ação na Divergência:** Abre caso `BANCO_DIVERGENTE`.

### `RA_ACCOUNTING_CONFRONTATION` (v1)
- **Nome:** Fato do Ledger deve Estar Escriturado na Contabilidade
- **Severidade:** `MEDIO`
- **Tolerância:** 0 centavos
- **Domínio Responsável:** `CONTABILIDADE`
- **Descrição:** Confronta os fatos do Ledger Financeiro 11.19 com o diário e razão contábil em partidas dobradas do EDDIE 11.21 (CPC 47 / IFRS 15), identificando pendências de integração contábil.
- **Ação na Divergência:** Abre caso `CONTABILIDADE_DIVERGENTE`.

---

## 3. Matriz de Severidades e SLAs de Investigação

| Severidade | SLA de Resposta | Notificação Command Center | Ação Automática Permitida |
|---|---|---|---|
| `CRITICO` | 1 hora | Sim (Alerta Nível 1 - Imediato) | Apenas abertura de caso e registro de evidência SHA-256 |
| `ALTO` | 4 horas | Sim (Alerta Nível 2 - Amarelo) | Abertura de caso |
| `MEDIO` | 24 horas | Não (Fila de conciliação) | Registro em painel operacional |
| `BAIXO` | 48 horas | Não | Log estatístico |

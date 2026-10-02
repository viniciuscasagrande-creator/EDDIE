# EDDIE 11.22 — Taxonomia de Divergências de Receita & Fluxos de Resolução

Este documento define a taxonomia padronizada de divergências financeiras detectadas pelo motor de **Revenue Assurance & Financial Integrity OS (EDDIE 11.22)**, os impactos potenciais de vazamento de receita e o fluxo de encaminhamento para retificação nos módulos competentes.

---

## 1. Tipos Canônicos de Divergência

| Código da Divergência | Severidade | Impacto Primário | Domínio de Origem | Mecanismo de Detecção |
|---|---|---|---|---|
| `PAGAMENTO_ORFAO` | `CRITICO` | Dinheiro no gateway sem pedido emitido | Pagamentos / Gateway | Transação capturada sem correlationId de pedido |
| `PEDIDO_SEM_LEDGER` | `CRITICO` | Ingresso emitido sem crédito de receita | Financeiro (Ledger) | Pedido pago sem lançamento de crédito no bucket |
| `LEDGER_DUPLICADO` | `CRITICO` | Saldo do produtor inflado indevidamente | Financeiro (Ledger) | Múltiplos créditos com a mesma chave idempotente |
| `PEDIDO_SEM_INGRESSO` | `ALTO` | Cobrança ao cliente sem entrega do ticket | Portaria / Ingressos | Pedido com status pago e ticketsZerados |
| `TAXA_PERCENTUAL_INCORRETA` | `ALTO` | Subfaturamento ou superfaturamento de taxa Disk | Comercial / Taxas | Cobrança diverge do snapshot vigente do contrato |
| `TAXA_FIXA_INCORRETA` | `ALTO` | Cobrança de taxa por ingresso em desacordo | Comercial / Taxas | Valor fixo cobrado difere do snapshot contratual |
| `DIFERENCA_ARREDONDAMENTO` | `BAIXO` | Variação de centavos em rateios fracionários | Motor de Cálculo | Divergência $\le 2$ centavos; aceito com ressalva |
| `ESTORNO_SEM_COMPENSACAO` | `CRITICO` | Produtor recebe repasse de pedido estornado | Financeiro / Estorno | Estorno no gateway sem débito espelhado no saldo |
| `CHARGEBACK_SEM_REFLEXO` | `CRITICO` | Contestação bancária sem débito em reserva | Disputas / Risco | Chargeback processado sem débito em bucket de reserva |
| `TRANSFERENCIA_DESBALANCEADA` | `CRITICO` | Desequilíbrio em partidas dobradas inter-eventos | Financeiro | Débito em evento A sem crédito correspondente em B |
| `TRANSFERENCIA_CROSS_PRODUCER` | `CRITICO` | Mistura ilícita de fundos entre produtores | Comercial / Governança | Tentativa de transferir entre produtores distintos |
| `SETTLEMENT_DIVERGENTE` | `CRITICO` | Repasse divergente do lote aprovado | Settlement Engine | Soma dos itens difere do valor total do lote |
| `PAYOUT_DUPLICADO` | `CRITICO` | Pagamento bancário duplicado para mesmo repasse | Tesouraria / Banco | Duas ordens bancárias para o mesmo settlementId |
| `BANCO_DIVERGENTE` | `ALTO` | Extrato bancário diverge do lote liquidado | Tesouraria / Banco | Retorno CNAB/PIX rejeitado ou com valor divergente |
| `CONTABILIDADE_DIVERGENTE` | `MEDIO` | Fato financeiro não escriturado contabilmente | Contabilidade 11.21 | Ledger possui evento sem lançamento no Diário Contábil |
| `FONTE_INDISPONIVEL` | `ALTO` | Cadeia inconclusiva por falha externa | Conectores Externos | Gateway ou API bancária fora do ar |

---

## 2. Fluxo de Encaminhamento e Correção sem Alteração Automática

Seguindo estritamente a **Regra 19 do Prompt**:
> *"11.22 NUNCA paga, transfere saldo, altera taxa, edita Ledger ou cria ajuste financeiro automaticamente."*

O fluxo operacional de correção de divergências ocorre nas seguintes etapas:
1. **Detecção:** O monitor incremental identifica a discrepância e congela a cadeia de evidências com hash criptográfico SHA-256.
2. **Alerta em Tempo Real:** Disparo imediato de evento Outbox para o **Command Center 11.18** com som, badge e prioridade.
3. **Encaminhamento Operacional:** Criação automática de Caso na Central de Casos com atribuição ao domínio responsável (Financeiro, Tesouraria, Comercial ou Portaria).
4. **Retificação no Domínio de Origem:**
   - Se for `PEDIDO_SEM_LEDGER`, o backoffice financeiro no **EDDIE 11.19/11.20** executa o lançamento compensatório no Ledger.
   - Se for `BANCO_DIVERGENTE`, a Tesouraria confere o comprovante bancário e reenvia o lote.
5. **Revalidação Criptográfica:** O auditor aciona `POST /api/revenue-assurance/cases/:id/revalidate`. O sistema reprocessa a cadeia completa das 8 fontes. Caso a cadeia apresente agora conformidade total (`INTEGRO`), o caso é formalmente fechado com registro imutável no Audit Trail.

# Matriz de Regras de Conciliação Bancária 1:1

## Auditoria Ponta a Ponta entre Extrato Bancário e Ledger

---

### 1. Critérios de Conciliação Automática

| Tipo de Movimentação | Canal Bancário | Chave Primária de Vínculo | Tolerância de Valor | Ação Contábil |
|---|---|---|:---:|---|
| **Repasse via PIX** | SPI / DICT | `EndToEndId` + `idempotencyKey` | R$ 0,00 | Débito em Conta Corrente / Baixa Passivo Produtor |
| **Repasse em Lote** | CNAB 240 / 400 | `NSR Lote` + `Hash SHA-256` | R$ 0,00 | Débito em Conta Corrente / Baixa Passivo Produtor |
| **Recebimento de Vendas** | Adquirente / Gateway | `NSU Adquirente` + `ID Pedido` | R$ 0,00 | Crédito em Conta Corrente / Baixa Contas a Receber |
| **Rendimento de Aplicação** | CDB / DI | `Código Operação Bancária` | R$ 0,00 | Crédito em Aplicação / Receita Financeira |
| **Tarifa Bancária / TED** | Débito em Conta | `Código Histórico Bancário` | R$ 0,00 | Débito em Conta Corrente / Despesa Bancária |

---

### 2. Tratamento de Divergências

1. **Divergência de Valor:** O lançamento permanece retido como `PENDENTE_CONCILIACAO` e aciona alerta imediato na Control Tower Financeira.
2. **Lançamento Não Reconhecido:** Gera auditoria preventiva e bloqueia conciliação automática até confirmação do auditor chefe.

# Mapa de Settlement & Fluxo de Liquidação Financeira
## EDDIE 11.24 — Event Closing & Producer Settlement

### 1. Visão Geral do Ciclo de Liquidação
O fluxo de liquidação do produtor segue a máquina de estados imutável de 8 etapas:

```
[PREVIA] 
   └──> [VALIDACAO] 
           └──> [APROVACAO] (SoD + Alçada)
                   └──> [RESERVA] (Retenção 5%)
                           └──> [EXECUCAO] (IdempotencyKey + Lock)
                                   └──> [RETORNO] (Confirmação Bancária)
                                           └──> [CONCILIACAO] 
                                                   └──> [LIQUIDADO]
```

---

### 2. Memória de Cálculo Centavo a Centavo (Lossless Integer Arithmetic)

O cálculo do valor líquido elegível do produtor obedece à equação canônica de liquidação:

$$\text{NetPayout} = \max\Big(0, \text{GMV} - \text{TaxaFixa} - \text{TaxaPerc} - \text{TaxaGateway} - \text{CDC} - \text{Chargebacks} - \text{Transf} - \text{Custos} - \text{RepassesAnt} - \text{Retenção}\Big)$$

| Parâmetro | Tipo | Descrição | Exemplo (Centavos) | Exemplo (R$) |
|---|---|---|---|---|
| `gmvCents` | Entrada | Faturamento bruto total das vendas aprovadas | `10000000` | R$ 100.000,00 |
| `platformFeeFixedCents` | Dedução | Taxa fixa contratual por lote/evento | `25000` | R$ 250,00 |
| `platformFeePercentageCents` | Dedução | Taxa de conveniência da plataforma (10%) | `1000000` | R$ 10.000,00 |
| `paymentProcessingFeeCents` | Dedução | Taxa média de gateway/adquirente (2,5%) | `250000` | R$ 2.500,00 |
| `cdcRefundsCents` | Dedução | Reembolsos autorizados pelo CDC Art. 49 | `200000` | R$ 2.000,00 |
| `chargebacksCents` | Dedução | Disputas e contestações de cartão | `0` | R$ 0,00 |
| `transfersCents` | Ajuste | Transferências e rateios inter-evento | `0` | R$ 0,00 |
| `operatingCostsCents` | Dedução | Despesas de infraestrutura dedutíveis em contrato | `0` | R$ 0,00 |
| `priorPayoutsCents` | Dedução | Adiantamentos e repasses parciais já pagos | `4000000` | R$ 40.000,00 |
| `securityHoldCents` | Reserva | Retenção temporária de segurança (5%, 30 dias) | `500000` | R$ 5.000,00 |
| **`netFinalPayoutCents`** | **Líquido** | **Saldo líquido final liberado para TED/PIX** | **`4025000`** | **R$ 40.250,00** |

---

### 3. Matriz de Alçada & Segregação de Funções (SoD)
1. **Regra SoD Estrita**:
   - `operatorId !== approverId`. O operador que solicita o fechamento é expressamente proibido de aprovar a liquidação.
2. **Alçada Operacional (Até R$ 39.999,99)**:
   - Aprovável por Coordenador Financeiro com login RBAC autenticado.
3. **Alçada de Diretoria (A partir de R$ 40.000,00)**:
   - Exige obrigatoriamente assinatura/token de diretoria (`AUTH-DIR-*`).
   - Sem o token ou com token inválido, a chamada retorna `412 Precondition Failed`.

---

### 4. Garantia de Idempotência & Prevenção de Double-Click
- Cada chamada de execução bancária (`POST /api/event-closings/:id/settlement/execute`) exige o cabeçalho `Idempotency-Key`.
- O identificador de execução é registrado atomicamente no cache de pagamentos.
- Se o mesmo clique ou um retry disparar requisição com a mesma chave, a API devolve o registro já existente com status `LIQUIDADO` e o mesmo identificador de transação bancária PIX (`PIX-DISKINGRESSOS-*`), impedindo qualquer débito duplicado.

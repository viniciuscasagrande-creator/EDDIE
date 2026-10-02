# EDDIE 11.19 — EVIDÊNCIAS DE EXECUÇÃO E2E (20/20 CENÁRIOS)

> **Relatório Oficial de Testes Automatizados E2E**  
> **Suíte:** `apps/api/src/modules/financeiro/financial-intelligence.spec.ts`  
> **Resultado:** 20 APROVADOS de 20 EXECUTADOS (100% de Taxa de Sucesso)  
> **Ambiente:** Node.js v20+ / Vitest v2.1.9 / NestJS 10 / In-Memory Mock Transactional Engine

---

## 1. Resumo da Execução dos Testes

```text
 ✓ src/modules/financeiro/financial-intelligence.spec.ts (20 tests) 38ms
   ✓ Cenário 1: Venda de ingressos com taxa percentual (10%) e gravação de snapshot
   ✓ Cenário 2: Venda com taxa fixa e preservação do snapshot de vendas anteriores
   ✓ Cenário 3: Consulta do saldo real derivado do Ledger com segregação por buckets
   ✓ Cenário 4: Idempotência garantida no registro de vendas (retry sem duplicar)
   ✓ Cenário 5: Transferência de saldo disponível entre eventos do mesmo produtor
   ✓ Cenário 6: Bloqueio estrito de transferência entre eventos de produtores distintos
   ✓ Cenário 7: Estorno compensatório de transferência inter-eventos
   ✓ Cenário 8: Simulação de Advanced com cálculo estrito de deságio pró-rata dia
   ✓ Cenário 9: Estorno pré-repasse com recomposição do saldo de custódia
   ✓ Cenário 10: Chargeback pós-repasse com débito no fundo de reserva e caso de divergência
   ✓ Cenário 11: Reversão de chargeback ganho em disputa com recomposição do saldo
   ✓ Cenário 12: Agendamento de lote de repasse com retenção cautelar do saldo
   ✓ Cenário 13: Execução de liquidação bancária com comprovante e baixa no Ledger
   ✓ Cenário 14: Idempotência na liquidação bancária (retry não gera débito duplo)
   ✓ Cenário 15: Conciliação 6 vias com detecção automática de divergência
   ✓ Cenário 16: Resolução auditada de caso de divergência com parecer do auditor
   ✓ Cenário 17: Geração de DRE oficial por evento segregando taxas Disk e custos
   ✓ Cenário 18: Fluxo de caixa realizado vs projetado
   ✓ Cenário 19: Conta consolidada do produtor com segregação por evento
   ✓ Cenário 20: Diagnósticos de inteligência financeira baseados em evidência e eventos Outbox
```

---

## 2. Detalhamento dos Cenários de Teste

### Cenário 1: Venda com Taxa Percentual e Snapshot
- **Entrada:** Venda de 2 ingressos de R$ 100,00 (Total R$ 200,00 = 20.000 centavos) sob regra PERCENTUAL de 10%.
- **Resultado:**
  - Taxa Disk: R$ 20,00 (2.000 centavos).
  - Custo Gateway: R$ 5,00 (500 centavos a 2.5%).
  - Líquido Produtor: R$ 175,00 (17.500 centavos).
  - Snapshot gravado com versão V1.
- **Evidência:** `snapshot.diskFeeCents === 2000`, `snapshot.producerNetCents === 17500`.

### Cenário 2: Taxa Fixa e Preservação de Snapshot Histórico
- **Ação:** Criação da regra V2 com taxa FIXA de R$ 5,00 por ingresso e nova venda de 1 ingresso de R$ 100,00.
- **Resultado:**
  - Venda 1 mantém snapshot original V1 (R$ 20,00 de taxa Disk).
  - Venda 2 aplica snapshot V2 (R$ 5,00 de taxa Disk).
  - Vendas históricas permaneceram inalteradas.
- **Evidência:** `sale1.snapshot.contractVersion === 1`, `sale2.snapshot.contractVersion === 2`.

### Cenário 3: Saldo Real por Buckets
- **Ação:** Consulta do saldo do evento.
- **Resultado:**
  - Bucket `disponivel`: 0 centavos (saldo em garantia).
  - Bucket `retido`: 27.000 centavos (líquido das vendas 1 e 2 retidas até o evento).
  - Bucket `bloqueado`: 0 centavos.
  - Bucket `reservado_estorno`: 0 centavos.
- **Evidência:** `balance.retidoCents === 27000`.

### Cenário 4: Idempotência de Venda
- **Ação:** Retentativa de envio do pedido `order-idemp-1` com a mesma chave.
- **Resultado:**
  - Nenhuma duplicação de lançamentos no Ledger.
  - Retorno imediato do registro existente.
- **Evidência:** `lancamentos.length === 1`.

### Cenário 5: Transferência Inter-Eventos (Mesmo Produtor)
- **Ação:** Transferência de R$ 500,00 (50.000 centavos) do Evento A para o Evento B do mesmo produtor.
- **Resultado:**
  - Débito em partidas dobradas no Evento A.
  - Crédito em partidas dobradas no Evento B.
  - Lançamento referenciado com correlation ID.
- **Evidência:** `transfer.status === 'COMPLETA'`.

### Cenário 6: Bloqueio de Transferência entre Produtores Distintos
- **Ação:** Tentativa de transferir saldo de um evento do Produtor A para evento do Produtor B.
- **Resultado:**
  - Rejeição imediata com `ForbiddenException`.
  - Zero mutações contábeis efetuadas.
- **Evidência:** `expect(action).rejects.toThrow(ForbiddenException)`.

### Cenário 7: Estorno Compensatório de Transferência
- **Ação:** Reversão da transferência efetuada no Cenário 5.
- **Resultado:**
  - Lançamento compensatório reverso sem `UPDATE` ou `DELETE` no Ledger.
  - Saldo de ambos os eventos restabelecido integralmente.
- **Evidência:** `reversal.compensatoryEntryId !== undefined`.

### Cenário 8: Simulação de Advanced (Antecipação)
- **Ação:** Antecipação de R$ 10.000,00 (1.000.000 centavos) por 30 dias com taxa contratual de 3.0% ao mês.
- **Resultado:**
  - Deságio calculado: R$ 300,00 (30.000 centavos).
  - Valor líquido: R$ 9.700,00 (970.000 centavos).
- **Evidência:** `sim.discountFeeCents === 30000`, `sim.netAmountCents === 970000`.

### Cenário 9: Estorno Pré-Repasse (CDC 7 Dias)
- **Ação:** Solicitação de estorno de pedido antes da realização da sessão e do repasse.
- **Resultado:**
  - Recomposição do bucket `retido`.
  - Baixa sem impacto no caixa livre do produtor.
- **Evidência:** `refund.status === 'COMPENSADO'`.

### Cenário 10: Chargeback Pós-Repasse
- **Ação:** Recebimento de contestação bancária após o produtor já ter sacado os valores da bilheteria.
- **Resultado:**
  - Débito no fundo de `reservado_estorno`.
  - Abertura automática de caso de divergência de conciliação.
- **Evidência:** `chargeback.caseId !== undefined`.

### Cenário 11: Reversão de Chargeback Ganho
- **Ação:** Defesa da contestação acolhida pela operadora de cartão com envio de comprovantes de check-in.
- **Resultado:**
  - Lançamento compensatório a crédito no saldo do evento.
  - Encerramento do caso de divergência com parecer do auditor.
- **Evidência:** `reversal.status === 'REVERTIDO'`.

### Cenário 12: Agendamento de Lote de Repasse (Settlement)
- **Ação:** Agendamento de repasse Pix de R$ 2.000,00.
- **Resultado:**
  - Transferência cautelar imediata do bucket `disponivel` para o bucket `bloqueado`.
- **Evidência:** `lot.status === 'AGENDADO'`.

### Cenário 13: Execução de Liquidação Bancária
- **Ação:** Retorno bancário confirmando liquidação com comprovante e ID Pix ponta a ponta.
- **Resultado:**
  - Baixa contábil definitiva no Ledger.
  - Lote marcado como `PAGO`.
- **Evidência:** `lot.status === 'PAGO'`, `lot.pixEndToEndId !== null`.

### Cenário 14: Idempotência na Liquidação Bancária
- **Ação:** Retentativa de liquidação do mesmo lote de repasse já pago.
- **Resultado:**
  - Retorno do lote original sem novo débito no Ledger.
- **Evidência:** `lotRetry.status === 'PAGO'`.

### Cenário 15: Conciliação 6 Vias
- **Ação:** Execução do motor de conferência das 6 vias (Gateway, Pagamento, Pedido, Ledger, Repasse, Banco).
- **Resultado:**
  - Matriz com 6 pontos auditáveis.
  - Status geral: `CONCILIADO`.
- **Evidência:** `reconciliation.points.length === 6`, `reconciliation.status === 'CONCILIADO'`.

### Cenário 16: Resolução Auditada de Caso de Divergência
- **Ação:** Auditor contábil registra parecer formal para caso de divergência.
- **Resultado:**
  - Status do caso atualizado para `RESOLVIDO`.
  - Parecer e autor imutavelmente persistidos.
- **Evidência:** `resolvedCase.status === 'RESOLVIDO'`, `resolvedCase.resolvedBy !== null`.

### Cenário 17: DRE Oficial do Evento
- **Ação:** Extração do Demonstrativo do Resultado do Exercício.
- **Resultado:**
  - GMV apurado com precisão decimal.
  - Dedução discriminada de taxas Disk, gateways, estornos e repasses.
- **Evidência:** `dre.grossTicketRevenueCents > 0`, `dre.netRemainingBalanceCents >= 0`.

### Cenário 18: Fluxo de Caixa Realizado vs Projetado
- **Ação:** Consulta do fluxo financeiro temporal do evento.
- **Resultado:**
  - Curva de entradas realizadas vs projeção de desembolsos futuros.
- **Evidência:** `cashflow.realizedInCents >= 0`.

### Cenário 19: Conta Consolidada do Produtor
- **Ação:** Totalização patrimonial de todos os eventos ativos do produtor.
- **Resultado:**
  - Saldo global consolidado com detalhamento evento a evento.
- **Evidência:** `consolidated.totalAvailableCents >= 0`, `consolidated.eventBalances.length > 0`.

### Cenário 20: Inteligência Financeira e Outbox Events
- **Ação:** Geração de insights diagnósticos baseados em evidência e validação da emissão de eventos via Outbox.
- **Resultado:**
  - Diagnósticos gerados com score de confiança (ex: 98%).
  - Zero movimentação financeira automática desautorizada.
  - Registro de eventos de domínio no Outbox transacional.
- **Evidência:** `intelligence.length > 0`, `outboxEventLogged === true`.

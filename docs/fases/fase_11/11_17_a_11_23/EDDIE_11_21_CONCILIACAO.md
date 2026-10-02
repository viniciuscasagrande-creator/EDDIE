# EDDIE 11.21 — CONCILIAÇÃO LEDGER FINANCEIRO × CONTABILIDADE

> **Data de Homologação:** 25 de Setembro de 2026  
> **Status:** HOMOLOGADO & AUDITADO  
> **Módulos:** `contabilidade` (Accounting Engine), `financeiro` (Ledger 11.19)  
> **Arquivos-Chave:** [`accounting.service.ts`](file:///C:/Users/vinad/OneDrive/Desktop/EDDIE/apps/api/src/modules/contabilidade/accounting.service.ts), [`financeiro.public-service.ts`](file:///C:/Users/vinad/OneDrive/Desktop/EDDIE/apps/api/src/modules/financeiro/financeiro.public-service.ts)

---

## 1. Princípio da Conciliação Cruzada

O sistema financeiro da DiskIngressos possui o Livro-Razão Financeiro (`lancamentoLedger` do **11.19**) como a fonte primária e imutável dos fatos econômicos (vendas, retenções de taxa, buckets de saldo, repasses e estornos).

O módulo **EDDIE 11.21** estabelece a rotina de **Conciliação Cruzada**:
- Todo fato financeiro registrado no Ledger deve possuir exatamente uma contrapartida escriturada em partidas dobradas na Contabilidade.
- A conferência é contínua e automatizada.
- Em obediência estrita à **Regra Inviolável 1** do projeto (*"Nenhum módulo faz query na tabela de outro módulo"*), a Contabilidade consulta o Ledger exclusivamente via porta pública:
  `FinanceiroPublicService.obterExtratoLedgerParaContabilidade(tenantId, produtorId, query)`.

---

## 2. Tipologia de Inconsistências Detectadas

| Status da Divergência | Causa Raiz | Ação Automática | Severidade |
|---|---|---|:---:|
| **`SEM_LANCAMENTO_CONTABIL`** | Fato presente no Ledger Financeiro, mas ausente na tabela de lançamentos contábeis (ex: falha transitória de mensageria). | Abre pendência na Central de Pendências e bloqueia o fechamento mensal da competência. | **CRITICO** |
| **`SEM_ORIGEM_LEDGER`** | Lançamento contábil registrado sem referência de fato no Ledger Financeiro (ex: ajuste manual sem documento). | Sinaliza lançamento suspeito para auditoria contábil. | **ALTO** |
| **`DIVERGENTE`** | Diferença de centavos entre o valor monetário do Ledger e a soma das partidas dobradas contábeis. | Registra divergência com apontamento do delta exato de centavos. | **ALTO** |
| **`COMPETENCIA_INCONSISTENTE`** | Fato ocorrido em uma data civil escriturado em competência contábil divergente sem política de diferimento. | Alerta analítico para conciliação temporal de competência. | **MEDIO** |

---

## 3. Algoritmo de Conciliação no `AccountingService`

```typescript
async conciliarLedgerFinanceiro(tenantId: string, competencia: string): Promise<LedgerReconciliationSummaryDto> {
  // 1. Obtém lançamentos do Ledger via porta pública oficial (Regra 1)
  const extratoLedger = await this.financeiroPublicService.obterExtratoLedgerParaContabilidade(tenantId);

  // 2. Obtém lançamentos contábeis da competência
  const lancamentosContabeis = await this.prisma.lancamentoContabil.findMany({
    where: { tenantId, competencia, status: 'confirmado' },
  });

  const mapaContabilPorOrigem = new Map<string, number>();
  for (const l of lancamentosContabeis) {
    const chave = `${l.origemTipo}:${l.origemReferenciaId}`;
    mapaContabilPorOrigem.set(chave, (mapaContabilPorOrigem.get(chave) || 0) + decimalToCents(l.total));
  }

  // 3. Confronta cada item do Ledger com o mapa contábil
  for (const item of extratoLedger.itens) {
    const chave = `${item.origem.toLowerCase()}:${item.referenciaId}`;
    const valorContabilCents = mapaContabilPorOrigem.get(chave);

    if (valorContabilCents == null) {
      divergencias.push({
        id: `div-rec-${item.id}`,
        fatoOrigemId: item.referenciaId,
        status: 'SEM_LANCAMENTO_CONTABIL',
        diferencaCents: item.valorCents,
      });
    } else if (valorContabilCents !== item.valorCents) {
      divergencias.push({
        id: `div-rec-${item.id}`,
        fatoOrigemId: item.referenciaId,
        status: 'DIVERGENTE',
        diferencaCents: item.valorCents - valorContabilCents,
      });
    }
  }

  return { competencia, totalFatosLedger, totalLancamentosContabeis, totalConciliados, totalDivergentes, divergencias };
}
```

---

## 4. Integração com a Central de Pendências e Fechamento

1. Toda divergência detectada é catalogada como uma ocorrência formal.
2. O fechamento mensal da competência possui uma trava física: **se `totalDivergentes > 0` ou se houver pendências críticas de conciliação abertas, a competência NÃO pode ser fechada**.
3. O contador ou auditor visualiza o painel de divergências, anexa o comprovante correspondente e executa a conciliação manual fundamentada ou reclassificação auditada.

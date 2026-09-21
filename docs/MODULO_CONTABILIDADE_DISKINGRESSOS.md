# Módulo Contabilidade --- DiskIngressos

> Consolidação exclusiva do **Módulo Contabilidade**, baseada no backup
> do projeto fornecido em 21/09/2026.\
> O Financeiro permanece como módulo independente e fornece os fatos
> financeiros necessários à escrituração.

## 1. Objetivo

Transformar movimentações financeiras reais da operação de ingressos em
informação contábil rastreável, mantendo separação entre recursos de
terceiros (produtores/eventos) e receitas próprias da DiskIngressos.

## 2. Princípios

-   Financeiro e Contabilidade são módulos independentes.
-   Toda contabilização deve possuir origem rastreável.
-   Recursos pertencentes ao produtor não devem ser tratados
    automaticamente como receita própria.
-   Eventos, pedidos, taxas, repasses, estornos e liquidações devem
    manter vínculo com seus documentos de origem.
-   Ajustes contábeis exigem usuário, justificativa, data/hora e
    auditoria.
-   Interface visível 100% em pt-BR.

## 3. Estrutura funcional

``` text
CONTABILIDADE
├── Dashboard Contábil
├── Plano de Contas
├── Lançamentos Contábeis
├── Diário
├── Razão
├── Conciliação Contábil
├── Fechamento
├── Balancete
├── Balanço Patrimonial
├── DRE
├── Obrigações / Fiscal
├── Auditoria & Compliance
└── Relatórios Contábeis
```

## 4. Dashboard Contábil

Visão executiva de: - lançamentos do período; - pendências de
classificação; - divergências; - contas conciliadas; - contas não
conciliadas; - fechamento; - ativos; - passivos; - patrimônio; -
receitas; - despesas; - resultado; - alertas contábeis.

## 5. Plano de Contas

Estrutura padronizada para classificação das operações. Deve
diferenciar, entre outros: - disponibilidades; - recebíveis; - valores
de terceiros; - obrigações com produtores; - taxas a receber; - receita
própria; - despesas; - estornos; - chargebacks; - impostos; - contas
transitórias; - contas de conciliação.

## 6. Lançamentos Contábeis

Cada lançamento deve possuir: - data; - competência; - conta débito; -
conta crédito; - valor; - histórico; - produtor/evento quando
aplicável; - documento de origem; - pedido/transação quando aplicável; -
usuário/processo responsável; - status.

## 7. Diário

Registro cronológico dos fatos contábeis, com filtros por período,
conta, evento, origem, documento e status.

## 8. Razão

Movimentação detalhada por conta contábil, com saldo anterior, débitos,
créditos e saldo resultante.

## 9. Integração Financeiro → Contabilidade

Fluxo conceitual:

`Venda/Pedido → Financeiro → Liquidação/Repasse/Taxa → Regra Contábil → Lançamento → Conciliação → Demonstrações`

O módulo contábil não deve reconstruir manualmente fatos já existentes
no Financeiro.

## 10. Modelo setorial de intermediação

A arquitetura deve permitir distinguir: - valor total pago pelo
comprador; - recursos pertencentes ao produtor; - taxas/receitas
próprias; - valores a repassar; - valores já liquidados; - estornos; -
ajustes.

O desenho deve evitar o uso indiscriminado de uma "conta bolsão" sem
segregação e rastreabilidade.

## 11. Conciliação Contábil

Deve confrontar: - razão contábil; - Financeiro; - bancos; -
gateways/adquirentes; - recebíveis; - repasses; - estornos; - documentos
de origem.

Divergências devem possuir tratamento, responsável e histórico.

## 12. Fechamento Contábil

Checklist por competência: - integrações concluídas; - pendências
classificadas; - conciliações realizadas; - ajustes aprovados; - contas
transitórias verificadas; - demonstrações geradas; - período fechado.

Reabertura deve exigir permissão e auditoria.

## 13. Balancete

Apresentar saldo anterior, débitos, créditos e saldo atual por conta,
permitindo navegação até os lançamentos de origem.

## 14. Balanço Patrimonial

Estrutura para: - Ativo; - Passivo; - Patrimônio Líquido.

Os valores devem ser derivados do plano de contas e dos lançamentos
efetivamente contabilizados.

## 15. DRE

Demonstração de resultado baseada nas receitas e despesas próprias da
empresa, evitando incorporar como receita valores que pertencem a
produtores.

## 16. Auditoria & Compliance

Registrar: - criação; - alteração; - estorno; - ajuste; - fechamento; -
reabertura; - usuário; - data/hora; - justificativa; - origem; - estado
anterior/posterior.

## 17. Relatórios

-   plano de contas;
-   lançamentos;
-   diário;
-   razão;
-   balancete;
-   DRE;
-   balanço patrimonial;
-   conciliações;
-   pendências;
-   ajustes;
-   trilha de auditoria.

## 18. Critérios de aceite

-   Financeiro e Contabilidade permanecem separados.
-   Todo lançamento possui origem identificável.
-   Recursos de terceiros e receita própria são segregados.
-   Diário e Razão fecham com os lançamentos.
-   Balancete, DRE e Balanço derivam dos registros contábeis.
-   Ajustes são auditáveis.
-   Fechamentos possuem controle de competência.
-   Divergências de conciliação são explicitadas.
-   Interface permanece em pt-BR.

## 19. Referências técnicas encontradas

-   `src/accounting/accounting-controller.ts`
-   `src/navigation/accounting-routes.ts`
-   `src/data/accounting.ts`
-   `src/pages/AccountingDashboardPage.tsx`
-   `src/pages/AccountingChartPage.tsx`
-   `src/pages/AccountingEntriesPage.tsx`
-   `src/pages/AccountingJournalPage.tsx`
-   `src/pages/AccountingLedgerPage.tsx`
-   `src/pages/FinanceAccountingHubPage.tsx`
-   `src/services/financialAccountingCore.service.ts`
-   `src/types/finance-accounting-core.types.ts`

**Documento:** Contabilidade --- DiskIngressos\
**Data:** 21/09/2026

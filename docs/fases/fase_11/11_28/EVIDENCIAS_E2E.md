# Evidências End-to-End e Trilha de Auditoria
## EDDIE 11.28 — FP&A, Budgeting & Multi-Year Financial Planning

---

### 1. Trilha de Execução do Motor de FP&A
```
[FinancialPlanningService] Orçamento do Centro de Custo CC-300 revisado de R$ 3.500.000,00 para R$ 4.000.000,00 por cfo-diretor-financeiro (Ampliação do orçamento para campanhas de Black Friday)
[FinancialPlanningService] Análise de desvios orçamentários calculada: 1 rubrica desfavorável detectada (Cloud +7.78%)
[FinancialPlanningService] Projeção plurianual 2026-2028 gerada: CAGR de 30% a.a. com expansão de margem EBITDA de 33.4% para 46.7%
```

### 2. Validação da Estrutura de Centros de Custo (2026)
```json
{
  "totalAnnualBudgetCents": 1900000000,
  "totalActualSpentCents": 1410000000,
  "totalCommittedCents": 170000000,
  "budgetConsumptionPercent": 83.16,
  "statusGlobal": "NEUTRO"
}
```

### 3. Validação da Margem de Contribuição por Categoria
```json
[
  { "categoria": "FESTIVAIS", "gmvCents": 4500000000, "margemPercent": 77.78 },
  { "categoria": "SHOWS_NACIONAIS_INTERNACIONAIS", "gmvCents": 3200000000, "margemPercent": 76.44 },
  { "categoria": "TEATROS_ESPETACULOS", "gmvCents": 1200000000, "margemPercent": 80.00 },
  { "categoria": "ESPORTES_CORPORATIVO", "gmvCents": 850000000, "margemPercent": 80.91 }
]
```

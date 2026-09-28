# Módulo: Financial Planning, Budgeting & FP&A (`financial-planning`)

> Contexto local do módulo de Planejamento Financeiro, Orçamento, Centros de Custo,
> Margem de Contribuição e Análise Orçado × Realizado (EDDIE 11.28).

## Responsabilidade

1. **Gestão Orçamentária e Centros de Custo (Budget & Cost Centers):**
   - Estrutura de centros de custo (`CC-100` a `CC-500`) com segregação estrita entre OPEX e CAPEX.
   - Tetos orçamentários com travas graduadas de consumo (Alerta em 85%, Bloqueio em 100%).
2. **Análise de Desvios Orçamentários (Budget vs Actual & Variance Analysis):**
   - Comparativo contínuo entre valores orçados, realizados e revisões de forecast.
   - Cálculo de variância nominal (R$) e percentual (%), com classificação automática (`FAVORAVEL`, `NEUTRO`, `DESFAVORAVEL`, `CRITICO`).
3. **Margem de Contribuição & DRE Gerencial Projetada:**
   - Apuração da margem de contribuição líquida por categoria de evento (Festivais, Shows, Teatros, Esportes).
   - Cálculo e acompanhamento de EBITDA orçado vs realizado.
4. **Planejamento Plurianual & Roll-Forward (2026 – 2028):**
   - Modelagem de crescimento plurianual com cálculo de taxa composta (CAGR) e premissas macroeconômicas.

## Esquemas do Banco

- `financeiro` / `platform`
- Total integração via portas públicas e Ledger auditável; isolamento modular sem queries diretas a tabelas alheias.

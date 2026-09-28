# Evidências de Testes E2E & Validação Estatística
## EDDIE 11.26 — Cash Forecast, Liquidity & Working Capital OS

Comando executado:
```powershell
pnpm --filter @ticketing/api test src/modules/cash-forecast/cash-forecast.spec.ts
```

Resultado da Execução:
```text
 ✓ src/modules/cash-forecast/cash-forecast.spec.ts (10 tests) 14ms

 Test Files  1 passed (1)
      Tests  10 passed (10)
   Start at  09:45:43
   Duration  11.85s
```

---

### Mapeamento dos Cenários de Teste

| # | Identificador | Descrição do Teste | Status | Exit Code |
|:---:|---|---|:---:|:---:|
| 1 | `CF-01` | **Segregação dos 6 Saldos**: Segregação de saldo bancário, ledger, disponível, reservado, em liquidação e projetado | **PASS** | 0 |
| 2 | `CF-02` | **6 Horizontes Temporais**: Projeção de fluxo nos horizontes D+1, D+7, D+15, D+30, D+60 e D+90 | **PASS** | 0 |
| 3 | `CF-03` | **Inflows & Outflows**: Decomposição analítica de entradas (Pix, Cartão, Patrocínio) e saídas | **PASS** | 0 |
| 4 | `CF-04` | **Cenários de Estresse**: Cenário conservador estressa vendas (-20%) e estornos CDC (+30%) | **PASS** | 0 |
| 5 | `CF-05` | **Simulação Customizada**: Sliders paramétricos aplicam variações dinâmicas de vendas e prazos | **PASS** | 0 |
| 6 | `CF-06` | **Gaps de Liquidez**: Identificação e classificação de gaps abaixo da reserva mínima de segurança | **PASS** | 0 |
| 7 | `CF-07` | **Capital de Giro (NCG)**: Cálculo de PMR (14d), PMP (22d), Ciclo Financeiro (-8d) e folga de liquidez | **PASS** | 0 |
| 8 | `CF-08` | **Premissas Versionadas**: Consulta e versionamento imutável de premissas com auditoria (v1.0 $\rightarrow$ v1.1) | **PASS** | 0 |
| 9 | `CF-09` | **Backtesting & Acurácia**: Confronto com extratos bancários gerando MAPE < 5% e acurácia > 95% | **PASS** | 0 |
| 10 | `CF-10` | **Visão 360º Consolidada**: Endpoint agregador consolida posição, horizontes, gaps e backtesting | **PASS** | 0 |

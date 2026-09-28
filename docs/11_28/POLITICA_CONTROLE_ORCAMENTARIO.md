# Política de Controle Orçamentário e Variâncias
## EDDIE 11.28 — Diretrizes de Acompanhamento, Alçadas e Revisão Orçamentária

---

### 1. Faixas de Tolerância e Status de Variância

| Status | Tolerância Percentual | Ação Exigida |
|:---:|:---:|---|
| **FAVORÁVEL** | Variação &lt; 0% (Economia) | Registro de boas práticas operacionais |
| **NEUTRO** | 0% a +3% | Acompanhamento padrão em rotina quinzenal |
| **DESFAVORÁVEL** | +3.1% a +10% | Justificativa formal do gestor do Centro de Custo |
| **CRÍTICO** | &gt; +10% | Plano de contingência e contenção de gastos imediato |

---

### 2. Fluxo de Revisão Orçamentária (Roll-Forward)
1. **Solicitação:** Gestor do Centro de Custo submete a necessidade de verba suplementar.
2. **Análise de Impacto FP&A:** O motor de FP&A calcula o impacto na margem EBITDA anual e no fluxo de caixa projetado.
3. **Deliberação:** O CFO/Diretoria delibera a aprovação com registro imutável no evento `financial_planning.revisao_orcamentaria_aprovada.v1`.

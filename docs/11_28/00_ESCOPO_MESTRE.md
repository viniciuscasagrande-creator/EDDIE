# EDDIE 11.28 — FP&A, Budgeting & Multi-Year Financial Planning
## Documento Mestre de Escopo, Arquitetura e Planejamento Orçamentário

---

### 1. Visão Geral e Contexto
O **EDDIE 11.28** entrega o Sistema Operacional de Planejamento Financeiro (FP&A), Gestão Orçamentária e Projeções Plurianuais para a DiskIngressos.

Ele consolida e governa:
- **Centros de Custo (CC-100 a CC-500)**: Controle de alocação de despesas OPEX e CAPEX.
- **Análise de Desvios Orçamentários (Budget vs Actual)**: Detecção automática de variações nominais e percentuais por rubrica.
- **Margem de Contribuição por Categoria**: Rentabilidade direta segregada por Festivais, Shows, Teatros e Esportes.
- **Planejamento Plurianual (2026 – 2028)**: Projeções de escala com alavancagem operacional e cálculo de EBITDA.

---

### 2. Regras Invioláveis de Governança Orçamentária
1. **Segregação Estrita OPEX vs CAPEX:**
   > Despesas operacionais recorrentes (gateway, hospedagem, logística de catracas) não podem ser ativadas como CAPEX, preservando a fidelidade contábil.
2. **Hard Block em 100% do Orçamento:**
   > Nenhuma despesa ou contratação pode ser liquidada para um Centro de Custo que atingir 100% de consumo orçamentário sem prévia aprovação de revisão orçamentária pela Diretoria/CFO.
3. **Alerta Preventivo em 85%:**
   > Ao atingir 85% de utilização do orçamento anual, o Centro de Custo entra automaticamente em status `ALERTA_AMARELO`.

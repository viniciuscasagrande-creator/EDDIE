# Matriz de Risco, Scoring e Rating Prudencial
## EDDIE 11.27 — Parâmetros de Calibração e Retenção Compulsória

---

### 1. Escala de Ratings e Retenções Compulsórias

| Rating | Faixa de Score | Retenção de Segurança (Safety Reserve) | Limite Máximo de Exposição | Nível de Risco |
|:---:|:---:|:---:|:---:|:---:|
| **AAA** | 900 – 1000 | 20% das Vendas Brutas | Até 35% do Gross Sales | Prime / Mínimo |
| **AA** | 800 – 899 | 20% das Vendas Brutas | Até 30% do Gross Sales | Muito Baixo |
| **A** | 700 – 799 | 30% das Vendas Brutas | Até 25% do Gross Sales | Baixo |
| **BBB** | 600 – 699 | 35% das Vendas Brutas | Até 20% do Gross Sales | Moderado |
| **BB** | 500 – 599 | 50% das Vendas Brutas | Até 15% do Gross Sales | Atenção |
| **B** | 400 – 499 | 60% das Vendas Brutas | Até 10% do Gross Sales | Elevado |
| **CCC** | 250 – 399 | 75% das Vendas Brutas | Até 5% com Garantias Reais | Alto Risco |
| **D** | 0 – 249 | 90% (ou Bloqueio Total) | Zero (Vedado Adiantamento) | Inadimplente / Crítico |

---

### 2. Algoritmo de Pontuação de Risco (0 a 1000)

$$\text{Score Base} = 1000$$

#### Penalidades por Taxa de Contestação / Chargeback:
- $\text{CB} \le 0.30\% \rightarrow 0 \text{ pts}$
- $0.30\% < \text{CB} \le 0.80\% \rightarrow -50 \text{ pts}$
- $0.80\% < \text{CB} \le 1.20\% \rightarrow -150 \text{ pts}$
- $1.20\% < \text{CB} \le 1.80\% \rightarrow -300 \text{ pts}$
- $\text{CB} > 1.80\% \rightarrow -500 \text{ pts}$

#### Penalidades por Alavancagem de Crédito:
- $\text{Utilização} \le 50\% \rightarrow 0 \text{ pts}$
- $50\% < \text{Utilização} \le 80\% \rightarrow -50 \text{ pts}$
- $80\% < \text{Utilização} \le 100\% \rightarrow -150 \text{ pts}$
- $\text{Utilização} > 100\% \rightarrow -300 \text{ pts}$

#### Penalidades por Disputas Abertas:
- $\text{Disputas} \le 5 \rightarrow 0 \text{ pts}$
- $5 < \text{Disputas} \le 10 \rightarrow -30 \text{ pts}$
- $10 < \text{Disputas} \le 20 \rightarrow -80 \text{ pts}$
- $\text{Disputas} > 20 \rightarrow -150 \text{ pts}$

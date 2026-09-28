# EDDIE 11.26 — Cash Forecast, Liquidity & Working Capital OS
## 00. Escopo Mestre & Arquitetura do Sistema

### 1. Visão Geral
O **EDDIE 11.26** estabelece a camada definitiva de Inteligência de Liquidez, Previsão Financeira de Caixa e Gestão de Capital de Giro para a DiskIngressos. Ele atua como a evolução analítica e preditiva da Tesouraria e dos módulos financeiros predecessores (11.19, 11.20, 11.21, 11.24 e 11.25).

Fluxo Operacional Ponta a Ponta:
$$\textbf{Tesouraria/Bancos} \longrightarrow \textbf{Posição de Caixa} \longrightarrow \textbf{Recebíveis} \longrightarrow \textbf{Obrigações} \longrightarrow \textbf{Previsão} \longrightarrow \textbf{Liquidez} \longrightarrow \textbf{Capital de Giro} \longrightarrow \textbf{Cenários} \longrightarrow \textbf{Gaps} \longrightarrow \textbf{Alertas} \longrightarrow \textbf{Previsto} \times \textbf{Realizado} \longrightarrow \textbf{Backtesting}$$

---

### 2. A Regra Inviolável Mestra
> **Saldo bancário ≠ saldo do Ledger ≠ saldo disponível ≠ valor reservado ≠ valor em liquidação ≠ valor projetado.**

O valor projetado é uma estimativa estatística de fluxo futuro e **em hipótese alguma pode ser somado ao saldo disponível ou liberado para repasse/saque**. Essa diretriz protege o caixa da companhia contra o risco catastrófico de transformar expectativas de venda futura em caixa imediatamente distribuível.

---

### 3. Horizontes Temporais Estruturados
O sistema projeta fluxos em 6 horizontes regulamentares:
- **D+1 (Operacional Imediato)**: Liquidação de PIX e TEDs do dia, fechamento de lotes de pagamento.
- **D+7 (Semanal)**: Ciclo semanal de repasses a produtores e vencimento de fornecedores de eventos.
- **D+15 (Quinzenal)**: Fechamento de quinzena de vendas e conciliação de adquirentes.
- **D+30 (Mensal)**: Liquidação de recebíveis de cartão de crédito não antecipados e folha/custos fixos.
- **D+60 e D+90 (Trimestral/Estratégico)**: Curva de vendas de grandes festivais, turnês e sazonais.

---

### 4. Cenários de Estresse e Simulação
- **Cenário BASE**: Vendas e repasses nominais com base na esteira de contratos vigentes.
- **Cenário CONSERVADOR**: Aplicação de estresse regulatório (-20% sell-out, +30% estornos CDC e +5 dias de atraso de adquirente).
- **Cenário OTIMISTA**: Aceleração de curva de bilheteria (+20%) e antecipação negociada de recebíveis.
- **Cenário CUSTOMIZADO**: Sliders paramétricos no painel do PDT com recálculo em tempo real.

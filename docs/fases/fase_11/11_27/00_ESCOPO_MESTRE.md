# EDDIE 11.27 — Financial Risk, Controls & Exposure OS
## Documento Mestre de Escopo, Arquitetura e Governança Prudencial

---

### 1. Visão Geral e Contexto
O **EDDIE 11.27** implementa o Sistema Operacional de Gestão de Riscos Financeiros, Limites de Crédito/Adiantamento e Travas de Liquidação (Circuit Breakers) para o ecossistema DiskIngressos.

Ele atua como a camada de controle prudencial sobre os módulos:
- **Financeiro / Ledger (11.19/11.20)**: Impede que adiantamentos e repasses comprometam as garantias de solvência.
- **Revenue Assurance (11.22)**: Monitora desvios de integridade e aciona travas cautelares.
- **Portal do Produtor (11.23)**: Informa os limites disponíveis, garantias exigidas e status de score ao produtor.
- **Fechamento de Eventos (11.24)**: Condiciona a liberação da Safety Reserve ao fechamento formal definitivo.
- **Cash Forecast (11.26)**: Alimenta o modelo de previsão de caixa com índices de risco e estresse.

---

### 2. Regras Invioláveis de Governança
1. **Regra de Ouro da Safety Reserve:**
   > A Retenção Mínima de Segurança (Safety Reserve) calculada pela matriz de risco NUNCA pode ser violada por repasse antecipado ou adiantamento antes da liquidação final do evento.
2. **Teto Prudencial de Exposição Líquida:**
   > A Exposição Líquida de um produtor ($\text{Adiantamentos} - \text{Garantias}$) não pode ultrapassar o Limite de Crédito aprovado por sua alçada.
3. **Travamento Automático por Chargeback (Circuit Breaker):**
   > Taxa de chargeback $\ge 1.50\%$ em qualquer produtor nos últimos 30 dias dispara bloqueio imediato e compulsório de novos repasses.

---

### 3. Pilares da Arquitetura
1. **Scoring & Rating Motor:** Avalia continuamente histórico de contestações, utilização de limite e disputas.
2. **Circuit Breakers Engine:** Dispara e audita travas automáticas e manuais em tempo real.
3. **Análise de Concentração de Adquirentes (HHI):** Mede o risco sistêmico de liquidez caso um adquirente entre em colapso ou bloqueio judicial.
4. **Stress Testing de Desastre Operacional:** Simula cancelamento do maior evento, colapso de adquirente e surto sistêmico de chargebacks.
5. **Alçadas Multinível:** Governa alterações de limites e deliberações excepcionais (Gerente $\le$ R$ 50k, Diretor $\le$ R$ 250k, Comitê &gt; R$ 250k).

# Módulo: Financial Risk, Controls & Exposure OS (`financial-risk`)

> Contexto local do módulo de Gestão de Riscos Financeiros, Limites de Crédito/Adiantamento,
> Travas Automáticas (Circuit Breakers), Concentração de Adquirentes e Testes de Estresse (EDDIE 11.27).

## Responsabilidade

1. **Scoring e Rating de Risco de Produtores:**
   - Cálculo contínuo de score (0 a 1000) e rating prudencial (AAA a D).
   - Análise de histórico de chargeback, taxa de cancelamento e cumprimento de prazos.
2. **Motor de Limites e Retenção de Segurança (Safety Reserve):**
   - Determinação dinâmica do limite máximo de adiantamento concedível.
   - Garantia da retenção mínima de segurança obrigatória baseada na faixa de rating:
     - Rating AAA/AA: 20% retenção mínima.
     - Rating A/BBB: 35% retenção mínima.
     - Rating BB/B: 50% retenção mínima.
     - Rating CCC/D: 80% retenção mínima (ou bloqueio total).
3. **Regra Inviolável de Governança de Risco:**
   > **A Retenção Mínima de Segurança (Safety Reserve) NUNCA pode ser liberada para adiantamento ou repasse antes do encerramento e liquidação do evento.**
   > **Nenhum adiantamento pode ser concedido se a Exposição Líquida exceder o Limite Aprovado de Crédito.**
4. **Circuit Breakers & Travas Automáticas:**
   - Detecção em tempo real de ultrapassagem de thresholds:
     - Taxa de chargeback > 1.2% nos últimos 30 dias (Alerta) ou > 1.5% (Travamento imediato).
     - Risco de cancelamento de evento com saldo já adiantado.
     - Divergência grave não conciliada detectada pelo Revenue Assurance ou Ledger.
5. **Concentração de Adquirentes (HHI):**
   - Monitoramento do saldo em trânsito por adquirente.
   - Cálculo do índice Herfindahl-Hirschman (HHI) para mitigar risco de insolvência ou bloqueio bancário/adquirente.
6. **Stress Testing e Recuperação:**
   - Simulação de cenários de crise: Cancelamento do Maior Evento, Colapso de Adquirente e Surto de Chargeback Sistêmico.
   - Avaliação da suficiência de garantias e liquidez do ecossistema.

## Esquemas do Banco

- `financeiro` / `platform`
- Total integração via portas públicas e Ledger auditável; isolamento sem queries diretas a tabelas alheias.

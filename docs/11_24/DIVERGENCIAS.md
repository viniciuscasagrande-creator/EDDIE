# Relatório de Divergências & Resolução de Inconsistências
## EDDIE 11.24 — Event Closing & Settlement

### 1. Tratamento de Inconsistências vs Falsa Acusação de Fraude
Uma das diretrizes mestras do **EDDIE 11.24** (especificada no item 6 do prompt) estabelece:
> **"Consolidar inventário, vendidos, cortesias, cancelados, emitidos, validados/check-in e não utilizados; diferença vira pendência técnica analítica, não acusação automática de fraude."**

Na ocorrência de divergência entre ingressos emitidos e leituras de catraca:
- É gerado um item analítico na **Central de Pendências** categorizado no domínio `OPERACIONAL` ou `PORTARIA`.
- O item exibe a volumetria da diferença, hora de corte e sessão correspondente.
- A equipe de operações de campo e suporte possui trilha de conciliação para justificar eventuais falhas de conectividade de catraca, sincronização tardia de leitores offline ou contingência manual sem criminalizar indevidamente compradores ou operadores.

---

### 2. Tabela de Tipos de Divergências e Diretrizes de Resolução

| Domínio de Origem | Tipo de Divergência | Impacto no Fechamento | Ação Corretiva Exigida |
|---|---|:---:|---|
| `OPERACIONAL` | Ingressos validados em catraca > ingressos vendidos | `BLOQUEANTE` | Reconciliação dos logs brutos da catraca e conferência de cortesias emitidas |
| `PAGAMENTOS` | Lote de cartão de crédito não confirmado pela adquirente | `BLOQUEANTE` | Reenvio do arquivo EDI / consulta à API da adquirente para liquidação |
| `ESTORNO` | Solicitação de estorno CDC Art. 49 aberta | `BLOQUEANTE` | Conclusão do cancelamento/estorno no módulo de SAC/Estorno antes do fechamento |
| `FINANCEIRO` | Divergência entre saldo calculado e extrato bancário | `BLOQUEANTE` | Reconciliação manual com lançamento de ajuste de conciliação no Ledger 11.19 |
| `REVENUE_ASSURANCE` | Anomalia de precificação ou mismatch de split | `BLOQUEANTE` | Apuração da causa raiz e validação da matriz de integridade (11.22) |
| `CONTABILIDADE` | Desequilíbrio em partidas dobradas (Débito ≠ Crédito) | `BLOQUEANTE` | Correção do lançamento contábil no plano de contas pelo módulo 11.21 |

---

### 3. Regra de Resolução no Domínio Dono
O módulo orquestrador `event-closing` **nunca altera dados na base de outros módulos**. 
Se houver uma divergência de estorno, a regularização deve ocorrer exclusivamente no módulo `estorno`. Se houver divergência de saldo, a regularização ocorre no `financeiro`. Isso garante a preservação absoluta da Regra 1 de isolamento arquitetural de domínios.

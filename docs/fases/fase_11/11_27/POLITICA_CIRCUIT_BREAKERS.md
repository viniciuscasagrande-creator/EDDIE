# Política de Travas e Circuit Breakers Operacionais
## EDDIE 11.27 — Diretrizes de Segurança, Gatilhos e Alçadas de Liberação

---

### 1. Gatilhos Compulsórios de Circuit Breaker

| Código do Gatilho | Condição de Disparo | Ação Executada | Severidade |
|---|---|---|:---:|
| `CHARGEBACK_THRESHOLD_EXCEEDED` | Chargeback Rate &gt; 1.50% em 30d | `BLOQUEAR_REPASSES` | **CRÍTICO** |
| `UNAUTHORIZED_EXPOSURE` | Exposição Líquida &gt; Limite Aprovado | `CONGELAR_ADIANTAMENTOS` | **ALERTA** |
| `FRAUD_SUSPICION` | Surto de contestações não reconhecidas | `RETENCAO_TOTAL_100` | **EMERGENCIAL** |
| `INTEGRITY_DRIFT` | Divergência contábil não explicada | `NOTIFICAR_COMPLIANCE` | **ALERTA** |
| `MASS_CANCELLATION_RISK` | Notícia ou alteração radical do evento | `BLOQUEAR_REPASSES` | **CRÍTICO** |
| `MANUAL_EMERGENCY_LOCK` | Ordem expressa do Comitê ou Auditoria | `BLOQUEAR_REPASSES` | **CRÍTICO** |

---

### 2. Governança de Alçadas de Aprovação

Toda solicitação de adiantamento que extrapole o limite pré-fixado é direcionada para a alçada competente:

1. **Gerente Financeiro:**
   - Variação até R$ 50.000,00.
   - SLA de deliberação: 4 horas úteis.
2. **Diretor Financeiro:**
   - Variação entre R$ 50.000,01 e R$ 250.000,00.
   - SLA de deliberação: 12 horas úteis.
3. **Comitê de Risco / CFO:**
   - Variação superior a R$ 250.000,00.
   - Exigência mandatória de garantia real ou seguro garantia.

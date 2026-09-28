# Matriz de Papéis e Permissões Granulares (RBAC)
## Segregação de Privilégios DiskIngressos vs Produtor

---

### 1. Matriz de Acesso por Módulo

| Permissão | Código | Admin DiskIngressos | Financeiro DiskIngressos | Produtor Admin | Produtor Operador | Portaria Check-in |
|---|---|:---:|:---:|:---:|:---:|:---:|
| **Ver Todos os Eventos** | `eventos:read_all` | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Ver Eventos da Produtora** | `eventos:read_tenant` | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Criar e Editar Eventos** | `eventos:write` | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Ledger Global & Tesouraria** | `financeiro:global_ledger` | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Extrato do Produtor** | `financeiro:portal_produtor` | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Solicitar Repasse** | `financeiro:solicitar_repasse` | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Aprovar Repasses Bancários** | `financeiro:aprovar_repasse` | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Contabilidade & DRE Geral** | `contabilidade:read` | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Auditoria Fechamento 10 Gates** | `fechamento:read_all` | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Cash Forecast & Liquidez** | `cash_forecast:read` | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Riscos & Circuit Breakers** | `riscos:circuit_breaker` | ✅ | ✅ | ❌ | ❌ | ❌ |
| **FP&A & Centros de Custo** | `fpa:budget_manage` | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Gerenciar Todos os Usuários** | `usuarios:manage_all` | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Gerenciar Minha Equipe** | `usuarios:manage_team` | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Validação de Ingressos** | `portaria:validar_ingresso` | ✅ | ❌ | ✅ | ✅ | ✅ |

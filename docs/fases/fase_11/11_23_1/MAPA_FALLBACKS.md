# Mapa de Fallbacks e Comportamento Operacional — EDDIE 11.23.1

Este documento mapeia todas as camadas de proteção, fallbacks autorizados e proibições terminantes em cada ambiente do sistema.

## 1. Matriz de Comportamento por Método e Ambiente

| Método HTTP | Ambiente | Backend Status | Flag DEMO_MODE | Resposta do PDT Proxy | Cabeçalho `x-data-source` | Persistência Real |
|---|---|---|---|---|---|---|
| `POST` | Qualquer | Indisponível | Qualquer | **HTTP 503 Rejeitado** | `offline-write-rejected` | Nenhuma gravação |
| `PUT` | Qualquer | Indisponível | Qualquer | **HTTP 503 Rejeitado** | `offline-write-rejected` | Nenhuma gravação |
| `PATCH` | Qualquer | Indisponível | Qualquer | **HTTP 503 Rejeitado** | `offline-write-rejected` | Nenhuma gravação |
| `DELETE` | Qualquer | Indisponível | Qualquer | **HTTP 503 Rejeitado** | `offline-write-rejected` | Nenhuma gravação |
| `GET` | `production` | Indisponível | `true` ou `false` | **HTTP 503 Bloqueado** | `unconfigured-backend` ou `unavailable` | Somente leitura |
| `GET` | `development` / `test` | Indisponível | `false` | **HTTP 503 Indisponível** | `unavailable` | Somente leitura |
| `GET` | `development` / `test` | Indisponível | `true` | **HTTP 200 Dados Demo** | `mock` | Somente leitura |
| Qualquer | Qualquer | Disponível (2xx) | Qualquer | **HTTP 2xx Sucesso** | `upstream` | Persistência no Postgres |
| Qualquer | Qualquer | Upstream Erro (4xx/5xx) | Qualquer | **Status repassado (Fail-Fast)** | `upstream` | Conforme resposta do NestJS |
| Qualquer | Qualquer | Timeout de rede (>4s) | Qualquer | **HTTP 504 Timeout** | `upstream-failure` | Nenhuma gravação |

---

## 2. Inventário de Endpoints Críticos e Bloqueio de Mock
- **`/api/financeiro/repasses`**: Mutação crítica. NUNCA possui fallback. Falha de backend acarreta rejeição 503 imediata.
- **`/api/financeiro/transferencias`**: Mutação crítica de tesouraria. Proibido qualquer mock.
- **`/api/estorno/aprovar`**: Mutação de reembolso e CDC. Proibido mock.
- **`/api/eventos/:id/fechamento/gates`**: Auditoria dos 10 gates. Consulta a API real do NestJS.
- **`/api/marketing/actions`**: Remoção total do fallback fictício que retornava `{ success: true, loggedToLedger: true }`.

---

## 3. Diretriz de Fail-Fast
O proxy do Next.js NUNCA intercepta um erro 500 do NestJS para substituir por um array vazio `[]` ou objeto `{ ok: true }`. O erro da API é repassado integralmente ao cliente com o respectivo status HTTP e corpo, permitindo que a telemetria do frontend e os alertas do Datadog/Grafana registrem o incidente com fidelidade.

# Mapa de Variáveis de Ambiente e Validação Tipada — EDDIE 11.23.1

Este documento descreve a auditoria, obrigatoriedade e validação tipada das variáveis de ambiente em todo o monorepo EDDIE.

## 1. Mapeamento por Aplicação

### 1.1. Backend NestJS (`apps/api/`)
Validado via Zod em `apps/api/src/shared/config/env.validation.ts` e injetado globalmente no `ConfigModule`.

| Variável | Tipo | Obrigatória | Padrão | Finalidade |
|---|---|---|---|---|
| `NODE_ENV` | `enum('development', 'production', 'test')` | Sim | `development` | Ambiente de execução |
| `PORT` | `number` | Não | `3333` | Porta de escuta da API REST |
| `DATABASE_URL` | `string (url)` | Sim | - | Conexão PostgreSQL multi-schema |
| `REDIS_URL` | `string (url)` | Não | `redis://localhost:6379` | Cache L2, locks distribuídos e rate limiting |
| `RABBITMQ_URL` | `string (url)` | Não | `amqp://localhost:5672` | Broker AMQP para topic exchange `domain.events` |
| `CLICKHOUSE_URL` | `string (url)` | Não | `http://localhost:8123` | Read models analíticos para dashboards de alta performance |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | `string (url)` | Não | `http://localhost:4318` | Exportador de telemetria OTLP (Traces / Spans) |
| `OTEL_SERVICE_NAME` | `string` | Não | `ticketing-api` | Identificador da aplicação na telemetria |
| `JWT_SECRET` | `string` | Sim (em produção) | - | Assinatura de tokens JWT de sessão/produtor |
| `QR_SIGNING_KEY` | `string` | Sim (em produção) | - | Chave assimétrica/HMAC para assinatura de ingressos e catracas |
| `WEB_ORIGIN` | `string` | Não | `*` | Origem CORS permitida |

### 1.2. Painel do Produtor (`apps/pdt/`)
Validado tipadamente em `apps/pdt/src/lib/env.ts`.

| Variável | Tipo | Obrigatória | Padrão | Finalidade |
|---|---|---|---|---|
| `NODE_ENV` | `enum('development', 'production', 'test')` | Sim | `development` | Controle de ambiente |
| `VERCEL_ENV` | `enum('production', 'preview', 'development')` | Não | - | Ambiente de deploy na Vercel |
| `API_INTERNAL_URL` | `string (url)` | Sim (em produção) | - | URL upstream do NestJS para o proxy Server-Side |
| `NEXT_PUBLIC_API_URL` | `string` | Não | `/api` | Prefixo das rotas chamadas pelo browser (Same-Origin) |
| `PRODUTOR_ID` | `string (uuid)` | Não | - | ID do produtor logado no contexto server-side |
| `TENANT_ID` | `string (uuid)` | Não | - | ID do tenant logado |
| `DEMO_MODE` | `boolean` | Não | `false` | Ativação explícita de mock **apenas fora de produção** |
| `NEXT_PUBLIC_ALLOW_OFFLINE_MOCK` | `boolean` | Não | `false` | Permissão secundária para dev local offline |

---

## 2. Auditoria de Segurança: Zero Segredos em Arquivos Versionados
- Nenhum arquivo `.env` contendo credenciais reais ou senhas de produção é versionado no Git (`.gitignore` ativo).
- O arquivo `.env.example` na raiz e em cada app possui exclusivamente placeholders (`troque-isto-em-producao`, `postgresql://localhost:5432/...`).
- As rotas `/health` e `/ready` foram auditadas para garantir que connection strings e senhas do banco jamais sejam expostas em payloads JSON ou mensagens de erro.

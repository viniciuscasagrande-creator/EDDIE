# GEMINI.md — Contexto raiz do projeto

> Este arquivo é lido pelo Gemini Code Assist no VS Code. Mantenha-o curto, atual e
> imperativo. Cada módulo tem o seu próprio `GEMINI.md` com o contexto local.

## O que é este projeto

**DiskIngressos PDT** (Painel do Produtor) — ERP + CRM interno para a empresa de
venda de ingressos DiskIngressos. Arquitetura de **monólito modular event-driven**
(modulith): um único deploy de API, dividido em bounded contexts isolados que só
se comunicam por eventos de domínio.

## Dois frontends, um backend — NUNCA misture os dois

Este ecossistema tem duas interfaces distintas, nascendo juntas, consumindo o
mesmo backend por portas diferentes:

| | **PDT** (`apps/pdt`) | **Storefront** (`apps/storefront`) |
|---|---|---|
| Domínio | painel interno (uso da equipe) | `newdawn.diskingressos.com.br` (público) |
| Usuário | colaborador DiskIngressos, produtor | comprador final |
| Autenticação | login com papel/produtora (RBAC/ABAC) | conta de comprador ou anônimo |
| Acesso ao backend | `apps/api` completa (todos os módulos) | só `apps/api-storefront` (BFF) |
| Operações | CRUD completo: criar evento, aprovar estorno,
  configurar campanha, ver DRE... | navegar evento, montar carrinho, pagar,
  ver os próprios ingressos |

**Regra inviolável:** o Storefront NUNCA chama a API interna do PDT
diretamente, e NUNCA tem acesso de escrita a nada além de "criar meu pedido"
e "pagar meu pedido". Toda a superfície que ele usa vive em
`apps/api-storefront`, um BFF fino e **somente leitura + checkout**, que por
baixo chama as mesmas portas públicas dos módulos (`EventosPublicService`,
etc.) que o PDT usa — nunca acessa Prisma diretamente. Se um dia o
Storefront precisar de mais dado, adicione o método na porta pública do
módulo dono do dado; não abra uma rota nova batendo direto no banco.

Ao gerar qualquer código de API pensando "isso o site público vai precisar",
pare e pergunte: essa rota vai para `apps/api` (PDT) ou `apps/api-storefront`
(site)? Nunca as duas coisas no mesmo controller.

## Stack

- **Backend:** NestJS 10 + TypeScript (strict) + Prisma
- **Banco:** PostgreSQL 16, **um schema por módulo** (`multiSchema`)
- **Cache / locks / idempotência:** Redis 7
- **Mensageria:** RabbitMQ (topic exchange `domain.events`)
- **Analytics:** ClickHouse (read models dos dashboards)
- **Frontend:** Next.js 15 (App Router) + shadcn/ui + TanStack Query
- **Observabilidade:** OpenTelemetry -> Prometheus / Tempo / Loki / Grafana
- **IA:** Gemini API + pgvector (RAG do SAC)

## Regras invioláveis

1. **Nenhum módulo faz query na tabela de outro módulo.** Ou consome um evento de
   domínio, ou chama a porta pública (`<Modulo>PublicService`) exposta pelo módulo.
2. **Todo evento de domínio é publicado via Outbox**, na mesma transação do dado.
   Nunca chame `bus.publish()` direto de um service de negócio.
3. **Todo evento é versionado** (`pedido.pago.v1`) e definido em `packages/contracts`
   com Zod. Mudança breaking = nova versão, nunca edição da existente.
4. **Todo consumer é idempotente.** Use `eventId` + tabela `platform.processed_events`.
5. **Dinheiro é `Decimal`** no Prisma e inteiro em centavos nos contratos. Nunca `float`.
6. **Nada de `any`.** `strict: true` e `noUncheckedIndexedAccess: true` estão ligados.
7. **Toda escrita em Financeiro, Contabilidade e Estorno gera audit log** imutável.
8. Datas em UTC, ISO 8601. O fuso de exibição é responsabilidade do frontend.
9. **Repositório oficial exclusivo: GitHub (`origin`).** Nunca fazer push para GitLab. O projeto e a esteira de CI/CD da Vercel operam exclusivamente sobre o repositório GitHub (`origin/main`).
10. **Commits, Git e Pushes Automáticos Autorizados (Regra Geral Fixada):** O usuário autorizou expressamente como regra geral e definitiva a realização autônoma de commits, operações de git e pushes automáticos para o repositório oficial no GitHub (`origin/main`) para todo o projeto EDDIE, sempre que as fases, módulos e melhorias forem homologados com suíte de testes 100% verde (`pnpm test`), typecheck/lint sem erros (`pnpm lint`), sincronia arquitetural verificada (`pnpm check:architecture`) e build completo dos pacotes e apps (`pnpm build`), passando pelas validações do pipeline de CI/CD (`.ci/workflows/ci.yml`), sem necessidade de confirmações manuais adicionais.

## Estrutura

```
apps/api/src/modules/<modulo>/       # bounded context (tem seu próprio GEMINI.md)
apps/api-storefront/                 # BFF público — só leitura + checkout, sem Prisma direto
apps/pdt/src/app/(<modulo>)/         # painel interno — route group + dashboard do módulo
apps/storefront/                     # newdawn.diskingressos.com.br — site público (Next.js)
packages/contracts/                  # eventos de domínio (Zod) — fonte da verdade
```

## Módulos Ativos no Backend (`apps/api/src/modules/`)

| Módulo | Schema Postgres | Responsabilidade |
|---|---|---|
| `eventos` | `eventos` | Catálogo de eventos, sessões, setores, lotes, precificação e produtores |
| `pedidos` | `pedidos` | Criação e gestão de pedidos, ingressos gerados e checkout |
| `portaria` | `platform` / `pedidos` | Controle de acesso, catracas, validação de ingressos e check-in |
| `comercial` | `crm` | CRM B2B de produtores, oportunidades, condições comerciais e metas |
| `financeiro` | `financeiro` | EDDIE 11.19/11.20: Ledger imutável, conta gráfica, repasses, split, conciliação e Control Tower |
| `contabilidade` | `contabilidade` | EDDIE 11.21: Plano de contas, lançamentos por partidas dobradas, balancete e DRE |
| `revenue-assurance` | `platform` / `financeiro` | EDDIE 11.22: Garantia de receita, matriz de integridade ponta a ponta e detecção de anomalias |
| `producer-portal` | `financeiro` / `platform` | EDDIE 11.23: Portal do Produtor, extratos, saldos, agenda de repasses e autoatendimento |
| `operacao` | `platform` / `eventos` | EDDIE 11.18: Command Center operacional, monitor de alertas, incidentes e SLA |
| `relatorios` | `financeiro` / `eventos` | Relatórios consolidados, DRE gerencial por evento e exportações analíticas |
| `estorno` | `estorno` | Máquina de estados de reembolso, CDC e chargeback |
| `marketing` | `marketing` | Campanhas, links UTM, conversões, tracking CAPI multi-pixel e jornadas |
| `sac` | `sac` | Chamados ITIL, SLA, fila de atendimento e inteligência artificial |
| `suporte` | `suporte` | Suporte operacional de campo e atendimento no evento |
| `dashboard` | `platform` | Super Dashboard & Centro de Comando 360º Agregador Executivo (BFF) |
| `event-closing` | `eventos` / `financeiro` | EDDIE 11.24: Fechamento de eventos, auditoria de 10 gates, settlement e dossiê imutável |
| `cash-forecast` | `financeiro` / `platform` | EDDIE 11.26: Cash Forecast, Liquidez, Capital de Giro e Backtesting |
| `financial-risk` | `financeiro` / `platform` | EDDIE 11.27: Financial Risk, Controls & Exposure OS (Scoring, Limites, Circuit Breakers, HHI e Stress Test) |
| `financial-planning` | `financeiro` / `platform` | EDDIE 11.28: FP&A, Budgeting, Centros de Custo, Margens e Projeção Plurianual |
| `usuarios` | `platform` / `financeiro` | EDDIE 11.29 / 11.34: Gestão de Usuários, RBAC com Escopo Multi-Tenant, Segurança Transversal, Antifraude de Pagamentos e Ingressos, Quarentena Bancária de 24h, SoD e Central de Investigações |
| `tesouraria` | `financeiro` / `platform` | EDDIE 11.25: Banking Engine, PIX Direto, Remessas CNAB 240/400 e Liquidação de Tesouraria |
| `inventario` | `inventario` | EDDIE 11.29.2: Motor de Inventário, InventoryPools, Holds com TTL de 10 min, alocação de assentos e anti-oversell |
| `pagamentos` | `pagamentos` | EDDIE 11.29.3: Núcleo de Pagamentos, PaymentIntent, PIX Direto, Webhooks de Adquirentes e Conciliação Financeira |
| `pos-evento` | `posevento` | EDDIE 11.29.5: Pós-Evento, Presença Real da Portaria, Histórico de Relacionamento, Consentimento LGPD, Segmentação e Pesquisas |
| `inteligencia` | `inteligencia` | EDDIE 11.30: Rentabilidade Real, Inteligência de Receita e Inteligência do Produtor |
| `governanca` | `governanca` | EDDIE 11.31: Central de Dados, Qualidade dos Dados, Conciliação Sistêmica, Central de Divergências, Linhagem & Rastreabilidade, Catálogo Corporativo e Auditoria Central Imutável |
| `automacoes` | `automacoes` | EDDIE 11.32: Automação Operacional, Motor Central de Regras (QUANDO/SE/ENTÃO combinados, versionamento, dry-run, kill-switch) e Motor Central de Aprovações (SoD, alçadas, contexto analítico, fluxos) |
| `documentos` | `documentos` | EDDIE 11.35: Documentos, Contratos, Assinatura Digital, Dossiê Operacional do Evento (17 seções), Modelos e Evidências |

## Módulos Planejados / Reservados (Evolução Futura)

| Módulo | Schema | Status |
|---|---|---|
| `remarketing` | `marketing` | No frontend possui telas dedicadas; no backend é atendido pelo módulo `marketing` (jornadas/públicos) |
| `developer` | `platform` | Infraestrutura central de Outbox e telemetria hoje reside em `apps/api/src/shared/` |

## Ordem de geração de código (siga sempre)

contrato (Zod) -> schema Prisma -> service -> controller -> teste -> cliente tipado -> tela.

## Comandos

```bash
pnpm dev          # sobe api + web
pnpm db:migrate   # prisma migrate dev
pnpm db:studio    # prisma studio
pnpm test         # vitest
pnpm lint
```

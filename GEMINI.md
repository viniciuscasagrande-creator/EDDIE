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

## Estrutura

```
apps/api/src/modules/<modulo>/       # bounded context (tem seu próprio GEMINI.md)
apps/api-storefront/                 # BFF público — só leitura + checkout, sem Prisma direto
apps/pdt/src/app/(<modulo>)/         # painel interno — route group + dashboard do módulo
apps/storefront/                     # newdawn.diskingressos.com.br — site público (Next.js)
packages/contracts/                  # eventos de domínio (Zod) — fonte da verdade
```

## Módulos

| Módulo | Schema | Responsabilidade |
|---|---|---|
| `eventos` | `eventos` | Evento, sessão, mapa de assentos, lotes, produtores |
| `inventario` | `inventario` | Reserva com TTL, carrinho, cupons |
| `pagamentos` | `pagamentos` | Pix, cartão, boleto, split, antifraude |
| `acesso` | `acesso` | QR assinado, check-in, catracas |
| `crm` | `crm` | Clientes, segmentos, pipeline B2B |
| `financeiro` | `financeiro` | AP/AR, conciliação, repasse ao produtor |
| `contabilidade` | `contabilidade` | Plano de contas, lançamentos, NFS-e, SPED |
| `marketing` | `marketing` | Campanhas, UTM, atribuição |
| `remarketing` | `remarketing` | Carrinho abandonado, reengajamento |
| `sac` | `sac` | Chamados ITIL, SLA, IA (RAG) |
| `estorno` | `estorno` | Máquina de estados de reembolso e chargeback |
| `developer` | `platform` | Telemetria, outbox, flags, audit, custo |

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

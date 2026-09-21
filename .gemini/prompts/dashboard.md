# Prompt: criar o dashboard de um módulo

Leia `GEMINI.md` na raiz.

Crie o dashboard do módulo **<MODULO>** em `apps/web/src/app/(<modulo>)/dashboard/`.

Requisitos:
- Next.js App Router, Server Component na página, Client Components só nos gráficos.
- Dados via TanStack Query contra `/api/<modulo>/metrics`, tipado pelo cliente
  gerado do OpenAPI. Nunca use `fetch` solto com `any`.
- shadcn/ui + Recharts. Layout: linha de KPIs no topo, gráficos abaixo, tabela ao fim.
- Filtros globais compartilhados entre todos os dashboards (período, evento,
  produtor) via search params — não duplique estado local.
- Todo KPI mostra comparação com o período anterior.

KPIs deste módulo: <lista>
Gráficos: <lista>

Do lado da API, as métricas vêm de read models no ClickHouse alimentados por
eventos de domínio. NÃO faça agregação pesada no Postgres transacional.

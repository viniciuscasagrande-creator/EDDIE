# EDDIE 10.7 — Frente A: Integração Real + Hardening

Base: EDDIE 10.6 HOMOLOGADO.

## Objetivo
Eliminar a diferença entre arquivos homologados e deploy, tornando explícito e diagnosticável o caminho Frontend Next.js → Proxy /api → Backend NestJS → Prisma/Postgres.

## Entregas
- Proxy Next.js normaliza `API_INTERNAL_URL` com ou sem `/api`.
- Timeout do proxy ampliado para 5 s e respostas 503 descritivas.
- `GET /api/status` no frontend testa configuração, alcance do backend e health.
- `GET /api/health` no NestJS testa processo + Prisma/Postgres.
- `GET /api/health/live` testa apenas processo da API.
- Tela `/diagnostico` para operação e homologação.
- Contexto Produtor × Evento não usa UUID fictício em produção.
- Erro de produtor ausente fica explícito; não permanece em loading infinito.
- Timeout do seletor global, Financeiro e Contabilidade ampliado para 5 s.
- `.env.example` corrigido para o modelo real de produção.
- `scripts/preflight-front-a.mjs` valida arquivos críticos e registro de módulos antes do deploy.
- Central `/relatorios` e Contabilidade 10.5 preservadas integralmente.

## Variáveis obrigatórias na Vercel do PDT
```env
API_INTERNAL_URL=https://SEU-BACKEND
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_PRODUTOR_ID=UUID_REAL_DO_PRODUTOR
```

`API_INTERNAL_URL` pode ser `https://backend.exemplo.com` ou `https://backend.exemplo.com/api`; o proxy normaliza os dois formatos.

## Homologação mínima
1. `node scripts/preflight-front-a.mjs`
2. `pnpm install`
3. `pnpm db:generate`
4. `pnpm --filter @ticketing/api build`
5. `pnpm --filter @ticketing/pdt build`
6. Abrir `/api/status` e exigir `status: ok`.
7. Abrir `/diagnostico` e exigir Frontend, Proxy, Backend e Banco online.
8. Abrir `/relatorios`, `/financeiro` e `/contabilidade`.
9. Confirmar que o seletor global lista eventos reais do produtor.

## Regra de Go-Live
Não mascarar falhas com mocks, IDs fictícios, métricas artificiais ou loading infinito. Se API, banco ou contexto não estiverem configurados, mostrar erro operacional acionável.

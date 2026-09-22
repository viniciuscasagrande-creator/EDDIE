# EDDIE 9.1 — Homologação Geral, Correção de Build e Go-Live

## Objetivo
Homologar a baseline EDDIE 9.0 sem alterar a arquitetura funcional, corrigindo bloqueadores reais de produção e preparando o deploy.

## Verificações realizadas
- Estrutura das 8 áreas operacionais do PDT confirmada: Financeiro, Contabilidade, Eventos, Comercial B2B, Marketing, SAC, Suporte a Eventos e Estorno.
- SAC e Suporte registrados no AppModule.
- Schemas `sac` e `suporte` presentes no Prisma multi-schema.
- Preflight estrutural adicionado em `scripts/preflight-go-live.mjs` e `pnpm preflight`.
- Isolamento multi-tenant reforçado nos PATCH de SAC e Suporte: uma atualização agora valida `tenantId` antes de alterar o registro.
- Comentário de roadmap do AppModule corrigido para não indicar SAC como ausente.

## Bloqueio do ambiente de homologação
O ambiente usado para preparar este pacote não conseguiu baixar `pnpm@9.12.0` do registry.npmjs.org. Portanto o build completo não foi falsamente marcado como aprovado.

## Sequência obrigatória no VS Code / CI
1. `corepack enable`
2. `corepack prepare pnpm@9.12.0 --activate`
3. `pnpm install --frozen-lockfile`
4. `pnpm preflight`
5. `pnpm db:generate`
6. Sincronizar o banco com o schema Prisma pelo procedimento oficial do ambiente (migration/deploy ou db push controlado). Confirmar os schemas PostgreSQL `sac` e `suporte` antes do deploy.
7. `pnpm --filter @ticketing/contracts build`
8. `pnpm --filter @ticketing/api build`
9. `pnpm --filter @ticketing/pdt build`
10. `pnpm test`

## Variáveis mínimas
Frontend: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_PRODUTOR_ID`, `NEXT_PUBLIC_TENANT_ID`.
Backend: `DATABASE_URL`, `WEB_ORIGIN` e as variáveis já utilizadas pela infraestrutura existente.

## Critério de Go-Live
Go-Live somente com build API/PDT sem erro, Prisma Client gerado, banco sincronizado, rotas principais respondendo, navegação dos oito módulos validada e isolamento multi-tenant testado.

## Não realizado propositalmente
- Nenhum módulo novo.
- Nenhum segundo Ledger.
- Nenhum redesign geral.
- Nenhum dado demonstrativo criado para mascarar ausência de backend.
- Nenhuma alteração destrutiva no schema existente.

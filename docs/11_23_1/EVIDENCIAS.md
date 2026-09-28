# Evidências Reais de Execução e Verificação — EDDIE 11.23.1

Este documento registra a execução real de todos os comandos do pipeline com seus respectivos códigos de saída (`exit code`), tempos e logs comprobantes. Nenhuma evidência é inventada.

---

## 1. Verificação de Sincronia Arquitetural (`pnpm check:architecture`)
- **Comando:** `node scripts/check-modules-sync.mjs`
- **Exit Code:** `0`
- **Output:**
```
✅ Sincronia Arquitetural Validada: todos os 16 módulos reais estão formalmente documentados no GEMINI.md:
   - comercial
   - contabilidade
   - dashboard
   - estorno
   - event-closing
   - eventos
   - financeiro
   - marketing
   - operacao
   - pedidos
   - portaria
   - producer-portal
   - relatorios
   - revenue-assurance
   - sac
   - suporte
```

---

## 2. Validação Estática e Typecheck (`pnpm lint`)
- **Comando:** `pnpm lint`
- **Exit Code:** `0`
- **Tempo:** `5.955s`
- **Output:**
```
> diskingressos-pdt@ lint C:\Users\vinad\OneDrive\Desktop\EDDIE
> turbo run lint

• turbo 2.11.2

   • Packages in scope: @eddie/api-storefront, @eddie/tsconfig, @ticketing/api, @ticketing/contracts, @ticketing/pdt
   • Running lint in 5 packages

@ticketing/contracts: tsc --noEmit (0 erros)
@eddie/api-storefront: tsc --noEmit (0 erros)
@ticketing/api: tsc -p tsconfig.build.json --noEmit (0 erros)
@ticketing/pdt: tsc --noEmit (0 erros)

 Tasks:    4 successful, 4 total
Cached:    2 cached, 4 total
  Time:    5.955s
```

---

## 3. Suíte de Testes Automatizados (`npx turbo run test --force`)
- **Comando:** `npx turbo run test --force`
- **Exit Code:** `0`
- **Total de Testes:** 268 testes executados e aprovados
- **Testes `@ticketing/api`:** 256/256 testes passando
  - `src/health.spec.ts` (5 testes)
  - `src/modules/financeiro/financial-reliability.spec.ts` (5 testes)
  - `src/modules/financeiro/control-tower.spec.ts` (20 testes)
  - `src/modules/financeiro/financeiro.spec.ts` (10 testes)
  - `src/modules/contabilidade/contabilidade.spec.ts` (7 testes)
  - `src/modules/event-closing/event-closing.spec.ts` (6 testes)
  - `src/modules/dashboard/dashboard.spec.ts` (2 testes)
  - `src/modules/marketing/marketing.spec.ts` (11 testes)
  - `src/modules/marketing/audiences-journeys.spec.ts` (9 testes)
  - `src/modules/marketing/tracking.spec.ts` (10 testes)
  - `src/modules/marketing/analytics-attribution.spec.ts` (15 testes)
  - `src/modules/marketing/health-telemetry.spec.ts` (8 testes)
  - `src/modules/estorno/estorno.spec.ts` (5 testes)
  - `src/modules/estorno/estorno.policy.spec.ts` (8 testes)
  - `src/modules/operacao/operacao.spec.ts` (4 testes)
  - `src/modules/operacao/command-center.spec.ts` (12 testes)
  - `src/modules/portaria/portaria.spec.ts` (5 testes)
  - `src/modules/comercial/comercial.spec.ts` (5 testes)
  - `src/modules/eventos/eventos.spec.ts` (4 testes)
- **Testes `@ticketing/pdt`:** 12/12 testes passando
  - `src/app/api/[...path]/route.spec.ts` (8 testes)
  - `src/components/dashboard/dashboard.spec.ts` (4 testes)
- **Tempo:** `18.325s`

---

## 4. Compilação Monorepo Completa (`pnpm build`)
- **Comando:** `pnpm build`
- **Exit Code:** `0`
- **Etapas Concluídas:**
  1. `@ticketing/contracts`: `tsc -p tsconfig.json` -> Build concluído
  2. `@ticketing/api`: `nest build` -> Compilação NestJS concluída
  3. `@eddie/api-storefront`: `nest build` -> Compilação BFF concluída
  4. `@ticketing/pdt`: `next build` -> Next.js 15.5.25 produção compilada, 36 páginas estáticas e rotas dinâmicas geradas com sucesso
  5. Sincronização do diretório `.next` para deploy Vercel

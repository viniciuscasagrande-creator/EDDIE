# EDDIE 11.15.5 — Build + Release Gate + Deploy Limpo

## Escopo
Unificar build-info, remover versões hardcoded antigas, validar Prisma/migrations, typecheck, lint, testes, builds API/PDT, smoke, health/readiness, envs, rollback e runbook. Preparar deploy sem executá-lo.

## Regras
- UI 100% pt-BR.
- Preservar funções e arquitetura existente.
- Uma fonte de contexto Produtor → Evento → Sessão.
- Não duplicar AppShell/router/sidebar/navegação.
- Não mascarar bugs com CSS nem números fictícios.
- REAL, META e PROJEÇÃO distintos quando aplicável.
- Não alterar Ledger para satisfazer dashboard.
- Falha parcial deve ter estado visual.
- Sem reset/teste destrutivo em produção.
- Sem push/deploy sem autorização explícita.

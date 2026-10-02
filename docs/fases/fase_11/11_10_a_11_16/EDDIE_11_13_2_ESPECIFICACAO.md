# EDDIE 11.13.2 — Performance + Banco + APIs + Frontend

## Objetivo
Medir antes de otimizar. Auditar queries, N+1, índices, paginação, payloads, cache seguro, bundles, lazy loading, gráficos, tabelas e realtime. Registrar baseline e reteste. Cache não pode romper isolamento nem tornar saldo/estoque incorreto.

## Regras obrigatórias
- Preservar regras de negócio e UX anteriores.
- UI 100% pt-BR.
- Isolamento Produtor → Evento → Sessão.
- Nunca expor secrets/tokens/PII desnecessária.
- Nunca `prisma migrate reset` em produção.
- Nunca executar stress destrutivo em produção.
- Não remover validações/módulos para testes passarem.
- Não inventar capacidade ou performance.
- Baseline e reteste obrigatórios quando mensurável.
- Preservar build-info e correlationId.
- Sem push/deploy sem autorização.

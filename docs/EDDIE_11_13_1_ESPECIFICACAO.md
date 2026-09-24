# EDDIE 11.13.1 — Segurança Enterprise + RBAC + Isolamento de Dados

## Objetivo
Reforçar autenticação, autorização, RBAC, tenant isolation e escopo Produtor→Evento→Sessão. Revisar APIs, realtime, exports, relatórios, webhooks, secrets, sessões, dispositivos, PII/LGPD e auditoria. Criar testes negativos de acesso cruzado.

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

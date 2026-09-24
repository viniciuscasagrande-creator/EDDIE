# EDDIE 11.13.5 — Stress Test + Homologação Enterprise

## Objetivo
Executar matriz final de segurança, carga, concorrência, resiliência e recuperação em staging. Consolidar achados por severidade com evidência/correção/reteste. Capacidade declarada somente a observada. Gate: zero críticos; altos essenciais resolvidos antes do 11.14.

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

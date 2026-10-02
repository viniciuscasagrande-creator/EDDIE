# EDDIE 11.23.1 — PRODUCTION TRUTH, RELIABILITY & GLOBAL RECOVERY

1. Audite `apps/pdt/src/app/api/[...path]/route.ts`, `handleAutonomousStore()`, mocks/fallbacks/demo, NestJS, Prisma, banco, migrations e envs reais.
2. Produção: proibir fallback fictício. Demo somente por flag explícita fora de produção. POST/PUT/PATCH/DELETE nunca simulam sucesso.
3. Padronize HTTP/códigos: BACKEND_UNAVAILABLE, BACKEND_TIMEOUT, DATABASE_UNAVAILABLE, UPSTREAM_ERROR, VALIDATION_ERROR, UNAUTHORIZED, FORBIDDEN, CONFLICT, NOT_FOUND + correlationId.
4. Implemente/audite `/health` e `/ready` com Prisma/banco e dependências críticas, sem segredos.
5. Comprove PDT→NestJS→Service→Prisma→Banco→nova leitura. Mutação crítica só confirma após persistência.
6. UI pt-BR: Carregando, Sem dados, Indisponível, Erro de conexão, Sem permissão, Dados desatualizados, Falha na gravação, Sucesso confirmado. Nunca trocar erro por zero/mock.
7. Audite API_INTERNAL_URL, BACKEND_URL, API_URL, DATABASE_URL e equivalentes. Validação tipada; `.env.example` sem segredos.
8. CI: install→lint→typecheck→unit→integration→build; E2E/smoke conforme infraestrutura. Gate crítico bloqueia deploy.
9. Testes: pedido/pagamento, taxa fixa/%, snapshot/versionamento, Ledger/idempotência, saldo, transferência, settlement, payout, banco, conciliação, estorno, chargeback, contabilidade.
10. Procure `ok:true`, `success:true`, toasts e 200/201. Toda mutação depende de confirmação real.
11. RBAC backend/frontend; Produtor só acessa seus eventos. Teste producerId/eventId/URL/body/export/document/cache manipulados.
12. Remarketing: mapear Tela→Ação→Endpoint→Service→Persistência. Ausência de backend nunca é preenchida por fallback falso.
13. Reduza `any` prioritariamente em Financeiro→Contabilidade→proxy/API crítica→Remarketing.
14. Audite Prisma schema×migrations; não substituir migration de produção por `db push` silencioso.
15. Refatore hotspots somente progressivamente e com testes de caracterização.
16. Sincronize GEMINI.md/README/arquitetura com código real: Documentado|Implementado|Testado|Deployado|Observado em produção.
17. Telemetria: correlationId, rota, status, latência, dependência, ambiente e versão; sem segredos/PII desnecessária.
18. Teste: backend off, DB off, timeout, 500, payload inválido, env ausente, sessão expirada, cross-producer, double click, retry, cache antigo, migration pendente.
19. Corrija no escopo telas brancas, botões mortos, contraste, overflow e responsividade.
20. Gere RELATORIO_FINAL, DIAGNOSTICO_ANTES/DEPOIS, MAPA_FALLBACKS, MAPA_ENV, MATRIZ_ENDPOINTS.csv, MATRIZ_TESTES.csv, MATRIZ_RBAC.csv, REMARKETING_REAL, EVIDENCIAS e PENDENCIAS.
21. Execute comandos reais e registre comando + exit code. Não invente evidência.
22. Estados: IMPLEMENTADO, TESTADO LOCALMENTE, VALIDADO EM STAGING, VALIDADO EM PRODUÇÃO, HOMOLOGADO.
23. Só HOMOLOGADO sem P0/P1 crítico aberto.
24. NÃO faça push/deploy sem autorização explícita.

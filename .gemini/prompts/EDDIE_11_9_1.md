# EXECUÇÃO EDDIE 11.9.1 — GO-LIVE REAL

Objetivo: publicar EXATAMENTE o EDDIE 11.9 homologado, identificável como 11.9.1.

Leia `EDDIE_11_9_1_GO_LIVE_REAL_CORRECAO_DEPLOY.md` e `docs/EDDIE_11_9_1_CHECKLIST_GO_LIVE.md`.

1. Descubra package manager/workspaces e comandos reais do repositório; não invente.
2. Verifique git remote, branch, upstream, SHA e status.
3. Confirme que .env/secrets não estão versionados.
4. Audite vercel.json/package.json/root directory para garantir que o PDT correto é construído.
5. Integre `EDDIE_BUILD` ao endpoint `/api/build-info` EXISTENTE. Se já existir build-info, ALTERE-O; não crie endpoint duplicado.
6. O build-info deve retornar version=11.9.1, marker=EDDIE-11.9.1-GOLIVE e, quando disponíveis, VERCEL_GIT_COMMIT_SHA, VERCEL_GIT_COMMIT_REF e VERCEL_DEPLOYMENT_ID/URL.
7. Verifique migrations 11.8/11.9. Em produção use somente estratégia segura (`prisma migrate deploy` ou equivalente existente). NUNCA reset.
8. Rode Prisma validate/generate.
9. Rode build/typecheck/test da API.
10. Rode build/typecheck/test do PDT.
11. Confirme fisicamente as páginas Portaria, Antifraude, Conciliação e Estorno/Chargeback e os links no menu.
12. Rode `node scripts/verify-go-live-11-9-1.mjs`.
13. Corrija erros reais sem apagar funcionalidades.
14. Antes de produção, informe branch + SHA + comandos executados.
15. Só faça push/deploy se o usuário já tiver autorizado esse fluxo no ambiente. Caso contrário, pare pronto para deploy.
16. Depois do deploy, execute `node scripts/smoke-production-11-9-1.mjs <URL_PRODUCAO>`.
17. Só declare HOMOLOGADO se `/api/build-info` retornar marker/version corretos e smoke tests passarem.

PROIBIDO:
- publicar build antiga;
- remover módulo para build passar;
- esconder falha de migration;
- imprimir secrets;
- resetar banco de produção;
- afirmar homologação sem build-info.

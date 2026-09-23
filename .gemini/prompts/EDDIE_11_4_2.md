# EDDIE 11.4.2 — EXECUÇÃO OBRIGATÓRIA
Não recrie telas e não remova funcionalidades. Preserve o Event OS.
1. Use este pacote como fonte de verdade.
2. Confirme Sidebar = `Todos os Eventos`.
3. Rode `corepack enable`, `pnpm install --frozen-lockfile`, build contracts e PDT.
4. Faça commit de TODO o conteúdo alterado.
5. Confirme no Vercel que Production usa o mesmo repo, branch e Root Directory esperados.
6. Após deploy, abra `/api/build-info`. Só considere concluído se `marker` for `EDDIE-11.4.2-EVENT-OS` e `commit` corresponder ao commit implantado.
7. Rode `node scripts/verify-deploy-11-4-2.mjs https://viniciuscasagrande-creator-eddie.vercel.app`.
8. Se o marker não aparecer, NÃO altere React: corrija vínculo repo/branch/projeto/domínio na Vercel.

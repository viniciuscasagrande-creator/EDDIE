# Implantação EDDIE 10.8
1. NÃO substituir o Design System do EDDIE.
2. Preservar Financeiro, Contabilidade, Relatórios e integrações 10.7.
3. Instalar este pacote sobre a base 10.7.
4. Confirmar no menu lateral dois menus independentes: Marketing e Remarketing.
5. Executar pnpm install, pnpm db:generate, build da API e build do PDT.
6. Corrigir qualquer erro de TypeScript sem remover telas/rotas.
7. Testar GET /api/marketing/video/marketing/painel?produtorId=<UUID>.
8. Testar GET /api/marketing/video/remarketing/painel?produtorId=<UUID>.
9. Testar todas as rotas listadas no catálogo.
10. Não inserir mocks para fazer os cards parecerem preenchidos.

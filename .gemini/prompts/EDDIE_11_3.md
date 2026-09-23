# EDDIE 11.3
Aplique este pacote sobre a baseline atual sem reconstruir o projeto.
1. Preserve integralmente Ledger, Prisma, eventos, contexto, Marketing/Remarketing 10.9 e bootstrap 11.2.
2. Execute pnpm install, pnpm db:generate, build API e build PDT.
3. Corrija erros reais de TypeScript/import/rota; não remova funcionalidades para fazer o build passar.
4. Valide /api/bootstrap, /api/status, /api/operacao/status e /operacao.
5. Valide Financeiro, Contabilidade, Marketing, Remarketing e Relatórios com o mesmo produtor/evento.
6. Proibido criar mocks, tenant fictício, produtor fictício ou evento fictício.
7. Entregue log objetivo das rotas testadas e do build.

# EDDIE 9.13 — Homologação Enterprise e Produção

## Gates obrigatórios
1. Instalação limpa de dependências.
2. Prisma validate + generate + migrations controladas.
3. Build contracts.
4. Build API.
5. Build PDT.
6. Testes unitários/integrados existentes.
7. Smoke test de todas as rotas do menu.
8. Nenhuma tela branca.
9. Nenhum botão operacional sem ação.
10. Nenhum loading infinito.
11. Nenhum KPI hardcoded no fluxo de produção.
12. Tenant/produtor/evento isolados.
13. Permissões negativas testadas.
14. Responsividade desktop/tablet/mobile.
15. Contraste, foco, teclado e estados de erro revisados.
16. Logs sem segredos/PII desnecessária.
17. Backup e rollback definidos antes da migration/deploy.

## Smoke routes
`/`, `/eventos`, `/financeiro`, `/contabilidade`, `/estorno`, `/comercial`, `/marketing`, `/sac`, `/suporte-eventos`.

## Go-Live
Somente aprovar quando frontend, API e banco da mesma versão estiverem implantados e os fluxos críticos tiverem sido executados com dados controlados.

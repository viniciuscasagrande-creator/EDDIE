# EXECUÇÃO EDDIE 11.1
Use este pacote como evolução direta do EDDIE 11.0 HOMOLOGADO.

1. Não remova módulos, dashboards, Ledger, Prisma ou rotas existentes.
2. Configure API_INTERNAL_URL, PRODUTOR_ID e TENANT_ID no ambiente de produção.
3. Execute geração Prisma e builds API/PDT.
4. Valide /api/status, /api/context e /diagnostico.
5. O Header deve sempre terminar em: evento selecionado, lista vazia ou erro explícito. Nunca loading infinito.
6. Valide troca de evento em Marketing, Remarketing, Financeiro, Contabilidade e Relatórios.
7. Não criar dados fictícios, produtor fictício ou fallback cross-tenant.
8. Corrija erros reais de TypeScript/build sem remover funcionalidade.
9. Gere relatório final com build, rotas, variáveis e testes realizados.

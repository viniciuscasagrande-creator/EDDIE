# EXECUTAR EDDIE 10.9
Use este pacote como base cumulativa. Não recrie a arquitetura.

1. Execute builds de API e PDT e corrija erros reais sem remover funcionalidades.
2. Valide os dashboards em /marketing, /remarketing, /financeiro e /contabilidade.
3. Todos os gráficos devem usar dados reais já retornados pelos endpoints/Prisma/Ledger.
4. Não inserir mocks, números fixos, arrays demonstrativos ou fallback financeiro fictício.
5. Confirme que os atalhos de Financeiro e Contabilidade alteram a área operacional correta.
6. Confirme que os atalhos de Marketing/Remarketing abrem as rotas correspondentes.
7. Teste mudança de produtor/evento e recarregamento dos dados.
8. Preserve Ledger, Prisma, tenantId/produtorId/eventoId e os módulos já homologados.
9. UI 100% pt-BR; não usar o termo “360”.
10. Gere relatório final com build, rotas, endpoints, erros corrigidos e itens que dependem de credenciais externas.

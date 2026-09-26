# EDDIE 11.22 — REVENUE ASSURANCE & FINANCIAL INTEGRITY OS

MISSÃO: criar a camada de garantia de receita e integridade financeira ponta a ponta.

1 Audite 11.18, 11.19, 11.20, 11.21, schema Prisma, APIs, Ledger, gateways, settlement e banco.
2 NÃO duplique fontes. 11.22 é camada de cruzamento, detecção, investigação e evidência.
3 Construa cadeia Evento/Ingresso→Pedido→Pagamento→Gateway→Taxa→Ledger→Saldo→Settlement→Repasse→Banco→Contabilidade.
4 Crie Dashboard Revenue Assurance com cobertura explícita da análise.
5 Crie Matriz de Integridade com drill-down da cadeia.
6 Implemente Motor de Regras versionado/auditável.
7 Audite integridade das Taxas Disk por evento, inclusive snapshot/versionamento.
8 Audite Ledger: origem, idempotência, duplicidade, compensações e correlationId.
9 Audite Estornos e Chargebacks ponta a ponta.
10 Audite Transferências entre Eventos.
11 Audite Settlement/Repasses/Banco.
12 Trate precisão monetária/arredondamento conforme política real do projeto.
13 Crie Central de Casos Revenue Assurance.
14 Crie Monitor de Integridade incremental + varredura por período + revalidação.
15 Fonte indisponível reduz cobertura; nunca apresentar falso 100% de integridade.
16 Crie Inteligência de Receita baseada em evidências e população declarada.
17 Crie relatórios e exportações reais.
18 Integre alertas ao 11.18; correções operacionais devem ocorrer em 11.19/11.20; confrontar 11.21 sem alterar sua origem.
19 11.22 NUNCA paga, transfere saldo, altera taxa, edita Ledger ou cria ajuste financeiro automaticamente.
20 RBAC frontend/backend e isolamento Produtor×Evento.
21 UI 100% pt-BR.
22 Corrija botões mortos, telas brancas, rotas, modais, overflow, contraste e responsividade no escopo.
23 Sem mocks/números fictícios em produção.
24 Execute todos cenários docs/17_E2E.md.
25 Rode typecheck, lint, unit, integration, E2E, build e smoke.
26 Gere:
 docs/EDDIE_11_22_RELATORIO_FINAL.md
 docs/EDDIE_11_22_MATRIZ_INTEGRIDADE.csv
 docs/EDDIE_11_22_REGRAS_ASSURANCE.md
 docs/EDDIE_11_22_CASOS.md
 docs/EDDIE_11_22_COBERTURA.md
 docs/EDDIE_11_22_DIVERGENCIAS.md
 docs/EDDIE_11_22_EVIDENCIAS_E2E.md
27 Só marcar HOMOLOGADO sem falha crítica e com cobertura explicitamente documentada.
28 NÃO faça push/deploy sem autorização explícita.

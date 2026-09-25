# EDDIE 11.21 — ACCOUNTING & FISCAL INTELLIGENCE OS
1 Audite Contabilidade/Financeiro/Ledger/Prisma/APIs existentes. NÃO crie segundo Ledger financeiro.
2 Reutilize modelo contábil real.
3 Dashboard Contábil.
4 Plano de Contas hierárquico/versionado.
5 Motor Classificação determinístico/versionado; sem regra→Pendências.
6 Lançamentos rastreáveis/equilibrados conforme modelo.
7 Preservar intermediação: receita Disk ≠ recursos produtor.
8 Competência/receita diferida SOMENTE quando política configurada exigir.
9 Conciliação Ledger Financeiro×Contabilidade.
10 Diário, Razão, Balancete, DRE Contábil e Gerencial.
11 Fechamento Mensal + Evento; fechado bloqueia alteração destrutiva; reabertura autorizada/auditada.
12 Central Pendências + Documentos/Evidências.
13 Exportação contador/integração sem inventar layout fiscal.
14 Inteligência Contábil baseada em evidência; não lançar automaticamente.
15 Integrar 11.19 fatos, 11.20 dossiê/operação, 11.21 contabilidade. Nunca editar retroativamente Ledger 11.19.
16 UI pt-BR + RBAC frontend/backend + isolamento Produtor×Evento.
17 Corrija telas brancas/botões/rotas/modais/contraste/overflow/responsividade.
18 Sem mocks/números fictícios.
19 Não inventar tributo, alíquota, obrigação fiscal, SPED/layout ou tratamento jurídico não documentado.
20 E2E completo conforme docs/API_E2E.md.
21 Rode typecheck/lint/unit/integration/E2E/build/smoke.
22 Gere RELATORIO_FINAL, MAPA_CONTABIL, PLANO_CONTAS, REGRAS_CLASSIFICACAO, CONCILIACAO, FECHAMENTO e EVIDENCIAS_E2E.
23 Só HOMOLOGADO sem falha contábil crítica. NÃO faça push/deploy sem autorização.

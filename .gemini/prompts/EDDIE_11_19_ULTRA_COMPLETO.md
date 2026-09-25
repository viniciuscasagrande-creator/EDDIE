# EDDIE 11.19 — CAMADA FINANCEIRA ESPECIALIZADA — ULTRA COMPLETO

MISSÃO: transformar o 11.19 no domínio financeiro especializado completo do EDDIE.

1 Leia relatório do 11.18 e audite TODO Financeiro/Contabilidade/Ledger/Prisma/APIs/jobs existentes.
2 Não crie segundo Ledger, segundo saldo ou módulos duplicados.
3 Implemente menu financeiro completo conforme docs/00_ESCOPO_MESTRE.md.
4 Feche Dashboard Financeiro com drill-down real.
5 Garanta Ledger imutável, idempotente, correlationId e compensação.
6 Motor de Taxas POR EVENTO: fixa/percentual, vigência, versão, snapshot histórico.
7 Saldo Real por Evento + Conta Consolidada do Produtor.
8 Transferência entre eventos do mesmo produtor com aprovação e lançamentos espelhados.
9 Spread + Advanced conforme negociação real e versionada.
10 Contas a Pagar + Receber + Centro de Custos.
11 Fornecedores + Compras + Contratos + Aprovações.
12 Tesouraria + Contas Bancárias + PIX + CNAB + Pagamentos em Lote conforme integrações existentes.
13 Estorno total/parcial + Chargeback + reversões.
14 Settlement Engine + Agenda + Lotes + Retenções + Repasse.
15 Conciliação Pagamento + Repasse + Bancária.
16 Central de Casos de Divergência com workflow e evidências.
17 Fluxo de Caixa realizado/projetado.
18 DRE por Evento + Resultado Consolidado do Produtor.
19 Relatórios financeiros completos e exportações reais.
20 Inteligência Financeira baseada em evidência; não movimentar dinheiro automaticamente.
21 Auditoria de todas ações críticas.
22 RBAC/ownership backend + frontend.
23 Integre eventos financeiros ao Command Center 11.18; 11.18 não escreve Ledger.
24 Estados completos loading/empty/error/stale/forbidden/pending approval.
25 Corrija telas brancas, rotas, botões mortos, modais, overflow, contraste e responsividade do escopo.
26 Sem mocks/números fictícios em produção.
27 Execute todos os cenários de docs/19_E2E.md.
28 Rode typecheck, lint, unit, integration, E2E, build e smoke.
29 Gere:
 docs/EDDIE_11_19_RELATORIO_FINAL.md
 docs/EDDIE_11_19_MATRIZ_FINANCEIRA.csv
 docs/EDDIE_11_19_MAPA_LEDGER.md
 docs/EDDIE_11_19_REGRAS_TAXAS.md
 docs/EDDIE_11_19_DIVERGENCIAS.md
 docs/EDDIE_11_19_EVIDENCIAS_E2E.md
30 Só marcar HOMOLOGADO se não houver falha crítica financeira.
31 NÃO faça push/deploy sem autorização explícita.

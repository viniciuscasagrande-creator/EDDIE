# EDDIE 9.8 — Expansão Financeiro + Contabilidade

## Financeiro
Consolidar: Dashboard Financeiro, Gestão de Saldos por Evento, Conta do Produtor, Extrato, Transferência entre Eventos, Aprovação, Histórico/Auditoria, Repasses, Agenda de Repasses, Antecipações, Contas a Pagar/Receber, Pagamentos e Taxas, Tesouraria, Fluxo de Caixa, Projeção, Conciliação, Retorno Bancário, Relatórios e Inteligência Financeira.

Reutilizar obrigatoriamente `LancamentoLedger`, `TransferenciaInterEvento`, `SolicitacaoRepasse`, `SolicitacaoAntecipacao`, `ContaPagar`, `DivergenciaConciliacao` e serviços existentes.

Transferência entre eventos é movimentação patrimonial interna: não cria GMV, venda ou receita.

## Contabilidade
Consolidar: Centro de Controle por Evento, Plano de Contas, Lançamentos, Partidas, Livro Diário/Razão, Conciliação Contábil, Fechamento Mensal, DRE, Balancete, Balanço Patrimonial quando suportado pelos dados, Centros de Custos, Receita Diferida, Auditoria e relatórios.

Separar recursos de terceiros (produtor) da receita própria da DiskIngressos. Não reconhecer o valor bruto do ingresso como receita própria sem a regra contábil correspondente.

## UX
Telas densas, legíveis e operacionais. Cards somente para indicadores decisórios. Tabelas com filtros, período, evento, status e drill-down quando útil.

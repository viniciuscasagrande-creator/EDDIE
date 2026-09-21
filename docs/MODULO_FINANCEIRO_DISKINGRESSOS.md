# Módulo Financeiro --- DiskIngressos

> Documento consolidado exclusivamente do **Módulo Financeiro**,
> extraído da estrutura do projeto SafeSaff/Event OS fornecido em
> 21/09/2026.\
> **Escopo:** Financeiro. A Contabilidade permanece como módulo
> independente e não é detalhada neste arquivo.

## 1. Objetivo do módulo

O Módulo Financeiro é a central executiva e operacional para controle do
dinheiro movimentado pela operação de ingressos e pelos eventos dos
produtores.

O módulo deve permitir acompanhar, controlar e auditar:

-   saldo disponível e saldo futuro;
-   recebíveis e liquidações;
-   repasses ao produtor;
-   antecipações;
-   extratos e movimentações;
-   contas a pagar e a receber;
-   tesouraria;
-   compras e fornecedores;
-   despesas por evento;
-   centros de custos;
-   transferências entre eventos;
-   conciliação bancária e de adquirentes;
-   split financeiro;
-   taxas, spread e condições comerciais;
-   operadoras, gateways e meios de pagamento;
-   borderôs e fechamento financeiro;
-   projeções e inteligência financeira;
-   relatórios financeiros e auditoria.

------------------------------------------------------------------------

## 2. Regra estrutural

O Financeiro deve respeitar três níveis de contexto:

### 2.1 Produtor

Cada produtor acessa exclusivamente seus próprios dados financeiros.

### 2.2 Evento

Sempre que aplicável, os lançamentos devem ser vinculados ao evento de
origem, permitindo análise individual de:

-   receitas;
-   despesas;
-   saldo;
-   recebíveis;
-   repasses;
-   transferências;
-   taxas;
-   conciliações;
-   fornecedores;
-   projeções.

### 2.3 Consolidado do produtor

O sistema também deve apresentar uma visão consolidada de todos os
eventos pertencentes ao mesmo produtor, sem perder a rastreabilidade por
evento.

------------------------------------------------------------------------

# 3. Menu principal do Financeiro

A navegação principal identificada no projeto está organizada em:

1.  **Dashboard Financeiro**
2.  **Conta Financeira**
3.  **Contas**
4.  **Tesouraria**
5.  **Compras & Fornecedores**
6.  **Controladoria**
7.  **Plano de Contas**
8.  **Conciliação**
9.  **Relatórios**

Rotas principais:

  Menu                     Rota
  ------------------------ ------------------------------------
  Dashboard Financeiro     `/financeiro/dashboard`
  Conta Financeira         `/financeiro/conta-financeira`
  Contas                   `/financeiro/contas`
  Tesouraria               `/financeiro/tesouraria`
  Compras & Fornecedores   `/financeiro/compras-fornecedores`
  Controladoria            `/financeiro/controladoria`
  Plano de Contas          `/app/finance-chart-accounts`
  Conciliação              `/financeiro/conciliacao`
  Relatórios Financeiros   `/financeiro/relatorios`

Também existem rotas operacionais específicas para **Gestão de Saldos**,
**Transferências** e funções financeiras especializadas.

------------------------------------------------------------------------

# 4. Dashboard Financeiro

O Dashboard Financeiro deve funcionar como a entrada executiva do
módulo.

## Indicadores principais

-   saldo total do produtor;
-   saldo disponível;
-   saldo a receber;
-   saldo bloqueado;
-   recebíveis futuros;
-   repasses em processamento;
-   vendas brutas;
-   receita líquida;
-   taxas financeiras;
-   despesas;
-   antecipações;
-   valores conciliados;
-   divergências;
-   estornos;
-   chargebacks;
-   projeção de caixa.

## Visões

O dashboard deve permitir alternar entre:

-   todos os eventos;
-   evento específico;
-   período;
-   conta financeira;
-   meio de pagamento;
-   adquirente/gateway;
-   status financeiro.

------------------------------------------------------------------------

# 5. Conta Financeira

Centraliza o saldo financeiro real do produtor.

## Funções

-   visualizar saldo consolidado;
-   separar saldo por evento;
-   identificar saldo disponível;
-   identificar saldo futuro;
-   identificar saldo bloqueado;
-   visualizar valores comprometidos;
-   consultar recebíveis;
-   solicitar repasses;
-   acompanhar repasses em processamento;
-   consultar contas bancárias;
-   administrar chaves PIX;
-   visualizar histórico de movimentações.

------------------------------------------------------------------------

# 6. Gestão de Saldos por Evento

Cada evento deve possuir sua própria posição financeira.

## Estrutura mínima

Para cada evento:

-   saldo bruto;
-   taxas;
-   estornos;
-   despesas;
-   valores bloqueados;
-   valores em conciliação;
-   recebíveis futuros;
-   saldo comprometido;
-   saldo disponível;
-   saldo transferido;
-   saldo recebido de outro evento.

## Regra essencial

O saldo de um evento não deve desaparecer no consolidado. Toda
movimentação precisa manter a identificação do evento de origem e
destino.

------------------------------------------------------------------------

# 7. Transferência entre Eventos

O produtor pode utilizar recursos disponíveis de um evento para cobrir
obrigações de outro evento pertencente à mesma conta/produtora.

Exemplo:

-   Evento X: R\$ 10.000,00 disponíveis;
-   Evento Y: necessidade de R\$ 500,00;
-   transferência aprovada: R\$ 500,00 de X para Y;
-   novo saldo de X: R\$ 9.500,00;
-   crédito em Y: R\$ 500,00.

## Controles obrigatórios

-   evento de origem;
-   evento de destino;
-   valor;
-   motivo;
-   solicitante;
-   aprovador;
-   data/hora;
-   saldo anterior;
-   saldo posterior;
-   status;
-   histórico;
-   trilha de auditoria;
-   possibilidade de estorno controlado da transferência.

------------------------------------------------------------------------

# 8. Contas

Central operacional de contas a pagar e contas a receber.

## Contas a pagar

-   fornecedor;
-   evento;
-   centro de custos;
-   categoria;
-   competência;
-   vencimento;
-   valor;
-   forma de pagamento;
-   documento;
-   aprovação;
-   status;
-   comprovante;
-   pagamento.

## Contas a receber

-   origem;
-   evento;
-   pedido/lote financeiro;
-   adquirente;
-   gateway;
-   previsão;
-   vencimento;
-   valor bruto;
-   taxas;
-   valor líquido;
-   status de liquidação.

------------------------------------------------------------------------

# 9. Tesouraria

Responsável pela movimentação financeira e execução dos pagamentos.

## Funções

-   contas bancárias;
-   PIX;
-   transferências;
-   pagamentos;
-   pagamentos em lote;
-   agenda financeira;
-   lotes de pagamento;
-   arquivos CNAB;
-   retorno bancário;
-   comprovantes;
-   aprovação financeira;
-   histórico de execução;
-   controle de liquidez.

------------------------------------------------------------------------

# 10. Compras & Fornecedores

Centraliza fornecedores e obrigações ligadas à produção dos eventos.

## Cadastro de fornecedores

-   razão social;
-   nome fantasia;
-   CPF/CNPJ;
-   contatos;
-   dados bancários;
-   PIX;
-   documentos;
-   contratos;
-   categorias;
-   eventos atendidos.

## Processo de compras

Fluxo recomendado:

`Solicitação → Cotação → Aprovação → Contratação → Conta a Pagar → Pagamento → Conciliação`

------------------------------------------------------------------------

# 11. Controladoria

Camada gerencial do Financeiro.

## Responsabilidades

-   orçamento;
-   realizado x previsto;
-   centro de custos;
-   resultado por evento;
-   resultado consolidado;
-   fluxo de caixa;
-   análise de margem;
-   análise de taxas;
-   acompanhamento de desvios;
-   projeções;
-   indicadores financeiros.

------------------------------------------------------------------------

# 12. Centros de Custos por Evento

Cada evento pode possuir seus próprios centros de custos.

Exemplos:

-   locação;
-   artistas;
-   segurança;
-   brigada;
-   limpeza;
-   estrutura;
-   som;
-   iluminação;
-   marketing;
-   ECAD;
-   equipe;
-   fornecedores;
-   bilheteria;
-   operação;
-   taxas.

Isso permite identificar o custo real e o resultado financeiro de cada
evento.

------------------------------------------------------------------------

# 13. Plano de Contas

O Plano de Contas organiza os lançamentos financeiros em categorias
padronizadas.

Deve servir como estrutura para:

-   contas a pagar;
-   contas a receber;
-   despesas;
-   receitas;
-   taxas;
-   transferências;
-   relatórios;
-   fluxo de caixa;
-   controladoria;
-   integração com o módulo contábil.

O Financeiro utiliza o Plano de Contas operacionalmente; a escrituração
e as demonstrações contábeis permanecem sob responsabilidade do módulo
**Contabilidade**.

------------------------------------------------------------------------

# 14. Conciliação Financeira e Bancária

O sistema possui estrutura dedicada à conciliação.

## Fontes

-   bancos;
-   adquirentes;
-   gateways;
-   PIX;
-   cartões;
-   PDV/POS;
-   arquivos OFX;
-   CNAB;
-   vendas;
-   repasses;
-   estornos.

## Processo

`Venda → Recebível → Gateway/Adquirente → Liquidação → Banco → Conciliação`

## Status recomendados

-   pendente;
-   conciliado;
-   divergente;
-   em análise;
-   ajustado.

Toda divergência deve apresentar valor esperado, valor recebido,
diferença e origem.

------------------------------------------------------------------------

# 15. Saldo Consolidado

Módulo de visão executiva em tempo real.

Apresenta:

-   saldo disponível;
-   recebíveis futuros;
-   valores bloqueados;
-   liquidez;
-   posição consolidada;
-   detalhamento por evento.

------------------------------------------------------------------------

# 16. Solicitar Repasse

Permite transferir recursos disponíveis para contas bancárias ou chaves
PIX autorizadas do produtor.

## Fluxo

`Solicitação → Validação → Aprovação → Processamento → Liquidação → Conciliação`

Deve registrar:

-   valor;
-   evento/origem;
-   conta destino;
-   solicitante;
-   aprovação;
-   tarifa;
-   data prevista;
-   data efetiva;
-   comprovante;
-   status.

------------------------------------------------------------------------

# 17. Antecipações de Recebíveis

Permite simular e solicitar antecipação dos recebíveis futuros.

## Informações

-   recebíveis elegíveis;
-   valor bruto;
-   taxa;
-   custo da antecipação;
-   valor líquido;
-   prazo;
-   evento;
-   cronograma original;
-   cronograma antecipado;
-   aprovação;
-   liquidação.

------------------------------------------------------------------------

# 18. Extrato Geral Detalhado

Histórico completo das movimentações financeiras.

## Filtros

-   período;
-   evento;
-   tipo de lançamento;
-   pedido;
-   conta;
-   adquirente;
-   status;
-   crédito/débito.

## Exportações

-   CSV;
-   planilha;
-   OFX quando aplicável;
-   relatório financeiro.

Cada registro deve ser rastreável até sua origem.

------------------------------------------------------------------------

# 19. PDV / POS

Conciliação financeira dos pontos de venda físicos.

Abrange:

-   dinheiro;
-   débito;
-   crédito;
-   PIX;
-   TEF;
-   terminal;
-   operador;
-   caixa;
-   evento;
-   fechamento;
-   divergência;
-   conciliação.

------------------------------------------------------------------------

# 20. Devoluções, Estornos e Chargebacks

O Financeiro recebe os impactos financeiros de:

-   reembolsos;
-   cancelamentos;
-   estornos;
-   chargebacks;
-   contestações.

A operação especializada de estorno pode existir em módulo independente,
mas seus efeitos devem alimentar automaticamente:

-   saldo;
-   extrato;
-   contas;
-   conciliação;
-   fluxo de caixa;
-   relatórios financeiros.

------------------------------------------------------------------------

# 21. Financeiro Advanced

Camada para operações financeiras estruturadas.

## Escopo

-   aportes;
-   contratos financeiros;
-   juros;
-   amortizações;
-   cronogramas;
-   adiantamentos estruturados;
-   acompanhamento do capital;
-   liquidação;
-   auditoria.

------------------------------------------------------------------------

# 22. Spread Financeiro

Analisa margem financeira e condições comerciais.

## Indicadores

-   preço do ingresso;
-   taxa de serviço;
-   taxa negociada;
-   custo de processamento;
-   MDR;
-   comissão;
-   spread bruto;
-   spread líquido;
-   margem por ingresso;
-   margem por evento;
-   margem consolidada.

------------------------------------------------------------------------

# 23. Split Financeiro

Executa a divisão automatizada das receitas.

Possíveis participantes:

-   produtor;
-   coprodutor;
-   casa de eventos;
-   artista;
-   parceiro;
-   bilheteria;
-   DiskIngressos.

## Regras

-   percentual;
-   valor fixo;
-   prioridade;
-   vigência;
-   evento;
-   método de pagamento;
-   destinatário;
-   conta/subconta;
-   status.

Toda divisão deve ser auditável.

------------------------------------------------------------------------

# 24. Inteligência Financeira

Camada analítica e preditiva.

## Capacidades previstas

-   projeção de receita;
-   curva de vendas;
-   projeção de caixa;
-   previsão de recebíveis;
-   projeção de repasses;
-   alertas de liquidez;
-   comportamento de ticket médio;
-   análise de margem;
-   identificação de desvios;
-   cenários financeiros.

A inteligência deve utilizar dados reais do produtor e dos eventos,
deixando claramente separados valores realizados e valores projetados.

------------------------------------------------------------------------

# 25. Operadoras, Gateways e Adquirentes

Central de acompanhamento dos parceiros de pagamento.

## Dados

-   adquirente;
-   gateway;
-   modalidade;
-   MDR;
-   tarifa;
-   prazo de liquidação;
-   antecipação;
-   volume processado;
-   aprovação;
-   recusas;
-   estornos;
-   divergências;
-   conciliação.

------------------------------------------------------------------------

# 26. Simulador de Spread e Lucro

Ferramenta para simular cenários antes da configuração comercial.

Entradas possíveis:

-   preço;
-   quantidade;
-   taxa de serviço;
-   MDR;
-   custo fixo;
-   comissão;
-   parcelamento;
-   despesas;
-   impostos/taxas aplicáveis.

Saídas:

-   receita bruta;
-   custos;
-   taxas;
-   margem;
-   spread;
-   receita líquida;
-   resultado projetado.

------------------------------------------------------------------------

# 27. Métodos de Pagamento

Configuração e acompanhamento de:

-   PIX;
-   cartão de crédito;
-   parcelamento;
-   débito;
-   boleto, quando habilitado;
-   regras de vencimento;
-   regras de parcelamento;
-   custos;
-   prazo de liquidação.

------------------------------------------------------------------------

# 28. Pagamentos Customizados e Permutas

Permite registrar operações especiais:

-   permutas;
-   patrocínios;
-   cortesias com impacto financeiro;
-   taxas personalizadas;
-   condições comerciais especiais;
-   compensações.

Essas operações não podem ficar fora da rastreabilidade financeira.

------------------------------------------------------------------------

# 29. Gestão de Despesas do Evento

Controle dos custos diretamente ligados ao evento.

Exemplos:

-   segurança;
-   brigada;
-   gerador;
-   limpeza;
-   aluguel;
-   ECAD;
-   estrutura;
-   equipe;
-   produção;
-   fornecedores.

Cada despesa deve possuir evento, categoria, centro de custos,
fornecedor, documento, vencimento, aprovação e status de pagamento.

------------------------------------------------------------------------

# 30. Borderô e Assinaturas

Fechamento financeiro oficial do evento.

## Borderô

Deve consolidar:

-   vendas;
-   ingressos;
-   receitas;
-   taxas;
-   descontos;
-   estornos;
-   despesas;
-   repasses;
-   splits;
-   valores líquidos;
-   ajustes;
-   fechamento.

Pode existir em versão resumida e completa.

## Assinatura

O documento final deve possuir controle de versão, responsáveis,
data/hora e mecanismo de assinatura digital adotado pela operação.

------------------------------------------------------------------------

# 31. Contas Bancárias e Chaves PIX

Cadastro das contas autorizadas para movimentação financeira.

## Requisitos

-   titular;
-   CPF/CNPJ;
-   banco;
-   agência;
-   conta;
-   tipo;
-   chave PIX;
-   validação;
-   status;
-   conta principal;
-   histórico de alterações.

Alterações sensíveis devem possuir auditoria e, quando definido pela
política da operação, aprovação adicional.

------------------------------------------------------------------------

# 32. Negociações Comerciais

Consulta das condições financeiras negociadas com cada produtor/evento.

## Dados

-   contrato/plano;
-   taxa base;
-   taxa de serviço;
-   MDR;
-   tarifas;
-   antecipação;
-   prazo de repasse;
-   condições especiais;
-   vigência;
-   evento;
-   histórico de alterações.

------------------------------------------------------------------------

# 33. Agenda Financeira e Repasses Automáticos

Central temporal das obrigações e liquidações.

Pode apresentar:

-   pagamentos futuros;
-   recebimentos;
-   liquidações;
-   repasses;
-   antecipações;
-   transferências;
-   vencimentos;
-   lotes;
-   pendências de aprovação.

Repasses automáticos devem seguir regras configuradas e gerar histórico
completo.

------------------------------------------------------------------------

# 34. Conciliação de Repasses e Retorno Bancário

Após a execução de um repasse, o sistema deve validar o retorno da
instituição financeira.

## Fluxo

`Lote → Envio → Processamento Bancário → Retorno → Baixa → Conciliação`

Em caso de falha:

-   identificar transação;
-   registrar código/motivo;
-   impedir baixa incorreta;
-   devolver para tratamento;
-   manter trilha de auditoria.

------------------------------------------------------------------------

# 35. Fluxo de Caixa

Deve apresentar:

-   saldo inicial;
-   entradas realizadas;
-   saídas realizadas;
-   entradas previstas;
-   saídas previstas;
-   saldo projetado;
-   compromissos;
-   recebíveis;
-   repasses;
-   antecipações.

Visualizações:

-   por evento;
-   por produtor;
-   consolidada;
-   diária;
-   semanal;
-   mensal.

------------------------------------------------------------------------

# 36. Resultado Gerencial por Evento

O Financeiro deve permitir analisar o resultado operacional do evento.

Estrutura gerencial:

`Receita Bruta` `(-) Estornos/Cancelamentos`
`(-) Taxas e Custos Financeiros` `(-) Despesas do Evento`
`(-/+) Ajustes` `= Resultado Gerencial`

O consolidado do produtor deve somar os eventos sem eliminar o
detalhamento individual.

------------------------------------------------------------------------

# 37. Relatórios Financeiros

Relatórios mínimos:

-   posição de saldo;
-   saldo por evento;
-   recebíveis;
-   repasses;
-   transferências;
-   antecipações;
-   contas a pagar;
-   contas a receber;
-   despesas;
-   fornecedores;
-   conciliação;
-   taxas;
-   adquirentes;
-   spread;
-   split;
-   fluxo de caixa;
-   resultado por evento;
-   resultado consolidado;
-   borderô;
-   movimentações;
-   auditoria financeira.

------------------------------------------------------------------------

# 38. Auditoria e Rastreabilidade

Toda operação financeira relevante deve registrar:

-   identificador;
-   produtor;
-   evento;
-   usuário;
-   data/hora;
-   ação;
-   valor;
-   origem;
-   destino;
-   estado anterior;
-   estado posterior;
-   aprovação;
-   justificativa;
-   referência relacionada.

Operações críticas não devem ser apagadas fisicamente do histórico
financeiro.

------------------------------------------------------------------------

# 39. Permissões

Permissão base identificada:

`financeiro.visualizar`

O desenho também prevê permissões específicas para operações sensíveis,
como:

-   visualizar saldos;
-   executar transferências;
-   solicitar repasses;
-   aprovar transferências;
-   aprovar pagamentos;
-   administrar contas bancárias;
-   visualizar relatórios;
-   exportar dados;
-   operar antecipações;
-   administrar conciliação.

O acesso deve respeitar produtor, evento, função e nível de autorização.

------------------------------------------------------------------------

# 40. Integrações internas

O Financeiro deve receber ou fornecer dados para:

### Eventos

Identificação do evento e produtor.

### Vendas/Pedidos

Origem dos recebíveis e receitas.

### Estornos

Impactos financeiros de cancelamentos e devoluções.

### Comercial

Condições comerciais e taxas negociadas.

### Contabilidade

Entrega dos fatos financeiros necessários para classificação e
escrituração contábil.

### Auditoria

Registro das operações críticas.

------------------------------------------------------------------------

# 41. Arquitetura funcional resumida

``` text
FINANCEIRO
│
├── Dashboard Financeiro
│
├── Conta Financeira
│   ├── Saldo Consolidado
│   ├── Saldo por Evento
│   ├── Recebíveis
│   ├── Repasses
│   ├── Transferências entre Eventos
│   └── Contas Bancárias / PIX
│
├── Contas
│   ├── Contas a Pagar
│   └── Contas a Receber
│
├── Tesouraria
│   ├── Pagamentos
│   ├── PIX
│   ├── CNAB
│   ├── Lotes
│   └── Agenda Financeira
│
├── Compras & Fornecedores
│
├── Controladoria
│   ├── Centros de Custos
│   ├── Orçamento
│   ├── Fluxo de Caixa
│   └── Resultado Gerencial
│
├── Plano de Contas
│
├── Conciliação
│   ├── Bancária
│   ├── Gateways
│   ├── Adquirentes
│   ├── PDV/POS
│   └── Repasses
│
├── Advanced
│   ├── Antecipações
│   ├── Spread
│   ├── Split Financeiro
│   ├── Inteligência Financeira
│   └── Operadoras / Adquirentes
│
├── Operações Complementares
│   ├── Simulador de Spread
│   ├── Métodos de Pagamento
│   ├── Pagamentos Customizados
│   ├── Despesas
│   ├── Borderô
│   └── Negociações
│
└── Relatórios
```

------------------------------------------------------------------------

# 42. Diretrizes de interface

A interface deve permanecer:

-   100% em Português do Brasil para textos visíveis;
-   responsiva;
-   orientada a produtor e evento;
-   com números financeiros alinhados à direita;
-   com filtros persistentes;
-   com status claros;
-   com tabelas auditáveis;
-   com dashboards executivos;
-   com separação visual entre realizado, previsto e projetado;
-   com ações críticas protegidas por confirmação e permissão.

------------------------------------------------------------------------

# 43. Critérios de aceite

O Módulo Financeiro estará funcionalmente consolidado quando:

-   o produtor visualizar apenas seus dados;
-   todos os valores puderem ser rastreados até o evento/origem;
-   saldo consolidado e saldo por evento forem coerentes;
-   transferências entre eventos mantiverem trilha de auditoria;
-   contas a pagar e receber estiverem integradas ao caixa;
-   repasses forem rastreáveis até a liquidação;
-   conciliação identificar automaticamente divergências;
-   despesas forem vinculadas ao evento e centro de custos;
-   split e taxas refletirem as condições comerciais;
-   estornos atualizarem corretamente a posição financeira;
-   relatórios reproduzirem os dados operacionais;
-   projeções forem identificadas como projeções;
-   nenhuma operação financeira crítica puder ser alterada sem
    rastreabilidade;
-   o Financeiro permanecer separado da Contabilidade, com integração de
    dados entre ambos.

------------------------------------------------------------------------

## Referência técnica do projeto analisado

Principais estruturas utilizadas na consolidação deste documento:

-   `src/app/navigation/navigation.config.ts`
-   `src/navigation/routes.ts`
-   `src/data/financeModules.ts`
-   `src/types/financeHub.ts`
-   `src/services/financialAccountingCore.service.ts`
-   `src/services/paymentsEnterprise.service.ts`
-   `src/services/financeReconciliationApi.ts`
-   `src/services/financeErpApi.ts`
-   `src/pages/FinanceDashboardPage.tsx`
-   `src/pages/FinanceProducerAccountPage.tsx`
-   `src/pages/FinanceBalancesPage.tsx`
-   `src/pages/FinancePayoutsPage.tsx`
-   `src/pages/FinanceReceivablesPage.tsx`
-   `src/pages/FinancePayablesPage.tsx`
-   `src/pages/FinanceCashFlowPage.tsx`
-   `src/pages/FinanceReconciliationPage.tsx`
-   `src/pages/FinanceBorderoPage.tsx`
-   `src/pages/FinanceAdvancedTaxesPage.tsx`
-   `src/pages/finance/FinanceHubHome.tsx`
-   `src/pages/finance/FinanceIntelligencePage.tsx`
-   `src/pages/finance/FinanceConciliationPage.tsx`
-   `src/pages/finance/FinanceSplitPage.tsx`
-   `src/pages/finance/FinanceSettlementHubPage.tsx`
-   `src/pages/finance/EventCostCentersBudgetPage.tsx`

------------------------------------------------------------------------

**Documento:** Módulo Financeiro --- DiskIngressos\
**Escopo:** somente Financeiro\
**Base:** projeto fornecido pelo usuário\
**Data da consolidação:** 21/09/2026

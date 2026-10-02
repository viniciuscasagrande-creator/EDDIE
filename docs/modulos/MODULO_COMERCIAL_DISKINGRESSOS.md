# Módulo Comercial --- DiskIngressos

> Consolidação exclusiva do **Módulo Comercial**, baseada no backup do
> projeto fornecido em 21/09/2026.

## 1. Regra fundamental

No Comercial, **clientes são exclusivamente os PRODUTORES (B2B)**.

Comprador final, participante ou portador de ingresso **não pertence ao
CRM Comercial**. Consultas e atendimento desse público pertencem ao
**Atendimento SAC**.

## 2. Objetivo

Gerenciar relacionamento B2B com produtores, oportunidades, negociações,
condições comerciais, carteira, performance dos produtores e
acompanhamento comercial dos eventos.

## 3. Estrutura funcional

``` text
COMERCIAL
├── Hub / Dashboard Comercial
├── Produtores
├── Carteira
├── Oportunidades
├── Pipeline
├── Negociações
├── Condições Comerciais
├── Contratos / Propostas
├── Eventos do Produtor
├── Performance Comercial
├── Metas
├── Atividades / Follow-ups
└── Relatórios
```

## 4. Dashboard Comercial

Indicadores B2B: - produtores ativos; - produtores em negociação; -
oportunidades; - pipeline; - valor potencial; - contratos/negociações; -
eventos da carteira; - vendas dos eventos em visão agregada; - metas; -
atividades pendentes.

## 5. Produtores

Cadastro e gestão de clientes B2B: - razão social; - nome fantasia; -
CPF/CNPJ; - contatos; - responsáveis; - carteira; - executivo
responsável; - eventos; - condições comerciais; - histórico de
relacionamento; - status.

## 6. Carteira Comercial

Organização dos produtores por executivo/equipe: - responsável; -
produtores; - oportunidades; - eventos; - receita agregada; - tarefas; -
alertas; - prioridades.

## 7. Oportunidades

Cada oportunidade deve registrar: - produtor; - contato; - origem; -
necessidade; - produto/serviço; - valor potencial; - probabilidade
operacional, quando definida pela equipe; - etapa; - próxima ação; -
responsável; - data prevista; - histórico.

## 8. Pipeline

Fluxo comercial configurável, por exemplo:

`Prospecção → Qualificação → Diagnóstico → Proposta → Negociação → Contrato → Ganho/Perdido`

O sistema deve manter histórico das mudanças de etapa.

## 9. Negociações

Centraliza: - taxas; - serviços; - prazos; - repasses; - condições
especiais; - planos; - vigência; - aprovações; - histórico.

As condições aprovadas devem alimentar Financeiro e Eventos quando
aplicável.

## 10. Condições Comerciais por Evento

Um produtor pode possuir condições gerais e exceções específicas por
evento.

Deve ser possível identificar: - condição padrão; - exceção; - evento; -
vigência; - aprovador; - motivo; - histórico.

## 11. Propostas e Contratos

Controle de: - proposta; - versão; - valores; - serviços; - taxas; -
validade; - aceite; - contrato relacionado; - assinatura; - anexos; -
status.

## 12. Eventos do Produtor

O Comercial pode consultar os eventos vinculados ao produtor para
acompanhamento B2B: - evento; - status; - data; - vendas agregadas; -
receita agregada; - performance.

Isso não transforma o Comercial em módulo operacional de Eventos.

## 13. Performance Comercial

Análises: - produtor; - carteira; - executivo; - período; - eventos; -
receita agregada; - crescimento; - retenção B2B; - negociações; -
conversão do pipeline.

## 14. Metas

Metas podem ser acompanhadas por: - executivo; - equipe; - carteira; -
novos produtores; - contratos; - receita comercial; - período.

## 15. Atividades e Follow-ups

-   ligação;
-   reunião;
-   e-mail;
-   proposta;
-   retorno;
-   tarefa;
-   lembrete;
-   próxima ação;
-   responsável;
-   prazo;
-   conclusão.

## 16. Separação Comercial × SAC

### Comercial

Trabalha com: - produtor; - empresa; - contrato; - negociação; -
carteira; - oportunidade; - condições comerciais.

### SAC

Trabalha com: - comprador final; - pedido; - ingresso; - CPF; -
telefone; - atendimento; - problema do consumidor.

O Comercial pode consultar indicadores agregados de pedidos quando
necessário à gestão B2B, mas não deve criar Central de Clientes Finais
ou CRM de participantes.

## 17. Integrações

### Eventos

Eventos pertencentes ao produtor e performance agregada.

### Financeiro

Taxas, condições, prazos e negociações aprovadas.

### Contabilidade

Sem operação direta; recebe reflexos pelos fluxos financeiros adequados.

### Marketing

Informações comerciais do produtor/evento quando necessárias às
campanhas.

### SAC

Somente referências operacionais/agregadas necessárias;
responsabilidades permanecem separadas.

## 18. Permissões

-   visualizar comercial;
-   visualizar carteira;
-   administrar produtores;
-   criar oportunidades;
-   alterar pipeline;
-   negociar condições;
-   aprovar condições;
-   visualizar relatórios;
-   administrar propostas/contratos.

## 19. Auditoria

Registrar alterações em: - produtor; - responsável; - etapa; -
proposta; - taxa; - condição; - contrato; - aprovação; - perda/ganho; -
usuário; - data/hora.

## 20. Critérios de aceite

-   clientes do Comercial são apenas produtores B2B;
-   comprador final não aparece como cliente comercial;
-   carteira respeita permissões;
-   oportunidades mantêm histórico;
-   condições comerciais possuem vigência e auditoria;
-   exceções por evento são identificáveis;
-   dados agregados de eventos não substituem o módulo Eventos;
-   condições aprovadas integram-se ao Financeiro;
-   interface permanece em pt-BR.

## 21. Referências técnicas encontradas

-   `src/pages/commercial/CommercialHubPage.tsx`
-   `src/pages/EventCommercialDashboardPage.tsx`
-   `src/pages/eventos/EventCommercialDashboardPage.tsx`
-   `src/pages/eventos/EventCommercialConditionsPage.tsx`
-   `src/components/EventCommercialDashboard.tsx`
-   `src/components/event-commercial/EventCommercialCharts.tsx`
-   `src/components/event-commercial/EventComparatorModal.tsx`
-   `src/hooks/useCommercialDashboard.ts`
-   `src/services/eventCommercialApi.ts`
-   `src/types/event-commercial.ts`
-   `src/types/producer.ts`
-   `src/data/producers.ts`

**Documento:** Comercial --- DiskIngressos\
**Data:** 21/09/2026

# Módulo Eventos --- DiskIngressos

> Consolidação exclusiva do **Módulo Eventos**, baseada no backup do
> projeto fornecido em 21/09/2026.

## 1. Objetivo

Ser a central operacional dos eventos do produtor, concentrando criação,
configuração, inventário, lotes, contexto do evento, operação em tempo
real, acompanhamento comercial e inteligência operacional.

## 2. Regra de contexto

O produtor pode possuir vários eventos. O sistema deve operar em dois
níveis:

-   **Visão do produtor:** consolida todos os eventos permitidos.
-   **Contexto do evento:** ao entrar em um evento, os menus e
    ferramentas passam a operar naquele evento.

Ferramentas externas ao contexto interno devem solicitar seleção do
evento/ID.

## 3. Estrutura funcional

``` text
EVENTOS
├── Lista / Portfólio de Eventos
├── Criar / Editar Evento
├── Contexto do Evento
├── Inventário e Lotes
├── Configurações Comerciais
├── Dashboard Comercial do Evento
├── Receita e Performance
├── Previsões
├── Operação ao Vivo
├── Comando do Dia do Evento
├── Incidentes
├── Atividades
├── Busca Global
├── Investigação de Pedidos
├── Inteligência Disk
└── Visão Executiva do Produtor
```

## 4. Lista de Eventos

Deve permitir: - cards e tabela; - pesquisa; - filtros; - status; -
datas; - local; - produtor; - vendas; - capacidade; - acesso rápido; -
comparação de eventos.

## 5. Cadastro / Edição

Informações: - nome; - descrição; - data/hora; - local; - endereço; -
produtor; - imagem/capa; - capacidade; - categorias; - status; -
políticas; - configurações de venda.

## 6. Contexto do Evento

Ao selecionar um evento, o sistema deve persistir seu ID/contexto e
garantir que páginas dependentes operem sobre o evento correto.

## 7. Inventário e Lotes

Gerenciamento de: - tipos de ingresso; - lotes; - quantidade; - preço; -
disponibilidade; - período de venda; - virada de lote; - bloqueios; -
capacidade; - gestão em lote.

## 8. Dashboard Comercial do Evento

Indicadores: - ingressos vendidos; - receita; - ticket médio; -
capacidade utilizada; - vendas por período; - vendas por lote; - vendas
por canal; - evolução; - comparação com eventos permitidos.

## 9. Condições Comerciais

Exibir condições relacionadas ao evento: - taxas; - regras comerciais; -
prazos; - meios de pagamento; - condições negociadas; - vigência.

## 10. Receita e Inteligência

Visões de: - receita bruta; - receita líquida quando aplicável; -
vendas; - ticket médio; - curva de vendas; - lotes; - canais; -
projeções claramente identificadas.

## 11. Forecast / Previsões

Projetar: - ritmo de vendas; - ocupação; - receita; - tendência; -
metas; - cenários.

Realizado e projetado devem ser visualmente distintos.

## 12. Operação ao Vivo

Durante a operação: - vendas recentes; - acessos; - ocorrências; -
status; - alertas; - indicadores críticos; - atividade em tempo real.

## 13. Comando do Dia do Evento

Painel operacional focado no dia da realização: - situação geral; -
vendas; - acessos; - incidentes; - equipes; - alertas; - decisões/ações
registradas.

## 14. Incidentes

Registro de ocorrências: - categoria; - severidade; - evento; -
responsável; - status; - descrição; - data/hora; - resolução; -
histórico.

## 15. Atividades

Timeline das ações relevantes do evento: - alterações; - vendas; -
mudanças de lote; - incidentes; - ações operacionais; - integrações.

## 16. Busca Global

Busca contextual por dados relacionados ao evento, respeitando
permissões e separação de responsabilidades dos módulos.

## 17. Investigação de Pedidos

Ferramenta operacional para localizar e investigar pedidos relacionados
ao evento, sem transformar Eventos em CRM de comprador final.

## 18. Visão Executiva do Produtor

Consolida o portfólio: - eventos ativos; - próximos eventos; - vendas; -
receita; - capacidade; - performance; - alertas.

## 19. Pixels por Evento

O evento funciona como entidade central para vincular múltiplos pixels e
integrações de tracking, administrados pelo Marketing.

## 20. Integrações

Eventos fornece contexto para: - Comercial; - Financeiro; - Marketing; -
Remarketing; - Suporte Eventos; - Atendimento SAC; - Estorno; -
Contabilidade.

## 21. Permissões

-   visualizar eventos;
-   criar;
-   editar;
-   configurar lotes;
-   visualizar vendas;
-   operar evento;
-   administrar incidentes;
-   acessar inteligência.

## 22. Critérios de aceite

-   produtor vê somente seus eventos;
-   seletor global mantém contexto correto;
-   cada tela recebe o ID correto do evento;
-   inventário e lotes respeitam capacidade;
-   indicadores usam dados do evento selecionado;
-   operação ao vivo não mistura eventos;
-   previsões são identificadas como projeções;
-   módulos integrados recebem contexto consistente;
-   interface em pt-BR.

## 23. Referências técnicas encontradas

-   `src/services/events.service.ts`
-   `src/types/event.ts`
-   `src/data/events.ts`
-   `src/pages/EventsPage.tsx`
-   `src/pages/EventContextPage.tsx`
-   `src/pages/EventFormPage.tsx`
-   `src/pages/EventInventoryPage.tsx`
-   `src/pages/EventCommandCenterPage.tsx`
-   `src/pages/eventos/EventLiveOpsPage.tsx`
-   `src/pages/eventos/EventDayCommandPage.tsx`
-   `src/pages/eventos/EventIncidentsPage.tsx`
-   `src/pages/eventos/EventActivityStreamPage.tsx`
-   `src/pages/eventos/EventForecastCenterPage.tsx`
-   `src/pages/eventos/EventRevenueIntelPage.tsx`
-   `src/pages/eventos/EventDiskIntelligencePage.tsx`
-   `src/pages/eventos/EventProducerExecutivePage.tsx`
-   `src/pages/eventos/EventGlobalSearchPage.tsx`
-   `src/pages/eventos/EventOrderInvestigationPage.tsx`
-   `src/components/context/GlobalEventSelector.tsx`
-   `src/components/events/*`

**Documento:** Eventos --- DiskIngressos\
**Data:** 21/09/2026

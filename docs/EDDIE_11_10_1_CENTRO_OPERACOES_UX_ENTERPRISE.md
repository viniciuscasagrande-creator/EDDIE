# EDDIE 11.10.1 — Centro de Operações UX Enterprise

## Objetivo
Corrigir a composição visual do Centro de Operações do Evento sem alterar as regras de negócio do EDDIE 11.10.

Problemas observados:
- sidebar principal + sidebar interna do evento consomem largura excessiva;
- contexto do evento está fragmentado;
- excesso de cards pequenos;
- gráficos importantes têm pouca área;
- status operacional não possui hierarquia clara;
- aviso técnico de contexto/API ocupa posição privilegiada;
- versão visual inconsistente entre shell e release atual.

## Regra estrutural
No modo evento deve existir apenas UMA sidebar vertical: a sidebar principal do EDDIE.
A navegação específica do evento passa a ser uma barra horizontal de contexto abaixo do cabeçalho do evento.

## 1. Event Header
Faixa compacta:
- thumbnail do evento;
- nome;
- ID;
- local;
- data/sessão;
- status AO VIVO;
- última atualização;
- seletor de sessão;
- Sincronizar;
- Nova Ocorrência.

Não usar card gigante para o cabeçalho.

## 2. Event Navigation Bar
Itens:
Visão Geral
Ingressos
Portaria
Mapa
Financeiro
Marketing
Remarketing
Relatórios
Configurações

Desktop: todos os itens prioritários visíveis.
Quando faltar espaço: itens secundários em "Mais".
Nunca criar scrollbar horizontal de navegação.

## 3. KPIs primários
Primeira linha:
Receita Confirmada
Pedidos Pagos
Ingressos Vendidos/Emitidos
Ocupação
Pessoas Dentro
Fluxo de Entrada/min
Pagamentos Pendentes
Alertas Críticos

Cards mais baixos e densos.
Ticket Médio e Scanners Ativos tornam-se indicadores secundários.

## 4. Saúde Operacional
Faixa:
Vendas
Pagamentos
Portaria
Gateway
API
Marketing

Estados:
NORMAL
ATENCAO
CRITICO
INDISPONIVEL

Cada estado deve ser derivado de dados reais/health checks disponíveis. Não simular saúde.

## 5. Grid principal
Desktop:
- 70% Ritmo de Vendas em Tempo Real
- 30% Agora no Evento

Agora no Evento:
pessoas dentro
entradas/min
pagamentos pendentes
scanners ativos
ocorrências
alertas

## 6. Segunda camada
Portaria & Ocupação | Financeiro & Pagamentos

## 7. Terceira camada
Marketing & Conversão | Alertas, Incidentes & Timeline

## 8. Diagnóstico
"Contexto indisponível / API_INTERNAL_URL não configurada" não deve dominar o header.
Criar `SystemDiagnosticBanner` compacto, somente quando necessário.
Ações:
Tentar novamente
Diagnóstico

Nunca esconder falha real.

## 9. Versão
Remover hardcode visual v11.4.2.
Shell deve consumir a mesma fonte de build-info usada pelo Go-Live.
Exibir uma única versão/release coerente.

## 10. Responsividade
>=1440: layout completo.
1024–1439: reduzir colunas e mover secundários.
768–1023: grid 2 colunas.
<768: uma coluna; event nav com botão "Mais", sem scroll horizontal.

## 11. Estados
loading skeleton por widget
empty state
erro parcial por widget
stale data
reconnecting
live

Falha de Marketing não derruba Vendas/Portaria.
Falha de API específica não deve apagar dados válidos já carregados.

## 12. Não alterar
- cálculos financeiros;
- ledger;
- check-in;
- antifraude;
- regras de inventário;
- contratos de pagamento;
- regras de repasse.

Esta fase é UX, composição, contexto e integração visual.

## Critérios de aceite
- segunda sidebar removida do Centro de Operações;
- conteúdo ganha largura útil;
- navegação do evento permanece completa;
- nenhum menu horizontal com scrollbar;
- gráfico principal claramente dominante;
- status de saúde operacional visível;
- diagnóstico técnico compacto;
- versão coerente com build-info;
- desktop/tablet/mobile homologados;
- nenhuma funcionalidade do 11.10 perdida.

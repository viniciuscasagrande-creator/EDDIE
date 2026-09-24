# EDDIE 11.15.1 — Revisão Global UX, Rotas, Contexto e Dados

## Objetivo
Executar revisão GLOBAL do EDDIE/PDT após 11.10–11.14. Não criar outro redesign. Corrigir inconsistências, duplicidades, páginas quebradas, overflow, navegação, contexto e dados aparentando ser reais sem comprovação.

## Evidência visual inicial
Na rota `/eventos/evento-1/inteligencia` a imagem evidencia: barra contextual do evento duplicada; conteúdo/título encoberto; sidebar e árvore Event OS competindo por largura; excesso de badges técnicos; necessidade de revisar sticky/overflow; Real/Meta/Projeção exigem fontes verificáveis.

## Escopo obrigatório
### Shell e navegação
- Uma única AppSidebar e uma única EventContextBar.
- Uma fonte de verdade para navegação Event OS.
- Remover duplicidade sem remover funções.
- Sidebar recolhível/persistente; breadcrumb Todos os Eventos → Evento → área.
- Em telas menores usar navegação controlada/`Mais`, sem overflow horizontal global.

### Layout
- Corrigir sticky offsets/z-index.
- Conteúdo nunca oculto sob header/nav.
- `min-width:0` em grids/flex necessários.
- Cards responsivos; tabelas largas com scroll próprio.
- Modais/drawers com altura máxima e ações fixas.
- Loading, vazio, erro, stale/reconnecting e sem permissão.

### Rotas
Auditar Visão Geral, Central Operacional, Hardening, Automações, Eventos e todas as rotas Event OS; Financeiro, Contabilidade, Comercial, SAC, Suporte, Estornos, Marketing, Remarketing e Relatórios. Detectar 404, tela branca, import quebrado, rota duplicada e rota sem menu.

### Dados
- Proibido mock apresentado como CONFIRMADO/REAL/AO VIVO/PREDITIVO.
- Endpoint indisponível → `Dados indisponíveis`/`Aguardando integração`.
- Real, Meta e Projeção com origem/timestamp.
- Projeção com metodologia/horizonte apenas quando calculados.
- Preservar separação valor produtor × receita DiskIngressos e integridade do Ledger.

### Tema
- Corrigir cards cinza-claro/baixo contraste no tema claro.
- Padronizar tokens de superfície, borda, texto, hover/focus.
- Evitar hex hardcoded quando houver tokens.

## Critérios de aceite
- Zero barra contextual duplicada.
- Zero conteúdo escondido.
- Zero rota principal com tela branca.
- Zero overflow horizontal global nas resoluções testadas.
- Zero mock rotulado como real.
- Uma fonte de verdade para contexto/navegação de evento.
- UI 100% pt-BR.
- Sem regressão de venda, pagamento, ingresso, check-in, financeiro ou Ledger.

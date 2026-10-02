# EDDIE 10.9 — Marketing & Remarketing Operacional Real + Dashboards Executivos

Base oficial: EDDIE 10.8 HOMOLOGADO.

## Objetivo
Transformar Marketing e Remarketing em áreas operacionais orientadas por dados reais e adicionar dashboards executivos a Marketing, Remarketing, Financeiro e Contabilidade sem criar números fictícios ou fontes paralelas.

## Benchmark aplicado
O desenho foi orientado por padrões públicos de plataformas de eventos/ticketing: acompanhamento de vendas e receita, evolução temporal, canais, ROI/ROAS, tipos de ingresso, meios de pagamento, relatórios e atalhos operacionais. As referências funcionais incluem Sympla, Ticketmaster Business e Eventbrite. O EDDIE não copia layout ou código dessas plataformas.

## 1. Dashboard Marketing
Rota: /marketing
- KPIs reais: campanhas ativas, investimento, receita atribuída, conversões, cliques e ROAS.
- Gráfico de evolução de performance.
- Desempenho por canal/origem.
- Distribuição de canais.
- Atalhos: Campanhas Multicanal, WhatsApp, E-mail, UTM & Conversões, Atribuição e Status das Campanhas.
- Ferramentas operacionais abaixo do dashboard.

## 2. Dashboard Remarketing
Rota: /remarketing
- KPIs derivados exclusivamente dos registros reais disponíveis.
- Evolução de recuperação/conversões.
- Comparação por canal/origem.
- Atalhos: Carrinhos, PIX/Pagamentos, Régua, WhatsApp, E-mail e Relatórios.
- Se a origem real de carrinho/checkout ainda não existir, não fabricar fila nem receita recuperada.

## 3. Dashboard Financeiro
Rota: /financeiro → Visão Financeira
- Mantém os KPIs e funções existentes.
- Gráfico de movimentação financeira a partir do Ledger.
- Saldo disponível por evento.
- Composição do patrimônio: disponível, retido, bloqueado e reserva de estorno.
- Atalhos funcionais para Transferências, Contas & Compromissos, Repasses e Conciliação.
- Nenhum movimento paralelo ao Ledger.

## 4. Dashboard Contábil
Rota: /contabilidade → Painel Contábil
- Resultado contábil por evento.
- Receita própria por evento.
- Maiores saldos por conta contábil.
- Situação da conciliação.
- Atalhos funcionais: DRE, Balancete, Livro Diário, Conciliação, Fechamento e Auditoria.
- Mantém segregação de recursos de terceiros x receita própria.

## 5. Componentes novos
- apps/pdt/src/components/ExecutiveCharts.tsx
- apps/pdt/src/components/MarketingExecutiveDashboard.tsx
- apps/pdt/src/components/AccountingDashboardCharts.tsx

Os gráficos são SVG/React nativos e não adicionam biblioteca de gráficos ao bundle.

## 6. Regras obrigatórias
- UI visível em pt-BR.
- Não usar “360”.
- Sem métricas fictícias.
- Sem dados: estado vazio.
- Falha da API: erro explícito e timeout finito.
- Preservar tenantId, produtorId e eventoId.
- Preservar Ledger, Prisma e cadastro oficial de eventos.
- Comercial continua exclusivamente B2B.
- Marketing e Remarketing permanecem menus separados.

## 7. Homologação
1. pnpm install
2. pnpm db:generate
3. pnpm --filter @ticketing/api build
4. pnpm --filter @ticketing/pdt build
5. node scripts/preflight-10-9.mjs
6. Validar /marketing, /remarketing, /financeiro e /contabilidade.
7. Trocar produtor/evento e confirmar atualização dos dashboards.
8. Confirmar que zero/sem dados não gera valores demonstrativos.

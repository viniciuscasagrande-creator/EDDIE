# EDDIE 11.12.1 — Inteligência Operacional em Tempo Real

## Escopo
Central de Inteligência por evento com dados reais de vendas, inventário, pedidos, pagamentos, portaria, financeiro, marketing e incidentes. Painel Agora, Tendência e Histórico. KPIs/gráficos informam timestamp, fonte e atualização.

## Rotas alvo
- `/eventos/:eventoId/inteligencia`
- `/api/eventos/:eventoId/inteligencia/resumo`
- `/api/eventos/:eventoId/inteligencia/series`

## Regras obrigatórias
- UI 100% pt-BR.
- Contexto Produtor → Evento → Sessão.
- Reutilizar fontes reais antes de criar novas.
- REAL, META e PROJEÇÃO visualmente distintos.
- Previsões com generatedAt, horizonte e metodologia/origem.
- Nunca inventar previsão, confiança ou histórico.
- Falha de inteligência não derruba venda/check-in/financeiro/operação.
- Ações sensíveis passam por RBAC/aprovação.
- Não alterar Ledger para dashboard.
- Sem push/deploy sem autorização.

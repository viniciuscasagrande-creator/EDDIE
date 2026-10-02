# EDDIE 11.12.2 — Previsão de Vendas, Ocupação e Portaria

## Escopo
Projeções explicáveis de vendas/receita, ocupação final, ritmo de entrada, fila e ruptura de lotes. Separar REAL, META e PROJEÇÃO. Mostrar horizonte e Dados insuficientes quando faltar histórico. Comparar previsto versus realizado.

## Rotas alvo
- `/eventos/:eventoId/inteligencia/previsoes`
- `/api/eventos/:eventoId/previsoes/vendas`
- `/api/eventos/:eventoId/previsoes/portaria`

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

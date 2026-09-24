# EDDIE 11.12.3 — Anomalias, Risco Operacional e Recomendações

## Escopo
Detectar desvios em conversão, recusas, QR, entrada, disponibilidade, conciliação e tráfego. Feed priorizado com evidência, baseline, desvio, severidade e domínio. Recomendações assistivas; ações sensíveis passam pelo 11.11.

## Rotas alvo
- `/eventos/:eventoId/inteligencia/anomalias`
- `/api/eventos/:eventoId/anomalias`
- `/api/eventos/:eventoId/recomendacoes`

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

# EDDIE 11.12.4 — Inteligência Financeira, Liquidação e Repasses

## Escopo
Painel por evento/produtor: vendido, pago, taxas negociadas, líquido, a liquidar, comprometido, bloqueado, conciliado, divergências e repasses previstos. Respeitar contratos, spread/advanced e gateways. Capital do produtor não é receita DiskIngressos. Não alterar Ledger.

## Rotas alvo
- `/eventos/:eventoId/inteligencia/financeira`
- `/api/eventos/:eventoId/inteligencia/financeira`
- `/api/produtores/:produtorId/inteligencia/repasses`

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

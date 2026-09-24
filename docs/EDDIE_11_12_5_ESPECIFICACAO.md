# EDDIE 11.12.5 — Homologação da Inteligência + QA

## Escopo
Fechar contratos, permissões, observabilidade e testes 11.12.1–11.12.4. Validar real versus projeção, timezone, moeda, evento/sessão, ausência de histórico, falha parcial, stale/reconnecting, performance e tenant isolation. Projeção nunca substitui dado financeiro confirmado.

## Rotas alvo
- `/api/inteligencia/health`
- `/api/inteligencia/modelos/status`

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

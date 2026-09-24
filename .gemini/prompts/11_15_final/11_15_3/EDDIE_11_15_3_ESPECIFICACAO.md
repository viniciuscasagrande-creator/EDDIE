# EDDIE 11.15.3 — QA Visual Automatizado + Scanner de Rotas

## Escopo
Auditar todas as rotas em desktop/mobile; classificar OK, 404, TELA_BRANCA, ERRO_JS, API_FALHOU, SEM_DADOS e OVERFLOW; capturar screenshots, console e 4xx/5xx; corrigir e retestar.

## Regras
- UI 100% pt-BR.
- Preservar funções e arquitetura existente.
- Uma fonte de contexto Produtor → Evento → Sessão.
- Não duplicar AppShell/router/sidebar/navegação.
- Não mascarar bugs com CSS nem números fictícios.
- REAL, META e PROJEÇÃO distintos quando aplicável.
- Não alterar Ledger para satisfazer dashboard.
- Falha parcial deve ter estado visual.
- Sem reset/teste destrutivo em produção.
- Sem push/deploy sem autorização explícita.

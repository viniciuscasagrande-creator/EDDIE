# EDDIE 11.15.4 — Integrações + Dados Reais Pendentes

## Escopo
Fechar endpoints/contratos pendentes em Eventos, Event OS, Financeiro/Ledger, Contabilidade, Marketing, Remarketing, Relatórios, Comercial, SAC, Suporte e Estornos. Remover mocks de produção; sem fonte real, mostrar estado honesto.

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

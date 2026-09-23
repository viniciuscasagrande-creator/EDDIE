# EDDIE 11.11.1 — Automação Operacional Enterprise

## Objetivo
Implantar telas reais e completas para Central de Automações, Regras Operacionais, Execuções, Aprovações Pendentes e Cockpit Executivo.
Fluxo: evento/sinal → condição → regra → alerta/ação → aprovação quando sensível → execução → auditoria → atualização do Centro de Operações.
Reutilizar Event Bus/Outbox, alertas, incidentes, RBAC e contexto Produtor→Evento→Sessão.
Incluir dashboard com KPIs: regras ativas, execuções hoje, sucesso, falhas, aguardando aprovação e tempo médio.
Editor de regra com gatilho, condição, janela, cooldown, ação, severidade, escopo e dry-run.
Nunca executar automaticamente estorno, repasse, transferência, bloqueio financeiro ou ação destrutiva sem permissão/aprovação.

## Rotas alvo
- `/automacoes`
- `/automacoes/regras`
- `/automacoes/execucoes`
- `/automacoes/aprovacoes`
- `/eventos/:eventoId/cockpit`

## Regras
- UI 100% pt-BR.
- Reutilizar Design System EDDIE.
- Sem segunda sidebar no modo evento.
- Sem scrollbar horizontal para descobrir ações.
- Não duplicar fontes de verdade.
- Falha parcial não derruba a página inteira.
- Não remover funções para fazer build passar.
- Sem push/deploy sem autorização.

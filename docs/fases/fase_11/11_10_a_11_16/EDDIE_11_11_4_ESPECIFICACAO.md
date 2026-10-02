# EDDIE 11.11.4 — Integração Real, Endpoints e QA Operacional

## Objetivo
Fechar integração dos pacotes 11.11.x com endpoints, estados de loading/erro/stale, permissões, auditoria, idempotência e testes.
Eliminar mocks apresentados como reais. Conectar widgets às fontes existentes.
Adicionar contratos para regras, execuções, aprovações, alertas e cockpit.
Testar tenant/produtor/evento, regra desativada, cooldown, duplicidade de evento, reconexão, aprovação sensível e falha parcial.
Preservar build-info e preparar smoke test das novas rotas.

## Rotas alvo
- `/api/automacoes/regras`
- `/api/automacoes/execucoes`
- `/api/automacoes/aprovacoes`
- `/api/operacao/alertas`
- `/api/eventos/:eventoId/cockpit`

## Regras
- UI 100% pt-BR.
- Reutilizar Design System EDDIE.
- Sem segunda sidebar no modo evento.
- Sem scrollbar horizontal para descobrir ações.
- Não duplicar fontes de verdade.
- Falha parcial não derruba a página inteira.
- Não remover funções para fazer build passar.
- Sem push/deploy sem autorização.

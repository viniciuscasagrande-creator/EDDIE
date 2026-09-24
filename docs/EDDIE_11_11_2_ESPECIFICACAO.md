# EDDIE 11.11.2 — Central de Alertas, Incidentes e Sala de Situação

## Objetivo
Consolidar alertas operacionais e incidentes sem duplicar SAC/ITIL. Tela com severidade, domínio, evento, sessão, origem, responsável, SLA operacional, estado e timeline.
Criar Sala de Situação por evento para incidentes críticos, com dados correlacionados de vendas, portaria, pagamentos, infraestrutura e financeiro.
Estados: NOVO, RECONHECIDO, EM_TRATAMENTO, MONITORANDO, RESOLVIDO.
Permitir reconhecer, atribuir, escalar, vincular ocorrência e registrar resolução. Alertas críticos permanecem destacados até reconhecimento/resolução conforme regra.

## Rotas alvo
- `/operacao/alertas`
- `/operacao/incidentes`
- `/eventos/:eventoId/sala-situacao`

## Regras
- UI 100% pt-BR.
- Reutilizar Design System EDDIE.
- Sem segunda sidebar no modo evento.
- Sem scrollbar horizontal para descobrir ações.
- Não duplicar fontes de verdade.
- Falha parcial não derruba a página inteira.
- Não remover funções para fazer build passar.
- Sem push/deploy sem autorização.

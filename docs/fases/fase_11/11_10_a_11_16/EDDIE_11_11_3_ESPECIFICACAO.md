# EDDIE 11.11.3 — Cockpit Executivo do Evento

## Objetivo
Criar visão executiva separada da sala operacional pesada. Exibir venda/receita, ticket médio, ocupação, projeção quando disponível, portaria, pagamentos, financeiro, marketing, alertas e status geral.
Incluir comparativo temporal e entre sessões/eventos quando dados reais permitirem.
Atalhos: Centro de Operações, Portaria, Financeiro, Marketing, Relatórios e Incidentes.
Distinguir explicitamente Real, Meta e Projeção. Sem inventar metas ou previsões.

## Rotas alvo
- `/eventos/:eventoId/cockpit`
- `/eventos/:eventoId/cockpit/comparativos`

## Regras
- UI 100% pt-BR.
- Reutilizar Design System EDDIE.
- Sem segunda sidebar no modo evento.
- Sem scrollbar horizontal para descobrir ações.
- Não duplicar fontes de verdade.
- Falha parcial não derruba a página inteira.
- Não remover funções para fazer build passar.
- Sem push/deploy sem autorização.

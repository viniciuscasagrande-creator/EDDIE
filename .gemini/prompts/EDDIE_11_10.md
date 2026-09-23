# EXECUÇÃO EDDIE 11.10 — CENTRO DE OPERAÇÕES EM TEMPO REAL

Leia:
- EDDIE_11_10_CENTRO_OPERACOES_EVENTO_TEMPO_REAL.md
- docs/EDDIE_11_10_CONTRATOS_REALTIME.md
- docs/EDDIE_11_10_LAYOUT_CENTRO_OPERACOES.md
- EDDIE_11_9_PORTARIA_ANTIFRAUDE_CONCILIACAO_CHARGEBACK.md

Implemente em massa, reutilizando arquitetura existente.

1. Audite Event OS, Portaria, Financeiro, Marketing, Antifraude, incidentes e infraestrutura realtime existente.
2. Crie agregador/snapshot de operação sem duplicar fontes de verdade.
3. Reutilize SSE/WebSocket existente; se não houver, implemente solução mínima coerente com a stack. Polling apenas como fallback.
4. Crie rota Event OS `/eventos/:eventoId/operacao`.
5. Adicione `Centro de Operações` ao menu individual do evento.
6. Implemente KPIs e widgets com isolamento de erro.
7. Implemente timeline operacional deduplicada.
8. Implemente Central de Alertas com ack/atribuição.
9. Integre incidentes existentes; não duplique SAC/ITIL.
10. Respeite RBAC por widget/ação.
11. Atualização incremental; não reload integral.
12. Adicione testes de reconexão, deduplicação, autorização e falha parcial.
13. Build API + PDT + Prisma validate + typecheck/lint/test.
14. Preserve EDDIE 11.9.1 build-info/go-live.

PROIBIDO:
- mocks como produção;
- criar nova fonte financeira;
- duplicar eventos na reconexão;
- derrubar a tela toda por falha de um serviço;
- remover funções para build passar;
- alterar design system;
- push/deploy sem autorização.

Relatório final: arquivos, endpoints, realtime escolhido, testes, build e pendências.

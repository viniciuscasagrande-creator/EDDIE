# EDDIE 9.14 → 9.20 — Execução consolidada

Baseline: EDDIE 9.13 Consolidado Enterprise.

Ordem obrigatória: 9.14 dados reais → 9.15 Financeiro/Contabilidade → 9.16 Eventos/Comercial → 9.17 Marketing/Remarketing → 9.18 SAC/Suporte/Estorno → 9.19 BI/Automação → 9.20 homologação.

## Regras
1. EDDIE é a referência visual e arquitetural.
2. SafeSaff/PDT anterior e vídeos são referência funcional; não copiar CSS.
3. Reutilizar Prisma, NestJS, Ledger, Outbox, Event Bus e componentes existentes.
4. Não criar segundo Ledger, saldo, cadastro de eventos ou CRM de compradores.
5. Toda função: UI → validação → API → serviço → Prisma/Ledger → persistência → resposta → UI → erro/auditoria.
6. pt-BR em toda interface.
7. Não usar “360” em nomes visíveis.
8. Entregas grandes; evitar microfases.

## Importante sobre 9.14
A versão 9.13 continha um store em memória com eventos, saldos, campanhas e operações demonstrativas dentro da rota Next `/api/[...path]`. Isso foi removido neste pacote. A rota agora é somente proxy para a API real. Também foram removidos fallbacks demonstrativos encontrados nos serviços Financeiro, Comercial e Contabilidade.

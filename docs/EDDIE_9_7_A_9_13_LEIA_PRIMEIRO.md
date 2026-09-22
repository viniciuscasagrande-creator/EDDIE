# EDDIE 9.7 a 9.13 — Ciclo de Integração Real e Expansão

Este pacote parte da consolidação 9.2–9.6. A prioridade agora é **dados reais e operação real**, sem copiar CSS do SafeSaff e sem reescrever a arquitetura do EDDIE.

## Regras inegociáveis
1. EDDIE é a fonte arquitetural e visual.
2. SafeSaff/PDT antigo/vídeos são referência de telas, funções, atribuições e fluxos — nunca de CSS.
3. Reutilizar Prisma, NestJS, Ledger, Outbox, contratos e componentes existentes antes de criar novos.
4. Nenhum KPI financeiro/comercial/marketing pode ser hardcoded em produção.
5. Toda ação operacional deve fechar UI → API → serviço → persistência → resposta → atualização da UI.
6. Toda consulta deve respeitar tenantId e, quando aplicável, produtorId/eventId.
7. Nenhum loading infinito: toda tela deve ter loading, vazio, erro e retry.
8. Interface visível 100% pt-BR.
9. Não criar segundo Ledger, segundo cadastro de eventos, saldo paralelo ou CRM de comprador no Comercial.
10. Preservar o Design System do EDDIE e melhorar consistência sem importar estilos antigos.

## Ordem de execução
- 9.7 Integração Real de Dados — executar primeiro e bloquear mocks.
- 9.8 Financeiro + Contabilidade — expansão funcional.
- 9.9 Eventos + Comercial B2B — expansão operacional.
- 9.10 Marketing & Remarketing Advanced.
- 9.11 SAC + Suporte + Estorno Advanced.
- 9.12 Inteligência, BI e Automação — somente sobre dados confiáveis.
- 9.13 Homologação Enterprise e Produção.

Cada fase possui documento detalhado em `docs/`.

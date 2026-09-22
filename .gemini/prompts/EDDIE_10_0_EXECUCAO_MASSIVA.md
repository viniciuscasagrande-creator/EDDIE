# COMANDO MESTRE — EDDIE 10.0

Trabalhe sobre o projeto atual. NÃO reconstrua o EDDIE e NÃO copie CSS do SafeSaff.

Leia EDDIE_10_0_LEIA_PRIMEIRO.md e docs/EDDIE_10_0_MAPA_FUNCIONAL.md.

Execute código, não apenas documentação. Preserve Next.js/React, NestJS, Prisma, Ledger, Outbox/Event Bus, multi-tenant e contexto Produtor × Evento.

Para cada tela do mapa:
1. localizar model/service/controller existente;
2. reutilizar o backend antes de criar qualquer estrutura;
3. implementar UI no Design System atual do EDDIE;
4. ligar ações reais aos endpoints;
5. tratar loading, vazio, erro, sucesso e permissão;
6. remover mock/fallback demonstrativo;
7. testar navegação e build.

Prioridade P0: fazer `/api` alcançar a API NestJS real e o Prisma/Postgres. Nenhum spinner pode ficar infinito. Se a API falhar, exibir erro recuperável e botão Tentar novamente.

Depois executar Financeiro/Contabilidade → Eventos/Comercial → Marketing/Remarketing → SAC/Suporte/Estorno. Não parar para criar subfases. Entregar o maior bloco seguro possível por execução.

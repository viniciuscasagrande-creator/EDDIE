# EDDIE 9.2 → 9.6 — Pacote consolidado

Este pacote foi gerado sobre EDDIE(2). Não copia CSS do SafeSaff. Ele preserva a arquitetura EDDIE e adiciona a base operacional ausente para SAC, Suporte a Eventos e interface de Estorno, além dos documentos executivos 9.2–9.6.

## Regra de integridade
- não duplicar Ledger, saldo, evento, produtor ou pedido;
- Comercial é B2B produtor; SAC é comprador final;
- funções do sistema de referência são recuperadas por atribuição, não por CSS;
- frontend → API → serviço → Prisma/Ledger → retorno;
- dados fictícios não são considerados integração.

## Antes do deploy
1. pnpm install
2. pnpm db:generate
3. criar/aplicar migration para schemas `sac` e `suporte`
4. pnpm build
5. pnpm test
6. validar NEXT_PUBLIC_API_URL e DATABASE_URL

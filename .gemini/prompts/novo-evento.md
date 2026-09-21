# Prompt: adicionar um evento de domínio

Leia `GEMINI.md` na raiz.

Adicione o evento `<nome>.v1` publicado pelo módulo `<modulo>`.

1. Defina em `packages/contracts/src/events/<modulo>.ts` com `defineEvent` e Zod.
   - Dinheiro sempre como `Money` (centavos inteiros).
   - Datas como `z.string().datetime()`.
   - IDs como `z.string().uuid()`.
2. Registre no `EventCatalog`.
3. Emita via `outbox.emit` no service, dentro da transação que muda o dado.
4. Para cada módulo consumidor listado abaixo, adicione o nome ao array do
   `bus.subscribe` e trate o caso no handler — sempre atrás de `outbox.claim`.

Consumidores: <lista>

Nunca edite um evento já existente de forma breaking. Crie `.v2`.

# Prompt: criar um novo módulo

> Cole no chat do assistente. Substitua `<MODULO>` e preencha o contexto.
> Gere UM módulo por vez. Nunca peça "o sistema inteiro".

---

Leia `GEMINI.md` na raiz e siga todas as regras invioláveis.

Crie o módulo **<MODULO>** em `apps/api/src/modules/<modulo>/`, seguindo
exatamente o padrão já existente em `modules/eventos/` e `modules/estorno/`.

**Contexto do módulo**
- Responsabilidade: <uma frase>
- Entidades: <lista>
- Publica: <eventos>
- Consome: <eventos>
- Regras de negócio: <lista numerada>

**Gere nesta ordem, parando para eu revisar entre cada passo:**

1. `packages/contracts/src/events/<modulo>.ts` — os eventos com Zod, usando `defineEvent`. Registre-os no `EventCatalog` em `packages/contracts/src/index.ts`.
2. Os models Prisma no schema `<modulo>` dentro de `apps/api/prisma/schema.prisma`. Lembre: IDs de outros módulos são escalares, SEM `@relation`.
3. `<modulo>.service.ts` — lógica de negócio. Toda mudança de estado dentro de `$transaction` + `outbox.emit`.
4. `<modulo>.public-service.ts` — porta pública, retornando DTOs achatados.
5. `<modulo>.consumer.ts` — subscribe idempotente via `outbox.claim`.
6. `<modulo>.controller.ts` + `<modulo>.dto.ts` com Zod.
7. `<modulo>.spec.ts` — testes das regras de negócio (sem banco; mock o Prisma).
8. `<modulo>/GEMINI.md` documentando o bounded context.
9. Registre o módulo em `app.module.ts`.

Não invente nomes de eventos: use os do `EventCatalog`. Se precisar de um novo, me pergunte antes.

# Template de Prompt: Criar Novo Evento de Domínio

Você deve seguir as convenções de contratos em `packages/contracts/`.

## Dados do Evento
- **Nome do Evento**: {{DOMINIO}}.{{ACAO}}.v{{VERSAO}} (ex: `pedido.pago.v1`)
- **Módulo Publicador**: {{MODULO_PRODUTOR}}
- **Módulos Consumidores**: {{MODULOS_CONSUMIDORES}}

## Passos Obrigatórios
1. Criar o arquivo `packages/contracts/src/events/{{DOMINIO}}.{{ACAO}}.v{{VERSAO}}.ts`:
   - Definir schema de validação com **Zod**.
   - Incluir metadados obrigatórios do envelope: `eventId`, `eventType`, `occurredAt`, `producer`, `correlationId`, `traceId`.
   - Exportar o tipo TypeScript inferido via `z.infer`.
2. Registrar o evento no índice central `packages/contracts/src/events/index.ts`.
3. Atualizar o `GEMINI.md` do módulo produtor e dos módulos consumidores.

# EDDIE 9.0 — LEIA PRIMEIRO

Este pacote foi consolidado sobre `EDDIE_BACKUP_GERAL_20260922_095240.zip`.

## O que foi preservado
Arquitetura modulith NestJS, Prisma multi-schema, Outbox/Event Bus, Ledger financeiro, bounded contexts existentes, PDT Next.js/React e identidade visual escura do EDDIE.

## O que foi acrescentado
- Menu e tela de Estorno integrados ao workflow existente.
- Bounded context SAC com persistência de chamados e consulta operacional.
- Bounded context Suporte a Eventos com ocorrências por evento.
- Schemas Prisma `sac` e `suporte`.
- Registro dos módulos novos no AppModule.
- Documentação da Consolidação Geral.

## Antes do deploy
O ambiente deste pacote não tinha acesso ao registry para baixar pnpm, portanto o build não pôde ser executado aqui. No VS Code: instale dependências, rode `pnpm db:generate`, crie/revise a migration Prisma para os dois novos schemas, rode os builds/testes e só então publique.

Não copie `.env` ou secrets antigos: eles foram removidos do pacote deliberadamente.

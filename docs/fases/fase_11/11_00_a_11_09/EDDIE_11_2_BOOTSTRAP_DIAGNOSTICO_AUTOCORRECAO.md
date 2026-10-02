# EDDIE 11.2 — Bootstrap Operacional + Diagnóstico Profundo + Autocorreção de Contexto

Base oficial: EDDIE 11.1 HOMOLOGADO.

## Objetivo
Fechar a cadeia de inicialização do EDDIE sem loading infinito e sem depender de um TENANT_ID manual incorreto.

## Fluxo 11.2
1. Next valida API_INTERNAL_URL.
2. Valida PRODUTOR_ID.
3. Consulta /health do NestJS e confirma PostgreSQL online.
4. Resolve o tenant real pelo cadastro do produtor no Prisma.
5. Se TENANT_ID estiver ausente ou divergente, usa o tenant real do produtor nesta inicialização.
6. Consulta os eventos com produtor + tenant resolvidos.
7. Valida EVENTO_ID preferencial; se inválido usa o primeiro evento real disponível.
8. Entrega contexto completo ao ProducerEventProvider em uma única chamada.

## Novas rotas
- GET /api/bootstrap — diagnóstico e bootstrap completo no Next.js.
- GET /api/context — compatibilidade; passa a usar o mesmo bootstrap.
- GET /api/eventos/produtor/:produtorId/contexto — resolução segura do tenant a partir do ID exato do produtor.

## Autocorreção segura
O EDDIE NÃO escolhe o primeiro produtor do banco. A autocorreção somente acontece quando PRODUTOR_ID identifica um produtor real; o tenant é derivado desse cadastro.

## Diagnóstico
A tela /diagnostico exibe etapas: backend-config, produtor-config, backend-health, database, resolver-produtor, tenant-resolvido, eventos e evento-selecionado.

## Vercel
Obrigatórios: API_INTERNAL_URL e PRODUTOR_ID. TENANT_ID passa a ser opcional para bootstrap porque pode ser resolvido pelo produtor. EVENTO_ID é opcional.

## Critério de homologação
/api/bootstrap deve retornar ok=true, stage=operacional e o cabeçalho deve sair de Carregando eventos... em até 10 segundos, terminando em evento real, estado vazio ou erro explícito.

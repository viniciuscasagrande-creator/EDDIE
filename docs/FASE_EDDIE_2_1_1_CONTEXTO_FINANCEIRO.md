# Fase EDDIE 2.1.1 — Contexto Produtor × Evento no Financeiro

## Objetivo
Eliminar IDs de evento digitados/configurados manualmente na operação financeira e usar os eventos reais pertencentes ao produtor autenticado/configurado no PDT, preservando integralmente Ledger, Prisma e APIs financeiras existentes.

## Implantado
- Endpoint `GET /eventos/produtor/:produtorId` com filtro por tenant e produtor.
- `ProducerEventProvider` global no PDT.
- Seletor de evento no Header, persistido no navegador.
- Financeiro reage automaticamente à troca do evento selecionado.
- Saldos, extrato e contas passam a consultar o evento ativo.
- Transferência entre eventos usa seletores com nomes reais, sem digitação de UUID.
- Evento de origem acompanha o contexto global; destino exclui o próprio evento de origem.
- Antecipação e repasse recebem automaticamente o evento ativo.

## Preservado
- Ledger e partidas dobradas.
- Prisma e schema existente.
- NestJS e contratos existentes.
- Regras de saldo disponível.
- Regras de transferência, repasse e antecipação.
- Demais módulos do EDDIE.

## Não criado propositalmente
- Segundo cadastro de eventos.
- Segundo contexto financeiro.
- Banco paralelo.
- IDs fictícios de evento.
- Métricas ou menus sem fonte operacional.

## Configuração
Permanecem necessárias apenas as variáveis de ambiente:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_PRODUTOR_ID`

`NEXT_PUBLIC_EVENTO_ID` deixa de ser necessária para a operação normal do Financeiro.

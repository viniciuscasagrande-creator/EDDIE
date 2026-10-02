# Fase EDDIE 2.1.2 — Gestão de Saldos por Evento

## Objetivo
Disponibilizar a posição financeira real do produtor por evento sem criar saldo persistido, tabela paralela ou segundo Ledger.

## Implantado
- Endpoint `GET /financeiro/saldos/produtor/:produtorId/eventos`.
- Consolidação de saldo disponível, bloqueado, reserva de estorno, retido e patrimônio por evento.
- Consolidado do produtor calculado sobre os mesmos lançamentos do Ledger.
- Tela Gestão de Saldos com visão consolidada e tabela de eventos.
- Ação **Operar** altera o contexto global para o evento escolhido.
- Extrato do evento selecionado permanece auditável pelo Ledger.

## Integridade preservada
- Nenhuma tabela de saldo foi criada.
- Nenhum saldo é gravado ou recalculado no frontend.
- Prisma, Ledger, NestJS, Outbox e contexto Produtor × Evento foram reutilizados.
- Transferências entre eventos continuam neutras para receita/GMV.
- Não foram criados cards ou métricas sem fonte financeira real.

## Fora desta fase
Compromissos futuros que ainda não possuam fato gerador no Ledger não são apresentados como saldo. Conciliação, agenda de repasses e projeções permanecem para fases próprias.

# Módulo EVENTOS

## Bounded context
É o **catálogo**: o que está à venda, quando, onde e por quanto.
Não sabe nada sobre pedidos, pagamentos ou clientes.

## Entidades
`Produtor` -> `Evento` -> `Sessao` -> `Setor` -> `Lote`

- Um **Evento** pode ter N **Sessões** (turnê, múltiplas datas).
- Uma **Sessão** tem N **Setores** (Pista, Camarote). Setor marcado tem assento.
- Um **Setor** tem N **Lotes** em ordem crescente de preço (1º, 2º, 3º lote).
- `Lote.precoFace` é a receita do produtor. `Lote.taxaConveniencia` é a da plataforma.

## Publica
`evento.publicado.v1`, `evento.sessao_criada.v1`, `evento.lote_aberto.v1`,
`evento.cancelado.v1`, `evento.adiado.v1`

## Consome
- `pedido.pago.v1` -> incrementa `Lote.vendidos` (espelho para dashboard)
- `pagamento.estornado.v1` -> decrementa `Lote.vendidos`
- `acesso.checkin_realizado.v1` -> ocupação real da sessão

## Regras de negócio
1. Só publica evento com >= 1 sessão e >= 1 lote ativo.
2. Evento publicado não pode ter preço de lote alterado — abra um lote novo.
3. Cancelar evento exige motivo e dispara estorno automático (`estornoAutomatico: true`).
4. Adiar mantém os ingressos válidos, mas abre janela de opção de estorno (CDC).
5. `Lote.vendidos` é **espelho**, nunca fonte da verdade — a disponibilidade real
   vive no módulo Inventário (Redis + Postgres).

## Dashboard
Curva de vendas vs. meta, ocupação por setor, sell-out estimado (regressão sobre
velocidade de venda), ticket médio por lote, receita projetada.

## Ao gerar código aqui
- Sempre `tenantId` no where de toda query.
- Toda mudança de estado do Evento passa por `$transaction` + `outbox.emit`.
- Preço é `Decimal`; converta para centavos (`Math.round(x * 100)`) ao emitir evento.

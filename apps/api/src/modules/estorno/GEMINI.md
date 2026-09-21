# Módulo ESTORNO

## Bounded context
Máquina de estados de reembolso e contestação. **Não move dinheiro** — ele decide
*se* e *quanto* estornar, e pede ao módulo Pagamentos que execute na adquirente.

## Máquina de estados
```
solicitado -> em_analise -> aprovado -> processando -> concluido
                         -> negado                  -> falhou -> processando (retry)
```
Toda transição vira uma linha em `TransicaoEstorno` (append-only) + `AuditLog`.

## Publica
`estorno.solicitado.v1`, `estorno.aprovado.v1`, `estorno.negado.v1`,
`pagamento.estornado.v1`, `estorno.chargeback_recebido.v1`

## Consome
- `evento.cancelado.v1` -> abre estorno TOTAL automático de todos os pedidos pagos
  (inclui a taxa de conveniência: `taxaRetida = 0`)
- `evento.adiado.v1` -> abre janela de opção; não estorna sozinho
- `pedido.pago.v1` -> registra a janela do CDC (7 dias de arrependimento)

## Regras de negócio
1. **Arrependimento (CDC art. 49):** até 7 dias da compra E com mais de 48h para o
   evento -> aprovação automática, estorno integral.
2. **Evento cancelado:** integral, taxa incluída, sem análise humana.
3. **Evento adiado:** o comprador escolhe manter ou estornar dentro da janela.
4. **Fora das regras acima:** vai para `em_analise` (aprovação humana).
5. **Chargeback** nunca é aprovação — é defesa. Monte evidências e responda no prazo.
6. Estorno aprovado SEMPRE gera lançamento de reversão na Contabilidade e débito no
   repasse do produtor (`debitoProdutor`).
7. Nunca estorne ingresso com check-in realizado sem aprovação de supervisor.

## Dashboard
Taxa de estorno por evento/produtor/motivo, tempo médio de processamento, valor
retido, chargeback rate por bandeira, win rate das defesas.

## Ao gerar código aqui
- Nunca altere `status` fora do `EstornoStateMachine.transicionar()`.
- Todo valor é `Decimal`. Estorno parcial soma os itens, não divide o total.

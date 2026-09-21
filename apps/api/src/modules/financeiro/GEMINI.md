# Módulo FINANCEIRO

## Bounded context
Central executiva, de tesouraria e governança dos recursos financeiros dos produtores e da plataforma.
Responsável pela **conta gráfica do produtor em partidas dobradas imutáveis (append-only)**, controle de buckets de saldo, repasses Pix, antecipação de recebíveis, conciliação e liquidação de contas a pagar de fornecedores vinculadas aos eventos.

## Entidades (Schema `financeiro`)
- `LancamentoLedger`: Livro-razão append-only em partidas dobradas. Chave única de idempotência: `@@unique([origem, referenciaId, bucket, tipo])`.
- `TransferenciaInterEvento`: Transferência de recursos entre eventos do mesmo produtor.
- `SolicitacaoRepasse`: Solicitação e liquidação de repasse bancário/Pix ao produtor.
- `SolicitacaoAntecipacao`: Motor de antecipação de recebíveis futuros com cálculo de deságio pró-rata dia.
- `ContaPagar`: Contas a pagar e despesas operacionais vinculadas aos eventos e centros de custos.
- `DivergenciaConciliacao`: Divergências de liquidação entre adquirentes/gateways e o banco.

## Buckets da Conta Gráfica
O saldo de um produtor **NUNCA** é uma coluna mutável numa tabela. É sempre derivado: `saldo = SUM(entradas) - SUM(saídas)`:
1. `disponivel`: Recursos liberados para repasse, transferência ou pagamento de fornecedores.
2. `bloqueado`: Valores comprometidos com solicitações de repasse em processamento ou retenção judicial/cautelar.
3. `reservado_estorno`: Fundo de reserva para cobertura de estornos, contestações e chargebacks.
4. `retido`: Vendas brutas em custódia até a realização da sessão do evento ou janela contratual de liquidação.

## Publica
- `financeiro.lancamento_ledger_criado.v1`
- `financeiro.transferencia_inter_evento.v1`
- `financeiro.repasse_solicitado.v1`
- `financeiro.repasse_liquidado.v1`
- `financeiro.antecipacao_solicitada.v1`
- `financeiro.antecipacao_liquidada.v1`
- `financeiro.divergencia_detectada.v1`

## Consome
- `pedido.pago.v1` -> Credita o valor de repasse do produtor (`repasseProdutor`) no bucket `retido`.
- `pagamento.estornado.v1` -> Debita o valor líquido (`valorEstornado - taxaRetida`) no bucket `reservado_estorno`.

## Regras de negócio invioláveis
1. **Ledger Imutável (Append-Only):** Nenhum registro de `LancamentoLedger` é alterado (`UPDATE`) ou deletado (`DELETE`). Ajustes são feitos exclusivamente via novo lançamento compensatório (estorno/ajuste).
2. **Saldo Derivado:** Saldo é sempre computado sob demanda a partir do ledger.
3. **Isolamento de Tenant e Produtor:** Toda query e transação exige `tenantId` e `produtorId`. Nenhum produtor enxerga dados de outro.
4. **Transferência Inter-Eventos:** Origem e destino devem pertencer ao mesmo produtor e ter IDs distintos. Exige saldo disponível suficiente na origem e gera partidas dobradas (débito na origem + crédito no destino).
5. **Bloqueio Cautelar em Repasse:** Ao solicitar repasse, o saldo é movido de `disponivel` para `bloqueado` no mesmo instante.
6. **Deságio Pró-Rata Dia:** O cálculo de antecipação segue rigorosamente `custo = valorBruto * (taxa / 30 / 100) * diasAntecipados`. Valores em centavos (`Money`).
7. **Liquidação de Despesas com Saldo do Evento:** Contas a pagar só são liquidadas se o saldo disponível no respectivo evento for suficiente.
8. **Fronteira com Contabilidade:** O Financeiro opera o caixa e a tesouraria; a escrituração contábil e SPED vivem exclusivamente no módulo independente `contabilidade`.

## Dashboard & Telas
- Rotas: `/financeiro/dashboard`, `/financeiro/conta-financeira`, `/financeiro/contas`, `/financeiro/tesouraria`, `/financeiro/compras-fornecedores`, `/financeiro/controladoria`, `/financeiro/conciliacao`, `/financeiro/relatorios`.
- Filtros globais persistentes: Produtora / Evento / Período.

## Ao gerar código aqui
- Moeda é `Decimal(14, 2)` no Prisma e inteiro em centavos (`number`) nos DTOs e contratos.
- Toda alteração de estado deve ocorrer dentro de `$transaction` e publicar no `outbox`.
- Acesso de outros módulos é **exclusivamente** via `FinanceiroPublicService`.

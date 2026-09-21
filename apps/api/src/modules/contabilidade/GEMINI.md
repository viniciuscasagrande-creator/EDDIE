# Módulo CONTABILIDADE

## Bounded context
Escrituração contábil em **partidas dobradas (Débito e Crédito)**, Plano de Contas padronizado, Livro Diário, Livro Razão, Balancete de Verificação, DRE Gerencial, Fechamento de Competência Mensal e Conciliação Contábil.

## Regras invioláveis
1. **Segregação Estrita de Recursos:** Recursos pertencentes a terceiros (produtores de eventos) NUNCA são reconhecidos como receita própria da DiskIngressos. O valor do ingresso transita no Passivo Circulante (`Recursos de Terceiros a Repassar`), enquanto apenas as taxas de conveniência/serviço são reconhecidas na conta de Resultado (`Receita Própria de Serviços`).
2. **Equilíbrio de Partidas Dobradas:** Todo lançamento contábil exige $\sum \text{Débitos} = \sum \text{Créditos}$ estritamente. Lançamentos desbalanceados são rejeitados na camada de serviço.
3. **Período Fechado:** Competências com status `fechado` são imutáveis. Lançamentos adicionais ou correções exigem formalização de `reabertura` com autorização e auditoria.
4. **Independência do Financeiro:** O Financeiro opera o caixa, contas a pagar e repasses; a Contabilidade traduz os fatos em escrituração contábil padronizada via eventos assíncronos.

## Entidades (Schema `contabilidade`)
- `ContaContabil`: Plano de contas hierárquico com código, natureza (devedora/credora), tipo e indicador de analítica/sintética.
- `LancamentoContabil`: Cabeçalho do lançamento com competência, histórico, total e vínculo com documento de origem.
- `PartidaContabil`: Linhas individuais de débito e crédito vinculadas ao lançamento e à conta contábil.
- `FechamentoContabil`: Registro do fechamento da competência com totais de débitos, créditos e resultado apurado.
- `ConciliacaoContabil`: Confronto entre o saldo da conta contábil e o saldo do extrato bancário/adquirente.

## Publica
- `contabilidade.lancamento_criado.v1`
- `contabilidade.periodo_fechado.v1`
- `contabilidade.periodo_reaberto.v1`
- `contabilidade.conciliacao_finalizada.v1`

## Consome
- `pedido.pago.v1` -> Escritura venda segregando ativo adquirente, passivo repasse e receita de serviço.
- `financeiro.repasse_liquidado.v1` -> Baixa obrigação de repasse contra saída do banco.
- `pagamento.estornado.v1` -> Escritura o estorno compensatório.

## Ao gerar código aqui
- Moeda em centavos (`number` / `Money`) nos DTOs e `Decimal(14, 2)` no banco.
- Strict TypeScript sem `any`.
- Acesso por outros módulos exclusivamente via `ContabilidadePublicService`.

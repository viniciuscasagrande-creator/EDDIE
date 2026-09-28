# Inteligência — GEMINI.md

> Contexto do módulo `inteligencia` (EDDIE 11.30: Rentabilidade Real, Inteligência de Receita e Inteligência do Produtor).

## O que é este módulo

O módulo **Inteligência** transforma a verdade operacional do EDDIE (inventário, portaria, pagamentos, contratos e contabilidade) em inteligência para tomada de decisão gerencial e comercial.

Estruturado em três grandes motores integrados:
1. **11.30.1 — Rentabilidade Real:** Decomposição analítica da cadeia:
   $$\text{Venda Bruta} - \text{Estornos} - \text{Chargebacks} = \text{GMV Líquido} \rightarrow \text{Receita Disk} - \text{Adquirência} - \text{Comissões} - \text{Custos Atribuíveis} = \text{Margem Disk}$$
   Dimensões por evento, produtor, canal, forma de pagamento, adquirente e lote, além de margem por ingresso e ponto de equilíbrio Disk.
2. **11.30.2 — Inteligência de Receita:** Velocidade de vendas, previsão de esgotamento, inteligência e análise de lotes, simulador de cenários de preços (Conservador, Base, Otimista) e rastreamento de oportunidades/perdas com receita recuperada via remarketing.
3. **11.30.3 — Inteligência do Produtor:** Visão 360º do produtor (B2B), linha do tempo histórica, comportamento financeiro consolidado, indicadores de saúde em 6 dimensões objetivas (sem score artificial único), alertas com explicabilidade ("Por que estou vendo isso?"), comparativos entre edições e metas vs realizado vs previsões metodológicas.

## Schema Postgres

- `inteligencia`

## Invariantes Invioláveis

1. **Dados Reais Auditados:** Nenhum número de receita, custo ou margem é inventado; a origem é a cadeia auditada de Pagamento + Ledger + Contrato + Taxas + Tesouraria + Contabilidade.
2. **Segregação de Informações Sensíveis:** A Margem Disk e custos internos são restritos a papéis administrativos e financeiros. Produtores só têm acesso a seus próprios eventos e indicadores expressamente autorizados.
3. **Explicabilidade Obrigatória:** Todo alerta ou recomendação analítica deve conter seus fatores determinantes ("Por que estou vendo isso?").
4. **Previsões Claras:** Projeções e cenários são identificados como estimativas com metodologia explícita, nunca valores garantidos.

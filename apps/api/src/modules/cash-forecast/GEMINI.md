# GEMINI.md — Módulo Cash Forecast, Liquidity & Working Capital OS (EDDIE 11.26)

## Responsabilidade
Previsão financeira de fluxo de caixa, gestão de liquidez, análise de capital de giro, cenários de estresse, calendário de pagamentos/recebimentos e backtesting de acurácia preditiva.

## Regra Inviolável Mestra
> **Saldo bancário ≠ saldo do Ledger ≠ saldo disponível ≠ valor reservado ≠ valor em liquidação ≠ valor projetado.**
O valor projetado é uma estimativa estatística preditiva e NUNCA pode ser somado ao saldo disponível ou sacável pelo produtor ou pela plataforma.

## Horizontes e Cenários
- Horizontes: D+1, D+7, D+15, D+30, D+60 e D+90.
- Cenários: BASE, CONSERVADOR, OTIMISTA, CUSTOMIZADO.
- Premissas: Versionamento imutável de taxas de juros, curvas de venda e taxas de estorno.

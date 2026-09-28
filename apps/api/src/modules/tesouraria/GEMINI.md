# Módulo de Tesouraria, PIX & CNAB 240/400 (EDDIE 11.25)

## Responsabilidade
Gestão da camada de **Banking Engine & Tesouraria Corporativa**:
- Posição consolidada de caixa em tempo real por banco (Itaú, Bradesco, BB, Santander).
- Geração de remessas bancárias estruturadas nos padrões CNAB 240 e CNAB 400 com controle de integridade SHA-256 e numeração sequencial NSR.
- Parsing e processamento de arquivos de retorno bancário com conciliação automática 1:1 e atualização de saldos no Ledger.
- Liquidação instantânea de repasses a produtores via PIX Direto (SPI/DICT) com idempotência estrita.
- Regra Inviolável: **Saldo Bancário Real ≠ Saldo do Ledger ≠ Saldo Disponível ≠ Valor em Liquidação ≠ Valor Projetado.**

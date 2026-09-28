# EDDIE 11.25 — Banking Engine, PIX, CNAB 240/400 & Liquidação de Tesouraria OS

## Documento Mestre de Arquitetura e Engenharia Bancária

---

### 1. Visão Geral

O pacote **EDDIE 11.25** implementa a camada transacional de **Banking Engine & Tesouraria Corporativa** da DiskIngressos. Este módulo estabelece a ponte oficial entre o Ledger contábil imutável e as instituições financeiras integradas (Itaú, Bradesco, Banco do Brasil, Santander e o ecossistema PIX do BACEN).

---

### 2. Regra Inviolável de Tesouraria

> **Saldo Bancário Real ≠ Saldo do Ledger ≠ Saldo Disponível ≠ Valor em Liquidação ≠ Valor Projetado.**

- **Saldo Bancário Real:** Posição financeira consolidada informada pelos extratos oficiais das contas correntes corporativas.
- **Saldo do Ledger:** Total apurado pelo razão imutável de partidas dobradas e contas gráficas de produtores.
- **Saldo Disponível:** Montante líquido liberado para repasses, após retenção das reservas legais, provisões de CDC e garantias contra chargebacks.
- **Valor em Liquidação:** Montantes transmitidos em lotes de remessa CNAB ou agendamentos com liquidação pendente D+1/D+2.

---

### 3. Principais Componentes

1. **Gestão Multibanco de Contas Corporativas:**
   - Itaú Unibanco S.A. (341) — Conta Corrente Operacional Principal.
   - Banco Bradesco S.A. (237) — Conta Corrente de Arrecadação e Contingência.
   - Banco do Brasil S.A. (001) — Conta de Aplicações de Liquidez Diária (CDB 100% CDI).

2. **Geração e Parsing de Arquivos CNAB (240 e 400):**
   - Header de Arquivo e Header de Lote com Numeração Sequencial de Remessa (NSR).
   - Segmentos A e B para pagamentos via TED, DOC e chaves PIX.
   - Cálculo e validação de hash criptográfico imutável SHA-256 para cada lote gerado e processado.

3. **Engine de PIX Payout Instantâneo:**
   - Integração com SPI / DICT para transferências instantâneas a produtores.
   - Controle estrito de idempotência contra cliques duplos (`idempotencyKey`).
   - Armazenamento de EndToEndId oficial do BACEN e geração de comprovante de autenticação.

# Especificação Técnica — CNAB 240/400 & PIX SPI

## Padrões de Integração Bancária e Mensageria Financeira

---

### 1. Layouts de Remessa e Retorno Suportados

1. **CNAB 240 (FEBRABAN):**
   - Utilizado para pagamentos em lote no Itaú (341) e Santander (033).
   - Registros de 240 posições.
   - Estrutura:
     - Registro 0: Header de Arquivo.
     - Registro 1: Header de Lote de Pagamento.
     - Registro 3: Segmento A (Favorecido, Banco, Agência, Conta, Valor).
     - Registro 3: Segmento B (Dados Complementares / Chave PIX).
     - Registro 5: Trailler de Lote.
     - Registro 9: Trailler de Arquivo.

2. **CNAB 400:**
   - Utilizado para compatibilidade legada no Banco Bradesco (237) e Banco do Brasil (001).
   - Registros de 400 posições.

---

### 2. Códigos de Ocorrência de Retorno Tratados

- `00`: Crédito ou Liquidação Efetivada com Sucesso.
- `01`: Pagamento Agendado para Data Futura.
- `03`: Rejeitado — Agência ou Conta de Destino Inválida.
- `04`: Rejeitado — CPF/CNPJ do Favorecido Divergente da Conta.
- `10`: Rejeitado — Saldo Bloqueado ou Insuficiente.

---

### 3. Mecanismo de Idempotência PIX SPI

- Todo payout executado recebe uma `idempotencyKey` única vinculada à autorização de repasse.
- Tentativas subsequentes com a mesma chave retornam o registro existente sem reenviar ao SPI.
- Geração de código de autenticação com prefixo `AUTH-BACEN-` e código EndToEndId no formato padrão BACEN `E[ISPB][Data][Sequencial]`.

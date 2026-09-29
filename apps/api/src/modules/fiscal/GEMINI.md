# Módulo `fiscal` — EDDIE 11.38: Fiscal, Tributário, Documentos Fiscais e Obrigações

## O que é este módulo

O módulo **Fiscal** adiciona a inteligência e o tratamento tributário aos fatos econômicos do EDDIE. Ele completa o encadeamento estabelecido em **Pagamentos → Ledger → Tesouraria → Contabilidade**, garantindo conformidade com a legislação tributária brasileira e com o período de transição da **Reforma Tributária do Consumo** (LC 214/2025 e LC 227/2026).

## Princípios Invioláveis

1. **Segregação de Receita e Base Tributável:**
   ```text
   VENDA DO INGRESSO ≠ RECEITA DA DISK ≠ BASE TRIBUTÁVEL DA DISK
   ```
   Valores de ingressos pertencem ao produtor e transitam em conta/caixa de terceiros. A base de cálculo tributária da Disk restringe-se estritamente à taxa de serviço / remuneração da intermediação pactuada em contrato.

2. **Parametrização & Versionamento Temporal de Regras:**
   - **Nenhuma regra tributária é hardcoded** no fluxo de vendas ou checkout.
   - Regras fiscais possuem código, versão sequencial, regime tributário e intervalo de vigência (`vigenciaInicio` e `vigenciaFim`).
   - Adaptação dinâmica para a transição dos tributos atuais (ISS, PIS, COFINS) para o novo modelo de IVA Dual (CBS federal e IBS subnacional).

3. **Documentos Fiscais & Idempotência:**
   - Toda emissão de NFS-e possui `chaveFiscal` única e idempotente.
   - Estados estritos: `PENDENTE` → `EM_PROCESSAMENTO` → `AUTORIZADO` / `REJEITADO` / `CANCELADO`.
   - Armazenamento de XML assinado e integração com a Central de Documentos 11.35.
   - Suporte nativo a CNPJ alfanumérico (padrão RFB).

4. **Retenções Tributárias com Responsabilidade:**
   - Retenções na fonte (IRRF, PIS/COFINS/CSLL 4,65%, ISS Retido) são tratadas com identificação expressa do tomador/prestador e responsabilidade pelo recolhimento.

5. **Memória de Cálculo & Trilha de Auditoria:**
   - Toda apuração mensal de tributos mantém memória de cálculo detalhada em JSON estruturado, respondendo à pergunta: "Como este tributo foi calculado?".
   - Rastreabilidade ponta a ponta: Apuração → Guia/Tributo → Documento Fiscal → Pedido/Operação Core.

6. **Three-Way Match no Fiscal de Entrada:**
   - Validação em 3 vias para notas fiscais de fornecedores:
     ```text
     Contrato / Pedido de Compra ↔ Documento Fiscal (NFe/NFSe) ↔ Ordem de Pagamento (Tesouraria)
     ```
   - Alocação do custo por `eventoId` para alimentar a rentabilidade real do módulo Inteligência (EDDIE 11.30).

7. **Conciliação Fiscal em Quatro Pontos:**
   - Ponto 1: Operação Core ↔ Documento Fiscal Emitido
   - Ponto 2: Documento Fiscal ↔ Lançamento Contábil
   - Ponto 3: Contabilidade ↔ Apuração Fiscal
   - Ponto 4: Apuração Fiscal ↔ Pagamento em Tesouraria

## Schema Postgres

- `fiscal`

## Porta Pública

Outros módulos consomem exclusivamente `FiscalPublicService`:
- `consultarDocumentoPorOrigem(tenantId, origemTipo, origemReferenciaId)`
- `verificarSituacaoFiscalEvento(tenantId, eventoId)` (utilizado pelo Gate Fiscal do Event Closing 11.24)
- `simularTributacao(tenantId, input)`
- `verificarPeriodoFechado(tenantId, competencia)`

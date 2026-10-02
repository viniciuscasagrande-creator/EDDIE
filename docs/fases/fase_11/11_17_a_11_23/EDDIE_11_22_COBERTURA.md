# EDDIE 11.22 — Modelo de Cobertura de Análise e Garantia Anti-Falso-Positivo

Este documento formaliza a metodologia de cálculo de cobertura da análise do **EDDIE 11.22**, bem como o mecanismo algorítmico inviolável que impede a apresentação de falsos relatórios de "100% íntegro" quando qualquer fonte de dados externa ou interna estiver inacessível.

---

## 1. As 8 Fontes da Cadeia Transacional

Para que uma transação seja declarada como possuindo cobertura integral (100%), todos os 8 elos da esteira transacional devem ser consultados com sucesso:

| Índice | Fonte de Dados | Módulo Responsável | Tipo de Conexão | Dado Verificado |
|---|---|---|---|---|
| 1 | `pedidos` | `core/pedidos` | Banco / Prisma | Status, valor bruto e comprador |
| 2 | `ingressos` | `portaria` / 11.08 | Banco / Prisma | Ingressos emitidos e QR Codes |
| 3 | `pagamentos` | `pagamentos` / 11.04 | Banco / Prisma | Autorização e captura da transação |
| 4 | `gateways` | Gateways Externos | APIs / Webhooks | NSU, tid e status de captura no adquirente |
| 5 | `taxas` | `comercial` / 11.19 | Snapshot / Engine | Snapshot de taxa contratada vigente (Fixa/%) |
| 6 | `ledger` | `financeiro` / 11.19 | Ledger Imutável | Entradas de crédito, retenção e taxas |
| 7 | `repasses` | `settlement` / 11.20 | Settlement Engine | Lote de repasse e aprovação de payout |
| 8 | `bancos` | `tesouraria` / CNAB | Extrato / PIX API | Código e valor do retorno bancário liquidado |
| * | `contabilidade` | `contabilidade` / 11.21 | Diário Contábil | Escrituração em partidas dobradas (CPC 47) |

---

## 2. Regra Matemática Inviolável: Prevenção de Falso 100%

Quando uma fonte (por exemplo, a API do Gateway Adquirente ou o serviço de Webhooks Bancários) estiver indisponível ou retornar erro transitório:

1. **Redução Linear da Cobertura Geral:**
   $$\text{Cobertura Geral} = \frac{\text{Fontes Disponíveis}}{\text{Total de Fontes (8)}} \times 100\%$$
   Se 1 fonte estiver indisponível, a cobertura máxima permitida é de **87,5%**. Se 2 fontes estiverem fora, cai para **75,0%**.

2. **Teto Inviolável da Taxa de Integridade:**
   $$\text{Taxa de Integridade Apresentada} \le \text{Cobertura Geral}$$
   É matematicamente impossível o painel apresentar `100% de Integridade` se qualquer fonte estiver inacessível. O sistema sinaliza imediatamente:
   - Flag `isPartialAudit = true`
   - Banner de alerta em âmbar com a mensagem descritiva:
     > *"Aviso de Auditoria: Uma ou mais fontes da cadeia transacional estão indisponíveis ou operando com restrições. A integridade real não pode ser garantida com 100% de certeza."*

3. **Status da Cadeia:**
   As transações afetadas pela fonte indisponível recebem o status `BLOQUEADO_POR_FONTE`, impedindo encerramento prematuro ou falso diagnóstico de conformidade.

---

## 3. População Declarada e Períodos de Auditoria

Todo relatório e indicador no Dashboard de Revenue Assurance explicita a população analisada:
- **População Auditada na Homologação:** 14.250 transações.
- **Volume Total Auditado:** R$ 482.500,00 (48.250.000 centavos).
- **Período de Referência:** 01/01/2026 a 31/12/2026 (Competência Setembro/2026).
- **Eventos Monitorados:** `evento-operacao` (Festival DiskIngressos Live 2026) e `evento-1` (Turnê Nacional Rock Fest 2026).

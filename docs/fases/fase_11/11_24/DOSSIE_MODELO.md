# Modelo do Dossiê Final Imutável de Fechamento de Evento
## EDDIE 11.24 — Estrutura Canônica das 20 Seções com Hash SHA-256

```json
{
  "version": "v1",
  "eventId": "ev-fest-2026",
  "eventName": "Festival DiskIngressos Live 2026",
  "tenantId": "00000000-0000-0000-0000-000000000001",
  "producerId": "00000000-0000-0000-0000-000000000002",
  "producerName": "Live Nation Entretenimento Ltda",
  "producerDocument": "12.345.678/0001-90",
  "closedAt": "2026-09-28T02:16:35.975Z",
  "closedBy": "operador-financeiro-01",
  "approvedBy": "diretor-financeiro-02",
  "closingStatus": "FECHADO",
  "integrityHashSha256": "ac959bfec421bf75ee8a519d0c659e37833d601929ce6dbe0d5be5bf45ca34d3",
  "sections": {
    "s01_identificacao": {
      "eventId": "ev-fest-2026",
      "eventName": "Festival DiskIngressos Live 2026",
      "tenantId": "00000000-0000-0000-0000-000000000001",
      "producerId": "00000000-0000-0000-0000-000000000002",
      "producerName": "Live Nation Entretenimento Ltda",
      "producerDocument": "12.345.678/0001-90"
    },
    "s02_cutoffVersao": {
      "cutoffAt": "2026-09-28T02:16:35.973Z",
      "version": "v1",
      "closingCycle": 1
    },
    "s03_resumoOperacional": {
      "statusOperacional": "ENCERRADO",
      "encerramentoAt": "2026-09-28T02:16:35.975Z"
    },
    "s04_inventarioIngressosCheckin": {
      "inventory": {
        "totalCapacity": 5000,
        "soldCount": 4200,
        "courtesyCount": 300,
        "cancelledCount": 150,
        "availableCount": 350
      },
      "tickets": {
        "issuedTicketsCount": 4500,
        "validatedTicketsCount": 4320,
        "unusedTicketsCount": 180
      },
      "cutoffTimestamp": "2026-09-28T02:16:35.973Z",
      "postCutoffMovementsCount": 0
    },
    "s05_vendasPagamentos": {
      "totalPedidos": 1250,
      "pedidosPagos": 1248,
      "canais": { "online": 1100, "pdv": 148 }
    },
    "s06_taxas": {
      "taxaFixaCentavos": 25000,
      "taxaPercentualBps": 1000,
      "snapshotRegra": "CONTRATO_PADRAO_VIGENTE_2026"
    },
    "s07_estornosChargebacks": {
      "cdcCount": 1,
      "cdcTotalCents": 200000,
      "chargebackCount": 0,
      "chargebackTotalCents": 0
    },
    "s08_ledgerSaldos": {
      "fonteModulo": "11.19_FINANCEIRO",
      "totalLancamentosLedger": 342,
      "saldoContaGraficaCents": 4025000
    },
    "s09_transferencias": {
      "transferenciasInterEventoCents": 0,
      "splitCount": 0
    },
    "s10_custosDespesas": {
      "custosOperacionaisCents": 0
    },
    "s11_repassesAnteriores": [
      {
        "repasseId": "rep-ant-01",
        "valorCents": 4000000,
        "liquidadoEm": "2026-09-21T02:16:35.975Z",
        "comprovante": "COMP-TED-2026-001"
      }
    ],
    "s12_settlementFinal": {
      "gmvCents": 10000000,
      "platformFeeFixedCents": 25000,
      "platformFeePercentageCents": 1000000,
      "platformFeeTotalCents": 1025000,
      "paymentProcessingFeeCents": 250000,
      "cdcRefundsCents": 200000,
      "chargebacksCents": 0,
      "priorPayoutsCents": 4000000,
      "securityHoldCents": 500000,
      "netFinalPayoutCents": 4025000,
      "bankDestinationMasked": "Banco do Brasil (001) Ag: ***4 C/C: *****-8 / Pix: ***.456.789-**"
    },
    "s13_bancoConciliacao": {
      "banco": "Banco do Brasil (001)",
      "agenciaMasked": "***4",
      "contaMasked": "*****-8",
      "chavePixMasked": "***.456.789-**",
      "conciliado": true
    },
    "s14_revenueAssurance": {
      "moduloFonte": "11.22_REVENUE_ASSURANCE",
      "matrizIntegridadeCoberturaPercentual": 100,
      "anomaliasCriticasAbertas": 0
    },
    "s15_contabilidade": {
      "moduloFonte": "11.21_CONTABILIDADE",
      "partidasDobradasEquilibradas": true,
      "dreCalculada": true
    },
    "s16_pendenciasExcecoes": [],
    "s17_aprovacoes": {
      "operadorId": "operador-financeiro-01",
      "aprovadorDiretorId": "diretor-financeiro-02",
      "diretorToken": "AUTH-DIR-MASTER-99",
      "aprovadoEm": "2026-09-28T02:16:35.975Z"
    },
    "s18_documentos": [
      {
        "tipo": "CONTRATO",
        "titulo": "Contrato de Produção & Bilheteria",
        "hashDoc": "doc-hash-contract-01",
        "emitidoEm": "2026-09-28T02:16:35.975Z"
      },
      {
        "tipo": "EXTRATO_CONCILIADO",
        "titulo": "Extrato Conciliado Adquirente",
        "hashDoc": "doc-hash-concil-02",
        "emitidoEm": "2026-09-28T02:16:35.975Z"
      }
    ],
    "s19_auditoria": [
      { "acao": "CUTOFF_INICIADO", "usuario": "operador-financeiro-01", "timestamp": "2026-09-28T02:16:35.973Z" },
      { "acao": "GATES_VALIDADOS", "usuario": "operador-financeiro-01", "timestamp": "2026-09-28T02:16:35.975Z" },
      { "acao": "FECHAMENTO_HOMOLOGADO", "usuario": "diretor-financeiro-02", "timestamp": "2026-09-28T02:16:35.975Z" }
    ],
    "s20_integridadeCriptografica": {
      "algoritmo": "SHA-256",
      "canonizado": true
    }
  }
}
```

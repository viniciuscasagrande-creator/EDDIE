export interface LedgerEntryE2E {
  entryId: string;
  pedidoId: string;
  eventoId: string;
  produtorId: string;
  tipo: 'DEBITO' | 'CREDITO';
  conta: 'ATIVO_GATEWAY' | 'PASSIVO_CUSTODIA_PRODUTOR' | 'RECEITA_TAXA_SERVICO' | 'BANCO_REPASSE';
  valorCentavos: number;
  descricao: string;
  timestamp: string;
  correlationId: string;
}

export interface SettlementSummaryE2E {
  eventoId: string;
  produtorId: string;
  gmvTotalCentavos: number;
  custodiaProdutorLiquidoCentavos: number;
  taxaServicoDiskIngressosCentavos: number;
  estornosCentavos: number;
  saldoDisponivelRepasseCentavos: number;
  repassesExecutadosCentavos: number;
  saldoBloqueadoDivergenciaCentavos: number;
  conciliacaoBancariaStatus: 'CONCILIADO_100%' | 'DIVERGENCIA';
}

export function generateLedgerForOrder(
  pedidoId: string,
  eventoId: string,
  produtorId: string,
  totalIngressosCentavos: number,
  totalTaxasCentavos: number,
  correlationId: string
): LedgerEntryE2E[] {
  const timestamp = new Date().toISOString();
  const totalGeral = totalIngressosCentavos + totalTaxasCentavos;

  return [
    // 1. Débito no Ativo (Gateway a receber)
    {
      entryId: `led_${Date.now()}_01`,
      pedidoId,
      eventoId,
      produtorId,
      tipo: 'DEBITO',
      conta: 'ATIVO_GATEWAY',
      valorCentavos: totalGeral,
      descricao: `Recebimento bruto de pedido ${pedidoId} via Gateway`,
      timestamp,
      correlationId
    },
    // 2. Crédito no Passivo (Custódia do Produtor - Inviolável!)
    {
      entryId: `led_${Date.now()}_02`,
      pedidoId,
      eventoId,
      produtorId,
      tipo: 'CREDITO',
      conta: 'PASSIVO_CUSTODIA_PRODUTOR',
      valorCentavos: totalIngressosCentavos,
      descricao: `Custódia operacional transitória pertencente ao produtor ${produtorId}`,
      timestamp,
      correlationId
    },
    // 3. Crédito na Receita Própria (Apenas a taxa DiskIngressos!)
    {
      entryId: `led_${Date.now()}_03`,
      pedidoId,
      eventoId,
      produtorId,
      tipo: 'CREDITO',
      conta: 'RECEITA_TAXA_SERVICO',
      valorCentavos: totalTaxasCentavos,
      descricao: `Receita de taxa de serviço de conveniência DiskIngressos (Take-rate)`,
      timestamp,
      correlationId
    }
  ];
}

export const featureManifest = {
  phase: "11.14.4",
  title: "EDDIE 11.14.4 — Financeiro, Ledger, Conciliação e Repasse E2E",
  routes: [
    "/api/e2e/ciclo/ledger",
    "/api/e2e/ciclo/repasses"
  ],
  strictCustodySegregation: true,
  doubleEntryLedgerEnforced: true
} as const;

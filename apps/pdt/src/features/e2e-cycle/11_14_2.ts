export interface OrderE2E {
  pedidoId: string;
  eventoId: string;
  produtorId: string;
  compradorNome: string;
  compradorCpfMascarado: string;
  itens: Array<{
    loteId: string;
    nomeIngresso: string;
    quantidade: number;
    valorUnitarioCentavos: number;
    taxaServicoUnitarioCentavos: number;
  }>;
  totalIngressosCentavos: number;
  totalTaxasCentavos: number;
  totalGeralCentavos: number;
  formaPagamento: 'PIX' | 'CARTAO_CREDITO';
  status: 'PENDENTE' | 'PAGO' | 'CANCELADO' | 'ESTORNADO';
  correlationId: string;
  pixCopiaECola?: string;
  createdAt: string;
  paidAt?: string;
  ingressosEmitidos: Array<{
    ingressoId: string;
    codigoBarra: string;
    qrCodeAssinado: string;
    status: 'DISPONIVEL' | 'UTILIZADO' | 'CANCELADO';
  }>;
}

export function createOrderE2E(params: {
  eventoId: string;
  produtorId: string;
  compradorNome: string;
  compradorCpf: string;
  loteId: string;
  quantidade: number;
  formaPagamento: 'PIX' | 'CARTAO_CREDITO';
  correlationId: string;
}): OrderE2E {
  const precoCentavos = 12000;
  const taxaCentavos = 1200;
  const totalIngressos = precoCentavos * params.quantidade;
  const totalTaxas = taxaCentavos * params.quantidade;
  const totalGeral = totalIngressos + totalTaxas;
  const pedidoId = `ped_e2e_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const ingressosEmitidos = Array.from({ length: params.quantidade }).map((_, idx) => {
    const ingressoId = `ing_${pedidoId}_${idx + 1}`;
    const codigoBarra = `34191${Date.now()}${idx}`;
    const qrCodeAssinado = `QR_SIGN_v1_${ingressoId}_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    return {
      ingressoId,
      codigoBarra,
      qrCodeAssinado,
      status: 'DISPONIVEL' as const
    };
  });

  return {
    pedidoId,
    eventoId: params.eventoId,
    produtorId: params.produtorId,
    compradorNome: params.compradorNome,
    compradorCpfMascarado: params.compradorCpf.replace(/(\d{3})\d{6}(\d{2})/, '$1.***.***-$2'),
    itens: [
      {
        loteId: params.loteId,
        nomeIngresso: 'Pista 1º Lote',
        quantidade: params.quantidade,
        valorUnitarioCentavos: precoCentavos,
        taxaServicoUnitarioCentavos: taxaCentavos
      }
    ],
    totalIngressosCentavos: totalIngressos,
    totalTaxasCentavos: totalTaxas,
    totalGeralCentavos: totalGeral,
    formaPagamento: params.formaPagamento,
    status: 'PAGO',
    correlationId: params.correlationId,
    pixCopiaECola: params.formaPagamento === 'PIX' ? `00020126580014br.gov.bcb.pix0136${pedidoId}5204000053039865802BR5925DISK_INGRESSOS6008CURITIBA62070503***6304` : undefined,
    createdAt: new Date(Date.now() - 30000).toISOString(),
    paidAt: new Date().toISOString(),
    ingressosEmitidos
  };
}

export const featureManifest = {
  phase: "11.14.2",
  title: "EDDIE 11.14.2 — Venda, Pagamento e Ingresso E2E",
  routes: [
    "/api/e2e/ciclo/checkout-simulado",
    "/api/e2e/ciclo/pedidos/:pedidoId"
  ],
  strictCryptoSignedTickets: true,
  outboxPublished: true
} as const;

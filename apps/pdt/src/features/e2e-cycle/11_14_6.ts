export interface E2ETraceabilityReport {
  timestamp: string;
  correlationId: string;
  stagesCompleted: Array<{
    stage: string;
    description: string;
    status: 'CONCLUIDO_COM_SUCESSO' | 'PENDENTE' | 'FALHOU';
    evidenceId: string;
    verifiedInvariant: string;
  }>;
  financialConsistency: {
    totalPedidosGmvCentavos: number;
    totalLedgerCustodiaCentavos: number;
    totalTaxasRetidasCentavos: number;
    totalEstornadoCentavos: number;
    divergenciaCalculadaCentavos: number;
    status: '100%_CONCILIADO_SEM_DIVERGENCIA';
  };
  operationalConsistency: {
    ingressosEmitidos: number;
    ingressosUtilizadosPortaria: number;
    ingressosDisponiveis: number;
    ingressosCanceladosEstorno: number;
    divergenciaEstoque: 0;
  };
}

export const featureManifest = {
  phase: "11.14.6",
  title: "EDDIE 11.14.6 — Relatórios, Auditoria e Rastreabilidade E2E",
  routes: [
    "/api/e2e/ciclo/relatorios/conciliacao",
    "/api/e2e/ciclo/auditoria"
  ],
  strictTraceability: true,
  zeroAuditGaps: true
} as const;

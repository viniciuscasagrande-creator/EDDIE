export const featureManifest = {
  phase: "11.12.3",
  title: "EDDIE 11.12.3 — Anomalias, Risco Operacional e Recomendações",
  routes: [
    "/eventos/:eventoId/inteligencia/anomalias",
    "/api/eventos/:eventoId/anomalias",
    "/api/eventos/:eventoId/recomendacoes"
  ],
  requiresRealData: true,
  preserveEventContext: true
} as const;

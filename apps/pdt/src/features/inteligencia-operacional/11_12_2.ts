export const featureManifest = {
  phase: "11.12.2",
  title: "EDDIE 11.12.2 — Previsão de Vendas, Ocupação e Portaria",
  routes: [
    "/eventos/:eventoId/inteligencia/previsoes",
    "/api/eventos/:eventoId/previsoes/vendas",
    "/api/eventos/:eventoId/previsoes/portaria"
  ],
  requiresRealData: true,
  preserveEventContext: true
} as const;

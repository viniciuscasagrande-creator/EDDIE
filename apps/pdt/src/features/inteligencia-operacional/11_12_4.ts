export const featureManifest = {
  phase: "11.12.4",
  title: "EDDIE 11.12.4 — Inteligência Financeira, Liquidação e Repasses",
  routes: [
    "/eventos/:eventoId/inteligencia/financeira",
    "/api/eventos/:eventoId/inteligencia/financeira",
    "/api/produtores/:produtorId/inteligencia/repasses"
  ],
  requiresRealData: true,
  preserveEventContext: true
} as const;

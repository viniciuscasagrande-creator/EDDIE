export const featureManifest = {
  phase: "11.12.1",
  title: "EDDIE 11.12.1 — Inteligência Operacional em Tempo Real",
  routes: [
    "/eventos/:eventoId/inteligencia",
    "/api/eventos/:eventoId/inteligencia/resumo",
    "/api/eventos/:eventoId/inteligencia/series"
  ],
  requiresRealData: true,
  preserveEventContext: true
} as const;

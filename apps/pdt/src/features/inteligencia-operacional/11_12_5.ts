export const featureManifest = {
  phase: "11.12.5",
  title: "EDDIE 11.12.5 — Homologação da Inteligência + QA",
  routes: [
    "/api/inteligencia/health",
    "/api/inteligencia/modelos/status"
  ],
  requiresRealData: true,
  preserveEventContext: true
} as const;

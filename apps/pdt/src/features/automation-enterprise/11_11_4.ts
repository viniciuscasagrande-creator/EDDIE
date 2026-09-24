export const featureManifest = {
  "phase": "11.11.4",
  "title": "EDDIE 11.11.4 — Integração Real, Endpoints e QA Operacional",
  "routes": [
    "/api/automacoes/regras",
    "/api/automacoes/execucoes",
    "/api/automacoes/aprovacoes",
    "/api/operacao/alertas",
    "/api/eventos/:eventoId/cockpit"
  ],
  "requiresRealData": true,
  "preserveEventContext": true
} as const;

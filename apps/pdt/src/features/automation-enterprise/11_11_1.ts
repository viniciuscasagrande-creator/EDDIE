export const featureManifest = {
  "phase": "11.11.1",
  "title": "EDDIE 11.11.1 — Automação Operacional Enterprise",
  "routes": [
    "/automacoes",
    "/automacoes/regras",
    "/automacoes/execucoes",
    "/automacoes/aprovacoes",
    "/eventos/:eventoId/cockpit"
  ],
  "requiresRealData": true,
  "preserveEventContext": true
} as const;

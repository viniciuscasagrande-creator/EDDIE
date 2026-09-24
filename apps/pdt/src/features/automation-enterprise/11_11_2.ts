export const featureManifest = {
  "phase": "11.11.2",
  "title": "EDDIE 11.11.2 — Central de Alertas, Incidentes e Sala de Situação",
  "routes": [
    "/operacao/alertas",
    "/operacao/incidentes",
    "/eventos/:eventoId/sala-situacao"
  ],
  "requiresRealData": true,
  "preserveEventContext": true
} as const;

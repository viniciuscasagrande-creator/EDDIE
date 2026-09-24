const base = process.argv[2];
if (!base) {
  console.error("Uso: node scripts/smoke-revision-11-15.mjs https://seu-dominio");
  process.exit(2);
}

const auditRoutes = [
  "/api/build-info",
  "/",
  "/operacao",
  "/operacao/alertas",
  "/operacao/incidentes",
  "/operacao/hardening",
  "/operacao/e2e",
  "/automacoes",
  "/automacoes/regras",
  "/automacoes/execucoes",
  "/automacoes/aprovacoes",
  "/eventos",
  "/eventos/evento-operacao/operacao",
  "/eventos/evento-operacao/cockpit",
  "/eventos/evento-operacao/cockpit/comparativos",
  "/eventos/evento-operacao/inteligencia",
  "/eventos/evento-operacao/inteligencia/anomalias",
  "/eventos/evento-operacao/inteligencia/financeira",
  "/eventos/evento-operacao/inteligencia/previsoes",
  "/eventos/evento-operacao/dashboard",
  "/eventos/evento-operacao/ingressos",
  "/eventos/evento-operacao/portaria",
  "/eventos/evento-operacao/antifraude",
  "/eventos/evento-operacao/mapa",
  "/eventos/evento-operacao/financeiro",
  "/eventos/evento-operacao/marketing",
  "/eventos/evento-operacao/remarketing",
  "/eventos/evento-operacao/sala-situacao",
  "/eventos/evento-operacao/hardening",
  "/eventos/evento-operacao/e2e",
  "/financeiro",
  "/financeiro/conciliacao",
  "/contabilidade",
  "/estorno",
  "/comercial",
  "/marketing",
  "/remarketing",
  "/relatorios",
  "/sac",
  "/suporte",
  "/diagnostico",
  "/api/eventos/evento-operacao/inteligencia/resumo",
  "/api/eventos/evento-operacao/inteligencia/series",
  "/api/eventos/evento-operacao/inteligencia/financeira",
  "/api/eventos/evento-operacao/cockpit",
  "/api/eventos/evento-operacao/anomalias",
  "/api/eventos/evento-operacao/recomendacoes",
  "/api/eventos/evento-operacao/previsoes/vendas",
  "/api/eventos/evento-operacao/previsoes/portaria",
];

let failed = false;

console.log("Iniciando auditoria transversal de rotas EDDIE 11.15.1...");

for (const path of auditRoutes) {
  try {
    const res = await fetch(new URL(path, base), { redirect: "follow" });
    const ok = res.status >= 200 && res.status < 400;
    console.log(`${ok ? "OK" : "FALHA"} ${res.status} ${path}`);
    if (!ok) failed = true;

    if (path === "/api/build-info" && ok) {
      const data = await res.json();
      console.log("build-info:", data);
      if (data?.marker !== "EDDIE-11.9.1-GOLIVE" || data?.version !== "11.9.1") {
        console.error("FALHA: marker/version divergente do contrato de Go-Live");
        failed = true;
      }
      if (data?.marker1115 !== "EDDIE-11.15.1-REVISAO-GLOBAL") {
        console.error("FALHA: marker1115 ausente");
        failed = true;
      }
    }
  } catch (err) {
    console.error(`FALHA na rota ${path}:`, err?.message ?? err);
    failed = true;
  }
}

if (failed) {
  console.error("Auditoria transversal EDDIE 11.15.1 encontrou falhas.");
  process.exit(1);
} else {
  console.log("Todas as 45 rotas auditadas responderam com sucesso!");
}

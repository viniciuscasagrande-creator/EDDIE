const base = process.argv[2];
if (!base) {
  console.error("Uso: node scripts/smoke-automation-11-11.mjs https://seu-dominio");
  process.exit(2);
}

const routes = [
  "/api/build-info",
  "/automacoes",
  "/automacoes/regras",
  "/automacoes/execucoes",
  "/automacoes/aprovacoes",
  "/operacao",
  "/operacao/alertas",
  "/operacao/incidentes",
  "/eventos/evento-operacao/operacao",
  "/eventos/evento-operacao/sala-situacao",
  "/eventos/evento-operacao/cockpit",
  "/eventos/evento-operacao/cockpit/comparativos",
  "/api/automacoes/regras",
  "/api/automacoes/execucoes",
  "/api/automacoes/aprovacoes",
  "/api/operacao/alertas",
  "/api/operacao/incidentes",
  "/api/eventos/evento-operacao/sala-situacao",
  "/api/eventos/evento-operacao/cockpit",
];

let failed = false;

for (const path of routes) {
  try {
    const res = await fetch(new URL(path, base), { redirect: "follow" });
    const ok = res.status >= 200 && res.status < 400;
    console.log(`${ok ? "OK" : "FALHA"} ${res.status} ${path}`);
    if (!ok) failed = true;

    if (path === "/api/build-info" && ok) {
      const data = await res.json();
      console.log("build-info:", data);
      if (data?.marker !== "EDDIE-11.9.1-GOLIVE" || data?.version !== "11.9.1") {
        console.error("FALHA marker/version divergente do contrato de Go-Live");
        failed = true;
      }
    }
  } catch (err) {
    console.error(`FALHA na rota ${path}:`, err?.message ?? err);
    failed = true;
  }
}

if (failed) {
  console.error("Smoke test de automação 11.11 FALHOU.");
  process.exit(1);
} else {
  console.log("Todos os endpoints e páginas de EDDIE 11.11 responderam com sucesso!");
}

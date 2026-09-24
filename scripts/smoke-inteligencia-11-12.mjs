const base = process.argv[2];
if (!base) {
  console.error("Uso: node scripts/smoke-inteligencia-11-12.mjs https://seu-dominio");
  process.exit(2);
}

const routes = [
  "/api/build-info",
  "/eventos/evento-operacao/inteligencia",
  "/eventos/evento-operacao/inteligencia/previsoes",
  "/eventos/evento-operacao/inteligencia/anomalias",
  "/eventos/evento-operacao/inteligencia/financeira",
  "/api/eventos/evento-operacao/inteligencia/resumo",
  "/api/eventos/evento-operacao/inteligencia/series",
  "/api/eventos/evento-operacao/previsoes/vendas",
  "/api/eventos/evento-operacao/previsoes/portaria",
  "/api/eventos/evento-operacao/anomalias",
  "/api/eventos/evento-operacao/recomendacoes",
  "/api/eventos/evento-operacao/inteligencia/financeira",
  "/api/produtores/00000000-0000-0000-0000-000000000002/inteligencia/repasses",
  "/api/inteligencia/health",
  "/api/inteligencia/modelos/status",
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
  console.error("Smoke test de inteligência 11.12 FALHOU.");
  process.exit(1);
} else {
  console.log("Todos os endpoints e páginas de EDDIE 11.12 responderam com sucesso!");
}

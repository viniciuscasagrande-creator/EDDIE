const base = process.argv[2];
if (!base) {
  console.error("Uso: node scripts/smoke-e2e-11-14.mjs https://seu-dominio");
  process.exit(2);
}

const getRoutes = [
  "/api/build-info",
  "/operacao/e2e",
  "/eventos/evento-operacao/e2e",
  "/api/e2e/ciclo/status",
  "/api/e2e/ciclo/configuracao",
  "/api/e2e/ciclo/ledger",
  "/api/e2e/ciclo/portaria/status",
  "/api/e2e/gate/status",
  "/api/eventos/evento-operacao/e2e/ciclo",
  "/api/eventos/evento-operacao/e2e/gate",
  "/api/eventos/evento-operacao/e2e/validar-configuracao"
];

let failed = false;

for (const path of getRoutes) {
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
      if (data?.marker1114 !== "EDDIE-11.14-E2E-GOLIVE") {
        console.error("FALHA marker1114 ausente");
        failed = true;
      }
    }
  } catch (err) {
    console.error(`FALHA na rota ${path}:`, err?.message ?? err);
    failed = true;
  }
}

// Teste POST de Execução da Jornada E2E
try {
  const postExec = await fetch(new URL("/api/e2e/ciclo/executar-jornada", base), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correlationId: `corr_smoke_e2e_${Date.now()}` })
  });
  const ok = postExec.status >= 200 && postExec.status < 400;
  console.log(`${ok ? "OK" : "FALHA"} ${postExec.status} POST /api/e2e/ciclo/executar-jornada`);
  if (!ok) failed = true;
} catch (err) {
  console.error("FALHA no POST executar-jornada:", err?.message ?? err);
  failed = true;
}

// Teste POST de Check-in Simulado
try {
  const postCheckin = await fetch(new URL("/api/e2e/ciclo/checkin-simulado", base), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ingressoId: "ing_smoke_test_01", catracaId: "CATRACA-SMOKE-1" })
  });
  const ok = postCheckin.status >= 200 && postCheckin.status < 400;
  console.log(`${ok ? "OK" : "FALHA"} ${postCheckin.status} POST /api/e2e/ciclo/checkin-simulado`);
  if (!ok) failed = true;
} catch (err) {
  console.error("FALHA no POST checkin-simulado:", err?.message ?? err);
  failed = true;
}

// Teste POST de Estorno Simulado
try {
  const postEstorno = await fetch(new URL("/api/e2e/ciclo/estorno-simulado", base), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pedidoId: "ped_smoke_test", ingressoId: "ing_smoke_test_02", valorCentavos: 13200 })
  });
  const ok = postEstorno.status >= 200 && postEstorno.status < 400;
  console.log(`${ok ? "OK" : "FALHA"} ${postEstorno.status} POST /api/e2e/ciclo/estorno-simulado`);
  if (!ok) failed = true;
} catch (err) {
  console.error("FALHA no POST estorno-simulado:", err?.message ?? err);
  failed = true;
}

if (failed) {
  console.error("Smoke test E2E 11.14 FALHOU.");
  process.exit(1);
} else {
  console.log("Todos os endpoints e páginas de EDDIE 11.14 responderam com sucesso!");
}

const base = process.argv[2];
if (!base) {
  console.error("Uso: node scripts/smoke-hardening-11-13.mjs https://seu-dominio");
  process.exit(2);
}

const getRoutes = [
  "/api/build-info",
  "/operacao/hardening",
  "/eventos/evento-operacao/hardening",
  "/api/hardening/health",
  "/api/hardening/seguranca/rbac",
  "/api/hardening/seguranca/auditoria",
  "/api/hardening/performance/metricas",
  "/api/hardening/performance/cache",
  "/api/hardening/concorrencia/status",
  "/api/hardening/resiliencia/outbox",
  "/api/hardening/capacidade",
  "/api/eventos/evento-operacao/hardening/status",
  "/api/eventos/evento-operacao/seguranca/sessao"
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
      if (data?.marker1113 !== "EDDIE-11.13-HARDENING") {
        console.error("FALHA marker1113 ausente");
        failed = true;
      }
    }
  } catch (err) {
    console.error(`FALHA na rota ${path}:`, err?.message ?? err);
    failed = true;
  }
}

// Teste POST de reserva atômica concorrente
try {
  const postReserva = await fetch(new URL("/api/eventos/evento-operacao/concorrencia/reserva-teste", base), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ loteId: "lote-pista-1", quantidade: 1, userId: "smoke-user" })
  });
  const ok = postReserva.status >= 200 && postReserva.status < 400;
  console.log(`${ok ? "OK" : "FALHA"} ${postReserva.status} POST /api/eventos/evento-operacao/concorrencia/reserva-teste`);
  if (!ok) failed = true;
} catch (err) {
  console.error("FALHA no POST reserva-teste:", err?.message ?? err);
  failed = true;
}

// Teste POST de anti-passback de check-in concorrente
try {
  const postCheckin = await fetch(new URL("/api/eventos/evento-operacao/concorrencia/checkin-teste", base), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ticketCode: "ING-SMOKE-11-13", catracaId: "CATRACA-SMOKE" })
  });
  const ok = postCheckin.status >= 200 && postCheckin.status < 400;
  console.log(`${ok ? "OK" : "FALHA"} ${postCheckin.status} POST /api/eventos/evento-operacao/concorrencia/checkin-teste`);
  if (!ok) failed = true;
} catch (err) {
  console.error("FALHA no POST checkin-teste:", err?.message ?? err);
  failed = true;
}

if (failed) {
  console.error("Smoke test de Hardening 11.13 FALHOU.");
  process.exit(1);
} else {
  console.log("Todos os endpoints e páginas de EDDIE 11.13 responderam com sucesso!");
}

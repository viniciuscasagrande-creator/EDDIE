const base = process.argv[2];
if (!base) {
  console.error("Uso: node scripts/smoke-production-11-9-1.mjs https://seu-dominio");
  process.exit(2);
}
const paths = ["/api/build-info", "/eventos", "/financeiro", "/estornos"];
let failed = false;
for (const path of paths) {
  try {
    const r = await fetch(new URL(path, base), {redirect:"follow"});
    console.log(`${r.ok ? "OK" : "FALHA"} ${r.status} ${path}`);
    if (!r.ok) failed = true;
    if (path === "/api/build-info" && r.ok) {
      const j = await r.json();
      console.log("build-info", j);
      if (j?.marker !== "EDDIE-11.9.1-GOLIVE" || j?.version !== "11.9.1") {
        console.error("FALHA marker/version divergente");
        failed = true;
      }
    }
  } catch (e) {
    console.error(`FALHA ${path}`, e?.message ?? e);
    failed = true;
  }
}
if (failed) process.exit(1);

import fs from "node:fs";
import { execSync } from "node:child_process";

const required = [
  "apps/pdt/src/lib/buildInfo.ts",
  "EDDIE_11_9_1_GO_LIVE_REAL_CORRECAO_DEPLOY.md",
  "docs/EDDIE_11_9_1_CHECKLIST_GO_LIVE.md",
  ".gemini/prompts/EDDIE_11_9_1.md"
];

let ok = true;
for (const f of required) {
  const exists = fs.existsSync(f);
  console.log(`${exists ? "OK" : "FALHA"} ${f}`);
  if (!exists) ok = false;
}

const forbiddenTracked = [".env", ".env.local", "secrets/"];
try {
  const tracked = execSync("git ls-files", {encoding:"utf8"});
  for (const f of forbiddenTracked) {
    if (tracked.split(/\r?\n/).some(x => (x === f || x.startsWith(f + "/")) && !x.endsWith(".example"))) {
      console.error(`FALHA arquivo sensível versionado: ${f}`);
      ok = false;
    }
  }
} catch {
  console.warn("AVISO: não foi possível consultar git ls-files.");
}

if (!ok) process.exit(1);
console.log("EDDIE 11.9.1: preflight de go-live aprovado.");

import fs from 'node:fs';
const required = [
  'apps/pdt/src/app/relatorios/page.tsx',
  'apps/pdt/src/app/relatorios/reportCatalog.ts',
  'apps/pdt/src/app/diagnostico/page.tsx',
  'apps/pdt/src/app/api/status/route.ts',
  'apps/pdt/src/app/api/[...path]/route.ts',
  'apps/api/src/health.controller.ts',
  'apps/api/src/modules/relatorios/relatorios.controller.ts',
  'apps/api/src/modules/contabilidade/contabilidade.controller.ts',
  'apps/api/src/modules/financeiro/financeiro.controller.ts',
];
let failed = false;
for (const file of required) {
  const ok = fs.existsSync(file);
  console.log(`${ok ? 'OK ' : 'ERRO'} ${file}`);
  if (!ok) failed = true;
}
const sidebar = fs.readFileSync('apps/pdt/src/components/Sidebar.tsx','utf8');
if (!sidebar.includes("href: '/relatorios'")) { console.error('ERRO Sidebar sem /relatorios'); failed = true; }
else console.log('OK  Sidebar /relatorios');
const app = fs.readFileSync('apps/api/src/app.module.ts','utf8');
for (const token of ['RelatoriosModule','HealthController']) {
  if (!app.includes(token)) { console.error(`ERRO AppModule sem ${token}`); failed = true; }
  else console.log(`OK  AppModule ${token}`);
}
if (failed) process.exit(1);
console.log('\nPreflight estrutural Frente A aprovado.');

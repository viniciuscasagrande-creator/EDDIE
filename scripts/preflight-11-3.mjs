import fs from 'node:fs';
const checks=[
['Central Operacional','apps/pdt/src/app/operacao/page.tsx'],
['Status Operacional','apps/pdt/src/app/api/operacao/status/route.ts'],
['Financeiro','apps/pdt/src/app/financeiro/page.tsx'],
['Contabilidade','apps/pdt/src/app/contabilidade/page.tsx'],
['Marketing','apps/pdt/src/app/marketing/page.tsx'],
['Remarketing','apps/pdt/src/app/remarketing/page.tsx'],
['Relatórios','apps/pdt/src/app/relatorios/page.tsx'],
['Bootstrap','apps/pdt/src/app/api/bootstrap/route.ts'],
];
let fail=false; for(const [n,p] of checks){const ok=fs.existsSync(p);console.log(`${ok?'OK':'FALHA'} ${n}: ${p}`);if(!ok)fail=true}
const sidebar=fs.readFileSync('apps/pdt/src/components/Sidebar.tsx','utf8');
if(!sidebar.includes("href: '/operacao'")){console.error('FALHA Central Operacional ausente da sidebar');fail=true}else console.log('OK Sidebar');
process.exit(fail?1:0);

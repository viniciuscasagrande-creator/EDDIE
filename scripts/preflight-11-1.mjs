import fs from 'node:fs';
const checks=[
 ['context route','apps/pdt/src/app/api/context/route.ts','eventsReachable'],
 ['proxy tenant','apps/pdt/src/app/api/[...path]/route.ts','x-tenant-id'],
 ['global context','apps/pdt/src/components/ProducerEventContext.tsx','bootstrap único'],
 ['diagnostico','apps/pdt/src/app/diagnostico/page.tsx','Tenant'],
 ['marketing','apps/pdt/src/app/marketing/page.tsx',''],
 ['remarketing','apps/pdt/src/app/remarketing/page.tsx',''],
 ['financeiro','apps/pdt/src/app/financeiro/page.tsx',''],
 ['contabilidade','apps/pdt/src/app/contabilidade/page.tsx',''],
 ['relatorios','apps/pdt/src/app/relatorios/page.tsx','']
];
let fail=0; for(const [name,file,needle] of checks){const exists=fs.existsSync(file); const content=exists?fs.readFileSync(file,'utf8'):''; const ok=exists&&(!needle||content.includes(needle)); console.log(`${ok?'OK':'FALHA'} ${name}: ${file}`); if(!ok)fail++;} process.exitCode=fail?1:0;

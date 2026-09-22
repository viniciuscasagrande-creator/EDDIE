import fs from 'node:fs';
const checks=[
 ['context route','apps/pdt/src/app/api/context/route.ts'],['proxy','apps/pdt/src/app/api/[...path]/route.ts'],['provider','apps/pdt/src/components/ProducerEventContext.tsx'],['marketing','apps/pdt/src/app/marketing/page.tsx'],['remarketing','apps/pdt/src/app/remarketing/page.tsx'],['financeiro','apps/pdt/src/app/financeiro/page.tsx'],['contabilidade','apps/pdt/src/app/contabilidade/page.tsx'],['relatorios','apps/pdt/src/app/relatorios/page.tsx']];
let fail=false;for(const [n,p] of checks){const ok=fs.existsSync(p);console.log(`${ok?'OK':'FALHA'} ${n}: ${p}`);if(!ok)fail=true}
const proxy=fs.readFileSync('apps/pdt/src/app/api/[...path]/route.ts','utf8');if(!proxy.includes('endsWith("/api")')){console.error('FALHA proxy não normaliza /api');fail=true}else console.log('OK proxy normaliza /api');
const ctx=fs.readFileSync('apps/pdt/src/components/ProducerEventContext.tsx','utf8');if(!ctx.includes("fetch('/api/context'")){console.error('FALHA contexto server-side');fail=true}else console.log('OK contexto server-side');
process.exit(fail?1:0);

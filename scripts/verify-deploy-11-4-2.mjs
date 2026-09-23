const base=(process.argv[2]||'').replace(/\/$/,'');
if(!base){console.error('Uso: node scripts/verify-deploy-11-4-2.mjs https://seu-deploy.vercel.app');process.exit(2)}
const checks=[['build','/api/build-info'],['event-os','/api/event-os/status'],['bootstrap','/api/bootstrap'],['eventos','/eventos']];
let failed=false;
for(const [name,path] of checks){try{const r=await fetch(base+path,{redirect:'follow'});const text=await r.text();const marker=name==='build'?text.includes('EDDIE-11.4.2-EVENT-OS'):true;console.log(`${r.ok&&marker?'OK':'FALHA'} ${name} HTTP ${r.status} ${path}`);if(!r.ok||!marker)failed=true}catch(e){console.log(`FALHA ${name}: ${e.message}`);failed=true}}
if(failed)process.exit(1); console.log('DEPLOY 11.4.2 CONFIRMADO');

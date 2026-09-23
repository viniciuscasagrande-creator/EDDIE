import fs from 'node:fs';
const req=['apps/pdt/src/app/eventos/page.tsx','apps/pdt/src/app/eventos/[eventoId]/dashboard/page.tsx','apps/pdt/src/app/eventos/[eventoId]/mapa/page.tsx','apps/pdt/src/components/eventos/EventOsShell.tsx'];
let ok=true; for(const f of req){const x=fs.existsSync(f);console.log(x?'OK':'FALTA',f);ok&&=x} if(!ok)process.exit(1);console.log('EDDIE 11.6 preflight estrutural aprovado');

import fs from 'node:fs';
const files=['apps/pdt/src/app/marketing/page.tsx','apps/pdt/src/app/marketing/[slug]/page.tsx','apps/pdt/src/app/remarketing/page.tsx','apps/pdt/src/app/remarketing/[slug]/page.tsx','apps/pdt/src/components/MarketingVideoScreen.tsx','apps/pdt/src/lib/marketingVideoCatalog.ts','apps/api/src/modules/marketing/marketing-video.service.ts'];
let fail=false; for(const f of files){const ok=fs.existsSync(f); console.log(ok?'OK ':'ERRO',f); if(!ok)fail=true;}
const side=fs.readFileSync('apps/pdt/src/components/Sidebar.tsx','utf8'); for(const x of ['/marketing','/remarketing']){const ok=side.includes(x);console.log(ok?'OK ':'ERRO','Sidebar '+x);if(!ok)fail=true;}
const ctl=fs.readFileSync('apps/api/src/modules/marketing/marketing.controller.ts','utf8'); const ep=ctl.includes("@Get('video/:grupo/:screen')"); console.log(ep?'OK ':'ERRO','endpoint marketing/video'); if(!ep)fail=true;
process.exit(fail?1:0);

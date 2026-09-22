import fs from 'node:fs';
const required = [
  'apps/pdt/src/app/financeiro/page.tsx','apps/pdt/src/app/contabilidade/page.tsx',
  'apps/pdt/src/app/eventos/page.tsx','apps/pdt/src/app/comercial/page.tsx',
  'apps/pdt/src/app/marketing/page.tsx','apps/pdt/src/app/sac/page.tsx',
  'apps/pdt/src/app/suporte-eventos/page.tsx','apps/pdt/src/app/estorno/page.tsx',
  'apps/pdt/src/app/relatorios/page.tsx',
  'apps/api/src/modules/sac/sac.module.ts','apps/api/src/modules/suporte/suporte.module.ts',
  'apps/api/src/modules/relatorios/relatorios.module.ts',
  'apps/api/prisma/schema.prisma'
];
let failed=false;
for(const f of required){const ok=fs.existsSync(f); console.log(`${ok?'OK ':'ERRO'} ${f}`); if(!ok) failed=true;}
const schema=fs.readFileSync('apps/api/prisma/schema.prisma','utf8');
for(const name of ['"sac"','"suporte"']){const ok=schema.includes(name); console.log(`${ok?'OK ':'ERRO'} schema Prisma ${name}`); if(!ok)failed=true;}
if(failed) process.exit(1);
console.log('\nPreflight estrutural aprovado. Execute Prisma Generate, build e testes no ambiente com dependências instaladas.');

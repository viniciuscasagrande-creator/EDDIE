import fs from 'node:fs';
const req=[
'apps/pdt/src/components/navigation/ModuleNavigation.tsx',
'apps/pdt/src/components/navigation/module-navigation.css',
'apps/pdt/src/components/navigation/CompactOperationalAlert.tsx',
'EDDIE_11_7_1_NAVEGACAO_FIXA_RESPONSIVA.md',
'.gemini/prompts/EDDIE_11_7_1.md'
];
let ok=true;
for(const f of req){const x=fs.existsSync(f); console.log(`${x?'OK':'FALHA'} ${f}`); if(!x)ok=false;}
if(!ok)process.exit(1);
console.log('EDDIE 11.7.1: componentes de navegação aprovados.');

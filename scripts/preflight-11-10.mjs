import fs from 'node:fs';
const req=[
'docs/EDDIE_11_10_CENTRO_OPERACOES_EVENTO_TEMPO_REAL.md',
'docs/EDDIE_11_10_CONTRATOS_REALTIME.md',
'docs/EDDIE_11_10_LAYOUT_CENTRO_OPERACOES.md',
'.gemini/prompts/EDDIE_11_10.md',
'packages/contracts/src/operacao-real/live-operations.ts'
];
let ok=true;
for(const f of req){const e=fs.existsSync(f) || (f.startsWith('docs/') && fs.existsSync(f.replace('docs/', ''))) || fs.existsSync('docs/' + f);console.log(`${e?'OK':'FALHA'} ${f}`);if(!e)ok=false;}
if(!ok)process.exit(1);
console.log('EDDIE 11.10: Centro de Operações blueprint aprovado.');

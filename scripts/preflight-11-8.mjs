import fs from 'node:fs';
const req=[
'docs/EDDIE_11_8_OPERACAO_REAL_PONTA_A_PONTA.md',
'docs/EDDIE_11_8_CONTRATOS_TRANSACIONAIS.md',
'docs/EDDIE_11_8_MODELO_FINANCEIRO.md',
'.gemini/prompts/EDDIE_11_8.md',
'packages/contracts/src/operacao-real/index.ts'
];
let ok=true;
for(const f of req){const e=fs.existsSync(f) || (f.startsWith('docs/') && fs.existsSync(f.replace('docs/', ''))) || fs.existsSync('docs/' + f);console.log(`${e?'OK':'FALHA'} ${f}`);if(!e)ok=false;}
if(!ok)process.exit(1);
console.log('EDDIE 11.8: blueprint transacional aprovado.');

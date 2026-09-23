import fs from 'node:fs';
const req=[
'EDDIE_11_9_PORTARIA_ANTIFRAUDE_CONCILIACAO_CHARGEBACK.md',
'docs/EDDIE_11_9_CONTRATOS_OPERACIONAIS.md',
'docs/EDDIE_11_9_TELAS.md',
'.gemini/prompts/EDDIE_11_9.md',
'packages/contracts/src/operacao-real/risk-reconciliation.ts'
];
let ok=true;
for(const f of req){const e=fs.existsSync(f);console.log(`${e?'OK':'FALHA'} ${f}`);if(!e)ok=false;}
if(!ok)process.exit(1);
console.log('EDDIE 11.9: pacote operacional aprovado.');

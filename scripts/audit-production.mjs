import fs from 'node:fs'; import path from 'node:path';
const root=path.resolve('apps/pdt/src'); const banned=[/360°/i,/Pesquisa 360/i,/mockData/i,/dados demonstrativos/i,/148\.520/,/382\.900/,/1\.250\.000/];
let hits=[]; function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())walk(p);else if(/\.(tsx?|jsx?)$/.test(e.name)){const s=fs.readFileSync(p,'utf8'); banned.forEach(r=>{if(r.test(s))hits.push(`${p}: ${r}`)})}}} walk(root);
if(hits.length){console.error('Auditoria encontrou itens proibidos:\n'+hits.join('\n'));process.exit(1)} console.log('Auditoria de produção: OK');

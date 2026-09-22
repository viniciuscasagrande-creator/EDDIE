import fs from 'node:fs';
import path from 'node:path';

const roots = ['apps/pdt/src', 'apps/api/src'];
const patterns = [
  /\bmock\b/i, /\bfake\b/i, /\bdemo\b/i,
  /148[.,]?520/, /382[.,]?900/, /ROAS\s*4[.,]8/i,
  /48[.,]?210/, /1[.,]?840/
];
const ignore = [/\.test\./, /\.spec\./, /fixture/i, /__tests__/];
let hits = [];
function walk(p){
  if(!fs.existsSync(p)) return;
  for(const e of fs.readdirSync(p,{withFileTypes:true})){
    const f=path.join(p,e.name);
    if(e.isDirectory()) walk(f);
    else if(/\.(ts|tsx|js|jsx)$/.test(e.name) && !ignore.some(r=>r.test(f))){
      const s=fs.readFileSync(f,'utf8');
      s.split(/\r?\n/).forEach((line,i)=>{
        if(patterns.some(r=>r.test(line))) {
          hits.push(`${f}:${i+1}: ${line.trim()}`);
        } else if (/\bplaceholder\b/i.test(line)) {
          // Exclude HTML input attribute (placeholder="...") and Tailwind CSS (placeholder-*)
          const isInputAttributeOrCss = /placeholder\s*=\s*["'{]|placeholder-[a-z0-9]/i.test(line);
          if (!isInputAttributeOrCss) {
            hits.push(`${f}:${i+1}: ${line.trim()}`);
          }
        }
      });
    }
  }
}
roots.forEach(walk);
console.log(hits.length ? hits.join('\n') : 'OK: nenhum marcador óbvio de mock/dado demonstrativo encontrado.');
process.exitCode = hits.length ? 1 : 0;

import fs from 'node:fs';

const required = [
  'docs/EDDIE_11_7_OPERACAO_COMPLETA_EVENTO.md',
  '.gemini/prompts/EDDIE_11_7.md',
  'docs/EDDIE_11_7_CONTRATOS_TELAS_E_API.md',
  'apps/pdt/src/app/eventos/page.tsx',
  'apps/pdt/src/app/eventos/novo/page.tsx',
  'apps/pdt/src/app/eventos/[eventoId]/dashboard/page.tsx',
  'apps/pdt/src/app/eventos/[eventoId]/ingressos/page.tsx',
  'apps/pdt/src/app/eventos/[eventoId]/relatorios/page.tsx',
  'apps/pdt/src/app/eventos/[eventoId]/detalhes/page.tsx',
  'apps/pdt/src/app/eventos/[eventoId]/cortesias/page.tsx',
  'apps/pdt/src/app/eventos/[eventoId]/configuracao/sessoes/page.tsx',
  'apps/pdt/src/app/eventos/[eventoId]/configuracao/setores/page.tsx',
  'apps/pdt/src/app/eventos/[eventoId]/configuracao/lotes/page.tsx',
  'apps/pdt/src/components/eventos/EventOsShell.tsx',
];

let ok = true;
for (const f of required) {
  const exists = fs.existsSync(f) || (f.startsWith('docs/') && fs.existsSync(f.replace('docs/', ''))) || fs.existsSync('docs/' + f);
  console.log(`${exists ? 'OK' : 'FALHA'} ${f}`);
  if (!exists) ok = false;
}

if (!ok) process.exit(1);
console.log('EDDIE 11.7: pacote estrutural e rotas aprovados.');

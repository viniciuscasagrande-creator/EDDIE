import fs from 'node:fs';

const checks = [
  'apps/pdt/src/app/eventos/page.tsx',
  'apps/pdt/src/components/Sidebar.tsx',
  'apps/pdt/src/components/Header.tsx',
  'apps/pdt/src/components/ProducerEventContext.tsx',
  'apps/pdt/src/components/eventos/EventOsShell.tsx',
  'apps/pdt/src/components/eventos/EventRouteContextSync.tsx',
  'apps/pdt/src/app/api/event-os/status/route.ts',
  'apps/pdt/src/app/eventos/[eventoId]/dashboard/page.tsx',
  'apps/pdt/src/app/eventos/[eventoId]/ingressos/page.tsx',
  'apps/pdt/src/app/eventos/[eventoId]/mapa/page.tsx',
  'apps/pdt/src/app/eventos/[eventoId]/financeiro/page.tsx',
  'apps/pdt/src/app/eventos/[eventoId]/marketing/page.tsx',
  'apps/pdt/src/app/eventos/[eventoId]/remarketing/page.tsx',
  'apps/pdt/src/app/api/build-info/route.ts',
  'apps/pdt/src/components/BuildBadge.tsx',
  'apps/pdt/src/app/eventos/[eventoId]/relatorios/page.tsx',
  'apps/pdt/src/app/eventos/[eventoId]/detalhes/page.tsx',
];

let fail = false;
for (const f of checks) {
  const ok = fs.existsSync(f);
  console.log(ok ? 'OK' : 'FALTA', f);
  if (!ok) fail = true;
}

// Check version tag in status route
const statusContent = fs.readFileSync('apps/pdt/src/app/api/event-os/status/route.ts', 'utf8');
if (!statusContent.includes('11.4.2')) {
  console.log('FALTA versão 11.4.2 em /api/event-os/status');
  fail = true;
} else {
  console.log('OK /api/event-os/status version 11.4.2');
}

if (fail) process.exit(1);
console.log('EDDIE 11.4.2 preflight estrutural OK');

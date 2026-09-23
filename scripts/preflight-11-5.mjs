import fs from 'node:fs';
const checks=[
 ['schema pedidos','apps/api/prisma/schema.prisma','model PedidoVenda'],
 ['condição evento','apps/api/prisma/schema.prisma','eventoId'],
 ['controller','apps/api/src/modules/pedidos/pedidos.controller.ts',"@Controller('pedidos')"],
 ['service','apps/api/src/modules/pedidos/pedidos.service.ts','Evento sem condição comercial aprovada'],
 ['app module','apps/api/src/app.module.ts','PedidosModule'],
 ['proxy produtor','apps/pdt/src/app/api/[...path]/route.ts','x-produtor-id'],
 ['tela Event OS','apps/pdt/src/app/eventos/[eventoId]/ingressos/page.tsx','/api/pedidos/evento/'],
 ['migration','apps/api/prisma/migrations/20260923_nucleo_transacional_vendas/migration.sql','CREATE SCHEMA IF NOT EXISTS "pedidos"']
];
let fail=0; for(const [n,f,s] of checks){const ok=fs.existsSync(f)&&fs.readFileSync(f,'utf8').includes(s);console.log(`${ok?'OK':'FALHA'} ${n}`);if(!ok)fail++} if(fail)process.exit(1); console.log('EDDIE 11.5 PREFLIGHT APROVADO');

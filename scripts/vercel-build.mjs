import { execSync } from 'node:child_process';
import fs from 'node:fs';

console.log('🚀 Iniciando Vercel Build otimizado...');
execSync('pnpm --filter @ticketing/contracts build', { stdio: 'inherit' });
execSync('pnpm --filter @ticketing/pdt build', { stdio: 'inherit' });

if (fs.existsSync('apps/pdt/.next')) {
  fs.cpSync('apps/pdt/.next', '.next', { recursive: true });
}
if (fs.existsSync('apps/pdt/public')) {
  fs.cpSync('apps/pdt/public', 'public', { recursive: true });
}
console.log('✅ Vercel Build finalizado com sucesso!');

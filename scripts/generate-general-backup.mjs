import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const now = new Date();
const timestamp = now.toISOString().replace(/[-:T]/g, '').slice(0, 14);
const zipFileName = `EDDIE_BACKUP_GERAL_COMPLETO_${timestamp}.zip`;
const zipFilePath = path.resolve(process.cwd(), zipFileName);

console.log(`🚀 Iniciando geração do Backup Geral Completo do projeto EDDIE...`);
console.log(`📦 Arquivo de destino: ${zipFileName}`);

try {
  // Gera arquivo zip completo usando git archive do commit atual
  execSync(`git archive -o "${zipFilePath}" HEAD`, { stdio: 'inherit' });
  const stat = fs.statSync(zipFilePath);
  const sizeMb = (stat.size / (1024 * 1024)).toFixed(2);
  console.log(`✅ Backup Geral gerado com sucesso!`);
  console.log(`📁 Localização: ${zipFilePath}`);
  console.log(`⚖️ Tamanho: ${sizeMb} MB`);
} catch (err) {
  console.warn(`⚠️ Tentando fallback com tar nativo do Windows...`);
  try {
    execSync(
      `tar.exe -a -c -f "${zipFilePath}" --exclude=node_modules --exclude=.next --exclude=.turbo --exclude=.git --exclude=dist .`,
      { stdio: 'inherit' }
    );
    const stat = fs.statSync(zipFilePath);
    const sizeMb = (stat.size / (1024 * 1024)).toFixed(2);
    console.log(`✅ Backup Geral gerado via tar nativo com sucesso!`);
    console.log(`📁 Localização: ${zipFilePath}`);
    console.log(`⚖️ Tamanho: ${sizeMb} MB`);
  } catch (tarErr) {
    console.error(`❌ Erro ao gerar backup:`, tarErr);
    process.exit(1);
  }
}

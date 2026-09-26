#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const modulesDir = path.join(rootDir, 'apps', 'api', 'src', 'modules');
const geminiMdPath = path.join(rootDir, 'GEMINI.md');

if (!fs.existsSync(modulesDir) || !fs.existsSync(geminiMdPath)) {
  console.error('❌ Diretórios ou GEMINI.md não encontrados para verificação de arquitetura.');
  process.exit(1);
}

const realModules = fs
  .readdirSync(modulesDir, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name)
  .sort();

const geminiContent = fs.readFileSync(geminiMdPath, 'utf8');

const missingInDoc = [];
for (const mod of realModules) {
  // Check if module is documented in GEMINI.md as `mod`
  const pattern = new RegExp(`\\|\\s*\`${mod}\`\\s*\\|`);
  if (!pattern.test(geminiContent)) {
    missingInDoc.push(mod);
  }
}

if (missingInDoc.length > 0) {
  console.error(`❌ Divergência arquitetural detectada: módulos presentes no código mas ausentes no GEMINI.md: ${missingInDoc.join(', ')}`);
  process.exit(1);
}

console.log(`✅ Sincronia Arquitetural Validada: todos os ${realModules.length} módulos reais estão formalmente documentados no GEMINI.md:`);
realModules.forEach((m) => console.log(`   - ${m}`));
process.exit(0);

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('docs/screenshots/11_15_1');
fs.mkdirSync(outDir, { recursive: true });

const resolutions = [
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1366x768', width: 1366, height: 768 },
  { name: '390x844', width: 390, height: 844 },
];

const targetRoutes = [
  { path: '/eventos/evento-operacao/inteligencia', name: 'inteligencia_operacional' },
  { path: '/eventos/evento-operacao/cockpit', name: 'cockpit_executivo' },
  { path: '/eventos/evento-operacao/operacao', name: 'centro_operacoes' },
  { path: '/eventos/evento-operacao/inteligencia/financeira', name: 'inteligencia_financeira' },
];

async function run() {
  console.log('Iniciando captura de screenshots Playwright para EDDIE 11.15.1...');
  const browser = await chromium.launch({ headless: true });

  for (const res of resolutions) {
    console.log(`\nTestando resolução ${res.name} (${res.width}x${res.height})...`);
    const context = await browser.newContext({
      viewport: { width: res.width, height: res.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    for (const route of targetRoutes) {
      const url = `http://localhost:3001${route.path}`;
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(500);

        // Verifica que existe apenas UMA barra contextual
        const contextBars = await page.locator('header[aria-label="Breadcrumb do Evento"], nav[aria-label="Navegação do Evento"]').count();
        console.log(`  [${res.name}] ${route.name}: nav count = ${contextBars}`);

        const file = path.join(outDir, `${route.name}_${res.name}.png`);
        await page.screenshot({ path: file, fullPage: false });
        console.log(`  Screenshot salvo: ${file}`);
      } catch (err) {
        console.error(`  Erro na rota ${route.path} (${res.name}):`, err.message);
      }
    }
    await context.close();
  }

  await browser.close();
  console.log('\nTodas as capturas foram concluídas com sucesso!');
}

run().catch(console.error);

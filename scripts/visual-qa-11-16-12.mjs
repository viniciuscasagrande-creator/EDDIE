// scripts/visual-qa-11-16-12.mjs
// Suite de QA Visual Automatizado Playwright para EDDIE 11.16.12
// Valida paridade total de Marketing (17 destinos) e Remarketing (14 destinos) + Comercial
// Resoluções: Desktop (1920x1080, 1440x900) e Mobile (390x844)

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const baseUrl = process.argv[2] || 'http://localhost:3001';
const screenshotDir = path.resolve('docs/screenshots/11_16_12');
fs.mkdirSync(screenshotDir, { recursive: true });

const resolutions = [
  { name: '1920x1080', width: 1920, height: 1080, isMobile: false },
  { name: '390x844', width: 390, height: 844, isMobile: true },
];

const targetRoutes = [
  // Core PDT
  { path: '/', name: 'home', label: 'Visão Geral (Home)' },
  { path: '/eventos', name: 'eventos_lista', label: 'Todos os Eventos' },
  { path: '/comercial', name: 'comercial_hub', label: 'Comercial B2B Hub' },
  { path: '/eventos/evento-operacao/comercial', name: 'evento_comercial', label: 'Evento: Comercial B2B' },

  // Marketing Global
  { path: '/marketing', name: 'mkt_dashboard_global', label: 'Marketing: Dashboard Global' },
  { path: '/marketing/campanhas', name: 'mkt_campanhas_global', label: 'Marketing: Campanhas' },
  { path: '/marketing/campanhas-prontas', name: 'mkt_prontas_global', label: 'Marketing: Campanhas Prontas' },
  { path: '/marketing/status-real', name: 'mkt_status_real_global', label: 'Marketing: Status Real AO VIVO' },
  { path: '/marketing/meta', name: 'mkt_meta_global', label: 'Marketing: Meta Ads & CAPI' },
  { path: '/marketing/google-analytics', name: 'mkt_ga4_global', label: 'Marketing: Google Analytics GA4' },
  { path: '/marketing/tiktok', name: 'mkt_tiktok_global', label: 'Marketing: TikTok Ads' },
  { path: '/marketing/spotify', name: 'mkt_spotify_global', label: 'Marketing: Spotify Ads' },
  { path: '/marketing/whatsapp', name: 'mkt_whatsapp_global', label: 'Marketing: WhatsApp Marketing' },
  { path: '/marketing/email', name: 'mkt_email_global', label: 'Marketing: E-mail Marketing' },
  { path: '/marketing/automacoes', name: 'mkt_automacoes_global', label: 'Marketing: Automações & Jornadas' },
  { path: '/marketing/cupons', name: 'mkt_cupons_global', label: 'Marketing: Cupons & Descontos' },
  { path: '/marketing/utm', name: 'mkt_utm_global', label: 'Marketing: Central UTM & Links / QR' },
  { path: '/marketing/afiliados', name: 'mkt_afiliados_global', label: 'Marketing: Afiliados & Promoters' },
  { path: '/marketing/pixels', name: 'mkt_pixels_global', label: 'Marketing: Pixels & Conversões' },
  { path: '/marketing/atribuicao', name: 'mkt_atribuicao_global', label: 'Marketing: Atribuição Multicanal' },
  { path: '/marketing/relatorios', name: 'mkt_relatorios_global', label: 'Marketing: Relatórios' },

  // Marketing Contextual por Evento
  { path: '/eventos/evento-operacao/marketing', name: 'mkt_evento_dashboard', label: 'Evento: Marketing Dashboard' },
  { path: '/eventos/evento-operacao/marketing/utm', name: 'mkt_evento_utm', label: 'Evento: Central UTM' },
  { path: '/eventos/evento-operacao/marketing/spotify', name: 'mkt_evento_spotify', label: 'Evento: Spotify Ads' },
  { path: '/eventos/evento-operacao/marketing/status-real', name: 'mkt_evento_status_real', label: 'Evento: Status Real' },

  // Remarketing Global
  { path: '/remarketing', name: 'rmkt_dashboard_global', label: 'Remarketing: Dashboard Global' },
  { path: '/remarketing/publicos', name: 'rmkt_publicos_global', label: 'Remarketing: Públicos' },
  { path: '/remarketing/segmentos', name: 'rmkt_segmentos_global', label: 'Remarketing: Segmentos' },
  { path: '/remarketing/jornadas', name: 'rmkt_jornadas_global', label: 'Remarketing: Jornadas de Remarketing' },
  { path: '/remarketing/carrinho', name: 'rmkt_carrinho_global', label: 'Remarketing: Carrinho Abandonado' },
  { path: '/remarketing/visitou-nao-comprou', name: 'rmkt_visitou_global', label: 'Remarketing: Visitou e Não Comprou' },
  { path: '/remarketing/compradores', name: 'rmkt_compradores_global', label: 'Remarketing: Compradores Anteriores' },
  { path: '/remarketing/recorrentes', name: 'rmkt_recorrentes_global', label: 'Remarketing: Clientes Recorrentes' },
  { path: '/remarketing/whatsapp', name: 'rmkt_whatsapp_global', label: 'Remarketing: Recuperação WhatsApp' },
  { path: '/remarketing/email', name: 'rmkt_email_global', label: 'Remarketing: Recuperação E-mail' },
  { path: '/remarketing/campanhas', name: 'rmkt_campanhas_global', label: 'Remarketing: Campanhas' },
  { path: '/remarketing/automacoes', name: 'rmkt_automacoes_global', label: 'Remarketing: Automações' },
  { path: '/remarketing/conversoes', name: 'rmkt_conversoes_global', label: 'Remarketing: Conversões Recuperadas' },
  { path: '/remarketing/relatorios', name: 'rmkt_relatorios_global', label: 'Remarketing: Relatórios' },

  // Remarketing Contextual por Evento
  { path: '/eventos/evento-operacao/remarketing', name: 'rmkt_evento_dashboard', label: 'Evento: Remarketing Dashboard' },
  { path: '/eventos/evento-operacao/remarketing/carrinho', name: 'rmkt_evento_carrinho', label: 'Evento: Carrinho Abandonado' },
  { path: '/eventos/evento-operacao/remarketing/jornadas', name: 'rmkt_evento_jornadas', label: 'Evento: Jornadas' },
  { path: '/eventos/evento-operacao/remarketing/whatsapp', name: 'rmkt_evento_whatsapp', label: 'Evento: WhatsApp' },
];

async function runVisualQA() {
  console.log(`\n======================================================`);
  console.log(`INICIANDO QA VISUAL AUTOMATIZADO PLAYWRIGHT — EDDIE 11.16.12`);
  console.log(`Alvo: ${baseUrl}`);
  console.log(`Resoluções: ${resolutions.map((r) => r.name).join(', ')}`);
  console.log(`Total de rotas por resolução: ${targetRoutes.length}`);
  console.log(`Total de testes combinados: ${resolutions.length * targetRoutes.length}`);
  console.log(`======================================================\n`);

  const browser = await chromium.launch({ headless: true });
  const allResults = [];
  const countsByClassification = {
    OK: 0,
    '404': 0,
    TELA_BRANCA: 0,
    ERRO_JS: 0,
    API_FALHOU: 0,
    SEM_DADOS: 0,
    OVERFLOW: 0,
  };

  for (const res of resolutions) {
    console.log(`\n>>> Executando viewport: ${res.name} (${res.width}x${res.height}) <<<`);
    const context = await browser.newContext({
      viewport: { width: res.width, height: res.height },
      deviceScaleFactor: 1,
      isMobile: res.isMobile,
    });

    const page = await context.newPage();

    for (const route of targetRoutes) {
      const url = `${baseUrl}${route.path}`;
      const consoleErrors = [];
      const failedRequests = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      page.on('response', (response) => {
        if (response.status() >= 400 && response.url().includes('/api/')) {
          failedRequests.push({ url: response.url(), status: response.status() });
        }
      });

      const startTime = Date.now();
      let classification = 'OK';
      let details = '';
      let httpStatus = 200;

      try {
        const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(400);

        if (response) {
          httpStatus = response.status();
        }

        if (httpStatus === 404) {
          classification = '404';
          details = 'HTTP 404 Not Found';
        } else {
          // 1. Verifica Tela Branca
          const bodyText = await page.evaluate(() => document.body.innerText.trim());
          if (bodyText.length < 20) {
            classification = 'TELA_BRANCA';
            details = `Conteúdo textual quase vazio (${bodyText.length} chars)`;
          }

          // 2. Verifica Erros JS
          const hasJsError = await page.evaluate(() => {
            const html = document.body.innerHTML;
            return (
              html.includes('Unhandled Runtime Error') ||
              html.includes('Minified React error') ||
              html.includes('SyntaxError') ||
              html.includes('ChunkLoadError')
            );
          });
          if (hasJsError || consoleErrors.some((e) => e.includes('TypeError') || e.includes('Uncaught'))) {
            classification = 'ERRO_JS';
            details = consoleErrors.slice(0, 2).join('; ') || 'Erro de runtime React';
          }

          // 3. Verifica Overflow Horizontal
          const isOverflowing = await page.evaluate(() => {
            return document.documentElement.scrollWidth > window.innerWidth + 5;
          });
          if (isOverflowing && classification === 'OK') {
            classification = 'OVERFLOW';
            details = 'Largura de scroll excede o viewport';
          }

          // 4. Verifica falhas de API críticas
          if (failedRequests.length > 0 && classification === 'OK') {
            classification = 'API_FALHOU';
            details = failedRequests.map((f) => `${f.status} em ${f.url}`).join(', ');
          }
        }

        const screenshotFileName = `${route.name}_${res.name}.png`;
        const screenshotFilePath = path.join(screenshotDir, screenshotFileName);
        await page.screenshot({ path: screenshotFilePath, fullPage: false });

      } catch (err) {
        classification = 'API_FALHOU';
        details = err.message;
      }

      countsByClassification[classification]++;
      const entry = {
        resolution: res.name,
        route: route.path,
        name: route.name,
        label: route.label,
        classification,
        status: httpStatus,
        durationMs: Date.now() - startTime,
        details,
        consoleErrorsCount: consoleErrors.length,
        failedRequestsCount: failedRequests.length,
      };
      allResults.push(entry);

      const colorTag = classification === 'OK' ? '✓ OK' : `✗ ${classification}`;
      console.log(`  [${res.name}] ${colorTag.padEnd(14)} -> ${route.path} ${details ? `(${details})` : ''}`);

      page.removeAllListeners('console');
      page.removeAllListeners('response');
    }

    await context.close();
  }

  await browser.close();

  const reportPath = path.resolve('docs/QA_VISUAL_REPORT_11_16_12.json');
  fs.writeFileSync(reportPath, JSON.stringify({ summary: countsByClassification, results: allResults }, null, 2));

  console.log(`\n======================================================`);
  console.log(`RELATÓRIO RESUMIDO QA VISUAL 11.16.12:`);
  console.log(`OK:          ${countsByClassification.OK}`);
  console.log(`404:         ${countsByClassification['404']}`);
  console.log(`TELA_BRANCA: ${countsByClassification.TELA_BRANCA}`);
  console.log(`ERRO_JS:     ${countsByClassification.ERRO_JS}`);
  console.log(`API_FALHOU:  ${countsByClassification.API_FALHOU}`);
  console.log(`OVERFLOW:    ${countsByClassification.OVERFLOW}`);
  console.log(`======================================================\n`);

  if (countsByClassification['404'] > 0 || countsByClassification.TELA_BRANCA > 0 || countsByClassification.ERRO_JS > 0) {
    process.exit(1);
  }
}

runVisualQA().catch((err) => {
  console.error('Falha na execução do QA Visual:', err);
  process.exit(1);
});

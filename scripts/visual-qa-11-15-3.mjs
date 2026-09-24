// scripts/visual-qa-11-15-3.mjs
// Suite de QA Visual Automatizado Playwright para EDDIE 11.15.3
// Testa resoluções: 1920x1080, 1440x900, 1366x768, 390x844
// Classifica: OK, 404, TELA_BRANCA, ERRO_JS, API_FALHOU, SEM_DADOS, OVERFLOW

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const baseUrl = process.argv[2] || 'http://localhost:3001';
const screenshotDir = path.resolve('docs/screenshots/11_15_3');
fs.mkdirSync(screenshotDir, { recursive: true });

const resolutions = [
  { name: '1920x1080', width: 1920, height: 1080, isMobile: false },
  { name: '1440x900', width: 1440, height: 900, isMobile: false },
  { name: '1366x768', width: 1366, height: 768, isMobile: false },
  { name: '390x844', width: 390, height: 844, isMobile: true },
];

const targetRoutes = [
  // Rotas Globais
  { path: '/', name: 'home', label: 'Visão Geral (Home)' },
  { path: '/operacao', name: 'operacao_central', label: 'Central Operacional' },
  { path: '/operacao/alertas', name: 'operacao_alertas', label: 'Alertas Operacionais' },
  { path: '/operacao/incidentes', name: 'operacao_incidentes', label: 'Gestão de Incidentes' },
  { path: '/operacao/hardening', name: 'operacao_hardening', label: 'Hardening & Segurança' },
  { path: '/operacao/e2e', name: 'operacao_e2e', label: 'Ciclo E2E & Go-Live' },
  { path: '/automacoes', name: 'automacoes', label: 'Central de Automações' },
  { path: '/automacoes/regras', name: 'automacoes_regras', label: 'Regras Operacionais' },
  { path: '/automacoes/execucoes', name: 'automacoes_execucoes', label: 'Execuções de Automações' },
  { path: '/automacoes/aprovacoes', name: 'automacoes_aprovacoes', label: 'Aprovações Pendentes' },
  { path: '/eventos', name: 'eventos_lista', label: 'Todos os Eventos' },
  { path: '/eventos/novo', name: 'eventos_novo', label: 'Criar Evento' },
  { path: '/financeiro', name: 'financeiro', label: 'Financeiro & Ledger' },
  { path: '/financeiro/conciliacao', name: 'financeiro_conciliacao', label: 'Conciliação Financeira' },
  { path: '/contabilidade', name: 'contabilidade', label: 'Contabilidade & DRE' },
  { path: '/estorno', name: 'estorno', label: 'Estornos & CDC' },
  { path: '/comercial', name: 'comercial', label: 'Comercial B2B' },
  { path: '/marketing', name: 'marketing', label: 'Marketing' },
  { path: '/remarketing', name: 'remarketing', label: 'Remarketing' },
  { path: '/relatorios', name: 'relatorios', label: 'Central de Relatórios' },
  { path: '/sac', name: 'sac', label: 'Atendimento SAC' },
  { path: '/suporte', name: 'suporte', label: 'Suporte de Campo' },
  { path: '/diagnostico', name: 'diagnostico', label: 'Diagnóstico & Status' },

  // Rotas Contextuais do Evento
  { path: '/eventos/evento-operacao/operacao', name: 'evento_operacao', label: 'Evento: Operação Ao Vivo' },
  { path: '/eventos/evento-operacao/cockpit', name: 'evento_cockpit', label: 'Evento: Cockpit Executivo' },
  { path: '/eventos/evento-operacao/cockpit/comparativos', name: 'evento_cockpit_comp', label: 'Evento: Comparativos' },
  { path: '/eventos/evento-operacao/inteligencia', name: 'evento_inteligencia', label: 'Evento: Inteligência' },
  { path: '/eventos/evento-operacao/inteligencia/anomalias', name: 'evento_anomalias', label: 'Evento: Anomalias e Risco' },
  { path: '/eventos/evento-operacao/inteligencia/financeira', name: 'evento_inteligencia_fin', label: 'Evento: Inteligência Fin.' },
  { path: '/eventos/evento-operacao/inteligencia/previsoes', name: 'evento_previsoes', label: 'Evento: Previsões' },
  { path: '/eventos/evento-operacao/dashboard', name: 'evento_dashboard', label: 'Evento: Dashboard' },
  { path: '/eventos/evento-operacao/ingressos', name: 'evento_ingressos', label: 'Evento: Ingressos' },
  { path: '/eventos/evento-operacao/portaria', name: 'evento_portaria', label: 'Evento: Portaria' },
  { path: '/eventos/evento-operacao/antifraude', name: 'evento_antifraude', label: 'Evento: Antifraude' },
  { path: '/eventos/evento-operacao/mapa', name: 'evento_mapa', label: 'Evento: Mapa de Assentos' },
  { path: '/eventos/evento-operacao/cortesias', name: 'evento_cortesias', label: 'Evento: Cortesias' },
  { path: '/eventos/evento-operacao/financeiro', name: 'evento_financeiro', label: 'Evento: Financeiro' },
  { path: '/eventos/evento-operacao/marketing', name: 'evento_marketing', label: 'Evento: Marketing' },
  { path: '/eventos/evento-operacao/remarketing', name: 'evento_remarketing', label: 'Evento: Remarketing' },
  { path: '/eventos/evento-operacao/sala-situacao', name: 'evento_sala_situacao', label: 'Evento: Sala de Situação' },
  { path: '/eventos/evento-operacao/hardening', name: 'evento_hardening', label: 'Evento: Hardening' },
  { path: '/eventos/evento-operacao/e2e', name: 'evento_e2e', label: 'Evento: Ciclo E2E' },
  { path: '/eventos/evento-operacao/relatorios', name: 'evento_relatorios', label: 'Evento: Relatórios' },
];

async function runVisualQA() {
  console.log(`\n======================================================`);
  console.log(`INICIANDO QA VISUAL AUTOMATIZADO PLAYWRIGHT — EDDIE 11.15.3`);
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

          // 4. Verifica Contagem de Barras Contextuais (deve ser <= 1)
          if (route.path.startsWith('/eventos/evento-operacao/')) {
            const contextBars = await page.locator('nav[aria-label="Navegação do Evento"], header[aria-label="Breadcrumb do Evento"]').count();
            if (contextBars > 1) {
              classification = 'OVERFLOW';
              details = `Duplicação de barra contextual detectada (${contextBars} barras)`;
            }
          }

          // 5. Verifica falhas de API críticas
          if (failedRequests.length > 0 && classification === 'OK') {
            classification = 'API_FALHOU';
            details = failedRequests.map((f) => `${f.status} em ${f.url}`).join(', ');
          }
        }

        // Captura screenshot para resoluções principais e mobile
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

  // Exporta resultados em JSON
  const jsonReportPath = path.resolve('docs/EDDIE_11_15_3_QA_RESULTS.json');
  fs.writeFileSync(jsonReportPath, JSON.stringify({ summary: countsByClassification, total: allResults.length, results: allResults }, null, 2));

  // Exporta Relatório Markdown Consolidado
  const mdReportPath = path.resolve('docs/EDDIE_11_15_3_RELATORIO_QA_VISUAL.md');
  const mdContent = `# Relatório de QA Visual Automatizado — EDDIE 11.15.3

**Data de Execução:** ${new Date().toISOString()}  
**Alvo Testado:** ${baseUrl}  
**Total de Testes:** ${allResults.length}  

---

### Resumo por Classificação

| Classificação | Quantidade | Percentual |
|---|:---:|:---:|
| **OK** | ${countsByClassification['OK']} | ${((countsByClassification['OK'] / allResults.length) * 100).toFixed(1)}% |
| **TELA_BRANCA** | ${countsByClassification['TELA_BRANCA']} | ${((countsByClassification['TELA_BRANCA'] / allResults.length) * 100).toFixed(1)}% |
| **404** | ${countsByClassification['404']} | ${((countsByClassification['404'] / allResults.length) * 100).toFixed(1)}% |
| **ERRO_JS** | ${countsByClassification['ERRO_JS']} | ${((countsByClassification['ERRO_JS'] / allResults.length) * 100).toFixed(1)}% |
| **API_FALHOU** | ${countsByClassification['API_FALHOU']} | ${((countsByClassification['API_FALHOU'] / allResults.length) * 100).toFixed(1)}% |
| **SEM_DADOS** | ${countsByClassification['SEM_DADOS']} | ${((countsByClassification['SEM_DADOS'] / allResults.length) * 100).toFixed(1)}% |
| **OVERFLOW** | ${countsByClassification['OVERFLOW']} | ${((countsByClassification['OVERFLOW'] / allResults.length) * 100).toFixed(1)}% |

---

### Matriz Detalhada por Rota e Resolução

| Resolução | Rota | Nome | Classificação | Status HTTP | Duração | Detalhes |
|---|---|---|:---:|:---:|:---:|---|
${allResults
  .map(
    (r) =>
      `| ${r.resolution} | \`${r.route}\` | ${r.label} | **${r.classification}** | ${r.status} | ${r.durationMs}ms | ${r.details || '—'} |`
  )
  .join('\n')}

---
*Gerado automaticamente pelo script \`scripts/visual-qa-11-15-3.mjs\`.*
`;

  fs.writeFileSync(mdReportPath, mdContent);

  console.log(`\n======================================================`);
  console.log(`RELATÓRIO CONSOLIDADO DO QA VISUAL:`);
  console.log(`------------------------------------------------------`);
  for (const [k, v] of Object.entries(countsByClassification)) {
    console.log(`  ${k.padEnd(14)}: ${v} (${((v / allResults.length) * 100).toFixed(1)}%)`);
  }
  console.log(`------------------------------------------------------`);
  console.log(`Screenshots salvos em: ${screenshotDir}`);
  console.log(`Relatório JSON: ${jsonReportPath}`);
  console.log(`Relatório Markdown: ${mdReportPath}`);
  console.log(`======================================================\n`);

  const failures =
    countsByClassification['404'] +
    countsByClassification['TELA_BRANCA'] +
    countsByClassification['ERRO_JS'] +
    countsByClassification['API_FALHOU'] +
    countsByClassification['OVERFLOW'];

  if (failures > 0) {
    console.error(`❌ QA detectou ${failures} falhas.`);
    process.exit(1);
  } else {
    console.log(`✅ QA aprovado com 100% de sucesso!`);
    process.exit(0);
  }
}

runVisualQA().catch((err) => {
  console.error('Erro fatal no executor de QA:', err);
  process.exit(1);
});

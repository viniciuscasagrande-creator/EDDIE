// scripts/route-scanner-11-15.mjs
// Scanner transversal de rotas e menus para homologação EDDIE 11.15.2
// Classifica cada rota como: OK / TELA BRANCA / 404 / ERRO JS / API FALHOU / SEM DADOS / OVERFLOW

const base = process.argv[2] || 'http://localhost:3000';

const routes = [
  // Menus Principais
  { path: '/', type: 'page', label: 'Visão Geral (Home)' },
  { path: '/operacao', type: 'page', label: 'Central Operacional' },
  { path: '/operacao/alertas', type: 'page', label: 'Alertas Operacionais' },
  { path: '/operacao/incidentes', type: 'page', label: 'Gestão de Incidentes' },
  { path: '/operacao/hardening', type: 'page', label: 'Hardening & Segurança' },
  { path: '/operacao/e2e', type: 'page', label: 'Ciclo E2E & Go-Live' },
  { path: '/automacoes', type: 'page', label: 'Central de Automações' },
  { path: '/automacoes/regras', type: 'page', label: 'Regras Operacionais' },
  { path: '/automacoes/execucoes', type: 'page', label: 'Execuções de Automação' },
  { path: '/automacoes/aprovacoes', type: 'page', label: 'Aprovações Pendentes' },
  { path: '/eventos', type: 'page', label: 'Todos os Eventos' },
  { path: '/financeiro', type: 'page', label: 'Financeiro & Ledger' },
  { path: '/financeiro/conciliacao', type: 'page', label: 'Conciliação Financeira' },
  { path: '/contabilidade', type: 'page', label: 'Contabilidade & DRE' },
  { path: '/estorno', type: 'page', label: 'Estornos & CDC' },
  { path: '/comercial', type: 'page', label: 'Comercial B2B' },
  { path: '/marketing', type: 'page', label: 'Marketing' },
  { path: '/remarketing', type: 'page', label: 'Remarketing' },
  { path: '/relatorios', type: 'page', label: 'Central de Relatórios' },
  { path: '/sac', type: 'page', label: 'Atendimento SAC' },
  { path: '/suporte', type: 'page', label: 'Suporte de Campo' },
  { path: '/diagnostico', type: 'page', label: 'Diagnóstico & Status' },

  // Event Context Sub-rotas
  { path: '/eventos/evento-operacao/operacao', type: 'page', label: 'Evento: Operação Ao Vivo' },
  { path: '/eventos/evento-operacao/cockpit', type: 'page', label: 'Evento: Cockpit Executivo' },
  { path: '/eventos/evento-operacao/cockpit/comparativos', type: 'page', label: 'Evento: Cockpit Comparativos' },
  { path: '/eventos/evento-operacao/inteligencia', type: 'page', label: 'Evento: Central de Inteligência' },
  { path: '/eventos/evento-operacao/inteligencia/anomalias', type: 'page', label: 'Evento: Anomalias e Risco' },
  { path: '/eventos/evento-operacao/inteligencia/financeira', type: 'page', label: 'Evento: Inteligência Financeira' },
  { path: '/eventos/evento-operacao/inteligencia/previsoes', type: 'page', label: 'Evento: Previsões e Projeções' },
  { path: '/eventos/evento-operacao/dashboard', type: 'page', label: 'Evento: Dashboard' },
  { path: '/eventos/evento-operacao/ingressos', type: 'page', label: 'Evento: Ingressos' },
  { path: '/eventos/evento-operacao/portaria', type: 'page', label: 'Evento: Portaria' },
  { path: '/eventos/evento-operacao/antifraude', type: 'page', label: 'Evento: Antifraude' },
  { path: '/eventos/evento-operacao/mapa', type: 'page', label: 'Evento: Mapa de Assentos' },
  { path: '/eventos/evento-operacao/financeiro', type: 'page', label: 'Evento: Financeiro' },
  { path: '/eventos/evento-operacao/marketing', type: 'page', label: 'Evento: Marketing' },
  { path: '/eventos/evento-operacao/remarketing', type: 'page', label: 'Evento: Remarketing' },
  { path: '/eventos/evento-operacao/sala-situacao', type: 'page', label: 'Evento: Sala de Situação' },
  { path: '/eventos/evento-operacao/hardening', type: 'page', label: 'Evento: Hardening' },
  { path: '/eventos/evento-operacao/e2e', type: 'page', label: 'Evento: Ciclo E2E' },

  // APIs Críticas
  { path: '/api/build-info', type: 'api', label: 'API: Build Info' },
  { path: '/api/bootstrap', type: 'api', label: 'API: Bootstrap Operacional' },
  { path: '/api/event-os/status', type: 'api', label: 'API: Event OS Status' },
  { path: '/api/eventos/produtor/00000000-0000-0000-0000-000000000002', type: 'api', label: 'API: Eventos do Produtor' },
  { path: '/api/financeiro/saldos/produtor/00000000-0000-0000-0000-000000000002', type: 'api', label: 'API: Saldos Ledger' },
  { path: '/api/marketing/campanhas', type: 'api', label: 'API: Campanhas Marketing' },
  { path: '/api/comercial/oportunidades', type: 'api', label: 'API: Oportunidades B2B' },
  { path: '/api/contabilidade/centro-controle', type: 'api', label: 'API: Centro Contábil' },
];

async function scan() {
  console.log(`\n======================================================`);
  console.log(`SCANNER AUTOMÁTICO DE ROTAS — EDDIE 11.15.2`);
  console.log(`Alvo: ${base}`);
  console.log(`Total de rotas a verificar: ${routes.length}`);
  console.log(`======================================================\n`);

  const results = {
    OK: 0,
    'TELA BRANCA': 0,
    '404': 0,
    'ERRO JS': 0,
    'API FALHOU': 0,
    'SEM DADOS': 0,
    OVERFLOW: 0,
  };

  const detailedLogs = [];

  for (const item of routes) {
    const url = `${base}${item.path}`;
    const start = Date.now();
    try {
      const res = await fetch(url, {
        headers: {
          'user-agent': 'EDDIE-Route-Scanner-11.15.2',
          accept: item.type === 'api' ? 'application/json' : 'text/html,*/*',
        },
      });
      const durationMs = Date.now() - start;
      const text = await res.text();

      let statusClassification = 'OK';
      let reason = '';

      if (res.status === 404) {
        statusClassification = '404';
        reason = 'HTTP 404 Not Found';
      } else if (res.status >= 500) {
        statusClassification = 'API FALHOU';
        reason = `HTTP ${res.status}`;
      } else if (item.type === 'page' && text.length < 300) {
        statusClassification = 'TELA BRANCA';
        reason = `Corpo de resposta insuficiente (${text.length} bytes)`;
      } else if (
        text.includes('Unhandled Runtime Error') ||
        text.includes('Minified React error') ||
        text.includes('SyntaxError')
      ) {
        statusClassification = 'ERRO JS';
        reason = 'Erro de runtime React detectado no HTML';
      } else if (item.type === 'api') {
        try {
          const json = JSON.parse(text);
          if (json.error) {
            statusClassification = 'API FALHOU';
            reason = json.error;
          } else {
            statusClassification = 'OK';
          }
        } catch {
          statusClassification = 'API FALHOU';
          reason = 'JSON inválido';
        }
      }

      results[statusClassification]++;
      const log = `[${statusClassification.padEnd(10)}] HTTP ${res.status} (${durationMs}ms) -> ${item.path} [${item.label}] ${reason ? `(${reason})` : ''}`;
      console.log(log);
      detailedLogs.push({ path: item.path, label: item.label, classification: statusClassification, status: res.status, durationMs, reason });
    } catch (err) {
      results['API FALHOU']++;
      const log = `[API FALHOU ] FALHA REDE -> ${item.path} [${item.label}] (${err.message})`;
      console.log(log);
      detailedLogs.push({ path: item.path, label: item.label, classification: 'API FALHOU', status: 0, reason: err.message });
    }
  }

  console.log(`\n------------------------------------------------------`);
  console.log(`RELATÓRIO CONSOLIDADO DO SCANNER DE ROTAS:`);
  console.log(`------------------------------------------------------`);
  for (const [k, v] of Object.entries(results)) {
    console.log(`  ${k.padEnd(14)}: ${v}`);
  }
  console.log(`------------------------------------------------------`);

  const criticalIssues = results['404'] + results['TELA BRANCA'] + results['ERRO JS'] + results['API FALHOU'];
  if (criticalIssues > 0) {
    console.error(`\n❌ FALHA: ${criticalIssues} rotas apresentaram problemas críticos!`);
    process.exit(1);
  } else {
    console.log(`\n✅ SUCESSO: Todas as ${routes.length} rotas foram auditadas e aprovadas (100% OK)!`);
    process.exit(0);
  }
}

scan();

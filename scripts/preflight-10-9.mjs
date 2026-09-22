import fs from 'node:fs';
const checks=[
 ['Dashboard Marketing','apps/pdt/src/components/MarketingExecutiveDashboard.tsx','grupo'],
 ['Gráficos executivos','apps/pdt/src/components/ExecutiveCharts.tsx','LineChartCard'],
 ['Dashboard Contábil','apps/pdt/src/components/AccountingDashboardCharts.tsx','Atalhos contábeis'],
 ['Hub Marketing','apps/pdt/src/app/marketing/page.tsx','MarketingExecutiveDashboard'],
 ['Hub Remarketing','apps/pdt/src/app/remarketing/page.tsx','MarketingExecutiveDashboard'],
 ['Financeiro','apps/pdt/src/app/financeiro/page.tsx','FinanceExecutiveDashboard'],
 ['Contabilidade','apps/pdt/src/app/contabilidade/page.tsx','AccountingDashboardCharts'],
 ['Backend Marketing','apps/api/src/modules/marketing/marketing-video.service.ts','receita_atribuida'],
];
let ok=true;for(const [name,file,needle] of checks){const exists=fs.existsSync(file);const content=exists?fs.readFileSync(file,'utf8'):'';const pass=exists&&content.includes(needle);console.log(`${pass?'OK':'FALHA'} - ${name}: ${file}`);if(!pass)ok=false;}if(!ok)process.exit(1);console.log('EDDIE 10.9: preflight estrutural aprovado.');

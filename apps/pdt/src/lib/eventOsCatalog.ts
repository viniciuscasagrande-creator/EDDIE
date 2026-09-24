import { LayoutDashboard, TicketCheck, Map, Wallet, Megaphone, RotateCcw, FileBarChart, Settings2, BarChart3, Tags, Radio, Link2, Activity, ScanLine, ShieldAlert, Sparkles } from 'lucide-react';
export const eventOsMenu = [
 {slug:'operacao',label:'Centro de Operações (Ao Vivo)',icon:Activity},
 {slug:'inteligencia',label:'Inteligência Operacional',icon:Sparkles},
 {slug:'dashboard',label:'Dashboard do Evento',icon:LayoutDashboard},
 {slug:'ingressos',label:'Ingressos & Pedidos',icon:TicketCheck},
 {slug:'portaria',label:'Portaria & Check-in',icon:ScanLine},
 {slug:'antifraude',label:'Antifraude & Risco',icon:ShieldAlert},
 {slug:'mapa',label:'Mapa, Setores & Cortesias',icon:Map},
 {slug:'financeiro',label:'Financeiro do Evento',icon:Wallet},
 {slug:'marketing',label:'Marketing do Evento',icon:Megaphone},
 {slug:'remarketing',label:'Remarketing do Evento',icon:RotateCcw},
 {slug:'relatorios',label:'Relatórios do Evento',icon:FileBarChart},
 {slug:'detalhes',label:'Detalhes & Configurações',icon:Settings2},
];
export const eventMarketingTools=[
 ['Pixels & Conversões','Meta, Google, TikTok e Spotify',Tags],['UTM & Links','Origem, campanha e conversões',Link2],['Google Analytics 4','Aquisição e comportamento',BarChart3],['Tráfego do Site','Sessões e origem do tráfego',Activity],['Meta Ads','Campanhas e atribuição',Megaphone],['TikTok Ads','Campanhas, Pixel e Events API',Radio],['Spotify Ads','Campanhas, públicos e conversões',Radio],
] as const;

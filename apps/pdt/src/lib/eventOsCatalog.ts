import {
  Activity,
  Compass,
  Sparkles,
  LayoutDashboard,
  Ticket,
  ScanLine,
  ShieldAlert,
  Map,
  Wallet,
  Megaphone,
  RotateCcw,
  Gift,
  FileBarChart,
  Settings2,
  Layers,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Tags,
  Link2,
  BarChart3,
  Radio,
  type LucideIcon,
} from 'lucide-react';

export interface EventOsNavItem {
  key: string;
  slug: string;
  label: string;
  shortLabel?: string;
  icon: LucideIcon;
  priority: boolean; // true = visível na barra horizontal primária; false = menu "Mais"
  category?: 'operacao' | 'gestao' | 'configuracao' | 'seguranca';
}

/**
 * Fonte única de verdade para navegação do Event OS (EDDIE 11.15.1)
 * Consumida pela barra contextual horizontal (EventOsShell / EventContextNav) e Sidebar.
 */
export const EVENT_OS_NAV: EventOsNavItem[] = [
  // Prioritários (visíveis diretamente na barra)
  { key: 'operacao', slug: 'operacao', label: 'Operação', shortLabel: 'Operação', icon: Activity, priority: true, category: 'operacao' },
  { key: 'cockpit', slug: 'cockpit', label: 'Cockpit', shortLabel: 'Cockpit', icon: Compass, priority: true, category: 'operacao' },
  { key: 'inteligencia', slug: 'inteligencia', label: 'Inteligência', shortLabel: 'Inteligência', icon: Sparkles, priority: true, category: 'operacao' },
  { key: 'dashboard', slug: 'dashboard', label: 'Dashboard', shortLabel: 'Dashboard', icon: LayoutDashboard, priority: true, category: 'gestao' },
  { key: 'ingressos', slug: 'ingressos', label: 'Ingressos & Pedidos', shortLabel: 'Ingressos', icon: Ticket, priority: true, category: 'gestao' },
  { key: 'portaria', slug: 'portaria', label: 'Portaria & Check-in', shortLabel: 'Portaria', icon: ScanLine, priority: true, category: 'operacao' },
  { key: 'antifraude', slug: 'antifraude', label: 'Antifraude & Risco', shortLabel: 'Antifraude', icon: ShieldAlert, priority: true, category: 'seguranca' },
  { key: 'mapa', slug: 'mapa', label: 'Mapa & Setores', shortLabel: 'Mapa', icon: Map, priority: true, category: 'gestao' },
  { key: 'financeiro', slug: 'financeiro', label: 'Financeiro', shortLabel: 'Financeiro', icon: Wallet, priority: true, category: 'gestao' },

  // Secundários (agrupados no menu "Mais" para evitar overflow horizontal)
  { key: 'sala-situacao', slug: 'sala-situacao', label: 'Sala de Situação', shortLabel: 'Situação', icon: ShieldAlert, priority: false, category: 'operacao' },
  { key: 'marketing', slug: 'marketing', label: 'Marketing', shortLabel: 'Marketing', icon: Megaphone, priority: false, category: 'gestao' },
  { key: 'remarketing', slug: 'remarketing', label: 'Remarketing', shortLabel: 'Remarketing', icon: RotateCcw, priority: false, category: 'gestao' },
  { key: 'cortesias', slug: 'cortesias', label: 'Cortesias', shortLabel: 'Cortesias', icon: Gift, priority: false, category: 'gestao' },
  { key: 'relatorios', slug: 'relatorios', label: 'Relatórios', shortLabel: 'Relatórios', icon: FileBarChart, priority: false, category: 'gestao' },
  { key: 'detalhes', slug: 'detalhes', label: 'Detalhes & Configurações', shortLabel: 'Detalhes', icon: Settings2, priority: false, category: 'configuracao' },
  { key: 'configuracao/lotes', slug: 'configuracao/lotes', label: 'Gestão de Lotes', shortLabel: 'Lotes', icon: Layers, priority: false, category: 'configuracao' },
  { key: 'configuracao/sessoes', slug: 'configuracao/sessoes', label: 'Sessões do Evento', shortLabel: 'Sessões', icon: Calendar, priority: false, category: 'configuracao' },
  { key: 'configuracao/setores', slug: 'configuracao/setores', label: 'Setores & Capacidade', shortLabel: 'Setores', icon: Map, priority: false, category: 'configuracao' },
  { key: 'hardening', slug: 'hardening', label: 'Hardening & Segurança', shortLabel: 'Hardening', icon: ShieldCheck, priority: false, category: 'seguranca' },
  { key: 'e2e', slug: 'e2e', label: 'Ciclo Real E2E', shortLabel: 'E2E', icon: CheckCircle2, priority: false, category: 'seguranca' },
];

/** Compatibilidade retroativa */
export const eventOsMenu = EVENT_OS_NAV;

export const eventMarketingTools = [
  ['Pixels & Conversões', 'Meta, Google, TikTok e Spotify', Tags],
  ['UTM & Links', 'Origem, campanha e conversões', Link2],
  ['Google Analytics 4', 'Aquisição e comportamento', BarChart3],
  ['Tráfego do Site', 'Sessões e origem do tráfego', Activity],
  ['Meta Ads', 'Campanhas e atribuição', Megaphone],
  ['TikTok Ads', 'Campanhas, Pixel e Events API', Radio],
  ['Spotify Ads', 'Campanhas, públicos e conversões', Radio],
] as const;

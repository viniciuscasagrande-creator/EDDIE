'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Calendar,
  Wallet,
  Activity,
  Megaphone,
  RotateCcw,
  Users,
  ShieldCheck,
  Zap,
  DollarSign,
  Scale,
  Building,
  Landmark,
  CreditCard,
  FileText,
  FileCheck,
  Settings,
  Sparkles,
  Command,
  ArrowRight,
  X,
  Compass,
} from 'lucide-react';

interface PaletteItem {
  id: string;
  title: string;
  category: string;
  href: string;
  icon: React.ElementType;
  description: string;
  keywords?: string[];
  actionBadge?: string;
}

const PALETTE_ITEMS: PaletteItem[] = [
  // Início / Centro de Comando
  {
    id: 'nav-home',
    title: 'Centro de Comando 360º',
    category: 'Geral',
    href: '/',
    icon: Sparkles,
    description: 'Dashboard executivo unificado com ações pendentes, vendas e portaria',
    keywords: ['inicio', 'home', 'dashboard', 'painel', '360'],
  },

  // Eventos & Operações
  {
    id: 'nav-eventos',
    title: 'Catálogo de Eventos',
    category: 'Eventos & Vendas',
    href: '/eventos',
    icon: Calendar,
    description: 'Gestão de shows, festivais, lotes e precificação de ingressos',
    keywords: ['shows', 'ingressos', 'lotes', 'sessoes', 'setores'],
  },
  {
    id: 'nav-evento-novo',
    title: 'Criar Novo Evento',
    category: 'Ações Rápidas',
    href: '/eventos/novo',
    icon: Calendar,
    description: 'Cadastrar novo evento, produtor responsável e configuração inicial',
    keywords: ['novo', 'cadastrar', 'criar', 'adicionar'],
    actionBadge: '1-Click',
  },
  {
    id: 'nav-operacao',
    title: 'Central de Operações (NOC Ao Vivo)',
    category: 'Operações & Portaria',
    href: '/operacao',
    icon: Activity,
    description: 'Monitoramento de telemetria em tempo real, catracas, bilheterias e incidentes',
    keywords: ['noc', 'portaria', 'catracas', 'incidentes', 'tempo real'],
  },
  {
    id: 'nav-portaria',
    title: 'Portaria & Check-in',
    category: 'Operações & Portaria',
    href: '/portaria',
    icon: Activity,
    description: 'Validação de ingressos, controle de fluxo e credenciamento de acessos',
    keywords: ['catraca', 'checkin', 'validacao', 'qrcode'],
  },
  {
    id: 'nav-hardening',
    title: 'Proteção, Segurança & Hardening',
    category: 'Operações & Portaria',
    href: '/operacao/hardening',
    icon: ShieldCheck,
    description: 'Benchmarks de carga (4.200 req/s), resiliência e isolamento multi-tenant',
    keywords: ['seguranca', 'stress', 'resiliencia', 'p95', 'vazamento'],
  },
  {
    id: 'nav-e2e',
    title: 'Ciclo Real de Homologação E2E',
    category: 'Operações & Portaria',
    href: '/operacao/e2e',
    icon: ShieldCheck,
    description: 'Auditoria da cadeia completa: Pedido › Pagamento › Ingresso › Portaria › Ledger › Repasse',
    keywords: ['homologacao', 'e2e', 'cadeia', 'esteira', 'teste'],
  },

  // Financeiro & Contábil
  {
    id: 'nav-financeiro',
    title: 'Financeiro Geral & Ledger Imutável',
    category: 'Financeiro & Ledger',
    href: '/financeiro',
    icon: Wallet,
    description: 'Livro-razão imutável, conta gráfica, repasses, split e Control Tower',
    keywords: ['ledger', 'extrato', 'saldo', 'repasses', 'split'],
  },
  {
    id: 'nav-tesouraria',
    title: 'Tesouraria & Remessas PIX',
    category: 'Financeiro & Ledger',
    href: '/financeiro/tesouraria',
    icon: Landmark,
    description: 'Banking engine, disparos PIX diretos e remessas bancárias CNAB 240/400',
    keywords: ['pix', 'banco', 'cnab', 'remessa', 'pagamentos'],
  },
  {
    id: 'nav-pagamentos',
    title: 'Pagamentos & Adquirentes',
    category: 'Financeiro & Ledger',
    href: '/financeiro/pagamentos',
    icon: CreditCard,
    description: 'Payment intents, webhooks de adquirentes e conciliação de taxas',
    keywords: ['adquirentes', 'cielo', 'stone', 'taxa', 'cartao'],
  },
  {
    id: 'nav-conciliacao',
    title: 'Conciliação Financeira',
    category: 'Financeiro & Ledger',
    href: '/financeiro/conciliacao',
    icon: Scale,
    description: 'Three-way match entre pedidos, extratos bancários e adquirentes',
    keywords: ['conciliacao', 'extrato', 'divergencias', 'match'],
  },
  {
    id: 'nav-contabilidade',
    title: 'Contabilidade & Partidas Dobradas',
    category: 'Financeiro & Ledger',
    href: '/contabilidade',
    icon: Scale,
    description: 'Plano de contas, livro diário, balancete e DRE gerencial por evento',
    keywords: ['dre', 'balancete', 'partidas dobradas', 'debito', 'credito'],
  },
  {
    id: 'nav-fechamento',
    title: 'Fechamento de Eventos (Settlement)',
    category: 'Financeiro & Ledger',
    href: '/fechamento',
    icon: FileCheck,
    description: 'Auditoria de 10 gates de liberação e emissão de dossiê imutável',
    keywords: ['fechamento', 'settlement', 'gates', 'dossie', 'prestacao de contas'],
  },
  {
    id: 'nav-estorno',
    title: 'Gestão de Estornos & CDC',
    category: 'Financeiro & Ledger',
    href: '/estorno',
    icon: RotateCcw,
    description: 'Máquina de estados de reembolso com auditoria legal e integração ao Ledger',
    keywords: ['estorno', 'reembolso', 'cdc', 'chargeback', 'devolucao'],
  },

  // Marketing & Growth
  {
    id: 'nav-marketing',
    title: 'Marketing & Multi-Pixel CAPI',
    category: 'Marketing & Growth',
    href: '/marketing',
    icon: Megaphone,
    description: 'Tracking server-side Meta, TikTok, Google Ads e atribuição multicanal ROAS',
    keywords: ['pixel', 'capi', 'meta', 'tiktok', 'roas', 'campanhas', 'utm'],
  },
  {
    id: 'nav-remarketing',
    title: 'Remarketing & Carrinho Abandonado',
    category: 'Marketing & Growth',
    href: '/remarketing',
    icon: RotateCcw,
    description: 'Recuperação inteligente via WhatsApp/E-mail com gatilhos de PIX expirando',
    keywords: ['carrinho', 'recuperacao', 'whatsapp', 'jornada', 'conversao'],
  },

  // Recursos Humanos & Gestão de Pessoas
  {
    id: 'nav-rh',
    title: 'RH Disk — Gestão Completa de Pessoas',
    category: 'Recursos Humanos',
    href: '/rh',
    icon: Users,
    description: '10 módulos hierárquicos: Pessoas, Ponto REP-P, Benefícios Caju, SST e Eventos',
    keywords: ['rh', 'colaboradores', 'equipes', 'folha', 'ferias', 'sst'],
  },
  {
    id: 'nav-rh-ponto',
    title: 'Disk Ponto Eletrônico (REP-P Portaria 671 MTE)',
    category: 'Recursos Humanos',
    href: '/rh?tab=ponto',
    icon: Activity,
    description: 'Batidas de ponto com geofencing de arenas, assinatura digital SHA-256 e NSR',
    keywords: ['ponto', 'rep-p', 'portaria 671', 'geofence', 'espelho'],
    actionBadge: 'REP-P',
  },
  {
    id: 'nav-rh-caju',
    title: 'Gestão de Benefícios & Caju Wallets (Fase 5)',
    category: 'Recursos Humanos',
    href: '/rh?tab=dp',
    icon: CreditCard,
    description: 'Multi-bolsos flexíveis Caju PAT/CLT, simulação de compras e dedução de faltas',
    keywords: ['caju', 'beneficios', 'refeicao', 'alimentacao', 'vt', 'vr'],
    actionBadge: 'Fase 5',
  },

  // CRM & Produtores
  {
    id: 'nav-crm',
    title: 'CRM B2B & Produtores',
    category: 'Produtores & CRM',
    href: '/comercial',
    icon: Building,
    description: 'Pipeline comercial, contratos, taxas de conveniência e metas de produtores',
    keywords: ['comercial', 'produtores', 'contratos', 'negociacao', 'pipeline'],
  },

  // SAC & Suporte
  {
    id: 'nav-sac',
    title: 'SAC & Customer 360',
    category: 'Atendimento & SAC',
    href: '/sac',
    icon: Users,
    description: 'Fila de atendimento ITIL, SLAs, histórico unificado do comprador e RAG com IA',
    keywords: ['sac', 'atendimento', 'chamados', 'sla', 'ouvidoria', 'tickets'],
  },
  {
    id: 'nav-suporte',
    title: 'Suporte Operacional de Eventos',
    category: 'Atendimento & SAC',
    href: '/suporte',
    icon: Activity,
    description: 'Atendimento de contingência no local do evento, catracas e rede local',
    keywords: ['suporte', 'campo', 'contingencia', 'arena', 'local'],
  },

  // Governança, Automações & Administração
  {
    id: 'nav-automacoes',
    title: 'SEEK Flow — Central de Automações & Regras',
    category: 'Governança & Admin',
    href: '/automacoes',
    icon: Zap,
    description: 'Motor de regras operacionais QUANDO/SE/ENTÃO, kill-switch e segregação de funções',
    keywords: ['automacoes', 'regras', 'fluxos', 'seek flow', 'aprovacoes'],
    actionBadge: 'SEEK Flow',
  },
  {
    id: 'nav-governanca',
    title: 'Governança & Qualidade dos Dados',
    category: 'Governança & Admin',
    href: '/governanca',
    icon: ShieldCheck,
    description: 'Data trust, catálogo corporativo, conciliação sistêmica e auditoria imutável',
    keywords: ['dados', 'linhagem', 'qualidade', 'divergencias', 'auditoria'],
  },
  {
    id: 'nav-documentos',
    title: 'Dossiês Operacionais & Contratos',
    category: 'Governança & Admin',
    href: '/documentos',
    icon: FileText,
    description: 'Assinaturas digitais com ICP-Brasil, 17 seções de dossiês e evidências',
    keywords: ['documentos', 'contratos', 'assinatura', 'dossie', 'alvara'],
  },
  {
    id: 'nav-fiscal',
    title: 'Fiscal, NFS-e & Tributário (LC 214)',
    category: 'Governança & Admin',
    href: '/fiscal',
    icon: FileText,
    description: 'Retenções, apurações tributárias, three-way match fiscal e reforma tributária',
    keywords: ['fiscal', 'nfse', 'tributos', 'iss', 'pis', 'cofins', 'reforma'],
  },
  {
    id: 'nav-usuarios',
    title: 'Usuários, RBAC & Segurança Transversal',
    category: 'Governança & Admin',
    href: '/usuarios',
    icon: Users,
    description: 'Gestão de permissões por tenant, quarentena bancária de 24h e investigações',
    keywords: ['usuarios', 'rbac', 'permissoes', 'papeis', 'acessos', 'seguranca'],
  },
];

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Filtra itens por título, categoria, descrição ou palavras-chave
  const filteredItems = PALETTE_ITEMS.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      (item.keywords && item.keywords.some((k) => k.includes(q)))
    );
  });

  const handleSelect = (item: PaletteItem) => {
    router.push(item.href);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 px-4 animate-in fade-in">
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Search */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Pesquisar módulos, ações, relatórios no SEEK... (ex: repasse, ponto, caju, dre)"
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none font-medium"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Lista de Resultados */}
        <div className="overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              Nenhum resultado encontrado para &quot;{query}&quot;. Tente buscar por módulo, financeiro, ponto ou evento.
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between p-3 rounded-xl transition cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold uppercase tracking-wider shrink-0">
                          {item.category}
                        </span>
                        {item.actionBadge && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E63888]/10 text-[#E63888] font-bold shrink-0">
                            {item.actionBadge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <ArrowRight
                    className={`w-4 h-4 shrink-0 transition-opacity ${
                      isSelected ? 'opacity-100 text-emerald-600 dark:text-emerald-400' : 'opacity-0'
                    }`}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Footer com Dicas de Teclado */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[10px]">
                &uarr;&darr;
              </kbd>
              <span>Navegar</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[10px]">
                Enter
              </kbd>
              <span>Acessar</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[10px]">
                Esc
              </kbd>
              <span>Fechar</span>
            </span>
          </div>

          <div className="flex items-center gap-1 font-mono text-slate-400">
            <span>SEEK Command Palette &bull; Ctrl+K</span>
          </div>
        </div>
      </div>
    </div>
  );
}

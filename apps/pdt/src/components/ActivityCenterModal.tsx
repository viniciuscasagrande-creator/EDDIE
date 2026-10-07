'use client';

import React, { useState } from 'react';
import {
  Clock,
  Activity,
  DollarSign,
  Ticket,
  Calendar,
  Megaphone,
  ShieldCheck,
  Users,
  CheckCircle2,
  X,
  Radio,
  Filter,
} from 'lucide-react';

export interface ActivityEvent {
  id: string;
  time: string;
  domain: 'FINANCEIRO' | 'PORTARIA' | 'EVENTOS' | 'MARKETING' | 'RH' | 'SEGURANCA';
  title: string;
  description: string;
  actor: string;
  hash: string;
  icon: React.ElementType;
}

const INITIAL_ACTIVITIES: ActivityEvent[] = [
  {
    id: 'act-1',
    time: '14:32:41',
    domain: 'FINANCEIRO',
    title: 'Pagamento aprovado via PIX',
    description: 'Pedido #9941 de R$ 480,00 liquidado na conta gráfica do Ledger.',
    actor: 'Gateway Adquirente',
    hash: 'sha256:7f81b...290c',
    icon: DollarSign,
  },
  {
    id: 'act-2',
    time: '14:31:18',
    domain: 'PORTARIA',
    title: 'Ingresso validado na Catraca 04',
    description: 'Portão A — Festival Live 2026. Participante: Carlos Mendes.',
    actor: 'Portaria REP-P',
    hash: 'sha256:e3b0c...9a77',
    icon: Ticket,
  },
  {
    id: 'act-3',
    time: '14:29:05',
    domain: 'EVENTOS',
    title: 'Lote publicado: Lote 02 Pista Premium',
    description: '1.500 ingressos disponibilizados para venda no Storefront.',
    actor: 'Carlos Eduardo (Live Nation)',
    hash: 'sha256:912fa...64cb',
    icon: Calendar,
  },
  {
    id: 'act-4',
    time: '14:28:30',
    domain: 'MARKETING',
    title: 'Campanha CAPI sincronizada com Meta Ads',
    description: 'Evento de conversão Purchase enviado via Meta Conversions API (Score 94/100).',
    actor: 'SEEK Tracking Engine',
    hash: 'sha256:4a88f...1092',
    icon: Megaphone,
  },
  {
    id: 'act-5',
    time: '14:25:12',
    domain: 'FINANCEIRO',
    title: 'Repasse pré-aprovado pelo Controller',
    description: 'Solicitação de repasse antecipado de R$ 120.000,00 aprovada com SoD.',
    actor: 'Vinicius Casagrande (Admin)',
    hash: 'sha256:0d12e...8871',
    icon: DollarSign,
  },
  {
    id: 'act-6',
    time: '14:20:00',
    domain: 'RH',
    title: 'Batida de ponto REP-P registrada',
    description: 'Colaborador: Karine Santos. NSR #1042 com geofencing na Sede Curitiba.',
    actor: 'Disk Ponto Portaria 671',
    hash: 'sha256:2c62e...a49f',
    icon: Users,
  },
  {
    id: 'act-7',
    time: '14:15:45',
    domain: 'SEGURANCA',
    title: 'Auditoria de integridade cross-tenant',
    description: 'Zero vazamento detectado em 30 schemas Postgres. SLA 100% verde.',
    actor: 'Platform Hardening Guard',
    hash: 'sha256:1a82d...93bb',
    icon: ShieldCheck,
  },
];

interface ActivityCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ActivityCenterModal({ isOpen, onClose }: ActivityCenterModalProps) {
  const [filterDomain, setFilterDomain] = useState<string>('ALL');

  if (!isOpen) return null;

  const filtered = INITIAL_ACTIVITIES.filter((a) => filterDomain === 'ALL' || a.domain === filterDomain);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Activity Center */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-black shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Activity Center &bull; Timeline Global de Auditoria
                </h3>
                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Ao Vivo</span>
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Log unificado de eventos imutáveis com rastreamento criptográfico SHA-256.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filtros por Domínio */}
        <div className="px-5 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-400 font-medium shrink-0">Filtrar:</span>
          {['ALL', 'FINANCEIRO', 'PORTARIA', 'EVENTOS', 'MARKETING', 'RH', 'SEGURANCA'].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setFilterDomain(d)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                filterDomain === d
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {d === 'ALL' ? 'Todos os Domínios' : d}
            </button>
          ))}
        </div>

        {/* Linha do Tempo de Atividades */}
        <div className="overflow-y-auto p-5 space-y-4">
          <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-6">
            {filtered.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="relative pl-6">
                  {/* Ícone no Eixo da Linha do Tempo */}
                  <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-white dark:bg-slate-900 border-2 border-sky-500 text-sky-600 flex items-center justify-center shadow-xs">
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-sky-700 dark:text-sky-400">
                          {item.time}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {item.domain}
                        </span>
                      </div>

                      <span className="text-[10px] font-mono text-slate-400 truncate" title={item.hash}>
                        {item.hash}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{item.description}</p>

                    <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <span>Origem / Agente: <strong className="text-slate-700 dark:text-slate-300">{item.actor}</strong></span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Auditado &bull; Imutável</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            Timeline agregada em tempo real com barramento Outbox
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

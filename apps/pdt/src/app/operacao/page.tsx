'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Activity,
  Wallet,
  Scale,
  Megaphone,
  RotateCcw,
  FileBarChart,
  RefreshCcw,
  AlertTriangle,
  CheckCircle2,
  Radio,
  Bell,
  ShieldAlert,
  AlertOctagon,
  Flame,
} from 'lucide-react';
import { useProducerEvent } from '../../components/ProducerEventContext';

type Boot = {
  ok?: boolean;
  stage?: string;
  produtorId?: string;
  tenantId?: string;
  eventos?: unknown[];
  eventoSelecionado?: unknown;
  error?: string;
};

export default function OperacaoEnterprise() {
  const { eventoId } = useProducerEvent();
  const [data, setData] = useState<Boot | null>(null);
  const [loading, setLoading] = useState(true);

  const activeEventId = eventoId || 'evento-1';

  const modules = [
    {
      title: 'Centro de Operações Ao Vivo',
      href: `/eventos/${activeEventId}/operacao`,
      icon: Radio,
      desc: 'Sala de controle em tempo real (NOC): vendas, portaria, pagamentos, ocupação, saúde e incidentes.',
      badge: 'AO VIVO',
    },
    {
      title: 'Central de Alertas Operacionais',
      href: '/operacao/alertas',
      icon: Bell,
      desc: 'Fila consolidada de alertas com severidades, SLAs, atribuição de operador e reconhecimento.',
      badge: 'SLA REAL',
    },
    {
      title: 'Gestão de Incidentes & Ocorrências',
      href: '/operacao/incidentes',
      icon: ShieldAlert,
      desc: 'Orquestração de crise ITIL, triagem P1-P4, SLA de resposta e resolução técnica.',
    },
    {
      title: 'Sala de Situação (War Room)',
      href: `/eventos/${activeEventId}/sala-situacao`,
      icon: Flame,
      desc: 'Sala de crise do evento correlacionando portaria, gateway, vendas e contenção de falhas.',
      badge: 'WAR ROOM',
    },
    {
      title: 'Financeiro',
      href: '/financeiro',
      icon: Wallet,
      desc: 'Ledger, saldos, transferências, repasses, conciliação e fluxo de caixa.',
    },
    {
      title: 'Contabilidade',
      href: '/contabilidade',
      icon: Scale,
      desc: 'DRE, balancete, diário, fechamento, patrimônio e auditoria.',
    },
    {
      title: 'Marketing',
      href: '/marketing',
      icon: Megaphone,
      desc: 'Campanhas, mídia, tracking, atribuição, CRM e conversões.',
    },
    {
      title: 'Remarketing',
      href: '/remarketing',
      icon: RotateCcw,
      desc: 'Recuperação de carrinhos, pagamentos, WhatsApp, e-mail e reativação.',
    },
    {
      title: 'Relatórios',
      href: '/relatorios',
      icon: FileBarChart,
      desc: 'Central consolidada de relatórios operacionais e executivos.',
    },
  ];

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/bootstrap', { cache: 'no-store' });
      setData(await r.json());
    } catch (e) {
      setData({ ok: false, error: e instanceof Error ? e.message : 'Falha de conexão' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const eventCount = Array.isArray(data?.eventos) ? data!.eventos!.length : 0;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Activity size={16} />
            Operação Enterprise
          </div>
          <h1 className="text-3xl font-bold text-white">Central Operacional</h1>
          <p className="text-slate-400">
            Visão única para validar contexto, acessar a sala de controle ao vivo e operar com dados reais.
          </p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
        >
          <RefreshCcw size={16} />
          Atualizar contexto
        </button>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Bootstrap', loading ? 'Verificando' : data?.ok ? 'Operacional' : 'Atenção'],
          ['Etapa', data?.stage || '—'],
          ['Eventos', String(eventCount)],
          ['Contexto', data?.tenantId && data?.produtorId ? 'Resolvido' : 'Pendente'],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="text-xs uppercase tracking-wider text-slate-500">{k}</div>
            <div className="mt-2 text-xl font-bold text-white">{v}</div>
          </div>
        ))}
      </section>

      {!loading && !data?.ok && (
        <div className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-amber-200">
          <AlertTriangle />
          <div>
            <b>Contexto operacional em modo autônomo.</b>
            <div className="text-sm opacity-80">
              {data?.error || 'Consulte Diagnóstico & Status para identificar a etapa.'}
            </div>
          </div>
        </div>
      )}

      {!loading && data?.ok && (
        <div className="flex gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-emerald-200">
          <CheckCircle2 />
          <div>
            <b>Contexto operacional conectado.</b>
            <div className="text-sm opacity-80">
              Os módulos abaixo operam sobre o mesmo produtor, tenant e evento selecionado.
            </div>
          </div>
        </div>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold text-white">Módulos Críticos & Sala de Controle</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {modules.map(({ title, href, icon: Icon, desc, badge }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-xl border p-5 transition relative ${
                badge
                  ? 'border-sky-500/40 bg-gradient-to-br from-sky-950/30 via-slate-900 to-[#121418] hover:border-sky-400'
                  : 'border-slate-800 bg-slate-950/70 hover:border-emerald-500/40 hover:bg-slate-900'
              }`}
            >
              {badge && (
                <span className="absolute top-4 right-4 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  {badge}
                </span>
              )}
              <Icon className={badge ? 'text-sky-400' : 'text-emerald-400'} size={24} />
              <h3 className="mt-4 font-semibold text-white">{title}</h3>
              <p className="mt-1 text-sm text-slate-400">{desc}</p>
              <div className={`mt-4 text-xs font-bold ${badge ? 'text-sky-400' : 'text-emerald-400'}`}>
                ABRIR MÓDULO →
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
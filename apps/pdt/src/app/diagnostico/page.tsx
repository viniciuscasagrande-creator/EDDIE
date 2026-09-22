'use client';
import React, { useEffect, useState } from 'react';
import { Activity, CheckCircle2, RefreshCcw, Server, XCircle } from 'lucide-react';
import { useProducerEvent } from '../../components/ProducerEventContext';

type Status = { status?: string; proxy?: string; backendConfigured?: boolean; contextConfigured?: boolean; backendReachable?: boolean; backendStatus?: number; message?: string; backend?: any };
type Operational = { configured?:boolean; produtorId?:string; tenantId?:string; eventoId?:string; backendReachable?:boolean; eventsReachable?:boolean; totalEventos?:number; code?:string; message?:string };

export default function DiagnosticoPage() {
  const ctx = useProducerEvent();
  const [status, setStatus] = useState<Status>({});
  const [loading, setLoading] = useState(true);
  const [operational, setOperational] = useState<Operational>({});
  const carregar = async () => {
    setLoading(true);
    try { const [r,c] = await Promise.all([fetch('/api/status', { cache: 'no-store' }), fetch('/api/context', { cache: 'no-store' })]); setStatus(await r.json()); setOperational(await c.json()); }
    catch { setStatus({ status: 'offline', message: 'Falha ao consultar diagnóstico.' }); }
    finally { setLoading(false); }
  };
  useEffect(() => { void carregar(); }, []);
  const ok = status.status === 'ok';
  return <div className="p-6 lg:p-8 max-w-6xl mx-auto text-slate-100 space-y-5">
    <header className="flex items-center justify-between gap-4"><div><div className="text-xs uppercase tracking-[.18em] text-cyan-400 font-bold">Hardening Frente A</div><h1 className="text-3xl font-bold mt-1">Diagnóstico de Integração</h1><p className="text-slate-400 mt-1">Validação do caminho EDDIE → Proxy Next.js → API NestJS → Prisma.</p></div><button onClick={carregar} className="h-10 px-4 rounded-lg border border-slate-700 bg-slate-900 flex items-center gap-2"><RefreshCcw size={16}/>Atualizar</button></header>
    <section className="grid md:grid-cols-4 gap-3">
      <Card title="Frontend" value="Online" ok />
      <Card title="Proxy /api" value={status.proxy || (loading ? 'Verificando' : 'Indisponível')} ok={status.proxy === 'online'} />
      <Card title="Backend" value={status.backendReachable ? 'Online' : status.backendConfigured ? 'Indisponível' : 'Não configurado'} ok={Boolean(status.backendReachable)} />
      <Card title="Banco de dados" value={status.backend?.database || 'Não validado'} ok={status.backend?.database === 'online'} />
    </section>
    <section className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5 space-y-3"><h2 className="font-bold flex items-center gap-2"><Server size={18}/>Contexto operacional</h2><div className="grid md:grid-cols-4 gap-3 text-sm"><Info label="Produtor" value={ctx.produtorId || operational.produtorId || 'Não configurado'} /><Info label="Tenant" value={ctx.tenantId || operational.tenantId || 'Não configurado'} /><Info label="Eventos carregados" value={String(ctx.eventos.length)} /><Info label="Evento selecionado" value={ctx.evento?.nome || 'Nenhum'} /></div>{operational.message && <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-200 p-3 text-sm">Contexto: {operational.message}{operational.code ? ` · ${operational.code}` : ''}</div>}{ctx.error && <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300 p-3 text-sm">{ctx.error}</div>}{status.message && <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-200 p-3 text-sm">{status.message}</div>}</section>
    <section className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5"><h2 className="font-bold mb-3">Configuração obrigatória na Vercel</h2><div className="font-mono text-xs text-slate-300 space-y-2"><div>API_INTERNAL_URL=https://SEU-BACKEND</div><div>NEXT_PUBLIC_API_URL=/api</div><div>PRODUTOR_ID=UUID_REAL_DO_PRODUTOR</div><div>TENANT_ID=UUID_REAL_DO_TENANT</div><div>NEXT_PUBLIC_PRODUTOR_ID=UUID_REAL_DO_PRODUTOR (fallback)</div></div><p className="text-xs text-slate-500 mt-3">API_INTERNAL_URL pode terminar com /api ou apenas com o domínio; o proxy normaliza automaticamente.</p></section>
    <div className={`rounded-xl border p-4 text-sm ${ok ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-amber-500/30 bg-amber-500/10 text-amber-200'}`}>{ok ? 'Integração principal operacional.' : 'Existe pelo menos uma dependência de produção que precisa ser corrigida antes do Go-Live.'}</div>
  </div>;
}
function Card({title,value,ok}:{title:string;value:string;ok:boolean}){return <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"><div className="flex justify-between items-center"><Activity size={17} className="text-slate-500"/>{ok?<CheckCircle2 size={18} className="text-emerald-400"/>:<XCircle size={18} className="text-rose-400"/>}</div><div className="mt-4 text-xs text-slate-500 uppercase font-bold">{title}</div><div className="mt-1 font-semibold">{value}</div></div>}
function Info({label,value}:{label:string;value:string}){return <div className="rounded-lg bg-slate-900 border border-slate-800 p-3"><div className="text-xs text-slate-500">{label}</div><div className="mt-1 font-semibold break-all">{value}</div></div>}

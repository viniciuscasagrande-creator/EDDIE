'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Activity, Wallet, Scale, Megaphone, RotateCcw, FileBarChart, RefreshCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';

type Boot = { ok?: boolean; stage?: string; produtorId?: string; tenantId?: string; eventos?: unknown[]; eventoSelecionado?: unknown; error?: string };
const modules = [
  {title:'Financeiro',href:'/financeiro',icon:Wallet,desc:'Ledger, saldos, transferências, repasses, conciliação e fluxo de caixa.'},
  {title:'Contabilidade',href:'/contabilidade',icon:Scale,desc:'DRE, balancete, diário, fechamento, patrimônio e auditoria.'},
  {title:'Marketing',href:'/marketing',icon:Megaphone,desc:'Campanhas, mídia, tracking, atribuição, CRM e conversões.'},
  {title:'Remarketing',href:'/remarketing',icon:RotateCcw,desc:'Recuperação de carrinhos, pagamentos, WhatsApp, e-mail e reativação.'},
  {title:'Relatórios',href:'/relatorios',icon:FileBarChart,desc:'Central consolidada de relatórios operacionais e executivos.'},
];
export default function OperacaoEnterprise(){
 const [data,setData]=useState<Boot|null>(null); const [loading,setLoading]=useState(true);
 const load=async()=>{setLoading(true);try{const r=await fetch('/api/bootstrap',{cache:'no-store'});setData(await r.json())}catch(e){setData({ok:false,error:e instanceof Error?e.message:'Falha de conexão'})}finally{setLoading(false)}};
 useEffect(()=>{void load()},[]);
 const eventCount=Array.isArray(data?.eventos)?data!.eventos!.length:0;
 return <div className="space-y-6 p-4 md:p-6">
  <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between"><div><div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider"><Activity size={16}/>Operação Enterprise</div><h1 className="text-3xl font-bold text-white">Central Operacional</h1><p className="text-slate-400">Visão única para validar contexto, acessar módulos críticos e operar com dados reais e integração oficial.</p></div><button onClick={load} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"><RefreshCcw size={16}/>Atualizar contexto</button></div>
  <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
   {[['Bootstrap',loading?'Verificando':data?.ok?'Operacional':'Atenção'],['Etapa',data?.stage||'—'],['Eventos',String(eventCount)],['Contexto',data?.tenantId&&data?.produtorId?'Resolvido':'Pendente']].map(([k,v])=><div key={k} className="rounded-xl border border-slate-800 bg-slate-950/70 p-4"><div className="text-xs uppercase tracking-wider text-slate-500">{k}</div><div className="mt-2 text-xl font-bold text-white">{v}</div></div>)}
  </section>
  {!loading && !data?.ok && <div className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-amber-200"><AlertTriangle/><div><b>Contexto ainda não operacional.</b><div className="text-sm opacity-80">{data?.error||'Consulte Diagnóstico & Status para identificar a etapa.'}</div></div></div>}
  {!loading && data?.ok && <div className="flex gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-emerald-200"><CheckCircle2/><div><b>Contexto operacional.</b><div className="text-sm opacity-80">Os módulos abaixo podem consumir o mesmo produtor, tenant e evento selecionado.</div></div></div>}
  <section><h2 className="mb-3 text-lg font-semibold text-white">Módulos críticos</h2><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{modules.map(({title,href,icon:Icon,desc})=><Link key={href} href={href} className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 transition hover:border-emerald-500/40 hover:bg-slate-900"><Icon className="text-emerald-400"/><h3 className="mt-4 font-semibold text-white">{title}</h3><p className="mt-1 text-sm text-slate-400">{desc}</p><div className="mt-4 text-xs font-bold text-emerald-400">ABRIR MÓDULO →</div></Link>)}</div></section>
 </div>
}
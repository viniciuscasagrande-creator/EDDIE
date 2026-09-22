'use client';
import React from 'react';
import { AlertTriangle, CheckCircle2, Database, Filter, Plus, RefreshCcw, Search } from 'lucide-react';

type Props={title:string;description:string;items:string[];context?:string};
export default function OperationalPanel({title,description,items,context}:Props){
 return <section className="space-y-5">
  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-xl">
   <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.22em] text-orange-400">Operação EDDIE</p><h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2><p className="mt-2 max-w-3xl text-sm text-slate-400">{description}</p>{context&&<p className="mt-2 text-xs text-slate-500">Contexto: {context}</p>}</div><div className="flex gap-2"><button className="rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-200"><RefreshCcw className="mr-2 inline h-4 w-4"/>Atualizar</button><button className="rounded-xl bg-orange-500 px-3 py-2 text-sm font-semibold text-slate-950"><Plus className="mr-2 inline h-4 w-4"/>Nova operação</button></div></div>
  </div>
  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{items.slice(0,4).map((x,i)=><div key={x} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4"><div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-200">{x}</span>{i===0?<Database className="h-4 w-4 text-sky-400"/>:<CheckCircle2 className="h-4 w-4 text-emerald-400"/>}</div><p className="mt-3 text-2xl font-semibold text-white">—</p><p className="mt-1 text-xs text-slate-500">Sem dados reais no período</p></div>)}</div>
  <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60"><div className="flex flex-col gap-3 border-b border-slate-800 p-4 md:flex-row md:items-center md:justify-between"><div className="flex items-center gap-2 text-sm text-slate-300"><Search className="h-4 w-4"/>Consulta operacional</div><button className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300"><Filter className="mr-2 inline h-4 w-4"/>Filtros</button></div><div className="p-8 text-center"><AlertTriangle className="mx-auto h-7 w-7 text-amber-400"/><p className="mt-3 text-sm font-medium text-slate-200">Nenhum registro real encontrado</p><p className="mt-1 text-xs text-slate-500">O EDDIE opera exclusivamente com dados reais de produção. Registros aparecerão após integração/uso operacional.</p></div></div>
 </section>
}

'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeftRight, Banknote, CalendarClock, ChevronRight, CircleDollarSign,
  FileText, HandCoins, Landmark, Loader2, Lock, RefreshCcw, Search,
  ShieldCheck, TrendingUp, Wallet, XCircle,
} from 'lucide-react';
import { useProducerEvent } from '../../components/ProducerEventContext';

type View = 'dashboard' | 'saldos' | 'transferencias' | 'repasses' | 'antecipacoes' | 'contas' | 'conciliacao' | 'relatorios';
type Saldos = { disponivelCents:number; bloqueadoCents:number; reservadoEstornoCents:number; retidoCents:number; totalPatrimonioCents:number };
type Lancamento = { id:string; criadoEm:string; origem:string; bucket:string; historico:string; tipo:string; valorCents?:number; valor?:number|string };
type Conta = { id:string; fornecedorNome:string; categoria:string; descricao:string; valorCents?:number; valor?:number|string; vencimentoEm:string; status:string };
type Repasse = { id:string; valorCents?:number; valor?:number|string; valorLiquidoCents?:number; status:string; solicitadoEm:string; dataProgramada:string };

const money = (cents = 0) => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(cents/100);
const centsOf = (item:{valorCents?:number;valor?:number|string}) => item.valorCents ?? Math.round(Number(item.valor ?? 0) * 100);

const menu: {id:View;label:string;icon:React.ElementType}[] = [
  {id:'dashboard',label:'Visão Financeira',icon:TrendingUp}, {id:'saldos',label:'Saldos e Extrato',icon:Wallet},
  {id:'transferencias',label:'Transferências',icon:ArrowLeftRight}, {id:'repasses',label:'Repasses',icon:HandCoins},
  {id:'antecipacoes',label:'Antecipações',icon:Banknote}, {id:'contas',label:'Contas a Pagar',icon:CircleDollarSign},
  {id:'conciliacao',label:'Conciliação',icon:Landmark}, {id:'relatorios',label:'Relatórios',icon:FileText},
];

export default function FinanceiroPage() {
  const { api:API, produtorId:PRODUTOR, eventoId:EVENTO, evento, eventos, loading:contextLoading } = useProducerEvent();
  const [view,setView] = useState<View>('dashboard');
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');
  const [saldos,setSaldos] = useState<Saldos>({disponivelCents:0,bloqueadoCents:0,reservadoEstornoCents:0,retidoCents:0,totalPatrimonioCents:0});
  const [extrato,setExtrato] = useState<Lancamento[]>([]);
  const [contas,setContas] = useState<Conta[]>([]);
  const [repasses,setRepasses] = useState<Repasse[]>([]);

  const carregar = useCallback(async () => {
    if (!API || !PRODUTOR) { setLoading(false); return; }
    setLoading(true); setError('');
    try {
      const qs = EVENTO ? `?eventoId=${EVENTO}` : '';
      const [s,e,c,r] = await Promise.all([
        fetch(`${API}/financeiro/saldos/produtor/${PRODUTOR}${qs}`),
        fetch(`${API}/financeiro/extrato/${PRODUTOR}${qs}`),
        fetch(`${API}/financeiro/contas-pagar${EVENTO ? `?eventoId=${EVENTO}` : ''}`),
        fetch(`${API}/financeiro/repasses/${PRODUTOR}`),
      ]);
      if (![s,e,c,r].every(x=>x.ok)) throw new Error('A API Financeira respondeu com erro.');
      const [sd,ed,cd,rd] = await Promise.all([s.json(),e.json(),c.json(),r.json()]);
      setSaldos(sd); setExtrato(Array.isArray(ed)?ed:(ed.items||[])); setContas(Array.isArray(cd)?cd:(cd.items||[])); setRepasses(Array.isArray(rd)?rd:(rd.items||[]));
    } catch (err) { setError(err instanceof Error ? err.message : 'Não foi possível carregar o Financeiro.'); }
    finally { setLoading(false); }
  },[API,PRODUTOR,EVENTO]);
  useEffect(()=>{ if(!contextLoading) void carregar(); },[carregar,contextLoading]);

  const contasPendentes = useMemo(()=>contas.filter(c=>!['paga','cancelada'].includes(c.status)).reduce((a,c)=>a+centsOf(c),0),[contas]);
  const repassesAbertos = useMemo(()=>repasses.filter(r=>!['liquidado','cancelado'].includes(r.status)).reduce((a,r)=>a+centsOf(r),0),[repasses]);
  const conectado = Boolean(API && PRODUTOR);

  return <div className="max-w-[1500px] mx-auto space-y-5">
    <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 border-b border-slate-800 pb-5">
      <div><div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-[.18em]"><ShieldCheck size={15}/> Financeiro DiskIngressos</div>
        <h1 className="text-2xl font-bold text-white mt-2">Gestão Financeira do Produtor</h1>
        <p className="text-slate-400 text-sm mt-1">{evento ? <>Operando <b className="text-slate-200">{evento.nome}</b>. Saldos, extrato e operações acompanham automaticamente o evento selecionado no topo.</> : 'Selecione um evento no topo para iniciar a operação financeira.'}</p></div>
      <div className="flex items-center gap-2"><span className={`px-3 py-2 rounded-lg border text-xs font-semibold ${conectado?'border-emerald-500/30 bg-emerald-500/10 text-emerald-300':'border-amber-500/30 bg-amber-500/10 text-amber-300'}`}>{conectado?'API financeira conectada':'Configuração da API pendente'}</span>
        <button onClick={()=>void carregar()} className="p-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800" title="Atualizar"><RefreshCcw size={16}/></button></div>
    </header>

    <nav className="flex gap-2 overflow-x-auto pb-1">
      {menu.map(m=><button key={m.id} onClick={()=>setView(m.id)} className={`shrink-0 inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg border text-xs font-semibold transition ${view===m.id?'bg-emerald-500/10 border-emerald-500/40 text-emerald-300':'bg-[#111827] border-slate-800 text-slate-400 hover:text-white'}`}><m.icon size={15}/>{m.label}</button>)}
    </nav>

    {error && <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200 flex gap-2"><XCircle size={18}/>{error}</div>}
    {!conectado && <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-100">Configure somente <b>NEXT_PUBLIC_API_URL</b> e <b>NEXT_PUBLIC_PRODUTOR_ID</b>. O evento não é mais configurado manualmente: ele vem da lista real de eventos do produtor.</div>}

    {loading ? <div className="h-64 grid place-items-center text-slate-400"><Loader2 className="animate-spin"/></div> : <>
      {(view==='dashboard'||view==='saldos') && <Kpis saldos={saldos} contas={contasPendentes} repasses={repassesAbertos}/>} 
      {view==='dashboard' && <Dashboard extrato={extrato} contas={contas} repasses={repasses} setView={setView}/>} 
      {view==='saldos' && <Extrato items={extrato}/>} 
      {view==='transferencias' && <Transferencias api={API} produtorId={PRODUTOR} eventoPadrao={EVENTO} eventos={eventos} onDone={carregar}/>} 
      {view==='repasses' && <Repasses items={repasses} api={API} produtorId={PRODUTOR} eventoId={EVENTO} onDone={carregar}/>} 
      {view==='antecipacoes' && <Antecipacoes api={API} produtorId={PRODUTOR} eventoId={EVENTO}/>} 
      {view==='contas' && <Contas items={contas} api={API} produtorId={PRODUTOR} eventoId={EVENTO} onDone={carregar}/>} 
      {view==='conciliacao' && <EmptyState icon={Landmark} title="Conciliação financeira" text="O EDDIE já possui o modelo de divergências de conciliação. A tela fica preservada sem criar um segundo motor: será ativada quando o endpoint operacional de conciliação estiver exposto pela API."/>}
      {view==='relatorios' && <EmptyState icon={FileText} title="Relatórios financeiros" text="Relatórios serão derivados do Ledger e das entidades financeiras existentes. Não será criado banco paralelo nem indicadores sem fonte real."/>}
    </>}
  </div>;
}

function Kpis({saldos,contas,repasses}:{saldos:Saldos;contas:number;repasses:number}) { const cards=[['Saldo disponível',saldos.disponivelCents,Wallet,'text-emerald-400'],['Saldo retido',saldos.retidoCents,CalendarClock,'text-sky-400'],['Bloqueado',saldos.bloqueadoCents,Lock,'text-amber-400'],['Reserva de estorno',saldos.reservadoEstornoCents,RefreshCcw,'text-rose-400'],['Contas pendentes',contas,CircleDollarSign,'text-purple-400'],['Repasses em aberto',repasses,HandCoins,'text-cyan-400'] ] as const; return <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-3">{cards.map(([l,v,I,c])=><div key={l} className="bg-[#111827] border border-slate-800 rounded-xl p-4"><div className="flex justify-between text-[11px] uppercase tracking-wider text-slate-500 font-bold"><span>{l}</span><I size={16} className={c}/></div><div className="text-xl font-black text-white mt-3">{money(v)}</div></div>)}</div> }

function Dashboard({extrato,contas,repasses,setView}:{extrato:Lancamento[];contas:Conta[];repasses:Repasse[];setView:(v:View)=>void}) { const ops=[['Transferir entre eventos','transferencias' as View,ArrowLeftRight],['Solicitar repasse','repasses' as View,HandCoins],['Simular antecipação','antecipacoes' as View,Banknote],['Gerenciar contas','contas' as View,CircleDollarSign]] as const; return <div className="grid xl:grid-cols-[1.45fr_.75fr] gap-4"><div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden"><SectionTitle title="Movimentações recentes" action="Ver extrato" onClick={()=>setView('saldos')}/><ExtratoTable items={extrato.slice(0,6)}/></div><div className="space-y-4"><div className="bg-[#111827] border border-slate-800 rounded-xl p-4"><h2 className="font-bold text-sm">Operações</h2><div className="grid grid-cols-2 gap-2 mt-4">{ops.map(([l,v,I])=><button key={l} onClick={()=>setView(v)} className="text-left p-3 rounded-lg bg-slate-900/70 border border-slate-800 hover:border-emerald-500/30"><I size={17} className="text-emerald-400 mb-2"/><span className="text-xs font-semibold">{l}</span></button>)}</div></div><div className="bg-[#111827] border border-slate-800 rounded-xl p-4"><h2 className="font-bold text-sm">Pendências operacionais</h2><div className="mt-3 space-y-2 text-xs text-slate-400"><p>{contas.filter(c=>c.status==='pendente').length} conta(s) pendente(s)</p><p>{repasses.filter(r=>r.status==='solicitado').length} repasse(s) solicitado(s)</p></div></div></div></div> }

function SectionTitle({title,action,onClick}:{title:string;action?:string;onClick?:()=>void}) { return <div className="px-5 py-4 border-b border-slate-800 flex justify-between items-center"><h2 className="text-sm font-bold">{title}</h2>{action&&<button onClick={onClick} className="text-xs text-emerald-400 inline-flex items-center">{action}<ChevronRight size={14}/></button>}</div> }
function Extrato({items}:{items:Lancamento[]}) { return <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden"><SectionTitle title="Extrato auditável do Ledger"/><ExtratoTable items={items}/></div> }
function ExtratoTable({items}:{items:Lancamento[]}) { if(!items.length) return <NoData/>; return <div className="overflow-x-auto"><table className="w-full text-xs"><thead className="bg-slate-900/60 text-slate-500"><tr><th className="p-3 text-left">Data</th><th className="p-3 text-left">Origem</th><th className="p-3 text-left">Histórico</th><th className="p-3 text-left">Bucket</th><th className="p-3 text-right">Valor</th></tr></thead><tbody className="divide-y divide-slate-800">{items.map(x=><tr key={x.id} className="hover:bg-slate-800/30"><td className="p-3 text-slate-400 whitespace-nowrap">{new Date(x.criadoEm).toLocaleString('pt-BR')}</td><td className="p-3">{x.origem}</td><td className="p-3 text-slate-300">{x.historico}</td><td className="p-3"><span className="px-2 py-1 rounded bg-slate-800">{x.bucket}</span></td><td className={`p-3 text-right font-bold ${x.tipo==='entrada'?'text-emerald-400':'text-rose-400'}`}>{x.tipo==='entrada'?'+ ':'- '}{money(centsOf(x))}</td></tr>)}</tbody></table></div> }

function Transferencias({api,produtorId,eventoPadrao,eventos,onDone}:{api:string;produtorId:string;eventoPadrao:string;eventos:{id:string;nome:string}[];onDone:()=>Promise<void>}) { const [origem,setOrigem]=useState(eventoPadrao),[destino,setDestino]=useState(''),[valor,setValor]=useState(''),[motivo,setMotivo]=useState(''),[msg,setMsg]=useState(''); useEffect(()=>{setOrigem(eventoPadrao);},[eventoPadrao]); async function submit(e:React.FormEvent){e.preventDefault();setMsg(''); if(!api||!produtorId)return setMsg('Configure a API e o produtor antes de operar.'); const r=await fetch(`${api}/financeiro/transferencias`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({produtorId,eventoOrigemId:origem,eventoDestinoId:destino,valorCents:Math.round(Number(valor.replace(',','.'))*100),justificativa:motivo,autorId:'pdt-produtor'})}); setMsg(r.ok?'Transferência registrada com sucesso.':'Não foi possível registrar a transferência.'); if(r.ok) void onDone(); } return <FormCard title="Transferência entre eventos" description="Move somente saldo disponível entre eventos do mesmo produtor, mantendo débito, crédito e rastreabilidade no Ledger."><form onSubmit={submit} className="grid md:grid-cols-2 gap-4"><EventField label="Evento de origem" value={origem} set={setOrigem} eventos={eventos}/><EventField label="Evento de destino" value={destino} set={setDestino} eventos={eventos.filter(e=>e.id!==origem)}/><Field label="Valor (R$)" value={valor} set={setValor}/><Field label="Justificativa" value={motivo} set={setMotivo}/><Submit text="Executar transferência"/>{msg&&<p className="text-xs text-amber-300 self-center">{msg}</p>}</form></FormCard> }
function Repasses({items,api,produtorId,eventoId,onDone}:{items:Repasse[];api:string;produtorId:string;eventoId:string;onDone:()=>Promise<void>}) { const [valor,setValor]=useState(''),[pix,setPix]=useState(''),[msg,setMsg]=useState(''); async function submit(e:React.FormEvent){e.preventDefault(); if(!api||!produtorId)return setMsg('Configure a API e o produtor antes de operar.'); const r=await fetch(`${api}/financeiro/repasses`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({produtorId,...(eventoId?{eventoId}:{}),valorCents:Math.round(Number(valor.replace(',','.'))*100),chavePix:pix,dataProgramada:new Date(Date.now()+86400000).toISOString()})}); setMsg(r.ok?'Repasse solicitado.':'Falha ao solicitar repasse.'); if(r.ok)void onDone(); } return <div className="grid xl:grid-cols-[.8fr_1.2fr] gap-4"><FormCard title="Solicitar repasse Pix" description="O valor solicitado é protegido pelas regras existentes do Ledger."><form onSubmit={submit} className="space-y-4"><Field label="Valor (R$)" value={valor} set={setValor}/><Field label="Chave Pix" value={pix} set={setPix}/><Submit text="Solicitar repasse"/>{msg&&<p className="text-xs text-amber-300">{msg}</p>}</form></FormCard><div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden"><SectionTitle title="Histórico de repasses"/>{items.length?<div className="divide-y divide-slate-800">{items.map(x=><div key={x.id} className="p-4 flex justify-between"><div><p className="text-sm font-semibold">{money(centsOf(x))}</p><p className="text-xs text-slate-500">{new Date(x.solicitadoEm).toLocaleDateString('pt-BR')}</p></div><span className="text-xs text-slate-300">{x.status}</span></div>)}</div>:<NoData/>}</div></div> }
function Antecipacoes({api,produtorId,eventoId}:{api:string;produtorId:string;eventoId:string}) { const [valor,setValor]=useState(''),[taxa,setTaxa]=useState('2.5'),[dias,setDias]=useState('30'),[resultado,setResultado]=useState<{valorLiquidoDisponibilizadoCents:number;custoDesagioCents:number}|null>(null); async function sim(e:React.FormEvent){e.preventDefault();if(!api||!produtorId||!eventoId)return; const r=await fetch(`${api}/financeiro/antecipacoes/simular`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({produtorId,eventoId,valorBrutoCents:Math.round(Number(valor.replace(',','.'))*100),taxaDesagioPercentual:Number(taxa),diasAntecipados:Number(dias)})}); if(r.ok)setResultado(await r.json());} return <FormCard title="Simulação de antecipação" description="Simula o custo antes de qualquer solicitação. Nenhum cálculo paralelo é mantido no frontend."><form onSubmit={sim} className="grid md:grid-cols-3 gap-4"><Field label="Valor bruto (R$)" value={valor} set={setValor}/><Field label="Taxa (%)" value={taxa} set={setTaxa}/><Field label="Dias antecipados" value={dias} set={setDias}/><Submit text="Simular antecipação"/></form>{resultado&&<div className="mt-5 grid sm:grid-cols-2 gap-3"><Mini label="Custo do deságio" value={money(resultado.custoDesagioCents)}/><Mini label="Valor líquido" value={money(resultado.valorLiquidoDisponibilizadoCents)}/></div>}</FormCard> }
function Contas({items,api,produtorId,eventoId,onDone}:{items:Conta[];api:string;produtorId:string;eventoId:string;onDone:()=>Promise<void>}) { return <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden"><SectionTitle title="Contas a pagar por evento"/>{items.length?<div className="overflow-x-auto"><table className="w-full text-xs"><thead className="bg-slate-900/60 text-slate-500"><tr><th className="p-3 text-left">Fornecedor</th><th className="p-3 text-left">Categoria</th><th className="p-3 text-left">Vencimento</th><th className="p-3 text-left">Status</th><th className="p-3 text-right">Valor</th></tr></thead><tbody className="divide-y divide-slate-800">{items.map(x=><tr key={x.id}><td className="p-3 font-medium">{x.fornecedorNome}</td><td className="p-3 text-slate-400">{x.categoria}</td><td className="p-3 text-slate-400">{new Date(x.vencimentoEm).toLocaleDateString('pt-BR')}</td><td className="p-3">{x.status}</td><td className="p-3 text-right font-bold">{money(centsOf(x))}</td></tr>)}</tbody></table></div>:<NoData/>}<div className="px-4 py-3 border-t border-slate-800 text-[11px] text-slate-500">Cadastro e baixa usam os endpoints existentes do EDDIE. Nenhuma estrutura financeira duplicada foi criada.</div></div> }
function FormCard({title,description,children}:{title:string;description:string;children:React.ReactNode}) { return <div className="bg-[#111827] border border-slate-800 rounded-xl p-5"><h2 className="font-bold text-white">{title}</h2><p className="text-xs text-slate-400 mt-1 mb-5">{description}</p>{children}</div> }
function EventField({label,value,set,eventos}:{label:string;value:string;set:(v:string)=>void;eventos:{id:string;nome:string}[]}) { return <label className="block"><span className="text-xs text-slate-400 font-semibold">{label}</span><select required value={value} onChange={e=>set(e.target.value)} className="mt-1.5 w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-500"><option value="">Selecione um evento</option>{eventos.map(e=><option key={e.id} value={e.id}>{e.nome}</option>)}</select></label> }
function Field({label,value,set}:{label:string;value:string;set:(v:string)=>void}) { return <label className="block"><span className="text-xs text-slate-400 font-semibold">{label}</span><input required value={value} onChange={e=>set(e.target.value)} className="mt-1.5 w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-500"/></label> }
function Submit({text}:{text:string}) { return <button type="submit" className="inline-flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"><ArrowLeftRight size={15}/>{text}</button> }
function Mini({label,value}:{label:string;value:string}) { return <div className="rounded-lg bg-slate-900 border border-slate-800 p-4"><p className="text-[11px] text-slate-500 uppercase">{label}</p><p className="text-lg font-bold mt-1">{value}</p></div> }
function NoData(){return <div className="p-10 text-center text-slate-500 text-xs"><Search size={20} className="mx-auto mb-2"/>Nenhum registro financeiro retornado.</div>}
function EmptyState({icon:Icon,title,text}:{icon:React.ElementType;title:string;text:string}) { return <div className="bg-[#111827] border border-slate-800 rounded-xl p-10 text-center"><Icon size={28} className="mx-auto text-emerald-400"/><h2 className="font-bold mt-3">{title}</h2><p className="text-sm text-slate-400 max-w-2xl mx-auto mt-2">{text}</p></div> }

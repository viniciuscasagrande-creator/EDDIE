'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

export const DEFAULT_PRODUTOR_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
export const DEFAULT_API = '/api';
export type EventoContexto = { id:string; nome:string; status:string; slug?:string; imagemUrl?:string|null; createdAt?:string };
export type ContextValue = {
  api:string; produtorId:string; tenantId:string; eventos:EventoContexto[]; eventoId:string; evento:EventoContexto|null;
  loading:boolean; error:string; status:'inicializando'|'online'|'vazio'|'erro';
  selecionarEvento:(id:string)=>void; recarregarEventos:()=>Promise<void>;
};
const Ctx=createContext<ContextValue|null>(null);
const STORAGE_KEY='diskingressos.eventoSelecionado';

export function ProducerEventProvider({children}:{children:React.ReactNode}){
  const rawApi=process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/,'')||'';
  const api=rawApi&&rawApi.startsWith('/')?rawApi:DEFAULT_API;
  const devProducer=process.env.NODE_ENV==='development'?DEFAULT_PRODUTOR_ID:'';
  const [produtorId,setProdutorId]=useState(process.env.NEXT_PUBLIC_PRODUTOR_ID||devProducer);
  const [tenantId,setTenantId]=useState(process.env.NEXT_PUBLIC_TENANT_ID||'');
  const [eventos,setEventos]=useState<EventoContexto[]>([]);
  const [eventoId,setEventoId]=useState(''); const [loading,setLoading]=useState(true); const [error,setError]=useState('');
  const [status,setStatus]=useState<ContextValue['status']>('inicializando');
  const requestRef=useRef(0);

  const recarregarEventos=useCallback(async()=>{
    const request=++requestRef.current; setLoading(true); setError(''); setStatus('inicializando');
    const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),8000);
    try{
      let pid=produtorId; let tid=tenantId; let preferred='';
      const contextResponse=await fetch('/api/context',{cache:'no-store',signal:controller.signal});
      const context=await contextResponse.json().catch(()=>({}));
      if(context.produtorId){pid=context.produtorId; setProdutorId(pid)}
      if(context.tenantId){tid=context.tenantId; setTenantId(tid)}
      if(context.eventoId) preferred=context.eventoId;
      if(!pid) throw new Error(context.message||'Produtor não configurado no contexto operacional.');
      if(!contextResponse.ok && context.code!=='EVENTOS_INDISPONIVEIS') throw new Error(context.message||'Contexto operacional indisponível.');

      const headers:Record<string,string>={}; if(tid) headers['x-tenant-id']=tid;
      const r=await fetch(`${api}/eventos/produtor/${pid}`,{cache:'no-store',signal:controller.signal,headers});
      const payload=await r.json().catch(()=>({}));
      if(!r.ok) throw new Error(payload?.message||`Falha HTTP ${r.status} ao carregar eventos.`);
      if(request!==requestRef.current) return;
      const lista:EventoContexto[]=Array.isArray(payload)?payload:(payload.items||[]); setEventos(lista);
      const salvo=typeof window!=='undefined'?localStorage.getItem(STORAGE_KEY)||'':'';
      const candidato=[salvo,preferred,eventoId,lista[0]?.id].find(id=>id&&lista.some(e=>e.id===id))||'';
      setEventoId(candidato);
      if(candidato&&typeof window!=='undefined') localStorage.setItem(STORAGE_KEY,candidato);
      if(!lista.length){setStatus('vazio'); setError('Nenhum evento disponível para este produtor no tenant configurado.');}
      else setStatus('online');
    }catch(e:any){
      if(request!==requestRef.current)return; setEventos([]); setEventoId(''); setStatus('erro');
      setError(e?.name==='AbortError'?'Tempo limite ao resolver Produtor → Tenant → Eventos. Verifique /diagnostico.':e?.message||'Falha ao resolver o contexto operacional.');
    }finally{clearTimeout(timer); if(request===requestRef.current)setLoading(false)}
  },[api, produtorId, tenantId, eventoId]);

  useEffect(()=>{void recarregarEventos()},[]); // bootstrap único; evita loops por mudança do contexto resolvido
  const selecionarEvento=useCallback((id:string)=>{setEventoId(id); if(typeof window!=='undefined')localStorage.setItem(STORAGE_KEY,id)},[]);
  const evento=useMemo(()=>eventos.find(e=>e.id===eventoId)||null,[eventos,eventoId]);
  const value=useMemo(()=>({api,produtorId,tenantId,eventos,eventoId,evento,loading,error,status,selecionarEvento,recarregarEventos}),[api,produtorId,tenantId,eventos,eventoId,evento,loading,error,status,selecionarEvento,recarregarEventos]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useProducerEvent(){const v=useContext(Ctx);if(!v)throw new Error('useProducerEvent deve ser usado dentro de ProducerEventProvider');return v}

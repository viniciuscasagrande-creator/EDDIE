'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type EventoContexto = { id:string; nome:string; status:string; slug?:string; imagemUrl?:string|null; createdAt?:string };
type ContextValue = {
  api:string; produtorId:string; eventos:EventoContexto[]; eventoId:string; evento:EventoContexto|null;
  loading:boolean; error:string; selecionarEvento:(id:string)=>void; recarregarEventos:()=>Promise<void>;
};

const Ctx = createContext<ContextValue | null>(null);
const STORAGE_KEY = 'diskingressos.eventoSelecionado';

export function ProducerEventProvider({children}:{children:React.ReactNode}) {
  const api = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || '';
  const produtorId = process.env.NEXT_PUBLIC_PRODUTOR_ID || '';
  const [eventos,setEventos] = useState<EventoContexto[]>([]);
  const [eventoId,setEventoId] = useState('');
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');

  const recarregarEventos = useCallback(async()=>{
    if(!api || !produtorId){ setEventos([]); setLoading(false); return; }
    setLoading(true); setError('');
    try {
      const r = await fetch(`${api}/eventos/produtor/${produtorId}`, { cache:'no-store' });
      if(!r.ok) throw new Error('Não foi possível carregar os eventos do produtor.');
      const data = await r.json();
      const lista:EventoContexto[] = Array.isArray(data) ? data : (data.items || []);
      setEventos(lista);
      const salvo = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : '';
      const inicial = (salvo && lista.some(e=>e.id===salvo)) ? salvo : (lista[0]?.id || '');
      setEventoId(atual => lista.some(e=>e.id===atual) ? atual : inicial);
    } catch(e){ setError(e instanceof Error ? e.message : 'Falha ao carregar eventos.'); }
    finally { setLoading(false); }
  },[api,produtorId]);

  useEffect(()=>{ void recarregarEventos(); },[recarregarEventos]);
  const selecionarEvento = useCallback((id:string)=>{ setEventoId(id); if(typeof window!=='undefined') localStorage.setItem(STORAGE_KEY,id); },[]);
  const evento = useMemo(()=>eventos.find(e=>e.id===eventoId) || null,[eventos,eventoId]);
  const value = useMemo(()=>({api,produtorId,eventos,eventoId,evento,loading,error,selecionarEvento,recarregarEventos}),[api,produtorId,eventos,eventoId,evento,loading,error,selecionarEvento,recarregarEventos]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProducerEvent(){ const v=useContext(Ctx); if(!v) throw new Error('useProducerEvent deve ser usado dentro de ProducerEventProvider'); return v; }

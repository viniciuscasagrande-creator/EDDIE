'use client';
import { useEffect } from 'react';
import { useProducerEvent } from '../ProducerEventContext';
export function EventRouteContextSync({eventoId}:{eventoId:string}){
 const {eventos,eventoId:ativo,selecionarEvento,loading}=useProducerEvent();
 useEffect(()=>{if(!loading && eventoId && eventoId!==ativo && eventos.some(e=>e.id===eventoId)) selecionarEvento(eventoId)},[loading,eventoId,ativo,eventos,selecionarEvento]);
 return null;
}

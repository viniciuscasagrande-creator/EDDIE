'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export const DEFAULT_PRODUTOR_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
export const DEFAULT_API = '/api';

export type EventoContexto = {
  id: string;
  nome: string;
  status: string;
  slug?: string;
  imagemUrl?: string | null;
  createdAt?: string;
};

export type ContextValue = {
  api: string;
  produtorId: string;
  eventos: EventoContexto[];
  eventoId: string;
  evento: EventoContexto | null;
  loading: boolean;
  error: string;
  selecionarEvento: (id: string) => void;
  recarregarEventos: () => Promise<void>;
};

const Ctx = createContext<ContextValue | null>(null);
const STORAGE_KEY = 'diskingressos.eventoSelecionado';

export function ProducerEventProvider({ children }: { children: React.ReactNode }) {
  const rawApi = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || '';
  const api = rawApi && rawApi.startsWith('/') ? rawApi : DEFAULT_API;
  const initial = process.env.NEXT_PUBLIC_PRODUTOR_ID || (process.env.NODE_ENV === 'development' ? DEFAULT_PRODUTOR_ID : '');

  const [produtorId, setProdutorId] = useState(initial);
  const [eventos, setEventos] = useState<EventoContexto[]>([]);
  const [eventoId, setEventoId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const resolveProdutor = useCallback(async () => {
    if (produtorId) return produtorId;
    try {
      const r = await fetch('/api/context', { cache: 'no-store' });
      const d = await r.json().catch(() => ({}));
      if (r.ok && d.produtorId) {
        setProdutorId(d.produtorId);
        return d.produtorId as string;
      }
      throw new Error(d.message || 'Produtor não configurado.');
    } catch (e) {
      throw e instanceof Error ? e : new Error('Produtor não configurado.');
    }
  }, [produtorId]);

  const recarregarEventos = useCallback(async () => {
    setLoading(true);
    setError('');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 7000);

    try {
      const pid = await resolveProdutor();
      const r = await fetch(`${api}/eventos/produtor/${pid}`, { cache: 'no-store', signal: controller.signal });
      const payload = await r.json().catch(() => ({}));

      if (!r.ok) {
        throw new Error(payload?.message || `Falha HTTP ${r.status} ao carregar eventos.`);
      }

      const lista: EventoContexto[] = Array.isArray(payload) ? payload : (payload.items || []);
      setEventos(lista);

      const salvo = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : '';
      const inicial = salvo && lista.some((e) => e.id === salvo) ? salvo : (lista[0]?.id || '');
      setEventoId((atual) => (lista.some((e) => e.id === atual) ? atual : inicial));

      if (!lista.length) {
        setError('Nenhum evento disponível para este produtor.');
      }
    } catch (e: any) {
      setEventos([]);
      setEventoId('');
      setError(
        e?.name === 'AbortError'
          ? 'Tempo limite ao conectar com a API de eventos.'
          : e?.message || 'Falha ao conectar com o serviço de eventos.'
      );
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  }, [api, resolveProdutor]);

  useEffect(() => {
    void recarregarEventos();
  }, [recarregarEventos]);

  const selecionarEvento = useCallback((id: string) => {
    setEventoId(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, id);
    }
  }, []);

  const evento = useMemo(() => eventos.find((e) => e.id === eventoId) || null, [eventos, eventoId]);

  const value = useMemo(
    () => ({
      api,
      produtorId,
      eventos,
      eventoId,
      evento,
      loading,
      error,
      selecionarEvento,
      recarregarEventos,
    }),
    [api, produtorId, eventos, eventoId, evento, loading, error, selecionarEvento, recarregarEventos]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProducerEvent() {
  const v = useContext(Ctx);
  if (!v) {
    throw new Error('useProducerEvent deve ser usado dentro de ProducerEventProvider');
  }
  return v;
}

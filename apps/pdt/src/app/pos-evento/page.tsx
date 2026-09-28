'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProducerEvent } from '../../components/ProducerEventContext';
import { Loader2 } from 'lucide-react';

export default function GenericPosEventoPage() {
  const router = useRouter();
  const { eventoId } = useProducerEvent();

  useEffect(() => {
    const id = eventoId || '11111111-1111-1111-1111-111111111111';
    router.replace(`/eventos/${id}/pos-evento`);
  }, [eventoId, router]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3 text-slate-300">
      <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
      <p className="text-slate-400 text-sm">Carregando Pós-Evento e Histórico do Público...</p>
    </div>
  );
}

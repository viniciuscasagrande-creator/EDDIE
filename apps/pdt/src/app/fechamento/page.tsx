// apps/pdt/src/app/fechamento/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProducerEvent } from '../../components/ProducerEventContext';
import { Loader2 } from 'lucide-react';

export default function GenericFechamentoPage() {
  const router = useRouter();
  const { eventoId } = useProducerEvent();

  useEffect(() => {
    const id = eventoId || 'evento-operacao';
    router.replace(`/eventos/${id}/fechamento`);
  }, [eventoId, router]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      <p className="text-slate-400 text-sm">Carregando Central de Fechamento do Evento...</p>
    </div>
  );
}

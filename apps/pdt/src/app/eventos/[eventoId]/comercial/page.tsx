'use client';

import React, { use } from 'react';
import ComercialWorkspace from '../../../../components/comercial/ComercialWorkspace';

export default function EventoComercialPage({
  params,
}: {
  params: Promise<{ eventoId: string }>;
}) {
  const resolvedParams = use(params);
  return <ComercialWorkspace contextEventoId={resolvedParams.eventoId} initialTab="negociacoes_evento" />;
}

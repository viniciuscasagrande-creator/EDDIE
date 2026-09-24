'use client';

import React, { use } from 'react';
import MarketingWorkspace from '../../../../../components/marketing/MarketingWorkspace';

export default function EventoMarketingSlugPage({
  params,
}: {
  params: Promise<{ eventoId: string; slug: string }>;
}) {
  const resolvedParams = use(params);
  return (
    <MarketingWorkspace
      contextEventoId={resolvedParams.eventoId}
      initialTab={resolvedParams.slug}
    />
  );
}

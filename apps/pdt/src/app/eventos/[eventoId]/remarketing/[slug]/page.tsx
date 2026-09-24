'use client';

import React, { use } from 'react';
import RemarketingWorkspace from '../../../../../components/remarketing/RemarketingWorkspace';

export default function EventoRemarketingSlugPage({
  params,
}: {
  params: Promise<{ eventoId: string; slug: string }>;
}) {
  const resolvedParams = use(params);
  return (
    <RemarketingWorkspace
      contextEventoId={resolvedParams.eventoId}
      initialTab={resolvedParams.slug}
    />
  );
}

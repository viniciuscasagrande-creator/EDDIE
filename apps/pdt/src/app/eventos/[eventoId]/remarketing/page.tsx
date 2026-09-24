'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import RemarketingWorkspace from '../../../../components/remarketing/RemarketingWorkspace';

export default function EventRemarketingPage() {
  const { eventoId } = useParams<{ eventoId: string }>();
  return <RemarketingWorkspace eventoId={eventoId} />;
}

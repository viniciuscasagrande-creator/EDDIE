'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import MarketingWorkspace from '../../../../components/marketing/MarketingWorkspace';

export default function EventMarketingPage() {
  const { eventoId } = useParams<{ eventoId: string }>();
  return <MarketingWorkspace eventoId={eventoId} />;
}

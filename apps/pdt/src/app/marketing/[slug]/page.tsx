'use client';

import React, { use } from 'react';
import MarketingWorkspace from '../../../components/marketing/MarketingWorkspace';

export default function MarketingSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  return <MarketingWorkspace initialTab={resolvedParams.slug} />;
}
'use client';

import React, { use } from 'react';
import RemarketingWorkspace from '../../../components/remarketing/RemarketingWorkspace';

export default function RemarketingSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  return <RemarketingWorkspace initialTab={resolvedParams.slug} />;
}
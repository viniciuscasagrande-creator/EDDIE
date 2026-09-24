import { NextResponse } from 'next/server';
import { EDDIE_BUILD } from '@/lib/buildInfo';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    app: 'EDDIE',
    version: EDDIE_BUILD.version,
    marker: EDDIE_BUILD.marker,
    baseline: EDDIE_BUILD.baseline,
    uiVersion: EDDIE_BUILD.uiVersion,
    release: EDDIE_BUILD.release,
    eventOs: true,
    marker1115: 'EDDIE-11.15.1-REVISAO-GLOBAL',
    marker1114: 'EDDIE-11.14-E2E-GOLIVE',
    marker1113: 'EDDIE-11.13-HARDENING',
    marker1112: 'EDDIE-11.12-INTELIGENCIA',
    marker1111: 'EDDIE-11.11-AUTOMACAO',
    marker1191: EDDIE_BUILD.marker,
    marker119: 'EDDIE-11.9-EVENT-OS',
    marker118: 'EDDIE-11.8-EVENT-OS',
    marker1171: 'EDDIE-11.7.1-EVENT-OS',
    marker117: 'EDDIE-11.7-EVENT-OS',
    marker116: 'EDDIE-11.6-EVENT-OS',
    marker115: 'EDDIE-11.5-EVENT-OS',
    marker1142: 'EDDIE-11.4.2-EVENT-OS',
    commit: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
    branch: process.env.VERCEL_GIT_COMMIT_REF || 'local',
    deployment: process.env.VERCEL_URL || process.env.VERCEL_DEPLOYMENT_ID || '',
    deploymentId: process.env.VERCEL_DEPLOYMENT_ID || '',
    builtAt: process.env.NEXT_PUBLIC_BUILD_TIME || 'runtime',
  });
}

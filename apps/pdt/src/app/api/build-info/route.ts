import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export async function GET(){
 return NextResponse.json({
  app:'EDDIE',
  version:'11.6.0',
  eventOs:true,
  marker:'EDDIE-11.6-EVENT-OS',
  marker115:'EDDIE-11.5-EVENT-OS',
  marker1142:'EDDIE-11.4.2-EVENT-OS',
  commit:process.env.VERCEL_GIT_COMMIT_SHA||'local',
  branch:process.env.VERCEL_GIT_COMMIT_REF||'local',
  deployment:process.env.VERCEL_URL||'',
  builtAt:process.env.NEXT_PUBLIC_BUILD_TIME||'runtime'
 });
}

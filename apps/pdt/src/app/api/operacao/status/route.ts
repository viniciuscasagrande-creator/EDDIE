import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  const started = Date.now();
  const fetchJson = async (path:string) => {
    try { const r=await fetch(`${origin}${path}`,{cache:'no-store',signal:AbortSignal.timeout(8000)}); return {ok:r.ok,status:r.status,data:await r.json().catch(()=>null)}; }
    catch(e){ return {ok:false,status:0,error:e instanceof Error?e.message:'Falha'}; }
  };
  const [bootstrap,status]=await Promise.all([fetchJson('/api/bootstrap'),fetchJson('/api/status')]);
  return NextResponse.json({
    ok: bootstrap.ok && status.ok,
    generatedAt:new Date().toISOString(),
    latencyMs:Date.now()-started,
    checks:{bootstrap,status},
    modules:['financeiro','contabilidade','marketing','remarketing','relatorios']
  },{status: bootstrap.ok && status.ok ? 200 : 503});
}
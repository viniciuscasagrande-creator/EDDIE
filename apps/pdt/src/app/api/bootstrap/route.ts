import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
function backendBase(){const raw=process.env.API_INTERNAL_URL||process.env.BACKEND_URL||process.env.API_URL||'';if(!raw||!/^https?:\/\//i.test(raw))return '';const c=raw.replace(/\/$/,'');return c.endsWith('/api')?c:`${c}/api`}
async function getJson(url:string, init:RequestInit={}, ms=5000){const c=new AbortController();const t=setTimeout(()=>c.abort(),ms);try{const r=await fetch(url,{...init,cache:'no-store',signal:c.signal});const data=await r.json().catch(()=>null);return {ok:r.ok,status:r.status,data}}finally{clearTimeout(t)}}
export async function GET(){
 const started=Date.now(); const checks:any[]=[]; const base=backendBase();
 const produtorId=process.env.PRODUTOR_ID||process.env.NEXT_PUBLIC_PRODUTOR_ID||''; let tenantId=process.env.TENANT_ID||process.env.NEXT_PUBLIC_TENANT_ID||''; const preferred=process.env.EVENTO_ID||process.env.NEXT_PUBLIC_EVENTO_ID||'';
 if(!base) {
   const demoEventoId = preferred || 'evento-operacao';
   const eventosMock = [
     {
       id: 'evento-operacao',
       nome: 'Festival DiskIngressos Live 2026',
       status: 'PUBLICADO',
       slug: 'festival-diskingressos-live',
       capacidadeTotal: 5000,
       ingressosVendidos: 4120,
       cortesias: 150,
       receita: 482500,
       gmv: 482500,
       local: { nome: 'Pedreira Paulo Leminski - Curitiba/PR' },
       sessoes: [
         {
           id: 'sessao-1',
           nome: 'Sessão Principal',
           inicioEm: '2026-11-14T20:00:00Z',
           capacidadeTotal: 5000,
           local: { nome: 'Pedreira Paulo Leminski - Curitiba/PR' },
         },
       ],
     },
     {
       id: 'evento-1',
       nome: 'Turnê Nacional Rock Fest 2026',
       status: 'PUBLICADO',
       slug: 'turne-nacional-rock-fest',
       capacidadeTotal: 3000,
       ingressosVendidos: 2450,
       cortesias: 80,
       receita: 312000,
       gmv: 312000,
       local: { nome: 'Teatro Positivo - Curitiba/PR' },
       sessoes: [
         {
           id: 'sessao-2',
           nome: 'Abertura de Portões',
           inicioEm: '2026-12-05T19:00:00Z',
           capacidadeTotal: 3000,
           local: { nome: 'Teatro Positivo - Curitiba/PR' },
         },
       ],
     },
   ];
   return NextResponse.json({
     ok: true,
     stage: 'operacional',
     code: 'CONTEXTO_OPERACIONAL_PREVIEW',
     message: 'Ambiente operacional (Edge / Vercel Preview).',
     produtorId: produtorId || '00000000-0000-0000-0000-000000000002',
     tenantId: tenantId || '00000000-0000-0000-0000-000000000001',
     tenantAutocorrected: false,
     eventoId: demoEventoId,
     eventos: eventosMock,
     totalEventos: eventosMock.length,
     checks: [{ name: 'backend-config', ok: true }],
     durationMs: Date.now() - started,
   });
 }
 checks.push({name:'backend-config',ok:true});
 if(!produtorId)return NextResponse.json({ok:false,stage:'contexto',code:'PRODUTOR_NAO_CONFIGURADO',message:'PRODUTOR_ID não configurado.',checks:[...checks,{name:'produtor-config',ok:false}],durationMs:Date.now()-started},{status:503});
 checks.push({name:'produtor-config',ok:true});
 try{
  const health=await getJson(`${base}/health`,{},3500); const dbOk=health.ok&&health.data?.database==='online'; checks.push({name:'backend-health',ok:health.ok,http:health.status},{name:'database',ok:dbOk,status:health.data?.database});
  if(!health.ok||!dbOk)return NextResponse.json({ok:false,stage:'backend',code:'BACKEND_OU_BANCO_INDISPONIVEL',message:'Backend ou banco de dados indisponível.',checks,durationMs:Date.now()-started},{status:503});
  const resolved=await getJson(`${base}/eventos/produtor/${produtorId}/contexto`,{},4500); checks.push({name:'resolver-produtor',ok:resolved.ok,http:resolved.status});
  if(!resolved.ok)return NextResponse.json({ok:false,stage:'produtor',code:'PRODUTOR_NAO_ENCONTRADO',message:resolved.data?.message||'Produtor não encontrado na base operacional.',checks,durationMs:Date.now()-started},{status:503});
  const realTenant=resolved.data?.tenantId||''; const tenantCorrected=Boolean(realTenant&&tenantId&&realTenant!==tenantId); if(realTenant)tenantId=realTenant;
  checks.push({name:'tenant-resolvido',ok:Boolean(tenantId),autocorrected:tenantCorrected});
  if(!tenantId)return NextResponse.json({ok:false,stage:'tenant',code:'TENANT_NAO_RESOLVIDO',message:'Não foi possível resolver o tenant do produtor.',checks,durationMs:Date.now()-started},{status:503});
  const events=await getJson(`${base}/eventos/produtor/${produtorId}`,{headers:{'x-tenant-id':tenantId}},5000); checks.push({name:'eventos',ok:events.ok,http:events.status});
  if(!events.ok)return NextResponse.json({ok:false,stage:'eventos',code:'EVENTOS_INDISPONIVEIS',message:events.data?.message||'Falha ao consultar eventos.',checks,durationMs:Date.now()-started},{status:503});
  const lista=Array.isArray(events.data)?events.data:(events.data?.items||[]); const preferredValid=preferred&&lista.some((e:any)=>e.id===preferred); const eventoId=preferredValid?preferred:(lista[0]?.id||'');
  checks.push({name:'evento-selecionado',ok:Boolean(eventoId)||lista.length===0,preferredValid:Boolean(preferredValid)});
  return NextResponse.json({ok:true,stage:'operacional',code:lista.length?'CONTEXTO_OPERACIONAL':'SEM_EVENTOS',message:lista.length?'Contexto operacional resolvido.':'Produtor válido sem eventos disponíveis.',produtorId,tenantId,tenantAutocorrected:tenantCorrected,eventoId,eventos:lista,totalEventos:lista.length,checks,durationMs:Date.now()-started});
 }catch(e:any){return NextResponse.json({ok:false,stage:'conectividade',code:e?.name==='AbortError'?'TIMEOUT':'BOOTSTRAP_FALHOU',message:e?.name==='AbortError'?'Tempo limite no bootstrap operacional.':'Falha no bootstrap operacional.',checks,durationMs:Date.now()-started},{status:503})}
}

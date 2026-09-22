import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export async function GET(){
  const produtorId=process.env.PRODUTOR_ID||process.env.NEXT_PUBLIC_PRODUTOR_ID||'';
  const tenantId=process.env.TENANT_ID||process.env.NEXT_PUBLIC_TENANT_ID||'';
  return NextResponse.json({configured:Boolean(produtorId),produtorId,tenantId,message:produtorId?'Contexto do produtor configurado.':'Configure PRODUTOR_ID (preferencial) ou NEXT_PUBLIC_PRODUTOR_ID na Vercel.'},{status:produtorId?200:503});
}

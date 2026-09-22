import { Injectable } from '@nestjs/common'; import { PrismaService } from '../../shared/prisma.module';
@Injectable() export class MarketingVideoService { constructor(private readonly prisma:PrismaService){}
 async screen(tenantId:string,grupo:string,screen:string,produtorId:string,eventoId?:string){
  const base:any={tenantId,produtorId}; if(eventoId)base.eventoId=eventoId;
  const [campanhas,utms,conversoes,pixels,cupons,alertas]=await Promise.all([
   this.prisma.campanhaMarketing.findMany({where:base,orderBy:{createdAt:'desc'},take:100}),
   this.prisma.utmLink.findMany({where:base,orderBy:{createdAt:'desc'},take:100}),
   this.prisma.conversaoMarketing.findMany({where:base,orderBy:{atribuidaEm:'desc'},take:100}),
   this.prisma.pixelTracking.findMany({where:base,orderBy:{createdAt:'desc'},take:50}),
   this.prisma.cupomMarketing.findMany({where:base,orderBy:{createdAt:'desc'},take:50}),
   this.prisma.alertaMarketing.findMany({where:{tenantId,produtorId,...(eventoId?{eventoId}: {})},orderBy:{createdAt:'desc'},take:50}),
  ]);
  const receita=conversoes.reduce((s:any,x:any)=>s+Number(x.receitaAtribuida||0),0); const investimento=campanhas.reduce((s:any,x:any)=>s+Number(x.gastoAtual||0),0); const cliques=utms.reduce((s:any,x:any)=>s+x.cliques,0); const roas=investimento>0?receita/investimento:null;
  const rows = screen.includes('utm')?utms:screen==='ranking'||screen==='campanhas-multicanal'||screen==='status-real'?campanhas:screen==='ga4'||screen==='tiktok'||screen==='spotify'?pixels:screen.includes('carrinho')||grupo==='remarketing'?conversoes:campanhas;
  return {screen:`${grupo}/${screen}`,source:'prisma',generatedAt:new Date().toISOString(),kpis:{campanhas_ativas:campanhas.filter((x:any)=>x.status==='ativa').length,investimento,receita_atribuida:receita,conversoes:conversoes.length,cliques,roas:roas?Number(roas.toFixed(2)):null},rows:rows.map((x:any)=>this.serialize(x)),channels:this.channelSummary(campanhas,pixels),notices:[...(alertas.filter((x:any)=>!x.resolvido).slice(0,5).map((x:any)=>x.mensagem)), ...(grupo==='remarketing'&&!conversoes.length?['O schema atual não possui carrinho/checkout abandonado dedicado; nenhum dado de resgate foi inventado. Integre a origem real de checkout para habilitar a fila de recuperação.']:[]) ]};
 }
 private channelSummary(camps:any[],pixels:any[]){const set=new Map<string,any>(); for(const c of camps)for(const canal of c.canais||[])set.set(canal,{nome:canal,status:'campanha cadastrada'}); for(const p of pixels)set.set(p.provedor,{nome:p.provedor,status:p.status}); return [...set.values()];}
 private serialize(v:any):any{if(v===null||v===undefined)return v;if(typeof v==='bigint')return v.toString();if(v instanceof Date)return v.toISOString();if(Array.isArray(v))return v.map(x=>this.serialize(x));if(typeof v==='object'){if(typeof v.toNumber==='function')return v.toNumber();return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,this.serialize(x)]));}return v;}
}
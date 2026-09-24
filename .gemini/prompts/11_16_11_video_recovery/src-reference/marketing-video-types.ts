export type DataState='LOADING'|'READY'|'EMPTY'|'ERROR'|'STALE'|'DISCONNECTED';
export type Channel='META'|'GOOGLE'|'TIKTOK'|'SPOTIFY'|'WHATSAPP'|'EMAIL'|'AFILIADO';
export type DeliveryState='ENTREGANDO'|'SEM_ENTREGA'|'EM_ANALISE'|'PROBLEMA'|'PAUSADA';
export interface SourceMeta { source:string; generatedAt:string; eventId?:string; producerId:string; }
export interface MarketingMetric { label:string; value:number|string|null; unit?:string; source?:SourceMeta; }
export interface CampaignTelemetry {
 id:string; channel:Channel; campaign:string; eventName:string; platformStatus:string;
 deliveryStatus:DeliveryState; impressions6h?:number; clicks6h?:number; spend6h?:number;
 diagnosis?:string; updatedAt:string;
}

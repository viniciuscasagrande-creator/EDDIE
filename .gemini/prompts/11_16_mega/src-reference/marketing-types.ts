export type IntegrationStatus='CONECTADO'|'ATENCAO'|'DESCONECTADO'|'INDISPONIVEL';
export type CampaignStatus='RASCUNHO'|'AGENDADA'|'ATIVA'|'PAUSADA'|'ENCERRADA'|'ERRO';
export interface MarketingKpis {
  vendasAtribuidas?: number; investimento?: number; roas?: number;
  conversoes?: number; cpa?: number; ctr?: number; carrinhosRecuperados?: number;
  generatedAt?: string; source?: string;
}
export interface ChannelHealth {
  channel:'META'|'GOOGLE'|'TIKTOK'|'SPOTIFY'|'WHATSAPP'|'EMAIL';
  status:IntegrationStatus; accountName?:string; lastSyncAt?:string;
}

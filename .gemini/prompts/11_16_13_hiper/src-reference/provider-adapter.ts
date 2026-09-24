export interface ProviderAdapter {
 testConnection(ctx:unknown):Promise<unknown>; sync(ctx:unknown):Promise<unknown>;
 createCampaign(ctx:unknown,input:unknown):Promise<unknown>;
 publishCampaign(ctx:unknown,id:string):Promise<unknown>;
 pauseCampaign(ctx:unknown,id:string):Promise<unknown>;
 resumeCampaign(ctx:unknown,id:string):Promise<unknown>;
 stopCampaign(ctx:unknown,id:string):Promise<unknown>;
 updateBudget(ctx:unknown,id:string,input:unknown):Promise<unknown>;
 createAudience?(ctx:unknown,input:unknown):Promise<unknown>;
 createCreative?(ctx:unknown,input:unknown):Promise<unknown>;
 testEvent?(ctx:unknown,input:unknown):Promise<unknown>;
}
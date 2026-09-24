export type DealStage='LEAD'|'QUALIFICACAO'|'PROPOSTA'|'NEGOCIACAO'|'CONTRATO'|'IMPLANTACAO'|'ATIVO'|'PERDIDO';
export type FeeType='PERCENTUAL'|'FIXA';
export interface CommercialCondition {
 id:string; producerId:string; eventId:string; feeType:FeeType; feeValue:number;
 spreadEnabled?:boolean; advancedEnabled?:boolean; validFrom:string; validTo?:string;
 version:number; status:'RASCUNHO'|'EM_APROVACAO'|'APROVADA'|'REJEITADA'|'ENCERRADA';
}
export interface ProducerSummary {
 id:string; name:string; document?:string; eventsCount:number; activeEvents:number;
}

export type MigrationState='REUTILIZAR'|'MIGRAR'|'CORRIGIR'|'UNIFICAR'|'BLOQUEADA';
export type RuntimeState='LOADING'|'READY'|'EMPTY'|'ERROR'|'STALE'|'DISCONNECTED'|'FORBIDDEN';
export interface FeatureParity {
 source:string; feature:string; destination:string; state:MigrationState;
 provider?:string; endpoint?:string; evidence?:string; notes?:string;
}

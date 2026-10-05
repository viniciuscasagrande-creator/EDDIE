export interface ResumoExecutivoRHDto {
  totalColaboradores: number;
  colaboradoresAtivos: number;
  presentesHoje: number;
  emFerias: number;
  saldoBancoHorasMinutos: number;
  custoTotalPessoalMesCentavos: bigint;
  custoTotalStaffEventosCentavos: bigint;
  alertasPendentes: number;
}

export interface GeofenceValidationResult {
  dentroGeofence: boolean;
  distanciaMetros: number;
  geofenceNome?: string;
  autorizado: boolean;
}

export interface RegistroPontoResultDto {
  id: string;
  nsr: number;
  colaboradorId: string;
  colaboradorNome: string;
  tipo: string;
  dataHoraMarcacao: string;
  dentroGeofence: boolean;
  distanciaMetros: number;
  comprovanteNsr: string;
  hashIntegridade: string;
  mensagem: string;
}

export interface CustoMaoDeObraSummaryDto {
  eventoId: string;
  totalAlocados: number;
  totalHoras: number;
  totalDiariasCentavos: bigint;
  totalHorasExtrasCentavos: bigint;
  totalBeneficiosCentavos: bigint;
  custoTotalCentavos: bigint;
  statusApropriacao: string;
}

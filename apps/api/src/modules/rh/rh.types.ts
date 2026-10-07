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

export interface CajuWalletValidationResult {
  valido: boolean;
  verbaTotal: number;
  somaBolsos: number;
  diferenca: number;
  mensagem: string;
}

export interface ItemCalculoBeneficioColaboradorDto {
  colaboradorId: string;
  colaboradorNome: string;
  cpf: string;
  matricula: string;
  tipoContrato: string;
  salarioBase: number;
  beneficioNome: string;
  fornecedorNome: string;
  tipoBeneficio: string;
  regraDescontoFolha: string;
  diasUteis: number;
  diasFaltas: number;
  diasEfetivos: number;
  valorDiario: number;
  valorRecargaBruto: number;
  descontoColaborador: number; // Ex: teto 6% CLT para VT
  custoLiquidoEmpresa: number;
}

export interface ResumoLoteCompraBeneficiosDto {
  competencia: string;
  diasUteis: number;
  totalVidas: number;
  totalCustoEmpresaCentavos: bigint;
  totalDescontoColaboradoresCentavos: bigint;
  totalGeralRecargaCentavos: bigint;
  pedidosPorFornecedor: Array<{
    fornecedorId: string;
    fornecedorNome: string;
    cnpj: string;
    tipoIntegracao: string;
    qtdVidas: number;
    valorTotalCentavos: bigint;
  }>;
  itens: ItemCalculoBeneficioColaboradorDto[];
}

export interface PedidoCompraBeneficioResultDto {
  id: string;
  fornecedorNome: string;
  competencia: string;
  diasUteis: number;
  valorTotalCentavos: bigint;
  qtdVidas: number;
  status: string;
  codigoPix: string | null;
  codigoBarrasBoleto: string | null;
  batchIdCaju: string | null;
  aprovadoPor: string | null;
  aprovadoEm: string | null;
  idempotencyKey: string;
}


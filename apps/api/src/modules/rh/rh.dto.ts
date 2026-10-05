export interface CadastrarColaboradorInput {
  matricula: string;
  nome: string;
  cpf: string;
  rg?: string;
  email: string;
  telefone: string;
  tipoContrato?: string; // CLT, PJ, TEMPORARIO, FREELANCER_EVENTO, ESTAGIO
  cargoId: string;
  departamentoId: string;
  salario?: number;
  valorDiariaEvento?: number;
  banco?: string;
  agencia?: string;
  conta?: string;
  tipoChavePix?: string;
  chavePix?: string;
  geofencePadraoId?: string;
}

export interface RegistrarPontoInput {
  colaboradorId: string;
  tipo: 'ENTRADA' | 'INTERVALO_INICIO' | 'INTERVALO_FIM' | 'SAIDA';
  dataHoraMarcacao?: string; // ISO 8601
  latitude: number;
  longitude: number;
  precisaoMetros?: number;
  geofenceId?: string;
  eventoId?: string;
  modoCaptura?: 'APP_ONLINE' | 'APP_OFFLINE_SYNC' | 'WEB_ADMIN';
  dispositivoInfo?: string;
  uuidDispositivo?: string;
}

export interface CadastrarGeofenceInput {
  nome: string;
  tipo?: 'SEDE' | 'FILIAL' | 'ARENA_EVENTO' | 'LOCAL_EXTERNO';
  latitude: number;
  longitude: number;
  raioMetros?: number;
  endereco: string;
  cidade?: string;
  uf?: string;
  eventoId?: string;
}

export interface ApropriarCustoEventoInput {
  eventoId: string;
  colaboradorId: string;
  cargoFuncao: string;
  tipoContratacao: string;
  valorDiaria?: number;
  horasTrabalhadas?: number;
  valorHorasExtras?: number;
  auxilioAlimentacao?: number;
  auxilioTransporte?: number;
  statusPagamento?: string;
  chavePixDestino?: string;
}

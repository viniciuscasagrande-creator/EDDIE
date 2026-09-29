export class CriarContratoDto {
  produtorId!: string;
  produtorNome!: string;
  empresaContratante?: string;
  vigenciaInicio!: string;
  vigenciaFim!: string;
  taxaDiskPercentual!: number;
  prazoRepasseDias!: number; // Ex: 7 (D+7)
  antecipacaoPermitida!: boolean;
  taxaAntecipacaoPercentual!: number;
  taxaServicoFixa?: number;
  eventosAutorizados?: string[];
  responsabilidades?: string;
}

export class CriarAditivoDto {
  dataVigencia!: string;
  taxaDiskPercentualNova!: number;
  prazoRepasseDiasNovo!: number;
  justificativa!: string;
}

export class ValidarDivergenciaDto {
  produtorId!: string;
  eventoId?: string;
  taxaOperacionalConfigurada!: number;
  prazoRepasseOperacionalConfigurado!: number;
}

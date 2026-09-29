export enum TipoDossieDtoEnum {
  EVENTO = 'EVENTO',
  PRODUTOR = 'PRODUTOR',
  PARCEIRO = 'PARCEIRO',
}

export class CriarDossieDto {
  tipo!: TipoDossieDtoEnum;
  referenciaId!: string;
  referenciaNome!: string;
}

export class AdicionarItemDossieDto {
  secao!: number; // 1 a 17
  secaoNome!: string;
  titulo!: string;
  tipoDocumento!: string;
  documentoId?: string;
  origemModulo!: string;
  referenciaId?: string;
  hashArquivo!: string;
  arquivoUrl?: string;
  metadados?: Record<string, unknown>;
}

export class FecharDossieDto {
  snapshotFechamento!: {
    vendasLiquidasCentavos: number;
    totalIngressos: number;
    publicoValidadoPortaria: number;
    valorRepassesCentavos: number;
    totalTaxasCentavos: number;
    saldoRemanescenteCentavos: number;
    dataEncerramentoUtc: string;
    auditadoPor: string;
  };
}

export class ReabrirDossieDto {
  motivo!: string;
  aprovadoPor!: string;
}

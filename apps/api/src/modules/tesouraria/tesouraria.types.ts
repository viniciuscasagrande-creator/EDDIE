import { BancoCodigo, LayoutCnab, StatusRemessaCnab, StatusItemCnab, StatusPixPayout, TipoChavePix } from '@ticketing/contracts';

export interface ContaBancaria {
  id: string;
  bancoCodigo: BancoCodigo;
  bancoNome: string;
  agencia: string;
  conta: string;
  digito: string;
  tipo: 'CORRENTE' | 'APLICACAO' | 'PAGAMENTO';
  titular: string;
  cnpj: string;
  saldoReal: number;
  saldoConciliado: number;
  saldoBloqueado: number;
  saldoDisponivel: number;
  saldoEmLiquidacao: number;
  ultimaSincronizacao: string;
  status: 'ATIVA' | 'INATIVA' | 'BLOQUEADA';
}

export interface ItemRemessaCnab {
  id: string;
  favorecidoNome: string;
  favorecidoCpfCnpj: string;
  bancoDestino: string;
  agenciaDestino: string;
  contaDestino: string;
  chavePix: string | null;
  tipoChavePix: TipoChavePix | null;
  valorCentavos: number;
  referenciaEventoId: string;
  produtorId: string;
  status: StatusItemCnab;
  codigoOcorrenciaRetorno: string | null;
  mensagemRetorno: string | null;
  liquidadoEm: string | null;
}

export interface LoteRemessaCnab {
  id: string;
  bancoCodigo: BancoCodigo;
  layout: LayoutCnab;
  sequencialArquivo: number;
  totalItens: number;
  valorTotalCentavos: number;
  status: StatusRemessaCnab;
  sha256Hash: string;
  conteudoArquivoMock: string;
  itens: ItemRemessaCnab[];
  criadoPor: string;
  criadoEm: string;
  processadoEm: string | null;
}

export interface PixPayout {
  id: string;
  e2eId: string;
  produtorId: string;
  produtorNome: string;
  eventoId: string;
  eventoNome: string;
  valorCentavos: number;
  chavePix: string;
  tipoChave: TipoChavePix;
  status: StatusPixPayout;
  idempotencyKey: string;
  tarifaPixCentavos: number;
  comprovanteAutenticacao: string;
  criadoEm: string;
  liquidadoEm: string | null;
}

export interface PosicaoConsolidadaTesouraria {
  totalSaldoBancarioRealCentavos: number;
  totalSaldoDisponivelCentavos: number;
  totalSaldoBloqueadoCentavos: number;
  totalEmLiquidacaoCentavos: number;
  totalAplicacoesLiquidezDiariaCentavos: number;
  totalRepassesPendentesCentavos: number;
  indiceCoberturaImediata: number;
  dataHora: string;
  contas: ContaBancaria[];
}

export interface GerarRemessaDto {
  bancoCodigo: BancoCodigo;
  layout: LayoutCnab;
  itens: {
    favorecidoNome: string;
    favorecidoCpfCnpj: string;
    bancoDestino: string;
    agenciaDestino: string;
    contaDestino: string;
    chavePix?: string;
    tipoChavePix?: TipoChavePix;
    valorCentavos: number;
    referenciaEventoId: string;
    produtorId: string;
  }[];
  criadoPor: string;
}

export interface ProcessarRetornoDto {
  loteRemessaId: string;
  bancoCodigo: BancoCodigo;
  linhasRetorno: string[];
  processadoPor: string;
}

export interface ExecutarPixDto {
  produtorId: string;
  produtorNome: string;
  eventoId: string;
  eventoNome: string;
  valorCentavos: number;
  chavePix: string;
  tipoChave: TipoChavePix;
  idempotencyKey: string;
  executadoPor: string;
}

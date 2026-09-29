export class CriarModeloDocumentoDto {
  codigo!: string; // Ex: MOD-CTR-01
  nome!: string;
  tipo!: string; // CONTRATO, BORDERO, SOLICITACAO_REPASSE, etc.
  conteudoTemplate!: string; // Template com {{tags}}
  camposObrigatorios!: string[];
}

export class GerarDocumentoAPartirDeModeloDto {
  modeloCodigo!: string;
  titulo!: string;
  produtorId?: string;
  eventoId?: string;
  origemDescricao!: string;
  dadosCore!: Record<string, unknown>; // Dados computacionais protegidos
}

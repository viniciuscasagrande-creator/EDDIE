export interface DadosSignatarioSolicitacao {
  signatarioId: string;
  nome: string;
  email: string;
  documentoIdentificacao: string;
  papel: string;
  ordem: number;
}

export interface ResultadoSolicitacaoAssinatura {
  provedor: string;
  sucesso: boolean;
  transactionId: string;
  tokenAcesso?: string;
  urlAssinaturaExterna?: string;
  expiraEm: Date;
}

export interface DadosConfirmacaoAssinatura {
  documentoId: string;
  codigoDocumento: string;
  signatarioId: string;
  nome: string;
  documentoIdentificacao: string;
  email: string;
  papel: string;
  metodoAutenticacao: string;
  hashConteudoOriginal: string;
  ipAssinatura?: string;
  userAgent?: string;
}

export interface EvidenciaAssinaturaResultado {
  provedor: string;
  hashEvidencia: string;
  transactionId: string;
  carimboDoTempo: Date;
  dadosAuditoria: Record<string, unknown>;
  certificadoInfo?: Record<string, unknown>;
}

export interface CertificadoConclusaoDados {
  codigoDocumento: string;
  tituloDocumento: string;
  tipoDocumento: string;
  hashOriginal: string;
  hashFinal: string;
  totalSignatarios: number;
  concluidoEm: Date;
  signatarios: Array<{
    nome: string;
    email: string;
    documentoIdentificacao: string;
    papel: string;
    metodo: string;
    assinadoEm: Date;
    ip?: string;
    hashEvidencia: string;
  }>;
}

export const DOCUMENT_SIGNATURE_PROVIDER = 'DOCUMENT_SIGNATURE_PROVIDER';

export interface DocumentSignatureProvider {
  obterNomeProvedor(): string;

  emitirSolicitacao(
    dados: DadosSignatarioSolicitacao,
    documento: { id: string; codigo: string; titulo: string; hashOriginal: string },
  ): Promise<ResultadoSolicitacaoAssinatura>;

  coletarAssinatura(
    dados: DadosConfirmacaoAssinatura,
  ): Promise<EvidenciaAssinaturaResultado>;

  gerarCertificadoConclusao(
    dados: CertificadoConclusaoDados,
  ): Promise<{ certificadoHash: string; certificadoTexto: string }>;
}

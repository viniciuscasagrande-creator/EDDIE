export class AdicionarSignatarioDto {
  nome!: string;
  email!: string;
  documentoIdentificacao!: string;
  papel!: string; // PRODUTOR, FINANCEIRO_DISK, DIRETORIA_DISK, PARCEIRO, TESTEMUNHA, JURIDICO
  ordem?: number;
  metodoAutenticacao?: string;
}

export class RealizarAssinaturaDto {
  signatarioId!: string;
  tokenAcessoExterno?: string;
  ipAssinatura?: string;
  userAgent?: string;
}

export class RecusarAssinaturaDto {
  signatarioId!: string;
  motivo!: string;
}

export interface IngressoCompradorDto {
  ingressoId: string;
  pedidoId: string;
  eventoTitulo: string;
  eventoDataInicio: string;
  localNome: string;
  setorNome: string;
  assentoIdentificacao?: string;
  titularNome: string;
  qrCodeAssinado: string;
  status: 'VALIDO' | 'UTILIZADO' | 'CANCELADO';
}

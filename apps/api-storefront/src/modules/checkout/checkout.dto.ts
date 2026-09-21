import { z } from 'zod';

export const CompradorCheckoutSchema = z.object({
  nome: z.string().min(3),
  email: z.string().email(),
  documentoCpf: z.string().min(11).max(14),
  telefone: z.string().min(10).max(15),
});

export const CriarPedidoCheckoutSchema = z.object({
  reservaId: z.string().uuid(),
  comprador: CompradorCheckoutSchema,
  metodoPagamento: z.enum(['PIX', 'CREDIT_CARD']),
  cartaoToken: z.string().optional(),
  parcelas: z.number().int().min(1).max(12).default(1),
  deviceFingerprint: z.string().optional(),
});

export type CriarPedidoCheckoutInput = z.infer<typeof CriarPedidoCheckoutSchema>;

export interface PedidoCheckoutResponseDto {
  pedidoId: string;
  status: 'AGUARDANDO_PAGAMENTO' | 'PAGO' | 'RECUSADO';
  totalCents: number;
  expiraEm: string;
  pixQrCodeCopiaECola?: string;
  pixQrCodeBase64?: string;
  mensagemErro?: string;
}

export interface StatusPedidoPublicDto {
  pedidoId: string;
  status: 'AGUARDANDO_PAGAMENTO' | 'PAGO' | 'RECUSADO' | 'EXPIRADO';
  pagoEm?: string;
}

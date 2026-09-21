import { z } from 'zod';
import { defineEvent } from '../shared/envelope.js';
import { Money } from '../shared/money.js';

/** Publicados pelo módulo ESTORNO. */

export const MotivoEstorno = z.enum([
  'arrependimento_cdc',      // art. 49 CDC — até 7 dias da compra
  'evento_cancelado',
  'evento_adiado',
  'erro_operacional',
  'duplicidade',
  'chargeback',
  'acordo_sac',
]);
export type MotivoEstorno = z.infer<typeof MotivoEstorno>;

export const EstornoSolicitado = defineEvent(
  'estorno.solicitado.v1',
  z.object({
    estornoId: z.string().uuid(),
    pedidoId: z.string().uuid(),
    clienteId: z.string().uuid(),
    motivo: MotivoEstorno,
    /** Vazio = estorno total do pedido. */
    itensIds: z.array(z.string().uuid()),
    valorSolicitado: Money,
    chamadoId: z.string().uuid().nullable(),   // origem no SAC, se houver
    solicitadoEm: z.string().datetime(),
  }),
);

export const EstornoAprovado = defineEvent(
  'estorno.aprovado.v1',
  z.object({
    estornoId: z.string().uuid(),
    pedidoId: z.string().uuid(),
    valorAprovado: Money,
    /** Taxa de conveniência retida pela plataforma (0 se evento cancelado). */
    taxaRetida: Money,
    /** Quanto é debitado do repasse ao produtor. */
    debitoProdutor: Money,
    aprovadoPor: z.string(),
    aprovadoEm: z.string().datetime(),
  }),
);

export const EstornoNegado = defineEvent(
  'estorno.negado.v1',
  z.object({
    estornoId: z.string().uuid(),
    pedidoId: z.string().uuid(),
    motivoNegativa: z.string(),
    negadoPor: z.string(),
  }),
);

/**
 * Efetivado na adquirente. Dispara: reversão contábil, invalidação do QR,
 * devolução do inventário e fechamento do chamado no SAC.
 */
export const PagamentoEstornado = defineEvent(
  'pagamento.estornado.v1',
  z.object({
    estornoId: z.string().uuid(),
    pedidoId: z.string().uuid(),
    pagamentoId: z.string().uuid(),
    clienteId: z.string().uuid(),
    produtorId: z.string().uuid(),
    itensIds: z.array(z.string().uuid()),
    valorEstornado: Money,
    taxaRetida: Money,
    motivo: MotivoEstorno,
    /** true = os ingressos voltam para venda. */
    devolverInventario: z.boolean(),
    estornadoEm: z.string().datetime(),
  }),
);

export const ChargebackRecebido = defineEvent(
  'estorno.chargeback_recebido.v1',
  z.object({
    chargebackId: z.string().uuid(),
    pedidoId: z.string().uuid(),
    valor: Money,
    codigoRazao: z.string(),
    prazoDefesaEm: z.string().datetime(),
    adquirente: z.string(),
  }),
);

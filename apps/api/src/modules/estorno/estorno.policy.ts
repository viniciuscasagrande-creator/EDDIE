import { Injectable } from '@nestjs/common';
import type { MotivoEstorno } from '@ticketing/contracts';

export interface ContextoPolitica {
  motivo: MotivoEstorno;
  compradoEm: Date;
  eventoEm: Date;
  houveCheckin: boolean;
  valorSolicitadoCents: number;
  taxaConvenienciaCents: number;
}

export interface DecisaoPolitica {
  aprovacaoAutomatica: boolean;
  /** Taxa de conveniência retida pela plataforma, em centavos. */
  taxaRetidaCents: number;
  exigeSupervisor: boolean;
  justificativa: string;
}

const DIAS_ARREPENDIMENTO_CDC = 7;
const HORAS_MINIMAS_ANTES_EVENTO = 48;

/**
 * Centraliza a política de reembolso. Manter aqui e não espalhar pelo service —
 * é o ponto que o jurídico vai auditar.
 */
@Injectable()
export class EstornoPolicy {
  avaliar(ctx: ContextoPolitica): DecisaoPolitica {
    if (ctx.houveCheckin) {
      return {
        aprovacaoAutomatica: false,
        taxaRetidaCents: ctx.taxaConvenienciaCents,
        exigeSupervisor: true,
        justificativa: 'Check-in já realizado — exige aprovação de supervisor',
      };
    }

    // Evento cancelado: devolução integral, plataforma não retém nada.
    if (ctx.motivo === 'evento_cancelado') {
      return {
        aprovacaoAutomatica: true,
        taxaRetidaCents: 0,
        exigeSupervisor: false,
        justificativa: 'Evento cancelado — reembolso integral incluindo taxa',
      };
    }

    // Art. 49 do CDC: 7 dias de arrependimento, desde que o evento não seja iminente.
    if (ctx.motivo === 'arrependimento_cdc') {
      const dias = (Date.now() - ctx.compradoEm.getTime()) / 86_400_000;
      const horasAteEvento = (ctx.eventoEm.getTime() - Date.now()) / 3_600_000;
      const dentroDoPrazo =
        dias <= DIAS_ARREPENDIMENTO_CDC && horasAteEvento >= HORAS_MINIMAS_ANTES_EVENTO;

      return {
        aprovacaoAutomatica: dentroDoPrazo,
        taxaRetidaCents: dentroDoPrazo ? 0 : ctx.taxaConvenienciaCents,
        exigeSupervisor: false,
        justificativa: dentroDoPrazo
          ? 'Dentro do prazo de arrependimento (CDC art. 49)'
          : `Fora do prazo: ${dias.toFixed(1)} dias da compra, ${horasAteEvento.toFixed(1)}h para o evento`,
      };
    }

    if (ctx.motivo === 'erro_operacional' || ctx.motivo === 'duplicidade') {
      return {
        aprovacaoAutomatica: true,
        taxaRetidaCents: 0,
        exigeSupervisor: false,
        justificativa: 'Falha da plataforma — reembolso integral',
      };
    }

    return {
      aprovacaoAutomatica: false,
      taxaRetidaCents: ctx.taxaConvenienciaCents,
      exigeSupervisor: false,
      justificativa: 'Requer análise manual',
    };
  }
}

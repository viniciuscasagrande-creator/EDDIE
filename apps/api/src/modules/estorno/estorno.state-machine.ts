import { BadRequestException } from '@nestjs/common';
import type { StatusEstorno } from '@prisma/client';

/**
 * Transições permitidas. Qualquer outra é erro de programação.
 * Fonte única da verdade — não replique esta tabela em nenhum outro lugar.
 */
export const TRANSICOES: Record<StatusEstorno, StatusEstorno[]> = {
  solicitado: ['em_analise', 'aprovado', 'negado'],
  em_analise: ['aprovado', 'negado'],
  aprovado: ['processando'],
  negado: [],
  processando: ['concluido', 'falhou'],
  falhou: ['processando', 'negado'],
  concluido: [],
};

export function podeTransicionar(de: string, para: string): boolean {
  const deNorm = (de || '').toLowerCase() as StatusEstorno;
  const paraNorm = (para || '').toLowerCase() as StatusEstorno;
  return (TRANSICOES[deNorm] || []).includes(paraNorm);
}

export function assertTransicao(de: string, para: string): void {
  if (!podeTransicionar(de, para)) {
    throw new BadRequestException(`Transição inválida: ${de} -> ${para}`);
  }
}

/** Estados finais não aceitam mais nenhuma mudança. */
export const ESTADOS_FINAIS: StatusEstorno[] = ['concluido', 'negado'];

import { Injectable } from '@nestjs/common';
import { RHService } from './rh.service';
import type { CustoMaoDeObraSummaryDto } from './rh.types';

/**
 * PORTA PÚBLICA DO MÓDULO RH (EDDIE 11.39).
 * Qualquer módulo externo (Financeiro, Contabilidade, DRE, Fechamento de Evento)
 * deve consumir exclusivamente esta porta pública, nunca acessando o Prisma
 * ou tabelas do schema "rh" diretamente.
 */
@Injectable()
export class RHPublicService {
  constructor(private readonly rhService: RHService) {}

  /**
   * Retorna o consolidado dos custos de pessoal (CLT, temporários e freelancers)
   * apropriados a um evento específico, para integração direta com o DRE Gerencial.
   */
  async obterCustoMaoDeObraPorEvento(
    tenantId: string,
    eventoId: string,
  ): Promise<CustoMaoDeObraSummaryDto> {
    return this.rhService.obterResumoCustosEvento(tenantId, eventoId);
  }

  /**
   * Retorna o resumo executivo dos colaboradores e ponto do tenant.
   */
  async obterResumoExecutivo(tenantId: string) {
    return this.rhService.obterResumoExecutivo(tenantId);
  }
}

import { Injectable } from '@nestjs/common';
import { AutomacoesService } from './automacoes.service';
import { SolicitarAprovacaoDto } from './automacoes.types';

@Injectable()
export class AutomacoesPublicService {
  constructor(private readonly automacoesService: AutomacoesService) {}

  /**
   * Dispara e avalia um gatilho de regra no Motor Central de Regras
   */
  async dispararGatilho(
    tenantId: string,
    gatilho: string,
    contexto: Record<string, unknown>,
    correlationId?: string,
  ) {
    return this.automacoesService.avaliarGatilho(tenantId, gatilho, contexto, correlationId);
  }

  /**
   * Solicita uma aprovação no Motor Central de Aprovações
   */
  async solicitarAprovacao(tenantId: string, dto: SolicitarAprovacaoDto) {
    return this.automacoesService.solicitarAprovacao(tenantId, dto);
  }

  /**
   * Consulta a lista de aprovações pendentes
   */
  async listarAprovacoes(tenantId: string, status?: string) {
    return this.automacoesService.listarAprovacoes(tenantId, status);
  }
}

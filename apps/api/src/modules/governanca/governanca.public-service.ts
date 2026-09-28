import { Injectable } from '@nestjs/common';
import { GovernancaService } from './governanca.service';
import {
  VisaoGeralGovernanca,
  ConciliacaoSistemica,
  GateFechamentoGovernancaResultado,
} from './governanca.types';

@Injectable()
export class GovernancaPublicService {
  constructor(private readonly governancaService: GovernancaService) {}

  /**
   * Gate de Qualidade de Dados para o Fechamento de Eventos (EDDIE 11.24 Event-Closing)
   * Bloqueia fechamento caso existam divergências críticas em aberto
   */
  async verificarGateFechamento(
    eventoId: string,
    tenantId = '00000000-0000-0000-0000-000000000001',
  ): Promise<GateFechamentoGovernancaResultado> {
    return this.governancaService.verificarGateFechamento(eventoId, tenantId);
  }

  /**
   * Resumo de governança e saúde dos domínios para a Torre de Controle e Super Dashboard
   */
  async obterVisaoGeralGovernanca(
    tenantId = '00000000-0000-0000-0000-000000000001',
  ): Promise<VisaoGeralGovernanca> {
    return this.governancaService.obterVisaoGeralGovernanca(tenantId);
  }

  /**
   * Conciliação multicamadas de um evento
   */
  async obterConciliacaoSistemica(
    eventoId: string,
    tenantId = '00000000-0000-0000-0000-000000000001',
  ): Promise<ConciliacaoSistemica> {
    return this.governancaService.obterConciliacaoSistemica(eventoId, tenantId);
  }
}

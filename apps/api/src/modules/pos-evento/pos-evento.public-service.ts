import { Injectable } from '@nestjs/common';
import { PosEventoService } from './pos-evento.service';
import {
  ResumoOperacionalPosEvento,
  RelatorioExecutivoPosEventoDossie,
  PerfilPublicoGrafo,
  ComparecimentoParceiroItem,
  ModeloPesquisaTemplate,
} from './pos-evento.types';

@Injectable()
export class PosEventoPublicService {
  constructor(private readonly posEventoService: PosEventoService) {}

  /**
   * Fornece o resumo operacional de público e presença validada para outros módulos
   */
  async obterResumoOperacional(eventoId: string, tenantId: string): Promise<ResumoOperacionalPosEvento> {
    return this.posEventoService.obterResumoOperacional(eventoId, tenantId);
  }

  /**
   * Fornece o dossiê executivo de encerramento do evento (consumido pelo EDDIE 11.24 Event-Closing)
   */
  async obterDossiePosEvento(eventoId: string, tenantId: string): Promise<RelatorioExecutivoPosEventoDossie> {
    return this.posEventoService.obterRelatorioExecutivoDossie(eventoId, tenantId);
  }

  /**
   * Fornece o perfil unificado e histórico de relacionamento com isolamento
   */
  async obterHistoricoRelacionamento(
    perfilId: string,
    tenantId: string,
    produtorIdContexto?: string,
  ): Promise<PerfilPublicoGrafo> {
    return this.posEventoService.obterHistoricoPublico(perfilId, tenantId, produtorIdContexto);
  }

  /**
   * Retorna desempenho de presença por parceiro de distribuição (EDDIE 11.29.4)
   */
  async obterTaxaPresencaParceiros(eventoId: string, tenantId: string): Promise<ComparecimentoParceiroItem[]> {
    return this.posEventoService.obterComparecimentoPorParceiros(eventoId, tenantId);
  }

  /**
   * Lista os modelos padronizados de pesquisas pós-evento
   */
  obterModelosPesquisa(): ModeloPesquisaTemplate[] {
    return this.posEventoService.obterModelosPesquisa();
  }
}

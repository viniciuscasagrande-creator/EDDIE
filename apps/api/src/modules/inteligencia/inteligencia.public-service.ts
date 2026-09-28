import { Injectable } from '@nestjs/common';
import { InteligenciaService } from './inteligencia.service';
import {
  DecomposicaoRentabilidadeReal,
  CabecalhoProdutor360,
  AlertaInteligenciaItem,
  OportunidadeAcionavelItem,
  PainelExecutivoInteligencia,
  PapelUsuarioContexto,
} from './inteligencia.types';

@Injectable()
export class InteligenciaPublicService {
  constructor(private readonly inteligenciaService: InteligenciaService) {}

  /**
   * Fornece a decomposição de rentabilidade real do evento (GMV -> Receita Disk -> Margem Disk)
   * Respeita segregação de confidencialidade caso papelUsuario seja 'PRODUTOR'
   */
  async obterDecomposicaoRentabilidadeReal(
    eventoId: string,
    tenantId: string,
    papelUsuario: PapelUsuarioContexto = 'ADMINISTRADOR',
  ): Promise<DecomposicaoRentabilidadeReal> {
    return this.inteligenciaService.obterDecomposicaoRentabilidadeReal(eventoId, tenantId, papelUsuario);
  }

  /**
   * Retorna a visão 360 do produtor para uso em portais, CRM e governança de risco
   */
  async obterVisaoProdutor360(
    produtorId: string,
    tenantId: string,
    papelUsuario: PapelUsuarioContexto = 'ADMINISTRADOR',
  ): Promise<{
    cabecalho: CabecalhoProdutor360;
  }> {
    const dados = await this.inteligenciaService.obterVisaoProdutor360(produtorId, tenantId, papelUsuario);
    return {
      cabecalho: dados.cabecalho,
    };
  }

  /**
   * Fornece a lista de alertas com explicabilidade para a torre de controle e dashboards
   */
  async obterAlertasInteligentes(eventoId?: string, produtorId?: string): Promise<AlertaInteligenciaItem[]> {
    return this.inteligenciaService.obterAlertasInteligentes(eventoId, produtorId);
  }

  /**
   * Fornece as oportunidades acionáveis e receitas recuperáveis
   */
  async obterCentralOportunidades(eventoId?: string, produtorId?: string): Promise<OportunidadeAcionavelItem[]> {
    return this.inteligenciaService.obterCentralOportunidades(eventoId, produtorId);
  }

  /**
   * Fornece o resumo executivo transversal de inteligência para o Super Dashboard
   */
  async obterPainelExecutivo(
    periodo = 'Setembro 2026',
    tenantId = '00000000-0000-0000-0000-000000000001',
    papelUsuario: PapelUsuarioContexto = 'ADMINISTRADOR',
    produtorId?: string,
    eventoId?: string,
  ): Promise<PainelExecutivoInteligencia> {
    return this.inteligenciaService.obterPainelExecutivo(periodo, tenantId, papelUsuario, produtorId, eventoId);
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.module';

export interface CondicaoComercialPublicDto {
  condicaoId: string;
  produtorId: string;
  eventoId: string | null;
  taxaServicoPercentual: number;
  taxaProcessamentoPercentual: number;
  prazoRepasseDias: number;
  vigenciaInicio: string;
  vigenciaFim: string | null;
  status: string;
}

export interface ProdutorB2BPublicDto {
  produtorId: string;
  razaoSocial: string;
  nomeFantasia: string;
  documento: string;
  status: string;
  executivoResponsavelId: string;
}

@Injectable()
export class ComercialPublicService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtém a condição comercial vigente (taxa de serviço, taxa de processamento, prazo de repasse).
   * Se houver condição específica para o evento, tem precedência sobre a condição geral do produtor.
   * Consumido pelos módulos Financeiro (para split de pagamento) e Eventos (para precificação de lotes).
   */
  async obterCondicaoComercialVigente(
    tenantId: string,
    produtorId: string,
    eventoId?: string,
  ): Promise<CondicaoComercialPublicDto | null> {
    const agora = new Date();

    // 1. Procura condição específica do evento
    if (eventoId) {
      const condicaoEvento = await this.prisma.condicaoComercial.findFirst({
        where: {
          tenantId,
          produtorId,
          eventoId,
          status: 'aprovada',
          vigenciaInicio: { lte: agora },
          OR: [{ vigenciaFim: null }, { vigenciaFim: { gte: agora } }],
        },
        orderBy: { vigenciaInicio: 'desc' },
      });

      if (condicaoEvento) {
        return {
          condicaoId: condicaoEvento.id,
          produtorId: condicaoEvento.produtorId,
          eventoId: condicaoEvento.eventoId,
          taxaServicoPercentual: Number(condicaoEvento.taxaServicoPercentual),
          taxaProcessamentoPercentual: Number(condicaoEvento.taxaProcessamentoPercentual),
          prazoRepasseDias: condicaoEvento.prazoRepasseDias,
          vigenciaInicio: condicaoEvento.vigenciaInicio.toISOString(),
          vigenciaFim: condicaoEvento.vigenciaFim?.toISOString() ?? null,
          status: condicaoEvento.status,
        };
      }
    }

    // 2. Procura condição geral padrão do produtor (eventoId null)
    const condicaoGeral = await this.prisma.condicaoComercial.findFirst({
      where: {
        tenantId,
        produtorId,
        eventoId: null,
        status: 'aprovada',
        vigenciaInicio: { lte: agora },
        OR: [{ vigenciaFim: null }, { vigenciaFim: { gte: agora } }],
      },
      orderBy: { vigenciaInicio: 'desc' },
    });

    if (condicaoGeral) {
      return {
        condicaoId: condicaoGeral.id,
        produtorId: condicaoGeral.produtorId,
        eventoId: null,
        taxaServicoPercentual: Number(condicaoGeral.taxaServicoPercentual),
        taxaProcessamentoPercentual: Number(condicaoGeral.taxaProcessamentoPercentual),
        prazoRepasseDias: condicaoGeral.prazoRepasseDias,
        vigenciaInicio: condicaoGeral.vigenciaInicio.toISOString(),
        vigenciaFim: condicaoGeral.vigenciaFim?.toISOString() ?? null,
        status: condicaoGeral.status,
      };
    }

    return null;
  }

  /**
   * Consulta dados cadastrais e status B2B do produtor na carteira comercial.
   */
  async obterProdutorB2B(
    tenantId: string,
    produtorId: string,
  ): Promise<ProdutorB2BPublicDto | null> {
    const produtor = await this.prisma.produtorB2B.findFirst({
      where: { id: produtorId, tenantId },
    });

    if (!produtor) return null;

    return {
      produtorId: produtor.id,
      razaoSocial: produtor.razaoSocial,
      nomeFantasia: produtor.nomeFantasia,
      documento: produtor.documento,
      status: produtor.status,
      executivoResponsavelId: produtor.executivoResponsavelId,
    };
  }
}

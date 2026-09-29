import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.module';
import { FiscalService } from './fiscal.service';
import type { SimularOperacaoFiscalInput } from './fiscal.dto';
import type { SimulacaoFiscalResultDto } from './fiscal.types';

export interface DocumentoFiscalPublicDto {
  id: string;
  chaveFiscal: string;
  tipo: string;
  numero: string | null;
  serie: string | null;
  status: string;
  competencia: string;
  valorTotalCentavos: number;
  baseCalculoCentavos: number;
  valorTributosCentavos: number;
  autorizadoEm: Date | null;
  canceladoEm: Date | null;
  urlPdfDanfe: string | null;
}

export interface SituacaoFiscalEventoPublicDto {
  eventoId: string;
  totalDocumentosEmitidos: number;
  totalDocumentosAutorizados: number;
  totalPendenciasFiscais: number;
  aptoParaFechamento: boolean;
  motivoInaptidao?: string;
}

const decimalToCents = (v: { toNumber(): number } | number | bigint | null | undefined): number => {
  if (v == null) return 0;
  if (typeof v === 'bigint') return Number(v);
  return Math.round((typeof v === 'number' ? v : v.toNumber()) * 100);
};

@Injectable()
export class FiscalPublicService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fiscalService: FiscalService,
  ) {}

  /**
   * Consulta documentos fiscais associados a uma origem de negócio (pedido, serviço, fechamento).
   */
  async consultarDocumentoPorOrigem(
    tenantId: string,
    origemTipo: string,
    origemReferenciaId: string,
  ): Promise<DocumentoFiscalPublicDto | null> {
    const doc = await this.prisma.documentoFiscal.findFirst({
      where: {
        tenantId,
        origemTipo,
        origemReferenciaId,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!doc) return null;

    return {
      id: doc.id,
      chaveFiscal: doc.chaveFiscal,
      tipo: doc.tipo,
      numero: doc.numero,
      serie: doc.serie,
      status: doc.status,
      competencia: doc.competencia,
      valorTotalCentavos: Number(doc.valorTotalCentavos),
      baseCalculoCentavos: Number(doc.baseCalculoCentavos),
      valorTributosCentavos: Number(doc.valorTributosCentavos),
      autorizadoEm: doc.dataAutorizacao,
      canceladoEm: null,
      urlPdfDanfe: null,
    };
  }

  /**
   * Verifica a conformidade fiscal de um evento para o Gate Fiscal do Event Closing (11.24).
   */
  async verificarSituacaoFiscalEvento(
    tenantId: string,
    eventoId: string,
  ): Promise<SituacaoFiscalEventoPublicDto> {
    const docs = await this.prisma.documentoFiscal.findMany({
      where: { tenantId, eventoId },
      select: { id: true, status: true },
    });

    const docIds = docs.map((d) => d.id);

    const pendencias =
      docIds.length > 0
        ? await this.prisma.pendenciaFiscal.count({
            where: {
              tenantId,
              documentoFiscalId: { in: docIds },
              status: { in: ['PENDENTE', 'EM_ANALISE'] },
            },
          })
        : 0;

    const totalDocs = docs.length;
    const autorizados = docs.filter((d) => d.status === 'AUTORIZADO').length;
    const rejeitadosOuPendentes = docs.filter(
      (d) => d.status === 'PENDENTE' || d.status === 'REJEITADO' || d.status === 'EM_PROCESSAMENTO',
    ).length;

    let aptoParaFechamento = true;
    let motivoInaptidao: string | undefined;

    if (pendencias > 0) {
      aptoParaFechamento = false;
      motivoInaptidao = `Existem ${pendencias} pendência(s) fiscal(is) não resolvida(s) para este evento.`;
    } else if (rejeitadosOuPendentes > 0) {
      aptoParaFechamento = false;
      motivoInaptidao = `Existem ${rejeitadosOuPendentes} documento(s) fiscal(is) pendente(s) ou rejeitado(s).`;
    }

    return {
      eventoId,
      totalDocumentosEmitidos: totalDocs,
      totalDocumentosAutorizados: autorizados,
      totalPendenciasFiscais: pendencias,
      aptoParaFechamento,
      motivoInaptidao,
    };
  }

  /**
   * Simula o cálculo de tributação para precificação no Comercial ou Financeiro.
   */
  async simularTributacao(
    tenantId: string,
    input: SimularOperacaoFiscalInput,
  ): Promise<SimulacaoFiscalResultDto> {
    return this.fiscalService.simularOperacaoFiscal(tenantId, input);
  }

  /**
   * Verifica se a competência fiscal está bloqueada/fechada para novas emissões ou alterações.
   */
  async verificarPeriodoFechado(tenantId: string, competencia: string): Promise<boolean> {
    const fechamento = await this.prisma.fechamentoFiscal.findUnique({
      where: { tenantId_competencia: { tenantId, competencia } },
    });
    return fechamento?.status === 'FECHADO';
  }
}

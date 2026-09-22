import { Injectable } from '@nestjs/common';
import { MarketingService } from './marketing.service';
import { PrismaService } from '../../shared/prisma.module';

export interface CupomValidadoPublicDto {
  valido: boolean;
  motivo?: string;
  cupomId?: string;
  codigo?: string;
  tipoDesconto?: string;
  descontoCents: number;
}

export interface PixelPublicDto {
  id: string;
  provedor: string;
  pixelId: string;
  status: string;
  eventoId: string | null;
  configJson: Record<string, unknown> | null;
}

export interface ResumoMarketingEventoPublicDto {
  eventoId: string;
  produtorId: string;
  campanhasAtivas: number;
  totalInvestidoCents: number;
  receitaAtribuidaCents: number;
  totalConversoes: number;
  roasMedio: number;
  linksAtivos: number;
  pixelsConfigurados: number;
}

export interface ReadinessMarketingDto {
  pronto: boolean;
  pendencias: string[];
  avisos: string[];
}

const decimalToCents = (v: { toNumber(): number } | number): number =>
  Math.round((typeof v === 'number' ? v : v.toNumber()) * 100);

@Injectable()
export class MarketingPublicService {
  constructor(
    private readonly marketingService: MarketingService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Valida e calcula desconto de cupom promocional para o Checkout / Storefront (BFF).
   * Porta de entrada pública para inventário e checkout sem vazar entidades do Prisma.
   */
  async validarCupom(
    tenantId: string,
    eventoId: string,
    codigo: string,
    subtotalCents: number,
  ): Promise<CupomValidadoPublicDto> {
    return this.marketingService.validarCupom(tenantId, eventoId, codigo, subtotalCents);
  }

  /**
   * Retorna os pixels de tracking ativos vinculados a um evento (Meta CAPI, GA4, TikTok, Google Ads, Spotify).
   * Utilizado pelo Storefront (BFF) para injeção de scripts e disparo server-side.
   */
  async obterPixelsPorEvento(
    tenantId: string,
    eventoId: string,
  ): Promise<PixelPublicDto[]> {
    const pixels = await this.prisma.pixelTracking.findMany({
      where: {
        tenantId,
        eventoId,
        status: 'ativo',
      },
    });

    return pixels.map((p) => ({
      id: p.id,
      provedor: p.provedor,
      pixelId: p.pixelExternalId,
      status: p.status,
      eventoId: p.eventoId,
      configJson: null,
    }));
  }

  /**
   * Retorna resumo executivo de marketing para composição do Cockpit do Evento.
   */
  async obterResumoMarketingEvento(
    tenantId: string,
    produtorId: string,
    eventoId: string,
  ): Promise<ResumoMarketingEventoPublicDto> {
    const [campanhas, conversoes, links, pixelsCount] = await Promise.all([
      this.prisma.campanhaMarketing.findMany({
        where: { tenantId, produtorId, eventoId },
        select: { status: true, orcamentoTotal: true, gastoAtual: true },
      }),
      this.prisma.conversaoMarketing.findMany({
        where: { tenantId, produtorId, eventoId },
        select: { receitaAtribuida: true },
      }),
      this.prisma.utmLink.count({
        where: { tenantId, produtorId, eventoId },
      }),
      this.prisma.pixelTracking.count({
        where: { tenantId, produtorId, eventoId, status: 'ativo' },
      }),
    ]);

    const campanhasAtivas = campanhas.filter((c) => c.status === 'ativa').length;
    const totalInvestidoCents = campanhas.reduce(
      (acc, c) => acc + decimalToCents(c.gastoAtual),
      0,
    );
    const receitaAtribuidaCents = conversoes.reduce(
      (acc, c) => acc + decimalToCents(c.receitaAtribuida),
      0,
    );

    const roasMedio =
      totalInvestidoCents > 0
        ? Number((receitaAtribuidaCents / totalInvestidoCents).toFixed(2))
        : 0;

    return {
      eventoId,
      produtorId,
      campanhasAtivas,
      totalInvestidoCents,
      receitaAtribuidaCents,
      totalConversoes: conversoes.length,
      roasMedio,
      linksAtivos: links,
      pixelsConfigurados: pixelsCount,
    };
  }

  /**
   * Validação de Checklist de Readiness / Go-Live para Marketing & Rastreamento do evento.
   */
  async verificarReadinessMarketing(
    tenantId: string,
    produtorId: string,
    eventoId: string,
  ): Promise<ReadinessMarketingDto> {
    const pendencias: string[] = [];
    const avisos: string[] = [];

    const [pixels, links, campanhas] = await Promise.all([
      this.prisma.pixelTracking.findMany({
        where: { tenantId, produtorId, eventoId, status: 'ativo' },
        select: { provedor: true },
      }),
      this.prisma.utmLink.count({
        where: { tenantId, produtorId, eventoId },
      }),
      this.prisma.campanhaMarketing.count({
        where: { tenantId, produtorId, eventoId, status: 'ativa' },
      }),
    ]);

    const provedores = new Set(pixels.map((p) => p.provedor));
    if (!provedores.has('META') && !provedores.has('GA4')) {
      avisos.push('Nenhum Pixel principal (Meta Pixel ou Google Analytics GA4) está ativo para este evento.');
    }

    if (links === 0) {
      avisos.push('Nenhum link UTM parametrizado foi gerado para divulgação do evento.');
    }

    if (campanhas === 0) {
      avisos.push('Nenhuma campanha de marketing está ativa para este evento.');
    }

    return {
      pronto: pendencias.length === 0,
      pendencias,
      avisos,
    };
  }
}

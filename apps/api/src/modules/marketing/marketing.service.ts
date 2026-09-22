import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { MarketingEvents } from '@ticketing/contracts';
import { PrismaService } from '../../shared/prisma.module';
import { OutboxService } from '../../shared/outbox/outbox.service';
import type {
  CriarCampanhaInput,
  AlterarStatusCampanhaInput,
  ConfigurarPixelInput,
  GerarLinkUtmInput,
  CriarCupomInput,
  CampanhaProntaTemplateDto,
  KpisMarketingDto,
} from './marketing.dto';

const SOURCE = 'marketing';

const centsToDecimal = (cents: number): number => Number((cents / 100).toFixed(2));
const decimalToCents = (v: { toNumber(): number } | number): number =>
  Math.round((typeof v === 'number' ? v : v.toNumber()) * 100);

@Injectable()
export class MarketingService {
  private readonly logger = new Logger(MarketingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
  ) {}

  listarTemplatesCampanhasProntas() {
    return [
      {
        id: 'lancamento-abertura',
        nome: 'Abertura de Vendas & Pré-Venda',
        descricao: 'Campanha de tração inicial com disparos WhatsApp, e-mail para base VIP e anúncios no Meta e Google Ads.',
        canais: ['meta', 'google', 'whatsapp', 'email'],
        sugestaoOrcamentoCents: 50000,
        objetivo: 'Gerar pico de vendas nas primeiras 48 horas de lançamento',
      },
      {
        id: 'virada-lote',
        nome: 'Virada de Lote com Contagem Regressiva',
        descricao: 'Gatilho de urgência com automação de remarketing 72h antes do aumento de preço.',
        canais: ['meta', 'tiktok', 'whatsapp', 'email'],
        sugestaoOrcamentoCents: 80000,
        objetivo: 'Esgotar o lote atual e acelerar faturamento',
      },
      {
        id: 'recuperacao-carrinho',
        nome: 'Recuperação Automática de Carrinho',
        descricao: 'Disparo transacional 15 minutos e 24h após abandono de checkout com link direto.',
        canais: ['whatsapp', 'email'],
        sugestaoOrcamentoCents: 20000,
        objetivo: 'Recuperar até 22% dos abandonos de compra',
      },
      {
        id: 'reta-final',
        nome: 'Últimos Ingressos / Semana do Evento',
        descricao: 'Intensificação de impressões locais e remarketing para público que visualizou a página.',
        canais: ['meta', 'google', 'spotify', 'tiktok'],
        sugestaoOrcamentoCents: 120000,
        objetivo: 'Sold-out nos últimos 7 dias antes do evento',
      },
    ];
  }

  // ==========================================================================
  //  CAMPANHAS (Prontas e Multicanais)
  // ==========================================================================

  /**
   * Cria uma nova campanha de marketing (pronta ou multicanal) dentro de transação e emite evento no outbox.
   */
  async criarCampanha(tenantId: string, input: CriarCampanhaInput) {
    return this.prisma.$transaction(async (tx) => {
      const campanhaId = randomUUID();
      const orcamentoDecimal = centsToDecimal(input.orcamentoCents);

      const campanha = await tx.campanhaMarketing.create({
        data: {
          id: campanhaId,
          tenantId,
          produtorId: input.produtorId,
          eventoId: input.eventoId,
          nome: input.nome,
          objetivo: input.objetivo,
          status: 'rascunho',
          orcamentoTotal: orcamentoDecimal,
          gastoAtual: 0,
          canais: input.canais,
          iniciaEm: input.iniciaEm ? new Date(input.iniciaEm) : null,
          terminaEm: input.terminaEm ? new Date(input.terminaEm) : null,
        },
      });

      await this.outbox.emit(tx, {
        eventName: MarketingEvents.CampanhaCriada.name,
        source: SOURCE,
        tenantId,
        payload: {
          campanhaId,
          produtorId: input.produtorId,
          eventoId: input.eventoId,
          nome: input.nome,
          objetivo: input.objetivo,
          canais: input.canais,
          orcamentoCents: input.orcamentoCents,
          criadoEm: campanha.createdAt.toISOString(),
        },
      });

      this.logger.log(`Campanha criada: ${campanha.nome} (${campanha.id}) para evento ${input.eventoId}`);
      return campanha;
    });
  }

  /**
   * Altera status da campanha e emite CampanhaStatusAlterado no Outbox.
   */
  async alterarStatusCampanha(
    tenantId: string,
    campanhaId: string,
    input: AlterarStatusCampanhaInput,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const campanha = await tx.campanhaMarketing.findUnique({
        where: { id: campanhaId },
      });

      if (!campanha || campanha.tenantId !== tenantId) {
        throw new NotFoundException(`Campanha ${campanhaId} não encontrada.`);
      }

      const statusAnterior = campanha.status;
      const campanhaAtualizada = await tx.campanhaMarketing.update({
        where: { id: campanhaId },
        data: { status: input.statusNovo },
      });

      await this.outbox.emit(tx, {
        eventName: MarketingEvents.CampanhaStatusAlterado.name,
        source: SOURCE,
        tenantId,
        payload: {
          campanhaId,
          produtorId: campanha.produtorId,
          eventoId: campanha.eventoId,
          statusAnterior: statusAnterior as any,
          statusNovo: input.statusNovo,
          motivo: input.motivo ?? null,
          alteradoEm: campanhaAtualizada.updatedAt.toISOString(),
        },
      });

      return campanhaAtualizada;
    });
  }

  /**
   * Lista campanhas com filtros por produtor e opcionalmente por evento.
   */
  async listarCampanhas(tenantId: string, produtorId: string, eventoId?: string) {
    const where: Prisma.CampanhaMarketingWhereInput = { tenantId, produtorId };
    if (eventoId) {
      where.eventoId = eventoId;
    }

    return this.prisma.campanhaMarketing.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            utms: true,
            cupons: true,
            conversoes: true,
            alertas: true,
          },
        },
      },
    });
  }

  /**
   * Retorna biblioteca de modelos de campanhas prontas (4 a 8 opções).
   */
  obterModelosCampanhasProntas(): CampanhaProntaTemplateDto[] {
    return [
      {
        id: 'tpl-lancamento-oficial',
        nome: 'Lançamento Oficial do Evento',
        objetivo: 'lancamento',
        descricao: 'Campanha de tração inicial com anúncio de atrações e início de vendas.',
        canaisSugeridos: ['meta', 'tiktok', 'email', 'whatsapp'],
        estrategia: 'Topo de funil com criativos de alto impacto e lista de espera VIP.',
      },
      {
        id: 'tpl-virada-lote',
        nome: 'Virada de Lote Programada',
        objetivo: 'virada_lote',
        descricao: 'Gatilho de urgência 48h antes da alteração de preços.',
        canaisSugeridos: ['whatsapp', 'email', 'meta'],
        estrategia: 'Disparo segmentado para base engajada com contagem regressiva.',
      },
      {
        id: 'tpl-ultimos-ingressos',
        nome: 'Últimos Ingressos / Sold Out',
        objetivo: 'contagem_regressiva',
        descricao: 'Foco nos últimos 10% da capacidade total do evento.',
        canaisSugeridos: ['meta', 'tiktok', 'spotify', 'whatsapp'],
        estrategia: 'Gatilho de escassez máxima para esgotar o setor/sessão.',
      },
      {
        id: 'tpl-promocional-parceiros',
        nome: 'Campanha de Parceiros e Afiliados',
        objetivo: 'promocional',
        descricao: 'Distribuição de links UTM com QR code exclusivo e cupons dedicados.',
        canaisSugeridos: ['afiliado', 'link_direto'],
        estrategia: 'Rastreabilidade de comissionamento e atribuição por parceiro.',
      },
      {
        id: 'tpl-reengajamento-compradores',
        nome: 'Reengajamento de Compradores Anteriores',
        objetivo: 'reengajamento',
        descricao: 'Comunicação direta com quem participou de edições anteriores do produtor.',
        canaisSugeridos: ['email', 'whatsapp'],
        estrategia: 'Oferta exclusiva de pré-venda com cupom nominal.',
      },
      {
        id: 'tpl-spotify-music-drop',
        nome: 'Campanha de Mídia Spotify Ads',
        objetivo: 'lancamento',
        descricao: 'Segmentação de fãs dos artistas que tocarão no evento na plataforma Spotify.',
        canaisSugeridos: ['spotify', 'meta'],
        estrategia: 'Áudio ads + display com CTA para compra de ingresso no Storefront.',
      },
    ];
  }

  // ==========================================================================
  //  PIXELS E TRACKING (Multi-Pixel por Evento)
  // ==========================================================================

  /**
   * Configura ou atualiza pixel de tracking vinculado ao evento (Meta, Google, TikTok, Spotify).
   */
  async configurarPixel(tenantId: string, input: ConfigurarPixelInput) {
    return this.prisma.$transaction(async (tx) => {
      const pixelId = randomUUID();

      const pixel = await tx.pixelTracking.create({
        data: {
          id: pixelId,
          tenantId,
          produtorId: input.produtorId,
          eventoId: input.eventoId,
          provedor: input.provedor,
          pixelExternalId: input.pixelExternalId,
          nome: input.nome ?? `${input.provedor.toUpperCase()} Pixel`,
          status: 'ativo',
          ultimaAtividadeEm: new Date(),
        },
      });

      await this.outbox.emit(tx, {
        eventName: MarketingEvents.PixelConfigurado.name,
        source: SOURCE,
        tenantId,
        payload: {
          pixelId,
          produtorId: input.produtorId,
          eventoId: input.eventoId,
          provedor: input.provedor,
          pixelExternalId: input.pixelExternalId,
          configuradoEm: pixel.createdAt.toISOString(),
        },
      });

      return pixel;
    });
  }

  /**
   * Lista todos os pixels configurados para um evento específico (visão multi-pixel).
   */
  async listarPixelsPorEvento(tenantId: string, eventoId: string) {
    return this.prisma.pixelTracking.findMany({
      where: { tenantId, eventoId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ==========================================================================
  //  LINKS, UTMS E QR CODES
  // ==========================================================================

  /**
   * Constrói link rastreado com parâmetros UTM e placeholder QR Code.
   */
  async gerarLinkUtm(tenantId: string, input: GerarLinkUtmInput) {
    const url = new URL(input.urlDestino);
    url.searchParams.set('utm_source', input.utmSource);
    url.searchParams.set('utm_medium', input.utmMedium);
    url.searchParams.set('utm_campaign', input.utmCampaign);
    if (input.utmContent) url.searchParams.set('utm_content', input.utmContent);
    if (input.utmTerm) url.searchParams.set('utm_term', input.utmTerm);

    const fullUrl = url.toString();
    const qrCodeDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(fullUrl)}`;

    return this.prisma.utmLink.create({
      data: {
        id: randomUUID(),
        tenantId,
        produtorId: input.produtorId,
        eventoId: input.eventoId,
        campanhaId: input.campanhaId ?? null,
        canal: input.canal,
        urlDestino: fullUrl,
        utmSource: input.utmSource,
        utmMedium: input.utmMedium,
        utmCampaign: input.utmCampaign,
        utmContent: input.utmContent ?? null,
        utmTerm: input.utmTerm ?? null,
        qrCodeDataUrl,
        cliques: 0,
      },
    });
  }

  async listarLinksUtm(tenantId: string, eventoId: string, campanhaId?: string) {
    const where: Prisma.UtmLinkWhereInput = { tenantId, eventoId };
    if (campanhaId) where.campanhaId = campanhaId;

    return this.prisma.utmLink.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async registrarCliqueUtm(linkId: string) {
    return this.prisma.utmLink.update({
      where: { id: linkId },
      data: { cliques: { increment: 1 } },
    });
  }

  // ==========================================================================
  //  CUPONS E PROMOÇÕES
  // ==========================================================================

  /**
   * Cria cupom promocional/desconto vinculado ao evento.
   */
  async criarCupom(tenantId: string, input: CriarCupomInput) {
    return this.prisma.$transaction(async (tx) => {
      const cupomExistente = await tx.cupomMarketing.findUnique({
        where: {
          tenantId_eventoId_codigo: {
            tenantId,
            eventoId: input.eventoId,
            codigo: input.codigo,
          },
        },
      });

      if (cupomExistente) {
        throw new BadRequestException(`Cupom com código ${input.codigo} já existe para este evento.`);
      }

      const cupomId = randomUUID();
      const descontoDecimal = centsToDecimal(input.descontoValor);

      const cupom = await tx.cupomMarketing.create({
        data: {
          id: cupomId,
          tenantId,
          produtorId: input.produtorId,
          eventoId: input.eventoId,
          campanhaId: input.campanhaId ?? null,
          codigo: input.codigo,
          tipoDesconto: input.tipoDesconto,
          descontoValor: descontoDecimal,
          limiteUso: input.limiteUso ?? null,
          usosAtuais: 0,
          validoAte: input.validoAte ? new Date(input.validoAte) : null,
          ativo: true,
        },
      });

      await this.outbox.emit(tx, {
        eventName: MarketingEvents.CupomCriado.name,
        source: SOURCE,
        tenantId,
        payload: {
          cupomId,
          produtorId: input.produtorId,
          eventoId: input.eventoId,
          campanhaId: input.campanhaId ?? null,
          codigo: input.codigo,
          tipoDesconto: input.tipoDesconto,
          descontoValor: input.descontoValor,
          limiteUso: input.limiteUso ?? null,
          validoAte: input.validoAte ?? null,
          criadoEm: cupom.createdAt.toISOString(),
        },
      });

      return cupom;
    });
  }

  /**
   * Valida cupom no checkout/carrinho e calcula o desconto exato em centavos.
   */
  async validarCupom(
    tenantId: string,
    eventoId: string,
    codigo: string,
    subtotalCents: number,
  ) {
    const cupom = await this.prisma.cupomMarketing.findUnique({
      where: {
        tenantId_eventoId_codigo: {
          tenantId,
          eventoId,
          codigo: codigo.toUpperCase().trim(),
        },
      },
    });

    if (!cupom || !cupom.ativo) {
      return { valido: false, motivo: 'Cupom inválido ou inativo', descontoCents: 0 };
    }

    const agora = new Date();
    if (cupom.validoAte && agora > cupom.validoAte) {
      return { valido: false, motivo: 'Cupom expirado', descontoCents: 0 };
    }

    if (cupom.limiteUso && cupom.usosAtuais >= cupom.limiteUso) {
      return { valido: false, motivo: 'Limite de utilização do cupom esgotado', descontoCents: 0 };
    }

    let descontoCents = 0;
    if (cupom.tipoDesconto === 'valor_fixo') {
      descontoCents = Math.min(subtotalCents, decimalToCents(cupom.descontoValor));
    } else {
      // percentual em base 100 (ex: 1000 = 10%)
      const percentual = cupom.descontoValor.toNumber();
      descontoCents = Math.round((subtotalCents * percentual) / 100);
    }

    return {
      valido: true,
      cupomId: cupom.id,
      codigo: cupom.codigo,
      tipoDesconto: cupom.tipoDesconto,
      descontoCents,
    };
  }

  async listarCupons(tenantId: string, eventoId: string) {
    return this.prisma.cupomMarketing.findMany({
      where: { tenantId, eventoId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ==========================================================================
  //  MOTOR DE ATRIBUIÇÃO & CONVERSÃO
  // ==========================================================================

  /**
   * Atribui uma conversão de pedido pago a uma campanha, UTM e/ou cupom.
   */
  async atribuirConversao(
    tenantId: string,
    dados: {
      produtorId: string;
      eventoId: string;
      pedidoId: string;
      valorTotalCents: number;
      utmSource?: string | null;
      utmMedium?: string | null;
      utmCampaign?: string | null;
      cupomCodigo?: string | null;
      campanhaId?: string | null;
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      // Busca UTM correspondente se houver
      let utmLinkId: string | null = null;
      let canal: string | null = null;
      let campanhaId = dados.campanhaId ?? null;

      if (dados.utmSource && dados.utmCampaign) {
        const utm = await tx.utmLink.findFirst({
          where: {
            tenantId,
            eventoId: dados.eventoId,
            utmSource: dados.utmSource,
            utmCampaign: dados.utmCampaign,
          },
        });
        if (utm) {
          utmLinkId = utm.id;
          canal = utm.canal;
          if (!campanhaId && utm.campanhaId) {
            campanhaId = utm.campanhaId;
          }
        }
      }

      // Busca cupom se houver
      let cupomId: string | null = null;
      if (dados.cupomCodigo) {
        const cupom = await tx.cupomMarketing.findUnique({
          where: {
            tenantId_eventoId_codigo: {
              tenantId,
              eventoId: dados.eventoId,
              codigo: dados.cupomCodigo.toUpperCase().trim(),
            },
          },
        });
        if (cupom) {
          cupomId = cupom.id;
          if (!campanhaId && cupom.campanhaId) {
            campanhaId = cupom.campanhaId;
          }
          // Incrementa uso do cupom
          await tx.cupomMarketing.update({
            where: { id: cupom.id },
            data: { usosAtuais: { increment: 1 } },
          });
        }
      }

      const conversaoId = randomUUID();
      const valorTotalDecimal = centsToDecimal(dados.valorTotalCents);
      const modeloAtribuicao = cupomId ? 'cupom_direto' : 'last_click';

      const conversao = await tx.conversaoMarketing.create({
        data: {
          id: conversaoId,
          tenantId,
          produtorId: dados.produtorId,
          eventoId: dados.eventoId,
          pedidoId: dados.pedidoId,
          campanhaId,
          utmLinkId,
          cupomId,
          canal,
          modeloAtribuicao,
          valorTotal: valorTotalDecimal,
          receitaAtribuida: valorTotalDecimal,
        },
      });

      await this.outbox.emit(tx, {
        eventName: MarketingEvents.ConversaoAtribuida.name,
        source: SOURCE,
        tenantId,
        payload: {
          conversaoId,
          produtorId: dados.produtorId,
          eventoId: dados.eventoId,
          pedidoId: dados.pedidoId,
          campanhaId,
          canal: (canal as any) ?? null,
          utmSource: dados.utmSource ?? null,
          utmMedium: dados.utmMedium ?? null,
          utmCampaign: dados.utmCampaign ?? null,
          cupomCodigo: dados.cupomCodigo ?? null,
          modeloAtribuicao: modeloAtribuicao as any,
          valorTotalCents: dados.valorTotalCents,
          receitaAtribuidaCents: dados.valorTotalCents,
          atribuidaEm: conversao.atribuidaEm.toISOString(),
        },
      });

      this.logger.log(`Conversão atribuída para pedido ${dados.pedidoId} (Valor: R$ ${valorTotalDecimal})`);
      return conversao;
    });
  }

  // ==========================================================================
  //  DASHBOARD & KPIS
  // ==========================================================================

  /**
   * Consolida métricas executivas para o Hub de Marketing.
   */
  async obterKpisMarketing(
    tenantId: string,
    produtorId: string,
    eventoId?: string,
  ): Promise<KpisMarketingDto> {
    const whereClause: { tenantId: string; produtorId: string; eventoId?: string } = {
      tenantId,
      produtorId,
    };
    if (eventoId) whereClause.eventoId = eventoId;

    const [
      totalCampanhasAtivas,
      conversoes,
      links,
      pixelsAtivosCount,
      alertasPendentesCount,
    ] = await Promise.all([
      this.prisma.campanhaMarketing.count({
        where: { ...whereClause, status: 'ativa' },
      }),
      this.prisma.conversaoMarketing.findMany({
        where: whereClause,
        select: { receitaAtribuida: true },
      }),
      this.prisma.utmLink.findMany({
        where: whereClause,
        select: { cliques: true },
      }),
      this.prisma.pixelTracking.count({
        where: {
          tenantId,
          produtorId,
          ...(eventoId ? { eventoId } : {}),
          status: 'ativo',
        },
      }),
      this.prisma.alertaMarketing.count({
        where: {
          tenantId,
          produtorId,
          resolvido: false,
          ...(eventoId ? { eventoId } : {}),
        },
      }),
    ]);

    const totalCliquesLinks = links.reduce((acc, l) => acc + l.cliques, 0);
    const receitaTotalAtribuidaCents = conversoes.reduce(
      (acc, c) => acc + decimalToCents(c.receitaAtribuida),
      0,
    );

    return {
      produtorId,
      eventoId: eventoId ?? null,
      totalCampanhasAtivas,
      totalCliquesLinks,
      totalConversoes: conversoes.length,
      receitaTotalAtribuidaCents,
      pixelsAtivosCount,
      alertasPendentesCount,
    };
  }
}

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  PipeTransform,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { MarketingService } from './marketing.service';
import { MarketingPublicService } from './marketing.public-service';
import { MarketingVideoService } from './marketing-video.service';
import {
  CriarCampanhaSchema,
  AlterarStatusCampanhaSchema,
  ConfigurarPixelSchema,
  GerarLinkUtmSchema,
  CriarCupomSchema,
  ValidarCupomQuerySchema,
  type CriarCampanhaInput,
  type AlterarStatusCampanhaInput,
  type ConfigurarPixelInput,
  type GerarLinkUtmInput,
  type CriarCupomInput,
  type ValidarCupomQueryInput,
} from './marketing.dto';

class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: z.ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        message: 'Falha na validação dos dados de entrada do módulo Marketing',
        errors: result.error.errors,
      });
    }
    return result.data;
  }
}

const resolveTenant = (headerTenant?: string): string =>
  headerTenant || '00000000-0000-0000-0000-000000000001';

@ApiTags('marketing')
@Controller('marketing')
export class MarketingController {
  constructor(
    private readonly marketingService: MarketingService,
    private readonly marketingPublicService: MarketingPublicService,
    private readonly marketingVideoService: MarketingVideoService,
  ) {}


  @Get('video/:grupo/:screen')
  @ApiOperation({ summary: 'Dados reais para as telas Marketing e Remarketing recuperadas do vídeo operacional' })
  async obterTelaVideo(
    @Param('grupo') grupo: string,
    @Param('screen') screen: string,
    @Query('produtorId') produtorId: string,
    @Query('eventoId') eventoId?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    if (!produtorId) throw new BadRequestException('produtorId é obrigatório');
    if (!['marketing', 'remarketing'].includes(grupo)) throw new BadRequestException('grupo inválido');
    return this.marketingVideoService.screen(resolveTenant(tenantIdHeader), grupo, screen, produtorId, eventoId);
  }

  // ==========================================================================
  //  CAMPANHAS PRONTAS & MULTICANAIS
  // ==========================================================================

  @Get('campanhas/templates')
  @ApiOperation({
    summary: 'Lista modelos prontos de campanhas sugeridas (Lançamento, Virada de Lote, etc.)',
  })
  obterTemplatesCampanhasProntas() {
    return this.marketingService.listarTemplatesCampanhasProntas();
  }

  @Post('campanhas')
  @ApiOperation({ summary: 'Cria uma nova campanha de marketing (pronta ou personalizada)' })
  @UsePipes(new ZodValidationPipe(CriarCampanhaSchema))
  async criarCampanha(
    @Body() input: CriarCampanhaInput,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.marketingService.criarCampanha(tenantId, input);
  }

  @Patch('campanhas/:id/status')
  @ApiOperation({ summary: 'Altera o status de uma campanha (ativa, pausada, finalizada, cancelada)' })
  @UsePipes(new ZodValidationPipe(AlterarStatusCampanhaSchema))
  async alterarStatusCampanha(
    @Param('id') campanhaId: string,
    @Body() input: AlterarStatusCampanhaInput,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.marketingService.alterarStatusCampanha(tenantId, campanhaId, input);
  }

  @Get('campanhas')
  @ApiOperation({ summary: 'Lista campanhas de marketing do produtor ou de um evento' })
  async listarCampanhas(
    @Query('produtorId') produtorId: string,
    @Query('eventoId') eventoId?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.marketingService.listarCampanhas(tenantId, produtorId, eventoId);
  }

  // ==========================================================================
  //  PIXELS MULTICANAL (Meta CAPI, GA4, Google Ads, TikTok, Spotify)
  // ==========================================================================

  @Post('pixels')
  @ApiOperation({ summary: 'Configura pixel de rastreamento para o evento' })
  @UsePipes(new ZodValidationPipe(ConfigurarPixelSchema))
  async configurarPixel(
    @Body() input: ConfigurarPixelInput,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.marketingService.configurarPixel(tenantId, input);
  }

  @Get('pixels')
  @ApiOperation({ summary: 'Lista pixels configurados e ativos de um evento' })
  async listarPixels(
    @Query('eventoId') eventoId: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.marketingPublicService.obterPixelsPorEvento(tenantId, eventoId);
  }

  // ==========================================================================
  //  LINKS, UTMS & QR CODES
  // ==========================================================================

  @Post('links')
  @ApiOperation({ summary: 'Gera link UTM parametrizado com payload QR Code' })
  @UsePipes(new ZodValidationPipe(GerarLinkUtmSchema))
  async gerarLinkUtm(
    @Body() input: GerarLinkUtmInput,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.marketingService.gerarLinkUtm(tenantId, input);
  }

  @Get('links')
  @ApiOperation({ summary: 'Lista links UTMs de um evento' })
  async listarLinksUtm(
    @Query('eventoId') eventoId: string,
    @Query('campanhaId') campanhaId?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.marketingService.listarLinksUtm(tenantId, eventoId, campanhaId);
  }

  // ==========================================================================
  //  CUPONS E PROMOÇÕES
  // ==========================================================================

  @Post('cupons')
  @ApiOperation({ summary: 'Cria cupom promocional para o evento' })
  @UsePipes(new ZodValidationPipe(CriarCupomSchema))
  async criarCupom(
    @Body() input: CriarCupomInput,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.marketingService.criarCupom(tenantId, input);
  }

  @Get('cupons/validar')
  @ApiOperation({ summary: 'Valida código de cupom e calcula o desconto exato para o checkout' })
  @UsePipes(new ZodValidationPipe(ValidarCupomQuerySchema))
  async validarCupom(
    @Query() query: ValidarCupomQueryInput,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.marketingPublicService.validarCupom(
      tenantId,
      query.eventoId,
      query.codigo,
      query.subtotalCents,
    );
  }

  @Get('cupons')
  @ApiOperation({ summary: 'Lista cupons cadastrados do evento' })
  async listarCupons(
    @Query('eventoId') eventoId: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.marketingService.listarCupons(tenantId, eventoId);
  }

  // ==========================================================================
  //  KPIS & RESUMO EXECUTIVO
  // ==========================================================================

  @Get('kpis')
  @ApiOperation({ summary: 'Obtém KPIs consolidados de marketing (campanhas, cliques, conversões, ROAS)' })
  async obterKpis(
    @Query('produtorId') produtorId: string,
    @Query('eventoId') eventoId?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.marketingService.obterKpisMarketing(tenantId, produtorId, eventoId);
  }

  @Get('resumo/evento/:eventoId')
  @ApiOperation({ summary: 'Obtém resumo executivo de marketing para o Cockpit do Evento' })
  async obterResumoEvento(
    @Param('eventoId') eventoId: string,
    @Query('produtorId') produtorId: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.marketingPublicService.obterResumoMarketingEvento(
      tenantId,
      produtorId,
      eventoId,
    );
  }

  @Get('readiness/evento/:eventoId')
  @ApiOperation({ summary: 'Valida checklist de Go-Live / Readiness de marketing e tracking do evento' })
  async verificarReadiness(
    @Param('eventoId') eventoId: string,
    @Query('produtorId') produtorId: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.marketingPublicService.verificarReadinessMarketing(
      tenantId,
      produtorId,
      eventoId,
    );
  }

  // ==========================================================================
  //  PIXELS MULTICANAL & ATIVAÇÃO RÁPIDA
  // ==========================================================================

  @Get('pixels/todos')
  @ApiOperation({ summary: 'Lista todos os pixels de conversão CAPI configurados para o produtor/evento' })
  async listarTodosPixels(
    @Query('produtorId') produtorId?: string,
    @Query('eventoId') eventoId?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.marketingService.listarTodosPixels(tenantId, produtorId, eventoId);
  }

  @Post('cupons/:id/toggle')
  @ApiOperation({ summary: 'Ativa ou desativa cupom de desconto' })
  async toggleCupom(
    @Param('id') cupomId: string,
    @Body() body: { ativo: boolean },
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.marketingService.toggleCupom(tenantId, cupomId, body.ativo);
  }

  @Post('campanhas/ativar-template')
  @ApiOperation({ summary: 'Cria e ativa campanha instantânea a partir de template oficial' })
  async ativarTemplate(
    @Body() body: { produtorId: string; eventoId: string; templateId: string; orcamentoTotalCents?: number },
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.marketingService.ativarTemplateCampanha(tenantId, body);
  }
}

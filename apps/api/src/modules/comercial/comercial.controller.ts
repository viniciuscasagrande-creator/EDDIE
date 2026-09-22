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
import { ComercialService } from './comercial.service';
import { ComercialPublicService } from './comercial.public-service';
import {
  CadastrarProdutorB2BSchema,
  CriarOportunidadeSchema,
  AlterarEtapaOportunidadeSchema,
  NegociarCondicaoComercialSchema,
  AprovarCondicaoComercialSchema,
  RegistrarAtividadeComercialSchema,
  type CadastrarProdutorB2BInput,
  type CriarOportunidadeInput,
  type AlterarEtapaOportunidadeInput,
  type NegociarCondicaoComercialInput,
  type AprovarCondicaoComercialInput,
  type RegistrarAtividadeComercialInput,
} from './comercial.dto';

class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: z.ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        message: 'Falha na validação dos dados de entrada do módulo Comercial',
        errors: result.error.errors,
      });
    }
    return result.data;
  }
}

const resolveTenant = (headerTenant?: string): string =>
  headerTenant || '00000000-0000-0000-0000-000000000001';

@ApiTags('comercial')
@Controller('comercial')
export class ComercialController {
  constructor(
    private readonly comercialService: ComercialService,
    private readonly comercialPublicService: ComercialPublicService,
  ) {}

  // ==========================================================================
  //  PRODUTORES B2B
  // ==========================================================================

  @Post('produtores')
  @ApiOperation({ summary: 'Cadastra um novo produtor B2B na carteira' })
  @UsePipes(new ZodValidationPipe(CadastrarProdutorB2BSchema))
  async cadastrarProdutor(
    @Body() input: CadastrarProdutorB2BInput,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.comercialService.cadastrarProdutor(tenantId, input);
  }

  @Get('produtores')
  @ApiOperation({ summary: 'Lista produtores B2B da carteira comercial' })
  async listarProdutores(
    @Query('executivoId') executivoId?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.comercialService.listarProdutores(tenantId, executivoId);
  }

  // ==========================================================================
  //  PIPELINE DE OPORTUNIDADES
  // ==========================================================================

  @Post('oportunidades')
  @ApiOperation({ summary: 'Abre uma nova oportunidade de negócio no funil B2B' })
  @UsePipes(new ZodValidationPipe(CriarOportunidadeSchema))
  async criarOportunidade(
    @Body() input: CriarOportunidadeInput,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.comercialService.criarOportunidade(tenantId, input);
  }

  @Patch('oportunidades/:id/etapa')
  @ApiOperation({ summary: 'Avança ou altera a etapa da oportunidade no pipeline' })
  @UsePipes(new ZodValidationPipe(AlterarEtapaOportunidadeSchema))
  async alterarEtapa(
    @Param('id') oportunidadeId: string,
    @Body() input: AlterarEtapaOportunidadeInput,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.comercialService.alterarEtapaOportunidade(tenantId, oportunidadeId, input);
  }

  // ==========================================================================
  //  CONDIÇÕES COMERCIAIS
  // ==========================================================================

  @Post('condicoes')
  @ApiOperation({ summary: 'Propõe nova condição comercial (taxas, prazos, repasse)' })
  @UsePipes(new ZodValidationPipe(NegociarCondicaoComercialSchema))
  async proporCondicao(
    @Body() input: NegociarCondicaoComercialInput,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.comercialService.proporCondicao(tenantId, input);
  }

  @Patch('condicoes/:id/aprovar')
  @ApiOperation({ summary: 'Aprova formalmente uma condição comercial negociada' })
  @UsePipes(new ZodValidationPipe(AprovarCondicaoComercialSchema))
  async aprovarCondicao(
    @Param('id') condicaoId: string,
    @Body() input: AprovarCondicaoComercialInput,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.comercialService.aprovarCondicao(tenantId, condicaoId, input);
  }

  @Get('condicoes/vigente')
  @ApiOperation({ summary: 'Consulta condição comercial vigente para um produtor ou evento' })
  async obterCondicaoVigente(
    @Query('produtorId') produtorId: string,
    @Query('eventoId') eventoId?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.comercialPublicService.obterCondicaoComercialVigente(
      tenantId,
      produtorId,
      eventoId,
    );
  }

  // ==========================================================================
  //  ATIVIDADES & RESUMO
  // ==========================================================================

  @Post('atividades')
  @ApiOperation({ summary: 'Registra atividade ou follow-up com o produtor' })
  @UsePipes(new ZodValidationPipe(RegistrarAtividadeComercialSchema))
  async registrarAtividade(
    @Body() input: RegistrarAtividadeComercialInput,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.comercialService.registrarAtividade(tenantId, input);
  }

  @Get('pipeline/resumo')
  @ApiOperation({ summary: 'Obtém resumo executivo do funil de vendas (pipeline)' })
  async obterResumoPipeline(
    @Query('executivoId') executivoId?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.comercialService.obterResumoPipeline(tenantId, executivoId);
  }

  // ==========================================================================
  //  OPORTUNIDADES & ATIVIDADES LISTAGENS OPERACIONAIS
  // ==========================================================================

  @Get('oportunidades')
  @ApiOperation({ summary: 'Lista oportunidades do funil comercial com filtros' })
  async listarOportunidades(
    @Query('etapa') etapa?: string,
    @Query('produtorId') produtorId?: string,
    @Query('executivoId') executivoId?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.comercialService.listarOportunidades(tenantId, { etapa, produtorId, executivoId });
  }

  @Get('atividades')
  @ApiOperation({ summary: 'Lista atividades comerciais (reuniões, follow-ups)' })
  async listarAtividades(
    @Query('produtorId') produtorId?: string,
    @Query('executivoId') executivoId?: string,
    @Query('realizada') realizada?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.comercialService.listarAtividades(tenantId, {
      produtorId,
      executivoId,
      realizada: realizada !== undefined ? realizada === 'true' : undefined,
    });
  }

  @Patch('atividades/:id/concluir')
  @ApiOperation({ summary: 'Marca atividade comercial como realizada' })
  async concluirAtividade(
    @Param('id') atividadeId: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.comercialService.concluirAtividade(tenantId, atividadeId);
  }

  @Get('condicoes')
  @ApiOperation({ summary: 'Lista condições comerciais cadastradas ou em aprovação' })
  async listarCondicoes(
    @Query('produtorId') produtorId?: string,
    @Query('status') status?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.comercialService.listarCondicoes(tenantId, { produtorId, status });
  }
}

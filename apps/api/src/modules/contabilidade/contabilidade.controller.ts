import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  PipeTransform,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { ContabilidadeService } from './contabilidade.service';
import { ContabilidadePublicService } from './contabilidade.public-service';
import {
  CriarContaContabilSchema,
  CriarLancamentoContabilSchema,
  FecharPeriodoSchema,
  ReabrirPeriodoSchema,
  RealizarConciliacaoSchema,
  type CriarContaContabilInput,
  type CriarLancamentoContabilInput,
  type FecharPeriodoInput,
  type ReabrirPeriodoInput,
  type RealizarConciliacaoInput,
} from './contabilidade.dto';

class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: z.ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        message: 'Falha na validação dos dados contábeis',
        errors: result.error.errors,
      });
    }
    return result.data;
  }
}

const resolveTenant = (headerTenant?: string): string =>
  headerTenant || '00000000-0000-0000-0000-000000000001';

@ApiTags('contabilidade')
@Controller('contabilidade')
export class ContabilidadeController {
  constructor(
    private readonly contabilidadeService: ContabilidadeService,
    private readonly contabilidadePublicService: ContabilidadePublicService,
  ) {}

  // ==========================================================================
  //  PLANO DE CONTAS
  // ==========================================================================

  @Post('contas')
  @ApiOperation({ summary: 'Cadastra nova conta no plano de contas' })
  @UsePipes(new ZodValidationPipe(CriarContaContabilSchema))
  async criarConta(
    @Body() input: CriarContaContabilInput,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.contabilidadeService.criarConta(tenantId, input);
  }

  @Get('contas')
  @ApiOperation({ summary: 'Lista o plano de contas da empresa' })
  async listarContas(@Headers('x-tenant-id') tenantIdHeader?: string) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.contabilidadeService.listarPlanoDeContas(tenantId);
  }

  // ==========================================================================
  //  LANÇAMENTOS CONTÁBEIS (Partidas Dobradas)
  // ==========================================================================

  @Post('lancamentos')
  @ApiOperation({ summary: 'Registra lançamento contábil manual ou de ajuste em partidas dobradas' })
  @UsePipes(new ZodValidationPipe(CriarLancamentoContabilSchema))
  async criarLancamento(
    @Body() input: CriarLancamentoContabilInput,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.contabilidadeService.criarLancamento(tenantId, input);
  }

  // ==========================================================================
  //  FECHAMENTO & REABERTURA DE COMPETÊNCIA
  // ==========================================================================

  @Post('fechamento')
  @ApiOperation({ summary: 'Encerra formalmente o período contábil da competência' })
  @UsePipes(new ZodValidationPipe(FecharPeriodoSchema))
  async fecharPeriodo(
    @Body() input: FecharPeriodoInput,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.contabilidadeService.fecharPeriodo(tenantId, input);
  }

  @Post('reabertura')
  @ApiOperation({ summary: 'Reabre competência contábil com justificativa e trilha de auditoria' })
  @UsePipes(new ZodValidationPipe(ReabrirPeriodoSchema))
  async reabrirPeriodo(
    @Body() input: ReabrirPeriodoInput,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.contabilidadeService.reabrirPeriodo(tenantId, input);
  }

  // ==========================================================================
  //  CONCILIAÇÃO CONTÁBIL
  // ==========================================================================

  @Post('conciliacao')
  @ApiOperation({ summary: 'Realiza conciliação entre o saldo contábil e o saldo do extrato bancário' })
  @UsePipes(new ZodValidationPipe(RealizarConciliacaoSchema))
  async conciliarConta(
    @Body() input: RealizarConciliacaoInput,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.contabilidadeService.conciliarConta(tenantId, input);
  }

  // ==========================================================================
  //  DEMONSTRAÇÕES & RELATÓRIOS (Balancete, DRE, Dashboard)
  // ==========================================================================

  @Get('balancete')
  @ApiOperation({ summary: 'Gera Balancete de Verificação analítico/sintético da competência' })
  async obterBalancete(
    @Query('competencia') competencia: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.contabilidadeService.obterBalancete(tenantId, competencia);
  }

  @Get('dre')
  @ApiOperation({ summary: 'Gera a DRE Gerencial segregando receitas próprias de recursos de terceiros' })
  async obterDre(
    @Query('competencia') competencia: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.contabilidadeService.obterDre(tenantId, competencia);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Retorna visão executiva do fechamento e alertas contábeis' })
  async obterDashboard(
    @Query('competencia') competencia: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.contabilidadeService.obterDashboard(tenantId, competencia);
  }

  // ==========================================================================
  //  CENTRO DE CONTROLE DE EVENTOS & LANÇAMENTOS
  // ==========================================================================

  @Get('centro-controle-eventos')
  @ApiOperation({ summary: 'Painel matricial relacionando cada evento à competência, conciliação e fechamento' })
  async obterCentroControleEventos(
    @Query('competencia') competencia: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.contabilidadeService.obterCentroControleEventos(tenantId, competencia || '2026-09');
  }

  @Get('lancamentos')
  @ApiOperation({ summary: 'Lista os lançamentos contábeis em partidas dobradas (Livro Diário / Razão)' })
  async listarLancamentos(
    @Query('competencia') competencia?: string,
    @Query('eventoId') eventoId?: string,
    @Query('origemTipo') origemTipo?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.contabilidadeService.listarLancamentos(tenantId, {
      competencia,
      eventoId,
      origemTipo,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  @Get('conciliacoes')
  @ApiOperation({ summary: 'Lista conciliações contábeis realizadas na competência' })
  async listarConciliacoes(
    @Query('competencia') competencia: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.contabilidadeService.listarConciliacoes(tenantId, competencia || '2026-09');
  }
}

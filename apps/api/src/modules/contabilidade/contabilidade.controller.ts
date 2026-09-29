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
  CriarRegraContabilSchema,
  SimularRegraContabilSchema,
  CriarAjusteContabilSchema,
  FecharEventoContabilSchema,
  ReabrirEventoContabilSchema,
  CriarCentroResultadoSchema,
  type CriarContaContabilInput,
  type CriarLancamentoContabilInput,
  type FecharPeriodoInput,
  type ReabrirPeriodoInput,
  type RealizarConciliacaoInput,
  type CriarRegraContabilInput,
  type SimularRegraContabilInput,
  type CriarAjusteContabilInput,
  type FecharEventoContabilInput,
  type ReabrirEventoContabilInput,
  type CriarCentroResultadoInput,
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

  @Get('painel-enterprise')
  @ApiOperation({ summary: 'Painel de controle contábil enterprise' })
  async painelEnterprise(@Query('competencia') competencia = '2026-09', @Headers('x-tenant-id') h?: string) {
    return this.contabilidadeService.obterPainelEnterprise(resolveTenant(h), competencia);
  }

  @Get('fechamento-mensal')
  @ApiOperation({ summary: 'Processo e pendências do fechamento contábil mensal' })
  async fechamentoMensal(@Query('competencia') competencia = '2026-09', @Headers('x-tenant-id') h?: string) {
    return this.contabilidadeService.obterFechamentoMensal(resolveTenant(h), competencia);
  }

  @Get('posicao-patrimonial')
  @ApiOperation({ summary: 'Balanço patrimonial e posição financeira' })
  async posicaoPatrimonial(@Query('competencia') competencia = '2026-09', @Headers('x-tenant-id') h?: string) {
    return this.contabilidadeService.obterPosicaoPatrimonial(resolveTenant(h), competencia);
  }

  @Get('centro-conciliacao')
  @ApiOperation({ summary: 'Centro operacional de conciliação contábil' })
  async centroConciliacao(@Query('competencia') competencia = '2026-09', @Headers('x-tenant-id') h?: string) {
    return this.contabilidadeService.obterCentroConciliacao(resolveTenant(h), competencia);
  }

  @Get('recontabilizacao')
  @ApiOperation({ summary: 'Rastreabilidade e recontabilização financeira-contábil' })
  async recontabilizacao(@Query('competencia') competencia = '2026-09', @Query('eventoId') eventoId?: string, @Headers('x-tenant-id') h?: string) {
    return this.contabilidadeService.obterRecontabilizacao(resolveTenant(h), competencia, eventoId);
  }

  @Get('fiscal')
  @ApiOperation({ summary: 'Central fiscal e integrações NFS-e' })
  async fiscal(@Query('competencia') competencia = '2026-09', @Headers('x-tenant-id') h?: string) {
    return this.contabilidadeService.obterFiscal(resolveTenant(h), competencia);
  }

  @Get('auditoria-enterprise')
  @ApiOperation({ summary: 'Trilha contábil consolidada para auditoria' })
  async auditoriaEnterprise(@Query('competencia') competencia = '2026-09', @Headers('x-tenant-id') h?: string) {
    return this.contabilidadeService.obterAuditoriaEnterprise(resolveTenant(h), competencia);
  }

  // ==========================================================================
  //  EDDIE 11.37 — MOTOR CONTÁBIL CONFIGURÁVEL E VERSIONADO
  // ==========================================================================

  @Post('regras')
  @ApiOperation({ summary: 'Cria ou versiona uma regra determinística no motor contábil' })
  @UsePipes(new ZodValidationPipe(CriarRegraContabilSchema))
  async criarRegra(
    @Body() input: CriarRegraContabilInput,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.contabilidadeService.criarRegraContabil(tenantId, input);
  }

  @Get('regras')
  @ApiOperation({ summary: 'Lista catálogo de regras determinísticas ativas e versionadas' })
  async listarRegras(
    @Query('fatoTipo') fatoTipo?: string,
    @Query('status') status?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.contabilidadeService.listarRegrasContabeis(tenantId, { fatoTipo, status });
  }

  @Post('regras/simular')
  @ApiOperation({ summary: 'Dry-run de contabilização: simula débitos e créditos antes de gravar' })
  @UsePipes(new ZodValidationPipe(SimularRegraContabilSchema))
  async simularRegra(
    @Body() input: SimularRegraContabilInput,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.contabilidadeService.simularRegraContabil(tenantId, input);
  }

  // ==========================================================================
  //  EDDIE 11.37 — MÁQUINA DE AJUSTES E RECLASSIFICAÇÕES
  // ==========================================================================

  @Post('ajustes')
  @ApiOperation({ summary: 'Cria ajuste ou reclassificação preservando imutabilidade contábil' })
  @UsePipes(new ZodValidationPipe(CriarAjusteContabilSchema))
  async criarAjuste(
    @Body() input: CriarAjusteContabilInput,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.contabilidadeService.criarAjusteContabil(tenantId, input);
  }

  @Get('ajustes')
  @ApiOperation({ summary: 'Lista histórico imutável de ajustes e reclassificações contábeis' })
  async listarAjustes(
    @Query('tipo') tipo?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.contabilidadeService.listarAjustesContabeis(tenantId, { tipo });
  }

  // ==========================================================================
  //  EDDIE 11.37 — FECHAMENTO FINANCEIRO-CONTÁBIL DO EVENTO (12 Gates)
  // ==========================================================================

  @Post('eventos/fechamento')
  @ApiOperation({ summary: 'Encerra formalmente a contabilidade do evento com validação dos 12 gates' })
  @UsePipes(new ZodValidationPipe(FecharEventoContabilSchema))
  async fecharContabilmenteEvento(
    @Body() input: FecharEventoContabilInput,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.contabilidadeService.fecharContabilmenteEvento(tenantId, input);
  }

  @Get('eventos/:eventoId/fechamento')
  @ApiOperation({ summary: 'Consulta status de fechamento contábil e avaliação dos 12 gates do evento' })
  async obterFechamentoEvento(
    @Param('eventoId') eventoId: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.contabilidadeService.obterFechamentoEvento(tenantId, eventoId);
  }

  @Get('eventos/fechamentos')
  @ApiOperation({ summary: 'Lista eventos encerrados contabilmente por competência' })
  async listarFechamentosEventos(
    @Query('competencia') competencia?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.contabilidadeService.listarFechamentosEventos(tenantId, competencia);
  }

  @Post('eventos/reabrir')
  @ApiOperation({ summary: 'Reabre excepcionalmente fechamento contábil de evento com justificativa' })
  @UsePipes(new ZodValidationPipe(ReabrirEventoContabilSchema))
  async reabrirFechamentoEvento(
    @Body() input: ReabrirEventoContabilInput,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.contabilidadeService.reabrirFechamentoEvento(tenantId, input);
  }

  // ==========================================================================
  //  EDDIE 11.37 — CONCILIAÇÃO CRUZADA DE SUBSISTEMAS
  // ==========================================================================

  @Get('conciliacao-subsistemas')
  @ApiOperation({ summary: 'Conciliação cruzada automática dos 3 subsistemas (Bancos, Recebíveis e Ledger)' })
  async obterConciliacaoSubsistemas(
    @Query('competencia') competencia = '2026-09',
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.contabilidadeService.obterConciliacaoSubsistemas(tenantId, competencia);
  }

  // ==========================================================================
  //  EDDIE 11.37 — RASTREAMENTO 360º DE LANÇAMENTO (Audit Trail)
  // ==========================================================================

  @Get('rastrear-lancamento')
  @ApiOperation({ summary: 'Rastreamento 360º ponta a ponta: Pedido -> Pagamento -> Ledger -> Contabilidade' })
  async rastrearLancamento(
    @Query('termo') termo: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    if (!termo) {
      throw new BadRequestException('Parâmetro termo de busca é obrigatório.');
    }
    return this.contabilidadeService.rastrearLancamento(tenantId, termo);
  }

  // ==========================================================================
  //  EDDIE 11.37 — CENTROS DE RESULTADO
  // ==========================================================================

  @Post('centros-resultado')
  @ApiOperation({ summary: 'Cadastra centro de resultado / dimensão analítica' })
  @UsePipes(new ZodValidationPipe(CriarCentroResultadoSchema))
  async criarCentroResultado(
    @Body() input: CriarCentroResultadoInput,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.contabilidadeService.criarCentroResultado(tenantId, input);
  }

  @Get('centros-resultado')
  @ApiOperation({ summary: 'Lista centros de resultado e dimensões contábeis' })
  async listarCentrosResultado(@Headers('x-tenant-id') tenantIdHeader?: string) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.contabilidadeService.listarCentrosResultado(tenantId);
  }

}

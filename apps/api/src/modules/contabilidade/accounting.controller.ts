import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccountingService } from './accounting.service';
import type {
  ClassifyFactInputDto,
  FinancialFactType,
  RecognitionPolicy,
} from './accounting.types';

const resolveTenant = (headerTenant?: string): string =>
  headerTenant || '00000000-0000-0000-0000-000000000001';

@ApiTags('accounting')
@Controller('api/accounting')
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Resumo executivo contábil da competência' })
  async getSummary(
    @Query('competencia') competencia = '2026-09',
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.accountingService.obterResumoExecutivo(tenantId, competencia);
  }

  @Get('chart-of-accounts')
  @ApiOperation({ summary: 'Plano de contas hierárquico e versionado' })
  async getChartOfAccounts(@Headers('x-tenant-id') tenantIdHeader?: string) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.accountingService.listarPlanoDeContas(tenantId);
  }

  @Get('rules')
  @ApiOperation({ summary: 'Regras determinísticas de classificação contábil' })
  async getRules() {
    return this.accountingService.listarRegrasClassificacao();
  }

  @Post('rules')
  @ApiOperation({ summary: 'Cadastra ou versiona regra de classificação contábil' })
  async createRule(
    @Body()
    body: {
      fatoTipo: FinancialFactType;
      descricao: string;
      contaDebitoCodigo: string;
      contaCreditoCodigo: string;
      contaTaxaCreditoCodigo?: string;
      politicaReconhecimento?: RecognitionPolicy;
      contaReceitaDiferidaCodigo?: string;
      ativa: boolean;
      vigenciaInicio: string;
      criadoPor: string;
    },
  ) {
    return this.accountingService.criarOuAtualizarRegra({
      ...body,
      versao: 1,
      politicaReconhecimento: body.politicaReconhecimento ?? 'IMEDIATO',
    });
  }

  @Post('classify')
  @ApiOperation({ summary: 'Classifica fato financeiro e gera lançamento em partidas dobradas' })
  async classifyFact(
    @Body() body: Omit<ClassifyFactInputDto, 'tenantId'>,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.accountingService.classificarFatoFinanceiro({
      ...body,
      tenantId,
    });
  }

  @Get('journal')
  @ApiOperation({ summary: 'Livro Diário contábil da competência' })
  async getJournal(
    @Query('competencia') competencia = '2026-09',
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.accountingService.obterLivroDiario(tenantId, competencia);
  }

  @Get('ledger')
  @ApiOperation({ summary: 'Livro Razão analítico por conta contábil' })
  async getLedger(
    @Query('competencia') competencia = '2026-09',
    @Query('contaCodigo') contaCodigo?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.accountingService.obterLivroRazao(tenantId, competencia, contaCodigo);
  }

  @Get('trial-balance')
  @ApiOperation({ summary: 'Balancete de Verificação analítico e sintético' })
  async getTrialBalance(
    @Query('competencia') competencia = '2026-09',
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.accountingService.obterBalanceteVerificacao(tenantId, competencia);
  }

  @Get('income-statement')
  @ApiOperation({ summary: 'DRE Contábil (Competência) ou Gerencial (Caixa)' })
  async getIncomeStatement(
    @Query('competencia') competencia = '2026-09',
    @Query('modelo') modelo: 'CONTABIL_COMPETENCIA' | 'GERENCIAL_CAIXA' = 'CONTABIL_COMPETENCIA',
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.accountingService.obterDreContabilEGerencial(tenantId, competencia, modelo);
  }

  @Get('reconciliation')
  @ApiOperation({ summary: 'Conciliação cruzada Ledger Financeiro x Contabilidade' })
  async getReconciliation(
    @Query('competencia') competencia = '2026-09',
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.accountingService.conciliarLedgerFinanceiro(tenantId, competencia);
  }

  @Post('closings/monthly')
  @ApiOperation({ summary: 'Encerramento formal do mês contábil com emissão de assinatura digital' })
  async closeMonth(
    @Body() body: { competencia: string; actorId: string },
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.accountingService.fecharCompetenciaMensal(tenantId, body.competencia, body.actorId);
  }

  @Post('closings/monthly/reopen')
  @ApiOperation({ summary: 'Reabertura excepcional de período contábil com autorização' })
  async reopenMonth(
    @Body() body: { competencia: string; actorId: string; authorizationCode: string; motivo: string },
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.accountingService.reabrirCompetenciaMensal(
      tenantId,
      body.competencia,
      body.actorId,
      body.authorizationCode,
      body.motivo,
    );
  }

  @Post('closings/event')
  @ApiOperation({ summary: 'Encerramento contábil definitivo de evento e dossiê contábil' })
  async closeEvent(
    @Body() body: { eventoId: string; competencia: string; actorId: string },
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.accountingService.fecharContabilidadeEvento(
      tenantId,
      body.eventoId,
      body.competencia,
      body.actorId,
    );
  }

  @Post('deferred-revenue/policy')
  @ApiOperation({ summary: 'Configura política de receita diferida por evento' })
  async configureDeferredRevenuePolicy(
    @Body()
    body: {
      eventoId: string;
      ativo: boolean;
      dataRealizacaoEvento: string;
      configuradoPor: string;
    },
  ) {
    return this.accountingService.configurarReceitaDiferida(body);
  }

  @Post('deferred-revenue/recognize')
  @ApiOperation({ summary: 'Apropria receita diferida por competência na realização do evento' })
  async recognizeDeferredRevenue(
    @Body() body: { eventoId: string; competencia: string; actorId: string },
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.accountingService.apropriarReceitaDiferida(
      tenantId,
      body.eventoId,
      body.competencia,
      body.actorId,
    );
  }

  @Get('pendencies')
  @ApiOperation({ summary: 'Lista itens da Central de Pendências Contábeis' })
  async getPendencies(
    @Query('status') status?: string,
    @Query('severidade') severidade?: string,
    @Query('competencia') competencia?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.accountingService.listarPendencias(tenantId, { status, severidade, competencia });
  }

  @Post('pendencies/:id/resolve')
  @ApiOperation({ summary: 'Resolve pendência contábil com justificativa e reclassificação' })
  async resolvePendency(
    @Param('id') id: string,
    @Body() body: { actorId: string; parecer: string; lancamentoAjusteInput?: any },
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.accountingService.resolverPendencia(
      tenantId,
      id,
      body.actorId,
      body.parecer,
      body.lancamentoAjusteInput,
    );
  }

  @Post('exports')
  @ApiOperation({ summary: 'Gera pacote estruturado de demonstrativos para o contador' })
  async exportForAccountant(
    @Body() body: { competencia: string; actorId: string },
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.accountingService.gerarPacoteExportacaoContador(tenantId, body.competencia, body.actorId);
  }

  @Get('intelligence')
  @ApiOperation({ summary: 'Diagnósticos e insights contábeis baseados em evidência' })
  async getIntelligence(
    @Query('competencia') competencia = '2026-09',
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.accountingService.obterDiagnosticosInteligencia(tenantId, competencia);
  }

  @Get('audit')
  @ApiOperation({ summary: 'Trilha forense pesquisável de auditoria contábil' })
  async getAudit(
    @Query('entidade') entidade?: string,
    @Query('actorId') actorId?: string,
    @Query('limit') limit?: number,
  ) {
    return this.accountingService.consultarAuditoria({
      entidade,
      actorId,
      limit: limit ? Number(limit) : undefined,
    });
  }
}

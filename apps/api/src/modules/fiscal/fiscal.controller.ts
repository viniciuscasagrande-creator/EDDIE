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
import { FiscalService } from './fiscal.service';
import {
  CriarRegraTributariaSchema,
  SimularOperacaoFiscalSchema,
  EmitirDocumentoFiscalSchema,
  CancelarDocumentoFiscalSchema,
  RealizarApuracaoSchema,
  ValidarThreeWayMatchSchema,
  RegistrarObrigacaoSchema,
  FecharPeriodoFiscalSchema,
  ReabrirPeriodoFiscalSchema,
  type CriarRegraTributariaInput,
  type SimularOperacaoFiscalInput,
  type EmitirDocumentoFiscalInput,
  type CancelarDocumentoFiscalInput,
  type RealizarApuracaoInput,
  type ValidarThreeWayMatchInput,
  type RegistrarObrigacaoInput,
  type FecharPeriodoFiscalInput,
  type ReabrirPeriodoFiscalInput,
} from './fiscal.dto';

class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: z.ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        message: 'Falha na validação dos dados fiscais',
        errors: result.error.errors,
      });
    }
    return result.data;
  }
}

const resolveTenant = (headerTenant?: string): string =>
  headerTenant || '00000000-0000-0000-0000-000000000001';

@ApiTags('fiscal')
@Controller('fiscal')
export class FiscalController {
  constructor(private readonly fiscalService: FiscalService) {}

  // --------------------------------------------------------------------------
  // 1. REGRAS TRIBUTÁRIAS VERSIONADAS
  // --------------------------------------------------------------------------

  @Post('regras')
  @ApiOperation({ summary: 'Cria uma nova regra tributária ou uma nova versão com vigência' })
  @UsePipes(new ZodValidationPipe(CriarRegraTributariaSchema))
  async criarRegra(
    @Headers('x-tenant-id') tenantHeader: string | undefined,
    @Body() input: CriarRegraTributariaInput,
  ) {
    const tenantId = resolveTenant(tenantHeader);
    return this.fiscalService.criarRegraTributaria(tenantId, input);
  }

  @Get('regras')
  @ApiOperation({ summary: 'Lista regras tributárias cadastradas com histórico de versões' })
  async listarRegras(
    @Headers('x-tenant-id') tenantHeader: string | undefined,
    @Query('operacaoTipo') operacaoTipo?: string,
    @Query('status') status?: string,
  ) {
    const tenantId = resolveTenant(tenantHeader);
    return this.fiscalService.listarRegrasTributarias(tenantId, { operacaoTipo, status });
  }

  // --------------------------------------------------------------------------
  // 2. SIMULAÇÃO & REFORMA TRIBUTÁRIA
  // --------------------------------------------------------------------------

  @Post('simular')
  @ApiOperation({ summary: 'Executa simulação de cálculo tributário dry-run com segregação de receita' })
  @UsePipes(new ZodValidationPipe(SimularOperacaoFiscalSchema))
  async simular(
    @Headers('x-tenant-id') tenantHeader: string | undefined,
    @Body() input: SimularOperacaoFiscalInput,
  ) {
    const tenantId = resolveTenant(tenantHeader);
    return this.fiscalService.simularOperacaoFiscal(tenantId, input);
  }

  @Post('reforma-comparativo')
  @ApiOperation({ summary: 'Compara a carga fiscal atual (ISS/PIS/COFINS) vs Reforma Tributária (LC 214 IBS/CBS)' })
  @UsePipes(new ZodValidationPipe(SimularOperacaoFiscalSchema))
  async compararReforma(
    @Headers('x-tenant-id') tenantHeader: string | undefined,
    @Body() input: SimularOperacaoFiscalInput,
  ) {
    const tenantId = resolveTenant(tenantHeader);
    return this.fiscalService.compararReformaTributaria(tenantId, input);
  }

  // --------------------------------------------------------------------------
  // 3. DOCUMENTOS FISCAIS (NFS-E)
  // --------------------------------------------------------------------------

  @Post('documentos')
  @ApiOperation({ summary: 'Emite documento fiscal (NFS-e) com idempotência por chave fiscal' })
  @UsePipes(new ZodValidationPipe(EmitirDocumentoFiscalSchema))
  async emitirDocumento(
    @Headers('x-tenant-id') tenantHeader: string | undefined,
    @Body() input: EmitirDocumentoFiscalInput,
  ) {
    const tenantId = resolveTenant(tenantHeader);
    return this.fiscalService.emitirDocumentoFiscal(tenantId, input);
  }

  @Post('documentos/cancelar')
  @ApiOperation({ summary: 'Cancela documento fiscal emitido' })
  @UsePipes(new ZodValidationPipe(CancelarDocumentoFiscalSchema))
  async cancelarDocumento(
    @Headers('x-tenant-id') tenantHeader: string | undefined,
    @Body() input: CancelarDocumentoFiscalInput,
  ) {
    const tenantId = resolveTenant(tenantHeader);
    return this.fiscalService.cancelarDocumentoFiscal(tenantId, input);
  }

  @Get('documentos')
  @ApiOperation({ summary: 'Lista documentos fiscais emitidos com filtros' })
  async listarDocumentos(
    @Headers('x-tenant-id') tenantHeader: string | undefined,
    @Query('competencia') competencia?: string,
    @Query('status') status?: string,
    @Query('tipo') tipo?: string,
    @Query('origemTipo') origemTipo?: string,
    @Query('eventoId') eventoId?: string,
    @Query('produtorId') produtorId?: string,
  ) {
    const tenantId = resolveTenant(tenantHeader);
    return this.fiscalService.listarDocumentosFiscais(tenantId, {
      competencia,
      status,
      tipo,
      origemTipo,
      eventoId,
      produtorId,
    });
  }

  // --------------------------------------------------------------------------
  // 4. APURAÇÃO TRIBUTÁRIA
  // --------------------------------------------------------------------------

  @Post('apuracoes')
  @ApiOperation({ summary: 'Realiza a apuração de tributos de um período com memória de cálculo rastreável' })
  @UsePipes(new ZodValidationPipe(RealizarApuracaoSchema))
  async apurar(
    @Headers('x-tenant-id') tenantHeader: string | undefined,
    @Body() input: RealizarApuracaoInput,
  ) {
    const tenantId = resolveTenant(tenantHeader);
    return this.fiscalService.apurarTributos(tenantId, input);
  }

  @Get('apuracoes')
  @ApiOperation({ summary: 'Lista apurações fiscais de uma competência' })
  async listarApuracoes(
    @Headers('x-tenant-id') tenantHeader: string | undefined,
    @Query('competencia') competencia: string,
  ) {
    const tenantId = resolveTenant(tenantHeader);
    if (!competencia) {
      throw new BadRequestException('Parâmetro competencia é obrigatório (ex: 2026-09)');
    }
    return this.fiscalService.listarApuracoes(tenantId, competencia);
  }

  // --------------------------------------------------------------------------
  // 5. THREE-WAY MATCH & CONCILIAÇÃO EM QUATRO PONTOS
  // --------------------------------------------------------------------------

  @Post('three-way-match')
  @ApiOperation({ summary: 'Valida Three-Way Match entre Documento Fiscal, Contrato e Pagamento de Fornecedor' })
  @UsePipes(new ZodValidationPipe(ValidarThreeWayMatchSchema))
  async threeWayMatch(
    @Headers('x-tenant-id') tenantHeader: string | undefined,
    @Body() input: ValidarThreeWayMatchInput,
  ) {
    const tenantId = resolveTenant(tenantHeader);
    return this.fiscalService.validarThreeWayMatch(tenantId, input);
  }

  @Get('conciliacao-quatro-pontos')
  @ApiOperation({ summary: 'Gera relatório de conciliação fiscal em 4 pontos (Operação, Doc Fiscal, Contábil, Tesouraria)' })
  async conciliacaoQuatroPontos(
    @Headers('x-tenant-id') tenantHeader: string | undefined,
    @Query('competencia') competencia: string,
  ) {
    const tenantId = resolveTenant(tenantHeader);
    if (!competencia) {
      throw new BadRequestException('Parâmetro competencia é obrigatório');
    }
    return this.fiscalService.obterConciliacaoQuatroPontos(tenantId, competencia);
  }

  // --------------------------------------------------------------------------
  // 6. CONFORMIDADE, PENDÊNCIAS & RASTREIO 360
  // --------------------------------------------------------------------------

  @Get('conformidade')
  @ApiOperation({ summary: 'Retorna a central de conformidade tributária e pendências de validação' })
  async conformidade(
    @Headers('x-tenant-id') tenantHeader: string | undefined,
    @Query('competencia') competencia: string,
  ) {
    const tenantId = resolveTenant(tenantHeader);
    return this.fiscalService.obterConformidadeFiscal(tenantId, competencia || '2026-09');
  }

  @Get('rastrear-360')
  @ApiOperation({ summary: 'Rastreamento 360º de documento fiscal por chave, número ou referência' })
  async rastrear360(
    @Headers('x-tenant-id') tenantHeader: string | undefined,
    @Query('termo') termo: string,
  ) {
    const tenantId = resolveTenant(tenantHeader);
    if (!termo) {
      throw new BadRequestException('Parâmetro termo de busca é obrigatório');
    }
    return this.fiscalService.rastrearDocumentoFiscal360(tenantId, termo);
  }

  // --------------------------------------------------------------------------
  // 7. OBRIGAÇÕES FISCAIS & FECHAMENTO DE PERÍODO
  // --------------------------------------------------------------------------

  @Post('obrigacoes')
  @ApiOperation({ summary: 'Registra uma obrigação fiscal principal ou acessória' })
  @UsePipes(new ZodValidationPipe(RegistrarObrigacaoSchema))
  async registrarObrigacao(
    @Headers('x-tenant-id') tenantHeader: string | undefined,
    @Body() input: RegistrarObrigacaoInput,
  ) {
    const tenantId = resolveTenant(tenantHeader);
    return this.fiscalService.registrarObrigacao(tenantId, input);
  }

  @Get('obrigacoes')
  @ApiOperation({ summary: 'Lista obrigações fiscais por competência' })
  async listarObrigacoes(
    @Headers('x-tenant-id') tenantHeader: string | undefined,
    @Query('competencia') competencia?: string,
  ) {
    const tenantId = resolveTenant(tenantHeader);
    return this.fiscalService.listarObrigacoes(tenantId, competencia);
  }

  @Post('fechamento')
  @ApiOperation({ summary: 'Realiza o fechamento fiscal do período com validação de checklist' })
  @UsePipes(new ZodValidationPipe(FecharPeriodoFiscalSchema))
  async fecharPeriodo(
    @Headers('x-tenant-id') tenantHeader: string | undefined,
    @Body() input: FecharPeriodoFiscalInput,
  ) {
    const tenantId = resolveTenant(tenantHeader);
    return this.fiscalService.fecharPeriodoFiscal(tenantId, input);
  }

  @Post('reabrir')
  @ApiOperation({ summary: 'Reabre um período fiscal fechado com justificativa e registro de auditoria' })
  @UsePipes(new ZodValidationPipe(ReabrirPeriodoFiscalSchema))
  async reabrirPeriodo(
    @Headers('x-tenant-id') tenantHeader: string | undefined,
    @Body() input: ReabrirPeriodoFiscalInput,
  ) {
    const tenantId = resolveTenant(tenantHeader);
    return this.fiscalService.reabrirPeriodoFiscal(tenantId, input);
  }
}

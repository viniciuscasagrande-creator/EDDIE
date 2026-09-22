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
import { FinanceiroService } from './financeiro.service';
import { FinanceiroPublicService } from './financeiro.public-service';
import {
  SolicitarTransferenciaInterEventoSchema,
  SolicitarRepasseSchema,
  SimularAntecipacaoSchema,
  SolicitarAntecipacaoSchema,
  CriarContaPagarSchema,
  ExtratoQuerySchema,
  PagarContaSchema,
  type SolicitarTransferenciaInterEventoInput,
  type SolicitarRepasseInput,
  type SimularAntecipacaoInput,
  type SolicitarAntecipacaoInput,
  type CriarContaPagarInput,
  type ExtratoQueryInput,
  type PagarContaInput,
} from './financeiro.dto';

class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: z.ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        message: 'Falha na validação dos dados de entrada do módulo Financeiro',
        errors: result.error.errors,
      });
    }
    return result.data;
  }
}

// Em produção, substituído por decorators @CurrentTenant() e @CurrentUser() via JWT Guard
const resolveTenant = (headerTenant?: string): string =>
  headerTenant || '00000000-0000-0000-0000-000000000001';

const resolveUser = (headerUser?: string): string =>
  headerUser || '00000000-0000-0000-0000-000000000002';

@ApiTags('financeiro')
@Controller('financeiro')
export class FinanceiroController {
  constructor(
    private readonly financeiroService: FinanceiroService,
    private readonly financeiroPublicService: FinanceiroPublicService,
  ) {}

  @Get('saldos/produtor/:produtorId')
  @ApiOperation({
    summary: 'Obtém os saldos derivados da conta gráfica por bucket (disponível, bloqueado, estorno, retido)',
  })
  async obterSaldosProdutor(
    @Param('produtorId') produtorId: string,
    @Query('eventoId') eventoId?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.financeiroService.obterSaldosContaGrafica(
      tenantId,
      produtorId,
      eventoId,
    );
  }

  @Get('saldos/produtor/:produtorId/eventos')
  @ApiOperation({
    summary: 'Obtém a posição financeira consolidada e os saldos reais por evento do produtor',
  })
  async obterGestaoSaldosPorEvento(
    @Param('produtorId') produtorId: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.financeiroService.obterGestaoSaldosPorEvento(tenantId, produtorId);
  }

  @Get('saldos/evento/:eventoId')
  @ApiOperation({
    summary: 'Obtém resumo financeiro consolidado do evento para o Cockpit Operacional',
  })
  async obterSaldosEvento(
    @Param('eventoId') eventoId: string,
    @Query('produtorId') produtorId: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.financeiroPublicService.obterSaldosEvento(
      tenantId,
      produtorId,
      eventoId,
    );
  }

  @Get('extrato/:produtorId')
  @ApiOperation({
    summary: 'Consulta o extrato imutável do Ledger com histórico de lançamentos e paginação',
  })
  async listarExtrato(
    @Param('produtorId') produtorId: string,
    @Query() query: ExtratoQueryInput,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const parsedQuery = ExtratoQuerySchema.parse(query);
    return this.financeiroService.listarExtratoLedger(
      tenantId,
      produtorId,
      parsedQuery,
    );
  }

  @Post('transferencias')
  @ApiOperation({
    summary: 'Realiza transferência de saldos disponíveis entre eventos do mesmo produtor (partidas dobradas)',
  })
  @UsePipes(new ZodValidationPipe(SolicitarTransferenciaInterEventoSchema))
  async transferirInterEventos(
    @Body() input: SolicitarTransferenciaInterEventoInput,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.financeiroService.transferirInterEventos(tenantId, input);
  }

  @Post('repasses')
  @ApiOperation({
    summary: 'Solicita liquidação de repasse Pix com bloqueio cautelar preventivo no ledger',
  })
  @UsePipes(new ZodValidationPipe(SolicitarRepasseSchema))
  async solicitarRepasse(
    @Body() input: SolicitarRepasseInput,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-user-id') userIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const autorId = resolveUser(userIdHeader);
    return this.financeiroService.solicitarRepasse(tenantId, input, autorId);
  }

  @Get('repasses/:produtorId')
  @ApiOperation({
    summary: 'Lista histórico e status de solicitações de repasse do produtor',
  })
  async listarRepasses(
    @Param('produtorId') produtorId: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.financeiroService.listarRepasses(tenantId, produtorId);
  }

  @Post('antecipacoes/simular')
  @ApiOperation({
    summary: 'Simula deságio e valor líquido de antecipação de recebíveis pró-rata dia',
  })
  @UsePipes(new ZodValidationPipe(SimularAntecipacaoSchema))
  simularAntecipacao(@Body() input: SimularAntecipacaoInput) {
    return this.financeiroService.simularAntecipacao(input);
  }

  @Post('antecipacoes')
  @ApiOperation({
    summary: 'Solicita antecipação de recebíveis com trava de risco e auditoria',
  })
  @UsePipes(new ZodValidationPipe(SolicitarAntecipacaoSchema))
  async solicitarAntecipacao(
    @Body() input: SolicitarAntecipacaoInput,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-user-id') userIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    const autorId = resolveUser(userIdHeader);
    return this.financeiroService.solicitarAntecipacao(tenantId, input, autorId);
  }

  @Post('contas-pagar')
  @ApiOperation({
    summary: 'Cadastra nova conta a pagar de fornecedor vinculada ao evento',
  })
  @UsePipes(new ZodValidationPipe(CriarContaPagarSchema))
  async criarContaPagar(
    @Body() input: CriarContaPagarInput,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.financeiroService.criarContaPagar(tenantId, input);
  }

  @Get('contas-pagar')
  @ApiOperation({
    summary: 'Lista contas a pagar pendentes e liquidadas do evento',
  })
  async listarContasPagar(
    @Query('eventoId') eventoId?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.financeiroService.listarContasPagar(tenantId, eventoId);
  }

  @Post('contas-pagar/:id/pagar')
  @ApiOperation({
    summary: 'Efetua baixa e liquidação direta da conta a pagar com débito no ledger do evento',
  })
  @UsePipes(new ZodValidationPipe(PagarContaSchema))
  async pagarConta(
    @Param('id') id: string,
    @Body() input: PagarContaInput,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.financeiroService.pagarConta(tenantId, id, input.aprovadoPor);
  }

  @Get('readiness/:produtorId/:eventoId')
  @ApiOperation({
    summary: 'Verifica pendências financeiras (chave Pix, conciliações) para o checklist de Go-Live',
  })
  async verificarReadiness(
    @Param('produtorId') produtorId: string,
    @Param('eventoId') eventoId: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = resolveTenant(tenantIdHeader);
    return this.financeiroPublicService.verificarReadinessFinanceiro(
      tenantId,
      produtorId,
      eventoId,
    );
  }
}

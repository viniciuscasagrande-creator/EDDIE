import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  Headers,
} from '@nestjs/common';
import { AutomacoesService } from './automacoes.service';
import {
  CriarRegraDto,
  SimularRegraDryRunDto,
  KillSwitchDto,
  SolicitarAprovacaoDto,
  DecidirAprovacaoDto,
  DelegarAprovacaoDto,
} from './automacoes.types';

@Controller('automacoes')
export class AutomacoesController {
  constructor(private readonly automacoesService: AutomacoesService) {}

  @Get('regras')
  async listarRegras(@Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001') {
    return this.automacoesService.listarRegras(tenantId);
  }

  @Post('regras')
  async criarRegra(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Body() dto: CriarRegraDto,
  ) {
    return this.automacoesService.criarRegra(tenantId, dto);
  }

  @Patch('regras/:id/status')
  async alternarStatus(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.automacoesService.alternarStatusRegra(tenantId, id, status);
  }

  @Post('regras/:id/versao')
  async atualizarVersao(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Param('id') id: string,
    @Body() dto: {
      condicoesGrupos: any[];
      acoes: any[];
      motivoAlteracao: string;
      alteradoPor: string;
    },
  ) {
    return this.automacoesService.atualizarRegraVersao(tenantId, id, dto);
  }

  @Post('regras/simular')
  async simularDryRun(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Body() dto: SimularRegraDryRunDto,
  ) {
    return this.automacoesService.simularRegraDryRun(tenantId, dto);
  }

  @Post('kill-switch')
  async killSwitch(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Body() dto: KillSwitchDto,
  ) {
    return this.automacoesService.acionarKillSwitch(tenantId, dto);
  }

  @Get('aprovacoes')
  async listarAprovacoes(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Query('status') status?: string,
  ) {
    return this.automacoesService.listarAprovacoes(tenantId, status);
  }

  @Post('aprovacoes')
  async solicitarAprovacao(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Body() dto: SolicitarAprovacaoDto,
  ) {
    return this.automacoesService.solicitarAprovacao(tenantId, dto);
  }

  @Post('aprovacoes/:id/decidir')
  async decidirAprovacao(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Param('id') id: string,
    @Body() dto: DecidirAprovacaoDto,
  ) {
    return this.automacoesService.decidirAprovacao(tenantId, id, dto);
  }

  @Post('delegacoes')
  async delegarAprovacao(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Body() dto: DelegarAprovacaoDto,
  ) {
    return this.automacoesService.delegarAprovacao(tenantId, dto);
  }

  @Get('pendencias')
  async obterPendencias(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Query('usuarioId') usuarioId = 'usr-admin-pdt',
    @Query('departamento') departamento?: string,
  ) {
    return this.automacoesService.obterCaixaTrabalho(tenantId, usuarioId, departamento);
  }

  @Get('fluxos')
  async listarFluxos(@Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001') {
    return this.automacoesService.listarFluxos(tenantId);
  }

  @Get('execucoes')
  async listarExecucoes(@Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001') {
    return this.automacoesService.listarExecucoes(tenantId);
  }
}

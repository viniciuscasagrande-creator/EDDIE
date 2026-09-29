// apps/api/src/modules/operacao/operacao.controller.ts
// EDDIE 11.33 — Central de Operações, Monitoramento em Tempo Real e Gestão de Incidentes

import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  Sse,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { OperacaoService } from './operacao.service';
import {
  SeveridadeAlerta,
  SeveridadeIncidente,
  StatusIncidente,
} from './operacao.types';

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

@ApiTags('operacao')
@Controller()
export class OperacaoController {
  constructor(private readonly operacaoService: OperacaoService) {}

  // ==========================================================================
  //  11.33.1 — CENTRAL DE OPERAÇÕES: SNAPSHOT EXECUTIVO & TEMPO REAL
  // ==========================================================================
  @Get('operacao/central/snapshot')
  @ApiOperation({ summary: 'Snapshot executivo consolidado em tempo real da Central de Operações (NOC)' })
  async obterSnapshotCentral(
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    return this.operacaoService.obterSnapshotCentral(tenantId);
  }

  // ==========================================================================
  //  11.33.2 — CENTRAL DE ALERTAS: INGESTÃO, SINAIS & REDUÇÃO DE RUÍDO
  // ==========================================================================
  @Post('operacao/sinais')
  @ApiOperation({ summary: 'Ingestão de sinal de telemetria bruto com correlação causal e deduplicação' })
  async emitirSinal(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: {
      eventoId?: string;
      origem: string;
      tipo: string;
      severidade: SeveridadeAlerta;
      chaveCorrelacao: string;
      titulo: string;
      descricao: string;
      categoria: string;
      dados?: Record<string, unknown>;
    },
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    return this.operacaoService.emitirSinal(tenantId, body);
  }

  @Get('operacao/alertas')
  @ApiOperation({ summary: 'Listagem de alertas operacionais ativos deduplicados' })
  async listarAlertasGerais(
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    return this.operacaoService.obterAlertas(tenantId);
  }

  @Post('operacao/alertas/:id/reconhecer')
  @ApiOperation({ summary: 'Reconhece (acknowledge) um alerta operacional' })
  async reconhecerAlerta(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Headers('x-user-id') userIdHeader: string,
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    return this.operacaoService.reconhecerAlerta(tenantId, id, userIdHeader || 'operador-noc');
  }

  @Post('operacao/alertas/:id/silenciar')
  @ApiOperation({ summary: 'Silencia temporariamente um alerta operacional com justificativa e TTL' })
  async silenciarAlerta(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Headers('x-user-id') userIdHeader: string,
    @Body() body: { minutos?: number; motivo?: string },
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    return this.operacaoService.silenciarAlerta(
      tenantId,
      id,
      body.minutos || 30,
      body.motivo || 'Silenciado para investigação',
      userIdHeader || 'operador-noc',
    );
  }

  @Post('operacao/alertas/:id/associar-incidente')
  @ApiOperation({ summary: 'Associa um alerta operacional a um incidente existente na War Room' })
  async associarAlertaIncidente(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: { incidenteId: string },
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    return this.operacaoService.associarAlertaIncidente(tenantId, id, body.incidenteId);
  }

  @Post('operacao/alertas/:id/escalar-incidente')
  @ApiOperation({ summary: 'Escala um alerta crítico gerando um novo Incidente Operacional (INC-2026-XXXX)' })
  async escalarAlertaParaIncidente(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: {
      titulo: string;
      severidade: SeveridadeIncidente;
      coordenadorId?: string;
    },
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    return this.operacaoService.escalarAlertaParaIncidente(tenantId, id, body);
  }

  @Post('operacao/alertas/:id/atribuir')
  @ApiOperation({ summary: 'Atribui um alerta a um operador responsável' })
  async atribuirAlerta(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: { responsavelId: string },
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    return this.operacaoService.atribuirAlerta(tenantId, id, body.responsavelId);
  }

  // ==========================================================================
  //  11.33.3 — GESTÃO DE INCIDENTES (WAR ROOM & SALA DO INCIDENTE)
  // ==========================================================================
  @Post('operacao/incidentes')
  @ApiOperation({ summary: 'Abre um novo incidente operacional (INC-2026-XXXX)' })
  async criarIncidenteGlobal(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: {
      eventoId?: string;
      titulo: string;
      descricao: string;
      severidade: SeveridadeIncidente;
      coordenadorId?: string;
      sistemasAfetados?: string[];
      eventosAfetados?: string[];
      gmvEmRiscoCentavos?: number;
      pedidosRepresados?: number;
      publicoAfetadoPortaria?: number;
    },
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    return this.operacaoService.criarIncidente(tenantId, body.eventoId || 'evento-geral', body);
  }

  @Get('operacao/incidentes')
  @ApiOperation({ summary: 'Lista incidentes operacionais da Central' })
  async listarIncidentesGerais(
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    return this.operacaoService.obterIncidentes(tenantId);
  }

  @Get('operacao/incidentes/:id')
  @ApiOperation({ summary: 'Detalhes completos da Sala de Incidente (Timeline, Evidências, Runbooks)' })
  async obterIncidenteDetalhado(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    return this.operacaoService.obterIncidentePorId(tenantId, id);
  }

  @Patch('operacao/incidentes/:id/status')
  @ApiOperation({ summary: 'Transição de status do incidente operacional (Ex: MITIGADO, RESOLVIDO)' })
  async atualizarStatusIncidente(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: {
      status: StatusIncidente;
      autorNome?: string;
      mensagem?: string;
    },
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    return this.operacaoService.atualizarStatusIncidente(tenantId, id, {
      status: body.status,
      autorNome: body.autorNome || 'Operador NOC',
      mensagem: body.mensagem || `Status atualizado para ${body.status}`,
    });
  }

  @Post('operacao/incidentes/:id/atualizacoes')
  @ApiOperation({ summary: 'Adiciona registro na timeline do incidente (Investigação, Evidência, Comunicação)' })
  async adicionarAtualizacaoIncidente(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: {
      autorNome: string;
      tipo: string;
      mensagem: string;
      payload?: unknown;
    },
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    return this.operacaoService.adicionarAtualizacaoIncidente(tenantId, id, body);
  }

  @Post('operacao/procedimentos/:id/executar')
  @ApiOperation({ summary: 'Executa procedimento padronizado de runbook (ex: Failover Adquirente)' })
  async executarProcedimento(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Headers('x-user-id') userIdHeader: string,
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    return this.operacaoService.executarProcedimento(tenantId, id, userIdHeader || 'coordenador-noc');
  }

  // ==========================================================================
  //  11.33.4 — SALA DE OPERAÇÃO DO EVENTO (AO VIVO & MODO TELÃO)
  // ==========================================================================
  @Get('eventos/:eventoId/operacao/sala')
  @ApiOperation({ summary: 'Dados de comando da Sala de Operação do Evento ao Vivo (Modo Telão NOC)' })
  async obterSalaOperacaoEvento(
    @Param('eventoId') eventoId: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    return this.operacaoService.obterSalaOperacaoEvento(tenantId, eventoId);
  }

  @Post('eventos/:eventoId/operacao/contingencia-offline')
  @ApiOperation({ summary: 'Ativa ou desativa modo de contingência offline segura para a portaria do evento' })
  async alternarContingenciaOfflinePortaria(
    @Param('eventoId') eventoId: string,
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Headers('x-user-id') userIdHeader: string,
    @Body() body: { ativar: boolean },
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    return this.operacaoService.alternarContingenciaOfflinePortaria(
      tenantId,
      eventoId,
      body.ativar,
      userIdHeader || 'coordenador-campo',
    );
  }

  // ==========================================================================
  //  11.33.5 — PÓS-INCIDENTE (POST-MORTEM / RCA) & GESTÃO DE PROBLEMAS (ITIL)
  // ==========================================================================
  @Post('operacao/incidentes/:id/pos-incidente')
  @ApiOperation({ summary: 'Registra análise pós-incidente oficial (Post-Mortem / RCA)' })
  async registrarAnalisePosIncidente(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: any,
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    return this.operacaoService.registrarAnalisePosIncidente(tenantId, {
      ...body,
      incidenteId: id,
    });
  }

  @Get('operacao/incidentes/:id/pos-incidente')
  @ApiOperation({ summary: 'Obtém relatório Pós-Incidente (Post-Mortem / RCA)' })
  async obterAnalisePosIncidente(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    return this.operacaoService.obterAnalisePosIncidente(tenantId, id);
  }

  @Post('operacao/problemas')
  @ApiOperation({ summary: 'Registra problema conhecido na gestão de problemas ITIL' })
  async registrarProblema(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: {
      titulo: string;
      descricao: string;
      categoria: string;
      solucaoContorno?: string;
      solucaoDefinitiva?: string;
    },
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    return this.operacaoService.registrarProblema(tenantId, body);
  }

  @Get('operacao/problemas')
  @ApiOperation({ summary: 'Lista problemas operacionais conhecidos' })
  async obterProblemas(
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    return this.operacaoService.obterProblemas(tenantId);
  }

  // ==========================================================================
  //  RETROCOMPATIBILIDADE COM ENDPOINTS ANTERIORES DO EVENTO
  // ==========================================================================
  @Get('eventos/:eventoId/operacao/resumo')
  @ApiOperation({ summary: 'Snapshot consolidado de operação em tempo real do evento' })
  async obterResumo(
    @Param('eventoId') eventoId: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Query('sessaoId') sessaoId?: string,
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    return this.operacaoService.obterResumo(tenantId, eventoId, sessaoId);
  }

  @Get('eventos/:eventoId/operacao/timeline')
  @ApiOperation({ summary: 'Timeline de eventos operacionais deduplicada e em ordem cronológica' })
  async obterTimeline(
    @Param('eventoId') eventoId: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Query('sessaoId') sessaoId?: string,
    @Query('cursor') cursor?: string,
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    return this.operacaoService.obterTimeline(tenantId, eventoId, sessaoId, cursor);
  }

  @Get('eventos/:eventoId/operacao/alertas')
  @ApiOperation({ summary: 'Alertas operacionais do evento' })
  async obterAlertasEvento(
    @Param('eventoId') eventoId: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Query('sessaoId') sessaoId?: string,
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    return this.operacaoService.obterAlertas(tenantId, eventoId, sessaoId);
  }

  @Post('eventos/:eventoId/incidentes')
  @ApiOperation({ summary: 'Abre um novo incidente operacional para o evento' })
  async criarIncidenteEvento(
    @Param('eventoId') eventoId: string,
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: any,
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    return this.operacaoService.criarIncidente(tenantId, eventoId, {
      titulo: body.titulo || 'Incidente Operacional do Evento',
      descricao: body.descricao || 'Ocorrência registrada no evento.',
      severidade: body.severidade || 'P3_MEDIO',
      coordenadorId: body.responsavelId || 'Operador',
      sistemasAfetados: [body.categoria || 'OPERACIONAL'],
      eventosAfetados: [eventoId],
    });
  }

  @Get('eventos/:eventoId/incidentes')
  @ApiOperation({ summary: 'Lista incidentes operacionais do evento' })
  async listarIncidentesEvento(
    @Param('eventoId') eventoId: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    return this.operacaoService.obterIncidentes(tenantId, eventoId);
  }

  @Patch('incidentes/:id')
  @ApiOperation({ summary: 'Atualiza status ou detalhes de um incidente' })
  async atualizarIncidente(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: any,
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    return this.operacaoService.atualizarIncidente(tenantId, id, body);
  }

  @Sse('eventos/:eventoId/operacao/stream')
  @ApiOperation({ summary: 'Canal Server-Sent Events (SSE) para atualização em tempo real' })
  streamOperacao(
    @Param('eventoId') eventoId: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Query('sessaoId') sessaoId?: string,
  ): Observable<MessageEvent> {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    return this.operacaoService.streamOperacao(tenantId, eventoId, sessaoId);
  }
}

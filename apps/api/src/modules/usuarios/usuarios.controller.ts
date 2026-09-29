// apps/api/src/modules/usuarios/usuarios.controller.ts
// EDDIE 11.29 / 11.34 — User Management, RBAC, Security & Antifraud Controller

import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import {
  PapelUsuario,
  EscopoVisao,
  CriarUsuarioRequest,
  AtualizarPermissoesRequest,
  AlterarStatusRequest,
  TipoBloqueio,
  StatusInvestigacao,
} from './usuarios.types';

@Controller('v1/usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  // ============================================================================
  //  ROTAS ESPECÍFICAS (DEVEM SER DECLARADAS ANTES DE ':id')
  // ============================================================================

  /**
   * Catálogo de todas as permissões granulares disponíveis no sistema.
   */
  @Get('permissoes')
  getPermissoesDisponiveis() {
    return this.usuariosService.getPermissoesDisponiveis();
  }

  /**
   * Lista de produtoras parceiras homologadas para vinculação de usuários.
   */
  @Get('produtores')
  getProdutoresParceiros() {
    return this.usuariosService.getProdutoresParceiros();
  }

  // ============================================================================
  //  EDDIE 11.34 — SEGURANÇA, ANTIFRAUDE & AUDITORIA
  // ============================================================================

  /**
   * Super Snapshot da Central de Segurança & Antifraude (11.34.1).
   */
  @Get('seguranca/central/snapshot')
  async obterCentralSeguranca(@Query('tenantId') tenantId?: string) {
    return this.usuariosService.obterCentralSeguranca(tenantId);
  }

  /**
   * Validação de Operação Sensível e aplicação de quarentena bancária de 24h.
   */
  @Post('seguranca/operacoes-sensiveis/validar')
  @HttpCode(HttpStatus.OK)
  async validarOperacaoSensivel(
    @Body()
    body: {
      codigoOperacao: string;
      usuarioId: string;
      recursoAfetado: string;
      recursoId?: string;
      valorCents?: number;
      contaAlteradaHaHoras?: number;
      mfaToken?: string;
      detalhes?: Record<string, unknown>;
      operadorCriadorId?: string;
    },
  ) {
    return this.usuariosService.validarOperacaoSensivel(body);
  }

  /**
   * Antifraude de Pagamentos & Avaliação de Risco com Explicação de Sinais.
   */
  @Post('seguranca/antifraude/pagamentos/avaliar')
  @HttpCode(HttpStatus.OK)
  async avaliarRiscoPagamento(
    @Body()
    body: {
      pedidoId: string;
      valorCents: number;
      metodo: string;
      clienteDocumento?: string;
      clienteEmail?: string;
      ipOrigem?: string;
      dispositivoId?: string;
      velocidadeComprasMin?: number;
      cartoesDiferentes24h?: number;
    },
  ) {
    return this.usuariosService.avaliarRiscoPagamento(body);
  }

  /**
   * Antifraude de Ingressos & Validação de Portaria.
   */
  @Post('seguranca/antifraude/ingressos/validar')
  @HttpCode(HttpStatus.OK)
  async processarValidacaoIngressoPortaria(
    @Body()
    body: {
      eventoId: string;
      ingressoId: string;
      codigoQr: string;
      portao: string;
      dispositivoIdentificador: string;
      operadorId: string;
      statusIngressoAtual?: string;
    },
  ) {
    return this.usuariosService.processarValidacaoIngressoPortaria(body);
  }

  /**
   * Lista de sessões ativas e suspeitas.
   */
  @Get('seguranca/sessoes')
  async listarSessoes(@Query('usuarioId') usuarioId?: string) {
    return this.usuariosService.listarSessoes(usuarioId);
  }

  /**
   * Encerramento remoto de sessão de usuário.
   */
  @Post('seguranca/sessoes/:id/encerrar')
  @HttpCode(HttpStatus.OK)
  async encerrarSessao(
    @Param('id') sessaoId: string,
    @Body('encerradoPor') encerradoPor: string = 'admin',
  ) {
    return this.usuariosService.encerrarSessao(sessaoId, encerradoPor);
  }

  /**
   * Casos de investigação de fraude.
   */
  @Get('seguranca/investigacoes')
  async listarInvestigacoes(@Query('status') status?: StatusInvestigacao) {
    return this.usuariosService.listarInvestigacoes(status);
  }

  /**
   * Detalhes de um caso de investigação e seu grafo de relações.
   */
  @Get('seguranca/investigacoes/:id')
  async obterInvestigacao(@Param('id') id: string) {
    return this.usuariosService.obterInvestigacao(id);
  }

  /**
   * Bloqueios de segurança ativos ou histórico.
   */
  @Get('seguranca/bloqueios')
  async listarBloqueios(@Query('ativo') ativo?: string) {
    const isAtivo = ativo !== undefined ? ativo === 'true' : undefined;
    return this.usuariosService.listarBloqueios(isAtivo);
  }

  /**
   * Aplicação de novo bloqueio de segurança.
   */
  @Post('seguranca/bloqueios')
  @HttpCode(HttpStatus.CREATED)
  async aplicarBloqueio(
    @Body()
    body: {
      tipo: TipoBloqueio;
      alvoIdentificador: string;
      alvoDescricao?: string;
      motivo: string;
      evidencias: string[];
      bloqueadoPor: string;
      expiraEm?: string;
    },
  ) {
    return this.usuariosService.aplicarBloqueio(body);
  }

  /**
   * Revogação / desbloqueio de segurança.
   */
  @Delete('seguranca/bloqueios/:id')
  @HttpCode(HttpStatus.OK)
  async revogarBloqueio(
    @Param('id') id: string,
    @Body('revogadoPor') revogadoPor: string = 'admin',
  ) {
    return this.usuariosService.revogarBloqueio(id, revogadoPor);
  }

  /**
   * Lista de credenciais de parceiros e integrações (chaves mascaradas).
   */
  @Get('seguranca/parceiros/credenciais')
  async listarCredenciaisParceiros() {
    return this.usuariosService.listarCredenciaisParceiros();
  }

  /**
   * Geração de nova credencial de parceiro API.
   */
  @Post('seguranca/parceiros/credenciais')
  @HttpCode(HttpStatus.CREATED)
  async gerarCredencialParceiro(
    @Body()
    body: {
      parceiroId: string;
      parceiroNome: string;
      nome: string;
      escopos: string[];
      limiteRequisicoesMinuto?: number;
      ipWhitelist?: string[];
    },
  ) {
    return this.usuariosService.gerarCredencialParceiro(body);
  }

  /**
   * Concessão de permissão temporária (Break-Glass / JIT).
   */
  @Post('seguranca/acesso-temporario')
  @HttpCode(HttpStatus.OK)
  async concederAcessoTemporario(
    @Body()
    body: {
      usuarioId: string;
      permissao: string;
      duracaoHoras: number;
      motivo: string;
      concedidoPor: string;
    },
  ) {
    return this.usuariosService.concederAcessoTemporario(
      body.usuarioId,
      body.permissao,
      body.duracaoHoras,
      body.motivo,
      body.concedidoPor,
    );
  }

  /**
   * Verificação de acesso com escopo e isolamento multi-tenant.
   */
  @Post('seguranca/verificar-acesso')
  @HttpCode(HttpStatus.OK)
  async verificarAcessoComEscopo(
    @Body()
    body: {
      usuarioId: string;
      recursoProdutorId: string | null;
      permissaoRequerida?: string;
    },
  ) {
    return this.usuariosService.verificarAcessoComEscopo(
      body.usuarioId,
      body.recursoProdutorId,
      body.permissaoRequerida,
    );
  }

  // ============================================================================
  //  ROTAS DE USUÁRIOS
  // ============================================================================

  /**
   * Lista todos os usuários cadastrados com filtros opcionais.
   */
  @Get()
  async getUsuarios(
    @Query('papel') papel?: PapelUsuario,
    @Query('escopo') escopo?: EscopoVisao,
    @Query('produtorId') produtorId?: string,
  ) {
    return this.usuariosService.getUsuarios({ papel, escopo, produtorId });
  }

  /**
   * Detalhes de um usuário específico por ID.
   */
  @Get(':id')
  async getUsuarioById(@Param('id') id: string) {
    return this.usuariosService.getUsuarioById(id);
  }

  /**
   * Cadastro de novo usuário com papel e escopo de visão.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async criarUsuario(@Body() body: CriarUsuarioRequest) {
    return this.usuariosService.criarUsuario(body);
  }

  /**
   * Atualização de permissões granulares de um usuário.
   */
  @Put(':id/permissoes')
  @HttpCode(HttpStatus.OK)
  async atualizarPermissoes(
    @Param('id') id: string,
    @Body() body: AtualizarPermissoesRequest,
  ) {
    return this.usuariosService.atualizarPermissoes(id, body);
  }

  /**
   * Bloqueio ou ativação de usuário.
   */
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  async alterarStatus(
    @Param('id') id: string,
    @Body() body: AlterarStatusRequest,
  ) {
    return this.usuariosService.alterarStatus(id, body);
  }
}

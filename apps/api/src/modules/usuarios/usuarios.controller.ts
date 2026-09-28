// apps/api/src/modules/usuarios/usuarios.controller.ts
// EDDIE 11.29 — User Management & RBAC Controller

import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
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
} from './usuarios.types';

@Controller('v1/usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

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

// apps/api/src/modules/usuarios/usuarios.spec.ts
// EDDIE 11.29 — User Management & RBAC Unit Tests

import { describe, it, expect, beforeEach } from 'vitest';
import { UsuariosService } from './usuarios.service';

describe('UsuariosService (EDDIE 11.29 — RBAC & Visão Produtor vs DiskIngressos)', () => {
  let service: UsuariosService;

  beforeEach(() => {
    service = new UsuariosService();
  });

  it('deve listar usuários iniciais segregando adequadamente entre escopos DISKINGRESSOS e PRODUTOR', async () => {
    const usuarios = await service.getUsuarios();
    expect(usuarios.length).toBeGreaterThanOrEqual(4);

    const admin = usuarios.find((u) => u.papel === 'ADMIN_DISKINGRESSOS');
    expect(admin).toBeDefined();
    expect(admin?.escopoVisao).toBe('DISKINGRESSOS');
    expect(admin?.produtorId).toBeNull();

    const produtor = usuarios.find((u) => u.papel === 'PRODUTOR_ADMIN');
    expect(produtor).toBeDefined();
    expect(produtor?.escopoVisao).toBe('PRODUTOR');
    expect(produtor?.produtorId).not.toBeNull();
  });

  it('deve buscar usuário por ID com sucesso', async () => {
    const usuario = await service.getUsuarioById('usr-admin-master');
    expect(usuario).toBeDefined();
    expect(usuario.nome).toContain('Vinicius');
    expect(usuario.email).toBe('vinicius@diskingressos.com.br');
    expect(usuario.status).toBe('ATIVO');
  });

  it('deve lançar NotFoundException para usuário inexistente', async () => {
    await expect(service.getUsuarioById('usr-inexistente-999')).rejects.toThrow(
      'não encontrado',
    );
  });

  it('deve criar um novo usuário de produtora com validação de escopo PRODUTOR', async () => {
    const novo = await service.criarUsuario({
      nome: 'Beatriz Lima (T4F)',
      email: 'beatriz.lima@t4f.com.br',
      papel: 'PRODUTOR_ADMIN',
      produtorId: 'prod-t4f',
      produtorNome: 'Time For Fun / T4F Entretenimento',
      criadoPor: 'vinicius@diskingressos.com.br',
    });

    expect(novo).toBeDefined();
    expect(novo.email).toBe('beatriz.lima@t4f.com.br');
    expect(novo.escopoVisao).toBe('PRODUTOR');
    expect(novo.produtorId).toBe('prod-t4f');
    expect(novo.status).toBe('ATIVO');
    expect(novo.permissoes).toContain('financeiro:portal_produtor');
  });

  it('deve rejeitar criação de usuário com papel de produtor sem vincular produtorId', async () => {
    await expect(
      service.criarUsuario({
        nome: 'Operador Órfão',
        email: 'orfao@produtora.com.br',
        papel: 'PRODUTOR_ADMIN',
        criadoPor: 'admin',
      }),
    ).rejects.toThrow('devem obrigatoriamente estar vinculados a uma produtora');
  });

  it('deve rejeitar criação de usuário com e-mail duplicado', async () => {
    await expect(
      service.criarUsuario({
        nome: 'Vinicius Duplicado',
        email: 'vinicius@diskingressos.com.br',
        papel: 'ADMIN_DISKINGRESSOS',
        criadoPor: 'admin',
      }),
    ).rejects.toThrow('já está em uso');
  });

  it('deve atualizar permissões de um usuário com validação de governança', async () => {
    const usuarioId = 'usr-op-catraca';
    const atualizado = await service.atualizarPermissoes(usuarioId, {
      permissoes: ['portaria:validar_ingresso', 'eventos:read_all'],
      atualizadoPor: 'admin-seguranca',
    });

    expect(atualizado.permissoes).toEqual([
      'portaria:validar_ingresso',
      'eventos:read_all',
    ]);
  });

  it('deve PROIBIR conceder permissões exclusivas da DiskIngressos a um usuário de PRODUTOR', async () => {
    const usuarioProdutorId = 'usr-prod-livenation';
    await expect(
      service.atualizarPermissoes(usuarioProdutorId, {
        permissoes: [
          'eventos:read_tenant',
          'fpa:budget_manage', // Exclusivo da DiskIngressos!
        ],
        atualizadoPor: 'admin-seguranca',
      }),
    ).rejects.toThrow('não podem ter permissões exclusivas da DiskIngressos');
  });

  it('deve alterar status do usuário para BLOQUEADO e restaurar para ATIVO', async () => {
    const usuarioId = 'usr-prod-opus';
    const bloqueado = await service.alterarStatus(usuarioId, {
      status: 'BLOQUEADO',
      motivo: 'Suspeita de comprometimento de credenciais',
      alteradoPor: 'auditor-chefe',
    });
    expect(bloqueado.status).toBe('BLOQUEADO');

    const reativado = await service.alterarStatus(usuarioId, {
      status: 'ATIVO',
      motivo: 'Troca de senha efetuada com 2FA revalidado',
      alteradoPor: 'auditor-chefe',
    });
    expect(reativado.status).toBe('ATIVO');
  });

  it('deve filtrar usuários por escopo e produtor', async () => {
    const apenasProdutores = await service.getUsuarios({ escopo: 'PRODUTOR' });
    expect(apenasProdutores.every((u) => u.escopoVisao === 'PRODUTOR')).toBe(true);

    const apenasLiveNation = await service.getUsuarios({
      produtorId: 'prod-live-nation',
    });
    expect(apenasLiveNation.length).toBe(1);
    expect(apenasLiveNation[0]?.produtorId).toBe('prod-live-nation');
  });

  it('deve retornar catálogo completo de permissões com tags exclusivas', () => {
    const permissoes = service.getPermissoesDisponiveis();
    expect(permissoes.length).toBeGreaterThanOrEqual(10);

    const fpaPerm = permissoes.find((p) => p.codigo === 'fpa:budget_manage');
    expect(fpaPerm?.exclusivoDiskIngressos).toBe(true);

    const portalProdutorPerm = permissoes.find(
      (p) => p.codigo === 'financeiro:portal_produtor',
    );
    expect(portalProdutorPerm?.exclusivoDiskIngressos).toBe(false);
  });
});

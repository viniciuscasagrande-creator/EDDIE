// apps/api/src/modules/usuarios/usuarios.spec.ts
// EDDIE 11.29 / 11.34 — Identity, RBAC, Security & Antifraud Tests

import { describe, it, expect, beforeEach } from 'vitest';
import { UsuariosService } from './usuarios.service';

describe('UsuariosService (EDDIE 11.29 & 11.34 — Identidade, RBAC, Segurança e Proteção)', () => {
  let service: UsuariosService;

  beforeEach(() => {
    service = new UsuariosService();
  });

  // ============================================================================
  //  EDDIE 11.29 — RBAC & SEGREGAÇÃO BÁSICA
  // ============================================================================

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

  // ============================================================================
  //  EDDIE 11.34 — ISOLAMENTO MULTI-TENANT & CONTROLE DE ACESSO
  // ============================================================================

  it('deve aplicar isolamento multi-tenant estrito: produtor não pode acessar dados de outra produtora (403)', async () => {
    // Carlos Eduardo pertence a 'prod-live-nation'
    const usuarioId = 'usr-prod-livenation';

    // Acesso à própria produtora deve ser permitido
    const acessoProprio = await service.verificarAcessoComEscopo(
      usuarioId,
      'prod-live-nation',
      'eventos:read_tenant',
    );
    expect(acessoProprio.permitido).toBe(true);

    // Tentativa de acessar 'prod-opus-entretenimento' deve ser bloqueada com 403
    await expect(
      service.verificarAcessoComEscopo(
        usuarioId,
        'prod-opus-entretenimento',
        'eventos:read_tenant',
      ),
    ).rejects.toThrow('Isolamento multi-tenant violado');
  });

  it('deve permitir que usuário corporativo DiskIngressos acesse recursos de qualquer produtor', async () => {
    const adminId = 'usr-admin-master';
    const acessoAdmin = await service.verificarAcessoComEscopo(
      adminId,
      'prod-live-nation',
      'eventos:read_all',
    );
    expect(acessoAdmin.permitido).toBe(true);
  });

  it('deve bloquear acesso de usuário com status BLOQUEADO', async () => {
    const usuarioId = 'usr-prod-opus';
    await service.alterarStatus(usuarioId, {
      status: 'BLOQUEADO',
      motivo: 'Comprometimento detectado',
      alteradoPor: 'sec-ops',
    });

    await expect(
      service.verificarAcessoComEscopo(usuarioId, 'prod-opus-entretenimento'),
    ).rejects.toThrow('encontra-se bloqueado');
  });

  it('deve suportar concessão de permissão temporária (JIT / Break-Glass)', async () => {
    const usuarioId = 'usr-op-catraca';
    const usuarioAtualizado = await service.concederAcessoTemporario(
      usuarioId,
      'eventos:write',
      2, // 2 horas
      'Apoio emergencial no credenciamento',
      'admin-chefe',
    );

    expect(usuarioAtualizado.permissaoTemporaria).toBe('eventos:write');
    expect(usuarioAtualizado.acessoTemporarioAte).toBeDefined();

    // Verificação de acesso com a permissão temporária
    const acesso = await service.verificarAcessoComEscopo(usuarioId, null, 'eventos:write');
    expect(acesso.permitido).toBe(true);
  });

  // ============================================================================
  //  EDDIE 11.34 — SEGREGAÇÃO DE FUNÇÕES (SoD) & OPERAÇÕES SENSÍVEIS
  // ============================================================================

  it('deve impedir que o mesmo usuário crie e aprove um repasse (Violação SoD)', () => {
    const usuarioId = 'usr-fin-diretor';
    expect(() => {
      service.validarSegregacaoFuncoes(usuarioId, 'APROVAR_REPASSE', usuarioId);
    }).toThrow('Violação de Segregação de Funções (SoD)');
  });

  it('deve permitir aprovação quando o operador criador for independente', () => {
    const aprovadorId = 'usr-fin-diretor';
    const criadorId = 'usr-fin-analista';

    const resultado = service.validarSegregacaoFuncoes(
      aprovadorId,
      'APROVAR_REPASSE',
      criadorId,
    );
    expect(resultado.compativel).toBe(true);
  });

  it('deve aplicar quarentena de 24h para repasses > R$ 100.000 se os dados bancários foram alterados recentemente', async () => {
    const resultado = await service.validarOperacaoSensivel({
      codigoOperacao: 'APROVAR_REPASSE',
      usuarioId: 'usr-fin-diretor',
      recursoAfetado: 'REPASSE_FINANCEIRO',
      recursoId: 'rep-9988',
      valorCents: 15000000, // R$ 150.000,00 (> R$ 100.000,00)
      contaAlteradaHaHoras: 4, // alterado há 4h (< 24h)
      mfaToken: 'TOTP-123456',
    });

    expect(resultado.status).toBe('RETIDO_QUARENTENA');
    expect(resultado.nivel).toBe('NIVEL_4_CRITICO');
    expect(resultado.quarentenaAte).toBeDefined();
  });

  it('deve executar diretamente repasse quando a alteração bancária ocorreu há mais de 24h', async () => {
    const resultado = await service.validarOperacaoSensivel({
      codigoOperacao: 'APROVAR_REPASSE',
      usuarioId: 'usr-fin-diretor',
      recursoAfetado: 'REPASSE_FINANCEIRO',
      recursoId: 'rep-9989',
      valorCents: 15000000,
      contaAlteradaHaHoras: 48, // alterado há 48h (> 24h)
      mfaToken: 'TOTP-123456',
    });

    expect(resultado.status).toBe('EXECUTADO');
    expect(resultado.quarentenaAte).toBeUndefined();
  });

  // ============================================================================
  //  EDDIE 11.34 — ANTIFRAUDE DE PAGAMENTOS COM SINAIS TRANSPARENTES
  // ============================================================================

  it('deve detectar ataque de carding / bots e classificar risco como CRÍTICO com decisão BLOQUEAR', async () => {
    const avaliacao = await service.avaliarRiscoPagamento({
      pedidoId: 'ped-teste-bot',
      valorCents: 850000,
      metodo: 'CARTAO_CREDITO',
      clienteDocumento: '000.111.222-33',
      clienteEmail: 'carding.bot@temp-mail.org',
      cartoesDiferentes24h: 4, // Sinal forte (+45)
      velocidadeComprasMin: 8, // Burst bot (+35)
      ipOrigem: '185.220.101.5 (tor-exit)', // Proxy anônimo (+25)
    });

    expect(avaliacao.scoreRisco).toBeGreaterThanOrEqual(85);
    expect(avaliacao.classificacaoRisco).toBe('CRITICO');
    expect(avaliacao.decisao).toBe('BLOQUEAR');
    expect(avaliacao.sinais.length).toBeGreaterThanOrEqual(3);
    expect(avaliacao.explicacaoDecisao).toContain('Padrão agressivo de fraude');
  });

  it('deve aprovar com risco BAIXO transação legítima padrão', async () => {
    const avaliacao = await service.avaliarRiscoPagamento({
      pedidoId: 'ped-legitimo',
      valorCents: 12000, // R$ 120,00
      metodo: 'PIX_DINAMICO',
      clienteDocumento: '123.456.789-00',
      clienteEmail: 'cliente.fiel@gmail.com',
      cartoesDiferentes24h: 1,
      velocidadeComprasMin: 1,
      ipOrigem: '177.18.29.102',
    });

    expect(avaliacao.scoreRisco).toBeLessThan(30);
    expect(avaliacao.classificacaoRisco).toBe('BAIXO');
    expect(avaliacao.decisao).toBe('PERMITIR');
  });

  // ============================================================================
  //  EDDIE 11.34 — ANTIFRAUDE DE INGRESSOS & PORTARIA
  // ============================================================================

  it('deve validar primeiro acesso com sucesso e barrar tentativa subsequente como DUPLICADO mantendo histórico', async () => {
    const eventoId = 'evt-festival-2026';
    const ingressoId = 'ing-teste-999';

    // 1ª Validação: Portão A
    const primeira = await service.processarValidacaoIngressoPortaria({
      eventoId,
      ingressoId,
      codigoQr: 'QR-VALID-HASH-1',
      portao: 'Portão 01 - Principal',
      dispositivoIdentificador: 'CAT-01',
      operadorId: 'usr-op-catraca',
    });

    expect(primeira.resultado).toBe('VALIDO');
    expect(primeira.isDuplicado).toBe(false);

    // 2ª Tentativa do mesmo ingresso: Portão B
    const segunda = await service.processarValidacaoIngressoPortaria({
      eventoId,
      ingressoId,
      codigoQr: 'QR-VALID-HASH-1',
      portao: 'Portão 04 - VIP',
      dispositivoIdentificador: 'CAT-08',
      operadorId: 'usr-op-catraca',
    });

    expect(segunda.resultado).toBe('DUPLICADO_JA_UTILIZADO');
    expect(segunda.isDuplicado).toBe(true);
    expect(segunda.primeiroPortao).toBe('Portão 01 - Principal');
    expect(segunda.primeiraValidacaoEm).toBe(primeira.timestamp);
  });

  // ============================================================================
  //  EDDIE 11.34 — CREDENCIAIS DE PARCEIROS & MASCARAMENTO
  // ============================================================================

  it('deve mascarar a chave do parceiro (••••XXXX) e fornecer secretOneTime apenas no momento da criação', async () => {
    const credencial = await service.gerarCredencialParceiro({
      parceiroId: 'parc-integrador-xyz',
      parceiroNome: 'Agência XYZ Viagens',
      nome: 'Chave API Reservas',
      escopos: ['eventos:read', 'reservas:write'],
      limiteRequisicoesMinuto: 300,
    });

    expect(credencial.chaveMascarada).toMatch(/^••••[A-Za-z0-9]{4}$/);
    expect(credencial.secretOneTime).toBeDefined();
    expect(credencial.secretOneTime).toContain('dsk_live_');
    expect(credencial.limiteRequisicoesMinuto).toBe(300);

    // Na listagem geral a chave segue mascarada
    const lista = await service.listarCredenciaisParceiros();
    const cadastrada = lista.find((c) => c.id === credencial.id);
    expect(cadastrada?.chaveMascarada).toBe(credencial.chaveMascarada);
  });

  // ============================================================================
  //  EDDIE 11.34 — CENTRAL DE SEGURANÇA SNAPSHOT
  // ============================================================================

  it('deve retornar snapshot completo com KPIs, domínios e coleções para o painel operacional', async () => {
    const snapshot = await service.obterCentralSeguranca();

    expect(snapshot.kpis.sessoesAtivas).toBe(184);
    expect(snapshot.kpis.operacoesRisco).toBe(12);
    expect(snapshot.kpis.investigacoesAbertas).toBe(7);
    expect(snapshot.kpis.bloqueiosAtivos).toBe(9);
    expect(snapshot.kpis.tentativasSuspeitas).toBe(21);
    expect(snapshot.kpis.alertasCriticos).toBe(2);

    expect(snapshot.saudeDominios.identidade).toBe('NORMAL');
    expect(snapshot.saudeDominios.pagamentos).toBe('ATENCAO');
    expect(snapshot.saudeDominios.ingressos).toBe('NORMAL');
    expect(snapshot.saudeDominios.portaria).toBe('NORMAL');
    expect(snapshot.saudeDominios.financeiro).toBe('ATENCAO');
    expect(snapshot.saudeDominios.apis).toBe('NORMAL');

    expect(snapshot.sessoes.length).toBeGreaterThanOrEqual(1);
    expect(snapshot.operacoesSensiveis.length).toBeGreaterThanOrEqual(1);
    expect(snapshot.antifraudePagamentos.length).toBeGreaterThanOrEqual(1);
    expect(snapshot.investigacoes.length).toBeGreaterThanOrEqual(1);
    expect(snapshot.bloqueios.length).toBeGreaterThanOrEqual(1);
    expect(snapshot.credenciaisParceiros.length).toBeGreaterThanOrEqual(1);
  });
});

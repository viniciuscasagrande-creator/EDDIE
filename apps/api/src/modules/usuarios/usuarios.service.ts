// apps/api/src/modules/usuarios/usuarios.service.ts
// EDDIE 11.29 — User Management & RBAC Permissions Service

import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.module';
import {
  PapelUsuario,
  EscopoVisao,
  StatusUsuario,
  UsuarioDto,
  CriarUsuarioRequest,
  AtualizarPermissoesRequest,
  AlterarStatusRequest,
  PermissaoDefinicao,
  ProdutorParceiroDto,
} from './usuarios.types';

@Injectable()
export class UsuariosService {
  private readonly logger = new Logger(UsuariosService.name);

  // Armazenamento em memória para usuários e permissões
  private readonly usuarios: Map<string, UsuarioDto> = new Map();

  constructor(private readonly prisma: PrismaService = new PrismaService()) {
    this.seedInitialUsers();
  }

  private seedInitialUsers(): void {
    const initialUsers: UsuarioDto[] = [
      {
        id: 'usr-admin-master',
        tenantId: '00000000-0000-0000-0000-000000000001',
        nome: 'Vinicius Casagrande (Admin Master)',
        email: 'vinicius@diskingressos.com.br',
        papel: 'ADMIN_DISKINGRESSOS',
        escopoVisao: 'DISKINGRESSOS',
        produtorId: null,
        produtorNome: null,
        status: 'ATIVO',
        permissoes: [
          'eventos:read_all',
          'eventos:write',
          'financeiro:global_ledger',
          'financeiro:aprovar_repasse',
          'contabilidade:read',
          'fechamento:read_all',
          'cash_forecast:read',
          'riscos:circuit_breaker',
          'fpa:budget_manage',
          'usuarios:manage_all',
        ],
        ultimoAcessoEm: new Date().toISOString(),
        criadoEm: '2026-01-10T10:00:00Z',
      },
      {
        id: 'usr-fin-diretor',
        tenantId: '00000000-0000-0000-0000-000000000001',
        nome: 'Mariana Duarte (Diretora Financeira)',
        email: 'mariana.duarte@diskingressos.com.br',
        papel: 'FINANCEIRO_DISKINGRESSOS',
        escopoVisao: 'DISKINGRESSOS',
        produtorId: null,
        produtorNome: null,
        status: 'ATIVO',
        permissoes: [
          'financeiro:global_ledger',
          'financeiro:aprovar_repasse',
          'contabilidade:read',
          'fechamento:read_all',
          'cash_forecast:read',
          'riscos:circuit_breaker',
          'fpa:budget_manage',
        ],
        ultimoAcessoEm: new Date().toISOString(),
        criadoEm: '2026-01-15T14:30:00Z',
      },
      {
        id: 'usr-prod-livenation',
        tenantId: '00000000-0000-0000-0000-000000000001',
        nome: 'Carlos Eduardo (Live Nation Brasil)',
        email: 'carlos.eduardo@livenation.com.br',
        papel: 'PRODUTOR_ADMIN',
        escopoVisao: 'PRODUTOR',
        produtorId: 'prod-live-nation',
        produtorNome: 'Live Nation Brasil Produções',
        status: 'ATIVO',
        permissoes: [
          'eventos:read_tenant',
          'eventos:write',
          'financeiro:portal_produtor',
          'financeiro:solicitar_repasse',
          'portaria:validar_ingresso',
          'usuarios:manage_team',
        ],
        ultimoAcessoEm: new Date().toISOString(),
        criadoEm: '2026-02-01T09:00:00Z',
      },
      {
        id: 'usr-prod-opus',
        tenantId: '00000000-0000-0000-0000-000000000001',
        nome: 'Juliana Siqueira (Opus Entretenimento)',
        email: 'juliana.siqueira@opusentretenimento.com.br',
        papel: 'PRODUTOR_ADMIN',
        escopoVisao: 'PRODUTOR',
        produtorId: 'prod-opus-entretenimento',
        produtorNome: 'Opus Entretenimento e Eventos',
        status: 'ATIVO',
        permissoes: [
          'eventos:read_tenant',
          'eventos:write',
          'financeiro:portal_produtor',
          'financeiro:solicitar_repasse',
          'portaria:validar_ingresso',
          'usuarios:manage_team',
        ],
        ultimoAcessoEm: new Date().toISOString(),
        criadoEm: '2026-02-15T11:20:00Z',
      },
      {
        id: 'usr-op-catraca',
        tenantId: '00000000-0000-0000-0000-000000000001',
        nome: 'Rodrigo Alves (Supervisor de Portaria)',
        email: 'rodrigo.alves@diskingressos.com.br',
        papel: 'PORTARIA_CHECKIN',
        escopoVisao: 'DISKINGRESSOS',
        produtorId: null,
        produtorNome: null,
        status: 'ATIVO',
        permissoes: [
          'portaria:validar_ingresso',
        ],
        ultimoAcessoEm: new Date().toISOString(),
        criadoEm: '2026-03-01T08:15:00Z',
      },
    ];

    for (const u of initialUsers) {
      this.usuarios.set(u.id, u);
    }
  }

  /**
   * Catálogo Oficial de Permissões Granulares.
   */
  getPermissoesDisponiveis(): PermissaoDefinicao[] {
    return [
      {
        codigo: 'eventos:read_all',
        nome: 'Visualizar Todos os Eventos',
        descricao: 'Permite visualizar o catálogo de eventos de todos os produtores.',
        modulo: 'Eventos',
        exclusivoDiskIngressos: true,
      },
      {
        codigo: 'eventos:read_tenant',
        nome: 'Visualizar Eventos da Produtora',
        descricao: 'Permite visualizar exclusivamente os eventos pertencentes à sua produtora.',
        modulo: 'Eventos',
        exclusivoDiskIngressos: false,
      },
      {
        codigo: 'eventos:write',
        nome: 'Criar e Editar Eventos',
        descricao: 'Permite cadastrar eventos, sessões, setores, lotes e preços.',
        modulo: 'Eventos',
        exclusivoDiskIngressos: false,
      },
      {
        codigo: 'financeiro:global_ledger',
        nome: 'Acesso ao Ledger Global & Tesouraria',
        descricao: 'Acesso a todos os lançamentos em conta gráfica, saldos bancários e split.',
        modulo: 'Financeiro',
        exclusivoDiskIngressos: true,
      },
      {
        codigo: 'financeiro:portal_produtor',
        nome: 'Extrato da Conta Gráfica do Produtor',
        descricao: 'Permite consultar o saldo disponível, retido e agenda de repasses.',
        modulo: 'Financeiro',
        exclusivoDiskIngressos: false,
      },
      {
        codigo: 'financeiro:solicitar_repasse',
        nome: 'Solicitar Repasse e Adiantamento',
        descricao: 'Permite solicitar antecipação de recebíveis e transferências via PIX.',
        modulo: 'Financeiro',
        exclusivoDiskIngressos: false,
      },
      {
        codigo: 'financeiro:aprovar_repasse',
        nome: 'Aprovar Repasses & Execução Bancária',
        descricao: 'Autoriza e processa transferências via CNAB e PIX bancário.',
        modulo: 'Financeiro',
        exclusivoDiskIngressos: true,
      },
      {
        codigo: 'contabilidade:read',
        nome: 'Acesso à Contabilidade & DRE Geral',
        descricao: 'Visualização do balancete de partidas dobradas e DRE consolidada da DiskIngressos.',
        modulo: 'Contabilidade',
        exclusivoDiskIngressos: true,
      },
      {
        codigo: 'fechamento:read_all',
        nome: 'Auditoria de Fechamento de Eventos (10 Gates)',
        descricao: 'Auditar checklist de fechamento, liquidar settlement e emitir dossiê.',
        modulo: 'Fechamento',
        exclusivoDiskIngressos: true,
      },
      {
        codigo: 'cash_forecast:read',
        nome: 'Previsão de Caixa & Capital de Giro',
        descricao: 'Acesso aos 6 horizontes de previsão de liquidez e simulações de estresse.',
        modulo: 'Cash Forecast',
        exclusivoDiskIngressos: true,
      },
      {
        codigo: 'riscos:circuit_breaker',
        nome: 'Gestão de Riscos & Circuit Breakers',
        descricao: 'Alterar limites de crédito, acionar travas de segurança e destravar produtores.',
        modulo: 'Riscos',
        exclusivoDiskIngressos: true,
      },
      {
        codigo: 'fpa:budget_manage',
        nome: 'Gestão Orçamentária & Centros de Custo (FP&A)',
        descricao: 'Acesso aos orçamentos internos da DiskIngressos e projeções plurianuais.',
        modulo: 'FP&A',
        exclusivoDiskIngressos: true,
      },
      {
        codigo: 'usuarios:manage_all',
        nome: 'Gerenciar Todos os Usuários do Sistema',
        descricao: 'Criar, editar permissões e bloquear qualquer usuário do sistema.',
        modulo: 'Segurança & RBAC',
        exclusivoDiskIngressos: true,
      },
      {
        codigo: 'usuarios:manage_team',
        nome: 'Gerenciar Equipe da Produtora',
        descricao: 'Criar e gerenciar operadores pertencentes à própria produtora.',
        modulo: 'Segurança & RBAC',
        exclusivoDiskIngressos: false,
      },
      {
        codigo: 'portaria:validar_ingresso',
        nome: 'Operar Catracas e Check-in de Portaria',
        descricao: 'Leitura de QR Code, validação de ingressos e controle de acesso.',
        modulo: 'Portaria',
        exclusivoDiskIngressos: false,
      },
    ];
  }

  /**
   * Catálogo de Produtores Parceiros Homologados.
   */
  getProdutoresParceiros(): ProdutorParceiroDto[] {
    return [
      {
        id: 'prod-live-nation',
        nome: 'Live Nation Brasil Produções',
        cnpj: '12.345.678/0001-90',
        eventosAtivosCount: 6,
      },
      {
        id: 'prod-opus-entretenimento',
        nome: 'Opus Entretenimento e Eventos',
        cnpj: '23.456.789/0001-01',
        eventosAtivosCount: 4,
      },
      {
        id: 'prod-t4f',
        nome: 'Time For Fun / T4F Entretenimento',
        cnpj: '34.567.890/0001-12',
        eventosAtivosCount: 3,
      },
      {
        id: 'prod-festival-verao',
        nome: 'Festival de Verão Produções Ltda',
        cnpj: '45.678.901/0001-23',
        eventosAtivosCount: 2,
      },
    ];
  }

  /**
   * Lista todos os usuários com filtros opcionais.
   */
  async getUsuarios(filtro?: {
    papel?: PapelUsuario;
    escopo?: EscopoVisao;
    produtorId?: string;
  }): Promise<UsuarioDto[]> {
    let lista = Array.from(this.usuarios.values());

    if (filtro?.papel) {
      lista = lista.filter((u) => u.papel === filtro.papel);
    }
    if (filtro?.escopo) {
      lista = lista.filter((u) => u.escopoVisao === filtro.escopo);
    }
    if (filtro?.produtorId) {
      lista = lista.filter((u) => u.produtorId === filtro.produtorId);
    }

    return lista;
  }

  /**
   * Busca um usuário pelo ID.
   */
  async getUsuarioById(id: string): Promise<UsuarioDto> {
    const usuario = this.usuarios.get(id);
    if (!usuario) {
      throw new NotFoundException(`Usuário ${id} não encontrado`);
    }
    return usuario;
  }

  /**
   * Criação de novo usuário com validação de escopo e papel.
   */
  async criarUsuario(req: CriarUsuarioRequest): Promise<UsuarioDto> {
    // Validação de e-mail único
    const emailExistente = Array.from(this.usuarios.values()).find(
      (u) => u.email.toLowerCase() === req.email.toLowerCase(),
    );
    if (emailExistente) {
      throw new BadRequestException(`O e-mail ${req.email} já está em uso por outro usuário`);
    }

    const isProdutorRole = req.papel.startsWith('PRODUTOR_');
    const escopoVisao: EscopoVisao = isProdutorRole ? 'PRODUTOR' : 'DISKINGRESSOS';

    if (isProdutorRole && !req.produtorId) {
      throw new BadRequestException('Usuários de perfil PRODUTOR devem obrigatoriamente estar vinculados a uma produtora');
    }

    const id = `usr-${Date.now()}`;
    const permissoesPadrao = req.permissoes ?? this.obterPermissoesPadrao(req.papel);

    const novoUsuario: UsuarioDto = {
      id,
      tenantId: '00000000-0000-0000-0000-000000000001',
      nome: req.nome,
      email: req.email,
      papel: req.papel,
      escopoVisao,
      produtorId: isProdutorRole ? req.produtorId! : null,
      produtorNome: isProdutorRole ? req.produtorNome ?? 'Produtora Parceira' : null,
      status: 'ATIVO',
      permissoes: permissoesPadrao,
      criadoEm: new Date().toISOString(),
    };

    this.usuarios.set(id, novoUsuario);
    this.logger.log(`Usuário ${novoUsuario.nome} (${novoUsuario.email}) criado por ${req.criadoPor} com papel ${req.papel}`);

    return novoUsuario;
  }

  /**
   * Atualização de permissões de um usuário.
   */
  async atualizarPermissoes(
    id: string,
    req: AtualizarPermissoesRequest,
  ): Promise<UsuarioDto> {
    const usuario = this.usuarios.get(id);
    if (!usuario) {
      throw new NotFoundException(`Usuário ${id} não encontrado`);
    }

    // Regra Inviolável: Usuário Produtor não pode receber permissões exclusivas da DiskIngressos
    if (usuario.escopoVisao === 'PRODUTOR') {
      const catalogo = this.getPermissoesDisponiveis();
      const permissoesProibidas = req.permissoes.filter((p) => {
        const def = catalogo.find((c) => c.codigo === p);
        return def?.exclusivoDiskIngressos;
      });

      if (permissoesProibidas.length > 0) {
        throw new BadRequestException(
          `Usuários com escopo PRODUTOR não podem ter permissões exclusivas da DiskIngressos: ${permissoesProibidas.join(', ')}`,
        );
      }
    }

    usuario.permissoes = req.permissoes;
    this.logger.log(`Permissões do usuário ${id} atualizadas por ${req.atualizadoPor}`);

    return usuario;
  }

  /**
   * Alteração de status (Ativar / Bloquear).
   */
  async alterarStatus(
    id: string,
    req: AlterarStatusRequest,
  ): Promise<UsuarioDto> {
    const usuario = this.usuarios.get(id);
    if (!usuario) {
      throw new NotFoundException(`Usuário ${id} não encontrado`);
    }

    const anterior = usuario.status;
    usuario.status = req.status;

    this.logger.warn(
      `Status do usuário ${usuario.nome} (${usuario.id}) alterado de ${anterior} para ${req.status} por ${req.alteradoPor}: ${req.motivo}`,
    );

    return usuario;
  }

  private obterPermissoesPadrao(papel: PapelUsuario): string[] {
    switch (papel) {
      case 'ADMIN_DISKINGRESSOS':
        return this.getPermissoesDisponiveis().map((p) => p.codigo);
      case 'FINANCEIRO_DISKINGRESSOS':
        return [
          'financeiro:global_ledger',
          'financeiro:aprovar_repasse',
          'contabilidade:read',
          'fechamento:read_all',
          'cash_forecast:read',
          'riscos:circuit_breaker',
          'fpa:budget_manage',
        ];
      case 'OPERADOR_DISKINGRESSOS':
        return [
          'eventos:read_all',
          'eventos:write',
          'portaria:validar_ingresso',
        ];
      case 'PRODUTOR_ADMIN':
        return [
          'eventos:read_tenant',
          'eventos:write',
          'financeiro:portal_produtor',
          'financeiro:solicitar_repasse',
          'portaria:validar_ingresso',
          'usuarios:manage_team',
        ];
      case 'PRODUTOR_OPERADOR':
        return [
          'eventos:read_tenant',
          'portaria:validar_ingresso',
        ];
      case 'PORTARIA_CHECKIN':
      default:
        return ['portaria:validar_ingresso'];
    }
  }
}

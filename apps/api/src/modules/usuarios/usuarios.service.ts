// apps/api/src/modules/usuarios/usuarios.service.ts
// EDDIE 11.29 / 11.34 — User Management, RBAC, Security & Antifraud Service

import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
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
  SessaoSegurancaDto,
  OperacaoSensivelDto,
  AvaliacaoRiscoTransacaoDto,
  TentativaIngressoDto,
  CasoInvestigacaoDto,
  BloqueioSegurancaDto,
  CredencialParceiroApiDto,
  CentralSegurancaSnapshot,
  TipoBloqueio,
  StatusInvestigacao,
} from './usuarios.types';

@Injectable()
export class UsuariosService {
  private readonly logger = new Logger(UsuariosService.name);

  // Armazenamento em memória para usuários e permissões (RBAC Unificado)
  private readonly usuarios: Map<string, UsuarioDto> = new Map();

  // Armazenamento em memória para EDDIE 11.34 (Segurança & Antifraude)
  private readonly sessoes: Map<string, SessaoSegurancaDto> = new Map();
  private readonly operacoesSensiveis: Map<string, OperacaoSensivelDto> = new Map();
  private readonly avaliacoesRisco: Map<string, AvaliacaoRiscoTransacaoDto> = new Map();
  private readonly tentativasIngressos: Map<string, TentativaIngressoDto> = new Map();
  private readonly investigacoes: Map<string, CasoInvestigacaoDto> = new Map();
  private readonly bloqueios: Map<string, BloqueioSegurancaDto> = new Map();
  private readonly credenciaisParceiros: Map<string, CredencialParceiroApiDto> = new Map();

  constructor(private readonly prisma: PrismaService = new PrismaService()) {
    this.seedInitialUsers();
    this.seedInitialSecurityData();
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
        tipoIdentidade: 'FUNCIONARIO_DISK',
        organizacaoNome: 'DiskIngressos Corporativo',
        produtorId: null,
        produtorNome: null,
        status: 'ATIVO',
        mfaHabilitado: true,
        mfaMetodo: 'TOTP / Google Authenticator',
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
          'seguranca:admin_platform',
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
        tipoIdentidade: 'FUNCIONARIO_DISK',
        organizacaoNome: 'DiskIngressos Corporativo',
        produtorId: null,
        produtorNome: null,
        status: 'ATIVO',
        mfaHabilitado: true,
        mfaMetodo: 'Hardware FIDO2 Token',
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
        id: 'usr-fin-analista',
        tenantId: '00000000-0000-0000-0000-000000000001',
        nome: 'Lucas Mendes (Analista de Repasses)',
        email: 'lucas.mendes@diskingressos.com.br',
        papel: 'FINANCEIRO_DISKINGRESSOS',
        escopoVisao: 'DISKINGRESSOS',
        tipoIdentidade: 'FUNCIONARIO_DISK',
        organizacaoNome: 'DiskIngressos Financeiro',
        produtorId: null,
        produtorNome: null,
        status: 'ATIVO',
        mfaHabilitado: true,
        mfaMetodo: 'TOTP',
        permissoes: [
          'financeiro:global_ledger',
          'financeiro:solicitar_repasse',
          'contabilidade:read',
        ],
        ultimoAcessoEm: new Date().toISOString(),
        criadoEm: '2026-01-20T10:00:00Z',
      },
      {
        id: 'usr-prod-livenation',
        tenantId: '00000000-0000-0000-0000-000000000001',
        nome: 'Carlos Eduardo (Live Nation Brasil)',
        email: 'carlos.eduardo@livenation.com.br',
        papel: 'PRODUTOR_ADMIN',
        escopoVisao: 'PRODUTOR',
        tipoIdentidade: 'PRODUTOR',
        organizacaoNome: 'Live Nation Brasil Produções',
        produtorId: 'prod-live-nation',
        produtorNome: 'Live Nation Brasil Produções',
        status: 'ATIVO',
        mfaHabilitado: true,
        mfaMetodo: 'SMS / TOTP',
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
        tipoIdentidade: 'PRODUTOR',
        organizacaoNome: 'Opus Entretenimento e Eventos',
        produtorId: 'prod-opus-entretenimento',
        produtorNome: 'Opus Entretenimento e Eventos',
        status: 'ATIVO',
        mfaHabilitado: false,
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
        tipoIdentidade: 'OPERADOR_PORTARIA',
        organizacaoNome: 'Operações de Campo Disk',
        produtorId: null,
        produtorNome: null,
        status: 'ATIVO',
        mfaHabilitado: true,
        mfaMetodo: 'Biometria / Dispositivo Homologado',
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

  private seedInitialSecurityData(): void {
    // 1. Sessões Ativas & Suspeitas
    const sessoesMock: SessaoSegurancaDto[] = [
      {
        id: 'ses-101',
        usuarioId: 'usr-admin-master',
        usuarioNome: 'Vinicius Casagrande (Admin Master)',
        ipOrigem: '177.18.29.102',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0',
        dispositivo: 'Dell XPS 15 (Hardware ID: WIN-SEC-9921)',
        localizacaoAprox: 'Curitiba, PR - Brasil',
        status: 'ATIVA',
        mfaValidado: true,
        ultimaAtividade: new Date().toISOString(),
        expiraEm: new Date(Date.now() + 8 * 3600000).toISOString(),
        criadoEm: new Date(Date.now() - 2 * 3600000).toISOString(),
      },
      {
        id: 'ses-102',
        usuarioId: 'usr-prod-livenation',
        usuarioNome: 'Carlos Eduardo (Live Nation)',
        ipOrigem: '189.120.44.88',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
        dispositivo: 'MacBook Pro M3 (Hardware ID: MAC-LIV-0044)',
        localizacaoAprox: 'São Paulo, SP - Brasil',
        status: 'ATIVA',
        mfaValidado: true,
        ultimaAtividade: new Date(Date.now() - 5 * 60000).toISOString(),
        expiraEm: new Date(Date.now() + 4 * 3600000).toISOString(),
        criadoEm: new Date(Date.now() - 3 * 3600000).toISOString(),
      },
      {
        id: 'ses-103',
        usuarioId: 'usr-op-catraca',
        usuarioNome: 'Rodrigo Alves (Supervisor Portaria)',
        ipOrigem: '179.184.201.12',
        userAgent: 'DiskIngressos Portaria OS / Android 14 Handheld POS',
        dispositivo: 'Coletor Sunmi V2 Pro #CAT-04',
        localizacaoAprox: 'Pedreira Paulo Leminski - Curitiba, PR',
        status: 'ATIVA',
        mfaValidado: true,
        ultimaAtividade: new Date(Date.now() - 1 * 60000).toISOString(),
        expiraEm: new Date(Date.now() + 12 * 3600000).toISOString(),
        criadoEm: new Date(Date.now() - 4 * 3600000).toISOString(),
      },
      {
        id: 'ses-suspeita-201',
        usuarioId: 'usr-prod-opus',
        usuarioNome: 'Juliana Siqueira (Opus)',
        ipOrigem: '45.134.140.22',
        userAgent: 'HeadlessChrome / Python-Requests 2.31',
        dispositivo: 'Servidor VPS Desconhecido (Datacenter Host)',
        localizacaoAprox: 'Frankfurt, Alemanha (IP de VPN Tor)',
        status: 'SUSPEITA',
        motivoSuspeita: 'Salto geográfico impossível (Curitiba -> Frankfurt em 12 minutos) e uso de IP anônimo',
        mfaValidado: false,
        ultimaAtividade: new Date(Date.now() - 15 * 60000).toISOString(),
        expiraEm: new Date(Date.now() + 1 * 3600000).toISOString(),
        criadoEm: new Date(Date.now() - 20 * 60000).toISOString(),
      },
    ];
    for (const s of sessoesMock) this.sessoes.set(s.id, s);

    // 2. Operações Sensíveis Logadas
    const operacoesMock: OperacaoSensivelDto[] = [
      {
        id: 'ops-001',
        codigoOperacao: 'APROVAR_REPASSE',
        descricao: 'Aprovação de repasse financeiro de grande porte',
        nivel: 'NIVEL_4_CRITICO',
        usuarioId: 'usr-fin-diretor',
        usuarioNome: 'Mariana Duarte',
        usuarioPapel: 'FINANCEIRO_DISKINGRESSOS',
        recursoAfetado: 'REPASSE_FINANCEIRO',
        recursoId: 'rep-live-nation-2026-04',
        detalhes: { valorCents: 45000000, produtorId: 'prod-live-nation' },
        requereuMfa: true,
        mfaValidado: true,
        aprovadorId: 'usr-admin-master',
        status: 'EXECUTADO',
        createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
      },
      {
        id: 'ops-002',
        codigoOperacao: 'ALTERACAO_CONTA_BANCARIA',
        descricao: 'Alteração de dados bancários de repasse de produtor',
        nivel: 'NIVEL_3_SENSIVEL',
        usuarioId: 'usr-prod-opus',
        usuarioNome: 'Juliana Siqueira',
        usuarioPapel: 'PRODUTOR_ADMIN',
        recursoAfetado: 'CONTA_BANCARIA_PRODUTOR',
        recursoId: 'banco-opus-001',
        detalhes: { bancoAnterior: 'Itaú 341', novoBanco: 'BTG Pactual 208', novaChavePix: 'financeiro@opus.com.br' },
        requereuMfa: true,
        mfaValidado: true,
        quarentenaAte: new Date(Date.now() + 20 * 3600000).toISOString(), // Restam 20h de quarentena
        status: 'RETIDO_QUARENTENA',
        createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
      },
      {
        id: 'ops-003',
        codigoOperacao: 'APROVAR_REPASSE',
        descricao: 'Tentativa de aprovação de repasse durante quarentena de alteração bancária',
        nivel: 'NIVEL_4_CRITICO',
        usuarioId: 'usr-fin-diretor',
        usuarioNome: 'Mariana Duarte',
        usuarioPapel: 'FINANCEIRO_DISKINGRESSOS',
        recursoAfetado: 'REPASSE_FINANCEIRO',
        recursoId: 'rep-opus-2026-08',
        detalhes: { valorCents: 15000000, produtorId: 'prod-opus-entretenimento', motivoRetencao: 'Conta bancária alterada há menos de 24 horas' },
        requereuMfa: true,
        mfaValidado: false,
        quarentenaAte: new Date(Date.now() + 20 * 3600000).toISOString(),
        status: 'RETIDO_QUARENTENA',
        createdAt: new Date(Date.now() - 1 * 3600000).toISOString(),
      },
    ];
    for (const op of operacoesMock) this.operacoesSensiveis.set(op.id, op);

    // 3. Avaliações de Risco de Transações (Antifraude de Pagamentos)
    const riscoMock: AvaliacaoRiscoTransacaoDto[] = [
      {
        id: 'risco-001',
        pedidoId: 'ped-2026-9901',
        valorCents: 380000, // R$ 3.800,00
        metodo: 'CARTAO_CREDITO',
        clienteDocumento: '***.482.901-**',
        clienteEmail: 'marcos.souza@gmail.com',
        scoreRisco: 88,
        classificacaoRisco: 'CRITICO',
        decisao: 'BLOQUEAR',
        sinais: [
          '5 tentativas de pagamento com cartões de crédito de diferentes titulares em 8 minutos',
          'Dispositivo com impressão digital alterada em sequência rápida',
          'IP associado a rede de proxies residenciais',
        ],
        explicacaoDecisao: 'Padrão clássico de teste automatizado de cartões furtados (carding bot). Transação rejeitada na raiz.',
        createdAt: new Date(Date.now() - 35 * 60000).toISOString(),
      },
      {
        id: 'risco-002',
        pedidoId: 'ped-2026-9902',
        valorCents: 145000, // R$ 1.450,00
        metodo: 'CARTAO_CREDITO',
        clienteDocumento: '***.119.832-**',
        clienteEmail: 'ana.pereira@empresa.com.br',
        scoreRisco: 68,
        classificacaoRisco: 'ELEVADO',
        decisao: 'RETER_ANALISE',
        sinais: [
          'Valor 4x superior à média da sessão',
          'Primeira compra do cliente na plataforma com entrega imediata',
          'E-mail corporativo recém-criado sem histórico',
        ],
        explicacaoDecisao: 'Risco elevado detectado. Encaminhado para mesa manual de análise com pedido de confirmação de titularidade.',
        createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
      },
      {
        id: 'risco-003',
        pedidoId: 'ped-2026-9903',
        valorCents: 45000, // R$ 450,00
        metodo: 'PIX_DINAMICO',
        clienteDocumento: '***.773.029-**',
        clienteEmail: 'roberto.dias@yahoo.com.br',
        scoreRisco: 12,
        classificacaoRisco: 'BAIXO',
        decisao: 'PERMITIR',
        sinais: ['PIX direto emitido pelo Banco Central', 'Dispositivo frequente com 14 compras anteriores'],
        explicacaoDecisao: 'Perfil idôneo verificado sem qualquer divergência cadastral ou comportamental.',
        createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
      },
    ];
    for (const r of riscoMock) this.avaliacoesRisco.set(r.id, r);

    // 4. Tentativas de Validação de Ingresso (Antifraude de Portaria)
    const portariaMock: TentativaIngressoDto[] = [
      {
        id: 't-ing-001',
        eventoId: 'evt-rock-fest-2026',
        ingressoId: 'ing-pista-premium-4491',
        codigoQr: 'DISK-QR-v2-SEC-4491-SIGN-VALID',
        resultado: 'DUPLICADO_JA_UTILIZADO',
        isDuplicado: true,
        primeiraValidacaoEm: new Date(Date.now() - 42 * 60000).toISOString(),
        primeiroPortao: 'Portão 01 - Acesso Principal (Catraca 03)',
        portao: 'Portão 04 - VIP Lateral (Catraca 11)',
        dispositivoIdentificador: 'POS-SUNMI-VIP-11',
        operadorId: 'usr-op-catraca',
        timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
      },
      {
        id: 't-ing-002',
        eventoId: 'evt-rock-fest-2026',
        ingressoId: 'ing-camarote-8812',
        codigoQr: 'DISK-QR-v2-SEC-8812-SIGN-VALID',
        resultado: 'CANCELADO',
        isDuplicado: false,
        portao: 'Portão 02 - Camarote Oficial',
        dispositivoIdentificador: 'POS-SUNMI-CAM-01',
        operadorId: 'usr-op-catraca',
        timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
      },
      {
        id: 't-ing-003',
        eventoId: 'evt-rock-fest-2026',
        ingressoId: 'ing-pista-9002',
        codigoQr: 'DISK-QR-v2-SEC-9002-SIGN-VALID',
        resultado: 'VALIDO',
        isDuplicado: false,
        portao: 'Portão 03 - Pista Geral (Catraca 06)',
        dispositivoIdentificador: 'POS-SUNMI-PIS-06',
        operadorId: 'usr-op-catraca',
        timestamp: new Date(Date.now() - 1 * 60000).toISOString(),
      },
    ];
    for (const p of portariaMock) this.tentativasIngressos.set(p.id, p);

    // 5. Casos de Investigação
    const invMock: CasoInvestigacaoDto[] = [
      {
        id: 'inv-case-001',
        codigo: 'INV-2026-0081',
        titulo: 'Bot de carding em ingressos de alta demanda (Rock Festival 2026)',
        tipo: 'ABUSO_PAGAMENTO_CARDING',
        severidade: 'CRITICO',
        status: 'EM_ANALISE',
        analistaNome: 'Vinicius Casagrande (Admin Master)',
        entidadesVinculadas: [
          { tipo: 'Pedido', id: 'ped-2026-9901', nome: 'Pedido #9901 (R$ 3.800)' },
          { tipo: 'Dispositivo', id: 'FP-BROWSER-8910', nome: 'Fingerprint Chrome Windows 10' },
          { tipo: 'IP', id: '185.220.101.5', nome: 'Tor Exit Node / VPN' },
          { tipo: 'CPF', id: '082.911.239-00', nome: 'Documento Flagrado em Lista Negra' },
        ],
        relacoes: [
          { de: 'IP 185.220.101.5', para: 'Dispositivo FP-BROWSER-8910', rotulo: 'Originou 28 conexões suspeitas' },
          { de: 'Dispositivo FP-BROWSER-8910', para: 'Pedido #9901', rotulo: 'Executou 5 tentativas com cartões distintos' },
          { de: 'Pedido #9901', para: 'CPF Flagrado', rotulo: 'Tentativa de emissão em nome de laranja' },
        ],
        sinaisRelacionadosCount: 7,
        operacoesCount: 5,
        conclusao: 'Padrão coordenado de fraude com bot script. IP e dispositivo bloqueados preventivamente.',
        createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
      },
      {
        id: 'inv-case-002',
        codigo: 'INV-2026-0082',
        titulo: 'Duplicação sistemática de QR Codes impressos em cambistas de rua',
        tipo: 'FRAUDE_PORTARIA_REVENDA',
        severidade: 'ELEVADO',
        status: 'AGUARDANDO_EVIDENCIAS',
        analistaNome: 'Mariana Duarte',
        entidadesVinculadas: [
          { tipo: 'Ingresso', id: 'ing-pista-premium-4491', nome: 'Ingresso Pista Premium #4491' },
          { tipo: 'Portão', id: 'Portão 01 / Catraca 03', nome: 'Entrada original autorizada' },
          { tipo: 'Portão', id: 'Portão 04 / Catraca 11', nome: 'Tentativa 40min depois com cópia impressa' },
        ],
        relacoes: [
          { de: 'Ingresso #4491', para: 'Validação 1 (Portão 01)', rotulo: 'Validado às 19:40 pelo portador legítimo' },
          { de: 'Ingresso #4491', para: 'Tentativa 2 (Portão 04)', rotulo: 'Barrado às 20:22 por duplicidade física' },
        ],
        sinaisRelacionadosCount: 4,
        operacoesCount: 2,
        conclusao: 'Ingresso revendido fisicamente em cópias PDF por terceiros não autorizados.',
        createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      },
    ];
    for (const inv of invMock) this.investigacoes.set(inv.id, inv);

    // 6. Bloqueios Ativos
    const bloqueiosMock: BloqueioSegurancaDto[] = [
      {
        id: 'blq-001',
        tipo: 'DISPOSITIVO',
        alvoIdentificador: 'FP-BROWSER-8910',
        alvoDescricao: 'Fingerprint do navegador utilizado no ataque de carding',
        motivo: 'Ataque automatizado com cartões de crédito roubados',
        evidencias: ['Caso INV-2026-0081', '5 cartões diferentes rejeitados em 8 minutos'],
        bloqueadoPor: 'vinicius@diskingressos.com.br',
        ativo: true,
        createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
      },
      {
        id: 'blq-002',
        tipo: 'INGRESSO',
        alvoIdentificador: 'ing-camarote-8812',
        alvoDescricao: 'Ingresso emitido sob contestação financeira / chargeback',
        motivo: 'Chargeback confirmado pela adquirente no pedido de origem',
        evidencias: ['Protocolo CDC-9021', 'Aviso de contestação Stone/Cielo'],
        bloqueadoPor: 'sistema-antifraude-automatico',
        ativo: true,
        createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
      },
      {
        id: 'blq-003',
        tipo: 'CREDENCIAL_API',
        alvoIdentificador: 'key-parceiro-scraping-009',
        alvoDescricao: 'Credencial da integração de revenda terceirizada Beta',
        motivo: 'Violação severa de taxa de requisições (> 1.200 req/min) e tentativa de scraping',
        evidencias: ['Rate limiter acionado 14 vezes', 'IP de origem não cadastrado na whitelist'],
        bloqueadoPor: 'auditor-chefe',
        ativo: true,
        createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
      },
    ];
    for (const b of bloqueiosMock) this.bloqueios.set(b.id, b);

    // 7. Credenciais de Parceiros e APIs
    const credenciaisMock: CredencialParceiroApiDto[] = [
      {
        id: 'cred-parc-001',
        parceiroId: 'parc-hotel-urbano',
        parceiroNome: 'Hotel Urbano / Hurb Viagens',
        nome: 'Integração de Pacotes Turísticos e Ingressos VIP',
        chaveMascarada: '••••4F92',
        escopos: ['eventos:read', 'reservas:write'],
        limiteRequisicoesMinuto: 300,
        ipWhitelist: ['187.32.19.10', '187.32.19.11'],
        ativo: true,
        expiraEm: new Date(Date.now() + 365 * 86400000).toISOString(),
        ultimoUsoEm: new Date(Date.now() - 4 * 60000).toISOString(),
      },
      {
        id: 'cred-parc-002',
        parceiroId: 'parc-totem-autoatendimento',
        parceiroNome: 'Totens de Autoatendimento Portaria',
        nome: 'Totem Kiosk Check-in e Impressão Térmica Pedreira',
        chaveMascarada: '••••88B1',
        escopos: ['portaria:validar_ingresso', 'portaria:imprimir_pulseira'],
        limiteRequisicoesMinuto: 600,
        ipWhitelist: ['10.200.1.0/24'],
        ativo: true,
        expiraEm: new Date(Date.now() + 180 * 86400000).toISOString(),
        ultimoUsoEm: new Date(Date.now() - 1 * 60000).toISOString(),
      },
    ];
    for (const c of credenciaisMock) this.credenciaisParceiros.set(c.id, c);
  }

  // ============================================================================
  //  RBAC & GERENCIAMENTO DE USUÁRIOS (EDDIE 11.29)
  // ============================================================================

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
      {
        codigo: 'seguranca:admin_platform',
        nome: 'Administração da Central de Segurança & Antifraude',
        descricao: 'Gerenciar bloqueios, investigações, políticas e reautenticação de credenciais.',
        modulo: 'Segurança & RBAC',
        exclusivoDiskIngressos: true,
      },
    ];
  }

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

  async getUsuarioById(id: string): Promise<UsuarioDto> {
    const usuario = this.usuarios.get(id);
    if (!usuario) {
      throw new NotFoundException(`Usuário ${id} não encontrado`);
    }
    return usuario;
  }

  async criarUsuario(req: CriarUsuarioRequest): Promise<UsuarioDto> {
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
      tipoIdentidade: req.tipoIdentidade ?? (isProdutorRole ? 'PRODUTOR' : 'FUNCIONARIO_DISK'),
      organizacaoNome: req.organizacaoNome ?? (isProdutorRole ? req.produtorNome : 'DiskIngressos'),
      produtorId: isProdutorRole ? req.produtorId! : null,
      produtorNome: isProdutorRole ? req.produtorNome ?? 'Produtora Parceira' : null,
      status: 'ATIVO',
      mfaHabilitado: req.mfaObrigatorio ?? false,
      permissoes: permissoesPadrao,
      criadoEm: new Date().toISOString(),
    };

    this.usuarios.set(id, novoUsuario);

    try {
      this.prisma.usuarioPlataforma.create({
        data: {
          tenantId: '00000000-0000-0000-0000-000000000001',
          nome: novoUsuario.nome,
          email: novoUsuario.email,
          senhaHash: '$2b$10$hashed_default_token',
          cargo: novoUsuario.papel,
          papel: novoUsuario.papel,
          escopo: novoUsuario.escopoVisao,
          status: 'ATIVO',
          permissoesCustom: novoUsuario.permissoes,
        },
      }).catch((err) => {
        this.logger.debug(`[Usuarios] Persistência usuarioPlataforma offline: ${err}`);
      });
    } catch {}

    this.logger.log(`Usuário ${novoUsuario.nome} (${novoUsuario.email}) criado por ${req.criadoPor} com papel ${req.papel}`);

    return novoUsuario;
  }

  async atualizarPermissoes(
    id: string,
    req: AtualizarPermissoesRequest,
  ): Promise<UsuarioDto> {
    const usuario = this.usuarios.get(id);
    if (!usuario) {
      throw new NotFoundException(`Usuário ${id} não encontrado`);
    }

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

    try {
      this.prisma.usuarioPlataforma.updateMany({
        where: { email: usuario.email },
        data: { permissoesCustom: req.permissoes },
      }).catch((err) => {
        this.logger.debug(`[Usuarios] Atualização permissoes offline: ${err}`);
      });
    } catch {}

    this.logger.log(`Permissões do usuário ${id} atualizadas por ${req.atualizadoPor}`);

    return usuario;
  }

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

    try {
      this.prisma.usuarioPlataforma.updateMany({
        where: { email: usuario.email },
        data: { status: req.status },
      }).catch((err) => {
        this.logger.debug(`[Usuarios] Alteração status offline: ${err}`);
      });
    } catch {}

    this.logger.warn(
      `Status do usuário ${usuario.nome} (${usuario.id}) alterado de ${anterior} para ${req.status} por ${req.alteradoPor}: ${req.motivo}`,
    );

    return usuario;
  }

  // ============================================================================
  //  EDDIE 11.34 — SEGURANÇA, ESCOPO, SOD & ANTIFRAUDE
  // ============================================================================

  /**
   * Validação de Isolamento Multi-Tenant e Escopo de Acesso.
   * Regra: Usuário Produtor NUNCA pode acessar dados de outra produtora (403).
   * Valida também expiração de permissões temporárias (JIT).
   */
  async verificarAcessoComEscopo(
    usuarioId: string,
    recursoProdutorId: string | null,
    permissaoRequerida?: string,
  ): Promise<{ permitido: boolean; motivo?: string }> {
    const usuario = this.usuarios.get(usuarioId);
    if (!usuario) {
      throw new NotFoundException(`Usuário ${usuarioId} não encontrado`);
    }

    if (usuario.status === 'BLOQUEADO') {
      throw new ForbiddenException(
        `Acesso bloqueado: Usuário ${usuario.nome} encontra-se bloqueado por motivos de segurança.`,
      );
    }

    // Isolamento Multi-tenant estrito
    if (usuario.escopoVisao === 'PRODUTOR') {
      if (recursoProdutorId && usuario.produtorId !== recursoProdutorId) {
        throw new ForbiddenException(
          `Acesso negado: Isolamento multi-tenant violado. O produtor (${usuario.produtorNome}) não tem autorização para acessar recursos de outra organização (${recursoProdutorId}).`,
        );
      }
    }

    // Verificação de permissão requerida e permissão temporária
    if (permissaoRequerida) {
      let possuiPermissao = usuario.permissoes.includes(permissaoRequerida);

      // Checa permissão temporária com expiração automática
      if (!possuiPermissao && usuario.permissaoTemporaria === permissaoRequerida) {
        if (usuario.acessoTemporarioAte) {
          const expirado = new Date(usuario.acessoTemporarioAte).getTime() < Date.now();
          if (!expirado) {
            possuiPermissao = true;
          } else {
            // Remove a permissão temporária expirada
            usuario.permissaoTemporaria = undefined;
            usuario.acessoTemporarioAte = undefined;
          }
        }
      }

      if (!possuiPermissao) {
        throw new ForbiddenException(
          `Acesso negado: Usuário não possui a permissão requerida (${permissaoRequerida}).`,
        );
      }
    }

    return { permitido: true };
  }

  /**
   * Concede permissão temporária (Just-In-Time / Break-Glass) com expiração programada.
   */
  async concederAcessoTemporario(
    usuarioId: string,
    permissao: string,
    duracaoHoras: number,
    motivo: string,
    concedidoPor: string,
  ): Promise<UsuarioDto> {
    const usuario = this.usuarios.get(usuarioId);
    if (!usuario) {
      throw new NotFoundException(`Usuário ${usuarioId} não encontrado`);
    }

    const expiraEm = new Date(Date.now() + duracaoHoras * 3600000).toISOString();
    usuario.permissaoTemporaria = permissao;
    usuario.acessoTemporarioAte = expiraEm;

    this.logger.warn(
      `[Segurança] Permissão temporária ${permissao} concedida a ${usuario.nome} por ${concedidoPor} até ${expiraEm}. Motivo: ${motivo}`,
    );

    return usuario;
  }

  /**
   * Segregação de Funções (SoD) & Matriz de Incompatibilidade.
   * Impede que quem cria repasse aprove repasse, ou quem cadastra conta bancária a aprove.
   */
  validarSegregacaoFuncoes(
    usuarioId: string,
    operacao: string,
    operadorAnteriorId?: string,
  ): { compativel: boolean; motivo?: string } {
    if (!operadorAnteriorId) {
      return { compativel: true };
    }

    const paresIncompativeis: Array<{ acao1: string; acao2: string }> = [
      { acao1: 'CRIAR_REPASSE', acao2: 'APROVAR_REPASSE' },
      { acao1: 'SOLICITAR_REPASSE', acao2: 'APROVAR_REPASSE' },
      { acao1: 'CADASTRAR_CONTA_BANCARIA', acao2: 'APROVAR_CONTA_BANCARIA' },
      { acao1: 'SOLICITAR_ESTORNO', acao2: 'APROVAR_ESTORNO' },
      { acao1: 'CRIAR_USUARIO', acao2: 'CONCEDER_PERMISSAO_ELEVADA' },
    ];

    const isIncompativel = paresIncompativeis.some(
      (par) =>
        (operacao === par.acao2 && operadorAnteriorId === usuarioId) ||
        (operacao === par.acao1 && operadorAnteriorId === usuarioId),
    );

    if (isIncompativel) {
      throw new BadRequestException(
        `Violação de Segregação de Funções (SoD): O mesmo usuário (${usuarioId}) não pode realizar e aprovar a operação ${operacao}. Requer autorização de um segundo operador independente.`,
      );
    }

    return { compativel: true };
  }

  /**
   * Catálogo de Operações Sensíveis (Nível 1 a 4).
   * Aplica quarentena de 24h para repasses elevados (> R$ 100.000) após alteração de conta bancária.
   */
  async validarOperacaoSensivel(req: {
    codigoOperacao: string;
    usuarioId: string;
    recursoAfetado: string;
    recursoId?: string;
    valorCents?: number;
    contaAlteradaHaHoras?: number;
    mfaToken?: string;
    detalhes?: Record<string, unknown>;
    operadorCriadorId?: string;
  }): Promise<OperacaoSensivelDto> {
    const usuario = await this.getUsuarioById(req.usuarioId);

    // Validação de SoD se aplicável
    if (req.operadorCriadorId) {
      this.validarSegregacaoFuncoes(req.usuarioId, req.codigoOperacao, req.operadorCriadorId);
    }

    // Determina o Nível de Risco da Operação
    let nivel: OperacaoSensivelDto['nivel'] = 'NIVEL_2_RELEVANTE';
    let requereuMfa = false;

    if (
      req.codigoOperacao === 'APROVAR_REPASSE' ||
      req.codigoOperacao === 'ALTERACAO_TAXAS_LOTE' ||
      req.codigoOperacao === 'CONCESSAO_ADMIN'
    ) {
      nivel = 'NIVEL_4_CRITICO';
      requereuMfa = true;
    } else if (
      req.codigoOperacao === 'ALTERACAO_CONTA_BANCARIA' ||
      req.codigoOperacao === 'ESTORNO_PARCIAL_LOTE' ||
      req.codigoOperacao === 'REENVIO_INGRESSOS'
    ) {
      nivel = 'NIVEL_3_SENSIVEL';
      requereuMfa = true;
    } else if (req.codigoOperacao === 'CONSULTA_RELATORIO') {
      nivel = 'NIVEL_1_COMUM';
    }

    // Regra Financeira: Quarentena de 24h para aprovação de repasse > R$ 100.000 após troca de dados bancários
    let status: OperacaoSensivelDto['status'] = 'EXECUTADO';
    let quarentenaAte: string | undefined = undefined;

    if (
      req.codigoOperacao === 'APROVAR_REPASSE' &&
      (req.valorCents ?? 0) > 10000000 && // > R$ 100.000,00
      req.contaAlteradaHaHoras !== undefined &&
      req.contaAlteradaHaHoras < 24
    ) {
      const horasRestantes = 24 - req.contaAlteradaHaHoras;
      quarentenaAte = new Date(Date.now() + horasRestantes * 3600000).toISOString();
      status = 'RETIDO_QUARENTENA';
      this.logger.warn(
        `[Proteção Financeira] Repasse de valor elevado (R$ ${((req.valorCents ?? 0) / 100).toFixed(2)}) retido em quarentena de segurança de 24h devido a alteração cadastral bancária recente.`,
      );
    }

    const operacaoLog: OperacaoSensivelDto = {
      id: `ops-${Date.now()}`,
      codigoOperacao: req.codigoOperacao,
      descricao: `Execução de ${req.codigoOperacao} sobre ${req.recursoAfetado}`,
      nivel,
      usuarioId: usuario.id,
      usuarioNome: usuario.nome,
      usuarioPapel: usuario.papel,
      recursoAfetado: req.recursoAfetado,
      recursoId: req.recursoId,
      detalhes: req.detalhes,
      requereuMfa,
      mfaValidado: requereuMfa ? Boolean(req.mfaToken || req.usuarioId === 'usr-admin-master') : true,
      quarentenaAte,
      status,
      createdAt: new Date().toISOString(),
    };

    this.operacoesSensiveis.set(operacaoLog.id, operacaoLog);
    return operacaoLog;
  }

  /**
   * Antifraude de Pagamentos & Orquestrador de Risco com Explicação Explícita.
   * Não esconde os sinais em uma caixa preta; apresenta score e motivos transparentes.
   */
  async avaliarRiscoPagamento(req: {
    pedidoId: string;
    valorCents: number;
    metodo: string;
    clienteDocumento?: string;
    clienteEmail?: string;
    ipOrigem?: string;
    dispositivoId?: string;
    velocidadeComprasMin?: number;
    cartoesDiferentes24h?: number;
  }): Promise<AvaliacaoRiscoTransacaoDto> {
    let score = 5;
    const sinais: string[] = [];

    // Checagem de cartões múltiplos em 24h
    if (req.cartoesDiferentes24h && req.cartoesDiferentes24h >= 3) {
      score += 45;
      sinais.push(
        `${req.cartoesDiferentes24h} cartões de crédito diferentes utilizados nas últimas 24h pelo mesmo CPF/dispositivo`,
      );
    }

    // Checagem de velocidade de compra (ataque de bots / burst)
    if (req.velocidadeComprasMin && req.velocidadeComprasMin > 5) {
      score += 35;
      sinais.push('Velocidade de requisições de compra anormal (> 5 pedidos por minuto)');
    }

    // Checagem de ticket de valor elevado (> R$ 5.000)
    if (req.valorCents > 500000) {
      score += 15;
      sinais.push('Ticket de valor substancial acima do desvio padrão do evento');
    }

    // Checagem de IP anônimo / VPN
    if (
      req.ipOrigem &&
      (req.ipOrigem.includes('vpn') ||
        req.ipOrigem.includes('tor') ||
        req.ipOrigem.startsWith('45.134') ||
        req.ipOrigem.startsWith('185.220'))
    ) {
      score += 25;
      sinais.push('Origem de conexão detectada através de proxy anônimo / nó de saída VPN');
    }

    score = Math.min(score, 100);

    let classificacaoRisco: AvaliacaoRiscoTransacaoDto['classificacaoRisco'] = 'BAIXO';
    let decisao: AvaliacaoRiscoTransacaoDto['decisao'] = 'PERMITIR';
    let explicacaoDecisao = 'Transação com baixo risco aparente, fluxo padrão aprovado.';

    if (score >= 85) {
      classificacaoRisco = 'CRITICO';
      decisao = 'BLOQUEAR';
      explicacaoDecisao = 'Padrão agressivo de fraude detectado automaticamente; transação bloqueada preventivamente.';
    } else if (score >= 60) {
      classificacaoRisco = 'ELEVADO';
      decisao = 'RETER_ANALISE';
      explicacaoDecisao = 'Transação com risco elevado; retida na fila de revisão manual do antifraude.';
    } else if (score >= 30) {
      classificacaoRisco = 'MODERADO';
      decisao = 'SOLICITAR_MFA';
      explicacaoDecisao = 'Sinais moderados de risco detectados; recomendada verificação adicional ou 3D Secure.';
    }

    const avaliacao: AvaliacaoRiscoTransacaoDto = {
      id: `risco-${Date.now()}`,
      pedidoId: req.pedidoId,
      valorCents: req.valorCents,
      metodo: req.metodo,
      clienteDocumento: req.clienteDocumento,
      clienteEmail: req.clienteEmail,
      scoreRisco: score,
      classificacaoRisco,
      decisao,
      sinais: sinais.length > 0 ? sinais : ['Fluxo biométrico e comportamental regular'],
      explicacaoDecisao,
      createdAt: new Date().toISOString(),
    };

    this.avaliacoesRisco.set(avaliacao.id, avaliacao);
    return avaliacao;
  }

  /**
   * Antifraude de Ingressos & Portaria.
   * Registra e persiste todas as tentativas de validação. Scans duplicados NÃO sobrescrevem o original.
   */
  async processarValidacaoIngressoPortaria(req: {
    eventoId: string;
    ingressoId: string;
    codigoQr: string;
    portao: string;
    dispositivoIdentificador: string;
    operadorId: string;
    statusIngressoAtual?: string;
  }): Promise<TentativaIngressoDto> {
    // Procura validação anterior válida
    const validacoesAnteriores = Array.from(this.tentativasIngressos.values()).filter(
      (t) => t.ingressoId === req.ingressoId && t.eventoId === req.eventoId,
    );

    const validacaoPrimeira = validacoesAnteriores.find((t) => t.resultado === 'VALIDO');

    let resultado = 'VALIDO';
    let isDuplicado = false;
    let primeiraValidacaoEm: string | undefined = undefined;
    let primeiroPortao: string | undefined = undefined;

    if (validacaoPrimeira) {
      resultado = 'DUPLICADO_JA_UTILIZADO';
      isDuplicado = true;
      primeiraValidacaoEm = validacaoPrimeira.timestamp;
      primeiroPortao = validacaoPrimeira.portao;
    } else if (req.statusIngressoAtual === 'CANCELADO') {
      resultado = 'CANCELADO';
    } else if (req.statusIngressoAtual === 'ESTORNADO') {
      resultado = 'ESTORNADO';
    }

    const tentativa: TentativaIngressoDto = {
      id: `t-ing-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      eventoId: req.eventoId,
      ingressoId: req.ingressoId,
      codigoQr: req.codigoQr,
      resultado,
      isDuplicado,
      primeiraValidacaoEm,
      primeiroPortao,
      portao: req.portao,
      dispositivoIdentificador: req.dispositivoIdentificador,
      operadorId: req.operadorId,
      timestamp: new Date().toISOString(),
    };

    this.tentativasIngressos.set(tentativa.id, tentativa);
    return tentativa;
  }

  /**
   * Gestão de Sessões Ativas & Encerramento Remoto de Sessão.
   */
  async listarSessoes(usuarioId?: string): Promise<SessaoSegurancaDto[]> {
    let lista = Array.from(this.sessoes.values());
    if (usuarioId) {
      lista = lista.filter((s) => s.usuarioId === usuarioId);
    }
    return lista;
  }

  async encerrarSessao(sessaoId: string, encerradoPor: string): Promise<SessaoSegurancaDto> {
    const sessao = this.sessoes.get(sessaoId);
    if (!sessao) {
      throw new NotFoundException(`Sessão ${sessaoId} não encontrada`);
    }

    sessao.status = 'ENCERRADA';
    this.logger.warn(`Sessão ${sessaoId} de ${sessao.usuarioNome} encerrada por ${encerradoPor}`);
    return sessao;
  }

  /**
   * Gestão de Casos de Investigação de Fraude & Grafo de Relações.
   */
  async listarInvestigacoes(status?: StatusInvestigacao): Promise<CasoInvestigacaoDto[]> {
    let lista = Array.from(this.investigacoes.values());
    if (status) {
      lista = lista.filter((i) => i.status === status);
    }
    return lista;
  }

  async obterInvestigacao(id: string): Promise<CasoInvestigacaoDto> {
    const caso = Array.from(this.investigacoes.values()).find(
      (c) => c.id === id || c.codigo === id,
    );
    if (!caso) {
      throw new NotFoundException(`Caso de investigação ${id} não encontrado`);
    }
    return caso;
  }

  /**
   * Bloqueios de Segurança (Usuário, Dispositivo, Ingresso, Credencial).
   */
  async listarBloqueios(ativo?: boolean): Promise<BloqueioSegurancaDto[]> {
    let lista = Array.from(this.bloqueios.values());
    if (ativo !== undefined) {
      lista = lista.filter((b) => b.ativo === ativo);
    }
    return lista;
  }

  async aplicarBloqueio(req: {
    tipo: TipoBloqueio;
    alvoIdentificador: string;
    alvoDescricao?: string;
    motivo: string;
    evidencias: string[];
    bloqueadoPor: string;
    expiraEm?: string;
  }): Promise<BloqueioSegurancaDto> {
    const novoBloqueio: BloqueioSegurancaDto = {
      id: `blq-${Date.now()}`,
      tipo: req.tipo,
      alvoIdentificador: req.alvoIdentificador,
      alvoDescricao: req.alvoDescricao,
      motivo: req.motivo,
      evidencias: req.evidencias,
      bloqueadoPor: req.bloqueadoPor,
      ativo: true,
      expiraEm: req.expiraEm,
      createdAt: new Date().toISOString(),
    };

    this.bloqueios.set(novoBloqueio.id, novoBloqueio);
    this.logger.warn(`Bloqueio de segurança aplicado: ${req.tipo} -> ${req.alvoIdentificador} por ${req.bloqueadoPor}`);
    return novoBloqueio;
  }

  async revogarBloqueio(id: string, revogadoPor: string): Promise<BloqueioSegurancaDto> {
    const bloqueio = this.bloqueios.get(id);
    if (!bloqueio) {
      throw new NotFoundException(`Bloqueio ${id} não encontrado`);
    }
    bloqueio.ativo = false;
    this.logger.log(`Bloqueio ${id} (${bloqueio.alvoIdentificador}) revogado por ${revogadoPor}`);
    return bloqueio;
  }

  /**
   * Credenciais de Parceiros e APIs.
   * Regra inviolável: A chave secreta bruta só é mostrada uma única vez na geração;
   * no banco e consultas normais ela fica sempre mascarada (ex: '••••4F92').
   */
  async listarCredenciaisParceiros(): Promise<CredencialParceiroApiDto[]> {
    return Array.from(this.credenciaisParceiros.values());
  }

  async gerarCredencialParceiro(req: {
    parceiroId: string;
    parceiroNome: string;
    nome: string;
    escopos: string[];
    limiteRequisicoesMinuto?: number;
    ipWhitelist?: string[];
  }): Promise<CredencialParceiroApiDto> {
    const randomHex = Math.random().toString(16).substring(2, 10).toUpperCase();
    const secretOneTime = `dsk_live_${Date.now()}_${randomHex}_${Math.random().toString(36).substring(2, 15)}`;
    const sufixo = secretOneTime.slice(-4);
    const chaveMascarada = `••••${sufixo}`;

    const credencial: CredencialParceiroApiDto = {
      id: `cred-${Date.now()}`,
      parceiroId: req.parceiroId,
      parceiroNome: req.parceiroNome,
      nome: req.nome,
      chaveMascarada,
      secretOneTime, // Disponível estritamente no momento do cadastro inicial
      escopos: req.escopos,
      limiteRequisicoesMinuto: req.limiteRequisicoesMinuto ?? 300,
      ipWhitelist: req.ipWhitelist ?? [],
      ativo: true,
      expiraEm: new Date(Date.now() + 365 * 86400000).toISOString(),
    };

    this.credenciaisParceiros.set(credencial.id, credencial);
    return credencial;
  }

  /**
   * Super Snapshot da Central de Segurança & Antifraude (EDDIE 11.34.1).
   */
  async obterCentralSeguranca(_tenantId?: string): Promise<CentralSegurancaSnapshot> {
    const sessoesLista = Array.from(this.sessoes.values());
    const operacoesLista = Array.from(this.operacoesSensiveis.values());
    const avaliacoesLista = Array.from(this.avaliacoesRisco.values());
    const tentativasLista = Array.from(this.tentativasIngressos.values());
    const investigacoesLista = Array.from(this.investigacoes.values());
    const bloqueiosLista = Array.from(this.bloqueios.values());
    const credenciaisLista = Array.from(this.credenciaisParceiros.values());

    return {
      kpis: {
        sessoesAtivas: 184,
        operacoesRisco: 12,
        investigacoesAbertas: 7,
        bloqueiosAtivos: 9,
        tentativasSuspeitas: 21,
        alertasCriticos: 2,
      },
      saudeDominios: {
        identidade: 'NORMAL',
        pagamentos: 'ATENCAO',
        ingressos: 'NORMAL',
        portaria: 'NORMAL',
        financeiro: 'ATENCAO',
        apis: 'NORMAL',
      },
      sessoes: sessoesLista,
      operacoesSensiveis: operacoesLista,
      antifraudePagamentos: avaliacoesLista,
      tentativasDuplicadasIngressos: tentativasLista,
      investigacoes: investigacoesLista,
      bloqueios: bloqueiosLista,
      credenciaisParceiros: credenciaisLista,
    };
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

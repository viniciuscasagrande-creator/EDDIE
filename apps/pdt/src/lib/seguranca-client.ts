// apps/pdt/src/lib/seguranca-client.ts
// EDDIE 11.34 — Segurança, Antifraude, Identidade e Proteção da Plataforma

export type PapelUsuario =
  | 'ADMIN_DISKINGRESSOS'
  | 'OPERADOR_DISKINGRESSOS'
  | 'FINANCEIRO_DISKINGRESSOS'
  | 'PRODUTOR_ADMIN'
  | 'PRODUTOR_OPERADOR'
  | 'PORTARIA_CHECKIN'
  | 'PARCEIRO_API'
  | 'DEVELOPER_DISKINGRESSOS';

export type EscopoVisao = 'DISKINGRESSOS' | 'PRODUTOR';
export type StatusUsuario = 'ATIVO' | 'BLOQUEADO' | 'PENDENTE_ATIVACAO';
export type TipoIdentidade =
  | 'FUNCIONARIO_DISK'
  | 'PRODUTOR'
  | 'FUNCIONARIO_PRODUTOR'
  | 'PARCEIRO'
  | 'OPERADOR_PORTARIA'
  | 'CONTA_SERVICO';

export type NivelOperacaoSensivel =
  | 'NIVEL_1_COMUM'
  | 'NIVEL_2_RELEVANTE'
  | 'NIVEL_3_SENSIVEL'
  | 'NIVEL_4_CRITICO';

export type SeveridadeRisco = 'BAIXO' | 'MODERADO' | 'ELEVADO' | 'CRITICO';
export type DecisaoSeguranca = 'PERMITIR' | 'SOLICITAR_MFA' | 'RETER_ANALISE' | 'BLOQUEAR';

export type TipoBloqueio =
  | 'USUARIO'
  | 'SESSAO'
  | 'DISPOSITIVO'
  | 'CREDENCIAL_API'
  | 'PARCEIRO'
  | 'INGRESSO'
  | 'CUPOM'
  | 'OPERACAO';

export type StatusInvestigacao =
  | 'ABERTO'
  | 'EM_ANALISE'
  | 'AGUARDANDO_EVIDENCIAS'
  | 'CONCLUIDO_FRAUDE_CONFIRMADA'
  | 'CONCLUIDO_FALSO_POSITIVO'
  | 'ARQUIVADO';

export interface UsuarioDto {
  id: string;
  tenantId: string;
  nome: string;
  email: string;
  papel: PapelUsuario;
  escopoVisao: EscopoVisao;
  tipoIdentidade?: TipoIdentidade;
  organizacaoNome?: string;
  produtorId: string | null;
  produtorNome: string | null;
  avatarUrl?: string;
  status: StatusUsuario;
  permissoes: string[];
  mfaHabilitado?: boolean;
  mfaMetodo?: string;
  ultimoAcessoEm?: string;
  acessoTemporarioAte?: string;
  permissaoTemporaria?: string;
  isBreakGlass?: boolean;
  criadoEm: string;
}

export interface SessaoSegurancaDto {
  id: string;
  usuarioId: string;
  usuarioNome: string;
  ipOrigem: string;
  userAgent: string;
  dispositivo: string;
  localizacaoAprox?: string;
  status: 'ATIVA' | 'SUSPEITA' | 'ENCERRADA' | 'REVOGADA';
  motivoSuspeita?: string;
  mfaValidado: boolean;
  ultimaAtividade: string;
  expiraEm: string;
  criadoEm: string;
}

export interface OperacaoSensivelDto {
  id: string;
  codigoOperacao: string;
  descricao: string;
  nivel: NivelOperacaoSensivel;
  usuarioId: string;
  usuarioNome: string;
  usuarioPapel: string;
  recursoAfetado: string;
  recursoId?: string;
  detalhes?: Record<string, unknown>;
  requereuMfa: boolean;
  mfaValidado: boolean;
  aprovadorId?: string;
  quarentenaAte?: string;
  status: 'RETIDO_QUARENTENA' | 'AGUARDANDO_APROVACAO' | 'EXECUTADO' | 'BLOQUEADO';
  createdAt: string;
}

export interface AvaliacaoRiscoTransacaoDto {
  id: string;
  pedidoId: string;
  valorCents: number;
  metodo: string;
  clienteDocumento?: string;
  clienteEmail?: string;
  scoreRisco: number;
  classificacaoRisco: SeveridadeRisco;
  decisao: DecisaoSeguranca;
  sinais: string[];
  explicacaoDecisao: string;
  revisadoPor?: string;
  revisadoEm?: string;
  decisaoFinal?: string;
  createdAt: string;
}

export interface TentativaIngressoDto {
  id: string;
  eventoId: string;
  ingressoId: string;
  codigoQr: string;
  resultado: string;
  isDuplicado: boolean;
  primeiraValidacaoEm?: string;
  primeiroPortao?: string;
  portao: string;
  dispositivoIdentificador: string;
  operadorId: string;
  timestamp: string;
}

export interface CasoInvestigacaoDto {
  id: string;
  codigo: string;
  titulo: string;
  tipo: string;
  severidade: SeveridadeRisco;
  status: StatusInvestigacao;
  analistaNome?: string;
  entidadesVinculadas: Array<{ tipo: string; id: string; nome: string }>;
  relacoes: Array<{ de: string; para: string; rotulo: string }>;
  sinaisRelacionadosCount: number;
  operacoesCount: number;
  conclusao?: string;
  createdAt: string;
}

export interface BloqueioSegurancaDto {
  id: string;
  tipo: TipoBloqueio;
  alvoIdentificador: string;
  alvoDescricao?: string;
  motivo: string;
  evidencias: string[];
  expiraEm?: string;
  bloqueadoPor: string;
  ativo: boolean;
  createdAt: string;
}

export interface CredencialParceiroApiDto {
  id: string;
  parceiroId: string;
  parceiroNome: string;
  nome: string;
  chaveMascarada: string;
  secretOneTime?: string;
  escopos: string[];
  limiteRequisicoesMinuto: number;
  ipWhitelist: string[];
  ativo: boolean;
  expiraEm: string;
  ultimoUsoEm?: string;
}

export interface CentralSegurancaSnapshot {
  kpis: {
    sessoesAtivas: number;
    operacoesRisco: number;
    investigacoesAbertas: number;
    bloqueiosAtivos: number;
    tentativasSuspeitas: number;
    alertasCriticos: number;
  };
  saudeDominios: {
    identidade: 'NORMAL' | 'ATENCAO' | 'CRITICO';
    pagamentos: 'NORMAL' | 'ATENCAO' | 'CRITICO';
    ingressos: 'NORMAL' | 'ATENCAO' | 'CRITICO';
    portaria: 'NORMAL' | 'ATENCAO' | 'CRITICO';
    financeiro: 'NORMAL' | 'ATENCAO' | 'CRITICO';
    apis: 'NORMAL' | 'ATENCAO' | 'CRITICO';
  };
  sessoes: SessaoSegurancaDto[];
  operacoesSensiveis: OperacaoSensivelDto[];
  antifraudePagamentos: AvaliacaoRiscoTransacaoDto[];
  tentativasDuplicadasIngressos: TentativaIngressoDto[];
  investigacoes: CasoInvestigacaoDto[];
  bloqueios: BloqueioSegurancaDto[];
  credenciaisParceiros: CredencialParceiroApiDto[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function fetchFromApi<T>(path: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}/v1/usuarios${path}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': '00000000-0000-0000-0000-000000000001',
      },
      ...options,
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export const segurancaClient = {
  async getSnapshot(tenantId?: string): Promise<CentralSegurancaSnapshot> {
    const apiData = await fetchFromApi<CentralSegurancaSnapshot>(
      `/seguranca/central/snapshot${tenantId ? `?tenantId=${tenantId}` : ''}`,
    );
    if (apiData) return apiData;

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
      sessoes: [
        {
          id: 'ses-101',
          usuarioId: 'usr-admin-master',
          usuarioNome: 'Vinicius Casagrande (Admin Master)',
          ipOrigem: '177.18.29.102',
          userAgent: 'Chrome 124 (Windows 11)',
          dispositivo: 'Dell XPS 15 (Hardware ID: WIN-SEC-9921)',
          localizacaoAprox: 'Curitiba, PR - Brasil',
          status: 'ATIVA',
          mfaValidado: true,
          ultimaAtividade: 'Agora mesmo',
          expiraEm: '2026-09-29T18:00:00Z',
          criadoEm: '2026-09-29T08:00:00Z',
        },
        {
          id: 'ses-suspeita-201',
          usuarioId: 'usr-prod-opus',
          usuarioNome: 'Juliana Siqueira (Opus Entretenimento)',
          ipOrigem: '45.134.140.22',
          userAgent: 'HeadlessChrome / Python-Requests 2.31',
          dispositivo: 'Servidor VPS Desconhecido (Datacenter Host)',
          localizacaoAprox: 'Frankfurt, Alemanha (IP de VPN Tor)',
          status: 'SUSPEITA',
          motivoSuspeita: 'Salto geográfico impossível (Curitiba -> Frankfurt em 12 minutos) e IP anônimo',
          mfaValidado: false,
          ultimaAtividade: 'há 15 min',
          expiraEm: '2026-09-29T11:00:00Z',
          criadoEm: '2026-09-29T09:40:00Z',
        },
      ],
      operacoesSensiveis: [
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
          createdAt: '2026-09-29T06:00:00Z',
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
          detalhes: { bancoAnterior: 'Itaú 341', novoBanco: 'BTG Pactual 208' },
          requereuMfa: true,
          mfaValidado: true,
          quarentenaAte: '2026-09-30T06:00:00Z',
          status: 'RETIDO_QUARENTENA',
          createdAt: '2026-09-29T06:00:00Z',
        },
      ],
      antifraudePagamentos: [
        {
          id: 'risco-001',
          pedidoId: 'ped-2026-9901',
          valorCents: 380000,
          metodo: 'CARTAO_CREDITO',
          clienteDocumento: '***.482.901-**',
          clienteEmail: 'marcos.souza@gmail.com',
          scoreRisco: 88,
          classificacaoRisco: 'CRITICO',
          decisao: 'BLOQUEAR',
          sinais: [
            '5 tentativas de pagamento com cartões de diferentes titulares em 8 minutos',
            'Dispositivo com impressão digital alterada em sequência rápida',
            'IP associado a rede de proxies residenciais',
          ],
          explicacaoDecisao: 'Padrão clássico de teste automatizado de cartões furtados (carding bot). Transação rejeitada na raiz.',
          createdAt: '2026-09-29T09:30:00Z',
        },
        {
          id: 'risco-002',
          pedidoId: 'ped-2026-9902',
          valorCents: 145000,
          metodo: 'CARTAO_CREDITO',
          clienteDocumento: '***.119.832-**',
          clienteEmail: 'ana.pereira@empresa.com.br',
          scoreRisco: 68,
          classificacaoRisco: 'ELEVADO',
          decisao: 'RETER_ANALISE',
          sinais: [
            'Valor 4x superior à média da sessão',
            'Primeira compra na plataforma com entrega imediata',
          ],
          explicacaoDecisao: 'Risco elevado detectado. Encaminhado para mesa manual de análise.',
          createdAt: '2026-09-29T09:45:00Z',
        },
      ],
      tentativasDuplicadasIngressos: [
        {
          id: 't-ing-001',
          eventoId: 'evt-rock-fest-2026',
          ingressoId: 'ing-pista-premium-4491',
          codigoQr: 'DISK-QR-v2-SEC-4491-SIGN-VALID',
          resultado: 'DUPLICADO_JA_UTILIZADO',
          isDuplicado: true,
          primeiraValidacaoEm: '2026-09-29T19:40:00Z',
          primeiroPortao: 'Portão 01 - Acesso Principal (Catraca 03)',
          portao: 'Portão 04 - VIP Lateral (Catraca 11)',
          dispositivoIdentificador: 'POS-SUNMI-VIP-11',
          operadorId: 'usr-op-catraca',
          timestamp: '2026-09-29T20:22:00Z',
        },
      ],
      investigacoes: [
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
          createdAt: '2026-09-29T05:00:00Z',
        },
      ],
      bloqueios: [
        {
          id: 'blq-001',
          tipo: 'DISPOSITIVO',
          alvoIdentificador: 'FP-BROWSER-8910',
          alvoDescricao: 'Fingerprint do navegador utilizado no ataque de carding',
          motivo: 'Ataque automatizado com cartões de crédito roubados',
          evidencias: ['Caso INV-2026-0081', '5 cartões diferentes rejeitados em 8 minutos'],
          bloqueadoPor: 'vinicius@diskingressos.com.br',
          ativo: true,
          createdAt: '2026-09-29T07:00:00Z',
        },
      ],
      credenciaisParceiros: [
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
          expiraEm: '2027-09-29T00:00:00Z',
          ultimoUsoEm: 'há 4 min',
        },
      ],
    };
  },

  async encerrarSessao(sessaoId: string, encerradoPor: string = 'admin') {
    return fetchFromApi<SessaoSegurancaDto>(`/seguranca/sessoes/${sessaoId}/encerrar`, {
      method: 'POST',
      body: JSON.stringify({ encerradoPor }),
    });
  },

  async aplicarBloqueio(body: {
    tipo: TipoBloqueio;
    alvoIdentificador: string;
    alvoDescricao?: string;
    motivo: string;
    evidencias: string[];
    bloqueadoPor: string;
    expiraEm?: string;
  }) {
    return fetchFromApi<BloqueioSegurancaDto>('/seguranca/bloqueios', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async revogarBloqueio(id: string, revogadoPor: string = 'admin') {
    return fetchFromApi<BloqueioSegurancaDto>(`/seguranca/bloqueios/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ revogadoPor }),
    });
  },

  async gerarCredencialParceiro(body: {
    parceiroId: string;
    parceiroNome: string;
    nome: string;
    escopos: string[];
    limiteRequisicoesMinuto?: number;
    ipWhitelist?: string[];
  }) {
    return fetchFromApi<CredencialParceiroApiDto>('/seguranca/parceiros/credenciais', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async concederAcessoTemporario(body: {
    usuarioId: string;
    permissao: string;
    duracaoHoras: number;
    motivo: string;
    concedidoPor: string;
  }) {
    return fetchFromApi<UsuarioDto>('/seguranca/acesso-temporario', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
};

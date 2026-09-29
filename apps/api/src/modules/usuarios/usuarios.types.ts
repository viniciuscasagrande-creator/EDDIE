// apps/api/src/modules/usuarios/usuarios.types.ts
// EDDIE 11.29 / 11.34 — Identity, RBAC, Security & Antifraud Types

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

export interface PermissaoDefinicao {
  codigo: string;
  nome: string;
  descricao: string;
  modulo: string;
  exclusivoDiskIngressos: boolean;
}

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

export interface CriarUsuarioRequest {
  nome: string;
  email: string;
  papel: PapelUsuario;
  tipoIdentidade?: TipoIdentidade;
  organizacaoNome?: string;
  produtorId?: string;
  produtorNome?: string;
  permissoes?: string[];
  mfaObrigatorio?: boolean;
  criadoPor: string;
}

export interface AtualizarPermissoesRequest {
  permissoes: string[];
  atualizadoPor: string;
}

export interface AlterarStatusRequest {
  status: StatusUsuario;
  motivo: string;
  alteradoPor: string;
}

export interface ProdutorParceiroDto {
  id: string;
  nome: string;
  cnpj: string;
  eventosAtivosCount: number;
}

// ============================================================================
//  EDDIE 11.34 — SEGURANÇA, ANTIFRAUDE & SESSÕES
// ============================================================================

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
  scoreRisco: number; // 0 a 100
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
  codigo: string; // INV-2026-0081
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
  chaveMascarada: string; // '••••4F92'
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

// apps/api/src/modules/usuarios/usuarios.types.ts
// EDDIE 11.29 — User Management & RBAC Permissions Types

export type PapelUsuario =
  | 'ADMIN_DISKINGRESSOS'
  | 'OPERADOR_DISKINGRESSOS'
  | 'FINANCEIRO_DISKINGRESSOS'
  | 'PRODUTOR_ADMIN'
  | 'PRODUTOR_OPERADOR'
  | 'PORTARIA_CHECKIN';

export type EscopoVisao = 'DISKINGRESSOS' | 'PRODUTOR';

export type StatusUsuario = 'ATIVO' | 'BLOQUEADO' | 'PENDENTE_ATIVACAO';

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
  produtorId: string | null;
  produtorNome: string | null;
  avatarUrl?: string;
  status: StatusUsuario;
  permissoes: string[];
  ultimoAcessoEm?: string;
  criadoEm: string;
}

export interface CriarUsuarioRequest {
  nome: string;
  email: string;
  papel: PapelUsuario;
  produtorId?: string;
  produtorNome?: string;
  permissoes?: string[];
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

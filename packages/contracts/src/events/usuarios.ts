import { z } from 'zod';
import { defineEvent } from '../shared/envelope.js';

/**
 * Papéis de acesso ao sistema (RBAC) e escopos de visão.
 */
export const PapelUsuario = z.enum([
  'ADMIN_DISKINGRESSOS',
  'OPERADOR_DISKINGRESSOS',
  'FINANCEIRO_DISKINGRESSOS',
  'PRODUTOR_ADMIN',
  'PRODUTOR_OPERADOR',
  'PORTARIA_CHECKIN',
]);

export const EscopoVisao = z.enum(['DISKINGRESSOS', 'PRODUTOR']);

export const StatusUsuario = z.enum(['ATIVO', 'BLOQUEADO', 'PENDENTE_ATIVACAO']);

/**
 * Evento publicado quando um novo usuário é cadastrado no sistema.
 */
export const UsuarioCriado = defineEvent(
  'usuarios.usuario_criado.v1',
  z.object({
    usuarioId: z.string().uuid(),
    tenantId: z.string().uuid(),
    nome: z.string().min(2),
    email: z.string().email(),
    papel: PapelUsuario,
    escopoVisao: EscopoVisao,
    produtorId: z.string().nullable(),
    produtorNome: z.string().nullable(),
    permissoes: z.array(z.string()),
    criadoPor: z.string(),
    criadoEm: z.string().datetime(),
  }),
);

/**
 * Evento publicado quando as permissões de um usuário são atualizadas.
 */
export const PermissoesUsuarioAtualizadas = defineEvent(
  'usuarios.permissoes_atualizadas.v1',
  z.object({
    usuarioId: z.string().uuid(),
    novasPermissoes: z.array(z.string()),
    atualizadoPor: z.string(),
    atualizadoEm: z.string().datetime(),
  }),
);

/**
 * Evento publicado quando o status de um usuário é alterado (Ativado ou Bloqueado).
 */
export const StatusUsuarioAlterado = defineEvent(
  'usuarios.status_alterado.v1',
  z.object({
    usuarioId: z.string().uuid(),
    statusAnterior: StatusUsuario,
    novoStatus: StatusUsuario,
    motivo: z.string(),
    alteradoPor: z.string(),
    alteradoEm: z.string().datetime(),
  }),
);

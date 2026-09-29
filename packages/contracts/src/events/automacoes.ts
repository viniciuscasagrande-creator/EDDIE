import { z } from 'zod';
import { defineEvent } from '../envelope.js';

export const CategoriaRegraSchema = z.enum([
  'FINANCEIRO',
  'COMERCIAL',
  'EVENTOS',
  'PORTARIA',
  'PAGAMENTOS',
  'PARCEIROS',
  'SAC',
  'INFRAESTRUTURA',
]);

export const StatusRegraSchema = z.enum([
  'ATIVA',
  'PAUSADA',
  'MODO_OBSERVACAO',
  'RASCUNHO',
]);

export const SeveridadeAutomacaoSchema = z.enum([
  'INFO',
  'ATENCAO',
  'ALTA',
  'CRITICA',
]);

export const TipoOperacaoAprovacaoSchema = z.enum([
  'REPASSE_PRODUTOR',
  'ANTECIPACAO',
  'ESTORNO_EXCEPCIONAL',
  'ALTERACAO_CONTA_BANCARIA',
  'ALTERACAO_CONDICAO_COMERCIAL',
  'FECHAMENTO_EVENTO',
  'CADASTRO_PARCEIRO',
  'REGRA_CRITICA',
]);

export const StatusAprovacaoSchema = z.enum([
  'PENDENTE',
  'EM_ANALISE',
  'APROVADO',
  'REJEITADO',
  'SOLICITADO_INFORMACAO',
  'CANCELADO',
]);

export const NivelAprovacaoSchema = z.enum([
  'SIMPLES',
  'FINANCEIRO',
  'FINANCEIRO_E_ADMIN',
  'DUPLA_APROVACAO_DIRETORIA',
]);

// 1. Payload: Regra de Automação Criada
export const RegraAutomacaoCriadaPayloadSchema = z.object({
  regraId: z.string().uuid(),
  codigo: z.string(),
  nome: z.string(),
  categoria: CategoriaRegraSchema,
  gatilhoEvento: z.string(),
  versao: z.number().int().positive(),
  status: StatusRegraSchema,
  criadoPor: z.string(),
  createdAt: z.string().datetime(),
});

// 2. Payload: Regra Alterada (Nova Versão)
export const RegraAutomacaoAlteradaPayloadSchema = z.object({
  regraId: z.string().uuid(),
  codigo: z.string(),
  nome: z.string(),
  novaVersao: z.number().int().positive(),
  motivoAlteracao: z.string(),
  alteradoPor: z.string(),
  createdAt: z.string().datetime(),
});

// 3. Payload: Regra Pausada / Kill-switch
export const RegraAutomacaoPausadaPayloadSchema = z.object({
  regraId: z.string().uuid().optional(),
  modulo: z.string().optional(),
  motivoPausa: z.string(),
  operadorId: z.string(),
  escopo: z.enum(['REGRA', 'MODULO', 'GLOBAL']),
  pausedAt: z.string().datetime(),
});

// 4. Payload: Execução de Automação Realizada
export const AutomacaoExecutadaPayloadSchema = z.object({
  execucaoId: z.string().uuid(),
  regraId: z.string().uuid(),
  versaoRegra: z.number().int().positive(),
  correlationId: z.string().uuid(),
  eventoDisparo: z.string(),
  status: z.enum(['SUCESSO', 'BLOQUEADO', 'ENCAMINHADO_APROVACAO', 'ERRO', 'MODO_OBSERVACAO']),
  acoesDisparadas: z.array(z.string()),
  duracaoMs: z.number().int().nonnegative(),
  profundidade: z.number().int().nonnegative(),
  executedAt: z.string().datetime(),
});

// 5. Payload: Solicitação de Aprovação Criada
export const AprovacaoSolicitadaPayloadSchema = z.object({
  solicitacaoId: z.string().uuid(),
  codigo: z.string(),
  tipoOperacao: TipoOperacaoAprovacaoSchema,
  entidadeOrigemTipo: z.string(),
  entidadeOrigemId: z.string(),
  eventoId: z.string().uuid().optional(),
  produtorId: z.string().optional(),
  valorCentavos: z.number().int().nonnegative().optional(),
  solicitanteId: z.string(),
  solicitanteNome: z.string(),
  nivelExigido: NivelAprovacaoSchema,
  segregacaoFuncoesObrigatoria: z.boolean(),
  slaLimiteAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
});

// 6. Payload: Decisão de Aprovação Registrada
export const AprovacaoDecididaPayloadSchema = z.object({
  solicitacaoId: z.string().uuid(),
  decisao: z.enum(['APROVADO', 'REJEITADO', 'SOLICITADO_INFORMACAO']),
  aprovadorId: z.string(),
  aprovadorNome: z.string(),
  etapaOrdem: z.number().int().positive(),
  justificativa: z.string(),
  delegadoPor: z.string().optional(),
  decidedAt: z.string().datetime(),
});

// 7. Payload: Delegação de Aprovação
export const DelegacaoAprovacaoRegistradaPayloadSchema = z.object({
  delegacaoId: z.string().uuid(),
  usuarioOrigemId: z.string(),
  usuarioDelegadoId: z.string(),
  departamento: z.string(),
  dataInicio: z.string().datetime(),
  dataFim: z.string().datetime(),
  motivo: z.string(),
  createdAt: z.string().datetime(),
});

// 8. Payload: Notificação Central Disparada
export const NotificacaoCentralDisparadaPayloadSchema = z.object({
  notificacaoId: z.string().uuid(),
  canal: z.enum(['IN_APP', 'EMAIL', 'WHATSAPP', 'SMS']),
  destinatario: z.string(),
  titulo: z.string(),
  conteudo: z.string(),
  severidade: SeveridadeAutomacaoSchema,
  correlationId: z.string().uuid().optional(),
  disparadoAt: z.string().datetime(),
});

// Definição dos Eventos
export const RegraAutomacaoCriadaV1 = defineEvent(
  'automacoes.regra.criada.v1',
  RegraAutomacaoCriadaPayloadSchema,
);

export const RegraAutomacaoAlteradaV1 = defineEvent(
  'automacoes.regra.alterada.v1',
  RegraAutomacaoAlteradaPayloadSchema,
);

export const RegraAutomacaoPausadaV1 = defineEvent(
  'automacoes.regra.pausada.v1',
  RegraAutomacaoPausadaPayloadSchema,
);

export const AutomacaoExecutadaV1 = defineEvent(
  'automacoes.execucao.realizada.v1',
  AutomacaoExecutadaPayloadSchema,
);

export const AprovacaoSolicitadaV1 = defineEvent(
  'automacoes.aprovacao.solicitada.v1',
  AprovacaoSolicitadaPayloadSchema,
);

export const AprovacaoDecididaV1 = defineEvent(
  'automacoes.aprovacao.decidida.v1',
  AprovacaoDecididaPayloadSchema,
);

export const DelegacaoAprovacaoRegistradaV1 = defineEvent(
  'automacoes.delegacao.registrada.v1',
  DelegacaoAprovacaoRegistradaPayloadSchema,
);

export const NotificacaoCentralDisparadaV1 = defineEvent(
  'automacoes.notificacao.disparada.v1',
  NotificacaoCentralDisparadaPayloadSchema,
);

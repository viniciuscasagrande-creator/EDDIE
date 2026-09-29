// packages/contracts/src/events/seguranca.ts
// EDDIE 11.34 — Segurança, Antifraude, Identidade e Proteção da Plataforma

import { z } from 'zod';
import { defineEvent } from '../envelope.js';

export const NivelOperacaoSensivelSchema = z.enum([
  'NIVEL_1_COMUM',
  'NIVEL_2_RELEVANTE',
  'NIVEL_3_SENSIVEL',
  'NIVEL_4_CRITICO',
]);

export const SeveridadeRiscoSegurancaSchema = z.enum([
  'BAIXO',
  'MODERADO',
  'ELEVADO',
  'CRITICO',
]);

export const DecisaoSegurancaSchema = z.enum([
  'PERMITIR',
  'SOLICITAR_MFA',
  'RETER_ANALISE',
  'BLOQUEAR',
]);

export const TipoBloqueioSchema = z.enum([
  'USUARIO',
  'SESSAO',
  'DISPOSITIVO',
  'CREDENCIAL_API',
  'PARCEIRO',
  'INGRESSO',
  'CUPOM',
  'OPERACAO',
]);

export const StatusInvestigacaoSchema = z.enum([
  'ABERTO',
  'EM_ANALISE',
  'AGUARDANDO_EVIDENCIAS',
  'CONCLUIDO_FRAUDE_CONFIRMADA',
  'CONCLUIDO_FALSO_POSITIVO',
  'ARQUIVADO',
]);

// 1. Sessão Suspeita Detectada
export const SessaoSuspeitaDetectadaPayloadSchema = z.object({
  sessaoId: z.string().uuid(),
  usuarioId: z.string(),
  tenantId: z.string().uuid(),
  ipOrigem: z.string(),
  dispositivo: z.string(),
  motivosSuspeita: z.array(z.string()),
  severidade: SeveridadeRiscoSegurancaSchema,
  detectadoEm: z.string(),
});

export const SessaoSuspeitaDetectadaV1 = defineEvent(
  'seguranca.sessao.suspeita.v1',
  SessaoSuspeitaDetectadaPayloadSchema,
);

// 2. Operação Sensível Requerida / Executada
export const OperacaoSensivelRequeridaPayloadSchema = z.object({
  operacaoId: z.string().uuid(),
  tenantId: z.string().uuid(),
  usuarioId: z.string(),
  tipoOperacao: z.string(), // 'ALTERACAO_CONTA_BANCARIA', 'REPASSE_EXCEPCIONAL', etc.
  nivel: NivelOperacaoSensivelSchema,
  requerReautenticacaoMfa: z.boolean(),
  requerSegregacaoFuncoes: z.boolean(),
  quarentenaHoras: z.number().int().min(0).default(0),
  timestamp: z.string(),
});

export const OperacaoSensivelRequeridaV1 = defineEvent(
  'seguranca.operacao.sensivel.v1',
  OperacaoSensivelRequeridaPayloadSchema,
);

// 3. Reautenticação Step-up Realizada
export const ReautenticacaoRealizadaPayloadSchema = z.object({
  usuarioId: z.string(),
  tenantId: z.string().uuid(),
  metodoMfa: z.string(), // 'TOTP', 'FIDO2_WEBAUTHN', 'SMS_OTP'
  operacaoReferenciaId: z.string(),
  sucesso: z.boolean(),
  timestamp: z.string(),
});

export const ReautenticacaoRealizadaV1 = defineEvent(
  'seguranca.reautenticacao.realizada.v1',
  ReautenticacaoRealizadaPayloadSchema,
);

// 4. Risco de Transação de Pagamento Avaliado
export const RiscoTransacaoAvaliadoPayloadSchema = z.object({
  avaliacaoId: z.string().uuid(),
  tenantId: z.string().uuid(),
  pedidoId: z.string(),
  valorCents: z.number().int().min(0),
  pontuacaoRisco: SeveridadeRiscoSegurancaSchema,
  decisao: DecisaoSegurancaSchema,
  sinaisIdentificados: z.array(z.string()),
  explicacaoDecisao: z.string(),
  avaliadoEm: z.string(),
});

export const RiscoTransacaoAvaliadoV1 = defineEvent(
  'seguranca.risco.avaliado.v1',
  RiscoTransacaoAvaliadoPayloadSchema,
);

// 5. Tentativa Duplicada de Ingresso na Portaria
export const TentativaDuplicadaIngressoPayloadSchema = z.object({
  tentativaId: z.string().uuid(),
  tenantId: z.string().uuid(),
  eventoId: z.string(),
  ingressoId: z.string(),
  codigoQr: z.string(),
  primeiraValidacaoEm: z.string(),
  primeiroPortao: z.string(),
  tentativaAtualEm: z.string(),
  tentativaAtualPortao: z.string(),
  dispositivoId: z.string(),
  operadorId: z.string(),
});

export const TentativaDuplicadaIngressoV1 = defineEvent(
  'seguranca.ingresso.duplicado.v1',
  TentativaDuplicadaIngressoPayloadSchema,
);

// 6. Bloqueio de Segurança Aplicado
export const BloqueioSegurancaAplicadoPayloadSchema = z.object({
  bloqueioId: z.string().uuid(),
  tenantId: z.string().uuid(),
  tipo: TipoBloqueioSchema,
  alvoIdentificador: z.string(),
  motivo: z.string(),
  expiraEm: z.string().optional(),
  aplicadoPor: z.string(),
  evidencias: z.array(z.string()),
  aplicadoEm: z.string(),
});

export const BloqueioSegurancaAplicadoV1 = defineEvent(
  'seguranca.bloqueio.aplicado.v1',
  BloqueioSegurancaAplicadoPayloadSchema,
);

// 7. Investigação de Segurança Aberta
export const InvestigacaoSegurancaAbertaPayloadSchema = z.object({
  investigacaoId: z.string().uuid(),
  codigo: z.string(), // 'INV-2026-0081'
  tenantId: z.string().uuid(),
  titulo: z.string(),
  tipo: z.string(),
  status: StatusInvestigacaoSchema,
  entidadesVinculadas: z.array(z.string()),
  analistaResponsavelId: z.string().optional(),
  abertaEm: z.string(),
});

export const InvestigacaoSegurancaAbertaV1 = defineEvent(
  'seguranca.investigacao.aberta.v1',
  InvestigacaoSegurancaAbertaPayloadSchema,
);

// 8. Política de Segurança Violada
export const PoliticaSegurancaVioladaPayloadSchema = z.object({
  violacaoId: z.string().uuid(),
  tenantId: z.string().uuid(),
  codigoPolitica: z.string(),
  nomePolitica: z.string(),
  usuarioOuEntidadeId: z.string(),
  acaoTentada: z.string(),
  bloqueadoAutomaticamente: z.boolean(),
  detalhes: z.string(),
  timestamp: z.string(),
});

export const PoliticaSegurancaVioladaV1 = defineEvent(
  'seguranca.politica.violada.v1',
  PoliticaSegurancaVioladaPayloadSchema,
);

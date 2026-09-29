import { z } from 'zod';
import { defineEvent } from '../envelope.js';

// ============================================================================
//  EDDIE 11.33 — Central de Operações, Monitoramento em Tempo Real & Incidentes
// ============================================================================

export const SeveridadeOperacionalSchema = z.enum([
  'INFORMATIVO',
  'BAIXO',
  'MEDIO',
  'ALTO',
  'CRITICO',
]);

export const EstadoOperacionalSchema = z.enum([
  'NORMAL',
  'ATENCAO',
  'DEGRADADO',
  'CRITICO',
  'MANUTENCAO',
]);

export const StatusAlertaSchema = z.enum([
  'ABERTO',
  'RECONHECIDO',
  'SILENCIADO',
  'EM_INCIDENTE',
  'RESOLVIDO',
]);

export const SeveridadeIncidenteSchema = z.enum([
  'P1_CRITICO',
  'P2_ALTO',
  'P3_MEDIO',
  'P4_BAIXO',
]);

export const StatusIncidenteSchema = z.enum([
  'ABERTO',
  'INVESTIGANDO',
  'IDENTIFICADO',
  'MITIGADO',
  'MONITORANDO',
  'RESOLVIDO',
  'FECHADO',
]);

export const TipoProcedimentoSchema = z.enum([
  'FAILOVER_ADQUIRENTE',
  'CONTINGENCIA_OFFLINE_PORTARIA',
  'REINICIAR_WORKERS',
  'BLOQUEIO_FRAUDE',
  'REPROCESSAR_FILA',
  'CHAVEAMENTO_GATEWAY_PIX',
]);

export const StatusProblemaSchema = z.enum([
  'REGISTRADO',
  'INVESTIGANDO',
  'CAUSA_CONHECIDA',
  'SOLUCAO_DEFINITIVA_IMPLANTADA',
  'FECHADO',
]);

// 1. Sinal Operacional Bruto Emitido
export const SinalOperacionalEmitidoPayloadSchema = z.object({
  sinalId: z.string().uuid(),
  tenantId: z.string().uuid(),
  eventoId: z.string().uuid().optional(),
  origem: z.string(), // 'GATEWAY_ADYEN', 'PORTARIA_PORTAO_A', 'OUTBOX_WORKER', etc.
  tipo: z.string(),
  severidade: SeveridadeOperacionalSchema,
  chaveCorrelacao: z.string(),
  dados: z.record(z.unknown()).optional(),
  timestamp: z.string(),
});

export const SinalOperacionalEmitidoV1 = defineEvent(
  'operacao.sinal.emitido.v1',
  SinalOperacionalEmitidoPayloadSchema,
);

// 2. Alerta Operacional Disparado (Após Deduplicação e Redução de Ruído)
export const AlertaOperacionalDisparadoPayloadSchema = z.object({
  alertaId: z.string().uuid(),
  tenantId: z.string().uuid(),
  eventoId: z.string().uuid().optional(),
  codigo: z.string(),
  titulo: z.string(),
  descricao: z.string(),
  severidade: SeveridadeOperacionalSchema,
  categoria: z.string(),
  chaveCorrelacao: z.string(),
  contagemSinais: z.number().int().min(1),
  primeiraOcorrencia: z.string(),
  ultimaOcorrencia: z.string(),
});

export const AlertaOperacionalDisparadoV1 = defineEvent(
  'operacao.alerta.disparado.v1',
  AlertaOperacionalDisparadoPayloadSchema,
);

// 3. Alerta Operacional Reconhecido / Silenciado
export const AlertaOperacionalReconhecidoPayloadSchema = z.object({
  alertaId: z.string().uuid(),
  tenantId: z.string().uuid(),
  status: StatusAlertaSchema,
  operadorId: z.string(),
  reconhecidoEm: z.string(),
  motivoSilenciamento: z.string().optional(),
  silenciadoAte: z.string().optional(),
});

export const AlertaOperacionalReconhecidoV1 = defineEvent(
  'operacao.alerta.reconhecido.v1',
  AlertaOperacionalReconhecidoPayloadSchema,
);

// 4. Incidente Operacional Aberto
export const IncidenteOperacionalAbertoPayloadSchema = z.object({
  incidenteId: z.string().uuid(),
  codigo: z.string(), // Ex: 'INC-2026-0042'
  tenantId: z.string().uuid(),
  eventoId: z.string().uuid().optional(),
  titulo: z.string(),
  descricao: z.string(),
  severidade: SeveridadeIncidenteSchema,
  status: StatusIncidenteSchema,
  coordenadorId: z.string().optional(),
  sistemasAfetados: z.array(z.string()),
  eventosAfetados: z.array(z.string()),
  gmvEmRiscoCentavos: z.number().int().min(0),
  pedidosRepresados: z.number().int().min(0),
  publicoAfetadoPortaria: z.number().int().min(0),
  iniciadoEm: z.string(),
});

export const IncidenteOperacionalAbertoV1 = defineEvent(
  'operacao.incidente.aberto.v1',
  IncidenteOperacionalAbertoPayloadSchema,
);

// 5. Incidente Operacional Atualizado
export const IncidenteOperacionalAtualizadoPayloadSchema = z.object({
  incidenteId: z.string().uuid(),
  codigo: z.string(),
  tenantId: z.string().uuid(),
  statusAnterior: StatusIncidenteSchema,
  novoStatus: StatusIncidenteSchema,
  responsavelId: z.string().optional(),
  atualizacaoTexto: z.string(),
  atualizadoEm: z.string(),
});

export const IncidenteOperacionalAtualizadoV1 = defineEvent(
  'operacao.incidente.atualizado.v1',
  IncidenteOperacionalAtualizadoPayloadSchema,
);

// 6. Incidente Operacional Encerrado
export const IncidenteOperacionalEncerradoPayloadSchema = z.object({
  incidenteId: z.string().uuid(),
  codigo: z.string(),
  tenantId: z.string().uuid(),
  duracaoMinutos: z.number().int().min(0),
  mitigadoEm: z.string().optional(),
  resolvidoEm: z.string(),
  solucaoDefinitivaOuContorno: z.string(),
});

export const IncidenteOperacionalEncerradoV1 = defineEvent(
  'operacao.incidente.encerrado.v1',
  IncidenteOperacionalEncerradoPayloadSchema,
);

// 7. Procedimento Operacional Executado (Runbook)
export const ProcedimentoOperacionalExecutadoPayloadSchema = z.object({
  procedimentoId: z.string().uuid(),
  incidenteId: z.string().uuid().optional(),
  tenantId: z.string().uuid(),
  nome: z.string(),
  tipo: TipoProcedimentoSchema,
  executadoPor: z.string(),
  status: z.enum(['SUCESSO', 'FALHOU', 'EM_ANDAMENTO']),
  resultado: z.string(),
  executadoEm: z.string(),
});

export const ProcedimentoOperacionalExecutadoV1 = defineEvent(
  'operacao.procedimento.executado.v1',
  ProcedimentoOperacionalExecutadoPayloadSchema,
);

// 8. Pós-Incidente Concluído (Post-Mortem / RCA)
export const PosIncidenteConcluidoPayloadSchema = z.object({
  analiseId: z.string().uuid(),
  incidenteId: z.string().uuid(),
  codigoIncidente: z.string(),
  tenantId: z.string().uuid(),
  causaRaizConfirmada: z.string(),
  impactoFinanceiroFinalCents: z.number().int().min(0),
  gmvRecuperadoCents: z.number().int().min(0),
  licoesAprendidas: z.array(z.string()),
  acoesCorretivasTotal: z.number().int().min(0),
  auditorId: z.string(),
  concluidoEm: z.string(),
});

export const PosIncidenteConcluidoV1 = defineEvent(
  'operacao.pos-incidente.concluido.v1',
  PosIncidenteConcluidoPayloadSchema,
);

// 9. Problema Operacional Registrado (Gestão de Problemas ITIL)
export const ProblemaOperacionalRegistradoPayloadSchema = z.object({
  problemaId: z.string().uuid(),
  codigo: z.string(), // Ex: 'PRB-2026-0012'
  tenantId: z.string().uuid(),
  titulo: z.string(),
  categoria: z.string(),
  status: StatusProblemaSchema,
  totalIncidentesAssociados: z.number().int().min(0),
  solucaoContorno: z.string().optional(),
  solucaoDefinitiva: z.string().optional(),
  registradoEm: z.string(),
});

export const ProblemaOperacionalRegistradoV1 = defineEvent(
  'operacao.problema.registrado.v1',
  ProblemaOperacionalRegistradoPayloadSchema,
);

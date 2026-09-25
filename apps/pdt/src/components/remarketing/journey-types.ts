// apps/pdt/src/components/remarketing/journey-types.ts
// EDDIE 11.16.16 — Tipos do Journey Builder Persistente e Central de Automações

export type JourneyNodeType =
  | 'TRIGGER'
  | 'CONDITION'
  | 'WAIT'
  | 'ACTION'
  | 'BRANCH'
  | 'CONVERSION'
  | 'EXIT';

export type JourneyStatus =
  | 'DRAFT'
  | 'VALIDATING'
  | 'ACTIVE'
  | 'PAUSED'
  | 'ERROR'
  | 'ENDED';

export interface JourneyNodeConfig {
  titulo: string;
  descricao?: string;
  // Trigger
  gatilhoTipo?:
    | 'VISITOU_EVENTO'
    | 'CARRINHO_ABANDONADO'
    | 'CHECKOUT_ABANDONADO'
    | 'COMPRA_APROVADA'
    | 'ENTRADA_SEGMENTO'
    | 'VIRADA_LOTE_D2'
    | 'AGENDAMENTO_DATA_HORA';
  gatilhoParametros?: Record<string, unknown>;
  // Wait
  esperaTempoMinutos?: number;
  esperaTexto?: string;
  // Condition
  condicaoTipo?:
    | 'COMPROU_INGRESSO'
    | 'CONSENTIMENTO_WHATSAPP'
    | 'CONSENTIMENTO_EMAIL'
    | 'TICKET_MAIOR_QUE'
    | 'VISITOU_NOVAMENTE';
  condicaoParametro?: string | number;
  // Action
  acaoCanal?: 'WHATSAPP' | 'EMAIL' | 'ADS_META' | 'ADS_GOOGLE' | 'ADS_TIKTOK' | 'TAG_CRM';
  acaoTemplateId?: string;
  acaoTemplateNome?: string;
  acaoCupomDesconto?: string;
  frequencyCap?: { maxPorDia: number; maxPorSemana: number };
  // Conversion
  metaConversao?: 'PEDIDO_PAGO' | 'CHECKOUT_CONCLUIDO';
  receitaEsperadaCents?: number;
  // Exit
  motivoEncerramento?: 'CONVERSAO_REALIZADA' | 'FREQUENCY_CAP' | 'OPT_OUT' | 'TIMEOUT_JORNADA';
}

export interface JourneyNode {
  id: string;
  type: JourneyNodeType;
  config: JourneyNodeConfig;
  participantesNoNo?: number;
  taxaSucesso?: string;
}

export interface JourneyEdge {
  from: string;
  to: string;
  condition?: 'SIM' | 'NAO' | 'PADRAO' | 'BRANCH_A' | 'BRANCH_B';
}

export interface JourneyDefinition {
  id: string;
  eventoId: string;
  eventoNome?: string;
  produtorId?: string;
  name: string;
  description?: string;
  status: JourneyStatus;
  nodes: JourneyNode[];
  edges: JourneyEdge[];
  publicoAlvoId?: string;
  publicoAlvoNome?: string;
  metricas?: {
    totalEntradas: number;
    emAndamento: number;
    conversoes: number;
    taxaConversao: string;
    receitaAtribuidaCents: number;
  };
  criadoEm: string;
  atualizadoEm: string;
  ultimoDisparoEm?: string;
}

export interface JourneyExecutionLog {
  id: string;
  correlationId: string;
  journeyId: string;
  nodeId: string;
  nodeType: JourneyNodeType;
  nodeTitulo: string;
  clienteAnonimizado: string; // Ex: M*** S*** (11) 98***-**12 (LGPD)
  canal?: string;
  status: 'SUCESSO' | 'AGUARDANDO' | 'FALHA' | 'CONVERTIDO' | 'OPT_OUT';
  detalhes: string;
  timestamp: string;
}

export interface AutomationRule {
  id: string;
  nome: string;
  eventoId: string;
  eventoNome?: string;
  gatilho: string;
  publicoAlvo: string;
  canais: string[];
  status: 'RASCUNHO' | 'VALIDANDO' | 'ATIVA' | 'PAUSADA' | 'ERRO' | 'ENCERRADA';
  execucoes: number;
  conversoes: number;
  taxaConversao: string;
  receitaRecuperadaCents: number;
  ultimaExecucaoEm?: string;
  criadoEm: string;
  frequencyCapTexto: string;
  consentimentoExigido: boolean;
}

// apps/pdt/src/components/remarketing/audience-types.ts
// EDDIE 11.16.16 — Tipos da Central de Públicos e Segmentação AND/OR

export type AudienceType = 'STATIC' | 'DYNAMIC' | 'BEHAVIORAL' | 'PROVIDER';

export type AudienceOrigin =
  | 'CHECKOUT_PIXEL'
  | 'CARRINHO_ABANDONADO'
  | 'VISITOU_NAO_COMPROU'
  | 'COMPRADORES_ANTERIORES'
  | 'CLIENTES_RECORRENTES'
  | 'GATEWAY_PAGAMENTOS'
  | 'CRM_PRODUTOR'
  | 'UTM_TRACKING';

export type SegmentationOperator =
  | 'EQUALS'
  | 'NOT_EQUALS'
  | 'CONTAINS'
  | 'GREATER_THAN'
  | 'LESS_THAN'
  | 'BETWEEN'
  | 'LAST_N_DAYS'
  | 'EXISTS';

export type SegmentationDimension =
  | 'evento_id'
  | 'sessao_id'
  | 'interacao'
  | 'utm_source'
  | 'utm_medium'
  | 'utm_campaign'
  | 'visita_sem_compra'
  | 'carrinho_abandonado'
  | 'checkout_iniciado'
  | 'pedido_pago'
  | 'quantidade_ingressos'
  | 'ticket_medio_cents'
  | 'dias_ultima_compra'
  | 'consentimento_whatsapp'
  | 'consentimento_email'
  | 'opt_out';

export interface SegmentationRule {
  id: string;
  dimensao: SegmentationDimension;
  operador: SegmentationOperator;
  valor: string | number | boolean;
  valorSecundario?: string | number;
}

export interface SegmentationGroup {
  id: string;
  conjuncao: 'AND' | 'OR';
  regras: SegmentationRule[];
}

export interface AudienceProviderSync {
  provider: 'META' | 'GOOGLE' | 'TIKTOK' | 'SPOTIFY';
  externalAudienceId?: string;
  status: 'SINCRONIZADO' | 'PENDENTE' | 'ERRO' | 'NAO_SUPORTADO';
  ultimoSyncEm?: string;
  tamanhoRetornado?: number;
  mensagemErro?: string;
  capabilitySuportada: boolean;
}

export interface Audience {
  id: string;
  nome: string;
  descricao?: string;
  eventoId: string;
  eventoNome?: string;
  produtorId?: string;
  tipo: AudienceType;
  origem: AudienceOrigin;
  tamanhoEstimado?: number;
  tamanhoCalculado?: number;
  statusCalculo: 'CALCULADO' | 'CALCULANDO' | 'AGUARDANDO_DADOS';
  status: 'ATIVO' | 'ARQUIVADO' | 'PROCESSANDO';
  segmentacao: {
    conjuncaoPrincipal: 'AND' | 'OR';
    grupos: SegmentationGroup[];
  };
  provedoresSync?: AudienceProviderSync[];
  criadoEm: string;
  atualizadoEm: string;
  ultimaAtivacao?: string;
}

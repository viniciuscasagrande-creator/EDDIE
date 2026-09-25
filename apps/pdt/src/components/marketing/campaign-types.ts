// apps/pdt/src/components/marketing/campaign-types.ts
// Tipos unificados para Campanhas Multicanais, Execuções por Provider e Workspace Operacional

export type CampaignStatus =
  | 'RASCUNHO'
  | 'VALIDANDO'
  | 'AGENDADA'
  | 'EM_ANALISE'
  | 'ATIVA'
  | 'PAUSADA'
  | 'ERRO'
  | 'REJEITADA'
  | 'ENCERRADA';

export type MarketingChannel =
  | 'META'
  | 'GOOGLE'
  | 'TIKTOK'
  | 'SPOTIFY'
  | 'WHATSAPP'
  | 'EMAIL';

export interface ProviderExecution {
  provider: MarketingChannel;
  channelName?: string;
  externalId?: string;
  status:
    | 'ATIVA'
    | 'PAUSADA'
    | 'EM_ANALISE'
    | 'REJEITADA'
    | 'DESCONECTADO'
    | 'ERRO'
    | 'AGENDADA'
    | 'CONCLUIDA'
    | 'RASCUNHO'
    | 'ENCERRADA'
    | CampaignStatus;
  lastSyncAt?: string;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  spendCents?: number;
  revenueCents?: number;
  roas?: string;
  cpaCents?: number;
  errorCode?: string;
  errorMessage?: string;
  capabilities?: string[];
}

export interface CampaignAudience {
  id: string;
  tipo: 'INTERESSES' | 'LOOKALIKE' | 'VISITANTES' | 'LISTA_VIP_CRM' | 'RETARGETING_GERAL';
  nome: string;
  tamanhoEstimado?: number;
  descricao?: string;
  alcanceEstimado?: number;
  canais?: MarketingChannel[];
}

export interface CampaignCreativeRef {
  id: string;
  nome: string;
  tipo: 'IMAGEM' | 'VIDEO' | 'AUDIO' | 'TEXTO' | 'COMBINADO';
  formato?: string;
  headline?: string;
  copy?: string;
  cta?: string;
  canal?: MarketingChannel;
  assetUrl?: string;
  previewUrl?: string;
}

export interface CampaignHistoryLog {
  id: string;
  timestamp: string;
  usuario?: string;
  autor?: string;
  acao: string;
  descricao?: string;
  detalhes?: any;
}

export interface DetailedCampaign {
  id: string;
  nome: string;
  eventoId: string;
  eventoNome?: string;
  produtorId?: string;
  status: CampaignStatus;
  objetivo: 'CONVERSAO' | 'RECONHECIMENTO' | 'TRAFEGO' | 'LEADS_VIP' | string;
  canais: MarketingChannel[];
  canal?: string;
  orcamentoTipo: 'DIARIO' | 'TOTAL';
  orcamentoTotalCents?: number;
  orcamentoGastoCents?: number;
  orcamentoValorCents?: number;
  gastoTotalCents?: number;
  orcamentoDiarioCents?: number;
  dataInicio: string;
  dataTermino: string;
  continuoAteVirada?: boolean;
  estrategiaLance?: 'MENOR_CUSTO' | 'ROAS_ALVO';
  
  // Execuções por Provider (isolamento de falhas)
  executions?: ProviderExecution[];
  providerExecutions?: ProviderExecution[];
  
  // Rastreamento e UTMs
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  urlDestino?: string;
  urlRastreavel?: string;
  pixelId?: string;
  pixelAssociado?: string;

  // Públicos e Criativos Vinculados
  publicos?: CampaignAudience[];
  audiences?: CampaignAudience[];
  criativos?: CampaignCreativeRef[];
  creatives?: CampaignCreativeRef[];

  // Métricas Consolidadas Reais
  impressoes: number;
  cliques: number;
  ctr?: string;
  conversoes: number;
  receitaAtribuidaCents: number;
  roas: string;
  cpaCents: number;
  fonteMetricas?: string;
  ultimaSincronizacao?: string;

  // Diagnóstico de Integridade
  diagnostico?: {
    saudeGeral: 'EXCELENTE' | 'ATENCAO' | 'CRITICO';
    errosAtivos: string[];
    avisos: string[];
    capiStatus: 'SINCRONIZADO' | 'PENDENTE' | 'DESABILITADO';
    webhookStatus: 'ATIVO' | 'FALHANDO';
  };

  // Histórico Imutável de Auditoria
  historico?: CampaignHistoryLog[];
  historyLogs?: CampaignHistoryLog[];
  criadoEm?: string;
  atualizadoEm?: string;
}

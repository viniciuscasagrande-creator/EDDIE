// apps/pdt/src/components/marketing/creative-types.ts
// Tipos e interfaces para a Central de Criativos Multicanal

export type CreativeType = 'IMAGEM' | 'VIDEO' | 'AUDIO' | 'TEXTO' | 'COMBINADO';

export type CreativeFormat =
  | 'FEED_1_1'
  | 'STORIES_REELS_9_16'
  | 'BANNER_16_9'
  | 'AUDIO_SPOT_30S'
  | 'TEXT_COPY'
  | 'CARROSSEL_MULTI';

export interface Creative {
  id: string;
  eventoId: string;
  eventoNome?: string;
  produtorId?: string;
  nome: string;
  tipo: CreativeType;
  formato: CreativeFormat;
  canais: Array<'META' | 'GOOGLE' | 'TIKTOK' | 'SPOTIFY' | 'WHATSAPP' | 'EMAIL'>;
  titulo?: string;
  headline?: string;
  texto?: string;
  cta?: string;
  destinationUrl?: string;
  urlDestino?: string;
  assetUrl?: string;
  assetPreviewUrl?: string;
  previewUrl?: string;
  duracaoSegundos?: number;
  dimensoes?: string;
  tamanhoBytes?: number;
  tags?: string[];
  status: 'ATIVO' | 'RASCUNHO' | 'ARQUIVADO' | 'APROVADO' | 'EM_ANALISE' | 'REJEITADO';
  campanhasVinculadasCount: number;
  campanhasVinculadas?: Array<{ id: string; nome: string }>;
  metricas?: {
    impressoes?: number;
    cliques?: number;
    ctr?: string;
    conversoes?: number;
  };
  validacao?: {
    valido: boolean;
    mensagens: string[];
  };
  criadoEm: string;
  atualizadoEm: string;
}

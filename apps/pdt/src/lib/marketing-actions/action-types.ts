export type ActionPhase = 'IDLE' | 'CONFIRMING' | 'PROCESSING' | 'SUCCESS' | 'ERROR';

export type Provider = 'META' | 'GOOGLE' | 'TIKTOK' | 'SPOTIFY' | 'WHATSAPP' | 'EMAIL';

export type MarketingAction =
  | 'CONNECT'
  | 'RECONNECT'
  | 'DISCONNECT'
  | 'SYNC'
  | 'TEST_CONNECTION'
  | 'CREATE_CAMPAIGN'
  | 'SAVE_DRAFT'
  | 'PUBLISH'
  | 'EDIT'
  | 'DUPLICATE'
  | 'PAUSE'
  | 'RESUME'
  | 'STOP'
  | 'CREATE_AUDIENCE'
  | 'CREATE_CREATIVE'
  | 'UPDATE_BUDGET'
  | 'CONFIGURE_TRACKING'
  | 'TEST_EVENT'
  | 'DIAGNOSE'
  | 'VIEW_LOGS'
  | 'EXPORT'
  | 'REFRESH_METRICS'
  | 'CREATE_UTM'
  | 'GENERATE_QR'
  | 'RECOVER_CART'
  | 'SEND_WHATSAPP'
  | 'SEND_EMAIL';

export interface ActionMetadata {
  label: string;
  description: string;
  isDangerous?: boolean;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

export const ACTION_METADATA: Record<MarketingAction, ActionMetadata> = {
  CONNECT: {
    label: 'Conectar Conta',
    description: 'Inicia o fluxo OAuth e vinculação da conta do anunciante.',
  },
  RECONNECT: {
    label: 'Reconectar Conta',
    description: 'Renova tokens expirados de acesso da plataforma.',
    requiresConfirmation: true,
    confirmationMessage: 'Deseja reconectar a conta da plataforma e atualizar as permissões de acesso?',
  },
  DISCONNECT: {
    label: 'Desconectar Conta',
    description: 'Remove a vinculação do anunciante com o EDDIE.',
    isDangerous: true,
    requiresConfirmation: true,
    confirmationMessage: 'ATENÇÃO: Desconectar a conta pausará a sincronização em tempo real de campanhas e conversões. Deseja prosseguir?',
  },
  SYNC: {
    label: 'Sincronizar Métricas',
    description: 'Sincroniza custos, impressões, cliques e conversões diretamente do provider.',
  },
  TEST_CONNECTION: {
    label: 'Testar Conexão',
    description: 'Verifica latência, status de token e permissões de API.',
  },
  CREATE_CAMPAIGN: {
    label: 'Nova Campanha',
    description: 'Cria uma nova campanha com público, criativos e orçamento.',
  },
  SAVE_DRAFT: {
    label: 'Salvar Rascunho',
    description: 'Armazena a configuração local sem submissão ao provider.',
  },
  PUBLISH: {
    label: 'Publicar Campanha',
    description: 'Envia a campanha para aprovação e entrega no provider.',
    requiresConfirmation: true,
    confirmationMessage: 'Publicar a campanha iniciará a entrega e o consumo do orçamento programado. Confirmar publicação?',
  },
  EDIT: {
    label: 'Editar',
    description: 'Atualiza parâmetros de público, lance ou criativo.',
  },
  DUPLICATE: {
    label: 'Duplicar',
    description: 'Clona a estrutura completa da campanha para novos testes.',
  },
  PAUSE: {
    label: 'Pausar Campanha',
    description: 'Pausa imediatamente a entrega no provider remoto e reconcilia no EDDIE.',
    requiresConfirmation: true,
    confirmationMessage: 'Deseja pausar a veiculação desta campanha no provedor?',
  },
  RESUME: {
    label: 'Retomar Campanha',
    description: 'Reativa a entrega e veiculação da campanha no provider.',
    requiresConfirmation: true,
    confirmationMessage: 'Deseja retomar a veiculação ativa desta campanha?',
  },
  STOP: {
    label: 'Encerrar Campanha',
    description: 'Finaliza definitivamente a campanha no provedor (ação irreversível).',
    isDangerous: true,
    requiresConfirmation: true,
    confirmationMessage: 'ATENÇÃO: Encerrar a campanha é uma ação definitiva no provedor. O orçamento não utilizado será liberado. Deseja realmente encerrar?',
  },
  CREATE_AUDIENCE: {
    label: 'Criar Público',
    description: 'Gera audiência dinâmica a partir de compradores e abandono de checkout.',
  },
  CREATE_CREATIVE: {
    label: 'Criar Criativo',
    description: 'Cadastra criativo de imagem, carrossel, vídeo ou áudio.',
  },
  UPDATE_BUDGET: {
    label: 'Alterar Orçamento',
    description: 'Modifica o teto de investimento diário ou vitalício.',
    requiresConfirmation: true,
    confirmationMessage: 'Deseja aplicar a alteração de orçamento na campanha ativa?',
  },
  CONFIGURE_TRACKING: {
    label: 'Configurar Tracking',
    description: 'Configura Pixel, CAPI ou Measurement Protocol do evento.',
  },
  TEST_EVENT: {
    label: 'Testar Evento CAPI',
    description: 'Dispara payload de teste Server-Side e valida o retorno HTTP.',
  },
  DIAGNOSE: {
    label: 'Diagnóstico Geral',
    description: 'Executa varredura de saúde, rejeições de anúncios e entregabilidade.',
  },
  VIEW_LOGS: {
    label: 'Ver Logs de Transmissão',
    description: 'Exibe telemetria de disparos, payloads e webhooks recebidos.',
  },
  EXPORT: {
    label: 'Exportar Relatório',
    description: 'Gera relatório auditável em CSV ou PDF com carimbo de tempo.',
  },
  REFRESH_METRICS: {
    label: 'Atualizar Métricas',
    description: 'Recarrega KPIs em tempo real da visualização atual.',
  },
  CREATE_UTM: {
    label: 'Criar UTM Rastreável',
    description: 'Gera link parametrizado com origem, mídia, campanha e termo.',
  },
  GENERATE_QR: {
    label: 'Gerar QR Code SVG',
    description: 'Gera código QR dinâmico e vetorial para materiais gráficos.',
  },
  RECOVER_CART: {
    label: 'Recuperar Carrinho',
    description: 'Dispara ação imediata de resgate via WhatsApp 1-Clique ou E-mail.',
  },
  SEND_WHATSAPP: {
    label: 'Disparar WhatsApp',
    description: 'Envia template oficial aprovado pela Meta com botão de checkout.',
  },
  SEND_EMAIL: {
    label: 'Disparar E-mail',
    description: 'Envia e-mail transacional de urgência ou cupom com reserva.',
  },
};

export interface MarketingActionContext {
  produtorId?: string | null;
  eventoId?: string | null;
  campaignId?: string | null;
  provider?: Provider;
  payload?: any;
  [key: string]: any;
}

export interface MarketingActionResult {
  success: boolean;
  action: MarketingAction;
  provider?: Provider;
  correlationId: string;
  timestamp: string;
  data?: any;
  message: string;
  error?: string;
  statusReal?: {
    reconciledStatus: string;
    providerStatus: string;
    localStatus: string;
    lastSync: string;
  };
}

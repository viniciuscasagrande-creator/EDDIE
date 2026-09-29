// apps/pdt/src/lib/operacao-client.ts
// EDDIE 11.33 — Central de Operações, Monitoramento em Tempo Real & Incidentes

export type EstadoOperacional = 'NORMAL' | 'ATENCAO' | 'DEGRADADO' | 'CRITICO' | 'MANUTENCAO';
export type SeveridadeAlerta = 'INFORMATIVO' | 'BAIXO' | 'MEDIO' | 'ALTO' | 'CRITICO';
export type StatusAlerta = 'ABERTO' | 'RECONHECIDO' | 'SILENCIADO' | 'EM_INCIDENTE' | 'RESOLVIDO';
export type SeveridadeIncidente = 'P1_CRITICO' | 'P2_ALTO' | 'P3_MEDIO' | 'P4_BAIXO';
export type StatusIncidente =
  | 'ABERTO'
  | 'INVESTIGANDO'
  | 'IDENTIFICADO'
  | 'MITIGADO'
  | 'MONITORANDO'
  | 'RESOLVIDO'
  | 'FECHADO';

export interface HeaderCentralOperacoes {
  eventosEmOperacao: number;
  vendasUltimos5Min: number;
  pagamentosProcessando: number;
  alertasAtivos: number;
  incidentesAbertos: number;
  incidentesCriticos: number;
  ultimaAtualizacao: string;
}

export interface EventoOperacaoItem {
  eventoId: string;
  nome: string;
  produtorNome: string;
  cidadeUf: string;
  dataHora: string;
  situacaoGeral: EstadoOperacional;
  situacaoVendas: EstadoOperacional;
  situacaoPagamentos: EstadoOperacional;
  situacaoPortaria: EstadoOperacional;
  vendas5m: number;
  receitaTotalCents: number;
  ingressosVendidos: number;
  checkinsValidos: number;
  capacidadeTotal: number;
  ocupacaoPercent: number;
  alertasCount: number;
  incidenteAtivo?: {
    id: string;
    codigo: string;
    titulo: string;
    severidade: SeveridadeIncidente;
  };
}

export interface MetricasVendasOperacao {
  conversaoPercent: number;
  vendasPorMinuto: number;
  abandonoCarrinhoPercent: number;
  ticketMedioCents: number;
  pedidosUltimaHora: number;
  receitaUltimaHoraCents: number;
  ritmoVendas: Array<{
    minutosAtras: number;
    pedidos: number;
    gmvCents: number;
  }>;
}

export interface StatusAdquirente {
  adquirente: string;
  status: EstadoOperacional;
  taxaAprovacaoPercent: number;
  latenciaMediaMs: number;
  emContingencia: boolean;
  transacoesUltimos15m: number;
  falhasRecentes: number;
}

export interface MetricasPagamentosOperacao {
  taxaAprovacaoGeralPercent: number;
  latenciaMediaMs: number;
  pagamentosProcessando: number;
  pagamentosAprovados: number;
  pagamentosRecusados: number;
  adquirentes: StatusAdquirente[];
  pagamentosPorMetodo: Array<{
    metodo: 'PIX' | 'CREDITO' | 'DEBITO' | 'BOLETO';
    quantidade: number;
    volumeCents: number;
    taxaAprovacaoPercent: number;
  }>;
}

export interface MetricasInventarioOperacao {
  capacidadeTotal: number;
  vendidosTotal: number;
  holdsAtivos: number;
  holdsExpiradosSemConversao: number;
  riscoOversell: boolean;
  lotesCriticos: number;
  setoresComAlerta: Array<{
    setor: string;
    capacidade: number;
    vendidos: number;
    holds: number;
    ocupacaoPercent: number;
    alertaOversell: boolean;
  }>;
}

export interface PortaoOperacao {
  portao: string;
  checkinsValidos: number;
  checkinsRecusados: number;
  ritmoPorMinuto: number;
  situacao: EstadoOperacional;
  tempoEsperaFilaMin: number;
  catracasAtivas: number;
  catracasOffline: number;
}

export interface MetricasPortariaOperacao {
  checkinsValidos: number;
  checkinsRecusados: number;
  tentativasInvalidas: number;
  ritmoEntradaPorMinuto: number;
  tempoMedioValidacaoSegundos: number;
  modoContingenciaOfflineAtivo: boolean;
  motivosRecusa: Array<{
    motivo: string;
    quantidade: number;
  }>;
  portoes: PortaoOperacao[];
}

export interface DispositivoOperacao {
  id: string;
  identificador: string;
  nome: string;
  portaria: string;
  bateriaPercent: number;
  statusConectividade: 'ONLINE' | 'OFFLINE' | 'INSTAVEL';
  ultimaSincronizacao: string;
  leiturasValidas: number;
  leiturasRecusadas: number;
  alertaBateriaBaixa: boolean;
}

export interface IntegracaoExternaOperacao {
  id: string;
  nome: string;
  categoria: 'ADQUIRENCIA' | 'PIX_BACEN' | 'TRACKING_CAPI' | 'MENSAGERIA' | 'INFRA';
  status: EstadoOperacional;
  latenciaMs: number;
  taxaSucessoPercent: number;
  pedidosAfetados: number;
  gmvEmRiscoCents: number;
  ultimaFalha?: string;
  detalhes: string;
}

export interface FilasEProcessamentoOperacao {
  outboxPendente: number;
  outboxAtrasado: number;
  deadLetterQueue: number;
  workersAtivos: number;
  taxaProcessamentoPorSegundo: number;
  filas: Array<{
    nome: string;
    tamanho: number;
    latenciaMediaMs: number;
    mensagensFalhas: number;
    status: EstadoOperacional;
  }>;
}

export interface AlertaOperacionalDto {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  severidade: SeveridadeAlerta;
  categoria: string;
  status: StatusAlerta;
  contagemSinais: number;
  chaveCorrelacao: string;
  primeiraOcorrencia: string;
  ultimaOcorrencia: string;
  eventoId?: string;
  silenciadoAte?: string;
  motivoSilenciamento?: string;
  responsavelId?: string;
  reconhecidoPor?: string;
  reconhecidoEm?: string;
  incidenteId?: string;
}

export interface IncidenteOperacionalDto {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  severidade: SeveridadeIncidente;
  status: StatusIncidente;
  coordenadorId?: string;
  responsavelTecnicoId?: string;
  responsavelOperacionalId?: string;
  responsavelComunicacaoId?: string;
  sistemasAfetados: string[];
  eventosAfetados: string[];
  pedidosRepresados: number;
  gmvEmRiscoCentavos: number;
  publicoAfetadoPortaria: number;
  problemaId?: string;
  iniciadoEm: string;
  mitigadoEm?: string;
  resolvidoEm?: string;
  fechadoEm?: string;
  duracaoMinutos: number;
  atualizacoes: Array<{
    id: string;
    autorNome: string;
    tipo: string;
    mensagem: string;
    payload?: unknown;
    timestamp: string;
  }>;
  procedimentos: Array<{
    id: string;
    nome: string;
    tipo: string;
    status: 'PENDENTE' | 'EXECUTANDO' | 'SUCESSO' | 'FALHOU';
    executadoPor?: string;
    resultado?: string;
    executadoEm?: string;
  }>;
}

export interface PosIncidenteDto {
  id: string;
  incidenteId: string;
  codigoIncidente: string;
  titulo: string;
  resumoExecutivo: string;
  linhaDoTempoOficial: Array<{
    timestamp: string;
    fato: string;
    evidencia: string;
  }>;
  hipotesesDescartadas: Array<{
    hipotese: string;
    motivoDescarte: string;
  }>;
  causaRaizConfirmada: string;
  evidenciasCausaRaiz: string[];
  impactoFinanceiroFinalCents: number;
  gmvRecuperadoCents: number;
  licoesAprendidas: string[];
  acoesCorretivas: Array<{
    acao: string;
    responsavel: string;
    prazo: string;
    regraAutomacaoSugeridaId?: string;
    status: 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA';
  }>;
  auditorId: string;
  aprovadoPor?: string;
  concluidoEm: string;
}

export interface ProblemaOperacionalDto {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  categoria: string;
  status: string;
  solucaoContorno?: string;
  solucaoDefinitiva?: string;
  totalIncidentesAssociados: number;
  createdAt: string;
  updatedAt: string;
}

export interface IndicadoresOperacionaisDto {
  mttdMinutos: number;
  mttrMinutos: number;
  mtbfHoras: number;
  slaDisponibilidadePercent: number;
  taxaRecorrenciaIncidentesPercent: number;
  totalIncidentesMes: number;
  incidentesPorSeveridade: {
    p1: number;
    p2: number;
    p3: number;
    p4: number;
  };
}

export interface SnapshotCentralOperacoes {
  header: HeaderCentralOperacoes;
  eventos: EventoOperacaoItem[];
  metricasVendas: MetricasVendasOperacao;
  metricasPagamentos: MetricasPagamentosOperacao;
  metricasInventario: MetricasInventarioOperacao;
  metricasPortaria: MetricasPortariaOperacao;
  dispositivos: DispositivoOperacao[];
  integracoes: IntegracaoExternaOperacao[];
  filasEProcessamento: FilasEProcessamentoOperacao;
  alertas: AlertaOperacionalDto[];
  incidentes: IncidenteOperacionalDto[];
  indicadores: IndicadoresOperacionaisDto;
}

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${errorText || res.statusText}`);
  }

  return res.json();
}

export const OperacaoClient = {
  // Snapshot consolidado da sala de controle (NOC)
  async obterSnapshotCentral(): Promise<SnapshotCentralOperacoes> {
    return fetchJson<SnapshotCentralOperacoes>(`${API_BASE}/operacao/central/snapshot`);
  },

  // Alertas
  async listarAlertas(): Promise<AlertaOperacionalDto[]> {
    return fetchJson<AlertaOperacionalDto[]>(`${API_BASE}/operacao/alertas`);
  },

  async reconhecerAlerta(id: string): Promise<AlertaOperacionalDto> {
    return fetchJson<AlertaOperacionalDto>(`${API_BASE}/operacao/alertas/${id}/reconhecer`, {
      method: 'POST',
    });
  },

  async silenciarAlerta(id: string, minutos: number = 30, motivo: string = 'Investigação operacional'): Promise<AlertaOperacionalDto> {
    return fetchJson<AlertaOperacionalDto>(`${API_BASE}/operacao/alertas/${id}/silenciar`, {
      method: 'POST',
      body: JSON.stringify({ minutos, motivo }),
    });
  },

  async associarAlertaIncidente(id: string, incidenteId: string): Promise<AlertaOperacionalDto> {
    return fetchJson<AlertaOperacionalDto>(`${API_BASE}/operacao/alertas/${id}/associar-incidente`, {
      method: 'POST',
      body: JSON.stringify({ incidenteId }),
    });
  },

  async escalarAlertaParaIncidente(id: string, data: { titulo: string; severidade: SeveridadeIncidente; coordenadorId?: string }): Promise<IncidenteOperacionalDto> {
    return fetchJson<IncidenteOperacionalDto>(`${API_BASE}/operacao/alertas/${id}/escalar-incidente`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Incidentes & War Room
  async listarIncidentes(): Promise<IncidenteOperacionalDto[]> {
    return fetchJson<IncidenteOperacionalDto[]>(`${API_BASE}/operacao/incidentes`);
  },

  async obterIncidente(id: string): Promise<IncidenteOperacionalDto> {
    return fetchJson<IncidenteOperacionalDto>(`${API_BASE}/operacao/incidentes/${id}`);
  },

  async atualizarStatusIncidente(id: string, status: StatusIncidente, autorNome: string, mensagem: string): Promise<IncidenteOperacionalDto> {
    return fetchJson<IncidenteOperacionalDto>(`${API_BASE}/operacao/incidentes/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, autorNome, mensagem }),
    });
  },

  async executarProcedimento(id: string): Promise<{ procedimentoId: string; nome: string; status: string; resultado: string }> {
    return fetchJson(`${API_BASE}/operacao/procedimentos/${id}/executar`, {
      method: 'POST',
    });
  },

  // Pós-incidente (RCA) & Problemas ITIL
  async obterPosIncidente(incidenteId: string): Promise<PosIncidenteDto> {
    return fetchJson<PosIncidenteDto>(`${API_BASE}/operacao/incidentes/${incidenteId}/pos-incidente`);
  },

  async registrarPosIncidente(incidenteId: string, data: Partial<PosIncidenteDto>): Promise<PosIncidenteDto> {
    return fetchJson<PosIncidenteDto>(`${API_BASE}/operacao/incidentes/${incidenteId}/pos-incidente`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async listarProblemas(): Promise<ProblemaOperacionalDto[]> {
    return fetchJson<ProblemaOperacionalDto[]>(`${API_BASE}/operacao/problemas`);
  },

  // Sala de Evento ao Vivo
  async obterSalaEvento(eventoId: string) {
    return fetchJson(`${API_BASE}/eventos/${eventoId}/operacao/sala`);
  },

  async alternarContingenciaOffline(eventoId: string, ativar: boolean) {
    return fetchJson(`${API_BASE}/eventos/${eventoId}/operacao/contingencia-offline`, {
      method: 'POST',
      body: JSON.stringify({ ativar }),
    });
  },
};

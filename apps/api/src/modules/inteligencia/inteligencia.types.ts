export type TipoMeta = 'VENDAS' | 'PUBLICO' | 'RECEITA_DISK' | 'MARGEM_DISK' | 'CONVERSAO' | 'ROAS';
export type CategoriaAlerta = 'FINANCEIRO' | 'VENDAS' | 'INVENTARIO' | 'OPERACAO' | 'MARKETING' | 'RELACIONAMENTO';
export type SeveridadeAlerta = 'CRITICA' | 'ALTA' | 'MEDIA' | 'INFORMATIVA';
export type CategoriaOportunidade = 'ESGOTAMENTO_LOTE' | 'PUBLICO_RECORRENTE' | 'PAGAMENTOS_RECUPERAVEIS' | 'CANAL_ALTA_MARGEM';
export type PapelUsuarioContexto = 'ADMINISTRADOR' | 'FINANCEIRO' | 'COMERCIAL' | 'MARKETING' | 'PRODUTOR';

// ============================================================================
// 11.30.1 — RENTABILIDADE REAL
// ============================================================================

export interface DecomposicaoRentabilidadeReal {
  eventoId: string;
  eventoNome: string;
  produtorId: string;
  produtorNome: string;
  vendasBrutas: number;
  cancelamentosEstornos: number;
  chargebacks: number;
  gmvLiquido: number;
  receitaContratualDisk: number;
  takeRateContratualPct: number;
  custosAdquirencia: number;
  custosAdquirenciaPct: number;
  comissoesParceiros: number;
  custosAtribuiveisOperacao: number;
  resultadoOperacaoDisk: number;
  margemDiskPct: number;
}

export interface RentabilidadePorDimensaoItem {
  dimensaoId: string;
  nome: string;
  gmvLiquido: number;
  receitaDisk: number;
  custosTotais: number;
  margemDisk: number;
  margemPct: number;
}

export interface RentabilidadePorAdquirenteItem {
  adquirente: string;
  volumeProcessado: number;
  custoTotalMdr: number;
  custoPorMilhao: number;
  taxaMediaMdrPct: number;
}

export interface RentabilidadePorLoteItem {
  loteId: string;
  nomeLote: string;
  precoUnitario: number;
  ingressosVendidos: number;
  gmvTotal: number;
  receitaDisk: number;
  custosDiretos: number;
  margemDisk: number;
  margemPct: number;
}

export interface MargemPorIngressoMetricas {
  precoMedioIngresso: number;
  receitaDiskPorIngresso: number;
  custoFinanceiroPorIngresso: number;
  outrosCustosPorIngresso: number;
  margemDiskPorIngresso: number;
  margemPercentual: number;
}

export interface PontoEquilibrioDiskMetricas {
  pontoEquilibrioIngressos: number;
  ingressosVendidos: number;
  diferencaMargemSeguranca: number;
  atingiuPontoEquilibrio: boolean;
  receitaMinimaNecessaria: number;
  receitaDiskRealizada: number;
}

// ============================================================================
// 11.30.2 — INTELIGÊNCIA DE RECEITA
// ============================================================================

export interface VelocidadeVendasMetricas {
  ultimaHora: number;
  ultimas6Horas: number;
  ultimas24Horas: number;
  ultimos7Dias: number;
  variacao24hVsMedia7DiasPct: number;
  tendencia: 'ACELERADA' | 'ESTAVEL' | 'DESACELERADA';
  textoDescritivo: string;
}

export interface PrevisaoEsgotamentoMetricas {
  disponibilidadeRestante: number;
  ritmoVendasPorDia: number;
  diasEstimadosAteEsgotamento: number;
  diasAteEvento: number;
  probabilidadeEsgotamentoAntesEventoPct: number;
  alertaRiscoEsgotamentoPrecoce: boolean;
  recomendacaoTexto: string;
}

export interface InteligenciaLoteItem {
  loteId: string;
  nome: string;
  capacidadeTotal: number;
  ingressosVendidos: number;
  utilizacaoPct: number;
  velocidade: 'ALTA' | 'MEDIA' | 'BAIXA';
  acaoRecomendada?: string;
  proximoLoteDisponivel: boolean;
}

export interface SimulacaoPrecoDto {
  loteId?: string;
  precoAtual: number;
  precoProposto: number;
  disponibilidadeRestante: number;
}

export interface CenariosSimulacaoPreco {
  precoAtual: number;
  precoProposto: number;
  variacaoPrecoPct: number;
  disponibilidadeRestante: number;
  cenarioConservador: {
    projecaoVendas: number;
    projecaoReceitaTotal: number;
    projecaoMargemDisk: number;
    premissa: string;
  };
  cenarioBase: {
    projecaoVendas: number;
    projecaoReceitaTotal: number;
    projecaoMargemDisk: number;
    premissa: string;
  };
  cenarioOtimista: {
    projecaoVendas: number;
    projecaoReceitaTotal: number;
    projecaoMargemDisk: number;
    premissa: string;
  };
  notaLegal: string;
}

export interface PrecoPerformanceCanalItem {
  canal: string;
  conversaoPct: number;
  ticketMedio: number;
  margemPct: number;
  volumeVendido: number;
}

export interface OportunidadesEPerdasClassificadas {
  totalPerdasIdentificadas: number;
  perdasPorNatureza: {
    categoria: string;
    natureza: string;
    valor: number;
    recuperavel: boolean;
  }[];
  receitaRecuperadaRemarketing: {
    totalRecuperado: number;
    tentativasRecuperadas: number;
    taxaRecuperacaoPct: number;
    detalhes: string;
  };
}

// ============================================================================
// 11.30.3 — INTELIGÊNCIA DO PRODUTOR
// ============================================================================

export interface CabecalhoProdutor360 {
  produtorId: string;
  razaoSocial: string;
  nomeFantasia: string;
  relacionamentoDesde: string;
  eventosRealizados: number;
  eventosAtivos: number;
  gmvHistorico: number;
  publicoValidadoTotal: number;
  receitaTotalDiskHistorica?: number; // Visão DiskIngressos
  saldoAtualDisponivel: number;
  exposicaoRisco: 'BAIXA' | 'MODERADA' | 'ALTA';
}

export interface LinhaTempoEventoItem {
  ano: number;
  eventos: {
    eventoId: string;
    eventoNome: string;
    dataEvento: string;
    vendasTotais: number;
    publicoValidado: number;
    comparecimentoPct: number;
    receitaDisk?: number; // Ocultado para produtor
    margemDisk?: number;  // Ocultado para produtor
  }[];
}

export interface ComportamentoFinanceiroProdutor {
  saldoDisponivel: number;
  saldoBloqueadoReserva: number;
  agendaRepassesPendentes: number;
  antecipacoesEmAberto: number;
  taxaEstornoHistoricaPct: number;
  taxaChargebackHistoricaPct: number;
  statusConciliacaoBancaria: 'EM_CONFORMIDADE' | 'PENDENCIAS';
  exposicaoFinanceiraTotal: number;
}

export interface DesempenhoPublicoProdutor {
  ingressosVendidosTotal: number;
  publicoValidadoPortaria: number;
  comparecimentoMedioPct: number;
  taxaRecorrenciaPublicoPct: number;
  publicoFielIdentificado: number;
}

export interface DesempenhoMarketingProdutor {
  investimentoTotal: number;
  impressoesTotais: number;
  cliquesTotais: number;
  conversoesTotais: number;
  vendasAtribuidas: number;
  cpaMedio: number;
  roasMedio: number;
}

export interface IndicadoresSaudeRelacionamento {
  operacao: { score: number; status: 'EXCELENTE' | 'ESTAVEL' | 'ATENCAO'; detalhe: string };
  financeiro: { score: number; status: 'EXCELENTE' | 'ESTAVEL' | 'ATENCAO'; detalhe: string };
  vendas: { score: number; status: 'EXCELENTE' | 'ESTAVEL' | 'ATENCAO'; detalhe: string };
  publico: { score: number; status: 'EXCELENTE' | 'ESTAVEL' | 'ATENCAO'; detalhe: string };
  atendimento: { score: number; status: 'EXCELENTE' | 'ESTAVEL' | 'ATENCAO'; detalhe: string };
  risco: { score: number; status: 'EXCELENTE' | 'ESTAVEL' | 'ATENCAO'; detalhe: string };
}

export interface AlertaInteligenciaItem {
  id: string;
  categoria: CategoriaAlerta;
  severidade: SeveridadeAlerta;
  titulo: string;
  descricao: string;
  explicabilidade: {
    porQueEstouVendoIsso: string[];
    origemMetrica: string;
    acaoRecomendada: string;
  };
  linkOrigem: string;
  dataCriacao: string;
}

export interface OportunidadeAcionavelItem {
  id: string;
  categoria: CategoriaOportunidade;
  titulo: string;
  descricao: string;
  impactoEstimado: number;
  acaoSugerida: string;
  linkAcao: string;
}

export interface ComparativoHistoricoEdicoes {
  eventoAtualNome: string;
  eventoAnteriorNome: string;
  metricas: {
    metrica: string;
    edicaoAnterior: string | number;
    edicaoAtual: string | number;
    variacaoPct: number;
    favoravel: boolean;
  }[];
}

export interface MetasVsRealizadoVsPrevisao {
  periodo: string;
  vendas: { meta: number; realizado: number; previsao: number; atingimentoPct: number };
  publico: { meta: number; realizado: number; previsao: number; atingimentoPct: number };
  receitaDisk?: { meta: number; realizado: number; previsao: number; atingimentoPct: number }; // Interno
  margemDisk?: { meta: number; realizado: number; previsao: number; atingimentoPct: number };  // Interno
}

// ============================================================================
// PAINEL EXECUTIVO TRANSVERSAL
// ============================================================================

export interface PainelExecutivoInteligencia {
  periodoSelecionado: string;
  filtros: {
    produtorId?: string;
    eventoId?: string;
  };
  kpisTopo: {
    gmvTotal: number;
    receitaDiskTotal?: number; // Interno
    margemDiskTotal?: number;  // Interno
    margemMediaPct?: number;   // Interno
    publicoValidadoTotal: number;
    eventosAtivos: number;
  };
  metasPrevisao: MetasVsRealizadoVsPrevisao;
  rentabilidadeEventos: DecomposicaoRentabilidadeReal[];
  desempenhoCanais: PrecoPerformanceCanalItem[];
  alertasPrincipais: AlertaInteligenciaItem[];
  oportunidadesPrincipais: OportunidadeAcionavelItem[];
}

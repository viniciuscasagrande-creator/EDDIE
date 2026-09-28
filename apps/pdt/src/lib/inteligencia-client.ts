export type TipoMeta = 'VENDAS' | 'PUBLICO' | 'RECEITA_DISK' | 'MARGEM_DISK' | 'CONVERSAO' | 'ROAS';
export type CategoriaAlerta = 'FINANCEIRO' | 'VENDAS' | 'INVENTARIO' | 'OPERACAO' | 'MARKETING' | 'RELACIONAMENTO';
export type SeveridadeAlerta = 'CRITICA' | 'ALTA' | 'MEDIA' | 'INFORMATIVA';
export type CategoriaOportunidade = 'ESGOTAMENTO_LOTE' | 'PUBLICO_RECORRENTE' | 'PAGAMENTOS_RECUPERAVEIS' | 'CANAL_ALTA_MARGEM';
export type PapelUsuarioContexto = 'ADMINISTRADOR' | 'FINANCEIRO' | 'COMERCIAL' | 'MARKETING' | 'PRODUTOR';

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

export interface CabecalhoProdutor360 {
  produtorId: string;
  razaoSocial: string;
  nomeFantasia: string;
  relacionamentoDesde: string;
  eventosRealizados: number;
  eventosAtivos: number;
  gmvHistorico: number;
  publicoValidadoTotal: number;
  receitaTotalDiskHistorica?: number;
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
    receitaDisk?: number;
    margemDisk?: number;
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
  receitaDisk?: { meta: number; realizado: number; previsao: number; atingimentoPct: number };
  margemDisk?: { meta: number; realizado: number; previsao: number; atingimentoPct: number };
}

export interface PainelExecutivoInteligencia {
  periodoSelecionado: string;
  filtros: {
    produtorId?: string;
    eventoId?: string;
  };
  kpisTopo: {
    gmvTotal: number;
    receitaDiskTotal?: number;
    margemDiskTotal?: number;
    margemMediaPct?: number;
    publicoValidadoTotal: number;
    eventosAtivos: number;
  };
  metasPrevisao: MetasVsRealizadoVsPrevisao;
  rentabilidadeEventos: DecomposicaoRentabilidadeReal[];
  desempenhoCanais: PrecoPerformanceCanalItem[];
  alertasPrincipais: AlertaInteligenciaItem[];
  oportunidadesPrincipais: OportunidadeAcionavelItem[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function fetchFromApi<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': '00000000-0000-0000-0000-000000000001',
        ...(options.headers || {}),
      },
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export const InteligenciaClient = {
  async getPainelExecutivo(
    periodo = 'Setembro 2026',
    papelUsuario: PapelUsuarioContexto = 'ADMINISTRADOR',
    produtorId?: string,
    eventoId?: string,
  ): Promise<PainelExecutivoInteligencia> {
    const params = new URLSearchParams({ periodo, papelUsuario });
    if (produtorId) params.append('produtorId', produtorId);
    if (eventoId) params.append('eventoId', eventoId);

    const apiData = await fetchFromApi<PainelExecutivoInteligencia>(`/inteligencia/painel-executivo?${params.toString()}`);
    if (apiData) return apiData;

    const isInterno = papelUsuario !== 'PRODUTOR';
    const gmv = 2408000;
    const rec = 361200;
    const resOp = 247200;

    return {
      periodoSelecionado: periodo,
      filtros: { produtorId, eventoId },
      kpisTopo: {
        gmvTotal: gmv,
        receitaDiskTotal: isInterno ? rec : undefined,
        margemDiskTotal: isInterno ? resOp : undefined,
        margemMediaPct: isInterno ? 68.4 : undefined,
        publicoValidadoTotal: 10716,
        eventosAtivos: 3,
      },
      metasPrevisao: {
        periodo,
        vendas: { meta: 3000000, realizado: 2500000, previsao: 2850000, atingimentoPct: 83.3 },
        publico: { meta: 16000, realizado: 10716, previsao: 14500, atingimentoPct: 67.0 },
        receitaDisk: isInterno ? { meta: 420000, realizado: 361200, previsao: 405000, atingimentoPct: 86.0 } : undefined,
        margemDisk: isInterno ? { meta: 280000, realizado: 247200, previsao: 275000, atingimentoPct: 88.3 } : undefined,
      },
      rentabilidadeEventos: [
        {
          eventoId: eventoId || 'ev-1',
          eventoNome: 'Festival Exemplo 2026',
          produtorId: 'prod-t4f',
          produtorNome: 'T4F Entretenimento',
          vendasBrutas: 2500000,
          cancelamentosEstornos: 80000,
          chargebacks: 12000,
          gmvLiquido: 2408000,
          receitaContratualDisk: isInterno ? 361200 : 0,
          takeRateContratualPct: isInterno ? 15.0 : 0,
          custosAdquirencia: isInterno ? 71000 : 0,
          custosAdquirenciaPct: isInterno ? 2.95 : 0,
          comissoesParceiros: 25000,
          custosAtribuiveisOperacao: isInterno ? 18000 : 0,
          resultadoOperacaoDisk: isInterno ? 247200 : 0,
          margemDiskPct: isInterno ? 68.4 : 0,
        },
      ],
      desempenhoCanais: [
        { canal: 'Site DiskIngressos', conversaoPct: 8.4, ticketMedio: 162.0, margemPct: 21.0, volumeVendido: 10420 },
        { canal: 'Agências Parceiras (11.29.4)', conversaoPct: 14.2, ticketMedio: 149.0, margemPct: 15.0, volumeVendido: 2200 },
        { canal: 'Afiliados & Promoters', conversaoPct: 5.1, ticketMedio: 155.0, margemPct: 17.0, volumeVendido: 1400 },
        { canal: 'Bilheteria Presencial', conversaoPct: 22.0, ticketMedio: 138.0, margemPct: 12.0, volumeVendido: 800 },
      ],
      alertasPrincipais: [
        {
          id: 'alt-1',
          categoria: 'INVENTARIO',
          severidade: 'ALTA',
          titulo: 'Risco de esgotamento do Lote 2 antes da data prevista',
          descricao: 'Ritmo acelerado de vendas (410 ing/dia) com esgotamento provável em 8 dias.',
          explicabilidade: {
            porQueEstouVendoIsso: [
              'Vendas nas últimas 24h superaram em 34% a média dos 7 dias anteriores.',
              'Disponibilidade restante do lote está abaixo de 8% da capacidade total.',
              'Ainda restam 21 dias para a data do evento.',
            ],
            origemMetrica: 'Motor de Inventário (11.29.2) + Velocidade de Checkout (11.29.3)',
            acaoRecomendada: 'Avaliar abertura do Lote 3 para capturar demanda adicional sem canibalização.',
          },
          linkOrigem: '/inteligencia/receita',
          dataCriacao: new Date().toISOString(),
        },
        {
          id: 'alt-2',
          categoria: 'MARKETING',
          severidade: 'MEDIA',
          titulo: 'Conversão orgânica desacelerando — Sugerido reforço de remarketing',
          descricao: 'Taxa de abandono de checkout aumentou 4.2% nas últimas 48 horas.',
          explicabilidade: {
            porQueEstouVendoIsso: [
              'Média móvel de carrinhos abandonados atingiu R$ 62.000 no período.',
              'Campanha de Google Ads apresentou queda de CTR de 3.8% para 2.4%.',
            ],
            origemMetrica: 'Tracking CAPI Multi-pixel + Motor de Pagamentos',
            acaoRecomendada: 'Ativar fluxo automatizado de recuperação via WhatsApp e PIX Copia e Cola.',
          },
          linkOrigem: '/marketing/campanhas',
          dataCriacao: new Date().toISOString(),
        },
      ],
      oportunidadesPrincipais: [
        {
          id: 'opt-1',
          categoria: 'ESGOTAMENTO_LOTE',
          titulo: 'Evento próximo de esgotamento — Avaliar novo lote',
          descricao: 'Lote 2 atingiu 92,4% de venda. Abertura do Lote 3 pode capturar R$ 147.000 adicionais.',
          impactoEstimado: 147000,
          acaoSugerida: 'Simular e abrir Lote 3 com preço unitário de R$ 180,00.',
          linkAcao: '/inteligencia?aba=receita',
        },
        {
          id: 'opt-2',
          categoria: 'PUBLICO_RECORRENTE',
          titulo: 'Público recorrente identificado — 8.420 participantes elegíveis',
          descricao: 'Participantes com presença comprovada na edição anterior e consentimento LGPD ativo.',
          impactoEstimado: 85000,
          acaoSugerida: 'Disparar pré-venda exclusiva com taxa de conversão estimada em 18%.',
          linkAcao: '/pos-evento',
        },
      ],
    };
  },

  async getRentabilidadeReal(eventoId: string, papelUsuario: PapelUsuarioContexto = 'ADMINISTRADOR'): Promise<DecomposicaoRentabilidadeReal> {
    const apiData = await fetchFromApi<DecomposicaoRentabilidadeReal>(`/inteligencia/rentabilidade/${eventoId}?papelUsuario=${papelUsuario}`);
    if (apiData) return apiData;

    const isInterno = papelUsuario !== 'PRODUTOR';
    return {
      eventoId,
      eventoNome: 'Festival Exemplo 2026',
      produtorId: 'prod-t4f',
      produtorNome: 'T4F Entretenimento',
      vendasBrutas: 2500000,
      cancelamentosEstornos: 80000,
      chargebacks: 12000,
      gmvLiquido: 2408000,
      receitaContratualDisk: isInterno ? 361200 : 0,
      takeRateContratualPct: isInterno ? 15.0 : 0,
      custosAdquirencia: isInterno ? 71000 : 0,
      custosAdquirenciaPct: isInterno ? 2.95 : 0,
      comissoesParceiros: 25000,
      custosAtribuiveisOperacao: isInterno ? 18000 : 0,
      resultadoOperacaoDisk: isInterno ? 247200 : 0,
      margemDiskPct: isInterno ? 68.4 : 0,
    };
  },

  async getRentabilidadeDimensoes(eventoId: string, papelUsuario: PapelUsuarioContexto = 'ADMINISTRADOR') {
    const apiData = await fetchFromApi<{
      porCanal: RentabilidadePorDimensaoItem[];
      porFormaPagamento: RentabilidadePorDimensaoItem[];
      porAdquirente: RentabilidadePorAdquirenteItem[];
      porLote: RentabilidadePorLoteItem[];
    }>(`/inteligencia/rentabilidade/${eventoId}/dimensoes?papelUsuario=${papelUsuario}`);
    if (apiData) return apiData;

    return {
      porCanal: [
        { dimensaoId: 'can-1', nome: 'Site DiskIngressos', gmvLiquido: 1680000, receitaDisk: 252000, custosTotais: 68000, margemDisk: 184000, margemPct: 73.0 },
        { dimensaoId: 'can-2', nome: 'Agências Parceiras (11.29.4)', gmvLiquido: 380000, receitaDisk: 49400, custosTotais: 14200, margemDisk: 35200, margemPct: 71.2 },
        { dimensaoId: 'can-3', nome: 'Afiliados / Promoters', gmvLiquido: 228000, receitaDisk: 34200, custosTotais: 12500, margemDisk: 21700, margemPct: 63.4 },
        { dimensaoId: 'can-4', nome: 'Bilheteria Física', gmvLiquido: 120000, receitaDisk: 25600, custosTotais: 19300, margemDisk: 6300, margemPct: 24.6 },
      ],
      porFormaPagamento: [
        { dimensaoId: 'pag-pix', nome: 'PIX Direto (11.29.3)', gmvLiquido: 1180000, receitaDisk: 177000, custosTotais: 11800, margemDisk: 165200, margemPct: 93.3 },
        { dimensaoId: 'pag-cc-vista', nome: 'Cartão de Crédito à Vista', gmvLiquido: 620000, receitaDisk: 93000, custosTotais: 24800, margemDisk: 68200, margemPct: 73.3 },
        { dimensaoId: 'pag-cc-parc', nome: 'Cartão de Crédito Parcelado (2x-6x)', gmvLiquido: 608000, receitaDisk: 91200, custosTotais: 34400, margemDisk: 56800, margemPct: 62.3 },
      ],
      porAdquirente: [
        { adquirente: 'Adyen Global', volumeProcessado: 1200000, custoTotalMdr: 31200, custoPorMilhao: 26000, taxaMediaMdrPct: 2.60 },
        { adquirente: 'Cielo E-commerce', volumeProcessado: 750000, custoTotalMdr: 23250, custoPorMilhao: 31000, taxaMediaMdrPct: 3.10 },
        { adquirente: 'Rede Itaú', volumeProcessado: 458000, custoTotalMdr: 16550, custoPorMilhao: 36135, taxaMediaMdrPct: 3.61 },
      ],
      porLote: [
        { loteId: 'lt-1', nomeLote: 'Lote 1 (Promocional)', precoUnitario: 110.0, ingressosVendidos: 4000, gmvTotal: 440000, receitaDisk: 57200, custosDiretos: 46800, margemDisk: 10400, margemPct: 18.2 },
        { loteId: 'lt-2', nomeLote: 'Lote 2 (Pista & VIP)', precoUnitario: 145.0, ingressosVendidos: 4620, gmvTotal: 669900, receitaDisk: 93786, custosDiretos: 74653, margemDisk: 19133, margemPct: 20.4 },
        { loteId: 'lt-3', nomeLote: 'Lote 3 (Programado)', precoUnitario: 180.0, ingressosVendidos: 2096, gmvTotal: 377280, receitaDisk: 56592, custosDiretos: 43179, margemDisk: 13413, margemPct: 23.7 },
      ],
    };
  },

  async getMargemIngresso(eventoId: string, papelUsuario: PapelUsuarioContexto = 'ADMINISTRADOR'): Promise<MargemPorIngressoMetricas> {
    const apiData = await fetchFromApi<MargemPorIngressoMetricas>(`/inteligencia/rentabilidade/${eventoId}/margem-ingresso?papelUsuario=${papelUsuario}`);
    if (apiData) return apiData;

    return {
      precoMedioIngresso: 142.0,
      receitaDiskPorIngresso: 18.5,
      custoFinanceiroPorIngresso: 4.2,
      outrosCustosPorIngresso: 2.1,
      margemDiskPorIngresso: 12.2,
      margemPercentual: 65.9,
    };
  },

  async getPontoEquilibrio(eventoId: string): Promise<PontoEquilibrioDiskMetricas> {
    const apiData = await fetchFromApi<PontoEquilibrioDiskMetricas>(`/inteligencia/rentabilidade/${eventoId}/ponto-equilibrio`);
    if (apiData) return apiData;

    return {
      pontoEquilibrioIngressos: 12450,
      ingressosVendidos: 14820,
      diferencaMargemSeguranca: 2370,
      atingiuPontoEquilibrio: true,
      receitaMinimaNecessaria: 230325,
      receitaDiskRealizada: 274170,
    };
  },

  async getVelocidadeVendas(eventoId: string): Promise<VelocidadeVendasMetricas> {
    const apiData = await fetchFromApi<VelocidadeVendasMetricas>(`/inteligencia/receita/${eventoId}/velocidade`);
    if (apiData) return apiData;

    return {
      ultimaHora: 182,
      ultimas6Horas: 847,
      ultimas24Horas: 2940,
      ultimos7Dias: 8721,
      variacao24hVsMedia7DiasPct: 34.0,
      tendencia: 'ACELERADA',
      textoDescritivo: 'A velocidade de vendas das últimas 24 horas está 34% acima da média dos últimos sete dias.',
    };
  },

  async getPrevisaoEsgotamento(eventoId: string): Promise<PrevisaoEsgotamentoMetricas> {
    const apiData = await fetchFromApi<PrevisaoEsgotamentoMetricas>(`/inteligencia/receita/${eventoId}/esgotamento`);
    if (apiData) return apiData;

    return {
      disponibilidadeRestante: 3420,
      ritmoVendasPorDia: 410,
      diasEstimadosAteEsgotamento: 8,
      diasAteEvento: 21,
      probabilidadeEsgotamentoAntesEventoPct: 94.5,
      alertaRiscoEsgotamentoPrecoce: true,
      recomendacaoTexto: 'Mantido o ritmo recente, a disponibilidade atual pode se esgotar antes da data do evento.',
    };
  },

  async getInteligenciaLotes(eventoId: string): Promise<InteligenciaLoteItem[]> {
    const apiData = await fetchFromApi<InteligenciaLoteItem[]>(`/inteligencia/receita/${eventoId}/lotes`);
    if (apiData) return apiData;

    return [
      { loteId: 'lt-1', nome: 'Lote 1 (Promocional)', capacidadeTotal: 4000, ingressosVendidos: 4000, utilizacaoPct: 100.0, velocidade: 'BAIXA', proximoLoteDisponivel: false },
      { loteId: 'lt-2', nome: 'Lote 2 (Pista & VIP)', capacidadeTotal: 5000, ingressosVendidos: 4620, utilizacaoPct: 92.4, velocidade: 'ALTA', acaoRecomendada: 'Avaliar abertura do próximo lote.', proximoLoteDisponivel: true },
      { loteId: 'lt-3', nome: 'Lote 3 (Programado)', capacidadeTotal: 6000, ingressosVendidos: 0, utilizacaoPct: 0.0, velocidade: 'BAIXA', proximoLoteDisponivel: true },
    ];
  },

  async simularPreco(dto: SimulacaoPrecoDto): Promise<CenariosSimulacaoPreco> {
    const apiData = await fetchFromApi<CenariosSimulacaoPreco>('/inteligencia/receita/simular-preco', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    if (apiData) return apiData;

    const variacaoPrecoPct = Number((((dto.precoProposto - dto.precoAtual) / dto.precoAtual) * 100).toFixed(1));
    const volCons = Math.round(dto.disponibilidadeRestante * 0.72);
    const recCons = Number((volCons * dto.precoProposto).toFixed(2));
    const margCons = Number((recCons * 0.16).toFixed(2));

    const volBase = Math.round(dto.disponibilidadeRestante * 0.88);
    const recBase = Number((volBase * dto.precoProposto).toFixed(2));
    const margBase = Number((recBase * 0.18).toFixed(2));

    const volOtim = Math.round(dto.disponibilidadeRestante * 0.98);
    const recOtim = Number((volOtim * dto.precoProposto).toFixed(2));
    const margOtim = Number((recOtim * 0.20).toFixed(2));

    return {
      precoAtual: dto.precoAtual,
      precoProposto: dto.precoProposto,
      variacaoPrecoPct,
      disponibilidadeRestante: dto.disponibilidadeRestante,
      cenarioConservador: {
        projecaoVendas: volCons,
        projecaoReceitaTotal: recCons,
        projecaoMargemDisk: margCons,
        premissa: 'Queda de demanda de 28% devido à sensibilidade de preço em canais orgânicos.',
      },
      cenarioBase: {
        projecaoVendas: volBase,
        projecaoReceitaTotal: recBase,
        projecaoMargemDisk: margBase,
        premissa: 'Comportamento histórico estável de absorção gradual com 12% de desaceleração.',
      },
      cenarioOtimista: {
        projecaoVendas: volOtim,
        projecaoReceitaTotal: recOtim,
        projecaoMargemDisk: margOtim,
        premissa: 'Demanda inelástica sustentada por campanha ativa e proximidade da virada de lote.',
      },
      notaLegal: 'Projeções analíticas estimadas com base em séries temporais. Não constituem garantia contratual de receita.',
    };
  },

  async getOportunidadesEPerdas(eventoId: string): Promise<OportunidadesEPerdasClassificadas> {
    const apiData = await fetchFromApi<OportunidadesEPerdasClassificadas>(`/inteligencia/receita/${eventoId}/oportunidades-perdas`);
    if (apiData) return apiData;

    return {
      totalPerdasIdentificadas: 272000.0,
      perdasPorNatureza: [
        { categoria: 'PAGAMENTOS_RECUSADOS', natureza: 'Cartão sem limite / suspeita antifraude adquirente', valor: 87000.0, recuperavel: true },
        { categoria: 'CARRINHOS_ABANDONADOS', natureza: 'Sessão expirada sem checkout (11.29.2)', valor: 62000.0, recuperavel: true },
        { categoria: 'ESTORNOS', natureza: 'Direito de arrependimento (CDC 7 dias)', valor: 80000.0, recuperavel: false },
        { categoria: 'RESERVAS_EXPIRADAS', natureza: 'Holds liberados por TTL sem conversão', valor: 31000.0, recuperavel: true },
        { categoria: 'CHARGEBACKS', natureza: 'Contestação de titular na bandeira', valor: 12000.0, recuperavel: false },
      ],
      receitaRecuperadaRemarketing: {
        totalRecuperado: 24350.0,
        tentativasRecuperadas: 184,
        taxaRecuperacaoPct: 28.0,
        detalhes: 'R$ 24.350 recuperados via réguas automatizadas de retry PIX e link de checkout pós-recusa.',
      },
    };
  },

  async getVisaoProdutor360(produtorId: string, papelUsuario: PapelUsuarioContexto = 'ADMINISTRADOR') {
    const apiData = await fetchFromApi<{
      cabecalho: CabecalhoProdutor360;
      linhaDoTempo: LinhaTempoEventoItem[];
      financeiro: ComportamentoFinanceiroProdutor;
      publico: DesempenhoPublicoProdutor;
      marketing: DesempenhoMarketingProdutor;
      saudeRelacionamento: IndicadoresSaudeRelacionamento;
    }>(`/inteligencia/produtor/${produtorId}/visao-360?papelUsuario=${papelUsuario}`);
    if (apiData) return apiData;

    const isInterno = papelUsuario !== 'PRODUTOR';
    return {
      cabecalho: {
        produtorId,
        razaoSocial: 'Time For Fun Entretenimento S.A.',
        nomeFantasia: 'T4F Entretenimento',
        relacionamentoDesde: '2023',
        eventosRealizados: 18,
        eventosAtivos: 3,
        gmvHistorico: 18400000.0,
        publicoValidadoTotal: 124820,
        receitaTotalDiskHistorica: isInterno ? 2680000.0 : undefined,
        saldoAtualDisponivel: 412500.0,
        exposicaoRisco: 'BAIXA' as const,
      },
      linhaDoTempo: [
        {
          ano: 2024,
          eventos: [
            { eventoId: 'ev-2024-1', eventoNome: 'Festival de Primavera 2024', dataEvento: '14/10/2024', vendasTotais: 1450000.0, publicoValidado: 12800, comparecimentoPct: 91.0, receitaDisk: isInterno ? 217500.0 : undefined },
            { eventoId: 'ev-2024-2', eventoNome: 'Rock Arena Curitiba', dataEvento: '02/12/2024', vendasTotais: 980000.0, publicoValidado: 8400, comparecimentoPct: 87.0, receitaDisk: isInterno ? 147000.0 : undefined },
          ],
        },
        {
          ano: 2025,
          eventos: [
            { eventoId: 'ev-2025-1', eventoNome: 'Sunset Festival 2025', dataEvento: '18/11/2025', vendasTotais: 2100000.0, publicoValidado: 17200, comparecimentoPct: 93.0, receitaDisk: isInterno ? 315000.0 : undefined },
            { eventoId: 'ev-2025-2', eventoNome: 'Circuito Acústico MPB', dataEvento: '12/07/2025', vendasTotais: 560000.0, publicoValidado: 4800, comparecimentoPct: 89.0, receitaDisk: isInterno ? 84000.0 : undefined },
          ],
        },
        {
          ano: 2026,
          eventos: [
            { eventoId: 'ev-2026-1', eventoNome: 'Festival Exemplo 2026', dataEvento: '28/09/2026', vendasTotais: 2500000.0, publicoValidado: 10716, comparecimentoPct: 89.8, receitaDisk: isInterno ? 361200.0 : undefined },
            { eventoId: 'ev-2026-2', eventoNome: 'Arena Eletrônica Winter 2026', dataEvento: '15/11/2026', vendasTotais: 1850000.0, publicoValidado: 14200, comparecimentoPct: 92.5, receitaDisk: isInterno ? 277500.0 : undefined },
          ],
        },
      ],
      financeiro: {
        saldoDisponivel: 412500.0,
        saldoBloqueadoReserva: 150000.0,
        agendaRepassesPendentes: 240000.0,
        antecipacoesEmAberto: 80000.0,
        taxaEstornoHistoricaPct: 3.2,
        taxaChargebackHistoricaPct: 0.48,
        statusConciliacaoBancaria: 'EM_CONFORMIDADE' as const,
        exposicaoFinanceiraTotal: 390000.0,
      },
      publico: {
        ingressosVendidosTotal: 141200,
        publicoValidadoPortaria: 124820,
        comparecimentoMedioPct: 88.3,
        taxaRecorrenciaPublicoPct: 24.5,
        publicoFielIdentificado: 30580,
      },
      marketing: {
        investimentoTotal: 128000.0,
        impressoesTotais: 4850000,
        cliquesTotais: 194000,
        conversoesTotais: 13200,
        vendasAtribuidas: 2164000.0,
        cpaMedio: 9.7,
        roasMedio: 16.9,
      },
      saudeRelacionamento: {
        operacao: { score: 9.4, status: 'EXCELENTE' as const, detalhe: 'Portaria sem incidentes e check-in com fluidez acima de 98%.' },
        financeiro: { score: 9.1, status: 'EXCELENTE' as const, detalhe: 'Histórico de liquidação pontual e baixa taxa de chargeback (0.48%).' },
        vendas: { score: 8.8, status: 'ESTAVEL' as const, detalhe: 'Conversão acima de 8% nos canais proprietários e boa aderência de lote.' },
        publico: { score: 9.0, status: 'EXCELENTE' as const, detalhe: 'Taxa de comparecimento de 88.3% e 24% de público recorrente fidelizado.' },
        atendimento: { score: 8.6, status: 'ESTAVEL' as const, detalhe: 'Tempo médio de resolução do SAC em 42 minutos e SLA de 97%.' },
        risco: { score: 9.3, status: 'EXCELENTE' as const, detalhe: 'Exposição controlada e conformidade regulatória plena.' },
      },
    };
  },

  async getComparativoHistorico(eventoId: string): Promise<ComparativoHistoricoEdicoes> {
    const apiData = await fetchFromApi<ComparativoHistoricoEdicoes>(`/inteligencia/comparativo-historico/${eventoId}`);
    if (apiData) return apiData;

    return {
      eventoAtualNome: 'Festival Exemplo 2026',
      eventoAnteriorNome: 'Festival Exemplo 2025',
      metricas: [
        { metrica: 'GMV Bruto', edicaoAnterior: 'R$ 2.100.000', edicaoAtual: 'R$ 2.500.000', variacaoPct: 19.0, favoravel: true },
        { metrica: 'Ingressos Vendidos', edicaoAnterior: '13.200', edicaoAtual: '14.820', variacaoPct: 12.3, favoravel: true },
        { metrica: 'Ticket Médio', edicaoAnterior: 'R$ 159,00', edicaoAtual: 'R$ 168,70', variacaoPct: 6.1, favoravel: true },
        { metrica: 'Taxa de Comparecimento', edicaoAnterior: '87.2%', edicaoAtual: '89.8%', variacaoPct: 2.6, favoravel: true },
        { metrica: 'Taxa de Chargeback', edicaoAnterior: '0.62%', edicaoAtual: '0.48%', variacaoPct: -22.5, favoravel: true },
        { metrica: 'Receita Contratual Disk', edicaoAnterior: 'R$ 304.500', edicaoAtual: 'R$ 361.200', variacaoPct: 18.6, favoravel: true },
        { metrica: 'Margem Líquida Disk', edicaoAnterior: 'R$ 205.000', edicaoAtual: 'R$ 247.200', variacaoPct: 20.6, favoravel: true },
        { metrica: 'Custo de Adquirência Médio', edicaoAnterior: '3.15%', edicaoAtual: '2.95%', variacaoPct: -6.3, favoravel: true },
      ],
    };
  },

  async getAlertas(eventoId?: string, produtorId?: string): Promise<AlertaInteligenciaItem[]> {
    const params = new URLSearchParams();
    if (eventoId) params.append('eventoId', eventoId);
    if (produtorId) params.append('produtorId', produtorId);

    const apiData = await fetchFromApi<AlertaInteligenciaItem[]>(`/inteligencia/alertas?${params.toString()}`);
    if (apiData) return apiData;

    return [
      {
        id: 'alt-1',
        categoria: 'INVENTARIO',
        severidade: 'ALTA',
        titulo: 'Risco de esgotamento do Lote 2 antes da data prevista',
        descricao: 'Ritmo acelerado de vendas (410 ing/dia) com esgotamento provável em 8 dias.',
        explicabilidade: {
          porQueEstouVendoIsso: [
            'Vendas nas últimas 24h superaram em 34% a média dos 7 dias anteriores.',
            'Disponibilidade restante do lote está abaixo de 8% da capacidade total.',
            'Ainda restam 21 dias para a data do evento.',
          ],
          origemMetrica: 'Motor de Inventário (11.29.2) + Velocidade de Checkout (11.29.3)',
          acaoRecomendada: 'Avaliar abertura do Lote 3 para capturar demanda adicional sem canibalização.',
        },
        linkOrigem: '/inteligencia/receita',
        dataCriacao: new Date().toISOString(),
      },
      {
        id: 'alt-2',
        categoria: 'MARKETING',
        severidade: 'MEDIA',
        titulo: 'Conversão orgânica desacelerando — Sugerido reforço de remarketing',
        descricao: 'Taxa de abandono de checkout aumentou 4.2% nas últimas 48 horas.',
        explicabilidade: {
          porQueEstouVendoIsso: [
            'Média móvel de carrinhos abandonados atingiu R$ 62.000 no período.',
            'Campanha de Google Ads apresentou queda de CTR de 3.8% para 2.4%.',
          ],
          origemMetrica: 'Tracking CAPI Multi-pixel + Motor de Pagamentos',
          acaoRecomendada: 'Ativar fluxo automatizado de recuperação via WhatsApp e PIX Copia e Cola.',
        },
        linkOrigem: '/marketing/campanhas',
        dataCriacao: new Date().toISOString(),
      },
    ];
  },

  async getOportunidades(eventoId?: string, produtorId?: string): Promise<OportunidadeAcionavelItem[]> {
    const params = new URLSearchParams();
    if (eventoId) params.append('eventoId', eventoId);
    if (produtorId) params.append('produtorId', produtorId);

    const apiData = await fetchFromApi<OportunidadeAcionavelItem[]>(`/inteligencia/oportunidades?${params.toString()}`);
    if (apiData) return apiData;

    return [
      {
        id: 'opt-1',
        categoria: 'ESGOTAMENTO_LOTE',
        titulo: 'Evento próximo de esgotamento — Avaliar novo lote',
        descricao: 'Lote 2 atingiu 92,4% de venda. Abertura do Lote 3 pode capturar R$ 147.000 adicionais.',
        impactoEstimado: 147000,
        acaoSugerida: 'Simular e abrir Lote 3 com preço unitário de R$ 180,00.',
        linkAcao: '/inteligencia?aba=receita',
      },
      {
        id: 'opt-2',
        categoria: 'PUBLICO_RECORRENTE',
        titulo: 'Público recorrente identificado — 8.420 participantes elegíveis',
        descricao: 'Participantes com presença comprovada na edição anterior e consentimento LGPD ativo.',
        impactoEstimado: 85000,
        acaoSugerida: 'Disparar pré-venda exclusiva com taxa de conversão estimada em 18%.',
        linkAcao: '/pos-evento',
      },
    ];
  },
};

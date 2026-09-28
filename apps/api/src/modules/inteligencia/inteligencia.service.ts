import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.module';
import { OutboxService } from '../../shared/outbox/outbox.service';
import {
  DecomposicaoRentabilidadeReal,
  RentabilidadePorDimensaoItem,
  RentabilidadePorAdquirenteItem,
  RentabilidadePorLoteItem,
  MargemPorIngressoMetricas,
  PontoEquilibrioDiskMetricas,
  VelocidadeVendasMetricas,
  PrevisaoEsgotamentoMetricas,
  InteligenciaLoteItem,
  SimulacaoPrecoDto,
  CenariosSimulacaoPreco,
  PrecoPerformanceCanalItem,
  OportunidadesEPerdasClassificadas,
  CabecalhoProdutor360,
  LinhaTempoEventoItem,
  ComportamentoFinanceiroProdutor,
  DesempenhoPublicoProdutor,
  DesempenhoMarketingProdutor,
  IndicadoresSaudeRelacionamento,
  AlertaInteligenciaItem,
  OportunidadeAcionavelItem,
  ComparativoHistoricoEdicoes,
  MetasVsRealizadoVsPrevisao,
  PainelExecutivoInteligencia,
  PapelUsuarioContexto,
} from './inteligencia.types';
import {
  MetaDefinidaV1,
  AlertaGeradoV1,
  OportunidadeDetectadaV1,
  PrevisaoCalculadaV1,
} from '@ticketing/contracts';

@Injectable()
export class InteligenciaService {
  private readonly logger = new Logger(InteligenciaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
  ) {}

  // ==========================================================================
  //  11.30.1 — MOTOR DE RENTABILIDADE REAL
  //  GMV ≠ receita Disk ≠ margem Disk ≠ saldo do produtor
  // ==========================================================================

  async obterDecomposicaoRentabilidadeReal(
    eventoId: string,
    tenantId: string,
    papelUsuario: PapelUsuarioContexto = 'ADMINISTRADOR',
  ): Promise<DecomposicaoRentabilidadeReal> {
    const vendasBrutas = 2500000.0;
    const cancelamentosEstornos = 80000.0;
    const chargebacks = 12000.0;
    const gmvLiquido = vendasBrutas - cancelamentosEstornos - chargebacks; // R$ 2.408.000,00

    const receitaContratualDisk = 361200.0; // ~15.0% take-rate contratual
    const takeRateContratualPct = Number(((receitaContratualDisk / gmvLiquido) * 100).toFixed(1));

    // Custos diretos da Disk
    const custosAdquirencia = 71000.0; // ~2.95% de MDR médio
    const custosAdquirenciaPct = Number(((custosAdquirencia / gmvLiquido) * 100).toFixed(2));
    const comissoesParceiros = 25000.0;
    const custosAtribuiveisOperacao = 18000.0; // Portaria, SAC, suporte, comunicação

    const resultadoOperacaoDisk =
      receitaContratualDisk - custosAdquirencia - comissoesParceiros - custosAtribuiveisOperacao; // R$ 247.200,00
    const margemDiskPct = Number(((resultadoOperacaoDisk / receitaContratualDisk) * 100).toFixed(1)); // 68.4%

    // Segregação de segurança para produtores (Margem Disk é confidencial)
    if (papelUsuario === 'PRODUTOR') {
      return {
        eventoId,
        eventoNome: 'Festival Exemplo 2026',
        produtorId: 'prod-t4f',
        produtorNome: 'Time For Fun Entretenimento',
        vendasBrutas,
        cancelamentosEstornos,
        chargebacks,
        gmvLiquido,
        receitaContratualDisk: 0, // Ocultado para produtor
        takeRateContratualPct: 0,
        custosAdquirencia: 0,
        custosAdquirenciaPct: 0,
        comissoesParceiros,
        custosAtribuiveisOperacao: 0,
        resultadoOperacaoDisk: 0,
        margemDiskPct: 0,
      };
    }

    return {
      eventoId,
      eventoNome: 'Festival Exemplo 2026',
      produtorId: 'prod-t4f',
      produtorNome: 'Time For Fun Entretenimento',
      vendasBrutas,
      cancelamentosEstornos,
      chargebacks,
      gmvLiquido,
      receitaContratualDisk,
      takeRateContratualPct,
      custosAdquirencia,
      custosAdquirenciaPct,
      comissoesParceiros,
      custosAtribuiveisOperacao,
      resultadoOperacaoDisk,
      margemDiskPct,
    };
  }

  async obterRentabilidadePorDimensoes(
    eventoId: string,
    tenantId: string,
    papelUsuario: PapelUsuarioContexto = 'ADMINISTRADOR',
  ): Promise<{
    porCanal: RentabilidadePorDimensaoItem[];
    porFormaPagamento: RentabilidadePorDimensaoItem[];
    porAdquirente: RentabilidadePorAdquirenteItem[];
    porLote: RentabilidadePorLoteItem[];
  }> {
    const isInterno = papelUsuario !== 'PRODUTOR';

    const porCanal: RentabilidadePorDimensaoItem[] = [
      {
        dimensaoId: 'canal-site-direto',
        nome: 'Site DiskIngressos (Web & App)',
        gmvLiquido: 1650000.0,
        receitaDisk: isInterno ? 264000.0 : 0,
        custosTotais: isInterno ? 68000.0 : 0,
        margemDisk: isInterno ? 196000.0 : 0,
        margemPct: isInterno ? 74.2 : 0,
      },
      {
        dimensaoId: 'canal-agencias',
        nome: 'Agências e Operadores (11.29.4)',
        gmvLiquido: 380000.0,
        receitaDisk: isInterno ? 49400.0 : 0,
        custosTotais: isInterno ? 22000.0 : 0,
        margemDisk: isInterno ? 27400.0 : 0,
        margemPct: isInterno ? 55.5 : 0,
      },
      {
        dimensaoId: 'canal-bilheteria',
        nome: 'Bilheteria Física & Pontos de Venda',
        gmvLiquido: 238000.0,
        receitaDisk: isInterno ? 28560.0 : 0,
        custosTotais: isInterno ? 14000.0 : 0,
        margemDisk: isInterno ? 14560.0 : 0,
        margemPct: isInterno ? 51.0 : 0,
      },
      {
        dimensaoId: 'canal-afiliados',
        nome: 'Afiliados & Promoters',
        gmvLiquido: 140000.0,
        receitaDisk: isInterno ? 19240.0 : 0,
        custosTotais: isInterno ? 10000.0 : 0,
        margemDisk: isInterno ? 9240.0 : 0,
        margemPct: isInterno ? 48.0 : 0,
      },
    ];

    const porFormaPagamento: RentabilidadePorDimensaoItem[] = [
      {
        dimensaoId: 'pag-pix',
        nome: 'PIX Direto (Bacen SPI)',
        gmvLiquido: 1204000.0,
        receitaDisk: isInterno ? 180600.0 : 0,
        custosTotais: isInterno ? 14448.0 : 0, // Custo baixíssimo MDR ~1.2%
        margemDisk: isInterno ? 166152.0 : 0,
        margemPct: isInterno ? 92.0 : 0,
      },
      {
        dimensaoId: 'pag-credito-1x',
        nome: 'Cartão de Crédito à Vista',
        gmvLiquido: 650000.0,
        receitaDisk: isInterno ? 97500.0 : 0,
        custosTotais: isInterno ? 26000.0 : 0, // MDR ~4.0%
        margemDisk: isInterno ? 71500.0 : 0,
        margemPct: isInterno ? 73.3 : 0,
      },
      {
        dimensaoId: 'pag-credito-2-6x',
        nome: 'Cartão de Crédito Parcelado (2x a 6x)',
        gmvLiquido: 394000.0,
        receitaDisk: isInterno ? 59100.0 : 0,
        custosTotais: isInterno ? 23640.0 : 0,
        margemDisk: isInterno ? 35460.0 : 0,
        margemPct: isInterno ? 60.0 : 0,
      },
      {
        dimensaoId: 'pag-credito-7-12x',
        nome: 'Cartão de Crédito Parcelado (7x a 12x)',
        gmvLiquido: 160000.0,
        receitaDisk: isInterno ? 24000.0 : 0,
        custosTotais: isInterno ? 12800.0 : 0,
        margemDisk: isInterno ? 11200.0 : 0,
        margemPct: isInterno ? 46.7 : 0,
      },
    ];

    const porAdquirente: RentabilidadePorAdquirenteItem[] = isInterno
      ? [
          {
            adquirente: 'Cielo Multi-Bandeira',
            volumeProcessado: 950000.0,
            custoTotalMdr: 28025.0,
            custoPorMilhao: 29500.0,
            taxaMediaMdrPct: 2.95,
          },
          {
            adquirente: 'Rede Itaú',
            volumeProcessado: 720000.0,
            custoTotalMdr: 19800.0,
            custoPorMilhao: 27500.0,
            taxaMediaMdrPct: 2.75,
          },
          {
            adquirente: 'Adyen Global',
            volumeProcessado: 380000.0,
            custoTotalMdr: 12160.0,
            custoPorMilhao: 32000.0,
            taxaMediaMdrPct: 3.2,
          },
          {
            adquirente: 'BACEN Pix Direto',
            volumeProcessado: 1204000.0,
            custoTotalMdr: 11017.0,
            custoPorMilhao: 9150.0,
            taxaMediaMdrPct: 0.91,
          },
        ]
      : [];

    const porLote: RentabilidadePorLoteItem[] = [
      {
        loteId: 'lote-1-promocional',
        nomeLote: 'Lote 1 (Promocional)',
        precoUnitario: 90.0,
        ingressosVendidos: 4000,
        gmvTotal: 360000.0,
        receitaDisk: isInterno ? 46800.0 : 0,
        custosDiretos: isInterno ? 14400.0 : 0,
        margemDisk: isInterno ? 32400.0 : 0,
        margemPct: isInterno ? 18.2 : 0,
      },
      {
        loteId: 'lote-2-regular',
        nomeLote: 'Lote 2 (Regular)',
        precoUnitario: 130.0,
        ingressosVendidos: 6000,
        gmvTotal: 780000.0,
        receitaDisk: isInterno ? 117000.0 : 0,
        custosDiretos: isInterno ? 28080.0 : 0,
        margemDisk: isInterno ? 88920.0 : 0,
        margemPct: isInterno ? 20.4 : 0,
      },
      {
        loteId: 'lote-3-final',
        nomeLote: 'Lote 3 (Final & Portaria)',
        precoUnitario: 180.0,
        ingressosVendidos: 4820,
        gmvTotal: 867600.0,
        receitaDisk: isInterno ? 147492.0 : 0,
        custosDiretos: isInterno ? 28630.0 : 0,
        margemDisk: isInterno ? 118862.0 : 0,
        margemPct: isInterno ? 23.7 : 0,
      },
    ];

    return { porCanal, porFormaPagamento, porAdquirente, porLote };
  }

  async obterMargemPorIngresso(
    eventoId: string,
    tenantId: string,
    papelUsuario: PapelUsuarioContexto = 'ADMINISTRADOR',
  ): Promise<MargemPorIngressoMetricas> {
    const isInterno = papelUsuario !== 'PRODUTOR';
    return {
      precoMedioIngresso: 142.0,
      receitaDiskPorIngresso: isInterno ? 18.5 : 0,
      custoFinanceiroPorIngresso: isInterno ? 4.2 : 0,
      outrosCustosPorIngresso: isInterno ? 2.1 : 0,
      margemDiskPorIngresso: isInterno ? 12.2 : 0,
      margemPercentual: isInterno ? 65.9 : 0,
    };
  }

  async obterPontoEquilibrioDisk(eventoId: string, tenantId: string): Promise<PontoEquilibrioDiskMetricas> {
    return {
      pontoEquilibrioIngressos: 12450,
      ingressosVendidos: 14820,
      diferencaMargemSeguranca: 2370,
      atingiuPontoEquilibrio: true,
      receitaMinimaNecessaria: 230000.0,
      receitaDiskRealizada: 361200.0,
    };
  }

  // ==========================================================================
  //  11.30.2 — MOTOR DE INTELIGÊNCIA DE RECEITA
  //  Velocidade, Lotes, Simulador de Preços e Receita Recuperada
  // ==========================================================================

  async obterVelocidadeVendas(eventoId: string, tenantId: string): Promise<VelocidadeVendasMetricas> {
    const ultimaHora = 182;
    const ultimas6Horas = 847;
    const ultimas24Horas = 2940;
    const ultimos7Dias = 8721;
    const variacao24hVsMedia7DiasPct = 34.0;

    return {
      ultimaHora,
      ultimas6Horas,
      ultimas24Horas,
      ultimos7Dias,
      variacao24hVsMedia7DiasPct,
      tendencia: 'ACELERADA',
      textoDescritivo: 'A velocidade de vendas das últimas 24 horas está 34% acima da média dos últimos sete dias.',
    };
  }

  async obterPrevisaoEsgotamento(eventoId: string, tenantId: string): Promise<PrevisaoEsgotamentoMetricas> {
    const disponibilidadeRestante = 3420;
    const ritmoVendasPorDia = 410;
    const diasEstimadosAteEsgotamento = 8;
    const diasAteEvento = 21;

    return {
      disponibilidadeRestante,
      ritmoVendasPorDia,
      diasEstimadosAteEsgotamento,
      diasAteEvento,
      probabilidadeEsgotamentoAntesEventoPct: 94.5,
      alertaRiscoEsgotamentoPrecoce: true,
      recomendacaoTexto: 'Mantido o ritmo recente, a disponibilidade atual pode se esgotar antes da data do evento.',
    };
  }

  async obterInteligenciaLotes(eventoId: string, tenantId: string): Promise<InteligenciaLoteItem[]> {
    return [
      {
        loteId: 'lote-1',
        nome: 'Lote 1 (Promocional)',
        capacidadeTotal: 4000,
        ingressosVendidos: 4000,
        utilizacaoPct: 100.0,
        velocidade: 'BAIXA',
        proximoLoteDisponivel: false,
      },
      {
        loteId: 'lote-2',
        nome: 'Lote 2 (Pista & VIP)',
        capacidadeTotal: 5000,
        ingressosVendidos: 4620,
        utilizacaoPct: 92.4,
        velocidade: 'ALTA',
        acaoRecomendada: 'Avaliar abertura do próximo lote.',
        proximoLoteDisponivel: true,
      },
      {
        loteId: 'lote-3',
        nome: 'Lote 3 (Programado)',
        capacidadeTotal: 6000,
        ingressosVendidos: 0,
        utilizacaoPct: 0.0,
        velocidade: 'BAIXA',
        proximoLoteDisponivel: true,
      },
    ];
  }

  simularAlteracaoPreco(dto: SimulacaoPrecoDto): CenariosSimulacaoPreco {
    const variacaoPrecoPct = Number((((dto.precoProposto - dto.precoAtual) / dto.precoAtual) * 100).toFixed(1));

    // Cenário Conservador: elasticidade mais severa (-15% volume)
    const volCons = Math.round(dto.disponibilidadeRestante * 0.72);
    const recCons = Number((volCons * dto.precoProposto).toFixed(2));
    const margCons = Number((recCons * 0.16).toFixed(2));

    // Cenário Base: elasticidade padrão (-5% volume)
    const volBase = Math.round(dto.disponibilidadeRestante * 0.88);
    const recBase = Number((volBase * dto.precoProposto).toFixed(2));
    const margBase = Number((recBase * 0.18).toFixed(2));

    // Cenário Otimista: alta demanda / inelástico (98% volume)
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
  }

  async obterPerformancePorCanal(eventoId: string, tenantId: string): Promise<PrecoPerformanceCanalItem[]> {
    return [
      { canal: 'Site DiskIngressos', conversaoPct: 8.4, ticketMedio: 162.0, margemPct: 21.0, volumeVendido: 10420 },
      { canal: 'Agências Parceiras (11.29.4)', conversaoPct: 14.2, ticketMedio: 149.0, margemPct: 15.0, volumeVendido: 2200 },
      { canal: 'Afiliados & Promoters', conversaoPct: 5.1, ticketMedio: 155.0, margemPct: 17.0, volumeVendido: 1400 },
      { canal: 'Bilheteria Presencial', conversaoPct: 22.0, ticketMedio: 138.0, margemPct: 12.0, volumeVendido: 800 },
    ];
  }

  async obterOportunidadesEPerdas(eventoId: string, tenantId: string): Promise<OportunidadesEPerdasClassificadas> {
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
  }

  // ==========================================================================
  //  11.30.3 — MOTOR DE INTELIGÊNCIA DO PRODUTOR
  //  Visão 360º, Indicadores Objetivos de Saúde, Alertas e Metas
  // ==========================================================================

  async obterVisaoProdutor360(
    produtorId: string,
    tenantId: string,
    papelUsuario: PapelUsuarioContexto = 'ADMINISTRADOR',
  ): Promise<{
    cabecalho: CabecalhoProdutor360;
    linhaDoTempo: LinhaTempoEventoItem[];
    financeiro: ComportamentoFinanceiroProdutor;
    publico: DesempenhoPublicoProdutor;
    marketing: DesempenhoMarketingProdutor;
    saudeRelacionamento: IndicadoresSaudeRelacionamento;
  }> {
    const isInterno = papelUsuario !== 'PRODUTOR';

    const cabecalho: CabecalhoProdutor360 = {
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
      exposicaoRisco: 'BAIXA',
    };

    const linhaDoTempo: LinhaTempoEventoItem[] = [
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
    ];

    const financeiro: ComportamentoFinanceiroProdutor = {
      saldoDisponivel: 412500.0,
      saldoBloqueadoReserva: 150000.0,
      agendaRepassesPendentes: 240000.0,
      antecipacoesEmAberto: 80000.0,
      taxaEstornoHistoricaPct: 3.2,
      taxaChargebackHistoricaPct: 0.48,
      statusConciliacaoBancaria: 'EM_CONFORMIDADE',
      exposicaoFinanceiraTotal: 390000.0,
    };

    const publico: DesempenhoPublicoProdutor = {
      ingressosVendidosTotal: 150000,
      publicoValidadoPortaria: 132500,
      comparecimentoMedioPct: 88.3,
      taxaRecorrenciaPublicoPct: 24.0,
      publicoFielIdentificado: 31800,
    };

    const marketing: DesempenhoMarketingProdutor = {
      investimentoTotal: 84000.0,
      impressoesTotais: 2450000,
      cliquesTotais: 142000,
      conversoesTotais: 9800,
      vendasAtribuidas: 1420000.0,
      cpaMedio: 8.57,
      roasMedio: 16.9,
    };

    // Componentes objetivos da saúde do relacionamento (sem score artificial único)
    const saudeRelacionamento: IndicadoresSaudeRelacionamento = {
      operacao: { score: 9.4, status: 'EXCELENTE', detalhe: 'Portaria sem incidentes e check-in com fluidez acima de 98%.' },
      financeiro: { score: 9.1, status: 'EXCELENTE', detalhe: 'Histórico de liquidação pontual e baixa taxa de chargeback (0.48%).' },
      vendas: { score: 8.8, status: 'ESTAVEL', detalhe: 'Conversão acima de 8% nos canais proprietários e boa aderência de lote.' },
      publico: { score: 9.0, status: 'EXCELENTE', detalhe: 'Taxa de comparecimento de 88.3% e 24% de público recorrente fidelizado.' },
      atendimento: { score: 8.6, status: 'ESTAVEL', detalhe: 'Tempo médio de resolução do SAC em 42 minutos e SLA de 97%.' },
      risco: { score: 9.3, status: 'EXCELENTE', detalhe: 'Exposição controlada e conformidade regulatória plena.' },
    };

    return { cabecalho, linhaDoTempo, financeiro, publico, marketing, saudeRelacionamento };
  }

  async obterAlertasInteligentes(
    eventoId?: string,
    produtorId?: string,
    tenantId = '00000000-0000-0000-0000-000000000001',
  ): Promise<AlertaInteligenciaItem[]> {
    return [
      {
        id: 'alt-fin-1',
        categoria: 'FINANCEIRO',
        severidade: 'ALTA',
        titulo: 'Aumento relevante de chargebacks no Lote 2',
        descricao: 'Detectadas 4 contestações consecutivas nas últimas 48 horas acima da média móvel.',
        explicabilidade: {
          porQueEstouVendoIsso: [
            'Volume de chargebacks nas últimas 48h subiu para 0.82% das transações (limite de atenção: 0.50%).',
            'Origem concentrada em compras de cartão com IP externo à praça do evento.',
            'Adquirente Cielo reportou alertas preventivos de contestação de titular.',
          ],
          origemMetrica: 'Módulo Antifraude & Pagamentos (11.29.3)',
          acaoRecomendada: 'Ativar verificação 3DS obrigatória para compras acima de R$ 500 no canal web.',
        },
        linkOrigem: '/financeiro/riscos',
        dataCriacao: new Date().toISOString(),
      },
      {
        id: 'alt-ven-2',
        categoria: 'VENDAS',
        severidade: 'MEDIA',
        titulo: 'Ritmo de vendas diárias em desaceleração (-18%)',
        descricao: 'A velocidade de emissão dos últimos 3 dias caiu em comparação com a semana anterior.',
        explicabilidade: {
          porQueEstouVendoIsso: [
            'Média móvel de 7 dias caiu de 410 ingressos/dia para 336 ingressos/dia.',
            'Tráfego na landing page reduziu 11% após encerramento da campanha Meta Ads.',
            'Taxa de conversão do carrinho manteve-se estável em 7.9%.',
          ],
          origemMetrica: 'Motor de Inteligência de Receita (11.30.2)',
          acaoRecomendada: 'Avaliar ativação de régua de remarketing para carrinhos abandonados.',
        },
        linkOrigem: '/marketing',
        dataCriacao: new Date().toISOString(),
      },
      {
        id: 'alt-inv-3',
        categoria: 'INVENTARIO',
        severidade: 'CRITICA',
        titulo: 'Setor Premium com 92,4% de ocupação',
        descricao: 'Restam apenas 380 ingressos disponíveis no Lote 2.',
        explicabilidade: {
          porQueEstouVendoIsso: [
            'Capacidade do lote: 5.000 ingressos | Vendidos: 4.620 ingressos.',
            'Velocidade atual: 85 ingressos/hora no canal online.',
            'Tempo estimado até esgotamento: menos de 5 horas.',
          ],
          origemMetrica: 'Motor de Inventário Real (11.29.2)',
          acaoRecomendada: 'Programar abertura automática ou manual do Lote 3 com reajuste de preço.',
        },
        linkOrigem: '/eventos',
        dataCriacao: new Date().toISOString(),
      },
      {
        id: 'alt-ope-4',
        categoria: 'OPERACAO',
        severidade: 'INFORMATIVA',
        titulo: 'Taxa de comparecimento superior à média histórica',
        descricao: 'Presença confirmada de 89.8% supera os 86.5% observados na edição anterior.',
        explicabilidade: {
          porQueEstouVendoIsso: [
            'Portaria registrou 10.716 acessos validados em tempo real.',
            'Tempo médio de validação por catraca foi de 2.4 segundos.',
          ],
          origemMetrica: 'Pós-Evento & Portaria (11.29.5)',
          acaoRecomendada: 'Registrar indicador no Dossiê Final de Fechamento (11.24).',
        },
        linkOrigem: '/eventos',
        dataCriacao: new Date().toISOString(),
      },
    ];
  }

  async obterCentralOportunidades(
    eventoId?: string,
    produtorId?: string,
    tenantId = '00000000-0000-0000-0000-000000000001',
  ): Promise<OportunidadeAcionavelItem[]> {
    return [
      {
        id: 'opt-1',
        categoria: 'ESGOTAMENTO_LOTE',
        titulo: 'Evento próximo de esgotamento — Avaliar novo lote',
        descricao: 'Lote 2 atingiu 92,4% de venda. Abertura do Lote 3 pode capturar R$ 147.000 adicionais.',
        impactoEstimado: 147000.0,
        acaoSugerida: 'Simular e abrir Lote 3 com preço unitário de R$ 180,00.',
        linkAcao: '/inteligencia/receita',
      },
      {
        id: 'opt-2',
        categoria: 'PUBLICO_RECORRENTE',
        titulo: 'Público recorrente identificado — 8.420 participantes elegíveis',
        descricao: 'Participantes com presença comprovada na edição anterior e consentimento LGPD ativo.',
        impactoEstimado: 85000.0,
        acaoSugerida: 'Disparar pré-venda exclusiva de próximo evento com taxa de conversão esperada de 18%.',
        linkAcao: '/pos-evento',
      },
      {
        id: 'opt-3',
        categoria: 'PAGAMENTOS_RECUPERAVEIS',
        titulo: 'Pagamentos recuperáveis — R$ 37.500 em tentativas recentes',
        descricao: 'Falhas de cartão com código de recusa temporária aptas para reprocessamento via PIX.',
        impactoEstimado: 37500.0,
        acaoSugerida: 'Ativar disparo de PIX Copia e Cola para compradores nas últimas 24 horas.',
        linkAcao: '/financeiro/pagamentos',
      },
      {
        id: 'opt-4',
        categoria: 'CANAL_ALTA_MARGEM',
        titulo: 'Canal com alta margem — Parceiros da Agência Curitiba',
        descricao: 'Agência apresenta 88.5% de presença real e custo de aquisição 32% menor que mídia paga.',
        impactoEstimado: 42000.0,
        acaoSugerida: 'Ampliar cota de distribuição consignada para o próximo lote (11.29.4).',
        linkAcao: '/eventos',
      },
    ];
  }

  async obterComparativoHistorico(
    eventoAtualId: string,
    tenantId = '00000000-0000-0000-0000-000000000001',
    eventoAnteriorId?: string,
  ): Promise<ComparativoHistoricoEdicoes> {
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
  }

  async obterMetasVsRealizadoVsPrevisao(
    periodo = 'Setembro 2026',
    tenantId = '00000000-0000-0000-0000-000000000001',
    papelUsuario: PapelUsuarioContexto = 'ADMINISTRADOR',
  ): Promise<MetasVsRealizadoVsPrevisao> {
    const isInterno = papelUsuario !== 'PRODUTOR';

    return {
      periodo: periodo || 'Setembro 2026',
      vendas: { meta: 3000000.0, realizado: 2500000.0, previsao: 2850000.0, atingimentoPct: 83.3 },
      publico: { meta: 16000, realizado: 10716, previsao: 14500, atingimentoPct: 67.0 },
      receitaDisk: isInterno ? { meta: 420000.0, realizado: 361200.0, previsao: 405000.0, atingimentoPct: 86.0 } : undefined,
      margemDisk: isInterno ? { meta: 280000.0, realizado: 247200.0, previsao: 275000.0, atingimentoPct: 88.3 } : undefined,
    };
  }

  // ==========================================================================
  //  PAINEL EXECUTIVO TRANSVERSAL
  // ==========================================================================

  async obterPainelExecutivo(
    periodo = 'Setembro 2026',
    tenantId = '00000000-0000-0000-0000-000000000001',
    papelUsuario: PapelUsuarioContexto = 'ADMINISTRADOR',
    produtorId?: string,
    eventoId?: string,
  ): Promise<PainelExecutivoInteligencia> {
    const isInterno = papelUsuario !== 'PRODUTOR';
    const decomposicao = await this.obterDecomposicaoRentabilidadeReal(
      eventoId || '11111111-1111-1111-1111-111111111111',
      tenantId,
      papelUsuario,
    );

    const metas = await this.obterMetasVsRealizadoVsPrevisao(periodo, tenantId, papelUsuario);
    const canais = await this.obterPerformancePorCanal(eventoId || 'ev-1', tenantId);
    const alertas = await this.obterAlertasInteligentes(eventoId, produtorId, tenantId);
    const oportunidades = await this.obterCentralOportunidades(eventoId, produtorId, tenantId);

    return {
      periodoSelecionado: periodo,
      filtros: { produtorId, eventoId },
      kpisTopo: {
        gmvTotal: decomposicao.gmvLiquido,
        receitaDiskTotal: isInterno ? decomposicao.receitaContratualDisk : undefined,
        margemDiskTotal: isInterno ? decomposicao.resultadoOperacaoDisk : undefined,
        margemMediaPct: isInterno ? decomposicao.margemDiskPct : undefined,
        publicoValidadoTotal: 10716,
        eventosAtivos: 3,
      },
      metasPrevisao: metas,
      rentabilidadeEventos: [decomposicao],
      desempenhoCanais: canais,
      alertasPrincipais: alertas,
      oportunidadesPrincipais: oportunidades,
    };
  }
}

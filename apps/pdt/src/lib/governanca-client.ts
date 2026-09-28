export type SeveridadeDivergencia = 'INFORMATIVA' | 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';
export type SituacaoDivergencia = 'NOVA' | 'EM_ANALISE' | 'AGUARDANDO_INFORMACAO' | 'EM_CORRECAO' | 'CORRIGIDA' | 'ACEITA' | 'ENCERRADA';
export type ResponsavelDominio = 'FINANCEIRO' | 'CONTABILIDADE' | 'OPERACOES' | 'PORTARIA' | 'MARKETING' | 'ATENDIMENTO' | 'TECNOLOGIA';
export type ClassificacaoDado = 'PUBLICO' | 'INTERNO' | 'CONFIDENCIAL' | 'FINANCEIRO' | 'DADO_PESSOAL' | 'DADO_SENSIVEL' | 'RESTRITO';

export interface StatusDominioItem {
  dominio: string;
  status: 'OPERACIONAL' | 'DEGRADADO' | 'ATENCAO';
  divergenciasQtd: number;
  detalhe: string;
}

export interface VisaoGeralGovernanca {
  registrosVerificados: number;
  divergenciasAbertas: number;
  divergenciasCriticas: number;
  divergenciasEmInvestigacao: number;
  divergenciasCorrigidasHoje: number;
  statusDominios: StatusDominioItem[];
}

export interface CamadaConciliacaoItem {
  camada: string;
  valorEsperado: number;
  valorRegistrado: number;
  status: 'CONCILIADO' | 'DIVERGENTE';
  detalhe: string;
}

export interface ConciliacaoSistemica {
  eventoId: string;
  eventoNome: string;
  valorBrutoPedido: number;
  valorBrutoPagamento: number;
  mdrPrevisto: number;
  valorEsperadoBanco: number;
  valorRecebidoBanco: number;
  divergenciaRealLiquida: number;
  camadas: CamadaConciliacaoItem[];
}

export interface DivergenciaItem {
  id: string;
  codigoDivergencia: string;
  tipo: string;
  camadaOrigem: string;
  camadaDestino: string;
  eventoId?: string;
  eventoNome?: string;
  produtorId?: string;
  produtorNome?: string;
  valorEnvolvido: number;
  severidade: SeveridadeDivergencia;
  responsavelDominio: ResponsavelDominio;
  situacao: SituacaoDivergencia;
  descricaoProblema: string;
  detalhesTecnicos?: Record<string, unknown>;
  dataDeteccao: string;
  prazoResolucao?: string;
}

export interface TratarDivergenciaDto {
  novaSituacao: SituacaoDivergencia;
  acaoAplicada: string;
  justificativa: string;
  responsavelUsuarioId: string;
}

export interface LinhagemNo {
  id: string;
  label: string;
  categoria: string;
  origem: string;
  valor?: number | string;
  filhos?: LinhagemNo[];
}

export interface CentroInvestigacaoResultado {
  termoBuscado: string;
  entidadeEncontrada: boolean;
  cliente: {
    nome: string;
    documentoMascarado: string;
    emailMascarado: string;
    telefoneMascarado: string;
  };
  pedido: {
    pedidoId: string;
    status: string;
    totalCentavos: number;
    createdAt: string;
  };
  pagamento: {
    pagamentoId: string;
    status: string;
    adquirente: string;
    nsu: string;
    tid: string;
  };
  ingressos: Array<{
    ingressoId: string;
    titular: string;
    codigoValidacao: string;
    status: string;
  }>;
  checkin?: {
    portaria: string;
    checkinAt: string;
    catraca: string;
  };
  ledger: {
    lancamentoId: string;
    valor: number;
    tipo: string;
    balanceado: boolean;
  };
  contabilidade: {
    loteContabilId: string;
    debito: number;
    credito: number;
    status: string;
  };
  liquidacao?: {
    repasseId: string;
    banco: string;
    status: string;
    ordemPagamento: string;
  };
  linhaDoTempo: Array<{
    hora: string;
    evento: string;
    modulo: string;
    correlationId: string;
    status: string;
  }>;
}

export interface CatalogoIndicadorItem {
  id: string;
  termoCodigo: string;
  nomeOficial: string;
  definicaoCorporativa: string;
  formulaCalculo?: string;
  donoDadoResponsavel: ResponsavelDominio;
  classificacaoDado: ClassificacaoDado;
  frequenciaAtualizacao: string;
  fontesSistemas: string[];
  utilizadoEm: string[];
}

export interface RegistroAuditoriaItem {
  id: string;
  correlationId: string;
  modulo: string;
  acao: string;
  usuarioId: string;
  usuarioNome: string;
  ipOrigem?: string;
  eventoId?: string;
  produtorId?: string;
  entidadeTipo: string;
  entidadeId: string;
  valorAntes?: Record<string, unknown>;
  valorDepois?: Record<string, unknown>;
  motivoJustificativa: string;
  aprovadorUsuarioId?: string;
  dadosSensiveisAcessados: boolean;
  quantidadeRegistrosExportados?: number;
  createdAt: string;
}

export interface IntegracaoItem {
  nome: string;
  categoria: string;
  status: 'OPERACIONAL' | 'DEGRADADA' | 'FORA_DO_AR';
  latenciaMs: number;
  taxaErroPct: number;
  filaPendenteQtd: number;
  ultimoSucesso: string;
  ultimoErro?: string;
}

export interface EventosInternosMetricas {
  outboxPendente: number;
  falhasProcessamento: number;
  filaErrosDlq: number;
  atrasoMedioProcessamentoSegundos: number;
  reprocessamentoSeguroHabilitado: boolean;
}

export interface SaudeIntegracoesResponse {
  integracoes: IntegracaoItem[];
  eventosInternos: EventosInternosMetricas;
}

export interface GateFechamentoGovernancaResultado {
  eventoId: string;
  aprovadoParaFechamento: boolean;
  divergenciasCriticasAbertas: number;
  divergenciasAltasAbertas: number;
  bloqueios: string[];
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

export const GovernancaClient = {
  async getVisaoGeral(): Promise<VisaoGeralGovernanca> {
    const apiData = await fetchFromApi<VisaoGeralGovernanca>('/governanca/visao-geral');
    if (apiData) return apiData;

    return {
      registrosVerificados: 8421587,
      divergenciasAbertas: 147,
      divergenciasCriticas: 8,
      divergenciasEmInvestigacao: 31,
      divergenciasCorrigidasHoje: 62,
      statusDominios: [
        { dominio: 'Financeiro', status: 'OPERACIONAL', divergenciasQtd: 0, detalhe: 'Ledger imutável conciliado e balanceado.' },
        { dominio: 'Pagamentos', status: 'OPERACIONAL', divergenciasQtd: 2, detalhe: '2 webhooks pendentes de confirmação de split.' },
        { dominio: 'Ingressos', status: 'OPERACIONAL', divergenciasQtd: 0, detalhe: 'Todos os ingressos possuem pedidos válidos.' },
        { dominio: 'Portaria', status: 'ATENCAO', divergenciasQtd: 12, detalhe: '12 validações em catraca offline pendentes de sync.' },
        { dominio: 'Marketing', status: 'OPERACIONAL', divergenciasQtd: 0, detalhe: 'Pixels e conversões CAPI em conformidade.' },
        { dominio: 'Contabilidade', status: 'ATENCAO', divergenciasQtd: 3, detalhe: '3 lotes pendentes de conciliação por partidas dobradas.' },
        { dominio: 'Integrações', status: 'DEGRADADO', divergenciasQtd: 1, detalhe: 'Webhook do provedor TikTok com latência anormal.' },
      ],
    };
  },

  async getConciliacao(eventoId: string): Promise<ConciliacaoSistemica> {
    const apiData = await fetchFromApi<ConciliacaoSistemica>(`/governanca/conciliacao/${eventoId}`);
    if (apiData) return apiData;

    return {
      eventoId,
      eventoNome: 'Festival Exemplo 2026',
      valorBrutoPedido: 1000.0,
      valorBrutoPagamento: 1000.0,
      mdrPrevisto: 30.0,
      valorEsperadoBanco: 970.0,
      valorRecebidoBanco: 968.0,
      divergenciaRealLiquida: 2.0,
      camadas: [
        { camada: 'Pedido (E-commerce)', valorEsperado: 1000.0, valorRegistrado: 1000.0, status: 'CONCILIADO', detalhe: 'Checkout confirmado e ingressos emitidos.' },
        { camada: 'Pagamento (Gateway / Adquirente)', valorEsperado: 1000.0, valorRegistrado: 1000.0, status: 'CONCILIADO', detalhe: 'Autorização e captura confirmadas pelo gateway.' },
        { camada: 'Ledger (Financeiro Disk)', valorEsperado: 1000.0, valorRegistrado: 1000.0, status: 'CONCILIADO', detalhe: 'Lançamento imutável registrado em conta gráfica.' },
        { camada: 'Contabilidade (Partidas Dobradas)', valorEsperado: 1000.0, valorRegistrado: 1000.0, status: 'CONCILIADO', detalhe: 'Débito e crédito balanceados no balancete.' },
        { camada: 'Tesouraria (Liquidação Prevista)', valorEsperado: 970.0, valorRegistrado: 970.0, status: 'CONCILIADO', detalhe: 'Ordem de pagamento provisionada líquida de MDR.' },
        { camada: 'Banco (Extrato Bancário Real)', valorEsperado: 970.0, valorRegistrado: 968.0, status: 'DIVERGENTE', detalhe: 'Tarifa bancária de compensação de R$ 2,00 não prevista no contrato.' },
      ],
    };
  },

  async getDivergencias(filtros: {
    situacao?: string;
    severidade?: string;
    responsavel?: string;
    eventoId?: string;
  } = {}): Promise<DivergenciaItem[]> {
    const params = new URLSearchParams();
    if (filtros.situacao) params.append('situacao', filtros.situacao);
    if (filtros.severidade) params.append('severidade', filtros.severidade);
    if (filtros.responsavel) params.append('responsavel', filtros.responsavel);
    if (filtros.eventoId) params.append('eventoId', filtros.eventoId);

    const apiData = await fetchFromApi<DivergenciaItem[]>(`/governanca/divergencias?${params.toString()}`);
    if (apiData) return apiData;

    return [
      {
        id: 'div-001',
        codigoDivergencia: 'DIV-2026-001',
        tipo: 'PEDIDO_PAGO_SEM_INGRESSO',
        camadaOrigem: 'PAGAMENTOS',
        camadaDestino: 'INGRESSOS',
        eventoId: '11111111-1111-1111-1111-111111111111',
        eventoNome: 'Festival Exemplo 2026',
        produtorId: 'prod-t4f',
        produtorNome: 'T4F Entretenimento',
        valorEnvolvido: 280.0,
        severidade: 'CRITICA',
        responsavelDominio: 'OPERACOES',
        situacao: 'EM_ANALISE',
        descricaoProblema: 'Pedido #45872 com pagamento aprovado via PIX, porém sem ingresso gerado no inventário.',
        detalhesTecnicos: { pedidoId: 'PED-45872', tid: 'TID-882193', tempoSemIngressoMinutos: 45 },
        dataDeteccao: '2026-09-28T14:10:00.000Z',
        prazoResolucao: '2026-09-28T16:00:00.000Z',
      },
      {
        id: 'div-002',
        codigoDivergencia: 'DIV-2026-002',
        tipo: 'LEDGER_SEM_PARTIDA_CONTABIL',
        camadaOrigem: 'FINANCEIRO',
        camadaDestino: 'CONTABILIDADE',
        eventoId: '11111111-1111-1111-1111-111111111111',
        eventoNome: 'Festival Exemplo 2026',
        produtorId: 'prod-t4f',
        produtorNome: 'T4F Entretenimento',
        valorEnvolvido: 1250.0,
        severidade: 'ALTA',
        responsavelDominio: 'CONTABILIDADE',
        situacao: 'EM_CORRECAO',
        descricaoProblema: 'Lançamento no Ledger financeiro pendente de espelhamento nas partidas dobradas contábeis.',
        detalhesTecnicos: { lancamentoLedgerId: 'led-99124', contaDebito: '1.1.1.02' },
        dataDeteccao: '2026-09-28T11:30:00.000Z',
        prazoResolucao: '2026-09-28T18:00:00.000Z',
      },
      {
        id: 'div-003',
        codigoDivergencia: 'DIV-2026-003',
        tipo: 'CHECKIN_SEM_INGRESSO_VALIDO',
        camadaOrigem: 'PORTARIA',
        camadaDestino: 'INGRESSOS',
        eventoId: '11111111-1111-1111-1111-111111111111',
        eventoNome: 'Festival Exemplo 2026',
        produtorId: 'prod-t4f',
        produtorNome: 'T4F Entretenimento',
        valorEnvolvido: 0.0,
        severidade: 'CRITICA',
        responsavelDominio: 'PORTARIA',
        situacao: 'NOVA',
        descricaoProblema: 'Catraca 04 registrou check-in para QR Code não encontrado na base de ingressos válidos.',
        detalhesTecnicos: { catracaId: 'CAT-04', qrCodeHash: 'a7f93...41e' },
        dataDeteccao: '2026-09-28T16:20:00.000Z',
        prazoResolucao: '2026-09-28T17:30:00.000Z',
      },
      {
        id: 'div-004',
        codigoDivergencia: 'DIV-2026-004',
        tipo: 'DIFERENCA_ARREDONDAMENTO_CENTAVOS',
        camadaOrigem: 'PAGAMENTOS',
        camadaDestino: 'TESOURARIA',
        eventoId: '11111111-1111-1111-1111-111111111111',
        eventoNome: 'Festival Exemplo 2026',
        produtorId: 'prod-t4f',
        produtorNome: 'T4F Entretenimento',
        valorEnvolvido: 0.04,
        severidade: 'BAIXA',
        responsavelDominio: 'FINANCEIRO',
        situacao: 'ACEITA',
        descricaoProblema: 'Diferença de R$ 0,04 resultante de truncamento em parcelamento de 10x na adquirente.',
        detalhesTecnicos: { parcelas: 10, diferencaCentavos: 4 },
        dataDeteccao: '2026-09-28T09:00:00.000Z',
      },
      {
        id: 'div-005',
        codigoDivergencia: 'DIV-2026-005',
        tipo: 'PAGAMENTO_DUPLICADO',
        camadaOrigem: 'PAGAMENTOS',
        camadaDestino: 'PEDIDOS',
        eventoId: '11111111-1111-1111-1111-111111111111',
        eventoNome: 'Festival Exemplo 2026',
        produtorId: 'prod-t4f',
        produtorNome: 'T4F Entretenimento',
        valorEnvolvido: 450.0,
        severidade: 'CRITICA',
        responsavelDominio: 'FINANCEIRO',
        situacao: 'CORRIGIDA',
        descricaoProblema: 'Dois pagamentos PIX confirmados para o mesmo pedido #44912. Estorno automático disparado.',
        detalhesTecnicos: { pedidoId: 'PED-44912', estornoId: 'est-33812' },
        dataDeteccao: '2026-09-28T08:15:00.000Z',
      },
    ];
  },

  async tratarDivergencia(id: string, dto: TratarDivergenciaDto) {
    const apiData = await fetchFromApi<{ sucesso: boolean; divergenciaId: string; novaSituacao: string }>(
      `/governanca/divergencias/${id}/tratar`,
      {
        method: 'POST',
        body: JSON.stringify(dto),
      },
    );
    if (apiData) return apiData;

    return {
      sucesso: true,
      divergenciaId: id,
      novaSituacao: dto.novaSituacao,
    };
  },

  async getLinhagem(indicadorCodigo = 'MARGEM_DISK'): Promise<LinhagemNo> {
    const apiData = await fetchFromApi<LinhagemNo>(`/governanca/linhagem/${indicadorCodigo}`);
    if (apiData) return apiData;

    return {
      id: 'no-margem-disk',
      label: 'Margem Disk (R$ 247.200,00)',
      categoria: 'INDICADOR_AGREGADO',
      origem: 'EDDIE 11.30 — Inteligência de Rentabilidade Real',
      valor: 247200.0,
      filhos: [
        {
          id: 'no-rec-contratual',
          label: 'Receita Contratual Disk (R$ 361.200,00)',
          categoria: 'RECEITA_BRUTA',
          origem: 'Comercial B2B (Condição Comercial 15.0% Take-rate)',
          valor: 361200.0,
          filhos: [
            {
              id: 'no-pedidos-pagos',
              label: 'Pagamentos Aprovados (GMV R$ 2.408.000,00)',
              categoria: 'TRANSACIONAL',
              origem: 'Núcleo de Pagamentos (11.29.3) / Pedidos',
              valor: 2408000.0,
            },
          ],
        },
        {
          id: 'no-custos-mdr',
          label: 'Custos Adquirência MDR (-R$ 71.000,00)',
          categoria: 'CUSTO_FINANCEIRO',
          origem: 'Tesouraria & Conciliação Adquirente (MDR Médio 2.95%)',
          valor: -71000.0,
          filhos: [
            { id: 'no-adyen', label: 'Adyen Global (R$ 31.200,00)', categoria: 'GATEWAY', origem: 'Extrato Adquirente', valor: -31200.0 },
            { id: 'no-cielo', label: 'Cielo E-commerce (R$ 23.250,00)', categoria: 'GATEWAY', origem: 'Extrato Adquirente', valor: -23250.0 },
            { id: 'no-rede', label: 'Rede Itaú (R$ 16.550,00)', categoria: 'GATEWAY', origem: 'Extrato Adquirente', valor: -16550.0 },
          ],
        },
        {
          id: 'no-estornos-cdc',
          label: 'Cancelamentos & Estornos (-R$ 80.000,00)',
          categoria: 'DEDUCAO_RECEITA',
          origem: 'Módulo Estorno (Máquina de Estados CDC 7 dias)',
          valor: -80000.0,
        },
        {
          id: 'no-chargebacks',
          label: 'Chargebacks Bancários (-R$ 12.000,00)',
          categoria: 'DEDUCAO_RECEITA',
          origem: 'Antifraude & Contestações de Bandeira',
          valor: -12000.0,
        },
        {
          id: 'no-custos-operacao',
          label: 'Custos Operacionais Atribuíveis (-R$ 18.000,00)',
          categoria: 'CUSTO_OPERACIONAL',
          origem: 'Financeiro / Portaria / SAC (Alocação por Evento)',
          valor: -18000.0,
        },
      ],
    };
  },

  async investigar(termo: string): Promise<CentroInvestigacaoResultado> {
    const apiData = await fetchFromApi<CentroInvestigacaoResultado>(`/governanca/investigar?termo=${encodeURIComponent(termo)}`);
    if (apiData) return apiData;

    return {
      termoBuscado: termo || 'PED-45872',
      entidadeEncontrada: true,
      cliente: {
        nome: 'Maria Silva',
        documentoMascarado: '***.492.819-**',
        emailMascarado: 'm****@exemplo.com.br',
        telefoneMascarado: '(41) 9****-8812',
      },
      pedido: {
        pedidoId: 'PED-45872',
        status: 'PAGO_CONFIRMADO',
        totalCentavos: 28000,
        createdAt: '2026-09-28T14:02:01.000Z',
      },
      pagamento: {
        pagamentoId: 'PAG-91823',
        status: 'APROVADO_LIQUIDADO',
        adquirente: 'Adyen Global',
        nsu: '984128591',
        tid: 'TID-ADYEN-20260928-8812',
      },
      ingressos: [
        { ingressoId: 'ING-101', titular: 'Maria Silva', codigoValidacao: 'VALID-99124-A', status: 'UTILIZADO_PORTARIA' },
        { ingressoId: 'ING-102', titular: 'João Santos', codigoValidacao: 'VALID-99124-B', status: 'EMITIDO_DISPONIVEL' },
      ],
      checkin: {
        portaria: 'Portão Principal - Acesso VIP',
        checkinAt: '2026-09-28T18:45:12.000Z',
        catraca: 'CAT-02',
      },
      ledger: {
        lancamentoId: 'LED-771239',
        valor: 280.0,
        tipo: 'CREDITO_VENDA_INGRESSO',
        balanceado: true,
      },
      contabilidade: {
        loteContabilId: 'LOTE-CONT-2026-09',
        debito: 280.0,
        credito: 280.0,
        status: 'PARTIDAS_DOBRADAS_BALANCEADAS',
      },
      liquidacao: {
        repasseId: 'REP-2026-09-001',
        banco: 'Banco Itaú (341)',
        status: 'PROGRAMADO',
        ordemPagamento: 'OP-8812491',
      },
      linhaDoTempo: [
        { hora: '14:02:01', evento: 'Pedido Criado no Carrinho', modulo: 'pedidos', correlationId: 'COR-20260928-A82F93', status: 'SUCESSO' },
        { hora: '14:02:02', evento: 'Inventário Reservado (Hold 10 min)', modulo: 'inventario', correlationId: 'COR-20260928-A82F93', status: 'SUCESSO' },
        { hora: '14:02:17', evento: 'Pagamento PIX Iniciado', modulo: 'pagamentos', correlationId: 'COR-20260928-A82F93', status: 'SUCESSO' },
        { hora: '14:02:20', evento: 'Webhook Adquirente PIX Confirmado', modulo: 'pagamentos', correlationId: 'COR-20260928-A82F93', status: 'SUCESSO' },
        { hora: '14:02:21', evento: 'Pedido Marcado como Pago', modulo: 'pedidos', correlationId: 'COR-20260928-A82F93', status: 'SUCESSO' },
        { hora: '14:02:22', evento: 'Lançamento Imutável no Ledger', modulo: 'financeiro', correlationId: 'COR-20260928-A82F93', status: 'SUCESSO' },
        { hora: '14:02:23', evento: 'Ingressos Emitidos e QR Code Gerado', modulo: 'pedidos', correlationId: 'COR-20260928-A82F93', status: 'SUCESSO' },
        { hora: '14:02:24', evento: 'E-mail e WhatsApp de Confirmação', modulo: 'pos-evento', correlationId: 'COR-20260928-A82F93', status: 'SUCESSO' },
        { hora: '18:45:12', evento: 'Check-in Validado na Catraca 02', modulo: 'portaria', correlationId: 'COR-20260928-A82F93', status: 'SUCESSO' },
      ],
    };
  },

  async getCatalogo(): Promise<CatalogoIndicadorItem[]> {
    const apiData = await fetchFromApi<CatalogoIndicadorItem[]>('/governanca/catalogo');
    if (apiData) return apiData;

    return [
      {
        id: 'cat-1',
        termoCodigo: 'GMV',
        nomeOficial: 'Volume Bruto de Vendas (Gross Merchandise Value)',
        definicaoCorporativa: 'Soma total dos valores brutos transacionados em ingressos antes de quaisquer deduções de cancelamento, estorno ou taxas.',
        formulaCalculo: 'Soma(IngressosVendidos * PrecoFace)',
        donoDadoResponsavel: 'FINANCEIRO',
        classificacaoDado: 'FINANCEIRO',
        frequenciaAtualizacao: 'REALTIME',
        fontesSistemas: ['pedidos', 'pagamentos'],
        utilizadoEm: ['Dashboard Geral', 'Rentabilidade Real', 'Relatórios Fiscais'],
      },
      {
        id: 'cat-2',
        termoCodigo: 'GMV_LIQUIDO',
        nomeOficial: 'Volume Líquido Transacionado',
        definicaoCorporativa: 'GMV Bruto deduzido de estornos de arrependimento (CDC 7 dias), cancelamentos e chargebacks bancários consumados.',
        formulaCalculo: 'GMV_Bruto - Estornos - Chargebacks',
        donoDadoResponsavel: 'FINANCEIRO',
        classificacaoDado: 'FINANCEIRO',
        frequenciaAtualizacao: 'REALTIME',
        fontesSistemas: ['pagamentos', 'financeiro', 'estorno'],
        utilizadoEm: ['Control Tower', 'Inteligência de Rentabilidade', 'Fechamento de Eventos'],
      },
      {
        id: 'cat-3',
        termoCodigo: 'RECEITA_DISK',
        nomeOficial: 'Receita Contratual da Operação DiskIngressos (Take-rate)',
        definicaoCorporativa: 'Remuneração da DiskIngressos pactuada contratualmente com o produtor com base no percentual ou valor fixo sobre as vendas líquidas.',
        formulaCalculo: 'GMV_Liquido * TakeRateContratualPct',
        donoDadoResponsavel: 'FINANCEIRO',
        classificacaoDado: 'CONFIDENCIAL',
        frequenciaAtualizacao: 'REALTIME',
        fontesSistemas: ['comercial', 'financeiro', 'contabilidade'],
        utilizadoEm: ['DRE Gerencial', 'Balanço da Disk', 'Super Dashboard'],
      },
      {
        id: 'cat-4',
        termoCodigo: 'PUBLICO_VALIDADO',
        nomeOficial: 'Público Efetivamente Validado na Portaria',
        definicaoCorporativa: 'Participantes com leitura e validação bem-sucedida de QR Code/NFC nas catracas do evento. Exclui compradores ausentes (no-show).',
        formulaCalculo: 'Contagem(CheckinsUnicosValidos)',
        donoDadoResponsavel: 'OPERACOES',
        classificacaoDado: 'INTERNO',
        frequenciaAtualizacao: 'REALTIME',
        fontesSistemas: ['portaria', 'pos-evento'],
        utilizadoEm: ['Command Center', 'Pós-Evento & Histórico', 'Dossiê de Fechamento'],
      },
      {
        id: 'cat-5',
        termoCodigo: 'SALDO_DISPONIVEL',
        nomeOficial: 'Saldo Gráfico Disponível para Repasse do Produtor',
        definicaoCorporativa: 'Saldo líquido da conta gráfica do produtor, descontadas reservas de retenção de chargeback, antecipações já liberadas e taxas.',
        formulaCalculo: 'CreditosLedger - DebitosLedger - ReservaRisco - AntecipacoesAbertas',
        donoDadoResponsavel: 'FINANCEIRO',
        classificacaoDado: 'FINANCEIRO',
        frequenciaAtualizacao: 'REALTIME',
        fontesSistemas: ['financeiro', 'tesouraria', 'producer-portal'],
        utilizadoEm: ['Portal do Produtor', 'Agenda de Repasses', 'Banking Engine'],
      },
    ];
  },

  async getAuditoria(filtros: {
    correlationId?: string;
    modulo?: string;
    usuarioId?: string;
    eventoId?: string;
  } = {}): Promise<RegistroAuditoriaItem[]> {
    const params = new URLSearchParams();
    if (filtros.correlationId) params.append('correlationId', filtros.correlationId);
    if (filtros.modulo) params.append('modulo', filtros.modulo);
    if (filtros.usuarioId) params.append('usuarioId', filtros.usuarioId);
    if (filtros.eventoId) params.append('eventoId', filtros.eventoId);

    const apiData = await fetchFromApi<RegistroAuditoriaItem[]>(`/governanca/auditoria?${params.toString()}`);
    if (apiData) return apiData;

    return [
      {
        id: 'aud-001',
        correlationId: 'COR-20260928-A82F93',
        modulo: 'financeiro',
        acao: 'ALTERACAO_TAXA_CONTRATUAL',
        usuarioId: 'usr-admin-1',
        usuarioNome: 'Administrador Financeiro',
        ipOrigem: '189.102.44.12',
        eventoId: '11111111-1111-1111-1111-111111111111',
        produtorId: 'prod-t4f',
        entidadeTipo: 'CondicaoComercial',
        entidadeId: 'cond-4481',
        valorAntes: { takeRatePct: 12.0 },
        valorDepois: { takeRatePct: 15.0 },
        motivoJustificativa: 'Renegociação contratual homologada no aditivo v2 para expansão de lote.',
        aprovadorUsuarioId: 'usr-cfo-1',
        dadosSensiveisAcessados: false,
        createdAt: '2026-09-28T16:42:10.000Z',
      },
      {
        id: 'aud-002',
        correlationId: 'COR-20260928-B99124',
        modulo: 'estorno',
        acao: 'APROVACAO_ESTORNO_MANUAL',
        usuarioId: 'usr-sac-2',
        usuarioNome: 'Supervisora de Atendimento',
        ipOrigem: '189.102.44.15',
        eventoId: '11111111-1111-1111-1111-111111111111',
        entidadeTipo: 'SolicitacaoEstorno',
        entidadeId: 'est-99412',
        valorAntes: { status: 'PENDENTE' },
        valorDepois: { status: 'APROVADO_REEMBOLSADO', valorCentavos: 14000 },
        motivoJustificativa: 'Direito de arrependimento comprovado no prazo de 7 dias (CDC art. 49).',
        aprovadorUsuarioId: 'usr-coord-sac',
        dadosSensiveisAcessados: true,
        createdAt: '2026-09-28T15:20:00.000Z',
      },
      {
        id: 'aud-003',
        correlationId: 'COR-20260928-C10042',
        modulo: 'usuarios',
        acao: 'EXPORTACAO_BASE_CLIENTES_LGPD',
        usuarioId: 'usr-mkt-1',
        usuarioNome: 'Gerente de CRM',
        ipOrigem: '177.82.19.88',
        eventoId: '11111111-1111-1111-1111-111111111111',
        entidadeTipo: 'SegmentoPublico',
        entidadeId: 'seg-8812',
        motivoJustificativa: 'Disparo de pesquisa pós-evento exclusiva para participantes com consentimento.',
        aprovadorUsuarioId: 'usr-dpo-privacidade',
        dadosSensiveisAcessados: true,
        quantidadeRegistrosExportados: 8921,
        createdAt: '2026-09-28T14:05:00.000Z',
      },
    ];
  },

  async getIntegracoes(): Promise<SaudeIntegracoesResponse> {
    const apiData = await fetchFromApi<SaudeIntegracoesResponse>('/governanca/integracoes');
    if (apiData) return apiData;

    return {
      integracoes: [
        { nome: 'Adyen Global Gateway', categoria: 'PAGAMENTOS', status: 'OPERACIONAL', latenciaMs: 142, taxaErroPct: 0.12, filaPendenteQtd: 0, ultimoSucesso: 'há 12s' },
        { nome: 'Cielo E-commerce', categoria: 'PAGAMENTOS', status: 'OPERACIONAL', latenciaMs: 210, taxaErroPct: 0.28, filaPendenteQtd: 2, ultimoSucesso: 'há 45s' },
        { nome: 'Banco Itaú PIX Direto', categoria: 'BANCOS', status: 'OPERACIONAL', latenciaMs: 88, taxaErroPct: 0.04, filaPendenteQtd: 0, ultimoSucesso: 'há 5s' },
        { nome: 'Meta Conversions API (CAPI)', categoria: 'MARKETING', status: 'OPERACIONAL', latenciaMs: 180, taxaErroPct: 0.45, filaPendenteQtd: 0, ultimoSucesso: 'há 1m' },
        { nome: 'Google Ads Enhanced Conversions', categoria: 'MARKETING', status: 'OPERACIONAL', latenciaMs: 195, taxaErroPct: 0.20, filaPendenteQtd: 0, ultimoSucesso: 'há 2m' },
        { nome: 'TikTok Events API', categoria: 'MARKETING', status: 'DEGRADADA', latenciaMs: 840, taxaErroPct: 4.80, filaPendenteQtd: 18, ultimoSucesso: 'há 6m', ultimoErro: 'Timeout ao responder batch de eventos' },
        { nome: 'WhatsApp Cloud API (Meta)', categoria: 'COMUNICACAO', status: 'OPERACIONAL', latenciaMs: 115, taxaErroPct: 0.08, filaPendenteQtd: 0, ultimoSucesso: 'há 18s' },
      ],
      eventosInternos: {
        outboxPendente: 3,
        falhasProcessamento: 0,
        filaErrosDlq: 0,
        atrasoMedioProcessamentoSegundos: 1.2,
        reprocessamentoSeguroHabilitado: true,
      },
    };
  },

  async reprocessar(eventoId: string, correlationId: string) {
    const apiData = await fetchFromApi<{ reprocessado: boolean; idempotente: boolean; correlationId: string }>(
      '/governanca/reprocessar',
      {
        method: 'POST',
        body: JSON.stringify({ eventoId, correlationId }),
      },
    );
    if (apiData) return apiData;

    return {
      reprocessado: true,
      idempotente: true,
      correlationId,
    };
  },

  async getGateFechamento(eventoId: string): Promise<GateFechamentoGovernancaResultado> {
    const apiData = await fetchFromApi<GateFechamentoGovernancaResultado>(`/governanca/gate-fechamento/${eventoId}`);
    if (apiData) return apiData;

    return {
      eventoId,
      aprovadoParaFechamento: false,
      divergenciasCriticasAbertas: 2,
      divergenciasAltasAbertas: 1,
      bloqueios: [
        'Existem 2 divergências de severidade CRÍTICA em aberto para este evento (DIV-2026-001, DIV-2026-003).',
      ],
    };
  },
};

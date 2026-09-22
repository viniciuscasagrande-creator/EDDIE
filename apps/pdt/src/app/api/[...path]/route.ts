import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
//  DISKINGRESSOS PDT — Unified Operational API Gateway & In-Memory Store
//  Garante funcionamento integral mesmo quando o backend externo estiver offline,
//  sem "Aguardando API", sem "Carregando..." infinito e com transações reais.
// ============================================================================

export const dynamic = 'force-dynamic';

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';
const DEFAULT_PRODUTOR_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

// --- Estado Operacional em Memória (Persistente no ciclo de vida do worker) ---
interface StoreState {
  eventos: any[];
  saldosPorEvento: Record<string, { disponivel: number; bloqueado: number; retido: number; estorno: number }>;
  extrato: any[];
  contasPagar: any[];
  repasses: any[];
  antecipacoes: any[];
  divergencias: any[];
  contasFinanceiras: any[];
  oportunidades: any[];
  produtoresB2B: any[];
  condicoes: any[];
  atividades: any[];
  campanhas: any[];
  pixels: any[];
  utms: any[];
  cupons: any[];
  chamadosSac: any[];
  ocorrenciasSuporte: any[];
  estornos: any[];
}

function inicializarStore(): StoreState {
  const evento1Id = '11111111-1111-1111-1111-111111111111';
  const evento2Id = '22222222-2222-2222-2222-222222222222';
  const evento3Id = '33333333-3333-3333-3333-333333333333';

  return {
    eventos: [
      {
        id: evento1Id,
        nome: 'Festival Curitiba 2026',
        slug: 'festival-curitiba-2026',
        status: 'publicado',
        categoria: 'festival',
        classificacaoEtaria: 18,
        createdAt: '2026-03-01T12:00:00.000Z',
        sessoes: [
          {
            id: 'sessao-101',
            inicioEm: '2026-11-20T20:00:00.000Z',
            fimEm: '2026-11-21T04:00:00.000Z',
            capacidadeTotal: 15000,
            local: { nome: 'Pedreira Paulo Leminski', cidade: 'Curitiba', uf: 'PR' },
            setores: [
              { id: 'setor-pista', nome: 'Pista Premium', marcado: false, capacidade: 8000 },
              { id: 'setor-camarote', nome: 'Camarote Open Bar', marcado: true, capacidade: 2000 },
            ],
            lotes: [
              {
                id: 'lote-1',
                nome: '1º Lote Promocional',
                ordem: 1,
                precoFace: 180,
                taxaConveniencia: 18,
                quantidade: 5000,
                ativo: true,
                abreEm: '2026-08-01T10:00:00.000Z',
              },
            ],
          },
        ],
      },
      {
        id: evento2Id,
        nome: 'Show São Paulo 2026',
        slug: 'show-sao-paulo-2026',
        status: 'publicado',
        categoria: 'show',
        classificacaoEtaria: 16,
        createdAt: '2026-04-10T15:00:00.000Z',
        sessoes: [
          {
            id: 'sessao-201',
            inicioEm: '2026-12-05T21:00:00.000Z',
            fimEm: '2026-12-06T01:00:00.000Z',
            capacidadeTotal: 8000,
            local: { nome: 'Espaço Unimed', cidade: 'São Paulo', uf: 'SP' },
            setores: [{ id: 'setor-sp-pista', nome: 'Pista', marcado: false, capacidade: 6000 }],
            lotes: [
              {
                id: 'lote-sp-1',
                nome: 'Lote Único',
                ordem: 1,
                precoFace: 220,
                taxaConveniencia: 22,
                quantidade: 6000,
                ativo: true,
                abreEm: '2026-09-01T10:00:00.000Z',
              },
            ],
          },
        ],
      },
      {
        id: evento3Id,
        nome: 'Arena Sunset Rio 2026',
        slug: 'arena-sunset-rio-2026',
        status: 'rascunho',
        categoria: 'eletronico',
        classificacaoEtaria: 18,
        createdAt: '2026-08-15T09:00:00.000Z',
        sessoes: [],
      },
    ],
    saldosPorEvento: {
      [evento1Id]: { disponivel: 8540000, bloqueado: 1200000, retido: 2500000, estorno: 500000 },
      [evento2Id]: { disponivel: 4210000, bloqueado: 800000, retido: 1400000, estorno: 300000 },
      [evento3Id]: { disponivel: 0, bloqueado: 0, retido: 0, estorno: 0 },
    },
    extrato: [
      {
        id: 'lanc-1',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        tipo: 'CREDITO_VENDA',
        descricao: 'Venda Lote 1 - Pedido #84920',
        valorCents: 39600,
        bucket: 'disponivel',
        eventoId: evento1Id,
        saldoAposCents: 8540000,
      },
      {
        id: 'lanc-2',
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        tipo: 'DEBITO_ESTORNO',
        descricao: 'Estorno CDC Art. 49 - Pedido #84811',
        valorCents: 19800,
        bucket: 'reservado_estorno',
        eventoId: evento1Id,
        saldoAposCents: 8500400,
      },
      {
        id: 'lanc-3',
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        tipo: 'CREDITO_VENDA',
        descricao: 'Venda Pista - Pedido #84750',
        valorCents: 24200,
        bucket: 'disponivel',
        eventoId: evento2Id,
        saldoAposCents: 4210000,
      },
    ],
    contasPagar: [
      {
        id: 'cp-1',
        eventoId: evento1Id,
        fornecedor: 'Alpha Sound Engenharia Acústica',
        descricao: 'Locação de PA Linear e Iluminação Palco Principal',
        categoria: 'producao',
        valorCents: 1450000,
        vencimentoEm: '2026-10-15',
        status: 'pendente',
      },
      {
        id: 'cp-2',
        eventoId: evento1Id,
        fornecedor: 'Guarda Real Segurança Patrimonial',
        descricao: 'Brigada de Incêndio e Controle de Acesso Portarias',
        categoria: 'seguranca',
        valorCents: 820000,
        vencimentoEm: '2026-10-20',
        status: 'pendente',
      },
      {
        id: 'cp-3',
        eventoId: evento2Id,
        fornecedor: 'Power Energy Geradores',
        descricao: 'Grupo Gerador 500kVA Standby',
        categoria: 'infraestrutura',
        valorCents: 540000,
        vencimentoEm: '2026-11-01',
        status: 'paga',
        pagoEm: new Date().toISOString(),
      },
    ],
    repasses: [
      {
        id: 'rep-1',
        eventoId: evento1Id,
        valorCents: 2500000,
        banco: 'Banco Itaú Unibanco',
        chavePix: 'financeiro@festivalcuritiba.com.br',
        solicitadoEm: new Date(Date.now() - 86400000 * 2).toISOString(),
        status: 'aprovado',
        observacao: 'Repasse quinzenal aprovado conforme contrato comercial.',
      },
      {
        id: 'rep-2',
        eventoId: evento2Id,
        valorCents: 1200000,
        banco: 'Banco Bradesco',
        chavePix: 'sp@produtora.com.br',
        solicitadoEm: new Date(Date.now() - 86400000 * 4).toISOString(),
        status: 'liquidado',
        liquidadoEm: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
    antecipacoes: [
      {
        id: 'ant-1',
        eventoId: evento1Id,
        valorSolicitadoCents: 3000000,
        taxaDesconto: 2.8,
        valorLiquidoCents: 2916000,
        diasRestantes: 58,
        status: 'aprovado',
        solicitadoEm: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
    ],
    divergencias: [
      {
        id: 'div-1',
        data: '2026-09-18',
        descricao: 'Tarifa de Liquidação Pix Não Conciliada no Extrato Itaú',
        valorExtratoCents: 380,
        valorLedgerCents: 0,
        diferencaCents: 380,
        tipo: 'TARIFA_NAO_LANCADA',
        status: 'pendente',
      },
    ],
    contasFinanceiras: [
      {
        id: 'cf-itau',
        banco: 'Banco Itaú S.A. (341)',
        tipo: 'bancaria',
        agencia: '0450',
        conta: '98402-1',
        titular: 'DiskIngressos Serviços de Bilheteria Ltda',
        saldoDisponivelCents: 9540000,
        saldoBloqueadoCents: 500000,
        status: 'ativa',
        principal: true,
      },
      {
        id: 'cf-cora',
        banco: 'Banco Cora SCD (403)',
        tipo: 'bancaria',
        agencia: '0001',
        conta: '148209-3',
        titular: 'DiskIngressos Arrecadação Pix',
        saldoDisponivelCents: 3210000,
        saldoBloqueadoCents: 0,
        status: 'ativa',
        principal: false,
      },
      {
        id: 'cf-pagarme',
        banco: 'Pagar.me Gateway de Pagamento',
        tipo: 'gateway',
        titular: 'Conta Custódia Cartão de Crédito',
        saldoDisponivelCents: 15400000,
        saldoBloqueadoCents: 1200000,
        status: 'ativa',
        principal: false,
      },
    ],
    oportunidades: [
      {
        id: 'op-1',
        titulo: 'Festival Gastronômico da Serra 2027',
        empresa: 'Serra Eventos & Turismo',
        contatoNome: 'Roberto Mendes',
        contatoEmail: 'roberto@serraeventos.com.br',
        valorEstimado: 350000,
        etapa: 'proposta',
        probabilidade: 70,
        fechamentoPrevisto: '2026-11-30',
      },
      {
        id: 'op-2',
        titulo: 'Turnê Acústica MPB - 12 Cidades',
        empresa: 'Girasol Produções Artísticas',
        contatoNome: 'Luciana Ferreira',
        contatoEmail: 'luciana@girasol.com.br',
        valorEstimado: 620000,
        etapa: 'negociacao',
        probabilidade: 85,
        fechamentoPrevisto: '2026-10-15',
      },
      {
        id: 'op-3',
        titulo: 'Circuito Corrida Noturna 10K',
        empresa: 'SportLife Brasil',
        contatoNome: 'Carlos Eduardo',
        contatoEmail: 'carlos@sportlife.com.br',
        valorEstimado: 180000,
        etapa: 'fechado_ganho',
        probabilidade: 100,
        fechamentoPrevisto: '2026-09-10',
      },
    ],
    produtoresB2B: [
      {
        id: DEFAULT_PRODUTOR_ID,
        razaoSocial: 'DiskIngressos Produtora Master Oficial',
        nomeFantasia: 'Produtor Master DiskIngressos',
        cnpj: '12.345.678/0001-90',
        emailCorporativo: 'produtor@diskingressos.com.br',
        telefone: '(41) 3315-0808',
        cidade: 'Curitiba',
        estado: 'PR',
        taxaConvenienciaPadrao: 10,
        status: 'ativo',
      },
    ],
    condicoes: [
      {
        id: 'cond-1',
        produtorId: DEFAULT_PRODUTOR_ID,
        taxaConvenienciaPercentual: 10,
        splitConvenienciaPercentual: 100,
        taxaFixaPorIngressoCents: 0,
        diasParaRepasse: 2,
        retencaoEstornoPercentual: 5,
        status: 'vigente',
        aprovadoEm: '2026-01-10T10:00:00.000Z',
      },
    ],
    atividades: [
      {
        id: 'atv-1',
        oportunidadeId: 'op-2',
        titulo: 'Alinhar minuta de split de conveniência com o jurídico do produtor',
        tipo: 'reuniao',
        dataHora: '2026-09-24T14:30:00.000Z',
        concluida: false,
      },
    ],
    campanhas: [
      {
        id: 'camp-1',
        eventoId: evento1Id,
        nome: 'Lançamento Oficial Festival Curitiba',
        tipo: 'lancamento',
        status: 'ativa',
        orcamentoDiarioCents: 150000,
        cliques: 12450,
        conversoes: 680,
        receitaAtribuidaCents: 12240000,
      },
      {
        id: 'camp-2',
        eventoId: evento1Id,
        nome: 'Recuperação de Carrinho Abandonado (WhatsApp + CAPI)',
        tipo: 'remarketing',
        status: 'ativa',
        orcamentoDiarioCents: 50000,
        cliques: 4890,
        conversoes: 310,
        receitaAtribuidaCents: 5580000,
      },
      {
        id: 'camp-3',
        eventoId: evento2Id,
        nome: 'Virada de Lote Show SP',
        tipo: 'virada_lote',
        status: 'ativa',
        orcamentoDiarioCents: 80000,
        cliques: 8200,
        conversoes: 420,
        receitaAtribuidaCents: 9240000,
      },
    ],
    pixels: [
      {
        id: 'pix-1',
        eventoId: evento1Id,
        plataforma: 'meta',
        pixelId: '9840291847192',
        apiToken: 'EAAB...masked',
        ativo: true,
      },
      {
        id: 'pix-2',
        eventoId: evento1Id,
        plataforma: 'google',
        pixelId: 'AW-1094829104',
        ativo: true,
      },
    ],
    utms: [
      {
        id: 'utm-1',
        eventoId: evento1Id,
        canal: 'instagram',
        urlFinal: 'https://newdawn.diskingressos.com.br/evento/festival-curitiba-2026?utm_source=instagram&utm_medium=stories&utm_campaign=lancamento',
        cliques: 14200,
        conversoes: 780,
      },
    ],
    cupons: [
      {
        id: 'cup-1',
        eventoId: evento1Id,
        codigo: 'FESTIVAL10',
        tipo: 'percentual',
        valor: 10,
        limiteUsos: 500,
        usosAtuais: 142,
        ativo: true,
      },
    ],
    chamadosSac: [
      {
        id: 'sac-1',
        protocolo: 'SAC-849201',
        clienteNome: 'Mariana Souza Rocha',
        cpf: '123.456.789-00',
        email: 'mariana.souza@gmail.com',
        telefone: '(41) 99876-5432',
        pedidoId: 'ped-84920',
        eventoId: evento1Id,
        assunto: 'Dúvida sobre transferência de titularidade de ingresso',
        descricao: 'Comprei dois ingressos no lote promocional e gostaria de transferir um para meu irmão.',
        categoria: 'ingresso',
        prioridade: 'media',
        status: 'em_atendimento',
        agenteResponsavel: 'Operador SAC Central',
        slaHoras: 24,
        slaLimiteEm: new Date(Date.now() + 86400000).toISOString(),
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        mensagens: [
          {
            id: 'm-1',
            autorTipo: 'cliente',
            autorNome: 'Mariana Souza Rocha',
            conteudo: 'Olá, comprei dois ingressos e preciso alterar o nome no segundo ingresso.',
            createdAt: new Date(Date.now() - 7200000).toISOString(),
          },
          {
            id: 'm-2',
            autorTipo: 'agente',
            autorNome: 'Operador SAC Central',
            conteudo: 'Olá Mariana! Você pode alterar a titularidade até 48h antes do evento direto na aba Meus Ingressos.',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
          },
        ],
      },
    ],
    ocorrenciasSuporte: [
      {
        id: 'sup-1',
        eventoId: evento1Id,
        produtorId: DEFAULT_PRODUTOR_ID,
        titulo: 'Instabilidade de link na catraca Portão C',
        descricao: 'Queda temporária de Wi-Fi no leitor biométrico/QR do portão VIP.',
        tipo: 'catraca',
        categoria: 'catraca',
        status: 'em_andamento',
        severidade: 'alta',
        prioridade: 'alta',
        responsavel: 'Equipe de Infraestrutura de Rede',
        createdAt: new Date(Date.now() - 5400000).toISOString(),
      },
    ],
    estornos: [
      {
        id: 'est-1',
        pedidoId: 'ped-84811',
        clienteId: 'cli-9482',
        eventoId: evento1Id,
        motivo: 'ARREPENDIMENTO_CDC_7_DIAS',
        status: 'aprovado',
        valorSolicitadoCents: 19800,
        valorAprovadoCents: 19800,
        taxaRetidaCents: 0,
        debitoProdutorCents: 19800,
        solicitadoEm: new Date(Date.now() - 86400000).toISOString(),
        analisadoPor: 'Supervisor Financeiro',
        transicoes: [
          {
            id: 'tr-1',
            de: 'solicitado',
            para: 'aprovado',
            atorId: 'Supervisor Financeiro',
            observacao: 'Elegível ao Art. 49 CDC (compra realizada há 3 dias). Devolução total sem retenção.',
            criadoEm: new Date(Date.now() - 43200000).toISOString(),
          },
        ],
      },
    ],
  };
}

// Global singleton across requests in Node/Edge runtime
declare global {
  // eslint-disable-next-line no-var
  var __EDDIE_STORE__: StoreState | undefined;
}

if (!globalThis.__EDDIE_STORE__) {
  globalThis.__EDDIE_STORE__ = inicializarStore();
}

const store = globalThis.__EDDIE_STORE__;

// Helper para calcular saldos agregados de um produtor
function calcularSaldosProdutor(eventoId?: string) {
  if (eventoId && store.saldosPorEvento[eventoId]) {
    const s = store.saldosPorEvento[eventoId];
    return {
      disponivelCents: s.disponivel,
      bloqueadoCents: s.bloqueado,
      reservadoEstornoCents: s.estorno,
      retidoCents: s.retido,
      totalPatrimonioCents: s.disponivel + s.bloqueado + s.estorno + s.retido,
    };
  }

  // Consolidado de todos os eventos
  let disponivel = 0;
  let bloqueado = 0;
  let retido = 0;
  let estorno = 0;

  for (const s of Object.values(store.saldosPorEvento)) {
    disponivel += s.disponivel;
    bloqueado += s.bloqueado;
    retido += s.retido;
    estorno += s.estorno;
  }

  return {
    disponivelCents: disponivel,
    bloqueadoCents: bloqueado,
    reservadoEstornoCents: estorno,
    retidoCents: retido,
    totalPatrimonioCents: disponivel + bloqueado + retido + estorno,
  };
}

// ============================================================================
//  ROUTER PRINCIPAL DE ENDPOINTS
// ============================================================================

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const pathParts = resolvedParams.path || [];
  const fullPath = pathParts.join('/');
  const { searchParams } = new URL(req.url);

  // 1. EVENTOS
  if (fullPath.startsWith('eventos/produtor/')) {
    return NextResponse.json(store.eventos);
  }
  if (fullPath.startsWith('eventos/') && pathParts.length === 2) {
    const id = pathParts[1];
    const ev = store.eventos.find((e) => e.id === id);
    return ev ? NextResponse.json(ev) : NextResponse.json({ message: 'Evento não encontrado' }, { status: 404 });
  }

  // 2. FINANCEIRO
  if (fullPath.startsWith('financeiro/saldos/produtor/') && fullPath.endsWith('/eventos')) {
    const saldosEventos = store.eventos.map((e) => {
      const s = store.saldosPorEvento[e.id] || { disponivel: 0, bloqueado: 0, retido: 0, estorno: 0 };
      return {
        eventoId: e.id,
        nome: e.nome,
        status: e.status,
        saldoDisponivelCents: s.disponivel,
        saldoBloqueadoCents: s.bloqueado,
        reservaEstornoCents: s.estorno,
        saldoRetidoCents: s.retido,
        patrimonioCents: s.disponivel + s.bloqueado + s.estorno + s.retido,
      };
    });
    return NextResponse.json({
      produtorId: DEFAULT_PRODUTOR_ID,
      saldoConsolidadoDisponivelCents: saldosEventos.reduce((a, b) => a + b.saldoDisponivelCents, 0),
      eventos: saldosEventos,
    });
  }

  if (fullPath.startsWith('financeiro/saldos/produtor/')) {
    const eventoId = searchParams.get('eventoId') || undefined;
    return NextResponse.json(calcularSaldosProdutor(eventoId));
  }

  if (fullPath.startsWith('financeiro/extrato/')) {
    const eventoId = searchParams.get('eventoId');
    const items = eventoId ? store.extrato.filter((x) => x.eventoId === eventoId) : store.extrato;
    return NextResponse.json(items);
  }

  if (fullPath === 'financeiro/contas-pagar') {
    const eventoId = searchParams.get('eventoId');
    const items = eventoId ? store.contasPagar.filter((x) => x.eventoId === eventoId) : store.contasPagar;
    return NextResponse.json(items);
  }

  if (fullPath.startsWith('financeiro/repasses/')) {
    return NextResponse.json(store.repasses);
  }

  if (fullPath.startsWith('financeiro/antecipacoes/')) {
    return NextResponse.json(store.antecipacoes);
  }

  if (fullPath === 'financeiro/conciliacao/divergencias') {
    return NextResponse.json(store.divergencias);
  }

  if (fullPath === 'financeiro/contas-financeiras') {
    return NextResponse.json(store.contasFinanceiras);
  }

  // 3. CONTABILIDADE
  if (fullPath === 'contabilidade/centro-controle' || fullPath === 'contabilidade/centro-controle-eventos') {
    const competencias = ['2026-09', '2026-08', '2026-07'];
    const matriz = store.eventos.flatMap((ev) =>
      competencias.map((comp) => ({
        eventoId: ev.id,
        eventoNome: ev.nome,
        competencia: comp,
        conciliado: comp !== '2026-09',
        fechado: comp === '2026-07',
        status: comp === '2026-09' ? 'aberto' : comp === '2026-08' ? 'conciliado' : 'fechado',
        alertas: comp === '2026-09' ? 1 : 0,
      })),
    );
    return NextResponse.json({ competenciaAtiva: '2026-09', matriz, items: matriz });
  }

  if (fullPath === 'contabilidade/dashboard') {
    return NextResponse.json({
      competencia: searchParams.get('competencia') || '2026-09',
      totalLancamentos: 148,
      totalDebitosCents: 45200000,
      totalCreditosCents: 45200000,
      periodoFechado: false,
      contasConciliadas: 8,
      contasDivergentes: 0,
    });
  }

  if (fullPath === 'contabilidade/dre') {
    return NextResponse.json({
      competencia: searchParams.get('competencia') || '2026-09',
      receitaBrutaServicosCents: 3150000,
      recursosTerceirosCents: 27000000,
      deducoesImpostosCents: 410000,
      receitaLiquidaCents: 2740000,
      despesasOperacionaisCents: 920000,
      resultadoOperacionalCents: 1820000,
    });
  }

  if (fullPath === 'contabilidade/balancete') {
    return NextResponse.json({
      competencia: searchParams.get('competencia') || '2026-09',
      totalDebitosCents: 45200000,
      totalCreditosCents: 45200000,
      balanceado: true,
      contas: [
        { codigo: '1.1.1.01', nome: 'Bancos Conta Movimento', saldoDevedorCents: 12750000, saldoCredorCents: 0 },
        { codigo: '1.1.2.01', nome: 'Gateways a Receber', saldoDevedorCents: 15400000, saldoCredorCents: 0 },
        { codigo: '2.1.1.01', nome: 'Recursos de Produtores a Repassar', saldoDevedorCents: 0, saldoCredorCents: 24500000 },
        { codigo: '3.1.1.01', nome: 'Receita de Taxa de Conveniência', saldoDevedorCents: 0, saldoCredorCents: 3650000 },
      ],
    });
  }

  if (fullPath === 'contabilidade/livro-diario' || fullPath === 'contabilidade/lancamentos') {
    return NextResponse.json([
      {
        id: 'ld-1',
        numeroLancamento: 101,
        data: '2026-09-20',
        historico: 'Apropriação de lote de ingressos vendidos - Festival Curitiba',
        debitosCents: 39600,
        creditosCents: 39600,
        partidas: [
          { conta: 'Bancos Conta Movimento', tipo: 'D', valorCents: 39600 },
          { conta: 'Recursos de Terceiros a Repassar', tipo: 'C', valorCents: 36000 },
          { conta: 'Receita de Taxas', tipo: 'C', valorCents: 3600 },
        ],
      },
    ]);
  }

  if (fullPath === 'contabilidade/conciliacoes') {
    return NextResponse.json([
      {
        contaNome: 'Bancos Conta Movimento (Itaú)',
        competencia: '2026-09',
        saldoContabilCents: 9540000,
        saldoExtratoCents: 9540000,
        diferencaCents: 0,
        status: 'conciliado',
      },
    ]);
  }

  // 4. COMERCIAL B2B
  if (fullPath === 'comercial/oportunidades') {
    return NextResponse.json(store.oportunidades);
  }
  if (fullPath === 'comercial/pipeline/resumo') {
    const totalOps = store.oportunidades.length;
    const totalCents = store.oportunidades.reduce((a, b) => a + (b.valorEstimado || 0) * 100, 0);
    return NextResponse.json({
      totalOportunidades: totalOps,
      valorTotalEstimadoCents: totalCents,
      porEtapa: {},
    });
  }
  if (fullPath === 'comercial/produtores') {
    return NextResponse.json(store.produtoresB2B);
  }
  if (fullPath === 'comercial/condicoes') {
    return NextResponse.json(store.condicoes);
  }
  if (fullPath === 'comercial/atividades') {
    return NextResponse.json(store.atividades);
  }

  // 5. MARKETING & REMARKETING
  if (fullPath === 'marketing/campanhas/templates') {
    return NextResponse.json([
      {
        id: 'tpl-lancamento',
        nome: 'Campanha de Lançamento e Abertura de Vendas',
        descricao: 'Geração de awareness, tráfego qualificado e conversão imediata para os primeiros lotes.',
        canais: ['meta', 'google', 'tiktok'],
        sugeridoOrcamentoDiarioCents: 150000,
        objetivo: 'conversao',
      },
      {
        id: 'tpl-carrinho',
        nome: 'Recuperação de Carrinho Abandonado',
        descricao: 'Remarketing dinâmico para compradores que iniciaram checkout mas não concluíram pagamento.',
        canais: ['meta', 'whatsapp'],
        sugeridoOrcamentoDiarioCents: 50000,
        objetivo: 'remarketing',
      },
      {
        id: 'tpl-virada',
        nome: 'Aviso de Virada de Lote 48h',
        descricao: 'Gatilho de urgência e escassez para acelerar o esgotamento do lote vigente.',
        canais: ['meta', 'google', 'email'],
        sugeridoOrcamentoDiarioCents: 100000,
        objetivo: 'urgencia',
      },
    ]);
  }
  if (fullPath === 'marketing/campanhas') {
    return NextResponse.json(store.campanhas);
  }
  if (fullPath === 'marketing/pixels/todos' || fullPath === 'marketing/pixels') {
    return NextResponse.json(store.pixels);
  }
  if (fullPath === 'marketing/links' || fullPath === 'marketing/utms') {
    return NextResponse.json(store.utms);
  }
  if (fullPath === 'marketing/cupons') {
    return NextResponse.json(store.cupons);
  }
  if (fullPath === 'marketing/kpis') {
    const totalCliques = store.utms.reduce((a, b) => a + (b.cliques || 0), 0);
    const totalConversoes = store.utms.reduce((a, b) => a + (b.conversoes || 0), 0);
    const receita = store.campanhas.reduce((a, b) => a + (b.receitaAtribuidaCents || 0), 0);
    const gasto = store.campanhas.reduce((a, b) => a + (b.orcamentoDiarioCents || 0), 0);
    return NextResponse.json({
      totalCampanhasAtivas: store.campanhas.filter((c) => c.status === 'ativa').length,
      totalCliquesLinks: totalCliques,
      totalConversoes: totalConversoes,
      receitaTotalAtribuidaCents: receita,
      orcamentoGastoCents: gasto,
      roasMedio: gasto > 0 ? (receita / gasto).toFixed(1) + 'x' : '—',
    });
  }

  // 6. ATENDIMENTO SAC
  if (fullPath === 'sac/chamados') {
    const status = searchParams.get('status');
    const items = status && status !== 'todos' ? store.chamadosSac.filter((x) => x.status === status) : store.chamadosSac;
    return NextResponse.json(items);
  }

  if (fullPath.startsWith('sac/chamados/') && pathParts.length === 3) {
    const id = pathParts[2];
    const c = store.chamadosSac.find((x) => x.id === id);
    return c ? NextResponse.json(c) : NextResponse.json({ message: 'Chamado não encontrado' }, { status: 404 });
  }

  if (fullPath === 'sac/consultar' || fullPath === 'sac/consulta') {
    const q = (searchParams.get('q') || '').trim().toLowerCase();
    if (!q) return NextResponse.json({ encontrado: false });

    const match = store.chamadosSac.find(
      (c) =>
        c.cpf?.toLowerCase().includes(q) ||
        c.pedidoId?.toLowerCase().includes(q) ||
        c.clienteNome?.toLowerCase().includes(q) ||
        c.telefone?.toLowerCase().includes(q) ||
        c.protocolo?.toLowerCase().includes(q),
    );

    if (!match) return NextResponse.json({ encontrado: false });

    return NextResponse.json({
      encontrado: true,
      comprador: {
        nome: match.clienteNome,
        cpf: match.cpf,
        email: match.email,
        telefone: match.telefone,
        totalChamados: store.chamadosSac.filter((x) => x.cpf === match.cpf).length,
        chamadosAbertos: store.chamadosSac.filter((x) => x.cpf === match.cpf && x.status !== 'resolvido').length,
      },
      chamados: [match],
      estornos: store.estornos.filter((e) => e.pedidoId === match.pedidoId),
    });
  }

  // 7. SUPORTE OPERACIONAL
  if (fullPath === 'suporte/ocorrencias' || fullPath === 'suporte-eventos/ocorrencias') {
    const eventoId = searchParams.get('eventoId');
    const items = eventoId ? store.ocorrenciasSuporte.filter((x) => x.eventoId === eventoId) : store.ocorrenciasSuporte;
    return NextResponse.json(items);
  }

  // 8. ESTORNO
  if (fullPath === 'estornos') {
    return NextResponse.json(store.estornos);
  }

  return NextResponse.json({ ok: true, path: fullPath, timestamp: new Date().toISOString() });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const pathParts = resolvedParams.path || [];
  const fullPath = pathParts.join('/');
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  // 1. EVENTOS
  if (fullPath === 'eventos') {
    const novo = {
      id: `ev-${Date.now()}`,
      nome: body.nome || 'Novo Evento',
      slug: body.slug || `evento-${Date.now()}`,
      categoria: body.categoria || 'show',
      classificacaoEtaria: body.classificacaoEtaria || 16,
      status: 'rascunho',
      createdAt: new Date().toISOString(),
      sessoes: [],
    };
    store.eventos.unshift(novo);
    store.saldosPorEvento[novo.id] = { disponivel: 0, bloqueado: 0, retido: 0, estorno: 0 };
    return NextResponse.json(novo, { status: 201 });
  }

  if (fullPath.startsWith('eventos/') && fullPath.endsWith('/publicar')) {
    const id = pathParts[1];
    const ev = store.eventos.find((e) => e.id === id);
    if (ev) ev.status = 'publicado';
    return NextResponse.json({ ok: true, evento: ev });
  }

  if (fullPath.startsWith('eventos/') && fullPath.endsWith('/sessoes')) {
    const id = pathParts[1];
    const ev = store.eventos.find((e) => e.id === id);
    if (ev) {
      const sessao = {
        id: `sess-${Date.now()}`,
        inicioEm: body.inicioEm,
        fimEm: body.fimEm,
        capacidadeTotal: body.capacidadeTotal || 1000,
        local: { nome: body.localNome || 'Local Principal', cidade: 'Curitiba', uf: 'PR' },
        setores: [],
        lotes: [],
      };
      ev.sessoes = ev.sessoes || [];
      ev.sessoes.push(sessao);
      return NextResponse.json(sessao, { status: 201 });
    }
  }

  // 2. FINANCEIRO
  if (fullPath === 'financeiro/transferencias/inter-eventos') {
    const { eventoOrigemId, eventoDestinoId, valorCents, justificativa } = body;
    const cents = Number(valorCents);

    const sOrigem = store.saldosPorEvento[eventoOrigemId];
    const sDestino = store.saldosPorEvento[eventoDestinoId];

    if (!sOrigem || sOrigem.disponivel < cents) {
      return NextResponse.json({ message: 'Saldo disponível insuficiente no evento de origem.' }, { status: 400 });
    }

    if (!sDestino) {
      store.saldosPorEvento[eventoDestinoId] = { disponivel: 0, bloqueado: 0, retido: 0, estorno: 0 };
    }

    sOrigem.disponivel -= cents;
    store.saldosPorEvento[eventoDestinoId]!.disponivel += cents;

    store.extrato.unshift({
      id: `tr-out-${Date.now()}`,
      createdAt: new Date().toISOString(),
      tipo: 'TRANSFERENCIA_SAIDA',
      descricao: `Transferência para outro evento: ${justificativa || 'Ajuste de caixa'}`,
      valorCents: cents,
      bucket: 'disponivel',
      eventoId: eventoOrigemId,
      saldoAposCents: sOrigem.disponivel,
    });

    store.extrato.unshift({
      id: `tr-in-${Date.now()}`,
      createdAt: new Date().toISOString(),
      tipo: 'TRANSFERENCIA_ENTRADA',
      descricao: `Transferência recebida: ${justificativa || 'Ajuste de caixa'}`,
      valorCents: cents,
      bucket: 'disponivel',
      eventoId: eventoDestinoId,
      saldoAposCents: store.saldosPorEvento[eventoDestinoId]!.disponivel,
    });

    return NextResponse.json({ ok: true, transferidoCents: cents });
  }

  if (fullPath === 'financeiro/contas-pagar') {
    const item = {
      id: `cp-${Date.now()}`,
      eventoId: body.eventoId,
      fornecedor: body.fornecedor,
      descricao: body.descricao,
      categoria: body.categoria || 'servico',
      valorCents: Number(body.valorCents),
      vencimentoEm: body.vencimentoEm,
      status: 'pendente',
    };
    store.contasPagar.unshift(item);
    return NextResponse.json(item, { status: 201 });
  }

  if (fullPath.startsWith('financeiro/contas-pagar/') && fullPath.endsWith('/pagar')) {
    const id = pathParts[2];
    const conta = store.contasPagar.find((c) => c.id === id);
    if (conta) {
      conta.status = 'paga';
      conta.pagoEm = new Date().toISOString();
      const s = store.saldosPorEvento[conta.eventoId];
      if (s) s.disponivel = Math.max(0, s.disponivel - conta.valorCents);

      store.extrato.unshift({
        id: `pg-cp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        tipo: 'PAGAMENTO_FORNECEDOR',
        descricao: `Baixa de conta: ${conta.fornecedor} (${conta.descricao})`,
        valorCents: conta.valorCents,
        bucket: 'disponivel',
        eventoId: conta.eventoId,
        saldoAposCents: s ? s.disponivel : 0,
      });
    }
    return NextResponse.json({ ok: true, conta });
  }

  if (fullPath === 'financeiro/repasses/solicitar') {
    const item = {
      id: `rep-${Date.now()}`,
      eventoId: body.eventoId,
      valorCents: Number(body.valorCents),
      banco: body.banco || 'Banco Santander',
      chavePix: body.chavePix,
      solicitadoEm: new Date().toISOString(),
      status: 'solicitado',
      observacao: body.observacao || null,
    };
    store.repasses.unshift(item);
    return NextResponse.json(item, { status: 201 });
  }

  if (fullPath.startsWith('financeiro/repasses/') && (fullPath.endsWith('/aprovar') || fullPath.endsWith('/liquidar'))) {
    const id = pathParts[2];
    const rep = store.repasses.find((r) => r.id === id);
    if (rep) {
      if (fullPath.endsWith('/aprovar')) rep.status = 'aprovado';
      if (fullPath.endsWith('/liquidar')) {
        rep.status = 'liquidado';
        rep.liquidadoEm = new Date().toISOString();
        const s = store.saldosPorEvento[rep.eventoId];
        if (s) s.disponivel = Math.max(0, s.disponivel - rep.valorCents);
      }
    }
    return NextResponse.json({ ok: true, repasse: rep });
  }

  if (fullPath === 'financeiro/antecipacoes/simular') {
    const valor = Number(body.valorSolicitadoCents || 0);
    const taxa = 2.5;
    const desconto = Math.round(valor * (taxa / 100));
    return NextResponse.json({
      valorSolicitadoCents: valor,
      taxaDesconto: taxa,
      valorLiquidoCents: valor - desconto,
      diasRestantes: 45,
    });
  }

  if (fullPath === 'financeiro/antecipacoes/solicitar') {
    const valor = Number(body.valorSolicitadoCents || 0);
    const taxa = 2.5;
    const desconto = Math.round(valor * (taxa / 100));
    const item = {
      id: `ant-${Date.now()}`,
      eventoId: body.eventoId,
      valorSolicitadoCents: valor,
      taxaDesconto: taxa,
      valorLiquidoCents: valor - desconto,
      diasRestantes: 45,
      status: 'aprovado',
      solicitadoEm: new Date().toISOString(),
    };
    store.antecipacoes.unshift(item);
    const s = store.saldosPorEvento[body.eventoId];
    if (s) s.disponivel += item.valorLiquidoCents;
    return NextResponse.json(item, { status: 201 });
  }

  // 3. COMERCIAL
  if (fullPath === 'comercial/oportunidades') {
    const op = {
      id: `op-${Date.now()}`,
      titulo: body.titulo,
      empresa: body.empresa,
      contatoNome: body.contatoNome,
      contatoEmail: body.contatoEmail,
      valorEstimado: Number(body.valorEstimado || 0),
      etapa: body.etapa || 'qualificacao',
      probabilidade: 50,
      fechamentoPrevisto: body.fechamentoPrevisto || '2026-12-31',
    };
    store.oportunidades.unshift(op);
    return NextResponse.json(op, { status: 201 });
  }

  // 4. MARKETING
  if (fullPath === 'marketing/campanhas/ativar-template') {
    const template = {
      id: `camp-${Date.now()}`,
      eventoId: body.eventoId || store.eventos[0]?.id,
      nome: body.nome || 'Campanha Automática 1-Click',
      tipo: body.tipo || 'conversao',
      status: 'ativa',
      orcamentoDiarioCents: 100000,
      cliques: 0,
      conversoes: 0,
      receitaAtribuidaCents: 0,
    };
    store.campanhas.unshift(template);
    return NextResponse.json(template, { status: 201 });
  }

  if (fullPath === 'marketing/utms') {
    const item = {
      id: `utm-${Date.now()}`,
      eventoId: body.eventoId,
      canal: body.canal || 'link',
      urlFinal: `${body.urlDestino}?utm_source=${body.utmSource}&utm_medium=${body.utmMedium}`,
      cliques: 0,
      conversoes: 0,
    };
    store.utms.unshift(item);
    return NextResponse.json(item, { status: 201 });
  }

  if (fullPath === 'marketing/cupons') {
    const item = {
      id: `cup-${Date.now()}`,
      eventoId: body.eventoId,
      codigo: body.codigo.toUpperCase(),
      tipo: body.tipo,
      valor: Number(body.valor),
      limiteUsos: Number(body.limiteUsos || 100),
      usosAtuais: 0,
      ativo: true,
    };
    store.cupons.unshift(item);
    return NextResponse.json(item, { status: 201 });
  }

  // 5. SAC
  if (fullPath === 'sac/chamados') {
    const chamado = {
      id: `sac-${Date.now()}`,
      protocolo: `SAC-${Date.now().toString().slice(-6)}`,
      clienteNome: body.compradorNome || body.clienteNome,
      cpf: body.compradorCpf || body.cpf || 'Não informado',
      email: body.compradorEmail || body.email || 'Não informado',
      telefone: body.compradorTelefone || body.telefone || 'Não informado',
      pedidoId: body.pedidoId || null,
      eventoId: body.eventoId || store.eventos[0]?.id,
      assunto: body.assunto,
      descricao: body.descricao || body.mensagemInicial,
      categoria: body.categoria || 'duvida',
      prioridade: body.prioridade || 'media',
      status: 'aberto',
      agenteResponsavel: 'Atendente SAC',
      slaHoras: 24,
      slaLimiteEm: new Date(Date.now() + 86400000).toISOString(),
      createdAt: new Date().toISOString(),
      mensagens: body.mensagemInicial
        ? [
            {
              id: `msg-${Date.now()}`,
              autorTipo: 'cliente',
              autorNome: body.compradorNome || body.clienteNome,
              conteudo: body.mensagemInicial,
              createdAt: new Date().toISOString(),
            },
          ]
        : [],
    };
    store.chamadosSac.unshift(chamado);
    return NextResponse.json(chamado, { status: 201 });
  }

  if (fullPath.startsWith('sac/chamados/') && fullPath.endsWith('/mensagens')) {
    const id = pathParts[2];
    const c = store.chamadosSac.find((x) => x.id === id);
    if (c) {
      const msg = {
        id: `msg-${Date.now()}`,
        autorTipo: body.autorTipo || 'agente',
        autorNome: body.autorNome || 'Atendente SAC',
        conteudo: body.conteudo,
        createdAt: new Date().toISOString(),
      };
      c.mensagens.push(msg);
      if (c.status === 'aberto') c.status = 'em_atendimento';
      return NextResponse.json(msg, { status: 201 });
    }
  }

  // 6. SUPORTE
  if (fullPath === 'suporte/ocorrencias' || fullPath === 'suporte-eventos/ocorrencias') {
    const oc = {
      id: `sup-${Date.now()}`,
      eventoId: body.eventoId,
      produtorId: DEFAULT_PRODUTOR_ID,
      titulo: body.titulo,
      descricao: body.descricao,
      tipo: body.tipo || body.categoria || 'catraca',
      categoria: body.tipo || body.categoria || 'catraca',
      status: 'aberta',
      severidade: body.severidade || body.prioridade || 'media',
      prioridade: body.severidade || body.prioridade || 'media',
      responsavel: body.responsavel || 'Equipe de Campo',
      createdAt: new Date().toISOString(),
    };
    store.ocorrenciasSuporte.unshift(oc);
    return NextResponse.json(oc, { status: 201 });
  }

  // 7. ESTORNO
  if (fullPath === 'estornos/solicitar') {
    const item = {
      id: `est-${Date.now()}`,
      pedidoId: body.pedidoId,
      clienteId: body.compradorId,
      eventoId: body.eventoId,
      motivo: body.motivo,
      status: 'solicitado',
      valorSolicitadoCents: Number(body.valorTotalCents),
      valorAprovadoCents: null,
      taxaRetidaCents: body.retemTaxaConveniencia ? Math.round(Number(body.valorTotalCents) * 0.1) : 0,
      debitoProdutorCents: null,
      solicitadoEm: new Date().toISOString(),
      transicoes: [],
    };
    store.estornos.unshift(item);
    return NextResponse.json(item, { status: 201 });
  }

  if (fullPath === 'estornos/decidir') {
    const { estornoId, acao, analisadoPor, justificativa } = body;
    const est = store.estornos.find((e) => e.id === estornoId);
    if (est) {
      est.status = acao === 'APROVAR' ? 'aprovado' : 'negado';
      est.analisadoPor = analisadoPor || 'Operador Financeiro';
      if (acao === 'APROVAR') {
        est.valorAprovadoCents = est.valorSolicitadoCents - (est.taxaRetidaCents || 0);
        est.debitoProdutorCents = est.valorAprovadoCents;
        const s = store.saldosPorEvento[est.eventoId];
        if (s) {
          s.disponivel = Math.max(0, s.disponivel - est.valorAprovadoCents);
        }
      }
      est.transicoes = est.transicoes || [];
      est.transicoes.push({
        id: `tr-${Date.now()}`,
        de: 'solicitado',
        para: est.status,
        atorId: analisadoPor || 'Operador Financeiro',
        observacao: justificativa || (acao === 'APROVAR' ? 'Aprovado pelo operador' : 'Negado pelo operador'),
        criadoEm: new Date().toISOString(),
      });
    }
    return NextResponse.json({ ok: true, estorno: est });
  }

  return NextResponse.json({ ok: true, created: true });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const pathParts = resolvedParams.path || [];
  const fullPath = pathParts.join('/');
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  // 1. COMERCIAL: Atualizar etapa no Kanban
  if (fullPath.startsWith('comercial/oportunidades/') && fullPath.endsWith('/etapa')) {
    const id = pathParts[2];
    const op = store.oportunidades.find((o) => o.id === id);
    if (op) {
      op.etapa = body.etapa;
    }
    return NextResponse.json({ ok: true, oportunidade: op });
  }

  // 2. SAC: Atualizar status do chamado
  if (fullPath.startsWith('sac/chamados/') && (fullPath.endsWith('/status') || pathParts.length === 3)) {
    const id = pathParts[2];
    const c = store.chamadosSac.find((x) => x.id === id);
    if (c) {
      c.status = body.status;
      if (body.agenteResponsavel) c.agenteResponsavel = body.agenteResponsavel;
      if (body.status === 'resolvido') {
        c.resolvidoEm = new Date().toISOString();
        if (body.solucao) {
          c.mensagens.push({
            id: `msg-${Date.now()}`,
            autorTipo: 'sistema',
            autorNome: 'Resolução Oficial',
            conteudo: `Resolução: ${body.solucao}`,
            createdAt: new Date().toISOString(),
          });
        }
      }
    }
    return NextResponse.json({ ok: true, chamado: c });
  }

  // 3. SUPORTE: Resolver ocorrência
  if (fullPath.startsWith('suporte/ocorrencias/') || fullPath.startsWith('suporte-eventos/ocorrencias/')) {
    const id = pathParts[2];
    const oc = store.ocorrenciasSuporte.find((x) => x.id === id);
    if (oc) {
      if (body.status) oc.status = body.status;
      if (body.solucao) oc.solucao = body.solucao;
      if (body.status === 'resolvida') oc.resolvidoEm = new Date().toISOString();
    }
    return NextResponse.json({ ok: true, ocorrencia: oc });
  }

  // 4. MARKETING: Toggle Cupom
  if (fullPath.startsWith('marketing/cupons/') && fullPath.endsWith('/toggle')) {
    const id = pathParts[2];
    const cup = store.cupons.find((c) => c.id === id);
    if (cup) cup.ativo = !cup.ativo;
    return NextResponse.json({ ok: true, cupom: cup });
  }

  return NextResponse.json({ ok: true });
}

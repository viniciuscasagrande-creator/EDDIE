import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function backendBase() {
  const raw = process.env.API_INTERNAL_URL || process.env.BACKEND_URL || process.env.API_URL || "";
  if (!raw || !/^https?:\/\//i.test(raw)) return "";
  const clean = raw.replace(/\/$/, "");
  return clean.endsWith("/api") ? clean : `${clean}/api`;
}

function handleAutonomousStore(req: NextRequest, pathParts: string[]) {
  const fullPath = pathParts.join('/');
  const method = req.method;

  const defaultEventos = [
    {
      id: 'evento-operacao',
      nome: 'Festival DiskIngressos Live 2026',
      status: 'PUBLICADO',
      slug: 'festival-diskingressos-live',
      capacidadeTotal: 5000,
      ingressosVendidos: 4120,
      cortesias: 150,
      receita: 482500,
      gmv: 482500,
      local: { nome: 'Pedreira Paulo Leminski - Curitiba/PR' },
      sessoes: [
        {
          id: 'sessao-1',
          nome: 'Sessão Principal',
          inicioEm: '2026-11-14T20:00:00Z',
          capacidadeTotal: 5000,
          local: { nome: 'Pedreira Paulo Leminski - Curitiba/PR' },
        },
      ],
    },
    {
      id: 'evento-1',
      nome: 'Turnê Nacional Rock Fest 2026',
      status: 'PUBLICADO',
      slug: 'turne-nacional-rock-fest',
      capacidadeTotal: 3000,
      ingressosVendidos: 2450,
      cortesias: 80,
      receita: 312000,
      gmv: 312000,
      local: { nome: 'Teatro Positivo - Curitiba/PR' },
      sessoes: [
        {
          id: 'sessao-2',
          nome: 'Abertura de Portões',
          inicioEm: '2026-12-05T19:00:00Z',
          capacidadeTotal: 3000,
          local: { nome: 'Teatro Positivo - Curitiba/PR' },
        },
      ],
    },
  ];

  // 1. EVENTOS
  if (fullPath.startsWith('eventos/produtor/') && fullPath.endsWith('/contexto')) {
    return NextResponse.json({
      produtorId: '00000000-0000-0000-0000-000000000002',
      tenantId: '00000000-0000-0000-0000-000000000001',
      eventos: defaultEventos,
    });
  }

  if (fullPath.startsWith('eventos/produtor/')) {
    return NextResponse.json(defaultEventos);
  }

  if (fullPath.startsWith('eventos/') && fullPath.endsWith('/os-resumo')) {
    const evId = pathParts[1];
    const ev = defaultEventos.find((e) => e.id === evId) || defaultEventos[0];
    return NextResponse.json({
      eventoId: ev.id,
      eventoNome: ev.nome,
      gmv: ev.gmv,
      totalVendas: ev.receita,
      capacidadeTotal: ev.capacidadeTotal,
      ingressosVendidos: ev.ingressosVendidos,
      cortesias: ev.cortesias,
      restantes: Math.max(0, ev.capacidadeTotal - ev.ingressosVendidos - ev.cortesias),
      ticketMedio: ev.ingressosVendidos ? Math.round(ev.receita / ev.ingressosVendidos) : 0,
      pontoEquilibrio: Math.round(ev.receita * 0.65),
      metaVendas: Math.round(ev.receita * 1.2),
      projecaoFinal: Math.round(ev.receita * 1.08),
      meiosPagamento: [
        { nome: 'Cartão de Crédito', quantidade: 2890, valor: Math.round(ev.receita * 0.62) },
        { nome: 'PIX Instantâneo', quantidade: 1120, valor: Math.round(ev.receita * 0.35) },
        { nome: 'Débito Bancário', quantidade: 90, valor: Math.round(ev.receita * 0.02) },
        { nome: 'Dinheiro / PDV', quantidade: 20, valor: Math.round(ev.receita * 0.01) },
      ],
      modalidades: [
        { nome: 'Venda Online Web/App', quantidade: 3850, total: Math.round(ev.receita * 0.92) },
        { nome: 'Pontos de Venda Físicos (PDV)', quantidade: 270, total: Math.round(ev.receita * 0.08) },
      ],
      ritmoVendas: [
        { hora: '08:00', valor: 12000, quantidade: 100 },
        { hora: '12:00', valor: 45000, quantidade: 380 },
        { hora: '16:00', valor: 88000, quantidade: 720 },
        { hora: '20:00', valor: 154000, quantidade: 1250 },
      ],
      quantidadePeriodo: [
        { label: 'Seg', valor: 420 },
        { label: 'Ter', valor: 650 },
        { label: 'Qua', valor: 890 },
        { label: 'Qui', valor: 1020 },
        { label: 'Sex', valor: 1140 },
      ],
      valorPeriodo: [
        { label: 'Seg', valor: 45000 },
        { label: 'Ter', valor: 78000 },
        { label: 'Qua', valor: 105000 },
        { label: 'Qui', valor: 124000 },
        { label: 'Sex', valor: 130500 },
      ],
    });
  }

  if (fullPath.startsWith('pedidos/evento/') && fullPath.endsWith('/consulta')) {
    return NextResponse.json({
      items: [
        {
          id: 'ped-849102',
          numero: '849102',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          compradorNome: 'Mariana Silva',
          compradorDocumento: '123.456.789-00',
          status: 'PAGO',
          total: 350.0,
          subtotal: 315.0,
          taxaDisk: 35.0,
          repasseProdutor: 315.0,
        },
        {
          id: 'ped-849098',
          numero: '849098',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          compradorNome: 'Carlos Eduardo',
          compradorDocumento: '987.654.321-99',
          status: 'PAGO',
          total: 220.0,
          subtotal: 198.0,
          taxaDisk: 22.0,
          repasseProdutor: 198.0,
        },
      ],
    });
  }

  if (fullPath.startsWith('eventos/') && pathParts.length === 2) {
    const id = pathParts[1];
    const ev = defaultEventos.find((e) => e.id === id) || defaultEventos[0];
    return NextResponse.json(ev);
  }

  // 2. FINANCEIRO / LEDGER
  if (fullPath.startsWith('financeiro/saldos/produtor/') && fullPath.endsWith('/eventos')) {
    return NextResponse.json({
      totalPatrimonioCents: 25650000,
      eventos: defaultEventos.map((e) => ({
        eventoId: e.id,
        nome: e.nome,
        disponivelCents: e.id === 'evento-operacao' ? 18450000 : 7200000,
        bloqueadoCents: 2500000,
        totalPatrimonioCents: e.id === 'evento-operacao' ? 20950000 : 4700000,
      })),
    });
  }

  if (fullPath.startsWith('financeiro/saldos/produtor/')) {
    return NextResponse.json({
      disponivelCents: 18450000,
      bloqueadoCents: 2500000,
      reservadoEstornoCents: 1200000,
      retidoCents: 3500000,
      totalPatrimonioCents: 25650000,
    });
  }

  if (fullPath.startsWith('financeiro/extrato/')) {
    return NextResponse.json([
      {
        id: 'lanc-1',
        criadoEm: new Date(Date.now() - 3600000).toISOString(),
        origem: 'venda_ingressos',
        bucket: 'disponivel',
        historico: 'Venda Lote 1 - Pedido #849102',
        tipo: 'CREDITO',
        valorCents: 15000,
      },
      {
        id: 'lanc-2',
        criadoEm: new Date(Date.now() - 7200000).toISOString(),
        origem: 'venda_ingressos',
        bucket: 'disponivel',
        historico: 'Venda Lote 2 - Pedido #849098',
        tipo: 'CREDITO',
        valorCents: 22000,
      },
      {
        id: 'lanc-3',
        criadoEm: new Date(Date.now() - 14400000).toISOString(),
        origem: 'taxa_conveniencia',
        bucket: 'retido',
        historico: 'Retenção Taxa de Conveniência Pedido #849098',
        tipo: 'DEBITO',
        valorCents: 2200,
      },
      {
        id: 'lanc-4',
        criadoEm: new Date(Date.now() - 86400000).toISOString(),
        origem: 'repasse_produtor',
        bucket: 'disponivel',
        historico: 'Solicitação de repasse programado',
        tipo: 'DEBITO',
        valorCents: 5000000,
      },
    ]);
  }

  if (fullPath === 'financeiro/contas-pagar') {
    return NextResponse.json([
      {
        id: 'cp-1',
        fornecedorNome: 'Pedreira Locações e Estruturas',
        fornecedorDocumento: '76.123.456/0001-89',
        categoria: 'infraestrutura',
        descricao: 'Locação do espaço e geradores principais',
        valorCents: 4500000,
        vencimentoEm: '2026-10-15T00:00:00Z',
        status: 'pendente',
        chavePix: 'financeiro@pedreira.com.br',
      },
      {
        id: 'cp-2',
        fornecedorNome: 'Segurança & Vigilância Total',
        fornecedorDocumento: '12.987.654/0001-32',
        categoria: 'seguranca',
        descricao: 'Equipe de segurança tática para portões',
        valorCents: 1800000,
        vencimentoEm: '2026-10-20T00:00:00Z',
        status: 'pendente',
        chavePix: 'pix@segurancatotal.com.br',
      },
    ]);
  }

  if (fullPath.startsWith('financeiro/repasses/')) {
    return NextResponse.json([
      {
        id: 'rep-1',
        valorCents: 5000000,
        valorLiquidoCents: 4950000,
        taxaRetidaCents: 50000,
        status: 'solicitado',
        chavePix: 'financeiro@produtora.com.br',
        solicitadoEm: new Date(Date.now() - 86400000).toISOString(),
        dataProgramada: '2026-09-26T00:00:00Z',
      },
    ]);
  }

  if (fullPath.startsWith('financeiro/antecipacoes/')) {
    return NextResponse.json([]);
  }

  if (fullPath.startsWith('financeiro/conciliacao/divergencias')) {
    return NextResponse.json([]);
  }

  if (fullPath.startsWith('financeiro/contas-financeiras')) {
    return NextResponse.json([
      {
        id: 'cf-1',
        banco: 'Banco Itaú',
        agencia: '1234',
        conta: '56789-0',
        titular: 'DiskIngressos Pagamentos S.A.',
        saldoCents: 25650000,
      },
    ]);
  }

  // 3. MARKETING & REMARKETING
  const isMarketingPath = fullPath.includes('marketing/');
  const isRemarketingPath = fullPath.includes('remarketing/');

  // 3.1 Marketing Dashboard
  if (fullPath.endsWith('marketing/dashboard')) {
    return NextResponse.json({
      kpis: {
        vendasAtribuidas: 4800000,
        investimento: 800000,
        roas: 6.0,
        conversoes: 1420,
        cpa: 31.69,
        ctr: 3.85,
        percentualGmv: '58.4%',
      },
      serieDiaria: [
        { data: '2026-09-24', cliques: 840, conv: 64, gasto: 120000, receita: 820000, roas: 6.8 },
        { data: '2026-09-23', cliques: 920, conv: 72, gasto: 135000, receita: 940000, roas: 7.0 },
        { data: '2026-09-22', cliques: 710, conv: 48, gasto: 110000, receita: 650000, roas: 5.9 },
        { data: '2026-09-21', cliques: 680, conv: 42, gasto: 105000, receita: 590000, roas: 5.6 },
        { data: '2026-09-20', cliques: 1150, conv: 98, gasto: 180000, receita: 1280000, roas: 7.1 },
      ],
      campanhas: [
        {
          id: 'camp-1',
          nome: 'Meta Ads · Lançamento Lote 1 Promocional',
          canal: 'Meta Ads',
          status: 'ATIVA',
          orcamentoDiarioCents: 50000,
          cliques: 3420,
          conversoes: 142,
          receitaAtribuidaCents: 2840000,
        },
        {
          id: 'camp-2',
          nome: 'Google Search · Palavras-Chave Nome do Artista',
          canal: 'Google Search',
          status: 'ATIVA',
          orcamentoDiarioCents: 30000,
          cliques: 1890,
          conversoes: 98,
          receitaAtribuidaCents: 1960000,
        },
      ],
    });
  }

  // 3.2 Marketing Campanhas
  if (fullPath.endsWith('marketing/campanhas')) {
    return NextResponse.json([
      {
        id: 'camp-1',
        nome: 'Meta Ads · Lançamento Lote 1 Promocional',
        canal: 'Meta Ads',
        status: 'ATIVA',
        orcamentoDiarioCents: 50000,
        cliques: 3420,
        conversoes: 142,
        receitaAtribuidaCents: 2840000,
      },
      {
        id: 'camp-2',
        nome: 'Google Search · Palavras-Chave Nome do Artista',
        canal: 'Google Search',
        status: 'ATIVA',
        orcamentoDiarioCents: 30000,
        cliques: 1890,
        conversoes: 98,
        receitaAtribuidaCents: 1960000,
      },
    ]);
  }

  // 3.3 Marketing Criativos
  if (fullPath.endsWith('marketing/criativos')) {
    return NextResponse.json([
      {
        id: 'cr-1',
        titulo: 'Arte Principal Oficial · Lote 1',
        formato: '1:1 Feed',
        dimensao: '1080x1080',
        status: 'APROVADO',
        campanhasVinculadas: 2,
        ctr: '4.2%',
      },
      {
        id: 'cr-2',
        titulo: 'Vídeo Teaser Oficial Artista',
        formato: '9:16 Stories/Reels',
        dimensao: '1080x1920',
        status: 'APROVADO',
        campanhasVinculadas: 1,
        ctr: '5.8%',
      },
    ]);
  }

  // 3.4 Marketing Cupons
  if (fullPath.endsWith('marketing/cupons')) {
    return NextResponse.json([
      {
        id: 'cup-1',
        codigo: 'PRIMEIRACOMPRA10',
        tipo: 'porcentagem',
        valor: 10,
        limiteUsos: 500,
        usosAtuais: 142,
        vendasCents: 4970000,
        ativo: true,
      },
      {
        id: 'cup-2',
        codigo: 'VIPDISK20',
        tipo: 'porcentagem',
        valor: 20,
        limiteUsos: 100,
        usosAtuais: 80,
        vendasCents: 3200000,
        ativo: true,
      },
    ]);
  }

  // 3.5 Marketing Pixels & Tracking
  if (fullPath.endsWith('marketing/pixels')) {
    return NextResponse.json([
      {
        nome: 'Meta Pixel & Conversions API (CAPI)',
        id: '849201948102938',
        status: 'ATIVO',
        modo: 'Navegador + Servidor (CAPI)',
        eventos: 'PageView, ViewContent, InitiateCheckout, Purchase',
      },
      {
        nome: 'Google Tag Manager (GTM) & GA4',
        id: 'GTM-DK9821',
        status: 'ATIVO',
        modo: 'Measurement Protocol',
        eventos: 'begin_checkout, purchase, view_item',
      },
    ]);
  }

  // 3.6 Marketing Links / UTMs
  if (fullPath.endsWith('marketing/links') || fullPath === 'marketing/utms') {
    return NextResponse.json([
      {
        id: 'utm-1',
        origem: 'instagram',
        midia: 'stories',
        campanha: 'lote1_lancamento',
        cliques: 3420,
        conversoes: 142,
        receitaCents: 2840000,
      },
    ]);
  }

  // 3.7 Marketing Integrações
  if (fullPath.endsWith('marketing/integracoes')) {
    return NextResponse.json([
      {
        canal: 'Meta Ads',
        status: 'CONECTADO',
        conta: 'act_8941029410',
        ultimaSincronizacao: new Date().toISOString(),
      },
      {
        canal: 'Google Ads',
        status: 'CONECTADO',
        conta: 'cid_741-982-1049',
        ultimaSincronizacao: new Date().toISOString(),
      },
      {
        canal: 'TikTok Ads',
        status: 'AGUARDANDO_INTEGRACAO',
        conta: null,
        ultimaSincronizacao: null,
      },
      {
        canal: 'Spotify Ad Studio',
        status: 'AGUARDANDO_INTEGRACAO',
        conta: null,
        ultimaSincronizacao: null,
      },
    ]);
  }

  // 3.8 Remarketing Dashboard
  if (fullPath.endsWith('remarketing/dashboard')) {
    return NextResponse.json({
      kpis: {
        publicosAtivos: 4820,
        carrinhosAbandonados: 382,
        carrinhosRecuperados: 164,
        taxaRecuperacao: '42.9%',
        receitaRecuperadaCents: 5845000,
      },
    });
  }

  // 3.9 Remarketing Carrinhos Abandonados
  if (fullPath.endsWith('remarketing/carrinhos')) {
    return NextResponse.json([
      {
        id: 'car-9821',
        clienteNome: 'Mariana Silva',
        email: 'mariana.silva@email.com',
        telefone: '(41) 98765-4321',
        setor: 'Pista Premium (2 ingressos)',
        valorCents: 35000,
        tempoAbandono: 'há 18 min',
        canalEntrada: 'Meta Ads (Instagram)',
        status: 'ABERTO',
      },
      {
        id: 'car-9820',
        clienteNome: 'Carlos Eduardo',
        email: 'carlos.edu@gmail.com',
        telefone: '(11) 99882-1244',
        setor: 'Camarote Open Bar (1 ingresso)',
        valorCents: 45000,
        tempoAbandono: 'há 42 min',
        canalEntrada: 'Google Search',
        status: 'DISPARADO',
      },
      {
        id: 'car-9819',
        clienteNome: 'Fernanda Lima',
        email: 'fe.lima@outlook.com',
        telefone: '(41) 99123-8877',
        setor: 'Pista Comum (3 ingressos)',
        valorCents: 36000,
        tempoAbandono: 'há 1h 15m',
        canalEntrada: 'Orgânico',
        status: 'RECUPERADO',
      },
    ]);
  }

  // 3.10 Remarketing Jornadas
  if (fullPath.endsWith('remarketing/jornadas')) {
    return NextResponse.json({
      jornadaAtiva: true,
      passos: [
        { id: '1', kind: 'GATILHO', titulo: 'Visitou evento ou adicionou ao carrinho', ativo: true },
        { id: '2', kind: 'CONDICAO', titulo: 'Não comprou após 30 minutos', ativo: true },
        { id: '3', kind: 'ACAO', titulo: 'WhatsApp Oficial com link de 1-Clique', ativo: true },
        { id: '4', kind: 'ESPERA', titulo: 'Aguardar 6 horas', ativo: true },
        { id: '5', kind: 'DECISAO', titulo: 'Pedido foi concluído?', ativo: true },
        { id: '6', kind: 'ACAO_REMARKETING', titulo: 'Retargeting Meta/Google/TikTok + E-mail Cupom', ativo: true },
        { id: '7', kind: 'RESULTADO', titulo: 'Conversão & Registro no Ledger', ativo: true },
      ],
    });
  }

  // 3.11 Remarketing Conversões & Auditoria
  if (fullPath.endsWith('remarketing/conversoes')) {
    return NextResponse.json([
      {
        numero: 'PED-849102',
        comprador: 'Mariana Silva',
        canal: 'WhatsApp Oficial 1-Clique',
        valorCents: 35000,
        tempoResgate: '24 minutos após abandono',
        correlationId: 'corr_mkt_984102941',
      },
      {
        numero: 'PED-849098',
        comprador: 'Carlos Eduardo',
        canal: 'Retargeting Meta Ads (Instagram)',
        valorCents: 45000,
        tempoResgate: '4 horas após abandono',
        correlationId: 'corr_mkt_984102888',
      },
    ]);
  }

  // 3.12 Marketing / Remarketing legado de vídeo screen
  if (fullPath.startsWith('marketing/video/')) {
    const isMkt = fullPath.includes('/marketing/');
    return NextResponse.json({
      kpis: {
        campanhas_ativas: isMkt ? 4 : 2,
        investimento: isMkt ? 800000 : 300000,
        receita_atribuida: isMkt ? 4800000 : 1950000,
        conversoes: isMkt ? 240 : 95,
        cliques: isMkt ? 5310 : 1240,
        roas: isMkt ? 6.0 : 6.5,
      },
      rows: [
        {
          id: 'row-1',
          canal: 'Meta Ads',
          receitaAtribuida: 2840000,
          gastoAtual: 450000,
          cliques: 3120,
          createdAt: '2026-09-20',
        },
      ],
      channels: [
        { label: 'Meta Ads', value: 2840000 },
        { label: 'Google Search', value: 1960000 },
      ],
      notices: [],
    });
  }

  // 4. COMERCIAL B2B
  if (fullPath === 'comercial/oportunidades') {
    return NextResponse.json([
      {
        id: 'op-1',
        titulo: 'Festival DiskIngressos Live 2026',
        produtorId: '00000000-0000-0000-0000-000000000002',
        produtorNome: 'Live Nation Brasil',
        valorEstimadoCents: 25000000,
        etapa: 'proposta',
        probabilidadePercentual: 60,
        dataFechamentoPrevista: '2026-10-15',
        executivoId: 'exec-1',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'op-2',
        titulo: 'Turnê Nacional Rock Fest 2026',
        produtorId: '00000000-0000-0000-0000-000000000002',
        produtorNome: 'Opus Entretenimento',
        valorEstimadoCents: 18000000,
        etapa: 'negociacao',
        probabilidadePercentual: 75,
        dataFechamentoPrevista: '2026-11-01',
        executivoId: 'exec-1',
        createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ]);
  }

  if (fullPath === 'comercial/produtores') {
    return NextResponse.json([
      {
        id: '00000000-0000-0000-0000-000000000002',
        razaoSocial: 'Live Nation Entretenimento Brasil Ltda',
        nomeFantasia: 'Live Nation Brasil',
        cnpj: '12.345.678/0001-90',
        responsavelNome: 'Carlos Menezes',
        email: 'contato@livenation.com.br',
        telefone: '(11) 3214-5500',
        status: 'ativo',
        tier: 'enterprise',
        createdAt: '2026-01-15T10:00:00Z',
      },
      {
        id: 'prod-02',
        razaoSocial: 'Opus Promocoes e Producoes Ltda',
        nomeFantasia: 'Opus Entretenimento',
        cnpj: '98.765.432/0001-10',
        responsavelNome: 'Ana Paula Rocha',
        email: 'parcerias@opus.com.br',
        telefone: '(51) 3100-2200',
        status: 'ativo',
        tier: 'premium',
        createdAt: '2026-02-20T14:30:00Z',
      },
    ]);
  }

  if (fullPath === 'comercial/condicoes') {
    return NextResponse.json([
      {
        id: 'cnd-1',
        produtorId: '00000000-0000-0000-0000-000000000002',
        produtorNome: 'Live Nation Brasil',
        eventoId: 'evento-operacao',
        taxaServicoPercentual: 10.0,
        taxaProcessamentoPercentual: 2.5,
        prazoRepasseDias: 2,
        status: 'aprovado',
        vigenciaInicio: '2026-01-01',
        vigenciaFim: '2026-12-31',
        aprovadoPor: 'Diretoria Comercial',
        aprovadoEm: '2026-01-05T12:00:00Z',
      },
    ]);
  }

  if (fullPath === 'comercial/atividades') {
    return NextResponse.json([
      {
        id: 'atv-1',
        produtorId: '00000000-0000-0000-0000-000000000002',
        produtorNome: 'Live Nation Brasil',
        oportunidadeId: 'op-1',
        tipo: 'reuniao',
        descricao: 'Alinhamento de taxas e condições comerciais do Festival Live 2026',
        dataAgendada: new Date(Date.now() + 86400000 * 2).toISOString(),
        realizada: false,
        executadoPor: 'Carlos Menezes',
      },
    ]);
  }

  if (fullPath === 'comercial/pipeline/resumo') {
    return NextResponse.json({
      totalOportunidades: 2,
      valorTotalEstimadoCents: 43000000,
      porEtapa: {
        prospeccao: { quantidade: 0, valorTotalCents: 0 },
        qualificacao: { quantidade: 0, valorTotalCents: 0 },
        proposta: { quantidade: 1, valorTotalCents: 25000000 },
        negociacao: { quantidade: 1, valorTotalCents: 18000000 },
        contrato: { quantidade: 0, valorTotalCents: 0 },
        ganho: { quantidade: 0, valorTotalCents: 0 },
      },
    });
  }

  // 5. CONTABILIDADE
  if (fullPath.startsWith('contabilidade/dre')) {
    return NextResponse.json({
      competencia: '2026-09',
      receitaBrutaServicosCents: 4825000,
      recursosTerceirosCents: 43425000,
      deducoesImpostosCents: 241250,
      receitaLiquidaCents: 4583750,
      despesasOperacionaisCents: 1200000,
      resultadoOperacionalCents: 3383750,
    });
  }

  if (fullPath.startsWith('contabilidade/balancete')) {
    return NextResponse.json([
      {
        contaCodigo: '1.1.1.01',
        contaNome: 'Caixa e Bancos Conta Movimento',
        tipo: 'ATIVO',
        saldoAnteriorCents: 22000000,
        debitosCents: 4825000,
        creditosCents: 1200000,
        saldoAtualCents: 25625000,
      },
      {
        contaCodigo: '2.1.2.01',
        contaNome: 'Repasses a Pagar a Produtores',
        tipo: 'PASSIVO',
        saldoAnteriorCents: 18000000,
        debitosCents: 5000000,
        creditosCents: 7650000,
        saldoAtualCents: 20650000,
      },
      {
        contaCodigo: '3.1.1.01',
        contaNome: 'Receita com Taxas de Serviço de Bilheteria',
        tipo: 'RECEITA',
        saldoAnteriorCents: 0,
        debitosCents: 0,
        creditosCents: 4825000,
        saldoAtualCents: 4825000,
      },
    ]);
  }

  if (fullPath.startsWith('contabilidade/dashboard')) {
    return NextResponse.json({
      competencia: '2026-09',
      totalLancamentos: 142,
      totalDebitosCents: 48250000,
      totalCreditosCents: 48250000,
      periodoFechado: false,
      contasConciliadas: 18,
      contasDivergentes: 0,
    });
  }

  if (fullPath.startsWith('contabilidade/centro-controle-eventos') || fullPath === 'contabilidade/centro-controle') {
    return NextResponse.json([
      {
        eventoId: 'evento-operacao',
        eventoNome: 'Festival DiskIngressos Live 2026',
        statusEvento: 'PUBLICADO',
        categoria: 'Música / Festival',
        competencia: '2026-09',
        fechamentoStatus: 'Aberto',
        conciliacaoStatus: 'Conciliado',
        totalDebitosCents: 25650000,
        totalCreditosCents: 25650000,
        receitaPropriaCents: 4825000,
        repassesTerceirosCents: 43425000,
        alertas: [],
      },
    ]);
  }

  if (fullPath.startsWith('contabilidade/lancamentos')) {
    return NextResponse.json([
      {
        id: 'lanc-c-1',
        numeroLancamento: 1042,
        data: new Date(Date.now() - 3600000).toISOString().slice(0, 10),
        competencia: '2026-09',
        totalCents: 15000,
        historico: 'Reconhecimento de receita de taxa - Pedido #849102',
        origemTipo: 'FATURAMENTO',
        eventoId: 'evento-operacao',
        status: 'LANCADO',
        criadoPor: 'Integrador Automático Outbox',
        partidas: [
          {
            id: 'pt-1',
            tipo: 'DEBITO',
            valorCents: 15000,
            contaCodigo: '1.1.1.01',
            contaNome: 'Caixa e Bancos Conta Movimento',
            contaTipo: 'ATIVO',
            natureza: 'DEVEDORA',
          },
          {
            id: 'pt-2',
            tipo: 'CREDITO',
            valorCents: 15000,
            contaCodigo: '3.1.1.01',
            contaNome: 'Receita com Taxas de Serviço',
            contaTipo: 'RECEITA',
            natureza: 'CREDORA',
          },
        ],
      },
    ]);
  }

  if (fullPath.startsWith('contabilidade/conciliacoes')) {
    return NextResponse.json([
      {
        id: 'conc-1',
        competencia: '2026-09',
        contaCodigo: '1.1.1.01',
        contaNome: 'Caixa e Bancos Conta Movimento',
        saldoContabilCents: 25650000,
        saldoBancarioCents: 25650000,
        diferencaCents: 0,
        status: 'CONCILIADO',
        conciliadoPor: 'Auditoria Automática',
        atualizadoEm: new Date(Date.now() - 7200000).toISOString(),
      },
    ]);
  }

  // 6. ESTORNOS & CHARGEBACKS
  if (fullPath.startsWith('estornos')) {
    return NextResponse.json([
      {
        id: 'est-1',
        pedidoId: 'ped-9821',
        clienteId: 'cli-001',
        clienteNome: 'Mariana Silva',
        eventoNome: 'Festival DiskIngressos Live 2026',
        valorSolicitadoCents: 35000,
        valorAprovadoCents: 35000,
        taxaRetidaCents: 0,
        debitoProdutorCents: 35000,
        motivo: 'ARREPENDIMENTO_CDC_7_DIAS',
        status: 'solicitado',
        solicitadoEm: new Date(Date.now() - 3600000).toISOString(),
        transicoes: [
          {
            id: 'tr-1',
            de: null,
            para: 'solicitado',
            atorId: 'sistema',
            observacao: 'Solicitação registrada pelo comprador',
            criadoEm: new Date(Date.now() - 3600000).toISOString(),
          },
        ],
      },
    ]);
  }

  if (fullPath.startsWith('chargebacks')) {
    return NextResponse.json([
      {
        id: 'cb-1',
        pedidoId: 'ped-8902',
        clienteNome: 'Carlos Eduardo',
        eventoNome: 'Festival DiskIngressos Live 2026',
        valorTotalCents: 22000,
        motivo: 'FRAUDE_ALEGADA',
        status: 'em_disputa',
        limiteDefesaEm: new Date(Date.now() + 86400000 * 3).toISOString(),
      },
    ]);
  }

  // 7. SAC
  if (fullPath === 'sac/consultar') {
    return NextResponse.json({
      comprador: {
        nome: 'Mariana Silva',
        cpf: '123.456.789-00',
        email: 'mariana.silva@email.com',
        telefone: '(41) 98765-4321',
      },
      pedidos: [
        {
          numero: '849102',
          data: '2026-09-20T18:30:00Z',
          evento: 'Festival DiskIngressos Live 2026',
          total: 350.0,
          status: 'PAGO',
          itens: [{ setor: 'Pista Premium', quantidade: 2 }],
        },
      ],
    });
  }

  if (fullPath.startsWith('sac/chamados')) {
    const chamadoPadrao = {
      id: 'sac-1',
      protocolo: 'SAC-202609-01',
      clienteNome: 'Mariana Silva',
      cpf: '123.456.789-00',
      email: 'mariana.silva@email.com',
      telefone: '(41) 98765-4321',
      pedidoId: 'ped-9821',
      assunto: 'Dúvida sobre transferência de titularidade de ingresso',
      categoria: 'duvida',
      status: 'aberto',
      prioridade: 'media',
      agenteResponsavel: 'Atendente SAC',
      slaLimiteEm: new Date(Date.now() + 43200000).toISOString(),
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      mensagens: [
        {
          id: 'msg-1',
          autorTipo: 'cliente',
          autorNome: 'Mariana Silva',
          conteudo: 'Olá, gostaria de saber como transfiro meu ingresso para outra pessoa.',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ],
    };

    if (pathParts.length > 2 && pathParts[2] !== 'mensagens') {
      return NextResponse.json(chamadoPadrao);
    }
    return NextResponse.json([chamadoPadrao]);
  }

  // 8. RELATÓRIOS
  if (fullPath.startsWith('relatorios/')) {
    return NextResponse.json({
      resumo: {
        status: 'Auditoria Concluída',
        gerado_em: new Date().toISOString(),
        escopo: 'Produtor & Evento Selecionado',
        registros_processados: 0,
      },
      registros: [],
    });
  }

  // 9. SUPORTE
  if (fullPath.startsWith('suporte/ocorrencias') || fullPath.startsWith('suporte-eventos/ocorrencias')) {
    return NextResponse.json([
      {
        id: 'sup-1',
        eventoId: 'evento-operacao',
        titulo: 'Alinhamento de antena no Portão 3',
        descricao: 'Operador de scanner reportou variação de sinal no ponto 3 da Pedreira.',
        tipo: 'catraca',
        status: 'resolvida',
        severidade: 'baixa',
        responsavel: 'Equipe de Campo',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
    ]);
  }

  // Mutação / escrita genérica
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return NextResponse.json({ ok: true, processado: true, id: `item-${Date.now()}` }, { status: 200 });
  }

  return NextResponse.json({ ok: true, data: [] });
}

async function proxy(req: NextRequest, params: Promise<{ path: string[] }>) {
  const { path } = await params;
  const base = backendBase();

  if (base && base.startsWith("http")) {
    const target = `${base}/${path.join("/")}${req.nextUrl.search}`;
    const headers = new Headers(req.headers);
    headers.delete("host");
    headers.delete("content-length");
    const tenantId = process.env.TENANT_ID || process.env.NEXT_PUBLIC_TENANT_ID || "";
    const produtorId = process.env.PRODUTOR_ID || process.env.NEXT_PUBLIC_PRODUTOR_ID || "";
    if (tenantId && !headers.has("x-tenant-id")) headers.set("x-tenant-id", tenantId);
    if (produtorId) {
      if (!headers.has("x-producer-id")) headers.set("x-producer-id", produtorId);
      if (!headers.has("x-produtor-id")) headers.set("x-produtor-id", produtorId);
    }
    const abortCtrl = new AbortController();
    const abortTimer = setTimeout(() => abortCtrl.abort(), 4000);
    try {
      const init: RequestInit = { method: req.method, headers, cache: "no-store", signal: abortCtrl.signal };
      if (!["GET", "HEAD"].includes(req.method)) init.body = await req.arrayBuffer();
      const upstream = await fetch(target, init);
      clearTimeout(abortTimer);
      if (upstream.status < 500) {
        const responseHeaders = new Headers(upstream.headers);
        responseHeaders.delete("content-encoding");
        responseHeaders.delete("content-length");
        return new NextResponse(upstream.body, { status: upstream.status, headers: responseHeaders });
      }
    } catch {
      clearTimeout(abortTimer);
    }
  }

  // Fallback autônomo e resiliente para ambiente sem backend dedicado (Edge / Vercel Preview)
  return handleAutonomousStore(req, path);
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) { return proxy(req, ctx.params); }
export async function POST(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) { return proxy(req, ctx.params); }
export async function PUT(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) { return proxy(req, ctx.params); }
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) { return proxy(req, ctx.params); }
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) { return proxy(req, ctx.params); }

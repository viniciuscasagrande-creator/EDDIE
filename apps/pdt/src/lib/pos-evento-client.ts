export type CanalComunicacao = 'WHATSAPP' | 'EMAIL' | 'SMS' | 'NOTIFICACAO';
export type FinalidadeComunicacao = 'PESQUISA_POS_EVENTO' | 'RELACIONAMENTO' | 'MARKETING' | 'ATUALIZACOES_EVENTO';
export type StatusCampanha = 'RASCUNHO' | 'AGUARDANDO_APROVACAO' | 'APROVADO' | 'EM_DISPARO' | 'CONCLUIDO' | 'CANCELADO';
export type StatusEnvio = 'PENDENTE' | 'ENVIADO' | 'ENTREGUE' | 'FALHA' | 'VISUALIZADO' | 'CLICADO';
export type TipoPergunta = 'RATING_1_5' | 'SIM_TALVEZ_NAO' | 'TEXTO_LIVRE' | 'NPS_0_10' | 'MULTIPLA_ESCOLHA';

export interface ResumoOperacionalPosEvento {
  eventoId: string;
  eventoNome: string;
  dataEvento: string;
  statusEvento: string;
  ingressosVendidos: number;
  ingressosEmitidos: number;
  acessosValidados: number;
  taxaPresencaPct: number;
  pessoasIdentificadas: number;
  contatosElegiveis: number;
  contatosNaoElegiveis: number;
}

export interface ParticipanteValidadoItem {
  id: string;
  ingressoId: string;
  numeroIngresso: string;
  perfilId?: string;
  nome: string;
  documento?: string;
  email?: string;
  telefone?: string;
  identificacaoIndividual: boolean;
  compradorOriginalNome?: string;
  compareceu: boolean;
  checkinAt?: string;
  checkinPortaria?: string;
  sessaoNome?: string;
  setorNome?: string;
  loteNome?: string;
  canalVenda: string;
  parceiroId?: string;
  parceiroNome?: string;
  elegivelComunicacao: boolean;
  motivoNaoElegivel?: string;
  consentimentoWhatsApp: boolean;
  consentimentoEmail: boolean;
  bloqueado: boolean;
}

export interface DetalheElegibilidadeLgpd {
  publicoValidadoTotal: number;
  identificadosTotal: number;
  elegiveisTotal: number;
  naoElegiveisTotal: number;
  motivosNaoElegibilidade: {
    motivo: string;
    quantidade: number;
    percentual: number;
  }[];
  canaisPermitidos: {
    canal: CanalComunicacao;
    elegiveis: number;
    bloqueados: number;
    semConsentimento: number;
  }[];
}

export interface FiltrosSegmentacaoDto {
  apenasCompareceram?: boolean;
  checkinInicio?: string;
  checkinFim?: string;
  sessaoNome?: string;
  setorNome?: string;
  loteNome?: string;
  canalVenda?: string;
  parceiroId?: string;
  minimoPresencasHistorico?: number;
  comprouMasNaoCompareceu?: boolean;
  apenasElegiveisLgpd?: boolean;
}

export interface ModeloPesquisaTemplate {
  codigo: string;
  nome: string;
  descricao: string;
  perguntas: {
    ordem: number;
    enunciado: string;
    tipo: TipoPergunta;
    categoria: string;
    obrigatoria: boolean;
    opcoes?: string[];
  }[];
}

export interface ItemTabelaPreco {
  canal: CanalComunicacao;
  custoUnitario: number;
  descricao: string;
  vigenciaInicio: string;
  vigenciaFim?: string;
  ativo: boolean;
}

export interface RelatorioCampanhaResultados {
  campanhaId: string;
  nome: string;
  canal: CanalComunicacao;
  status: StatusCampanha;
  publicoElegivel: number;
  selecionados: number;
  valorPorEnvio: number;
  custoEstimadoTotal: number;
  custoRealizadoTotal: number;
  metricasFunil: {
    enviados: number;
    entregues: number;
    falhas: number;
    visualizados: number;
    cliques: number;
    pesquisasIniciadas: number;
    pesquisasConcluidas: number;
  };
  taxas: {
    taxaEntregaPct: number;
    taxaVisualizacaoPct: number;
    taxaCliquesPct: number;
    taxaRespostaPct: number;
    custoPorResposta: number;
  };
  pesquisa?: {
    totalRespostas: number;
    satisfacaoGeralMedia: number;
    notasMedias: {
      organizacao: number;
      acesso: number;
      estrutura: number;
      alimentosBebidas: number;
    };
    voltariaDistribuicao: {
      sim: number;
      talvez: number;
      nao: number;
    };
    temasPositivos: string[];
    pontosAtencao: string[];
    comentariosRecentes: {
      data: string;
      comentario: string;
      classificacao: 'POSITIVO' | 'ATENCAO' | 'NEUTRO';
    }[];
  };
}

export interface NoHistoricoRelacionamento {
  eventoId: string;
  eventoNome: string;
  dataEvento: string;
  comprou: boolean;
  compareceu: boolean;
  recebeuCampanha: boolean;
  clicouCampanha: boolean;
  respondeuPesquisa: boolean;
  acoes: {
    tipo: string;
    descricao: string;
    data: string;
  }[];
}

export interface PerfilPublicoGrafo {
  perfilId: string;
  nome: string;
  documentoMascarado?: string;
  emailMascarado?: string;
  telefoneMascarado?: string;
  totalEventosComprados: number;
  totalEventosFrequentados: number;
  totalIngressos: number;
  ultimaPresenca?: string;
  taxaComparecimentoHistoricaPct: number;
  historicoEventos: NoHistoricoRelacionamento[];
}

export interface ComparecimentoParceiroItem {
  parceiroId: string;
  parceiroNome: string;
  tipoParceiro: string;
  ingressosVendidos: number;
  ingressosEmitidos: number;
  compareceram: number;
  naoCompareceram: number;
  taxaComparecimentoPct: number;
}

export interface RelatorioExecutivoPosEventoDossie {
  eventoId: string;
  eventoNome: string;
  dataEncerramento: string;
  resumoPresenca: {
    ingressosVendidos: number;
    ingressosEmitidos: number;
    comparecimento: number;
    naoComparecimento: number;
    taxaComparecimentoPct: number;
  };
  origemCanaisEParceiros: ComparecimentoParceiroItem[];
  pesquisaSatisfacao: {
    totalRespostas: number;
    satisfacaoGeral: number;
    nps: number;
    principaisDestaques: string[];
    pontosAtencao: string[];
  };
  campanhaComunicacao: {
    canalUtilizado: string;
    envios: number;
    entregas: number;
    respostas: number;
    custoTotal: number;
  };
  statusAuditoriaPosEvento: 'CONCLUIDO_COM_SUCESSO' | 'PENDENTE';
}


const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function fetchResumoOperacional(eventoId: string): Promise<ResumoOperacionalPosEvento> {
  try {
    const res = await fetch(`${API_BASE}/pos-evento/evento/${eventoId}/resumo`, {
      headers: { 'x-tenant-id': '00000000-0000-0000-0000-000000000001' },
      cache: 'no-store',
    });
    if (res.ok) return await res.json();
  } catch {
    // fallback
  }

  return {
    eventoId,
    eventoNome: 'Festival Exemplo 2026',
    dataEvento: '28 de setembro de 2026',
    statusEvento: 'ENCERRADO',
    ingressosVendidos: 12842,
    ingressosEmitidos: 11934,
    acessosValidados: 10716,
    taxaPresencaPct: 89.8,
    pessoasIdentificadas: 9847,
    contatosElegiveis: 8921,
    contatosNaoElegiveis: 926,
  };
}

export async function fetchPublicoValidado(
  eventoId: string,
  filtros?: FiltrosSegmentacaoDto,
): Promise<ParticipanteValidadoItem[]> {
  try {
    const query = new URLSearchParams();
    if (filtros?.sessaoNome) query.set('sessaoNome', filtros.sessaoNome);
    if (filtros?.setorNome) query.set('setorNome', filtros.setorNome);
    if (filtros?.loteNome) query.set('loteNome', filtros.loteNome);
    if (filtros?.parceiroId) query.set('parceiroId', filtros.parceiroId);
    if (filtros?.apenasElegiveisLgpd) query.set('apenasElegiveis', 'true');

    const res = await fetch(`${API_BASE}/pos-evento/evento/${eventoId}/publico-validado?${query.toString()}`, {
      headers: { 'x-tenant-id': '00000000-0000-0000-0000-000000000001' },
      cache: 'no-store',
    });
    if (res.ok) return await res.json();
  } catch {
    // fallback
  }

  return [
    {
      id: 'part-1',
      ingressoId: 'ing-101',
      numeroIngresso: 'DK-2026-000101',
      perfilId: 'perf-maria-silva',
      nome: 'Maria Silva',
      documento: '048.919.229-33',
      email: 'maria.silva@email.com',
      telefone: '+5541999999999',
      identificacaoIndividual: true,
      compradorOriginalNome: 'Maria Silva',
      compareceu: true,
      checkinAt: '2026-09-28T19:42:15Z',
      checkinPortaria: 'Portaria 1 - Catraca A',
      sessaoNome: 'Sessão Única - 28/09',
      setorNome: 'Área VIP Premium',
      loteNome: '1º Lote VIP',
      canalVenda: 'ONLINE_DIRETO',
      elegivelComunicacao: true,
      consentimentoWhatsApp: true,
      consentimentoEmail: true,
      bloqueado: false,
    },
    {
      id: 'part-2',
      ingressoId: 'ing-102',
      numeroIngresso: 'DK-2026-000102',
      perfilId: 'perf-joao-pedro',
      nome: 'João Pedro de Oliveira',
      documento: '582.114.908-11',
      email: 'joao.pedro@empresa.com.br',
      telefone: '+5541988887777',
      identificacaoIndividual: true,
      compradorOriginalNome: 'João Pedro de Oliveira',
      compareceu: true,
      checkinAt: '2026-09-28T18:15:30Z',
      checkinPortaria: 'Portaria 2 - Catraca B',
      sessaoNome: 'Sessão Única - 28/09',
      setorNome: 'Pista',
      loteNome: '2º Lote Pista',
      canalVenda: 'AGENCIA_PARCEIRA',
      parceiroId: 'parc-agencia-a',
      parceiroNome: 'Agência Turismo & Shows Curitiba',
      elegivelComunicacao: true,
      consentimentoWhatsApp: true,
      consentimentoEmail: true,
      bloqueado: false,
    },
    {
      id: 'part-3',
      ingressoId: 'ing-103',
      numeroIngresso: 'DK-2026-000103',
      perfilId: 'perf-ana-clara',
      nome: 'Ana Clara Albuquerque',
      documento: '912.834.712-44',
      email: 'ana.clara@gmail.com',
      telefone: '+5541977776666',
      identificacaoIndividual: true,
      compradorOriginalNome: 'João Pedro de Oliveira',
      compareceu: true,
      checkinAt: '2026-09-28T18:22:05Z',
      checkinPortaria: 'Portaria 2 - Catraca B',
      sessaoNome: 'Sessão Única - 28/09',
      setorNome: 'Pista',
      loteNome: '2º Lote Pista',
      canalVenda: 'AGENCIA_PARCEIRA',
      parceiroId: 'parc-agencia-a',
      parceiroNome: 'Agência Turismo & Shows Curitiba',
      elegivelComunicacao: true,
      consentimentoWhatsApp: true,
      consentimentoEmail: true,
      bloqueado: false,
    },
    {
      id: 'part-4',
      ingressoId: 'ing-104',
      numeroIngresso: 'DK-2026-000104',
      perfilId: 'perf-carlos-eduardo',
      nome: 'Carlos Eduardo Santos',
      documento: '312.445.671-88',
      email: 'carlos.santos@uol.com.br',
      telefone: '+5541991234567',
      identificacaoIndividual: true,
      compradorOriginalNome: 'Carlos Eduardo Santos',
      compareceu: true,
      checkinAt: '2026-09-28T20:05:44Z',
      checkinPortaria: 'Portaria 1 - Catraca C',
      sessaoNome: 'Sessão Única - 28/09',
      setorNome: 'Camarote Prime',
      loteNome: 'Lote Promocional',
      canalVenda: 'ONLINE_DIRETO',
      elegivelComunicacao: false,
      motivoNaoElegivel: 'Falta de consentimento prévio para este canal',
      consentimentoWhatsApp: false,
      consentimentoEmail: false,
      bloqueado: false,
    },
    {
      id: 'part-5',
      ingressoId: 'ing-105',
      numeroIngresso: 'DK-2026-000105',
      perfilId: 'perf-fernanda-lima',
      nome: 'Fernanda Lima Rocha',
      documento: '772.381.992-00',
      email: 'fernanda.rocha@yahoo.com',
      telefone: '+5541981112233',
      identificacaoIndividual: true,
      compradorOriginalNome: 'Fernanda Lima Rocha',
      compareceu: true,
      checkinAt: '2026-09-28T19:10:12Z',
      checkinPortaria: 'Portaria 3 - Acessibilidade',
      sessaoNome: 'Sessão Única - 28/09',
      setorNome: 'Área VIP Premium',
      loteNome: '1º Lote VIP',
      canalVenda: 'ONLINE_DIRETO',
      elegivelComunicacao: false,
      motivoNaoElegivel: 'Contato presente na Lista Central de Bloqueio (Opt-Out)',
      consentimentoWhatsApp: false,
      consentimentoEmail: false,
      bloqueado: true,
    },
    {
      id: 'part-6',
      ingressoId: 'ing-106',
      numeroIngresso: 'DK-2026-000106',
      nome: 'Portador Ingresso #106 (Não identificado)',
      identificacaoIndividual: false,
      compradorOriginalNome: 'Roberto Albuquerque',
      compareceu: true,
      checkinAt: '2026-09-28T18:55:00Z',
      checkinPortaria: 'Portaria 1 - Catraca D',
      sessaoNome: 'Sessão Única - 28/09',
      setorNome: 'Pista',
      loteNome: '1º Lote Pista',
      canalVenda: 'ONLINE_DIRETO',
      elegivelComunicacao: false,
      motivoNaoElegivel: 'Participante sem identificação de titular (não inventar identidade)',
      consentimentoWhatsApp: false,
      consentimentoEmail: false,
      bloqueado: false,
    },
  ];
}

export async function fetchElegibilidadeLgpd(eventoId: string): Promise<DetalheElegibilidadeLgpd> {
  try {
    const res = await fetch(`${API_BASE}/pos-evento/evento/${eventoId}/elegibilidade`, {
      headers: { 'x-tenant-id': '00000000-0000-0000-0000-000000000001' },
      cache: 'no-store',
    });
    if (res.ok) return await res.json();
  } catch {
    // fallback
  }

  return {
    publicoValidadoTotal: 10716,
    identificadosTotal: 9847,
    elegiveisTotal: 8921,
    naoElegiveisTotal: 926,
    motivosNaoElegibilidade: [
      { motivo: 'Falta de consentimento prévio para pesquisa/relacionamento', quantidade: 482, percentual: 52.1 },
      { motivo: 'Presente na Lista Central de Bloqueio (Opt-Out Solicitado)', quantidade: 218, percentual: 23.5 },
      { motivo: 'Participante não identificado individualmente (titular não preenchido)', quantidade: 139, percentual: 15.0 },
      { motivo: 'Telefone/E-mail com formato inválido ou inexistente', quantidade: 87, percentual: 9.4 },
    ],
    canaisPermitidos: [
      { canal: 'WHATSAPP', elegiveis: 8430, bloqueados: 184, semConsentimento: 420 },
      { canal: 'EMAIL', elegiveis: 8850, bloqueados: 92, semConsentimento: 210 },
      { canal: 'SMS', elegiveis: 7910, bloqueados: 230, semConsentimento: 640 },
      { canal: 'NOTIFICACAO', elegiveis: 6150, bloqueados: 50, semConsentimento: 800 },
    ],
  };
}

export async function fetchTabelaPrecos(): Promise<ItemTabelaPreco[]> {
  try {
    const res = await fetch(`${API_BASE}/pos-evento/precos-comunicacao`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch {
    // fallback
  }

  return [
    { canal: 'WHATSAPP', custoUnitario: 0.5, descricao: 'WhatsApp Business API Oficial (Meta)', vigenciaInicio: '2026-01-01T00:00:00Z', ativo: true },
    { canal: 'EMAIL', custoUnitario: 0.05, descricao: 'E-mail transacional e relacional com rastreio de clique', vigenciaInicio: '2026-01-01T00:00:00Z', ativo: true },
    { canal: 'SMS', custoUnitario: 0.15, descricao: 'SMS curto com short-link verificado', vigenciaInicio: '2026-01-01T00:00:00Z', ativo: true },
  ];
}

export async function fetchModelosPesquisa(): Promise<ModeloPesquisaTemplate[]> {
  try {
    const res = await fetch(`${API_BASE}/pos-evento/modelos-pesquisa`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch {
    // fallback
  }

  return [
    {
      codigo: 'SATISFACAO_GERAL',
      nome: 'Satisfação Geral',
      descricao: 'Avaliação completa de experiência, organização, acessibilidade e probabilidade de retorno.',
      perguntas: [
        { ordem: 1, enunciado: 'Como você avalia o evento no geral?', tipo: 'RATING_1_5', categoria: 'GERAL', obrigatoria: true },
        { ordem: 2, enunciado: 'Como você avalia a organização do evento?', tipo: 'RATING_1_5', categoria: 'ORGANIZACAO', obrigatoria: true },
        { ordem: 3, enunciado: 'Como você avalia o acesso e entrada no local?', tipo: 'RATING_1_5', categoria: 'ACESSO', obrigatoria: true },
        { ordem: 4, enunciado: 'Como você avalia a estrutura e limpeza dos banheiros?', tipo: 'RATING_1_5', categoria: 'BANHEIROS', obrigatoria: true },
        { ordem: 5, enunciado: 'Como você avalia alimentos e bebidas?', tipo: 'RATING_1_5', categoria: 'ALIMENTOS_BEBIDAS', obrigatoria: true },
        { ordem: 6, enunciado: 'Você voltaria a este evento em uma próxima edição?', tipo: 'SIM_TALVEZ_NAO', categoria: 'RETORNO', obrigatoria: true },
        { ordem: 7, enunciado: 'O que poderíamos melhorar? Deixe suas sugestões ou elogios:', tipo: 'TEXTO_LIVRE', categoria: 'SUGESTAO_LIVRE', obrigatoria: false },
      ],
    },
    {
      codigo: 'EXPERIENCIA_EVENTO',
      nome: 'Experiência do Evento',
      descricao: 'Foco no line-up, som, iluminação e atmosfera geral.',
      perguntas: [
        { ordem: 1, enunciado: 'Qual nota você dá para as apresentações artísticas?', tipo: 'RATING_1_5', categoria: 'GERAL', obrigatoria: true },
        { ordem: 2, enunciado: 'Qualidade do som e da acústica:', tipo: 'RATING_1_5', categoria: 'ESTRUTURA', obrigatoria: true },
        { ordem: 3, enunciado: 'Pontualidade da programação dos palcos:', tipo: 'RATING_1_5', categoria: 'ORGANIZACAO', obrigatoria: true },
        { ordem: 4, enunciado: 'Em uma escala de 0 a 10, recomendaria o evento para amigos?', tipo: 'NPS_0_10', categoria: 'GERAL', obrigatoria: true },
      ],
    },
    {
      codigo: 'ESTRUTURA_ORGANIZACAO',
      nome: 'Estrutura e Organização',
      descricao: 'Auditoria minuciosa de fluxo de público, filas, segurança e atendimento de campo.',
      perguntas: [
        { ordem: 1, enunciado: 'Fluidez na portaria e tempo de fila:', tipo: 'RATING_1_5', categoria: 'ACESSO', obrigatoria: true },
        { ordem: 2, enunciado: 'Sensação de segurança no evento:', tipo: 'RATING_1_5', categoria: 'ESTRUTURA', obrigatoria: true },
        { ordem: 3, enunciado: 'Sinalização e facilidade de localização dos setores:', tipo: 'RATING_1_5', categoria: 'ORGANIZACAO', obrigatoria: true },
        { ordem: 4, enunciado: 'Atendimento dos monitores e equipe:', tipo: 'RATING_1_5', categoria: 'ORGANIZACAO', obrigatoria: true },
      ],
    },
    {
      codigo: 'SHOW_FESTIVAL',
      nome: 'Show / Festival',
      descricao: 'Modelo desenhado para grandes festivais com múltiplos palcos e ativações.',
      perguntas: [
        { ordem: 1, enunciado: 'Avaliação geral do festival:', tipo: 'RATING_1_5', categoria: 'GERAL', obrigatoria: true },
        { ordem: 2, enunciado: 'Ativações de marcas e experiências interativas:', tipo: 'RATING_1_5', categoria: 'ESTRUTURA', obrigatoria: true },
        { ordem: 3, enunciado: 'Variedade e tempo de espera no bar/praça de alimentação:', tipo: 'RATING_1_5', categoria: 'ALIMENTOS_BEBIDAS', obrigatoria: true },
      ],
    },
    {
      codigo: 'PARQUE_ATRACAO',
      nome: 'Parque / Atração',
      descricao: 'Modelo focado em atrações com agendamento, filas e conservação temática.',
      perguntas: [
        { ordem: 1, enunciado: 'Avaliação geral da visita ao parque/atração:', tipo: 'RATING_1_5', categoria: 'GERAL', obrigatoria: true },
        { ordem: 2, enunciado: 'Conservação e manutenção dos brinquedos/atrações:', tipo: 'RATING_1_5', categoria: 'ESTRUTURA', obrigatoria: true },
        { ordem: 3, enunciado: 'Tempo de espera nas atrações principais:', tipo: 'RATING_1_5', categoria: 'ACESSO', obrigatoria: true },
      ],
    },
    {
      codigo: 'TURISMO_EXCURSAO',
      nome: 'Turismo / Excursão',
      descricao: 'Modelo voltado a receptivo, transporte e guias turísticos.',
      perguntas: [
        { ordem: 1, enunciado: 'Avaliação do transporte e pontualidade:', tipo: 'RATING_1_5', categoria: 'ACESSO', obrigatoria: true },
        { ordem: 2, enunciado: 'Desempenho e cordialidade do guia:', tipo: 'RATING_1_5', categoria: 'ORGANIZACAO', obrigatoria: true },
        { ordem: 3, enunciado: 'Roteiro e pontos visitados:', tipo: 'RATING_1_5', categoria: 'GERAL', obrigatoria: true },
      ],
    },
  ];
}

export async function fetchResultadosCampanha(campanhaId: string): Promise<RelatorioCampanhaResultados> {
  try {
    const res = await fetch(`${API_BASE}/pos-evento/campanhas/${campanhaId}/resultados`, {
      headers: { 'x-tenant-id': '00000000-0000-0000-0000-000000000001' },
      cache: 'no-store',
    });
    if (res.ok) return await res.json();
  } catch {
    // fallback
  }

  return {
    campanhaId,
    nome: 'Pesquisa Pós-Festival Exemplo 2026',
    canal: 'WHATSAPP',
    status: 'CONCLUIDO',
    publicoElegivel: 8921,
    selecionados: 8000,
    valorPorEnvio: 0.5,
    custoEstimadoTotal: 4000.0,
    custoRealizadoTotal: 4000.0,
    metricasFunil: {
      enviados: 8000,
      entregues: 7721,
      falhas: 279,
      visualizados: 6304,
      cliques: 3850,
      pesquisasIniciadas: 3126,
      pesquisasConcluidas: 2842,
    },
    taxas: {
      taxaEntregaPct: 96.5,
      taxaVisualizacaoPct: 81.6,
      taxaCliquesPct: 49.9,
      taxaRespostaPct: 35.5,
      custoPorResposta: 1.41,
    },
    pesquisa: {
      totalRespostas: 2842,
      satisfacaoGeralMedia: 4.6,
      notasMedias: {
        organizacao: 4.4,
        acesso: 3.8,
        estrutura: 4.2,
        alimentosBebidas: 4.1,
      },
      voltariaDistribuicao: {
        sim: 2510,
        talvez: 260,
        nao: 72,
      },
      temasPositivos: ['Atendimento cordial da equipe', 'Qualidade impecável do som', 'Line-up pontual'],
      pontosAtencao: ['Tempo excessivo de fila no acesso às 20h', 'Falta de sinalização no estacionamento B', 'Banheiros químicos do setor pista'],
      comentariosRecentes: [
        { data: '28/09/2026 23:45', comentario: 'O som estava maravilhoso e a equipe da portaria super rápida!', classificacao: 'POSITIVO' },
        { data: '28/09/2026 23:52', comentario: 'Demorou mais de 25 minutos na fila de chopp do setor pista.', classificacao: 'ATENCAO' },
        { data: '29/09/2026 00:10', comentario: 'Festival impecável, com certeza estarei presente ano que vem!', classificacao: 'POSITIVO' },
      ],
    },
  };
}

export async function fetchHistoricoPublico(
  perfilId: string,
  produtorId?: string,
): Promise<PerfilPublicoGrafo> {
  try {
    const url = produtorId
      ? `${API_BASE}/pos-evento/publico/${perfilId}/historico?produtorId=${produtorId}`
      : `${API_BASE}/pos-evento/publico/${perfilId}/historico`;

    const res = await fetch(url, {
      headers: { 'x-tenant-id': '00000000-0000-0000-0000-000000000001' },
      cache: 'no-store',
    });
    if (res.ok) return await res.json();
  } catch {
    // fallback
  }

  return {
    perfilId,
    nome: 'Maria Silva',
    documentoMascarado: '***.458.919-**',
    emailMascarado: 'm***a.s***a@email.com',
    telefoneMascarado: '+55 (41) 9****-9999',
    totalEventosComprados: 8,
    totalEventosFrequentados: 6,
    totalIngressos: 11,
    ultimaPresenca: '28/09/2026',
    taxaComparecimentoHistoricaPct: 75.0,
    historicoEventos: [
      {
        eventoId: 'ev-festival-a',
        eventoNome: 'Festival de Primavera 2024',
        dataEvento: '14/10/2024',
        comprou: true,
        compareceu: true,
        recebeuCampanha: true,
        clicouCampanha: true,
        respondeuPesquisa: true,
        acoes: [
          { tipo: 'COMPRA', descricao: 'Comprou 2 ingressos Setor VIP', data: '10/08/2024' },
          { tipo: 'PRESENCA', descricao: 'Portaria Principal - Catraca 04', data: '14/10/2024 18:32' },
          { tipo: 'PESQUISA', descricao: 'Avaliou o evento com nota 5/5', data: '15/10/2024' },
        ],
      },
      {
        eventoId: 'ev-show-b',
        eventoNome: 'Turnê Acústico MPB',
        dataEvento: '05/03/2025',
        comprou: true,
        compareceu: false,
        recebeuCampanha: false,
        clicouCampanha: false,
        respondeuPesquisa: false,
        acoes: [
          { tipo: 'COMPRA', descricao: 'Comprou 1 ingresso Plateia Central', data: '12/01/2025' },
          { tipo: 'AUSENCIA', descricao: 'Ingresso não utilizado na portaria', data: '05/03/2025' },
        ],
      },
      {
        eventoId: 'ev-festival-c',
        eventoNome: 'Sunset Festival 2025',
        dataEvento: '18/11/2025',
        comprou: true,
        compareceu: true,
        recebeuCampanha: true,
        clicouCampanha: true,
        respondeuPesquisa: true,
        acoes: [
          { tipo: 'CAMPANHA', descricao: 'Recebeu WhatsApp de pré-venda exclusiva', data: '01/09/2025' },
          { tipo: 'CLIQUE', descricao: 'Acessou link do lote promocional', data: '01/09/2025' },
          { tipo: 'COMPRA', descricao: 'Comprou 1 ingresso Pista Premium', data: '01/09/2025' },
          { tipo: 'PRESENCA', descricao: 'Portaria Lateral - Catraca 02', data: '18/11/2025 17:15' },
        ],
      },
      {
        eventoId: 'ev-festival-exemplo-2026',
        eventoNome: 'Festival Exemplo 2026',
        dataEvento: '28/09/2026',
        comprou: true,
        compareceu: true,
        recebeuCampanha: true,
        clicouCampanha: true,
        respondeuPesquisa: true,
        acoes: [
          { tipo: 'COMPRA', descricao: 'Comprou 2 ingressos Setor VIP', data: '15/07/2026' },
          { tipo: 'PRESENCA', descricao: 'Check-in validado na Portaria 1', data: '28/09/2026 19:42' },
          { tipo: 'PESQUISA', descricao: 'Respondeu pesquisa com nota 4.8/5', data: '29/09/2026 09:12' },
        ],
      },
    ],
  };
}

export async function fetchParceirosComparecimento(eventoId: string): Promise<ComparecimentoParceiroItem[]> {
  try {
    const res = await fetch(`${API_BASE}/pos-evento/evento/${eventoId}/parceiros-comparecimento`, {
      headers: { 'x-tenant-id': '00000000-0000-0000-0000-000000000001' },
      cache: 'no-store',
    });
    if (res.ok) return await res.json();
  } catch {
    // fallback
  }

  return [
    {
      parceiroId: 'parc-agencia-a',
      parceiroNome: 'Agência Turismo & Shows Curitiba',
      tipoParceiro: 'AGENCIA_VIAGENS',
      ingressosVendidos: 800,
      ingressosEmitidos: 792,
      compareceram: 701,
      naoCompareceram: 91,
      taxaComparecimentoPct: 88.5,
    },
    {
      parceiroId: 'parc-excursao-sul',
      parceiroNome: 'Excursões Sul Festas',
      tipoParceiro: 'OPERADOR_EXCURSAO',
      ingressosVendidos: 450,
      ingressosEmitidos: 450,
      compareceram: 412,
      naoCompareceram: 38,
      taxaComparecimentoPct: 91.6,
    },
    {
      parceiroId: 'parc-hotel-plaza',
      parceiroNome: 'Rede Hoteleira Gran Plaza',
      tipoParceiro: 'CONCIERGE_HOTEL',
      ingressosVendidos: 220,
      ingressosEmitidos: 215,
      compareceram: 189,
      naoCompareceram: 26,
      taxaComparecimentoPct: 87.9,
    },
    {
      parceiroId: 'parc-clube-beneficios',
      parceiroNome: 'Clube de Benefícios Prime',
      tipoParceiro: 'PROGRAMA_FIDELIDADE',
      ingressosVendidos: 610,
      ingressosEmitidos: 600,
      compareceram: 498,
      naoCompareceram: 102,
      taxaComparecimentoPct: 83.0,
    },
  ];
}

export async function fetchRelatorioExecutivoDossie(eventoId: string): Promise<RelatorioExecutivoPosEventoDossie> {
  try {
    const res = await fetch(`${API_BASE}/pos-evento/evento/${eventoId}/dossie`, {
      headers: { 'x-tenant-id': '00000000-0000-0000-0000-000000000001' },
      cache: 'no-store',
    });
    if (res.ok) return await res.json();
  } catch {
    // fallback
  }

  return {
    eventoId,
    eventoNome: 'Festival Exemplo 2026',
    dataEncerramento: '28 de setembro de 2026',
    resumoPresenca: {
      ingressosVendidos: 12842,
      ingressosEmitidos: 11934,
      comparecimento: 10716,
      naoComparecimento: 1218,
      taxaComparecimentoPct: 89.8,
    },
    origemCanaisEParceiros: await fetchParceirosComparecimento(eventoId),
    pesquisaSatisfacao: {
      totalRespostas: 2842,
      satisfacaoGeral: 4.6,
      nps: 78.4,
      principaisDestaques: [
        'Agilidade na leitura e validação dos ingressos na portaria (tempo médio < 3s)',
        'Excelente acústica e pontualidade no palco principal',
        'Alto índice de aprovação da limpeza dos sanitários',
      ],
      pontosAtencao: [
        'Gargalo temporário no fluxo de veículos no Estacionamento B entre 19h30 e 20h30',
        'Pico de demanda na praça de alimentação entre o segundo e o terceiro show',
      ],
    },
    campanhaComunicacao: {
      canalUtilizado: 'WHATSAPP_OFICIAL',
      envios: 8000,
      entregas: 7721,
      respostas: 2842,
      custoTotal: 4000.0,
    },
    statusAuditoriaPosEvento: 'CONCLUIDO_COM_SUCESSO',
  };
}

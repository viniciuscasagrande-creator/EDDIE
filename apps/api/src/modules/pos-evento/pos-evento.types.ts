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

export interface CriarSegmentoDto {
  nome: string;
  descricao?: string;
  filtros: FiltrosSegmentacaoDto;
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

export interface CriarPesquisaDto {
  titulo: string;
  descricao?: string;
  modeloOrigem?: string;
  perguntas?: {
    ordem: number;
    enunciado: string;
    tipo: TipoPergunta;
    categoria: string;
    obrigatoria: boolean;
    opcoes?: string[];
  }[];
}

export interface SubmeterRespostaPesquisaDto {
  perfilId?: string;
  ingressoId?: string;
  notaSatisfacaoGeral?: number;
  notaOrganizacao?: number;
  notaAcesso?: number;
  notaEstrutura?: number;
  notaAlimentos?: number;
  voltaria?: 'SIM' | 'TALVEZ' | 'NAO';
  comentarioAberto?: string;
  respostasPerguntas?: Record<string, string | number>;
}

export interface SimularCampanhaDto {
  canal: CanalComunicacao;
  segmentoId?: string;
  filtros?: FiltrosSegmentacaoDto;
  quantidadeDestinatarios?: number;
}

export interface CriarCampanhaDto {
  nome: string;
  canal: CanalComunicacao;
  pesquisaId?: string;
  segmentoId?: string;
  mensagemTemplate: string;
  filtros?: FiltrosSegmentacaoDto;
  limiteDisparo?: number;
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
